// ===== RSS フィード設定 =====
// lang: 'ja' の媒体は Claude API での翻訳をスキップし原文をそのまま返す
const ALL_SOURCES = [
  { id: 'bbc',        name: 'BBC',                url: 'https://feeds.bbci.co.uk/news/world/rss.xml',       lang: 'en' },
  { id: 'aljazeera',  name: 'Al Jazeera',         url: 'https://www.aljazeera.com/xml/rss/all.xml',         lang: 'en' },
  { id: 'npr',        name: 'NPR',                url: 'https://feeds.npr.org/1001/rss.xml',                lang: 'en' },
  { id: 'scmp',       name: 'SCMP',               url: 'https://www.scmp.com/rss/91/feed',                  lang: 'en' },
  { id: 'reuters',    name: 'Reuters',            url: 'https://feeds.reuters.com/reuters/worldNews',       lang: 'en' },
  { id: 'guardian',   name: 'The Guardian',       url: 'https://www.theguardian.com/world/rss',             lang: 'en' },
  { id: 'dw',         name: 'Deutsche Welle',     url: 'https://rss.dw.com/rdf/rss-en-world',              lang: 'en' },
  { id: 'mercopress', name: 'MercoPress',         url: 'https://en.mercopress.com/rss/latin-america',      lang: 'en' },
  { id: 'abc_au',     name: 'ABC Australia',      url: 'https://www.abc.net.au/news/feed/2942460/rss.xml',  lang: 'en' },
  { id: 'africanews', name: 'Africanews',         url: 'https://www.africanews.com/feed/rss',               lang: 'en' },
  { id: 'toyo',       name: '東洋経済オンライン', url: 'https://toyokeizai.net/list/feed/rss',              lang: 'ja' },
];

// id → source オブジェクトのマップ（O(1)検索用）
const SOURCE_MAP = Object.fromEntries(ALL_SOURCES.map(s => [s.id, s]));

const ARTICLES_PER_SOURCE = 5;

// ===== メインハンドラ =====
export default {
  async fetch(request, env) {
    // CORS プリフライト
    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }

    const url = new URL(request.url);

    if ((request.method === 'POST' || request.method === 'GET') && url.pathname === '/api/fetch-news') {
      return handleFetchNews(request, env);
    }

    return corsResponse(JSON.stringify({ error: 'Not Found' }), 404);
  },
};

// ===== /api/fetch-news =====
async function handleFetchNews(request, env) {
  // トークン認証: Authorization: Bearer <token> を検証
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!env.APP_SECRET_TOKEN || token !== env.APP_SECRET_TOKEN) {
    return corsResponse(JSON.stringify({ error: 'Unauthorized' }), 401);
  }

  // GET / POST 両対応: POST は body から selectedIds を取得、GET は後方互換でデフォルト使用
  let selectedIds;
  if (request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    selectedIds = Array.isArray(body.selectedIds) && body.selectedIds.length > 0
      ? body.selectedIds
      : null;
  } else {
    // GET の場合はデフォルト媒体を使う（後方互換）
    selectedIds = null;
  }

  // selectedIds が null または空の場合はデフォルト5媒体
  if (!selectedIds || selectedIds.length === 0) {
    selectedIds = ['bbc', 'aljazeera', 'npr', 'scmp', 'toyo'];
  }

  // 未知の媒体IDを除外（不正なIDが混入しても安全に続行）
  const validIds = selectedIds.filter(id => SOURCE_MAP[id]);
  if (validIds.length === 0) {
    return corsResponse(JSON.stringify({ error: '有効な媒体が指定されていません' }), 400);
  }

  // 1. RSS を並列取得
  const rssResults = await Promise.allSettled(
    validIds.map(id => fetchRss(id))
  );

  const rawArticles = [];
  for (let i = 0; i < validIds.length; i++) {
    const result = rssResults[i];
    if (result.status === 'fulfilled') {
      rawArticles.push(...result.value);
    } else {
      console.error(`RSS取得失敗 [${validIds[i]}]:`, result.reason);
    }
  }

  if (rawArticles.length === 0) {
    return corsResponse(JSON.stringify({ error: 'すべてのRSS取得に失敗しました' }), 502);
  }

  // 2. Claude API で翻訳・グルーピング
  // try/catch で囲み、例外でもCORSヘッダー付きエラーを返す
  try {
    const processed = await processWithClaude(rawArticles, env.ANTHROPIC_API_KEY);
    return corsResponse(JSON.stringify(processed), 200);
  } catch (err) {
    console.error('processWithClaude エラー:', err);
    return corsResponse(JSON.stringify({ error: `処理エラー: ${err.message}` }), 500);
  }
}

// ===== RSS 取得・パース =====
async function fetchRss(sourceId) {
  const source = SOURCE_MAP[sourceId];
  const resp = await fetch(source.url, {
    headers: { 'User-Agent': 'NewsReader-Bot/1.0' },
    cf: { cacheTtl: 300 }, // Cloudflare CDNキャッシュ 5分
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

  const xml = await resp.text();
  return parseRss(xml, sourceId);
}

function parseRss(xml, sourceId) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null && items.length < ARTICLES_PER_SOURCE) {
    const block = match[1];

    const title   = extractTag(block, 'title');
    const link    = extractTag(block, 'link') || extractAttr(block, 'link', 'href');
    const desc    = extractTag(block, 'description');
    const pubDate = extractTag(block, 'pubDate') || extractTag(block, 'dc:date');

    if (!title || !link) continue;

    items.push({
      id: `${sourceId}-${items.length + 1}`,
      source: sourceId,
      titleOrig: stripHtml(title),
      summaryOrig: stripHtml(desc || ''),
      url: link.trim(),
      pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
    });
  }

  return items;
}

