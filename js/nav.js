/**
 * nav.js — ハンバーガーナビゲーション
 * 全ページから <script src="js/nav.js"></script> で読み込む
 * ※ auth.js より後に読み込むこと
 */

async function initNav() {
  const sb = await waitForClient();

  const { data: pages } = await sb
    .from('site_pages')
    .select('id, slug, title, parent_id, sort_order, is_members_only, min_role')
    .order('sort_order');

  const userRole = await getCurrentRole();  // ← 変更

  const header = document.querySelector('.site-header nav');
  const burgerBtn = document.createElement('button');
  burgerBtn.id = 'burger-btn';
  burgerBtn.setAttribute('aria-label', 'メニューを開く');
  burgerBtn.innerHTML = `<span></span><span></span><span></span>`;
  header.prepend(burgerBtn);

  const drawer = document.createElement('div');
  drawer.id = 'nav-drawer';
  drawer.innerHTML = buildNavHTML(pages, userRole);  // ← 変更
  document.body.appendChild(drawer);

  const overlay = document.createElement('div');
  overlay.id = 'nav-overlay';
  document.body.appendChild(overlay);

  burgerBtn.addEventListener('click', () => toggleNav(true));
  overlay.addEventListener('click', () => toggleNav(false));

  injectNavStyles();
}

function toggleNav(open) {
  document.getElementById('nav-drawer').classList.toggle('open', open);
  document.getElementById('nav-overlay').classList.toggle('open', open);
  document.getElementById('burger-btn').classList.toggle('open', open);
}
function buildNavHTML(pages, userRole) {
  if (!pages || pages.length === 0) {
    return '<p class="nav-empty">ページがまだありません</p>';
  }
  const map = {};
  const roots = [];
  pages.forEach(p => { map[p.id] = { ...p, children: [] }; });
  pages.forEach(p => {
    if (p.parent_id && map[p.parent_id]) {
      map[p.parent_id].children.push(map[p.id]);
    } else {
      roots.push(map[p.id]);
    }
  });
  return '<nav class="nav-tree">' + renderNavItems(roots, userRole, 0) + '</nav>';
}

function renderNavItems(items, userRole, depth) {
  return items.map(page => {
    const required = page.min_role ?? 'guest';
    const locked   = roleLevel(userRole) < roleLevel(required);
    const indent   = depth * 1.25;
    const href     = getPageUrl(page.slug);

    let lockLabel = '';
    if (locked) {
      lockLabel = userRole === 'guest' ? '🔒' : `🔒 ${required}`;
    }

    const link = locked
      ? `<span class="nav-item nav-locked" style="padding-left:${indent + 1}rem;">
           ${lockLabel} ${escNav(page.title)}
         </span>`
      : `<a class="nav-item" href="${href}" style="padding-left:${indent + 1}rem;">
           ${depth > 0 ? '<span class="nav-indent">└</span>' : ''}
           ${escNav(page.title)}
         </a>`;

    const children = page.children.length > 0
      ? renderNavItems(page.children, userRole, depth + 1)
      : '';

    return `<div class="nav-group">${link}${children}</div>`;
  }).join('');
}

function getPageUrl(slug) {
  // index.html からの相対パスで統一
  const base = location.pathname.includes('/pages/') ? '../' : '';
  return `${base}page.html?slug=${encodeURIComponent(slug)}`;
}

function escNav(str = '') {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function injectNavStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* ハンバーガーボタン */
    #burger-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: .4rem;
      display: flex;
      flex-direction: column;
      gap: 5px;
      border-radius: var(--radius);
      transition: background .15s;
    }
    #burger-btn:hover { background: var(--surface); }
    #burger-btn span {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--text);
      border-radius: 2px;
      transition: transform .25s, opacity .25s;
    }
    #burger-btn.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    #burger-btn.open span:nth-child(2) { opacity: 0; }
    #burger-btn.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* オーバーレイ */
    #nav-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.4);
      z-index: 200;
      backdrop-filter: blur(2px);
    }
    #nav-overlay.open { display: block; }

    /* ドロワー */
    #nav-drawer {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 280px;
      background: var(--bg);
      border-right: 1px solid var(--border);
      z-index: 300;
      transform: translateX(-100%);
      transition: transform .3s cubic-bezier(.4,0,.2,1);
      overflow-y: auto;
      padding: 5rem 0 2rem;
    }
    #nav-drawer.open { transform: translateX(0); }

    /* ナビアイテム */
    .nav-tree { display: flex; flex-direction: column; }
    .nav-group { display: flex; flex-direction: column; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: .4rem;
      padding: .65rem 1rem;
      font-size: .95rem;
      color: var(--text);
      text-decoration: none;
      transition: background .15s;
    }
    .nav-item:hover { background: var(--surface); }
    .nav-locked {
      display: flex;
      align-items: center;
      gap: .4rem;
      padding: .65rem 1rem;
      font-size: .95rem;
      color: var(--muted);
      cursor: default;
    }
    .nav-indent { color: var(--muted); font-size: .8rem; }
    .nav-empty { padding: 1rem 1.5rem; color: var(--muted); font-size: .9rem; }
  `;
  document.head.appendChild(style);
}

// 自動初期化
initNav();
