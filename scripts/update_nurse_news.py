from __future__ import annotations

import hashlib
import html
import json
import os
import re
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any

import feedparser
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "nurse-news-data.json"
HTML_PATH = ROOT / "nurse-news.html"
STATE_PATH = ROOT / ".nurse-news-state.json"

MAX_NEW_ITEMS = int(os.getenv("MAX_NEW_ITEMS", "8"))
MAX_REPAIR_ITEMS = int(os.getenv("MAX_REPAIR_ITEMS", "10"))
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
TIMEOUT = 25

FEEDS = [
    {"name": "NIH (National Institutes of Health)", "url": "https://www.nih.gov/news-events/news-releases/feed"},
    {"name": "WHO (World Health Organization)", "url": "https://www.who.int/rss-feeds/news-english.xml"},
    {"name": "CDC (Centers for Disease Control and Prevention)", "url": "https://tools.cdc.gov/api/v2/resources/media/132608.rss"},
    {"name": "ScienceDaily Health", "url": "https://www.sciencedaily.com/rss/health_medicine.xml"},
    {"name": "PubMed Nursing", "url": "https://pubmed.ncbi.nlm.nih.gov/rss/search/1puhxLx3xwJfJ0N4V5A4nZ0gk3h2n5fQjX5Jj2wVYw8m6o0s/?limit=15&utm_campaign=pubmed-2&fc=20250301000000"},
]

TOPIC_OPTIONS = ["感染症", "循環器", "呼吸器", "神経", "がん", "糖尿病・代謝", "精神・メンタルヘルス", "高齢者", "小児", "妊娠・母子", "栄養", "疼痛", "リハビリ", "医薬品", "公衆衛生", "医療政策"]
CLINICAL_AREA_OPTIONS = ["病棟", "外来", "救急", "ICU", "手術室", "感染対策", "慢性疾患管理", "患者教育", "予防", "在宅", "高齢者ケア", "母子", "小児", "リハビリ"]
AUDIENCE_OPTIONS = ["成人", "高齢者", "小児", "妊婦", "慢性疾患患者", "医療従事者", "地域住民"]
EVIDENCE_TYPE_OPTIONS = ["RCT", "メタ解析", "システマティックレビュー", "観察研究", "基礎研究", "ガイドライン", "政策発表", "不明"]
PRACTICE_IMPACT_OPTIONS = ["high", "medium", "low"]

