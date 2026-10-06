# Reviewer test instructions — SonicQR 0.3.0

No extension account, API key, paid service or messenger account is needed for the internal test. Chrome 116+ is required. The interface starts in Persian; use EN at the top to switch to English.

1. Open the extension action on an ordinary HTTPS tab and use “Test recording and decoding locally” at the bottom of its side panel. This opens the packaged `demo.html` extension page.
2. Enter a short message such as “Hello”, leave the password empty, select Audible and press Start test recording. Allow the browser microphone request. Speak normally. The signal is mixed digitally into the recording, not monitored through the speakers.
3. Wait for the signal to finish, then press Stop and check voice. The actual WebM/Opus recording is decoded locally by the packaged worker and the original text is displayed. Play or download the mixed recording to inspect the audible signal.
4. Repeat with a password. After the result appears, change the decode password to an incorrect one and Retry; it reports a wrong password. Enter the correct password and Retry to recover the message. Passwords are not included in the encoded packet.
5. In the side panel's Read message tab, select the downloaded mixed file. The text is decoded from that file. The WAV signal download can also be decoded.
6. For site mixing, open an HTTPS voice-recording site the reviewer controls. Click the extension action on that tab, create a short audible signal, arm it, and start an audio-only microphone recording on the site. Wait until the signal finishes. Mixing covers supported getUserMedia, MediaRecorder and Web Audio paths; the website still asks for its own microphone permission. The extension never presses site recording or send controls.
7. If the site's recorder prepared its stream/functions early, optionally enable compatibility access for that single origin, save any drafts and reload the site yourself before arming again. If a mixed input is waiting while the site is already recording, the manual start button sends the signal through that mixed input. An unmatched raw recorder receives a visible warning rather than a success claim.
8. Cancel mixing, remove the optional site grant and reload to remove its loaded hook. Unarmed microphone requests and recorders pass through; image/video calls and Chrome tab-capture streams are not mixed.

The activeTab path needs no installation-time host access. Optional origin grants exist solely for early site preparation. The local MAIN-world hook handles packaged audio signals; extension messaging accepts control requests only from this extension's pages. It has no externally_connectable endpoint, server, telemetry or remote code.

Important limits are stated in the interface and listing: high-frequency mode is experimental, local signal completion does not prove retention after site recompression, only the top frame is hooked, and native apps/WebRTC/arbitrary capture consumers do not have universal support. The screenshot assets show real panel UI and local WAV decoding, with a local demo target; they do not represent an authenticated messaging service or verified delivery through one.
