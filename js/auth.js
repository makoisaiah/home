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
const SUPABASE_URL      = 'https://gnnolqhffkqikrevlbji.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdubm9scWhmZmtxaWtyZXZsYmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MDIwOTAsImV4cCI6MjA5NzA3ODA5MH0.boNc971m_iZ9u67Px8vinwk5x3XDUa4tNflv8p-9NV0';
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
    window.location.href = '../pages/login.html';
    return new Promise(() => {});
  }
  return user;
}

/**
 * ログイン済みユーザーのロール（'admin' | 'member'）を返す。
 */
async function getUserRole() {
  const sb   = await waitForClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  const { data, error } = await sb
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error) return 'member';
  return data.role;
}

/**
 * 管理者専用ページ用。admin 以外はダッシュボードへリダイレクト。
 */
async function requireAdmin() {
  const user = await requireAuth();
  const role = await getUserRole();
  if (role !== 'admin') {
    window.location.href = '../pages/dashboard.html';
    return new Promise(() => {});
  }
  return user;
}

/** ロールの数値レベルを返す */
function roleLevel(role) {
  return { guest:0, free:1, standard:2, premium:3, admin:4 }[role] ?? 0;
}

/** 現在のユーザーのロールを返す（未ログインは 'guest'）*/
async function getCurrentRole() {
  const sb = await waitForClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return 'guest';
  const { data } = await sb
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return data?.role ?? 'free';
}

/** 必要ロールを満たしているか確認。満たしていなければリダイレクト */
async function requireRole(minRole) {
  const current = await getCurrentRole();
  if (roleLevel(current) < roleLevel(minRole)) {
    window.location.href = roleLevel(current) === 0
      ? '../pages/login.html'
      : '../pages/upgrade.html';
    return new Promise(() => {});
  }
  return current;
}
/**
 * ログイン後のリダイレクト先をロールで振り分ける。
 * login.html / signup.html から呼ぶ。
 */
async function redirectByRole() {
  const role = await getUserRole();
  if (role === 'admin') {
    window.location.href = '../pages/admin.html';
  } else {
    window.location.href = '../pages/dashboard.html';
  }
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
