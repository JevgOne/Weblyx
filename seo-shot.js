const puppeteer=require('puppeteer');
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
 const out='/private/tmp/claude-501/-Users-lunagroup/4cab6b81-fcb2-425b-b4cc-fdc70b3ef761/scratchpad';
 for(const [name,url] of [['home','https://www.weblyx.cz/'],['sluzby','https://www.weblyx.cz/sluzby'],['praha','https://www.weblyx.cz/tvorba-webu-praha']]){
  const p=await b.newPage();
  await p.setUserAgent('Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36');
  await p.setViewport({width:412,height:915,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await p.goto(url,{waitUntil:'networkidle2',timeout:60000});
  await new Promise(r=>setTimeout(r,5000));
  await p.screenshot({path:`${out}/m-${name}.png`});
  const info=await p.evaluate(()=>{
   const fixedOverlays=[...document.querySelectorAll('body *')].filter(el=>{const s=getComputedStyle(el);const r=el.getBoundingClientRect();return (s.position==='fixed'||s.position==='sticky')&&r.width>200&&r.height>150&&s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity>0.1&&r.top<window.innerHeight&&r.bottom>0;}).map(el=>el.tagName+'.'+String(el.className||'').slice(0,60)+' '+Math.round(el.getBoundingClientRect().width)+'x'+Math.round(el.getBoundingClientRect().height)+' z='+getComputedStyle(el).zIndex);
   const imgs=[...document.images].map(i=>({src:i.currentSrc.split('/').pop().slice(0,50),alt:i.alt,w:i.naturalWidth,loading:i.loading}));
   const h=[...document.querySelectorAll('h1,h2,h3')].map(e=>e.tagName+': '+e.innerText.trim().slice(0,60));
   return {fixedOverlays,imgs,headings:h,noAlt:imgs.filter(i=>!i.alt).length,title:document.title,fontsReady:!!document.fonts};
  });
  console.log('\n###',name,url);
  console.log(' fixed/sticky overlays covering viewport:',JSON.stringify(info.fixedOverlays,null,1));
  console.log(' images:',info.imgs.length,'without alt:',info.noAlt);
  info.imgs.slice(0,10).forEach(i=>console.log('   ',i.src,'| alt="'+i.alt+'" |',i.w+'px','loading='+i.loading));
  console.log(' heading outline:'); info.headings.forEach(x=>console.log('   ',x));
  await p.close();
 }
 await b.close();
})();
