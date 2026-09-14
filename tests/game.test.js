import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { createHash } from "node:crypto";
const context = vm.createContext({ window: {} });
for (const file of ["characters.js", "team.js", "scenario.js", "story.js"])
  vm.runInContext(await fs.readFile(new URL(`../public/${file}`, import.meta.url), "utf8"), context);
const { TEAM04_MEMBERS: members, TEAM04_SCENARIO: scenario, TEAM04_STORY: script,
  TEAM04_FRESH_STATE: fresh, TEAM04_CHAPTERS: chapters } = context.window;
const engine = () => ({ data: fresh(), storage() { return this.data; } });
const choice = (label) => script[label].find((a) => a.Choice).Choice;
const completion = (id) => script[`Complete_${id}`].filter((a) => a.Function).at(-1).Function;
const question = (id, i) => `Question_${id}_${i + 1}`;
const permutations = (items) => items.length ? items.flatMap((id) =>
  permutations(items.filter((other) => other !== id)).map((rest) => [id, ...rest])) : [[]];

test("Kokone has four ordered personas, five binary conversations each and four endings", () => {
  assert.equal(scenario.title, "두근두근 코코네: 운명의 팀원을 선택하세요");
  assert.deepEqual(Array.from(scenario.routes, (r) => [r.letter, r.id]),
    [["A", "jinhwan"], ["B", "jeongwon"], ["C", "chihoon"], ["D", "seongsu"]]);
  assert.deepEqual(Object.fromEntries(members.map((m) => [m.name, m.role])),
    { 정치훈: "PM", 박진환: "백엔드", 주정원: "프론트엔드", 남성수: "발표" });
  for (const route of scenario.routes) {
    assert.equal(route.questions.length, 5);
    assert.ok(route.departure.length && route.bridge.length && route.ending.lines.length);
    for (const q of route.questions) assert.equal(q.choices.length, 2);
  }
  assert.match(JSON.stringify(scenario.commonEnding), /탈퇴 기능/);
  assert.match(JSON.stringify(scenario.routes[3]), /고백용 예시 점수/);
});

test("every answer rejoins the next question and every jump has scene metadata", () => {
  function visit(value) {
    if (typeof value === "string" && value.startsWith("jump ")) {
      const id = value.slice(5); assert.ok(script[id], id); assert.ok(chapters[id], id);
    } else if (value && typeof value === "object") Object.values(value).forEach(visit);
  }
  visit(script);
  for (const r of scenario.routes) {
    for (let i = 0; i < 5; i++) {
      const label = question(r.id, i);
      for (let a = 0; a < 2; a++) {
        assert.equal(choice(label)[`Answer${a}`].Do, `jump ${label}A${a}`);
        assert.equal(script[`${label}A${a}`].at(-1), `jump ${label}After`);
      }
      assert.equal(script[`${label}After`].at(-1), `jump ${i < 4 ? question(r.id, i + 1) : `Complete_${r.id}`}`);
    }
    assert.equal(script[`Ending_${r.id}`].at(-1), "jump CommonEnding");
  }
});

test("all 24 meeting orders and all 32 answer patterns per route reach a free final choice", () => {
  const ids = Array.from(scenario.routes, (r) => r.id);
  const hub = choice("MeetingHub");
  const final = choice("FinalChoice");
  const gate = script.FinalSelect[0].Conditional;
  for (const order of permutations(ids)) {
    for (let mask = 0; mask < 32; mask++) {
      const game = engine();
      assert.equal(gate.Condition.call(game), false);
      for (const [position, id] of order.entries()) {
        assert.equal(context.window.TEAM04_CAN_MEET(game.data, id), true);
        assert.equal(script[`Route_${id}`][0].Conditional.Condition.call(game), true);
        for (let i = 0; i < 5; i++) {
          // All five answer bits are exercised independently within each route.
          const answer = ((mask + position) >> i) & 1;
          const option = choice(question(id, i))[`Answer${answer}`];
          option.onChosen.call(game); option.onChosen.call(game);
          assert.equal(game.data.affinity[id], i + 1);
          const saved = JSON.stringify(game.data);
          game.data = JSON.parse(saved);
          option.onRevert.call(game); assert.equal(game.data.affinity[id], i);
          option.onChosen.call(game); assert.equal(JSON.stringify(game.data), saved);
        }
        completion(id).Apply.call(game); completion(id).Apply.call(game);
        assert.deepEqual(Array.from(game.data.visitOrder), order.slice(0, position + 1));
        assert.equal(context.window.TEAM04_CAN_MEET(game.data, id), false);
        assert.equal(script[`Route_${id}`][0].Conditional.Condition.call(game), false);
        const branch = script[`Complete_${id}`].at(-1).Conditional;
        assert.equal(branch.Condition.call(game), position === 3);
        assert.equal(branch.True, `jump FinalBridge_${id}`);
        assert.equal(branch.False, `jump Departure_${id}`);
        assert.equal(gate.Condition.call(game), position === 3);
      }
      assert.equal(Object.keys(game.data.choices).length, 20);
      for (const id of ids) {
        assert.equal(final[id].Condition, undefined);
        assert.equal(final[id].Clickable, undefined);
        final[id].onChosen.call(game); assert.equal(game.data.selected, id);
        assert.equal(final[id].Do, `jump Ending_${id}`);
        final[id].onRevert.call(game); assert.equal(game.data.selected, null);
      }
    }
  }
});

test("completion rolls back to an available route; incomplete routes cannot complete; restart clears the run", () => {
  const game = engine();
  for (const r of scenario.routes) {
    assert.throws(() => completion(r.id).Apply.call(game), /five conversations/);
    for (let i = 0; i < 5; i++) choice(question(r.id, i)).Answer0.onChosen.call(game);
    completion(r.id).Apply.call(game);
    const saved = JSON.stringify(game.data);
    game.data = JSON.parse(saved);
    completion(r.id).Revert.call(game);
    assert.equal(game.data.unlocked[r.id], undefined);
    assert.equal(context.window.TEAM04_CAN_MEET(game.data, r.id), true);
    completion(r.id).Apply.call(game);
    assert.equal(JSON.stringify(game.data), saved);
  }
  // Final choice depends on meeting everyone, never on a score threshold.
  game.data.affinity = Object.fromEntries(members.map((m) => [m.id, 0]));
  assert.equal(script.FinalSelect[0].Conditional.Condition.call(game), true);
  choice("FinalChoice").jinhwan.onChosen.call(game);
  script.Start[0].call(game);
  assert.deepEqual(JSON.parse(JSON.stringify(game.data)), JSON.parse(JSON.stringify(fresh())));
});

test("bundled Monogatari runtime matches the pinned upstream release", async () => {
  const root = new URL("../public/vendor/monogatari/", import.meta.url);
  const manifest = JSON.parse(await fs.readFile(new URL("manifest.json", root), "utf8"));
  assert.equal(manifest.version, "2.8.0");
  for (const [file, hash] of Object.entries(manifest.sha256))
    assert.equal(createHash("sha256").update(await fs.readFile(new URL(file, root))).digest("hex"), hash);
});
