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
    browser = await chromium.launch({ executablePath: process.env.SONICQR_BROWSER_EXECUTABLE || undefined, headless:true });
    const context = await browser.newContext({ viewport:{width:500,height:1100},deviceScaleFactor:1 });
    for (const lang of ['fa','en']) {
      const page = await context.newPage();
      await page.addInitScript(({lang}) => {
        const target = {id:1,title:lang==='fa'?'نمایش محلی SonicQR':'SonicQR local demonstration',url:'http://127.0.0.1'};
        window.chrome={windows:{getCurrent:async()=>({id:1})},tabs:{get:async()=>target,query:async()=>[target],create:async()=>{}},storage:{session:{get:async()=>({'window-1':1})},local:{get:async()=>({lang}),set:async()=>{}}},runtime:{getURL:p=>'/'+p,getManifest:()=>({version:'0.4.0'}),onMessage:{addListener:()=>{}},sendMessage:async({type})=>({ok:true,result:type==='SITE_STATE'?{enabled:false}:{phase:'idle',duration:0,elapsed:0}})}};
      },{lang});
      await page.goto(origin+'/panel.html');
      const text = lang==='fa' ? 'سلام! جلسه ساعت ۱۰ است.' : 'Hello! Our meeting is at 10.';
      await page.locator('#message').fill(text); await page.locator('#build').click();
      await expect(page.locator('#ready')).toBeVisible();
      for (const mode of ['send','read']) {
        if (mode === 'read') {
          const fixture=path.join(qa,`store-example-${lang}.wav`);
          fs.writeFileSync(fixture,waveBytes(modulate(await makePacket(text),'fast',.32)));
          await page.locator('#receiveTab').click(); await page.locator('#audioFile').setInputFiles(fixture);
          await expect(page.locator('#resultText')).toHaveText(text,{timeout:45000});
          if (await page.locator('#resultCard').evaluate(el=>el.getBoundingClientRect().bottom)>1100) throw new Error('Recovered result cropped');
        }
        const raw = await page.screenshot();
        const canvas = await context.newPage(); await canvas.setViewportSize({width:1280,height:800});
        const fa = lang === 'fa';
        const title = fa ? mode==='send'?'متن کوتاه،<br>همراه وویس.':'از صدا،<br>دوباره بخوان.' : mode==='send'?'A little text.<br>A richer voice.':'From sound.<br>Back to words.';
        const description = fa ? mode==='send'?'پیامت را آماده کن، سیگنال بساز و ضبط بعدی را در سایت شروع کن.':'فایل وویس را انتخاب کن یا صدای تب را دریافت کن؛ متن داخل مرورگر خوانده می‌شود.' : mode==='send'?'Prepare a message, create its signal and arm the next voice recording on your site.':'Choose the voice file or listen to the playing tab. Recover the text inside your browser.';
        await canvas.setContent(`<!doctype html><html lang="${lang}" dir="${fa?'rtl':'ltr'}"><style>*{box-sizing:border-box}body{margin:0;width:1280px;height:800px;overflow:hidden;color:#fff;font-family:"Segoe UI",Tahoma,sans-serif;background:radial-gradient(ellipse at 80% 25%,#7541ae55,transparent 70%),#211133}.layout{height:100%;display:flex;align-items:center;justify-content:center;gap:80px;padding:45px 65px}.copy{width:560px}.badge{font-size:13px;letter-spacing:2px;color:#d6b5f8}.name{font-size:23px;margin-bottom:48px;font-weight:700}h1{font-size:${fa?65:72}px;line-height:1.23;letter-spacing:-2px;margin:0 0 28px}p{font-size:20px;line-height:1.8;color:#d9c4ed;max-width:500px}.chips{display:flex;gap:10px;margin-top:35px}.chips span{font-size:12px;padding:8px 13px;border:1px solid #ffffff29;border-radius:20px}.app{height:710px;width:auto;border-radius:20px;box-shadow:0 30px 80px #0005;border:1px solid #ffffff29}.note{font-size:11px;color:#b89dce;margin-top:45px}</style><div class="layout"><div class="copy"><div class="name">SonicQR <span class="badge">/ 0.4</span></div><h1>${title}</h1><p>${description}</p><div class="chips"><span>${fa?'پردازش محلی':'Local processing'}</span><span>${fa?'رمز اختیاری':'Optional encryption'}</span><span>Chrome</span></div><div class="note">${fa?'نمایش واقعی رابط با پیام آزمایشی محلی · نسخهٔ آزمایشی':'Actual interface with a local sample message · Beta'}</div></div><img class="app" alt="SonicQR interface" src="data:image/png;base64,${raw.toString('base64')}"></div></html>`);
        await canvas.screenshot({path:path.join(output,`screenshot-${lang}-${mode}.png`)}); await canvas.close();
      }
      await page.close();
    }
    const promo = await context.newPage(); await promo.setViewportSize({width:440,height:280});
    const icon=fs.readFileSync(path.join(root,'assets/icon.png')).toString('base64');
    await promo.setContent(`<style>body{margin:0;width:440px;height:280px;display:flex;align-items:center;justify-content:center;gap:22px;background:radial-gradient(circle at 100% 0,#9561d866,transparent 75%),#28113e;color:white;font-family:"Segoe UI",sans-serif}img{width:104px;height:104px}strong{font-size:35px;letter-spacing:-1px}p{color:#d5b7f3;font-size:13px;line-height:1.7;max-width:210px}</style><img src="data:image/png;base64,${icon}"><div><strong>SonicQR</strong><p>Let your voice carry more.<br>Text inside sound. Local by design.</p></div>`);
    await promo.screenshot({path:path.join(output,'promo-small.png')});
    fs.copyFileSync(path.join(root,'assets/icon-128.png'),path.join(output,'icon-128.png'));
    console.log('Created four bilingual 1280×800 screenshots, 440×280 promo and 128px store icon.');
  } finally { await browser?.close(); await new Promise(r=>server.close(r)); }
})().catch(error=>{console.error(error);process.exitCode=1;});
