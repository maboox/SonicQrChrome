# 0.4.0 — 2026-10-25

- Redesign the side panel with a violet palette, light/dark themes, bilingual onboarding, a new logo and locally bundled Lucide icons.
- Group optional encryption/strength settings and recording diagnostics into disclosures; simplify primary send/read actions.
- Add accessible keyboard tabs, session clearing, selected-site origin display and clearer capacity/privacy guidance.
- Ignore stale target lookups and polling responses; defer target changes during active operations and recover from a closed remembered tab.
- Restrict background commands to the exact panel sender and valid tab identifiers; report compatibility only when its early hook is registered.
- Release acquired capture tracks on AudioContext construction/setup failure, close capture ports, and clean up workers on construction/post failure.
- Bound modulation inputs and sample rates; explicitly verify that maximum UTF-8/encrypted messages fit the audio time budget. Retain v3 compatibility.
- Update Playwright to 1.63.0, add focused regression tests, bilingual documentation, architecture/security policies, issue templates and refreshed screenshots.
- Remove personal commit email metadata from the reachable history, replace it with GitHub's noreply identity, and retire the superseded dependency branch.

# 0.3.0 — 2026-10-06

- Add a strict release-file allowlist, ZIP-root manifest, staged unpacked bundle, checksums and build report.
- Add validation of versions, MV3 permissions, CSP, resource paths, syntax, locales, icon dimensions and bundled licenses.
- Add Node 24 GitHub Actions with pinned official actions, audio/UI tests and installed-extension testing of staging before artifact upload.
- Add Persian/English manifest metadata and correctly sized PNG action/store icons.
- Keep generated JavaScript readable and include the bundled fflate MIT notice.
- Add bilingual local privacy policy, visible mixing disclosure and a policy link.
- Add publication guide, listing/privacy field text, reviewer instructions and store screenshots/promo assets.
- Keep the 0.2.0 audio protocol and mixing behavior unchanged.

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
