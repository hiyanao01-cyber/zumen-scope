// 図面スコープ: オフライン用キャッシュ（図面ファイルやメモは扱いません）
const CACHE='zumen-scope-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const put=(req,res)=>{if(res&&(res.ok||res.type==='opaque')){const c=res.clone();caches.open(CACHE).then(ca=>ca.put(req,c))}return res};
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    if(req.mode==='navigate'){ // 通信できる時は最新版、圏外ではキャッシュ
      e.respondWith(fetch(req).then(r=>put('./index.html',r)).catch(()=>caches.match('./index.html')));return;
    }
    e.respondWith(caches.match(req).then(m=>m||fetch(req).then(r=>put(req,r))));
  }else if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.match(req).then(m=>m||fetch(req).then(r=>put(req,r)).catch(()=>m)));
  }
});
