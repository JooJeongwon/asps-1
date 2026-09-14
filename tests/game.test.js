import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { createHash } from "node:crypto";
const context = vm.createContext({ window: {} });
for (const file of ["characters.js", "team.js", "scenario.js", "story.js"])
  vm.runInContext(
    await fs.readFile(new URL(`../public/${file}`, import.meta.url), "utf8"),
    context,
  );
const {
  TEAM04_MEMBERS: members,
  TEAM04_SCENARIO: scenario,
  TEAM04_STORY: script,
  TEAM04_FRESH_STATE: freshState,
} = context.window;
const engine = () => ({
  data: freshState(),
  storage(value) {
    if (value) Object.assign(this.data, value);
    return this.data;
  },
});
const choiceOf = (cut) => script[cut.id].find((a) => a.Choice).Choice;
test("confirmed roles and twenty-cut narrative replace all placeholder characters", () => {
  assert.deepEqual(Object.fromEntries(members.map((m) => [m.name, m.role])), {
    정치훈: "PM",
    박진환: "백엔드",
    주정원: "프론트엔드",
    남성수: "발표",
  });
  assert.equal(scenario.cuts.length, 19);
  assert.equal(scenario.endings.length, 4);
  assert.doesNotMatch(JSON.stringify(scenario), /민준|진우|도윤|현석/);
  assert.deepEqual(
    Array.from(scenario.cuts, (c) => c.id),
    Array.from(
      { length: 19 },
      (_, i) => `Cut${String(i + 1).padStart(2, "0")}`,
    ),
  );
  assert.deepEqual(
    Array.from(
      scenario.cuts.filter((c) => c.unlock),
      (c) => c.unlock,
    ),
    Array.from(members, (m) => m.id),
  );
});
test("all jumps resolve and every ordinary choice rejoins the same next cut", () => {
  const jumps = [];
  function visit(v) {
    if (typeof v === "string" && v.startsWith("jump ")) jumps.push(v.slice(5));
    else if (v && typeof v === "object") Object.values(v).forEach(visit);
  }
  visit(script);
  jumps.forEach((label) => assert.ok(script[label], `Missing ${label}`));
  scenario.cuts.forEach((cut, index) => {
    if (!cut.choices) return;
    const options = choiceOf(cut);
    cut.choices.forEach((_, i) => {
      assert.equal(options[`Answer${i}`].Do, `jump ${cut.id}A${i}`);
      assert.equal(script[`${cut.id}A${i}`].at(-1), `jump ${cut.id}After`);
    });
    assert.equal(
      script[`${cut.id}After`].at(-1),
      `jump ${scenario.cuts[index + 1].id}`,
    );
  });
  assert.equal(
    Object.keys(script).filter((l) => l.startsWith("Cut20_")).length,
    4,
  );
});
test("all 512 choice/ending combinations preserve affinity and free final selection", () => {
  const cuts = scenario.cuts.filter((c) => c.choices?.length === 2);
  assert.equal(cuts.length, 7);
  for (let mask = 0; mask < 128; mask++) {
    const game = engine();
    const expected = Object.fromEntries(members.map((m) => [m.id, 0]));
    cuts.forEach((cut, i) => {
      const n = (mask >> i) & 1;
      const option = choiceOf(cut)[`Answer${n}`];
      option.onChosen.call(game);
      option.onChosen.call(game);
      for (const [id, delta] of Object.entries(cut.choices[n].affinity))
        expected[id] += delta;
      assert.deepEqual({ ...game.data.affinity }, expected);
      const restored = engine();
      restored.storage(JSON.parse(JSON.stringify(game.data)));
      option.onRevert.call(restored);
      option.onChosen.call(restored);
      assert.deepEqual({ ...restored.data.affinity }, expected);
    });
    for (const member of members) {
      const final = choiceOf(scenario.cuts.at(-1))[member.id];
      assert.equal(final.Condition, undefined);
      final.onChosen.call(game);
      assert.equal(game.data.selected, member.id);
      assert.equal(final.Do, `jump Cut20_${member.id}`);
      assert.deepEqual({ ...game.data.affinity }, expected);
      final.onRevert.call(game);
      assert.equal(game.data.selected, null);
    }
  }
  const zero = engine();
  for (const m of members) {
    choiceOf(scenario.cuts.at(-1))[m.id].onChosen.call(zero);
    assert.equal(zero.data.selected, m.id);
  }
});
test("profile unlocks reverse cleanly and starting again clears this run", () => {
  const game = engine();
  for (const cut of scenario.cuts.filter((c) => c.unlock)) {
    const action = (script[`${cut.id}After`] || script[cut.id]).find(
      (a) => a.Function,
    ).Function;
    action.Apply.call(game);
    assert.equal(game.data.unlocked[cut.unlock], true);
    action.Revert.call(game);
    assert.equal(game.data.unlocked[cut.unlock], undefined);
    action.Apply.call(game);
  }
  game.data.selected = members[0].id;
  script.Start[0].call(game);
  assert.deepEqual(
    JSON.parse(JSON.stringify(game.data)),
    JSON.parse(JSON.stringify(freshState())),
  );
});
test("bundled Monogatari runtime matches the pinned upstream release", async () => {
  const root = new URL("../public/vendor/monogatari/", import.meta.url);
  const manifest = JSON.parse(
    await fs.readFile(new URL("manifest.json", root), "utf8"),
  );
  assert.equal(manifest.version, "2.8.0");
  for (const [file, hash] of Object.entries(manifest.sha256))
    assert.equal(
      createHash("sha256")
        .update(await fs.readFile(new URL(file, root)))
        .digest("hex"),
      hash,
    );
});
