// ===== 設定 =====
// デプロイ後にCloudflare WorkerのURLを設定してください
const WORKER_URL = 'https://newsreader-worker.pescados.workers.dev';

// trueにするとWorkerを呼ばずにモックデータを使う
// Workerをデプロイするまでの動作確認用
const USE_MOCK = (WORKER_URL === 'https://your-worker.your-subdomain.workers.dev');

// ===== 媒体メタ情報 =====
const SOURCE_META = {
  bbc:       { name: 'BBC News World', flag: '🇬🇧', badgeClass: 'bbc' },
  aljazeera: { name: 'Al Jazeera English', flag: '🌍', badgeClass: 'aljazeera' },
  nhk:       { name: 'NHK ニュース', flag: '🇯🇵', badgeClass: 'nhk' },
  npr:       { name: 'NPR', flag: '🇺🇸', badgeClass: 'npr' },
};

// ===== モックデータ =====
const MOCK_DATA = {
  articles: [
    {
      id: 'bbc-1',
      source: 'bbc',
      titleJa: '国連、中東の停戦合意への支持を表明',
      summaryJa: '国連安全保障理事会は、中東地域における停戦合意への全面的な支持を改めて表明した。事務総長は「すべての当事者が合意を遵守し、人道的支援のアクセスを確保することが不可欠だ」と述べた。今回の合意は数週間に及ぶ外交交渉の末に成立したもので、国際社会から歓迎の声が上がっている。',
      url: 'https://www.bbc.com/news/world',
      pubDate: '2026-05-27T08:00:00Z',
      groupId: 'group-1',
    },
    {
      id: 'bbc-2',
      source: 'bbc',
      titleJa: 'G7サミット、気候変動対策の強化で合意',
      summaryJa: 'イタリアで開催されたG7サミットで、各国首脳は2035年までに石炭火力発電を段階的に廃止することで合意した。また、途上国への気候変動対策支援として総額1000億ドルの資金拠出も約束された。この合意は環境団体から「不十分」との批判がある一方、産業界からは「現実的な対応」と評価されている。',
      url: 'https://www.bbc.com/news/world',
      pubDate: '2026-05-27T06:30:00Z',
      groupId: null,
    },
    {
      id: 'bbc-3',
      source: 'bbc',
      titleJa: 'AI規制を巡る国際条約の交渉が進展',
      summaryJa: '人工知能の規制に関する国際条約の交渉が大きく進展した。欧米と日本が中心となり、AIシステムの透明性確保と人権保護を柱とした枠組みについて合意の見通しが立ってきた。ただし、中国とロシアの参加については依然として不透明な状況が続いている。',
      url: 'https://www.bbc.com/news/technology',
      pubDate: '2026-05-27T05:00:00Z',
      groupId: 'group-2',
    },
    {
      id: 'bbc-4',
      source: 'bbc',
      titleJa: '欧州各地で記録的な熱波、健康被害が拡大',
      summaryJa: 'ヨーロッパ各地で5月としては観測史上最高気温を記録する熱波が続いており、特に高齢者や幼児への健康被害が報告されている。スペインとイタリアでは熱中症による死者が相次ぎ、各国政府は緊急の冷却センター設置などの対策を講じている。',
      url: 'https://www.bbc.com/news/world/europe',
      pubDate: '2026-05-26T18:00:00Z',
      groupId: 'group-3',
    },
    {
      id: 'bbc-5',
      source: 'bbc',
      titleJa: '世界銀行、アフリカ向け融資枠を拡大',
      summaryJa: '世界銀行はアフリカ諸国のインフラ整備を支援するため、今後5年間で500億ドルの融資枠拡大を発表した。特に再生可能エネルギーと農業インフラへの投資を優先する方針で、サブサハラアフリカの経済成長を後押しする狙いがある。',
      url: 'https://www.bbc.com/news/business',
      pubDate: '2026-05-26T14:00:00Z',
      groupId: null,
    },
    {
      id: 'aljazeera-1',
      source: 'aljazeera',
      titleJa: '停戦交渉の仲介役カタール、さらなる関与を表明',
      summaryJa: '中東の停戦合意を仲介してきたカタールは、合意の履行監視においても積極的な役割を果たす意向を示した。外務大臣は「持続可能な平和のためには、停戦後の復興支援と政治的対話が不可欠だ」と強調した。国際的な支持を背景に、カタールの外交的存在感が一層高まっている。',
      url: 'https://www.aljazeera.com/',
      pubDate: '2026-05-27T09:00:00Z',
      groupId: 'group-1',
    },
    {
      id: 'aljazeera-2',
      source: 'aljazeera',
      titleJa: 'ガザの人道支援、搬入量が依然として不足',
      summaryJa: '国連の最新報告によると、ガザへの人道支援物資の搬入量は必要量の30%にとどまっている。食料、医薬品、燃料が特に不足しており、現地の医療機関は機能を大幅に低下させている。国際援助機関は各国に対して、支援物資の搬入経路確保への圧力強化を訴えている。',
      url: 'https://www.aljazeera.com/',
      pubDate: '2026-05-27T07:30:00Z',
      groupId: null,
    },
    {
      id: 'aljazeera-3',
      source: 'aljazeera',
      titleJa: 'スーダン内戦、民間人への攻撃が続く',
      summaryJa: 'スーダンの内戦は2年以上続いており、国連難民高等弁務官事務所は今年に入ってからの難民数が200万人を超えたと発表した。特に北ダルフール州での民間人への無差別攻撃が深刻で、複数の人権団体が戦争犯罪として国際刑事裁判所への訴追を求めている。',
      url: 'https://www.aljazeera.com/',
      pubDate: '2026-05-27T04:00:00Z',
      groupId: null,
    },
    {
      id: 'aljazeera-4',
      source: 'aljazeera',
      titleJa: '南欧の熱波、農業に深刻な打撃',
      summaryJa: '記録的な熱波が続く南ヨーロッパでは、農業被害も深刻化している。スペインのオリーブ農家は今年の収穫量が昨年比40%減になると予測しており、イタリアでも小麦の生育に影響が出ている。農業経済学者は「気候変動による農業リスクが現実のものになってきた」と警告している。',
      url: 'https://www.aljazeera.com/',
      pubDate: '2026-05-26T20:00:00Z',
      groupId: 'group-3',
    },
    {
      id: 'aljazeera-5',
      source: 'aljazeera',
      titleJa: 'AIガバナンス条約、開発途上国の懸念が焦点に',
      summaryJa: 'AI規制の国際条約交渉において、開発途上国側からは「先進国主導の規制が技術格差を拡大させる」との懸念が強まっている。アフリカ・アジア諸国は技術移転と能力構築支援の明記を強く求めており、これが交渉の最大の争点となっている。',
      url: 'https://www.aljazeera.com/',
      pubDate: '2026-05-26T16:00:00Z',
      groupId: 'group-2',
    },
    {
      id: 'nhk-1',
      source: 'nhk',
      titleJa: '日本政府、防衛費増額の財源確保に向けた法案を提出',
      summaryJa: '政府はGDP比2%への防衛費増額に必要な財源を確保するための税制改正法案を国会に提出した。法人税の付加税と復興特別所得税の延長が主な財源で、与党内からも一部異論が出ている。野党は「国民負担の増大」として強く反発しており、国会での審議が注目される。',
      url: 'https://www.nhk.or.jp/news/',
      pubDate: '2026-05-27T10:00:00Z',
      groupId: null,
    },
    {
      id: 'nhk-2',
      source: 'nhk',
      titleJa: '東京都、2040年カーボンニュートラル目標を前倒しへ',
      summaryJa: '東京都は2040年としていたカーボンニュートラル達成目標を2038年に前倒しする方針を発表した。太陽光発電設備の設置義務化範囲の拡大と、都有施設への地中熱・水素エネルギーの活用拡大が主な施策となる。都知事は「東京がアジアの脱炭素のモデル都市になる」と強調した。',
      url: 'https://www.nhk.or.jp/news/',
      pubDate: '2026-05-27T08:30:00Z',
      groupId: null,
    },
    {
      id: 'nhk-3',
      source: 'nhk',
      titleJa: '日銀、追加利上げ検討を示唆　円相場が上昇',
      summaryJa: '日本銀行は金融政策決定会合後の声明で、物価の安定的な上昇が続いていることを確認し、年内の追加利上げを検討する姿勢を示唆した。この発表を受けて円ドル相場は一時1ドル=145円台まで円高が進んだ。市場関係者は次の利上げ時期を7月〜9月と見ており、関連する経済指標への注目が高まっている。',
      url: 'https://www.nhk.or.jp/news/',
      pubDate: '2026-05-27T03:00:00Z',
      groupId: null,
    },
    {
      id: 'nhk-4',
      source: 'nhk',
      titleJa: '九州南部で大雨警報、河川増水に注意呼びかけ',
      summaryJa: '梅雨前線の影響で九州南部を中心に大雨が降り続いており、気象庁は鹿児島県と宮崎県の一部地域に大雨警報を発令した。一部の河川では増水が続いており、住民に対して避難準備を促している。今後48時間でさらに100〜150ミリの降雨が予想されている。',
      url: 'https://www.nhk.or.jp/news/',
      pubDate: '2026-05-26T22:00:00Z',
      groupId: null,
    },
    {
      id: 'nhk-5',
      source: 'nhk',
      titleJa: '少子化対策、育児休業給付の拡充が成立',
      summaryJa: '育児休業給付金の給付率を現行の67%から80%に引き上げる法改正が参議院で可決・成立した。2027年4月からの施行が予定されており、特に男性の育休取得促進が期待されている。また、保育所の待機児童解消に向けた追加整備費として総額3000億円の予算措置も盛り込まれた。',
      url: 'https://www.nhk.or.jp/news/',
      pubDate: '2026-05-26T13:00:00Z',
      groupId: null,
    },
    {
      id: 'npr-1',
      source: 'npr',
      titleJa: '米連邦準備制度、年内利下げに慎重姿勢を維持',
      summaryJa: '米連邦準備制度理事会（FRB）は最新の政策会合で、インフレの根強さを理由に年内の利下げについて慎重な姿勢を維持した。議長は「物価安定の確信が得られるまで、現行の金利水準を保つ必要がある」と述べた。市場では早期利下げ期待が後退し、株価は小幅下落した。',
      url: 'https://www.npr.org/sections/news/',
      pubDate: '2026-05-27T11:00:00Z',
      groupId: null,
    },
    {
      id: 'npr-2',
      source: 'npr',
      titleJa: '米議会、超党派のAI安全法案を審議へ',
      summaryJa: '米連邦議会では、民主・共和両党の議員が共同提案したAI安全法案の審議が始まった。法案は高リスクAIシステムへの第三者監査の義務化と、偽情報生成ツールの規制を柱としている。テック業界は「イノベーションの阻害になる」と懸念を示しており、修正を求めるロビー活動が活発化している。',
      url: 'https://www.npr.org/sections/technology/',
      pubDate: '2026-05-27T09:30:00Z',
      groupId: 'group-2',
    },
    {
      id: 'npr-3',
      source: 'npr',
      titleJa: 'ハリケーンシーズン開幕、今年は「異常に活発」と予測',
      summaryJa: '米国立ハリケーンセンターは今年の大西洋ハリケーンシーズンについて、「異常に活発」になると予測する報告書を発表した。海水温の記録的な高さとラニーニャ現象の影響で、17〜23個のハリケーン発生が予想されており、フロリダ・テキサス沿岸の自治体は早期の避難計画策定を急いでいる。',
      url: 'https://www.npr.org/sections/climate/',
      pubDate: '2026-05-27T07:00:00Z',
      groupId: null,
    },
    {
      id: 'npr-4',
      source: 'npr',
      titleJa: 'バイデン前大統領、回顧録の出版を発表',
      summaryJa: 'ジョー・バイデン前大統領は、自身の大統領任期を振り返る回顧録の出版を発表した。出版は秋を予定しており、ウクライナ支援・コロナ禍の経済政策・再選断念の決断などについて詳細に記述するとされている。収益の一部は退役軍人支援団体に寄付される予定だ。',
      url: 'https://www.npr.org/sections/politics/',
      pubDate: '2026-05-26T20:00:00Z',
      groupId: null,
    },
    {
      id: 'npr-5',
      source: 'npr',
      titleJa: '米国の学生ローン残高、過去最高の1.8兆ドルに',
      summaryJa: '米消費者金融保護局の最新データによると、米国の学生ローン残高が過去最高の1.8兆ドルに達した。特に返済猶予期間が終了した若年層での延滞率上昇が深刻で、政策立案者の間では返済プログラムの抜本的な見直しを求める声が高まっている。',
      url: 'https://www.npr.org/sections/education/',
      pubDate: '2026-05-26T15:00:00Z',
      groupId: null,
    },
  ],
  groups: [
    {
      id: 'group-1',
      articleIds: ['bbc-1', 'aljazeera-1'],
      topic: '中東停戦',
    },
    {
      id: 'group-2',
      articleIds: ['bbc-3', 'aljazeera-5', 'npr-2'],
      topic: 'AI規制条約',
    },
    {
      id: 'group-3',
      articleIds: ['bbc-4', 'aljazeera-4'],
      topic: '欧州熱波',
    },
  ],
};

