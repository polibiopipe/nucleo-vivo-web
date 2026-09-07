import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

// Serve the same allowlisted assets as production for responsive browser QA.
const root = process.cwd();
const allowed = new Set(JSON.parse(await readFile('scripts/public-files.json', 'utf8')));
const args = process.argv.slice(2);
const port = Number(args[args.indexOf('--port') + 1] || 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/__review') {
      const width = Math.max(320, Math.min(1920, Number(url.searchParams.get('w')) || 390));
      const height = Math.max(320, Math.min(1400, Number(url.searchParams.get('h')) || 844));
      const page = url.searchParams.get('page') === 'management' ? '/prototipos/move/gestion/' : '/prototipos/move/';
      const scale = Math.min(1, 1250 / width, 840 / height);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`<!doctype html><html lang="es"><meta charset="utf-8"><title>MOVE responsive review</title><style>body{margin:12px;background:#ddd;font:14px system-ui}header{margin-bottom:10px}iframe{border:0;width:${width}px;height:${height}px;transform:scale(${scale});transform-origin:top left}</style><header>${width} × ${height}</header><iframe title="MOVE preview" src="${page}"></iframe></html>`);
      return;
    }
    let file = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    if (!file || file.endsWith('/')) file += 'index.html';
    if (!allowed.has(file)) { res.writeHead(404); res.end('Not found'); return; }
    const full = path.join(root, file);
    if (!(await stat(full)).isFile()) throw new Error('Not a file');
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    res.end(await readFile(full));
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '0.0.0.0', () => console.log(`Static preview ready on ${port}`));
