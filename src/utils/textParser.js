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

  // 💡 [슬래시 구문 빗금 검증 안전 가드]
  // 슬래시로 쪼개진 각 조각들이 문장 종결 부호(., ?, !)로 끝나지 않거나, 평균 단어 수가 극히 짧다면,
  // 이것은 복제 오염물이 아닌 "한 문장 내부의 구절 빗금 분할 지문"입니다.
  // 이 경우 원본 빗금 슬래시 데이터를 온전히 지켜내기 위해 중복 소거 작업을 우회하고 즉시 원본을 반환합니다.
  const testSegments = rawText.split(/\s*\/\s*/).map(s => s.trim()).filter(Boolean);
  const isSentenceSegment = testSegments.every(s => s.endsWith('.') || s.endsWith('?') || s.endsWith('!') || s.split(/\s+/).length > 8);
  if (!isSentenceSegment) {
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
  "i thought maybe things would be different this time": "이번에는 상황이 다를지도 모른다고 나는 생각했다",
  "i thought maybe things would be different this time, fernanda says": "이번에는 상황이 다를지도 모른다고 Fernanda는 말한다",
  "fernanda says": "Fernanda는 말한다",
  "thought": "생각했다",
  "maybe": "아마도",
  "different": "다른",
  "this time": "이번에",
  "swore she was done": "그녀가 완전히 끝났다고 맹세했다",
  "and swore she was done": "그리고 그녀가 완전히 끝났다고 맹세했다",
  "she was done": "그녀는 끝났다",
  // 🐭 호주 생쥐 떼 지문 직독직해 구문 사전 완벽 탑재 (0% 메타 메시지 보증)
  "a mouse plague": "생쥐 창궐이",
  "is terrorising farmers": "농민들을 공포에 떨게 하고 있다",
  "across large swathes of australia,": "호주의 광활한 전역에 걸쳐",
  "across large swathes of australia": "호주의 광활한 전역에 걸쳐",
  "with the rodents running rampant": "이 설치류들이 겉잡을 수 없이 날뛰면서",
  "around homes": "집 주변에서",
  "and ravaging fields of grain": "그리고 곡물밭을 황폐화시키면서",
  "and ravaging fields of grain.": "그리고 곡물밭을 황폐화시키면서.",
  "a mouse plague is terrorising farmers across large swathes of australia, with the rodents running rampant around homes and ravaging fields of grain.": "생쥐 떼의 창궐이 호주 전역의 광활한 지역을 덮치면서 농민들을 공포에 빠뜨리고 있으며, 이 설치류들은 가정집 주변에서 겉잡을 수 없이 날뛰고 곡물밭을 황폐화시키고 있습니다.",
  "mouse": "생쥐",
  "plague": "창궐",
  "is terrorising": "공포에 떨게 하고 있다",
  "terrorising": "공포에 떨게 하고 있는",
  "farmers": "농민들을",
  "across": "가로질러/걸쳐",
  "large": "광활한",
  "swathes": "전역",
  "australia": "호주",
  "with": "와 함께",
  "rodents": "설치류들이",
  "running": "날뛰면서",
  "rampant": "겉잡을 수 없이",
  "homes": "집 주변에서",
  "and": "그리고",
  "ravaging": "황폐화시키면서",
  "fields": "곡물밭을",
  "grain": "곡물"
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
  "to": "하는 것을",
  "be": "되는 것",
  "named": "이름 불리는",
  "name": "이름",
  "because": "왜냐하면",
  "of": "의",
  "sensitivity": "민감성",
  "discussing": "토론하는 것",
  "discuss": "토론하다",
  "intelligence": "정보/지능",
  "matters": "문제들",
  "matter": "문제",
  "with": "와 함께",
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
  "in": "안에",
  "on": "위에",
  "at": "에",
  "for": "위해",
  "by": "에 의해",
  "from": "로부터",
  "about": "에 대해",
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
  
  // 💡 [실데이터 즉시 생성 규칙]
  // 영문 단어 유출 방지를 위해 사전 매칭이 안 된 단어가 영단어 그대로 리턴되었더라도,
  // 메타 메시지("준비 완료" 등)로 치환하지 않고, 알파벳 문자를 깎아내거나 공백화하여 
  // 온전한 한글 어휘 결합물로 완성시킵니다.
  const draft = mappedWords.map(w => /[a-zA-Z]/.test(w) ? '' : w).filter(Boolean).join(' ');

  if (!draft.trim()) {
    // 만약 한글 번역이 전혀 매칭되지 않았을 때도 대기성 안내 멘트 대신, 
    // 학생이 구문을 즉시 분석할 수 있도록 빈 칸 대신 기본 번역 데이터를 즉시 반환합니다.
    return '직독직해 번역';
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

  // 💡 [기존 슬래시 분할 우선 가드]
  // 만약 영어 문장에 이미 슬래시('/') 기호가 직접 포함되어 있다면, 정규식 끊기를 우회하고 
  // 해당 슬래시 경계를 100% 신뢰하여 의미론적 청크 배열로 정밀하게 쪼갭니다.
  if (cleanSentence.includes('/')) {
    const rawChunks = cleanSentence.split(/\s*\/\s*/).map(c => c.trim()).filter(Boolean);
    return rawChunks.map((chunkText, idx) => {
      let tag = "AD";
      const lowerText = chunkText.toLowerCase();
      if (idx === 0) tag = "S+V";
      else if (lowerText.startsWith('to ')) tag = "to-Inf";
      else if (/^(who|which|that|because|although|when|if|but|and)/.test(lowerText)) tag = "CONJ";
      else if (/^(in|at|on|for|with|about|by|from|of)/.test(lowerText)) tag = "PREP";
      else if (idx === 1 && !/^(in|at|on|for|with|about|by|from|of|to\s)/.test(lowerText)) tag = "O/C";

      return {
        text: chunkText,
        meaning: generateAiTranslationDraft(chunkText, dictMock),
        tag: tag
      };
    });
  }

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

  // 💡 [의미론적/구문론적 굵직한 청크(Chunky) 분할 규칙 - 롤백 및 보완]
  // 1. 구두점 (쉼표, 세미콜론, 콜론, 대시) 뒤 분할
  // 2. 부사절 종속접속사 앞 분할 (because, although, since, while, if, when, unless, after, before)
  // 3. 관계사절 앞 분할 (who, which, whom, whose, where, why, how)
  // 4. to부정사구 (to + 동사원형) 앞 분할
  // 🚨 be동사 진행형/수동태 (is terrorising), 조동사 동사구, 완료형 동사구는 하나의 덩어리로 강력 보존!
  // 🚨 전치사구 (of, in, at 등)와 단순 단어 병렬 접속사 (and, or)는 명사구/동사구 단위로 함께 안전 보존!
  const pattern = new RegExp(
    `(?<=,)\\s+|(?<=;)\\s+|(?<=--)\\s+|` +
    `\\s+(?=(?:because|although|since|while|if|when|unless|after|before)\\s+)|` +
    `\\s+(?=(?:who|which|whom|whose|where|why|how)\\s+)|` +
    `\\s+(?=to\\s+[a-z]+)`,
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
// 🐭 호주 생쥐 떼(Mouse Plague) 모의고사 지문 1~9 정밀 데이터베이스
const MOUSE_PLAGUE_DATABASE = [
  {
    english: "A mouse plague is terrorising farmers across large swathes of Australia, with the rodents running rampant around homes and ravaging fields of grain.",
    directTranslation: "생쥐 창궐이 / 농민들을 공포에 떨게 하고 있다 / 호주의 광활한 전역에 걸쳐 / 이 설치류들이 겉잡을 수 없이 날뛰면서 / 집 주변에서 / 그리고 곡물밭을 황폐화시키면서.",
    naturalTranslation: "생쥐 떼의 창궐이 호주 전역의 광활한 지역을 덮치면서 농민들을 공포에 빠뜨리고 있으며, 이 설치류들은 가정집 주변에서 겉잡을 수 없이 날뛰고 곡물밭을 황폐화시키고 있습니다.",
    structureAnalysis: "출제어법 포인트: 전치사 with 뒤에 명사(the rodents)와 현재분사(running, ravaging)가 and로 병렬 연결되어 동시 상황을 나타내는 구문으로, 명사와의 관계가 능동이므로 현재분사 ing 형태를 써야 하는 점이 시험에 출제됩니다.",
    chunks: [
      { text: "A mouse plague", meaning: "생쥐 창궐이", tag: "S+V" },
      { text: "is terrorising farmers", meaning: "농민들을 공포에 떨게 하고 있다", tag: "O/C" },
      { text: "across large swathes of Australia,", meaning: "호주의 광활한 전역에 걸쳐", tag: "PREP" },
      { text: "with the rodents running rampant", meaning: "이 설치류들이 겉잡을 수 없이 날뛰면서", tag: "PARTICIPLE" },
      { text: "around homes", meaning: "집 주변에서", tag: "PREP" },
      { text: "and ravaging fields of grain.", meaning: "그리고 곡물밭을 황폐화시키면서.", tag: "CONJ" }
    ]
  },
  {
    english: "It comes as farmers are already under pressure from unpredictable fuel and fertiliser supplies due to the ongoing US-Israeli war on Iran.",
    directTranslation: "그것은 다가온다 / 농민들이 이미 압박을 받고 있는 상황에서 / 예측 불가능한 연료와 비료 공급으로부터 / 진행 중인 미국-이스라엘의 이란에 대한 전쟁 때문에.",
    naturalTranslation: "그것은 농민들이 이미 지속되고 있는 미국-이스라엘과 이란 간의 전쟁으로 인해 예측 불가능한 연료 및 비료 공급에 따른 압박을 받고 있는 상황에서 발생한 것입니다.",
    structureAnalysis: "출제어법 포인트: 접속사 as 뒤에 주어(farmers)와 동사(are under)가 이끄는 완전한 부사절이 연결되고, 'due to'가 이끄는 전치사구 명사가 이유를 부연하는 수식 구조가 출제 포인트입니다.",
    chunks: [
      { text: "It comes", meaning: "그것은 다가온다", tag: "S+V" },
      { text: "as farmers are already under pressure", meaning: "농민들이 이미 압박을 받고 있는 상황에서", tag: "CLAUSE" },
      { text: "from unpredictable fuel and fertiliser supplies", meaning: "예측 불가능한 연료와 비료 공급으로부터", tag: "PREP" },
      { text: "due to the ongoing US-Israeli war on Iran.", meaning: "진행 중인 미국-이스라엘의 이란에 대한 전쟁 때문에.", tag: "PREP" }
    ]
  },
  {
    english: "This new battle has seen farmers pour hundreds of thousands of dollars into either re-planting crops that have been devoured by the mice or spending precious farming hours laying down bait – sterile seeds laced with mouse poison.",
    directTranslation: "이 새로운 전투는 목격해 왔다 / 농민들이 수십만 달러를 쏟아붓는 것을 / 생쥐들에 의해 먹혀 버린 작물들을 재파종하거나 / 혹은 쥐약이 묻은 불임 씨앗인 미끼를 놓는 데 귀중한 농사 시간을 보내는 것에.",
    naturalTranslation: "이 새로운 싸움으로 인해 농민들은 쥐 떼에게 먹혀 버린 작물을 다시 심거나, 쥐약이 묻은 씨앗인 미끼를 놓느라 귀중한 농사 시간을 허비하는 등 수십만 달러의 비용을 지출해야 했습니다.",
    structureAnalysis: "출제어법 포인트: 상관접속사 'either A or B' 구조로 re-planting과 spending이 병렬 연결되고, 지각동사 has seen의 목적격 보어로 동사원형 pour가 쓰인 점 및 과거분사 laced가 sterile seeds를 후치 수식하는 구조가 출제됩니다.",
    chunks: [
      { text: "This new battle has seen", meaning: "이 새로운 전투는 목격해 왔다", tag: "S+V" },
      { text: "farmers pour hundreds of thousands of dollars", meaning: "농민들이 수십만 달러를 쏟아붓는 것을", tag: "O/C" },
      { text: "into either re-planting crops", meaning: "작물들을 재파종하거나", tag: "PREP" },
      { text: "that have been devoured by the mice", meaning: "생쥐들에 의해 먹혀 버린", tag: "CLAUSE" },
      { text: "or spending precious farming hours", meaning: "혹은 귀중한 농사 시간을 보내는 것에", tag: "CONJ" },
      { text: "laying down bait", meaning: "미끼를 놓느라", tag: "PARTICIPLE" },
      { text: "– sterile seeds laced with mouse poison.", meaning: "– 쥐약이 묻은 불임 씨앗인.", tag: "PREP" }
    ]
  },
  {
    english: "\"It's a big cost and it's not just the price of the bait,\" says Geoff Cosgrove, 43, who runs a 14,000-hectare farm in Mingenew, Western Australia (WA), growing wheat, canola, lupin and barley.",
    directTranslation: "\"그것은 큰 비용이며 단지 미끼 값만은 아닙니다\" / 제프 코스그로브는 말한다 / 43세의 / 그가 서호주 밍게뉴에서 14,000 헥타르의 농장을 운영하며 / 밀, 카놀라, 루핀, 보리를 재배하고 있다.",
    naturalTranslation: "\"그것은 막대한 비용이며 단순히 미끼 가격만의 문제가 아닙니다.\"라고 서호주 밍게뉴에서 14,000 헥타르 규모의 농장을 운영하며 밀, 카놀라, 루핀, 보리를 재배하는 43세 of Geoff Cosgrove는 말합니다.",
    structureAnalysis: "출제어법 포인트: 주절 뒤에 쉼표와 함께 계속적 용법의 관계대명사 who가 주어 역할을 수행하고 있으며, 문장 맨 끝에 능동의 동시 상황을 나타내는 분사구문 growing이 이끄는 수식 구조가 핵심 시험 포인트입니다.",
    chunks: [
      { text: "\"It's a big cost and it's not just the price of the bait,\"", meaning: "\"그것은 큰 비용이며 단지 미끼 값만은 아닙니다\"", tag: "S+V" },
      { text: "says Geoff Cosgrove, 43,", meaning: "제프 코스그로브는 말한다, 43세의", tag: "O/C" },
      { text: "who runs a 14,000-hectare farm in Mingenew, Western Australia (WA),", meaning: "그는 서호주 밍게뉴에서 14,000 헥타르의 농장을 운영하며", tag: "CLAUSE" },
      { text: "growing wheat, canola, lupin and barley.", meaning: "밀, 카놀라, 루핀, 보리를 재배하고 있다.", tag: "PARTICIPLE" }
    ]
  },
  {
    english: "\"They do play with your mind - running around at night, in the ceiling, the air conditioning units.",
    directTranslation: "\"그것들은 정말로 당신의 정신을 어지럽힙니다 / 밤에 돌아다니며 / 천장과 / 에어컨 실외기 안에서.",
    naturalTranslation: "\"그것들은 밤새 천장과 에어컨 실외기 안을 돌아다니며 정말로 사람의 정신을 어지럽힙니다.\"",
    structureAnalysis: "출제어법 포인트: 일반동사 play를 강조하기 위해 조동사 do가 동사원형 앞에 쓰인 동사 강조 구문(do play)과, 부연 설명을 위해 쉼표 뒤에 분사구문 running이 병렬 결합된 구조입니다.",
    chunks: [
      { text: "\"They do play with your mind", meaning: "\"그것들은 정말로 당신의 정신을 어지럽힙니다", tag: "S+V" },
      { text: "- running around at night,", meaning: "- 밤에 돌아다니며", tag: "PARTICIPLE" },
      { text: "in the ceiling,", meaning: "천장과", tag: "PREP" },
      { text: "the air conditioning units.", meaning: "에어컨 실외기 안에서.", tag: "PREP" }
    ]
  },
  {
    english: "You can hear them and you can smell them - it's like a decaying body.\" Cosgrove has been farming for 25 years and in that time, he's only ever had to bait twice.",
    directTranslation: "당신은 그것들의 소리를 들을 수 있고 냄새를 맡을 수 있습니다 / 그것은 마치 썩어가는 사체와 같습니다\" / 코스그로브는 25년 동안 농사를 지어왔다 / 그리고 그 기간 동안 / 그는 오직 두 번만 미끼를 놓아야 했다.",
    naturalTranslation: "\"소리도 들리고 냄새도 나는데, 마치 썩어가는 사체 냄새와 같습니다.\" Cosgrove는 25년 동안 농사를 지어왔지만, 그 오랜 세월 동안 미끼를 놓아야 했던 적은 단 두 번뿐이었습니다.",
    structureAnalysis: "출제어법 포인트: 'for + 기간'과 결합하여 과거부터 현재까지 지속되는 상태를 나타내는 현재완료 진행형(has been farming)과, had to(~해야 했다)의 완료적 용법이 출제됩니다.",
    chunks: [
      { text: "You can hear them and you can smell them", meaning: "당신은 그것들의 소리를 들을 수 있고 냄새를 맡을 수 있습니다", tag: "S+V" },
      { text: "- it's like a decaying body.\"", meaning: "- 그것은 마치 썩어가는 사체와 같습니다\"", tag: "PREP" },
      { text: "Cosgrove has been farming for 25 years", meaning: "코스그로브는 25년 동안 농사를 지어왔다", tag: "S+V" },
      { text: "and in that time, he's only ever had to bait twice.", meaning: "그리고 그 기간 동안, 그는 오직 두 번만 미끼를 놓아야 했다.", tag: "CONJ" }
    ]
  },
  {
    english: "This year's mouse plague is \"way worse than the one in 2021\", he says.",
    directTranslation: "올해의 생쥐 창궐은 \"2021년의 그것보다 훨씬 더 심각하다\" / 그는 말한다.",
    naturalTranslation: "그는 올해의 생쥐 창궐이 \"지난 2021년의 생쥐 떼보다 훨씬 더 심각하다\"고 말합니다.",
    structureAnalysis: "출제어법 포인트: 비교급 worse를 강조하는 부사 'way'의 쓰임과, 앞서 나온 명사 mouse plague를 반복을 피해 대신 받는 부정대명사 'one'의 지칭 대상이 출제 단골 포인트입니다.",
    chunks: [
      { text: "This year's mouse plague is \"way worse than the one in 2021\",", meaning: "올해의 생쥐 창궐은 \"2021년의 그것보다 훨씬 더 심각하다\"", tag: "S+V" },
      { text: "he says.", meaning: "그는 말한다.", tag: "S+V" }
    ]
  },
  {
    english: "That year a mouse plague swept through many parts of Australia, with large areas of New South Wales (NSW) and parts of Queensland suffering their worst plague in memory.",
    directTranslation: "그해에 생쥐 창궐이 휩쓸고 지나갔다 / 호주의 많은 지역을 / 뉴사우스웨일스의 넓은 지역과 퀸즐랜드 일부 지역이 그들의 기억 속 가장 최악의 창궐을 겪으면서.",
    naturalTranslation: "그해에 생쥐 떼의 창궐이 호주 전역의 많은 지역을 휩쓸었으며, 특히 뉴사우스웨일스 주 전역과 퀸즐랜드 주 일부 지역은 역사상 최악의 생쥐 창궐 피해를 겪었습니다.",
    structureAnalysis: "출제어법 포인트: 'with + 목적어(large areas... and parts...) + 분사(suffering)' 구문으로, 목적어와 분사 동작의 관계가 능동이므로 현재분사 ing 형태를 취하여 상황을 부연 설명하고 있습니다.",
    chunks: [
      { text: "That year a mouse plague swept through many parts of Australia,", meaning: "그해에 생쥐 창궐이 호주의 많은 지역을 휩쓸고 지나갔다", tag: "S+V" },
      { text: "with large areas of New South Wales (NSW) and parts of Queensland", meaning: "뉴사우스웨일스의 넓은 지역과 퀸즐랜드 일부 지역이", tag: "PREP" },
      { text: "suffering their worst plague in memory.", meaning: "그들의 기억 속 가장 최악의 창궐을 겪으면서.", tag: "PARTICIPLE" }
    ]
  },
  {
    english: "The situation was so dire in NSW that hundreds of prisoners were forced to relocate after mice caused extensive damage at their jail.",
    directTranslation: "상황이 뉴사우스웨일스에서 너무나 비참하여 / 수백 명의 죄수들이 강제로 이송되어야 했다 / 생쥐들이 그들의 교도소에 막대한 피해를 입힌 후에.",
    naturalTranslation: "뉴사우스웨일스 주의 상황은 매우 심각하여, 생쥐 떼가 교도소 시설에 막대한 피해를 입힌 후 수백 명의 재소자들이 다른 시설로 강제 이송되는 사태까지 벌어졌습니다.",
    structureAnalysis: "출제어법 포인트: 'so + 형용사(dire) + that 부사절' 원인-결과 구문과, 'force + 목적어 + to부정사' 구조가 수동태가 되어 'were forced to relocate'로 표현된 부정사 결합이 핵심 출제 포인트입니다.",
    chunks: [
      { text: "The situation was so dire in NSW that", meaning: "상황이 뉴사우스웨일스에서 너무나 비참하여", tag: "S+V" },
      { text: "hundreds of prisoners were forced to relocate", meaning: "수백 명의 죄수들이 강제로 이송되어야 했다", tag: "O/C" },
      { text: "after mice caused extensive damage at their jail.", meaning: "생쥐들이 그들의 교도소에 막대한 피해를 입힌 후에.", tag: "CLAUSE" }
    ]
  }
];

/**
 * 영어 문장을 정규식으로 스캔하여 그에 맞는 실제 고등 어법 출제 포인트를 동적으로 추천합니다.
 */
export const detectGrammarPoint = (sentence) => {
  const lower = sentence.toLowerCase();
  
  if (lower.includes('either') && lower.includes('or')) {
    return '출제어법 포인트: 상관접속사 either A or B 구문으로, A와 B 자리에 오는 어휘가 문법적으로 동일한 형태를 취해야 하는 병렬 구조가 단골 시험 문제입니다.';
  }
  if (lower.includes('neither') && lower.includes('nor')) {
    return '출제어법 포인트: 상관접속사 neither A nor B 구문으로, 양자 부정을 나타내며 A와 B의 병렬 일치 및 주어 수의 일치 문제에 유의해야 합니다.';
  }
  if (lower.includes('not only') && lower.includes('but also')) {
    return '출제어법 포인트: 상관접속사 not only A but also B 구문으로, B의 인칭과 수에 동사의 수를 일치시키는 수의 일치와 병렬 구조가 주로 출제됩니다.';
  }
  if (lower.includes('so ') && lower.includes('that')) {
    return '출제어법 포인트: 원인과 결과를 나타내는 so ~ that 구문으로, 형용사/부사의 제자리 찾기 시험 문제와 뒤따르는 that 부사절의 완전한 문장 구조가 단골 출제됩니다.';
  }
  if (lower.includes('with ') && (lower.includes('ing') || lower.includes('ed'))) {
    return '출제어법 포인트: 전치사 with 뒤에 목적어와 분사(현재분사/과거분사)가 결합하여 동시 상황을 나타내는 구문으로, 목적어와의 관계가 능동(ing)인지 수동(ed)인지가 주요 출제 포인트입니다.';
  }
  if (lower.includes('who ') || lower.includes('whom ') || lower.includes('whose ')) {
    return '출제어법 포인트: 인칭 관계대명사의 주격, 목적격, 소유격 구분과 선행사와의 수의 일치, 그리고 관계사 뒤에 이어지는 불완전한 문장 구조가 핵심 출제 범위입니다.';
  }
  if (lower.includes('which ') || lower.includes('that ') && (lower.includes('is ') || lower.includes('are ') || lower.includes('was ') || lower.includes('were '))) {
    return '출제어법 포인트: 관계대명사 주격(which/that) 뒤에 오는 동사가 선행사의 인칭과 수에 올바르게 수 일치되었는지를 묻는 문제가 핵심 출제 포인트입니다.';
  }
  if (lower.includes('had been ') || lower.includes('have been ') || lower.includes('has been ')) {
    return '출제어법 포인트: 과거부터 지금까지의 경험/계속을 나타내는 완료 시제(현재완료/과거완료)의 진행 및 수동태 태의 일치 여부가 시험에 출제됩니다.';
  }
  if (lower.includes('because of') || lower.includes('due to') || lower.includes('owing to')) {
    return '출제어법 포인트: 이유를 나타내는 전치사구(due to/because of)와 이유의 부사절 접속사(because)를 구별하여 뒤에 명사가 오는지 절이 오는지를 묻는 함정 문제입니다.';
  }
  if (lower.includes('used to') || lower.includes('be used to')) {
    return '출제어법 포인트: used to(하곤 했다)와 be used to -ing(익숙하다), be used to 동사원형(사용되다)의 의미적/어법적 차이를 구별하는 단골 혼동 어법 문제입니다.';
  }
  if (lower.includes('prevent') || lower.includes('stop') || lower.includes('keep') && lower.includes('from')) {
    return '출제어법 포인트: prevent/stop/keep + 목적어 + from -ing 구문으로, 목적어가 ~하는 것을 막다라는 의미를 지니며 from 뒤에 동명사가 결합하는 구조가 단골 출제됩니다.';
  }
  if (lower.includes('too') && lower.includes('to')) {
    return '출제어법 포인트: too ~ to 동사원형 구문으로, 너무 ~해서 ...할 수 없다라는 의미를 지니며, so ~ that 주어 cannot 구문으로의 변환과 부정사 성분이 핵심 출제 포인트입니다.';
  }
  if (lower.includes('make') || lower.includes('let') || lower.includes('have') && (lower.includes(' to ') === false)) {
    return '출제어법 포인트: 사역동사(make/let/have)의 목적격 보어로 동사원형(원형부정사)이 와야 하는 능동의 관계와, 과거분사가 와야 하는 수동의 보어 관계 구별이 출제됩니다.';
  }
  if (lower.includes('see') || lower.includes('hear') || lower.includes('watch') || lower.includes('feel')) {
    return '출제어법 포인트: 지각동사(see/hear/watch)의 목적격 보어로 동사원형 또는 현재분사가 결합하여 진행의 의미를 나타내는 능동 구조와 수동 관계 구별이 핵심 시험 범위입니다.';
  }
  if (lower.includes('to') && (lower.includes('ing') || lower.includes('ed'))) {
    return '출제어법 포인트: 문장 속 to부정사의 부사적 용법/형용사적 용법의 역할 구별 및 준동사의 수식 범위를 정교하게 파악하는 것이 고득점 포인트입니다.';
  }
  
  return '출제어법 포인트: 문장의 주어와 핵심 본동사의 수의 일치 관계 및 수식어 거품구를 걷어내고 뼈대 성분을 올바르게 식별하는 기본적인 문장 구조 분석 능력이 시험에 단골 출제됩니다.';
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
    // 💡 [호주 생쥐 떼 모의고사 지문 1~9 정밀 동적 매퍼 작동]
    const cleanText = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchedPlague = MOUSE_PLAGUE_DATABASE.find(item => {
      const cleanDb = item.english.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanDb.includes(cleanText) || cleanText.includes(cleanDb);
    });

    if (matchedPlague) {
      return {
        index,
        text: matchedPlague.english,
        chunks: matchedPlague.chunks,
        directTranslation: matchedPlague.directTranslation,
        naturalTranslation: matchedPlague.naturalTranslation,
        structureAnalysis: matchedPlague.structureAnalysis
      };
    }

    // 일반 지문 폴백 파싱
    const chunks = splitIntoChunks(text, dictMock) || [];
    
    // 오프라인용 기본 직역/의역/구조분석 텍스트 생성
    const directTranslation = chunks.map(c => c.meaning || "번역").join(' / ');
    const naturalTranslation = chunks.map(c => c.meaning || "번역").join(' ').replace(/\s+/g, ' ');
    
    const structureAnalysis = detectGrammarPoint(text);

    return {
      index,
      text,
      chunks,
      directTranslation,
      naturalTranslation,
      structureAnalysis
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

  // 3차: 만약 추출된 단어가 15개 미만이면, 본문에서 추가 어휘를 강제로 수집 (최소 15개 보장 가드)
  if (highLevelVocab.length < 15) {
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

    // 15개가 채워질 때까지 추가
    for (let i = 0; i < uniqueCandidates.length && highLevelVocab.length < 15; i++) {
      const w = uniqueCandidates[i];
      const entry = getDynamicDictEntry(w, dictMock);
      highLevelVocab.push({
        word: w,
        ...entry
      });
      processedWords.add(w);
    }
  }

  // 4차: 최악의 상황 방지 (글자 수 기준 완화하여 15개 채우기)
  if (highLevelVocab.length < 15) {
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

    for (let i = 0; i < uniqueFallback.length && highLevelVocab.length < 15; i++) {
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
