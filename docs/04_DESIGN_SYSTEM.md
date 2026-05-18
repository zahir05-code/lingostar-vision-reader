# 04. Design System (LingoStar Vision Reader)

작성일: 2026년 05월 18일
수정일: 2026년 05월 18일

## 1. Color Palette (접근성 테마)

저시력 학생을 위해 대비가 강하고 눈의 피로를 덜어주는 다양한 테마를 제공한다.
CSS Variables로 정의되어 전역 관리한다.

### 테마 종류
- **Light Theme**: 일반적인 고대비 밝은 테마
- **Dark Theme**: 눈부심 방지를 위한 어두운 테마
- **Yellow Theme**: 시각 피로도를 낮추고 명시성을 높이는 노란색 배경 + 검은 글씨
- **Blue Soft Theme**: 빛 번짐에 민감한 사용자를 위한 푸른빛의 부드러운 대비
- **High Contrast**: 완전한 검은 배경(#000)과 노란색/흰색 글씨의 극단적 대비

## 2. Typography

글꼴은 산세리프(Sans-serif)를 기본으로 하며, 구별이 쉬운 폰트(Pretendard, Inter 등)를 사용한다.

- **본문 텍스트 (Body)**: 기본 32px 시작, 최대 64px까지 스텝퍼로 조절 가능
- **버튼 텍스트 (Button)**: 24px ~ 32px, 굵게(Bold)
- **보조 텍스트 (Caption/Minimap)**: 20px 이상

## 3. Spacing & Touch Targets

태블릿 디바이스에서 터치 정확도를 높이기 위해 모든 인터랙티브 요소는 큼직하게 설계한다.

- **Button Height**: 최소 72px
- **Touch Target Size**: 최소 64px x 64px
- **Padding/Margin Base**: 16px (1rem) / 24px (1.5rem) / 32px (2rem)
- **Container Max-Width**: 모바일에선 100%, 태블릿에선 768px~1024px 중앙 정렬

## 4. Components

- **BigButton**: 둥근 모서리(8px~12px), 높은 대비, 텍스트 라벨 포함
- **MinimapHeader**: 상단에 고정되어 현재 진행 상태를 바(Bar) 또는 숫자(3/10)로 표시
- **PassageCard**: 청크 단위 분리를 위해 카드 형태로 시각적 구획 구분
