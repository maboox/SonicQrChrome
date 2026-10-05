# 0.2.0 — 2026-10-05

- Mix newly requested microphone streams before the site consumes them.
- Support Web Audio recording and cached MediaRecorder constructors with mixed inputs.
- Start the signal after a recording consumer begins; retain the preamble on delayed start.
- Preserve cloned microphone streams and permit a fresh signal on reused inputs.
- Prepare audio in the page gesture; preserve the original microphone if the mix is suspended.
- Add manual signal start for a consumer whose start cannot be detected.
- Report unmatched raw recorders, old loaded hooks, permission errors and local output levels.
- Add a diagnostic report without text, password, packet or audio.
- Keep SonicQR v3 packet format and existing profile IDs compatible with the native app.
- Add eight actual recording regressions plus suspended-audio and cached-input guards.

Reload the extension AND every existing site/demo tab after upgrading.
