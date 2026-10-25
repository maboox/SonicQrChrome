# Contributing

Bug reports and focused pull requests are welcome in English or فارسی. For a security issue, use [private vulnerability reporting](https://github.com/maboox/SonicQrChrome/security/advisories/new) instead of a public issue.

Use Node.js 24, run `npm ci`, install Playwright Chromium, then run `npm run check`. Edit modules under `src/`; rebuild the committed runtime bundles with `npm run build`. Keep changes to generated files paired with their source changes. Do not edit bundles directly.

For behavior changes, add a regression that fails for the original problem. Preserve v3 packet compatibility unless a separately versioned protocol change is intentional. UI text belongs in both languages in `src/i18n.mjs`; check RTL, LTR, keyboard use and a narrow 320px viewport. Bundle icons and code locally and include their licenses.

Run `npm run package` before proposing release changes. The runtime ZIP uses an explicit allowlist in `scripts/release-files.cjs`. Never add recordings, browser profiles, credentials, signing keys, personal URLs or diagnostics containing personal information. Use synthetic audio/text fixtures.

Report browser and extension versions, the recording path and a minimal reproduction. Only share synthetic or consented recordings. A copied diagnostic report includes the site's origin; review it first. Keep discussion respectful and specific.
