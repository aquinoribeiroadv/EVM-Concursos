// ═══════════════════════════════════════════════════
// EVM Concursos — Service Worker
// ───────────────────────────────────────────────────
// ⚠️  IMPORTANTE: A cada novo deploy do index.html,
//     incremente o número da versão abaixo.
//     Ex: v1 → v2 → v3 ...
//     Isso força o browser a baixar a versão nova.
// ═══════════════════════════════════════════════════
const CACHE = 'evm-concursos-v1';

const ASSETS = [
  '/EVM-Concursos/',
  '/EVM-Concursos/index.html',
];

// Instalação: guarda os arquivos no cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Ativação: apaga caches de versões antigas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Requisições: serve do cache (rápido) e atualiza em segundo plano
self.addEventListener('fetch', e => {
  // Deixar passar chamadas externas (Google APIs, fonts, OAuth)
  if (!e.request.url.includes('/EVM-Concursos/')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      // Entrega o cache imediatamente se existir,
      // mas já atualiza em segundo plano para a próxima visita
      return cached || network;
    })
  );
});
