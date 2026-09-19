const puppeteer = require('puppeteer');
const TARGETS = ['https://www.weblyx.cz/', 'https://www.weblyx.cz/sluzby'];
const UA_M='Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36';
const UA_D='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

async function run(url,mobile,throttle){
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
 await p.setUserAgent(mobile?UA_M:UA_D);
 await p.setViewport(mobile?{width:412,height:915,deviceScaleFactor:2.6,isMobile:true,hasTouch:true}:{width:1440,height:900});
 await p.evaluateOnNewDocument(()=>{
   window.__lcp=0;window.__lcpEl='';window.__cls=0;window.__shifts=[];
   new PerformanceObserver(l=>{for(const e of l.getEntries()){window.__lcp=e.startTime;window.__lcpEl=(e.element?e.element.tagName+'.'+String(e.element.className||'').slice(0,60):'')+' '+(e.url||'');}}).observe({type:'largest-contentful-paint',buffered:true});
   new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput){window.__cls+=e.value;if(e.value>0.01)window.__shifts.push({v:+e.value.toFixed(3),srcs:(e.sources||[]).map(s=>s.node?s.node.tagName+'.'+String(s.node.className||'').slice(0,40):'?')});}}).observe({type:'layout-shift',buffered:true});
   new PerformanceObserver(l=>{window.__inp=window.__inp||[];for(const e of l.getEntries())window.__inp.push(Math.round(e.duration));}).observe({type:'longtask',buffered:true});
 });
 const c=await p.createCDPSession();await c.send('Network.enable');
 if(throttle){await c.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8});await c.send('Emulation.setCPUThrottlingRate',{rate:4});}
 await p.goto(url,{waitUntil:'load',timeout:90000});
 await new Promise(r=>setTimeout(r,6000));
 const o=await p.evaluate(()=>{
  const nav=performance.getEntriesByType('navigation')[0]||{};
  const rs=performance.getEntriesByType('resource');
  const agg={};let total=nav.transferSize||0;
  rs.forEach(r=>{const t=r.initiatorType==='script'||/\.js(\?|$)/.test(r.name)?'js':(r.initiatorType==='css'||r.initiatorType==='link'&&/\.css/.test(r.name)||/\.css(\?|$)/.test(r.name))?'css':/\.(woff2?|ttf)/.test(r.name)?'font':/\.(png|jpe?g|webp|avif|svg|gif)/.test(r.name)?'img':'other';
   agg[t]=agg[t]||{n:0,transfer:0,decoded:0};agg[t].n++;agg[t].transfer+=r.transferSize||0;agg[t].decoded+=r.decodedBodySize||0;total+=r.transferSize||0;});
  const longtasks=(window.__inp||[]);
  return {ttfb:Math.round(nav.responseStart),fcp:Math.round((performance.getEntriesByType('paint').find(x=>x.name==='first-contentful-paint')||{}).startTime||0),
   lcp:Math.round(window.__lcp),lcpEl:window.__lcpEl,cls:+window.__cls.toFixed(3),shifts:window.__shifts.slice(0,5),
   domInteractive:Math.round(nav.domInteractive),load:Math.round(nav.loadEventEnd),htmlTransfer:nav.transferSize,htmlDecoded:nav.decodedBodySize,
   agg,total,longtasks:{count:longtasks.length,totalMs:longtasks.reduce((a,v)=>a+v,0),max:Math.max(0,...longtasks)}};
 });
 await b.close();return{url,mobile,throttle,...o};
}
(async()=>{for(const u of TARGETS){for(const m of [false,true]){const r=await run(u,m,m);
 const kb=n=>(n/1024).toFixed(0)+'kB';
 console.log(`\n=== ${r.url} [${m?'MOBILE Pixel7 412px, 4x CPU, ~1.6Mbps':'DESKTOP 1440px, unthrottled'}] ===`);
 console.log(` TTFB ${r.ttfb}ms  FCP ${r.fcp}ms  LCP ${r.lcp}ms  CLS ${r.cls}  domInteractive ${r.domInteractive}ms  load ${r.load}ms`);
 console.log(` LCP element: ${r.lcpEl}`);
 if(r.shifts.length)console.log(' shifts:',JSON.stringify(r.shifts));
 console.log(` HTML ${kb(r.htmlTransfer)} transfer / ${kb(r.htmlDecoded)} decoded`);
 Object.entries(r.agg).forEach(([k,v])=>console.log(`  ${k.padEnd(6)} ${String(v.n).padStart(3)} files  ${kb(v.transfer).padStart(8)} transfer  ${kb(v.decoded).padStart(8)} decoded`));
 console.log(` TOTAL PAGE WEIGHT ${kb(r.total)}`);
 console.log(` long tasks: ${r.longtasks.count} (${r.longtasks.totalMs}ms total, max ${r.longtasks.max}ms)`);
}}})();
