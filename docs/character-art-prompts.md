# 네 인물의 AI 애니메이션 초상화

OpenAI 내장 `image_gen` 도구로 사용자 제공 사진을 각각 애니메이션 미남 캐릭터로 변환했다. CLI/API 우회는 사용하지 않았다. 결과는 1024×1536 PNG이며 선택 화면과 대화 장면에서 동일한 이름별 매핑을 사용한다. 원본 사진은 보존했다.

정치훈의 최종 결과를 나머지 세 장의 화풍·구도 참고 이미지로 사용했으며, 각 인물의 원본 사진만 신원/얼굴 참고로 사용했다. 아래는 실제 최종 생성 프롬프트다.

## 정치훈

결과: [`jeong-chihoon-anime.png`](../public/assets/characters/jeong-chihoon-anime.png)

```text
Use case: style-transfer. Edit target: the attached photograph of 정치훈 (Jeong Chihoon). Redraw this man as a stunningly handsome TWO-DIMENSIONAL ANIME romance-game male lead. Keep recognizable identity clues: straight black layered fringe, oval face, almond eyes, straight nose, broad shoulders, plain black crew-neck T-shirt.
CRITICAL STYLE: unmistakable traditional 2D anime / shoujo animation character drawing. Visibly drawn thin dark contour lines around face, nose, eyes and clothing. Expressive enlarged anime eyes with graphic highlights, simplified small nose with a tiny line, stylized sharp yet natural adult jaw, black hair drawn as graphic flowing locks, smooth FLAT painted skin with only 2-3 cel-shaded color areas. Elegant bishounen adult in his twenties, subtly confident half-smile. No photographic skin, no realistic pores, no 3D render, no realistic digitally retouched portrait, no hyperreal hair strands.
Composition: one adult male only, portrait 2:3, complete hair with small margin above, both shoulders fully inside frame, upper body from head to lower chest, facing viewer. Very beautiful, charming, polished professional romance anime promotional portrait. Soft lavender rim lighting, restrained warm blush.
BACKGROUND: simple perfectly solid warm ivory #F8F3F5, completely opaque, clean and seamless. Do NOT use transparency, checkerboard pattern, gray squares, scenery, props, text, labels, watermark, border or collage.
Match the original hairstyle and clothing, but fully transform rendering and flattering facial proportions into a clear anime drawing, do not merely apply a beauty filter.
```

## 주정원

결과: [`joo-jeongwon-anime.png`](../public/assets/characters/joo-jeongwon-anime.png)

```text
Use case: style-transfer. Asset type: individual anime portrait for a Monogatari romance visual novel. Input image 1 is the ONLY identity reference and edit target. Input image 2 is a STYLE AND FRAMING reference only, a different man's finished anime portrait: copy its drawing style, line weight, cel shading, simplified anime eyes/nose/hair, palette, ivory background, upper-body framing and level of handsomeness, but DO NOT copy its face, hairstyle or identity. Turn the man in image 1 into an exceptionally handsome TWO-DIMENSIONAL ANIME romance male lead while preserving his distinguishing facial features, own hairstyle and original clothing. Refined adult bishounen, black hair, elegant proportions, beautifully drawn eyes with highlights, smooth flat painted skin with 2-3 cel-shadow tones, delicate blush. Fully drawn 2D anime, no photographic skin/pores, no hyperrealism, no retouched photo, no 3D render. A SINGLE fully clothed adult male, portrait 2:3, complete head and hair with small margin above, shoulders fully inside frame, lower-chest/upper-body portrait, centered. Background is perfectly solid warm ivory #F8F3F5 and completely opaque. NO transparency, NO checkerboard, no props, no visible hands, no text, no labels, no watermarks, no collage. Keep all four men distinct.
The edit target is 주정원 (Joo Jeongwon). Preserve his distinct softly rounded curtain middle-part black hairstyle that frames his forehead, narrow refined face, long elegant neck, gently arched eyebrows and plain black crew-neck T-shirt. Handsome intellectual romance lead, poised gentle gaze, tiny knowing closed-mouth smile. Make his curtain hairstyle clearly different from the reference illustration's straight fringe. No glasses, no jewelry.
```