function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 's'));
  return m ? m[1].trim() : null;
}

function extractAttr(xml, tag, attr) {
  const m = xml.match(new RegExp(`<${tag}[^>]*${attr}="([^"]+)"`, 'i'));
  return m ? m[1] : null;
}

function stripHtml(str) {
  return str
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .trim();
}

// ===== Claude API 処理 =====
async function processWithClaude(articles, apiKey) {
  // 英語記事のみ Claude で翻訳・グルーピング。日本語記事は原文のまま返す。
  const enArticles = articles.filter(a => SOURCE_MAP[a.source]?.lang !== 'ja');

  // 英語記事がなければ Claude API 不要
  if (enArticles.length === 0) {
    return {
      articles: articles.map(a => ({
        id: a.id, source: a.source,
        titleJa: a.titleOrig, summaryJa: a.summaryOrig,
        url: a.url, pubDate: a.pubDate, groupId: null,
      })),
      groups: [],
    };
  }

  // 英語記事のみを 1-based 連番でプロンプトに渡す
  const articleList = enArticles.map((a, i) =>
    `[${i + 1}] 媒体: ${a.source}\nタイトル: ${a.titleOrig}\n概要: ${a.summaryOrig || '(なし)'}`
  ).join('\n\n');

  const prompt = `以下は複数のニュース媒体から収集した記事一覧です。
各記事の番号は1から始まります。

${articleList}

以下の形式の厳密なJSONを返してください。推測・補足・説明文は一切不要です。

{
  "articles": [
    {
      "index": <元の番号(整数)>,
      "titleJa": "<タイトルの日本語訳>",
      "summaryJa": "<概要の日本語訳、3〜5行程度。概要がない場合は空文字>"
    }
  ],
  "groups": [
    {
      "id": "<グループID文字列、例: group-1>",
      "articleIndexes": [<同じトピックを扱う記事の番号(整数)の配列。2件以上>],
      "topic": "<グループのトピック概要(日本語、10文字以内)>"
    }
  ]
}

注意事項:
- 翻訳は原文に忠実に行い、推測や補足を加えないこと
- グルーピングは確信が持てる場合のみ行うこと(同じ事件・出来事を指している場合)
- 同じ媒体の記事を同じグループに入れないこと
- グルーピングがない場合は "groups" を空配列にすること
- JSONのみ返し、前後に説明文を付けないこと`;

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Claude API エラー: ${resp.status} ${errText}`);
  }

  const claudeResult = await resp.json();
  if (!claudeResult.content?.[0]?.text) {
    throw new Error('Claude API から空のレスポンスを受信しました');
  }
  const rawJson = claudeResult.content[0].text.trim();

  // JSONブロックが ```json ... ``` で囲まれている場合に対応
  const jsonStr = rawJson.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  const parsed = JSON.parse(jsonStr);

  // Claude の結果と元データをマージ
  // enArticles のインデックス(1-based)でマッピングし、日本語記事は原文のまま合成
  return mergeResults(articles, enArticles, parsed);
}

// ===== マージ処理 =====
// allArticles: 全記事(元の順序), enArticles: Claudeに渡した英語記事のみ
function mergeResults(allArticles, enArticles, claudeResult) {
  // Claude の翻訳結果を enArticles の 1-based インデックスでマップ
  const translationMap = {};
  for (const t of claudeResult.articles) {
    translationMap[t.index] = { titleJa: t.titleJa, summaryJa: t.summaryJa };
  }

  // groupId を英語記事に付与(インデックスは enArticles 内の番号)
  const articleGroupMap = {};
  const groups = [];
  (claudeResult.groups || []).forEach((g, i) => {
    const groupId = g.id || `group-${i + 1}`;
    const articleIds = [];
    for (const idx of g.articleIndexes) {
      const article = enArticles[idx - 1];
      if (article) {
        articleGroupMap[article.id] = groupId;
        articleIds.push(article.id);
      }
    }
    groups.push({ id: groupId, articleIds, topic: g.topic });
  });

  // 全記事を元の順序で返す。日本語記事は原文、英語記事はClaudeの翻訳を使用。
  const articles = allArticles.map(a => {
    const isJa = SOURCE_MAP[a.source]?.lang === 'ja';
    if (isJa) {
      return {
        id: a.id, source: a.source,
        titleJa: a.titleOrig, summaryJa: a.summaryOrig,
        url: a.url, pubDate: a.pubDate, groupId: null,
      };
    }
    const enIdx = enArticles.indexOf(a);
    const trans = enIdx >= 0 ? (translationMap[enIdx + 1] || {}) : {};
    return {
      id: a.id, source: a.source,
      titleJa: trans.titleJa || a.titleOrig,
      summaryJa: trans.summaryJa || a.summaryOrig,
      url: a.url, pubDate: a.pubDate,
      groupId: articleGroupMap[a.id] || null,
    };
  });

  return { articles, groups };
}

// ===== CORS レスポンス生成 =====
function corsResponse(body, status = 200) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  return new Response(body, { status, headers });
}
