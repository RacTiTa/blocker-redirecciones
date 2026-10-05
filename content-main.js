// Corre en el mundo de la página (MAIN) para poder cancelar navegaciones con la
// Navigation API. Las reglas llegan desde content.js, que sí tiene acceso a storage.
(() => {
  if (!window.navigation) return; // Chrome < 102

  let rules = null; // { domains: string[], keywordRules: {domain, keywords}[] }
  const allowed = new Set();

  document.addEventListener('bloqueador:rules', (e) => { rules = JSON.parse(e.detail); });
  document.addEventListener('bloqueador:allow', (e) => {
    allowed.add(e.detail);
    location.href = e.detail;
  });

  const onDomain = (host, d) => host === d || host.endsWith('.' + d);

  function isBlocked(url) {
    if (!rules || !/^https?:$/.test(url.protocol)) return false;
    const host = url.hostname;
    if (rules.domains.some(d => onDomain(host, d))) return true;
    const path = decodeURIComponent(url.pathname).toLowerCase();
    return rules.keywordRules.some(({ domain, keywords }) =>
      onDomain(host, domain) && keywords.some(k => path.includes(k.toLowerCase())));
  }

  navigation.addEventListener('navigate', (e) => {
    // Clicks y navegaciones del usuario pasan; solo frenamos lo que dispara un script
    if (e.userInitiated || e.hashChange || e.downloadRequest || !e.cancelable) return;
    const url = new URL(e.destination.url);
    if (allowed.has(url.href) || !isBlocked(url)) return;
    e.preventDefault();
    document.dispatchEvent(new CustomEvent('bloqueador:blocked', { detail: url.href }));
  });
})();
