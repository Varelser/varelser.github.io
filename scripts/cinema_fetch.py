#!/usr/bin/env python3
"""Cinema News candidate fetcher (fixed script for the hourly update).

Scope: 46 sources — the Discord Cinema channel's sources that this
fetcher can read (映画.com, シネマトゥデイ, RogerEbert.com, IndieWire)
plus a comprehensive expansion verified by live fetching on
2026-11-12 at the user's request. Japanese: Real Sound 映画部,
FILMAGA, MOVIE Collection, Fan's Voice, CINEMA Life!, CINRA.
Overseas: Variety Film, The Hollywood Reporter (Movies), Deadline
Film, Collider, SlashFilm, The Guardian Film, Film Comment,
The Playlist, FirstShowing.net, JoBlo, Dread Central, Cartoon Brew,
Animation Magazine, Screen Rant, MovieWeb, MUBI Notebook,
Senses of Cinema, Bright Wall/Dark Room, Taste of Cinema,
Far Out Magazine, The Film Stage, Ioncinema, EasternKicks,
Windows on Worlds, Slant Magazine, Next Best Picture, Film Inquiry,
Film Obsessive, In Review Online, POV Magazine, Cinema Escapist,
High on Films, Fangoria, Rue Morgue, No Film School, HeyUGuys.
Probed and NOT adopted (2026-11-12, do not retry): Little White Lies
(403 even with a browser UA; also failing on the Discord side that
day), CinemaCafe.net / クランクイン！ / キネマ旬報WEB / Screen
Online / Empire / BFI / Screen Daily / Film School Rejects /
Fandor (404), Criterion Current / FilmFestivals.com / Cineuropa
(403), The A.V. Club / Slant Film section / Bloody Disgusting /
AwardsWatch / Qetic / Raindance (XML the stdlib parser cannot read),
映画board (spam-polluted feed), SPICE 映画 category feed (returned
exhibition news, not film), BANGER!!! / Japan Times Entertainment /
The Film Magazine / StudioBinder / PremiumBeat (no items within
45 days). General lifestyle feeds that parse but are not film
sources (VOGUE JAPAN, GQ JAPAN, BRUTUS, anan, VOGUE etc.) and
TV-heavy wires (The Wrap, Gold Derby) are out of scope by gate,
not by failure. Parses RSS/Atom with the stdlib only and writes
candidates that are not already in cinema-news-data.json (dedupe
by URL and normalized title; sources are fetched in parallel,
dedupe is applied afterwards in publishedAt order so runs stay
deterministic).

Each candidate: {sourceName, originalTitle, url, publishedAt (ISO UTC),
description (plain text, <=1200 chars), lang, region}.
A failing source is recorded in the summary's `failed` list and never
stops the others.

Usage:
  python3 scripts/cinema_fetch.py --data cinema-news-data.json \
      --out /tmp/cinema_candidates.json [--days 45]
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
    ('映画.com', "http://feeds.eiga.com/eiga_news", "ja"),
    ('シネマトゥデイ', "https://feeds.cinematoday.jp/rss", "ja"),
    ('Real Sound 映画部', "https://realsound.jp/movie/feed", "ja"),
    ('FILMAGA', "https://filmaga.filmarks.com/feed/", "ja"),
    ('MOVIE Collection', "https://www.moviecollection.jp/feed/", "ja"),
    ("Fan's Voice", "https://fansvoice.jp/feed/", "ja"),
    ('CINEMA Life!', "https://www.cinema-life.net/feed/", "ja"),
    ('CINRA', "https://www.cinra.net/feed", "ja"),
    ('RogerEbert.com', "https://www.rogerebert.com/feed", "en"),
    ('IndieWire', "https://www.indiewire.com/feed/", "en"),
    ('Variety Film', "https://variety.com/v/film/feed/", "en"),
    ('The Hollywood Reporter', "https://www.hollywoodreporter.com/c/movies/feed/", "en"),
    ('Deadline Film', "https://deadline.com/v/film/feed/", "en"),
    ('Collider', "https://collider.com/feed/", "en"),
    ('SlashFilm', "https://www.slashfilm.com/feed/", "en"),
    ('The Guardian Film', "https://www.theguardian.com/film/rss", "en"),
    ('Film Comment', "https://www.filmcomment.com/feed/", "en"),
    ('The Playlist', "https://theplaylist.net/feed/", "en"),
    ('FirstShowing.net', "https://www.firstshowing.net/feed/", "en"),
    ('JoBlo', "https://www.joblo.com/feed/", "en"),
    ('Dread Central', "https://www.dreadcentral.com/feed/", "en"),
    ('Cartoon Brew', "https://www.cartoonbrew.com/feed", "en"),
    ('Animation Magazine', "https://www.animationmagazine.net/feed/", "en"),
    ('Screen Rant', "https://screenrant.com/feed/", "en"),
    ('MovieWeb', "https://movieweb.com/feed/", "en"),
    ('MUBI Notebook', "https://mubi.com/notebook/posts.atom", "en"),
    ('Senses of Cinema', "https://www.sensesofcinema.com/feed/", "en"),
    ('Bright Wall/Dark Room', "https://www.brightwalldarkroom.com/feed/", "en"),
    ('Taste of Cinema', "https://www.tasteofcinema.com/feed/", "en"),
    ('Far Out Magazine', "https://faroutmagazine.co.uk/feed/", "en"),
    ('The Film Stage', "https://thefilmstage.com/feed/", "en"),
    ('Ioncinema', "https://www.ioncinema.com/feed", "en"),
    ('EasternKicks', "https://www.easternkicks.com/feed/", "en"),
    ('Windows on Worlds', "https://windowsonworlds.com/feed/", "en"),
    ('Slant Magazine', "https://www.slantmagazine.com/feed/", "en"),
    ('Next Best Picture', "https://www.nextbestpicture.com/feed", "en"),
    ('Film Inquiry', "https://www.filminquiry.com/feed/", "en"),
    ('Film Obsessive', "https://filmobsessive.com/feed/", "en"),
    ('In Review Online', "https://inreviewonline.com/feed/", "en"),
    ('POV Magazine', "https://povmagazine.com/feed/", "en"),
    ('Cinema Escapist', "https://www.cinemaescapist.com/feed/", "en"),
    ('High on Films', "https://www.highonfilms.com/feed/", "en"),
    ('Fangoria', "https://www.fangoria.com/feed/", "en"),
    ('Rue Morgue', "https://rue-morgue.com/feed/", "en"),
    ('No Film School', "https://nofilmschool.com/feed", "en"),
    ('HeyUGuys', "https://www.heyuguys.com/feed/", "en"),
]

UA = {"User-Agent": "Mozilla/5.0 (compatible; CinemaNewsFetch/1.0)"}


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
    ap = argparse.ArgumentParser(description="Cinema News candidate fetcher")
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
