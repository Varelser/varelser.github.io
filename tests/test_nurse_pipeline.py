#!/usr/bin/env python3
"""Tests for scripts/nurse_pipeline.py (stdlib unittest).

Run from the repo root:  python3 -m unittest tests.test_nurse_pipeline
or directly:             python3 tests/test_nurse_pipeline.py
"""
import importlib.util
import json
import os
import shutil
import sys
import tempfile
import unittest
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_spec = importlib.util.spec_from_file_location(
    "nurse_pipeline", os.path.join(ROOT, "scripts", "nurse_pipeline.py"))
pipeline = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(pipeline)

NOW = datetime(2026, 11, 12, 3, 0, 0, tzinfo=timezone.utc)


def make_record(url, title_en, title_ja, date, summary=None, **kw):
    rec = {
        "sourceName": kw.get("sourceName", "PubMed Nursing"),
        "originalTitle": title_en,
        "titleJa": title_ja,
        "summaryHtml": summary or ("本文です。<br><br>方法です。<br><br>結果です。<br><br>"
                                   "看護実務への示唆としては、観察が大切です。"),
        "url": url,
        "publishedAt": f"{date}T00:00:00Z",
        "topics": ["患者安全"],
        "clinicalAreas": ["病棟"],
        "audiences": ["成人"],
        "evidenceType": "臨床研究",
        "practiceImpact": "medium",
        "actionPoint": "観察する。",
    }
    rec["id"] = pipeline.md5hex(url)
    rec["publishedDateKey"] = date
    rec["publishedMonthKey"] = date[:7]
    return {k: rec[k] for k in sorted(rec)}


SHELL = """<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<title>Nursing News | VARELSER</title><style>.x{{margin:0}}</style></head>
<body>
<a href="/">ホーム</a>
<div class="count"><span id="visibleCount">0</span>件表示 / 全1件</div>
<div id="emptyState" class="empty">該当する記事がありません。</div>
<section class="articles" id="articlesList">
{block}
    </section>
<nav class="pager"><select id="pageSize"><option value="20" selected>20件</option></select><span id="pageInfo"></span></nav>
<script>function summaryToggle() {{}}</script>
    <!-- NURSE_ARCHIVE_LINKS_START -->
    <section class="archive-links">
      <h2>過去のアーカイブ（月別）</h2>
      <ul class="archive-list">
        <li>まだありません</li>
      </ul>
    </section>
    <!-- NURSE_ARCHIVE_LINKS_END -->
</body></html>
"""


