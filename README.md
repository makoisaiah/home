# MyApp — 静的サイト（会員ログイン付き）

GitHub Pages でホストできる、最小構成の静的サイトです。  
認証バックエンドには **Supabase**（無料枠あり）を使います。

## ファイル構成

```
/
├── index.html                  # トップページ（公開）
├── pages/
│   ├── login.html              # ログインページ
│   ├── signup.html             # 新規登録ページ
│   └── dashboard.html          # 会員専用ページ
├── css/
│   └── style.css
├── js/
│   └── auth.js                 # 認証ロジック（ここだけ設定が必要）
└── .github/workflows/
    └── deploy.yml              # GitHub Pages 自動デプロイ
```

## セットアップ手順

### 1. Supabase プロジェクトを作る

1. [supabase.com](https://supabase.com) でアカウント作成 → 新プロジェクト
2. **Project Settings → API** から以下をコピー
   - `Project URL`（例: `https://xxxx.supabase.co`）
   - `anon public` キー

### 2. auth.js を書き換える

```js
// js/auth.js の先頭
const SUPABASE_URL      = 'https://xxxx.supabase.co';   // ← 書き換え
const SUPABASE_ANON_KEY = 'eyJhbGci...';                 // ← 書き換え
```

### 3. GitHub Pages を有効にする

1. リポジトリ → **Settings → Pages**
2. Source: **GitHub Actions** を選択
3. `main` ブランチへ push すると自動デプロイ

### 4. Supabase の Auth 設定

- **Authentication → URL Configuration**  
  `Site URL` に GitHub Pages の URL（`https://<user>.github.io/<repo>/`）を設定
- メール確認が不要な場合は **Authentication → Settings → Email** で無効化可

## Firebase に切り替える場合

`js/auth.js` 末尾のコメントに手順を記載しています。

## ローカル確認

```bash
# Python が入っていれば
python -m http.server 8080
# → http://localhost:8080 を開く
```
