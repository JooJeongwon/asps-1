(() => {
  const audio = document.getElementById("background-music");
  if (!audio) return;
  const settingsKey = "ASPS_BGM_SETTINGS_v1";
  const defaultVolume = 0.2;
  let volume = defaultVolume;
  let enabled = true;
  try {
    const saved = JSON.parse(localStorage.getItem(settingsKey));
    if (typeof saved?.volume === "number" && Number.isFinite(saved.volume))
      volume = Math.min(1, Math.max(0, saved.volume));
    if (typeof saved?.enabled === "boolean") enabled = saved.enabled;
  } catch { /* Music still works when browser storage is unavailable. */ }

  const controls = document.createElement("aside");
  controls.className = "bgm-control";
  controls.setAttribute("aria-label", "배경음악");
  controls.innerHTML = `
    <button id="bgm-menu" type="button" aria-label="배경음악 설정" aria-expanded="false" aria-controls="bgm-panel" title="배경음악 설정">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M9 18V5l12-2v13M9 8l12-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="18" cy="16" rx="3" ry="2.5"/></svg>
      <span class="bgm-indicator" aria-hidden="true"></span>
    </button>
    <section id="bgm-panel" aria-label="배경음악 설정" hidden>
      <div class="bgm-heading"><strong>배경음악</strong><button id="bgm-toggle" type="button" aria-pressed="false">소리 켜기</button></div>
      <label class="bgm-volume-label" for="bgm-volume">음량 <output id="bgm-level" for="bgm-volume">20%</output></label>
      <input id="bgm-volume" type="range" min="0" max="100" step="1" value="20" aria-label="배경음악 음량" />
      <p id="bgm-status" role="status"></p>
      <p class="bgm-credit">BGM : Sweet Cherry<br />Produced by 사운드스프레이 Soundspray<br /><a href="https://youtu.be/2kdsec1iJXE" target="_blank" rel="noopener noreferrer">Music, Video link ↗</a></p>
    </section>`;
  document.body.append(controls);
  const menu = controls.querySelector("#bgm-menu");
  const panel = controls.querySelector("#bgm-panel");
  const toggle = controls.querySelector("#bgm-toggle");
  const slider = controls.querySelector("#bgm-volume");
  const level = controls.querySelector("#bgm-level");
  const status = controls.querySelector("#bgm-status");
  let context;
  let gain;
  let started = false;
  let pending = false;
  let failed = false;
  let attempt = 0;

  function persist() {
    try { localStorage.setItem(settingsKey, JSON.stringify({ volume, enabled })); }
    catch { /* Optional preference persistence. */ }
  }
  function applyVolume() {
    // Web Audio gain also supports volume adjustment on mobile Safari.
    if (gain) {
      audio.volume = 1;
      gain.gain.setValueAtTime(volume, context.currentTime);
    } else audio.volume = volume;
    audio.muted = !enabled || volume === 0;
  }
  function render() {
    const audible = enabled && volume > 0 && !audio.paused && !failed;
    controls.dataset.playing = String(audible);
    toggle.setAttribute("aria-pressed", String(audible));
    toggle.textContent = audible || pending ? "소리 끄기" : "소리 켜기";
    slider.value = String(Math.round(volume * 100));
    level.value = `${slider.value}%`;
    slider.setAttribute("aria-valuetext", `${slider.value}%`);
    status.textContent = failed ? "음악을 불러오지 못했어요. 다시 켜주세요."
      : !enabled || volume === 0 ? "소리가 꺼져 있어요."
      : audible ? "Sweet Cherry · 반복 재생 중"
      : pending ? "음악을 불러오고 있어요…"
      : "화면을 누르면 음악이 시작돼요.";
  }
  function stop() {
    attempt++;
    pending = false;
    audio.pause();
    applyVolume();
    render();
  }
  function start() {
    if (!enabled || volume === 0 || document.hidden || pending) return;
    if (!audio.paused && !failed) return;
    const currentAttempt = ++attempt;
    pending = true;
    if (failed) audio.load();
    failed = false;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!context && AudioContext) {
        context = new AudioContext();
        gain = context.createGain();
        context.createMediaElementSource(audio).connect(gain);
        gain.connect(context.destination);
      }
      applyVolume();
      // Invoke both within the user gesture; awaiting resume first can lose it.
      Promise.all([context?.resume(), audio.play()]).then(() => {
        if (currentAttempt !== attempt) return;
        pending = false;
        started = true;
        render();
      }).catch((error) => {
        if (currentAttempt !== attempt) return;
        pending = false;
        failed = !["NotAllowedError", "AbortError"].includes(error.name);
        audio.pause();
        render();
      });
    } catch {
      pending = false;
      failed = true;
    }
    render();
  }
  function setOpen(open) {
    panel.hidden = !open;
    menu.setAttribute("aria-expanded", String(open));
  }
  menu.addEventListener("click", () => setOpen(panel.hidden));
  toggle.addEventListener("click", () => {
    if (enabled && (pending || (!audio.paused && volume > 0))) {
      enabled = false;
      stop();
    } else {
      enabled = true;
      if (volume === 0) volume = defaultVolume;
      start();
    }
    persist();
    render();
  });
  slider.addEventListener("input", () => {
    volume = Number(slider.value) / 100;
    applyVolume();
    persist();
    if (volume === 0) stop();
    else start();
    render();
  });
  // Keep audio controls from advancing dialogue or invoking game shortcuts.
  for (const name of ["pointerdown", "pointerup", "click", "keydown", "keyup"])
    controls.addEventListener(name, (event) => {
      event.stopPropagation();
      if (name === "keydown" && event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        menu.focus();
      }
    });
  document.addEventListener("pointerdown", (event) => {
    if (controls.contains(event.target)) return;
    setOpen(false);
    start();
  }, true);
  document.addEventListener("keydown", (event) => {
    if (controls.contains(event.target) || event.repeat || ["Tab", "Escape", "Shift", "Control", "Alt", "Meta"].includes(event.key)) return;
    start();
  }, true);
  for (const name of ["playing", "pause", "volumechange"]) audio.addEventListener(name, render);
  audio.addEventListener("error", () => {
    attempt++;
    pending = false;
    failed = true;
    render();
  });
  window.addEventListener("pagehide", stop);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (started) start();
  });
  applyVolume();
  render();
})();
