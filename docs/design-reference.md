# TEAM 01 · 두근두근 코코네 구현

[전체 대본](scenario-kokone.md)은 사용자가 제공한 A·B·C·D 팀 소개 코미디를 재구성한 것이다. `/`에서 프롤로그가 바로 시작되고, 네 인물을 원하는 순서로 만난다. 실제 역할은 정치훈 PM, 박진환 백엔드, 주정원 프론트엔드, 남성수 발표다.

3분 발표용으로 등장·대답·퇴장을 줄여 약 2분 40초를 목표로 한다. 인물당 질문은 2개, 전체는 8개다. 문답 뒤 이동과 진행 표시는 `route.questions.length`에 맞춰 구성한다.

## 진행과 편집

프롤로그 → 만남 선택 → 인물별 2개의 2지선다 → 첫 세 명의 퇴장 → 네 번째 인물의 안내 → 최종 자유 선택 → 개별 엔딩 → 공통 팀플 엔딩 → 실제 역할 공개.

| 파일 | 역할 |
| --- | --- |
| `public/scenario.js` | 제목, 프롤로그, A~D의 등장·질문·반응·퇴장·네 번째 안내·엔딩, 공통 엔딩 |
| `public/story.js` | 대본을 Monogatari 라벨과 네이티브 액션으로 구성 |
| `public/game.js` | 엔진 초기화, 만남·질문 진행, 완료 카드, 저장 UI |
| `public/team.js` | 확정 실제 역할, 역할 공개 문구, 기존 프로필 데이터 |
| `public/saju.js` | 서버의 실제 사주 점수 조회·검증·회차별 노트 |
| `public/characters.js` | 이름별 캠퍼스 초상화와 장면 이미지 매핑 |
| `public/index.html`, `public/play.css`, `public/campus.css` | 게임 제목, 현대 캠퍼스 테마와 모바일 크기 |
| `public/team.html`, `public/team-page.js` | 공통 엔딩 후 실제 역할·프로필·프로젝트 소개 |
| `scripts/export-scenario.js` | 실행 대본을 `docs/scenario-kokone.md`로 출력 |

대사 형식은 `인물ID 대사`다. `you`는 아무개, `n`은 지문, `system`은 시스템이다. `routes`의 A~D 순서는 선택 카드의 순서이며, 실제 만남 순서는 플레이어가 정한다. 각 `questions`에는 두 개의 `choices`와 각각의 `reply`가 있다. 대본 수정 후 `node scripts/export-scenario.js`를 실행한다.

## 합류, 완료와 최종 선택

답변 라벨 `Question_ID_NA0/1`은 동일한 `Question_ID_NAfter`로 합류한다. 2번 답한 인물만 완료 처리하고 `visitOrder`에 한 번 기록한다. 상단의 0/2~2/2는 대화 진행이다. 내부 `affinity` 필드는 답변 기록에서 다시 계산하며 연애 성패에 사용하지 않는다.

첫 세 인물은 `Departure_ID`를 지나 만남 선택으로 돌아간다. 네 번째는 `FinalBridge_ID`로 가며 다른 사람을 만나라는 퇴장 대사를 생략한다. D를 먼저 만났을 때의 퇴장도 있다. 완료 카드는 네이티브 버튼을 비활성화하고 완료 표시를 붙인다. 라우트 입구의 Conditional도 중복 방문을 막는다.

Monogatari 2.8.0의 여러 `Clickable` 콜백을 동시에 평가하면 전역 입력 잠금이 남는 동작을 확인했다. 번들은 수정하지 않고 `componentDidMount`에서 네이티브 버튼의 `disabled`를 적용한다. 선택 실행과 되감기는 계속 공식 Choice 액션이 담당한다.

네 사람을 모두 만난 경우에만 `FinalChoice`에 진입한다. 이 화면의 네 선택에는 점수·만남 순서 조건이 없다. 각 `Ending_ID`는 `CommonEnding`으로 합류한다. 네 사람이 다시 등장하는 팀플 반전 뒤 버튼을 누르면 `/team.html?match=ID`에서 실제 역할을 공개한다.

## 저장과 되감기

