/**
 * LingoStar Vision Reader - Gemini 3.5 Flash API 커넥터
 * 
 * Google AI Studio의 무료 등급 API Key를 사용하여
 * 1) 단순 영어 원문 분석 (자동 문장분해, 슬래시 끊어읽기 청크 분할, 직독직해 어순번역, 어휘 10종 추출)
 * 2) 외부 유료 분석 자료 해독 (뒤죽박죽 섞여있는 영어문장, 번역문, 단어풀이 텍스트를 구조화된 데이터로 해독)
 * 작업을 브라우저 내에서 안전하고 비용 없이 수행합니다.
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

/**
 * 1. 영어 원문 단순 텍스트 스마트 분석 엔진
 * 원문 텍스트만 입력했을 때, AI가 문장 분할, 청크 슬래시 분리, 한국어 번역, 단어장 구성을 원스톱으로 처리합니다.
 */
export async function analyzeRawPassageWithGemini(passageText, apiKey) {
  if (!apiKey) throw new Error("Gemini API Key가 누락되었습니다.");

  const prompt = `You are a professional ESL (English as a Second Language) curriculum developer, English-Korean syntax mapping expert, and low-vision assistive technology specialist.
Analyze the following English text to construct a structured reading lesson.

Tasks:
1. Divide the text into natural sentences.
2. For each sentence:
   - Identify the full English text.
   - Segment it into natural, readable, and grammatically distinct chunks (usually S+V, prepositional phrases, to-inf, clauses, etc.). Keep the text exact!
   - Provide a natural Korean word-by-word direct translation (직독직해 어순 번역) for each chunk. 
     * **STRICT WORD ORDER RULE**: The translation MUST align perfectly with the English word order. For example, for "Etiquette is to respect other people.", translate each chunk to mirror the structure: "예절은", "이다", "존중하는 것", "다른 사람들을".
   - Assign a part-of-speech or structural tag to each chunk (e.g., 'S+V', 'O/C', 'PREP', 'CLAUSE', 'to-Inf', 'PARTICIPLE').
   - Analyze the grammatical sentence classification and include a "classification" object containing:
     1) "oxfordPattern": The corresponding Hornby's Oxford Verb Pattern number and abbreviation (e.g., "Pattern 3 (S+V+Adj)", "Pattern 9 (S+V+-ing)", "Pattern 6 (S+V+N+to-Inf)"). Choose from Pattern 1 to Pattern 20.
     2) "fiveStructure": Traditional English-Korean 5-verb-pattern terminology (e.g., "1형식", "2형식", "3형식", "4형식", "5형식").
     3) "sentenceType": Korean syntax structure classification (e.g., "홑문장", "이어진 문장: 대등", "이어진 문장: 종속", "안은문장: 명사절", "안은문장: 관형절", "안은문장: 부사절", "안은문장: 서술절", "안은문장: 인용절").
3. Extract exactly 10 high-level, academic, or domain-specific context words and idioms from the text.
   - **CRITICAL PEDAGOGICAL RULE**:
     - **STRICTLY EXCLUDE**: Pronouns (e.g., they, it, this, she, he, who, which), auxiliary verbs, 'be' verbs (e.g., is, are, was, were, be, been), very basic conjunctions or prepositions (e.g., for, and, that, to, in, of, with, but, or, so), and simple primary or early middle-school words of CEFR A1-A2 level (e.g., go, clean, happy, see, make, the, is, for, and).
     - **STRICTLY INCLUDE**: Focus on academic, advanced vocabulary, and meaningful idioms appropriate for **Middle School Grade 3 (중3) up to High School Grade 1-3 (고등) level (CEFR B1, B2, or C1 levels)**.
     - **ACADEMIC DOMAIN COVERAGE**: The English reading passages span diverse academic disciplines. You MUST actively extract key domain-specific academic vocabulary and technical terminology from various fields, including:
       - Science (과학), Mathematics (수학), Humanities & Social Sciences (인문사회)
       - Geography & Earth Science (지리학/지구과학), Physics & Astronomy (물리학/천문학), Chemistry (화학)
       - Biology & Ecology (생물학/생태학), Psychology & Neuroscience (심리학/뇌과학)
       - Philosophy & Ethics (철학/윤리학), Education & Pedagogy (교육학)
     - **FALLBACK**: If a specific passage contains very few advanced terms, extract the most academic and content-carrying words available (nouns, verbs, adjectives, adverbs), rather than simple function words.
   - For each word, generate:
     - Word base form.
     - Clear Korean meaning suited for students.
     - 2-3 synonyms (Korean meaning in bracket next to English word).
     - 1-2 antonyms (Korean meaning in bracket next to English word).
     - 1-2 similar idioms or phrases.

Return a strict, valid JSON object with NO markdown formatting or surrounding code blocks. The JSON structure MUST match this exact schema:
{
  "title": "A short, engaging title for this passage in English",
  "backgroundKnowledge": "Detailed historical, cultural, or scientific background knowledge of the passage in Korean. Explain context and key elements in 3-4 sentences to help students understand.",
  "sentences": [
    {
      "english": "Full sentence string",
      "classification": {
        "oxfordPattern": "Pattern 3 (S+V+Adj)",
        "fiveStructure": "2형식",
        "sentenceType": "홑문장"
      },
      "chunks": [
        { "text": "English chunk text", "meaning": "Korean translation in strict English word order", "tag": "S+V" }
      ]
    }
  ],
  "vocab": [
    {
      "word": "discovery",
      "meaning": "발견",
      "synonyms": "finding (찾아냄), detection (탐지)",
      "antonyms": "loss (분실), hiding (숨김)",
      "similarIdioms": "make a discovery (발견하다)"
    }
  ]
}

English Passage Text:
"${passageText}"`;

  return callGeminiApi(prompt, apiKey);
}

