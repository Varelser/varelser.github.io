#!/usr/bin/env python3
"""Nurse News fixed pipeline (deterministic half of the hourly update).

Owns everything except candidate fetching and summary writing:
  1. Clean the stock: drop Gemini-fallback stubs, future-dated articles
     (> now + 2 days), URL duplicates, and normalized-title duplicates
     (same story under a different URL; keep the longer summary, then
     the newer article).
  2. Merge new records (from --new FILE, a JSON list of article records
     in the established format; `id`, `publishedDateKey` and
     `publishedMonthKey` are derived when missing). New records are
     validated and deduped against the stock and each other by URL,
     normalized originalTitle, and DOI.
  3. Regenerate nurse-news.html (latest 80) and every monthly archive
     nurse-archive-YYYY-MM.html from nurse-news-data.json, reusing the
     current page as the shell (pager, filters and styles are preserved;
     the pipeline refuses to regenerate if the shell lost its pager or
     archive markers).
  4. Validate: stub strings 0, kana-less titleJa 0, main article count
     and data-id order match the JSON head, archive counts match, and
     main + archives == JSON total. Any failure exits non-zero and
     nothing is written.
  5. Print a JSON summary including `files`: the repo-relative paths
     whose bytes actually changed (the push manifest).

With no removals and no new records the run is a no-op: nothing is
written and `updatedAt` is left untouched, so the output is
byte-identical to the input.

Usage:
  python3 scripts/nurse_pipeline.py --repo DIR [--new new.json]
                                    [--dry-run] [--now ISO8601Z]
Exit codes: 0 ok (changed or not), 2 validation/shell error, 3 bad input.
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
IMPACT_JA = {"low": "低", "medium": "中", "high": "高"}
STUB_MARKERS = ("Gemini 無料枠", "生成要約を安定取得できなかった")
KANA_RE = re.compile(r"[ぁ-んァ-ヶ]")
MAIN_LIMIT = 80
REQUIRED = ("sourceName", "originalTitle", "titleJa", "summaryHtml", "url",
            "publishedAt", "topics", "clinicalAreas", "audiences",
            "evidenceType", "practiceImpact", "actionPoint")


def esc(s):
    return html.escape(str(s), quote=True)


def norm_title(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def doi_of(url):
    m = re.search(r"10\.\d{4,9}/[^\s\"&]+", url or "")
    return m.group(0).rstrip(").,").lower() if m else None


def md5hex(s):
    return hashlib.md5(s.encode("utf-8")).hexdigest()


def parse_iso(s):
    t = s.replace(".000Z", "Z")
    if "." in t and t.endswith("Z"):
        t = t[:t.index(".")] + "Z"
    return datetime.strptime(t, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)


def jst_meta(published_at_iso):
    return parse_iso(published_at_iso).astimezone(JST).strftime("%Y-%m-%d %H:%M")


def article_block(a):
    search_src = a["summaryHtml"].replace("<br><br>", "  ")
    search = " ".join([
        a["titleJa"], search_src, a["sourceName"],
        " ".join(a["topics"]), " ".join(a["clinicalAreas"]),
        " ".join(a["audiences"]), a["evidenceType"], a["actionPoint"],
    ])
    chips = []
    for t in a["topics"]:
        chips.append(f'<span class="chip">トピック: {esc(t)}</span>')
    for t in a["clinicalAreas"]:
        chips.append(f'<span class="chip">領域: {esc(t)}</span>')
    for t in a["audiences"]:
        chips.append(f'<span class="chip">対象: {esc(t)}</span>')
    chips.append(f'<span class="chip">エビデンス: {esc(a["evidenceType"])}</span>')
    chips.append(f'<span class="chip">実務影響度: {IMPACT_JA[a["practiceImpact"]]}</span>')
    return (
        "<article\n"
        f'  data-id="{a["id"]}"\n'
        f'  data-date="{a["publishedDateKey"]}"\n'
        f'  data-month="{a["publishedMonthKey"]}"\n'
        f'  data-topics="{"||".join(a["topics"])}"\n'
        f'  data-clinical-areas="{"||".join(a["clinicalAreas"])}"\n'
        f'  data-audiences="{"||".join(a["audiences"])}"\n'
        f'  data-evidence-type="{esc(a["evidenceType"])}"\n'
        f'  data-practice-impact="{a["practiceImpact"]}"\n'
        f'  data-search="{esc(search)}">\n'
        f'  <p class="meta">{esc(a["sourceName"])}　{jst_meta(a["publishedAt"])}</p>\n'
        f'  <h2 class="article-title">{esc(a["titleJa"])}</h2>\n'
        f'  <div class="taxonomy">{"".join(chips)}</div>\n'
        f'  <div class="summary">{a["summaryHtml"]}</div>\n'
        f'  <div class="action-box"><strong>看護アクション</strong>{esc(a["actionPoint"])}</div>\n'
        '  <div class="source-box">\n'
        '    <strong>ソース・引用元</strong>\n'
        f'    配信元：{esc(a["sourceName"])}<br>\n'
        f'    原文URL：<a href="{esc(a["url"])}" target="_blank" rel="noopener">{esc(a["url"])}</a>\n'
        '  </div>\n'
        '</article>'
    )


def clean_stock(articles, now):
    """Return (kept, removed) applying the cron's cleaning rules."""
    removed = []
    kept = []
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
    # URL duplicates: keep first occurrence (stock is date-desc sorted).
    seen_url = set()
    tmp = []
    for a in kept:
        if a["url"] in seen_url:
            removed.append((a, "dup-url"))
            continue
        seen_url.add(a["url"])
        tmp.append(a)
    kept = tmp
    # Normalized-title duplicates: keep longer summary, then newer.
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
    """Validate and normalize one new record; raise ValueError on problems."""
    for k in REQUIRED:
        if not rec.get(k):
            raise ValueError(f"missing field {k}: {rec.get('url')}")
    if not KANA_RE.search(rec["titleJa"]):
        raise ValueError(f"titleJa has no kana: {rec['url']}")
    if rec["practiceImpact"] not in IMPACT_JA:
        raise ValueError(f"bad practiceImpact: {rec['url']}")
    pub = parse_iso(rec["publishedAt"])  # raises on bad format
    if pub > now + timedelta(days=2):
        raise ValueError(f"publishedAt too far in future: {rec['url']}")
    if any(m in rec["summaryHtml"] for m in STUB_MARKERS):
        raise ValueError(f"summaryHtml contains stub marker: {rec['url']}")
    out = dict(rec)
    out.setdefault("id", md5hex(rec["url"]))
    if out["id"] != md5hex(rec["url"]):
        raise ValueError(f"id is not md5(url): {rec['url']}")
    out["publishedDateKey"] = pub.strftime("%Y-%m-%d")
    out["publishedMonthKey"] = pub.strftime("%Y-%m")
    # Match the stored records' alphabetical key order.
    return {k: out[k] for k in sorted(out)}


