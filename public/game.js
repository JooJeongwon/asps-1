(() => {
  const status = document.getElementById("engine-status");
  const engine = window.monogatari;
  if (!engine) {
    status.textContent =
      "게임을 불러오지 못했어요. 새로고침 후 다시 시도해주세요.";
    return;
  }
  const members = window.TEAM04_MEMBERS;
  const scenario = window.TEAM04_SCENARIO;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  engine.settings({
    // New story, new save namespace. Original prologue saves remain intact.
    Name: "ASPS_TEAM04_saju_v2",
    Version: "2.1.0",
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
    n: { name: "이야기", color: "#795d88" },
    you: { name: "나", color: "#9b6683" },
    system: { name: "SYSTEM", color: "#795d88" },
    ...Object.fromEntries(
      members.map((m) => [
        m.id,
        {
          name: m.name,
          color: "#795d88",
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
    count.textContent = "0";
    item.append(count);
    hud.append(item);
  }
  function updateChapter() {
    const label = engine.state("label") || "Start";
    const match = /^Cut(\d{2})/.exec(label);
    const cut = scenario.cuts.find((c) => c.id === `Cut${match?.[1]}`);
    const ending = label.startsWith("Cut20_")
      ? scenario.endings.find((e) => label === `Cut20_${e.member}`)
      : null;
    const member = members.find((m) => m.id === ending?.member);
    document.getElementById("route-name").textContent = ending
      ? `${member.name} · ${ending.title}`
      : cut?.title || scenario.title;
    document.getElementById("route-motif").textContent = ending
      ? ending.subtitle
      : "TEAM 01 · 오늘, 우리 중 한 명을 선택해";
    document.getElementById("route-location").textContent =
      cut?.location || "마지막 밤 · 당신의 대답";
    document.getElementById("route-step").textContent =
      `CUT ${match?.[1] || "01"} / 20`;
    document.getElementById("opening-title").hidden =
      label !== "Start" && !label.startsWith("Cut01");
    const state = engine.storage();
    for (const m of members)
      document.querySelector(`[data-affinity="${m.id}"]`).textContent =
        state.affinity?.[m.id] || 0;
  }
  for (const event of ["didRunAction", "didRevertAction", "didLoadGame"])
    engine.on(event, updateChapter);
  engine.on("didLoadGame", () => requestAnimationFrame(updateChapter));
  engine.on("componentDidMount", (event) => {
    const { component, tag } = event.detail || {};
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
