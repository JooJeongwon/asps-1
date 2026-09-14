import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { JSDOM } from "jsdom";
const root = new URL("../public/", import.meta.url);
const html = await fs.readFile(new URL("index.html", root), "utf8");
const scripts = await Promise.all(
  ["characters.js", "team.js", "scenario.js", "story.js", "game.js"].map((f) =>
    fs.readFile(new URL(f, root), "utf8"),
  ),
);
test("root always starts the shared story; old route links cannot bypass the meetings", async () => {
  for (const query of [
    "",
    "?route=정치훈",
    "?route=박진환",
    "?route=unknown",
  ]) {
    const dom = new JSDOM(html, {
      runScripts: "outside-only",
      url: "https://example.com/" + query,
    });
    const w = dom.window;
    const captured = {};
    try {
      w.matchMedia = () => ({ matches: true });
      w.monogatari = Object.fromEntries(
        [
          "settings",
          "preferences",
          "storage",
          "characters",
          "script",
          "translation",
        ].map((k) => [k, (v) => (captured[k] = v)]),
      );
      Object.assign(w.monogatari, {
        assets() {},
        action: () => ({ messages() {} }),
        on() {},
        debug: { level() {} },
        init: async (selector) => assert.equal(selector, "#monogatari"),
      });
      scripts.forEach((s) => w.eval(s));
      await new Promise((r) => setTimeout(r, 0));
      assert.equal(captured.settings.ShowMainScreen, false);
      assert.equal(captured.settings.Label, "Start");
      assert.equal(captured.settings.Name, "ASPS_TEAM04_v1");
      assert.equal(captured.script.Start[1], "jump Cut01");
      assert.equal(w.document.querySelectorAll("[data-affinity]").length, 4);
      for (const m of w.TEAM04_MEMBERS)
        assert.equal(
          captured.characters[m.id].sprites.portrait,
          w.YEONBUN_PORTRAITS[m.name],
        );
      assert.equal(captured.characters.you.name, "나");
      assert.equal(captured.characters.you.sprites, undefined);
      assert.equal(
        w.document.querySelectorAll("header, footer, #blind").length,
        0,
      );
    } finally {
      dom.window.close();
    }
  }
});
test("ending team page uses real photos and offers functioning profile/project links", async () => {
  const page = await fs.readFile(new URL("team.html", root), "utf8");
  const code = await fs.readFile(new URL("team-page.js", root), "utf8");
  for (const query of ["?match=jinhwan", "?match=%3Cimg%20src=x%3E"]) {
    const dom = new JSDOM(page, {
      runScripts: "outside-only",
      url: "https://example.com/team.html" + query,
    });
    const w = dom.window;
    try {
      w.HTMLElement.prototype.scrollIntoView = () => {};
      w.eval(scripts[1]);
      w.eval(code);
      assert.equal(w.document.querySelectorAll(".member").length, 4);
      assert.equal(w.document.querySelectorAll(".member img").length, 4);
      assert.equal(
        w.document.querySelector("#your-match").hidden,
        query.includes("%3C"),
      );
      if (!query.includes("%3C"))
        assert.match(
          w.document.querySelector("#your-match").textContent,
          /박진환/,
        );
      w.document.querySelector("#show-profiles").click();
      assert.equal(w.document.querySelectorAll("details[open]").length, 4);
      w.document.querySelector("#show-project").click();
      assert.equal(w.document.querySelector("#project").hidden, false);
      assert.equal(
        w.document.querySelector('a[target="_blank"]').href,
        "https://github.com/JooJeongwon/asps-1",
      );
    } finally {
      dom.window.close();
    }
  }
});
