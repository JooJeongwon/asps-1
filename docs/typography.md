# 코코네 · 로판 타이포그래피

현대 캠퍼스 미연시를 로맨스 소설처럼 읽을 수 있도록 표지, 대사, 조작부를 구분한다. 게임과 엔딩의 팀 소개 페이지가 `public/typography.css`를 함께 사용한다.

| 용도 | 서체 | 적용 |
| --- | --- | --- |
| 제목·헤드·인물 이름 | Hahmlet Bold 700 | 표지 제목, 챕터, 선택 카드 이름, 화자, 설정·저장 화면 제목, 사주 노트 제목, 팀 소개 제목 |
| 본문·대사 | 마루부리 Regular 400 | 대화, 대사록, 프로필, 프로젝트 설명, 사주 노트 |
| 강조·선택지 | 마루부리 SemiBold 600 | 표지 부제, 대화 선택지, 시작·역할 공개 버튼 |
| 메뉴·보조 정보 | 고운돋움 Regular 400 | 퀵 메뉴, 설정·입력, 진행 표시, 역할·태그, 사주 점수 |
| 영문 장식 | Cormorant Garamond SemiBold 600 | COCONE, TEAM 01 표지 표기, 엔딩 영문 표제와 링크 |

대사는 PC 27px, 세로 모바일 23px, 가로 모바일 21px로 표시한다. 대사 자간은 -0.015em, 표지 제목은 -0.045em으로 조정하고 한글 단어 단위 줄바꿈을 사용한다. 짧은 화면에서는 표지 제목을 한 줄로 배치해 하단 대화창과 겹치지 않게 한다. 숫자는 진행·사주 점수에서 `tabular-nums`를 사용한다.

서체 파일은 `public/assets/fonts/`에 포함하며 외부 폰트 CDN에 접속하지 않는다. 제목과 본문 서체를 미리 불러오고, `font-display: swap`으로 로딩 중에도 글자를 표시한다. 한글이 없는 글리프는 마루부리와 시스템 서체로 이어진다. 원본의 실제 굵기를 사용하고 합성 굵기·기울임은 적용하지 않는다.

## 출처와 재배포

- [Hahmlet — Hypertype](https://github.com/hyper-type/hahmlet): Google Fonts 배포 TTF의 Bold 700을 WOFF2로 압축했다. 글리프를 제거하거나 윤곽을 수정하지 않았다.
- [마루부리 — 네이버](https://hangeul.naver.com/font): 네이버 공식 CDN의 Regular·SemiBold WOFF2를 그대로 포함했다. [공식 라이선스 안내](https://help.naver.com/service/30016/contents/18088?osType=PC&lang=ko).
- [고운돋움 — 류양희](https://github.com/yangheeryu/Gowun-Dodum): Google Fonts 배포 Regular 400 TTF를 WOFF2로 압축했다.
- [Cormorant — Christian Thalmann](https://github.com/CatharsisFonts/Cormorant): Google Fonts 배포 Garamond SemiBold 600 TTF를 WOFF2로 압축했다.

각 저작권 안내와 SIL OFL 1.1 전문은 서체 옆의 `*-OFL.txt`에 포함한다. `manifest.json`은 다운로드 URL, 원본 보존 여부, 글리프 수, 파일 크기와 SHA-256을 기록한다. TTF의 WOFF2 변환에는 FontTools와 Brotli를 사용했으며 서비스 실행·배포에 Python 설치는 필요하지 않다.

`npm run build`는 서체 파일의 해시와 라이선스 파일을 확인한다. 브라우저에서는 웹폰트 실제 사용, 모바일 줄바꿈, 선택 카드·대화창 간격, 설정·저장 화면과 엔딩 본문을 확인한다.
