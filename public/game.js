(() => {
  const el = (id) => document.getElementById(id);
  const dialog = el("game-dialog");
  let route,
    step = 0,
    choices = [],
    timer = null,
    returnFocus = null;
  const stopTyping = () => {
    clearInterval(timer);
    timer = null;
  };
  const closeDialog = (target) =>
    typeof target.close === "function"
      ? target.close()
      : target.removeAttribute("open");

  function showChoices() {
    stopTyping();
    el("game-line").textContent = route.scenes[step].line;
    el("game-line").removeAttribute("aria-busy");
    el("game-skip").hidden = true;
    el("game-choices").hidden = false;
  }

  function renderScene() {
    stopTyping();
    const scene = route.scenes[step];
    el("game-location").textContent = scene.location;
    el("game-step").textContent = `${String(step + 1).padStart(2, "0")} / 03`;
    el("game-narration").textContent = scene.narration;
    el("game-reaction").textContent = "";
    el("game-ending").hidden = true;
    el("game-next").hidden = true;
    el("game-next").textContent =
      step === 2 ? "에필로그 펼치기 →" : "다음 장면으로 →";
    el("game-prev").disabled = step === 0;
    el("game-line").hidden = false;
    el("game-narration").hidden = false;
    el("game-choices").hidden = true;
    el("game-choices").replaceChildren(
      ...scene.choices.map((choice, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = choice.text;
        button.addEventListener("click", () => {
          if (choices[step] !== undefined) return;
          choices[step] = index;
          el("game-choices").hidden = true;
          el("game-reaction").textContent = choice.reply;
          el("game-next").hidden = false;
          el("game-next").focus({ preventScroll: true });
        });
        return button;
      }),
    );
    // aria-busy keeps assistive readers from announcing every typed character.
    el("game-line").textContent = "";
    el("game-line").setAttribute("aria-busy", "true");
    el("game-skip").hidden = false;
    el("game-line").focus({ preventScroll: true });
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      showChoices();
    } else {
      const letters = Array.from(scene.line);
      let position = 0;
      timer = setInterval(() => {
        el("game-line").textContent += letters[position++];
        if (position >= letters.length) showChoices();
      }, 25);
    }
  }

  function renderEnding() {
    stopTyping();
    const affinity = choices.reduce(
      (sum, choice, index) =>
        sum + route.scenes[index].choices[choice].affinity,
      0,
    );
    const ending = route.endings[affinity >= 5 ? "close" : "slow"];
    el("game-step").textContent = "EPILOGUE";
    el("game-prev").disabled = false;
    for (const id of [
      "game-line",
      "game-narration",
      "game-choices",
      "game-skip",
      "game-next",
    ])
      el(id).hidden = true;
    el("game-reaction").textContent = "";
    el("ending-label").textContent =
      `${route.name}의 이야기 · ${affinity >= 5 ? "함께하는 봄" : "천천히 피는 봄"}`;
    el("ending-title").textContent = ending.title;
    el("ending-copy").textContent = ending.copy;
    el("game-ending").hidden = false;
    el("ending-title").focus({ preventScroll: true });
  }

  function start(name, trigger) {
    const index = window.YEONBUN_ROUTES.findIndex((item) => item.name === name);
    if (index < 0) return;
    route = window.YEONBUN_ROUTES[index];
    returnFocus =
      trigger.id === "profile-play"
        ? document.querySelector(`[data-member="${name}"]`)
        : trigger;
    if (el("member-dialog").open) closeDialog(el("member-dialog"));
    step = 0;
    choices = [];
    dialog.dataset.routeIndex = index;
    el("game-title").textContent = `${route.name} · ${route.title}`;
    el("game-speaker").textContent = route.name;
    el("game-motif").textContent = route.motif;
    el("game-portrait").className = `game-portrait portrait portrait-${index}`;
    el("game-portrait").setAttribute(
      "aria-label",
      `${route.name}의 창작 게임 아바타`,
    );
    typeof dialog.showModal === "function"
      ? dialog.showModal()
      : dialog.setAttribute("open", "");
    document.body.classList.add("game-open");
    renderScene();
    dialog.scrollTop = 0;
  }

  function cleanup() {
    stopTyping();
    document.body.classList.remove("game-open");
    returnFocus?.focus({ preventScroll: true });
  }
  function close() {
    closeDialog(dialog);
    cleanup();
  }
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-route]");
    if (trigger) start(trigger.dataset.route, trigger);
  });
  el("game-skip").addEventListener("click", () => {
    if (timer) {
      showChoices();
      el("game-choices")
        .querySelector("button")
        ?.focus({ preventScroll: true });
    }
  });
  el("game-line").addEventListener("click", () => {
    if (timer) showChoices();
  });
  el("game-next").addEventListener("click", () => {
    if (choices[step] === undefined || step >= route.scenes.length) return;
    step++;
    step === route.scenes.length ? renderEnding() : renderScene();
  });
  el("game-prev").addEventListener("click", () => {
    if (step <= 0) return;
    step--;
    // Rewinding discards this scene and later decisions; the score is derived from history.
    choices = choices.slice(0, step);
    renderScene();
  });
  el("game-restart").addEventListener("click", () => {
    step = 0;
    choices = [];
    renderScene();
  });
  el("game-other").addEventListener("click", () => {
    returnFocus = document.querySelector("#play [data-route]");
    close();
    returnFocus?.focus();
  });
  el("game-close").addEventListener("click", close);
  dialog.addEventListener("close", cleanup);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });
})();
