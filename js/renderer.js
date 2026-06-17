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
          <a href="${esc(block.ctaUrl)}" class="btn btn-primary btn-lg">${esc(block.cta)}</a>
        </section>`;

    case 'text':
      return `
        <section class="container">
          ${block.heading ? `<h2>${esc(block.heading)}</h2>` : ''}
          <p style="white-space:pre-wrap;">${esc(block.body)}</p>
        </section>`;

    case 'image':
      return `
        <section class="container" style="text-align:${block.align||'center'}">
          <img src="${esc(block.url)}" alt="${esc(block.alt)}"
               style="max-width:100%;border-radius:var(--radius);" />
          ${block.caption ? `<p style="color:var(--muted);font-size:.875rem;margin-top:.5rem;">${esc(block.caption)}</p>` : ''}
        </section>`;

    case 'button':
      return `
        <section class="container" style="text-align:${block.align||'center'}">
          <a href="${esc(block.url)}" class="btn ${block.style==='outline'?'btn-outline':'btn-primary'} btn-lg">
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

    default:
      return '';
  }
}

function esc(str = '') {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
