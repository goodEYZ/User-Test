/* Splot: 열 때마다 최신 파일을 먼저 받아 보고, 인터넷이 없으면 저장해 둔 파일로 열어요 */
const V='splot-v4';
const FILES=['./','index.html','manifest.webmanifest','apple-touch-icon.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(fetch(e.request).then(r=>{ const copy=r.clone(); caches.open(V).then(c=>c.put(e.request,copy)); return r; }).catch(()=>caches.match(e.request)));
});
