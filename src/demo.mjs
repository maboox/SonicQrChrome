import { makePacket, PROFILES } from './codec.mjs';
import { readAudio, Decoder, download } from './media.mjs';
import { I18N } from './i18n.mjs';
const $ = id => document.getElementById(id), decoder = new Decoder();
const state = { lang: 'fa', busy: false, recording: false, blob: null, audio: null, packet: null, result: '', error: '', phase: 'labReady' };
let recorder, stream, chunks = [], interval, timer, startTime, url;
const tr = key => I18N[state.lang][key] || I18N[state.lang].unexpected;
const number = n => new Intl.NumberFormat(state.lang === 'fa' ? 'fa-IR' : 'en', { maximumFractionDigits: 1 }).format(n);
function render() {
  document.documentElement.lang = state.lang; document.documentElement.dir = state.lang === 'fa' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = tr(el.dataset.i18n));
  $('language').textContent = state.lang === 'fa' ? 'EN' : 'فارسی';
  $('profileHint').textContent = tr($('profile').value === 'hidden' ? 'hiddenHint' : 'fastHint');
  $('record').disabled = state.busy || state.recording;
  $('stop').hidden = !state.recording; $('clock').hidden = !state.recording;
  for (const id of ['message','password','profile']) $(id).disabled = state.busy || state.recording;
  $('output').hidden = !state.blob; $('retry').disabled = state.busy || state.recording;
  $('error').hidden = !state.error; $('error').textContent = state.error ? tr(state.error) : '';
  $('result').hidden = !state.result; $('result').textContent = state.result ? tr('labDone') + '\n' + state.result : '';
  $('status').textContent = tr(state.phase);
}
function releaseMicrophone() { stream?.getTracks().forEach(track => track.stop()); stream = null; }
async function analyze() {
  state.busy = true; state.error = ''; state.result = ''; state.phase = 'analyzing'; render();
  try { const result = await decoder.decode(state.audio, $('decodePassword').value, state.packet); state.result = result.text; state.packet = null; state.phase = 'found'; }
  catch (error) { if (error.packet) state.packet = error.packet; state.error = error.message; state.phase = 'labReady'; }
  finally { state.busy = false; render(); }
}
async function recordingFinished() {
  clearInterval(interval); clearTimeout(timer); releaseMicrophone();
  state.recording = false; state.busy = true; $('progress').hidden = true;
  $('stop').disabled = false;
  state.blob = new Blob(chunks, { type: recorder.mimeType });
  if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(state.blob); $('preview').src = url;
  state.packet = null; $('decodePassword').value = $('password').value; render();
  try { state.audio = await readAudio(state.blob); await analyze(); }
  catch (error) { state.error = error.message; state.phase = 'labReady'; }
  finally { state.busy = false; render(); }
}
$('record').onclick = async () => {
  state.busy = true; state.error = ''; state.result = ''; state.blob = null; state.audio = null; state.packet = null; render();
  try {
    const api = globalThis.__sonicQRMixerV2__;
    if (!api) throw new Error('recorderUnsupported');
    api.prepare(); // Preserve the record click's audio activation before async crypto.
    $('preview').pause();
    const profile = $('profile').value;
    const packet = await makePacket($('message').value, $('password').value, PROFILES[profile].id);
    const armed = api.arm({ packet: Array.from(packet), profile, amplitude: profile === 'hidden' ? .07 : .32 });
    $('minimum').textContent = tr('hold').replace('{n}', number(armed.duration + 1));
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false });
    const mime = ['audio/webm;codecs=opus','audio/webm'].find(type => MediaRecorder.isTypeSupported(type));
    recorder = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 128000 } : {});
    chunks = [];
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    recorder.onstop = () => void recordingFinished();
    recorder.onerror = () => { state.error = 'unexpected'; if (recorder.state !== 'inactive') recorder.stop(); releaseMicrophone(); render(); };
    recorder.start(); state.recording = true; state.phase = 'labRecording'; startTime = performance.now(); $('clock').textContent = '00:00';
    $('progress').hidden = false;
    interval = setInterval(() => {
      const status = api.status();
      state.phase = status.phase;
      if (status.detail) state.error = status.detail;
      $('progress').value = Math.min(1, status.elapsed / status.duration);
      const elapsed = (performance.now() - startTime) / 1000;
      $('clock').textContent = `${Math.floor(elapsed / 60)}:${String(Math.floor(elapsed % 60)).padStart(2,'0')}`;
      render();
    }, 150);
    timer = setTimeout(() => { if (recorder.state !== 'inactive') recorder.stop(); }, 119000);
  } catch (error) { state.error = error.code || error.message || error.name; if (!I18N.fa[state.error]) state.error = error.name; releaseMicrophone(); globalThis.__sonicQRMixerV2__?.disarm(); }
  finally { state.busy = false; render(); }
};
$('stop').onclick = () => { if (recorder?.state !== 'inactive') { $('stop').disabled = true; recorder.stop(); } };
$('download').onclick = () => { if (state.blob) download(state.blob, 'sonicqr-mixed-voice.webm'); };
$('retry').onclick = () => void analyze();
$('profile').onchange = render;
$('language').onclick = () => { state.lang = state.lang === 'fa' ? 'en' : 'fa'; render(); };
addEventListener('pagehide', () => { clearInterval(interval); clearTimeout(timer); releaseMicrophone(); globalThis.__sonicQRMixerV2__?.disarm(); decoder.cancel(); });
render();
