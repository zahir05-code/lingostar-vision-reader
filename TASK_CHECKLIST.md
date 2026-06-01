# TASK_CHECKLIST.md - LingoStar Vision Reader 태스크 체크리스트

이 문서는 **LingoStar Vision Reader** 제품 개발의 진행 상황을 모니터링하기 위한 체크리스트입니다.

---

## [Phase 1] 하네스 전문가 팀 및 개발 프레임워크 구축
- [x] 프로젝트 핵심 가이드 `CLAUDE.md` 설정
- [x] 변경 이력 관리 `UPDATE_LOG.md` 설정
- [x] 태스크 체크리스트 `TASK_CHECKLIST.md` 설정
- [x] 하네스 전문가 에이전트 정의 작성 (`.claude/agents/`)
  - [x] Planner (기획 에이전트 - planner.md)
  - [x] Architect (아키텍처 에이전트 - architect.md)
  - [x] DB Engineer (DB 에이전트 - db_engineer.md)
  - [x] UI/UX Designer (디자인 에이전트 - ui_ux_designer.md)
  - [x] QA Tester (QA 에이전트 - qa_tester.md)
- [x] 하네스 전용 스킬 정의 작성 (`.claude/skills/`)
  - [x] 오케스트레이터 스킬 (`harness-orchestrator`)
  - [x] 전문가 업무 가이드 스킬 (`product-delivery`)

## [Phase 2] Firebase 및 데이터 모델 설계 (DB & Architect)
- [x] `docs/DATA_MODEL.md` 정의 완료
- [x] Firebase Firestore 프로젝트 초기화 및 연결 설정 완료 (`src/firebase.js`)
- [x] 학습 지문(Passage) 및 읽기 진척도 NoSQL 스키마 매핑 완료 (parsedPassage 모델)
- [x] Parameterized Queries 및 오프라인 영속성(Offline Persistence) 멀티탭 연동 완료

## [Phase 3] 디자인 시스템 및 접근성 CSS 구성 (UI/UX)
- [x] `docs/UI_UX_FLOW.md` 보완 및 `docs/04_DESIGN_SYSTEM.md` 기반 스타일링 설정 완료
- [x] `src/styles/` 내 Vanilla CSS 기반의 접근성 테마 Variables 구성 (`variables.css` 모듈 분리 완료)
  - [x] Light / Dark / Yellow / BlueSoft / HighContrast 5개 테마
  - [x] 거대 폰트(32px ~ 120px) 및 조절기(Controller), 핀치 줌 / 휠 줌 스타일 구현 완료
  - [x] 72px 이상의 Mega UI Touch Area 스타일링 완료
- [x] 공통 접근성 컴포넌트 개발 (`BigButton` 및 눈보호 테마 셀렉터 완료)

## [Phase 4] 집중 읽기 & 수업 따라가기 모드 구현 (UI/UX, Arch, PM)
- [x] AppContext 전역 상태 및 로컬 스토리지 오프라인 캐싱 설계 완료 (`src/context/AppContext.jsx`)
- [x] 영어 지문 입력 폼 페이지 구현 완료 및 파서/Firestore/BigButton 연계 (`src/pages/PassageInputPage.jsx`)
- [x] 집중 읽기 모드 (Focus Mode) 고도화 완료 및 useApp/BigButton 연계 (`src/pages/ClassFollowModePage.jsx`)
  - [x] 한 문장 중심 초대형 HSL 폰트 렌더링 및 동적 크기 조절
  - [x] 원어민 TTS 및 다중 단어 드래그 숙어 사전 추가 기능
  - [x] 모든 대화형 버튼 72px 이상 Mega Touch Area 적용 완료

## [Phase 5] 저시력 맞춤형 문단 구조화 & 단어장 기능 대대적 개선 (PM, DB, UI/UX)
- [x] 의미 단위(Chunk) 파싱 및 약어 예외 처리 유틸 함수 개발 완료 (`src/utils/textParser.js`)
- [x] 주어/동사(S/V) 및 파란색/초록색 밑줄/첨자 완전히 제거 완료 (3단 표 형태 및 컬러 블록 맵으로 개선)
- [x] 단어/숙어 사전 데이터 (`dictMock`) 동의어, 반의어, 유사숙어 구조로 대폭 확장 완료
- [x] 도입부(2문장 이상) 자동 감지 및 시각적 문장 지도(`VisualSyntaxMap`) 다이어그램 컴포넌트 개발 완료
- [x] 지문 로드 시 단어/숙어 자동 선별 및 나만의 단어장 기본 생성 기능 완료
- [x] 본문 읽기 중 단어 터치 시 단어장 실시간 누적 저장 및 사전 모달 동의어/반의어 노출 완료
- [x] 한국어 매핑 UI 개선 및 직독직해 어순 정렬 최적화 완료


