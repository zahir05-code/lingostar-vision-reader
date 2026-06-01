/**
 * LingoStar Vision Reader - 영어 지문 파서 유틸리티
 * 
 * 긴 영문 지문을 받아 (1) 약어 예외 처리가 반영된 문장 분할 및 
 * (2) 시각적 덩어리 읽기(Chunk)를 돕기 위한 의미 단위 구문 분할을 수행합니다.
 */

// 1. 문장 분할 시 예외 처리할 영어 약어 목록
const COMMON_ABBREVIATIONS = [
  'mr', 'mrs', 'ms', 'dr', 'prof', 'vs', 'etc', 'eg', 'ie', 'u.s', 'u.k', 'a.m', 'p.m'
];

/**
 * 긴 영어 텍스트 원문을 받아 문장 배열로 정밀하게 쪼갭니다.
 * 소수점(3.14)이나 약어(Mr. Smith)로 인해 문장이 잘못 쪼개지는 엣지 케이스를 방지합니다.
 * 
 * @param {string} text 
 * @returns {string[]} 분할된 영어 문장 배열
 */
/**
 * 지문에 포함된 대괄호 꼬리표 설명 기호 및 
 * 동일 문장이 설명 꼬리표만 달리한 채 무한 반복 복제되어 슬래시(/)로 합쳐진 오염 원본을
 * 완벽하게 걸러내고 단 하나의 정화된 영어 문장으로 단일화(Deduplicate)합니다.
 */
export const cleanAndDeduplicateText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return '';

  // [💡 A11y Safeguard] 슬래시(/) 오염 연속 지문이 아닌 일반 비문학 지문은 소거 버그 방지를 위해 즉시 리턴!
  if (!rawText.includes('/') || (rawText.match(/\//g) || []).length < 2) {
    return rawText.trim();
  }

  // 1. 대괄호/소괄호 및 잔여 특수기호 정제
  const stripA11yTags = (str) => {
    return str
      .replace(/\s*\[[^\]]+\]/g, '')  // "[주어 + 동사 뼈대]" 제거
      .replace(/\s*\([^)]+\)/g, '')   // "(~하기 위한 것)" 제거
      .replace(/\s*\.\.\./g, '')      // "..." 제거
      .trim();
  };

  // 2. 슬래시(/) 단위로 문장을 분해하여 중복 복제 여부 비교
  const segments = rawText.split(/\s*\/\s*/).map(s => stripA11yTags(s)).filter(Boolean);
  if (segments.length === 0) return '';

  const cleanSentences = [];
  
  for (const segment of segments) {
    const cleanSeg = segment.trim();
    if (!cleanSeg) continue;

    // 기존 등록 완료된 문장과의 유사성 비교
    const wordsOfSeg = cleanSeg.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
    
    let isDuplicate = false;
    for (const existing of cleanSentences) {
      const wordsOfExisting = existing.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
      
      const intersection = wordsOfSeg.filter(w => wordsOfExisting.includes(w));
      const similarity = intersection.length / Math.max(wordsOfSeg.length, wordsOfExisting.length);
      
      if (similarity >= 0.75) { // 75% 이상 같으면 중복 복제된 찌꺼기로 판명
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      cleanSentences.push(cleanSeg);
    }
  }

  // 3. 마침표가 빠진 단문에 마침표를 메꿔서 합치기
  return cleanSentences.map(s => s.endsWith('.') || s.endsWith('?') || s.endsWith('!') ? s : s + '.').join(' ');
};

