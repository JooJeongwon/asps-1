(() => {
  const members = window.TEAM04_MEMBERS;
  const selected = members.find(
    (m) => m.id === new URLSearchParams(location.search).get("match"),
  );
  if (selected) {
    const line = document.getElementById("your-match");
    line.textContent = `오늘, 당신이 선택한 사람 · ${selected.name}`;
    line.hidden = false;
  }
  const host = document.getElementById("members");
  for (const member of members) {
    const card = document.createElement("article");
    card.className = "member";
    const photo = document.createElement("img");
    photo.src = `/assets/${window.YEONBUN_PORTRAITS[member.name]}`;
    photo.alt = `${member.name} 로판 일러스트`;
    photo.width = 1024;
    photo.height = 1536;
    const name = document.createElement("h3");
    name.textContent = member.name;
    const role = document.createElement("p");
    role.className = "role";
    role.textContent = member.role;
    const details = document.createElement("details");
    details.id = `profile-${member.id}`;
    const summary = document.createElement("summary");
    summary.textContent = `${member.name} 프로필`;
    const facts = document.createElement("p");
    facts.textContent = `${member.mbti} · ${member.pillar} · KAI ${member.kai}`;
    const trait = document.createElement("p");
    trait.textContent = member.sajuScene;
    const interests = document.createElement("p");
    interests.className = "interests";
    interests.textContent = `관심사 · ${member.interests}`;
    details.append(summary, facts, trait, interests);
    card.append(photo, name, role, details);
    host.append(card);
  }
  const profileButton = document.getElementById("show-profiles");
  function syncProfiles() {
    profileButton.setAttribute(
      "aria-expanded",
      String([...host.querySelectorAll("details")].every((d) => d.open)),
    );
  }
  host
    .querySelectorAll("details")
    .forEach((d) => d.addEventListener("toggle", syncProfiles));
  profileButton.addEventListener("click", () => {
    const open = profileButton.getAttribute("aria-expanded") !== "true";
    host.querySelectorAll("details").forEach((d) => (d.open = open));
    syncProfiles();
    if (open) {
      host.scrollIntoView({ block: "start", behavior: "smooth" });
      host.querySelector("summary").focus({ preventScroll: true });
    }
  });
  document.getElementById("show-project").addEventListener("click", (event) => {
    const project = document.getElementById("project");
    project.hidden = !project.hidden;
    event.currentTarget.setAttribute("aria-expanded", String(!project.hidden));
    if (!project.hidden)
      project.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
})();
