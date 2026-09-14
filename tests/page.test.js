import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { JSDOM } from "jsdom";
const root = new URL("../public/", import.meta.url);
const html = await fs.readFile(new URL("index.html", root), "utf8");
const scripts = await Promise.all(
  ["characters.js", "routes.js", "story.js", "game.js"].map((file) =>
    fs.readFile(new URL(file, root), "utf8"),
  ),
);
const portraits = {
  정치훈: "characters/jeong-chihoon-anime.png",
  주정원: "characters/joo-jeongwon-anime.png",
  박진환: "characters/park-jinhwan-anime.png",
  남성수: "characters/nam-seongsu-anime.png",
};

test("root hosts the native game directly and loads character data before its script", () => {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  assert.equal(
    doc.querySelectorAll("#monogatari game-screen text-box").length,
    1,
  );
  assert.equal(
    doc.querySelectorAll("header, footer, #blind, #match-form").length,
    0,
  );
  assert.deepEqual(
    Array.from(doc.scripts, (script) => script.getAttribute("src")),
    [
      "/vendor/monogatari/monogatari.js",
      "/characters.js",
      "/routes.js",
      "/story.js",
      "/game.js",
    ],
  );
  dom.window.close();
});

test("root and direct links auto-start the engine with the correct named anime portraits", async () => {
  for (const [index, name] of [
    undefined,
    ...Object.keys(portraits),
    "unknown",
  ].entries()) {
    const dom = new JSDOM(html, {
      runScripts: "outside-only",
      url:
        "https://example.com/" +
        (name ? "?route=" + encodeURIComponent(name) : ""),
    });
    try {
      const w = dom.window;
      const captured = {};
      w.matchMedia = () => ({ matches: true });
      w.monogatari = Object.fromEntries(
        [
          "settings",
          "preferences",
          "storage",
          "characters",
          "script",
          "translation",
        ].map((key) => [key, (value) => (captured[key] = value)]),
      );
      Object.assign(w.monogatari, {
        assets() {},
        on() {},
        debug: { level() {} },
        init: async (selector) => assert.equal(selector, "#monogatari"),
      });
      scripts.forEach((source) => w.eval(source));
      await new Promise((resolve) => setTimeout(resolve, 0));
      assert.equal(captured.settings.ShowMainScreen, false);
      assert.equal(captured.settings.ServiceWorkers, false);
      assert.equal(
        captured.settings.Label,
        index > 0 && index < 5 ? `Route${index - 1}` : "Start",
      );
      Object.entries(portraits).forEach(([name, path], i) => {
        assert.equal(captured.characters[`c${i}`].name, name);
        assert.equal(captured.characters[`c${i}`].sprites.portrait, path);
        assert.ok(
          captured.script.Start[1].Choice[`Route${i}`].Text.includes(path),
        );
      });
      assert.equal(w.document.body.dataset.engineReady, "true");
    } finally {
      dom.window.close();
    }
  }
});
