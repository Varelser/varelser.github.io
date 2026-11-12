#!/usr/bin/env python3
"""Nurse News fixed candidate fetcher (stdlib only, no API keys).

Fetches candidates from the 11 configured sources, applies each
source's editorial filters (date window, keyword gates, minimum
abstract length, page-body requirement for FDA / NHS England), dedupes
against the existing stock in nurse-news-data.json (URL, normalized
title, DOI) and within the candidate set, and writes a JSON list of
{sourceName, originalTitle, url, publishedAt, abstract, doi?} to --out.

Modes:
  recent   (default) past-45-days window for all 11 sources.
  backfill past-7-years window, scholarly sources only (PubMed,
           Europe PMC, BMC Nursing via Crossref), larger result sets.

A failing source never aborts the run; it is reported in the summary.
Usage:
  python3 scripts/nurse_fetch.py --data nurse-news-data.json \
      --out candidates.json [--mode recent|backfill]
Prints a JSON summary {total, per_source, failed} to stdout.
"""
import argparse
import gzip
import json
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime

UA = {"User-Agent": "Mozilla/5.0 (compatible; NurseNewsFetcher/1.0)"}
TIMEOUT = 30
NOW = datetime.now(timezone.utc)


def http_get(url, accept=None):
    req = urllib.request.Request(url, headers=dict(UA, **({"Accept": accept} if accept else {})))
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        raw = r.read()
        if r.headers.get("Content-Encoding") == "gzip" or raw[:2] == b"\x1f\x8b":
            raw = gzip.decompress(raw)
        return raw.decode("utf-8", "replace")