HTML_TEMPLATE = """<!doctype html>
<html lang=\"ja\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>看護ニュースダイジェスト</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,\"Hiragino Sans\",\"Yu Gothic\",sans-serif;margin:0;background:#fafafa;color:#111}
    .wrap{max-width:1120px;margin:0 auto;padding:24px 16px 48px}
    h1{font-size:28px;margin:0 0 8px}.muted{color:#666;font-size:14px}
    .panel{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:16px;margin-top:16px}
    .controls{display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px}.controls input,.controls select{width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:10px;background:#fff}
    .meta{margin-top:8px;color:#666;font-size:13px}.list{display:grid;gap:16px;margin-top:18px}
    article{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:18px}
    h2{font-size:20px;margin:0 0 8px;line-height:1.45}.src{font-size:13px;color:#666;margin-bottom:10px}
    .tags{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 14px}.tag{background:#f3f4f6;border:1px solid #e5e7eb;border-radius:999px;padding:4px 10px;font-size:12px}
    .summary{line-height:1.8;font-size:14px}.box{margin-top:14px;padding:12px;border-radius:12px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;line-height:1.7}
    a{color:#0f766e;text-decoration:none} a:hover{text-decoration:underline}
  </style>
</head>
<body>
  <div class=\"wrap\">
    <h1>看護ニュースダイジェスト</h1>
    <div class=\"muted\">医療・看護実務に関連する公開情報を日本語で整理した一覧です。原文リンクは各記事末尾に記載しています。</div>
    <div class=\"panel\">
      <div class=\"controls\">
        <input id=\"q\" type=\"search\" placeholder=\"タイトル・要約・配信元で検索\" />
        <select id=\"topic\"><option value=\"\">トピック全体</option></select>
        <select id=\"impact\"><option value=\"\">実務影響全体</option><option value=\"high\">high</option><option value=\"medium\">medium</option><option value=\"low\">low</option></select>
      </div>
      <div class=\"meta\" id=\"meta\"></div>
    </div>
    <div class=\"list\" id=\"list\"></div>
  </div>
  <script>
    const DATA = __DATA__;
    const topicSet = new Set();
    (DATA.articles || []).forEach(a => (a.topics || []).forEach(t => topicSet.add(t)));
    const topicSelect = document.getElementById('topic');
    [...topicSet].sort().forEach(t => {
      const opt = document.createElement('option'); opt.value = t; opt.textContent = t; topicSelect.appendChild(opt);
    });
    const q = document.getElementById('q');
    const impact = document.getElementById('impact');
    const list = document.getElementById('list');
    const meta = document.getElementById('meta');
    function esc(s){return (s||'').replace(/[&<>\"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));}
    function render(){
      const query = (q.value || '').trim().toLowerCase();
      const topic = topicSelect.value;
      const impactValue = impact.value;
      const filtered = (DATA.articles || []).filter(a => {
        const hay = [a.titleJa, a.originalTitle, a.sourceName, a.summaryHtml].join(' ').toLowerCase();
        if (query && !hay.includes(query)) return false;
        if (topic && !(a.topics || []).includes(topic)) return false;
        if (impactValue && a.practiceImpact !== impactValue) return false;
        return true;
      });
      meta.textContent = `更新: ${DATA.updatedAt || '-'} / 表示件数: ${filtered.length}件`;
      list.innerHTML = filtered.map(a => `
        <article>
          <div class=\"src\">${esc(a.sourceName || '')} / ${esc((a.publishedAt || '').slice(0,10))}</div>
          <h2>${esc(a.titleJa || a.originalTitle || '')}</h2>
          <div class=\"tags\">${(a.topics || []).map(t => `<span class=\"tag\">${esc(t)}</span>`).join('')}${a.evidenceType ? `<span class=\"tag\">${esc(a.evidenceType)}</span>` : ''}${a.practiceImpact ? `<span class=\"tag\">impact:${esc(a.practiceImpact)}</span>` : ''}</div>
          <div class=\"summary\">${a.summaryHtml || ''}</div>
          <div class=\"box\">
            <strong>看護実務への示唆</strong><br>${esc(a.actionPoint || '要点を一次情報で確認し、現場文脈へ落とし込んで判断してください。')}<br><br>
            <a href=\"${esc(a.url || '#')}\" target=\"_blank\" rel=\"noopener\">原文を開く</a>
          </div>
        </article>`).join('');
    }
    q.addEventListener('input', render); topicSelect.addEventListener('change', render); impact.addEventListener('change', render); render();
  </script>
</body>
</html>
"""


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')


def read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except Exception:
        return default


def write_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')


def make_id(source: str, title: str, url: str) -> str:
    return hashlib.md5(f"{source}|{title}|{url}".encode('utf-8')).hexdigest()


def parse_dt(value: str | None) -> datetime:
    if not value:
        return datetime.now(timezone.utc)
    try:
        return parsedate_to_datetime(value).astimezone(timezone.utc)
    except Exception:
        pass
    try:
        return datetime.fromisoformat(value.replace('Z', '+00:00')).astimezone(timezone.utc)
    except Exception:
        return datetime.now(timezone.utc)


def clean_text(text: str) -> str:
    return re.sub(r'\s+', ' ', (text or '')).strip()


def fetch_article_body(url: str) -> str:
    try:
        r = requests.get(url, timeout=TIMEOUT, headers={'User-Agent': 'Mozilla/5.0'})
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')
        for bad in soup(['script', 'style', 'nav', 'header', 'footer', 'form', 'aside']):
            bad.decompose()
        text = clean_text(soup.get_text(' '))
        return text[:12000]
    except Exception:
        return ''


