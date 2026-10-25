const { chromium, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const root = path.resolve(__dirname, '..'), qa = path.join(root, 'qa');
const extensionRoot = path.resolve(root, process.env.SONICQR_EXTENSION_DIR || '.');
fs.mkdirSync(qa, { recursive: true });
(async () => {
  let context;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'sonicqr-browser-'));
  try {
    context = await chromium.launchPersistentContext(profile, { executablePath: process.env.SONICQR_BROWSER_EXECUTABLE || undefined, channel: 'chromium', headless: true, ignoreDefaultArgs: ['--disable-extensions'], viewport: { width: 1100, height: 900 }, args: [`--disable-extensions-except=${extensionRoot}`, `--load-extension=${extensionRoot}`, '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
    const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
    const id = new URL(worker.url()).host;
    const manifest = await worker.evaluate(() => chrome.runtime.getManifest());
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.host_permissions).toBeUndefined();
    expect(manifest.permissions).not.toContain('debugger');
    const page = await context.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(`chrome-extension://${id}/demo.html`);
    const text = 'سلام تست';
    await page.locator('#message').fill(text);
    await page.locator('#record').click();
    await page.waitForFunction(() => globalThis.__sonicQRMixerV2__?.status().phase === 'complete', null, { timeout: 15000 });
    await page.locator('#stop').click();
    await expect(page.locator('#result')).toContainText(text, { timeout: 45000 });
    const download = page.waitForEvent('download'); await page.locator('#download').click();
    const saved = await download; const voicePath = path.join(qa, 'voice.webm'); await saved.saveAs(voicePath);
    expect(fs.statSync(voicePath).size).toBeGreaterThan(1000);
    await page.screenshot({ path: path.join(qa, 'lab-fa.png'), fullPage: true });
    console.log('PASS installed Manifest V3 extension: microphone + signal -> real MediaRecorder WebM/Opus -> decoder worker -> Persian text.');
    // Stop early, cancel, then encrypt: short voice must not be falsely accepted.
    await page.locator('#message').fill('این وویس عمداً کوتاه است و نباید خوانده شود');
    await page.locator('#record').click(); await page.locator('#stop').click();
    await expect(page.locator('#error')).toBeVisible({ timeout: 45000 });
    await expect(page.locator('#result')).toBeHidden();
    expect(await page.evaluate(() => globalThis.__sonicQRMixerV2__.status().active)).toBe(false);
    await page.locator('#message').fill('رمز'); await page.locator('#password').fill('test-password');
    await page.locator('#record').click();
    await page.waitForFunction(() => globalThis.__sonicQRMixerV2__.status().phase === 'complete', null, { timeout: 15000 });
    await page.locator('#stop').click();
    await expect(page.locator('#result')).toContainText('رمز', { timeout: 45000 });
    await page.locator('#decodePassword').fill('wrong'); await page.locator('#retry').click();
    await expect(page.locator('#error')).toContainText('رمز درست نیست', { timeout: 45000 });
    await page.locator('#decodePassword').fill('test-password'); await page.locator('#retry').click();
    await expect(page.locator('#result')).toContainText('رمز', { timeout: 45000 });
    console.log('PASS incomplete recordings rejected; microphone mixing released; encrypted Opus round trip and password retry.');
    const panel = await context.newPage(); panel.on('pageerror', e => errors.push(e.message));
    await panel.goto(`chrome-extension://${id}/panel.html`);
    await panel.locator('#message').fill('Panel test'); await panel.locator('#build').click();
    await expect(panel.locator('#ready')).toBeVisible();
    const signalDownload = panel.waitForEvent('download'); await panel.locator('#saveSignal').click();
    const signalPath = path.join(qa, 'signal.wav'); await (await signalDownload).saveAs(signalPath);
    await panel.locator('#message').fill('Changed'); await expect(panel.locator('#ready')).toBeHidden();
    await panel.locator('#receiveTab').click(); await panel.locator('#audioFile').setInputFiles(voicePath);
    await expect(panel.locator('#resultText')).toHaveText(text, { timeout: 45000 });
    for (const lang of ['fa', 'en']) {
      if (await panel.locator('html').getAttribute('lang') !== lang) await panel.locator('#language').click();
      for (const width of [320, 360, 420]) {
        await panel.setViewportSize({ width, height: 920 });
        expect(await panel.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      }
      await panel.screenshot({ path: path.join(qa, `panel-${lang}.png`), fullPage: true });
    }
    await panel.emulateMedia({ colorScheme: 'dark' }); await panel.screenshot({ path: path.join(qa, 'panel-dark.png'), fullPage: true });
    console.log('PASS panel signal export, stale output reset, received WebM file decoding, Persian/English layouts and dark mode.');
    expect(errors).toEqual([]);
  } finally { await context?.close(); fs.rmSync(profile, { recursive: true, force: true }); }
})().catch(error => { console.error(error); process.exitCode = 1; });
