// Hogwarts Flight service worker: precache the game shell, serve cache-first, refresh in the background.
const CACHE='hogwarts-flight-v3';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('hogwarts-flight-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  const nav=r.mode==='navigate';
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(nav?'./index.html':r,{ignoreSearch:true});
    const net=fetch(r).then(res=>{if(res&&res.ok&&res.type==='basic')c.put(nav?'./index.html':r,res.clone());return res;}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit;}
    return (await net)||new Response('Offline and not cached yet',{status:503,headers:{'Content-Type':'text/plain'}});
  }));});