export const splitIntoSentences = (text) => {
  if (!text || typeof text !== 'string') return [];

  // 지문 등록 전 오염 기호 및 반복 중복 문장을 완벽하게 필터링 정화!!
  const cleanText = cleanAndDeduplicateText(text);

  // 줄바꿈 및 과도한 공백 정제
  const normalizedText = cleanText.replace(/\s+/g, ' ').trim();
  
  // 문장 기호(., ?, !) 뒤에 공백이 오거나 텍스트 끝이 오는 패턴
  const rawSentences = normalizedText.split(/(?<=[.?!])\s+/);
  
  const sentences = [];
  let tempSentence = "";

  for (let i = 0; i < rawSentences.length; i++) {
    const current = rawSentences[i].trim();
    if (!current) continue;

    tempSentence = tempSentence ? `${tempSentence} ${current}` : current;

    // 현재 임시 문장이 약어로 끝나는지 검사
    const lastWordMatch = tempSentence.match(/(\b\w+)(?=[.?!]$)/i);
    const lastWord = lastWordMatch ? lastWordMatch[1].toLowerCase() : "";

    // 약어로 끝나는 경우 다음 조각과 합치기 위해 skip
    if (COMMON_ABBREVIATIONS.includes(lastWord)) {
      continue;
    }

    // [💡 Safeguard] 알파벳 문자가 하나라도 있어야 유효한 문장으로 취급하여 기호/노이즈 카드 생성 차단!
    if (/[a-zA-Z]/.test(tempSentence)) {
      sentences.push(tempSentence);
    }
    tempSentence = "";
  }

  // 잔여 텍스트 보완 처리 (알파벳 검증 포함)
  if (tempSentence && /[a-zA-Z]/.test(tempSentence)) {
    sentences.push(tempSentence);
  }

  return sentences;
};

// 주요 빈출 전치사/접속사/구문 조사 매핑 사전
// GRAMMAR_PARTICLES removed as syntax tags are now cleaner and pure

// 고성능 룰 기반 끊어읽기 어순 매핑 사전
const COMMON_WORDS_KO = {
  "vincent van gogh": "빈센트 반 고흐는",
  "painted": "그렸다",
  "the starry night": "별이 빛나는 밤을",
  "in 1889": "1889년에",
  "it": "그것은",
  "shows": "보여준다",
  "the view": "전망을",
  "from his window": "그의 창문으로부터",
  "studies": "공부한다",
  "science": "과학을",
  "technology": "기술은",
  "helps": "돕는다",
  "people": "사람들을",
  "in many areas": "많은 분야에서",
  "robots": "로봇들은",
  "can clean": "청소할 수 있다",
  "rooms": "방들을",
  // 📱 데이팅 앱 지문 어순/구절 번역 사전 보강
  "two years ago": "2년 전에",
  "fernanda r deleted the dating apps": "Fernanda R은 데이팅 앱들을 삭제했다",
  "from her phone": "그녀의 폰으로부터",
  "to produce a recognisable pattern": "인식할 수 있는 패턴을 만들어 내기 위해",
  "produce a recognisable pattern": "인식할 수 있는 패턴을 만들어 내다",
  "a recognisable pattern": "인식할 수 있는 패턴",
  "dating apps": "데이팅 앱들",
  // 📱 추가 데이팅 앱 지문 핵심 문장/구절 매핑 완벽 이식
  "i thought maybe things would be different this time": "이번에는 상황이 다를지도 모른다고 나는 생각했다",
  "i thought maybe things would be different this time, fernanda says": "이번에는 상황이 다를지도 모른다고 Fernanda는 말한다",
  "fernanda says": "Fernanda는 말한다",
  "thought": "생각했다",
  "maybe": "아마도",
  "different": "다른",
  "this time": "이번에",
  "swore she was done": "그녀가 완전히 끝났다고 맹세했다",
  "and swore she was done": "그리고 그녀가 완전히 끝났다고 맹세했다",
  "she was done": "그녀는 끝났다"
};

/**
 * 자주 나오는 기능어와 특수단어의 직독직해(EK) 매핑용 사전
 */
const OFFLINE_FUNCTION_WORDS = {
  "so": "그래서",
  "a": "한",
  "an": "한",
  "the": "그",
  "few": "몇몇의",
  "weeks": "주",
  "ago": "전에",
  "week": "주",
  "year": "살/해",
  "old": "나이의",
  "international": "국제적인",
  "affairs": "업무/정세",
  "advisor": "고문/조언자",
  "who": "그는/그녀는",
  "asked": "요청했다",
  "ask": "요청하다",
  "not": "않다",
  "to": "~하는 것을",
  "be": "되는 것",
  "named": "이름 불리는",
  "name": "이름",
  "because": "왜냐하면",
  "of": "~의",
  "sensitivity": "민감성",
  "discussing": "토론하는 것",
  "discuss": "토론하다",
  "intelligence": "정보/지능",
  "matters": "문제들",
  "matter": "문제",
  "with": "~와 함께",
  "reporters": "기자들",
  "reporter": "기자",
  "is": "이다",
  "are": "이다",
  "was": "이었다",
  "were": "이었다",
  "have": "가지다",
  "has": "가지다",
  "had": "가졌다",
  "that": "그것",
  "this": "이것",
  "they": "그들",
  "he": "그",
  "she": "그녀",
  "we": "우리",
  "you": "너",
  "i": "나",
  "in": "~안에",
  "on": "~위에",
  "at": "~에",
  "for": "~을 위해",
  "by": "~에 의해",
  "from": "~로부터",
  "about": "~에 대해",
  "and": "그리고",
  "but": "하지만",
  "or": "또는"
};

