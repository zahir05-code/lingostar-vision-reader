# 07. 데이터 모델 설계 문서 (DATA_MODEL.md) (LingoStar Vision Reader)

작성일: 2026년 05월 28일

본 문서는 **LingoStar Vision Reader**에서 사용하는 Firebase Firestore NoSQL 클라우드 데이터베이스 구조 및 브라우저 로컬 저장소(LocalStorage)의 데이터 스키마 명세를 정의합니다. 저시력 학습자의 학습 데이터 보존 및 기기 간 동기화를 위해 정밀하게 설계되었습니다.

---

## 1. Firebase Firestore 스키마 명세

Firestore는 컬렉션(Collection)과 문서(Document) 기반의 NoSQL 데이터베이스입니다. 본 서비스는 지문(Passage) 데이터를 저장하고 실시간으로 동기화하기 위해 `passages` 컬렉션을 사용합니다.

### 1-1. `passages` 컬렉션
각 지문 문서는 하나의 지문에 대한 원문과 분할된 문장, 구문 분석 청크(Chunk) 데이터를 포함하여, 단 한 번의 조회로 완벽한 화면 렌더링이 가능한 **역정규화 평탄화(Flat) 모델**을 채택하고 있습니다.

- **경로**: `/passages/{passageId}`

| 필드명 | 데이터 타입 | 설명 |
| :--- | :--- | :--- |
| `id` | String | 문서 고유 ID (Firestore 자동 생성 또는 로컬 백업용 `local-timestamp` 포맷) |
| `title` | String | 영어 지문의 제목 (기본값: "제목 없음") |
| `grade` | String | 추천 학년 및 난이도 (기본값: "일반") |
| `fullText` | String | 지문의 정제 완료된 영어 원문 전체 |
| `createdAt` | Timestamp | 지문 생성 일시 (서버 시간 기준, `serverTimestamp()`) |
| `sentences` | Array (Object) | 정밀 파싱된 문장 구조 배열 |
| `paragraphSummaries` | Array (String) | 문단별 1줄 구조 압축 요약본 (추후 확장용) |

### 1-2. `sentences` 내부 객체 스키마

`sentences` 배열의 각 원소는 문장 단위 데이터 및 의미 덩어리(Chunk) 정보를 포함합니다.

| 필드명 | 데이터 타입 | 설명 |
| :--- | :--- | :--- |
| `index` | Number | 문장 순서 인덱스 (0-indexed) |
| `text` | String | 분할된 순수 영어 문장 원문 |
| `chunks` | Array (Object) | 시각적 끊어읽기를 돕는 구절 단위 배열 |

### 1-3. `chunks` 내부 객체 스키마

`chunks` 배열의 각 원소는 의미를 가지는 최소 구절 단위 정보와 간이 구문 태그(Tag), 그리고 한국어 직독직해 매핑 데이터를 가집니다.

| 필드명 | 데이터 타입 | 설명 |
| :--- | :--- | :--- |
| `text` | String | 청크 단위 영어 어휘/구절 (예: "in 1889") |
| `meaning` | String | 실시간 룰 기반 엔진 또는 AI가 매핑한 1:1 직독직해 한글 번역 |
| `tag` | String | 구문 문법 성분 분류 태그 (S+V, O/C, to-Inf, CONJ, PREP, AD 중 하나) |

---

## 2. LocalStorage 캐시 및 오프라인 영속성 스키마

사용자별 설정을 격리하고, 인터넷 오프라인 상태에서도 학습 끊김이나 데이터 유실이 없도록 브라우저 로컬 저장소에 사용자 단위의 UID 기반 상태를 백업 캐싱합니다.

- **키 생성 규칙**: `lingostar_user_{uid || 'guest_user'}_{key}`

### 2-1. 사용자 설정 데이터 (User Settings)

| LocalStorage 키 (`{key}`) | 데이터 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `theme` | String | `'light'` | 시각 접근성 테마 (`light`, `dark`, `yellow`, `blue-soft`, `high-contrast`) |
| `fontSize` | Number | `40` | 중앙 핵심 텍스트의 크기 (범위: 24px ~ 120px) |
| `letterSpacing` | Number | `2` | 저시력 전용 텍스트의 자간 (범위: 1px ~ 5px) |
| `lineHeight` | Number | `2.0` | 텍스트의 줄간격 (범위: 1.8 ~ 3.0) |
| `brightness` | Number | `0` | 화면 눈부심 방지를 위한 블랙 암막 필터 투명도 (범위: 0% ~ 70%) |
| `isInvert` | Boolean | `false` | 특수 시각 대비를 위한 색상 반전 필터 적용 여부 |
| `isGrayscale` | Boolean | `false` | 시각 자극 완화를 위한 흑백 모드 적용 여부 |
| `ttsRate` | Number | `1.0` | 원어민 발음 낭독(TTS) 재생 배속 (0.7x, 1.0x, 1.3x) |

### 2-2. 사용자 학습 진척도 데이터 (Learning Progress)

| LocalStorage 키 (`{key}`) | 데이터 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `activePassage` | Object | `null` | 현재 학습을 활성화하여 진행 중인 Passage 객체 전체 백업 |
| `currentSentenceIndex` | Number | `0` | 현재 지문에서 집중 학습 중인 문장 인덱스 위치 |
| `readingCounts` | Object | `{}` | 6단계 8회독 챌린지의 문장별 다독 회독수 기록 (`{ "sentenceIndex": readCount }` 구조) |

### 2-3. 나만의 단어 및 숙어장 데이터 (`myVocab`)

본문 텍스트 터치/드래그 또는 지문 로드 시 자동 추출된 나만의 단어/숙어 목록 데이터 세트입니다.

- **키**: `lingostar_user_{uid}_myVocab`
- **데이터 타입**: `Array (Object)`

각 단어 객체의 세부 스키마는 다음과 같습니다:

| 필드명 | 데이터 타입 | 설명 |
| :--- | :--- | :--- |
| `word` | String | 저장된 영어 단어 또는 다중 선택 숙어 (예: "look forward to") |
| `meaning` | String | 사전(`dictMock`)에 내장되거나 유추된 한글 뜻 |
| `synonyms` | String | 뜻이 비슷한 단어 목록 (동의어) |
| `antonyms` | String | 뜻이 반대인 단어 목록 (반의어) |
| `similarIdioms` | String | 유사 의미를 가진 이디엄/숙어 연계 정보 |
| `sentence` | String | 해당 단어가 쓰였던 본문 지문 문장 예문 (복습 시 문맥 파악 목적) |
| `addedAt` | String | 단어장에 등록된 일시 (ISO 8601 String) |

---

## 3. 데이터 보안 및 쿼리 최적화 정책

1. **SQL Injection 방어**:
   모든 동적 쿼리는 Firebase SDK에서 자체 제공하는 객체 지향형 **매개변수화 쿼리(Parameterized Queries)** 방식으로 수행되어, 임의의 악성 스크립트 실행이나 인젝션 해킹 위협을 완전히 차단합니다.
   
2. **실시간 데이터 동기화**:
   학습 진척도 및 지문 로드 시 `AppProvider` 상태와 `LocalStorage` 백업본이 항상 정합성을 가지고 상호 동기화됩니다.
   
3. **네트워크 장애 방어(Offline First)**:
   인터넷 연결이 중단된 경우 Firestore SDK는 자체 `Persistent Cache` 설정을 통해 작동하며, 텍스트 저장/삭제 시 즉시 `LocalStorage`로 분기(Fallback)하여 백업을 갱신하고 연결 복구 시 동기화됩니다.
