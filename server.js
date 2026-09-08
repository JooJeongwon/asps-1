import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./index.html", import.meta.url));
const port = process.env.PORT || 3000;

createServer((_, response) => {
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.end(html);
}).listen(port, () => console.log(`http://localhost:${port}`));
