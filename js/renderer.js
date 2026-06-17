/**
 * renderer.js — ブロック配列を HTML 文字列に変換する
 */
function renderBlocks(blocks) {
  return blocks.map(renderBlock).join('');
}

function renderBlock(block) {
  switch (block.type) {
    case 'hero':
      return `
        <section class="hero">
          <h1>${esc(block.title)}</h1>
          <p>${esc(block.sub)}</p>
          <a href="${escUrl(block.ctaUrl)}" class="btn btn-primary btn-lg">${esc(block.cta)}</a>
        </section>`;

    case 'text':
      return `
        <section class="container">
          ${block.heading ? `<h2>${esc(block.heading)}</h2>` : ''}
          <p style="white-space:pre-wrap;">${esc(block.body)}</p>
        </section>`;
    
    case 'image': {
      const img = `
        <img src="${esc(block.url)}" alt="${esc(block.alt)}"
             style="max-width:100%;border-radius:var(--radius);display:block;
                    transition:transform .2s, box-shadow .2s, opacity .15s;" />
        ${block.caption ? `<p style="color:var(--muted);font-size:.875rem;margin-top:.5rem;">${esc(block.caption)}</p>` : ''}`;
    
      const inner = block.link
        ? `<a href="${escUrl(block.link)}" class="img-link">${img}</a>`
        : img;
    
      return `
        <section class="container" style="text-align:${block.align||'center'}">
          ${inner}
        </section>`;
    }
  
    case 'button':
      return `
        <section class="container" style="text-align:${block.align||'center'}">
          <a href="${escUrl(block.url)}" class="btn ${block.style==='outline'?'btn-outline':'btn-primary'} btn-lg">
            ${esc(block.label)}
          </a>
        </section>`;

    case 'two-col':
    case 'three-col': {
      const cols = block.type === 'three-col'
        ? [block.left ?? [], block.center ?? [], block.right ?? []]
        : [block.left ?? [], block.right ?? []];
      const gridCols = block.type === 'three-col' ? '1fr 1fr 1fr' : '1fr 1fr';
      return `
        <section class="container">
          <div style="display:grid;grid-template-columns:${gridCols};gap:2rem;align-items:start;">
            ${cols.map(col => `<div>${renderBlocks(col)}</div>`).join('')}
          </div>
        </section>`;
    }

    case 'file': {
      const icon = '📄';
      return `
        <section class="container" style="text-align:${block.align||'left'}">
          <div style="display:inline-flex;align-items:center;gap:.75rem;
                      border:1.5px solid var(--border);border-radius:var(--radius);
                      padding:.75rem 1.25rem;background:var(--surface);">
            <span style="font-size:1.5rem;">${icon}</span>
            <div>
              <div style="font-weight:600;">${esc(block.label)}</div>
              <div style="font-size:.8rem;color:var(--muted);">${esc(block.desc ?? '')}</div>
            </div>
            <button onclick="downloadFile('${escUrl(block.path)}','${esc(block.minRole??'free')}')"
                    class="btn btn-primary" style="margin-left:.5rem;">
              ダウンロード
            </button>
          </div>
        </section>`;
    }

    default:
      return '';
  }
}

function esc(str = '') {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escUrl(str = '') {
  return String(str).replace(/"/g, '&quot;');
}

async function downloadFile(path, minRole) {
  const userRole = await getCurrentRole();
  if (roleLevel(userRole) < roleLevel(minRole)) {
    window.location.href = 'pages/upgrade.html';
    return;
  }
  const sb = await waitForClient();
  const { data, error } = await sb.storage.from('files').createSignedUrl(path, 60);
  if (error) { alert('ダウンロードに失敗しました'); return; }
  const a = document.createElement('a');
  a.href = data.signedUrl;
  a.download = path.split('/').pop();
  a.click();
}
