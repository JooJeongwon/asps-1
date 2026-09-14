// Only the existing workbook's saju_score is used here, never its blended match_score.
(() => {
  const members = window.TEAM04_MEMBERS;
  const names = members.map((m) => m.name);
  const number = (score) => score.toFixed(1);
  function normalize(rows) {
    if (!Array.isArray(rows) || rows.length !== 12) throw new Error("Incomplete team");
    const directed = new Map();
    for (const row of rows) {
      const { person_name: a, match_name: b, saju_score: score } = row;
      const key = JSON.stringify([a, b]);
      if (!names.includes(a) || !names.includes(b) || a === b ||
          typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 100 ||
          directed.has(key)) throw new Error("Invalid saju result");
      directed.set(key, score);
    }
    const pairs = [];
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const score = directed.get(JSON.stringify([names[i], names[j]]));
        if (score === undefined || score !== directed.get(JSON.stringify([names[j], names[i]])))
          throw new Error("Asymmetric saju result");
        pairs.push({ left: names[i], right: names[j], score });
      }
    }
    // Stable original team order breaks display ties; every tied maximum is still named.
    return pairs.sort((a, b) => b.score - a.score);
  }
  function snapshot(pairs) {
    const highest = pairs.filter((p) => p.score === pairs[0].score);
    const lead = highest.map((p) => `${p.left}–${p.right}`).join(", ");
    const result = `${lead} 조합이 ${number(pairs[0].score)}점으로 ${highest.length > 1 ? "공동 " : ""}가장 높다.`;
    return {
      status: "ready",
      pairs,
      summary: `네 사람 사이의 사주 궁합을 펼쳤다. ${result}`,
      teamwork: `노트에서는 ${result} 지금은 네 사람이 모두 자기 자리에서 서로의 일을 이어주고 있다.`,
      note: `<p class="saju-intro">네 사람 사이의 사주 궁합을 담은 노트.</p><ol class="saju-pairs">${pairs.map((p) =>
        `<li><span>${p.left} <i>×</i> ${p.right}</span><strong>${number(p.score)}<small> / 100</small></strong></li>`).join("")}</ol><p class="saju-caption">사주 점수만 표시해요. 주인공과의 궁합이나 플레이 중 호감도는 아니에요.</p>`,
    };
  }
  function unavailable() {
    return {
      status: "unavailable", pairs: [],
      summary: "사주 노트가 아직 열리지 않는다. 오늘은 직접 알아가는 것부터 시작해보자.",
      teamwork: "노트는 열리지 않았지만, 서로 다른 네 사람이 자기 자리에서 서로의 일을 이어주고 있다.",
      note: '<p class="saju-intro">지금은 사주 노트를 불러올 수 없어요.</p><p class="saju-caption">이야기는 계속할 수 있어요. 새 회차에서 다시 불러올게요.</p>',
    };
  }
  async function load(fetcher = window.fetch.bind(window)) {
    try {
      const query = new URLSearchParams(names.map((name) => ["member", name]));
      const response = await fetcher(`/api/team?${query}`, {
        cache: "no-store", signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error("Saju unavailable");
      return snapshot(normalize(await response.json()));
    } catch {
      return unavailable();
    }
  }
  window.TEAM04_SAJU = { normalize, snapshot, load };
})();
