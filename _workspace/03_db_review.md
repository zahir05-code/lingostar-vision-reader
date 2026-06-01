# LingoStar MVP 데이터베이스 설계 사양서 (DB_Engineer)

작성일: 2026년 05월 27일

본 문서는 **LingoStar Vision Reader**의 Firebase Firestore 데이터베이스 설계, NoSQL 데이터 스키마 매핑, 실시간 동기화 쿼리 성능 최적화 및 보안 규칙을 정의합니다.

---

## 1. NoSQL 데이터 스키마 매핑 (Firestore)

NoSQL의 강점을 살려 복잡한 조인(Join) 연산 없이 하나의 영어 지문 데이터와 부가 정보(문단 요약, Chunk 분해 결과)를 한 번에 조회할 수 있는 **문서 중심 역정규화 스키마**를 설계합니다.

### 1-1. `passages` 컬렉션 (영어 지문 정보)
- **설명**: 사용자가 입력하여 등록한 영어 지문의 내용과 구문 분석(Chunk) 정보가 포함된 메인 문서입니다.
- **스키마 구조 (JSON 표현)**:
  ```json
  {
    "id": "doc_passage_001",
    "title": "The Starry Night",
    "grade": "Middle-School-3",
    "createdAt": "2026-05-27T11:25:00Z",
    "fullText": "Vincent van Gogh painted The Starry Night in 1889. It shows the view from his window.",
    "sentences": [
      {
        "index": 0,
        "text": "Vincent van Gogh painted The Starry Night in 1889.",
        "chunks": [
          { "text": "Vincent van Gogh", "meaning": "빈센트 반 고흐는", "tag": "S" },
          { "text": "painted", "meaning": "그렸다", "tag": "V" },
          { "text": "The Starry Night", "meaning": "별이 빛나는 밤을", "tag": "O" },
          { "text": "in 1889", "meaning": "1889년에", "tag": "AD" }
        ]
      },
      {
        "index": 1,
        "text": "It shows the view from his window.",
        "chunks": [
          { "text": "It shows", "meaning": "그것은 보여준다", "tag": "S+V" },
          { "text": "the view", "meaning": "전망을", "tag": "O" },
          { "text": "from his window", "meaning": "그의 창문으로부터", "tag": "AD" }
        ]
      }
    ],
    "paragraphSummaries": [
      { "paragraphIndex": 0, "summary": "반 고흐가 1889년에 그린 '별이 빛나는 밤' 작품의 배경 소개" }
    ]
  }
  ```

### 1-2. `readingProgress` 컬렉션 (사용자 읽기 진행률)
- **설명**: 기기 간 완벽한 읽기 지점 동기화를 지원하기 위해, 사용자가 현재 읽고 있는 지문과 문장의 인덱스를 실시간 기록하는 데이터입니다.
- **스키마 구조 (JSON 표현)**:
  ```json
  {
    "id": "progress_user_999",
    "userId": "firebase_auth_uid_123",
    "passageId": "doc_passage_001",
    "currentSentenceIndex": 1,
    "lastReadAt": "2026-05-27T11:27:32Z"
  }
  ```

---

## 2. 쿼리 및 오프라인 영속성 최적화

### 2-1. 안전한 데이터 CRUD
Firestore SDK는 기본적으로 인젝션(Injection) 공격이 불가능한 구조의 객체 바인딩 API를 제공하므로 안전합니다.
```javascript
// 안전한 Firestore 지문 추가 코드 예시
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const savePassage = async (userId, title, grade, fullText, parsedSentences) => {
  return await addDoc(collection(db, "passages"), {
    userId,
    title,
    grade,
    fullText,
    sentences: parsedSentences,
    createdAt: serverTimestamp()
  });
};
```

### 2-2. 오프라인 데이터 영속성 (Offline Persistence)
모바일 기기 및 웹 브라우저의 불안정한 네트워크 환경에서도 데이터가 유실되지 않도록 Firestore 오프라인 영속성 옵션을 적극 활성화합니다.
```javascript
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
```

---

## 3. Firebase 보안 규칙 (Firestore Security Rules)
사용자의 민감 정보와 학습 진행 데이터를 타인이 조작하거나 훔쳐보지 못하도록 강력하게 통제합니다.
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자는 지문을 누구나 등록하고 읽을 수 있으나, 삭제/수정은 본인 작성만 허용
    match /passages/{passageId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    // 읽기 진행률은 로그인한 본인의 데이터만 접근 가능
    match /readingProgress/{progressId} {
      allow read, write: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```
