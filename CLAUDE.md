# CLAUDE.md - LingoStar Vision Reader 프로젝트 가이드

이 파일은 **LingoStar Vision Reader** 프로젝트의 메인 가이드라인이자, 프로젝트 내 전문가 에이전트 팀(하네스)을 트리거하는 포인터입니다.

---

## 1. 프로젝트 개요
- **목적**: 저시력 학생을 위한 접근성 중심 영어 학습 보조 웹앱.
- **핵심 목표**: 화면 정보 과부하를 줄이고, 큰 폰트와 청크 단위 리딩을 통해 영어 지문을 편하게 읽을 수 있도록 지원합니다.

## 2. 대상 사용자 (Target Audience)
- 시력 저하, 빛번짐, 좁은 시야 등으로 인해 일반적인 크기의 웹 화면에서 영어 지문을 읽기 어려운 학생.

## 3. 핵심 기능 (MVP Phase 1)
- **집중 읽기 모드 (Focus Mode)**: 화면에 단 하나의 핵심 문장만 거대하게 표시 (최대 64px), 미니맵 제공.
- **청크 읽기 모드 (Chunk Mode)**: 구/절 단위로 쪼개어 수직 배열하여 시선 이동 최소화.
- **접근성 테마 (Accessibility Themes)**: 고대비, 빛번짐 방지 등 맞춤형 5종 테마 제공.
- **거대 터치 인터페이스 (Mega UI)**: 터치 오작동 방지를 위해 최소 72px 높이의 큰 버튼 배치.

## 4. 기술 스택 & 프로젝트 구조
- **Frontend**: React, Vite
- **Styling**: Vanilla CSS (CSS Variables 기반 테마)
- **Data**: Firebase Firestore (실시간 클라우드 동기화)
- **Structure**:
  ```text
  c:/Users/User/Desktop/5.18바이브코딩/
  ├── src/
  │   ├── components/  # 재사용 가능한 UI 요소
  │   ├── pages/       # 핵심 화면들 (Home, Focus, Chunk 등)
  │   ├── styles/      # 디자인 시스템 CSS
  │   └── App.jsx
  ├── docs/            # 기획 및 설계 문서 (PROJECT_GUIDE.md, DATA_MODEL.md 등)
  │   └── PROJECT_GUIDE.md # [마스터] 기획서 & 개발 레퍼런스 가이드
  ├── .claude/
  │   ├── agents/      # 하네스 전문가 에이전트 정의 (.md)
  │   └── skills/      # 하네스 에이전트용 스킬 (SKILL.md)
  ├── CLAUDE.md        # [본 파일] 프로젝트 가이드
  ├── UPDATE_LOG.md    # 변경 이력 기록
  └── TASK_CHECKLIST.md # MVP 태스크 목록
  ```

---

## 5. 하네스 (Harness): 전문가 팀 시스템

이 프로젝트는 초보자가 쉽게 고품질 웹앱을 개발하고 검증할 수 있도록 5인의 전문가 에이전트(기획, 아키텍처, DB, UI/UX, QA)로 구성된 **최소 구조 하네스**를 탑재하고 있습니다.

### 트리거 규칙
> [!IMPORTANT]
> 기획 검토, 시스템 구조 설계, 데이터베이스 설계, UI/UX 개선, QA/테스트 계획 및 검증 등의 **구조적인 작업**이나 **전문가 검토**가 필요할 때는 반드시 하네스 오케스트레이터 스킬인 `harness-orchestrator`를 사용하십시오.
> - **명령어 예시**: "기획/아키텍처 전문가 팀을 가동해서 이번 변경 사항을 검토해줘." 또는 "하네스를 사용해서 DB 모델과 UI를 개선해줘."
> - 단순 텍스트 수정이나 단일 파일 버그 수정 등 가벼운 작업은 하네스를 쓰지 않고 직접 처리합니다.

### 하네스 에이전트 구성
1. **Planner (기획)**: 비즈니스 요구사항 파악, PRD 작성 및 기획 타당성 검증.
2. **Architect (아키텍처)**: 컴포넌트 구조, 모듈 의존성, React 아키텍처 타당성 검증.
3. **DB Engineer (데이터베이스)**: Firebase Firestore 데이터 구조 설계 및 쿼리 효율성 검증.
4. **UI/UX Designer (디자인)**: 접근성 가이드라인 준수, Vanilla CSS 및 레이아웃 검증.
5. **QA Tester (품질 보증)**: 컴포넌트 인터페이스 검증, 엣지 케이스 및 사용자 시나리오 테스트.

