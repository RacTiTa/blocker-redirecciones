// Fuente de verdad: chrome.storage.sync -> { domains: string[], enabled: boolean }
// Cada dominio se traduce en una regla dinámica de declarativeNetRequest.

importScripts('default-domains.js');

const BLOCKED_PAGE = chrome.runtime.getURL('blocked.html');

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Normaliza lo que escribe el usuario: "https://www.Ejemplo.com/algo" -> "ejemplo.com"
function normalizeDomain(input) {
  let d = input.trim().toLowerCase();
  d = d.replace(/^[a-z]+:\/\//, '').split('/')[0].split('?')[0].split('#')[0];
  d = d.replace(/^www\./, '').replace(/:\d+$/, '');
  return d;
}

function buildRules(domains) {
  return domains.map((domain, i) => ({
    id: i + 1,
    priority: 1,
    action: {
      type: 'redirect',
      // \0 = URL completa que se intentó abrir; la mostramos en la página de bloqueo
      redirect: { regexSubstitution: `${BLOCKED_PAGE}#\\0` }
    },
    condition: {
      // Coincide con el dominio y cualquier subdominio (ads.ejemplo.com, www.ejemplo.com...)
      regexFilter: `^https?://([^/]*\\.)?${escapeRegex(domain)}(:[0-9]+)?([/?#].*)?$`,
      resourceTypes: ['main_frame', 'sub_frame']
    }
  }));
}

// Reglas fijas de BLOCKED_URL_KEYWORDS; usan IDs desde 1000 para no chocar con los dominios
function buildKeywordRules() {
  return BLOCKED_URL_KEYWORDS.map(({ domain, keywords }, i) => ({
    id: 1000 + i,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: { regexSubstitution: `${BLOCKED_PAGE}#\\0` }
    },
    condition: {
      // La palabra tiene que aparecer en la ruta, no en el dominio ni en la query
      regexFilter: `^https?://([^/]*\\.)?${escapeRegex(domain)}(:[0-9]+)?/[^?#]*(${keywords.map(escapeRegex).join('|')}).*$`,
      resourceTypes: ['main_frame', 'sub_frame']
    }
  }));
}

async function syncRules() {
  const { domains = [], enabled = true } = await chrome.storage.sync.get(['domains', 'enabled']);
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map(r => r.id),
    addRules: enabled ? [...buildRules(domains), ...buildKeywordRules()] : []
  });
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  // En la primera instalación arrancamos con la lista recomendada
  if (reason === 'install') {
    const { domains } = await chrome.storage.sync.get('domains');
    if (!domains) await chrome.storage.sync.set({ domains: [...DEFAULT_DOMAINS] });
  }
  syncRules();
});
chrome.runtime.onStartup.addListener(syncRules);
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && (changes.domains || changes.enabled)) syncRules();
});

// El popup usa esto para normalizar antes de guardar
const ALLOW_RULE_ID = 9999;

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'normalize') {
    sendResponse(normalizeDomain(msg.value));
  } else if (msg?.type === 'allowOnce') {
    // Regla de sesión con mayor prioridad que deja pasar el dominio durante 15 segundos
    const host = new URL(msg.url).hostname;
    chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [ALLOW_RULE_ID],
      addRules: [{
        id: ALLOW_RULE_ID,
        priority: 2,
        action: { type: 'allow' },
        condition: { requestDomains: [host], resourceTypes: ['main_frame', 'sub_frame'] }
      }]
    }).then(() => {
      setTimeout(() => chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [ALLOW_RULE_ID] }), 15000);
      sendResponse(true);
    });
    return true; // respuesta asíncrona
  }
});