def pick_defaults(text: str) -> dict[str, Any]:
    topic_map = {
        'cancer': 'がん', 'tumor': 'がん', 'oncology': 'がん',
        'stroke': '神経', 'brain': '神経', 'dementia': '神経', 'alzheimer': '神経',
        'heart': '循環器', 'cardio': '循環器', 'blood pressure': '循環器',
        'infection': '感染症', 'virus': '感染症', 'bacteria': '感染症', 'vaccine': '感染症',
        'diabetes': '糖尿病・代謝', 'obesity': '糖尿病・代謝', 'cholesterol': '糖尿病・代謝',
        'mental': '精神・メンタルヘルス', 'depression': '精神・メンタルヘルス', 'anxiety': '精神・メンタルヘルス',
        'child': '小児', 'pregnan': '妊娠・母子', 'older': '高齢者', 'elderly': '高齢者',
        'rehab': 'リハビリ', 'pain': '疼痛', 'drug': '医薬品', 'policy': '医療政策', 'public health': '公衆衛生'
    }
    text_l = text.lower()
    topics = []
    for k, v in topic_map.items():
        if k in text_l and v not in topics:
            topics.append(v)
    if not topics:
        topics = ['公衆衛生']
    areas = ['患者教育']
    if any(t in topics for t in ['がん', '感染症', '神経', '循環器', '糖尿病・代謝']):
        areas = ['外来', '病棟', '患者教育']
    audiences = ['成人', '医療従事者']
    if '小児' in topics:
        audiences = ['小児', '医療従事者', '地域住民']
    if '高齢者' in topics:
        audiences = ['高齢者', '医療従事者', '慢性疾患患者']
    evidence = '政策発表' if ('who' in text_l or 'nih' in text_l or 'cdc' in text_l) else '観察研究'
    if 'trial' in text_l or 'randomized' in text_l:
        evidence = 'RCT'
    if 'meta-analysis' in text_l or 'meta analysis' in text_l:
        evidence = 'メタ解析'
    if 'review' in text_l and evidence == '観察研究':
        evidence = 'システマティックレビュー'
    impact = 'high' if evidence in {'RCT', 'ガイドライン', '政策発表', 'メタ解析'} else 'medium'
    return {
        'topics': topics[:3],
        'clinicalAreas': areas[:3],
        'audiences': audiences[:3],
        'evidenceType': evidence if evidence in EVIDENCE_TYPE_OPTIONS else '不明',
        'practiceImpact': impact,
    }


def fallback_ja(title: str, source: str, body: str) -> dict[str, Any]:
    base = pick_defaults(f"{title} {source} {body}")
    snippet = clean_text(body)[:480]
    snippet = html.escape(snippet)
    summary = (
        f"{html.escape(title)} に関する公開情報です。<br><br>"
        f"今回の自動更新では生成要約を安定取得できなかったため、一次情報の本文から重要語を保持した簡易日本語要約に切り替えています。<br><br>"
        f"本文要点: {snippet}..."
    )
    action = '原文リンクを確認し、患者教育・観察・ケア計画への影響を現場文脈で再評価してください。'
    return {
        'titleJa': title,
        'summaryHtml': summary,
        'actionPoint': action,
        **base,
    }


def call_gemini(prompt: str) -> dict[str, Any] | None:
    api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
    if not api_key:
        return None
    schema = {
        'type': 'OBJECT',
        'properties': {
            'titleJa': {'type': 'STRING'},
            'summaryHtml': {'type': 'STRING'},
            'topics': {'type': 'ARRAY', 'items': {'type': 'STRING'}},
            'clinicalAreas': {'type': 'ARRAY', 'items': {'type': 'STRING'}},
            'audiences': {'type': 'ARRAY', 'items': {'type': 'STRING'}},
            'evidenceType': {'type': 'STRING'},
            'practiceImpact': {'type': 'STRING'},
            'actionPoint': {'type': 'STRING'},
        },
        'required': ['titleJa', 'summaryHtml', 'topics', 'clinicalAreas', 'audiences', 'evidenceType', 'practiceImpact', 'actionPoint']
    }
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        resp = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': schema,
                'temperature': 0.2,
            },
        )
        text = resp.text or ''
        return json.loads(text)
    except Exception:
        pass
    try:
        import google.generativeai as genai2
        genai2.configure(api_key=api_key)
        model = genai2.GenerativeModel(MODEL_NAME)
        resp = model.generate_content(prompt)
        text = resp.text or ''
        m = re.search(r'\{.*\}', text, re.S)
        if not m:
            return None
        return json.loads(m.group(0))
    except Exception:
        return None


