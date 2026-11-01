const fs = require('fs');
const path = require('path');
const fontFaces = [['Regular',400],['SemiBold',600],['Bold',700]].map(([name,weight]) => {
 const data = fs.readFileSync(path.join(__dirname, `fonts/Vazirmatn-${name}.ttf`)).toString('base64');
 return `@font-face{font-family:Vazirmatn;src:url(data:font/ttf;base64,${data}) format('truetype');font-weight:${weight};font-style:normal;font-display:block}`;
}).join('');
const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text = value => `<bdi dir="auto">${escape(value)}</bdi>`;
const p = value => value ? `<p>${text(value)}</p>` : '';
const list = items => items?.length ? `<ul>${items.map(x => `<li>${text(x)}</li>`).join('')}</ul>` : '';
const date = value => {
 if (!value) return '';
 // Keep the original Gregorian dates; never invent missing months or days.
 const months = ['ژانویه','فوریه','مارس','آوریل','مه','ژوئن','ژوئیه','اوت','سپتامبر','اکتبر','نوامبر','دسامبر'];
 const [y,m,d] = String(value).split('-');
 return [d, m && months[Number(m)-1], y].filter(Boolean).join(' ').replace(/\d/g, n => '۰۱۲۳۴۵۶۷۸۹'[n]);
};
const range = item => item.startDate || item.endDate ? `<span class="date">${date(item.startDate)}${item.startDate ? ' تا ' : ''}${item.endDate ? date(item.endDate) : 'اکنون'}</span>` : '';
const link = (url,label) => /^(https?:|mailto:|tel:)/i.test(url || '') ? `<a href="${escape(url)}">${text(label || url)}</a>` : text(label || url || '');
const section = (title,items,render) => items?.length ? `<section data-section="${title}"><h2>${title}</h2>${items.map(render).join('')}</section>` : '';
const article = (title,subtitle,body,dates='') => `<article><div class="entry-heading"><h3>${text(title)}</h3>${dates}</div>${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}${body}</article>`;
exports.pdfRenderOptions = {format:'A4', mediaType:'print', margin:{top:'13mm',bottom:'13mm',left:'15mm',right:'15mm'}, preferCSSPageSize:true};
exports.render = function(resume) {
 const b = resume.basics || {}, loc = b.location || {};
 const contacts = [b.email && link(`mailto:${b.email}`,b.email), b.phone && link(`tel:${b.phone}`,b.phone), b.url && link(b.url), loc.city && text([loc.city,loc.region !== loc.city && loc.region,loc.countryCode === 'IR' ? 'ایران' : loc.countryCode].filter(Boolean).join('، '))].filter(Boolean);
 const cards = (items,field) => `<div class="cards">${items.map(x=>`<div class="card"><h3>${text(x[field])}</h3>${x.fluency ? p(x.fluency):''}${x.keywords?.length ? `<div class="tags">${x.keywords.map(k=>text(k)).join('، ')}</div>`:''}</div>`).join('')}</div>`;
 return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(b.name)} | رزومه</title><style>${fontFaces}${css}</style></head><body class="${resume.projects?.length ? 'cv' : 'resume'}"><main>
 <header><h1>${text(b.name)}</h1>${b.label ? `<div class="label">${text(b.label)}</div>`:''}<div class="contacts">${contacts.map(c=>`<span>${c}</span>`).join('')}</div>${b.profiles?.length ? `<div class="contacts">${b.profiles.map(x=>link(x.url,x.network)).join(' · ')}</div>`:''}${b.summary ? `<div class="profile"><h2>درباره من</h2>${p(b.summary)}</div>`:''}</header>
 ${section('سوابق شغلی',resume.work,w=>article(w.position,[w.name && (w.url ? link(w.url,w.name):text(w.name)),w.location && text(w.location)].filter(Boolean).join(' · '),p(w.summary)+list(w.highlights),range(w)))}
 ${resume.skills?.length ? `<section><h2>مهارت‌ها</h2>${cards(resume.skills,'name')}</section>`:''}
 ${section('تحصیلات',resume.education,e=>article(e.institution,text([e.studyType,e.area].filter(Boolean).join('، ')),p(e.summary)+(e.score ? p('معدل: '+e.score):'')+list(e.courses),range(e)))}
 ${section('پروژه‌ها',resume.projects,x=>article(x.name,[x.url && link(x.url,'مشاهده پروژه'),x.entity && text(x.entity)].filter(Boolean).join(' · '),p(x.summary || x.description)+list(x.highlights)+(x.roles?.length ? p(x.roles.join('، ')):''),range(x)))}
 ${section('دوره‌ها و گواهی‌نامه‌ها',resume.certificates,x=>article(x.name,text(x.issuer),p(x.summary),date(x.date)))}
 ${section('فعالیت‌های داوطلبانه',resume.volunteer,x=>article(x.position,text(x.organization),p(x.summary)+list(x.highlights),range(x)))}
 ${section('افتخارات',resume.awards,x=>article(x.title,text(x.awarder),p(x.summary),date(x.date)))}
 ${section('انتشارات',resume.publications,x=>article(x.name,text(x.publisher),p(x.summary),date(x.releaseDate)))}
 ${resume.languages?.length ? `<section><h2>زبان‌ها</h2>${cards(resume.languages,'language')}</section>`:''}
 ${resume.interests?.length ? `<section><h2>علایق</h2>${cards(resume.interests,'name')}</section>`:''}
 ${section('معرف‌ها',resume.references,x=>article(x.name,'',p(x.reference)))}
 </main></body></html>`;
};
