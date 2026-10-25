const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.SONICQR_BROWSER_EXECUTABLE || undefined, headless: true });
  try {
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    const svg = fs.readFileSync(path.join(root, 'assets/logo.svg'), 'utf8');
    for (const size of [16, 32, 48, 128, 512]) {
      await page.setViewportSize({ width: size, height: size });
      await page.setContent(`<style>body{margin:0}svg{display:block;width:100vw;height:100vh}</style>${svg}`);
      await page.screenshot({ path: path.join(root, 'assets', size === 512 ? 'icon.png' : `icon-${size}.png`), omitBackground: true });
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
