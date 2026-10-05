const target = decodeURIComponent(location.hash.slice(1));
document.getElementById('url').textContent = target || '(URL desconocida)';

document.getElementById('back').onclick = () => {
  // Si la pestaña se abrió sola y no hay historial, la cerramos
  if (history.length > 2) history.go(-2); else window.close();
};

// "Abrir de todas formas": permite ese dominio unos segundos y navega
document.getElementById('go').onclick = async (e) => {
  e.preventDefault();
  if (!target) return;
  await chrome.runtime.sendMessage({ type: 'allowOnce', url: target });
  location.href = target;
};
