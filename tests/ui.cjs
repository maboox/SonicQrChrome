const { chromium, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..'), qa = path.join(root, 'qa');
fs.mkdirSync(qa, { recursive: true });
(async () => {
  let browser, server;
  try {
    server = http.createServer((req, res) => {
      const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1) || 'demo.html';
      const file = path.resolve(root, name);
      if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
      res.setHeader('Content-Type', ({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)] || 'application/octet-stream');
      res.end(fs.readFileSync(file));
    });
    await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({ executablePath: process.env.SONICQR_BROWSER_EXECUTABLE || undefined, headless: true, args: ['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream'] });
    const context = await browser.newContext({ viewport: { width: 1100, height: 900 }, permissions: ['microphone'] });
    const page = await context.newPage(); const errors = []; page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin+'/demo.html');
    const text='سلام تست';
    await page.locator('#message').fill(text); await page.locator('#record').click();
    await page.waitForFunction(() => globalThis.__sonicQRMixerV2__?.status().phase === 'complete', null, { timeout: 15000 });
    await page.locator('#stop').click(); await expect(page.locator('#result')).toContainText(text, { timeout: 45000 });
    const download=page.waitForEvent('download'); await page.locator('#download').click();
    const voicePath=path.join(qa,'voice.webm'); await (await download).saveAs(voicePath);
    await page.screenshot({ path:path.join(qa,'lab-fa.png'),fullPage:true });
    console.log('PASS actual Chromium audio: microphone -> MAIN hook -> MediaRecorder WebM/Opus -> worker -> Persian message.');
    await page.locator('#message').fill('این ضبط کوتاه نباید نتیجهٔ درست بدهد');
    await page.locator('#record').click(); await page.locator('#stop').click();
    await expect(page.locator('#error')).toBeVisible({ timeout:45000 }); await expect(page.locator('#result')).toBeHidden();
    expect(await page.evaluate(() => globalThis.__sonicQRMixerV2__.status().active)).toBe(false);
    await page.locator('#message').fill('رمز'); await page.locator('#password').fill('test-password');
    await page.locator('#record').click();
    await page.waitForFunction(() => globalThis.__sonicQRMixerV2__.status().phase === 'complete',null,{timeout:15000});
    await page.locator('#stop').click(); await expect(page.locator('#result')).toContainText('رمز',{timeout:45000});
    await page.locator('#decodePassword').fill('wrong'); await page.locator('#retry').click();
    await expect(page.locator('#error')).toContainText('رمز درست نیست',{timeout:45000});
    await page.locator('#decodePassword').fill('test-password'); await page.locator('#retry').click();
    await expect(page.locator('#result')).toContainText('رمز',{timeout:45000});
    console.log('PASS early stop, mixer cleanup, AES encrypted Opus recording, wrong password and cached retry.');
    // Ordinary unarmed recordings must retain the exact original stream.
    const passthrough=await page.evaluate(async()=>{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const recorder=new MediaRecorder(stream);
      const exact=recorder.stream===stream && !recorder.sonicSession;
      stream.getTracks().forEach(track=>track.stop()); return exact;
    });
    expect(passthrough).toBe(true);
    const { makePacket } = await import('../src/codec.mjs');
    const config = { packet: Array.from(await makePacket('Guard test')), profile: 'fast', amplitude: .32 };
    const guards = await page.evaluate(async config => {
      const api = globalThis.__sonicQRMixerV2__;
      let malformedRejected = false;
      try { api.arm({ ...config, packet: [1, 2, 3] }); } catch { malformedRejected = true; }
      api.arm(config);
      const canvas = document.createElement('canvas'), video = canvas.captureStream();
      const videoRecorder = new MediaRecorder(video);
      const videoUnchanged = videoRecorder.stream === video && api.status().phase === 'armed';
      video.getTracks().forEach(track => track.stop());
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mixed = new MediaRecorder(mic);
      const consumed = api.status().phase === 'waiting';
      const next = new MediaRecorder(mic);
      const oneShot = next.stream === mic;
      mixed.start();
      api.disarm();
      const cancelled = api.status().phase === 'incomplete';
      await new Promise(resolve => { mixed.addEventListener('stop', resolve, { once: true }); mixed.stop(); });
      mic.getTracks().forEach(track => track.stop());
      return { malformedRejected, videoUnchanged, consumed, oneShot, cancelled, released: !api.status().active };
    }, config);
    expect(Object.values(guards).every(Boolean)).toBe(true);
    console.log('PASS malformed packet rejection, video recorder unchanged, one recording per arm, cancellation and cleanup.');
    // Chrome extension APIs are mocked only for this localhost panel UI test.
    const panel=await context.newPage(); panel.on('pageerror',e=>errors.push(e.message));
    await panel.addInitScript(()=>{
      window.chrome={
        windows:{getCurrent:async()=>({id:1})},
        tabs:{get:async()=>({id:1,title:'Local test page',url:'https://example.test'}),query:async()=>[{id:1,title:'Local test page',url:'https://example.test'}],create:async()=>{}},
        storage:{session:{get:async()=>({'window-1':1})},local:{get:async()=>({lang:'fa'}),set:async()=>{}}},
        runtime:{getURL:p=>'/'+p,onMessage:{addListener:()=>{}},sendMessage:async({type})=>({ok:true,result:type==='SITE_STATE'?{enabled:false}:{phase:'idle',duration:0,elapsed:0}})}
      };
    });
    await panel.goto(origin+'/panel.html'); await panel.locator('#message').fill('Panel test'); await panel.locator('#build').click();
    await expect(panel.locator('#ready')).toBeVisible();
    const signal=panel.waitForEvent('download'); await panel.locator('#saveSignal').click(); await (await signal).saveAs(path.join(qa,'signal.wav'));
    await panel.locator('#message').fill('Changed'); await expect(panel.locator('#ready')).toBeHidden();
    await panel.locator('#receiveTab').click(); await panel.locator('#audioFile').setInputFiles(voicePath);
    await expect(panel.locator('#resultText')).toHaveText(text,{timeout:45000});
    for(const lang of ['fa','en']){
      if(await panel.locator('html').getAttribute('lang')!==lang) await panel.locator('#language').click();
      for(const width of [320,360,420]){
        await panel.setViewportSize({width,height:920});
        expect(await panel.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
      }
      await panel.screenshot({path:path.join(qa,`panel-${lang}.png`),fullPage:true});
    }
    await panel.locator('#sendTab').click(); await panel.screenshot({path:path.join(qa,'panel-send.png'),fullPage:true});
    await panel.emulateMedia({colorScheme:'dark'}); await panel.screenshot({path:path.join(qa,'panel-dark.png'),fullPage:true});
    console.log('PASS inactive recorder passthrough, signal export, stale output reset, WebM file decode, both languages and layouts.');
    await panel.emulateMedia({colorScheme:'light'});
    // Privacy reset clears DOM fields and cached decoded output, without persisting drafts.
    await panel.locator('#clearSession').click();
    await expect(panel.locator('#message')).toHaveValue('');
    await expect(panel.locator('#decodePassword')).toHaveValue('');
    await expect(panel.locator('#ready')).toBeHidden();
    await panel.locator('#receiveTab').click();
    await expect(panel.locator('#resultCard')).toBeHidden();
    await expect(panel.locator('#retry')).toBeHidden();
    await panel.locator('#receiveTab').focus(); await panel.keyboard.press('Home');
    await expect(panel.locator('#sendTab')).toBeFocused();
    await expect(panel.locator('#sendTab')).toHaveAttribute('aria-selected','true');
    await panel.keyboard.press('End'); await expect(panel.locator('#receiveTab')).toBeFocused();
    // A delayed old tab lookup must not overwrite a more recent target.
    await panel.evaluate(() => {
      chrome.tabs.get = async id => {
        if (id === 2) await new Promise(resolve => window.releaseOldTarget = resolve);
        return {id,windowId:1,title:'Target '+id,url:'https://example.test/'+id+'?private=draft'};
      };
      chrome.storage.session.get = async () => ({'window-1':2});
    });
    await panel.locator('#refreshTarget').click();
    await panel.waitForFunction(() => !!window.releaseOldTarget);
    await panel.evaluate(() => { chrome.storage.session.get = async () => ({'window-1':3}); });
    await panel.locator('#refreshTarget').click();
    await expect(panel.locator('#targetName')).toHaveText('Target 3');
    await panel.evaluate(() => window.releaseOldTarget());
    await expect(panel.locator('#targetName')).toHaveText('Target 3');
    await expect(panel.locator('#targetUrl')).toHaveText('https://example.test');
    // An older polling response must not overwrite a fresh target's status.
    await panel.evaluate(() => {
      const original = chrome.runtime.sendMessage;
      chrome.runtime.sendMessage = async request => {
        if (request.type === 'STATUS' && request.tabId === 3) return new Promise(resolve => window.releaseOldStatus = () => resolve({ok:true,result:{phase:'expired'}}));
        if (request.type === 'STATUS' && request.tabId === 4) return {ok:true,result:{phase:'armed'}};
        return original(request);
      };
    });
    await panel.waitForFunction(() => !!window.releaseOldStatus);
    await panel.evaluate(() => { chrome.storage.session.get = async () => ({'window-1':4}); });
    await panel.locator('#refreshTarget').click();
    await expect(panel.locator('#targetName')).toHaveText('Target 4');
    await panel.evaluate(() => window.releaseOldStatus());
    await expect(panel.locator('#mergeState')).toContainText('Armed');
    console.log('PASS keyboard tabs, session clearing, private URL minimization, stale tab lookups and polling responses.');
    expect(errors).toEqual([]);
  } finally { await browser?.close(); await new Promise(resolve=>server?server.close(resolve):resolve()); }
})().catch(error=>{console.error(error);process.exitCode=1;});
