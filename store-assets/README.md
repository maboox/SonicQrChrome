# Store images

- `icon-128.png`: the store icon, with 16px transparent padding around 96px artwork.
- `promo-small.png`: 440x280 small promotional tile.
- `screenshot-fa-send.png` / `screenshot-fa-read.png`: 1280x800 Persian screenshots.
- `screenshot-en-send.png` / `screenshot-en-read.png`: 1280x800 English screenshots.

The screenshots show the actual panel UI with real signal creation and real WAV decoding. Chrome APIs are stubbed only to display a local demonstration target. They do not show or imply a verified WhatsApp/Bale transfer or a real signed-in messaging account. No private user messages or audio appear in these assets. The runtime does not load this folder.

Recreate after UI changes: `npm run build`, install Playwright Chromium, then `npm run store:assets`. Review the images before submitting them. Choose the appropriate language in the Web Store dashboard and upload its screenshots; the promo image is language neutral apart from the product name.
