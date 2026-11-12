#!/usr/bin/env python3
"""Music News candidate fetcher (fixed script for the hourly update).

Fetches the 13 music sources used by the Discord Music channel
(~/workspace/discord-creative-news/config.json, music category; Natalie
feeds stay removed per the user's 2026-11-08 instruction), parses
RSS/Atom with the stdlib only, and writes candidates that are not
already in music-news-data.json (dedupe by URL and normalized title).

Each candidate: {sourceName, originalTitle, url, publishedAt (ISO UTC),
description (plain text, <=1200 chars), lang, region}.
A failing source is recorded in the summary's `failed` list and never
stops the others.

Usage:
  python3 scripts/music_fetch.py --data music-news-data.json \
      --out /tmp/music_candidates.json [--days 45]
Prints a JSON summary {total, per_source, failed} to stdout.
"""
import argparse
import html
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime

SOURCES = [
    ("BARKS", "https://www.barks.jp/rss", "ja"),
    ("Billboard JAPAN", "https://www.billboard-japan.com/d_news/doc.xml", "ja"),
    ("Pitchfork", "https://pitchfork.com/rss/news/", "en"),
    ("Bandcamp Daily", "https://daily.bandcamp.com/feed", "en"),
    ("Stereogum", "https://www.stereogum.com/feed/", "en"),
    ("Consequence", "https://consequence.net/feed/", "en"),
    ("NME", "https://www.nme.com/feed", "en"),
    ("Rolling Stone Music News",
     "https://www.rollingstone.com/music/music-news/feed/", "en"),
    ("FACT", "https://www.factmag.com/feed/", "en"),
    ("The Quietus", "https://thequietus.com/feed", "en"),
    ("Aquarium Drunkard", "https://aquariumdrunkard.com/feed/", "en"),
    ("The FADER", "https://www.thefader.com/feed", "en"),
    ("NPR Music", "https://feeds.npr.org/1039/rss.xml", "en"),
]

UA = {"User-Agent": "Mozilla/5.0 (compatible; MusicNewsFetch/1.0)"}


def norm_title(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def plain(s):
    s = re.sub(r"<[^>]+>", " ", s or "")
    s = html.unescape(s)
    return re.sub(r"\s+", " ", s).strip()


def parse_date(text):
    if not text:
        return None
    text = text.strip()
    try:
        dt = parsedate_to_datetime(text)
        if dt is not None:
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)
    except (TypeError, ValueError):
        pass
    for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%SZ",
                "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            t = text.replace("Z", "+0000") if fmt.endswith("%z") else text
            dt = datetime.strptime(t, fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)
        except ValueError:
            continue
    return None


def local(tag):
    return tag.rsplit("}", 1)[-1] if "}" in tag else tag


def child_text(elem, names):
    for c in elem:
        if local(c.tag) in names:
            txt = "".join(c.itertext()).strip()
            if txt:
                return txt
    return ""


def child_link(elem):
    # RSS: <link>text</link>; Atom: <link href="..."/>
    for c in elem:
        if local(c.tag) == "link":
            href = c.get("href")
            if href and c.get("rel") in (None, "alternate"):
                return href.strip()
            if c.text and c.text.strip():
                return c.text.strip()
    return ""


def fetch_candidates(name, url, lang, cutoff, seen_urls, seen_titles):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        raw = r.read()
    root = ET.fromstring(raw)
    items = [e for e in root.iter() if local(e.tag) in ("item", "entry")]
    out = []
    for it in items:
        title = plain(child_text(it, ("title",)))
        link = child_link(it)
        if not title or not link:
            continue
        dt = parse_date(child_text(it, ("pubDate", "published", "updated",
                                        "date", "dc:date")))
        if dt is None or dt < cutoff:
            continue
        if link in seen_urls or norm_title(title) in seen_titles:
            continue
        desc = plain(child_text(it, ("description", "summary", "content",
                                     "encoded")))
        out.append({
            "sourceName": name,
            "originalTitle": title,
            "url": link,
            "publishedAt": dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "description": desc[:1200],
            "lang": lang,
            "region": "国内" if lang == "ja" else "海外",
        })
        seen_urls.add(link)
        seen_titles.add(norm_title(title))
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(description="Music News candidate fetcher")
    ap.add_argument("--data", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--days", type=int, default=45)
    args = ap.parse_args(argv)

    try:
        with open(args.data, encoding="utf-8") as f:
            stock = json.load(f).get("articles", [])
    except FileNotFoundError:
        stock = []
    seen_urls = {a["url"] for a in stock}
    seen_titles = {norm_title(a.get("originalTitle")) for a in stock}
    cutoff = datetime.now(timezone.utc) - timedelta(days=args.days)

    candidates, per_source, failed = [], {}, []
    for name, url, lang in SOURCES:
        try:
            got = fetch_candidates(name, url, lang, cutoff,
                                   seen_urls, seen_titles)
            candidates.extend(got)
            per_source[name] = len(got)
        except Exception as e:  # one source down must not stop the rest
            failed.append({"source": name, "error": str(e)[:200]})
            per_source[name] = 0
    candidates.sort(key=lambda c: c["publishedAt"], reverse=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(candidates, f, ensure_ascii=False, indent=1)
    print(json.dumps({"total": len(candidates), "per_source": per_source,
                      "failed": failed}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
