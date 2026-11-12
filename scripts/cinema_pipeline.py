#!/usr/bin/env python3
"""Cinema News fixed pipeline (deterministic half of the hourly update).

Owns everything except candidate fetching and summary writing:
  1. Clean the stock: drop fallback stubs, future-dated articles
     (> now + 2 days), URL duplicates, and normalized-title duplicates
     (same story under a different URL; keep the longer summary, then
     the newer article).
  2. Merge new records (from --new FILE, a JSON list in the established
     format; `id`, `publishedDateKey` and `publishedMonthKey` are
     derived when missing), deduped against the stock and each other
     by URL and normalized original title.
  3. Regenerate cinema-news.html (latest 80) and every monthly archive
     cinema-archive-YYYY-MM.html from cinema-news-data.json, reusing the
     current page as the shell. The pipeline refuses to regenerate if
     the shell lost its pager, article markers, archive markers, or
     summary folding.
  4. Regenerate cinema-feed.xml (RSS 2.0, latest 50) and the sharded
     search index (cinema-search-index.json + cinema-search-YYYY-MM.json).
  5. Validate everything; any failure exits non-zero, nothing written.
  6. Print a JSON summary including `files`: repo-relative paths whose
     bytes actually changed (the push manifest).

With no removals and no new records the run is a no-op: nothing is
written and `updatedAt` stays untouched (byte-identical output).

Usage:
  python3 scripts/cinema_pipeline.py --repo DIR [--new new.json]
                                    [--drop urls.json] [--dry-run]
                                    [--now ISO8601Z]
Exit codes: 0 ok, 2 validation/shell error, 3 bad input.
Stdlib only.
"""
import argparse
import hashlib
import html
import json
import re
import sys
from collections import OrderedDict
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

JST = ZoneInfo("Asia/Tokyo")
STUB_MARKERS = ("Gemini 無料枠", "生成要約を安定取得できなかった")
KANA_RE = re.compile(r"[ぁ-んァ-ヶ]")
MAIN_LIMIT = 80
FEED_LIMIT = 50
MAIN_TITLE = "Cinema News（映画ニュース）| VARELSER"
REQUIRED = ("sourceName", "originalTitle", "titleJa", "summaryHtml", "url",
            "publishedAt", "categories", "region", "kind")


def esc(s):
    return html.escape(str(s), quote=True)


