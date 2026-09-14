// Export the exact playable dialogue as a reviewable Korean screenplay.
import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";
const context = vm.createContext({ window: {} });
for (const name of ["team.js", "scenario.js"])
  vm.runInContext(
    await readFile(new URL(`../public/${name}`, import.meta.url), "utf8"),
    context,
  );
const { TEAM04_MEMBERS: members, TEAM04_SCENARIO: story } = context.window;
const names = Object.fromEntries([
  ...members.map((m) => [m.id, m.name]),
  ["n", "지문"],
  ["you", "나"],
  ["system", "SYSTEM"],
]);
const dialogue = (lines) =>
  lines
    .map((line) => {
      const i = line.indexOf(" ");
      return `**${names[line.slice(0, i)]}** ${line.slice(i + 1)}`;
    })
    .join("\n\n");
let text = `# 《${story.title}》\n\n여자 전학생인 주인공은 이름과 얼굴이 드러나지 않는다. 첫날 네 명을 차례로 알아가고, 공동 위기를 함께 해결한 뒤 마지막 밤 직접 한 명을 선택한다.\n\n## 확정한 팀 역할\n\n| 인물 | 실제 역할 | 이야기 속 인상 |\n| --- | --- | --- |\n`;
for (const m of members) text += `| ${m.name} | ${m.role} | ${m.trait} |\n`;
text +=
  "\n역할은 사용자가 확정했다. MBTI·일주·KAI와 관심사 문구는 기존 프로젝트에서 가져왔으며, 사건·대사·감정과 캐릭터의 성격 묘사는 창작이다. 사주나 MBTI가 실제 성격·감정·연애 결과를 결정한다는 설정은 사용하지 않는다.\n\n## 진행 규칙\n\n- CUT 01부터 공통 이야기로 시작한다. 초반 인물 선택은 없다.\n- 일상 선택은 짧은 반응 뒤 같은 컷의 뒷부분에 합류한다. 합류 후 모두 동일한 다음 컷으로 이동한다.\n- CUT 02 인사에 따라 두 인물의 호감도가 +1. CUT 04·07·10·13은 해당 인물 +1, CUT 16은 전원 +1이다. CUT 05는 점수 변화 없이 대사만 달라진다.\n- CUT 05·08·11·14에서 각각 프로필을 해금한다.\n- CUT 19에서 호감도 순위와 관계없이 네 명 모두 선택할 수 있다. CUT 20만 네 개의 엔딩으로 분기한다.\n- 7개의 이지선다 × 최종 4인 선택 = 512개 선택 조합이지만, 스토리는 20컷으로 합류한다.\n\n";
for (const cut of story.cuts) {
  text += `## CUT ${cut.id.slice(3)}. ${cut.title}\n\n**배경:** ${cut.location}\n\n${dialogue(cut.lines)}\n\n`;
  if (cut.prompt) text += dialogue([cut.prompt]) + "\n\n";
  if (cut.choices) {
    cut.choices.forEach((option, i) => {
      text += `### 선택 ${i + 1} · ${option.text}\n\n${dialogue(option.reply)}\n\n`;
      const score = Object.entries(option.affinity)
        .map(([id, n]) => `${names[id]} 호감도 +${n}`)
        .join(" / ");
      text += `${score || "호감도 변화 없음"}\n\n`;
    });
    text += "**합류:** 어떤 선택을 해도 다음 내용으로 이어진다.\n\n";
  }
  if (cut.after) text += dialogue(cut.after) + "\n\n";
  if (cut.unlock) {
    const m = members.find((m) => m.id === cut.unlock);
    text += `> PROFILE UNLOCK · ${m.name}\n>\n> ${m.role} · ${m.mbti} · ${m.pillar}\n>\n> ${m.trait}\n>\n> ${m.hidden}\n\n`;
  }
  if (cut.final)
    for (const m of members) text += `- **${m.name}** — ${m.summary}\n`;
}
text += "\n## CUT 20. 네 가지 엔딩\n\n";
for (const end of story.endings)
  text += `### ${names[end.member]} END — ${end.title}\n\n*${end.subtitle}*\n\n${dialogue(end.lines)}\n\n`;
text +=
  "## END SCREEN · MEET OUR TEAM\n\n> YOU FOUND YOUR MATCH.\n>\n> 하지만—\n>\n> 좋은 프로젝트를 만드는 데에는\n> 한 명의 완벽한 사람이 아니라\n> 서로 다른 네 사람이 필요합니다.\n\n실제 팀원 사진 네 장과 정치훈(PM) · 박진환(백엔드) · 주정원(프론트엔드) · 남성수(발표)를 보여준다.\n\n- **MEMBER PROFILE:** 네 사람의 프로필 펼치기.\n- **OUR PROJECT:** ASPS 프로젝트 소개 펼치기.\n- **GITHUB:** 실제 저장소로 이동.\n- **처음부터 다시 플레이하기:** 공통 스토리의 CUT 01부터 시작.\n\n## 편집 위치\n\n`public/scenario.js`가 실제 플레이 대본이다. `public/team.js`에서 역할과 프로필을 관리한다. 이 문서는 `node scripts/export-scenario.js`로 대본에서 다시 생성할 수 있다.\n";
await writeFile(new URL("../docs/scenario-team04.md", import.meta.url), text);
console.log("Exported 20-cut screenplay to docs/scenario-team04.md");
