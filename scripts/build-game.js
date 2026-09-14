// Monogatari ships a ready-to-host browser runtime; validate the static release.
import { readFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import vm from "node:vm";

const root = new URL("../public/", import.meta.url);
const html = (
  await Promise.all(
    ["index.html", "team.html"].map((file) =>
      readFile(new URL(file, root), "utf8"),
    ),
  )
).join("\n");
const context = vm.createContext({ window: {} });
for (const file of ["characters.js", "team.js", "scenario.js", "story.js"])
  vm.runInContext(await readFile(new URL(file, root), "utf8"), context);
const { YEONBUN_PORTRAITS: portraits, TEAM04_MEMBERS: routes } = context.window;
for (const route of routes) {
  if (!portraits[route.name])
    throw new Error(`Missing portrait: ${route.name}`);
  await access(new URL(`assets/${portraits[route.name]}`, root));
}
for (const [, file] of html.matchAll(/(?:src|href)="\/([^"]+)"/g))
  await access(new URL(file, root));
await access(new URL("assets/team04-scenes.png", root));
const vendor = new URL("vendor/monogatari/", root);
const manifest = JSON.parse(
  await readFile(new URL("manifest.json", vendor), "utf8"),
);
for (const [file, hash] of Object.entries(manifest.sha256)) {
  const actual = createHash("sha256")
    .update(await readFile(new URL(file, vendor)))
    .digest("hex");
  if (actual !== hash) throw new Error(`Engine checksum mismatch: ${file}`);
}
console.log(
  `Monogatari ${manifest.version}: root entry, ${routes.length} members and portraits ready in public/`,
);