def strip_tags(s):
    s = re.sub(r"<[^>]+>", " ", s or "")
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def norm_title(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def doi_of(text):
    m = re.search(r"10\.\d{4,9}/[^\s\"&<>]+", text or "")
    return m.group(0).rstrip(").,").lower() if m else None


def iso_z(dt):
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def within(dt, days):
    return dt <= NOW + timedelta(days=2) and dt >= NOW - timedelta(days=days)


def cand(source, title, url, dt, abstract, doi=None):
    c = {
        "sourceName": source,
        "originalTitle": strip_tags(title),
        "url": url,
        "publishedAt": iso_z(dt),
        "abstract": strip_tags(abstract),
    }
    if doi:
        c["doi"] = doi.lower()
    return c


# ---------------- RSS sources ----------------

def fetch_rss(url):
    root = ET.fromstring(http_get(url))
    items = []
    for item in root.iter("item"):
        def txt(tag):
            el = item.find(tag)
            return el.text if el is not None and el.text else ""
        date_s = txt("pubDate") or txt("pubdate") or txt("{http://purl.org/dc/elements/1.1/}date")
        try:
            try:
                dt = parsedate_to_datetime(date_s)
            except Exception:
                dt = datetime.fromisoformat(date_s.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
        except Exception:
            continue
        items.append({"title": txt("title"), "link": txt("link"),
                      "desc": txt("description"), "dt": dt})
    return items


OFFTOPIC_PATTERNS = (
    "in mice", "in rats", "fruit flies", "fruit fly", "zebrafish",
    "drosophila", "c. elegans", "caenorhabditis", "fossil", "dinosaur",
    "exoplanet", "asteroid", "quantum comput", "photosynthesis in",
    "yeast cells", "in worms",
)
HUMAN_CONTEXT = ("patient", "human", "clinical", "people", "adults",
                 "children", "women", "men ", "trial", "hospital", "care")


def src_sciencedaily(days):
    out = []
    for i in fetch_rss("https://www.sciencedaily.com/rss/health_medicine.xml")[:60]:
        text = (i["title"] + " " + i["desc"]).lower()
        # Drop clearly non-clinical items (animal-only / evolution /
        # non-medical science) unless they carry a human clinical context.
        if any(p in text for p in OFFTOPIC_PATTERNS) \
                and not any(h in text for h in HUMAN_CONTEXT):
            continue
        out.append(cand("ScienceDaily Health", i["title"], i["link"], i["dt"], i["desc"]))
    return out


def src_who(days):
    return [cand("WHO", i["title"], i["link"], i["dt"], i["desc"])
            for i in fetch_rss("https://www.who.int/rss-feeds/news-english.xml")
            if within(i["dt"], days)]


CDC_KEYS = ("nurs", "hospital", "infection", "vaccin", "long-term care",
            "patient safety", "sepsis", "antimicrobial")


def src_cdc(days):
    out = []
    for i in fetch_rss("https://tools.cdc.gov/api/v2/resources/media/132608.rss"):
        t = i["title"].lower()
        if within(i["dt"], days) and any(k in t for k in CDC_KEYS):
            out.append(cand("CDC", i["title"], i["link"], i["dt"], i["desc"]))
    return out


def fetch_body_text(url):
    """Fetch an article page and return its plain text, or '' on failure."""
    try:
        html_text = http_get(url)
    except Exception:
        return ""
    html_text = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", html_text)
    return strip_tags(html_text)


FDA_KEYS = ("drug", "medicine", "vaccin", "device", "safety", "approv")


def src_fda(days):
    out = []
    for i in fetch_rss("https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-releases/rss.xml")[:20]:
        if not within(i["dt"], days):
            continue
        if not any(k in i["title"].lower() for k in FDA_KEYS):
            continue
        body = fetch_body_text(i["link"])
        if len(body) < 600:
            continue  # rule: adopt only when the page body can be fetched
        out.append(cand("FDA", i["title"], i["link"], i["dt"], body[:4000]))
    return out


NHS_KEYS = ("nurs", "care", "patient", "hospital", "workforce", "treatment", "service")


def src_nhs(days):
    out = []
    for i in fetch_rss("https://www.england.nhs.uk/feed/")[:10]:
        if not within(i["dt"], days):
            continue
        if not any(k in i["title"].lower() for k in NHS_KEYS):
            continue
        body = fetch_body_text(i["link"])
        if len(body) < 600:
            continue
        out.append(cand("NHS England", i["title"], i["link"], i["dt"], body[:4000]))
    return out


FRONTIERS_KEYS = ("nurs", "public health", "elderly", "older", "community",
                  "caregiv", "dementia", "patient")


def src_frontiers(days):
    out = []
    for i in fetch_rss("https://www.frontiersin.org/journals/public-health/rss")[:20]:
        if within(i["dt"], days) and len(strip_tags(i["desc"])) >= 400 \
                and any(k in (i["title"] + " " + i["desc"]).lower() for k in FRONTIERS_KEYS):
            out.append(cand("Frontiers in Public Health", i["title"], i["link"],
                            i["dt"], i["desc"], doi_of(i["link"])))
    return out


# ---------------- Atom sources ----------------

ATOM = {"a": "http://www.w3.org/2005/Atom", "dc": "http://purl.org/dc/elements/1.1/"}


def fetch_atom(url):
    root = ET.fromstring(http_get(url))
    entries = []
    for e in root.findall("a:entry", ATOM):
        def txt(path):
            el = e.find(path, ATOM)
            return el.text if el is not None and el.text else ""
        link = ""
        for lnk in e.findall("a:link", ATOM):
            if lnk.get("rel") in (None, "alternate"):
                link = lnk.get("href", "")
                break
        if not link:
            lnk = e.find("a:link", ATOM)
            link = lnk.get("href", "") if lnk is not None else ""
        date_s = txt("a:published") or txt("a:updated")
        try:
            dt = datetime.fromisoformat(date_s.replace("Z", "+00:00"))
        except Exception:
            continue
        entries.append({"title": txt("a:title"), "link": link, "dt": dt,
                        "summary": txt("a:summary"), "content": txt("a:content"),
                        "id": txt("a:id")})
    return entries


def src_jmir(days):
    out = []
    for e in fetch_atom("https://nursing.jmir.org/feed/atom"):
        if within(e["dt"], days) and len(e["summary"]) >= 400:
            out.append(cand("JMIR Nursing", e["title"], e["link"], e["dt"],
                            e["summary"], doi_of(e["id"]) or doi_of(e["link"])))
    return out


PLOS_KEYS = ("nurs", "public health", "patient safety", "elderly", "older",
             "caregiv", "dementia", "infection", "hospital")


def src_plos(days):
    out = []
    for e in fetch_atom("https://journals.plos.org/plosmedicine/feed/atom"):
        abstract = e["summary"] or e["content"]
        if len(abstract) >= 400 and within(e["dt"], days) \
                and any(k in (e["title"] + " " + abstract).lower() for k in PLOS_KEYS):
            out.append(cand("PLOS Medicine", e["title"], e["link"], e["dt"],
                            abstract, doi_of(e["id"])))
    return out


# ---------------- Scholarly APIs ----------------

PUBMED_TERM = ('("nursing care" OR "nurse-led" OR "patient safety" OR '
               '"infection prevention" OR "pressure injury" OR "delirium" OR '
               '"falls prevention" OR "palliative care" OR nursing OR nurse)')


def src_pubmed(days, backfill=False):
    base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
    mindate = (NOW - timedelta(days=days)).strftime("%Y/%m/%d")
    maxdate = NOW.strftime("%Y/%m/%d")
    q = urllib.parse.urlencode({
        "db": "pubmed", "term": PUBMED_TERM, "retmode": "json",
        "retmax": 100 if backfill else 40, "sort": "pub_date",
        "datetype": "pdat", "mindate": mindate, "maxdate": maxdate})
    ids = json.loads(http_get(base + "esearch.fcgi?" + q))["esearchresult"]["idlist"]
    if not ids:
        return []
    q2 = urllib.parse.urlencode({"db": "pubmed", "id": ",".join(ids), "retmode": "xml"})
    root = ET.fromstring(http_get(base + "efetch.fcgi?" + q2))
    out = []
    for art in root.iter("PubmedArticle"):
        title_el = art.find(".//ArticleTitle")
        title = "".join(title_el.itertext()) if title_el is not None else ""
        abstract = " ".join("".join(x.itertext()) for x in art.findall(".//AbstractText"))
        if len(abstract) < 400:
            continue
        pmid_el = art.find(".//PMID")
        pmid = pmid_el.text if pmid_el is not None else ""
        date_el = art.find(".//ArticleDate")
        if date_el is not None:
            dt = datetime(int(date_el.findtext("Year")), int(date_el.findtext("Month")),
                          int(date_el.findtext("Day")), tzinfo=timezone.utc)
        else:
            pd = art.find(".//PubDate")
            year = int(pd.findtext("Year"))
            mon = pd.findtext("Month") or "Jan"
            month = datetime.strptime(mon[:3], "%b").month
            dt = datetime(year, month, int(pd.findtext("Day") or 1), tzinfo=timezone.utc)
        if not within(dt, days):
            continue
        doi = None
        for idel in art.findall(".//ArticleId"):
            if idel.get("IdType") == "doi":
                doi = idel.text
        out.append(cand("PubMed Nursing", title,
                        f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/", dt, abstract, doi))
    return out


def src_europepmc(days, backfill=False):
    start = (NOW - timedelta(days=days)).strftime("%Y-%m-%d")
    end = NOW.strftime("%Y-%m-%d")
    query = (f'(nursing OR nurse OR "wound care" OR "dementia care") '
             f'AND FIRST_PDATE:[{start} TO {end}]')
    out = []
    cursor = "*"
    pages = 3 if backfill else 1
    for _ in range(pages):
        q = urllib.parse.urlencode({
            "query": query, "format": "json", "resultType": "core",
            "pageSize": 50, "cursorMark": cursor, "sort": "FIRST_PDATE_D"})
        data = json.loads(http_get("https://www.ebi.ac.uk/europepmc/webservices/rest/search?" + q))
        for r in data.get("resultList", {}).get("result", []):
            abstract = r.get("abstractText", "")
            if len(abstract) < 400:
                continue
            dt = datetime.strptime(r["firstPublicationDate"], "%Y-%m-%d").replace(tzinfo=timezone.utc)
            if not within(dt, days):
                continue
            if r.get("pmid"):
                url = f"https://europepmc.org/article/MED/{r['pmid']}"
            elif r.get("doi"):
                url = f"https://doi.org/{r['doi']}"
            else:
                continue
            out.append(cand("Europe PMC", r.get("title", ""), url, dt, abstract, r.get("doi")))
        cursor = data.get("nextCursorMark")
        if not cursor or len(data.get("resultList", {}).get("result", [])) < 50:
            break
    return out


def src_bmc(days, backfill=False):
    start = (NOW - timedelta(days=days)).strftime("%Y-%m-%d")
    end = NOW.strftime("%Y-%m-%d")
    q = urllib.parse.urlencode({
        "sort": "published", "order": "desc",
        "rows": 60 if backfill else 20,
        "filter": f"from-pub-date:{start},until-pub-date:{end}"})
    data = json.loads(http_get(
        "https://api.crossref.org/journals/1472-6955/works?" + q,
        accept="application/json"))
    out = []
    for item in data.get("message", {}).get("items", []):
        abstract = strip_tags(item.get("abstract", ""))
        if len(abstract) < 400:
            continue
        parts = item.get("published", {}).get("date-parts", [[None]])[0]
        if not parts or not parts[0]:
            continue
        dt = datetime(parts[0], parts[1] if len(parts) > 1 else 1,
                      parts[2] if len(parts) > 2 else 1, tzinfo=timezone.utc)
        if not within(dt, days):
            continue
        title = (item.get("title") or [""])[0]
        out.append(cand("BMC Nursing", title, item.get("URL", ""), dt,
                        abstract, item.get("DOI")))
    return out


RECENT_SOURCES = [
    ("ScienceDaily Health", src_sciencedaily), ("WHO", src_who), ("CDC", src_cdc),
    ("PubMed Nursing", src_pubmed), ("Europe PMC", src_europepmc),
    ("JMIR Nursing", src_jmir), ("FDA", src_fda), ("NHS England", src_nhs),
    ("Frontiers in Public Health", src_frontiers), ("PLOS Medicine", src_plos),
    ("BMC Nursing", src_bmc),
]
BACKFILL_SOURCES = [
    ("PubMed Nursing", src_pubmed), ("Europe PMC", src_europepmc),
    ("BMC Nursing", src_bmc),
]


def main(argv=None):
    ap = argparse.ArgumentParser(description="Nurse News candidate fetcher")
    ap.add_argument("--data", required=True, help="path to nurse-news-data.json")
    ap.add_argument("--out", required=True)
    ap.add_argument("--mode", choices=["recent", "backfill"], default="recent")
    args = ap.parse_args(argv)

    with open(args.data, encoding="utf-8") as f:
        stock = json.load(f)["articles"]
    seen_urls = {a["url"] for a in stock}
    seen_titles = {norm_title(a.get("originalTitle")) for a in stock}
    seen_dois = {doi_of(a["url"]) for a in stock} - {None}
    for a in stock:
        d = doi_of(a.get("originalTitle", ""))
        if d:
            seen_dois.add(d)

    days = 45 if args.mode == "recent" else 365 * 7
    sources = RECENT_SOURCES if args.mode == "recent" else BACKFILL_SOURCES
    per_source = {}
    failed = []
    candidates = []
    for name, fn in sources:
        try:
            got = fn(days, backfill=True) if args.mode == "backfill" and fn in (
                src_pubmed, src_europepmc, src_bmc) else fn(days)
        except Exception as e:  # one source failing must not abort the run
            failed.append({"source": name, "error": str(e)[:200]})
            per_source[name] = 0
            continue
        kept = []
        for c in got:
            if c["url"] in seen_urls or norm_title(c["originalTitle"]) in seen_titles:
                continue
            d = c.get("doi") or doi_of(c["url"])
            if d and d in seen_dois:
                continue
            seen_urls.add(c["url"])
            seen_titles.add(norm_title(c["originalTitle"]))
            if d:
                seen_dois.add(d)
            kept.append(c)
        per_source[name] = len(kept)
        candidates.extend(kept)

    candidates.sort(key=lambda c: c["publishedAt"], reverse=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(candidates, f, ensure_ascii=False, indent=1)
    print(json.dumps({"total": len(candidates), "per_source": per_source,
                      "failed": failed}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
