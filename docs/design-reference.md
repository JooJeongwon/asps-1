# 연분 · Monogatari 게임 구성

## 실행 흐름

`/` 접속 → 엔진 자동 초기화 → 네 사람의 사진 선택 → 선택한 인물의 대화 → 3회 선택 → 에필로그. 사이트 헤더·푸터·홍보 랜딩·프로필 팝업은 제거했다. 게임이 전체 화면을 사용한다. `/?route=이름`은 해당 인물부터 시작하며 `/play.html`도 동일한 진입점으로 연결된다.

엔진의 `ShowMainScreen: false`로 별도 타이틀 메뉴를 건너뛴다. 하단 메뉴의 **인물 선택**은 Monogatari의 종료 확인과 회차 초기화를 이용한다. 저장·불러오기·되감기·대사록·자동재생·넘기기 역시 실제 엔진 기능이다. 저장 기록은 같은 주소·브라우저의 LocalStorage에만 보관된다.

## 파일 역할

| 파일 | 수정할 내용 |
| --- | --- |
| `public/index.html` | 게임 진입점과 네이티브 엔진 화면 |
| `public/characters.js` | 이름 → 사진 파일 매핑 |
| `public/routes.js` | 교체 예정인 인물별 대사·선택지·반응·엔딩, 사주 모티프 |
| `public/story.js` | 루트를 Monogatari Choice·Jump·Conditional로 변환 |
| `public/game.js` | 엔진 설정, 사진·배경 등록, 초기화, 진행 표시 |
| `public/play.css` | 게임·사진·대화창·저장 화면의 PC/모바일 배치 |
| `public/vendor/monogatari/` | 공식 2.8.0 번들, MIT 라이선스, 버전/해시 기록 |

## 시나리오 교체

`public/routes.js`에서 인물을 찾고 아래 필드를 수정한다. 사진을 바꾸지 않고 대본만 교체할 수 있다.

- `title`, `motif`: 이야기 제목과 일주 모티프.
- `scenes[].location`: 장면 위치.
- `scenes[].narration`, `line`: 지문과 인물의 대사.
- `scenes[].choices[].text`, `reply`: 선택지와 선택 후 응답.
- `scenes[].choices[].affinity`: 서사 분기에 사용하는 선택 점수.
- `endings.close`, `endings.slow`: 각 엔딩의 `title`과 `copy`.

장면 개수를 변경하면 진행 표시와 선택 저장 배열도 자동으로 맞춰진다. 기본 엔딩 경계는 `ceil(장면 수 × 1.5)`이며 인물 객체에 `endingThreshold`를 추가해 바꿀 수 있다. 현재 세 장면에서 선택지는 2점/1점이며 합계 5점 이상이면 `close`, 이하면 `slow`다. 실제 사주 궁합 점수와는 별개다. 대사와 감정은 임시 창작 시나리오다.

대본 구조나 장면 순서를 크게 바꾸면 기존 저장 파일은 이전 대본의 위치를 가리킬 수 있다. 이런 변경을 배포할 때에는 `game.js`의 `Name`을 새 저장 공간 이름으로 변경한다. 단순 사진·문구 교체에는 변경할 필요가 없다.

## 이름별 사진

사용자가 제공한 원본 사진을 변경 없이 복사했다. 한글 파일명 정규화와 공백으로 인한 배포 오류를 피하도록 저장소 파일명만 영문으로 바꿨다. 이름으로 매핑하므로 루트 배열 순서를 바꿔도 사진이 섞이지 않는다. 선택 화면과 대화 장면에서 같은 매핑을 사용한다.

| 인물 | 제공 파일명 | 저장소 파일 (`public/assets/characters/`) | 원본 정보 |
| --- | --- | --- | --- |
| 정치훈 | 정치훈.jpeg | jeong-chihoon.jpeg | ESTP · 갑진 甲辰 · KAI 102 |
| 주정원 | 주정원.jpeg | joo-jeongwon.jpeg | ENTP · 경진 庚辰 · KAI 126 |
| 박진환 | 박진환 .jpg | park-jinhwan.jpg | ENFP · 을해 乙亥 · KAI 111 |
| 남성수 | 남성수.png | nam-seongsu.png | INFJ · 무진 戊辰 · KAI 103 |