def summarize_article(title: str, source: str, url: str, body: str) -> dict[str, Any]:
    prompt = f'''あなたは日本の看護師向け医療ニュース編集者です。次の公開記事を日本語で整理してください。

条件:
- 日本語で出力
- summaryHtml は 3〜5段落、<br><br> を使う
- 誇張しない
- 一次情報にない断定を避ける
- topics は候補から最大3個: {TOPIC_OPTIONS}
- clinicalAreas は候補から最大3個: {CLINICAL_AREA_OPTIONS}
- audiences は候補から最大3個: {AUDIENCE_OPTIONS}
- evidenceType は候補から1個: {EVIDENCE_TYPE_OPTIONS}
- practiceImpact は候補から1個: {PRACTICE_IMPACT_OPTIONS}
- actionPoint は看護実務における短い具体文1つ
- JSONのみ返す

配信元: {source}
タイトル: {title}
URL: {url}
本文: {body[:9000]}
'''
    data = call_gemini(prompt)
    if not isinstance(data, dict):
        return fallback_ja(title, source, body)
    base = pick_defaults(f"{title} {source} {body}")
    title_ja = clean_text(str(data.get('titleJa') or title))[:160]
    summary_html = str(data.get('summaryHtml') or '').strip()
    if not summary_html:
        return fallback_ja(title, source, body)
    if 'Gemini 無料枠' in summary_html or re.search(r'[A-Za-z]{20,}', title_ja):
        return fallback_ja(title, source, body)
    topics = [t for t in data.get('topics', []) if t in TOPIC_OPTIONS][:3] or base['topics']
    areas = [t for t in data.get('clinicalAreas', []) if t in CLINICAL_AREA_OPTIONS][:3] or base['clinicalAreas']
    audiences = [t for t in data.get('audiences', []) if t in AUDIENCE_OPTIONS][:3] or base['audiences']
    evidence = data.get('evidenceType') if data.get('evidenceType') in EVIDENCE_TYPE_OPTIONS else base['evidenceType']
    impact = data.get('practiceImpact') if data.get('practiceImpact') in PRACTICE_IMPACT_OPTIONS else base['practiceImpact']
    action = clean_text(str(data.get('actionPoint') or '')) or '原文を確認し、患者教育・観察・ケア計画への影響を検討してください。'
    return {
        'titleJa': title_ja,
        'summaryHtml': summary_html,
        'topics': topics,
        'clinicalAreas': areas,
        'audiences': audiences,
        'evidenceType': evidence,
        'practiceImpact': impact,
        'actionPoint': action,
    }


def collect_candidates() -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for feed in FEEDS:
        try:
            parsed = feedparser.parse(feed['url'])
            for e in parsed.entries[:20]:
                title = clean_text(getattr(e, 'title', ''))
                url = getattr(e, 'link', '')
                published = getattr(e, 'published', '') or getattr(e, 'updated', '')
                if not title or not url:
                    continue
                items.append({'sourceName': feed['name'], 'originalTitle': title, 'url': url, 'publishedAt': parse_dt(published).isoformat().replace('+00:00', 'Z')})
        except Exception:
            continue
    items.sort(key=lambda x: x['publishedAt'], reverse=True)
    return items