// ===== 状態管理 =====
let currentArticles = [];
let currentGroups = [];
let currentModalArticle = null;
let sectionBarScrollHandler = null;
let historyMenuOpen = false;

// ===== DOM要素取得 =====
const screens = {
  select: document.getElementById('screen-select'),
  list:   document.getElementById('screen-list'),
};
const modal         = document.getElementById('modal-summary');
const loadingOverlay = document.getElementById('loading-overlay');
const mockNotice    = document.getElementById('mock-notice');

// ===== 画面遷移 =====
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  window.scrollTo(0, 0);
  // list-main が内部スクロールコンテナになったため個別にリセット
  document.getElementById('news-list-main')?.scrollTo(0, 0);
  // 選択画面に戻る時は履歴メニューを閉じる
  if (name === 'select') {
    historyMenuOpen = false;
    renderHistoryMenu(false);
  }
}

function showModal() {
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function hideModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function showLoading() { loadingOverlay.style.display = 'flex'; }
function hideLoading() { loadingOverlay.style.display = 'none'; }

// ===== 媒体選択画面 =====
document.getElementById('btn-back').addEventListener('click', () => {
  showScreen('select');
});

document.getElementById('btn-fetch').addEventListener('click', async () => {
  const selected = Array.from(document.querySelectorAll('input[name="source"]:checked'))
    .map(cb => cb.value);

  if (selected.length === 0) {
    alert('少なくとも1つの媒体を選択してください。');
    return;
  }

  showLoading();
  try {
    const data = await fetchNews(selected);
    currentArticles = data.articles;
    currentGroups   = data.groups;
    saveToHistory(data, selected);
    renderNewsList(selected);
    showScreen('list');
    setupSectionBar();
  } catch (err) {
    console.error(err);
    alert(`ニュースの取得に失敗しました。\n${err.message}`);
  } finally {
    hideLoading();
  }
});

// ===== 履歴管理 (localStorage) =====
const HISTORY_KEY = 'news-app-history';

function saveToHistory(data, sources) {
  const history = loadHistory();
  history.unshift({
    timestamp: Date.now(),
    sources,
    articles: data.articles,
    groups:   data.groups,
  });
  if (history.length > 3) history.pop();
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('履歴の保存に失敗:', e);
  }
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function renderHistoryMenu(open) {
  const toggleBtn = document.getElementById('btn-history');
  const menu      = document.getElementById('history-menu');

  toggleBtn.textContent = open ? '過去の記事 ▴' : '過去の記事 ▾';

  if (!open) {
    menu.style.display = 'none';
    return;
  }

  const history = loadHistory();
  menu.innerHTML = '';

  if (history.length === 0) {
    menu.style.display = 'none';
    toggleBtn.textContent = '過去の記事 ▾';
    historyMenuOpen = false;
    return;
  }

  history.forEach((item, idx) => {
    const date  = new Date(item.timestamp);
    const label = date.toLocaleString('ja-JP', {
      month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    const flags = item.sources.map(s => SOURCE_META[s]?.flag || s).join('');

    const btn = document.createElement('button');
    btn.className = 'btn-history-item';
    btn.innerHTML = `
      <span class="history-item-num">${idx + 1}</span>
      <span class="history-item-date">${label}</span>
      <span class="history-item-sources">${flags}</span>
    `;
    btn.addEventListener('click', () => {
      currentArticles = item.articles;
      currentGroups   = item.groups;
      renderNewsList(item.sources);
      showScreen('list');
      setupSectionBar();
    });
    menu.appendChild(btn);
  });

  menu.style.display = 'flex';
}

document.getElementById('btn-history').addEventListener('click', () => {
  historyMenuOpen = !historyMenuOpen;
  renderHistoryMenu(historyMenuOpen);
});

// ===== ニュース取得 =====
async function fetchNews(sources) {
  if (USE_MOCK) {
    mockNotice.classList.add('visible');
    // モックは選択した媒体のみ絞り込む
    const filtered = MOCK_DATA.articles.filter(a => sources.includes(a.source));
    // 絞り込み後に使われているgroupIdのみ残す
    const usedIds = new Set(filtered.map(a => a.groupId).filter(Boolean));
    const filteredGroups = MOCK_DATA.groups.filter(g =>
      g.articleIds.every(id => filtered.some(a => a.id === id)) && usedIds.has(g.id)
    );
    await new Promise(r => setTimeout(r, 800)); // ローディング演出
    return { articles: filtered, groups: filteredGroups };
  }

  const resp = await fetch(`${WORKER_URL}/api/fetch-news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sources }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${resp.status}`);
  }
  return resp.json();
}

// ===== 関連記事マップ構築 =====
function buildRelatedMap(articles, groups) {
  const map = {}; // articleId → [関連articleId, ...]
  for (const article of articles) {
    if (!article.groupId) continue;
    const group = groups.find(g => g.id === article.groupId);
    if (!group) continue;
    map[article.id] = group.articleIds
      .filter(id => id !== article.id)
      .map(id => articles.find(a => a.id === id))
      .filter(Boolean);
  }
  return map;
}

// ===== ニュース一覧レンダリング =====
function renderNewsList(selectedSources) {
  const container = document.getElementById('news-list-main');
  container.innerHTML = '';

  const relatedMap = buildRelatedMap(currentArticles, currentGroups);

  for (const source of selectedSources) {
    const meta     = SOURCE_META[source];
    const articles = currentArticles.filter(a => a.source === source);
    if (articles.length === 0) continue;

    const section = document.createElement('div');
    section.className = 'news-section';

    // セクションヘッダー (data-source を付与して IntersectionObserver で参照)
    const header = document.createElement('div');
    header.className = 'news-section-header';
    header.dataset.source = source;
    header.innerHTML = `
      <span class="news-section-flag">${meta.flag}</span>
      <span class="news-section-name">${meta.name}</span>
    `;
    section.appendChild(header);

    // 記事リスト
    for (const article of articles) {
      const related   = relatedMap[article.id] || [];
      const item      = document.createElement('div');
      item.className  = 'news-item';

      const relatedHtml = related.length > 0
        ? `<span class="related-badge">🔗 関連: ${related.map(r => SOURCE_META[r.source].name).join(', ')}</span>`
        : '';

      item.innerHTML = `
        <div class="news-item-title">${escapeHtml(article.titleJa)}</div>
        <div class="news-item-meta">
          <span class="news-item-date">${formatDate(article.pubDate)}</span>
          ${relatedHtml}
        </div>
      `;

      item.addEventListener('click', () => openModal(article, relatedMap));
      section.appendChild(item);
    }

    container.appendChild(section);
  }
}

// ===== セクションバー制御 =====
function setupSectionBar() {
  const bar      = document.getElementById('section-bar');
  const barFlag  = document.getElementById('section-bar-flag');
  const barName  = document.getElementById('section-bar-name');
  const listMain = document.getElementById('news-list-main');
  const headers  = [...document.querySelectorAll('.news-section-header')];

  if (!bar || headers.length === 0) return;

  // 前回のリスナーを解除
  if (sectionBarScrollHandler) {
    listMain.removeEventListener('scroll', sectionBarScrollHandler);
    sectionBarScrollHandler = null;
  }

  function update() {
    const containerTop = listMain.getBoundingClientRect().top;
    // listMain の上端を基準に、それ以下の位置まで来たセクションヘッダーを追う
    let current = headers[0];
    for (const h of headers) {
      if (h.getBoundingClientRect().top - containerTop <= 1) {
        current = h;
      }
    }
    const source = current.dataset.source;
    const meta   = SOURCE_META[source];
    if (meta) {
      barFlag.textContent = meta.flag;
      barName.textContent = meta.name;
    }
  }

  sectionBarScrollHandler = update;
  listMain.addEventListener('scroll', update, { passive: true });
  update(); // 初期表示
}

// ===== モーダル表示 =====
function openModal(article, relatedMap) {
  currentModalArticle = article;

  const meta = SOURCE_META[article.source];
  const badge = document.getElementById('modal-source-badge');
  badge.textContent = meta.name;
  badge.className = `source-badge ${meta.badgeClass}`;

  document.getElementById('modal-title').textContent   = article.titleJa;
  document.getElementById('modal-date').textContent    = formatDate(article.pubDate);
  document.getElementById('modal-summary-text').textContent = article.summaryJa;
  document.getElementById('modal-link').href           = article.url;

  // 関連記事
  const related = relatedMap[article.id] || [];
  const relatedSection = document.getElementById('related-section');
  if (related.length > 0) {
    relatedSection.style.display = 'block';
    renderRelatedTabs(related);
  } else {
    relatedSection.style.display = 'none';
  }

  showModal();
}

function renderRelatedTabs(relatedArticles) {
  const tabsEl    = document.getElementById('related-tabs');
  const contentEl = document.getElementById('related-content');
  tabsEl.innerHTML    = '';
  contentEl.innerHTML = '';

  relatedArticles.forEach((article, idx) => {
    const meta = SOURCE_META[article.source];
    const tab  = document.createElement('button');
    tab.className   = `related-tab${idx === 0 ? ' active' : ''}`;
    tab.textContent = `${meta.flag} ${meta.name}`;
    tab.addEventListener('click', () => {
      tabsEl.querySelectorAll('.related-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderRelatedContent(article);
    });
    tabsEl.appendChild(tab);
  });

  renderRelatedContent(relatedArticles[0]);
}

function renderRelatedContent(article) {
  const contentEl = document.getElementById('related-content');
  contentEl.innerHTML = `
    <div class="related-article">
      <div class="related-article-title">${escapeHtml(article.titleJa)}</div>
      <div class="related-article-summary">${escapeHtml(article.summaryJa)}</div>
    </div>
  `;
}

// ===== モーダル閉じる =====
document.getElementById('modal-close').addEventListener('click', hideModal);
document.getElementById('modal-overlay').addEventListener('click', hideModal);

// ===== ユーティリティ =====
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(isoString) {
  try {
    return new Date(isoString).toLocaleString('ja-JP', {
      month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

// ===== Service Worker 登録 =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').catch(err => {
    console.warn('Service Worker 登録失敗:', err);
  });
}
