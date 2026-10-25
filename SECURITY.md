# Security policy

## Reporting

Report suspected vulnerabilities through [GitHub private vulnerability reporting](https://github.com/maboox/SonicQrChrome/security/advisories/new). Avoid publishing credentials, personal recordings, decrypted messages or exploit details in public issues. Include the affected version, browser, minimal synthetic reproduction and expected impact. No response-time guarantee is offered.

The latest tagged version is the maintained line. Earlier versions may not receive fixes.

## Threat model

- A website receives its own mixed recording and controls its page execution environment. Its MAIN-world recording adapter is observable and can be modified or bypassed by that site.
- Use a strong, unique password for confidential text. Unencrypted audio is readable by anyone who holds the file. Encryption does not conceal the signal's existence, authenticate a sender or prevent replay.
- v3 uses AES-256-GCM with a random salt/IV and PBKDF2-SHA-256 (100,000 iterations). The existing layout is retained for interoperability. Holders of encrypted audio can guess weak passwords offline; there is no account-based rate limit.
- CRC is corruption detection, not cryptographic authentication. Packet headers are not AES-GCM additional authenticated data in v3.
- Native browser audio decoding occurs before a file's duration can be checked. A 25 MiB compressed-file limit and post-decode 120-second limit reduce exposure but do not guarantee a hard native-decoder memory ceiling.
- Browser, OS, other extensions, messenger servers and the recipient's device are outside SonicQR's control.

## Controls

The extension has no runtime server or telemetry client. Dependencies are pinned and bundled. It restricts message senders, tab identifiers, automatic host access, packet length, decompression output, capture duration and worker time. Received text is rendered with `textContent`. A release allowlist excludes source, tests, recordings and private files. Diagnostics never contain messages, passwords, packets or audio; their site origin is intentionally included.

Security checks cannot prove the absence of vulnerabilities. See [validation scope](VALIDATION.md) for evidence and limits.