## [Phase 6] QA 검증 및 배포 준비 (QA)
- [x] `docs/05_TEST_PLAN.md`에 맞춘 컴포넌트 인터페이스 QA 검증 완료
- [x] 크로스 브라우저(태블릿, 모바일) 접근성 및 터치 감도 검증 완료
- [x] 최종 빌드 최적화 및 Firebase Hosting 배포 설정 완료

## [Phase 7] 실사용 핫픽스 & 극강의 UX 최적화 완료
- [x] splitIntoChunks의 마이크로 세그멘테이션 크래시 방지용 런타임 가드 탑재 완료
- [x] 지문 매핑 화면 가로 회색선 및 세로 회색선 완전 소거 완료 (HSL 둥근 박스 레이아웃 교체)
- [x] 지문 저장 시 0초 낙관적 즉시 동기화(Optimistic Update) 및 백그라운드 Firestore 업로드 구축 완료
- [x] Stitch 원본 모의고사 분석 해설지 100% 동일 뷰 이식 완료 (`ParagraphStructurePage.jsx`)
- [x] the, a, in, be/have동사, 조동사 등을 배제한 고1 이상 핵심 어휘 정밀 필터링 단어장 표 연동 완료 (`textParser.js` & `ParagraphStructurePage.jsx`)
- [x] 퀴즈 UI 내 간이 배경지식 학습 박스(Background Insight) 3D 네오브루탈리즘 카드 추가 완료 (`ParagraphStructurePage.jsx`)
- [x] 단어장 및 사전(Vocabulary Page) UI/UX를 사용자의 premium 3D Neobrutalism HTML 사양으로 100% 동일 구현 완료 (`VocabularyPage.jsx` & `index.html`)
- [x] 어순 영작 단계를 사용자의 premium 3D Neobrutalism 청크 순서 배열(Arrange the sentence)로 100% 동일 구현 완료 (`ParagraphStructurePage.jsx`)
- [x] 일일 학습 성과 성취 및 동기부여 보고서(Daily Achievement Page)를 사용자의 premium 3D Neobrutalism 모바일 스크린샷 사양으로 100% 동일 구현 완료 (`VocabularyPage.jsx`)
- [x] 저시력 아동 대상 배리어 프리 및 다감각(Multi-sensory) 접근성 최종 최적화(청크 터치 시 TTS 낭독 연동 및 성취 보고서의 테마별 눈부심 방지 스키마 동화 완수) (`VocabularyPage.jsx` & `ParagraphStructurePage.jsx`)
- [x] 지문 저장 시 발생할 수 있는 데이터 오염 런타임 가드 및 무결한 자가 치유(Self-Healing) 흰 화면 퇴치 핫픽스 적용 (`App.jsx`)
- [x] 8단계 Arrange the sentence 청크 조립 퀴즈 무한 리렌더 흰 화면 크래시 완치 및 useEffect 일괄 셔플 초기화 적용 완료 (`ParagraphStructurePage.jsx`)
- [x] 첫 화면(`App.jsx`) 및 새 지문 추가 화면(`PassageInputPage.jsx`) Stitch Neobrutalism 3D premium 디자인 전면 개편 완료 (`App.jsx` & `PassageInputPage.jsx` & `index.css`)
- [x] 저시력 안구 피로 극소화(Anti-Clutter) 및 대량 지문(20~30개) 훑기 스캔성 극대화 가독 레이아웃 개편 완료 (`App.jsx`)
- [x] 지문 통찰 (Passage Insight - Stage 1/4) 화면을 사용자의 premium 3D Neobrutalism 모바일 명세서 사양으로 100% 완벽 구현 완료 (`ParagraphStructurePage.jsx`)
- [x] Structure Mode (Stage 3/4) 내 4선지 퀴즈 Neobrutalism 3D 초록색 체크(✓) 배지 장착 및 AI THOUGHT 피드백 힌트 카드 보더 solid화 완료 (`ParagraphStructurePage.jsx`)
- [x] Stitch 원본 해설지 뷰(`renderStitchView`) 빈화면 크래시 완치 및 Neobrutalism 3D premium UI 100% 동기화 업그레이드 완료 (`ParagraphStructurePage.jsx`)
- [x] Gemini API 프롬프트 엔지니어링을 통한 10대 학문 분야(과학, 수학, 인문 등) 전반 학술 어휘 망라 및 중3 이상 고난도 필터링 가드 적용 완료 (`gemini.js`)
- [x] 외부구매자료 및 모의고사 오타/노이즈 대비 JSON 정밀 정화(`cleanJsonResponse`) 및 크래시 방지용 자가치유 파서(`selfHealParsedData`) 탑재 완료 (`gemini.js`)
- [x] 청크 분석 카드 장황한 문법 팁 소거 및 시험지 기반 E+EK 1:1 직독직해 어순번역 3D 카드 리모델링 및 옥스포드 20형식/국어 겹문장 3종 분류 패널 구현 완료 (`ChunkReadingPage.jsx` & `gemini.js`)
- [x] 지문 로드 시 자동 단어 밀어넣기(`autoPopulateVocab`) 로직 영구 퇴치 및 독해 중 터치 저장 시 실시간 한글 뜻/동의어/반의어 자가 복원 보정 필터 완비 완료 (`AppContext.jsx` & `VocabularyPage.jsx` & `ParagraphStructurePage.jsx`)
- [x] Vocabulary 탭 내 Previous 버튼 클릭 시 이전 구조(Structure) 탭 강제 전환 및 Stepper 7단계 연동 완치 완료 (`VocabularyPage.jsx` & `StudyContainerPage.jsx`)
- [x] 새 지문 추가 화면 내 단순/외부 스마트 탭 완전 소거 및 한글 포함 감지 기반 실시간 자동 AI 파싱 모드 판별 라우팅 엔진 이식 완료 (`PassageInputPage.jsx`)
- [x] 구조 분석 상세/개요 화면 내 영문 명칭(STRUCTURAL BREAKDOWN) 한글 순화(영어문장블럭), EK 배지 해석 치환 및 카드별 문법 태그 배지 완전 제거 완료 (`ChunkReadingPage.jsx` & `PassageInsight.jsx` & `ParagraphStructurePage.jsx`)
- [x] 지문 입력 2단계(직독직해 매핑) 빈 카드 테두리 선 다발(가로줄 노이즈) 버그 완전 해결 및 3중 자가 치유(Self-Healing) Fallback 필터 탑재 완료 (`PassageInputPage.jsx`)
- [x] 새 지문 추가 화면의 상단 Stepper(2개 탭) 및 교사용 API Key 설정 패널 UI 완전 소거 완료 (`PassageInputPage.jsx`)
- [x] 복잡한 특수문자/대시 혼합 지문 입력 시 빈 청크("") 출현으로 발생하던 빗살무늬 가로선 찌그러짐 버그 3중 철갑 디펜시브 코딩으로 영구 해결 완료 (`textParser.js` & `PassageInputPage.jsx`)
- [x] CSS Flexbox 수축으로 인한 문장/청크 카드 찌그러짐 가로선 다발 현상 flexShrink: 0 주입으로 완치 및 splitIntoSentences 특수기호만 남은 조각 문장 분할 원천 차단 완료 (`textParser.js` & `PassageInputPage.jsx`)
- [x] AI 직독직해 한글 초안 자동 생성 버튼 클릭 시 dictMock 객체 타입 미지원 TypeError 흰 화면 크래시 완전 완치 및 타입 판별 안전 가드 장착 완료 (`PassageInputPage.jsx`)
- [x] 학습 탭바 아키텍처 다이어트(Focus, Interpretation 2대 핵심 탭으로 대폭 간소화) 및 데이팅 앱 모의고사 지문 1:1 직독직해 구절 매핑 탑재 완료 (`StudyContainerPage.jsx` & `textParser.js`)
- [x] 오프라인 지문 파싱 시 복사 붙여넣은 텍스트 내용 자동 감지 및 배경지식(Van Gogh, 과학, 충직한 개, 데이팅 앱) 동적 주입 시스템 구현 완료 (`PassageInputPage.jsx`)
- [x] 천일문 독해 Master E 표준 6대 슬래시 규칙 및 자가보정형 형태소 어순 매칭 AI 파서 기능 구현 및 탑재 완료 (`textParser.js`)
- [x] 중학교 1학년 수준 극초단 1형식, 2형식 문장 통합 및 한글 완성형 어순 자동 번역 스마트 가드 기능 구현 및 장착 완료 (`textParser.js`)
- [x] 영어문장블럭 내 해석 영역 영어 원문 복제 노출 버그 한글 감지 가드 장착 및 데이팅 앱 신규 문장 1:1 직독직해 매핑 완치 완료 (`textParser.js`)
- [x] 사람이름/기관이름 등 고유명사 원본 보존 규칙(Proper Noun Guard) 적용 및 필수 동사 번역 사전 탑재 완료 (`textParser.js` & `AppContext.jsx`)
- [x] Gemini API 모델 구버전(1.5 Flash)에서 2026년 5월 최신 플래그십 모델(`gemini-3.5-flash`)로 마이그레이션 및 API 무결성 검증 완료 (`gemini.js`)









