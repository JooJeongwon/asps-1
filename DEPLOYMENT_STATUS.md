# 운영 반영 상태

2026-09-11 18:19 KST 기준 Supabase 수입과 Vercel 운영 배포 완료.

- 공개 주소: https://asps-1.vercel.app/#blind
- Supabase 프로젝트: `fshzxttsszmioqmhtlvt`
- 데이터 버전: `v2.1-revised-de8cf0e0ed398651` (김찬영 수정본)
- 실행 코드 커밋: `7ec2813`
- Vercel 배포: `dpl_5BzLeR2cf4ddk2HHGYURTyJcgJpP`, READY, 운영 도메인 승격 완료
- GitHub 소스: `codex/supabase-compatibility` 브랜치. `main`은 자동 병합하지 않았다. 후속 수정은 이 브랜치의 변경을 기준으로 진행한다.

## 검증 결과

- 실제 Supabase: 26명, 325개 고유 조합, 650개 양방향 조회.
- 모든 조합의 4개 지표를 엑셀 추출본과 대조. REST 숫자 직렬화에 따른 최대 차이 `5.684341886080802e-14`, 허용 오차 `1e-10` 이내.
- 테이블과 뷰의 `anon`, `authenticated` 직접 SELECT 권한 없음. 서버 `service_role` 조회 가능.
- 공개 사이트의 status, highlight, people, team, match API 모두 HTTP 200. status는 `configured: true`, people은 26명, 팀은 12개 양방향 결과.
- 공개 API를 연결한 DOM 실행에서 팀 카드 6개, 블라인드 `80.3`, 기본 선택 궁합 `75.5`, LIVE RESULT 문구 확인.
- 잘못된 자기 조합은 400. `.env.local`, `private/data.json`은 404.
- 자동 테스트 13개와 CSS 빌드 통과. 임시 PostgreSQL에서 제약 조건·RLS·반복 수입 검증 통과.

브라우저 도구 실행 오류로 실제 브라우저 스크린샷 및 시각적 레이아웃 검사는 수행하지 못했다. DOM 실행 검증을 시각적 검사로 간주하지 않는다.

서버 키는 Vercel의 production/preview 환경에 저장했고 DB 비밀번호는 로컬 `.env.local`에만 있다. 키·비밀번호·개인 데이터 seed는 Git과 배포 소스에서 제외했다. 로컬 DB URL에 남아 있던 비밀번호 자리표시자의 대괄호를 제거해 연결 문제를 해결했다.
