import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { JSDOM } from "jsdom";
import { createAppServer } from "../scripts/dev-server.js";

const root = new URL("../public/", import.meta.url);
const code = await fs.readFile(new URL("bgm.js", root), "utf8");
const key = "ASPS_BGM_SETTINGS_v1";
async function setup(page = "index.html", saved, playImpl) {
  const dom = new JSDOM(await fs.readFile(new URL(page, root), "utf8"), {
    runScripts: "outside-only", url: "https://example.com/", pretendToBeVisual: true,
  });
  const w = dom.window;
  const audio = w.document.querySelector("audio");
  let paused = true;
  let plays = 0;
  Object.defineProperty(audio, "paused", { get: () => paused });
  audio.play = () => {
    plays++;
    const result = playImpl ? playImpl() : Promise.resolve();
    return result.then(() => { paused = false; audio.dispatchEvent(new w.Event("playing")); });
  };
  audio.pause = () => { paused = true; audio.dispatchEvent(new w.Event("pause")); };
  if (saved !== undefined) w.localStorage.setItem(key, saved);
  w.eval(code);
  const q = (selector) => w.document.querySelector(selector);
  const gesture = () => w.document.body.dispatchEvent(new w.Event("pointerdown", { bubbles: true }));
  const volume = (value) => {
    q("#bgm-volume").value = String(value);
    q("#bgm-volume").dispatchEvent(new w.Event("input", { bubbles: true }));
  };
  const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
  return { dom, w, audio, q, gesture, volume, flush, plays: () => plays };
}

test("both pages start music quietly after interaction and mute stays off through game clicks", async () => {
  for (const page of ["index.html", "team.html"]) {
    const t = await setup(page);
    try {
      assert.equal(t.plays(), 0);
      assert.equal(t.audio.volume, 0.2);
      assert.ok(t.audio.loop);
      t.gesture();
      await t.flush();
      assert.equal(t.audio.paused, false);
      assert.equal(t.q("#bgm-toggle").getAttribute("aria-pressed"), "true");
      t.volume(35);
      assert.equal(t.audio.volume, 0.35);
      t.q("#bgm-toggle").click();
      assert.ok(t.audio.paused);
      assert.ok(t.audio.muted);
      t.gesture();
      await t.flush();
      assert.ok(t.audio.paused);
      assert.deepEqual(JSON.parse(t.w.localStorage.getItem(key)), { volume: 0.35, enabled: false });
      t.q("#bgm-toggle").click();
      await t.flush();
      assert.equal(t.audio.paused, false);
      assert.equal(t.audio.volume, 0.35);
    } finally { t.dom.window.close(); }
  }
});

test("volume preferences survive a new page; zero volume can be turned back on", async () => {
  const t = await setup("team.html", JSON.stringify({ volume: 0.45, enabled: false }));
  try {
    t.gesture();
    assert.equal(t.plays(), 0);
    assert.equal(t.q("#bgm-volume").value, "45");
    t.q("#bgm-toggle").click();
    await t.flush();
    t.volume(0);
    assert.ok(t.audio.paused);
    t.q("#bgm-toggle").click();
    await t.flush();
    assert.equal(t.audio.volume, 0.2);
    assert.equal(t.audio.paused, false);
  } finally { t.dom.window.close(); }
});

test("blocked autoplay retries after another gesture without rejecting game input", async () => {
  let calls = 0;
  const t = await setup("index.html", "invalid-json", () => ++calls === 1
    ? Promise.reject(Object.assign(new Error("Gesture required"), { name: "NotAllowedError" }))
    : Promise.resolve());
  try {
    t.gesture();
    await t.flush();
    assert.ok(t.audio.paused);
    assert.match(t.q("#bgm-status").textContent, /화면을 누르면/);
    t.gesture();
    await t.flush();
    assert.equal(t.audio.paused, false);
  } finally { t.dom.window.close(); }
});

test("music controls do not bubble game clicks or shortcut keys and Escape restores focus", async () => {
  const t = await setup();
  try {
    let gameInput = 0;
    t.w.document.addEventListener("click", () => gameInput++);
    t.w.document.addEventListener("keydown", () => gameInput++);
    t.q("#bgm-menu").click();
    assert.equal(t.q("#bgm-panel").hidden, false);
    t.q("#bgm-volume").dispatchEvent(new t.w.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    t.q("#bgm-volume").dispatchEvent(new t.w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    assert.equal(gameInput, 0);
    assert.equal(t.q("#bgm-panel").hidden, true);
    assert.equal(t.w.document.activeElement, t.q("#bgm-menu"));
  } finally { t.dom.window.close(); }
});

test("the local server serves the music and controls with playable MIME types", async () => {
  const server = createAppServer({});
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    for (const [path, type] of [["bgm.js", "text/javascript"], ["bgm.css", "text/css"], ["assets/audio/sweet-cherry.mp3", "audio/mpeg"]]) {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/${path}`);
      assert.equal(response.status, 200);
      assert.ok(response.headers.get("content-type").includes(type));
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), await fs.readFile(new URL(path, root)));
    }
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