def norm_title(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def md5hex(s):
    return hashlib.md5(s.encode("utf-8")).hexdigest()


def parse_iso(s):
    t = s.replace(".000Z", "Z")
    if "." in t and t.endswith("Z"):
        t = t[:t.index(".")] + "Z"
    return datetime.strptime(t, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)


def jst_meta(published_at_iso):
    return parse_iso(published_at_iso).astimezone(JST).strftime("%Y-%m-%d %H:%M")


def plain_text(html_str):
    return re.sub(r"<[^>]+>", "", (html_str or "").replace("<br><br>", " "))


def article_block(a):
    search = " ".join([
        a["titleJa"], a["originalTitle"], plain_text(a["summaryHtml"]),
        a["sourceName"], " ".join(a["categories"]), a["region"], a["kind"],
    ])
    chips = [f'<span class="chip">カテゴリ: {esc(g)}</span>' for g in a["categories"]]
    chips.append(f'<span class="chip">地域: {esc(a["region"])}</span>')
    chips.append(f'<span class="chip">種別: {esc(a["kind"])}</span>')
    paras = a["summaryHtml"].split("<br><br>")
    if len(paras) >= 2:
        summary_div = (
            f'  <div class="summary">{paras[0]}'
            f'<span class="summary-rest" hidden><br><br>{"<br><br>".join(paras[1:])}</span></div>\n'
            '  <button type="button" class="summary-toggle" aria-expanded="false">続きを読む</button>\n'
        )
    else:
        summary_div = f'  <div class="summary">{a["summaryHtml"]}</div>\n'
    return (
        "<article\n"
        f'  data-id="{a["id"]}"\n'
        f'  data-date="{a["publishedDateKey"]}"\n'
        f'  data-month="{a["publishedMonthKey"]}"\n'
        f'  data-categories="{"||".join(a["categories"])}"\n'
        f'  data-region="{esc(a["region"])}"\n'
        f'  data-source="{esc(a["sourceName"])}"\n'
        f'  data-kind="{esc(a["kind"])}"\n'
        f'  data-search="{esc(search)}">\n'
        f'  <p class="meta">{esc(a["sourceName"])}　{jst_meta(a["publishedAt"])}</p>\n'
        f'  <h2 class="article-title">{esc(a["titleJa"])}</h2>\n'
        f'  <div class="taxonomy">{"".join(chips)}</div>\n'
        f'{summary_div}'
        '  <div class="source-box">\n'
        '    <strong>ソース・引用元</strong>\n'
        f'    配信元：{esc(a["sourceName"])}<br>\n'
        f'    原題：{esc(a["originalTitle"])}<br>\n'
        f'    原文URL：<a href="{esc(a["url"])}" target="_blank" rel="noopener">{esc(a["url"])}</a>\n'
        '  </div>\n'
        '</article>'
    )


def clean_stock(articles, now):
    removed, kept = [], []
    future_limit = now + timedelta(days=2)
    for a in articles:
        blob = json.dumps(a, ensure_ascii=False)
        if any(m in blob for m in STUB_MARKERS):
            removed.append((a, "stub"))
            continue
        try:
            pub = parse_iso(a["publishedAt"])
        except Exception:
            removed.append((a, "bad-date"))
            continue
        if pub > future_limit:
            removed.append((a, "future"))
            continue
        kept.append(a)
    seen_url, tmp = set(), []
    for a in kept:
        if a["url"] in seen_url:
            removed.append((a, "dup-url"))
            continue
        seen_url.add(a["url"])
        tmp.append(a)
    kept = tmp
    by_title = {}
    for a in kept:
        k = norm_title(a.get("originalTitle"))
        if not k:
            continue
        cur = by_title.get(k)
        if cur is None:
            by_title[k] = a
            continue
        def rank(x):
            return (len(x.get("summaryHtml", "")), x["publishedAt"])
        winner = a if rank(a) > rank(cur) else cur
        loser = cur if winner is a else a
        by_title[k] = winner
        removed.append((loser, "dup-title"))
    if any(r[1] == "dup-title" for r in removed):
        losers = {id(r[0]) for r in removed if r[1] == "dup-title"}
        kept = [a for a in kept if id(a) not in losers]
    return kept, removed


def validate_new(rec, now):
    for k in REQUIRED:
        if not rec.get(k):
            raise ValueError(f"missing field {k}: {rec.get('url')}")
    if not KANA_RE.search(rec["titleJa"]):
        raise ValueError(f"titleJa has no kana: {rec['url']}")
    if not isinstance(rec["categories"], list) or not rec["categories"]:
        raise ValueError(f"categories must be a non-empty list: {rec['url']}")
    if len(plain_text(rec["summaryHtml"])) < 100:
        raise ValueError(f"summary too short (<100 chars): {rec['url']}")
    if any(m in rec["summaryHtml"] for m in STUB_MARKERS):
        raise ValueError(f"summaryHtml contains stub marker: {rec['url']}")
    pub = parse_iso(rec["publishedAt"])
    if pub > now + timedelta(days=2):
        raise ValueError(f"publishedAt too far in future: {rec['url']}")
    out = dict(rec)
    out.setdefault("id", md5hex(rec["url"]))
    if out["id"] != md5hex(rec["url"]):
        raise ValueError(f"id is not md5(url): {rec['url']}")
    out["publishedDateKey"] = pub.strftime("%Y-%m-%d")
    out["publishedMonthKey"] = pub.strftime("%Y-%m")
    return {k: out[k] for k in sorted(out)}


def jp_month(mk):
    y, m = mk.split("-")
    return f"{y}年{int(m)}月"


ART_RE = re.compile(
    r"<!-- ARTICLES_START -->.*?<!-- ARTICLES_END -->", re.S)
ARCH_RE = re.compile(
    r"    <!-- CINEMA_ARCHIVE_LINKS_START -->.*?    <!-- CINEMA_ARCHIVE_LINKS_END -->",
    re.S)


def replace_options(page, select_id, values):
    pat = re.compile(
        r'(<select id="' + select_id + r'">).*?(</select>)', re.S)
    opts = '<option value="">すべて</option>' + "".join(
        f'<option value="{esc(v)}">{esc(v)}</option>' for v in values)
    return pat.sub(lambda m: m.group(1) + opts + m.group(2), page, count=1)


def refresh_filters(page, articles):
    months = sorted({a["publishedMonthKey"] for a in articles}, reverse=True)
    categories = sorted({g for a in articles for g in a["categories"]})
    sources = sorted({a["sourceName"] for a in articles})
    kinds = sorted({a["kind"] for a in articles})
    page = replace_options(page, "monthFilter",
                           [f"{m}" for m in months])
    # Month option labels stay as YYYY-MM (matches nurse behaviour).
    page = replace_options(page, "categoryFilter", categories)
    page = replace_options(page, "sourceFilter", sources)
    page = replace_options(page, "kindFilter", kinds)
    return page


def regenerate(main_shell, articles):
    if 'id="pageSize"' not in main_shell or 'id="pageInfo"' not in main_shell:
        raise ValueError("shell lost its pager (pageSize/pageInfo missing)")
    if "summaryToggle" not in main_shell:
        raise ValueError("shell lost summary folding (summaryToggle missing)")
    if "position: sticky" in main_shell:
        raise ValueError("shell has position: sticky (must stay removed)")
    if not ARCH_RE.search(main_shell):
        raise ValueError("shell lost CINEMA_ARCHIVE_LINKS markers")
    if not ART_RE.search(main_shell):
        raise ValueError("shell lost ARTICLES markers")

    def fill(shell, recs, total_label):
        blocks = "\n".join(article_block(a) for a in recs)
        body = f"<!-- ARTICLES_START -->\n{blocks}\n<!-- ARTICLES_END -->"
        shell = ART_RE.sub(lambda _: body, shell, count=1)
        shell = re.sub(r"全\d+件", f"全{total_label}件", shell, count=1)
        return shell

    top = articles[:MAIN_LIMIT]
    main = fill(main_shell, top, len(top))
    overflow = articles[MAIN_LIMIT:]
    months = OrderedDict()
    for a in overflow:
        months.setdefault(a["publishedMonthKey"], []).append(a)
    if months:
        items = "\n".join(
            f'        <li><a href="cinema-archive-{mk}.html">{jp_month(mk)}（{len(v)}件）</a></li>'
            for mk, v in sorted(months.items(), reverse=True))
    else:
        items = "        <li>まだありません</li>"
    arch_section = (
        "    <!-- CINEMA_ARCHIVE_LINKS_START -->\n"
        "    <section class=\"archive-links\">\n"
        "      <h2>過去のアーカイブ（月別）</h2>\n"
        '      <ul class="archive-list">\n'
        f"{items}\n"
        "      </ul>\n"
        "    </section>\n"
        "    <!-- CINEMA_ARCHIVE_LINKS_END -->"
    )
    m = ARCH_RE.search(main)
    main = main[:m.start()] + arch_section + main[m.end():]
    main = refresh_filters(main, articles)

    out = {"cinema-news.html": main}
    arch2 = (
        "    <!-- CINEMA_ARCHIVE_LINKS_START -->\n"
        "    <section class=\"archive-links\">\n"
        "      <h2>過去のアーカイブ（月別）</h2>\n"
        '      <p>アーカイブ一覧は<a href="cinema-news.html">本体ページ</a>にあります。</p>\n'
        "    </section>\n"
        "    <!-- CINEMA_ARCHIVE_LINKS_END -->"
    )
    for mk in sorted(months):
        recs = months[mk]
        shell = main
        y, mo = mk.split("-")
        shell = shell.replace(
            f"<title>{MAIN_TITLE}</title>",
            f"<title>Cinema News アーカイブ {y}年{int(mo)}月 | VARELSER</title>", 1)
        shell = fill(shell, recs, len(recs))
        m2 = ARCH_RE.search(shell)
        shell = shell[:m2.start()] + arch2 + shell[m2.end():]
        out[f"cinema-archive-{mk}.html"] = shell
    return out, months


def validate(files, articles):
    problems = []
    blob = json.dumps(articles, ensure_ascii=False)
    for marker in STUB_MARKERS:
        if marker in blob:
            problems.append(f"stub marker in data: {marker}")
    for a in articles:
        if not KANA_RE.search(a.get("titleJa", "")):
            problems.append(f"kana-less titleJa: {a.get('url')}")
    total_html = 0
    for name, content in files.items():
        n = content.count("<article")
        total_html += n
        if 'id="pageSize"' not in content:
            problems.append(f"pager missing: {name}")
        if "position: sticky" in content:
            problems.append(f"sticky present: {name}")
    if files["cinema-news.html"].count("<article") != min(MAIN_LIMIT, len(articles)):
        problems.append("main article count mismatch")
    ids_in_main = re.findall(r'data-id="([0-9a-f]+)"', files["cinema-news.html"])
    if ids_in_main != [a["id"] for a in articles[:MAIN_LIMIT]]:
        problems.append("main data-id order does not match JSON head")
    if total_html != len(articles):
        problems.append(
            f"main+archives {total_html} != JSON total {len(articles)}")
    if 'href="/"' not in files["cinema-news.html"]:
        problems.append("home link is not '/' in main page")
    if problems:
        raise ValueError("; ".join(problems))


def build_feed(articles, updated_at_iso):
    from email.utils import format_datetime
    def xesc(s):
        return html.escape(str(s), quote=False)
    items = []
    for a in articles[:FEED_LIMIT]:
        pub = format_datetime(parse_iso(a["publishedAt"]))
        items.append(
            "  <item>\n"
            f"   <title>{xesc(a['titleJa'])}</title>\n"
            f"   <link>{xesc(a['url'])}</link>\n"
            f"   <guid isPermaLink=\"true\">{xesc(a['url'])}</guid>\n"
            f"   <pubDate>{pub}</pubDate>\n"
            f"   <description>{xesc(plain_text(a['summaryHtml'])[:600])}</description>\n"
            "  </item>")
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0">\n<channel>\n'
        " <title>Cinema News（映画ニュース）</title>\n"
        " <link>https://varelser.github.io/cinema-news.html</link>\n"
        " <description>国内外の映画ニュースを日本語要約で届ける Cinema News の新着フィード</description>\n"
        " <language>ja</language>\n"
        f" <lastBuildDate>{format_datetime(parse_iso(updated_at_iso))}</lastBuildDate>\n"
        + "\n".join(items) +
        "\n</channel>\n</rss>\n"
    )


