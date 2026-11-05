# arXiv digest automation

この実装は `arxiv.html` を **GitHub Actions + Gemini API** で自動更新するためのものです。

## 目的
- `arxiv.html` を repo 内 workflow だけで更新する
- 未来日付の Crossref 混入や英語フォールバック残留を避ける
- arXiv の AI 関連カテゴリだけを対象にした安定更新へ寄せる

## 追加ファイル
- `.github/workflows/update-arxiv-digest.yml`
- `scripts/update_arxiv_digest.py`
- `README-arxiv-automation.md`

## 必須設定
GitHub Secrets に以下を追加してください。
- `GEMINI_API_KEY`

## 実行
- Actions → `Update arXiv digest` → `Run workflow`

## 出力
- `arxiv.html`
- `arxiv-data.json`
- `.arxiv-state.json`

## 注意
既に別経路で `arxiv.html` を更新している場合、二重更新になります。
この PR を採用するなら、最終的にはこの workflow を正本に寄せる方が安全です。
