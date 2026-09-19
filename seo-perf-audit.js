const puppeteer = require('puppeteer');

const TARGETS = ['https://www.weblyx.cz/', 'https://www.weblyx.cz/sluzby', 'https://www.weblyx.cz/tvorba-webu-praha'];
const UA_D = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const UA_M = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

async function run(url, mobile, throttle) {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent(mobile ? UA_M : UA_D);
  await page.setViewport(mobile ? { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { width: 1440, height: 900 });
  const client = await page.createCDPSession();
  await client.send('Network.enable');
  if (throttle) {
    await client.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  }
  const res = { js: 0, css: 0, img: 0, font: 0, other: 0, jsFiles: 0, reqs: 0, third: {} };
  page.on('response', async (r) => {
    res.reqs++;
    const t = r.request().resourceType();
    let len = 0;
    try { len = Number(r.headers()['content-length'] || 0); if (!len) { const b = await r.buffer(); len = b.length; } } catch {}
    if (t === 'script') { res.js += len; res.jsFiles++; }
    else if (t === 'stylesheet') res.css += len;
    else if (t === 'image') res.img += len;
    else if (t === 'font') res.font += len;
    else res.other += len;
    const h = new URL(r.url()).hostname;
    if (!h.includes('weblyx.cz')) res.third[h] = (res.third[h] || 0) + len;
  });
  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
  const loadMs = Date.now() - t0;
  await new Promise(r => setTimeout(r, 4000));
  const m = await page.evaluate(() => new Promise((resolve) => {
    const out = {};
    const nav = performance.getEntriesByType('navigation')[0] || {};
    out.ttfb = Math.round(nav.responseStart || 0);
    out.domContentLoaded = Math.round(nav.domContentLoadedEventEnd || 0);
    out.load = Math.round(nav.loadEventEnd || 0);
    out.transfer = nav.transferSize;
    const fcp = performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint');
    out.fcp = fcp ? Math.round(fcp.startTime) : null;
    const lcps = performance.getEntriesByType('largest-contentful-paint');
    out.lcp = lcps.length ? Math.round(lcps[lcps.length - 1].startTime) : null;
    out.lcpEl = lcps.length ? (lcps[lcps.length-1].element ? lcps[lcps.length-1].element.tagName + '.' + (lcps[lcps.length-1].element.className||'').toString().slice(0,50) : (lcps[lcps.length-1].url||'')) : '';
    let cls = 0;
    for (const e of performance.getEntriesByType('layout-shift') || []) if (!e.hadRecentInput) cls += e.value;
    out.cls = Math.round(cls * 1000) / 1000;
    out.docWidth = document.documentElement.scrollWidth;
    out.winWidth = window.innerWidth;
    out.viewportMeta = (document.querySelector('meta[name=viewport]')||{}).content || '(none)';
    // overflowing elements
    const over = [];
    document.querySelectorAll('*').forEach(el => { const r = el.getBoundingClientRect(); if (r.width > 0 && r.right > window.innerWidth + 2) over.push(el.tagName + '.' + (el.className||'').toString().slice(0,40) + ' right=' + Math.round(r.right)); });
    out.overflow = over.slice(0, 8);
    // small tap targets
    const small = [];
    document.querySelectorAll('a,button,input,select').forEach(el => { const r = el.getBoundingClientRect(); if (r.width>0 && r.height>0 && (r.height < 24 || r.width < 24)) small.push((el.innerText||el.tagName).trim().slice(0,30) + ' ' + Math.round(r.width)+'x'+Math.round(r.height)); });
    out.smallTaps = small.length; out.smallTapSample = small.slice(0,6);
    out.bodyText = document.body.innerText.split(/\s+/).filter(Boolean).length;
    out.links = document.querySelectorAll('a[href^="/"]').length;
    resolve(out);
  }));
  await browser.close();
  return { url, mobile, throttle, loadMs, ...m, bytes: res };
}

(async () => {
  const rows = [];
  for (const u of TARGETS) {
    rows.push(await run(u, false, false));
    rows.push(await run(u, true, true));
  }
  rows.forEach(r => {
    const kb = n => (n/1024).toFixed(0)+' kB';
    console.log(`\n=== ${r.url}  [${r.mobile ? 'MOBILE 390px, 4x CPU throttle, Fast-3G-ish' : 'DESKTOP 1440px, no throttle'}] ===`);
    console.log(`  TTFB ${r.ttfb}ms | FCP ${r.fcp}ms | LCP ${r.lcp}ms | CLS ${r.cls} | load ${r.load}ms | wall ${r.loadMs}ms`);
    console.log(`  LCP element: ${r.lcpEl}`);
    console.log(`  JS ${kb(r.bytes.js)} in ${r.bytes.jsFiles} files | CSS ${kb(r.bytes.css)} | IMG ${kb(r.bytes.img)} | FONT ${kb(r.bytes.font)} | other ${kb(r.bytes.other)} | ${r.bytes.reqs} requests`);
    console.log(`  3rd-party: ${Object.entries(r.bytes.third).map(([h,v])=>h+' '+kb(v)).join(', ') || '(none)'}`);
    console.log(`  viewport meta: ${r.viewportMeta} | doc ${r.docWidth}px vs win ${r.winWidth}px ${r.docWidth>r.winWidth?'>>> HORIZONTAL OVERFLOW':''}`);
    if (r.overflow.length) console.log('  overflowing:', r.overflow.join(' | '));
    console.log(`  tap targets <24px: ${r.smallTaps} ${r.smallTapSample.join(' | ')}`);
    console.log(`  rendered words: ${r.bodyText} | internal <a href="/">: ${r.links}`);
  });
})();