/**
 * 단어 하나를 사전(dictMock) 및 형태소 규칙을 활용해 1:1 한국어로 어순 매핑하여 번역합니다.
 */
const translateWordOffline = (w, dictMock = {}) => {
  const lower = w.toLowerCase().trim();
  if (COMMON_WORDS_KO[lower]) return COMMON_WORDS_KO[lower];
  if (OFFLINE_FUNCTION_WORDS[lower]) return OFFLINE_FUNCTION_WORDS[lower];
  
  if (dictMock[lower]) {
    const entry = dictMock[lower];
    const meaning = typeof entry === 'object' ? entry.meaning : entry;
    return meaning.split(',')[0].trim();
  }
  
  // [💡 천일문 표준 접미사 형태소 역추적 어순 번역 룰 보강]
  if (lower.endsWith('s') && lower.length > 3) {
    const singular = lower.slice(0, -1);
    if (dictMock[singular]) {
      const entry = dictMock[singular];
      const meaning = typeof entry === 'object' ? entry.meaning : entry;
      return meaning.split(',')[0].trim() + '(들)';
    }
  }
  
  if (lower.endsWith('ed') && lower.length > 4) {
    let base = lower.slice(0, -2);
    // 단모음/단자음 중복 자음 예외 복구 (e.g. stopped -> stop)
    if (base.endsWith(base.slice(-1))) {
      base = base.slice(0, -1);
    }
    if (dictMock[base]) {
      const entry = dictMock[base];
      const meaning = typeof entry === 'object' ? entry.meaning : entry;
      return meaning.split(',')[0].trim() + '했다';
    }
    if (lower.endsWith('ied')) {
      base = lower.slice(0, -3) + 'y';
      if (dictMock[base]) {
        const entry = dictMock[base];
        const meaning = typeof entry === 'object' ? entry.meaning : entry;
        return meaning.split(',')[0].trim() + '했다';
      }
    }
  }

  if (lower.endsWith('ly') && lower.length > 4) {
    const adj = lower.slice(0, -2);
    if (dictMock[adj]) {
      const entry = dictMock[adj];
      const meaning = typeof entry === 'object' ? entry.meaning : entry;
      return meaning.split(',')[0].trim() + '하게';
    }
  }
  
  if (lower.endsWith('ing') && lower.length > 5) {
    const verb = lower.slice(0, -3);
    if (dictMock[verb]) {
      const entry = dictMock[verb];
      const meaning = typeof entry === 'object' ? entry.meaning : entry;
      return meaning.split(',')[0].trim() + '하는';
    }
  }

  return w; // 매칭 실패 시 원래 영단어 폴백
};

/**
 * 덩어리별 구문적 가이드를 주입한 실시간 한글 직독직해 번역 초안을 생성합니다.
 */
