# LingoStar MVP 아키텍처 설계서 (Architect)

작성일: 2026년 05월 27일

본 문서는 **LingoStar Vision Reader**의 React 컴포넌트 구조, 전역 상태 및 데이터 흐름, 모바일 PWA 배포 최적화를 위한 소프트웨어 아키텍처를 정의합니다.

---

## 1. 컴포넌트 위계 및 구조 (React & Vite)

초보 개발자가 쉽게 코드를 파악할 수 있도록 복잡한 상태 관리 라이브러리(Redux 등) 대신 React 내장 **Context API**와 **LocalStorage**를 이용한 통합 상태 제어 아키텍처를 제시합니다.

### 1-1. 디렉토리 구조 상세
```text
src/
├── components/          # 공통 재사용 가능한 대화형 접근성 UI 컴포넌트
│   ├── BigButton.jsx    # 최소 72px 이상 크기의 클릭 및 터치 피드백 버튼
│   ├── ThemeSelector.jsx# HSL 기반 5종 접근성 테마 스위처
│   ├── FontSizeController.jsx # 글자 크기(32px~64px) 및 자간/줄간격 슬라이더 조절기
│   └── ReadingMinimap.jsx # 현재 문장 위치를 나타내는 인지 보조 인디케이터
├── context/
│   └── AppContext.jsx   # 테마, 폰트크기, 읽기 진행 상태, Firebase 유저 전역 상태 컨텍스트
├── pages/               # 단일 책임을 가진 각 라우트별 주요 화면
│   ├── HomePage.jsx     # 영어 지문 입력 폼, 최근 읽은 지문 히스토리 리스트
│   ├── FocusReadingPage.jsx # 집중 읽기 모드 (수업 따라가기 모드 내장)
│   ├── ChunkReadingPage.jsx # Chunk 수직 정렬 및 직독직해 모드
│   └── StructurePage.jsx # 단락 구조화 압축 모드
├── styles/
│   ├── variables.css    # HSL CSS 변수 기반 접근성 테마 정의 파일
│   └── main.css         # 전역 리셋 및 거대 타이포그래피 정렬 CSS
├── utils/
│   └── textParser.js    # 영어 지문을 문장 및 Chunk 단위로 쪼개주는 파서 유틸
├── App.jsx              # AppContext Provider 주입 및 라우터 제어
└── main.jsx             # React 엔트리 포인트
```

---

## 2. 데이터 흐름 및 상태 설계 (Props & State)

### 2-1. AppContext 전역 상태 명세
React Context를 사용하여 모든 페이지에서 공통 접근성 정보와 데이터 모델을 즉시 공유하도록 구조화합니다.

```javascript
// AppContext.jsx 예시 상태 구조
const [theme, setTheme] = useState('light'); // light, dark, yellow, blueSoft, highContrast
const [fontSize, setFontSize] = useState(40); // 32 ~ 64 (px 단위)
const [letterSpacing, setLetterSpacing] = useState(2); // 1 ~ 5 (px 단위)
const [lineHeight, setLineHeight] = useState(2.0); // 1.5 ~ 3.0 (배수)
const [activePassage, setActivePassage] = useState(null); // 현재 학습 중인 지문 객체
const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0); // 현재 읽고 있는 문장 번호
const [user, setUser] = useState(null); // Firebase Auth 인증 정보
```

### 2-2. Props 데이터 통신 흐름
- **HomePage**: 지문을 입력받아 `activePassage` 객체를 구성하고 Firestore에 업로드한 후, 해당 ID를 가지고 각 ReadingPage로 라우팅합니다.
- **FocusReadingPage**: `activePassage` 객체의 `sentences` 배열을 로드하여 화면 중앙에 `sentences[currentSentenceIndex]` 단 하나만 렌더링하고, `ReadingMinimap`과 `FontSizeController`에 Props로 연동합니다.

---

## 3. PWA 및 모바일 패키징 최적화
- **네트워크 오프라인 지원**: PWA Service Worker를 활성화하여, 인터넷이 끊겨도 이전에 로컬 LocalStorage에 백업된 영어 지문 데이터를 활용해 끊김 없이 읽기 모드를 지속하도록 설계합니다.
- **Viewport Scaling 제한**: 저시력 사용자가 더블 탭 시 브라우저가 화면 전체를 강제 확대하여 레이아웃이 깨지는 것을 방지하기 위해, 웹앱 자체 폰트 컨트롤러를 우선 활용하도록 Viewport Meta Tag를 최적화합니다.
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  ```
- **Capacitor 패키징**: 향후 모바일 앱 빌드를 고려하여 Node.js 전용 모듈이나 브라우저에서 사용할 수 없는 시스템 API는 일절 배제하고 표준 Web API만 사용합니다.
