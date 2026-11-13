# Art News automation

美術・美術館ニュースの自動配信（日本語要約）のための実装です。Nurse News（このシリーズの原型）と同じルールで動き、他の分野（Cinema / Camera / Music / Instruments / World / Literature / arXiv）と並走します。

## 構成
- `art-news.html` — 最新80件の本体ページ（シェル。パイプラインが記事部を再生成）
- `art-news-data.json` — 全ストック（正本）
- `art-archive-YYYY-MM.html` — 80件を超えた分の月別アーカイブ（自動生成）
- `art-feed.xml` — RSS 2.0（最新50件）
- `art-search.html` / `art-search-index.json` / `art-search-YYYY-MM.json` — 全件検索（月別シャード）
- `scripts/art_fetch.py` — 候補収集（41ソース、標準ライブラリのみ、検証済みソースと不採用理由はファイル冒頭に記録）
- `scripts/art_pipeline.py` — 確定処理（クリーニング、重複排除、検証、HTML/フィード/検索索引の再生成）
- `tests/test_art_pipeline.py` — パイプラインのテスト（CI: `.github/workflows/art-pipeline-tests.yml`）

## 更新ルール（他分野と共通）
- Muse 側 cron `art-news-update` が1時間ごとに実行する。要約作成は cron 側（AI）が担い、確定処理は `art_pipeline.py` が担う
- 新規は候補から最大8件/回。説明文のない候補は採用しない
- 公開面にフォールバック文（「Gemini 無料枠」「生成要約を安定取得できなかった」等）を残さない
- 重複は URL・正規化タイトルで排除。未来日付（+2日超）は落とす
- 変更がないrunは何も書かない（バイト同一のno-op）
- 日次ウォッチドッグが更新停止・検証失敗を監視する

## 手動実行
```bash
python3 scripts/art_fetch.py --data art-news-data.json --out /tmp/art_candidates.json
# 候補から新規記事のJSON（new.json）を用意して:
python3 scripts/art_pipeline.py --repo . --new new.json
python3 tests/test_art_pipeline.py
```

## 分類
- categories: 現代アート / 絵画 / 彫刻・立体 / 写真 / 版画・グラフィック / 工芸・デザイン / 建築・空間 / メディアアート / パフォーマンス / 美術史・古典 / 展覧会・イベント / 美術館・博物館 / アートマーケット / 保存修復・文化財 / その他
- kind: ニュース / 展覧会案内 / レビュー・批評 / インタビュー / 特集 / 市場レポート / 研究・解説 / 受賞・訃報 / その他
- region: 国内 / 海外
