# Modern Classic فارسی

قالب محلی مستقل با الهام از چیدمان Modern Classic: تک‌ستونی، عنوان‌های آبی، کارت‌های مهارت و خروجی A4.

- `index.js`: تولید HTML، عنوان‌های فارسی و تاریخ‌های میلادی با نام ماه فارسی.
- `style.css`: راست‌به‌چپ، تایپوگرافی، فاصله‌ها و صفحه‌بندی چاپ.
- `fonts/Vazirmatn-*.ttf`: فونت وزیرمتن، نسخهٔ 33.003، وزن‌های معمولی، نیمه‌ضخیم و ضخیم.
- `fonts/OFL.txt`: مجوز SIL Open Font License؛ هنگام توزیع فونت حفظ شود.

منبع فونت: https://github.com/rastikerdar/vazirmatn/tree/v33.003

فونت در HTML به‌صورت data URL تعبیه می‌شود تا خروجی PDF به اینترنت یا نصب فونت روی سیستم وابسته نباشد. هیچ فایل داخل node_modules ویرایش نشده است.

```bash
npx resume export resume.fa.pdf --resume resume.fa.json --theme ./themes/modern-classic-fa
npx resume export cv.fa.pdf --resume cv.fa.json --theme ./themes/modern-classic-fa
```
