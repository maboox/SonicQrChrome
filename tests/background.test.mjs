import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const file = fileURLToPath(new URL('../background.js', import.meta.url));
async function harness(url = 'https://messenger.example/chat', permitted = false) {
  let listener; const calls = [], scripts = [];
  const event = () => ({ addListener(fn) { this.listener = fn; } });
  const chrome = {
    runtime: { id: 'test-extension', getURL: p => 'chrome-extension://test-extension/' + p, onMessage: { addListener(fn) { listener = fn; } }, sendMessage: async () => {} },
    action: { onClicked: event(), setBadgeText: async x => calls.push(['badge',x]), setBadgeBackgroundColor: async()=>{} },
    sidePanel: { open: async()=>{} },
    tabs: { get: async id => ({id,url,title:'Messenger'}), onRemoved:event() },
    storage: { session:{ get:async()=>({}),set:async()=>{},remove:async()=>{} } },
    permissions:{ contains:async()=>permitted,remove:async p=>calls.push(['remove',p]) },
    scripting:{ executeScript:async opts=>{ calls.push(['inject',opts]); return [{result:{phase:opts.args?.[1]==='arm'?'armed':'idle'}}]; },getRegisteredContentScripts:async()=>scripts,registerContentScripts:async rows=>{scripts.push(...rows);calls.push(['register',rows]);},unregisterContentScripts:async opts=>calls.push(['unregister',opts]) }
  };
  vm.runInNewContext(await fs.readFile(file,'utf8'), { chrome, console, URL, Uint8Array, TextEncoder, crypto });
  const own={id:'test-extension',url:'chrome-extension://test-extension/panel.html'};
  return {calls,scripts,request:(message,sender=own)=>new Promise(resolve=>{const pending=listener(message,sender,resolve);if(!pending)resolve(null);})};
}
test('A webpage cannot request injection or recording through the extension message endpoint', async()=>{
  const h=await harness();
  assert.equal(await h.request({type:'ARM',tabId:5,config:{}},{id:'test-extension',url:'https://messenger.example/chat'}),null);
  assert.equal(await h.request({type:'ARM',tabId:5,config:{}},{id:'another-extension',url:'chrome-extension://test-extension/panel.html'}),null);
  assert.deepEqual(h.calls,[]);
});
test('Privileged and insecure pages are rejected before any script injection',async()=>{
  for(const url of ['chrome://settings','file:///private/audio.wav','http://insecure.example/chat']){
    const h=await harness(url); const r=await h.request({type:'ARM',tabId:5,config:{}});
    assert.equal(r.ok,false); assert.equal(r.error,'unsupportedTab'); assert.deepEqual(h.calls,[]);
  }
});
test('Arming installs the MAIN hook in only the selected tab, then sends the packet',async()=>{
  const h=await harness(); const config={packet:[1,2,3],profile:'fast',amplitude:.32};
  const r=await h.request({type:'ARM',tabId:9,config}); assert.equal(r.ok,true);
  const injections=h.calls.filter(([name])=>name==='inject');
  assert.equal(injections.length,2); assert.equal(injections[0][1].world,'MAIN'); assert.equal(injections[0][1].target.tabId,9);
  assert.equal(injections[0][1].target.allFrames,undefined); assert.equal(injections[1][1].args[1],'arm');
  assert.equal(JSON.stringify(injections[1][1].args[2]),JSON.stringify([config]));
});
test('Early hooks require permission and register only the selected site, without automatic reload',async()=>{
  const denied=await harness(); const bad=await denied.request({type:'ENABLE_SITE',tabId:9});
  assert.equal(bad.error,'sitePermission'); assert.equal(denied.scripts.length,0);
  const h=await harness('https://messenger.example/chat',true); const r=await h.request({type:'ENABLE_SITE',tabId:9}); assert.equal(r.ok,true);
  assert.equal(h.scripts.length,1); assert.equal(h.scripts[0].matches[0],'https://messenger.example/*'); assert.equal(h.scripts[0].runAt,'document_start');
  await h.request({type:'DISABLE_SITE',tabId:9});
  assert.ok(h.calls.some(([name,p])=>name==='remove'&&p.origins[0]==='https://messenger.example/*'));
});
