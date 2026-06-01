# 🌟 LingoStar MVP 통합 설계 마스터 보고서 (Harness Team)

작성일: 2026년 05월 27일
가동 전문가: PM(기획), Architect(설계), DB(데이터베이스), UI/UX(디자인), QA(테스트)

---

> [!NOTE]
> 본 보고서는 LingoStar Vision Reader 프로젝트의 가상 전문가 팀(하네스)이 기획서, 아키텍처, 데이터 모델, 디자인 사양, 품질 검증 단계를 전방위로 크로스 분석하여 도출한 **실질적이고 초보자 친화적인 개발 청사진**입니다.

---

## 🗺️ 1. 하네스 전문가 팀 종합 아키텍처
본 웹앱은 초보 개발자도 쉽게 코딩하고 확장할 수 있도록 아래와 같이 직관적이고 결합도가 낮은 설계 구조를 채택했습니다.

```mermaid
graph TD
    subgraph Frontend (React & Vanilla CSS)
        App[App.jsx] --> Router[React Router]
        Router --> Home[HomePage.jsx]
        Router --> Focus[FocusReadingPage.jsx]
        Router --> Chunk[ChunkReadingPage.jsx]
        
        Home --> Parser[textParser.js]
        Focus --> BigBtn[BigButton.jsx]
        Focus --> Selector[ThemeSelector.jsx]
        Focus --> Controller[FontSizeController.jsx]
        Focus --> Minimap[ReadingMinimap.jsx]
    end

    subgraph Data & Sync (Firebase & Local)
        AppContext[AppContext.jsx] <--> OfflineCache[(Local Storage)]
        AppContext <--> Firestore[(Firebase Firestore)]
    end
    
    style AppContext fill:#fff9c4,stroke:#fbc02d,stroke-width:2px
    style Firestore fill:#e3f2fd,stroke:#1e88e5,stroke-width:2px
    style BigBtn fill:#ffe0b2,stroke:#f57c00,stroke-width:2px
```

---

## 📑 2. 전문가별 핵심 설계 요약

### 2-1. 📝 기획 (PM_Planner) - "접근성 중심의 심플한 학습 경험"
- **핵심 정책**: 지문 입력 창은 단순 텍스트 입력 영역(Textarea)으로 제공하여 누구나 쓰기 편하게 구성.
- **예외 처리**: 지문이 비어 있을 때를 대비한 **샘플 지문 원클릭 불러오기** 버튼 탑재.
- **상세**: [_workspace/01_planner_review.md](file:///c:/Users/User/Desktop/5.18바이브코딩/_workspace/01_planner_review.md)

### 2-2. 📐 아키텍처 (Architect) - "컴포넌트 단일 책임과 Props 공유"
- **핵심 구조**: 전역 상태(테마, 글꼴 크기, 읽기 인덱스)는 `AppContext`로 단일 관리하여 Prop Drilling 최소화.
- **모바일 제한**: 저시력 학생이 더블 탭 시 화면 배율이 비정상적으로 흔들리지 않도록 `viewport user-scalable=no` 메타 셋 설정.
- **상세**: [_workspace/02_architect_review.md](file:///c:/Users/User/Desktop/5.18바이브코딩/_workspace/02_architect_review.md)

### 2-3. 🗄️ 데이터베이스 (DB_Engineer) - "NoSQL 역정규화 및 실시간 동기화"
- **핵심 데이터**: `passages` 문서에 문장 배열, Chunk 정보, 문단 요약을 모두 임베딩하여 한 번의 조회로 연동.
- **오프라인 지원**: Firestore Persistent Cache 설정을 활성화하여 통신 장애 상태에서도 학습 중단 방지.
- **상세**: [_workspace/03_db_review.md](file:///c:/Users/User/Desktop/5.18바이브코딩/_workspace/03_db_review.md)

### 2-4. 🎨 UI/UX 디자인 (UI_UX_Designer) - "HSL 접근성 테마 & 72px Mega Touch"
- **핵심 디자인**: 고대비(흑황), 황색(빛번짐 차단), 청색(시각 피로 완화) 등 5대 접근성 테마의 CSS 변수 구축.
- **오터치 해소**: 모든 조작 버튼의 높이를 72px 이상으로 선언하고 클릭감 향상을 위한 미세 축소 마이크로 애니메이션 추가.
- **상세**: [_workspace/04_ui_ux_review.md](file:///c:/Users/User/Desktop/5.18바이브코딩/_workspace/04_ui_ux_review.md)

### 2-5. 🔍 품질 검증 (QA_Tester) - "경계면 검증 및 접근성 엣지 테스트"
- **핵심 검증**: 글자 크기를 최대 64px로 키운 최악의 모바일 화면(320px 폭)에서도 텍스트가 잘리지 않고 다음 줄로 자동 개행(Reflow)되는 무결성 검증 시나리오 마련.
- **상세**: [_workspace/05_qa_review.md](file:///c:/Users/User/Desktop/5.18바이브코딩/_workspace/05_qa_review.md)

---

## 🚀 3. 초보 개발자를 위한 즉시 행동 로드맵 (Action Plan)

설계도가 나왔으므로, 초보자이신 사용자께서 혼자서도 하나씩 따라가며 코딩을 완성하실 수 있는 순서입니다.

```markdown
- `[ ]` 1단계: src/styles/variables.css에 5종 접근성 HSL 컬러 테마 코드 반영하기
- `[ ]` 2단계: src/context/AppContext.jsx를 생성하고 전역 상태(theme, fontSize, activePassage) 구현하기
- `[ ]` 3단계: src/utils/textParser.js에 지문을 문장과 Chunk 구조로 파싱해주는 유틸 함수 작성하기
- `[ ]` 4단계: src/components/BigButton.jsx 제작하고 72px 크기와 마이크로 탭 애니메이션 입히기
- `[ ]` 5단계: Firebase Firestore 연결 설정(firebase.js) 후 Passage 업로드 테스트 진행하기
- `[ ]` 6단계: HomePage, FocusReadingPage 등 핵심 라우트 컴포넌트 하나씩 살 붙이기
```

> [!TIP]
> 위 로드맵 순서는 아키텍처/DB 의존성이 가장 직관적으로 해결되도록 배열되었습니다. 이대로 진행하면 도중에 꼬이지 않고 완벽한 접근성 영어 학습 보조 앱을 손쉽게 완성할 수 있습니다!
