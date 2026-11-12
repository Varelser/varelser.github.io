#!/usr/bin/env python3
"""Tests for scripts/arxiv_pipeline.py (stdlib only).

Run from the repo root:  python3 tests/arxiv_pipeline.test.py
Every check() call actually invokes its condition function; a check whose
condition raises or returns falsy is a failure and makes the exit code 1.
"""
import hashlib
import json
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PIPELINE = ROOT / "scripts" / "arxiv_pipeline.py"
NOW = "2026-11-12T03:23:00Z"
NOW_DT = datetime(2026, 11, 12, 3, 23, tzinfo=timezone.utc)

SHELL = """<!doctype html>
<html lang="ja">
<head><meta charset="utf-8"><title>Research Digest | VARELSER</title></head>
<body>
  <div class="container">
    <a href="/" class="back">← ホームに戻る</a>
    <h1>最新の研究論文ダイジェスト</h1>
    <!-- ARCHIVE_LINKS_START -->
    <p class="desc">アーカイブ: {links}</p>
    <!-- ARCHIVE_LINKS_END -->
    <div class="list" id="list"></div>
  </div>
  <script>
    const DATA = {data};
    const byId = id => document.getElementById(id);
    function render(){{ return "配信元：" + "原文URL："; }}
    render();
  </script>
</body>
</html>
"""

PASSED, FAILED = [], []


def check(name, fn):
    try:
        ok = bool(fn())
    except Exception as e:  # noqa: BLE001
        ok = False
        print(f"FAIL (exception) - {name}: {e}")
    (PASSED if ok else FAILED).append(name)
    if ok:
        print(f"ok - {name}")


def article(i, iso, *, title=None, url=None, summary=None):
    ts = int(datetime.fromisoformat(iso.replace("Z", "+00:00")).timestamp() * 1000)
    body = summary if summary is not None else (
        "これはテスト用の日本語要約である。研究の背景と方法と結果を簡潔に述べる。" * 13)
    return {
        "authors": ["著者 太郎"],
        "categories": ["cs.AI"],
        "field": "cs.AI",
        "genre": "LLM / NLP",
        "monthKey": iso[:7],
        "publishedAt": iso,
        "source": "arXiv cs.AI",
        "summaryHtml": body,
        "timestamp": ts,
        "title": title or f"Test Paper {i}",
        "titleJa": f"テスト論文{i}――日本語タイトル",
        "url": url or f"https://arxiv.org/abs/2611.{10000 + i}",
    }


def data_obj(articles, updated=NOW):
    return {"articles": articles, "updatedAt": updated, "version": 1}


