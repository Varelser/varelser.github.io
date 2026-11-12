#!/usr/bin/env python3
"""Fixed pipeline for the Research Digest pages (arxiv.html) of varelser.github.io.

This script is the canonical, deterministic half of the hourly update.
The selecting/summarizing (LLM) half stays with the calling agent; everything
mechanical lives here so it is written once, tested, and reused:

  - safe DATA load/splice for the HTML pages (see load_data_html: the
    raw_decode end offset is RELATIVE to the DATA value start; the 2026-11-12
    corruption came from treating it as absolute and layering old DATA tails
    after the new JSON, which silently broke the pages' JavaScript)
  - deterministic cleaning of existing stock (future > +2d, '未定' titles,
    Gemini fallback notices)
  - dedupe of new records against main + all archives (normalized URL / DOI /
    normalized title)
  - merge, timestamp-desc sort, main keeps the newest 80, overflow moves to
    monthly archives (created from the main shell when a month is new)
  - archive-links line rebuild inside the ARCHIVE_LINKS markers
  - RSS feed regeneration (arxiv-feed.xml: latest 50 across the whole
    stock, main + archives, on every update run)
  - slim search index regeneration (arxiv-search-index.json: the whole
    stock with ~200-char excerpts, for arxiv-search.html) and latest-5
    regeneration (arxiv-latest.json, for the index.html section); both
    are deterministic and join changed_files only when their bytes differ
  - full validation (the cron job's step-8 checks + structural checks:
    DATA must be followed by ';', page <script> must pass `node --check`
    when node is available, main DATA must equal arxiv-data.json,
    archive link counts must match the archive files)

Usage:
  python3 scripts/arxiv_pipeline.py update --dir <repo_dir> --new new_records.json [--now 2026-11-12T03:23:00Z] [--dry-run]
  python3 scripts/arxiv_pipeline.py validate --dir <repo_dir>
  python3 scripts/arxiv_pipeline.py dump-urls --dir <repo_dir>

new_records.json: a JSON list of records in the arxiv-data.json schema
(source/title/titleJa/summaryHtml/url/publishedAt/authors/categories/field/
genre; timestamp and monthKey are derived from publishedAt when omitted).

Exit codes: 0 ok, 2 pipeline error (nothing written on update errors),
1 validation failure (validate command, or update's final validation).
Reports are printed to stdout as JSON.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import shutil
import subprocess
import sys
import tempfile
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from email.utils import format_datetime
from pathlib import Path

MAIN_KEEP = 80
FEED_LIMIT = 50
FEED_NAME = "arxiv-feed.xml"
SEARCH_INDEX_NAME = "arxiv-search-index.json"
LATEST_NAME = "arxiv-latest.json"
LATEST_LIMIT = 5
EXCERPT_CHARS = 200
SUMMARY_MIN, SUMMARY_MAX = 450, 900
JA_RE = re.compile(r"[\u3040-\u30ff\u4e00-\u9fff]")
DOI_RE = re.compile(r"10\.\d{4,9}/\S+")
STUB_RE = re.compile(r"本論文は、.*を扱います")
ARCHIVE_RE = re.compile(r"^arxiv-archive-(\d{4}-\d{2})\.html$")


class PipelineError(Exception):
    pass


# ---------------------------------------------------------------- DATA splice

def load_data_html(text: str, name: str = "<page>"):
    """Return (start, end_abs, obj) for the page's `const DATA = {...};`.

    `end_abs` is the ABSOLUTE index just past the JSON value. Raises
    PipelineError when the JSON is not immediately followed by ';'
    (the signature of the overlapping-tail corruption)."""
    marker = "const DATA = "
    i = text.find(marker)
    if i < 0:
        raise PipelineError(f"{name}: 'const DATA' not found")
    start = i + len(marker)
    try:
        obj, rel_end = json.JSONDecoder().raw_decode(text[start:])
    except json.JSONDecodeError as e:
        raise PipelineError(f"{name}: DATA JSON does not parse: {e}")
    end_abs = start + rel_end
    if end_abs >= len(text) or text[end_abs] != ";":
        got = text[end_abs:end_abs + 30]
        raise PipelineError(
            f"{name}: DATA JSON is not followed by ';' (found {got!r}); "
            "the file carries a corrupted tail - repair before updating")
    return start, end_abs, obj


def splice_data(text: str, obj, name: str = "<page>") -> str:
    start, end_abs, _ = load_data_html(text, name)
    new_json = json.dumps(obj, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    return text[:start] + new_json + text[end_abs:]


def script_syntax_ok(text: str, name: str) -> str:
    """Return 'ok', 'failed: ...' or 'skipped (no node)'."""
    node = shutil.which("node")
    if not node:
        return "skipped (no node)"
    m = re.search(r"<script>(.*?)</script>", text, re.S)
    if not m:
        return f"failed: no <script> block in {name}"
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(m.group(1))
        path = f.name
    try:
        r = subprocess.run([node, "--check", path], capture_output=True, text=True, timeout=60)
        if r.returncode != 0:
            return f"failed: {name}: {(r.stderr or '').strip().splitlines()[-1][:200]}"
        return "ok"
    finally:
        Path(path).unlink(missing_ok=True)


# ------------------------------------------------------------------- helpers

def norm_url(u: str) -> str:
    u = (u or "").strip().lower()
    u = re.sub(r"^http://", "https://", u)
    u = u.rstrip("/")
    u = re.sub(r"v\d+$", "", u)  # arXiv version suffix, after slash strip
    return u.rstrip("/")


def doi_of(u: str):
    m = DOI_RE.search((u or "").lower())
    return m.group(0).rstrip("/") if m else None


def norm_title(t: str) -> str:
    return re.sub(r"\s+", " ", (t or "").strip().lower())


def text_len(html: str) -> int:
    return len(re.sub(r"<[^>]+>", "", html or ""))


def plain_text(html_str: str) -> str:
    return re.sub(r"<[^>]+>", "", (html_str or "").replace("<br><br>", " "))


def parse_iso(s: str) -> datetime:
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


# ------------------------------------------------------------------ RSS feed

def build_feed(articles, updated_at_iso: str) -> str:
    """RSS 2.0 feed of the newest FEED_LIMIT articles (caller sorts desc)."""
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
        " <title>Research Digest（研究論文ダイジェスト）</title>\n"
        " <link>https://varelser.github.io/arxiv.html</link>\n"
        " <description>arXiv・Crossref・PubMed など複数の学術ソースから集めた研究論文を、"
        "日本語要約・ジャンル分類付きで届ける Research Digest の新着フィード</description>\n"
        " <language>ja</language>\n"
        f" <lastBuildDate>{format_datetime(parse_iso(updated_at_iso))}</lastBuildDate>\n"
        + "\n".join(items) +
        "\n</channel>\n</rss>\n"
    )


# ------------------------------------------------- search index / latest-5

def build_search_index(pairs) -> str:
    """Slim full-stock index for arxiv-search.html.

    `pairs` is a list of (article, page) tuples, newest first; `page` is
    '本体' for the main list or the archive filename. Deterministic (no
    timestamps embedded), so a no-change rerun reproduces identical bytes."""
    out = []
    for a, page in pairs:
        excerpt = re.sub(r"\s+", " ", plain_text(a.get("summaryHtml", ""))).strip()
        out.append({
            "title": a.get("title", ""),
            "titleJa": a.get("titleJa", ""),
            "url": a.get("url", ""),
            "publishedAt": a.get("publishedAt", ""),
            "source": a.get("source", ""),
            "genre": a.get("genre", ""),
            "field": a.get("field", ""),
            "page": page,
            "excerpt": excerpt[:EXCERPT_CHARS],
        })
    return json.dumps(out, ensure_ascii=False, indent=2, sort_keys=True) + "\n"


def build_latest(pairs) -> str:
    """Latest LATEST_LIMIT articles for the index.html section."""
    out = [{
        "title": a.get("title", ""),
        "titleJa": a.get("titleJa", ""),
        "url": a.get("url", ""),
        "publishedAt": a.get("publishedAt", ""),
        "source": a.get("source", ""),
    } for a, _ in pairs[:LATEST_LIMIT]]
    return json.dumps(out, ensure_ascii=False, indent=2, sort_keys=True) + "\n"


def ts_ms(iso: str) -> int:
    return int(datetime.fromisoformat(iso.replace("Z", "+00:00")).timestamp() * 1000)


def now_iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def archive_files(repo: Path):
    out = {}
    for p in sorted(repo.glob("arxiv-archive-*.html")):
        m = ARCHIVE_RE.match(p.name)
        if m:
            out[m.group(1)] = p
    return out


def load_state(repo: Path):
    """Load main list (arxiv-data.json is the source of truth) + archive objs."""
    data_path = repo / "arxiv-data.json"
    try:
        main = json.loads(data_path.read_text(encoding="utf-8"))
    except Exception as e:
        raise PipelineError(f"arxiv-data.json does not parse: {e}")
    if not isinstance(main, list):
        raise PipelineError("arxiv-data.json must be a bare list of records")
    archives = {}   # monthKey -> {"path": Path, "obj": {...}, "text": str}
    for mk, path in archive_files(repo).items():
        text = path.read_text(encoding="utf-8")
        _, _, obj = load_data_html(text, path.name)
        archives[mk] = {"path": path, "obj": obj, "text": text}
    main_text = (repo / "arxiv.html").read_text(encoding="utf-8")
    _, _, main_obj = load_data_html(main_text, "arxiv.html")
    if main_obj.get("articles") != main:
        raise PipelineError("arxiv.html DATA.articles != arxiv-data.json; reconcile before updating")
    return main, archives, main_text


def clean_existing(articles, limit: datetime):
    """Deterministic cleaning (cron step 2, removal part). Returns (kept, removed)."""
    kept, removed = [], []
    for a in articles:
        title = (a.get("title") or "") + (a.get("titleJa") or "")
        summary = a.get("summaryHtml") or ""
        ts = datetime.fromtimestamp(a["timestamp"] / 1000, timezone.utc)
        if ts > limit:
            removed.append({"title": a.get("title", ""), "reason": "future"})
        elif "未定" in title:
            removed.append({"title": a.get("title", ""), "reason": "mitei"})
        elif "Gemini 無料枠" in summary:
            removed.append({"title": a.get("title", ""), "reason": "gemini-notice"})
        else:
            kept.append(a)
    return kept, removed


def check_new_record(a, idx: int):
    errs = []
    for f in ("source", "title", "titleJa", "summaryHtml", "url", "publishedAt"):
        if not a.get(f):
            errs.append(f"new[{idx}]: empty {f}")
    if not a.get("authors"):
        errs.append(f"new[{idx}]: empty authors")
    if a.get("titleJa") and not JA_RE.search(a["titleJa"]):
        errs.append(f"new[{idx}]: titleJa has no Japanese")
    if a.get("summaryHtml"):
        n = text_len(a["summaryHtml"])
        if not (SUMMARY_MIN <= n <= SUMMARY_MAX):
            errs.append(f"new[{idx}]: summary text length {n} outside {SUMMARY_MIN}-{SUMMARY_MAX}")
    return errs


def normalize_new(a):
    a = dict(a)
    if not a.get("timestamp"):
        a["timestamp"] = ts_ms(a["publishedAt"])
    if not a.get("monthKey"):
        a["monthKey"] = a["publishedAt"][:7]
    a.setdefault("categories", [])
    a.setdefault("field", "")
    a.setdefault("genre", "")
    return a


def create_archive_shell(main_text: str, mk: str) -> str:
    """Build a new monthly archive page from the main page shell (cron step 6)."""
    y, m = int(mk[:4]), int(mk[5:7])
    t = main_text
    t, n = re.subn(r"<title>[^<]*</title>", f"<title>Research Digest アーカイブ {y}年{m}月 | VARELSER</title>", t, count=1)
    assert n == 1
    t, n = re.subn(r'<a href="/" class="back">← ホームに戻る</a>',
                   '<a href="arxiv.html" class="back">← Research Digest に戻る</a>', t, count=1)
    assert n == 1
    t, n = re.subn(r"<h1>[^<]*</h1>", f"<h1>Research Digest アーカイブ {y}年{m}月</h1>", t, count=1)
    assert n == 1
    t, n = re.subn(r"<!-- ARCHIVE_LINKS_START -->.*?<!-- ARCHIVE_LINKS_END -->",
                   '<p class="desc">アーカイブ一覧は本体ページにあります。 <a href="arxiv.html">Research Digest に戻る</a></p>',
                   t, count=1, flags=re.S)
    assert n == 1
    return t


def rebuild_archive_links(main_text: str, counts: dict) -> str:
    links = "".join(
        f'<a href="arxiv-archive-{mk}.html">{int(mk[:4])}年{int(mk[5:7])}月（{n}件）</a>'
        for mk, n in sorted(counts.items(), reverse=True)
    )
    i = main_text.find("<!-- ARCHIVE_LINKS_START -->")
    j = main_text.find("<!-- ARCHIVE_LINKS_END -->")
    if i < 0 or j < 0:
        raise PipelineError("arxiv.html: ARCHIVE_LINKS markers not found")
    region = main_text[i:j]
    new_region, n = re.subn(r'<p class="desc">アーカイブ:.*?</p>',
                            f'<p class="desc">アーカイブ: {links}</p>', region, count=1, flags=re.S)
    if n != 1:
        raise PipelineError("arxiv.html: archive-links paragraph not found inside markers")
    return main_text[:i] + new_region + main_text[j:]


# ------------------------------------------------------------------ validate

def validate_state(main, archives: dict, main_text: str, now: datetime):
    """Cron step-8 article checks + structural checks. Returns (checks, errors)."""
    limit = now + timedelta(days=2)
    errors = []
    checks = {"future": 0, "mitei": 0, "gemini": 0, "no_ja_title": 0,
              "eng_summary": 0, "stub": 0, "empty_fields": 0}
    all_arts = [("arxiv.html", a) for a in main]
    for mk, st in archives.items():
        all_arts += [(st["path"].name, a) for a in st["obj"]["articles"]]
    seen_url = {}
    for fname, a in all_arts:
        if datetime.fromtimestamp(a["timestamp"] / 1000, timezone.utc) > limit:
            checks["future"] += 1
        if "未定" in (a.get("title") or "") or "未定" in (a.get("titleJa") or ""):
            checks["mitei"] += 1
        if "Gemini 無料枠" in (a.get("summaryHtml") or ""):
            checks["gemini"] += 1
        if not JA_RE.search(a.get("titleJa") or ""):
            checks["no_ja_title"] += 1
        txt = re.sub(r"<[^>]+>", "", a.get("summaryHtml") or "")
        letters = [c for c in txt if c.isalpha()]
        if letters and sum(1 for c in letters if ord(c) < 128) / len(letters) > 0.7:
            checks["eng_summary"] += 1
        if STUB_RE.match(txt) or "利用時は原文抄録と本文を確認し" in txt:
            checks["stub"] += 1
        for f in ("source", "title", "url", "authors"):
            if not a.get(f):
                checks["empty_fields"] += 1
        nu = norm_url(a.get("url"))
        if nu in seen_url:
            errors.append(f"duplicate url across pages: {a.get('url')} in {fname} and {seen_url[nu]}")
        seen_url[nu] = fname
    for k, v in checks.items():
        if v:
            errors.append(f"check {k}: {v} (must be 0)")
    # structural: citation box + syntax + link counts
    pages = [("arxiv.html", main_text)] + [(st["path"].name, st["text"]) for st in archives.values()]
    for fname, text in pages:
        if "配信元：" not in text or "原文URL：" not in text:
            errors.append(f"{fname}: citation box labels missing")
        s = script_syntax_ok(text, fname)
        if s.startswith("failed"):
            errors.append(f"{fname}: script syntax {s}")
    counts = {mk: len(st["obj"]["articles"]) for mk, st in archives.items()}
    for mk, n in counts.items():
        if f"arxiv-archive-{mk}.html" not in main_text or f"（{n}件）" not in main_text:
            errors.append(f"archive link count mismatch for {mk} (expected {n}件 in arxiv.html)")
    return checks, errors


# -------------------------------------------------------------------- update

def cmd_update(args) -> int:
    repo = Path(args.dir)
    now = (datetime.fromisoformat(args.now.replace("Z", "+00:00")) if args.now
           else datetime.now(timezone.utc))
    main, archives, main_text = load_state(repo)
    limit = now + timedelta(days=2)

    # cleaning applies to the main stock; archives keep their history except
    # the same deterministic removals.
    removed = []
    main, r = clean_existing(main, limit)
    removed += r
    for st in archives.values():
        st["obj"]["articles"], r = clean_existing(st["obj"]["articles"], limit)
        removed += r

    new_raw = json.loads(Path(args.new).read_text(encoding="utf-8")) if args.new else []
    if not isinstance(new_raw, list):
        raise PipelineError("--new file must contain a JSON list of records")
    errors = []
    for i, a in enumerate(new_raw):
        errors += check_new_record(a, i)
    if errors:
        raise PipelineError("new records invalid: " + "; ".join(errors))
    new = [normalize_new(a) for a in new_raw]

    # dedupe new vs everything (and within new)
    all_arts = list(main)
    for st in archives.values():
        all_arts += st["obj"]["articles"]
    exist_urls = {norm_url(a.get("url")) for a in all_arts}
    exist_dois = {doi_of(a.get("url")) for a in all_arts if doi_of(a.get("url"))}
    exist_titles = {norm_title(a.get("title")) for a in all_arts}
    for a in new:
        if norm_url(a["url"]) in exist_urls:
            raise PipelineError(f"duplicate url: {a['url']}")
        d = doi_of(a["url"])
        if d and d in exist_dois:
            raise PipelineError(f"duplicate doi: {d}")
        if norm_title(a["title"]) in exist_titles:
            raise PipelineError(f"duplicate title: {a['title']}")
        exist_urls.add(norm_url(a["url"]))
        exist_titles.add(norm_title(a["title"]))
        if d:
            exist_dois.add(d)

    merged = sorted(main + new, key=lambda a: a["timestamp"], reverse=True)
    keep, overflow = merged[:MAIN_KEEP], merged[MAIN_KEEP:]
    ov_by_month = defaultdict(list)
    for a in overflow:
        ov_by_month[a["monthKey"]].append(a)

    changed = []
    stamp = now_iso(now)
    for mk, arts in sorted(ov_by_month.items()):
        if mk not in archives:
            path = repo / f"arxiv-archive-{mk}.html"
            shell = create_archive_shell(main_text, mk)
            obj = {"articles": [], "updatedAt": stamp, "version": 1}
            shell = splice_data(shell, obj, path.name)
            archives[mk] = {"path": path, "obj": obj, "text": shell}
        st = archives[mk]
        urls = {norm_url(a.get("url")) for a in st["obj"]["articles"]}
        add = [a for a in arts if norm_url(a.get("url")) not in urls]
        st["obj"]["articles"] = sorted(st["obj"]["articles"] + add,
                                       key=lambda a: a["timestamp"], reverse=True)
        st["obj"]["updatedAt"] = stamp
        st["text"] = splice_data(st["text"], st["obj"], st["path"].name)
        changed.append(st["path"].name)

    counts = {mk: len(st["obj"]["articles"]) for mk, st in archives.items()}
    main_text = splice_data(main_text, {"articles": keep, "updatedAt": stamp, "version": 1}, "arxiv.html")
    main_text = rebuild_archive_links(main_text, counts)

    # validate the RESULT in memory before writing anything
    arch_state = {mk: {"path": st["path"], "obj": st["obj"],
                       "text": st["text"]} for mk, st in archives.items()}
    checks, verrors = validate_state(keep, arch_state, main_text, now)
    if verrors:
        raise PipelineError("post-merge validation failed: " + "; ".join(verrors))

    # Generated files: rebuild from the whole post-merge stock (main +
    # archives), newest first. Each joins changed_files only when its
    # bytes differ from what is on disk.
    pairs = [(a, "本体") for a in keep]
    for mk in sorted(archives):
        st = archives[mk]
        pairs += [(a, st["path"].name) for a in st["obj"]["articles"]]
    pairs.sort(key=lambda p: p[0]["timestamp"], reverse=True)
    stock = [a for a, _ in pairs]
    generated = {
        FEED_NAME: build_feed(stock, stamp),
        SEARCH_INDEX_NAME: build_search_index(pairs),
        LATEST_NAME: build_latest(pairs),
    }
    gen_changed = []
    for name, content in generated.items():
        p = repo / name
        if not p.exists() or p.read_text(encoding="utf-8") != content:
            gen_changed.append(name)

    report = {
        "added": [a["title"] for a in new],
        "removed_cleaning": removed,
        "overflow": {mk: len(v) for mk, v in ov_by_month.items()},
        "archive_counts": counts,
        "main_total": len(keep),
        "total_articles": len(keep) + sum(counts.values()),
        "checks": checks,
        "changed_files": ["arxiv.html", "arxiv-data.json"] + changed + gen_changed,
        "dry_run": bool(args.dry_run),
    }
    if not args.dry_run:
        (repo / "arxiv-data.json").write_text(
            json.dumps(keep, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        (repo / "arxiv.html").write_text(main_text, encoding="utf-8")
        for name in gen_changed:
            (repo / name).write_text(generated[name], encoding="utf-8")
        for name in changed:
            st = archives[name[len("arxiv-archive-"):-len(".html")]]
            st["path"].write_text(st["text"], encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=1))
    return 0


def cmd_validate(args) -> int:
    repo = Path(args.dir)
    now = datetime.now(timezone.utc)
    main, archives, main_text = load_state(repo)
    checks, errors = validate_state(main, archives, main_text, now)
    counts = {mk: len(st["obj"]["articles"]) for mk, st in archives.items()}
    report = {"checks": checks, "errors": errors,
              "main_total": len(main), "archive_counts": counts,
              "total_articles": len(main) + sum(counts.values())}
    print(json.dumps(report, ensure_ascii=False, indent=1))
    return 1 if errors else 0


def cmd_dump_urls(args) -> int:
    repo = Path(args.dir)
    main, archives, _ = load_state(repo)
    out = [{"url": a.get("url"), "doi": doi_of(a.get("url")), "title": a.get("title")} for a in main]
    for st in archives.values():
        out += [{"url": a.get("url"), "doi": doi_of(a.get("url")), "title": a.get("title")}
                for a in st["obj"]["articles"]]
    print(json.dumps(out, ensure_ascii=False))
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    u = sub.add_parser("update")
    u.add_argument("--dir", required=True)
    u.add_argument("--new", help="JSON file with new records (list); omit for cleaning-only")
    u.add_argument("--now", help="override current time (ISO, for tests)")
    u.add_argument("--dry-run", action="store_true")
    u.set_defaults(fn=cmd_update)
    v = sub.add_parser("validate")
    v.add_argument("--dir", required=True)
    v.set_defaults(fn=cmd_validate)
    d = sub.add_parser("dump-urls")
    d.add_argument("--dir", required=True)
    d.set_defaults(fn=cmd_dump_urls)
    args = ap.parse_args()
    try:
        return args.fn(args)
    except PipelineError as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False), file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