def build_search_index(articles, updated_at_iso):
    months = OrderedDict()
    for a in articles:
        months.setdefault(a["publishedMonthKey"], []).append({
            "t": a["titleJa"],
            "o": a["originalTitle"],
            "u": a["url"],
            "d": a["publishedDateKey"],
            "s": a["sourceName"],
            "b": plain_text(a["summaryHtml"]),
            "g": " ".join(a["categories"] + [a["kind"], a["region"]]),
        })
    out = {}
    manifest_months = []
    for mk in sorted(months, reverse=True):
        fname = f"cinema-search-{mk}.json"
        out[fname] = json.dumps(
            {"month": mk, "articles": months[mk]},
            ensure_ascii=False, separators=(",", ":"))
        manifest_months.append(
            {"key": mk, "file": fname, "count": len(months[mk])})
    out["cinema-search-index.json"] = json.dumps(
        {"updatedAt": updated_at_iso, "total": len(articles),
         "months": manifest_months},
        ensure_ascii=False, separators=(",", ":"))
    return out


def run(repo, new_path=None, dry_run=False, now=None, drop_path=None):
    import os
    now = now or datetime.now(timezone.utc)
    def read(name):
        with open(os.path.join(repo, name), encoding="utf-8") as f:
            return f.read()
    def read_bytes(name):
        with open(os.path.join(repo, name), "rb") as f:
            return f.read()

    data_raw = read_bytes("cinema-news-data.json")
    data = json.loads(data_raw.decode("utf-8"))
    articles = data["articles"]
    kept, removed = clean_stock(articles, now)

    added = []
    if new_path:
        with open(new_path, encoding="utf-8") as f:
            new_records = json.load(f)
        if not isinstance(new_records, list):
            raise ValueError("--new file must contain a JSON list")
        existing_urls = {a["url"] for a in kept}
        existing_titles = {norm_title(a.get("originalTitle")) for a in kept}
        for rec in new_records:
            rec = validate_new(rec, now)
            if rec["url"] in existing_urls:
                continue
            if norm_title(rec.get("originalTitle")) in existing_titles:
                continue
            kept.append(rec)
            added.append(rec)
            existing_urls.add(rec["url"])
            existing_titles.add(norm_title(rec.get("originalTitle")))

    if drop_path:
        with open(drop_path, encoding="utf-8") as f:
            drop_urls = set(json.load(f))
        dropped = [a for a in kept if a["url"] in drop_urls]
        kept = [a for a in kept if a["url"] not in drop_urls]
        removed.extend((a, "editorial") for a in dropped)
        missing = drop_urls - {a["url"] for a in dropped}
        if missing:
            raise ValueError(f"--drop URLs not in stock: {sorted(missing)[:3]}")

    kept.sort(key=lambda a: a["publishedAt"], reverse=True)

    summary = {
        "changed": False,
        "added": [a["titleJa"] for a in added],
        "removed": [{"title": a["titleJa"], "reason": r} for a, r in removed],
        "total": len(kept),
        "files": [],
    }
    if not removed and not added:
        return summary

    data["articles"] = kept
    data["updatedAt"] = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    new_json = json.dumps(data, ensure_ascii=False, indent=1)

    main_shell = read("cinema-news.html")
    files, months = regenerate(main_shell, kept)
    validate(files, kept)
    summary["archive_counts"] = {k: len(v) for k, v in months.items()}

    targets = {"cinema-news-data.json": new_json,
               "cinema-feed.xml": build_feed(kept, data["updatedAt"])}
    targets.update(build_search_index(kept, data["updatedAt"]))
    targets.update(files)
    changed = []
    for name, content in sorted(targets.items()):
        path = os.path.join(repo, name)
        old = None
        if os.path.exists(path):
            with open(path, "rb") as f:
                old = f.read()
        if old != content.encode("utf-8"):
            changed.append(name)
            if not dry_run:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
    summary["changed"] = bool(changed)
    summary["files"] = changed
    summary["dry_run"] = dry_run
    return summary


def main(argv=None):
    ap = argparse.ArgumentParser(description="Cinema News fixed pipeline")
    ap.add_argument("--repo", required=True)
    ap.add_argument("--new", default=None)
    ap.add_argument("--drop", default=None)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--now", default=None, help="ISO8601 UTC, for tests")
    args = ap.parse_args(argv)
    now = parse_iso(args.now) if args.now else None
    try:
        summary = run(args.repo, args.new, args.dry_run, now,
                      drop_path=args.drop)
    except (ValueError, KeyError, json.JSONDecodeError) as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 2
    print(json.dumps(summary, ensure_ascii=False, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
