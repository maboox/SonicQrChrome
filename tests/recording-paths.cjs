const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..'), qa = path.join(root, 'qa');
fs.mkdirSync(qa, { recursive: true });
(async () => {
  const { makePacket, decodeSamples, waveBytes } = await import('../src/codec.mjs');
  const fixture = new Float32Array(48000);
  for (let i = 0; i < fixture.length; i++) fixture[i] = .18 * Math.sin(2 * Math.PI * 440 * i / 48000);
  const microphoneFile = path.join(qa, 'microphone-fixture.wav');
  fs.writeFileSync(microphoneFile, waveBytes(fixture));
  esbuild.buildSync({ stdin: { contents: "import { capturePCM } from './src/media.mjs'; window.capturePCMForTest = capturePCM;", resolveDir: root }, bundle: true, outfile: path.join(qa,'capture-fixture.js'), format: 'iife' });
  const server = http.createServer((req,res) => {
    const name = new URL(req.url,'http://localhost').pathname.slice(1), p = path.resolve(root,name);
    if (!p.startsWith(root+path.sep) || !fs.existsSync(p) || !fs.statSync(p).isFile()) return res.writeHead(404).end();
    res.setHeader('Content-Type', ({'.js':'application/javascript','.html':'text/html','.css':'text/css'})[path.extname(p)]||'application/octet-stream');
    res.end(fs.readFileSync(p));
  });
  let browser;
  const reports = [];
  try {
    await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({ headless:true,args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream', '--use-file-for-fake-audio-capture='+microphoneFile] });
    const context = await browser.newContext({ permissions:['microphone'] });
    for (const route of ['custom-pcm','cached-mediarecorder','existing-mic-mediarecorder','existing-mic-web-audio','cloned-cached-recorder','delayed-web-audio','reused-microphone','cached-consumer-manual']) {
      const page = await context.newPage();
      await page.addInitScript(() => { window.cachedRecorder = window.MediaRecorder; window.cachedStart = window.MediaRecorder.prototype.start; });
      await page.goto(origin+'/demo.html');
      await page.addScriptTag({ url:origin+'/qa/capture-fixture.js' });
      const text = 'تست مسیر';
      const config = { packet:Array.from(await makePacket(text)),profile:'fast',amplitude:.32 };
      const recorded = await page.evaluate(async ({config,route}) => {
        const api = globalThis.__sonicQRMixerV2__;
        const request = () => navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false});
        let mic = route.startsWith('existing-') ? await request() : null;
        const status = api.arm(config);
        mic ||= await request();
        if (route==='cloned-cached-recorder') {
          const cloned = mic.clone(); mic.getTracks().forEach(t => t.stop()); mic = cloned;
          if (!mic.getAudioTracks().every(t => t.readyState==='live')) throw new Error('clone prematurely stopped');
        }
        if (route==='delayed-web-audio') {
          await new Promise(r=>setTimeout(r,(status.duration+.5)*1000));
          if (api.status().phase !== 'waiting' || api.status().elapsed !== 0) throw new Error('signal started before a recorder consumed the microphone');
        }
        let audio;
        if (['custom-pcm','existing-mic-web-audio','delayed-web-audio'].includes(route)) {
          const capture = await window.capturePCMForTest(mic);
          await new Promise(r=>setTimeout(r,(status.duration+1.2)*1000));
          audio = await capture.stop();
        } else {
          async function record() {
            const Constructor = route==='existing-mic-mediarecorder' ? MediaRecorder : window.cachedRecorder;
            const recorder = new Constructor(mic,{mimeType:'audio/webm;codecs=opus',audioBitsPerSecond:128000});
            const chunks=[]; recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
            const stopped=new Promise(resolve=>recorder.onstop=resolve);
            if (route==='cached-consumer-manual') {
              window.cachedStart.call(recorder);
              if (api.status().phase !== 'waiting') throw new Error('cached consumer incorrectly reported recording');
              api.startSignal();
            } else recorder.start();
            await new Promise(r=>setTimeout(r,(status.duration+1.2)*1000));
            recorder.stop(); await stopped;
            const ctx=new AudioContext({sampleRate:48000});
            const b=await ctx.decodeAudioData(await new Blob(chunks,{type:recorder.mimeType}).arrayBuffer());
            const result={samples:b.getChannelData(0),sampleRate:b.sampleRate}; await ctx.close();
            return result;
          }
          audio = await record();
          if (route==='reused-microphone') {
            if (api.status().active || mic.getAudioTracks()[0].readyState !== 'live') throw new Error('microphone cannot be reused');
            api.arm(config);
            // The cached constructor is already saved; start() must consume a new arm.
            audio = await record();
          }
          mic.getTracks().forEach(track=>track.stop());
        }
        const report=api.status(); api.disarm();
        return { samples:Array.from(audio.samples),sampleRate:audio.sampleRate,report };
      },{config,route});
      const result = await decodeSamples(Float32Array.from(recorded.samples),recorded.sampleRate);
      assert.equal(result.text,text,route);
      // Check that the ordinary microphone continues alongside the signal.
      const n=Math.floor(recorded.sampleRate*.5), offset=recorded.samples.length-n;
      let real=0,imag=0;
      for(let i=0;i<n;i++){const angle=2*Math.PI*440*i/recorded.sampleRate;real+=recorded.samples[offset+i]*Math.cos(angle);imag+=recorded.samples[offset+i]*Math.sin(angle);}
      const voiceAmplitude=2*Math.hypot(real,imag)/n;
      assert.ok(voiceAmplitude>.025, `${route}: normal microphone missing (${voiceAmplitude})`);
      assert.ok(recorded.report.outputPeak>.1, `${route}: missing output diagnostic`);
      reports.push({route,decoded:true,voiceAmplitude,...recorded.report});
      console.log('PASS',route,'complete text and normal microphone in actual recording.');
      await page.close();
    }
    const guardPage = await context.newPage();
    await guardPage.addInitScript(() => {
      window.cachedRecorder = window.MediaRecorder;
      const NativeContext = window.AudioContext;
      window.AudioContext = class extends NativeContext {
        constructor(...args) { super(...args); window.lastContext = this; }
      };
    });
    await guardPage.goto(origin+'/demo.html');
    const guardConfig = {packet:Array.from(await makePacket('guard')),profile:'fast',amplitude:.32};
    const guards = await guardPage.evaluate(async config => {
      const api = window.__sonicQRMixerV2__;
      const mic = await navigator.mediaDevices.getUserMedia({audio:true});
      api.arm(config); await window.lastContext.suspend();
      const blocked = new MediaRecorder(mic);
      const preservesVoice = blocked.stream===mic && api.status().detail==='audioBlocked' && api.status().phase==='error';
      const oldRecorder = new window.cachedRecorder(mic);
      api.arm(config); oldRecorder.start();
      const reportsBypass = oldRecorder.stream===mic && api.status().phase==='armed' && api.status().detail==='recorderUnmixed';
      await new Promise(resolve=>{oldRecorder.addEventListener('stop',resolve,{once:true});oldRecorder.stop();});
      api.disarm(); mic.getTracks().forEach(t=>t.stop());
      return {preservesVoice,reportsBypass};
    },guardConfig);
    assert.deepEqual(guards,{preservesVoice:true,reportsBypass:true});
    console.log('PASS suspended audio preserves original microphone; cached raw recorder reports bypass instead of success.');
    await guardPage.close();
    fs.writeFileSync(path.join(qa,'recording-paths.json'),JSON.stringify(reports,null,2));
  } finally { await browser?.close(); await new Promise(resolve=>server.close(resolve)); }
})().catch(error=>{console.error(error);process.exitCode=1;});
