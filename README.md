# 두근두근 코코네 · TEAM 01

《두근두근 코코네: 운명의 팀원을 선택하세요》. 네 명을 모두 만나고 마지막에 단 한 명을 선택한다. 단, 선택한 뒤에도 팀플에서는 탈출할 수 없다.

접속하면 Monogatari 2.8.0으로 코코네 강의실 문 앞 프롤로그가 바로 시작된다. A 박진환(왕), B 주정원(츤데레), C 정치훈(프랑스 귀족), D 남성수(운명 연구자)를 원하는 순서로 만나고, 각 인물과 다섯 번의 2지선다 대화를 진행한다. 모든 대답은 다음 질문으로 합류한다.

처음 세 인물은 각자의 퇴장 대사 뒤 만남 선택 화면으로 돌아간다. 네 번째 인물은 최종 선택을 안내한다. 만난 카드는 ‘대화 완료’로 표시한다. 최종 한 명을 자유롭게 선택하면 개별 엔딩과 네 명이 다시 등장하는 공통 팀플 엔딩을 보고, `/team.html`에서 실제 역할을 공개한다.

[전체 재구성 대본](docs/scenario-kokone.md) · [엔진 및 편집 안내](docs/design-reference.md) · [캠퍼스 이미지와 생성 프롬프트](docs/campus-art-prompts.md)

목표는 인물당 대화 약 40초, 전체 약 4분 40초다. 강제 타이머 없이 플레이어가 읽고 선택하며 사주 노트 열람 시간에 따라 달라진다. 실제 역할은 정치훈 PM, 박진환 백엔드, 주정원 프론트엔드, 남성수 발표로 유지하고, 게임 속 과장된 캐릭터와 마지막 역할 공개 문구를 연결한다.

현대 캠퍼스 이미지, 교복·니트 차림의 AI 인물 4장, 큰 인물과 PC 27px·모바일 23px 대사를 유지한다. 원본 인물 사진은 공개 배포에 포함하지 않는다. 이번 변경은 대본과 진행 구조를 바꾸며 별도 음원은 추가하지 않았다.

선택·되감기·대사록·저장·불러오기는 공식 엔진이 처리한다. 새 분기는 `ASPS_TEAM01_kokone_v3` 저장 공간을 사용하고 이전 20컷 대본의 저장을 그대로 보관한다. 대화 답변, 만남 완료 순서, 최종 선택, 사주 노트를 저장하고 새 회차에는 초기화한다.

성수의 다섯 번째 대화 뒤 `/api/team`으로 실제 사주 여섯 조합을 조회한다. `saju_score`만 사용하고 종합 점수와 혼합하지 않는다. ‘97.8점’은 고백용 예시라는 대사로 구분하고 실제 노트에는 서버 점수만 넣는다. 주인공의 생년월일·사주는 설정하지 않는다. 조회 실패 시 점수를 만들지 않고 이야기를 계속하며 새 회차에서 다시 조회한다.

## 대상

- 웹사이트: https://asps-1.vercel.app
- Supabase: https://supabase.com/dashboard/project/fshzxttsszmioqmhtlvt
- 선택 데이터: 김찬영 사주 수정 V2.1 엑셀, `v2.1-revised-de8cf0e0ed398651`
- 저장: 26명 이름/ID, 325개 조합의 점수. 생년월일, 원본 프로필, 학습용 실제 체감은 저장하지 않는다.

## 최초 설정

