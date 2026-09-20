# hanjinseong.github.io

Jinseong Han 개인 홈페이지. 빌드 과정이 없는 **순수 정적 사이트**(HTML + CSS + JS)라서 파일을 고치고 `git push` 하면 바로 반영됩니다.

- 배포 주소: <https://hanjinseong.github.io/>
- 라이브 데모(별도 저장소): <https://hanjinseong.github.io/ipmsm-design/> → 이 사이트의 *Live demo* 섹션에 iframe으로 임베드되어 있습니다.

## 구조

```
index.html               한 페이지에 전부: Hero(자기소개) → About → Research → Live demo → Publications
404.html                 없는 주소로 들어왔을 때
assets/css/style.css     디자인 전체 (라이트/다크 테마 토큰은 파일 맨 위 :root)
assets/css/noscript.css  JS가 꺼진 브라우저용 보정
assets/js/main.js        테마 토글, 연구 상세 모달, 데모 iframe, 스크롤 효과
assets/img/profile.jpg   프로필 사진 (첫 화면 Hero 오른쪽)
assets/img/research/     연구 그림 (*-thumb.jpg = 카드용 축소본)
assets/img/logo-*.png    메뉴바 왼쪽 KAIST · SDL 로고 (연구실 PPT 템플릿에서 추출; KAIST는 라이트용 파랑 / 다크용 흰색 2종)
assets/img/og.png        카톡/슬랙/링크드인 공유 미리보기 이미지
favicon.svg, robots.txt, sitemap.xml, .nojekyll
preview.bat, tools/serve.ps1   로컬 미리보기 서버 (Node/Python 불필요)
```

## 로컬 미리보기

`preview.bat` 더블클릭 → <http://localhost:4173/> 이 열립니다. (종료: 창에서 Ctrl+C)

## 배포 (GitHub Pages)

1. GitHub에서 **`hanjinseong.github.io`** 라는 이름의 public 저장소를 만든다. (README 추가 체크 X)
2. 이 폴더에서:
   ```bash
   git remote add origin https://github.com/hanjinseong/hanjinseong.github.io.git
   git push -u origin main
   ```
3. 1~2분 뒤 <https://hanjinseong.github.io/> 접속. (안 뜨면 저장소 Settings → Pages → Source: *Deploy from a branch*, Branch: `main` / `(root)` 확인)

> 저장소 이름이 `<아이디>.github.io` 이면 도메인 루트에 배포되므로 기존 `/ipmsm-design/` 데모와 같은 도메인을 공유합니다.
> 다른 이름의 저장소로 올릴 경우 `404.html`의 절대경로(`/assets/...`)와 `index.html`의 `canonical`/`og:url` 주소만 바꿔 주면 됩니다.

## 자주 하는 수정

| 하고 싶은 것 | 방법 |
| --- | --- |
| 논문 추가 | `index.html`의 `#publications`에서 `<li class="pub">…</li>` 블록 하나를 복사해 수정. Domestic 목록은 앞의 3개만 기본 노출되고, `data-more` 속성이 붙은 항목은 "Show all" 뒤에 숨습니다. |
| 연구 주제 추가 | ① `#research`의 `<a class="card" … data-modal="r-xxx">` 카드 복사 ② 파일 맨 아래 `<dialog class="modal" id="r-xxx">` 상세 블록 복사. 두 곳의 `r-xxx` id만 맞추면 됩니다. `https://…/#r-xxx` 로 바로 열리는 링크도 됩니다. |
| 그림 교체/추가 | `assets/img/research/`에 **흰 배경** JPG/PNG로 넣기(투명 PNG는 다크 모드에서 글자가 안 보임). 카드용은 가로 ~1000px, 상세용은 ~2000px 권장. `<img>`의 `width`/`height` 값도 실제 픽셀에 맞게 수정. |
| 프로필 사진 교체 | `assets/img/profile.jpg` 덮어쓰기 (세로 4:5 비율 권장, 예: 413×516). 크기는 `style.css`의 `.hero__photo`. |
| 수상/프로젝트/특허/학력 | `index.html`의 `#about` 섹션 카드들. |
| "Last updated" | `index.html` 맨 아래 footer + `sitemap.xml`의 `lastmod`. |
| 색/폰트 | `style.css` 맨 위 `:root`(라이트) / `[data-theme="dark"]`(다크) 변수. |

## 메모

- 폰트: **나눔스퀘어 하나로 통일** — 본문 Bold(700), 제목 ExtraBold(800). `style.css` 맨 위 `@font-face`에서 PC에 설치된 폰트를 먼저 쓰고, 없으면 jsDelivr CDN(`moonspam/NanumSquare`)에서 woff2를 받습니다.
- **수정했는데 예전 모양이 보이면 브라우저 캐시입니다.** `style.css`/`main.js`를 고친 뒤에는 `index.html`·`404.html`의 `style.css?v=N`, `main.js?v=N` 숫자를 하나 올려 주세요(방문자 브라우저가 새 파일을 받게 됨). 본인 화면은 Ctrl+F5.
- Research 제목 오른쪽의 작은 모터(8극 48슬롯 IPMSM 단면)는 인라인 SVG + CSS 애니메이션입니다. 회전자 속도(60초/회전)와 고정자 코일 점등 순서(3상, 7.5초 주기)가 맞물려 "동기" 회전하도록 되어 있으니 한쪽만 바꾸지 마세요 (`.m-rotor`, `.m-coils`).
- 데모 콘솔은 언어를 `localStorage['motorai-lang']`에 저장합니다. 같은 도메인에서 처음 방문한 사람에게는 이 사이트가 값을 `en`으로 넣어 영어 콘솔이 먼저 보이게 합니다 (`main.js`).
