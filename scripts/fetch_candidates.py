#!/usr/bin/env python3
"""Candidate fetcher for the arxiv.html (Research Digest) hourly job.
Canonical copy: scripts/fetch_candidates.py in Varelser/varelser.github.io
(moved here 2026-11-12; previously lived in the update workspace).

Covers the sources beyond arXiv / Crossref / HF Papers / J-STAGE:
PubMed, Europe PMC, bioRxiv, medRxiv,
ClinicalTrials.gov, OSF Preprints (incl. PsyArXiv), DOAJ.
Key-less public APIs only. A failing source is logged and skipped.
(Semantic Scholar / OpenAlex / CORE were removed on 2026-11-10 at the
user's instruction: persistent upstream 429s. Their fetch functions are
kept below, unused, so the removal is reversible.)

Output: JSON list of normalized candidates:
  {source, title, abstract, date (YYYY-MM-DD), url, doi, authors, venue}
Gates: abstract >= 200 chars, date within [today-45d, today+2d],
dedupe by DOI / normalized title / URL inside the output.
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import date, timedelta

UA = {"User-Agent": "Mozilla/5.0 (research digest fetcher)"}
BACKFILL = False  # set by main() when --backfill is passed
TODAY = date.today()
MIN_DATE = TODAY - timedelta(days=45)
MAX_DATE = TODAY + timedelta(days=2)

BIO_QUERIES = [
    "altered states of consciousness",
    "psychedelic consciousness",
    "psychedelic therapy PTSD trauma",
    "psilocybin depression",
    "MDMA-assisted therapy",
    "meditation consciousness neuroscience",
]
X_QUERIES = [
    "consciousness",
    "philosophy of mind consciousness",
    "AI ethics",
    "psychedelic",
    "phenomenology of consciousness",
]
OSF_QUERIES = ["consciousness", "psychedelic", "trauma consciousness"]
PREPRINT_KEYWORDS = [
    "consciousness", "psychedelic", "psilocybin", "mdma", "trauma", "ptsd",
    "meditation", "phenomenolog", "neural correlates", "eeg", "ego dissolution",
]
TRIAL_QUERIES = ["psychedelic", "psilocybin", "MDMA", "ketamine consciousness"]


def http_json(url, timeout=30):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8", "replace"))


def http_text(url, timeout=30):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


def norm_title(t):
    return re.sub(r"[^a-z0-9 ]", "", (t or "").lower()).strip()


def ok_date(iso):
    if not iso:
        return False
    try:
        d = date.fromisoformat(iso[:10])
    except ValueError:
        return False
    return MIN_DATE <= d <= MAX_DATE


def cand(source, title, abstract, dt, url, doi="", authors=None, venue=""):
    return {
        "source": source, "title": (title or "").strip(),
        "abstract": re.sub(r"\s+", " ", (abstract or "")).strip(),
        "date": (dt or "")[:10], "url": url or "", "doi": doi or "",
        "authors": authors or [], "venue": venue or "",
    }


# ---------------- sources ----------------

def fetch_pubmed(out):
    base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
    for q in BIO_QUERIES:
        params = {"db": "pubmed", "term": q, "retmax": 6, "retmode": "json",
                  "sort": "pub_date", "datetype": "pdat"}
        if BACKFILL:
            params["mindate"] = (TODAY - timedelta(days=365 * 7)).isoformat()
            params["maxdate"] = (TODAY - timedelta(days=46)).isoformat()
            params["retmax"] = 10
        else:
            params["reldate"] = 45
        d = http_json(base + "/esearch.fcgi?" + urllib.parse.urlencode(params))
        ids = d.get("esearchresult", {}).get("idlist", [])
        if not ids:
            continue
        xml = http_text(base + "/efetch.fcgi?" + urllib.parse.urlencode({
            "db": "pubmed", "id": ",".join(ids), "retmode": "xml"}))
        import xml.etree.ElementTree as ET
        root = ET.fromstring(xml)
        for art in root.iter("PubmedArticle"):
            title = "".join(art.find(".//ArticleTitle").itertext()) if art.find(".//ArticleTitle") is not None else ""
            abst = " ".join("".join(a.itertext()) for a in art.findall(".//AbstractText"))
            pmid = art.findtext(".//PMID", "")
            doi = ""
            idlist = art.find(".//PubmedData/ArticleIdList")
            if idlist is not None:
                for aid in idlist.findall("ArticleId"):
                    if aid.get("IdType") == "doi":
                        doi = aid.text or ""
            pd = art.find(".//PubDate")
            y = pd.findtext("Year") if pd is not None else None
            m = (pd.findtext("Month") if pd is not None else None) or "Jan"
            dd = (pd.findtext("Day") if pd is not None else None) or "01"
            months = {s: i + 1 for i, s in enumerate(
                ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])}
            try:
                iso = date(int(y), months.get(m[:3], 1), int(dd)).isoformat()
            except Exception:
                iso = ""
            authors = []
            for a in art.findall(".//Author"):
                nm = " ".join(x for x in [a.findtext("ForeName"), a.findtext("LastName")] if x)
                if nm:
                    authors.append(nm)
            venue = art.findtext(".//Journal/Title", "")
            out.append(cand("PubMed", title, abst, iso,
                            f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/", doi, authors, venue))


def fetch_europepmc(out):
    for q in BIO_QUERIES + X_QUERIES[:2]:
        query = q
        if BACKFILL:
            lo = (TODAY - timedelta(days=365 * 7)).isoformat()
            hi = (TODAY - timedelta(days=46)).isoformat()
            query = f"({q}) AND FIRST_PDATE:[{lo} TO {hi}]"
        d = http_json("https://www.ebi.ac.uk/europepmc/webservices/rest/search?" + urllib.parse.urlencode({
            "query": query, "format": "json", "pageSize": 10 if BACKFILL else 6,
            "sort": "P_PDATE_D desc", "resultType": "core"}))
        for r in d.get("resultList", {}).get("result", []):
            out.append(cand(
                "Europe PMC", r.get("title"), r.get("abstractText"),
                (r.get("firstPublicationDate") or r.get("firstIndexDate") or ""),
                f"https://europepmc.org/article/{r.get('source', 'MED')}/{r.get('id', '')}",
                r.get("doi", ""),
                [a.get("fullName", "") for a in r.get("authorList", {}).get("author", [])],
                (r.get("journalInfo", {}).get("journal", {}) or {}).get("title", "")))


def fetch_semanticscholar(out):
    for q in X_QUERIES + BIO_QUERIES[:2]:
        url = "https://api.semanticscholar.org/graph/v1/paper/search?" + urllib.parse.urlencode({
            "query": q, "limit": 6,
            "fields": "title,abstract,publicationDate,externalIds,authors,venue"})
        d = http_json(url)
        for p in d.get("data", []):
            out.append(cand(
                "Semantic Scholar", p.get("title"), p.get("abstract"),
                p.get("publicationDate") or "",
                f"https://www.semanticscholar.org/paper/{p.get('paperId', '')}",
                (p.get("externalIds") or {}).get("DOI", ""),
                [a.get("name", "") for a in p.get("authors", [])],
                p.get("venue", "")))
        time.sleep(1)


def fetch_openalex(out):
    frm = MIN_DATE.isoformat()
    for q in X_QUERIES + BIO_QUERIES[:2]:
        d = http_json("https://api.openalex.org/works?" + urllib.parse.urlencode({
            "search": q, "per-page": 6,
            "filter": f"from_publication_date:{frm}",
            "sort": "publication_date:desc"}))
        for w in d.get("results", []):
            inv = w.get("abstract_inverted_index") or {}
            words = {}
            for word, poss in inv.items():
                for pos in poss:
                    words[pos] = word
            abst = " ".join(words[i] for i in sorted(words))
            out.append(cand(
                "OpenAlex", w.get("title"), abst, w.get("publication_date") or "",
                w.get("id", ""), (w.get("doi") or "").replace("https://doi.org/", ""),
                [a.get("author", {}).get("display_name", "") for a in w.get("authorships", [])],
                ((w.get("primary_location") or {}).get("source") or {}).get("display_name", "")))


def fetch_preprints(server, out):
    label = {"biorxiv": "bioRxiv", "medrxiv": "medRxiv"}.get(server, server)
    start = (TODAY - timedelta(days=30)).isoformat()
    end = TODAY.isoformat()
    for cursor in (0, 100, 200, 300, 400):
        d = http_json(f"https://api.biorxiv.org/details/{server}/{start}/{end}/{cursor}")
        coll = d.get("collection", [])
        if not coll:
            break
        for p in coll:
            text = ((p.get("title") or "") + " " + (p.get("abstract") or "")).lower()
            if not any(k in text for k in PREPRINT_KEYWORDS):
                continue
            out.append(cand(
                label, p.get("title"), p.get("abstract"), p.get("date"),
                f"https://www.{server}.org/content/{p.get('doi', '')}",
                p.get("doi", ""),
                [a.strip() for a in (p.get("authors") or "").split(";") if a.strip()],
                server))


def fetch_trials(out):
    for q in TRIAL_QUERIES:
        d = http_json("https://clinicaltrials.gov/api/v2/studies?" + urllib.parse.urlencode({
            "query.cond": q, "pageSize": 8, "sort": "LastUpdatePostDate:desc",
            "format": "json"}))
        for st in d.get("studies", []):
            proto = st.get("protocolSection", {})
            ident = proto.get("identificationModule", {})
            status = proto.get("statusModule", {})
            desc = proto.get("descriptionModule", {})
            abst = ((desc.get("briefSummary") or "") + " " + (desc.get("detailedDescription") or "")).strip()
            dt = (status.get("lastUpdatePostDate") or status.get("startDateStruct", {}).get("date") or "")
            nct = ident.get("nctId", "")
            out.append(cand(
                "ClinicalTrials.gov", ident.get("briefTitle"), abst, dt,
                f"https://clinicaltrials.gov/study/{nct}", "",
                [], proto.get("sponsorCollaboratorsModule", {}).get("leadSponsor", {}).get("name", "")))


def fetch_osf(out):
    for q in OSF_QUERIES:
        d = http_json("https://api.osf.io/v2/preprints/?" + urllib.parse.urlencode({
            "search": q, "page[size]": 10}))
        for p in d.get("data", []):
            at = p.get("attributes", {})
            out.append(cand(
                "OSF Preprints", at.get("title"), at.get("description"),
                (at.get("date_published") or at.get("date_created") or "")[:10],
                (p.get("links") or {}).get("html") or f"https://osf.io/preprints/{p.get('id', '')}",
                ((at.get("identifiers") or {}).get("doi") or ""),
                [], at.get("provider") if isinstance(at.get("provider"), str) else "OSF"))


def fetch_doaj(out):
    for q in X_QUERIES[:3] + BIO_QUERIES[:1]:
        d = http_json("https://doaj.org/api/search/articles/" + urllib.parse.quote(q) +
                      "?page=1&pageSize=6")
        for r in d.get("results", []):
            bj = r.get("bibjson", {})
            dt = ""
            if bj.get("year"):
                mon = bj.get("month")
                month_names = {s: i + 1 for i, s in enumerate(
                    ["january", "february", "march", "april", "may", "june",
                     "july", "august", "september", "october", "november", "december"])}
                if isinstance(mon, str) and mon.lower() in month_names:
                    mon = month_names[mon.lower()]
                try:
                    dt = f"{bj.get('year')}-{int(mon or 1):02d}-01"
                except (TypeError, ValueError):
                    dt = f"{bj.get('year')}-01-01"
            doi = ""
            for ident in bj.get("identifier", []):
                if ident.get("type") == "doi":
                    doi = ident.get("id", "")
            link = ""
            for lnk in bj.get("link", []):
                if lnk.get("type") == "fulltext":
                    link = lnk.get("url", "")
                    break
            out.append(cand(
                "DOAJ", bj.get("title"), bj.get("abstract"), dt,
                link or (f"https://doi.org/{doi}" if doi else ""), doi,
                [a.get("name", "") for a in bj.get("author", [])],
                (bj.get("journal") or {}).get("title", "")))


def fetch_core(out):
    for q in X_QUERIES[:3]:
        d = http_json("https://api.core.ac.uk/v3/search/works?" + urllib.parse.urlencode({
            "q": q, "limit": 6, "sort": "publishedDate:desc"}))
        for w in d.get("results", []):
            out.append(cand(
                "CORE", w.get("title"), w.get("abstract"),
                (w.get("publishedDate") or w.get("yearPublished") and f"{w.get('yearPublished')}-01-01" or ""),
                w.get("downloadUrl") or (f"https://doi.org/{w.get('doi')}" if w.get("doi") else ""),
                w.get("doi", ""),
                [a.get("name", "") for a in w.get("authors", [])],
                (w.get("publisher") or "")))



# ---------------- RSS / Atom journal feeds (added 2026-11-12) ----------------
import xml.etree.ElementTree as ET


def _strip_html(s):
    return re.sub(r"<[^>]+>", " ", s or "").strip()


def _local(tag):
    return tag.rsplit("}", 1)[-1].lower()


def _kids(node):
    m = {}
    for ch in node:
        m.setdefault(_local(ch.tag), []).append(ch)
    return m


def _feed_date(kids):
    for key in ("pubdate", "published", "updated", "date"):
        for el in kids.get(key, []):
            txt = (el.text or "").strip()
            m = re.search(r"(\d{4})-(\d{2})-(\d{2})", txt)
            if m:
                return m.group(0)
            m = re.search(r"(\d{1,2})\s+(\w{3})\w*\s+(\d{4})", txt)
            if m:
                months = {s: i + 1 for i, s in enumerate(
                    ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])}
                try:
                    return date(int(m.group(3)), months.get(m.group(2)[:3], 1), int(m.group(1))).isoformat()
                except Exception:
                    return ""
    return ""


def fetch_feed(label, url, page_abstract=False):
    """One RSS 2.0 / RSS 1.0 (RDF) / Atom journal feed -> normalized
    candidates (abstract = item description/summary). Element names are
    matched by local name so namespaces and Frontiers' lowercase <pubdate>
    all parse. Broad feeds are title-gated in main(). With page_abstract,
    items lacking a description (Nature Communications RSS) get their
    abstract from the article page's meta tags."""

    def _fetch(out):
        xml = http_text(url)
        root = ET.fromstring(xml)
        for node in root.iter():
            if _local(node.tag) not in ("item", "entry"):
                continue
            kids = _kids(node)
            def first(key):
                els = kids.get(key, [])
                return (els[0].text or "").strip() if els else ""
            title = first("title")
            link = first("link")
            if not link:  # Atom: link is an element with href
                for lnk in kids.get("link", []):
                    if lnk.get("rel") in (None, "alternate") and lnk.get("href"):
                        link = lnk.get("href")
                        break
            abst = _strip_html(first("description") or first("summary") or first("content"))
            if page_abstract and len(abst) < 200 and link:
                try:
                    page = http_text(link)
                    m = (re.search(r'<meta[^>]+name="description"[^>]+content="([^"]+)"', page)
                         or re.search(r'<meta[^>]+name="citation_abstract"[^>]+content="([^"]+)"', page)
                         or re.search(r'<meta[^>]+property="og:description"[^>]+content="([^"]+)"', page))
                    if m:
                        abst = _strip_html(m.group(1))
                except Exception:
                    pass
            authors = []
            for c in kids.get("creator", []):
                if c.text:
                    authors.append(c.text.strip())
            for a in kids.get("author", []):
                nm = _kids(a).get("name", [])
                if nm and nm[0].text:
                    authors.append(nm[0].text.strip())
                elif a.text:
                    authors.append(a.text.strip())
            doi = ""
            m = re.search(r"10\.\d{4,9}/\S+", (first("guid") + " " + first("id") + " " + link).lower())
            if m:
                doi = m.group(0).rstrip("/.")
            out.append(cand(label, title, abst, _feed_date(kids), link, doi, authors, label))

    return _fetch


