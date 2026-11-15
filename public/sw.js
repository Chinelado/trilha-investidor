// Service worker: permite usar o app offline.
// Na instalação, guarda o site inteiro (lista em precache.json, gerada no build).
// Páginas: rede primeiro (para receber conteúdo novo), com a cópia em cache como reserva.
// Arquivos estáticos: cache primeiro. Chamadas a outros domínios (Banco Central) não passam pelo cache.
// Nenhum dado seu passa por aqui: progresso e carteira ficam cifrados no armazenamento local do navegador.
const CACHE = 'trilha-dev'; // o build troca por uma versão única

self.addEventListener('install', (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      let lista = ['./'];
      try {
        lista = await (await fetch('precache.json', { cache: 'no-store' })).json();
      } catch {}
      // Um arquivo que falhe não impede a instalação dos demais.
      await Promise.all(lista.map((u) => cache.add(new Request(u, { cache: 'reload' })).catch(() => {})));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const guardar = (res) => {
    if (res.ok) {
      const copia = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copia));
    }
    return res;
  };
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(guardar).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('./'))));
  } else {
    e.respondWith(caches.match(req).then((r) => r || fetch(req).then(guardar)));
  }
});