사진은 원래 비율을 유지해 표시한다. 이전에 생성한 가상 캐릭터와 키 비주얼 이미지는 제거했다. `assets/yeonbun-scenes.png`는 기존의 인물 없는 운동장·옥상·정류장·도서관 배경 시트다.

## 레퍼런스와 엔진

- [KwonSeami/datingsim](https://github.com/KwonSeami/datingsim): 사용자가 지정한 레퍼런스. 배경·인물·하단 대화창과 선택지의 게임 화면 구성을 참고했다. 해당 저장소의 대본·코드·아트워크는 복사하지 않았다.
- [Monogatari v2.8.0](https://github.com/Monogatari/Monogatari/releases/tag/v2.8.0): 공식 브라우저 번들을 저장소에 고정했다. 해시는 `public/vendor/monogatari/manifest.json`에 기록하며 빌드와 테스트에서 검증한다.
- [선택지 콜백](https://github.com/Monogatari/Monogatari/blob/v2.8.0/docs/script-actions/choices.md): `onChosen`으로 선택을 기록하고 `onRevert`로 되돌린다. 응답은 독립 라벨로 이동해 저장 후 되감기도 동작한다.

Supabase 스키마·데이터와 서버 API는 변경하지 않았다. 게임은 서버 비밀 키를 받지 않는다. 궁합 데이터는 나중에 대본에서 `/api/*`를 통해 사용할 수 있다.

## 검증

```sh
npm run build
npm test
# 별도 터미널에서 PORT=3010 npm start 실행 후:
python3 -m venv .venv-playwright
.venv-playwright/bin/pip install playwright
.venv-playwright/bin/playwright install chromium
.venv-playwright/bin/python scripts/verify-monogatari.py --url http://127.0.0.1:3010
```

Node 테스트는 API와 비밀 파일 접근 차단, 루트 자동 실행, 사진 매핑, 32개 선택 경로·8개 엔딩, 선택 복원, 정적 파일 별칭, 공식 엔진 해시를 확인한다. Chromium 검증은 실제 엔진에서 모든 경로를 플레이하고, 저장/불러오기·복원 후 되감기·인물 선택 복귀·네 장의 사진 로딩·PC/모바일 레이아웃·실 Supabase API를 확인한다. 브라우저 검증의 API 항목에는 로컬 Supabase 환경변수 설정이 필요하다.

## 배경 이미지 생성 기록

인물이 없는 임시 배경만 OpenAI `image_gen`으로 생성했다. 다음은 배경 시트 프롬프트다.

Scenes:

```text
Use case: illustration-story. Asset type: original background sprite sheet for a Korean romance visual novel. Create one landscape 16:9 image divided into EXACTLY FOUR equal rectangular panels in a precise 2 by 2 grid, edge to edge, no gaps, borders, labels or text. Each panel itself is a wide 16:9 scenic illustration, with NO people, NO characters anywhere. Top left: peaceful university running track after spring rain, wooden bench by green trees, small puddles reflecting a soft afternoon sun. Top right: university rooftop terrace at blue hour, railing and small telescope on right, a few stars emerging above distant hills and a lavender sky. Bottom left: quiet Korean neighborhood bus stop beside a cherry blossom walking path at peach sunset, a simple empty bench, petals, no readable signs. Bottom right: warm intimate library reading room with tall wooden bookshelves, long table by a window, two empty chairs, golden afternoon light. Consistent refined hand-painted anime background style, delicate textures, romantic muted lavender sage peach ivory palette, realistic perspective, beautiful atmospheric depth. Foreground center of each panel open for a character overlay. This is a 2x2 background sprite sheet for CSS display. No humans, no animals, no text, no logos, no watermark.
```