def jp_month(mk):
    y, m = mk.split("-")
    return f"{y}年{int(m)}月"


ARCH_RE = re.compile(
    r"    <!-- NURSE_ARCHIVE_LINKS_START -->.*?    <!-- NURSE_ARCHIVE_LINKS_END -->",
    re.S)


def regenerate(main_shell, articles):
    """Return {filename: content} for main + archives. Raises on bad shell."""
    if 'id="pageSize"' not in main_shell or 'id="pageInfo"' not in main_shell:
        raise ValueError("shell lost its pager (pageSize/pageInfo missing)")
    if "position: sticky" in main_shell:
        raise ValueError("shell has position: sticky (must stay removed)")
    if not ARCH_RE.search(main_shell):
        raise ValueError("shell lost NURSE_ARCHIVE_LINKS markers")
    top = articles[:MAIN_LIMIT]
    blocks = "\n".join(article_block(a) for a in top)
    start = main_shell.index("<article")
    end = main_shell.rindex("</article>") + len("</article>")
    main = main_shell[:start] + blocks + main_shell[end:]
    main = re.sub(r"全\d+件", f"全{len(top)}件", main, count=1)

    overflow = articles[MAIN_LIMIT:]
    months = OrderedDict()
    for a in overflow:
        months.setdefault(a["publishedMonthKey"], []).append(a)
    if months:
        items = "\n".join(
            f'        <li><a href="nurse-archive-{mk}.html">{jp_month(mk)}（{len(v)}件）</a></li>'
            for mk, v in sorted(months.items(), reverse=True))
    else:
        items = "        <li>まだありません</li>"
    arch_section = (
        "    <!-- NURSE_ARCHIVE_LINKS_START -->\n"
        "    <section class=\"archive-links\">\n"
        "      <h2>過去のアーカイブ（月別）</h2>\n"
        '      <ul class="archive-list">\n'
        f"{items}\n"
        "      </ul>\n"
        "    </section>\n"
        "    <!-- NURSE_ARCHIVE_LINKS_END -->"
    )
    m = ARCH_RE.search(main)
    main = main[:m.start()] + arch_section + main[m.end():]

    out = {"nurse-news.html": main}
    arch2 = (
        "    <!-- NURSE_ARCHIVE_LINKS_START -->\n"
        "    <section class=\"archive-links\">\n"
        "      <h2>過去のアーカイブ（月別）</h2>\n"
        '      <p>アーカイブ一覧は<a href="nurse-news.html">本体ページ</a>にあります。</p>\n'
        "    </section>\n"
        "    <!-- NURSE_ARCHIVE_LINKS_END -->"
    )
    for mk in sorted(months):
        recs = months[mk]
        shell = main
        y, mo = mk.split("-")
        shell = shell.replace(
            "<title>Nursing News | VARELSER</title>",
            f"<title>Nurse News アーカイブ {y}年{int(mo)}月 | VARELSER</title>", 1)
        shell = re.sub(r"全\d+件", f"全{len(recs)}件", shell, count=1)
        blocks_m = "\n".join(article_block(a) for a in recs)
        s = shell.index("<article")
        e = shell.rindex("</article>") + len("</article>")
        shell = shell[:s] + blocks_m + shell[e:]
        m2 = ARCH_RE.search(shell)
        shell = shell[:m2.start()] + arch2 + shell[m2.end():]
        out[f"nurse-archive-{mk}.html"] = shell
    return out, months


