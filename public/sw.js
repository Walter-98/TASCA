// Never cache financial data, API responses or authenticated pages.
const CACHE='tasca-install-v2';
const PUBLIC_ASSETS=['/offline.html','/icon-192.png','/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PUBLIC_ASSETS)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('tasca-install-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]));});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){
  event.respondWith((async()=>{try{return await fetch(event.request);}catch{
   const cached=await caches.match('/offline.html');
   return new Response(cached?await cached.text():'Tasca richiede una connessione Internet.',{status:200,headers:{'Content-Type':cached?'text/html;charset=utf-8':'text/plain;charset=utf-8'}});
  }})());
 }else if(PUBLIC_ASSETS.includes(url.pathname)){
  event.respondWith((async()=>await caches.match(event.request)||fetch(event.request))());
 }
});
