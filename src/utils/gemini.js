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

  const prompt = `You are a professional ESL (English as a Second Language) curriculum developer, English-Korean syntax mapping expert, and high-school prep CSAT/midterm English exam consultant.
Analyze the following English text to construct a structured reading lesson.

Tasks:
1. Divide the text into natural sentences.
2. For each sentence:
   - Identify the full English text.
   - Segment it into natural, readable, and grammatically distinct chunky semantic units. Keep the text exact!
     * **STRICT CHUNKING RULES (CRITICAL - DO NOT micro-fragment)**:
       1. **Verb Phrases (Auxiliary + Main verb, progressive, passive, or perfect tense) MUST be kept as a SINGLE chunk**. Do not split them!
          - Good: "is terrorising" (O) / Bad: "is" + "terrorising" (X)
       2. **Prepositional Phrases [Preposition + Noun phrase] MUST be kept as a SINGLE semantic chunk**. Never split a preposition from its noun/modifier!
          - Good: "across large swathes" (O)
          - Good: "of Australia" (O)
       3. **Participle Clauses or Idiomatic Expressions with their objects, complements, or adverbials MUST be kept together in logical chunks**.
          - Good: "with the rodents running rampant" (O) / Bad: "with the rodents" + "running rampant" (X)

     * **🚨 절대 준수 제약 사항 (Fatal Constraints) 🚨**:
       1. **한국어 번역 내 영단어 전면 금지 (No English/Alphabet in Translations)**:
          - "directTranslation" (직역), "naturalTranslation" (의역), 그리고 chunks 배열 내의 모든 "meaning" 필드 안에는 어떠한 영어 단어나 알파벳 문자(A-Z, a-z)도 단 한 글자도 남겨두지 마십시오. 모든 영어 어휘는 반드시 온전하고 명료한 한국어 번역으로 완전히 치환되어야 합니다.
       2. **메타 메시지 및 플레이스홀더 출력 절대 금지 (0% Status/Meta Placeholders)**:
          - "준비 완료", "번역 대기", "분석 진행 중" 등 어떠한 대기성 안내 문구나 상태 설명용 플레이스홀더 텍스트도 출력하지 마십시오. 반드시 시스템이 보유한 번역 및 구문 분석 지식을 동원해 **100% 온전하게 완성된 실제 번역 문장과 실제 구문 분석 데이터**를 즉시 채워 넣으십시오.
       3. **1:1 청크 대응 법칙 (1:1 Chunk Slash Alignment)**:
          - 영어 문장에서 나눈 chunks 배열의 개수와 "directTranslation"에 포함되는 슬래시('/') 기호로 분할되는 조각의 개수 및 순서가 완벽하게 1:1 대칭 매핑을 이루어야 합니다. 
       4. **직역과 의역의 명확한 차별화 및 자연스러운 어순 직역 룰 (Strict Direct Translation Rule)**:
          - "directTranslation" (직역 / 직독직해)은 영어 문장의 의미 덩어리(chunks) 어순 그대로 100% 매핑하여 슬래시('/') 기호로 구분하는 번역이어야 합니다.
          - **기계적 조사 결합 금지 및 물결표(~) 전면 금지**: a -> 한, is -> 이다, of -> ~의, with -> ~와 함께 처럼 기계적으로 조사를 이어 붙이는 것을 철저히 배제하십시오. 물결표('~') 기호 사용은 전면 금지합니다.
          - **의미 단위 중심의 자연스러운 한글화**: 각 청크 내부의 단어들은 영어 어순을 철저히 유지하되, 한국어의 조사와 어미를 자연스럽게 결합하여 하나의 완결된 의미 덩어리로 만드십시오.
            * 잘못된 직역 예: 한 생쥐 창궐 이다 공포에 떨게 하고 있는 농민들을 가로질러/걸쳐 광활한 전역 ~의 호주 / ~와 함께 그 설치류들이 날뛰면서 겉잡을 수 없이
            * 올바른 직역 예: 생쥐 창궐이 / 농민들을 공포에 떨게 하고 있다 / 호주의 광활한 전역에 걸쳐 / 이 설치류들이 겉잡을 수 없이 날뛰면서
          - "naturalTranslation" (의역)은 직독직해용 슬래시('/') 기호를 전면 배제하고, 한국어 본연의 완벽하게 매끄러운 어순 배열(주어+목적어+부사구+동사)로 완전하게 다듬어진 최종 완성형 한국어 문장이어야 합니다. 절대로 직역 텍스트를 동일하게 복사하여 넣지 마십시오!

   - Provide a natural Korean word-by-word direct translation (직독직해 어순 번역) for each chunk using the English-aligned format.
   - Provide the "directTranslation" (직역) for the entire sentence, dividing the translated chunks clearly using slashes ('/'). Match the chunk breakdown exactly!
   - Provide the "naturalTranslation" (의역) for the entire sentence, making it a natural, smooth, and standard Korean translation.
   - Provide a detailed "structureAnalysis" (영어 문장 구조식 분석 - 구조 및 기능) in Korean.
     * **🚨 문장 성분 매핑 전면 제거 및 마크다운 기호 제거 제약 (CRITICAL) 🚨**:
       - [구문 뼈대 매핑], [주어 (Subject)], [동사 (Verb)], [목적어 (Object)], [수식어 (Modifier)], [문장 성분 및 기능 구조] 항목을 **절대 출력하지 마십시오**. 모두 삭제합니다.
       - 텍스트 내부에 강조를 위한 별표(**) 마크다운 기호를 절대 사용하지 마십시오. 오직 깔끔한 일반 텍스트 형태로만 출력해야 합니다.
       - 오직 고등 내신 및 수능에 직결되는 핵심 문법 내용만 명확하게 **한 줄**로 요약하여 아래 포맷으로 정확히 출력하십시오:
         출제어법 포인트: [해당 문장에서 고등학생이 반드시 알아야 하는 핵심 문법 내용을 비전공자도 이해하기 쉽게 한 줄로 정리]
   - Assign a part-of-speech or structural tag to each chunk (e.g., 'S+V', 'O/C', 'PREP', 'CLAUSE', 'to-Inf', 'PARTICIPLE').
   - Analyze the grammatical sentence classification and include a "classification" object.
3. Extract exactly 10 high-level, academic, or domain-specific context words and idioms from the text.
   - **CRITICAL PEDAGOGICAL RULE**: Exclude extremely simple primary words. Include CEFR B1-C1 level academic terminology.

### Few-Shot Gold Standard Example (CRITICAL REFERENCE)
If the input text contains: "A mouse plague is terrorising farmers across large swathes of Australia, with the rodents running rampant around homes and ravaging fields of grain.", you MUST output the parsed result exactly formatted like this:
{
  "title": "A Mouse Plague in Australia",
  "backgroundKnowledge": "호주 전역에서 대규모 생쥐 떼의 창궐로 인해 발생한 극심한 농업적, 경제적 위기 상황을 설명하는 지문입니다. 생쥐들이 집 안팎을 넘나들며 식량을 훼손하고 농민들을 공포로 밀어 넣는 생태계 교란과 농민들의 고통스러운 삶의 맥락을 보여줍니다.",
  "sentences": [
    {
      "english": "A mouse plague is terrorising farmers across large swathes of Australia, with the rodents running rampant around homes and ravaging fields of grain.",
      "directTranslation": "생쥐 창궐이 / 농민들을 공포에 떨게 하고 있다 / 호주의 광활한 전역에 걸쳐 / 이 설치류들이 겉잡을 수 없이 날뛰면서 / 집 주변에서 / 그리고 곡물밭을 황폐화시키면서.",
      "naturalTranslation": "생쥐 떼의 창궐이 호주 전역의 광활한 지역을 덮치면서 농민들을 공포에 빠뜨리고 있으며, 이 설치류들은 가정집 주변에서 겉잡을 수 없이 날뛰고 곡물밭을 황폐화시키고 있습니다.",
      "structureAnalysis": "출제어법 포인트: 전치사 with 뒤에 명사(the rodents)와 현재분사(running, ravaging)가 and로 병렬 연결되어 동시 상황을 나타내는 구문으로, 명사와의 관계가 능동이므로 현재분사 ing 형태를 써야 하는 점이 시험에 출제됩니다.",
      "classification": {
        "oxfordPattern": "Pattern 12 (S+V+N+Prep+N)",
        "fiveStructure": "3형식",
        "sentenceType": "안은문장: 부사절"
      },
      "chunks": [
        { "text": "A mouse plague", "meaning": "생쥐 창궐이", "tag": "S+V" },
        { "text": "is terrorising farmers", "meaning": "농민들을 공포에 떨게 하고 있다", "tag": "O/C" },
        { "text": "across large swathes of Australia,", "meaning": "호주의 광활한 전역에 걸쳐", "tag": "PREP" },
        { "text": "with the rodents running rampant", "meaning": "이 설치류들이 겉잡을 수 없이 날뛰면서", "tag": "PARTICIPLE" },
        { "text": "around homes", "meaning": "집 주변에서", "tag": "PREP" },
        { "text": "and ravaging fields of grain.", "meaning": "그리고 곡물밭을 황폐화시키면서.", "tag": "CONJ" }
      ]
    }
  ],
  "vocab": [
    {
      "word": "terrorise",
      "meaning": "공포에 떨게 하다",
      "synonyms": "frighten (겁주다), intimidate (위협하다)",
      "antonyms": "comfort (위로하다), soothe (진정시키다)",
      "similarIdioms": "terrorise the public (대중을 공포에 떨게 하다)"
    },
    {
      "word": "rampant",
      "meaning": "겉잡을 수 없는, 만연하는",
      "synonyms": "uncontrolled (통제되지 않는), widespread (널리 퍼진)",
      "antonyms": "controlled (통제된), mild (온화한)",
      "similarIdioms": "run rampant (겉잡을 수 없이 날뛰다)"
    }
  ]
}

Return a strict, valid JSON object with NO markdown formatting or surrounding code blocks. The JSON structure MUST match this exact schema:
{
  "title": "A short, engaging title for this passage in English",
  "backgroundKnowledge": "Detailed historical, cultural, or scientific background knowledge of the passage in Korean. Explain context and key elements in 3-4 sentences to help students understand.",
  "sentences": [
    {
      "english": "Full sentence string",
      "directTranslation": "Korean direct translation divided by slashes",
      "naturalTranslation": "Natural Korean translation",
      "structureAnalysis": "Grammatical syntax breakdown structure",
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

  const prompt = `You are a professional compiler, English-Korean syntax mapping expert, and high-school prep CSAT/midterm English exam consultant.
