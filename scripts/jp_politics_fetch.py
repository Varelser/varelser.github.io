#!/usr/bin/env python3
"""Japan Politics (国内政治) candidate fetcher — dry-run preparation by #9.

Fetches RSS/Atom feeds verified or probed for the domestic-politics lane,
parses with the stdlib only, and writes candidates in the established
fetcher schema {sourceName, originalTitle, url, publishedAt, description,
lang, region}. No posting, no seen updates. A failing source is recorded
in the summary's `failed` list and never stops the others.

Usage:
  python3 fetch_jp_politics.py --out candidates.json [--days 7]
"""
import argparse
import gzip
import html
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime

# Sources already verified live in the varelser.github.io world fetcher
# (2026-11-12) and relevant to Japanese domestic politics, plus NHK politics
# probed fresh from this environment (world fetcher's 2026-11-12 probe was a
# different environment; the probe result here is recorded in the summary).
SOURCES = [
    ("Yahoo!ニュース 国内", "https://news.yahoo.co.jp/rss/categories/domestic.xml", "ja"),
    ("時事通信", "https://www.jiji.com/rss/ranking.rdf", "ja"),
    ("Japan Times", "https://www.japantimes.co.jp/feed/", "en"),
    ("NHK 政治", "https://www.nhk.or.jp/rss/news/cat4.xml", "ja"),
]

UA = {"User-Agent": "Mozilla/5.0 (compatible; VarelserNewsBot/1.0)"}


def clean(text):
    text = html.unescape(text or "")
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def parse_dt(raw):
    if not raw:
        return None
    raw = raw.strip()
    try:
        dt = parsedate_to_datetime(raw)
        if dt is not None:
            return dt.astimezone(timezone.utc)
    except Exception:
        pass
    try:
        dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        return dt.astimezone(timezone.utc)
    except Exception:
        return None


def page_description(url):
    """Fallback for feeds whose items carry no description (e.g. Jiji
    ranking RDF): read the article page's meta description. Summarizing
    from a bare title makes the summarizer invent details, so an item
    must never reach the summarizer without body text."""
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.build_opener().open(req, timeout=30) as resp:
            page = resp.read().decode("utf-8", errors="replace")
        m = re.search(r'<meta[^>]+name="description"[^>]+content="([^"]+)"', page)
        if not m:
            m = re.search(r'<meta[^>]+content="([^"]+)"[^>]+name="description"', page)
        return clean(m.group(1))[:1200] if m else ""
    except Exception:
        return ""


def fetch_one(src):
    name, url, lang = src
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.build_opener().open(req, timeout=30) as resp:
        body = resp.read()
        if resp.headers.get("Content-Encoding") == "gzip" or body[:2] == b"\x1f\x8b":
            body = gzip.decompress(body)
    root = ET.fromstring(body)
    items = []
    for el in root.iter():
        if el.tag.split("}")[-1] not in ("item", "entry"):
            continue
        fields = {}
        for child in el:
            tag = child.tag.split("}")[-1]
            if tag == "link" and child.get("href"):
                fields["link"] = child.get("href")
            else:
                fields[tag] = child.text or ""
        title = clean(fields.get("title", ""))
        link = (fields.get("link") or fields.get("guid") or "").strip()
        dt = parse_dt(fields.get("pubDate") or fields.get("published") or fields.get("updated") or fields.get("date"))
        if not title or not link.startswith("http"):
            continue
        desc = clean(fields.get("description") or fields.get("summary") or "")[:1200]
        if not desc:
            desc = page_description(link)
        items.append({
            "sourceName": name,
            "originalTitle": title,
            "url": link,
            "publishedAt": dt.isoformat().replace("+00:00", "Z") if dt else "",
            "description": desc,
            "lang": lang,
            "region": "国内",
        })
    return name, items


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--days", type=int, default=7)
    args = ap.parse_args()

    cutoff = datetime.now(timezone.utc) - timedelta(days=args.days)
    all_items, failed, per_source = [], [], {}
    with ThreadPoolExecutor(max_workers=len(SOURCES)) as ex:
        futs = {ex.submit(fetch_one, s): s[0] for s in SOURCES}
        for fut, name in [(f, futs[f]) for f in futs]:
            try:
                _, items = fut.result()
                kept = [it for it in items if not it["publishedAt"] or parse_dt(it["publishedAt"]) >= cutoff]
                per_source[name] = {"fetched": len(items), "within_days": len(kept)}
                all_items.extend(kept)
            except Exception as e:
                failed.append({"source": name, "error": str(e)[:200]})
                per_source[name] = {"fetched": 0, "within_days": 0}

    seen, deduped = set(), []
    for it in sorted(all_items, key=lambda x: x["publishedAt"], reverse=True):
        key = it["url"]
        if key in seen:
            continue
        seen.add(key)
        deduped.append(it)

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(deduped, f, ensure_ascii=False, indent=1)
    print(json.dumps({"total": len(deduped), "per_source": per_source, "failed": failed}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
