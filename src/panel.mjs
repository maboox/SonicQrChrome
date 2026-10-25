import { makePacket, modulate, waveBytes, PROFILES, SAMPLE_RATE } from './codec.mjs';
import { Decoder, readAudio, capturePCM, download } from './media.mjs';
import { I18N } from './i18n.mjs';
import { renderIcons } from './icons.mjs';
const $ = id => document.getElementById(id), decoder = new Decoder();
const state = { lang: 'fa', tab: 'send', target: null, signal: null, phase: 'idle', busy: false, capture: null, starting: false, audio: null, packet: null, result: null, poll: false, error: '', notice: '', revision: 0, active: false, status: {} };
let previewUrl = null;
let targetRevision = 0, statusRevision = 0, pendingTarget = null, disposed = false;
renderIcons();
const tr = key => I18N[state.lang][key] || I18N[state.lang].unexpected;
const number = x => new Intl.NumberFormat(state.lang === 'fa' ? 'fa-IR' : 'en', { maximumFractionDigits: 1 }).format(x);
function supportedTarget() {
  try { const u = new URL(state.target?.url); return u.protocol === 'https:' || u.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(u.hostname); } catch { return false; }
}
function feedback(code, notice = false) { state[notice ? 'notice' : 'error'] = code; render(); }
function render() {
  document.documentElement.lang = state.lang; document.documentElement.dir = state.lang === 'fa' ? 'rtl' : 'ltr';
  document.body.dataset.mode = state.tab; document.body.dataset.ready = String(!!state.signal);
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = tr(el.dataset.i18n));
  $('languageLabel').textContent = state.lang === 'fa' ? 'EN' : 'فارسی';
  document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = tr(el.dataset.i18nTitle); el.setAttribute('aria-label', el.title); });
  $('message').placeholder = state.lang === 'fa' ? 'پیامت را بنویس…' : 'Write your message…';
  $('password').placeholder = state.lang === 'fa' ? 'اختیاری' : 'Optional';
  $('sendPanel').hidden = state.tab !== 'send'; $('receivePanel').hidden = state.tab !== 'receive';
  for (const tab of ['send','receive']) { $(tab+'Tab').classList.toggle('selected', state.tab === tab); $(tab+'Tab').setAttribute('aria-selected', String(state.tab === tab)); $(tab+'Tab').tabIndex = state.tab === tab ? 0 : -1; $(tab+'Tab').disabled = state.busy || state.starting || !!state.capture; }
  const length = Array.from($('message').value).length;
  $('count').textContent = `${number(length)} / ${number(500)}`;
  $('count').style.color = length > 500 ? 'var(--red)' : '';
  $('profileHint').textContent = tr($('profile').value === 'hidden' ? 'hiddenHint' : 'fastHint');
  $('build').disabled = !$('message').value.trim() || length > 500 || state.busy || state.active || state.starting || !!state.capture;
  $('buildLabel').textContent = tr(state.busy && state.tab === 'send' ? 'building' : 'build');
  for (const id of ['message','password','profile','strength']) $(id).disabled = state.busy || state.active || state.starting || !!state.capture;
  $('ready').hidden = !state.signal;
  $('arm').disabled = !state.signal || !supportedTarget() || state.busy || state.active || state.phase === 'armed' || !!state.capture || state.starting;
  $('disarm').hidden = !['armed','waiting','recording'].includes(state.phase) && !state.active;
  $('mergeState').textContent = tr(state.phase);
  const status = state.status;
  const route = { microphone: 'pathMicrophone', 'media-recorder': 'pathRecorder', 'web-audio': 'pathWebAudio', manual: 'pathManual' }[status.route] || 'pathNone';
  const context = status.context === 'running' ? 'contextRunning' : status.context === 'suspended' ? 'contextSuspended' : 'contextNone';
  $('pathDetail').textContent = `${tr(route)} · ${tr(context)} · ${tr('outputLevel')}: ${number((status.outputPeak || 0) * 100)}%`;
  $('mixDetail').textContent = status.detail ? tr(status.detail) : '';
  $('copyDiagnostics').disabled = !state.target;
  $('manualStart').hidden = state.phase !== 'waiting';
  $('startSignal').disabled = state.busy;
  $('holdTip').textContent = state.signal ? tr('hold').replace('{n}', number(state.signal.duration + 1)) : '';
  $('duration').textContent = state.signal ? `${number(state.signal.duration)} ${tr('seconds')}` : '';
  $('captureTab').disabled = !supportedTarget() || state.busy || state.starting || !!state.capture || state.active || state.phase === 'armed';
  for (const id of ['enableSite', 'disableSite']) $(id).disabled = !supportedTarget() || state.busy || state.active || state.starting || !!state.capture;
  $('refreshTarget').disabled = state.busy || state.active || state.starting || !!state.capture;
  $('clearSession').disabled = state.busy || state.active || state.starting || !!state.capture;
  $('audioFile').disabled = state.busy || state.starting || !!state.capture;
  $('decodePassword').disabled = state.busy || state.starting || !!state.capture;
  $('stopCapture').hidden = !state.capture; $('captureClock').hidden = !state.capture;
  $('analysis').hidden = !(state.busy && state.tab === 'receive');
  $('resultCard').hidden = !state.result; if (state.result) $('resultText').textContent = state.result.text;
  $('retry').hidden = !state.audio && !state.packet; $('retry').disabled = state.busy || !!state.capture || state.starting;
  $('error').hidden = !state.error; $('error').textContent = state.error ? tr(state.error) : '';
  $('notice').hidden = !state.notice; $('notice').textContent = state.notice ? tr(state.notice) : '';
  $('targetName').textContent = state.target?.title || tr('noTarget');
  try { $('targetUrl').textContent = new URL(state.target.url).origin; } catch { $('targetUrl').textContent = ''; }
}
async function message(type, extra = {}, tabId = state.target?.id) {
  if (['ARM', 'DISARM', 'START_SIGNAL', 'ENABLE_SITE', 'DISABLE_SITE'].includes(type)) statusRevision++;
  const response = await chrome.runtime.sendMessage({ type, tabId, ...extra });
  if (!response?.ok) throw new Error(response?.error || 'unexpected');
  return response.result;
}
function setStatus(status) {
  state.status = status;
  state.phase = status.phase || 'idle'; state.active = !!status.active;
  $('mergeProgress').hidden = !['recording','complete','incomplete'].includes(state.phase);
  $('mergeProgress').value = status.duration ? Math.min(1, status.elapsed / status.duration) : 0;
  render();
}
async function refreshTarget(preferred) {
  if (state.capture || state.starting || state.busy || state.active) { if (preferred != null) pendingTarget = preferred; return; }
  const revision = ++targetRevision;
  try {
    const win = await chrome.windows.getCurrent();
    const remembered = await chrome.storage.session.get(`window-${win.id}`);
    const id = preferred ?? remembered[`window-${win.id}`];
    let target = id != null ? await chrome.tabs.get(id).catch(() => null) : null;
    if (!target || target.windowId != null && target.windowId !== win.id) target = (await chrome.tabs.query({ active: true, windowId: win.id }))[0];
    if (revision !== targetRevision || disposed) return;
    if (state.target && state.target.id !== target?.id && state.phase === 'armed') await message('DISARM').catch(() => {});
    if (revision !== targetRevision || disposed) return;
    state.target = target; state.phase = 'idle'; state.active = false; state.status = {};
    if (target) {
      const status = await message('STATUS', {}, target.id);
      if (revision !== targetRevision || disposed) return;
      setStatus(status);
      const site = await message('SITE_STATE', {}, target.id);
      if (revision !== targetRevision || disposed) return;
      $('disableSite').hidden = !site.enabled; $('enableSite').hidden = site.enabled;
    }
  } catch { if (revision !== targetRevision || disposed) return; state.target = null; state.phase = 'idle'; state.active = false; state.status = {}; }
  render();
}
async function poll() {
  if (disposed || state.poll || state.busy || state.starting || state.capture) return;
  if (pendingTarget != null && !state.active) { const id = pendingTarget; pendingTarget = null; await refreshTarget(id); return; }
  if (!state.target) return;
  const revision = targetRevision, operation = statusRevision, tabId = state.target.id;
  state.poll = true;
  try { const status = await message('STATUS', {}, tabId); if (revision === targetRevision && operation === statusRevision && !disposed) setStatus(status); }
  catch { if (revision === targetRevision && operation === statusRevision) { state.phase = 'idle'; state.active = false; state.status = {}; } }
  finally { state.poll = false; render(); }
}
async function invalidate() {
  state.revision++; state.signal = null; state.error = ''; state.notice = '';
  $('preview').pause(); $('preview').removeAttribute('src'); $('preview').load();
  if (previewUrl) URL.revokeObjectURL(previewUrl); previewUrl = null;
  if (state.phase === 'armed') { await message('DISARM').catch(() => {}); state.phase = 'idle'; }
  render();
}
$('build').onclick = async () => {
  state.busy = true; state.error = ''; state.notice = ''; render();
  const revision = state.revision;
  try {
    if (state.phase === 'armed') await message('DISARM');
    const profile = $('profile').value;
    const packet = await makePacket($('message').value, $('password').value, PROFILES[profile].id);
    const amplitude = (profile === 'hidden' ? {soft: .035, normal: .07, strong: .11} : {soft: .2, normal: .32, strong: .42})[$('strength').value];
    const samples = modulate(packet, profile, amplitude);
    if (revision !== state.revision) return;
    state.signal = { packet, profile, amplitude, samples, duration: samples.length / SAMPLE_RATE, blob: new Blob([waveBytes(samples)], { type: 'audio/wav' }) };
    if (previewUrl) URL.revokeObjectURL(previewUrl); previewUrl = URL.createObjectURL(state.signal.blob); $('preview').src = previewUrl;
    state.phase = 'idle';
  } catch (e) { feedback(e.code || e.message); }
  finally { state.busy = false; render(); }
};
$('arm').onclick = async () => {
  state.busy = true; state.error = ''; state.notice = ''; $('preview').pause(); render();
  try { const s = state.signal; setStatus(await message('ARM', { config: { packet: Array.from(s.packet), profile: s.profile, amplitude: s.amplitude } })); }
  catch (e) { feedback(e.message); }
  finally { state.busy = false; render(); }
};
$('startSignal').onclick = async () => { try { setStatus(await message('START_SIGNAL')); } catch (e) { feedback(e.message); } };
$('disarm').onclick = async () => { try { setStatus(await message('DISARM')); } catch (e) { feedback(e.message); } };
$('copyDiagnostics').onclick = async () => {
  const s = state.status;
  const report = { extensionVersion: chrome.runtime.getManifest().version, hookVersion: s.version || null, phase: s.phase || 'idle', detail: s.detail || '', route: s.route || '', context: s.context || '', outputPeak: s.outputPeak || 0, micRequests: s.micRequests || 0, recorderStarts: s.recorderStarts || 0, elapsed: s.elapsed || 0, duration: s.duration || 0 };
  try { report.site = new URL(state.target.url).origin; await navigator.clipboard.writeText(JSON.stringify(report, null, 2)); feedback('diagnosticsCopied', true); } catch { feedback('unexpected'); }
};
$('saveSignal').onclick = () => { if (state.signal) download(state.signal.blob, 'sonicqr-signal.wav'); };
for (const id of ['message','password']) $(id).addEventListener('input', () => void invalidate());
for (const id of ['profile','strength']) $(id).addEventListener('change', () => void invalidate());
$('language').onclick = () => { state.lang = state.lang === 'fa' ? 'en' : 'fa'; void chrome.storage.local.set({ lang: state.lang }); render(); };
for (const tab of ['send','receive']) {
  $(tab+'Tab').onclick = () => { state.tab = tab; state.error = ''; state.notice = ''; render(); };
  $(tab+'Tab').onkeydown = event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const next = event.key === 'Home' ? 'send' : event.key === 'End' ? 'receive' : state.tab === 'send' ? 'receive' : 'send';
    if ($(next+'Tab').disabled) return;
    event.preventDefault(); $(next+'Tab').click(); $(next+'Tab').focus();
  };
}
$('clearSession').onclick = async () => {
  await invalidate();
  for (const id of ['message', 'password', 'decodePassword', 'audioFile']) $(id).value = '';
  state.audio = null; state.packet = null; state.result = null; $('resultText').textContent = ''; $('filename').textContent = '';
  feedback('sessionCleared', true);
};
$('refreshTarget').onclick = () => void refreshTarget();
$('demo').onclick = () => chrome.tabs.create({ url: chrome.runtime.getURL('demo.html') });
$('enableSite').onclick = async () => {
  try {
    const pattern = new URL(state.target.url).origin + '/*';
    // The permission request must remain in this click's user gesture.
    if (!await chrome.permissions.request({ origins: [pattern] })) throw new Error('sitePermission');
    await message('ENABLE_SITE'); $('enableSite').hidden = true; $('disableSite').hidden = false; $('compatState').textContent = tr('siteEnabled');
  } catch (e) { feedback(e.message); }
};
$('disableSite').onclick = async () => { try { await message('DISABLE_SITE'); $('enableSite').hidden = false; $('disableSite').hidden = true; $('compatState').textContent = tr('siteDisabled'); } catch (e) { feedback(e.message); } };
async function analyze() {
  state.busy = true; state.error = ''; state.notice = ''; state.result = null; $('decodeProgress').value = 0; render();
  try { state.result = await decoder.decode(state.audio, $('decodePassword').value, state.packet, progress => $('decodeProgress').value = progress); state.packet = null; }
  catch (e) { if (e.packet) state.packet = e.packet; if (e.message !== 'cancelled') feedback(e.message); }
  finally { state.busy = false; render(); }
}
$('audioFile').onchange = async event => {
  const file = event.target.files[0]; event.target.value = ''; if (!file || state.busy) return;
  state.audio = null; state.packet = null; state.result = null; state.busy = true; state.error = ''; $('filename').textContent = file.name; render();
  try { state.audio = await readAudio(file); await analyze(); }
  catch (e) { feedback(e.message); }
  finally { state.busy = false; render(); }
};
let stopping = false;
async function finishCapture(discard = false) {
  if (!state.capture || stopping) return;
  stopping = true;
  const capture = state.capture; state.capture = null; state.busy = true; render();
  try {
    const audio = await capture.stop();
    if (!discard && audio?.samples.length) { state.audio = audio; state.packet = null; await analyze(); }
  } catch (e) { feedback(e.message); }
  finally { stopping = false; state.busy = false; render(); }
}
$('captureTab').onclick = async () => {
  state.starting = true; state.error = ''; state.notice = ''; state.result = null; state.audio = null; state.packet = null; render();
  try {
    const id = await chrome.tabCapture.getMediaStreamId({ targetTabId: state.target.id });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: id } }, video: false });
    if (disposed) { stream.getTracks().forEach(track => track.stop()); return; }
    state.capture = await capturePCM(stream, { monitor: true, onTime: elapsed => { $('captureClock').textContent = `${Math.floor(elapsed / 60)}:${String(Math.floor(elapsed % 60)).padStart(2, '0')}`; }, onLimit: () => void finishCapture() });
    if (disposed) { await state.capture.stop(); state.capture = null; return; }
    $('captureClock').textContent = '0:00';
    stream.getTracks().forEach(track => track.addEventListener('ended', () => void finishCapture(), { once: true }));
  } catch { feedback('captureError'); }
  finally { state.starting = false; render(); }
};
$('stopCapture').onclick = () => void finishCapture();
$('cancelDecode').onclick = () => decoder.cancel();
$('retry').onclick = () => void analyze();
$('copy').onclick = async () => { try { await navigator.clipboard.writeText(state.result.text); feedback('copied', true); } catch { feedback('unexpected'); } };
chrome.runtime.onMessage.addListener(message => { if (message.type === 'TARGET_CHANGED') void refreshTarget(message.tabId); });
chrome.storage.local.get('lang').then(({ lang }) => { if (['fa','en'].includes(lang)) state.lang = lang; render(); });
void refreshTarget(); render();
const pollTimer = setInterval(() => void poll(), 600);
addEventListener('pagehide', () => { disposed = true; targetRevision++; clearInterval(pollTimer); decoder.cancel(); void state.capture?.stop(); if (previewUrl) URL.revokeObjectURL(previewUrl); if (['armed', 'waiting', 'blocked'].includes(state.phase)) void message('DISARM').catch(() => {}); });
