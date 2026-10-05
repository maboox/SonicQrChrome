const path = require('node:path');
const fs = require('node:fs');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..');
for (const [entry, output] of [['panel.mjs', 'panel.js'], ['mixer.mjs', 'mixer.js'], ['demo.mjs', 'demo.js'], ['decoder.worker.mjs', 'decoder.worker.js']]) {
  esbuild.buildSync({ entryPoints: [path.join(root, 'src', entry)], outfile: path.join(root, output), bundle: true, format: 'iife', platform: 'browser', target: 'chrome116', minify: true });
}
fs.copyFileSync(path.join(root, 'src/recorder.worklet.js'), path.join(root, 'recorder.worklet.js'));
console.log('Ready-to-load Chrome extension built.');
