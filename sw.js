/* Splot: 열 때마다 최신 파일을 먼저 받아 보고, 인터넷이 없으면 저장해 둔 파일로 열어요 */
const V='splot-v40';
const FILES=['./','index.html','manifest.webmanifest','apple-touch-icon.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  if(new URL(e.request.url).origin!==self.location.origin) return;      // 서버(Firebase) 통신은 건드리지 않아요
  e.respondWith(fetch(e.request).then(r=>{ const copy=r.clone(); caches.open(V).then(c=>c.put(e.request,copy)); return r; }).catch(()=>caches.match(e.request)));
});

/* 푸시 알림: 서버가 보낸 data 메시지를 알림으로 보여줘요 */
self.addEventListener('push',e=>{
  let d={}; try{ d=e.data?e.data.json():{}; }catch(_){}
  const x=d.data||d;
  e.waitUntil(self.registration.showNotification(x.title||'Splot',{body:x.body||'',icon:'icon-192.png',badge:'icon-192.png',tag:x.tag||'splot',renotify:true,data:{url:x.url||'./'}}));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{ for(const c of cs){ if('focus' in c) return c.focus(); } return self.clients.openWindow(url); }));
});
