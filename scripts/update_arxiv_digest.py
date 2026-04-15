from __future__ import annotations

import html
import json
import os
import re
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / "arxiv.html"
DATA_PATH = ROOT / "arxiv-data.json"
STATE_PATH = ROOT / ".arxiv-state.json"
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
MAX_ARTICLES = int(os.getenv("MAX_ARTICLES", "80"))
TIMEOUT = 30

ARXIV_QUERY = "cat:cs.AI OR cat:cs.CL OR cat:cs.CV OR cat:cs.LG OR cat:cs.RO OR cat:cs.SE OR cat:stat.ML"
ARXIV_URL = "https://export.arxiv.org/api/query"

GENRE_OPTIONS = [
    "LLM / NLP", "Vision / Multimodal", "Agents / Reasoning", "Generative Models",
    "Robotics", "Ethics / Safety", "Speech / Audio", "Scientific AI", "Optimization / Theory"
]

HTML_TEMPLATE = """<!doctype html>
<html lang=\"ja\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>Research Digest | VARELSER</title>
  <style>
    body{margin:0;background:#fff;color:#111;font-family:ui-sans-serif,system-ui,-apple-system,"Hiragino Sans","Noto Sans JP",sans-serif;line-height:1.8}
    .container{max-width:920px;margin:0 auto;padding:40px 18px 56px}.back{display:inline-block;margin-bottom:28px;color:#666;text-decoration:none;font-size:14px}
    h1{font-size:24px;margin:0 0 8px}.desc{color:#666;font-size:13px;margin:0 0 18px}
    .panel{border:1px solid #e5e7eb;border-radius:12px;padding:14px;background:#fff;margin-bottom:24px}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.wide{grid-column:1/-1}
    select,input{width:100%;height:42px;padding:0 12px;border:1px solid #d1d5db;border-radius:10px;background:#fff}.label{display:block;font-size:12px;color:#666;margin:0 0 6px}
    .meta{font-size:13px;color:#666;margin-top:10px}.list{display:grid;gap:18px}
    article{border-bottom:1px solid #e5e7eb;padding-bottom:28px}.src{font-size:12px;color:#666;margin-bottom:8px}.title{font-size:20px;line-height:1.5;font-weight:700;margin:0 0 10px}
    .tags{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px}.tag{font-size:12px;padding:4px 10px;border:1px solid #e5e7eb;border-radius:999px;background:#f3f4f6}
    .summary{font-size:14px;color:#222}.box{margin-top:14px;padding:12px 14px;border:1px solid #e5e7eb;border-radius:10px;background:#fafafa;font-size:13px;color:#555}
    a{color:#0f766e;text-decoration:none} a:hover{text-decoration:underline}
    @media (max-width:720px){.grid{grid-template-columns:1fr}.wide{grid-column:auto}}
  </style>
</head>
<body>
  <div class=\"container\">
    <a href=\"/hp/\" class=\"back\">← ホームに戻る</a>
    <h1>最新の arXiv AI 論文</h1>
    <p class=\"desc\">arXiv の AI 関連カテゴリを対象に、日本語要約・ジャンル分類付きで整理しています。</p>
    <div class=\"panel\">
      <div class=\"grid\">
        <label><span class=\"label\">月</span><select id=\"month\"><option value=\"\">すべて</option></select></label>
        <label><span class=\"label\">ジャンル</span><select id=\"genre\"><option value=\"\">すべて</option></select></label>
        <label><span class=\"label\">主分類</span><select id=\"field\"><option value=\"\">すべて</option></select></label>
        <label><span class=\"label\">並び順</span><select id=\"sort\"><option value=\"newest\">新しい順</option><option value=\"oldest\">古い順</option><option value=\"title\">タイトル順</option></select></label>
        <label class=\"wide\"><span class=\"label\">キーワード</span><input id=\"keyword\" type=\"search\" placeholder=\"タイトル・要約・著者・分類を検索\" /></label>
      </div>
      <div id=\"meta\" class=\"meta\"></div>
    </div>
    <div class=\"list\" id=\"list\"></div>
  </div>
  <script>
    const DATA = __DATA__;
    const byId = id => document.getElementById(id);
    const norm = s => String(s||'').toLowerCase().normalize('NFKC').replace(/\s+/g,' ').trim();
    const esc = s => String(s||'').replace(/[&<>\"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
    const months = [...new Set((DATA.articles||[]).map(a => a.monthKey).filter(Boolean))].sort().reverse();
    const genres = [...new Set((DATA.articles||[]).map(a => a.genre).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ja'));
    const fields = [...new Set((DATA.articles||[]).map(a => a.field).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ja'));
    function fill(select, values){ values.forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; select.appendChild(o); }); }
    fill(byId('month'), months); fill(byId('genre'), genres); fill(byId('field'), fields);
    function render(){
      const month=byId('month').value, genre=byId('genre').value, field=byId('field').value, sort=byId('sort').value, kw=norm(byId('keyword').value);
      let rows=(DATA.articles||[]).filter(a=>{
        if(month&&a.monthKey!==month) return false; if(genre&&a.genre!==genre) return false; if(field&&a.field!==field) return false;
        const hay=norm([a.titleJa,a.title,a.summaryHtml,a.authors.join(' '),a.categories.join(' ')].join(' '));
        if(kw&& !hay.includes(kw)) return false; return true;
      });
      rows = rows.slice().sort((a,b)=> sort==='oldest' ? a.timestamp-b.timestamp : sort==='title' ? a.titleJa.localeCompare(b.titleJa,'ja') : b.timestamp-a.timestamp);
      byId('meta').textContent = `更新: ${DATA.updatedAt || '-'} / 表示件数: ${rows.length}件`;
      byId('list').innerHTML = rows.map(a=>`
        <article>
          <div class=\"src\">${esc(a.source)} / ${esc(a.publishedAt.slice(0,10))}</div>
          <h2 class=\"title\">${esc(a.titleJa)}</h2>
          <div class=\"tags\"><span class=\"tag\">AI</span><span class=\"tag\">${esc(a.genre)}</span><span class=\"tag\">${esc(a.field)}</span>${a.categories.slice(0,4).map(c=>`<span class=\\"tag\\">${esc(c)}</span>`).join('')}</div>
          <div class=\"summary\">${a.summaryHtml}</div>
          <div class=\"box\"><strong>著者</strong><br>${esc(a.authors.join(', '))}<br><br><a href=\"${esc(a.url)}\" target=\"_blank\" rel=\"noopener\">原文を開く</a></div>
        </article>`).join('');
    }
    ['month','genre','field','sort'].forEach(id=>byId(id).addEventListener('change',render)); byId('keyword').addEventListener('input',render); render();
  </script>
</body>
</html>
"""


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip())