def normalize_existing(article: dict[str, Any]) -> dict[str, Any]:
    text = ' '.join([article.get('titleJa', ''), article.get('originalTitle', ''), article.get('summaryHtml', ''), article.get('sourceName', '')])
    base = pick_defaults(text)
    article['topics'] = [t for t in article.get('topics', []) if t in TOPIC_OPTIONS][:3] or base['topics']
    article['clinicalAreas'] = [t for t in article.get('clinicalAreas', []) if t in CLINICAL_AREA_OPTIONS][:3] or base['clinicalAreas']
    article['audiences'] = [t for t in article.get('audiences', []) if t in AUDIENCE_OPTIONS][:3] or base['audiences']
    article['evidenceType'] = article.get('evidenceType') if article.get('evidenceType') in EVIDENCE_TYPE_OPTIONS else base['evidenceType']
    article['practiceImpact'] = article.get('practiceImpact') if article.get('practiceImpact') in PRACTICE_IMPACT_OPTIONS else base['practiceImpact']
    article['actionPoint'] = clean_text(article.get('actionPoint', '')) or '原文を確認し、患者教育・観察・ケア計画への影響を検討してください。'
    return article


def should_repair(article: dict[str, Any]) -> bool:
    if not article.get('topics') or not article.get('clinicalAreas') or not article.get('audiences'):
        return True
    if article.get('evidenceType') in (None, '', '不明'):
        return True
    text = (article.get('summaryHtml') or '') + ' ' + (article.get('titleJa') or '')
    if 'Gemini 無料枠または一時エラー' in text:
        return True
    return False


def repair_articles(articles: list[dict[str, Any]]) -> list[dict[str, Any]]:
    repaired = 0
    out = []
    for article in articles:
        article = normalize_existing(article)
        if repaired < MAX_REPAIR_ITEMS and should_repair(article):
            body = fetch_article_body(article.get('url', ''))
            enriched = summarize_article(article.get('originalTitle', ''), article.get('sourceName', ''), article.get('url', ''), body)
            article.update(enriched)
            repaired += 1
        out.append(article)
    return out


def render_html(data: dict[str, Any]) -> str:
    payload = json.dumps(data, ensure_ascii=False)
    return HTML_TEMPLATE.replace('__DATA__', payload)


def main() -> None:
    existing = read_json(DATA_PATH, {'version': 1, 'updatedAt': now_iso(), 'articles': []})
    existing_articles = existing.get('articles', []) if isinstance(existing, dict) else []
    seen_ids = {a.get('id') for a in existing_articles if a.get('id')}
    state = read_json(STATE_PATH, {'seenUrls': []})
    seen_urls = set(state.get('seenUrls', []))

    new_articles = []
    for cand in collect_candidates():
        article_id = make_id(cand['sourceName'], cand['originalTitle'], cand['url'])
        if article_id in seen_ids or cand['url'] in seen_urls:
            continue
        body = fetch_article_body(cand['url'])
        enriched = summarize_article(cand['originalTitle'], cand['sourceName'], cand['url'], body)
        dt = parse_dt(cand['publishedAt'])
        new_articles.append({
            'id': article_id,
            'sourceName': cand['sourceName'],
            'originalTitle': cand['originalTitle'],
            'titleJa': enriched['titleJa'],
            'summaryHtml': enriched['summaryHtml'],
            'url': cand['url'],
            'publishedAt': cand['publishedAt'],
            'publishedDateKey': dt.strftime('%Y-%m-%d'),
            'publishedMonthKey': dt.strftime('%Y-%m'),
            'topics': enriched['topics'],
            'clinicalAreas': enriched['clinicalAreas'],
            'audiences': enriched['audiences'],
            'evidenceType': enriched['evidenceType'],
            'practiceImpact': enriched['practiceImpact'],
            'actionPoint': enriched['actionPoint'],
        })
        seen_urls.add(cand['url'])
        if len(new_articles) >= MAX_NEW_ITEMS:
            break

    merged = new_articles + existing_articles
    merged.sort(key=lambda a: a.get('publishedAt', ''), reverse=True)
    merged = repair_articles(merged)

    data = {'version': 1, 'updatedAt': now_iso(), 'articles': merged}
    write_json(DATA_PATH, data)
    HTML_PATH.write_text(render_html(data), encoding='utf-8')
    write_json(STATE_PATH, {'seenUrls': sorted(seen_urls)})
    print(f'updated articles={len(merged)} new={len(new_articles)}')


if __name__ == '__main__':
    main()
