const KEY = '__sonicQRMixerV2__';
const extensionOrigin = chrome.runtime.getURL('');
chrome.action.onClicked.addListener(tab => {
  // Keep this call inside the original action gesture, before any await.
  void chrome.sidePanel.open({ windowId: tab.windowId }).catch(console.error);
  void chrome.storage.session.set({ [`window-${tab.windowId}`]: tab.id });
  void chrome.runtime.sendMessage({ type: 'TARGET_CHANGED', tabId: tab.id }).catch(() => {});
});
function allowedTab(tab) {
  try { const u = new URL(tab.url); return u.protocol === 'https:' || u.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(u.hostname); } catch { return false; }
}
async function install(tabId) {
  const tab = await chrome.tabs.get(tabId);
  if (!allowedTab(tab)) throw new Error('unsupportedTab');
  await chrome.scripting.executeScript({ target: { tabId }, world: 'MAIN', files: ['mixer.js'] });
  return tab;
}
async function command(tabId, method, args = []) {
  const result = await chrome.scripting.executeScript({ target: { tabId }, world: 'MAIN', func: (key, name, values) => {
    const api = globalThis[key];
    if (!api) return name === 'arm' ? { error: 'recorderUnsupported' } : { phase: 'idle', duration: 0, elapsed: 0, detail: '' };
    try { return api[name](...values); } catch (e) { return { error: e.message }; }
  }, args: [KEY, method, args] });
  if (result[0]?.result?.error) throw new Error(result[0].result.error);
  return result[0]?.result;
}
async function scriptId(pattern) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pattern)));
  return 'sonicqr-site-' + [...bytes.slice(0, 12)].map(x => x.toString(16).padStart(2, '0')).join('');
}
async function run(message) {
  const { type, tabId } = message;
  if (type === 'ARM') { await install(tabId); const status = await command(tabId, 'arm', [message.config]); await chrome.action.setBadgeText({ tabId, text: 'ON' }); await chrome.action.setBadgeBackgroundColor({ tabId, color: '#087f75' }); return status; }
  if (type === 'DISARM') { const status = await command(tabId, 'disarm'); await chrome.action.setBadgeText({ tabId, text: '' }); return status; }
  if (type === 'START_SIGNAL') return command(tabId, 'startSignal');
  if (type === 'STATUS') {
    const tab = await chrome.tabs.get(tabId);
    if (!allowedTab(tab)) return { phase: 'unsupported', title: tab.title || '', url: tab.url || '' };
    const status = await command(tabId, 'status');
    if (status?.phase !== 'armed') await chrome.action.setBadgeText({ tabId, text: '' });
    return { ...status, title: tab.title || '', url: tab.url || '' };
  }
  if (type === 'ENABLE_SITE' || type === 'DISABLE_SITE') {
    const tab = await chrome.tabs.get(tabId);
    if (!allowedTab(tab)) throw new Error('unsupportedTab');
    const pattern = new URL(tab.url).origin + '/*';
    const id = await scriptId(pattern);
    const registered = await chrome.scripting.getRegisteredContentScripts({ ids: [id] });
    if (type === 'ENABLE_SITE') {
      if (!await chrome.permissions.contains({ origins: [pattern] })) throw new Error('sitePermission');
      if (!registered.length) await chrome.scripting.registerContentScripts([{ id, matches: [pattern], js: ['mixer.js'], world: 'MAIN', runAt: 'document_start', persistAcrossSessions: true }]);
      return { enabled: true };
    }
    await command(tabId, 'disarm').catch(() => {});
    if (registered.length) await chrome.scripting.unregisterContentScripts({ ids: [id] });
    await chrome.permissions.remove({ origins: [pattern] });
    return { enabled: false };
  }
  if (type === 'SITE_STATE') {
    const tab = await chrome.tabs.get(tabId);
    if (!allowedTab(tab)) return { enabled: false };
    const pattern = new URL(tab.url).origin + '/*';
    return { enabled: await chrome.permissions.contains({ origins: [pattern] }) };
  }
  throw new Error('unknownCommand');
}
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (!sender.url?.startsWith(extensionOrigin) || sender.id !== chrome.runtime.id || !['ARM', 'DISARM', 'START_SIGNAL', 'STATUS', 'ENABLE_SITE', 'DISABLE_SITE', 'SITE_STATE'].includes(message?.type)) return;
  run(message).then(result => respond({ ok: true, result }), error => respond({ ok: false, error: error.message }));
  return true;
});
chrome.tabs.onRemoved.addListener(tabId => { void chrome.storage.session.get(null).then(entries => {
  const keys = Object.entries(entries).filter(([, id]) => id === tabId).map(([key]) => key);
  if (keys.length) return chrome.storage.session.remove(keys);
}); });