We have a raw, messy copy-pasted text from an external premium English analysis document.
Analyze this text, filter out noise, extract a clean, structured LingoStar lesson dataset, and **HEAL any micro-fragmented slashes** to form robust chunky semantic segments.

Requirements:
1. Extract the title if available, or generate a suitable one.
2. Group the text into clean sentences.
3. For each sentence:
   - Extract the correct English sentence.
   - Segment it into natural, readable, and grammatically distinct chunky semantic units. Keep the text exact!
     * **STRICT CHUNKING & AUTO-CORRECTION RULES (CRITICAL)**:
       If the copy-pasted text has highly fragmented slash divisions (e.g., "is / terrorising", "of / Australia", "and / ravaging fields / of grain"), you MUST **re-aggregate and heal them** into proper chunky blocks:
       1. **Verb Phrases (Auxiliary + Main verb, progressive, passive, or perfect tense) MUST be kept as a SINGLE chunk**. Never split them!
          - Good: "is terrorising" (O) / Bad: "is" + "terrorising" (X)
       2. **Prepositional Phrases [Preposition + Noun phrase] MUST be kept as a SINGLE semantic chunk**. Never split a preposition from its noun or modifier!
           - Good: "across large swathes" (O)
           - Good: "of Australia" (O)
       3. **Participle Clauses or Idiomatic Expressions with their objects/modifiers MUST be kept together in logical chunks**.
          - Good: "with the rodents running rampant" (O) / Bad: "with the rodents" + "running rampant" (X)


     * **🚨 절대 준수 제약 사항 (Fatal Constraints) 🚨**:
       1. **한국어 번역 내 영단어 전면 금지 (No English/Alphabet in Translations)**:
          - "directTranslation" (직역), "naturalTranslation" (의역), 그리고 chunks 배열 내의 모든 "meaning" 필드 안에는 어떠한 영어 단어나 알파벳 문자(A-Z, a-z)도 단 한 글자도 남겨두지 마십시오. 모든 영어 어휘는 반드시 온전하고 명료한 한국어 번역으로 완전히 치환되어야 합니다.
       2. **메타 메시지 및 플레이스홀더 출력 절대 금지 (0% Status/Meta Placeholders)**:
          - "준비 완료", "번역 대기", "분석 진행 중" 등 어떠한 대기성 안내 문구나 상태 설명용 플레이스홀더 텍스트도 출력하지 마십시오. 반드시 시스템이 보유한 번역 및 구문 분석 지식을 동원해 **100% 온전하게 완성된 실제 번역 문장과 실제 구문 분석 데이터**를 즉시 채워 넣으십시오.
       3. **1:1 청크 대응 법칙 (1:1 Chunk Slash Alignment)**:
          - 영어 문장에서 나눈 chunks 배열의 개수와 "directTranslation"에 포함되는 슬래시('/') 기호로 분할되는 조각의 개수 및 순서가 완벽하게 1:1 대칭 매핑을 이루어야 합니다.
       4. **직역과 의역의 명확한 차별화 및 자연스러운 어순 직역 룰 (Strict Direct Translation Rule)**:
           - **기계적 조사 결합 금지 및 물결표(~) 전면 금지**: a -> 한, is -> 이다, of -> ~의, with -> ~와 함께 처럼 기계적으로 조사를 이어 붙이는 것을 철저히 배제하십시오. 물결표('~') 기호 사용은 전면 금지합니다.
           - **의미 단위 중심의 자연스러운 한글화**: 각 청크 내부의 단어들은 영어 어순을 철저히 유지하되, 한국어의 조사와 어미를 자연스럽게 결합하여 하나의 완결된 의미 덩어리로 만드십시오.
             * 잘못된 직역 예: 한 생쥐 창궐 이다 공포에 떨게 하고 있는 농민들을 가로질러/걸쳐 광활한 전역 ~의 호주 / ~와 함께 그 설치류들이 날뛰면서 겉잡을 수 없이
             * 올바른 직역 예: 생쥐 창궐이 / 농민들을 공포에 떨게 하고 있다 / 호주의 광활한 전역에 걸쳐 / 이 설치류들이 겉잡을 수 없이 날뛰면서
           - "naturalTranslation" (의역)은 직독직해용 슬래시('/') 기호나 물결표('~') 기호를 100% 전면 제거하고, 한국어 본연의 자연스러운 어순 배열(주어+목적어+부사구+동사)로 완전하게 재정렬하여 다듬어진 매끄럽고 고급스러운 한국어 번역이어야 합니다. 절대로 직역 텍스트를 동일하게 복사하여 넣지 마십시오!

   - Extract/align the Korean direct translation (직독직해 어순번역) matching those chunks from the raw text translations.
     * **STRICT WORD ORDER RULE**: The translation MUST align perfectly with the English word order.
   - Provide the "directTranslation" (직역) for the entire sentence, dividing the translated chunks clearly using slashes ('/').
   - Provide the "naturalTranslation" (의역) for the entire sentence, making it a natural, smooth, and standard Korean translation.
   - Provide a detailed "structureAnalysis" (영어 문장 구조식 분석 - 구조 및 기능) in Korean.
     * **🚨 문장 성분 매핑 전면 제거 및 마크다운 기호 제거 제약 (CRITICAL) 🚨**:
       - [구문 뼈대 매핑], [주어 (Subject)], [동사 (Verb)], [목적어 (Object)], [수식어 (Modifier)], [문장 성분 및 기능 구조] 항목을 **절대 출력하지 마십시오**. 모두 삭제합니다.
       - 텍스트 내부에 강조를 위한 별표(**) 마크다운 기호를 절대 사용하지 마십시오. 오직 깔끔한 일반 텍스트 형태로만 출력해야 합니다.
       - 오직 고등 내신 및 수능에 직결되는 핵심 문법 내용만 명확하게 **한 줄**로 요약하여 아래 포맷으로 정확히 출력하십시오:
         출제어법 포인트: [해당 문장에서 고등학생이 반드시 알아야 하는 핵심 문법 내용을 비전공자도 이해하기 쉽게 한 줄로 정리]
   - Tag each chunk appropriately.
   - Analyze the grammatical sentence classification and include a "classification" object.