TITLE_GATE = [
    "consciousness", "psychedelic", "psilocybin", "mdma", "trauma", "ptsd",
    "meditation", "phenomenolog", "ethic", "moral", "philosophy of mind",
    "cognition", "cognitive", "altered states", "ego dissolution", "near-death",
    "mindfulness", "psychedelic-assisted", "entheogen", "ayahuasca", "lsd",
    "ketamine", "意識", "倫理", "トラウマ", "瞑想",
    "artificial intelligence", "large language model", "language model", "llm",
    "machine learning", "deep learning", "neural network", "chatbot", "agent",
    "neuro", "brain", "mental health", "psychiatr", "psycholog", "emotion",
    "memory", "perception", "sleep", "depression", "anxiety", "ai ",
]
GATED_SOURCES = {"OSF Preprints", "DOAJ", "Frontiers in Psychology",
                 "Frontiers in Artificial Intelligence", "Frontiers in Neuroscience",
                 "JMIR Mental Health", "PLOS ONE", "Nature Communications", "ScienceDaily"}


def title_gate(c):
    if c["source"] not in GATED_SOURCES:
        return True
    t = (c["title"] or "").lower()
    return any(k in t for k in TITLE_GATE)


SOURCES = [
    ("PubMed", fetch_pubmed),
    ("Europe PMC", fetch_europepmc),
    ("bioRxiv", lambda o: fetch_preprints("biorxiv", o)),
    ("medRxiv", lambda o: fetch_preprints("medrxiv", o)),
    ("ClinicalTrials.gov", fetch_trials),
    ("OSF Preprints", fetch_osf),
    ("DOAJ", fetch_doaj),
    ("Frontiers in Psychology", fetch_feed("Frontiers in Psychology", "https://www.frontiersin.org/journals/psychology/rss")),
    ("Frontiers in Artificial Intelligence", fetch_feed("Frontiers in Artificial Intelligence", "https://www.frontiersin.org/journals/artificial-intelligence/rss")),
    ("Frontiers in Neuroscience", fetch_feed("Frontiers in Neuroscience", "https://www.frontiersin.org/journals/neuroscience/rss")),
    ("JMIR Mental Health", fetch_feed("JMIR Mental Health", "https://mental.jmir.org/feed/atom")),
    ("PLOS ONE", fetch_feed("PLOS ONE", "https://journals.plos.org/plosone/feed/atom")),
    ("Nature Communications", fetch_feed("Nature Communications", "https://www.nature.com/ncomms.rss", page_abstract=True)),
    ("ScienceDaily", fetch_feed("ScienceDaily", "https://www.sciencedaily.com/rss/mind_brain.xml")),
]


