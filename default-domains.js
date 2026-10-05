// Lista recomendada: redes de anuncios popunder / redirección forzada muy comunes.
// Se carga sola al instalar la extensión y se puede sumar desde el popup.
// Cada dominio también bloquea sus subdominios. Editá libremente.
const DEFAULT_DOMAINS = [
  // Popunders y "onclick" ads
  'popads.net',
  'popcash.net',
  'propellerads.com',
  'onclickads.net',
  'onclkds.com',
  'monetag.com',
  'clickadu.com',
  'hilltopads.net',
  'adcash.com',
  'admaven.com',
  'popmyads.com',
  'galaksion.com',
  'clickaine.com',
  'richpartners.co',
  'adsterra.com',

  // Redes de tráfico adulto/streaming que redirigen
  'exoclick.com',
  'realsrv.com',
  'juicyads.com',
  'trafficjunky.net',
  'trafficstars.com',
  'tsyndicate.com',

  // Acortadores con anuncios intersticiales
  'adf.ly',
  'shorte.st',
  'ouo.io',
  'linkvertise.com'
];

// Reglas por palabra clave: bloquean solo las URLs de ese dominio cuya ruta
// contenga alguna de las palabras (el resto del sitio sigue funcionando).
// Ej: https://www.ole.com.ar/suscripciones/landing-choque.html
const BLOCKED_URL_KEYWORDS = [
  { domain: 'ole.com.ar', keywords: ['suscripcion', 'subscription'] }
];