def validate(files, articles):
    """Raise ValueError listing every consistency problem found."""
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
        for marker in STUB_MARKERS:
            if marker in content:
                problems.append(f"stub marker in {name}: {marker}")
    if files["nurse-news.html"].count("<article") != min(MAIN_LIMIT, len(articles)):
        problems.append("main article count mismatch")
    ids_in_main = re.findall(r'data-id="([0-9a-f]+)"', files["nurse-news.html"])
    if ids_in_main != [a["id"] for a in articles[:MAIN_LIMIT]]:
        problems.append("main data-id order does not match JSON head")
    if total_html != len(articles):
        problems.append(
            f"main+archives {total_html} != JSON total {len(articles)}")
    if 'href="/hp/"' in files["nurse-news.html"] or 'href="/"' not in files["nurse-news.html"]:
        problems.append("home link is not '/' in main page")
    if problems:
        raise ValueError("; ".join(problems))


def run(repo, new_path=None, dry_run=False, now=None):
    import os
    now = now or datetime.now(timezone.utc)
    def read(name):
        with open(os.path.join(repo, name), encoding="utf-8") as f:
            return f.read()
    def read_bytes(name):
        with open(os.path.join(repo, name), "rb") as f:
            return f.read()

    data_raw = read_bytes("nurse-news-data.json")
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
        existing_dois = {doi_of(a["url"]) for a in kept} - {None}
        for rec in new_records:
            rec = validate_new(rec, now)
            if rec["url"] in existing_urls:
                continue
            if norm_title(rec.get("originalTitle")) in existing_titles:
                continue
            d = doi_of(rec["url"])
            if d and d in existing_dois:
                continue
            kept.append(rec)
            added.append(rec)
            existing_urls.add(rec["url"])
            existing_titles.add(norm_title(rec.get("originalTitle")))
            if d:
                existing_dois.add(d)

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

    main_shell = read("nurse-news.html")
    files, months = regenerate(main_shell, kept)
    validate(files, kept)
    summary["archive_counts"] = {k: len(v) for k, v in months.items()}

    targets = {"nurse-news-data.json": new_json}
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
    ap = argparse.ArgumentParser(description="Nurse News fixed pipeline")
    ap.add_argument("--repo", required=True)
    ap.add_argument("--new", default=None)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--now", default=None, help="ISO8601 UTC, for tests")
    args = ap.parse_args(argv)
    now = parse_iso(args.now) if args.now else None
    try:
        summary = run(args.repo, args.new, args.dry_run, now)
    except (ValueError, KeyError, json.JSONDecodeError) as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 2
    print(json.dumps(summary, ensure_ascii=False, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
