# Validation scope — 0.4.0

Tests use synthetic text and audio. They must not be interpreted as proof of compatibility with every messenger or real microphone.

| Check | Coverage |
|---|---|
| `npm test` | 25 tests: UTF-8, v3 packets, AES-GCM/password retries, damaged packets, bounded decompression, acoustic round trips, sample-rate guards, sender/tab validation, compatibility state, capture failure cleanup and worker creation/post failures |
| `npm run test:ui` | Actual WebM/Opus microphone mixing and decoding; incomplete recording; encryption; file import/export; session reset; keyboard tabs; stale target/status responses; both languages, narrow layouts and dark theme |
| `npm run test:recording` | Eight microphone/consumer routes, cloned tracks, cached constructors, delayed starts, reused microphone, manual start, preserved normal microphone audio and suspended-context fallback |
| `npm run test:browser` | Installed MV3 extension in Playwright Chromium, real recording/worker round trips, CSP, manifest permissions and panel file workflows |
| `npm run package` | Rebuild, locale/version/license/CSP/resource checks, explicit ZIP allowlist, round-trip verification of archive contents and SHA-256 |
| Gitleaks | Tracked content and reachable Git history; exact public hook identifier false positives are documented in `.gitleaks.toml` |

Local UI/audio tests can use an installed Chrome through `SONICQR_BROWSER_EXECUTABLE`. Branded Chrome may reject extension side-loading flags; CI uses Playwright Chromium for the installed MV3 test. The CI result for a commit is the authoritative record of checks completed for that revision.

## Manual checks still required before a store submission

- Record speech with a real microphone and replay the received voice from each supported messenger.
- Verify permission prompts and tab-audio capture with an actual clicked extension action.
- Check that a user can revoke compatibility access and reload the site without losing a draft.
- Test store ZIP installation and publish the real privacy-policy URL.

These are evidence boundaries, not a claim that public-store review has passed. There is no independent penetration-test certificate or universal messenger-compatibility claim.
