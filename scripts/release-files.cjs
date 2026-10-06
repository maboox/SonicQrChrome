// Explicit allowlist: source files, CI, recordings and secrets cannot enter the store ZIP.
module.exports = [
  'manifest.json', 'background.js', 'panel.html', 'demo.html', 'styles.css',
  'panel.js', 'demo.js', 'mixer.js', 'decoder.worker.js', 'recorder.worklet.js',
  'assets/icon.png', 'assets/icon-16.png', 'assets/icon-32.png',
  'assets/icon-48.png', 'assets/icon-128.png',
  '_locales/fa/messages.json', '_locales/en/messages.json',
  'privacy.html', 'privacy.css', 'PRIVACY.md', 'LICENSE',
  'THIRD_PARTY_NOTICES.md', 'licenses/fflate-MIT.txt',
];
