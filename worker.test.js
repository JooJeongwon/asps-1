import test from "node:test";
import assert from "node:assert/strict";

import worker from "./worker.js";

test("두 이름으로 D1 궁합을 조회한다", async () => {
  const expected = { person_name: "남성수", match_name: "임승호", match_score: 79.66 };
  const env = {
    DB: {
      prepare: (sql) => {
        assert.doesNotMatch(sql, /actual_feeling|data_role/i);
        return { bind: (...names) => ({ first: async () => (assert.deepEqual(names, ["남성수", "임승호"]), expected) }) };
      },
    },
  };
  const response = await worker.fetch(new Request("https://example.com/api/match?person=남성수&match=임승호"), env);
  assert.deepEqual(await response.json(), expected);
});

test("선택한 팀의 궁합을 한 번에 조회한다", async () => {
  const members = ["주정원", "남성수", "박진환", "정치훈"];
  const rows = [{ person_name: "정치훈", match_name: "주정원", match_score: 75.59 }];
  const env = {
    DB: {
      prepare: (sql) => {
        assert.match(sql, /person_name IN \(\?,\?,\?,\?\)/);
        return { bind: (...names) => ({ all: async () => (assert.deepEqual(names, [...members, ...members]), { results: rows }) }) };
      },
    },
  };
  const query = members.map((name) => `member=${name}`).join("&");
  const response = await worker.fetch(new Request(`https://example.com/api/team?${query}`), env);
  assert.deepEqual(await response.json(), rows);
});

test("전체 고유 조합 중 최고 점수를 조회한다", async () => {
  const expected = { person_name: "전형원", match_name: "현세은", match_score: 80.3 };
  const env = {
    DB: {
      prepare: (sql) => {
        assert.match(sql, /person_name < match_name/);
        assert.match(sql, /ORDER BY match_score DESC LIMIT 1/);
        return { first: async () => expected };
      },
    },
  };
  const response = await worker.fetch(new Request("https://example.com/api/highlight"), env);
  assert.deepEqual(await response.json(), expected);
});

test("API 외 요청은 정적 파일로 전달한다", async () => {
  const request = new Request("https://example.com/");
  const env = { ASSETS: { fetch: async (assetRequest) => (assert.equal(assetRequest, request), new Response("landing")) } };
  const response = await worker.fetch(request, env);
  assert.equal(await response.text(), "landing");
});
