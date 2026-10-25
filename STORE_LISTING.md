# Chrome Web Store listing and privacy fields

Prepared for SonicQR 0.4.0, 6 October 2026. Copy the values into the corresponding dashboard fields; use the real publisher's public privacy-policy URL and support/contact information.

## Single purpose — English

Encode short text as an audio signal inside a user-initiated, supported voice recording and recover that text from an audio file or selected tab audio, with local processing and optional password encryption.

## هدف واحد — فارسی

انتقال متن کوتاه داخل ضبط صوتیِ پشتیبانی‌شده به درخواست کاربر و بازیابی همان متن از فایل صوتی یا صدای تب انتخابی، با پردازش محلی و رمزگذاری اختیاری.

## Detailed description — English

SonicQR lets you carry short text inside a supported voice recording and recover it from the audio.

Create a short message, preview its audio signal, then arm mixing for one recording on your selected website. Record your voice normally and keep recording until the signal finishes. The website receives the mixed audio; you decide when to stop or send it. If a mixed microphone is prepared but the recorder start is not detected, a manual signal-start button is available.

To read a message, select its original audio file or explicitly capture the selected tab while the voice plays. A built-in recording test lets you check the complete encode → record → decode path without a messenger account.

Features:
- Persian and English interface, with light and dark themes.
- Local signal creation and audio decoding; no extension backend or analytics.
- Optional password encryption for message text.
- Signal WAV export, mixed recording export in the internal test, and copyable decoded text.
- Optional early preparation for one explicitly allowed site, plus local diagnostics.

Compatibility depends on the website's recording path and audio processing. Supported microphone paths include MediaRecorder and Web Audio. The audible mode is the recommended starting point. High-frequency mode is experimental and may be removed by voice compression. Signal completion in the local output does not prove preservation after sending: check the received audio file. Native Windows/mobile apps, other frames, arbitrary recorders and every messaging service are not universally supported.

Unencrypted text can be decoded by anyone with an intact recording. Use a password for private text and share it separately. The extension does not record or send a voice message automatically.

## توضیح کامل — فارسی

با SonicQR متن کوتاه را داخل وویسِ پشتیبانی‌شده منتقل کن و بعد از خود فایل صوتی بخوان.

متن را بنویس، سیگنال را بساز و پیش‌نمایش آن را بشنو. در تب مقصد ترکیب را برای یک ضبط فعال کن؛ سپس دکمهٔ ضبط وویس خود سایت را بزن و عادی صحبت کن. ضبط را تا پایان سیگنال ادامه بده. سایت به صدای ترکیبی دسترسی دارد و توقف یا ارسال وویس با خودت است. اگر ورودی ترکیبی آماده باشد اما شروع ضبط سایت شناسایی نشود، دکمهٔ شروع دستی سیگنال در دسترس است.

گیرنده فایل صوتی اصلی را انتخاب می‌کند یا به درخواست خودش صدای تب مقصد را هنگام پخش وویس می‌گیرد. آزمایش داخلی، مسیر ساخت سیگنال، ضبط و استخراج متن را بدون نیاز به حساب پیام‌رسان بررسی می‌کند.

امکانات:
- رابط فارسی و انگلیسی، با حالت روشن و تیره.
- ساخت و خواندن سیگنال روی دستگاه، بدون سرور افزونه یا تحلیل استفاده.
- رمزگذاری اختیاری متن پیام.
- دانلود سیگنال WAV، دانلود وویس ترکیبیِ آزمایش داخلی و کپی متن خوانده‌شده.
- آماده‌سازی زودهنگام اختیاری فقط برای سایت مجازشده، همراه گزارش محلی مسیر ضبط.

سازگاری به روش ضبط و پردازش صوت سایت بستگی دارد. مسیرهای میکروفون MediaRecorder و Web Audio پوشش داده شده‌اند. برای شروع حالت واضح و شنیداری مناسب است؛ حالت فرکانس‌بالا آزمایشی است و ممکن است با فشرده‌سازی وویس حذف شود. پایان سیگنال در خروجی محلی، حفظ پیام پس از ارسال را ثابت نمی‌کند؛ فایل دریافت‌شده را بررسی کن. اپ‌های مستقل ویندوز/موبایل، فریم‌های دیگر، همهٔ ضبط‌کننده‌ها و تمام پیام‌رسان‌ها پشتیبانی عمومی ندارند.

