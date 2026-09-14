# 연분: 사주 기반 로맨스 비주얼 노벨

기존 26명 궁합 조회를 유지하면서 정치훈·주정원·박진환·남성수를 각각 선택 가능한 프롤로그로 구성했다. 실제 데이터는 MBTI, 일주, KAI와 Supabase 궁합 결과이며, 아바타·대사·사건·엔딩은 별도 창작이다. 실제 인물의 외모나 감정을 재현하거나 예측하는 기능은 아니다.

## 레퍼런스

- [KwonSeami/datingsim](https://github.com/KwonSeami/datingsim): 사용자가 지정한 주 레퍼런스. 배경과 캐릭터 위에 이름표·하단 대화창을 배치하고, 타이핑·즉시 표시·이전/다음 이동·선택지의 흐름을 참고했다. 자체 데이터 모델과 컨트롤러로 구현했으며 해당 저장소의 대사, 코드, 폰트, 음원, 이미지를 복사하지 않았다.
- [Tears of Themis 공식 사이트](https://tot.hoyoverse.com/en-us/): 일러스트 중심 진입 화면과 캐릭터/이야기 탐색 구조.
- [Steam Prison Beyond the Steam 공식 소개](https://www.hunex.co.jp/steamprison/beyond/en/about.html): 인물별 루트와 여러 엔딩을 분리해 설명하는 방식.

## 구현 범위

| 대상   | 실제 원본 정보             | 프롤로그           | 에필로그 2종                             |
| ------ | -------------------------- | ------------------ | ---------------------------------------- |
| 정치훈 | ESTP · 갑진 甲辰 · KAI 102 | 비 온 뒤의 운동장  | 내일도, 같은 출발선 / 한 걸음의 여백     |
| 주정원 | ENTP · 경진 庚辰 · KAI 126 | 별이 뜨는 옥상     | 우리만 아는 별의 이름 / 접어둔 질문 하나 |
| 박진환 | ENFP · 을해 乙亥 · KAI 111 | 이어폰 한쪽의 거리 | 두 사람의 재생목록 / 다음 곡을 기다리며  |
| 남성수 | INFJ · 무진 戊辰 · KAI 103 | 책갈피에 남긴 말   | 비워둔 맞은편 자리 / 오래 남는 한 문장   |

각 루트는 세 장면, 장면별 두 선택지로 구성된다. 두 선택지는 각각 직접 다가가기(2), 천천히 알아가기(1)의 서사 점수를 가지며, 합계 5 이상은 함께하는 봄, 4 이하는 천천히 피는 봄으로 끝난다. 총 32개 경로와 8개 에필로그다. 이 점수는 사주 궁합 점수와 별개이며 게임 안에서만 사용한다. 돌아가면 해당 장면 이후 선택을 버리고 다시 계산한다. 저장/로그인/BGM/장편 후속 챕터는 현재 범위에 포함하지 않았다.

- `public/routes.js`: 네 사람의 서사 및 프로필 표시용 원본 정보.
- `public/game.js`: 타이핑, 선택, 이전 장면, 엔딩, 다시 시작, 다이얼로그 포커스.
- `public/app.js`: 기존 궁합 API와 프로필 동작, 26명 이름 자동완성.
- `public/index.html`, `public/styles.css`: 반응형 랜딩 및 플레이 화면.
- Supabase/서버 API 스키마와 데이터는 변경하지 않았다. `#blind` 앵커와 1위 결과, 팀의 6개 조합, 이름 검색을 유지한다.

## 아트워크

OpenAI 내장 `image_gen`으로 생성했다. 실존 인물 사진을 사용하지 않은 성인 창작 아바타이며 저장소에 이미지 원본을 포함했다. 개발자별 절대 경로에 의존하지 않는다.

- `public/assets/yeonbun-hero.png`: 4인 키 비주얼.
- `public/assets/yeonbun-cast.png`: 정치훈, 주정원, 박진환, 남성수 순서의 4열 초상화 시트.
- `public/assets/yeonbun-scenes.png`: 운동장, 옥상, 정류장, 도서관의 2×2 배경 시트.
- `public/assets/favicon.svg`: 코드로 제작한 간단한 브랜드 별 아이콘.

### 최종 생성 프롬프트

Hero:

```text
Use case: illustration-story. Create an original premium hand-painted anime key visual for a Korean romance visual novel about saju, five elements and four fated encounters. Wide landscape 16:9, airy refined muted lilac and rose blue-hour spring campus, cherry blossoms, distant observatory, glowing sunset and star trails. Exactly FOUR distinctly ADULT Korean men age 24-28, illustrated fictional avatars, together on the RIGHT 60 percent, waist-up, each head fully visible. Man 1 at left of group: dark chestnut short windswept hair, confident friendly smile, white tee under sage jacket. Man 2 center-front: elegant silver ash-brown side-part hair, ivory open collar shirt and charcoal knit cardigan, gentle inquisitive expression, lavender-gray eyes, folded letter in hand. Man 3 at right-front: soft auburn hair, kind lively eyes and warm smile, ivory sweater under dusty rose casual jacket. Man 4 at far right a little behind: straight black hair, slim glasses, oatmeal knit sweater and dark brown coat, thoughtful calm expression. Distinct appealing natural faces. LEFT 40 percent is almost empty pale lavender mist and light sky with no characters, allowing dark typography overlay. Bottom fades softly toward ivory. Exquisite expressive anime linework, painterly skin, romantic lighting, subtle cherry petals and pinprick stars, tasteful sophisticated visual novel promotional illustration, no harsh saturation. Original characters, no resemblance to celebrities, no text, no logos, no UI, no watermarks, no school uniforms, no sexualization.
```

Cast:

```text
Use case: illustration-story. ONE wide image, 2:1 aspect ratio, a contact sheet of EXACTLY FOUR equal-width vertical character portrait panels aligned edge-to-edge, no gaps or border, no labels. Premium Korean romance visual novel hand-painted anime art. All four subjects are distinctly ADULT Korean men, 24-28, fictional avatars. Frame each as head-and-chest portrait, full hair and face visible, centered within own quarter; anatomically correct, distinct refined faces, luminous eyes. PANEL 1 far left: short dark chestnut windswept hair, confident friendly smile, white tee and sage green casual jacket, softly painted sage spring garden background. PANEL 2 second: silver ash-brown side-part hair, ivory open collar shirt and charcoal cardigan, lavender gray eyes, a gentle inquisitive smile, folded letter in hand, lavender blue-hour observatory background. PANEL 3 third: soft auburn hair, warm lively eyes and welcoming smile, ivory sweater under dusty rose casual jacket, peach sunset petals behind. PANEL 4 far right: neat black hair, fine round glasses, oatmeal knit sweater and dark brown coat, thoughtful calm gentle expression, golden twilight library background. Matching detailed delicate linework, subtle watercolor shading, soft romantic atmosphere. This is a four-column portrait sprite sheet; no person crossing into another column. No text, letters, logos, watermarks, UI. No resemblance to real celebrities, no school uniforms.
```

Scenes:

```text
Use case: illustration-story. Asset type: original background sprite sheet for a Korean romance visual novel. Create one landscape 16:9 image divided into EXACTLY FOUR equal rectangular panels in a precise 2 by 2 grid, edge to edge, no gaps, borders, labels or text. Each panel itself is a wide 16:9 scenic illustration, with NO people, NO characters anywhere. Top left: peaceful university running track after spring rain, wooden bench by green trees, small puddles reflecting a soft afternoon sun. Top right: university rooftop terrace at blue hour, railing and small telescope on right, a few stars emerging above distant hills and a lavender sky. Bottom left: quiet Korean neighborhood bus stop beside a cherry blossom walking path at peach sunset, a simple empty bench, petals, no readable signs. Bottom right: warm intimate library reading room with tall wooden bookshelves, long table by a window, two empty chairs, golden afternoon light. Consistent refined hand-painted anime background style, delicate textures, romantic muted lavender sage peach ivory palette, realistic perspective, beautiful atmospheric depth. Foreground center of each panel open for a character overlay. This is a 2x2 background sprite sheet for CSS display. No humans, no animals, no text, no logos, no watermark.
```

## 검증

`npm test`와 `npm run build`를 실행한다. 자동 테스트는 API·비밀 파일 접근 차단·조회 오류·HTML 이스케이프·32개 선택 경로·8개 엔딩·선택 되돌리기·초기화·프로필 연결·타이핑 중 닫기를 확인한다. 실제 Chromium에서 PC와 모바일 레이아웃, 키보드/Escape, 모든 루트와 실 Supabase 궁합 조회를 별도로 확인한다.

### 실행 결과 (2026-09-14)

- `npm test`: 16개 테스트 통과. 루트 테스트 안에서 32가지 선택 경로와 8개 엔딩을 검증했다.
- `npm run build`, `git diff --check`: 통과.
- Chromium 151: 데스크톱에서 4명 × 2개 엔딩 완료, 320/375/390/768px에서 프롤로그 완료 및 가로 넘침 없음.
- 키보드로 선택, 타이핑 건너뛰기, Escape 닫기, 프로필에서 플레이 진입 및 포커스 복귀 확인. 브라우저 실행 오류 0건.
- 로컬 개발 서버 → 실제 Supabase: 26명 목록, 팀 6개 조합, 전체 최고 궁합 80.3, 주정원 × 정치훈 75.5 확인.
