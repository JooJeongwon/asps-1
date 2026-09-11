const json = (body, status = 200) =>
  Response.json(body, { status, headers: { "Access-Control-Allow-Origin": "*" } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/people") {
      const { results } = await env.DB.prepare(
        `SELECT person_name AS name, ROUND(AVG(mbti_score), 1) AS mbti_score,
                ROUND(AVG(kai_difference), 1) AS kai_difference,
                ROUND(AVG(saju_score), 1) AS saju_score
         FROM individual_matches GROUP BY person_name ORDER BY name`,
      ).all();
      return json(results);
    }

    if (url.pathname === "/api/highlight") {
      const result = await env.DB.prepare(
        `SELECT person_name, match_name, match_score, match_group,
                kai_difference, mbti_score, saju_score
         FROM individual_matches
         WHERE person_name < match_name
         ORDER BY match_score DESC LIMIT 1`,
      ).first();
      return result ? json(result) : json({ error: "궁합 결과가 없습니다." }, 404);
    }

    if (url.pathname === "/api/team") {
      const members = [...new Set(url.searchParams.getAll("member").map((name) => name.trim()).filter(Boolean))];
      if (members.length < 2 || members.length > 10) {
        return json({ error: "팀원은 2명에서 10명까지 선택할 수 있습니다." }, 400);
      }

      const placeholders = members.map(() => "?").join(",");
      const { results } = await env.DB.prepare(
        `SELECT person_name, personal_rank, match_name, match_score, match_group,
                kai_difference, mbti_score, saju_score
         FROM individual_matches
         WHERE person_name IN (${placeholders}) AND match_name IN (${placeholders})
         ORDER BY match_score DESC`,
      ).bind(...members, ...members).all();
      return json(results);
    }

    if (url.pathname === "/api/match") {
      const person = url.searchParams.get("person")?.trim();
      const match = url.searchParams.get("match")?.trim();
      if (!person || !match) return json({ error: "person과 match가 필요합니다." }, 400);

      const result = await env.DB.prepare(
        `SELECT person_name, personal_rank, match_name, match_score, match_group,
                kai_difference, mbti_score, saju_score
         FROM individual_matches
         WHERE person_name = ? AND match_name = ?`,
      ).bind(person, match).first();
      return result ? json(result) : json({ error: "궁합 결과가 없습니다." }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};
