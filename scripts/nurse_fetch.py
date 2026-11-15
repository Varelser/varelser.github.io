#!/usr/bin/env python3
"""Nurse News fixed candidate fetcher (stdlib only, no API keys).

Fetches candidates from the 36 configured sources, applies each
source's editorial filters (date window, keyword gates, minimum
abstract length, page-body requirement for FDA / NHS England), dedupes
against the existing stock in nurse-news-data.json (URL, normalized
title, DOI) and within the candidate set, and writes a JSON list of
{sourceName, originalTitle, url, publishedAt, abstract, doi?} to --out.
medRxiv candidates are labelled "medRxiv Preprint" (not peer reviewed).

Modes:
  recent   (default) past-45-days window for all 36 sources.
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
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime

UA = {"User-Agent": "Mozilla/5.0 (compatible; NurseNewsFetcher/1.0)"}
TIMEOUT = 30
NOW = datetime.now(timezone.utc)


RETRY_CODES = (401, 403, 429, 500, 502, 503, 504)


def http_get(url, accept=None):
    # Transient blocks (FDA's intermittent 401, Europe PMC / publisher
    # 5xx) get up to 3 attempts with a short backoff before giving up.
    last = None
    for attempt in range(3):
        req = urllib.request.Request(
            url, headers=dict(UA, **({"Accept": accept} if accept else {})))
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                raw = r.read()
                if r.headers.get("Content-Encoding") == "gzip" or raw[:2] == b"\x1f\x8b":
                    raw = gzip.decompress(raw)
                return raw.decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            last = e
            if e.code not in RETRY_CODES:
                raise
        except Exception as e:  # URLError, timeouts, resets
            last = e
        if attempt < 2:
            time.sleep(3 * (attempt + 1))
    raise last


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
        # NOTE: no "sort" parameter — sort=FIRST_PDATE_D makes the
        # Europe PMC API return HTTP 503 (verified 2026-11-15). The
        # 45-day FIRST_PDATE window keeps results recent, and main()
        # sorts all candidates by publishedAt at the end anyway.
        q = urllib.parse.urlencode({
            "query": query, "format": "json", "resultType": "core",
            "pageSize": 50, "cursorMark": cursor})
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


# ---------------- Additional journal sources (added 2026-11-15) ----------------

CARE_KEYS = ("nurs", "patient", "care", "hospital", "clinic", "older",
             "elderly", "dementia", "infection", "vaccin", "maternal",
             "pregnan", "mental", "palliativ", "primary care",
             "health service", "workforce", "safety", "fall", "delirium",
             "chronic", "community", "long-term", "rehabil", "medication",
             "sepsis", "antimicrobial", "guideline", "screening", "diabetes",
             "cardiovascular", "stroke", "cancer", "respiratory", "kidney",
             "dialysis", "wound", "pain", "nutrition", "obesity", "child",
             "infant", "adolescen", "women", "midwif", "emergency",
             "triage", "telemedicine", "digital health", "hiv", "depress",
             "anxiety", "psych", "surgery", "intensive", "icu")


def src_crossref_journal(issn, name, days, keys=CARE_KEYS, rows=20):
    """Any Crossref-indexed journal with deposited abstracts (BMC family
    and other Springer Nature open-access titles), by ISSN."""
    start = (NOW - timedelta(days=days)).strftime("%Y-%m-%d")
    end = NOW.strftime("%Y-%m-%d")
    q = urllib.parse.urlencode({
        "sort": "published", "order": "desc", "rows": rows,
        "filter": f"from-pub-date:{start},until-pub-date:{end}"})
    data = json.loads(http_get(
        f"https://api.crossref.org/journals/{issn}/works?" + q,
        accept="application/json"))
    out = []
    for item in data.get("message", {}).get("items", []):
        abstract = strip_tags(item.get("abstract", ""))
        if len(abstract) < 400:
            continue
        title = (item.get("title") or [""])[0]
        if keys and not any(k in (title + " " + abstract).lower() for k in keys):
            continue
        parts = item.get("published", {}).get("date-parts", [[None]])[0]
        if not parts or not parts[0]:
            continue
        dt = datetime(parts[0], parts[1] if len(parts) > 1 else 1,
                      parts[2] if len(parts) > 2 else 1, tzinfo=timezone.utc)
        if not within(dt, days):
            continue
        out.append(cand(name, title, item.get("URL", ""), dt,
                        abstract, item.get("DOI")))
    return out


CROSSREF_JOURNALS = [
    ("BMC Public Health", "1471-2458"),
    ("BMC Geriatrics", "1471-2318"),
    ("BMC Health Services Research", "1472-6963"),
    ("BMC Medicine", "1741-7015"),
    ("BMC Infectious Diseases", "1471-2334"),
    ("BMC Palliative Care", "1472-684X"),
    ("BMC Pregnancy and Childbirth", "1471-2393"),
    ("BMC Psychiatry", "1471-244X"),
    ("BMC Primary Care", "2731-4553"),
    ("BMC Emergency Medicine", "1471-227X"),
    ("BMC Women's Health", "1472-6874"),
    ("BMC Pediatrics", "1471-2431"),
    ("Human Resources for Health", "1478-4491"),
    ("International Journal for Equity in Health", "1475-9276"),
    ("Implementation Science", "1748-5908"),
]


def _crossref_source(issn, name):
    def run(days):
        return src_crossref_journal(issn, name, days)
    return run


PLOS_ONE_KEYS = PLOS_KEYS + (
    "maternal", "mental health", "diabetes", "hypertension", "screening",
    "hiv", "tuberculosis", "malaria", "nutrition", "obesity", "smoking",
    "alcohol", "antimicrobial", "sepsis", "stroke", "heart", "kidney",
    "pregnan", "child", "infant", "adolescen", "vaccine", "covid",
    "influenza", "emergency", "surgery", "rehabilitation", "telemedicine",
    "digital", "climate", "air pollution", "cancer", "depress", "anxiety")


def src_plos_feed(url, name, days, keys):
    out = []
    for e in fetch_atom(url):
        if e["title"].lower().startswith(("correction:", "retraction:")):
            continue
        abstract = e["summary"] or e["content"]
        if len(abstract) >= 400 and within(e["dt"], days) \
                and any(k in (e["title"] + " " + abstract).lower() for k in keys):
            out.append(cand(name, e["title"], e["link"], e["dt"],
                            abstract, doi_of(e["id"])))
    return out


def src_plos_one(days):
    return src_plos_feed("https://journals.plos.org/plosone/feed/atom",
                         "PLOS ONE", days, PLOS_ONE_KEYS)


def src_plos_gph(days):
    return src_plos_feed("https://journals.plos.org/globalpublichealth/feed/atom",
                         "PLOS Global Public Health", days, PLOS_ONE_KEYS)


JMIR_KEYS = ("nurs", "patient", "clinical", "care", "hospital", "older",
             "elderly", "caregiv", "mental", "depress", "anxiety", "psych")


def src_jmir_feed(url, name, days, keys=None):
    out = []
    for e in fetch_atom(url):
        if within(e["dt"], days) and len(e["summary"]) >= 400:
            if keys and not any(k in (e["title"] + " " + e["summary"]).lower()
                                for k in keys):
                continue
            out.append(cand(name, e["title"], e["link"], e["dt"],
                            e["summary"], doi_of(e["id"]) or doi_of(e["link"])))
    return out


def src_jmir_aging(days):
    return src_jmir_feed("https://aging.jmir.org/feed/atom", "JMIR Aging", days)


def src_jmir_public_health(days):
    return src_jmir_feed("https://publichealth.jmir.org/feed/atom",
                         "JMIR Public Health and Surveillance", days)


def src_jmir_medinform(days):
    return src_jmir_feed("https://medinform.jmir.org/feed/atom",
                         "JMIR Medical Informatics", days, JMIR_KEYS)


def src_jmir_mental(days):
    return src_jmir_feed("https://mental.jmir.org/feed/atom",
                         "JMIR Mental Health", days, JMIR_KEYS)


def src_frontiers_medicine(days):
    out = []
    for i in fetch_rss("https://www.frontiersin.org/journals/medicine/rss")[:20]:
        if within(i["dt"], days) and len(strip_tags(i["desc"])) >= 400 \
                and any(k in (i["title"] + " " + i["desc"]).lower()
                        for k in FRONTIERS_KEYS):
            out.append(cand("Frontiers in Medicine", i["title"], i["link"],
                            i["dt"], i["desc"], doi_of(i["link"])))
    return out


DC_NS = {"dc": "http://purl.org/dc/elements/1.1/"}


def src_jan(days):
    # Wiley's RSS: the plain <description> is only a citation line; the
    # full abstract lives in <dc:description>.
    root = ET.fromstring(http_get(
        "https://onlinelibrary.wiley.com/feed/13652648/most-recent"))
    out = []
    for item in root.iter("item"):
        def txt(tag):
            el = item.find(tag)
            return el.text if el is not None and el.text else ""
        el = item.find("dc:description", DC_NS)
        abstract = strip_tags(el.text) if el is not None and el.text else ""
        abstract = re.sub(r"^ABSTRACT\s*", "", abstract)
        if len(abstract) < 400:
            continue
        try:
            dt = parsedate_to_datetime(txt("pubDate"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
        except Exception:
            continue
        if not within(dt, days):
            continue
        out.append(cand("Journal of Advanced Nursing", txt("title"),
                        txt("link"), dt, abstract,
                        doi_of(txt("guid")) or doi_of(txt("link"))))
    return out


def _crossref_doi_for_title(title):
    q = urllib.parse.urlencode({"query.title": title, "rows": 1})
    data = json.loads(http_get("https://api.crossref.org/works?" + q,
                               accept="application/json"))
    items = data.get("message", {}).get("items", [])
    if not items:
        return None
    found = (items[0].get("title") or [""])[0]
    if norm_title(found) != norm_title(title):
        return None
    return items[0].get("DOI")


def _pubmed_by_doi(doi):
    base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
    q = urllib.parse.urlencode({"db": "pubmed", "term": f"{doi}[doi]",
                                "retmode": "json"})
    ids = json.loads(http_get(base + "esearch.fcgi?" + q))["esearchresult"]["idlist"]
    if not ids:
        return None
    q2 = urllib.parse.urlencode({"db": "pubmed", "id": ids[0], "retmode": "xml"})
    root = ET.fromstring(http_get(base + "efetch.fcgi?" + q2))
    art = root.find(".//PubmedArticle")
    if art is None:
        return None
    abstract = " ".join("".join(x.itertext())
                        for x in art.findall(".//AbstractText"))
    date_el = art.find(".//ArticleDate")
    if date_el is None:
        return None
    dt = datetime(int(date_el.findtext("Year")), int(date_el.findtext("Month")),
                  int(date_el.findtext("Day")), tzinfo=timezone.utc)
    return abstract, dt


def src_ijns(days):
    # The ScienceDirect RSS carries neither abstract nor date, so each
    # item is enriched: title -> Crossref DOI -> PubMed abstract/date.
    root = ET.fromstring(http_get(
        "https://rss.sciencedirect.com/publication/science/00207489"))
    items = []
    for item in root.iter("item"):
        def txt(tag):
            el = item.find(tag)
            return el.text if el is not None and el.text else ""
        if txt("title"):
            items.append((txt("title"), txt("link")))
    out = []
    for title, link in items[:12]:
        try:
            doi = _crossref_doi_for_title(title)
            if not doi:
                continue
            got = _pubmed_by_doi(doi)
            if not got:
                continue
            abstract, dt = got
            if len(abstract) < 400 or not within(dt, days):
                continue
            out.append(cand("International Journal of Nursing Studies",
                            title, link, dt, abstract, doi))
        except Exception:
            continue
    return out


RSS1_NS = {"r1": "http://purl.org/rss/1.0/",
           "dc": "http://purl.org/dc/elements/1.1/"}


def src_medrxiv(days):
    # RSS 1.0 feed; candidates are preprints (not peer reviewed) and are
    # labelled as such in sourceName for the editorial gate.
    root = ET.fromstring(http_get(
        "https://connect.medrxiv.org/medrxiv_xml.php?subject=nursing"))
    out = []
    for e in root.findall("r1:item", RSS1_NS):
        def txt(path):
            el = e.find(path, RSS1_NS)
            return el.text if el is not None and el.text else ""
        abstract = strip_tags(txt("r1:description"))
        if len(abstract) < 400:
            continue
        try:
            dt = datetime.fromisoformat(txt("dc:date").replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
        except Exception:
            continue
        if not within(dt, days):
            continue
        link = txt("r1:link")
        out.append(cand("medRxiv Preprint", txt("r1:title"), link, dt,
                        abstract, doi_of(link)))
    return out


RECENT_SOURCES = [
    ("ScienceDaily Health", src_sciencedaily), ("WHO", src_who), ("CDC", src_cdc),
    ("PubMed Nursing", src_pubmed), ("Europe PMC", src_europepmc),
    ("JMIR Nursing", src_jmir), ("FDA", src_fda), ("NHS England", src_nhs),
    ("Frontiers in Public Health", src_frontiers), ("PLOS Medicine", src_plos),
    ("BMC Nursing", src_bmc),
    ("Frontiers in Medicine", src_frontiers_medicine),
    ("PLOS ONE", src_plos_one), ("PLOS Global Public Health", src_plos_gph),
    ("JMIR Aging", src_jmir_aging),
    ("JMIR Public Health and Surveillance", src_jmir_public_health),
    ("JMIR Medical Informatics", src_jmir_medinform),
    ("JMIR Mental Health", src_jmir_mental),
    ("Journal of Advanced Nursing", src_jan),
    ("International Journal of Nursing Studies", src_ijns),
    ("medRxiv Preprint", src_medrxiv),
] + [(name, _crossref_source(issn, name)) for name, issn in CROSSREF_JOURNALS]
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
