import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  collection,
  addDoc,
  getDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';

// 1. 환경 변수 안전 로딩
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 2. 초기화 및 로컬 캐싱 영속화 활성화
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// ==========================================================================
// LingoStar DB CRUD 헬퍼 함수
// ==========================================================================

export const uploadPassage = async (userId, parsedPassage) => {
  try {
    const docRef = await addDoc(collection(db, "passages"), {
      userId,
      ...parsedPassage,
      createdAt: serverTimestamp()
    });
    console.log("Passage successfully uploaded to Firestore. ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error uploading passage to Firestore:", error);
    throw error;
  }
};

export const getPassage = async (passageId) => {
  try {
    const docRef = doc(db, "passages", passageId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("요청하신 영어 지문 데이터를 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("Error getting passage from Firestore:", error);
    throw error;
  }
};

export default app;
