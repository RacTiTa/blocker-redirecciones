// Mundo aislado: lee las reglas de storage, se las pasa a content-main.js
// y muestra un aviso cuando se frenó una redirección.

async function sendRules() {
  const { domains = [], enabled = true } = await chrome.storage.sync.get(['domains', 'enabled']);
  const rules = enabled
    ? { domains, keywordRules: BLOCKED_URL_KEYWORDS }
    : { domains: [], keywordRules: [] };
  document.dispatchEvent(new CustomEvent('bloqueador:rules', { detail: JSON.stringify(rules) }));
}

sendRules();
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && (changes.domains || changes.enabled)) sendRules();
});

function showToast(url) {
  document.getElementById('bloqueador-toast')?.remove();
  const host = document.createElement('div');
  host.id = 'bloqueador-toast';
  const root = host.attachShadow({ mode: 'closed' });
  root.innerHTML = `
    <style>
      .t { position: fixed; z-index: 2147483647; right: 16px; bottom: 16px; max-width: 360px;
        display: flex; gap: 12px; align-items: center; padding: 10px 12px; border-radius: 8px;
        border-left: 3px solid #e8590c; background: #1d2733; color: #fff;
        font: 13px/1.4 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        box-shadow: 0 4px 16px rgba(0,0,0,.25); }
      .m { flex: 1; min-width: 0; }
      .u { display: block; opacity: .7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      button { font: inherit; border: 0; border-radius: 4px; padding: 4px 8px; cursor: pointer; }
      .go { background: #e8590c; color: #fff; }
      .x { background: none; color: #fff; opacity: .7; }
    </style>
    <div class="t" role="status">
      <span class="m">Redirección bloqueada<span class="u"></span></span>
      <button class="go">Ir igual</button>
      <button class="x" aria-label="Cerrar">✕</button>
    </div>`;
  root.querySelector('.u').textContent = url;
  root.querySelector('.x').onclick = () => host.remove();
  root.querySelector('.go').onclick = async () => {
    await chrome.runtime.sendMessage({ type: 'allowOnce', url });
    document.dispatchEvent(new CustomEvent('bloqueador:allow', { detail: url }));
  };
  document.documentElement.append(host);
  setTimeout(() => host.remove(), 8000);
}

document.addEventListener('bloqueador:blocked', (e) => showToast(e.detail));
