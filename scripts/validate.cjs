const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { Script } = require('node:vm');
const root = path.resolve(__dirname, '..');
const files = require('./release-files.cjs');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const manifest = JSON.parse(read('manifest.json'));
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
assert.equal(manifest.manifest_version, 3);
assert.equal(manifest.version, pkg.version);
assert.equal(lock.version, pkg.version);
assert.equal(lock.packages[''].version, pkg.version);
assert.match(manifest.version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);
assert.ok(manifest.version.split('.').every(part => Number(part) <= 65535));
assert.deepEqual(manifest.permissions, ['activeTab', 'scripting', 'sidePanel', 'storage', 'tabCapture', 'clipboardWrite']);
assert.deepEqual(manifest.optional_host_permissions, ['https://*/*', 'http://localhost/*', 'http://127.0.0.1/*']);
assert.equal(manifest.host_permissions, undefined);
assert.equal(manifest.externally_connectable, undefined);
assert.equal(manifest.update_url, undefined); // Chrome Web Store owns installed updates.
assert.equal(manifest.content_security_policy.extension_pages, "script-src 'self'; object-src 'none'; base-uri 'none'");
assert.equal(manifest.default_locale, 'fa');
for (const locale of ['fa', 'en']) {
  const messages = JSON.parse(read(`_locales/${locale}/messages.json`));
  for (const value of [manifest.name, manifest.description, manifest.action.default_title]) {
    const key = /^__MSG_(\w+)__$/.exec(value)?.[1];
    assert.ok(key && messages[key]?.message, `Unresolved ${locale} message: ${value}`);
  }
  assert.ok(Array.from(messages.extensionName.message).length <= 75);
  assert.ok(Array.from(messages.extensionDescription.message).length <= 132);
}
for (const file of files) assert.ok(fs.statSync(path.join(root, file)).isFile(), `Missing runtime file ${file}`);
for (const [size, name] of Object.entries(manifest.icons)) {
  assert.ok(files.includes(name));
  const png = fs.readFileSync(path.join(root, name));
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), Number(size));
  assert.equal(png.readUInt32BE(20), Number(size));
}
for (const name of Object.values(manifest.action.default_icon)) assert.ok(files.includes(name));
for (const name of [manifest.background.service_worker, manifest.side_panel.default_path]) assert.ok(files.includes(name));
for (const name of files.filter(name => name.endsWith('.html'))) {
  const html = read(name);
  assert.ok(!/<script\b(?![^>]*\bsrc=)/i.test(html), `${name}: inline script`);
  assert.ok(!/\son\w+\s*=/i.test(html), `${name}: inline event handler`);
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const ref = match[1];
    if (ref.startsWith('#')) continue;
    assert.ok(!/^(?:https?:|data:|javascript:|\/\/)/i.test(ref), `${name}: remote or executable resource ${ref}`);
    assert.ok(files.includes(ref), `${name}: unpackaged resource ${ref}`);
  }
}
for (const name of files.filter(name => name.endsWith('.js'))) {
  const code = read(name);
  new Script(code, { filename: name });
  assert.ok(!/\beval\s*\(|\bnew\s+Function\b/.test(code), `${name}: dynamic code execution`);
  assert.ok(!/\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/.test(code), `${name}: unexpected network code`);
}
assert.ok(read('THIRD_PARTY_NOTICES.md').includes('fflate 0.8.3'));
assert.ok(read('licenses/fflate-MIT.txt').includes('Permission is hereby granted'));
assert.ok(read('licenses/lucide-ISC.txt').includes('Permission to use'));
assert.ok(read('THIRD_PARTY_NOTICES.md').includes(`Lucide ${pkg.devDependencies.lucide}`));
console.log(`Validated ${files.length} allowed runtime files, MV3 permissions, locales, icons, CSP, licenses and executable syntax.`);
