/**
 * auth.js — 認証ユーティリティ
 *
 * ▼ Supabase を使う場合（デフォルト）
 *   1. https://supabase.com でプロジェクト作成
 *   2. 下の SUPABASE_URL / SUPABASE_ANON_KEY を書き換える
 *
 * ▼ Firebase に切り替える場合
 *   - このファイル末尾のコメントを参照
 */

// ─── 設定（ここだけ書き換える） ───────────────────────────────────────────
const SUPABASE_URL      = 'https://xxxxxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
// ─────────────────────────────────────────────────────────────────────────

// Supabase JS v2 を CDN から読み込む
// ※ index.html / auth pages には <script> タグが不要。このファイルが動的に追加する。
(function loadSupabase() {
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  s.onload = () => {
    window._supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  };
  document.head.appendChild(s);
})();

/** Supabase クライアントが準備できるまで待つ */
function waitForClient() {
  return new Promise(resolve => {
    const id = setInterval(() => {
      if (window._supabase) { clearInterval(id); resolve(window._supabase); }
    }, 30);
  });
}

/** メール＋パスワードでサインアップ */
async function signUp(email, password) {
  const sb = await waitForClient();
  const { error } = await sb.auth.signUp({ email, password });
  if (error) throw error;
}

/** メール＋パスワードでログイン */
async function signIn(email, password) {
  const sb = await waitForClient();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

/** ログアウト */
async function signOut() {
  const sb = await waitForClient();
  await sb.auth.signOut();
}

/**
 * ログイン済みユーザーを返す。未ログインならログインページへリダイレクト。
 * 会員専用ページの先頭で await requireAuth() と呼ぶ。
 */
async function requireAuth() {
  const sb = await waitForClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    // pages/ 配下から呼ばれる前提のパス
    window.location.href = '../pages/login.html';
    return new Promise(() => {}); // リダイレクト待ち
  }
  return user;
}

/* ─────────────────────────────────────────────────────────────────────────
   Firebase Auth に切り替える場合のメモ:

   import { initializeApp } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-app.js";
   import { getAuth, createUserWithEmailAndPassword,
            signInWithEmailAndPassword, signOut as fbSignOut,
            onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-auth.js";

   const app  = initializeApp({ apiKey: "...", authDomain: "...", projectId: "..." });
   const auth = getAuth(app);

   signUp   → createUserWithEmailAndPassword(auth, email, password)
   signIn   → signInWithEmailAndPassword(auth, email, password)
   signOut  → fbSignOut(auth)
   requireAuth → onAuthStateChanged を Promise でラップ
───────────────────────────────────────────────────────────────────────── */