متن بدون رمز از صوت سالم قابل استخراج است. برای متن خصوصی، رمز تعیین و آن را جدا به گیرنده بده. افزونه خودش ضبط یا ارسال وویس را شروع نمی‌کند.

## Permission justification — copy the relevant value

| Permission | Explanation for the reviewer |
|---|---|
| activeTab | Temporarily access only the tab the user explicitly selects by clicking the extension action. Identify its URL/title, install the local mixer there, and authorize user-initiated tab audio capture. No browsing-history API is used. |
| scripting | Inject packaged `mixer.js` into the selected page's MAIN world and call its finite, local control API. The hook mixes an encoded signal into supported microphone recording paths only after the user arms it. No downloaded code or arbitrary remote scripts execute. |
| sidePanel | Show the message composer, recording state and audio decoder next to the selected site so the user can operate the site recording controls. |
| storage | Save only interface language in local storage and selected target tab IDs in session storage. Messages, passwords and audio are not written to extension storage. |
| tabCapture | Capture audio from the selected tab only after the user presses Start listening, so an audio-embedded message can be decoded locally. Capture stops on user action, panel closure or the two-minute limit. No other application or tab is captured. |
| clipboardWrite | Copy recovered text or a sanitized diagnostic report only after the user presses Copy. The extension does not read clipboard contents. |
| Optional host access | Support early hook registration on a website the user specifically chooses in the compatibility section. The manifest lists HTTPS and local-development patterns so an arbitrary supported destination can be selected; the runtime asks for and registers only that exact origin. No broad host access is automatically granted on installation. The grant can be removed in the panel. |

## Remote code

**No, I am not using remote code.** All executable JavaScript, the decoder worker, AudioWorklet and fflate compression code ship inside the extension ZIP. There are no network code loaders, CDN scripts, eval, new Function, or extension network APIs. Build-time npm/GitHub dependency downloads are not extension runtime behavior.

## Data usage — local data still needs disclosure

The publisher does not automatically receive any user data. That does **not** mean all data-use categories can be left unchecked: Chrome requires disclosure of local handling too. Match the current form's definitions and the policy to the limited behavior below.

| Dashboard category | This extension's limited handling |
|---|---|
| Personal communications | User-entered message text and voice/audio selected or recorded for the text-in-voice feature; processed locally. |
| Authentication information | Optional encryption/decryption password, used locally in memory. It is not a website login password, never embedded in the signal and never uploaded by the extension. Disclose this secret handling conservatively if the form's password definition applies. |
| Website content | User-requested target-tab audio and destination metadata; no scraping of chat threads or unrelated page content. |
| Web history | Only the currently selected destination's URL/title/ID, not the browser history database or a stored browsing log. Disclose this limited current-tab metadata under the form's URL/title definition. |
| User activity | Local recording counters, state, elapsed time and output level for user-visible diagnostics; no general interaction, mouse-position or keystroke logging. |

No dedicated identity/contact, health, financial or location fields are requested. Message/audio content can of course contain information the user chooses to put there; it is handled solely for the disclosed feature.

Certify only declarations consistent with the implementation: no sale or transfer outside approved use cases, no use unrelated to the single purpose, and no use for creditworthiness/lending decisions. Arming mixing gives the chosen recording website access to mixed audio as the core requested function. Sending a voice through that site is handled by that site, not an extension backend. Do not claim that mixed audio can never reach third parties.

## Distribution and test notes

Recommended initial rollout: Unlisted link-based testing, if available, then Public after a real end-to-end check on the intended sites. No claim of guaranteed WhatsApp, Bale, or universal messenger compatibility is made. Use `REVIEWER_NOTES.md` for reviewer testing instructions.
