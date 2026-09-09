const json = (body, status = 200) =>
  Response.json(body, { status, headers: { "Access-Control-Allow-Origin": "*" } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/people") {
      const { results } = await env.DB.prepare(
        "SELECT DISTINCT person_name AS name FROM individual_matches ORDER BY name",
      ).all();
      return json(results);
    }

    if (url.pathname === "/api/match") {
      const person = url.searchParams.get("person")?.trim();
      const match = url.searchParams.get("match")?.trim();
      if (!person || !match) return json({ error: "person과 match가 필요합니다." }, 400);

      const result = await env.DB.prepare(
        "SELECT * FROM individual_matches WHERE person_name = ? AND match_name = ?",
      ).bind(person, match).first();
      return result ? json(result) : json({ error: "궁합 결과가 없습니다." }, 404);
    }

    return json({ error: "Not found" }, 404);
  },
};
