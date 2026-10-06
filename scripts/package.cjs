const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { zipSync, unzipSync } = require('fflate');
const root = path.resolve(__dirname, '..');
const files = require('./release-files.cjs');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const dist = path.join(root, 'dist'), staging = path.join(dist, 'extension');
fs.mkdirSync(dist, { recursive: true });
// Only the generated staging directory is replaced. Never recurse over the repository.
fs.rmSync(staging, { recursive: true, force: true });
fs.mkdirSync(staging);
const entries = {};
for (const name of files) {
  const bytes = fs.readFileSync(path.join(root, name));
  entries[name] = new Uint8Array(bytes);
  const destination = path.join(staging, name);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, bytes);
}
const name = `sonicqr-chrome-${manifest.version}-webstore.zip`;
const zip = zipSync(entries, { level: 9, mtime: new Date('2020-01-01T00:00:00Z') });
const unpacked = unzipSync(zip);
assert.ok(unpacked['manifest.json']);
assert.deepEqual(Object.keys(unpacked).sort(), [...files].sort());
for (const file of files) assert.deepEqual(unpacked[file], entries[file]);
fs.writeFileSync(path.join(dist, name), zip);
const sha256 = crypto.createHash('sha256').update(zip).digest('hex');
fs.writeFileSync(path.join(dist, 'SHA256SUMS.txt'), `${sha256}  ${name}\n`);
fs.writeFileSync(path.join(dist, 'build-report.json'), JSON.stringify({
  version: manifest.version, filename: name, sha256, sizeBytes: zip.length,
  files: [...files].sort(), node: process.version,
}, null, 2) + '\n');
console.log(`Created dist/${name}: ${zip.length} bytes; manifest.json is at ZIP root.`);
