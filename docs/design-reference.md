# TEAM 01 · Monogatari 구성

## 현재 이야기

《오늘, 우리 중 한 명을 선택해》의 [전체 20컷 대본](scenario-team04.md)을 구현한다. 역할은 사용자 확인대로 정치훈=PM, 박진환=백엔드, 주정원=프론트엔드, 남성수=발표다. 익명의 여자 전학생이 네 사람을 전부 알아간 뒤 마지막 밤에 한 명을 직접 선택한다.

`/` → CUT 01~18 공통 이야기 → CUT 19 자유 선택 → CUT 20 개별 엔딩 → `/team.html` 실제 팀 소개. 예전 `/play.html`과 `?route=이름`도 공통 이야기부터 시작한다. 사이트 랜딩은 없다.

## 편집 파일

| 파일 | 역할 |
| --- | --- |
| `public/team.js` | 사용자 확정 역할, 기존 프로필 정보, 캐릭터 요약 |
| `public/saju.js` | 실제 사주 점수 조회·검증, 회차 데이터와 노트·대사 생성 |
| `public/scenario.js` | 19개 공통 컷과 CUT 20의 4개 엔딩 대사 |
| `public/characters.js` | 이름별 AI 초상화 경로 |
| `public/story.js` | 대본을 Monogatari 라벨·Choice·Function·Message로 컴파일 |
| `public/game.js` | 엔진 초기화, 호감도 HUD, CUT 진행 표시, 저장 UI |
| `public/index.html`, `public/play.css` | 게임 화면과 프로필 해금 모달 |
| `public/team.html`, `public/team-page.js`, `public/team.css` | 실제 사진·팀원 소개·프로젝트·GitHub 링크 |
| `scripts/export-scenario.js` | 실제 플레이 대사를 검토용 Markdown으로 내보내기 |

컷의 `lines`는 `인물ID 대사` 형식이다. `you`는 나, `n`은 지문, `system`은 공지다. 역할을 바꾸면 `team.js`와 관련 대사를 함께 수정한다. 대본을 고친 뒤 `node scripts/export-scenario.js`로 문서도 갱신한다.

각 일상 선택의 `affinity`는 `{인물ID: 증가량}`이다. 선택 기록은 `storage.choices`에 저장하고 이 기록에서 호감도를 다시 계산하므로 동일 콜백이 반복돼도 중복 가산되지 않는다. `onRevert`는 해당 선택을 지우고 다시 계산한다. 모든 반응 라벨은 같은 `CutXXAfter`로 합류한다. 프로필은 Monogatari의 되돌릴 수 있는 Function과 Message 액션으로 해금한다.

CUT 19의 네 선택에는 조건이나 호감도 경계를 두지 않았다. 선택한 ID에 해당하는 CUT 20으로만 분기한다. 최종 호감도가 0이어도 누구나 선택할 수 있다. 엔딩 대사를 읽은 뒤 클릭하면 선택한 사람을 표시하는 실제 팀 소개 화면으로 이동한다.

## 저장

공식 Monogatari 2.8.0이 타이핑·선택·분기·되감기·대사록·저장/불러오기를 실행한다. 저장 공간은 `ASPS_TEAM04_saju_v2`이고 이전 대본 저장은 그대로 보관된다. 이야기를 처음부터 시작하면 선택 기록·호감도·프로필 해금·최종 선택·사주 노트를 모두 비운다. Supabase는 클라우드 세이브 용도가 아니다.

## 실제 사주 데이터

`team.js`의 일주와 `sajuScene`은 인물별 창작 모티프와 프로필에 반영한다. CUT 03의 `sajuNote`가 네 이름을 `/api/team`에 전달한다. 서버 응답에서 12개의 방향별 결과가 네 사람 사이의 모든 조합인지, 중복·누락·비대칭은 없는지, `saju_score`가 0~100의 유한한 숫자인지 검증한다. 검증된 여섯 조합만 내림차순으로 정렬하고 표시할 때 소수점 한 자리로 반올림한다. 종합 `match_score`나 그 등급을 사주 점수로 사용하지 않는다.

노트는 Monogatari Message, 조회는 비동기 Function 액션이다. `storage.saju`에 해당 회차의 원점수·노트·대사를 저장하고 `{{saju.summary}}`, `{{saju.teamwork}}`로 CUT 03과 CUT 16에 넣는다. 동점 최고 조합은 모두 이름을 표시한다. 되감거나 저장을 불러와도 조회를 반복하지 않으며 새 회차에서만 최신 값을 가져온다. 클라이언트 조회는 최대 10초로 제한하고 실패·불완전 데이터에는 점수 없는 대사로 진행한다. 주인공의 사주는 생성하지 않으며 최종 네 선택은 언제나 열려 있다.

## 이미지

- [4인 AI 초상화와 실제 프롬프트](character-art-prompts.md): 사용자가 제공한 인물별 사진을 바탕으로 내장 image_gen으로 생성했다. 게임에서는 `*-anime.png`, 마지막 팀 소개에서는 제공된 원본 사진을 사용한다.
- [게임 배경 시트와 실제 프롬프트](team04-background-prompt.md): 아침 캠퍼스, 낮 프로젝트 룸, 라운지, 밤 프로젝트 룸의 2×2 시트. `scene: 0~3`에 대응한다.

## 검증

`npm run build`는 정적 진입점·사진·배경·공식 엔진 해시를 검증한다. `npm test`는 512개 선택/엔딩 조합, 동일 지점 합류, 자유 최종 선택, 호감도 복원, 프로필 해금/되돌리기, 역할·사진 매핑, 팀 페이지 동작 및 서버 API를 검증한다.

실제 Chromium 검증:

```sh
# 별도 터미널에서 PORT=3012 npm start
python3 scripts/verify-monogatari.py --url http://127.0.0.1:3012
```

Playwright와 Chromium이 필요하다. 이 검증은 CUT 01~20 네 번 완주, 네 개의 엔딩·프로필, 선택 시점 저장/불러오기, 복원 뒤 되감기·호감도 표시·재시작, PC/모바일 레이아웃, 실제 팀 소개 및 Supabase API 준비 상태를 확인한다.

## 레퍼런스

- 사용자 제공 20컷 시나리오가 현재 플롯의 기준이다.
- [KwonSeami/datingsim](https://github.com/KwonSeami/datingsim): 배경·인물·하단 대화창 구성을 참고했으며 대본·코드·아트워크를 복사하지 않았다.
- [Monogatari v2.8.0](https://github.com/Monogatari/Monogatari/releases/tag/v2.8.0): 공식 브라우저 번들과 MIT 라이선스를 `public/vendor/monogatari/`에 고정했고 해시는 `manifest.json`에 기록했다.