/**
 * 2. 외부 유료 분석 자료 스마트 해독 엔진 (Smart Import)
 * 영어문장, 한글 번역, 단어 풀이, 문법 설명이 제각각 섞여 있는 외부 분석 텍스트를
 * 분석하여 LingoStar 전용 3D Neobrutalism 호환 객체 구조로 완벽 해독합니다.
 */
export async function parseAnalyzedMaterialWithGemini(rawAnalyzedText, apiKey) {
  if (!apiKey) throw new Error("Gemini API Key가 누락되었습니다.");

  const prompt = `You are a professional compiler, English-Korean syntax mapping expert, and structured data structures parser. 
We have a raw, messy copy-pasted text from an external premium English analysis document (which contains English sentences, Korean translations, vocabulary annotations, and grammar tips mixed together).
Analyze this text, filter out noise, and extract a clean, structured LingoStar lesson dataset.

Requirements:
1. Extract the title if available, or generate a suitable one.
2. Group the text into clean sentences.
3. For each sentence:
   - Extract the correct English sentence.
   - Split it into 3-4 natural grammatical chunks.
   - Extract/align the Korean direct translation (직독직해 어순번역) matching those chunks from the raw text translations.
     * **STRICT WORD ORDER RULE**: The translation MUST align perfectly with the English word order (어순 번역). For example, "We have to keep etiquette." translates to: "우리는(S) 지켜야 한다(V) 예절을(O)."
   - Tag each chunk appropriately.
   - Analyze the grammatical sentence classification and include a "classification" object containing:
     1) "oxfordPattern": The corresponding Hornby's Oxford Verb Pattern number and abbreviation (e.g., "Pattern 3 (S+V+Adj)", "Pattern 9 (S+V+-ing)", "Pattern 6 (S+V+N+to-Inf)").
     2) "fiveStructure": Traditional English-Korean 5-verb-pattern terminology (e.g., "1형식", "2형식", "3형식", "4형식", "5형식").
     3) "sentenceType": Korean syntax structure classification (e.g., "홑문장", "이어진 문장: 대등", "이어진 문장: 종속", "안은문장: 명사절", "안은문장: 관형절", "안은문장: 부사절", "안은문장: 서술절", "안은문장: 인용절").
4. Scan and compile the vocabulary list embedded in the raw text. 
   - **CRITICAL PEDAGOGICAL RULE**: 
     - **STRICTLY EXCLUDE**: Pronouns (e.g., they, it, this, she, he, who, which), auxiliary verbs, 'be' verbs (e.g., is, are, was, were, be, been), very basic prepositions/conjunctions (e.g., for, and, that, to, in, of, with, but, or, so), and simple primary or early middle-school words of CEFR A1-A2 level (e.g., go, clean, happy, see, make, the, is, for, and).
     - **STRICTLY INCLUDE**: Focus on robust, academic key vocabulary and idioms suited for **Middle School Grade 3 (중3) to High School (고등) level (CEFR B1, B2, or C1 levels)**. If the raw copy-pasted vocabulary list contains trivial words, discard them and substitute them with high-level vocabulary found in the passage text.
     - **ACADEMIC DOMAIN COVERAGE**: Actively identify, prioritize, and extract key domain-specific academic vocabulary and technical terminology from various fields, including:
       - Science (과학), Mathematics (수학), Humanities & Social Sciences (인문사회)
       - Geography & Earth Science (지리학/지구과학), Physics & Astronomy (물리학/천문학), Chemistry (화학)
       - Biology & Ecology (생물학/생태학), Psychology & Neuroscience (심리학/뇌과학)
       - Philosophy & Ethics (철학/윤리학), Education & Pedagogy (교육학)
   - For each word found/selected, generate:
     - Word base form.
     - Korean meaning.
     - Generate synonyms, antonyms, and similar idioms in Korean/English if they are missing or construct them nicely. Ensure we have at least 8-10 key vocabulary words.

Return a strict, valid JSON object with NO markdown formatting or surrounding code blocks. The JSON structure MUST match this exact schema:
{
  "title": "Extracted or generated English title",
  "backgroundKnowledge": "Detailed historical, cultural, or scientific background knowledge of the passage in Korean. Explain context and key elements in 3-4 sentences to help students understand.",
  "sentences": [
    {
      "english": "Full English sentence string",
      "classification": {
        "oxfordPattern": "Pattern 3 (S+V+Adj)",
        "fiveStructure": "2형식",
        "sentenceType": "홑문장"
      },
      "chunks": [
        { "text": "English chunk text", "meaning": "Corresponding Korean translation in strict English word order", "tag": "S+V" }
      ]
    }
  ],
  "vocab": [
    {
      "word": "word",
      "meaning": "meaning",
      "synonyms": "synonyms",
      "antonyms": "antonyms",
      "similarIdioms": "similar idioms"
    }
  ]
}

Raw Messy Analyzed Material:
"${rawAnalyzedText}"`;

  return callGeminiApi(prompt, apiKey);
}