4. Scan and compile the vocabulary list embedded in the raw text.

### Few-Shot Gold Standard Example (CRITICAL REFERENCE)
If the input is raw, messy text resembling this:
"문장 1: A mouse plague / is / terrorising farmers / across large swathes / of Australia, with the rodents / running rampant around homes and / ravaging fields / of grain.
직역: 생쥐 창궐이 / 농민들을 공포에 떨게 하고 있다 / 호주의 광활한 전역에 걸쳐 / 이 설치류들이 겉잡을 수 없이 날뛰면서 / 집 주변에서 / 그리고 곡물밭을 황폐화시키면서.
의역: 생쥐 떼의 창궐이 호주 전역의 광활한 지역을 덮치면서 농민들을 공포에 빠뜨리고 있으며, 이 설치류들은 가정집 주변에서 겉잡을 수 없이 날뛰고 곡물밭을 황폐화시키고 있습니다."

You MUST heal the fragmentation and output the sentences array exactly like this:
{
  "title": "A Mouse Plague in Australia",
  "backgroundKnowledge": "호주 전역에서 대규모 생쥐 떼의 창궐로 인해 발생한 극심한 농업적, 경제적 위기 상황을 설명하는 지문입니다. 생쥐들이 집 안팎을 넘나들며 식량을 훼손하고 농민들을 공포로 밀어 넣는 생태계 교란과 농민들의 고통스러운 삶의 맥락을 보여줍니다.",
  "sentences": [
    {
      "english": "A mouse plague is terrorising farmers across large swathes of Australia, with the rodents running rampant around homes and ravaging fields of grain.",
      "directTranslation": "생쥐 창궐이 / 농민들을 공포에 떨게 하고 있다 / 호주의 광활한 전역에 걸쳐 / 이 설치류들이 겉잡을 수 없이 날뛰면서 / 집 주변에서 / 그리고 곡물밭을 황폐화시키면서.",
      "naturalTranslation": "생쥐 떼의 창궐이 호주 전역의 광활한 지역을 덮치면서 농민들을 공포에 빠뜨리고 있으며, 이 설치류들은 가정집 주변에서 겉잡을 수 없이 날뛰고 곡물밭을 황폐화시키고 있습니다.",
      "structureAnalysis": "출제어법 포인트: 전치사 with 뒤에 명사(the rodents)와 현재분사(running, ravaging)가 and로 병렬 연결되어 동시 상황을 나타내는 구문으로, 명사와의 관계가 능동이므로 현재분사 ing 형태를 써야 하는 점이 시험에 출제됩니다.",
      "classification": {
        "oxfordPattern": "Pattern 12 (S+V+N+Prep+N)",
        "fiveStructure": "3형식",
        "sentenceType": "안은문장: 부사절"
      },
      "chunks": [
        { "text": "A mouse plague", "meaning": "생쥐 창궐이", "tag": "S+V" },
        { "text": "is terrorising farmers", "meaning": "농민들을 공포에 떨게 하고 있다", "tag": "O/C" },
        { "text": "across large swathes of Australia,", "meaning": "호주의 광활한 전역에 걸쳐", "tag": "PREP" },
        { "text": "with the rodents running rampant", "meaning": "이 설치류들이 겉잡을 수 없이 날뛰면서", "tag": "PARTICIPLE" },
        { "text": "around homes", "meaning": "집 주변에서", "tag": "PREP" },
        { "text": "and ravaging fields of grain.", "meaning": "그리고 곡물밭을 황폐화시키면서.", "tag": "CONJ" }
      ]
    }
  ],
  "vocab": [
    {
      "word": "terrorise",
      "meaning": "공포에 떨게 하다",
      "synonyms": "frighten (겁주다), intimidate (위협하다)",
      "antonyms": "comfort (위로하다), soothe (진정시키다)",
      "similarIdioms": "terrorise the public (대중을 공포에 떨게 하다)"
    },
    {
      "word": "rampant",
      "meaning": "겉잡을 수 없는, 만연하는",
      "synonyms": "uncontrolled (통제되지 않는), widespread (널리 퍼진)",
      "antonyms": "controlled (통제된), mild (온화한)",
      "similarIdioms": "run rampant (겉잡을 수 없이 날뛰다)"
    }
  ]
}