def main():
    global BACKFILL, MIN_DATE, MAX_DATE
    argv = sys.argv[1:]
    if "--backfill" in argv:
        BACKFILL = True
        argv = [a for a in argv if a != "--backfill"]
        # Backfill window: from 7 years ago up to where the recent window ends.
        MIN_DATE = TODAY - timedelta(days=365 * 7)
        MAX_DATE = TODAY - timedelta(days=46)
    wanted = None
    if argv and argv[0] == "--sources":
        wanted = set(argv[1].split(","))
    if BACKFILL and wanted is None:
        wanted = {"PubMed", "Europe PMC"}
    raw = []
    report = {}
    for name, fn in SOURCES:
        if wanted and name not in wanted:
            continue
        buf = []
        try:
            fn(buf)
            report[name] = f"fetched {len(buf)} raw"
        except Exception as e:  # per-source failure: one retry on 429, else skip
            if "429" in str(e):
                time.sleep(30)
                try:
                    buf = []
                    fn(buf)
                    report[name] = f"fetched {len(buf)} raw (after 429 retry)"
                except Exception as e2:
                    report[name] = f"ERROR {type(e2).__name__}: {str(e2)[:120]}"
                    buf = []
            else:
                report[name] = f"ERROR {type(e).__name__}: {str(e)[:120]}"
                buf = []
        raw.extend(buf)

    seen_doi, seen_title, seen_url, kept = set(), set(), set(), []
    for c in raw:
        if len(c["abstract"]) < 200 or not ok_date(c["date"]) or not title_gate(c):
            continue
        doi = c["doi"].lower().replace("https://doi.org/", "")
        t = norm_title(c["title"])
        u = c["url"].lower().rstrip("/")
        if (doi and doi in seen_doi) or (t and t in seen_title) or (u and u in seen_url):
            continue
        if doi:
            seen_doi.add(doi)
        if t:
            seen_title.add(t)
        if u:
            seen_url.add(u)
        kept.append(c)
    kept.sort(key=lambda c: c["date"], reverse=True)

    out_path = "candidates_backfill.json" if BACKFILL else "candidates_extra.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(kept, f, ensure_ascii=False, indent=1)
    for name, msg in report.items():
        print(f"[{name}] {msg}", file=sys.stderr)
    by_source = {}
    for c in kept:
        by_source[c["source"]] = by_source.get(c["source"], 0) + 1
    print(f"kept {len(kept)} candidates -> {out_path}", file=sys.stderr)
    print("by source (after gates+dedupe):", json.dumps(by_source, ensure_ascii=False), file=sys.stderr)


if __name__ == "__main__":
    main()
