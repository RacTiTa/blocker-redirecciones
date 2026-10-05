# Bloqueador de redirecciones

Extensión de Chrome (Manifest V3) que frena las redirecciones automáticas hacia los dominios que elijas y te deja en la página donde estabas.

## Cómo funciona

- **Dentro de la página** (`content-main.js`): usa la Navigation API para cancelar las navegaciones que dispara un script (`location.href`, `location.replace`, meta refresh) hacia un destino bloqueado. Los clicks del usuario pasan. Al bloquear muestra un aviso con la opción **Ir igual**.
- **Respaldo** (`background.js`): reglas de `declarativeNetRequest` que llevan a `blocked.html` lo que no se pudo cancelar en la página (redirecciones del servidor, pestañas nuevas, iframes).

## Qué se bloquea

En `default-domains.js`:

- `DEFAULT_DOMAINS`: redes de popunders, anuncios y acortadores. Se cargan al instalar y se pueden sumar desde el popup con **Agregar lista recomendada**. Cada dominio incluye sus subdominios.
- `BLOCKED_URL_KEYWORDS`: bloquea solo las rutas de un dominio que contengan ciertas palabras, por ejemplo las páginas de suscripción de `ole.com.ar`.

Además, desde el popup podés agregar o quitar dominios y pausar el bloqueo.

## Instalación

1. Abrí `chrome://extensions` y activá **Modo de desarrollador**.
2. Tocá **Cargar descomprimida** y elegí esta carpeta.
3. Después de cada cambio en el código, tocá recargar en la tarjeta de la extensión.
