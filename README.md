# 연분 · ASPS 사주 로맨스 비주얼 노벨

접속하면 Monogatari 2.8.0 게임이 곧바로 시작된다. 첫 화면의 캐릭터에서 정치훈·주정원·박진환·남성수를 선택하면 해당 인물의 대화로 이어진다. 별도의 랜딩페이지나 시작 버튼은 없다. 사용자가 제공한 네 장의 사진을 AI로 애니메이션 미남 캐릭터로 변환해 이름별로 연결했다. [개별 이미지와 생성 프롬프트](docs/character-art-prompts.md)를 확인할 수 있다.

현재 대본은 교체 예정인 프롤로그다. 인물별 3회 선택과 2개 엔딩, 총 32개 선택 경로와 8개 엔딩을 제공한다. 저장·불러오기·되감기·대사록·자동재생은 Monogatari 기본 기능이다. 하단 **인물 선택**으로 현재 회차를 끝내고 다른 인물을 고를 수 있다. 저장 파일은 현재 사이트 주소와 브라우저의 LocalStorage에 보관된다.

사주 일주·MBTI·KAI는 기존 원본 데이터를 사용하며 대사·사건·감정·엔딩은 창작이다. Supabase의 26명 궁합 API는 그대로 유지한다. 현재 게임의 선택 점수는 실제 궁합 점수와 별개다. [대본 수정·사진 매핑·엔진 구성](docs/design-reference.md)을 참고한다.

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

Node 22 이상. 공식 Monogatari 브라우저 번들과 라이선스는 `public/vendor/monogatari/`에 고정되어 있어 별도 엔진 설치가 필요 없다. 게임의 진입점은 `/` 하나이며 `/?route=정치훈`처럼 인물별 직접 링크도 지원한다. 기존 `/play.html`은 같은 게임으로 연결된다. `npm run build`는 정적 게임 파일·사진·엔진 해시를 검증한다. 공식 엔진 번들은 이미 브라우저용으로 빌드되어 있어 별도 컴파일이 필요 없다. Vercel은 `public/`과 `api/*.js`를 배포한다. 기존 Cloudflare 배포가 필요한 경우 `npm run cf:dev`를 쓰고 `.dev.vars`에 서버 키를 설정한다. D1은 더 이상 사용하지 않는다.

## 관리

Supabase Table Editor의 `gcs_pairs`에서 결과를 관리한다. `match_group`은 원점수 76/68 경계로 자동 생성된다. 수정 결과는 다음 API 조회에 반영되며 자동 실시간 구독은 아니다. 참가자 프로필 변경에 따른 모델 재계산은 엑셀 재추출로 수행해야 한다. 최종 결과 DB이지 모델 학습/계산 서버는 아니다.

`GCS_DATASET_ID`로 API가 조회할 버전을 선택한다. 이름·순위·점수는 원점수 기준이다. 공동 1위가 있으면 이름순 한 조합과 공동 1위 수를 반환한다. 게임 대본에서 궁합 결과를 사용하려면 서버 키 없이 `/api/match?person=이름&match=이름`을 호출한다.

## 검증

```sh
npm run build
npm test
python3 scripts/test-database.py
# 실제 엑셀 추출본을 가진 로컬 환경에서만:
python3 scripts/test-database.py private/002_seed.sql
```

DB 검증은 임시 로컬 PostgreSQL 클러스터를 만들며 운영 DB에 접속하지 않는다. `initdb`, `pg_ctl`, `psql`이 필요하다. 건수, 양방향 조회, 실제 원본 점수 일치, 반복 수입, 등급 경계, 점수/자기조합 제약, RLS와 역할별 접근을 검사한다.

서버 테스트는 DB 장애/불완전 데이터, 필드 제한, 최고점·공동 1위, 양방향 검색·개인순위, 팀·명단, 정적 파일과 비밀 파일 비노출을 검사한다. 실제 Supabase/Vercel 연결은 해당 계정 설정 뒤 별도 확인해야 한다.
