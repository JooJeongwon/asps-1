// Export both the editable branching script and one complete presentation path.
import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";
const context = vm.createContext({ window: {} });
for (const file of ["characters.js", "team.js", "scenario.js", "story.js"])
  vm.runInContext(await readFile(new URL(`../public/${file}`, import.meta.url), "utf8"), context);
const { TEAM04_MEMBERS: members, TEAM04_SCENARIO: story, TEAM04_STORY: script } = context.window;
const names = Object.fromEntries([...members.map((m) => [m.id, m.name]), ["n", "지문"], ["you", "아무개"], ["system", "시스템"]]);
const dialogue = (lines) => lines.map((line) => {
  const i = line.indexOf(" ");
  return `**${names[line.slice(0, i)]}** ${line.slice(i + 1)}`;
}).join("\n\n");
const dialog = (label) => script[label].find((a) => a.Choice).Choice.Dialog;
const bridge = (r) => script[`FinalBridge_${r.id}`].filter((a) => typeof a === "string" && !a.startsWith("jump "));
const timing = `| 구간 | 목표 시각 | 분량 |
| --- | --- | --- |
| 강의실 입장 | 0:00–0:10 | 10초 |
| 박진환 · 왕좌와 책임감 | 0:10–0:35 | 25초 |
| 주정원 · 햄버거와 행동 | 0:35–1:00 | 25초 |
| 정치훈 · 부야베스와 응원 | 1:00–1:25 | 25초 |
| 남성수 · 운명과 실제 사주 노트 | 1:25–1:57 | 32초 |
| 네 번째 안내와 최종 선택 | 1:57–2:10 | 13초 |
| 선택한 한 명의 엔딩 | 2:10–2:20 | 10초 |
| 공통 반전과 실제 역할 공개 | 2:20–2:40 | 20초 |
| 합계 | **2분 40초** | **${story.targetSeconds}초** |`;
const roleTable = `| 인물 | 실제 역할 |
| --- | --- |
${story.routes.map((r) => { const m = members.find((m) => m.id === r.id); return `| ${m.name} | ${m.role} |`; }).join("\n")}`;
let text = `# 《${story.title}》 · 3분 발표판

> ${story.tagline}
>
> ${story.twist}

주인공은 얼굴이 공개되지 않는 대학생 **아무개**. 네 명을 원하는 순서로 만나고 한 명을 골랐다가, 네 명과 평생 팀플하게 되는 팀 소개 코미디다.

**인물당 5문답 → 2문답, 총 20번 → 8번의 선택으로 압축했다.** 반복되는 취미·식사·첫인상 설명을 합치고, 대표 개그와 팀에서의 모습만 남겼다. 현대 캠퍼스 이미지와 큰 인물·대사 구도를 유지한다.

발표 때 바로 읽을 한 경로는 [3분 발표 진행 대본](presentation-3min.md)에 따로 정리했다. 아래 문서는 양쪽 대답과 네 엔딩을 모두 담은 편집용 대본이다.

## 진행 구조

1. 강의실 입장 → 아직 만나지 않은 캐릭터 선택.
2. 인물당 2번의 2지선다. 두 대답은 다음 질문으로 합류한다.
3. 처음 세 명은 짧게 퇴장. 네 번째는 최종 선택을 안내한다.
4. 네 명 중 누구나 자유롭게 최종 선택 → 해당 인물의 엔딩.
5. 네 명과 팀플하는 공통 반전 → TEAM 01 실제 역할 공개.

대화 진행은 0/2~2/2로 기록한다. 완료 카드는 다시 선택할 수 없고, 마지막 선택에는 대답이나 만남 순서 조건이 없다.

## 발표 목표 · 2분 40초 + 여유 20초

${timing}

위 시간은 발표용 배분 목표다. 실제 시간은 읽기·선택·네트워크 속도에 따라 달라지며 강제 타이머나 자동 선택은 없다. 답은 하나씩만 고르고, 최종 엔딩도 한 명만 보여준다. 사주 노트의 여섯 조합은 화면으로 보여주고 일일이 읽지 않는다. 발표 전 한 번 리허설한다.

## 캐릭터 선택

| 선택 | 인물 | 캐릭터 |
| --- | --- | --- |
${story.routes.map((r) => `| ${r.letter} | ${names[r.id]} | ${r.alias} |`).join("\n")}

## 프롤로그

${dialogue([...story.prologue, dialog("Prologue")])}

[코코네 강의실로 들어간다]

`;
for (const route of story.routes) {
  text += `## ${route.letter}. ${names[route.id]} · ${route.shortAlias}\n\n**장소:** ${route.location}\n\n${dialogue(route.intro)}\n\n`;
  route.questions.forEach((q, i) => {
    text += `### 대화 ${i + 1}. ${q.title}\n\n${dialogue(q.lines)}\n\n`;
    q.choices.forEach((option, answer) => {
      text += `**선택 ${answer + 1} — ${option.text}**\n\n${dialogue(option.reply)}\n\n`;
    });
    text += `*합류: ${i + 1 < route.questions.length ? `다음 질문 ${i + 2}/${route.questions.length}` : "이 인물의 대화 완료"}.*\n\n`;
  });
  if (route.sajuLines) text += `**실제 사주 노트:** 네 팀원 사이의 여섯 조합을 서버에서 조회해 한 화면으로 표시한다. 주인공과의 가상 점수를 만들지 않으며, 조회 실패 시 안내 후 계속 진행한다.\n\n${dialogue(route.sajuLines)}\n\n`;
  text += `**첫 번째~세 번째 만남일 때**\n\n${dialogue(route.departure)}\n\n[남은 캐릭터 선택으로]\n\n**네 번째 만남일 때**\n\n${dialogue(bridge(route))}\n\n[퇴장 없이 최종 선택으로]\n\n`;
}
text += `## 최종 선택\n\n${dialogue([dialog("FinalChoice")])}\n\n`;
for (const r of story.routes) text += `- **${r.letter}. ${names[r.id]}** — ${r.shortAlias}\n`;
for (const r of story.routes) text += `\n## ${r.letter} END · ${r.ending.title}\n\n${dialogue(r.ending.lines)}\n\n[공통 엔딩으로 합류]\n`;
text += `\n## 공통 엔딩 · 탈퇴 버튼은 없습니다\n\n*선택받지 못한 세 명도 다시 나타난다.*\n\n${dialogue([...story.commonEnding, dialog("CommonEnding")])}\n\n[진짜 팀 역할 공개 →]\n\n${roleTable}\n\n원본 사진 대신 AI 캠퍼스 일러스트를 사용한다. 실제 프로필·프로젝트·GitHub와 처음부터 다시 플레이하기를 제공한다.\n\n## 편집 및 검증\n\n대본은 \`public/scenario.js\`에서 수정하고 \`node scripts/export-scenario.js\`로 두 문서를 갱신한다. \`public/story.js\`와 \`public/game.js\`의 진행은 인물별 질문 개수를 따른다. 저장 공간은 \`ASPS_TEAM01_kokone_short_v4\`이며 이전 버전의 저장은 별도로 보관한다.\n\n24가지 만남 순서, 인물별 4가지 대답 패턴, 네 최종 선택과 되감기를 검증한다.\n`;
await writeFile(new URL("../docs/scenario-kokone.md", import.meta.url), text);

