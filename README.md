# NewsReader

海外・国内ニュースを日本語で読む個人用PWAアプリです。

## 機能
- BBC / Al Jazeera / NHK のRSSを並列取得
- Claude APIで見出しと概要を日本語翻訳
- 同一トピックの記事を自動グルーピング
- スマホのホーム画面に追加してPWAとして動作

---

## デプロイ手順

### 1. GitHub Pages へフロントエンドをデプロイ

```bash
# リポジトリ作成後にpush
git init
git add .
git commit -m "初回コミット"
git remote add origin https://github.com/<ユーザー名>/news-app.git
git push -u origin main
```

GitHubのリポジトリページ → **Settings** → **Pages** → Source を `main` ブランチの `/ (root)` に設定。

デプロイ後のURL: `https://<ユーザー名>.github.io/news-app/`

> **注意**: `public/manifest.json` の `start_url` と `scope` の `/news-app/` はリポジトリ名に合わせて変更してください。

---

### 2. Cloudflare Workers へWorkerをデプロイ

#### 前提
- Cloudflare アカウントが必要です（無料プランで利用可能）
- Node.js がインストールされていること

```bash
# workerディレクトリに移動
cd worker

# 依存パッケージのインストール
npm install

# Cloudflare にログイン
npx wrangler login

# デプロイ
npm run deploy
```

デプロイ完了後、以下のようなURLが払い出されます:
```
https://newsreader-worker.<サブドメイン>.workers.dev
```

---

### 3. ANTHROPIC_API_KEY の設定

APIキーをWorkerの環境変数として安全に設定します。

```bash
cd worker
npx wrangler secret put ANTHROPIC_API_KEY
# プロンプトが表示されるのでAPIキーを貼り付けてEnter
```

> **注意**: `.env` ファイルや `wrangler.toml` にAPIキーを直接書かないでください。

---

### 4. フロントエンドからWorkerのURLを設定

`public/app.js` の先頭にある定数を編集します:

```js
// デプロイ後にCloudflare WorkerのURLを設定してください
const WORKER_URL = 'https://newsreader-worker.<サブドメイン>.workers.dev';
```

URLを正しいWorker URLに書き換えて再度GitHubにpushすると、GitHub Pagesに反映されます。

`WORKER_URL` がデフォルト値のままの場合、自動的にモックデータを使うデモモードで動作します。

---

## ローカルでの動作確認

Workerなしでフロントエンドのみを確認する場合は、任意のHTTPサーバーで `public/` を配信します。

```bash
# Python がある場合
cd public
python -m http.server 8080

# Node.js の npx-serve がある場合
npx serve public
```

ブラウザで `http://localhost:8080` を開くとモックデータで動作確認できます。

---

## ファイル構成

```
news-app/
├── public/              # フロントエンド (GitHub Pages)
│   ├── index.html       # 全3画面を1ファイルで管理
│   ├── style.css        # ダークモード対応スタイル
│   ├── app.js           # 画面制御・Worker呼び出し・モックデータ
│   ├── manifest.json    # PWA設定
│   ├── service-worker.js  # オフラインキャッシュ
│   └── icon.svg         # アプリアイコン
├── worker/              # Cloudflare Worker
│   ├── src/
│   │   └── index.js     # RSS取得・Claude API呼び出し
│   ├── wrangler.toml    # Worker設定
│   └── package.json
├── README.md
└── .gitignore
```

---

## 注意事項

- Cloudflare Workers の無料プランは1日10万リクエストまで。個人利用では十分です。
- Claude Haiku APIは従量課金です。使いすぎに注意してください。
- RSSによっては取得できない場合があります。その媒体の記事はスキップされます。
