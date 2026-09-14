// Native Monogatari labels: short responses rejoin the same cut; only Cut19 branches.
(() => {
  const members = window.TEAM04_MEMBERS;
  const scenario = window.TEAM04_SCENARIO;
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const fresh = () => ({
    affinity: Object.fromEntries(members.map((m) => [m.id, 0])),
    choices: {},
    unlocked: {},
    selected: null,
  });
  // A choice ledger prevents loading/replaying callbacks from double-counting points.
  function recalculate(data) {
    data.affinity = fresh().affinity;
    for (const cut of scenario.cuts) {
      const option = cut.choices?.[data.choices[cut.id]];
      for (const [id, amount] of Object.entries(option?.affinity || {}))
        data.affinity[id] += amount;
    }
  }
  const script = {
    Start: [
      function () {
        Object.assign(this.storage(), fresh());
        return true;
      },
      "jump Cut01",
    ],
  };
  const messages = {};
  for (const member of members)
    messages[`Profile_${member.id}`] = {
      title: `PROFILE UNLOCK · ${member.name}`,
      subtitle: `${member.role} · ${member.mbti} · ${member.pillar}`,
      body: `<span class="unlock-profile"><img src="/assets/${window.YEONBUN_PORTRAITS[member.name]}" alt="${member.name} 애니메이션 캐릭터"><span><strong>${escape(member.trait)}</strong><span>${escape(member.hidden)}</span><small>${escape(member.motif)}</small></span></span>`,
      actionString: "Continue",
    };
  scenario.cuts.forEach((cut, index) => {
    const next = scenario.cuts[index + 1]?.id;
    const cast = cut.cast === "all" ? members.map((m) => m.id) : cut.cast;
    const entry = [
      `show scene team04 with scene-${cut.scene}`,
      ...cast.map(
        (id, i) =>
          `show character ${id} portrait${cast.length > 1 ? ` with ensemble slot-${i}` : ""}`,
      ),
      ...cut.lines,
    ];
    script[cut.id] = entry;
    if (cut.final) {
      entry.push({
        Choice: {
          Dialog: cut.prompt,
          Class: "cast-choices final-choice",
          ...Object.fromEntries(
            members.map((member) => [
              member.id,
              {
                Text: `<img src="/assets/${window.YEONBUN_PORTRAITS[member.name]}" alt=""><span class="cast-name">${member.name}</span><small>${escape(member.summary)}</small>`,
                Do: `jump Cut20_${member.id}`,
                onChosen() {
                  this.storage().selected = member.id;
                },
                onRevert() {
                  this.storage().selected = null;
                },
              },
            ]),
          ),
        },
      });
      return;
    }
    const after = [...(cut.after || [])];
    if (cut.unlock)
      after.push(
        {
          Function: {
            Apply() {
              this.storage().unlocked[cut.unlock] = true;
            },
            Revert() {
              delete this.storage().unlocked[cut.unlock];
            },
          },
        },
        `show message Profile_${cut.unlock} profile-unlock`,
      );
    after.push(`jump ${next}`);
    if (cut.choices) {
      entry.push({
        Choice: {
          Dialog: cut.prompt,
          Class: cut.id === "Cut01" ? "start-choice" : "story-choice",
          ...Object.fromEntries(
            cut.choices.map((option, choiceIndex) => [
              `Answer${choiceIndex}`,
              {
                Text: option.text,
                Do: `jump ${cut.id}A${choiceIndex}`,
                onChosen() {
                  const data = this.storage();
                  data.choices[cut.id] = choiceIndex;
                  recalculate(data);
                },
                onRevert() {
                  const data = this.storage();
                  delete data.choices[cut.id];
                  recalculate(data);
                },
              },
            ]),
          ),
        },
      });
      cut.choices.forEach((option, choiceIndex) => {
        script[`${cut.id}A${choiceIndex}`] = [
          ...option.reply,
          `jump ${cut.id}After`,
        ];
      });
      script[`${cut.id}After`] = after;
    } else entry.push(...after);
  });
  for (const ending of scenario.endings)
    script[`Cut20_${ending.member}`] = [
      "show scene team04 with scene-3",
      `show character ${ending.member} portrait`,
      `n <span class="ending-title">${ending.title}</span>${ending.subtitle}`,
      ...ending.lines,
      "jump TeamPage",
    ];
  script.TeamPage = [
    function () {
      const member = members.find((m) => m.id === this.storage().selected);
      window.location.assign(
        `/team.html${member ? `?match=${encodeURIComponent(member.id)}` : ""}`,
      );
      return false;
    },
  ];
  window.TEAM04_FRESH_STATE = fresh;
  window.TEAM04_STORY = script;
  window.TEAM04_MESSAGES = messages;
})();
