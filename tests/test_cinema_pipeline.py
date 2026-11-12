#!/usr/bin/env python3
"""Tests for scripts/cinema_pipeline.py + scripts/cinema_fetch.py parsing.

Run: python3 tests/test_cinema_pipeline.py
Stdlib only (unittest).
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOW = "2026-11-12T00:00:00Z"


def rec(i, title=None, url=None, date="2026-11-10T00:00:00Z", summary=None):
    title = title or f"テスト記事{i}のタイトル"
    url = url or f"https://example.com/film/{i}"
    body = summary or (
        f"これはテスト記事{i}の要約の第一段落です。アーティストの新作に関する"
        "具体的な情報、リリース日、収録曲、関係者のコメントなど、読者が"
        "知りたい要点をここにまとめています。本文は十分な長さがあります。"
        "<br><br>"
        "第二段落では背景や今後の予定を補足します。ツアー日程やチケット情報、"
        "関連作品への言及など、続報として押さえておきたい内容を記します。")
    return {
        "sourceName": "シネマトゥデイ",
        "originalTitle": title,
        "titleJa": f"テスト記事{i}、新作を発表",
        "summaryHtml": body,
        "url": url,
        "publishedAt": date,
        "categories": ["ドラマ"],
        "region": "国内",
        "kind": "公開・配信情報",
    }


class CinemaPipelineTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="cinema-test-")
        self.addCleanup(shutil.rmtree, self.tmp, True)
        for name in ("cinema-news.html",):
            shutil.copy(os.path.join(REPO, name),
                        os.path.join(self.tmp, name))
        with open(os.path.join(self.tmp, "cinema-news-data.json"), "w",
                  encoding="utf-8") as f:
            json.dump({"updatedAt": NOW, "articles": []}, f,
                      ensure_ascii=False)

    def run_pipeline(self, *extra):
        cmd = [sys.executable,
               os.path.join(REPO, "scripts", "cinema_pipeline.py"),
               "--repo", self.tmp, "--now", NOW, *extra]
        p = subprocess.run(cmd, capture_output=True, text=True)
        return p

    def write_new(self, records):
        path = os.path.join(self.tmp, "new.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(records, f, ensure_ascii=False)
        return path

    def read_data(self):
        with open(os.path.join(self.tmp, "cinema-news-data.json"),
                  encoding="utf-8") as f:
            return json.load(f)

    def test_merge_and_regenerate(self):
        p = self.run_pipeline("--new", self.write_new([rec(1), rec(2)]))
        self.assertEqual(p.returncode, 0, p.stderr)
        summary = json.loads(p.stdout)
        self.assertEqual(summary["total"], 2)
        self.assertEqual(len(summary["added"]), 2)
        main = open(os.path.join(self.tmp, "cinema-news.html"),
                    encoding="utf-8").read()
        self.assertEqual(main.count("<article"), 2)
        self.assertIn("cinema-feed.xml", summary["files"])
        feed = open(os.path.join(self.tmp, "cinema-feed.xml"),
                    encoding="utf-8").read()
        self.assertEqual(feed.count("<item>"), 2)
        idx = json.load(open(os.path.join(
            self.tmp, "cinema-search-index.json"), encoding="utf-8"))
        self.assertEqual(idx["total"], 2)

    def test_noop_is_byte_identical(self):
        self.run_pipeline("--new", self.write_new([rec(1)]))
        before = {}
        for name in os.listdir(self.tmp):
            with open(os.path.join(self.tmp, name), "rb") as f:
                before[name] = f.read()
        p = self.run_pipeline()
        self.assertEqual(p.returncode, 0, p.stderr)
        summary = json.loads(p.stdout)
        self.assertEqual(summary["files"], [])
        for name, blob in before.items():
            with open(os.path.join(self.tmp, name), "rb") as f:
                self.assertEqual(f.read(), blob, name)

    def test_dedupe_url_and_title(self):
        self.run_pipeline("--new", self.write_new([rec(1)]))
        dup_url = rec(2, url="https://example.com/film/1")
        dup_title = rec(3, title="テスト記事1のタイトル",
                        url="https://other.example.com/x")
        p = self.run_pipeline("--new",
                              self.write_new([dup_url, dup_title, rec(4)]))
        self.assertEqual(p.returncode, 0, p.stderr)
        summary = json.loads(p.stdout)
        self.assertEqual(summary["total"], 2)
        self.assertEqual(len(summary["added"]), 1)

    def test_kana_less_title_rejected(self):
        bad = rec(1)
        bad["titleJa"] = "English Only Title"
        p = self.run_pipeline("--new", self.write_new([bad]))
        self.assertEqual(p.returncode, 2)
        self.assertEqual(self.read_data()["articles"], [])

    def test_short_summary_rejected(self):
        bad = rec(1, summary="短い要約です。")
        p = self.run_pipeline("--new", self.write_new([bad]))
        self.assertEqual(p.returncode, 2)

    def test_archive_overflow(self):
        records = [rec(i, date=f"2026-10-{(i % 28) + 1:02d}T00:00:00Z")
                   for i in range(85)]
        # give them distinct months split: first 80 stay main only if all
        # share dates in one month; pipeline archives overflow by month.
        p = self.run_pipeline("--new", self.write_new(records))
        self.assertEqual(p.returncode, 0, p.stderr)
        summary = json.loads(p.stdout)
        self.assertEqual(summary["total"], 85)
        main = open(os.path.join(self.tmp, "cinema-news.html"),
                    encoding="utf-8").read()
        self.assertEqual(main.count("<article"), 80)
        arch = open(os.path.join(self.tmp, "cinema-archive-2026-10.html"),
                    encoding="utf-8").read()
        self.assertEqual(arch.count("<article"), 5)

    def test_shell_guard_pager_missing(self):
        path = os.path.join(self.tmp, "cinema-news.html")
        page = open(path, encoding="utf-8").read().replace(
            'id="pageSize"', 'id="pageSizeGone"')
        open(path, "w", encoding="utf-8").write(page)
        p = self.run_pipeline("--new", self.write_new([rec(1)]))
        self.assertEqual(p.returncode, 2)


if __name__ == "__main__":
    unittest.main(verbosity=2)
