# انتشار SonicQR در Chrome Web Store — نسخهٔ ۰٫۴٫۰

این پروژه فقط اکستنشن Chrome است. بستهٔ خروجی پس از اجرای npm run package در فایل `sonicqr-chrome-0.4.0-webstore.zip` تحویل داده شده است. **ZIP سورس را در فروشگاه آپلود نکن.** بستهٔ فروشگاه `manifest.json` را مستقیم در ریشه دارد و شامل کد اجرا، فایل‌های محلی و مجوزهاست؛ سورس، node_modules، تست‌ها و تصاویر تبلیغاتی داخل آن نیستند.

## یک بار: حساب ناشر و صفحهٔ حریم خصوصی

1. وارد [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) شو، حساب توسعه‌دهنده را با اطلاعات واقعی ثبت کن و هزینهٔ یک‌بارهٔ ثبت‌نام را در خود داشبورد پرداخت کن. اطلاعات ناشر، ایمیل و تأییدهای امنیتی/هویتی درخواست‌شده را کامل کن. مقدار هزینه و موارد فعلی را همان‌جا بررسی کن؛ هزینه در کد پروژه تعریف نمی‌شود.
2. ثبت‌نام باید از کشور/منطقهٔ پشتیبانی‌شده‌ای باشد که واقعاً واجد شرایط آن هستی. [فهرست رسمی](https://developer.chrome.com/docs/webstore/register) را بررسی کن؛ پشتیبانی ثبت‌نام با زبان فارسی افزونه تفاوت دارد.
3. فایل‌های `privacy.html` و `privacy.css` را در یک پوشهٔ عمومی روی هاست HTTPS خودت بگذار. صفحه باید بدون ورود باز شود. آدرس واقعی `privacy.html` را در فیلد Privacy policy فروشگاه وارد کن. سیاست داخل ZIP به‌تنهایی جای URL عمومی را نمی‌گیرد. متن این صفحه مطابق رفتار فعلی افزونه است؛ اگر سرور، تحلیل استفاده یا قابلیت دیگری اضافه شد باید سیاست و اظهارنامه هم عوض شوند.
4. اطلاعات تماس/پشتیبانی واقعی ناشر را در صفحهٔ فروشگاه و حساب درج کن. سیاست از همان مسیر تماس استفاده می‌کند؛ هیچ ایمیل، دامنه یا هویت ساختگی در کد قرار داده نشده است.

## اولین بار: آپلود و تکمیل فرم

1. **Add new item** را بزن و `sonicqr-chrome-0.4.0-webstore.zip` را آپلود کن. CRX، APK یا کلید خصوصی لازم نیست؛ Chrome Web Store امضا و توزیع نسخهٔ نصب‌شده را مدیریت می‌کند.
2. در **Store listing** متن فارسی/انگلیسی `STORE_LISTING.md` را وارد کن. نام و توضیح کوتاه از manifest و `_locales` می‌آیند. نزدیک‌ترین دستهٔ مناسب، Productivity / Communication است؛ نام دقیق دستهٔ موجود را در داشبورد انتخاب کن.
3. از پوشهٔ `store-assets` آیکون ۱۲۸ پیکسل، تصویر `promo-small.png` و تصاویر زبان مربوط را بده. هر screenshot اندازهٔ ۱۲۸۰×۸۰۰ دارد؛ تصویر تبلیغاتی ۴۴۰×۲۸۰ است. دو تصویر برای هر زبان آماده شده‌اند. این تصاویر نمایش واقعی رابط و تحلیل WAV را نشان می‌دهند؛ تأیید انتقال از پیام‌رسان مشخصی نیستند.
4. در **Privacy practices** هدف واحد، توجیه دسترسی‌ها، پاسخ Remote code و اظهارنامهٔ داده را از `STORE_LISTING.md` وارد کن. پردازش محلی به معنی نادیده‌گرفتن این فرم نیست؛ متن/رمز/صوت و اطلاعات مقصد به‌طور شفاف توضیح داده شده‌اند.
5. در بخش **Test instructions / Notes for reviewer**، دستورهای `REVIEWER_NOTES.md` را کپی کن. تست داخلی بدون حساب پیام‌رسان کار می‌کند؛ برای اولین بررسی از متن کوتاه و حالت واضح استفاده می‌شود.
6. در **Distribution** ابتدا **Unlisted** را برای انتشار آزمایشی با لینک انتخاب کن، اگر در داشبورد ارائه می‌شود. بعد از تأیید و تست با فایل واقعی پیام‌رسان می‌توانی به Public تغییر بدهی. توزیع و وضعیت ناشر/تجاری را مطابق شرایط واقعی خودت تکمیل کن.
7. پس از بررسی اطلاعات، **Submit for review** را بزن. آماده‌بودن کد یا موفقیت بیلد، تأیید گوگل را تضمین نمی‌کند. افزونه یا تصاویر ممکن است سؤال/اصلاح بخواهند. اگر انتشار خودکار بعد از تأیید را فعال نکنی، انتشار نهایی را خودت در داشبورد انجام می‌دهی.

## GitHub Actions: فقط سورس را Push کن

1. ZIP سورس `SonicQR-Chrome.zip` را باز کن. **محتویات پوشهٔ SonicQR-Chrome** را در ریشهٔ repository قرار بده؛ `package.json` و پوشهٔ `.github` باید مستقیم در ریشه باشند. آپلود خود ZIP به repository، یا گذاشتن پروژه در یک زیرپوشه، workflow را راه نمی‌اندازد.
2. پوشهٔ `.github` را هم منتقل کن. در صفحهٔ Actions باید workflow **Build Chrome extension** دیده شود. اگر repository اجازهٔ اجرای Actions ندارد، آن را فعال کن.
3. با هر Push، Pull request یا **Run workflow**، وابستگی‌های قفل‌شده نصب، بسته ساخته و اعتبارسنجی می‌شود. تست‌های کد، صوت، رابط و نصب Manifest V3 روی بستهٔ staging اجرا می‌شوند. همه باید موفق شوند تا artifact انتشار آپلود شود؛ خطای تست نصب به‌صورت موفقیت نادیده گرفته نمی‌شود.
4. در اجرای موفق، فایل `sonicqr-chrome-0.4.0-webstore.zip` را از **Artifacts** بگیر. به‌کمک upload-artifact نسخهٔ ۷، خود فایل ZIP مستقیماً عرضه می‌شود؛ همین فایل را در فروشگاه بده. `sonicqr-build-report` فقط گزارش و SHA-256 است و فایل انتشار نیست.
5. برای بیلد یا دانلود artifact **هیچ Secret یا کلید امضایی لازم نیست**. این workflow به حساب گوگل متصل نیست و آپلود/انتشار فروشگاه را انجام نمی‌دهد.

## نسخه‌های بعدی

شمارهٔ نسخه باید از نسخهٔ فعلی فروشگاه بزرگ‌تر باشد. برای مثال، پس از ۰٫۴٫۰:

```bash
npm version 0.3.1 --no-git-tag-version
```

همان عدد را در `manifest.json` و برچسب Beta در `panel.html` و `demo.html` تغییر بده، تصاویر را در صورت تغییر رابط به‌روز کن و Push کن. ابزار اعتبارسنجی ناسازگاری نسخهٔ manifest، package و lock را رد می‌کند. ZIP جدید Actions را در **همان item قبلی** به‌عنوان New package بده؛ item جدید برای هر نسخه نساز. شمارهٔ بزرگ‌تر و انتشار از همان item باعث می‌شود کاربران نسخهٔ فروشگاهی را از مسیر به‌روزرسانی Chrome دریافت کنند. `update_url` سفارشی یا سیستم آپدیت داخل افزونه اضافه نشده است.

## ساخت محلی، اگر ابزار داری

Node.js 24 لازم است:

```bash
npm ci
npm run package
npm test
npx --no-install playwright install chromium
npm run test:ui
npm run test:recording
SONICQR_EXTENSION_DIR=dist/extension npm run test:browser
```

`dist/extension` پوشهٔ آمادهٔ Load unpacked و `dist/*-webstore.zip` بستهٔ فروشگاه است. دستور آخر با نوشتار Bash است؛ در ویندوز می‌توانی به‌جای آن `npm run test:browser` را روی پوشهٔ اصلی اجرا کنی. تصاویر فروشگاه از پیش همراه سورس هستند و بازسازی آن‌ها با `npm run store:assets` انجام می‌شود.

## مرز بررسی

بیلد، اعتبارسنجی بسته و تست‌های محلی در `VALIDATION.md` گزارش شده‌اند. در این محیط، اجرای Chromium کاملِ دارای افزونه محدودیت سیستم دارد؛ workflow آزمون نصب را روی runner عادی GitHub انجام می‌دهد. اجرای واقعی همان workflow پس از Push انجام می‌شود و از این محیط ادعا نشده است. نتیجهٔ سایت مقصد باید با وویس دریافت‌شدهٔ خود آن سایت بررسی شود.

## منابع رسمی بررسی‌شده در ۶ اکتبر ۲۰۲۶

- [Prepare your extension](https://developer.chrome.com/docs/webstore/prepare): manifest، نسخه و ZIP با manifest در ریشه.
- [Publish in the Chrome Web Store](https://developer.chrome.com/docs/webstore/publish): آپلود، فرم‌ها، بررسی و انتشار.
- [Register developer account](https://developer.chrome.com/docs/webstore/register): ثبت‌نام و مناطق پشتیبانی‌شده.
- [Privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy): هدف، دسترسی‌ها، کد خارجی و داده.
- [User Data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq): اظهارنامه حتی برای پردازش محلی.
- [Supplying images](https://developer.chrome.com/docs/webstore/images): اندازه‌ها و محتوای تصاویر.
- [upload-artifact](https://github.com/actions/upload-artifact): دانلود مستقیم فایل با `archive: false`.