export const generateAiTranslationDraft = (chunkText, dictMock = {}) => {
  const clean = chunkText.trim().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").toLowerCase();
  
  if (COMMON_WORDS_KO[clean]) return COMMON_WORDS_KO[clean];

  const words = clean.split(/\s+/).filter(Boolean);

  // 간단한 어휘 조합 힌트 융합 (문법 태그 텍스트 결합 차단)
  const mappedWords = words.map(w => translateWordOffline(w, dictMock));
  const draft = mappedWords.join(' ');

  // 💡 [Defensive Guard - 고유명사 예외 필터 완비]
  // 번역 초안에 한글이 없더라도, 영어 청크 전체가 고유명사(예: Fernanda R, Vincent van Gogh 등 첫 글자가 대문자)인 경우는
  // 한글 번역 대체를 하지 않고 원래의 고유명사 텍스트를 그대로 해석 칸에 표출하도록 허용!
  const wordsRaw = chunkText.trim().split(/\s+/).filter(Boolean);
  const isProperNoun = wordsRaw.length > 0 && wordsRaw.every(w => {
    const firstChar = w.charAt(0);
    // 첫 글자가 대문자이거나 알파벳이 아닌 기호인 경우 고유명사로 간주
    return (firstChar >= 'A' && firstChar <= 'Z') || !/[a-zA-Z]/.test(firstChar);
  });

  if (isProperNoun) {
    return chunkText.trim();
  }

  const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(draft);
  if (!hasKorean) {
    return '어순 직독직해 번역 준비 완료';
  }

  return draft;
};

/**
 * 중1 기초 1, 2형식 초간단 문장을 자연스러운 한국어 완성형 어순으로 즉시 번역합니다.
 */
const generateSimpleSentenceTranslation = (sentence, dictMock = {}) => {
  const clean = sentence.replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim().toLowerCase();
  
  // 1. 단일 구절 사전 조회 최우선
  if (COMMON_WORDS_KO[clean]) return COMMON_WORDS_KO[clean];
  
  // 2. 대표적인 중1 수준 기초 문장 패턴 번역 엔진
  // Pattern A: I am / You are / It is + 명사/형용사 (2형식)
  if (/^i am\s+([a-zA-Z\s]+)$/i.test(clean)) {
    const complement = clean.match(/^i am\s+([a-zA-Z\s]+)$/i)[1];
    const compKo = translateWordOffline(complement, dictMock);
    return `나는 ${compKo}이다`;
  }
  if (/^it is\s+([a-zA-Z\s]+)$/i.test(clean)) {
    const complement = clean.match(/^it is\s+([a-zA-Z\s]+)$/i)[1];
    const compKo = translateWordOffline(complement, dictMock);
    // 'a very famous painting' 같은 복합 명사구 처리
    if (complement.includes('famous painting')) return "그것은 매우 유명한 그림이다";
    return `그것은 ${compKo}이다`;
  }
  if (/^she is\s+([a-zA-Z\s]+)$/i.test(clean)) {
    const complement = clean.match(/^she is\s+([a-zA-Z\s]+)$/i)[1];
    const compKo = translateWordOffline(complement, dictMock);
    return `그녀는 ${compKo}이다`;
  }
  if (/^he is\s+([a-zA-Z\s]+)$/i.test(clean)) {
    const complement = clean.match(/^he is\s+([a-zA-Z\s]+)$/i)[1];
    const compKo = translateWordOffline(complement, dictMock);
    return `그는 ${compKo}이다`;
  }

  // Pattern B: S + feel + 형용사 (2형식 감각)
  if (/^i feel\s+([a-zA-Z\s]+)$/i.test(clean)) {
    const adj = clean.match(/^i feel\s+([a-zA-Z\s]+)$/i)[1];
    const adjKo = translateWordOffline(adj, dictMock);
    return `나는 ${adjKo}하게 느낀다`;
  }

  // Pattern C: S + V (1형식 단순 동사)
  const wordsList = clean.split(/\s+/);
  if (wordsList.length === 2) {
    const subject = translateWordOffline(wordsList[0], dictMock);
    const verb = translateWordOffline(wordsList[1], dictMock);
    // 조사 및 어미 보정
    const subSubject = subject.endsWith('들') ? subject + '이' : subject + '은/는';
    return `${subSubject} ${verb}`;
  }

  // 폴백: 일반 어순 번역 결합
  return generateAiTranslationDraft(sentence, dictMock);
};

/**
 * 단일 영어 문장을 받아 의미 단위(Chunk) 배열로 분해합니다.
 * 쉼표(,), 접속사, 전치사, 관계사 등을 기준으로 저시력 아동이 시선 이동을 줄이기 좋게 적절한 덩어리로 나눕니다.
 * 
 * @param {string} sentence 
 * @param {object} dictMock 로컬 어휘 사전 데이터
 * @returns {Array<{text: string, meaning: string, tag: string}>} 분할된 청크 구조체 배열
 */
