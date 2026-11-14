'use strict';
const $ = id => document.getElementById(id);
let data, schema, file, rev, dirty = false, mode = 'form', edits = 0;
const title = key => key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
function status(message, error = false) { $('status').textContent = message; $('status').className = error ? 'error' : ''; }
function changed() { edits++; dirty = true; $('save').disabled = false; status('Unsaved changes'); }
async function api(url, options) { const response = await fetch(url, options); const result = await response.json(); if (!response.ok) throw new Error(result.error); return result; }
function empty(spec = {}) { if (spec.type === 'array') return []; if (spec.type === 'object' || spec.properties) return {}; if (spec.type === 'number' || spec.type === 'integer') return 0; if (spec.type === 'boolean') return false; return ''; }
function makeButton(text, action, cls) { const b = document.createElement('button'); b.textContent = text; b.type = 'button'; b.className = cls || ''; b.onclick = action; return b; }
function renderValue(parent, key, spec, container, root = false) {
  const value = parent[key];
  if (value !== null && typeof value === 'object') {
    const box = document.createElement('details'); box.open = root;
    const summary = document.createElement('summary'); summary.textContent = title(String(key)) + (Array.isArray(value) ? ` · ${value.length}` : ''); box.append(summary);
    if (!root) box.append(makeButton('Remove', () => { if (Array.isArray(parent)) parent.splice(key, 1); else delete parent[key]; changed(); render(); }, 'remove'));
    if (Array.isArray(value)) {
      value.forEach((_, i) => renderValue(value, i, spec?.items || {}, box));
      box.append(makeButton('+ Add item', () => { value.push(empty(spec?.items)); changed(); render(); }, 'add'));
    } else {
      Object.keys(value).forEach(k => renderValue(value, k, spec?.properties?.[k] || {}, box));
      const missing = Object.keys(spec?.properties || {}).filter(k => !(k in value));
      if (missing.length) {
        const select = document.createElement('select'); select.setAttribute('aria-label', `Add field to ${key}`);
        const placeholder = new Option('Add a field…', ''); select.append(placeholder);
        missing.forEach(k => select.append(new Option(title(k), k)));
        select.onchange = () => { if (!select.value) return; value[select.value] = empty(spec.properties[select.value]); changed(); render(); }; box.append(select);
      }
    }
    container.append(box); return;
  }
  const row = document.createElement('div'); row.className = 'fieldRow';
  const label = document.createElement('label'); label.textContent = typeof key === 'number' ? `Item ${key + 1}` : title(key);
  const input = document.createElement(typeof value === 'string' && (value.length > 110 || /summary|description|reference/.test(key)) ? 'textarea' : 'input');
  input.dir = 'auto'; input.value = value === null ? 'null' : String(value);
  if (typeof value === 'boolean') { input.type = 'checkbox'; input.checked = value; }
  if (typeof value === 'number') input.type = 'number';
  input.oninput = () => { parent[key] = typeof value === 'boolean' ? input.checked : typeof value === 'number' ? Number(input.value) : input.value; changed(); };
  label.append(input); row.append(label, makeButton('Remove', () => { if (Array.isArray(parent)) parent.splice(key, 1); else delete parent[key]; changed(); render(); }, 'remove')); container.append(row);
}
function render() {
  $('form').replaceChildren();
  if (!data) return;
  const wrapper = { Resume: data }; renderValue(wrapper, 'Resume', schema, $('form'), true);
  $('raw').value = JSON.stringify(data, null, 2);
}
function parseRaw() { if (mode === 'json') { const parsed = JSON.parse($('raw').value); if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Resume must be a JSON object.'); data = parsed; } }
async function load(name) {
  if (dirty && !confirm('Discard unsaved changes?')) return;
  try {
    const result = await api('/api/files/' + encodeURIComponent(name));
    file = name; data = result.data; rev = result.revision; dirty = false; $('save').disabled = true;
    $('title').textContent = name; $('subtitle').textContent = 'Edit your resume, one detail at a time.';
    document.querySelectorAll('nav button').forEach(b => b.classList.toggle('active', b.textContent === file));
    render(); status('All changes saved to disk');
  } catch (e) { status(e.message, true); }
}
function setMode(next) {
  try { parseRaw(); mode = next; render(); $('form').hidden = mode !== 'form'; $('rawWrap').hidden = mode !== 'json'; $('formMode').setAttribute('aria-pressed', mode === 'form'); $('jsonMode').setAttribute('aria-pressed', mode === 'json'); } catch (e) { status(e.message, true); }
}
$('formMode').onclick = () => setMode('form'); $('jsonMode').onclick = () => setMode('json'); $('raw').oninput = changed;
$('reload').onclick = () => file && load(file);
$('save').onclick = async () => {
  try { parseRaw(); const savedEdits = edits; $('save').disabled = true; const result = await api('/api/files/' + encodeURIComponent(file), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data, revision: rev }) }); rev = result.revision; dirty = edits !== savedEdits; status(dirty ? 'Unsaved changes' : 'Saved · ' + new Date().toLocaleTimeString()); }
  catch (e) { status(e.message, true); } finally { $('save').disabled = !dirty; }
};
window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
window.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); if (dirty) $('save').click(); } });
(async () => { try { const result = await Promise.all([api('/api/files'), api('/api/schema')]); schema = result[1]; result[0].forEach(name => $('files').append(makeButton(name, () => load(name)))); if (result[0].length) await load(result[0][0]); else status('Add a .json resume to resumes/ and refresh.'); } catch (e) { status(e.message, true); } })();
