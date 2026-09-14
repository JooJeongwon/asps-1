import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const context = vm.createContext({ window: {}, URLSearchParams, AbortSignal });
for (const name of ["characters.js", "team.js", "saju.js", "scenario.js", "story.js"])
  vm.runInContext(await readFile(new URL(`../public/${name}`, import.meta.url), "utf8"), context);
const { TEAM04_MEMBERS: members, TEAM04_SAJU: saju, TEAM04_STORY: story, TEAM04_FRESH_STATE: fresh } = context.window;
const names = Array.from(members, (m) => m.name);
const rows = names.flatMap((a, i) => names.flatMap((b, j) => i === j ? [] : [{
  person_name: a, match_name: b,
  // Deliberately reverse blended-score order to catch accidental use of match_score.
  saju_score: 60 + i + j, match_score: 100 - i - j,
}]));

test("saju note uses six raw saju pairs, not the blended score or a directed duplicate", () => {
  const pairs = saju.normalize(rows);
  assert.equal(pairs.length, 6);
  assert.equal(pairs[0].score, 65);
  assert.equal(pairs[0].left, names[2]);
  assert.equal(pairs[0].right, names[3]);
  const result = saju.snapshot(pairs);
  assert.match(result.summary, /주정원–남성수.*65\.0점/);
  assert.equal((result.note.match(/<li>/g) || []).length, 6);
  assert.doesNotMatch(result.note, /95\.0/);
});

test("incomplete, asymmetric, untrusted names and invalid numeric results are rejected", () => {
  for (const broken of [
    rows.slice(1), [...rows.slice(1), rows[1]],
    rows.map((r, i) => i ? r : { ...r, saju_score: 0 }),
    rows.map((r, i) => i ? r : { ...r, person_name: '<img src=x onerror=alert(1)>' }),
    ...[null, NaN, Infinity, -1, 101, "80"].map((value) => rows.map((r, i) => i ? r : { ...r, saju_score: value })),
  ]) assert.throws(() => saju.normalize(broken));
});

test("ties name every maximum, while rounding never changes the raw ranking", () => {
  const ties = saju.snapshot(saju.normalize(rows.map((r) => ({ ...r, saju_score: 70 }))));
  assert.match(ties.summary, /공동 가장 높다/);
  assert.equal((ties.summary.match(/–/g) || []).length, 6);
  const close = rows.map((r) => ({ ...r, saju_score: r.saju_score === 65 ? 70.02 : 70.01 }));
  const result = saju.snapshot(saju.normalize(close));
  assert.match(result.summary, /70\.0점/);
  assert.doesNotMatch(result.summary, /공동/);
});

test("same-origin load requests only the four members and returns a nonnumeric fallback on failure", async () => {
  const data = await saju.load(async (url, options) => {
    const query = new URL(url, "https://example.com");
    assert.equal(query.pathname, "/api/team");
    assert.deepEqual(query.searchParams.getAll("member"), names);
    assert.equal(options.headers, undefined);
    assert.equal(options.cache, "no-store");
    assert.ok(options.signal);
    return Response.json(rows);
  });
  assert.equal(data.status, "ready");
  for (const fetcher of [
    async () => { throw new Error("private failure"); },
    async () => new Response(null, { status: 503 }),
    async () => Response.json(rows.slice(1)),
  ]) {
    const fallback = await saju.load(fetcher);
    assert.equal(fallback.status, "unavailable");
    assert.equal(fallback.pairs.length, 0);
    assert.doesNotMatch(JSON.stringify(fallback), /private failure|\d+\.\d+/);
  }
});

test("data stays fixed across rewind and save/load, resets on new run and never awards affinity", async () => {
  const game = { data: fresh(), storage() { return this.data; } };
  let calls = 0;
  const original = saju.load;
  saju.load = async () => { calls++; return saju.snapshot(saju.normalize(rows)); };
  const action = story.Cut03.find((a) => a.Function).Function;
  try {
    await action.Apply.call(game);
    const saved = JSON.stringify(game.data);
    action.Revert.call(game);
    await action.Apply.call(game);
    game.data = JSON.parse(saved);
    await action.Apply.call(game);
    assert.equal(calls, 1);
    assert.equal(JSON.stringify(game.data), saved);
    assert.ok(Object.values(game.data.affinity).every((n) => n === 0));
    for (const member of members) {
      const choice = story.Cut19.find((a) => a.Choice).Choice[member.id];
      assert.equal(choice.Condition, undefined);
      choice.onChosen.call(game);
      assert.equal(game.data.selected, member.id);
    }
    story.Start[0].call(game);
    assert.equal(game.data.saju, null);
    await action.Apply.call(game);
    assert.equal(calls, 2);
  } finally { saju.load = original; }
});
