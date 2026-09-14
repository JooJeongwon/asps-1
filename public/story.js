// Monogatari owns choices, conditional jumps, save/load and rollback.
(() => {
  const scenario = window.TEAM04_SCENARIO;
  const members = window.TEAM04_MEMBERS;
  const routes = scenario.routes;
  const escape = (value) => String(value).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const questionId = (id, index) => `Question_${id}_${index + 1}`;
  const fresh = () => ({
    affinity: Object.fromEntries(members.map((m) => [m.id, 0])),
    choices: {}, visitOrder: [], unlocked: {}, selected: null, saju: null,
  });
  const allMet = (data) => routes.every((r) => data.visitOrder.includes(r.id));
  const canMeet = (data, id) => routes.some((r) => r.id === id) && !data.visitOrder.includes(id);
  function recalculate(data) {
    data.affinity = Object.fromEntries(routes.map((r) => [r.id,
      r.questions.filter((_, i) => [0, 1].includes(data.choices[questionId(r.id, i)])).length]));
  }
  const scene = (number, cast = []) => [
    `show scene rofan${number} with rofan-scene`,
    ...cast.map((id, i) => `show character ${id} portrait${cast.length > 1 ? ` with ensemble slot-${i}` : ""}`),
  ];
  const card = (route) => {
    const member = members.find((m) => m.id === route.id);
    return `<img src="/assets/${window.YEONBUN_PORTRAITS[member.name]}" alt=""><span class="cast-name">${route.letter}. ${member.name}</span><small>${escape(route.shortAlias)}</small>`;
  };
  const script = {
    Start: [function () { Object.assign(this.storage(), fresh()); return true; }, "jump Prologue"],
    Prologue: [...scene(0), ...scenario.prologue, {
      Choice: { Dialog: "you 일단 들어가 보자. 설마 팀플보다 어렵겠어?", Class: "start-choice",
        Enter: { Text: "코코네 강의실로 들어간다", Do: "jump MeetingHub" } },
    }],
    MeetingHub: [...scene(1), {
      Choice: {
        Dialog: "you 누구부터 만나볼까? 네 사람을 모두 만나야 마지막 선택을 할 수 있다.",
        Class: "cast-choices meeting-choice",
        ...Object.fromEntries(routes.map((r) => [r.id, {
          Text: card(r), Do: `jump Route_${r.id}`,
        }])),
      },
    }],
    FinalSelect: [{ Conditional: {
      Condition() { return allMet(this.storage()); },
      True: "jump FinalChoice", False: "jump MeetingHub",
    } }],
    FinalChoice: [...scene(1), {
      Choice: {
        Dialog: "you 마지막으로 함께하고 싶은 사람은? 지금까지의 대답과 관계없이 누구나 선택할 수 있다.",
        Class: "cast-choices final-choice",
        ...Object.fromEntries(routes.map((r) => [r.id, {
          Text: card(r), Do: `jump Ending_${r.id}`,
          onChosen() { this.storage().selected = r.id; },
          onRevert() { this.storage().selected = null; },
        }])),
      },
    }],
    CommonEnding: [...scene(1, routes.map((r) => r.id)), ...scenario.commonEnding, {
      Choice: { Dialog: "system 팀플은 지금부터입니다. TEAM 01의 실제 역할을 확인하세요.", Class: "start-choice reveal-choice",
        Reveal: { Text: "진짜 팀 역할 공개 →", Do: "jump TeamPage" } },
    }],
    TeamPage: [function () {
      const id = this.storage().selected;
      window.location.assign(`/team.html${members.some((m) => m.id === id) ? `?match=${encodeURIComponent(id)}` : ""}`);
      return false;
    }],
  };
  const chapters = {
    Start: { phase: "prologue", title: "코코네 강의실 문 앞", location: "평범한 대학 생활의 마지막 순간" },
    MeetingHub: { phase: "meeting", title: "첫인상은 자유 선택", location: "코코네 강의실 · 아직 만나지 않은 사람을 선택하세요" },
    FinalSelect: { phase: "final", title: "호기심 말고, 네 마음으로", location: "코코네 강의실 · 운명의 선택" },
    CommonEnding: { phase: "common", title: "탈퇴 버튼은 없습니다", location: "코코네 강의실 · 팀플은 지금부터" },
    TeamPage: { phase: "common", title: "TEAM 01", location: "실제 팀 역할 공개" },
  };
  chapters.Prologue = chapters.Start;
  chapters.FinalChoice = chapters.FinalSelect;
  const messages = {
    SajuNote: { title: "성수의 진짜 사주 노트", subtitle: "실제 팀원 4명 사이의 기록 · 고백용 예시 점수와는 별개", body: "{{saju.note}}", actionString: "Continue" },
  };
  for (const route of routes) {
    const member = members.find((m) => m.id === route.id);
    const meta = { phase: "route", route: route.id, title: `${route.letter}. ${member.name}`, location: route.location, motif: route.alias };
    script[`Route_${route.id}`] = [{ Conditional: {
      Condition() { return canMeet(this.storage(), route.id); },
      True: `jump Intro_${route.id}`, False: "jump MeetingHub",
    } }];
    script[`Intro_${route.id}`] = [...scene(route.scene, [route.id]), ...route.intro, `jump ${questionId(route.id, 0)}`];
    chapters[`Route_${route.id}`] = meta;
    chapters[`Intro_${route.id}`] = meta;
    route.questions.forEach((question, index) => {
      const label = questionId(route.id, index);
      chapters[label] = { ...meta, question: index + 1, motif: question.title };
      script[label] = [...question.lines.slice(0, -1), {
        Choice: {
          Dialog: question.lines.at(-1), Class: "story-choice",
          ...Object.fromEntries(question.choices.map((option, answer) => [`Answer${answer}`, {
            Text: option.text, Do: `jump ${label}A${answer}`,
            onChosen() { const data = this.storage(); data.choices[label] = answer; recalculate(data); },
            onRevert() { const data = this.storage(); delete data.choices[label]; recalculate(data); },
          }])),
        },
      }];
      question.choices.forEach((option, answer) => {
        script[`${label}A${answer}`] = [...option.reply, `jump ${label}After`];
        chapters[`${label}A${answer}`] = chapters[label];
      });
      script[`${label}After`] = [`jump ${index < 4 ? questionId(route.id, index + 1) : `Complete_${route.id}`}`];
      chapters[`${label}After`] = chapters[label];
    });
    script[`Complete_${route.id}`] = [
      ...(route.sajuLines ? [
        { Function: {
          async Apply() {
            const data = this.storage();
            if (data.saju) return;
            // A fast tap can arrive while a nested Jump is awaiting this Function.
            // Hold the native input lock until the bounded lookup has completed.
            const wasBlocked = this.global("block");
            this.global("block", true);
            try { data.saju = await window.TEAM04_SAJU.load(); }
            finally { this.global("block", wasBlocked); }
          },
          Revert() {},
        } },
        "show message SajuNote saju-note", ...route.sajuLines,
      ] : []),
      { Function: {
        Apply() {
          const data = this.storage();
          if (!route.questions.every((_, i) => [0, 1].includes(data.choices[questionId(route.id, i)])))
            throw new Error("Complete all five conversations before leaving a route.");
          if (!data.visitOrder.includes(route.id)) data.visitOrder.push(route.id);
          data.unlocked[route.id] = true;
        },
        Revert() {
          const data = this.storage();
          data.visitOrder = data.visitOrder.filter((id) => id !== route.id);
          delete data.unlocked[route.id];
        },
      } },
      { Conditional: {
        Condition() { return allMet(this.storage()); },
        True: `jump FinalBridge_${route.id}`, False: `jump Departure_${route.id}`,
      } },
    ];
    chapters[`Complete_${route.id}`] = { ...meta, question: 5 };
    script[`Departure_${route.id}`] = [...route.departure, "jump MeetingHub"];
    chapters[`Departure_${route.id}`] = { ...meta, phase: "departure" };
    script[`FinalBridge_${route.id}`] = [
      ...scenario.bridge.slice(0, 1), ...route.bridge,
      `${route.id} 결국 우리 네 명을 전부 만났네. 이제는 호기심이 아니라 네 마음으로 선택해야 해.`,
      ...scenario.bridge.slice(1), "jump FinalSelect",
    ];
    chapters[`FinalBridge_${route.id}`] = { ...meta, phase: "bridge", title: "네 번째 만남, 마지막 선택" };
    script[`Ending_${route.id}`] = [...scene(route.scene, [route.id]), ...route.ending.lines, "jump CommonEnding"];
    chapters[`Ending_${route.id}`] = { ...meta, phase: "ending", title: `${route.letter} END`, motif: route.ending.title };
  }
  window.TEAM04_FRESH_STATE = fresh;
  window.TEAM04_CAN_MEET = canMeet;
  window.TEAM04_STORY = script;
  window.TEAM04_CHAPTERS = chapters;
  window.TEAM04_MESSAGES = messages;
})();
