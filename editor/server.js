'use strict';
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { Validator } = require('jsonschema');
const schema = require('../schema.json');
const root = path.resolve(__dirname, '../resumes');
const revision = data => crypto.createHash('sha256').update(data).digest('hex');
const port = Number(process.env.PORT || 3000);
function validate(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return ['Resume must be a JSON object.'];
  return new Validator().validate(data, schema).errors.map(e => e.stack);
}
const server = http.createServer(async (req, res) => {
  const send = (status, data) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); };
  try {
    // Only same-origin browser requests may write to this unauthenticated local service.
    if (req.headers.host !== `localhost:${port}` && req.headers.host !== `127.0.0.1:${port}`) return send(403, { error: 'Invalid host' });
    if (req.method === 'PUT' && (req.headers.origin && req.headers.origin !== `http://${req.headers.host}` || req.headers['content-type'] !== 'application/json')) return send(403, { error: 'Invalid request origin or content type' });
    const url = new URL(req.url, `http://localhost:${port}`);
    if (req.method === 'GET' && url.pathname === '/api/files') {
      const entries = await fs.readdir(root, { withFileTypes: true });
      return send(200, entries.filter(e => e.isFile() && e.name.endsWith('.json')).map(e => e.name).sort());
    }
    if (req.method === 'GET' && url.pathname === '/api/schema') return send(200, schema);
    if (url.pathname.startsWith('/api/files/')) {
      const name = decodeURIComponent(url.pathname.slice('/api/files/'.length));
      if (name !== path.basename(name) || !name.endsWith('.json')) return send(400, { error: 'Invalid filename' });
      const file = path.join(root, name);
      if (!(await fs.lstat(file)).isFile()) return send(400, { error: 'Expected a regular file' });
      const raw = await fs.readFile(file, 'utf8');
      if (req.method === 'GET') return send(200, { data: JSON.parse(raw), revision: revision(raw) });
      if (req.method === 'PUT') {
        let body = '';
        for await (const chunk of req) { body += chunk; if (Buffer.byteLength(body) > 2e6) return send(413, { error: 'File too large' }); }
        const input = JSON.parse(body);
        const errors = validate(input.data);
        if (errors.length) return send(422, { error: errors.join('\n') });
        if (input.revision !== revision(raw)) return send(409, { error: 'This file changed on disk. Reload before saving to avoid overwriting those changes.' });
        const output = JSON.stringify(input.data, null, 2) + '\n';
        const temp = path.join(root, `.${name}.${crypto.randomUUID()}.tmp`);
        try { await fs.writeFile(temp, output, { flag: 'wx' }); await fs.rename(temp, file); }
        finally { await fs.rm(temp, { force: true }); }
        return send(200, { revision: revision(output) });
      }
    }
    if (req.method === 'GET' && ['/', '/app.js', '/style.css'].includes(url.pathname)) {
      const name = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
      res.writeHead(200, { 'Content-Type': { 'index.html': 'text/html; charset=utf-8', 'app.js': 'text/javascript', 'style.css': 'text/css' }[name] });
      return res.end(await fs.readFile(path.join(__dirname, name)));
    }
    send(404, { error: 'Not found' });
  } catch (error) { send(error.code === 'ENOENT' ? 404 : error instanceof SyntaxError ? 400 : 500, { error: error.message }); }
});
if (require.main === module) server.listen(port, '127.0.0.1', () => console.log(`Resume editor: http://localhost:${port}`));
module.exports = { server, validate };