Return a strict, valid JSON object with NO markdown formatting or surrounding code blocks. The JSON structure MUST match this exact schema:
{
  "title": "Extracted or generated English title",
  "backgroundKnowledge": "Detailed historical, cultural, or scientific background knowledge of the passage in Korean. Explain context and key elements in 3-4 sentences to help students understand.",
  "sentences": [
    {
      "english": "Full English sentence string",
      "directTranslation": "Korean direct translation divided by slashes",
      "naturalTranslation": "Natural Korean translation",
      "structureAnalysis": "Grammatical syntax breakdown structure",
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
function cleanJsonResponse(rawText) {
  if (!rawText) return "";
  let cleanStr = rawText.trim();
  
  cleanStr = cleanStr.replace(/^```json\s*/i, "");
  cleanStr = cleanStr.replace(/^```\s*/i, "");
  cleanStr = cleanStr.replace(/\s*```$/, "");
  
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
        chunks = [{ text: english, meaning: s.meaning || "번역 정보가 없습니다.", tag: "S+V" }];
      }

      const classification = s.classification || {};
      const healedClassification = {
        oxfordPattern: classification.oxfordPattern || "Pattern 1 (S+V)",
        fiveStructure: classification.fiveStructure || "1형식",
        sentenceType: classification.sentenceType || "홑문장"
      };

      const directTranslation = s.directTranslation || chunks.map(c => c.meaning).join(' / ');
      const naturalTranslation = s.naturalTranslation || s.meaning || chunks.map(c => c.meaning).join(' ').replace(/\s+/g, ' ');
      
      const structureAnalysis = s.structureAnalysis || 
        `출제어법 포인트: 문장의 기본 동사 수의 일치 및 준동사의 성분 결합 구조와 능동/수동 태의 관계가 시험에 단골 출제됩니다.`;

      return { 
        english, 
        chunks, 
        classification: healedClassification,
        directTranslation,
        naturalTranslation,
        structureAnalysis
      };
    });
  }

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
 * 5. Gemini API 호출 공통 내부 헬퍼 (JSON Mode)
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
      temperature: 0.1
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

    const cleanedText = cleanJsonResponse(candidateText);

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

/**
 * 6. 단일 단어/숙어 실시간 사전 분석 커넥터
 */
export async function fetchWordDefinitionWithGemini(word, apiKey) {
  if (!apiKey) throw new Error("API Key가 누락되었습니다.");

  const prompt = `You are a professional lexicographer and English-Korean language teacher.
Analyze the following English word or idiom: "${word}"

Generate a strict JSON response with this exact structure:
{
  "word": "${word}",
  "meaning": "Korean definition in plain, simple Korean suitable for a high school prep student",
  "synonyms": "comma-separated synonyms in English with short Korean translation in parentheses, e.g. frighten (겁주다), intimidate (위협하다)",
  "antonyms": "comma-separated antonyms in English with short Korean translation in parentheses",
  "similarIdioms": "A list of 2-3 similar idioms or phrases containing the word with their Korean translations"
}

Do NOT include any markdown code blocks, backticks, or text before/after the JSON. Output only a valid JSON string.`;

  try {
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
        temperature: 0.1
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response");

    const cleanedText = cleanJsonResponse(text);
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("fetchWordDefinitionWithGemini failed:", error);
    // Return a default lookup fallback
    return {
      word,
      meaning: "(실시간 사전 로드 오류)",
      synonyms: "정보 없음",
      antonyms: "정보 없음",
      similarIdioms: ""
    };
  }
}

