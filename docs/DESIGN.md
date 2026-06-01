---
name: LingoStar Vision Reader Design System
colors:
  surface: '#fffde7'
  background: '#fffde7'
  primary: '#1976d2'
  on-primary: '#ffffff'
  primary-container: '#1565c0'
  on-primary-container: '#e3f2fd'
  secondary: '#eceff1'
  on-secondary: '#37474f'
  secondary-container: '#cfd8dc'
  on-secondary-container: '#263238'
  tertiary: '#2e7d32'
  on-tertiary: '#ffffff'
  tertiary-container: '#c8e6c9'
  on-tertiary-container: '#1b5e20'
  error: '#e53935'
  on-error: '#ffffff'
  on-background: '#5d4037'
  surface-variant: '#f5f5f5'
  on-surface: '#5d4037'
  outline: '#5d4037'
typography:
  headline-lg:
    fontFamily: Outfit
    fontSize: 40px
    fontWeight: '900'
    lineHeight: '1.8'
    letterSpacing: '0.05em'
  body-lg:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '2.0'
    letterSpacing: '0.02em'
  label-lg:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '900'
    lineHeight: '1.2'
    letterSpacing: '0.05em'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  full: 9999px
spacing:
  base: 8px
  xs: 12px
  sm: 24px
  md: 32px
  lg: 48px
  xl: 72px
---

## Brand & Style
저시력 학생 및 시각 보조 학습을 위한 배리어 프리(Barrier-Free) 영어 리딩 보조 기구.
빛번짐과 시력 감퇴를 겪는 아동의 시선 유목을 예방하기 위해 극대화된 폰트 크기(최대 120px)와 HSL 대비 명도를 보장하는 "Mega UI" 디자인 철학을 고수합니다.

## Colors
빛번짐을 최적으로 예방하는 황색(Yellow) 및 안구 편한 청색(BlueSoft) HSL 컬러 매핑. 
텍스트 가독성을 최우선으로 하기 위해 AAA 등급의 흑색/갈색 대비 텍스트 명도비를 보장합니다.

## Layout & Spacing
- **Touch Target:** 모든 터치 및 대화형 제어 영역은 최소 72px 이상 높이의 BigButton 규격을 의무 적용.
- **Font Sizing:** 핀치 및 휠 줌을 활용해 24px에서 120px까지 동적 확장되며, 80px 이상 극대화 시 레이아웃 무너짐을 방지하는 적응형 수직 Flexbox 리플로우 디자인을 탑재합니다.
