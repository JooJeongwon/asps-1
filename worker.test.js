import test from "node:test";
import assert from "node:assert/strict";

import worker from "./worker.js";

test("두 이름으로 D1 궁합을 조회한다", async () => {
  const expected = { person_name: "남성수", match_name: "임승호", match_score: 79.66 };
  const env = {
    DB: {
      prepare: () => ({ bind: (...names) => ({ first: async () => (assert.deepEqual(names, ["남성수", "임승호"]), expected) }) }),
    },
  };
  const response = await worker.fetch(new Request("https://example.com/api/match?person=남성수&match=임승호"), env);
  assert.deepEqual(await response.json(), expected);
});