1. Supabase SQL Editor에서 `supabase/migrations/202609110001_gcs.sql`을 한 번 실행한다. 동명 테이블이 이미 있다면 먼저 기존 구조를 확인한다.
2. 로컬의 `private/002_seed.sql`을 실행한다. 실제 개인 데이터이므로 GitHub에는 포함하지 않는다. 같은 데이터 버전으로 다시 실행하면 해당 버전의 수동 점수 변경을 엑셀 값으로 덮어쓴다.
3. Vercel `asps-1`의 Settings → Environment Variables에서 `.env.example`의 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GCS_DATASET_ID`를 설정한다. `DATABASE_URL`은 로컬 SQL 반영용이며 웹사이트에는 필요 없다.
4. 이 변경을 배포한 후 `/api/status`가 `{"configured":true}`인지 확인한다. `/api/people`, `/api/team`, `/api/match`, `/api/highlight`도 조회한다.

API 키는 서버에서만 사용한다. `SUPABASE_SERVICE_ROLE_KEY`에는 legacy `service_role` JWT 또는 `sb_secret_` 키를 넣을 수 있다. 브라우저용 공개 키는 이 구성에서 사용하지 않는다. RLS와 권한 설정으로 `anon`/`authenticated`의 테이블·뷰 접근을 차단하며 서버만 결과를 조회한다. API는 사이트에 필요한 이름과 점수만 반환한다. [Supabase API 키 설명](https://supabase.com/docs/guides/getting-started/api-keys)

## 로컬 실행

```sh
npm ci
cp .env.example .env.local  # 파일이 없을 때만 실행
# .env.local의 서버 API 키를 설정
npm run dev
```

Node 22 이상. 공식 Monogatari 브라우저 번들과 라이선스는 `public/vendor/monogatari/`에 고정되어 있어 별도 엔진 설치가 필요 없다. 게임의 진입점은 `/`이며 기존 `/play.html`도 같은 게임으로 연결된다. 과거 `?route=이름` 링크로 들어와도 코코네 프롤로그에서 시작한다. `npm run build`는 정적 게임 파일·사진·엔진 해시를 검증한다. 공식 엔진 번들은 이미 브라우저용으로 빌드되어 있어 별도 컴파일이 필요 없다. Vercel은 `public/`과 `api/*.js`를 배포한다. 기존 Cloudflare 배포가 필요한 경우 `npm run cf:dev`를 쓰고 `.dev.vars`에 서버 키를 설정한다. D1은 더 이상 사용하지 않는다.

## 관리

Supabase Table Editor의 `gcs_pairs`에서 결과를 관리한다. `match_group`은 원점수 76/68 경계로 자동 생성된다. 수정 결과는 다음 API 조회에 반영되며 자동 실시간 구독은 아니다. 참가자 프로필 변경에 따른 모델 재계산은 엑셀 재추출로 수행해야 한다. 최종 결과 DB이지 모델 학습/계산 서버는 아니다.

`GCS_DATASET_ID`로 API가 조회할 버전을 선택한다. 이름·순위·점수는 원점수 기준이다. API의 종합 최고점은 공동 1위가 있으면 이름순 한 조합과 공동 1위 수를 반환한다. 게임의 사주 노트는 `public/saju.js`에서 네 명의 12개 방향별 결과를 검증하고 여섯 조합으로 묶으며, 사주 최고점이 동점이면 모든 조합을 대사에 표시한다. DB 수정 결과는 새 게임 회차에서 반영된다.

## 검증

```sh
npm run build
npm test
node scripts/export-scenario.js
# 실행 중인 개발 서버의 실제 엔진 검증 (Python Playwright 필요):
python3 scripts/verify-monogatari.py --url http://127.0.0.1:3017
python3 scripts/test-database.py
# 실제 엑셀 추출본을 가진 로컬 환경에서만:
python3 scripts/test-database.py private/002_seed.sql
```

DB 검증은 임시 로컬 PostgreSQL 클러스터를 만들며 운영 DB에 접속하지 않는다. `initdb`, `pg_ctl`, `psql`이 필요하다. 건수, 양방향 조회, 실제 원본 점수 일치, 반복 수입, 등급 경계, 점수/자기조합 제약, RLS와 역할별 접근을 검사한다.

서버 테스트는 DB 장애/불완전 데이터, 필드 제한, 최고점·공동 1위, 양방향 검색·개인순위, 팀·명단, 정적 파일과 비밀 파일 비노출을 검사한다. 실제 Supabase/Vercel 연결은 해당 계정 설정 뒤 별도 확인해야 한다.