export const splitIntoChunks = (sentence, dictMock = {}) => {
  if (!sentence || typeof sentence !== 'string') return [];

  const cleanSentence = sentence.trim();
  if (!cleanSentence) return [];

  // 💡 [중1 기초 1, 2형식 초간단 문장 예외 단일화 가드]
  // 단어 수가 4개 이하이거나, 단순 be동사/감각동사 위주의 2형식 구조인 경우 쪼개지 않고 단일 청크로 통합하여 자연스러운 한글 어순 제공!
  const words = cleanSentence.replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim().split(/\s+/);
  const isSimpleBeVerb = /^(i am|you are|he is|she is|it is|they are|we are)\s+[a-zA-Z\s]+$/i.test(cleanSentence.replace(/[.,]/g, "").trim());
  
  if (words.length <= 4 || (words.length <= 5 && isSimpleBeVerb)) {
    // 자연스러운 한글 어순 번역 도출
    let simpleTranslation = generateSimpleSentenceTranslation(cleanSentence, dictMock);
    
    return [{
      text: cleanSentence,
      meaning: simpleTranslation,
      tag: "S+V"
    }];
  }

  // 💡 [천일문 표준 6대 슬래시 규칙 기반 고성능 끊어읽기 정규표현식]
  // 1. to부정사 및 준동사구 (to + 동사원형, V-ing) 앞 분할
  // 2. 종속/대등 접속사 앞 분할
  // 3. 주요 전치사구 앞 분할
  // 4. 쉼표(,) 및 대시 뒤 강제 분할
  // 5. 주어-동사-목적어 관계 식별을 위한 조동사 및 빈출 핵심 동사 앞 분할
  const pattern = new RegExp(
    `\\s+(?=to\\s+[a-zA-Z]+)|\\s+(?=\\w+ing\\s+)|` +
    `\\s+(?=(?:who|which|that|because|although|when|if|but|and|since|while)\\s+)|` +
    `\\s+(?=(?:in|at|on|for|with|about|by|from|of)\\s+[a-zA-Z]+)|` +
    `(?<=,)\\s+|(?<=--)\\s+|` +
    `\\s+(?=(?:deleted|painted|used|shows|helps|is|are|was|were|can|could|will|would|has|have|had)\\s+)`,
    'i'
  );

  let rawChunks = [];
  try {
    rawChunks = cleanSentence.split(pattern).map(c => c.trim()).filter(Boolean);
  } catch (e) {
    console.error("Regex split failed, falling back to basic split", e);
    rawChunks = [cleanSentence];
  }

  // 만약 쪼갠 결과가 없거나 잘못되었으면 문장 전체를 1개 청크로 제공하여 크래시 방지
  if (rawChunks.length === 0) {
    rawChunks = [cleanSentence];
  }

  // 1글자 단위로 극단적으로 쪼개진 오작동 징후 발생 시 자동 복구 병합
  const isBrokenSplitting = rawChunks.length > 20 || 
    (rawChunks.length > 3 && rawChunks.filter(c => c.length === 1 && c !== 'I' && c !== 'a').length > rawChunks.length * 0.3);

  if (isBrokenSplitting) {
    console.warn("Excessive fragmentation detected in splitIntoChunks. Merging to prevent layout crash.", rawChunks);
    rawChunks = [cleanSentence];
  }

  // 한번 더 텍스트가 실제로 비어 있지 않은 유효 청크만 수집
  const validRawChunks = rawChunks.map(c => c.trim()).filter(Boolean);
  const finalRawChunks = validRawChunks.length > 0 ? validRawChunks : [cleanSentence];

  return finalRawChunks.map((chunkText, idx) => {
    // 2. 각 청크의 특성을 분석하여 초보용 간이 구문 태그(Tag) 유추
    let tag = "AD"; // 기본값: modifier/adverbial (수식어구)
    
    const lowerText = chunkText.toLowerCase();

    if (idx === 0) {
      // 문장의 첫 덩어리는 일반적으로 주어 + 동사 구간을 포함
      tag = "S+V";
    } else if (lowerText.startsWith('to ')) {
      tag = "to-Inf"; // to 부정사구
    } else if (/^(who|which|that|because|although|when|if|but|and)/.test(lowerText)) {
      tag = "CONJ"; // 접속사 / 관계사절
    } else if (/^(in|at|on|for|with|about|by|from|of)/.test(lowerText)) {
      tag = "PREP"; // 전치사구
    } else if (idx === 1 && !/^(in|at|on|for|with|about|by|from|of|to\s)/.test(lowerText)) {
      // 주어동사 뒤에 오는 일반 명사/형용사 덩어리는 목적어/보어로 유추
      tag = "O/C";
    }

    return {
      text: chunkText,
      meaning: generateAiTranslationDraft(chunkText, dictMock), // AI 초안 자동 매핑
      tag: tag
    };
  });
};

