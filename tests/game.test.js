import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { createHash } from "node:crypto";
const files = await Promise.all(
  ["characters.js", "routes.js", "story.js"].map((file) =>
    fs.readFile(new URL(`../public/${file}`, import.meta.url), "utf8"),
  ),
);
const context = vm.createContext({ window: {} });
files.forEach((source) => vm.runInContext(source, context));
const { YEONBUN_ROUTES: routes, YEONBUN_STORY: script } = context.window;
const fresh = () => ({
  data: {},
  storage(value) {
    if (value) Object.assign(this.data, value);
    return this.data;
  },
});

test("four Monogatari route graphs resolve all jumps and expose eight endings", () => {
  const jumps = [];
  function visit(value) {
    if (typeof value === "string" && value.startsWith("jump "))
      jumps.push(value.slice(5));
    else if (value && typeof value === "object")
      Object.values(value).forEach(visit);
  }
  visit(script);
  jumps.forEach((label) =>
    assert.ok(Array.isArray(script[label]), `Missing label ${label}`),
  );
  assert.deepEqual(
    Array.from(routes, (route) => route.name),
    ["정치훈", "주정원", "박진환", "남성수"],
  );
  assert.equal(
    Object.keys(script).filter((label) => /End(Close|Slow)$/.test(label))
      .length,
    8,
  );
  for (let r = 0; r < 4; r++)
    for (let s = 0; s < 3; s++) {
      const choice = script[`R${r}S${s}`].find(
        (action) => action.Choice,
      ).Choice;
      assert.equal(
        Object.values(choice).filter((option) => option?.Do).length,
        2,
      );
      for (let a = 0; a < 2; a++) {
        assert.equal(choice[`Answer${a}`].Do, `jump R${r}S${s}A${a}`);
        assert.equal(
          script[`R${r}S${s}A${a}`][0],
          `c${r} ${routes[r].scenes[s].choices[a].reply}`,
        );
      }
    }
});

test("32 story paths use the expected ending and reversing a choice clears its contribution", () => {
  for (let r = 0; r < 4; r++)
    for (let mask = 0; mask < 8; mask++) {
      const engine = fresh();
      script[`Route${r}`][0].call(engine);
      let direct = 0;
      for (let s = 0; s < 3; s++) {
        const a = (mask >> s) & 1;
        const choice = script[`R${r}S${s}`].find((action) => action.Choice)
          .Choice[`Answer${a}`];
        choice.onChosen.call(engine);
        const snapshot = JSON.parse(JSON.stringify(engine.storage()));
        const restored = fresh();
        restored.storage(snapshot);
        choice.onRevert.call(restored);
        assert.equal(restored.storage().decisions[s], null);
        choice.onChosen.call(restored);
        assert.equal(restored.storage().decisions[s], a);
        if (a === 0) direct++;
      }
      const condition = script[`R${r}S2A${(mask >> 2) & 1}`][1].Conditional;
      assert.equal(condition.Condition.call(engine), direct >= 2);
      script[`Route${r}`][0].call(engine);
      assert.deepEqual(Array.from(engine.storage().decisions), [
        null,
        null,
        null,
      ]);
    }
});

test("bundled Monogatari runtime matches the pinned upstream release", async () => {
  const root = new URL("../public/vendor/monogatari/", import.meta.url);
  const manifest = JSON.parse(
    await fs.readFile(new URL("manifest.json", root), "utf8"),
  );
  assert.equal(manifest.version, "2.8.0");
  for (const [file, hash] of Object.entries(manifest.sha256)) {
    assert.equal(
      createHash("sha256")
        .update(await fs.readFile(new URL(file, root)))
        .digest("hex"),
      hash,
    );
  }
});