## 박진환

결과: [`park-jinhwan-anime.png`](../public/assets/characters/park-jinhwan-anime.png)

```text
Use case: style-transfer. Asset type: individual anime portrait for a Monogatari romance visual novel. Input image 1 is the ONLY identity reference and edit target. Input image 2 is a STYLE AND FRAMING reference only, a different man's finished anime portrait: copy its drawing style, line weight, cel shading, simplified anime eyes/nose/hair, palette, ivory background, upper-body framing and level of handsomeness, but DO NOT copy its face, hairstyle or identity. Turn the man in image 1 into an exceptionally handsome TWO-DIMENSIONAL ANIME romance male lead while preserving his distinguishing facial features, own hairstyle and original clothing. Refined adult bishounen, black hair, elegant proportions, beautifully drawn eyes with highlights, smooth flat painted skin with 2-3 cel-shadow tones, delicate blush. Fully drawn 2D anime, no photographic skin/pores, no hyperrealism, no retouched photo, no 3D render. A SINGLE fully clothed adult male, portrait 2:3, complete head and hair with small margin above, shoulders fully inside frame, lower-chest/upper-body portrait, centered. Background is perfectly solid warm ivory #F8F3F5 and completely opaque. NO transparency, NO checkerboard, no props, no visible hands, no text, no labels, no watermarks, no collage. Keep all four men distinct.
The edit target is 박진환 (Park Jinhwan). Preserve his distinctive fluffy swept-up center-part black hair with a wide visible forehead, thick comparatively straight eyebrows, friendly eyes, slightly broader cheek structure, and very pale lavender crew-neck shirt. Turn him into a gorgeous sunny warm-hearted anime romantic lead, open bright gaze, small warm smile, lightly rosy cheeks. Keep his face and swept-back forehead distinctly different from the other illustration. No glasses, no jewelry.
```

## 남성수

결과: [`nam-seongsu-anime.png`](../public/assets/characters/nam-seongsu-anime.png)

```text
Use case: style-transfer. Asset type: individual anime portrait for a Monogatari romance visual novel. Input image 1 is the ONLY identity reference and edit target. Input image 2 is a STYLE AND FRAMING reference only, a different man's finished anime portrait: copy its drawing style, line weight, cel shading, simplified anime eyes/nose/hair, palette, ivory background, upper-body framing and level of handsomeness, but DO NOT copy its face, hairstyle or identity. Turn the man in image 1 into an exceptionally handsome TWO-DIMENSIONAL ANIME romance male lead while preserving his distinguishing facial features, own hairstyle and original clothing. Refined adult bishounen, black hair, elegant proportions, beautifully drawn eyes with highlights, smooth flat painted skin with 2-3 cel-shadow tones, delicate blush. Fully drawn 2D anime, no photographic skin/pores, no hyperrealism, no retouched photo, no 3D render. A SINGLE fully clothed adult male, portrait 2:3, complete head and hair with small margin above, shoulders fully inside frame, lower-chest/upper-body portrait, centered. Background is perfectly solid warm ivory #F8F3F5 and completely opaque. NO transparency, NO checkerboard, no props, no visible hands, no text, no labels, no watermarks, no collage. Keep all four men distinct.
The edit target is 남성수 (Nam Seongsu). The source photo is black and white, but produce a FULL-COLOR anime illustration matching image 2's color palette. Preserve his recognizable dense neat rounded black fringe, comparatively broad face with a strong softly squared lower face, quiet eyes, slightly three-quarter head pose, solid shoulders, and fitted black high-neck turtleneck. Make him an exceptionally handsome reserved, quietly protective anime romance male lead with gentle focused eyes and the hint of a soft smile. Refine and flatter his contours, but keep the broader facial structure; do not give him the same narrow V-shaped face as image 2. No glasses, no jewelry.
```
