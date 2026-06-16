# Nurse news automation

この追加実装は、`nurse-news-data.json` と `nurse-news.html` を **GitHub Actions + Gemini API** で自動更新するためのものです。

## 目的
- 既存の `nurse-news.html` / `nurse-news-data.json` を repo 内の workflow だけで更新する
- 英語のまま落ちる簡易フォールバックや `Gemini 無料枠または一時エラー` のような文言が公開面に残るのを避ける
- 過去記事の `topics` / `clinicalAreas` / `audiences` / `evidenceType` / `actionPoint` の欠損を少しずつ補修する

## 追加ファイル
- `.github/workflows/update-nurse-news.yml`
- `scripts/update_nurse_news.py`
- `requirements-nurse-news.txt`
- `README-nurse-news-automation.md`

## 必須設定
GitHub リポジトリの Secrets に次を追加してください。

- `GEMINI_API_KEY`

workflow では `GEMINI_API_KEY` を `GOOGLE_API_KEY` にも流しています。

## 実行
### GitHub Actions
- Actions → `Update nurse news` → `Run workflow`

### ローカル
```bash
python -m pip install -r requirements-nurse-news.txt
export GEMINI_API_KEY="..."
python scripts/update_nurse_news.py
```

## 出力
- `nurse-news-data.json`
- `nurse-news.html`
- `.nurse-news-state.json`

## 注意
既に外部から `nurse-news.html` を更新している別経路がある場合、二重更新になります。
この PR を採用する場合は、最終的に **この workflow を正本に寄せる** ほうが安全です。