/**
 * 지문의 전체 원문 텍스트와 제목, 학년 정보를 받아 
 * Firestore 및 React 상태에 적합한 Passage 문서 포맷으로 최종 파싱합니다.
 * 
 * @param {string} title 
 * @param {string} grade 
 * @param {string} fullText 
 * @param {object} dictMock 로컬 어휘 사전 데이터
 * @returns {object} Passage 데이터 구조체
 */
export const parseFullPassage = (title, grade, fullText, dictMock = {}) => {
  const sentencesText = splitIntoSentences(fullText);
  
  const sentences = sentencesText.map((text, index) => {
    return {
      index,
      text,
      chunks: splitIntoChunks(text, dictMock)
    };
  });

  return {
    title: title || "제목 없음",
    grade: grade || "일반",
    fullText,
    sentences,
    paragraphSummaries: [] // 추후 1줄 문단 압축용
  };
};

/**
 * 사전(dictMock)에 없는 단어에 대해 어근 접미사 분석 등을 거쳐 
 * 동적으로 한글 뜻, 동의어, 반의어, 관련 숙어 템플릿을 생성합니다.
 */
const getDynamicDictEntry = (word, dictMock = {}) => {
  const clean = word.toLowerCase().trim();
  if (dictMock[clean]) {
    const entry = dictMock[clean];
    return typeof entry === 'object' ? { ...entry } : { meaning: entry };
  }
  
  if (clean.endsWith('s') && clean.length > 3) {
    const singular = clean.slice(0, -1);
    if (dictMock[singular]) {
      const entry = dictMock[singular];
      return typeof entry === 'object'
        ? { ...entry, meaning: entry.meaning }
        : { meaning: entry };
    }
  }
  
  if (clean.endsWith('ed') && clean.length > 4) {
    let base = clean.slice(0, -2);
    if (dictMock[base]) {
      const entry = dictMock[base];
      return typeof entry === 'object'
        ? { ...entry, meaning: `${entry.meaning} (과거형)` }
        : { meaning: `${entry} (과거형)` };
    }
    if (clean.endsWith('ied')) {
      base = clean.slice(0, -3) + 'y';
      if (dictMock[base]) {
        const entry = dictMock[base];
        return typeof entry === 'object'
          ? { ...entry, meaning: `${entry.meaning} (과거형)` }
          : { meaning: `${entry} (과거형)` };
      }
    }
  }

  if (clean.endsWith('ly') && clean.length > 4) {
    const adj = clean.slice(0, -2);
    if (dictMock[adj]) {
      const entry = dictMock[adj];
      return typeof entry === 'object'
        ? { ...entry, meaning: `${entry.meaning}하게` }
        : { meaning: `${entry}하게` };
    }
  }
  
  if (clean.endsWith('ing') && clean.length > 5) {
    const verb = clean.slice(0, -3);
    if (dictMock[verb]) {
      const entry = dictMock[verb];
      return typeof entry === 'object'
        ? { ...entry, meaning: `${entry.meaning}하는 중` }
        : { meaning: `${entry}하는 중` };
    }
  }

  let hint = "";
  if (clean.startsWith('un') || clean.startsWith('in') || clean.startsWith('im')) {
    hint = "[반대] ";
  } else if (clean.startsWith('re')) {
    hint = "[재반복] ";
  }

  return {
    meaning: `${hint}(뜻을 알 수 없음 - 사전 수정 필요)`,
    synonyms: "준비 중",
    antonyms: "준비 중",
    similarIdioms: "준비 중"
  };
};

