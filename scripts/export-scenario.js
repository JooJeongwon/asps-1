// Export the exact editable Kokone script, including both replies and all fourth-speaker variants.
import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";
const context = vm.createContext({ window: {} });
for (const file of ["team.js", "scenario.js"])
  vm.runInContext(await readFile(new URL(`../public/${file}`, import.meta.url), "utf8"), context);
const { TEAM04_MEMBERS: members, TEAM04_SCENARIO: story } = context.window;
const names = Object.fromEntries([...members.map((m) => [m.id, m.name]), ["n", "지문"], ["you", "아무개"], ["system", "시스템"]]);
const dialogue = (lines) => lines.map((line) => {
  const i = line.indexOf(" ");
  return `**${names[line.slice(0, i)]}** ${line.slice(i + 1).replace("{{saju.summary}}", "[이번 회차에 조회한 실제 네 팀원 사이의 사주 최고 조합·점수. 동점은 모두 소개하고, 조회 실패 시 점수 없는 대사로 진행.]")}`;
}).join("\n\n");
let text = `# 《${story.title}》\n\n> ${story.tagline}\n>\n> ${story.twist}\n\n주인공은 얼굴이 공개되지 않는 대학생 **아무개**. 정통 미연시처럼 시작하지만 마지막에는 네 명과 팀플하는 결말에 도착하는 팀 소개 코미디다. 기존 현대 캠퍼스 일러스트를 유지하며 왕좌·프랑스 성·운명 분석은 캐릭터의 과장된 설정과 지문으로 표현한다.\n\n## 진행 구조\n\n1. 코코네 강의실 문 앞 프롤로그.\n2. A·B·C·D 중 아직 만나지 않은 캐릭터 선택. 만나는 순서는 자유다.\n3. 해당 인물과 5번의 2지선다 대화. 두 반응은 다음 질문으로 합류한다.\n4. 처음 세 명은 자기 방식으로 물러나고 선택 화면으로 돌아온다.\n5. 네 번째 인물은 퇴장 대사 대신 최종 선택을 안내한다.\n6. A·B·C·D 중 한 명을 자유롭게 선택한다.\n7. 선택한 사람의 엔딩 → 네 명과 팀플하는 공통 엔딩.\n8. 버튼을 누르면 TEAM 01의 실제 역할 공개.\n\n다시 만날 수 없는 카드에는 ‘대화 완료’를 표시한다. 대화 진행은 인물별 0/5~5/5로 기록한다. 선호 점수로 정답을 강요하지 않으며, 마지막 선택에는 만남 순서나 대답 조건이 없다.\n\n## 목표 분량 · 약 4분 40초\n\n| 구간 | 목표 |\n| --- | --- |\n| 문 앞 프롤로그 | 15초 |\n| 캐릭터 선택 화면과 처음 세 번의 퇴장 | 합계 30초 |\n| 네 캐릭터의 등장·5번 대화 | 각 약 40초, 합계 160초 |\n| 네 번째 캐릭터의 연결 | 10초 |\n| 최종 선택 | 15초 |\n| 개별 엔딩 | 20초 |\n| 공통 엔딩과 실제 역할 공개 | 30초 |\n| 합계 | 280초 |\n\n대사는 한 화면에 한두 문장으로 줄였다. 읽는 속도와 선택을 고민하는 시간, 실제 사주 노트를 읽는 시간에 따라 더 길어질 수 있다. 강제 타이머나 자동 선택은 없다. 원안의 감미로운 음악은 연출 방향이며 이번 대본 변경에서 새 음원은 추가하지 않았다.\n\n## 캐릭터 선택 화면\n\n| 선택 | 인물 | 캐릭터 소개 |\n| --- | --- | --- |\n`;
for (const route of story.routes) text += `| ${route.letter} | ${names[route.id]} | ${route.alias} |\n`;
text += `\n## 프롤로그 · 코코네 강의실 문 앞\n\n${dialogue(story.prologue)}\n\n**아무개** 일단 들어가 보자. 설마 팀플보다 어렵겠어?\n\n[코코네 강의실로 들어간다]\n\n`;
for (const route of story.routes) {
  text += `## ${route.letter} 루트 · ${names[route.id]}\n\n**${route.alias}**\n\n**장소:** ${route.location}\n\n### 등장\n\n${dialogue(route.intro)}\n\n`;
  route.questions.forEach((q, i) => {
    text += `### ${route.letter}-${i + 1}. ${q.title}\n\n${dialogue(q.lines)}\n\n`;
    q.choices.forEach((option, answer) => {
      text += `**선택 ${answer + 1} — ${option.text}**\n\n${dialogue(option.reply)}\n\n`;
    });
    text += `*합류: ${i < 4 ? `다음 질문 ${i + 2}/5` : "이 인물의 대화 완료"}. 답에 따른 추가 분기는 없다.*\n\n`;
  });
  if (route.sajuLines) text += `### 실제 사주 노트\n\n이 지점에서 서버의 실제 팀원 간 사주 점수 여섯 조합을 표시한다. 앞의 97.8점·운명 가능성 수치는 성수의 고백용 개그이고 DB 점수로 저장하거나 표시하지 않는다. 아무개의 생년월일·사주는 설정하지 않는다.\n\n${dialogue(route.sajuLines)}\n\n`;
  text += `### 첫 번째~세 번째로 만났을 때 · 퇴장\n\n${dialogue(route.departure)}\n\n[아직 만나지 않은 캐릭터 선택 화면으로]\n\n### 네 번째로 만났을 때 · 최종 선택 연결\n\n${dialogue([story.bridge[0], ...route.bridge, `${route.id} 결국 우리 네 명을 전부 만났네. 이제는 호기심이 아니라 네 마음으로 선택해야 해.`, ...story.bridge.slice(1)])}\n\n*이 경우 위 퇴장 대사는 재생하지 않는다. 짧게 화면이 흔들리고 최종 선택으로 이어진다.*\n\n`;
}
text += "## 최종 선택\n\n**아무개** 마지막으로 함께하고 싶은 사람은? 지금까지의 대답과 관계없이 누구나 선택할 수 있다.\n\n";
for (const r of story.routes) text += `- **${r.letter}. ${names[r.id]}** — ${r.shortAlias}\n`;
for (const r of story.routes) text += `\n## ${r.letter} END · ${r.ending.title}\n\n${dialogue(r.ending.lines)}\n\n[공통 최종 엔딩으로 합류]\n`;
text += `\n## 공통 최종 엔딩 · 탈퇴 버튼은 없습니다\n\n${dialogue(story.commonEnding)}\n\n**시스템** 팀플은 지금부터입니다. TEAM 01의 실제 역할을 확인하세요.\n\n[진짜 팀 역할 공개 →]\n\n## 실제 역할 공개\n\n> 연애 상대는 한 명, 팀플 상대는 네 명.\n>\n> 선택은 끝났지만, 팀플은 지금부터.\n\n| 인물 | 실제 역할 | 공개 문구 |\n| --- | --- | --- |\n`;
for (const r of story.routes) {
  const m = members.find((m) => m.id === r.id);
  text += `| ${m.name} | ${m.role} | ${m.reveal} |\n`;
}
text += "\n원본 사진 대신 캠퍼스 AI 일러스트를 사용한다. 실제 프로필·프로젝트·GitHub 링크와 처음부터 다시 플레이하기를 제공한다.\n\n## 수정 및 검증\n\n`public/scenario.js`에서 대본을 수정하고 `node scripts/export-scenario.js`로 이 문서를 다시 생성한다. `public/story.js`가 선택·합류·방문 완료·네 번째 안내를 구성한다. 새로운 분기 구조는 `ASPS_TEAM01_kokone_v3` 저장 공간을 사용하며 이전 대본의 저장은 별도로 보관한다.\n\n[Monogatari 공식 엔진](https://github.com/Monogatari/Monogatari/releases/tag/v2.8.0)의 Choice·Conditional·Function·Message 액션으로 구현한다. 24가지 만남 순서, 인물별 32가지 대답 패턴, 네 명의 최종 자유 선택과 되감기를 검증한다.\n";
await writeFile(new URL("../docs/scenario-kokone.md", import.meta.url), text);
console.log("Exported Kokone screenplay: 4 routes × 5 conversations, 4 endings, common ending and role reveal.");
