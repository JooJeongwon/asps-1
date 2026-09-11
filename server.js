import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./public/index.html", import.meta.url));
const styles = readFileSync(new URL("./public/styles.css", import.meta.url));
const port = process.env.PORT || 3000;

createServer((request, response) => {
  const isStylesheet = request.url === "/styles.css";
  response.setHeader("Content-Type", isStylesheet ? "text/css; charset=utf-8" : "text/html; charset=utf-8");
  response.end(isStylesheet ? styles : html);
}).listen(port, () => console.log(`http://localhost:${port}`));
