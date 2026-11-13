#!/usr/bin/env python3
"""Art News candidate fetcher (fixed script for the hourly update).

Scope: 49 sources verified by live fetching on 2026-11-13, when the
Art field was added at the user's request (base pattern: Nurse News,
the original of this series; same rules as Cinema / Camera / Music /
Instruments / World / Literature). Coverage is deliberately broad:
Japanese art media and exhibition portals, overseas art media and
criticism, museum and museum-industry sources, the art market, and
media-art sources.
Japanese: ART iT, artscape, IMA ONLINE, Casa BRUTUS,
National Museum of Art, Osaka (国立国際美術館; short descriptions,
the editorial gate still applies).
Overseas art media / criticism: Artnet News, ARTnews, Art in America,
Artforum, Hyperallergic, The Art Newspaper, Colossal, Artsy,
The Guardian Art and Design, NYT Art and Design, Ocula Magazine,
ArtAsiaPacific, FAD Magazine, Elephant Magazine, Berlin Art Link,
Art Plugged, DailyArt Magazine, Momus, Art Africa Magazine,
The Flux Review, Two Coats of Paint, Something Curated,
Sugarcane Magazine, Mousse Magazine, Flash Art, Hypebeast Art.
Museums / museum industry: Guggenheim, LACMA Unframed, V&A Blog,
Blooloop, MuseumNext, AAM (American Alliance of Museums).
Market: MutualArt (plus Artnet / Artsy above).
Design / craft / media art: Designboom Art, Dezeen Art, IGNANT,
Creative Boom, My Modern Met, Booooooom, Ars Electronica Blog.
Photography: Aperture, British Journal of Photography (plus
IMA ONLINE above).
Japan in English: Spoon & Tamago and SHIFT (region is set to 国内
for these two).
Notes: IMA ONLINE items often carry no description; the editorial
gate excludes description-less candidates. Artsy's feed carries
very long descriptions; they are truncated to 1200 chars like every
other source. NYT Arts (general performing-arts wire) was verified
but not adopted in favour of the focused NYT Art and Design feed.
Probed on 2026-11-13 and NOT adopted (do not retry): 美術手帖 /
Tokyo Art Beat / 美術展ナビ / ネットTAM / 森美術館 / 東京都現代美術館 /
NTT ICC / YCAM / 文化庁メディア芸術祭 (no RSS endpoint found: 404),
Frieze / MoMA Magazine / Aesthetica Magazine / AXIS / Art Institute
of Chicago (403), The Met / Brooklyn Museum Blog (429),
Apollo Magazine / Walker Art Center (500), British Museum Blog /
美術館ナビ / インターネットミュージアム / Widewalls / Rhizome /
Tokyo Art Navigation (connection closed), Getty Iris / Art Guide
Australia / Qetic (XML the stdlib parser cannot read), Art Review /
ArtDaily / e-flux / Tate / SFMOMA (404 on every probed feed path).
Wave-2 probe (2026-11-13, same day) also NOT adopted: Brooklyn
Rail / Art Radar / Monopol / Spike / Wellcome Collection /
Whitney / New Museum / National Gallery London / Rijksmuseum /
M+ / MMCA Korea / teamLab / Gagosian / Pace / David Zwirner /
Sotheby's / Dazed / Art Basel / Barbican / ICA London / Garage /
Palais de Tokyo / MAAT / 森美術館 / ポーラ美術館 / 21_21 DESIGN
SIGHT / 瀬戸内国際芸術祭 (404), Contemporary Lynx / LensCulture /
Smarthistory / NGA Washington / 東京国立近代美術館 (403), Foam /
Hauser & Wirth / Artprice (429), Christie's (timeout), 原美術館
(connection closed), あいちトリエンナーレ (malformed XML),
兵庫県立美術館 (503), Serpentine / Whitechapel / アーティゾン
美術館 / 横浜美術館 / 越後妻有 (feed parses, 0 items), NGV
Melbourne (45-day rule, latest item 2026-06).
Excluded by the 45-day rule (feed parses but no items within
45 days on probe day): Juxtapoz, Smithsonian Magazine general feed
(stale since 2019), Art Annual Online, Creative Applications
Network, We Make Money Not Art, Art Observed, Culture Type,
Kooness, Bijutsu Shuppan (美術出版社). Excluded by scope, not
failure: ICOM and Museums Association (feed parses, 0 items),
Metropolis Japan and Nippon.com (general Japan/life feeds; art
items are picked up through the art-specific sources above),
CINRA (general culture feed already feeding Cinema News).
Japanese national museums (国立美術館ほか) publish no usable RSS as
of the probe; domestic exhibition coverage comes from artscape
(a museum/exhibition portal) and ART iT instead.
Parses RSS/Atom with the stdlib only and writes candidates that are
not already in art-news-data.json (dedupe by URL and normalized
title; sources are fetched in parallel, dedupe is applied
afterwards in publishedAt order so runs stay deterministic).

Each candidate: {sourceName, originalTitle, url, publishedAt (ISO UTC),
description (plain text, <=1200 chars), lang, region}.
A failing source is recorded in the summary's `failed` list and never
stops the others.

Usage:
  python3 scripts/art_fetch.py --data art-news-data.json \
      --out /tmp/art_candidates.json [--days 45]
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

# (name, feed url, lang, region override or None)
SOURCES = [
    ('ART iT', "https://www.art-it.asia/feed", "ja", None),
    ('artscape', "https://artscape.jp/feed/", "ja", None),
    ('IMA ONLINE', "https://imaonline.jp/feed/", "ja", None),
    ('Artnet News', "https://news.artnet.com/feed", "en", None),
    ('ARTnews', "https://www.artnews.com/feed/", "en", None),
    ('Art in America', "https://www.artnews.com/art-in-america/feed/", "en", None),
    ('Artforum', "https://www.artforum.com/feed/", "en", None),
    ('Hyperallergic', "https://hyperallergic.com/feed/", "en", None),
    ('The Art Newspaper', "https://www.theartnewspaper.com/rss.xml", "en", None),
    ('Colossal', "https://www.thisiscolossal.com/feed/", "en", None),
    ('Artsy', "https://www.artsy.net/rss/news", "en", None),
    ('The Guardian Art and Design', "https://www.theguardian.com/artanddesign/rss", "en", None),
    ('NYT Art and Design', "https://rss.nytimes.com/services/xml/rss/nyt/ArtandDesign.xml", "en", None),
    ('Ocula Magazine', "https://ocula.com/magazine/feed/", "en", None),
    ('ArtAsiaPacific', "https://artasiapacific.com/feed", "en", None),
    ('FAD Magazine', "https://fadmagazine.com/feed/", "en", None),
    ('Elephant Magazine', "https://elephant.art/feed/", "en", None),
    ('Berlin Art Link', "https://www.berlinartlink.com/feed/", "en", None),
    ('Art Plugged', "https://artplugged.co.uk/feed/", "en", None),
    ('DailyArt Magazine', "https://www.dailyartmagazine.com/feed/", "en", None),
    ('Momus', "https://momus.ca/feed/", "en", None),
    ('Art Africa Magazine', "https://artafricamagazine.org/feed/", "en", None),
    ('The Flux Review', "https://www.thefluxreview.com/feed/", "en", None),
    ('Two Coats of Paint', "https://twocoatsofpaint.com/feed/", "en", None),
    ('Something Curated', "https://somethingcurated.com/feed/", "en", None),
    ('Sugarcane Magazine', "https://sugarcanemag.com/feed/", "en", None),
    ('Guggenheim', "https://www.guggenheim.org/feed", "en", None),
    ('LACMA Unframed', "https://unframed.lacma.org/feed/", "en", None),
    ('V&A Blog', "https://www.vam.ac.uk/blog/feed", "en", None),
    ('Blooloop', "https://blooloop.com/feed/", "en", None),
    ('MuseumNext', "https://www.museumnext.com/feed/", "en", None),
    ('AAM (American Alliance of Museums)', "https://www.aam-us.org/feed/", "en", None),
    ('MutualArt', "https://www.mutualart.com/rss", "en", None),
    ('Designboom Art', "https://www.designboom.com/art/feed/", "en", None),
    ('Dezeen Art', "https://www.dezeen.com/tag/art/feed/", "en", None),
    ('IGNANT', "https://www.ignant.com/feed/", "en", None),
    ('Creative Boom', "https://www.creativeboom.com/feed/", "en", None),
    ('My Modern Met', "https://mymodernmet.com/feed/", "en", None),
    ('Booooooom', "https://www.booooooom.com/feed/", "en", None),
    ('Ars Electronica Blog', "https://ars.electronica.art/aeblog/en/feed/", "en", None),
    ('Spoon & Tamago', "https://spoon-tamago.com/feed/", "en", "国内"),
    ('Casa BRUTUS', "https://casabrutus.com/feed", "ja", None),
    ('National Museum of Art, Osaka', "https://www.nmao.go.jp/feed/", "ja", None),
    ('Mousse Magazine', "https://www.moussemagazine.it/feed/", "en", None),
    ('Flash Art', "https://flash---art.it/feed/", "en", None),
    ('Hypebeast Art', "https://hypebeast.com/art/feed", "en", None),
    ('Aperture', "https://aperture.org/feed/", "en", None),
    ('British Journal of Photography', "https://www.1854.photography/feed/", "en", None),
    ('SHIFT', "http://www.shift.jp.org/en/feed/", "en", "国内"),
]

UA = {"User-Agent": "Mozilla/5.0 (compatible; ArtNewsFetch/1.0)"}


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


def fetch_candidates(name, url, lang, region_override, cutoff):
    """Fetch one source's raw candidates (no dedupe; main applies it)."""
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        raw = r.read()
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
            "region": region_override or ("国内" if lang == "ja" else "海外"),
        })
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(description="Art News candidate fetcher")
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
        futures = {name: ex.submit(fetch_candidates, name, url, lang,
                                   region_override, cutoff)
                   for name, url, lang, region_override in SOURCES}
        for name, url, lang, region_override in SOURCES:
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
