import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { handleApi } from '../lib/compatibility.js';

const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/tailwind.css', ['tailwind.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
]);
export function createAppServer(env = process.env, fetcher = fetch) {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname.startsWith('/api/')) {
        const response = await handleApi(new Request(url, { method: req.method }), env, fetcher);
        res.writeHead(response.status, Object.fromEntries(response.headers));
        return res.end(await response.text());
      }
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
      const file = files.get(url.pathname);
      if (!file) { res.writeHead(404); return res.end('Not found'); }
      const body = await readFile(new URL(`../public/${file[0]}`, import.meta.url));
      res.writeHead(200, { 'Content-Type': file[1] });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch {
      res.writeHead(500); res.end('Internal server error');
    }
  });
}
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  createAppServer().listen(process.env.PORT || 3000, '127.0.0.1', () => console.log(`http://127.0.0.1:${process.env.PORT || 3000}`));
}