공식 Monogatari 2.8.0이 타이핑·선택·분기·되감기·대사록·저장/불러오기를 처리한다. 새 분기 구조의 저장 공간은 `ASPS_TEAM01_kokone_short_v4`이다. 이전 5문답판의 `ASPS_TEAM01_kokone_v3`와 20컷 대본의 `ASPS_TEAM04_saju_v2` 저장은 별도로 보관하며 새 구조에서 불러오지 않는다.

`choices`, `visitOrder`, `unlocked`, `selected`, `saju`가 회차 상태다. 답변을 되감으면 해당 답변만 지우고 진행을 다시 계산한다. 완료 Function을 되감으면 만남 완료와 순서도 복원한다. 처음부터 다시 시작하면 회차 상태를 모두 초기화한다. Supabase는 클라우드 세이브 용도가 아니다.

## 실제 사주와 개그 대사

성수의 두 번째 대화 뒤 네 이름을 `/api/team`에 전달한다. 12개의 방향별 결과가 네 사람 사이의 모든 조합인지, 중복·누락·비대칭은 없는지, `saju_score`가 0~100의 유한한 숫자인지 검증한다. 검증한 여섯 조합만 내림차순으로 정렬하며 원점수로 순위를 정하고 표시할 때만 소수점 한 자리로 반올림한다.

`storage.saju`에 해당 회차의 결과를 보관한다. 여섯 조합을 한 화면에 표시하고, 같은 수치를 대사로 다시 읽는 장면은 생략한다. 최대 10초의 조회 제한과 점수 없는 실패 대사가 있으며 새 회차에서만 다시 조회한다. 조회하는 동안 네이티브 입력 잠금을 유지해 빠른 연속 클릭이 결과 도착 전에 다음 장면으로 넘어가지 않도록 한다.

발표판은 임의의 고백용 수치를 생략하고 실제 네 팀원 사이의 기록만 보여준다. 아무개의 궁합은 계산하지 않으며 최종 상대는 플레이어가 정한다. 종합 점수·MBTI·KAI를 사주 점수로 대체하지 않는다.

## 이미지와 연출

[로판 타이포그래피](typography.md)는 `public/typography.css`에서 게임과 엔딩에 함께 적용한다. 제목·이름, 대사·본문, 메뉴·정보, 영문 장식에 각각 서체를 배치하며 웹폰트를 직접 호스팅한다.

[현대 캠퍼스 아트](campus-art-prompts.md)의 인물 4장·장면 4장·표지와 큰 글자·인물 구도를 유지한다. 표지는 프롤로그에만 보인다. 최종 연결에 짧은 화면 흔들림을 주고 `prefers-reduced-motion`에서는 끈다. 왕좌·헤드셋·프랑스 요리 등은 이번 변경에서 대사와 지문으로 표현하며 새 이미지나 음원은 추가하지 않았다. 원본 사진은 공개 배포에 포함하지 않는다.

## 검증

`npm run build`는 진입점·인물·장면·공식 엔진 해시를 확인한다. `npm test`는 24개 만남 순서, 인물별 4개 답변 패턴, 2번 대화 후 완료, 중복 진입 제한, 네 번째 안내, 자유 최종 선택, 완료/답변의 되감기와 재시작, 역할·이미지 매핑, 사주·API를 확인한다.

```sh
PORT=3017 npm start
# 별도 터미널 · Python Playwright와 Chromium 필요
python3 scripts/verify-monogatari.py --url http://127.0.0.1:3017
```

실제 Chromium 검증은 다른 만남 순서로 네 엔딩을 완주한다. 8개 질문, 처음 세 명의 퇴장과 네 번째 안내, 공통 팀플 엔딩, 실제 역할 공개, 저장/불러오기·완료를 넘어선 되감기·재시작, 모바일과 가로 화면, 실제 사주 노트를 확인한다.

## 참고

- 사용자 제공 《두근두근 코코네》 원안과 확정 팀 역할이 현재 대본의 기준이다.
- [KwonSeami/datingsim](https://github.com/KwonSeami/datingsim): 배경·인물·하단 대화창 구성 참고.
- [Monogatari 2.8.0](https://github.com/Monogatari/Monogatari/releases/tag/v2.8.0): 공식 번들과 MIT 라이선스, 해시를 `public/vendor/monogatari/`에 고정.