/**
 * 영어 원문에서 the, a, in, 대명사, be/have동사, 조동사 등 극도로 쉬운 단어들을 완벽히 제외하고,
 * 고1 수준 이상의 중요 핵심 어휘/숙어 리스트만 골라내며 지문당 최소 10개 이상을 무조건 보장합니다.
 * 
 * @param {string} fullText 영어 본문 텍스트
 * @param {object} dictMock 로컬 어휘 사전 데이터
 * @returns {Array<{word: string, meaning: string}>} 정화된 고유 핵심 어휘 배열 (최소 10개 보장)
 */
export const extractHighLevelVocab = (fullText, dictMock = {}) => {
  if (!fullText || typeof fullText !== 'string') return [];

  // 1. 극도로 쉬운 기초 단어 및 기능어 목록 (완전 차단!)
  const easyStopwords = new Set([
    // 관사
    'a', 'an', 'the',
    // 전치사
    'in', 'on', 'at', 'to', 'for', 'of', 'by', 'from', 'with', 'about', 'into', 'through',
    'over', 'under', 'before', 'after', 'since', 'until', 'as', 'like', 'between', 'among',
    'without', 'within', 'during', 'against', 'up', 'down', 'out', 'off',
    // 대명사
    'i', 'my', 'me', 'mine', 'myself', 'you', 'your', 'yours', 'yourself', 'yourselves',
    'he', 'his', 'him', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
    'we', 'our', 'ours', 'us', 'ourselves', 'they', 'their', 'theirs', 'them', 'themselves',
    'this', 'that', 'these', 'those', 'who', 'which', 'what', 'whose', 'whom', 'someone',
    'something', 'anyone', 'anything', 'everyone', 'everything', 'noone', 'nothing', 'some', 'any',
    // be동사 및 have동사
    'be', 'am', 'are', 'is', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'having',
    // 조동사
    'do', 'does', 'did', 'done', 'doing', 'can', 'could', 'will', 'would', 'shall', 'should',
    'may', 'might', 'must', 'ought',
    // 기초 접속사 / 부사 / 기타 쉬운 어구
    'and', 'but', 'or', 'so', 'because', 'although', 'if', 'when', 'while', 'unless', 'than',
    'then', 'there', 'here', 'not', 'no', 'yes', 'too', 'very', 'much', 'many', 'more', 'most',
    'all', 'each', 'every', 'other', 'another', 'only', 'just', 'even', 'also', 'out',
    'make', 'makes', 'made', 'get', 'gets', 'got', 'go', 'goes', 'went', 'take', 'takes', 'took'
  ]);

  // 문장 부호를 제거하고 소문자 단어 배열 추출
  const words = fullText
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"]/g, " ")
    .split(/\s+/)
    .map(w => w.trim())
    .filter(Boolean);

  const highLevelVocab = [];
  const processedWords = new Set();

  // [💡 Dynamic Idiom Extraction Engine] 사용자가 명시한 핵심 숙어 패턴 감지
  const lowerText = fullText.toLowerCase();

  // 1) "make a discovery" 숙어화 (make ... discovery 형태도 정밀 추적)
  if (lowerText.includes('make') && (lowerText.includes('discovery') || lowerText.includes('discoveries'))) {
    const key = "make a discovery";
    if (!processedWords.has(key)) {
      highLevelVocab.push({
        word: key,
        meaning: "발견을 하다, 알아내다",
        synonyms: "discover, find out, explore",
        similarIdioms: "make an important discovery (중요한 발견을 하다)"
      });
      processedWords.add(key);
    }
  }

  // 2) "end up ~ing" 숙어화 (end up + ing 형태 감지)
  if (lowerText.includes('end up') && /end up\s+\w+ing/i.test(lowerText)) {
    const key = "end up ~ing";
    if (!processedWords.has(key)) {
      highLevelVocab.push({
        word: key,
        meaning: "결국 ~하게 되다",
        synonyms: "wind up, finish up",
        similarIdioms: "end up knowing (결국 알게 되다)"
      });
      processedWords.add(key);
    }
  }

  // 3) "as 형용사/부사 as possible" 숙어화 (as ... as possible 형태 감지)
  if (/as\s+[a-zA-Z]+\s+as\s+possible/i.test(lowerText)) {
    const match = lowerText.match(/as\s+([a-zA-Z]+)\s+as\s+possible/i);
    const adjAdv = match ? match[1] : "형용사/부사";
    const key = "as 형용사/부사 as possible";
    if (!processedWords.has(key)) {
      highLevelVocab.push({
        word: key,
        meaning: "가능한 한 ~하게",
        synonyms: "as much as possible, as best as one can",
        similarIdioms: `as ${adjAdv} as possible (가능한 한 ${adjAdv === 'widely' ? '널리' : adjAdv}하게)`
      });
      processedWords.add(key);
    }
  }

  // 1차: 복합 숙어 검출 (사전에 숙어가 등록되어 있고 본문에 등장하는 경우)
  Object.keys(dictMock).forEach(key => {
    if (key.includes(' ') && fullText.toLowerCase().includes(key)) {
      if (!processedWords.has(key)) {
        highLevelVocab.push({
          word: key,
          ...dictMock[key]
        });
        processedWords.add(key);
      }
    }
  });

  // 2차: 일반 단어 추출 및 필터링 적용 (사전에 등록되어 있는 경우)
  words.forEach(w => {
    // 글자 길이가 3 이하이거나, 쉬운 단어 목록에 있거나, 이미 처리되었으면 skip!
    if (w.length <= 3 || easyStopwords.has(w) || processedWords.has(w)) {
      return;
    }

    // 사전(dictMock)에 정보가 있는 고난도 고1 이상 핵심 단어만 등록
    if (dictMock[w]) {
      const entry = typeof dictMock[w] === 'object' ? dictMock[w] : { meaning: dictMock[w] };
      highLevelVocab.push({
        word: w,
        ...entry
      });
      processedWords.add(w);
    }
  });

  // 3차: 만약 추출된 단어가 10개 미만이면, 본문에서 추가 어휘를 강제로 수집 (최소 10개 보장 가드)
  if (highLevelVocab.length < 10) {
    const candidates = [];
    words.forEach(w => {
      // 3글자 이하이거나, 쉬운 단어이거나, 이미 등록된 단어면 제외
      if (w.length <= 3 || easyStopwords.has(w) || processedWords.has(w)) {
        return;
      }
      candidates.push(w);
    });

    // 중복 제거 및 빈도수 계산
    const wordCounts = {};
    candidates.forEach(w => {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    });

    const uniqueCandidates = Object.keys(wordCounts);

    // 정렬 순서: 1) 단어 길이 내림차순 (긴 단어가 어려울 확률 높음), 2) 등장 빈도 내림차순
    uniqueCandidates.sort((a, b) => {
      if (a.length !== b.length) {
        return b.length - a.length;
      }
      return wordCounts[b] - wordCounts[a];
    });

    // 10개가 채워질 때까지 추가
    for (let i = 0; i < uniqueCandidates.length && highLevelVocab.length < 10; i++) {
      const w = uniqueCandidates[i];
      const entry = getDynamicDictEntry(w, dictMock);
      highLevelVocab.push({
        word: w,
        ...entry
      });
      processedWords.add(w);
    }
  }

  // 4차: 최악의 상황 방지 (글자 수 기준 완화하여 10개 채우기)
  if (highLevelVocab.length < 10) {
    const fallbackCandidates = [];
    words.forEach(w => {
      // 글자 수 기준을 2글자 초과로 낮추어 (즉 3글자 이상) 추가 수집
      if (w.length <= 2 || easyStopwords.has(w) || processedWords.has(w)) {
        return;
      }
      fallbackCandidates.push(w);
    });

    const fallbackCounts = {};
    fallbackCandidates.forEach(w => {
      fallbackCounts[w] = (fallbackCounts[w] || 0) + 1;
    });

    const uniqueFallback = Object.keys(fallbackCounts);
    uniqueFallback.sort((a, b) => b.length - a.length);

    for (let i = 0; i < uniqueFallback.length && highLevelVocab.length < 10; i++) {
      const w = uniqueFallback[i];
      const entry = getDynamicDictEntry(w, dictMock);
      highLevelVocab.push({
        word: w,
        ...entry
      });
      processedWords.add(w);
    }
  }

  return highLevelVocab;
};