/**
 * Gemini API 호출 공통 내부 헬퍼 (JSON Mode)
 */
/**
 * 3. Gemini API 응답 텍스트 정화용 헬퍼 함수
 * 마크다운 코드 블록(```json )이나 앞뒤의 불필요한 공백/개행을 안전하게 오려내어 순수 JSON 문자열만 추출합니다.
 */
function cleanJsonResponse(rawText) {
  if (!rawText) return "";
  let cleanStr = rawText.trim();
  
  // 1) 마크다운 백틱 감싸기 제거 (```json 또는 ```)
  cleanStr = cleanStr.replace(/^```json\s*/i, "");
  cleanStr = cleanStr.replace(/^```\s*/i, "");
  cleanStr = cleanStr.replace(/\s*```$/, "");
  
  // 2) 간혹 앞뒤에 붙을 수 있는 대괄호/중괄호 바깥의 텍스트 오물 제거
  const firstBrace = cleanStr.indexOf("{");
  const lastBrace = cleanStr.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleanStr = cleanStr.substring(firstBrace, lastBrace + 1);
  }
  
  return cleanStr.trim();
}

/**
 * 4. 파싱된 데이터 구조의 자가 치유(Self-Healing) 및 스키마 검증 헬퍼
 * AI가 간혹 누락하거나 잘못 형성한 세부 키들에 기본값을 바인딩하여 런타임 UI 크래시를 원천 방어합니다.
 */
function selfHealParsedData(parsedObj) {
  const healed = {
    title: parsedObj.title || "Untitled Reading Passage",
    backgroundKnowledge: parsedObj.backgroundKnowledge || "이 지문에 담긴 깊은 배경과 맥락을 학습하며 문해력을 넓혀보세요.",
    sentences: [],
    vocab: []
  };

  // 문장 목록 복구 및 가드
  if (Array.isArray(parsedObj.sentences)) {
    healed.sentences = parsedObj.sentences.map((s, sIdx) => {
      const english = s.english || s.text || `Sentence ${sIdx + 1}`;
      let chunks = [];
      
      if (Array.isArray(s.chunks)) {
        chunks = s.chunks.map(c => ({
          text: c.text || english,
          meaning: c.meaning || "번역 정보가 없습니다.",
          tag: c.tag || "S+V"
        }));
      } else {
        // 청크 분할이 누락되었을 경우 전체 문장을 단일 청크로 자가 치유
        chunks = [{ text: english, meaning: s.meaning || "번역 정보가 없습니다.", tag: "S+V" }];
      }

      // classification 기본값 바인딩 및 자가 치유
      const classification = s.classification || {};
      const healedClassification = {
        oxfordPattern: classification.oxfordPattern || "Pattern 1 (S+V)",
        fiveStructure: classification.fiveStructure || "1형식",
        sentenceType: classification.sentenceType || "홑문장"
      };

      return { english, chunks, classification: healedClassification };
    });
  }

  // 어휘 사전 복구 및 가드
  if (Array.isArray(parsedObj.vocab)) {
    healed.vocab = parsedObj.vocab.map(v => ({
      word: v.word || "word",
      meaning: v.meaning || "의미 정보 없음",
      synonyms: v.synonyms || "정보 없음",
      antonyms: v.antonyms || "정보 없음",
      similarIdioms: v.similarIdioms || "정보 없음"
    }));
  }

  return healed;
}

/**
 * Gemini API 호출 공통 내부 헬퍼 (JSON Mode)
 */
async function callGeminiApi(prompt, apiKey) {
  const payload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1 // 낮은 다양성으로 JSON 구조 강제 고정
    }
  };

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || "HTTP 통신 실패";
      throw new Error(`Gemini API Error (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!candidateText) {
      throw new Error("Gemini API가 빈 응답을 반환했습니다.");
    }

    // JSON 정화 처리
    const cleanedText = cleanJsonResponse(candidateText);

    // JSON 강제 파싱 및 자가 치유 스키마 복원
    try {
      const parsed = JSON.parse(cleanedText);
      return selfHealParsedData(parsed);
    } catch (e) {
      console.error("Gemini JSON Parsing failure. Cleaned text:", cleanedText);
      throw new Error("Gemini 응답을 JSON 데이터로 해독하는 데 실패했습니다. 응답 구조를 확인해 주세요.");
    }
  } catch (error) {
    console.error("Gemini API Call Exception:", error);
    throw error;
  }
}
