#!/usr/bin/env python3
"""Literature News candidate fetcher (fixed script for the hourly update).

Scope: 53 sources verified by live fetching on 2026-11-12 at the
user's request for comprehensive coverage of literature: novels,
poetry, essays, criticism, translated literature, children's
literature, SF/fantasy, mystery, publishing and literary prizes.
Japanese (15): Hon no Hanashi (Bunshun books), Book Bang
(Shinchosha), Web Kawade, Real Sound Book, Honyaku Mystery Taisho,
JBBY, SF Writers of Japan, Japan PEN Club, Japan Writers'
Association, CINRA, Bunshun Online, Gendai Business, Toyo Keizai
Online, PRESIDENT Online, Yahoo! News Entertainment.
Overseas (38): Guardian Books, NYT Books, NPR Books, Paris Review,
Literary Hub, Book Riot, Electric Literature, The Millions,
Locus Magazine, Reactor, Words Without Borders, London Review of
Books Blog, The Atlantic Books, LA Times Books, Chicago Review of
Books, Guernica, Harper's Magazine, 3:AM Magazine, Arablit,
Brittle Paper, BookPage, Book Marks, CrimeReads, Longreads,
The Baffler, The Walrus, Clarkesworld, Strange Horizons,
Uncanny Magazine, PEN America, Five Books, World Literature
Today, Hopscotch Translation, Rain Taxi, Reading in Translation,
Nobel Prize, Small Beer Press, Archipelago Books.
Probed on 2026-11-12 and NOT adopted (do not retry): Kosho Kojitsu /
Asahi book RSS, HONZ, Da Vinci Web, Shinchosha / Kodansha /
Shueisha / Kadokawa official RSS (404), Hayakawa / Sogensha
(malformed XML or disconnect), Kirkus / Publishers Weekly /
LA Review of Books / Poetry Foundation / TLS / Booker Prize
(404 or 403), Granta / Full Stop (mismatched XML), The Rumpus /
New Statesman (malformed XML), Natalie (405), many publisher
note.com / official feeds (404). Mixed feeds (CINRA, Bunshun
Online, Gendai Business, Toyo Keizai, PRESIDENT, Yahoo
Entertainment, Nobel Prize) are filtered by the editorial gate
in the cron job, not here.
Parses RSS/Atom with the stdlib only and writes candidates that
are not already in literature-news-data.json (dedupe by URL and
normalized title; sources are fetched in parallel, dedupe is
applied afterwards in publishedAt order so runs stay
deterministic). Feeds that answer with an unrequested gzip body
are decompressed before parsing. The fetcher also lstrips raw
bytes before XML parsing (whitespace-before-declaration feeds).

Each candidate: {sourceName, originalTitle, url, publishedAt (ISO UTC),
description (plain text, <=1200 chars), lang, region}.
A failing source is recorded in the summary's `failed` list and never
stops the others.

Usage:
  python3 scripts/literature_fetch.py --data literature-news-data.json \
      --out /tmp/literature_candidates.json [--days 45]
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
    ('本の話', "https://books.bunshun.jp/list/feed/rss", "ja"),
    ('Book Bang', "https://www.bookbang.jp/feed", "ja"),
    ('Web河出', "https://web.kawade.co.jp/feed", "ja"),
    ('Real Sound ブック', "https://realsound.jp/book/feed", "ja"),
    ('翻訳ミステリー大賞', "https://honyakumystery.jp/feed", "ja"),
    ('JBBY', "https://www.jbby.org/feed", "ja"),
    ('日本SF作家クラブ', "https://sfwj.jp/feed", "ja"),
    ('日本ペンクラブ', "https://japanpen.or.jp/feed", "ja"),
    ('日本文藝家協会', "https://bungeika.or.jp/feed", "ja"),
    ('CINRA', "https://www.cinra.net/feed", "ja"),
    ('文春オンライン', "https://bunshun.jp/list/feed/rss", "ja"),
    ('現代ビジネス', "https://gendai.media/list/feed/rss", "ja"),
    ('東洋経済オンライン', "https://toyokeizai.net/list/feed/rss", "ja"),
    ('PRESIDENT Online', "https://president.jp/list/rss/", "ja"),
    ('Yahoo!ニュース エンタメ', "https://news.yahoo.co.jp/rss/categories/entertainment.xml", "ja"),
    ('Guardian Books', "https://www.theguardian.com/books/rss", "en"),
    ('NYT Books', "https://rss.nytimes.com/services/xml/rss/nyt/Books.xml", "en"),
    ('NPR Books', "https://feeds.npr.org/1032/rss.xml", "en"),
    ('Paris Review', "https://www.theparisreview.org/blog/feed/", "en"),
    ('Literary Hub', "https://lithub.com/feed/", "en"),
    ('Book Riot', "https://bookriot.com/feed/", "en"),
    ('Electric Literature', "https://electricliterature.com/feed/", "en"),
    ('The Millions', "https://themillions.com/feed", "en"),
    ('Locus Magazine', "https://locusmag.com/feed/", "en"),
    ('Reactor', "https://reactormag.com/feed/", "en"),
    ('Words Without Borders', "https://wordswithoutborders.org/feed/", "en"),
    ('London Review of Books', "https://www.lrb.co.uk/blog/feed", "en"),
    ('The Atlantic Books', "https://www.theatlantic.com/feed/channel/books/", "en"),
    ('LA Times Books', "https://www.latimes.com/entertainment-arts/books/rss2.0.xml", "en"),
    ('Chicago Review of Books', "https://chireviewofbooks.com/feed/", "en"),
    ('Guernica', "https://www.guernicamag.com/feed/", "en"),
    ("Harper's Magazine", "https://harpers.org/feed/", "en"),
    ('3:AM Magazine', "https://www.3ammagazine.com/3am/feed/", "en"),
    ('Arablit', "https://arablit.org/feed/", "en"),
    ('Brittle Paper', "https://brittlepaper.com/feed/", "en"),
    ('BookPage', "https://bookpage.com/feed", "en"),
    ('Book Marks', "https://bookmarks.reviews/feed/", "en"),
    ('CrimeReads', "https://crimereads.com/feed/", "en"),
    ('Longreads', "https://longreads.com/feed/", "en"),
    ('The Baffler', "https://thebaffler.com/feed", "en"),
    ('The Walrus', "https://thewalrus.ca/feed/", "en"),
    ('Clarkesworld', "https://clarkesworldmagazine.com/feed/", "en"),
    ('Strange Horizons', "http://strangehorizons.com/feed/", "en"),
    ('Uncanny Magazine', "https://www.uncannymagazine.com/feed/", "en"),
    ('PEN America', "https://pen.org/feed/", "en"),
    ('Five Books', "https://fivebooks.com/feed/", "en"),
    ('World Literature Today', "https://www.worldliteraturetoday.org/rss.xml", "en"),
    ('Hopscotch Translation', "https://hopscotchtranslation.com/feed/", "en"),
    ('Rain Taxi', "https://raintaxi.com/feed/", "en"),
    ('Reading in Translation', "https://readingintranslation.com/feed/", "en"),
    ('Nobel Prize', "https://www.nobelprize.org/feed/", "en"),
    ('Small Beer Press', "https://smallbeerpress.com/feed/", "en"),
    ('Archipelago Books', "https://archipelagobooks.org/feed/", "en"),
]

UA = {"User-Agent": "Mozilla/5.0 (compatible; LiteratureNewsFetch/1.0)"}


def norm_title(s):
    return re.sub(r"[^\w]", "", (s or "").lower())  # Unicode-aware: keep kana/kanji/hangul so pure-Japanese titles do not all collapse to ""


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
    if raw[:2] == b"\x1f\x8b":
        import gzip
        raw = gzip.decompress(raw)
    root = ET.fromstring(raw.lstrip())
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
    ap = argparse.ArgumentParser(description="Literature News candidate fetcher")
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