def write_fixture(repo, records):
    data = {"version": 1, "updatedAt": "2026-11-12T00:00:00Z", "articles": records}
    with open(os.path.join(repo, "nurse-news-data.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    block = pipeline.article_block(records[0]) if records else ""
    with open(os.path.join(repo, "nurse-news.html"), "w", encoding="utf-8") as f:
        f.write(SHELL.format(block=block))


class FixtureCase(unittest.TestCase):
    def setUp(self):
        self.repo = tempfile.mkdtemp(prefix="nurse_test_")
        self.addCleanup(shutil.rmtree, self.repo, True)


class TestCleaning(FixtureCase):
    def test_stub_future_and_duplicates_removed(self):
        good = make_record("https://example.org/1", "Good Study", "良い研究", "2026-11-10")
        stub = make_record("https://example.org/2", "Stub Study", "スタブ研究", "2026-11-09",
                            summary="生成要約を安定取得できなかったため後日更新します。")
        future = make_record("https://example.org/3", "Future Study", "未来の研究", "2026-12-31")
        dup_url = make_record("https://example.org/1", "Good Study Copy", "複製研究", "2026-11-08")
        dup_title = make_record("https://doi.org/10.1000/xyz", "Good Study!", "別URLの同じ研究",
                                "2026-11-07", summary="短い。")
        write_fixture(self.repo, [good, stub, future, dup_url, dup_title])
        summary = pipeline.run(self.repo, now=NOW)
        self.assertEqual(summary["total"], 1)
        reasons = {r["reason"] for r in summary["removed"]}
        self.assertEqual(reasons, {"stub", "future", "dup-url", "dup-title"})
        with open(os.path.join(self.repo, "nurse-news.html"), encoding="utf-8") as f:
            main = f.read()
        self.assertEqual(main.count("<article"), 1)
        self.assertIn("良い研究", main)


class TestMerge(FixtureCase):
    def test_new_record_merged_and_deduped(self):
        base = make_record("https://example.org/1", "Base Study", "基礎となる研究", "2026-11-10")
        write_fixture(self.repo, [base])
        new = make_record("https://example.org/2", "New Study", "新しい研究", "2026-11-11")
        del new["id"], new["publishedDateKey"], new["publishedMonthKey"]
        same_doi = make_record("https://publisher.example/10.1000/abc", "New Study",
                                "同じ論文の別URL", "2026-11-11")
        same_doi["url"] = "https://doi.org/10.1000/abc"
        same_doi["id"] = pipeline.md5hex(same_doi["url"])
        new_file = os.path.join(self.repo, "new.json")
        with open(new_file, "w", encoding="utf-8") as f:
            json.dump([new, same_doi], f, ensure_ascii=False)
        summary = pipeline.run(self.repo, new_path=new_file, now=NOW)
        self.assertEqual(summary["total"], 2)
        self.assertEqual(summary["added"], ["新しい研究"])
        with open(os.path.join(self.repo, "nurse-news-data.json"), encoding="utf-8") as f:
            data = json.load(f)
        self.assertEqual(data["articles"][0]["titleJa"], "新しい研究")
        self.assertEqual(data["articles"][0]["id"], pipeline.md5hex("https://example.org/2"))

    def test_invalid_new_record_rejected(self):
        base = make_record("https://example.org/1", "Base Study", "基礎となる研究", "2026-11-10")
        write_fixture(self.repo, [base])
        bad = make_record("https://example.org/9", "Bad Study", "No Japanese Title", "2026-11-11")
        new_file = os.path.join(self.repo, "new.json")
        with open(new_file, "w", encoding="utf-8") as f:
            json.dump([bad], f, ensure_ascii=False)
        with self.assertRaises(ValueError):
            pipeline.run(self.repo, new_path=new_file, now=NOW)


class TestValidation(FixtureCase):
    def test_validate_catches_tampered_archive(self):
        recs = [make_record(f"https://example.org/{i}", f"Study {i}", f"研究その{i}", "2026-10-15")
                for i in range(85)]
        write_fixture(self.repo, recs)
        summary = pipeline.run(self.repo, now=NOW)
        self.assertEqual(summary["total"], 85)
        files, _ = pipeline.regenerate(
            open(os.path.join(self.repo, "nurse-news.html"), encoding="utf-8").read(), recs)
        arch = files["nurse-archive-2026-10.html"]
        cut = arch.index("<article")
        files["nurse-archive-2026-10.html"] = arch[:cut] + arch[arch.index("</article>") + 10:]
        with self.assertRaises(ValueError):
            pipeline.validate(files, recs)

    def test_shell_without_pager_rejected(self):
        rec = make_record("https://example.org/1", "Study", "研究", "2026-11-10")
        with self.assertRaises(ValueError):
            pipeline.regenerate("<html><article>x</article></html>", [rec])


GOOD_SUMMARY = ("背景の説明です。十分な長さの文章をここに書きます。" * 6 +
                "<br><br>方法の説明です。対象と手順を具体的に述べます。" * 5 +
                "<br><br>結果の説明です。数値と限界をあわせて示します。" * 5 +
                "<br><br>看護実務への示唆としては、日々の観察で変化を早期にとらえることが大切です。")


class TestDropAndRevise(FixtureCase):
    def test_editorial_drop(self):
        a = make_record("https://example.org/1", "Study A", "研究そのA", "2026-11-10")
        b = make_record("https://example.org/2", "Study B", "研究そのB", "2026-11-09")
        write_fixture(self.repo, [a, b])
        drop_file = os.path.join(self.repo, "drop.json")
        with open(drop_file, "w", encoding="utf-8") as f:
            json.dump(["https://example.org/2"], f)
        summary = pipeline.run(self.repo, now=NOW, drop_path=drop_file)
        self.assertEqual(summary["total"], 1)
        self.assertEqual(summary["removed"][0]["reason"], "editorial")

    def test_drop_unknown_url_rejected(self):
        a = make_record("https://example.org/1", "Study A", "研究そのA", "2026-11-10")
        write_fixture(self.repo, [a])
        drop_file = os.path.join(self.repo, "drop.json")
        with open(drop_file, "w", encoding="utf-8") as f:
            json.dump(["https://example.org/nope"], f)
        with self.assertRaises(ValueError):
            pipeline.run(self.repo, now=NOW, drop_path=drop_file)

    def test_revise_replaces_summary_and_writes_feed(self):
        a = make_record("https://example.org/1", "Study A", "研究そのA", "2026-11-10",
                        summary="短い。")
        write_fixture(self.repo, [a])
        rev_file = os.path.join(self.repo, "revise.json")
        with open(rev_file, "w", encoding="utf-8") as f:
            json.dump([{"url": "https://example.org/1", "summaryHtml": GOOD_SUMMARY}], f)
        summary = pipeline.run(self.repo, now=NOW, revise_path=rev_file)
        self.assertEqual(summary["revised"], ["https://example.org/1"])
        self.assertIn("nurse-feed.xml", summary["files"])
        import xml.etree.ElementTree as ET
        feed = ET.parse(os.path.join(self.repo, "nurse-feed.xml"))
        items = feed.getroot().findall(".//item")
        self.assertEqual(len(items), 1)
        with open(os.path.join(self.repo, "nurse-news-data.json"), encoding="utf-8") as f:
            data = json.load(f)
        self.assertEqual(data["articles"][0]["summaryHtml"], GOOD_SUMMARY)

    def test_revise_rejects_short_or_misformatted_summary(self):
        a = make_record("https://example.org/1", "Study A", "研究そのA", "2026-11-10")
        write_fixture(self.repo, [a])
        for bad in ("短い。",
                    GOOD_SUMMARY.replace("看護実務への示唆としては、", "まとめとして、")):
            rev_file = os.path.join(self.repo, "revise.json")
            with open(rev_file, "w", encoding="utf-8") as f:
                json.dump([{"url": "https://example.org/1", "summaryHtml": bad}], f)
            with self.assertRaises(ValueError):
                pipeline.run(self.repo, now=NOW, revise_path=rev_file)


class TestFoldingAndIndex(FixtureCase):
    def test_summary_folded_in_rendered_page(self):
        a = make_record("https://example.org/1", "Study A", "研究そのA", "2026-11-10")
        write_fixture(self.repo, [a])
        b = make_record("https://example.org/2", "Study B", "研究そのB", "2026-11-09")
        new_file = os.path.join(self.repo, "new.json")
        with open(new_file, "w", encoding="utf-8") as f:
            json.dump([b], f, ensure_ascii=False)
        pipeline.run(self.repo, new_path=new_file, now=NOW)
        with open(os.path.join(self.repo, "nurse-news.html"), encoding="utf-8") as f:
            html = f.read()
        self.assertIn('class="summary-rest" hidden', html)
        self.assertIn('class="summary-toggle"', html)
        self.assertIn("続きを読む", html)

    def test_search_index_shards_match_stock(self):
        a = make_record("https://example.org/1", "Study A", "研究そのA", "2026-11-10")
        b = make_record("https://example.org/2", "Study B", "研究そのB", "2026-10-05")
        idx = pipeline.build_search_index([a, b], "2026-11-12T00:00:00Z")
        manifest = json.loads(idx["nurse-search-index.json"])
        self.assertEqual(manifest["total"], 2)
        self.assertEqual(sum(m["count"] for m in manifest["months"]), 2)
        self.assertEqual(manifest["months"][0]["key"], "2026-11")
        shard = json.loads(idx["nurse-search-2026-10.json"])
        self.assertEqual(shard["articles"][0]["t"], "研究そのB")
        self.assertNotIn("<br>", shard["articles"][0]["b"])

    def test_shell_without_folding_rejected(self):
        a = make_record("https://example.org/1", "Study A", "研究そのA", "2026-11-10")
        shell = SHELL.replace("summaryToggle", "gone")
        with self.assertRaises(ValueError):
            pipeline.regenerate(shell, [a])


class TestGoldenIdentity(unittest.TestCase):
    def test_noop_run_is_byte_identical_on_real_files(self):
        src = os.path.join(ROOT, "nurse-news-data.json")
        if not os.path.exists(src):
            self.skipTest("repo data files not present")
        repo = tempfile.mkdtemp(prefix="nurse_golden_")
        self.addCleanup(shutil.rmtree, repo, True)
        names = ["nurse-news-data.json", "nurse-news.html"] + sorted(
            n for n in os.listdir(ROOT) if n.startswith("nurse-archive-"))
        before = {}
        for n in names:
            with open(os.path.join(ROOT, n), "rb") as f:
                before[n] = f.read()
            with open(os.path.join(repo, n), "wb") as f:
                f.write(before[n])
        summary = pipeline.run(repo, now=datetime.now(timezone.utc))
        self.assertFalse(summary["changed"], f"expected no-op, got {summary}")
        for n in names:
            with open(os.path.join(repo, n), "rb") as f:
                self.assertEqual(f.read(), before[n], f"{n} changed on a no-op run")


if __name__ == "__main__":
    unittest.main(verbosity=2)
