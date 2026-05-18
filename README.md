# LingoStar Vision Reader

저시력 학생을 위한 접근성 중심 영어 학습 보조 웹앱입니다.
일반 학생들과 동일하게 영어 수업의 긴 지문을 놓치지 않고 따라갈 수 있도록, 화면 정보의 과부하를 줄이고 핵심 텍스트를 크게 제공하는 데 집중합니다.

## 주요 기능
- **집중 읽기 모드**: 한 화면에 단 하나의 핵심 문장만 거대한 폰트(최대 64px)로 보여주며, 미니맵을 통해 전체 지문 속 위치를 파악합니다.
- **청크 읽기 모드**: 문장을 구/절 단위로 쪼개어 수직으로 렌더링, 시야가 좁은 학생들도 편하게 직독직해할 수 있도록 지원합니다.
- **접근성 테마 제공**: 고대비, 빛번짐 방지 등 시각 장애 유형별 맞춤형 5가지 색상 테마 지원.
- **거대 터치 인터페이스**: 태블릿 환경에서 오터치를 방지하기 위한 최소 72px 높이의 거대 버튼.

## 기술 스택
- **Frontend**: React, Vite
- **Styling**: Vanilla CSS (CSS Variables를 통한 테마 관리)
- **Data**: LocalStorage
- **Deployment**: Vercel / Netlify

## 프로젝트 구조
```text
project-name/
├── src/
│   ├── components/  (재사용 가능한 UI 요소 - BigButton 등)
│   ├── pages/       (주요 화면 - HomePage, FocusReadingPage 등)
│   ├── styles/      (디자인 시스템 및 테마 CSS)
│   ├── utils/       (문장 파싱 등 유틸)
│   └── App.jsx
└── docs/            (기획 및 설계 문서)
```

## 실행 방법

1. 의존성 설치
```bash
npm install
```

2. 로컬 개발 서버 실행
```bash
npm run dev
```

3. 배포용 빌드
```bash
npm run build
```

## 보안 및 주의사항
- 본 앱은 초기 MVP 단계로 모든 데이터는 사용자의 로컬 브라우저(LocalStorage)에 저장됩니다.
- API 키, 실제 비밀번호 등은 절대 소스코드에 하드코딩하지 않습니다.
