import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { handleApi } from "../lib/compatibility.js";

const files = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  [
    "/assets/characters/jeong-chihoon-anime.png",
    ["assets/characters/jeong-chihoon-anime.png", "image/png"],
  ],
  [
    "/assets/characters/joo-jeongwon-anime.png",
    ["assets/characters/joo-jeongwon-anime.png", "image/png"],
  ],
  [
    "/assets/characters/park-jinhwan-anime.png",
    ["assets/characters/park-jinhwan-anime.png", "image/png"],
  ],
  [
    "/assets/characters/nam-seongsu-anime.png",
    ["assets/characters/nam-seongsu-anime.png", "image/png"],
  ],
  ["/characters.js", ["characters.js", "text/javascript; charset=utf-8"]],
  [
    "/assets/characters/jeong-chihoon.jpeg",
    ["assets/characters/jeong-chihoon.jpeg", "image/jpeg"],
  ],
  [
    "/assets/characters/joo-jeongwon.jpeg",
    ["assets/characters/joo-jeongwon.jpeg", "image/jpeg"],
  ],
  [
    "/assets/characters/park-jinhwan.jpg",
    ["assets/characters/park-jinhwan.jpg", "image/jpeg"],
  ],
  [
    "/assets/characters/nam-seongsu.png",
    ["assets/characters/nam-seongsu.png", "image/png"],
  ],
  ["/routes.js", ["routes.js", "text/javascript; charset=utf-8"]],
  ["/play.html", ["index.html", "text/html; charset=utf-8"]],
  ["/play.css", ["play.css", "text/css; charset=utf-8"]],
  ["/story.js", ["story.js", "text/javascript; charset=utf-8"]],
  [
    "/vendor/monogatari/monogatari.js",
    ["vendor/monogatari/monogatari.js", "text/javascript; charset=utf-8"],
  ],
  [
    "/vendor/monogatari/monogatari.css",
    ["vendor/monogatari/monogatari.css", "text/css; charset=utf-8"],
  ],
  ["/game.js", ["game.js", "text/javascript; charset=utf-8"]],
  ["/assets/yeonbun-scenes.png", ["assets/yeonbun-scenes.png", "image/png"]],
  ["/assets/favicon.svg", ["assets/favicon.svg", "image/svg+xml"]],
]);
export function createAppServer(env = process.env, fetcher = fetch) {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      if (url.pathname.startsWith("/api/")) {
        const response = await handleApi(
          new Request(url, { method: req.method }),
          env,
          fetcher,
        );
        res.writeHead(response.status, Object.fromEntries(response.headers));
        return res.end(await response.text());
      }
      if (!["GET", "HEAD"].includes(req.method)) {
        res.writeHead(405);
        return res.end();
      }
      const file = files.get(url.pathname);
      if (!file) {
        res.writeHead(404);
        return res.end("Not found");
      }
      const body = await readFile(
        new URL(`../public/${file[0]}`, import.meta.url),
      );
      res.writeHead(200, { "Content-Type": file[1] });
      res.end(req.method === "HEAD" ? undefined : body);
    } catch {
      res.writeHead(500);
      res.end("Internal server error");
    }
  });
}
if (
  process.argv[1] &&
  import.meta.url === new URL(process.argv[1], "file:").href
) {
  createAppServer().listen(process.env.PORT || 3000, "127.0.0.1", () =>
    console.log(`http://127.0.0.1:${process.env.PORT || 3000}`),
  );
}
