#!/usr/bin/env python3
"""Music News candidate fetcher (fixed script for the hourly update).

Scope (user decision 2026-11-12): overseas criticism / review sites and
Bandcamp-centred sources covering experimental, ambient, noise, drone,
psychedelic and alternative music. Japanese pops and mainstream-major
coverage are out of scope, so the Japanese sources (BARKS, Billboard
JAPAN) and the mainstream wires (Consequence, NME, Rolling Stone) that
the launch version shared with the Discord Music channel were removed;
the Discord channel itself is unchanged. Sources that did not respond
during verification stay out (Boomkat / Norman Records 403, Igloo /
Textura 406, Resident Advisor / Pitchfork Reviews / Soundohm /
Sputnikmusic 404, Astral Noize timeout — do not retry).

Parses RSS/Atom with the stdlib only and writes candidates that are
not already in music-news-data.json (dedupe by URL and normalized
title; sources are fetched in parallel, dedupe is applied afterwards
in publishedAt order so runs stay deterministic). Fluid Radio was
verified reachable on 2026-11-12 but its feed was dominated by
casino spam posts, so it is excluded as a broken source.

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
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime

SOURCES = [
    ("Pitchfork", "https://pitchfork.com/rss/news/", "en"),
    ("Bandcamp Daily", "https://daily.bandcamp.com/feed", "en"),
    ("Stereogum", "https://www.stereogum.com/feed/", "en"),
    ("FACT", "https://www.factmag.com/feed/", "en"),
    ("The Quietus", "https://thequietus.com/feed", "en"),
    ("Aquarium Drunkard", "https://aquariumdrunkard.com/feed/", "en"),
    ("The FADER", "https://www.thefader.com/feed", "en"),
    ("NPR Music", "https://feeds.npr.org/1039/rss.xml", "en"),
    ("The Wire", "https://www.thewire.co.uk/rss", "en"),
    ("XLR8R", "https://xlr8r.com/feed/", "en"),
    ("A Closer Listen", "https://acloserlisten.com/feed/", "en"),
    ("Headphone Commute", "https://headphonecommute.com/feed/", "en"),
    ("Foxy Digitalis", "https://foxydigitalis.zone/feed/", "en"),
    ("Brainwashed", "https://brainwashed.com/index.php?format=feed&type=rss", "en"),
    ("Raven Sings the Blues", "https://www.ravensingstheblues.com/feed/", "en"),
    ("The Obelisk", "https://theobelisk.net/obelisk/feed/", "en"),
    ("Doom Charts", "https://doomcharts.com/feed/", "en"),
    ("Echoes and Dust", "https://www.echoesanddust.com/feed/", "en"),
    ("Everything Is Noise", "https://everythingisnoise.net/feed/", "en"),
    ("CVLT Nation", "https://cvltnation.com/feed/", "en"),
    ("A Strangely Isolated Place",
     "https://astrangelyisolatedplace.com/blog?format=rss", "en"),
    ("Stationary Travels",
     "https://stationarytravels.wordpress.com/feed/", "en"),
    ("Post-Punk.com", "https://post-punk.com/feed/", "en"),
    ("Louder Than War", "https://louderthanwar.com/feed/", "en"),
    ("Treble", "https://www.treblezine.com/feed/", "en"),
    ("Beats Per Minute", "https://beatsperminute.com/feed/", "en"),
    ("The Line of Best Fit", "https://www.thelineofbestfit.com/feed", "en"),
    ("Crack Magazine", "https://crackmagazine.net/feed/", "en"),
    ("Loud and Quiet", "https://www.loudandquiet.com/feed/", "en"),
    ("Gorilla vs Bear", "https://www.gorillavsbear.net/feed/", "en"),
    ("The Needle Drop", "https://theneedledrop.com/feed/", "en"),
    ("Side-Line", "https://www.side-line.com/feed/", "en"),
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


def fetch_candidates(name, url, lang, cutoff):
    """Fetch one source's raw candidates (no dedupe; main applies it)."""
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

    raw, per_source, failed = [], {}, []
    with ThreadPoolExecutor(max_workers=8) as ex:
        futures = {name: ex.submit(fetch_candidates, name, url, lang, cutoff)
                   for name, url, lang in SOURCES}
        for name, url, lang in SOURCES:
            try:
                got = futures[name].result()
                raw.extend(got)
                per_source[name] = 0  # counted after dedupe below
                for c in got:
                    c["_source_key"] = name
            except Exception as e:  # one source down must not stop others
                failed.append({"source": name, "error": str(e)[:200]})
                per_source[name] = 0
    # Deterministic dedupe: newest first, against the stock and itself.
    raw.sort(key=lambda c: c["publishedAt"], reverse=True)
    candidates = []
    for c in raw:
        if c["url"] in seen_urls or norm_title(c["originalTitle"]) in seen_titles:
            continue
        seen_urls.add(c["url"])
        seen_titles.add(norm_title(c["originalTitle"]))
        per_source[c.pop("_source_key")] += 1
        candidates.append(c)
    candidates.sort(key=lambda c: c["publishedAt"], reverse=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(candidates, f, ensure_ascii=False, indent=1)
    print(json.dumps({"total": len(candidates), "per_source": per_source,
                      "failed": failed}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
