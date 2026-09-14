# 현대 사립학교 캠퍼스 아트

사용자 요청인 “현대적인 학교, 상속자들 느낌”을 고급 사립학교 청춘 드라마 분위기로 해석했다. 교복 블레이저·니트·셔츠와 벽돌·석재·통유리 캠퍼스를 사용한다. 참고는 [SBS 공식 작품 페이지](https://programs.sbs.co.kr/drama/theheirs)와 [교복 앙상블 사진 소개](https://news.sbs.co.kr/amp/news.amp?news_id=N1002038001)이며, 배우 얼굴이나 드라마의 실제 이미지를 게임에 사용하지 않았다.

## 제작 및 적용

- 생성 모드: 내장 `image_gen` 도구. 인물 4장은 기존 이름별 AI 초상화를 참조한 편집, 배경 4장은 신규 생성, 표지는 완성한 인물 4장을 참조한 신규 구도 편집이다.
- 선택된 PNG 원본은 작업공간 `private/campus-originals/`에 보관하고, 웹 배포용은 WebP 품질 88로 변환했다. 웹에 공개되는 인물은 AI 일러스트만 사용한다.
- `public/characters.js`의 이름별 매핑은 게임·프로필·최종 선택·팀 소개에서 공통으로 쓴다. 기존 저장과 호환되도록 내부 장면 ID와 대본 액션 수를 유지했다.
- `public/campus.css`는 네이비·화이트·버건디, 단정한 사각 프레임을 사용한다. 대사 글자는 PC 27px, 모바일 23px, 가로 모바일 21px. 작은 대화창과 크게 보이는 인물 구도를 유지한다.

## 배포 파일

| 용도 | 파일 |
| --- | --- |
| 정치훈 · PM | [jeong-chihoon-campus.webp](../public/assets/characters/jeong-chihoon-campus.webp) |
| 박진환 · 백엔드 | [park-jinhwan-campus.webp](../public/assets/characters/park-jinhwan-campus.webp) |
| 주정원 · 프론트엔드 | [joo-jeongwon-campus.webp](../public/assets/characters/joo-jeongwon-campus.webp) |
| 남성수 · 발표 | [nam-seongsu-campus.webp](../public/assets/characters/nam-seongsu-campus.webp) |
| 학교 정문 · 아침 | [campus-gate.webp](../public/assets/campus-gate.webp) |
| 프로젝트실 · 낮 | [campus-project.webp](../public/assets/campus-project.webp) |
| 카페테리아 · 오후 | [campus-lounge.webp](../public/assets/campus-lounge.webp) |
| 프로젝트실 · 밤 | [campus-night.webp](../public/assets/campus-night.webp) |
| 네 사람의 캠퍼스 표지 | [campus-cover.webp](../public/assets/campus-cover.webp) |

## 실제 생성 프롬프트

### 정치훈 · PM

참조: jeong-chihoon-rofan.webp

```text
Use case: identity-preserve. Edit the provided male portrait into a modern elite private-school campus romance character illustration. Input image 1 is the edit target: preserve this exact person's recognizable illustrated face, hair, skin tone and adult age; do not replace him with a celebrity. Replace ALL fantasy costume, ornaments and background. Style: polished hand-painted Korean romance webtoon / otome game illustration, semi-realistic illustrated skin and expressive refined eyes, delicate clean contours and hair brushwork, beautiful modern K-drama cinematography; visibly illustrated, NOT a photo. One handsome adult Korean man. Composition: portrait 2:3, waist-up standing, full hair with 6% headroom, face in upper quarter, face large enough to read, broad shoulders and upper torso clearly visible, both sides of body inside frame. Do not retain the hand-under-chin pose: create the specified natural standing pose. Setting: an expensive but realistic contemporary Korean private academy with glass corridors, limestone and dark brick, bright windows, tidy green lawns, a few late-summer trees, soft shallow depth of field. Warm early-September natural daylight, refined navy/ivory/burgundy palette and fresh greenery. No palace, medieval clothing, brooches, gilded embroidery, crowns, rose walls, magic, star particles, coats of arms or school logos. No writing, captions, watermark, border or panels. Costume and character: calm confident leader; retain the reference's strong jaw, straight dark fringe and soft eyes; clean tailored midnight navy blazer, white oxford shirt and restrained burgundy striped tie, fine dark trousers, holding one slim project folder low beside his waist; shoulders relaxed, face toward viewer
```

### 박진환 · 백엔드

참조: park-jinhwan-rofan.webp

```text
Use case: identity-preserve. Edit the provided male portrait into a modern elite private-school campus romance character illustration. Input image 1 is the edit target: preserve this exact person's recognizable illustrated face, hair, skin tone and adult age; do not replace him with a celebrity. Replace ALL fantasy costume, ornaments and background. Style: polished hand-painted Korean romance webtoon / otome game illustration, semi-realistic illustrated skin and expressive refined eyes, delicate clean contours and hair brushwork, beautiful modern K-drama cinematography; visibly illustrated, NOT a photo. One handsome adult Korean man. Composition: portrait 2:3, waist-up standing, full hair with 6% headroom, face in upper quarter, face large enough to read, broad shoulders and upper torso clearly visible, both sides of body inside frame. Do not retain the hand-under-chin pose: create the specified natural standing pose. Setting: an expensive but realistic contemporary Korean private academy with glass corridors, limestone and dark brick, bright windows, tidy green lawns, a few late-summer trees, soft shallow depth of field. Warm early-September natural daylight, refined navy/ivory/burgundy palette and fresh greenery. No palace, medieval clothing, brooches, gilded embroidery, crowns, rose walls, magic, star particles, coats of arms or school logos. No writing, captions, watermark, border or panels. Costume and character: warm approachable developer; retain the reference's friendly fuller oval face, open broad forehead and swept side-part hair; clean charcoal blazer open over a pale lavender oxford and fine gray V-neck sweater vest, a slim navy tie slightly relaxed; carrying a closed silver laptop under one arm at waist, subtle natural smile
```

### 주정원 · 프론트엔드

참조: joo-jeongwon-rofan.webp

```text
Use case: identity-preserve. Edit the provided male portrait into a modern elite private-school campus romance character illustration. Input image 1 is the edit target: preserve this exact person's recognizable illustrated face, hair, skin tone and adult age; do not replace him with a celebrity. Replace ALL fantasy costume, ornaments and background. Style: polished hand-painted Korean romance webtoon / otome game illustration, semi-realistic illustrated skin and expressive refined eyes, delicate clean contours and hair brushwork, beautiful modern K-drama cinematography; visibly illustrated, NOT a photo. One handsome adult Korean man. Composition: portrait 2:3, waist-up standing, full hair with 6% headroom, face in upper quarter, face large enough to read, broad shoulders and upper torso clearly visible, both sides of body inside frame. Do not retain the hand-under-chin pose: create the specified natural standing pose. Setting: an expensive but realistic contemporary Korean private academy with glass corridors, limestone and dark brick, bright windows, tidy green lawns, a few late-summer trees, soft shallow depth of field. Warm early-September natural daylight, refined navy/ivory/burgundy palette and fresh greenery. No palace, medieval clothing, brooches, gilded embroidery, crowns, rose walls, magic, star particles, coats of arms or school logos. No writing, captions, watermark, border or panels. Costume and character: stylish thoughtful front-end developer; retain the reference's slim oval face and softly parted curtain hair, youthful expressive eyes; clean deep navy blazer over a cream fine-knit V-neck and light blue oxford shirt, dark slender tie; holding a plain notebook at the lower frame with one arm relaxed, friendly subtle confident smile
```

### 남성수 · 발표

참조: nam-seongsu-rofan.webp

```text
Use case: identity-preserve. Edit the provided male portrait into a modern elite private-school campus romance character illustration. Input image 1 is the edit target: preserve this exact person's recognizable illustrated face, hair, skin tone and adult age; do not replace him with a celebrity. Replace ALL fantasy costume, ornaments and background. Style: polished hand-painted Korean romance webtoon / otome game illustration, semi-realistic illustrated skin and expressive refined eyes, delicate clean contours and hair brushwork, beautiful modern K-drama cinematography; visibly illustrated, NOT a photo. One handsome adult Korean man. Composition: portrait 2:3, waist-up standing, full hair with 6% headroom, face in upper quarter, face large enough to read, broad shoulders and upper torso clearly visible, both sides of body inside frame. Do not retain the hand-under-chin pose: create the specified natural standing pose. Setting: an expensive but realistic contemporary Korean private academy with glass corridors, limestone and dark brick, bright windows, tidy green lawns, a few late-summer trees, soft shallow depth of field. Warm early-September natural daylight, refined navy/ivory/burgundy palette and fresh greenery. No palace, medieval clothing, brooches, gilded embroidery, crowns, rose walls, magic, star particles, coats of arms or school logos. No writing, captions, watermark, border or panels. Costume and character: composed observant presenter; retain the reference's broad face, full cheeks, firm jaw and dense straight dark fringe; clean muted forest green blazer over a dark fine-knit crewneck and white shirt collar, discreet watch; one hand holding a plain notebook down at waist and shoulders relaxed, soft thoughtful expression
```

### 학교 정문 · 아침

```text
Use case: illustration-story. Create one premium 16:9 landscape background for a Korean contemporary campus romance visual novel. Modern affluent private academy atmosphere, like a polished youth K-drama, but original architecture and no show branding. Painterly semi-realistic Korean webtoon background with precise architecture, softly rendered textures, natural cinematic light, clean detail and depth. Refined navy, warm white, pale oak, restrained burgundy and fresh greenery. Real present-day school, not a castle. Empty setting, NO people, no foreground characters, no text or logos or watermark, no frames or panels. Nothing magical: no golden filigree, roses covering buildings, medieval arches, brooch motifs, star particles or constellations. Camera at human eye level, spacious believable environment, background can sit behind large character portraits and a dialogue bar in the bottom quarter. Scene: morning establishing shot of an elite private school entrance at the beginning of September; a beautiful low-rise red-brick and warm limestone campus with a very modern floor-to-ceiling glass atrium joining the wings, broad neat entrance steps, gray stone paving and manicured courtyard lawns, tall green ginkgo/maple trees framing the sides, a few early autumn leaves, clear soft blue sky, crisp yet warm 9am sunlight, tasteful understated brass door handles and a small sign board with no writing. A subtle glass walkway and distant sports court. Understated expensive architecture, fresh and romantic; not European royal buildings.
```

### 프로젝트실 · 낮

```text
Use case: illustration-story. Create one premium 16:9 landscape background for a Korean contemporary campus romance visual novel. Modern affluent private academy atmosphere, like a polished youth K-drama, but original architecture and no show branding. Painterly semi-realistic Korean webtoon background with precise architecture, softly rendered textures, natural cinematic light, clean detail and depth. Refined navy, warm white, pale oak, restrained burgundy and fresh greenery. Real present-day school, not a castle. Empty setting, NO people, no foreground characters, no text or logos or watermark, no frames or panels. Nothing magical: no golden filigree, roses covering buildings, medieval arches, brooch motifs, star particles or constellations. Camera at human eye level, spacious believable environment, background can sit behind large character portraits and a dialogue bar in the bottom quarter. Scene: sunlit project classroom / student collaboration studio in the same affluent contemporary academy. Long pale-oak shared project table centered in room with FOUR laptops, notebooks, pens and takeaway coffee cups, modern upholstered desk chairs, a large whiteboard with only indistinct pale abstract diagrams at back left, pale oak book cabinets along the left wall, tall clean rectangular glass windows on the right looking onto green trees and the brick campus courtyard, an interior glass partition at the rear. Acoustic ceiling slats and thin linear pendant lights, no chandeliers. Warm natural afternoon light, clean but lived-in student project atmosphere.
```

### 카페테리아 · 오후

```text
Use case: illustration-story. Create one premium 16:9 landscape background for a Korean contemporary campus romance visual novel. Modern affluent private academy atmosphere, like a polished youth K-drama, but original architecture and no show branding. Painterly semi-realistic Korean webtoon background with precise architecture, softly rendered textures, natural cinematic light, clean detail and depth. Refined navy, warm white, pale oak, restrained burgundy and fresh greenery. Real present-day school, not a castle. Empty setting, NO people, no foreground characters, no text or logos or watermark, no frames or panels. Nothing magical: no golden filigree, roses covering buildings, medieval arches, brooch motifs, star particles or constellations. Camera at human eye level, spacious believable environment, background can sit behind large character portraits and a dialogue bar in the bottom quarter. Scene: elegant school cafe and student lounge in the same modern academy at late afternoon. Floor-to-ceiling rectangular glass windows, clean red-brick and limestone details, pale-oak cafe tables, cream and deep navy upholstered chairs, a sunlit long window bench, a few indoor trees and green plants, coffee bar and a discreet drink vending machine at the far right with no readable labels. Outside: leafy campus courtyard and red-brick classrooms. Soft golden-hour light and delicate window reflections. Sophisticated real school cafeteria feeling, comfortable and romantic, not a hotel ballroom or flower conservatory.
```

### 프로젝트실 · 밤

```text
Use case: illustration-story. Create one premium 16:9 landscape background for a Korean contemporary campus romance visual novel. Modern affluent private academy atmosphere, like a polished youth K-drama, but original architecture and no show branding. Painterly semi-realistic Korean webtoon background with precise architecture, softly rendered textures, natural cinematic light, clean detail and depth. Refined navy, warm white, pale oak, restrained burgundy and fresh greenery. Real present-day school, not a castle. Empty setting, NO people, no foreground characters, no text or logos or watermark, no frames or panels. Nothing magical: no golden filigree, roses covering buildings, medieval arches, brooch motifs, star particles or constellations. Camera at human eye level, spacious believable environment, background can sit behind large character portraits and a dialogue bar in the bottom quarter. Scene: nighttime version of a modern student project classroom. Long pale-oak shared table centered with FOUR open laptops glowing softly, notebooks and coffee cups after a long project day. Pale oak book cabinets on left, whiteboard with indistinct pale abstract diagrams at back left, rectangular floor-to-ceiling windows on RIGHT showing a dark blue evening sky, green tree silhouettes and a few warm lights in the neighboring brick school buildings. Glass partition at rear, acoustic ceiling slats and thin linear pendant lights partly dimmed; one warm desktop lamp gives intimate amber highlights. Believable 11:48pm teamwork atmosphere, cinematic navy shadows and warm desk light, no stars or fantasy effects inside room.
```

### 네 사람의 캠퍼스 표지

참조: 위 캠퍼스 인물 4장 (정치훈, 박진환, 주정원, 남성수 순서).

```text
Create a polished wide 16:9 cover illustration for an original Korean campus romance visual novel. Use the FOUR provided adult Korean male character illustrations as strict identity and outfit references, in the given order: Jeong Chihoon (navy blazer white shirt burgundy striped tie), Park Jinhwan (charcoal blazer lavender shirt gray knit vest and navy tie with laptop), Joo Jeongwon (navy blazer cream knit vest pale blue shirt, notebook), Nam Seongsu (forest green blazer dark knit white collar). Include exactly these FOUR distinct handsome men once each, all clearly recognizable, no extra main characters. Preserve each face, hairstyle, and matching outfit. Style: refined semi-realistic hand-painted Korean romance webtoon / otome game illustration with beautiful eyes and illustrated skin, NOT a photograph. Mood: upscale contemporary private-school youth romance drama, breezy early September, intimate and inviting. Architecture is original modern elite academy: low-rise redbrick and warm limestone, large rectangular glass windows, neat courtyard, trees, soft afternoon sunlight. Composition is essential: LEFT 36 percent is calm bright pale sky / softly lit campus negative space reserved for HTML title, absolutely no people on left third. The four men form a close elegant ensemble across RIGHT 62 percent, staggered two behind two front, all four entire heads fully visible and spaced apart, large faces in upper half, from waist up. Keep the four heads between x=42%-94%, y=12%-48% for desktop and mobile cropping. Refined navy, white, burgundy and forest green wardrobe, cinematic soft backlight and depth, contemporary school romance poster. No typography, no letters, no logos, no watermarks, no crown, no palace, no fantasy particles, no flower frame, no ornate gold decoration. Do not replicate actors or an existing poster. Match the reference illustrations' faces precisely, each character distinct.
```
