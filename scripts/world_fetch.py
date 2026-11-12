#!/usr/bin/env python3
"""World News candidate fetcher (fixed script for the hourly update).

Scope: 82 sources verified by live fetching on 2026-11-12 at the
user's request for comprehensive coverage of domestic and
international politics, world affairs, war and security, markets
and stocks, and physical AI / robotics (plus general AI).
Japanese (14): Yahoo!\u30cb\u30e5\u30fc\u30b9 (domestic / world /
business / science categories), \u6642\u4e8b\u901a\u4fe1 ranking,
\u6771\u6d0b\u7d4c\u6e08\u30aa\u30f3\u30e9\u30a4\u30f3,
\u73fe\u4ee3\u30d3\u30b8\u30cd\u30b9, PRESIDENT Online,
\u6587\u6625\u30aa\u30f3\u30e9\u30a4\u30f3, Business Insider Japan,
Wedge, \u30cf\u30f3\u30ae\u30ec\u65e5\u672c\u8a9e\u7248,
ITmedia AI+, \u30ae\u30ba\u30e2\u30fc\u30c9\u30fb\u30e3\u30d1\u30f3.
Overseas (68): BBC (World / Politics / Business), Al Jazeera, DW,
France 24, The Guardian (World / Politics / Business), NYT (World /
Politics / Business), CNN World, NPR (World / Politics), Politico,
Foreign Policy, The Diplomat, Nikkei Asia, Euronews, Time,
Japan Times, SCMP (World / China), The Hill, Axios, Washington Post
(World / Politics), Sky News (World / Politics), CBC (World /
Politics), ABC Australia World, Yonhap, Times of Israel,
Atlantic Council, Defense News, Breaking Defense, War on the
Rocks, Defense One, The War Zone, Military Times, Task & Purpose,
Bloomberg Markets, CNBC (Top News / Markets), MarketWatch,
WSJ (Markets / World / US Business), FT, Seeking Alpha,
Investing.com, OilPrice, The Robot Report, IEEE Spectrum Robotics,
Robohub, TechCrunch (AI / Robotics), The Verge AI, Ars Technica AI,
OpenAI News, DeepMind Blog, Hugging Face Blog, Import AI,
Interesting Engineering, MIT News AI, Google AI Blog,
ScienceDaily (AI / Robotics), Unite.AI, Robotics Tomorrow,
Teslarati.
Probed on 2026-11-12 and NOT adopted (do not retry): NHK RSS /
Asahi RSS / Nikkei RSS / Yomiuri RSS (403 or 404 from this
environment), Mainichi RSS / Diamond Online / Robotics 24/7 /
Morningstar JP (malformed XML for the stdlib parser),
Reuters / AP (connection closed), Yahoo Finance (404),
WSJ feeds / CNN World (feeds frozen with 2023-2025 items, 0 within
45 days), Nikkei Asia (feed items carry no date or description),
JBpress / Newsweek Japan / Robot Start / Sankei RSS / AFPBB /
Forbes Japan / HuffPost Japan / Record China (404),
ISW / Arab News / Barron's / Minkabu (403), AI News (not XML),
Phys.org (429), Kyiv Independent (404), Stars and Stripes (404).
Mixed feeds (Yahoo categories, Jiji ranking, Gendai Business,
Bunshun, Time, Axios, Interesting Engineering, Teslarati) are
filtered by the editorial gate in the cron job, not here.
Parses RSS/Atom with the stdlib only and writes candidates that
are not already in world-news-data.json (dedupe by URL and
normalized title; sources are fetched in parallel, dedupe is
applied afterwards in publishedAt order so runs stay
deterministic). Feeds that answer with an unrequested gzip body
are decompressed before parsing.

Each candidate: {sourceName, originalTitle, url, publishedAt (ISO UTC),
description (plain text, <=1200 chars), lang, region}.
A failing source is recorded in the summary's `failed` list and never
stops the others.

Usage:
  python3 scripts/world_fetch.py --data world-news-data.json \
      --out /tmp/world_candidates.json [--days 45]
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
    ('Yahoo!ニュース 国内', "https://news.yahoo.co.jp/rss/categories/domestic.xml", "ja"),
    ('Yahoo!ニュース 国際', "https://news.yahoo.co.jp/rss/categories/world.xml", "ja"),
    ('Yahoo!ニュース 経済', "https://news.yahoo.co.jp/rss/categories/business.xml", "ja"),
    ('Yahoo!ニュース IT・科学', "https://news.yahoo.co.jp/rss/categories/science.xml", "ja"),
    ('時事通信', "https://www.jiji.com/rss/ranking.rdf", "ja"),
    ('東洋経済オンライン', "https://toyokeizai.net/list/feed/rss", "ja"),
    ('現代ビジネス', "https://gendai.media/list/feed/rss", "ja"),
    ('PRESIDENT Online', "https://president.jp/list/rss/", "ja"),
    ('文春オンライン', "https://bunshun.jp/list/feed/rss", "ja"),
    ('Business Insider Japan', "https://www.businessinsider.jp/feed/index.xml", "ja"),
    ('Wedge', "https://wedge.ismedia.jp/list/feed/rss", "ja"),
    ('ハンギョレ日本語版', "https://japan.hani.co.kr/rss/", "ja"),
    ('ITmedia AI+', "https://rss.itmedia.co.jp/rss/2.0/aiplus.xml", "ja"),
    ('ギズモード・ジャパン', "https://www.gizmodo.jp/index.xml", "ja"),
    ('BBC World', "https://feeds.bbci.co.uk/news/world/rss.xml", "en"),
    ('BBC Politics', "https://feeds.bbci.co.uk/news/politics/rss.xml", "en"),
    ('BBC Business', "https://feeds.bbci.co.uk/news/business/rss.xml", "en"),
    ('Al Jazeera', "https://www.aljazeera.com/xml/rss/all.xml", "en"),
    ('DW News', "https://rss.dw.com/rdf/rss-en-all", "en"),
    ('France 24', "https://www.france24.com/en/rss", "en"),
    ('Guardian World', "https://www.theguardian.com/world/rss", "en"),
    ('Guardian Politics', "https://www.theguardian.com/politics/rss", "en"),
    ('Guardian Business', "https://www.theguardian.com/business/rss", "en"),
    ('NYT World', "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", "en"),
    ('NYT Politics', "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml", "en"),
    ('NYT Business', "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", "en"),
    ('NPR World', "https://feeds.npr.org/1004/rss.xml", "en"),
    ('NPR Politics', "https://feeds.npr.org/1014/rss.xml", "en"),
    ('Politico', "https://rss.politico.com/politics-news.xml", "en"),
    ('Foreign Policy', "https://foreignpolicy.com/feed/", "en"),
    ('The Diplomat', "https://thediplomat.com/feed/", "en"),
    ('Euronews', "https://www.euronews.com/rss?format=xml", "en"),
    ('Time', "https://time.com/feed/", "en"),
    ('Japan Times', "https://www.japantimes.co.jp/feed/", "en"),
    ('SCMP World', "https://www.scmp.com/rss/91/feed", "en"),
    ('SCMP China', "https://www.scmp.com/rss/4/feed", "en"),
    ('The Hill', "https://thehill.com/homenews/feed/", "en"),
    ('Axios', "https://www.axios.com/feeds/feed.rss", "en"),
    ('Washington Post World', "https://feeds.washingtonpost.com/rss/world", "en"),
    ('Washington Post Politics', "https://feeds.washingtonpost.com/rss/politics", "en"),
    ('Sky News World', "https://feeds.skynews.com/feeds/rss/world.xml", "en"),
    ('Sky News Politics', "https://feeds.skynews.com/feeds/rss/politics.xml", "en"),
    ('CBC World', "https://www.cbc.ca/webfeed/rss/rss-world", "en"),
    ('CBC Politics', "https://www.cbc.ca/webfeed/rss/rss-politics", "en"),
    ('ABC Australia World', "https://www.abc.net.au/news/feed/51120/rss.xml", "en"),
    ('Yonhap News', "https://en.yna.co.kr/RSS/news.xml", "en"),
    ('Times of Israel', "https://www.timesofisrael.com/feed/", "en"),
    ('Atlantic Council', "https://www.atlanticcouncil.org/feed/", "en"),
    ('Defense News', "https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml", "en"),
    ('Breaking Defense', "https://breakingdefense.com/feed/", "en"),
    ('War on the Rocks', "https://warontherocks.com/feed/", "en"),
    ('Defense One', "https://www.defenseone.com/rss/all/", "en"),
    ('The War Zone', "https://www.twz.com/feed", "en"),
    ('Military Times', "https://www.militarytimes.com/arc/outboundfeeds/rss/?outputType=xml", "en"),
    ('Task & Purpose', "https://taskandpurpose.com/feed/", "en"),
    ('Bloomberg Markets', "https://feeds.bloomberg.com/markets/news.rss", "en"),
    ('CNBC Top News', "https://www.cnbc.com/id/100003114/device/rss/rss.html", "en"),
    ('CNBC Markets', "https://www.cnbc.com/id/15839135/device/rss/rss.html", "en"),
    ('MarketWatch', "https://feeds.content.dowjones.io/public/rss/mw_topstories", "en"),
    ('Financial Times', "https://www.ft.com/rss/home", "en"),
    ('Seeking Alpha', "https://seekingalpha.com/feed.xml", "en"),
    ('Investing.com', "https://www.investing.com/rss/news.rss", "en"),
    ('OilPrice', "https://oilprice.com/rss/main", "en"),
    ('The Robot Report', "https://www.therobotreport.com/feed/", "en"),
    ('IEEE Spectrum Robotics', "https://spectrum.ieee.org/feeds/topic/robotics.rss", "en"),
    ('Robohub', "https://robohub.org/feed/", "en"),
    ('TechCrunch AI', "https://techcrunch.com/category/artificial-intelligence/feed/", "en"),
    ('TechCrunch Robotics', "https://techcrunch.com/tag/robotics/feed/", "en"),
    ('The Verge AI', "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", "en"),
    ('Ars Technica AI', "https://arstechnica.com/ai/feed/", "en"),
    ('OpenAI News', "https://openai.com/news/rss.xml", "en"),
    ('DeepMind Blog', "https://deepmind.google/blog/rss.xml", "en"),
    ('Hugging Face Blog', "https://huggingface.co/blog/feed.xml", "en"),
    ('Import AI', "https://importai.substack.com/feed", "en"),
    ('Interesting Engineering', "https://interestingengineering.com/feed", "en"),
    ('MIT News AI', "https://news.mit.edu/rss/topic/artificial-intelligence2", "en"),
    ('Google AI Blog', "https://blog.google/technology/ai/rss/", "en"),
    ('ScienceDaily AI', "https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml", "en"),
    ('ScienceDaily Robotics', "https://www.sciencedaily.com/rss/matter_energy/robotics.xml", "en"),
    ('Unite.AI', "https://www.unite.ai/feed/", "en"),
    ('Robotics Tomorrow', "https://www.roboticstomorrow.com/rss/news", "en"),
    ('Teslarati', "https://www.teslarati.com/feed/", "en"),
]

UA = {"User-Agent": "Mozilla/5.0 (compatible; WorldNewsFetch/1.0)"}


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
    ap = argparse.ArgumentParser(description="World News candidate fetcher")
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