### 하네스 변경 이력
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-27 | 하네스 초기 구성 (5대 전문가 팀 설계 및 탑재) | 전체 하네스 시스템 | 프로젝트 설계 및 검증 자동화 목적 |
| 2026-05-29 | 12대 전문가 하네스 감사 완료 | 전체 시스템 | 아키텍처 및 기획/보안/DB 전방위 정밀 진단 |
| 2026-05-29 | 단어 훈련 컴포넌트(WordsTraining) 분리 | ParagraphStructurePage | 149KB 공룡 컴포넌트 분할 모듈화 1단계 |
| 2026-05-29 | 지문 통찰 컴포넌트(PassageInsight) 분리 | ParagraphStructurePage | 컴포넌트 모듈화 2단계 (Step 2 분리 완료) |
| 2026-05-29 | 성분 분석 컴포넌트(SentenceStructure) 분리 | ParagraphStructurePage | 컴포넌트 모듈화 3단계 (Step 4 분리 및 커스텀 지문 ReferenceError 버그 완치) |
| 2026-05-29 | 단어장 오프라인 백업 및 복원 기능 구현 | VocabularyPage | 클라우드 미사용 로컬 전용 파일 다운로드/업로드 |
| 2026-05-29 | Gemini AI 연동 동적 사전 및 외부자료 해독기 구현 | PassageInputPage, ParagraphStructurePage | B안 연동 및 외부 유료자료 스마트 복사해독(Smart Import) 엔진 장착 |
| 2026-05-29 | Gemini 학술 어휘 다중 도메인 망라 및 중3 이상 필터 가드 구축 | gemini.js | 사용자의 다양한 학술 분야(과학, 수학 등) 지원 및 기초단어(the, is 등) 철저 배제 |
| 2026-05-29 | 스마트 임포트 안정성 극대화를 위한 자가 치유 파서 및 JSON 정화 탑재 | gemini.js | 외부 복사 자료 오타/백틱 노이즈 정밀 정화 및 키 누락 시 UI 크래시 완치 가드 구축 |
| 2026-05-29 | 청크 문법설명 소거, E+EK 1:1 어순번역 및 옥스포드 20형식 분석배지 가동 | ChunkReadingPage.jsx, gemini.js | 저시력 안구 피로 유발 장황 문법 팁 소거 및 시험지 E+EK 1:1 감성 & OALD 20패턴 탑재 |
| 2026-05-29 | 자동 단어 채우기 완소 및 모르는 단어 수동 터치 한글뜻/동반의어 복원 가동 | AppContext.jsx, VocabularyPage.jsx | 무단 simple word 자동삽입 제거 및 터치 시 사전 데이터 동적 보정매핑 탑재 |
| 2026-05-29 | 어휘 탭 Previous 뒤로가기 클릭 시 구조 분석 탭 전환 및 Stepper 연계 완치 | StudyContainerPage.jsx, VocabularyPage.jsx | 탭 스위칭 누락으로 인한 Previous 버튼 동결 UX 완치 및 구조 7단계 복귀 연계 |
| 2026-05-29 | Gemini API 모델 최신화 (gemini-1.5-flash ➔ gemini-3.5-flash) | gemini.js | 구글 AI Studio 무료 티어의 최신 플래그십 Flash 모델로 연동 엔드포인트 마이그레이션 |
| 2026-06-01 | 고등 어법 요약 엔진 쇄신 (S-V-O-M 완전 폐기) | textParser.js, PassageInputPage.jsx, ParagraphStructurePage.jsx | 가독성 저해 요소(S-V-O-M, 마크다운 별표)를 완벽 제거하고 간결한 단일 행 출제어법 요약 포맷으로 구조화 |
| 2026-06-01 | 자연스러운 어순 직역 교정 및 물결표(~) 기호 전면 제거 | gemini.js, textParser.js | 기계적 조사와 물결표(~)를 전면 배제하고 의미 단위 중심의 자연스러운 한글 직독직해 구현 |

---

## 6. 개발 및 실행 규칙
- **Vanilla CSS 테마**: CSS Variables(`src/styles/`)를 적극 활용하여 테마를 일관성 있게 관리합니다.
- **보안**: API 키와 민감한 설정 정보는 절대 코드에 직접 적지 않고 `.env` 파일을 사용합니다.
- **신중한 편집**: 코드 수정 시 변경이 필요한 최소 단위만 정확하게 편집(surgical edit)하여 다른 기능의 부작용을 방지합니다.
