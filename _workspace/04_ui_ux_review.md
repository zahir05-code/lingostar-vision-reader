# LingoStar MVP UI/UX 및 CSS 디자인 명세 (UI_UX_Designer)

작성일: 2026년 05월 27일

본 문서는 **LingoStar Vision Reader**의 시각 장애/저시력 학습자를 배려한 웹 접근성(WCAG) 표준 준수 HSL 디자인 시스템, 72px 이상 거대 터치 UI 규격 및 Vanilla CSS Variables 설계를 정의합니다.

---

## 1. 5종 접근성 테마 컬러 시스템 (Vanilla CSS)

눈의 피로도를 낮추고 저시력 사용자의 특정 시각적 취약점을 상쇄할 수 있도록 조화로운 **HSL(Hue, Saturation, Lightness)** 기반 디자인 색상 토큰을 정의합니다. HSL은 명도 대비 제어가 쉽고 부드러운 대비 연출에 이상적입니다.

### 1-1. `src/styles/variables.css` 설정
```css
/* 글로벌 CSS 변수 테마 정의 */
:root {
  /* 폰트 기본값 및 스페이싱 */
  --font-main: 'Outfit', 'Inter', system-ui, sans-serif;
  --font-size-step: 1px; /* 폰트 조절의 미세 가속화 단위 */
  --transition-smooth: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  --border-radius-mega: 16px;
  --focus-ring: 4px solid hsl(210, 100%, 50%);
}

/* 1. Light Mode (일반 기본 테마) */
[data-theme='light'] {
  --bg-primary: hsl(210, 20%, 98%);
  --bg-secondary: hsl(0, 0%, 100%);
  --text-primary: hsl(220, 20%, 15%);
  --text-secondary: hsl(220, 10%, 45%);
  --accent-color: hsl(210, 100%, 45%);
  --shadow-color: hsla(0, 0%, 0%, 0.08);
}

/* 2. Dark Mode (어두운 배경 테마 - 안구 피로 방지) */
[data-theme='dark'] {
  --bg-primary: hsl(220, 20%, 10%);
  --bg-secondary: hsl(220, 15%, 15%);
  --text-primary: hsl(210, 20%, 90%);
  --text-secondary: hsl(210, 10%, 65%);
  --accent-color: hsl(200, 100%, 60%);
  --shadow-color: hsla(0, 0%, 0%, 0.4);
}

/* 3. Yellow Soft Theme (황색 테마 - 빛번짐 및 백내장 환자 보조) */
[data-theme='yellow'] {
  --bg-primary: hsl(45, 100%, 96%);
  --bg-secondary: hsl(45, 100%, 90%);
  --text-primary: hsl(30, 60%, 10%);
  --text-secondary: hsl(30, 40%, 30%);
  --accent-color: hsl(35, 100%, 40%);
  --shadow-color: hsla(30, 50%, 20%, 0.1);
}

/* 4. Blue Soft Theme (청색 테마 - 시각 자극 완화 및 가독성 유도) */
[data-theme='blueSoft'] {
  --bg-primary: hsl(205, 100%, 96%);
  --bg-secondary: hsl(205, 100%, 90%);
  --text-primary: hsl(215, 80%, 15%);
  --text-secondary: hsl(215, 40%, 35%);
  --accent-color: hsl(210, 100%, 40%);
  --shadow-color: hsla(215, 60%, 20%, 0.08);
}

/* 5. High Contrast Theme (초고대비 흑황 테마 - 최중증 저시력 보조) */
[data-theme='highContrast'] {
  --bg-primary: hsl(0, 0%, 0%);
  --bg-secondary: hsl(0, 0%, 10%);
  --text-primary: hsl(60, 100%, 50%); /* 선명한 노란색 텍스트 */
  --text-secondary: hsl(0, 0%, 90%);
  --accent-color: hsl(60, 100%, 50%);
  --shadow-color: hsla(0, 0%, 0%, 0);
  --focus-ring: 4px solid hsl(60, 100%, 50%);
}
```

---

## 2. 72px 이상 거대 터치 UI (Mega Touch Area)

태블릿 터치 오작동을 원천 봉쇄하기 위해, 사용자가 상호작용하는 모든 대화형 인터페이스의 물리적인 탭 타겟 크기를 극단적으로 늘립니다.

### 2-1. `BigButton.jsx` 스타일 명세
- **패딩과 높이**: 높이는 **최소 72px~84px**를 유지하고, 좌우 내부 패딩은 `32px` 이상으로 넉넉하게 주어 손가락 터치 타겟을 넓힙니다.
- **포커스 링**: 키보드 접근성(Tab 키 이동 시)이 보장되도록 `:focus-visible` 셀렉터에 `4px` 두께의 고대비 아웃라인을 설정합니다.
- **클릭 피드백**: 활성화 시 스케일 감소(`transform: scale(0.95)`) 트랜지션을 통해 촉각적 감각을 제공하는 미세 마이크로 애니메이션을 제공합니다.

```css
.big-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 72px; /* 최소 72px 거대 높이 보장 */
  padding: 0 32px;
  font-family: var(--font-main);
  font-size: 20px;
  font-weight: bold;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  border: 3px solid var(--text-primary); /* 선명한 고대비 아웃라인 */
  border-radius: var(--border-radius-mega);
  box-shadow: 0 4px 12px var(--shadow-color);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.big-button:hover {
  transform: translateY(-2px);
  background-color: var(--accent-color);
  color: var(--bg-secondary);
}

.big-button:active {
  transform: scale(0.96);
}
```

---

## 3. 정보 시각 피로 감소를 위한 레이아웃
- **집중 읽기 뷰포트**: 한 화면에 여러 텍스트가 섞여 눈에 혼동을 주지 않도록, 문장 외부 영역은 `backdrop-filter: blur(10px)` 또는 완전한 불투명 레이어를 입혀 집중도를 극대화합니다.
- **줄간격 및 자간 조절 범위**: 글자 크기에 맞춰 `letter-spacing`은 `1px`에서 `5px`, `line-height`는 `1.8`에서 `3.0`까지 넓게 조절되어, 저시력 아동이 자신에게 맞는 공백 레이아웃을 완전히 스스로 커스텀하게 만듭니다.
