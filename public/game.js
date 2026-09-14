(() => {
  const status = document.getElementById("engine-status");
  const engine = window.monogatari;
  if (!engine) {
    status.textContent =
      "플레이어를 불러오지 못했어요. 새로고침 후 다시 시도해주세요.";
    return;
  }
  const routes = window.YEONBUN_ROUTES;
  const requested = new URLSearchParams(location.search).get("route");
  const initialRoute = routes.findIndex((route) => route.name === requested);
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  engine.settings({
    Name: "ASPS_Yeonbun",
    Version: "1.1.0",
    Label: initialRoute < 0 ? "Start" : `Route${initialRoute}`,
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
  engine.storage({ route: null, decisions: [null, null, null] });
  engine.characters({
    n: { name: "이야기", color: "#795d88" },
    ...Object.fromEntries(
      routes.map((route, index) => [
        `c${index}`,
        {
          name: route.name,
          color: "#795d88",
          sprites: { portrait: window.YEONBUN_PORTRAITS[route.name] },
        },
      ]),
    ),
  });
  engine.assets("scenes", {
    scenes: "yeonbun-scenes.png",
  });
  engine.script(window.YEONBUN_STORY);
  engine.translation("한국어", {
    Quit: "인물 선택",
    Confirm: "인물 선택으로 돌아갈까요? 저장하지 않은 진행은 사라집니다.",
    QuitButton: "인물 선택으로 돌아가기",
  });
  // Keep the native confirmation and reset flow for returning to the cast.
  engine.on("didSetup", () => {
    engine.component("quick-menu").removeButton("Hide");
  });
  engine.debug.level(0);
  function updateChapter() {
    const label = engine.state("label");
    // Direct route links apply only to the initial launch; restarting returns to Start.
    engine.settings({ Label: "Start" });
    const match = /^R(\d+)(?:S(\d+)(?:A[01])?|End(Close|Slow))$/.exec(
      label || "",
    );
    const route = match ? routes[Number(match[1])] : null;
    document.getElementById("route-name").textContent = route
      ? `${route.name} · ${route.title}`
      : "봄날의 첫 페이지";
    document.getElementById("route-motif").textContent = route
      ? `${route.mbti} · ${route.pillar} · ${route.motif}`
      : "네 사람, 네 갈래의 운명";
    document.getElementById("route-location").textContent = route
      ? match[2] !== undefined
        ? route.scenes[Number(match[2])].location
        : "우리의 첫 번째 에필로그"
      : "어느 봄날, 해 질 무렵";
    document.getElementById("route-step").textContent = match
      ? match[3]
        ? "EPILOGUE"
        : `${String(Number(match[2]) + 1).padStart(2, "0")} / ${String(route.scenes.length).padStart(2, "0")}`
      : "PROLOGUE";
  }
  for (const event of ["didRunAction", "didRevertAction", "didLoadGame"])
    engine.on(event, updateChapter);
  engine.on("didLoadGame", () => {
    requestAnimationFrame(updateChapter);
  });
  // Native save slots are custom elements; expose their load/overwrite action to keyboards.
  engine.on("componentDidMount", (event) => {
    const { component, tag } = event.detail || {};
    if (tag !== "save-slot") return;
    component.setAttribute("role", "button");
    component.setAttribute("tabindex", "0");
    const savedRoute = routes[component.data?.game?.storage?.route];
    component.setAttribute(
      "aria-label",
      `${savedRoute?.name || "이야기"} · ${component.data?.name || "저장 기록"}`,
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
        .forEach((button) =>
          button.setAttribute("aria-label", "플레이로 돌아가기"),
        );
      document
        .querySelector("save-screen input")
        ?.setAttribute("aria-label", "저장 기록 이름");
    })
    .catch(() => {
      status.textContent =
        "이야기를 시작하지 못했어요. 새로고침 후 다시 시도해주세요.";
    });
})();