def read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def write_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def query_arxiv(max_results: int) -> list[dict[str, Any]]:
    params = {
        "search_query": ARXIV_QUERY,
        "sortBy": "submittedDate",
        "sortOrder": "descending",
        "start": 0,
        "max_results": max_results,
    }
    url = ARXIV_URL + "?" + urllib.parse.urlencode(params)
    r = requests.get(url, timeout=TIMEOUT, headers={"User-Agent": "Mozilla/5.0"})
    r.raise_for_status()
    ns = {"a": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}
    root = ET.fromstring(r.text)
    items = []
    for entry in root.findall("a:entry", ns):
        title = clean(entry.findtext("a:title", default="", namespaces=ns))
        summary = clean(entry.findtext("a:summary", default="", namespaces=ns))
        url = clean(entry.findtext("a:id", default="", namespaces=ns))
        published = clean(entry.findtext("a:published", default="", namespaces=ns))
        authors = [clean(a.findtext("a:name", default="", namespaces=ns)) for a in entry.findall("a:author", ns)]
        categories = [c.attrib.get("term", "") for c in entry.findall("a:category", ns) if c.attrib.get("term")]
        primary = entry.find("arxiv:primary_category", ns)
        field = primary.attrib.get("term", categories[0] if categories else "") if primary is not None else (categories[0] if categories else "")
        if not title or not url:
            continue
        items.append({"title": title, "summary": summary, "url": url, "publishedAt": published, "authors": authors, "categories": categories, "field": field})
    return items


