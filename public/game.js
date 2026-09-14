(() => {
  const status = document.getElementById("engine-status");
  const engine = window.monogatari;
  if (!engine) {
    status.textContent =
      "게임을 불러오지 못했어요. 새로고침 후 다시 시도해주세요.";
    return;
  }
  const scenario = window.TEAM04_SCENARIO;
  const members = scenario.routes.map((r) => window.TEAM04_MEMBERS.find((m) => m.id === r.id));
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  engine.settings({
    // New story, new save namespace. Original prologue saves remain intact.
    Name: "ASPS_TEAM01_kokone_v3",
    Version: "3.0.0",
    Label: "Start",
    ShowMainScreen: false,
    ServiceWorkers: false,
    Preload: true,
    MultiLanguage: false,
    LanguageSelectionScreen: false,
    Orientation: "any",
    ForceAspectRatio: "None",
    TypeAnimation: !reducedMotion,
    InstantText: true,
    AllowRollback: true,
    Skip: 250,
    AutoSave: 0,
    Slots: 10,
    Screenshots: false,
    Storage: { Adapter: "LocalStorage", Store: "GameData" },
    AssetsPath: {
      root: ".",
      scenes: "assets",
      characters: "assets",
      images: "assets",
    },
  });
  engine.preferences({ Language: "한국어", TextSpeed: 25, AutoPlaySpeed: 5 });
  engine.storage(window.TEAM04_FRESH_STATE());
  engine.characters({
    n: { name: "이야기", color: "#52677f" },
    you: { name: "아무개", color: "#833e51" },
    system: { name: "SYSTEM", color: "#52677f" },
    ...Object.fromEntries(
      members.map((m) => [
        m.id,
        {
          name: m.name,
          color: "#172c48",
          sprites: { portrait: window.YEONBUN_PORTRAITS[m.name] },
        },
      ]),
    ),
  });
  engine.assets("scenes", {
    // Keep the original scene key available to older saved games.
    team04: "team04-scenes.png",
    ...window.YEONBUN_SCENES,
  });
  engine.action("Message").messages(window.TEAM04_MESSAGES);
  engine.script(window.TEAM04_STORY);
  engine.translation("한국어", {
    Quit: "처음부터",
    Confirm: "처음부터 다시 시작할까요? 저장하지 않은 진행은 사라집니다.",
    QuitButton: "처음부터 다시 시작",
    Continue: "이야기 계속하기",
  });
  engine.on("didSetup", () =>
    engine.component("quick-menu").removeButton("Hide"),
  );
  engine.debug.level(0);
  const hud = document.getElementById("affinity-hud");
  for (const member of members) {
    const item = document.createElement("span");
    item.className = "affinity-item";
    item.append(document.createTextNode(`${member.name} `));
    const count = document.createElement("b");
    count.dataset.affinity = member.id;
    count.textContent = "대기";
    item.append(count);
    hud.append(item);
  }
  function updateChapter() {
    const label = engine.state("label") || "Start";
    const chapter = window.TEAM04_CHAPTERS[label] || window.TEAM04_CHAPTERS.Start;
    const state = engine.storage();
    document.getElementById("route-name").textContent = chapter.title;
    document.getElementById("route-motif").textContent = chapter.motif || "TEAM 01 · 두근두근 코코네";
    document.getElementById("route-location").textContent = chapter.location;
    document.getElementById("route-step").textContent = chapter.question
      ? `대화 ${chapter.question} / 5`
      : chapter.phase === "ending" ? "개별 엔딩"
      : chapter.phase === "common" ? "팀플 시작"
      : `만남 ${state.visitOrder?.length || 0} / 4`;
    document.getElementById("opening-title").hidden = chapter.phase !== "prologue";
    document.body.dataset.phase = chapter.phase;
    for (const m of members) {
      const count = document.querySelector(`[data-affinity="${m.id}"]`);
      const met = state.visitOrder?.includes(m.id);
      const progress = state.affinity?.[m.id] || 0;
      count.textContent = met ? "✓" : progress ? `${progress}/5` : "대기";
      count.parentElement.dataset.met = String(Boolean(met));
      count.parentElement.setAttribute("aria-label", `${m.name}: ${met ? "대화 완료" : `${progress}/5 대화`}`);
    }
  }
  for (const event of ["didRunAction", "didRevertAction", "didLoadGame"])
    engine.on(event, updateChapter);
  engine.on("didLoadGame", () => requestAnimationFrame(updateChapter));
  engine.on("componentDidMount", (event) => {
    const { component, tag } = event.detail || {};
    // Monogatari 2.8.0 evaluates Clickable functions concurrently and can leave
    // its global input lock set. Keep native buttons, applying disabled after mount.
    if (tag === "choice-container" && component.classList.contains("meeting-choice")) {
      for (const button of component.querySelectorAll("[data-choice]")) {
        button.disabled = !window.TEAM04_CAN_MEET(engine.storage(), button.dataset.choice);
        if (button.disabled) button.setAttribute("aria-label", `${button.textContent.trim()} · 대화 완료`);
      }
    }
    if (tag === "message-modal") {
      component.setAttribute("role", "dialog");
      component.setAttribute("aria-modal", "true");
      component.setAttribute("aria-label", component.querySelector('[data-content="title"]')?.textContent || "이야기 노트");
      requestAnimationFrame(() =>
        component.querySelector('[data-action="close"]')?.focus(),
      );
    }
    if (tag !== "save-slot") return;
    component.setAttribute("role", "button");
    component.setAttribute("tabindex", "0");
    component.setAttribute(
      "aria-label",
      `${component.data?.name || "저장 기록"} 불러오기`,
    );
    component.addEventListener("keydown", (event) => {
      if (event.target === component && ["Enter", " "].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
        component.click();
      }
    });
  });
  engine
    .init("#monogatari")
    .then(() => {
      status.hidden = true;
      document.body.dataset.engineReady = "true";
      document
        .querySelectorAll('[data-screen] > [data-action="back"]')
        .forEach((b) => b.setAttribute("aria-label", "플레이로 돌아가기"));
      document
        .querySelector("save-screen input")
        ?.setAttribute("aria-label", "저장 기록 이름");
    })
    .catch(() => {
      status.textContent =
        "이야기를 시작하지 못했어요. 새로고침 후 다시 시도해주세요.";
    });
})();
