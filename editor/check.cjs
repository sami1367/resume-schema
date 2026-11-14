const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { server, validate } = require('./server');
(async () => {
  const name = `.editor-check-${process.pid}.json`;
  const target = path.join(__dirname, '../resumes', name);
  const original = '{"basics":{"name":"Test"}}\n';
  await fs.writeFile(target, original);
  try {
    await new Promise(resolve => server.listen(3000, '127.0.0.1', resolve));
    const base = 'http://127.0.0.1:3000';
    const files = await (await fetch(base + '/api/files')).json(); assert(files.includes(name));
    const url = base + '/api/files/' + name;
    const loaded = await (await fetch(url)).json();
    const put = body => fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    assert.equal((await put({ data: [], revision: loaded.revision })).status, 422);
    const saved = await put({ data: { basics: { name: 'Updated' } }, revision: loaded.revision }); assert.equal(saved.status, 200);
    assert.equal(JSON.parse(await fs.readFile(target, 'utf8')).basics.name, 'Updated');
    assert.equal((await put({ data: loaded.data, revision: loaded.revision })).status, 409);
    assert.equal((await fetch(base + '/api/files/' + encodeURIComponent('../schema.json'))).status, 400);
    assert.equal((await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json', Origin: 'https://example.com' }, body: '{}' })).status, 403);
    for (const entry of files.filter(f => f !== name)) assert.deepEqual(validate(JSON.parse(await fs.readFile(path.join(__dirname, '../resumes', entry)))), [], entry);
    console.log('Editor checks passed: listing, loading, saving, validation, conflicts, path restrictions, origin checks, existing resumes.');
  } finally { server.close(); await fs.rm(target, { force: true }); }
})().catch(e => { console.error(e); process.exitCode = 1; });
