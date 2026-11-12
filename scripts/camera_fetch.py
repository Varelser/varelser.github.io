#!/usr/bin/env python3
"""Camera News candidate fetcher (fixed script for the hourly update).

Scope: 45 sources — the Discord creative-news cameras category's 28
sources (verified 2026-11-08) plus 17 sources verified by live
fetching on 2026-11-12 at the user's request for broader coverage
(new products and release info, camera news in Japan and overseas,
events, used-market and film-camera topics, and photographer
exhibitions). Japanese: デジカメWatch, CAPA CAMERA WEB,
ニコンイメージングジャパン, Shuffle（玄光社）, フォトコン, studio9,
IMA ONLINE, PRONEWS. Overseas: Canon Rumors, Nikon Rumors,
Sony Alpha Rumors, Fuji Rumors, Photo Rumors, 43 Rumors,
Leica Rumors, Pentax Rumors, Mirrorless Rumors, Sony Addict,
Fuji Addict, Canon Watch, Camera Jabber, Nikon Global News,
DPReview, PetaPixel, Fstoppers, Digital Camera World,
Amateur Photographer, Imaging Resource, DIY Photography,
The Phoblographer, SLR Lounge, Adorama Learning Center,
Lensrentals Blog, Cameralabs, Photography Life, Optical Limits,
CineD, NewsShooter, Kosmo Foto, 35mmc, Magnum Photos, Aperture,
British Journal of Photography, Feature Shoot, Flickr Blog.
Notes: Mirrorless Rumors' feed has whitespace before the XML
declaration, so the raw bytes are lstripped before parsing.
IMA ONLINE, Nikon Global News and フォトコン items often carry no
description; the editorial gate excludes description-less
candidates. Probed on 2026-11-12 and NOT adopted (do not retry):
Japan Camera Hunter (520), Casual Photophile / Inside Imaging /
Photography News UK / Alex Luyckx (connection closed),
LensCulture (403), Park Cameras Blog (403), LFI Blog (403),
D-CLIC (403), デジカメinfo / LensTip / Shutterbug /
Australian Photography / Sans Mirror / Thom Hogan / ZSystemUser /
Hasselblad / Lomography Magazine / Analog Cafe (404),
ProPhoto Mag AU (malformed XML), DPReview reviews feed (403).
Excluded by scope, not failure: DxOMark (smartphone-test heavy),
EOSHD (1 item, hack content), Film Advance and Down the Road
(personal blogs), EMULSIVE / Rangefinder / Photo District News
(no items within 45 days on probe day; EMULSIVE was also empty in
an earlier check pattern — treat as unadopted). Sources already
known unusable from the 2026-11-08 research are not retried either
(KEH Blog / MPB / MapCamera 403, B&H Explora connection closed,
Photography Blog / ePHOTOzine 404, and the other entries in
cameras_sources_research.md). Parses RSS/Atom with the stdlib only
and writes candidates that are not already in
camera-news-data.json (dedupe by URL and normalized title; sources
are fetched in parallel, dedupe is applied afterwards in
publishedAt order so runs stay deterministic).

Each candidate: {sourceName, originalTitle, url, publishedAt (ISO UTC),
description (plain text, <=1200 chars), lang, region}.
A failing source is recorded in the summary's `failed` list and never
stops the others.

Usage:
  python3 scripts/camera_fetch.py --data camera-news-data.json \
      --out /tmp/camera_candidates.json [--days 45]
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
    ('デジカメWatch', "https://dc.watch.impress.co.jp/data/rss/1.0/dcw/feed.rdf", "ja"),
    ('CAPA CAMERA WEB', "https://getnavi.jp/capa/feed/", "ja"),
    ('ニコンイメージングジャパン', "https://nij.nikon.com/news/rss/rss2.rss", "ja"),
    ('Shuffle（玄光社）', "https://shuffle.genkosha.com/feed/", "ja"),
    ('フォトコン', "https://www.photo-con.com/feed/", "ja"),
    ('studio9', "https://photo-studio9.com/feed/", "ja"),
    ('IMA ONLINE', "https://imaonline.jp/feed/", "ja"),
    ('PRONEWS', "https://jp.pronews.com/feed", "ja"),
    ('Canon Rumors', "https://www.canonrumors.com/feed/", "en"),
    ('Nikon Rumors', "https://nikonrumors.com/feed/", "en"),
    ('Sony Alpha Rumors', "https://www.sonyalpharumors.com/feed/", "en"),
    ('Fuji Rumors', "https://www.fujirumors.com/feed/", "en"),
    ('Photo Rumors', "https://photorumors.com/feed/", "en"),
    ('43 Rumors', "https://www.43rumors.com/feed/", "en"),
    ('Leica Rumors', "https://leicarumors.com/feed/", "en"),
    ('Pentax Rumors', "https://pentaxrumors.com/feed/", "en"),
    ('Mirrorless Rumors', "https://www.mirrorlessrumors.com/feed/", "en"),
    ('Sony Addict', "https://sonyaddict.com/feed/", "en"),
    ('Fuji Addict', "https://fujiaddict.com/feed/", "en"),
    ('Canon Watch', "https://www.canonwatch.com/feed/", "en"),
    ('Camera Jabber', "https://camerajabber.com/feed/", "en"),
    ('Nikon Global News', "https://www.nikon.com/company/rss/feeds/news.rss", "en"),
    ('DPReview', "https://www.dpreview.com/feeds/news.xml", "en"),
    ('PetaPixel', "https://petapixel.com/feed/", "en"),
    ('Fstoppers', "https://fstoppers.com/feed", "en"),
    ('Digital Camera World', "https://www.digitalcameraworld.com/feeds/all", "en"),
    ('Amateur Photographer', "https://amateurphotographer.com/feed/", "en"),
    ('Imaging Resource', "https://www.imaging-resource.com/feed", "en"),
    ('DIY Photography', "https://www.diyphotography.net/feed/", "en"),
    ('The Phoblographer', "https://www.thephoblographer.com/feed/", "en"),
    ('SLR Lounge', "https://www.slrlounge.com/feed/", "en"),
    ('Adorama Learning Center', "https://www.adorama.com/alc/feed/", "en"),
    ('Lensrentals Blog', "https://www.lensrentals.com/blog/feed/", "en"),
    ('Cameralabs', "https://www.cameralabs.com/feed/", "en"),
    ('Photography Life', "https://photographylife.com/feed", "en"),
    ('Optical Limits', "https://www.opticallimits.com/feed/", "en"),
    ('CineD', "https://www.cined.com/feed/", "en"),
    ('NewsShooter', "https://www.newsshooter.com/feed/", "en"),
    ('Kosmo Foto', "https://kosmofoto.com/feed/", "en"),
    ('35mmc', "https://www.35mmc.com/feed/", "en"),
    ('Magnum Photos', "https://www.magnumphotos.com/feed/", "en"),
    ('Aperture', "https://aperture.org/feed/", "en"),
    ('British Journal of Photography', "https://www.1854.photography/feed/", "en"),
    ('Feature Shoot', "https://www.featureshoot.com/feed/", "en"),
    ('Flickr Blog', "https://blog.flickr.net/feed/", "en"),
]

UA = {"User-Agent": "Mozilla/5.0 (compatible; CameraNewsFetch/1.0)"}


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
    ap = argparse.ArgumentParser(description="Camera News candidate fetcher")
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
