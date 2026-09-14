import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { JSDOM } from "jsdom";

const html = await fs.readFile(
  new URL("../public/index.html", import.meta.url),
  "utf8",
);
const scripts = await Promise.all(
  ["routes.js", "app.js", "game.js"].map((file) =>
    fs.readFile(new URL(`../public/${file}`, import.meta.url), "utf8"),
  ),
);
function setup(reducedMotion = true) {
  const dom = new JSDOM(html, {
    runScripts: "outside-only",
    url: "https://example.com",
  });
  dom.window.AbortSignal = AbortSignal;
  dom.window.fetch = async () => {
    throw new Error("offline");
  };
  dom.window.matchMedia = () => ({ matches: reducedMotion });
  scripts.forEach((script) => dom.window.eval(script));
  const get = (selector) => dom.window.document.querySelector(selector);
  return { dom, get };
}

test("all four routes complete across all 32 choice paths and expose eight distinct endings offline", async () => {
  const { dom, get } = setup();
  const expected = {
    정치훈: ["내일도, 같은 출발선", "한 걸음의 여백"],
    주정원: ["우리만 아는 별의 이름", "접어둔 질문 하나"],
    박진환: ["두 사람의 재생목록", "다음 곡을 기다리며"],
    남성수: ["비워둔 맞은편 자리", "오래 남는 한 문장"],
  };
  const endings = new Set();
  try {
    for (const [name, titles] of Object.entries(expected)) {
      for (let mask = 0; mask < 8; mask++) {
        get(`#play [data-route="${name}"]`).click();
        assert.equal(get("#game-dialog").open, true);
        assert.match(get("#game-title").textContent, new RegExp(name));
        for (let step = 0; step < 3; step++) {
          assert.equal(get("#game-step").textContent, `0${step + 1} / 03`);
          assert.equal(get("#game-choices").hidden, false);
          get(
            `#game-choices button:nth-child(${((mask >> step) & 1) + 1})`,
          ).click();
          assert.ok(get("#game-reaction").textContent.length > 10);
          assert.equal(get("#game-next").hidden, false);
          get("#game-next").click();
        }
        assert.equal(get("#game-ending").hidden, false);
        const gentleChoices = [0, 1, 2].filter(
          (bit) => (mask >> bit) & 1,
        ).length;
        assert.equal(
          get("#ending-title").textContent,
          titles[gentleChoices <= 1 ? 0 : 1],
        );
        endings.add(get("#ending-title").textContent);
        get("#game-close").click();
        assert.equal(get("#game-dialog").open, false);
        assert.equal(
          dom.window.document.activeElement,
          get(`#play [data-route="${name}"]`),
        );
      }
    }
    assert.equal(endings.size, 8);
  } finally {
    await new Promise((resolve) => setTimeout(resolve, 0));
    dom.window.close();
  }
});

test("rewind replaces decisions, restart clears history, and profile launches the correct route", async () => {
  const { dom, get } = setup();
  try {
    get('[data-member="정치훈"]').click();
    get("#profile-play").click();
    assert.equal(get("#member-dialog").open, false);
    assert.match(get("#game-title").textContent, /정치훈/);
    for (let step = 0; step < 3; step++) {
      get("#game-choices button").click();
      get("#game-next").click();
    }
    assert.equal(get("#ending-title").textContent, "내일도, 같은 출발선");
    get("#game-prev").click();
    get("#game-prev").click();
    assert.equal(get("#game-step").textContent, "02 / 03");
    for (let step = 1; step < 3; step++) {
      get("#game-choices button:nth-child(2)").click();
      get("#game-next").click();
    }
    assert.equal(get("#ending-title").textContent, "한 걸음의 여백");
    get("#game-restart").click();
    assert.equal(get("#game-step").textContent, "01 / 03");
    assert.equal(get("#game-prev").disabled, true);
    assert.equal(get("#game-ending").hidden, true);
    for (let step = 0; step < 3; step++) {
      get("#game-choices button").click();
      get("#game-next").click();
    }
    get("#game-other").click();
    assert.equal(get("#game-dialog").open, false);
    assert.equal(
      dom.window.document.body.classList.contains("game-open"),
      false,
    );
    assert.equal(dom.window.document.activeElement, get("#play [data-route]"));
  } finally {
    await new Promise((resolve) => setTimeout(resolve, 0));
    dom.window.close();
  }
});

test("typing can be skipped and closing cancels in-progress animation", async () => {
  const { dom, get } = setup(false);
  try {
    get('#play [data-route="주정원"]').click();
    assert.equal(get("#game-choices").hidden, true);
    get("#game-skip").click();
    assert.equal(get("#game-choices").hidden, false);
    assert.equal(get("#game-skip").hidden, true);
    assert.match(get("#game-line").textContent, /같은 별/);
    get("#game-close").click();
    get('#play [data-route="남성수"]').click();
    get("#game-close").click();
    const line = get("#game-line").textContent;
    await new Promise((resolve) => setTimeout(resolve, 60));
    assert.equal(get("#game-line").textContent, line);
  } finally {
    await new Promise((resolve) => setTimeout(resolve, 0));
    dom.window.close();
  }
});