def dumps(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def write_page(path, obj, links=""):
    path.write_text(SHELL.format(data=dumps(obj), links=links), encoding="utf-8")


def make_repo(tmp, main_articles, archives=None):
    repo = Path(tmp)
    archives = archives or {}
    links = "".join(
        f'<a href="arxiv-archive-{mk}.html">{int(mk[:4])}年{int(mk[5:7])}月（{len(a)}件）</a>'
        for mk, a in sorted(archives.items(), reverse=True))
    write_page(repo / "arxiv.html", data_obj(main_articles), links)
    (repo / "arxiv-data.json").write_text(
        json.dumps(main_articles, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    for mk, arts in archives.items():
        write_page(repo / f"arxiv-archive-{mk}.html", data_obj(arts))
    return repo


def run(repo, *argv):
    return subprocess.run([sys.executable, str(PIPELINE), *argv],
                          capture_output=True, text=True)


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def main():
    # 1. round-trip: update with no new records keeps every article and,
    #    with a canonical fixture and fixed --now, leaves files byte-identical.
    with tempfile.TemporaryDirectory() as tmp:
        main_arts = [article(i, f"2026-11-{10 - i:02d}T00:00:00Z") for i in range(3)]
        arch = {"2026-10": [article(50, "2026-10-05T00:00:00Z"), article(51, "2026-10-04T00:00:00Z")]}
        repo = make_repo(tmp, main_arts, arch)
        before = {p.name: digest(p) for p in repo.iterdir()}
        r = run(repo, "update", "--dir", str(repo), "--now", NOW)
        check("round-trip exit 0", lambda: r.returncode == 0)
        check("round-trip report totals", lambda: json.loads(r.stdout)["total_articles"] == 5)
        check("round-trip files byte-identical",
              lambda: all(digest(repo / n) == h for n, h in before.items()))

    # 2. garbage tail after DATA JSON is detected (the 2026-11-12 corruption).
    with tempfile.TemporaryDirectory() as tmp:
        repo = make_repo(tmp, [article(1, "2026-11-10T00:00:00Z")])
        p = repo / "arxiv.html"
        p.write_text(p.read_text(encoding="utf-8").replace(',"version":1};', ',"version":1}旧DATAの残骸;'), encoding="utf-8")
        r = run(repo, "validate", "--dir", str(repo))
        check("garbage tail: validate exits nonzero", lambda: r.returncode != 0)
        check("garbage tail: error mentions ';'", lambda: "not followed by ';'" in (r.stderr + r.stdout))

    # 3. dedupe: versioned arXiv URL variant of an existing article is rejected, files untouched.
    with tempfile.TemporaryDirectory() as tmp:
        repo = make_repo(tmp, [article(1, "2026-11-10T00:00:00Z")])
        dup = article(2, "2026-11-11T00:00:00Z", url="http://arxiv.org/abs/2611.10001v3/")
        nf = Path(tmp) / "new.json"
        nf.write_text(json.dumps([dup]), encoding="utf-8")
        before = digest(repo / "arxiv.html")
        r = run(repo, "update", "--dir", str(repo), "--new", str(nf), "--now", NOW)
        check("dup url rejected with exit 2", lambda: r.returncode == 2)
        check("dup url: files untouched", lambda: digest(repo / "arxiv.html") == before)

    # 4. overflow: 80 in main + 2 newer -> 2 oldest overflow, one into an
    #    existing archive month, one into a brand-new month (shell created).
    with tempfile.TemporaryDirectory() as tmp:
        base = [article(i, f"2026-11-{(i % 14) + 1:02d}T00:00:00Z") for i in range(80)]
        repo = make_repo(tmp, base, {"2026-10": [article(90, "2026-10-05T00:00:00Z")]})
        old_oct = article(91, "2026-10-20T00:00:00Z", title="Overflow To October")
        new_hot = article(92, "2026-11-11T00:00:00Z", title="New Hot Paper")
        nf = Path(tmp) / "new.json"
        nf.write_text(json.dumps([old_oct, new_hot]), encoding="utf-8")
        r = run(repo, "update", "--dir", str(repo), "--new", str(nf), "--now", NOW)
        rep = json.loads(r.stdout) if r.returncode == 0 else {}
        check("overflow exit 0", lambda: r.returncode == 0)
        check("overflow keeps main at 80", lambda: rep.get("main_total") == 80)
        check("overflow total 83", lambda: rep.get("total_articles") == 83)
        # overflow = the 2 oldest: old_oct (-> existing 2026-10 archive) and the
        # oldest base article (monthKey 2026-11 -> brand-new archive shell).
        nov = repo / "arxiv-archive-2026-11.html"
        check("new month archive created", lambda: nov.exists())
        check("new archive shell headings",
              lambda: nov.exists() and "Research Digest アーカイブ 2026年11月" in nov.read_text(encoding="utf-8")
              and 'href="arxiv.html" class="back"' in nov.read_text(encoding="utf-8"))
        main_html = (repo / "arxiv.html").read_text(encoding="utf-8")
        check("links line lists all months with counts",
              lambda: "2026年11月（1件）" in main_html and "2026年10月（2件）" in main_html)
        r2 = run(repo, "validate", "--dir", str(repo))
        check("post-overflow validate passes", lambda: r2.returncode == 0)

    # 5. cleaning: a +10d future article in stock is removed and reported.
    with tempfile.TemporaryDirectory() as tmp:
        arts = [article(1, "2026-11-10T00:00:00Z"), article(2, "2026-11-22T00:00:00Z", title="Future Paper")]
        repo = make_repo(tmp, arts)
        r = run(repo, "update", "--dir", str(repo), "--now", NOW)
        rep = json.loads(r.stdout) if r.returncode == 0 else {}
        check("cleaning exit 0", lambda: r.returncode == 0)
        check("future article removed",
              lambda: rep.get("total_articles") == 1 and rep["removed_cleaning"]
              and rep["removed_cleaning"][0]["reason"] == "future")

    # 6. new-record summary length gate.
    with tempfile.TemporaryDirectory() as tmp:
        repo = make_repo(tmp, [article(1, "2026-11-10T00:00:00Z")])
        short = article(2, "2026-11-11T00:00:00Z", summary="短い要約。")
        nf = Path(tmp) / "new.json"
        nf.write_text(json.dumps([short]), encoding="utf-8")
        r = run(repo, "update", "--dir", str(repo), "--new", str(nf), "--now", NOW)
        check("short summary rejected with exit 2", lambda: r.returncode == 2)

    # 7. RSS feed: update regenerates arxiv-feed.xml from the whole stock,
    #    capped at 50 items, newest first, XML-escaped; a rerun with no
    #    stock change leaves the feed out of changed_files.
    with tempfile.TemporaryDirectory() as tmp:
        arts = [article(i, f"2026-11-{(i % 11) + 1:02d}T{i // 11:02d}:00:00Z") for i in range(55)]
        sp = article(99, "2026-11-12T00:00:00Z")
        sp["titleJa"] = "A & B <テスト> の論文"
        sp["url"] = "https://example.org/paper?a=1&b=2"
        repo = make_repo(tmp, arts + [sp])
        r = run(repo, "update", "--dir", str(repo), "--now", NOW)
        rep = json.loads(r.stdout) if r.returncode == 0 else {}
        feed = repo / "arxiv-feed.xml"
        check("feed exit 0", lambda: r.returncode == 0)
        check("feed file created and reported changed",
              lambda: feed.exists() and "arxiv-feed.xml" in rep.get("changed_files", []))
        raw = feed.read_text(encoding="utf-8") if feed.exists() else ""
        items = ET.fromstring(raw).find("channel").findall("item") if raw else []
        check("feed is valid XML with 50 items (cap)", lambda: len(items) == 50)
        check("feed newest first",
              lambda: items and items[0].findtext("title") == "A & B <テスト> の論文")
        check("feed pubDates non-increasing",
              lambda: all(parsedate_to_datetime(items[i].findtext("pubDate"))
                          >= parsedate_to_datetime(items[i + 1].findtext("pubDate"))
                          for i in range(len(items) - 1)))
        check("feed escapes title and url",
              lambda: "A &amp; B &lt;テスト&gt; の論文" in raw
              and "https://example.org/paper?a=1&amp;b=2" in raw)
        check("feed link/guid/pubDate present",
              lambda: items and items[0].findtext("link") == "https://example.org/paper?a=1&b=2"
              and items[0].findtext("guid") == "https://example.org/paper?a=1&b=2"
              and parsedate_to_datetime(items[0].findtext("pubDate"))
              == datetime(2026, 11, 12, tzinfo=timezone.utc))
        r2 = run(repo, "update", "--dir", str(repo), "--now", NOW)
        rep2 = json.loads(r2.stdout) if r2.returncode == 0 else {}
        check("feed rerun: unchanged feed not in changed_files",
              lambda: r2.returncode == 0 and "arxiv-feed.xml" not in rep2.get("changed_files", []))

    # 8. search index + latest: update regenerates arxiv-search-index.json
    #    (whole stock, slim fields, excerpts capped) and arxiv-latest.json
    #    (exactly the newest 5); a no-change rerun leaves both unchanged.
    with tempfile.TemporaryDirectory() as tmp:
        main_arts = [article(i, f"2026-11-{12 - i:02d}T00:00:00Z") for i in range(6)]
        arch = {"2026-10": [article(50, "2026-10-05T00:00:00Z"),
                            article(51, "2026-10-04T00:00:00Z")]}
        repo = make_repo(tmp, main_arts, arch)
        r = run(repo, "update", "--dir", str(repo), "--now", NOW)
        rep = json.loads(r.stdout) if r.returncode == 0 else {}
        idx_path, lat_path = repo / "arxiv-search-index.json", repo / "arxiv-latest.json"
        check("index/latest exit 0", lambda: r.returncode == 0)
        check("index/latest created and reported changed",
              lambda: idx_path.exists() and lat_path.exists()
              and "arxiv-search-index.json" in rep.get("changed_files", [])
              and "arxiv-latest.json" in rep.get("changed_files", []))
        idx = json.loads(idx_path.read_text(encoding="utf-8")) if idx_path.exists() else []
        check("index covers whole stock (8)", lambda: len(idx) == 8 == rep.get("total_articles"))
        check("index newest first with page=本体",
              lambda: idx and idx[0]["titleJa"] == main_arts[0]["titleJa"] and idx[0]["page"] == "本体")
        check("index archive entries carry the archive filename",
              lambda: {e["page"] for e in idx} == {"本体", "arxiv-archive-2026-10.html"})
        check("index excerpts capped at 200 chars",
              lambda: all(len(e["excerpt"]) <= 200 for e in idx))
        check("index has exactly the slim fields",
              lambda: all(set(e) == {"title", "titleJa", "url", "publishedAt",
                                     "source", "genre", "field", "page", "excerpt"}
                          for e in idx))
        lat = json.loads(lat_path.read_text(encoding="utf-8")) if lat_path.exists() else []
        expect5 = [a["titleJa"] for a in main_arts[:5]]
        check("latest has exactly the newest 5 in order",
              lambda: [e["titleJa"] for e in lat] == expect5)
        idx_h, lat_h = digest(idx_path), digest(lat_path)
        r2 = run(repo, "update", "--dir", str(repo), "--now", NOW)
        rep2 = json.loads(r2.stdout) if r2.returncode == 0 else {}
        check("index/latest rerun: unchanged files not in changed_files",
              lambda: r2.returncode == 0
              and "arxiv-search-index.json" not in rep2.get("changed_files", [])
              and "arxiv-latest.json" not in rep2.get("changed_files", [])
              and digest(idx_path) == idx_h and digest(lat_path) == lat_h)

    print(f"\n{len(PASSED)} passed, {len(FAILED)} failed")
    if FAILED:
        print("FAILED:", FAILED)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
