const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium, expect } = require('@playwright/test');
const root = path.resolve(__dirname, '..'), output = path.join(root, 'store-assets'), qa = path.join(root, 'qa');
fs.mkdirSync(output, { recursive: true }); fs.mkdirSync(qa, { recursive: true });
(async () => {
  const { makePacket, modulate, waveBytes } = await import('../src/codec.mjs');
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, new URL(req.url, 'http://localhost').pathname.slice(1));
    if (!file.startsWith(root+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
    res.setHeader('Content-Type', ({'.js':'application/javascript','.css':'text/css','.html':'text/html','.png':'image/png'})[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  });
  let browser;
  try {
    await new Promise(r=>server.listen(0,'127.0.0.1',r));
    const origin = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({ headless:true });
    const context = await browser.newContext({ viewport:{width:1280,height:800},deviceScaleFactor:1 });
    for (const lang of ['fa','en']) {
      const page = await context.newPage();
      await page.addInitScript(({lang}) => {
        const title = lang==='fa' ? 'نمایش محلی SonicQR' : 'SonicQR local demonstration';
        const target = {id:1,title,url:'http://127.0.0.1'};
        window.chrome={
          windows:{getCurrent:async()=>({id:1})},tabs:{get:async()=>target,query:async()=>[target],create:async()=>{}},
          storage:{session:{get:async()=>({'window-1':1})},local:{get:async()=>({lang}),set:async()=>{}}},
          runtime:{getURL:p=>'/'+p,getManifest:()=>({version:'0.3.0'}),onMessage:{addListener:()=>{}},sendMessage:async({type})=>({ok:true,result:type==='SITE_STATE'?{enabled:false}:{phase:'idle',duration:0,elapsed:0}})}
        };
      },{lang});
      await page.goto(origin+'/panel.html');
      const text = lang==='fa' ? 'سلام! جلسه ساعت ۱۰ است.' : 'Hello! Our meeting is at 10.';
      await page.locator('#message').fill(text); await page.locator('#build').click();
      await expect(page.locator('#ready')).toBeVisible();
      await page.evaluate(()=>document.body.style.zoom='0.85');
      await page.screenshot({path:path.join(output,`screenshot-${lang}-send.png`)});
      const fixture=path.join(qa,`store-example-${lang}.wav`);
      fs.writeFileSync(fixture,waveBytes(modulate(await makePacket(text),'fast',.32)));
      await page.locator('#receiveTab').click(); await page.locator('#audioFile').setInputFiles(fixture);
      await expect(page.locator('#resultText')).toHaveText(text,{timeout:45000});
      await page.evaluate(() => { document.body.style.zoom='0.8'; window.scrollTo(0,0); });
      if (await page.locator('#resultCard').evaluate(el => el.getBoundingClientRect().bottom) > 800) throw new Error('Store result screenshot would crop the recovered message');
      await page.screenshot({path:path.join(output,`screenshot-${lang}-read.png`)});
      await page.close();
    }
    const promo = await context.newPage();
    await promo.setViewportSize({width:440,height:280});
    const icon=fs.readFileSync(path.join(root,'assets/icon.png')).toString('base64');
    await promo.setContent(`<!doctype html><html><head><style>*{box-sizing:border-box}body{margin:0;width:440px;height:280px;display:grid;place-content:center;background:radial-gradient(circle at 90% 0,#39cabc66,transparent 65%),linear-gradient(140deg,#063e38,#087f75);font-family:Arial;color:#fff;overflow:hidden}.brand{display:flex;align-items:center;gap:22px;position:relative}.brand img{width:116px;height:116px;border:1px solid #ffffff33;box-shadow:0 18px 35px #002d2966;border-radius:28px}.name{font-size:34px;font-weight:700;letter-spacing:.6px}.wave{display:flex;gap:6px;align-items:center;height:30px;margin-top:15px}.wave i{display:block;width:6px;background:#86eadb;border-radius:8px}.ring{position:absolute;width:380px;height:380px;left:260px;top:-250px;border:1px solid #ffffff1a;border-radius:50%}.ring.two{left:-240px;top:170px;width:460px;height:460px}</style></head><body><div class="ring"></div><div class="ring two"></div><div class="brand"><img alt="" src="data:image/png;base64,${icon}"><div><div class="name">SonicQR</div><div class="wave"><i style="height:12px"></i><i style="height:22px"></i><i style="height:30px"></i><i style="height:18px"></i><i style="height:26px"></i><i style="height:10px"></i></div></div></div></body></html>`);
    await promo.screenshot({path:path.join(output,'promo-small.png')});
    fs.copyFileSync(path.join(root,'assets/icon-128.png'),path.join(output,'icon-128.png'));
    console.log('Created four 1280x800 UI screenshots, a 440x280 promo tile and the 128px store icon.');
  } finally { await browser?.close(); await new Promise(r=>server.close(r)); }
})().catch(error=>{console.error(error);process.exitCode=1;});
