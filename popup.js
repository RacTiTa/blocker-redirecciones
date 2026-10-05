const $ = (id) => document.getElementById(id);
const DOMAIN_RE = /^([a-z0-9-]+\.)+[a-z]{2,}$/;

async function getState() {
  const { domains = [], enabled = true } = await chrome.storage.sync.get(['domains', 'enabled']);
  return { domains, enabled };
}

function showError(msg) {
  $('error').textContent = msg;
  $('error').hidden = !msg;
}

async function render() {
  const { domains, enabled } = await getState();
  $('enabled').checked = enabled;
  $('list').innerHTML = '';
  for (const d of [...domains].sort()) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = d;
    const btn = document.createElement('button');
    btn.textContent = 'Quitar';
    btn.setAttribute('aria-label', `Dejar de bloquear ${d}`);
    btn.onclick = () => removeDomain(d);
    li.append(span, btn);
    $('list').append(li);
  }
  $('empty').hidden = domains.length > 0;
  $('status').textContent = enabled
    ? `${domains.length} dominio${domains.length === 1 ? '' : 's'} bloqueado${domains.length === 1 ? '' : 's'}`
    : 'Bloqueo en pausa';
}

async function addDomain(raw) {
  const domain = await chrome.runtime.sendMessage({ type: 'normalize', value: raw });
  if (!DOMAIN_RE.test(domain)) return showError('Eso no parece un dominio. Probá con algo como ejemplo.com');
  const { domains } = await getState();
  if (domains.includes(domain)) return showError(`${domain} ya está en la lista`);
  showError('');
  await chrome.storage.sync.set({ domains: [...domains, domain] });
  $('domain').value = '';
  render();
}

async function removeDomain(domain) {
  const { domains } = await getState();
  await chrome.storage.sync.set({ domains: domains.filter(d => d !== domain) });
  render();
}

$('add-form').addEventListener('submit', (e) => { e.preventDefault(); addDomain($('domain').value); });
$('enabled').addEventListener('change', async (e) => { await chrome.storage.sync.set({ enabled: e.target.checked }); render(); });
$('add-current').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url || !/^https?:/.test(tab.url)) return showError('Esta pestaña no tiene un sitio web que se pueda bloquear');
  addDomain(new URL(tab.url).hostname);
});
$('add-defaults').addEventListener('click', async () => {
  const { domains } = await getState();
  const merged = [...new Set([...domains, ...DEFAULT_DOMAINS])];
  const added = merged.length - domains.length;
  await chrome.storage.sync.set({ domains: merged });
  showError(added ? '' : 'La lista recomendada ya está completa');
  render();
});

render();
$('domain').focus();