def fallback_genre(text: str) -> str:
    t = text.lower()
    if any(k in t for k in ["vision", "image", "video", "multimodal", "visual"]): return "Vision / Multimodal"
    if any(k in t for k in ["llm", "language", "nlp", "text", "speech"]): return "LLM / NLP"
    if any(k in t for k in ["agent", "reason", "planning", "tool"]): return "Agents / Reasoning"
    if any(k in t for k in ["diffusion", "generate", "generative"]): return "Generative Models"
    if any(k in t for k in ["robot", "navigation", "control"]): return "Robotics"
    if any(k in t for k in ["safe", "ethic", "bias", "trust", "alignment"]): return "Ethics / Safety"
    if any(k in t for k in ["optim", "generalization", "learning theory"]): return "Optimization / Theory"
    return "Scientific AI"


def gemini_classify_and_summarize(item: dict[str, Any]) -> tuple[str, str]:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    prompt = f'''あなたは研究ダイジェスト編集者です。以下の arXiv 論文について、
1. 日本語タイトル
2. 3段落程度の日本語要約（HTML の <br><br> を段落区切りに使う）
3. ジャンル（{GENRE_OPTIONS} のどれか1つ）
を JSON で返してください。誇張は禁止です。

Title: {item['title']}
Primary field: {item['field']}
Categories: {', '.join(item['categories'])}
Authors: {', '.join(item['authors'])}
Abstract: {item['summary']}
'''
    if api_key:
        schema = {
            "type": "OBJECT",
            "properties": {
                "titleJa": {"type": "STRING"},
                "summaryHtml": {"type": "STRING"},
                "genre": {"type": "STRING"},
            },
            "required": ["titleJa", "summaryHtml", "genre"],
        }
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            resp = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config={"response_mime_type": "application/json", "response_schema": schema, "temperature": 0.2},
            )
            data = json.loads(resp.text or "{}")
            title_ja = clean(data.get("titleJa") or item["title"])
            summary_html = str(data.get("summaryHtml") or "").strip()
            genre = data.get("genre") if data.get("genre") in GENRE_OPTIONS else fallback_genre(item["title"] + " " + item["summary"])
            if title_ja and summary_html and "Gemini 無料枠" not in summary_html:
                return title_ja, summary_html, genre
        except Exception:
            pass
    simple = html.escape(item["summary"][:900])
    return item["title"], f"本論文は、{html.escape(item['title'])} を扱います。<br><br>{simple}<br><br>利用時は原文抄録と本文を確認し、研究目的・方法・限界を一次情報で確認してください。", fallback_genre(item["title"] + " " + item["summary"])


def build_articles() -> list[dict[str, Any]]:
    items = query_arxiv(MAX_ARTICLES)
    articles = []
    for item in items:
        title_ja, summary_html, genre = gemini_classify_and_summarize(item)
        dt = datetime.fromisoformat(item["publishedAt"].replace("Z", "+00:00"))
        articles.append({
            "source": f"arXiv {item['field']}",
            "title": item["title"],
            "titleJa": title_ja,
            "summaryHtml": summary_html,
            "url": item["url"],
            "publishedAt": item["publishedAt"],
            "timestamp": int(dt.timestamp() * 1000),
            "monthKey": dt.strftime("%Y-%m"),
            "field": item["field"],
            "genre": genre,
            "authors": item["authors"],
            "categories": item["categories"],
        })
    return articles


def render_html(data: dict[str, Any]) -> str:
    return HTML_TEMPLATE.replace("__DATA__", json.dumps(data, ensure_ascii=False))


def main() -> None:
    articles = build_articles()
    data = {"version": 1, "updatedAt": now_iso(), "articles": articles}
    write_json(DATA_PATH, data)
    write_json(STATE_PATH, {"lastUpdatedAt": data["updatedAt"], "count": len(articles)})
    HTML_PATH.write_text(render_html(data), encoding="utf-8")
    print(f"updated arxiv articles={len(articles)}")


if __name__ == "__main__":
    main()