let presentation = `# 두근두근 코코네 · 3분 발표 진행 대본

목표 **2분 40초**, 여유 **20초**. 아래는 A → B → C → D 순서, 대화는 모두 첫 번째 답, 최종 선택은 D 남성수인 **한 번의 완주 대본**이다. 실제 게임에서는 순서와 최종 상대를 자유롭게 정할 수 있다.

${timing}

대본에 없는 선택지나 다른 엔딩은 발표 중 읽지 않는다. 사주 노트는 약 5초 보여주며 “실제 네 팀원의 사주 데이터를 연결했습니다”라고만 설명한다. 역할 공개 화면에서 이름·역할을 한 번씩 읽고 마친다. 실제 소요 시간은 읽기·선택·네트워크 속도에 따라 달라지므로 이 경로로 리허설한다.

## 0:00–0:10 · 강의실 입장

${dialogue([...story.prologue, dialog("Prologue")])}

[코코네 강의실로 들어간다]

`;
const clocks = ["0:10–0:35", "0:35–1:00", "1:00–1:25", "1:25–1:57"];
story.routes.forEach((r, i) => {
  presentation += `## ${clocks[i]} · ${r.letter}. ${names[r.id]} 선택\n\n${dialogue(r.intro)}\n\n`;
  for (const q of r.questions) presentation += `${dialogue(q.lines)}\n\n**[첫 번째 답] ${q.choices[0].text}**\n\n${dialogue(q.choices[0].reply)}\n\n`;
  if (r.sajuLines) presentation += `*[사주 노트를 약 5초 보여준다. 발표자: “실제 네 팀원의 사주 데이터를 연결했습니다.” → 이야기 계속하기]*\n\n`;
  if (i < 3) presentation += `${dialogue(r.departure)}\n\n[다음 캐릭터 선택]\n\n`;
});
const last = story.routes.at(-1);
presentation += `## 1:57–2:10 · 마지막 선택\n\n${dialogue([...bridge(last), dialog("FinalChoice")])}\n\n[D. 남성수 선택]\n\n## 2:10–2:20 · 남성수 END\n\n${dialogue(last.ending.lines)}\n\n## 2:20–2:40 · 팀플 반전과 역할 공개\n\n*네 사람의 일러스트가 함께 나타난다.*\n\n${dialogue([...story.commonEnding, dialog("CommonEnding")])}\n\n[진짜 팀 역할 공개 →]\n\n**발표자** “팀1, 박진환은 백엔드, 주정원은 프론트엔드, 정치훈은 PM, 남성수는 발표입니다.”\n\n[양쪽 선택지와 네 엔딩 전체 대본](scenario-kokone.md)\n`;
await writeFile(new URL("../docs/presentation-3min.md", import.meta.url), presentation);
console.log(`Exported compact screenplay and ${story.targetSeconds}-second presentation path: 4 routes × 2 conversations.`);
