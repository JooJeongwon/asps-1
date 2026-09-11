import { handleApi } from './compatibility.js';

export default async function handler(req, res) {
  const request = new Request(new URL(req.url, 'https://asps-1.vercel.app'), { method: req.method });
  const response = await handleApi(request, process.env);
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(await response.text());
}
