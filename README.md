# راهنمای ساخت PDF رزومه

دو نوع سند، هرکدام به فارسی و انگلیسی، نگهداری می‌شود:

| نوع | انگلیسی | فارسی |
| --- | --- | --- |
| CV کامل: سوابق، پروژه‌ها، دوره‌ها و علایق | [resumes/cv.en.json](resumes/cv.en.json) | [resumes/cv.fa.json](resumes/cv.fa.json) |
| رزومه کوتاه: معرفی، سوابق منتخب، تحصیلات، مهارت‌ها و زبان‌ها | [resumes/resume.en.json](resumes/resume.en.json) | [resumes/resume.fa.json](resumes/resume.fa.json) |

فایل [resumes/resume.json](resumes/resume.json) کپی انگلیسی رزومه کوتاه است. هنگام اجرای CLI از ریشهٔ پروژه، مسیر ورودی را با `--resume` مشخص کنید.

فایل‌های JSON در پوشهٔ `resumes/` و خروجی‌های PDF در پوشهٔ `pdfs/` نگهداری می‌شوند.

## نصب ابزارها (یک‌بار)

قالب انتخاب‌شده **Modern Classic** است و با نام `modern-classic` در دستورها استفاده می‌شود.

در ترمینال، از پوشهٔ پروژه اجرا کنید:

```bash
npm install --save-dev resume-cli jsonresume-theme-modern-classic
```

برای خروجی PDF، مرورگر موردنیاز Puppeteer را هم یک‌بار نصب کنید (یا اگر خطای «Could not find Chrome» دریافت کردید):

```bash
npx puppeteer browsers install chrome
```

## ساخت PDF بعد از هر تغییر

پس از ویرایش و ذخیرهٔ فایل‌های JSON در پوشهٔ `resumes/`، دستور موردنظر را از ریشهٔ پروژه (پوشهٔ حاوی `package.json`) اجرا کنید. پوشه‌های `resumes/` و `pdfs/` در Git نگهداری می‌شوند.

برای ساخت هر نسخه به‌صورت جداگانه:

رزومه کوتاه انگلیسی:

```bash
npx resume export pdfs/resume.en.pdf --resume resumes/resume.en.json --theme modern-classic
```

رزومه کوتاه فارسی:

```bash
npx resume export pdfs/resume.fa.pdf --resume resumes/resume.fa.json --theme ./themes/modern-classic-fa
```

CV کامل انگلیسی:

```bash
npx resume export pdfs/cv.en.pdf --resume resumes/cv.en.json --theme modern-classic
```

CV کامل فارسی:

```bash
npx resume export pdfs/cv.fa.pdf --resume resumes/cv.fa.json --theme ./themes/modern-classic-fa
```

برای ساخت همهٔ چهار PDF با یک دستور:

```bash
npx resume export pdfs/resume.en.pdf --resume resumes/resume.en.json --theme modern-classic && npx resume export pdfs/resume.fa.pdf --resume resumes/resume.fa.json --theme ./themes/modern-classic-fa && npx resume export pdfs/cv.en.pdf --resume resumes/cv.en.json --theme modern-classic && npx resume export pdfs/cv.fa.pdf --resume resumes/cv.fa.json --theme ./themes/modern-classic-fa
```

فایل‌های `pdfs/resume.en.pdf`، `pdfs/resume.fa.pdf`، `pdfs/cv.en.pdf` و `pdfs/cv.fa.pdf` در پوشهٔ `pdfs/` ساخته می‌شوند و با اجرای مجدد دستورها جایگزین خواهند شد. این دستورها را باید بعد از هر تغییر اجرا کنید؛ خروجی PDF خودکار به‌روز نمی‌شود.

هر چهار فایل مستقل هستند؛ تغییر یکی به‌صورت خودکار در دیگری اعمال نمی‌شود. برای ویرایش، فایل نوع سند و زبان موردنظر را انتخاب کنید. پس از تغییر `resumes/resume.en.json`، کپی آن را با دستور زیر هماهنگ کنید:

```bash
cp resumes/resume.en.json resumes/resume.json
```

CVها اطلاعات کامل قبلی را حفظ کرده‌اند. رزومه‌های کوتاه بر اساس متن جدید تهیه شده‌اند؛ در متن جدید، شاخص پاسخ زیر یک ثانیه از ۹۰٪ به ۹۵٪ و مخاطب اپلیکیشن دوم تلامالا از مدیران به فروشگاه‌ها تغییر کرده است. پیش از ارسال، این تفاوت‌ها را بررسی کنید. تعداد صفحات PDF به قالب و صفحه‌بندی بستگی دارد.

نسخه‌های فارسی از قالب محلی `themes/modern-classic-fa` با چیدمان راست‌به‌چپ، عنوان‌های فارسی و فونت وزیرمتن استفاده می‌کنند. نسخه‌های انگلیسی همچنان از Modern Classic اصلی استفاده می‌کنند.

برای تغییر ظاهر فارسی، فایل `themes/modern-classic-fa/style.css` و برای تغییر عنوان‌ها و ساختار، فایل `themes/modern-classic-fa/index.js` را ویرایش کنید. فونت داخل پوشهٔ `fonts` قرار دارد و در خروجی تعبیه می‌شود؛ تولید و نمایش PDF فارسی به دانلود فونت از اینترنت نیاز ندارد. تاریخ‌ها با نام ماه فارسی و تقویم میلادی نمایش داده می‌شوند.

مرجع: [مستندات رسمی resume-cli](https://github.com/jsonresume/resume-cli).

---

# JSON Resume Schema — MOVED

> **This repository has moved.** The JSON Resume schema specification and all
> ongoing development now live in the JSON Resume monorepo at
> **[jsonresume/jsonresume.org](https://github.com/jsonresume/jsonresume.org)**,
> under [`packages/schema`](https://github.com/jsonresume/jsonresume.org/tree/master/packages/schema).
> This repository is archived and read-only.

## What is JSON Resume?

JSON Resume is an open-source, community-driven standard for representing a
résumé as a single structured JSON document. The schema defines the canonical
shape of a `resume.json` file — sections such as `basics`, `work`, `education`,
`skills`, `projects`, and more — so that a person's career data can be authored
once and rendered, validated, hosted, and themed by any compatible tool.

## Where things went

- **Schema spec + development:** https://github.com/jsonresume/jsonresume.org (`packages/schema`)
- **npm package:** [`@jsonresume/schema`](https://www.npmjs.com/package/@jsonresume/schema) — **unchanged**, still the package to install. It is now published from the monorepo via changesets.
- **Issues:** Please open new issues in the [monorepo](https://github.com/jsonresume/jsonresume.org/issues). Existing open issues from this repo were transferred there.
- **Homepage, registry, tooling, and themes:** also in the [monorepo](https://github.com/jsonresume/jsonresume.org).

The migration of the schema source into the monorepo landed in
[jsonresume.org#283](https://github.com/jsonresume/jsonresume.org/pull/283).
See the org consolidation tracking issue
[#275](https://github.com/jsonresume/jsonresume.org/issues/275) for background.

## Installation (unchanged)

```
npm install --save @jsonresume/schema
```
