import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BigButton } from '../components/BigButton';

const TAG_DISPLAY_MAP = {
  "S+V": "주어 + 동사 (Subject + Verb Phrase)",
  "O/C": "목적어 / 보어 (Object / Complement)",
  "to-Inf": "to 부정사구 (to-Infinitive Modifier)",
  "CONJ": "접속사 / 관계사 마디 (Conjunction Claues)",
  "PREP": "전치사구 수식어 (Prepositional Phrase)",
  "AD": "부사구 수식어 (Adverbial Modifier)"
};

const GRAMMAR_GUIDE_MAP = {
  "S+V": "문장의 핵심 뼈대가 되는 [주어와 동사] 구간입니다. 이 문장의 전체 행동과 주체를 결정하는 가장 중요한 핵심축이에요.",
  "O/C": "동사의 행위 대상이 되는 [목적어] 또는 주어의 상태를 입체적으로 보충해 주는 [보어] 구간입니다.",
  "to-Inf": "[to + 동사원형] 형태로 만들어진 구문으로, 명사 뒤에서 형용사처럼 꾸며주거나 '~하기 위한 목적/행동'을 나타내는 수식입니다.",
  "CONJ": "문장과 문장을 유기적으로 묶어주는 [접속사]나 앞서 나온 명사를 다채롭게 부연 설명하는 [관계사]가 이끄는 긴 수식 마디입니다.",
  "PREP": "장소, 시간, 이유, 방법 등의 구체적인 배경과 환경을 보충하여 설명해주는 [전치사 + 명사] 결합 수식어입니다.",
  "AD": "동사, 형용사 또는 문장 전체를 한층 생동감 있게 다듬고 꾸며주는 [부사 / 부사구] 수식어 구간입니다."
};

// 📚 LingoStar 어순 분석 정밀 족보 DB 패밀리 (예시 및 34번 모의고사 지문 1:1 완벽 이식)
const MOCK_GENEALOGY_MAP = {
  "a loyal companion always supports you through difficult times.": [
    {
      text: "A loyal companion",
      tag: "S+V",
      componentLabel: "Subject Phrase",
      componentDesc: "동반자",
      grammarHint: "주어 역할을 하는 명사구입니다.",
      iconChar: "ⓘ",
      accentColor: "#005dac",
      capsuleBg: "#d0ebff",
      hintBg: "#eef6fc"
    },
    {
      text: "always supports",
      tag: "O/C",
      componentLabel: "Verb Phrase",
      componentDesc: "항상 지원한다",
      grammarHint: "빈도부사 always의 위치와 3인칭 단수 동사 supports를 확인하세요.",
      iconChar: "💡",
      accentColor: "#2b8a3e",
      capsuleBg: "#ebfbee",
      hintBg: "#eef8ef"
    },
    {
      text: "you through difficult times.",
      tag: "PREP",
      componentLabel: "Object/Adverbial Phrase",
      componentDesc: "어려운 시기에 너를",
      grammarHint: "동사의 목적어와 전치사구가 결합된 형태입니다.",
      iconChar: "🔗",
      accentColor: "#495057",
      capsuleBg: "#e9ecef",
      hintBg: "#f8f9fa"
    }
  ],
  "when scientists make an important new discovery or experimentally prove some hypothesis,": [
    {
      text: "When scientists",
      tag: "S+V",
      componentLabel: "Subject Phrase",
      componentDesc: "과학자들이 ~할 때",
      grammarHint: "시간을 나타내는 부사절 접속사 When과 주어가 결합된 시작 마디입니다.",
      iconChar: "ⓘ",
      accentColor: "#005dac",
      capsuleBg: "#d0ebff",
      hintBg: "#eef6fc"
    },
    {
      text: "make / experimentally prove",
      tag: "O/C",
      componentLabel: "Verb Phrase",
      componentDesc: "발견을 하거나 가설을 증명하다",
      grammarHint: "두 개의 동사(make, prove)가 등위접속사 or로 병렬 연결된 서술어 구간입니다.",
      iconChar: "💡",
      accentColor: "#2b8a3e",
      capsuleBg: "#ebfbee",
      hintBg: "#eef8ef"
    },
    {
      text: "an important new discovery / some hypothesis",
      tag: "PREP",
      componentLabel: "Object/Adverbial Phrase",
      componentDesc: "중요한 발견을 / 어떤 가설을",
      grammarHint: "타동사 make와 prove의 각각의 직접 목적어 명사구 성분들입니다.",
      iconChar: "🔗",
      accentColor: "#495057",
      capsuleBg: "#e9ecef",
      hintBg: "#f8f9fa"
    }
  ],
  "they do not, in general, keep that information to themselves so that they alone can consider its meaning": [
    {
      text: "they",
      tag: "S+V",
      componentLabel: "Subject Phrase",
      componentDesc: "그들은",
      grammarHint: "앞서 언급된 scientists(과학자들)를 가리키는 대명사 주어 성분입니다.",
      iconChar: "ⓘ",
      accentColor: "#005dac",
      capsuleBg: "#d0ebff",
      hintBg: "#eef6fc"
    },
    {
      text: "do not, in general, keep",
      tag: "O/C",
      componentLabel: "Verb Phrase",
      componentDesc: "일반적으로 비밀로 간직하지 않는다",
      grammarHint: "부사구 in general(일반적으로)이 서술어 동사구 사이에 조화롭게 삽입된 구조입니다.",
      iconChar: "💡",
      accentColor: "#2b8a3e",
      capsuleBg: "#ebfbee",
      hintBg: "#eef8ef"
    },
    {
      text: "that information to themselves so that they alone can consider its meaning",
      tag: "PREP",
      componentLabel: "Object/Adverbial Phrase",
      componentDesc: "그 정보를 그들 자신에게만",
      grammarHint: "지시형용사 that이 수식하는 목적어와 결과/목적을 이끄는 부사절(so that) 마디입니다.",
      iconChar: "🔗",
      accentColor: "#495057",
      capsuleBg: "#e9ecef",
      hintBg: "#f8f9fa"
    }
  ],
  "instead, they publish their results and make their data available for inspection.": [
    {
      text: "Instead, they",
      tag: "S+V",
      componentLabel: "Subject Phrase",
      componentDesc: "대신에, 그들은",
      grammarHint: "연결부사 Instead가 대조의 흐름을 열고 대명사 주어로 이어지는 결합부입니다.",
      iconChar: "ⓘ",
      accentColor: "#005dac",
      capsuleBg: "#d0ebff",
      hintBg: "#eef6fc"
    },
    {
      text: "publish their results",
      tag: "O/C",
      componentLabel: "Verb Phrase",
      componentDesc: "그들의 결과를 발표한다",
      grammarHint: "타동사 publish와 그 동작의 직접적인 대상인 목적어가 결합된 3형식 뼈대입니다.",
      iconChar: "💡",
      accentColor: "#2b8a3e",
      capsuleBg: "#ebfbee",
      hintBg: "#eef8ef"
    },
    {
      text: "and make their data available for inspection.",
      tag: "PREP",
      componentLabel: "Object/Adverbial Phrase",
      componentDesc: "데이터를 검토를 위해 공개한다",
      grammarHint: "make + 목적어 + 목적격보어(available) 형태의 전형적인 5형식 문장 확장입니다.",
      iconChar: "🔗",
      accentColor: "#495057",
      capsuleBg: "#e9ecef",
      hintBg: "#f8f9fa"
    }
  ],
  "this makes it possible for other scientists to reconsider their data and possibly refute their conclusions.": [
    {
      text: "This makes it possible",
      tag: "S+V",
      componentLabel: "Subject Phrase",
      componentDesc: "이것은 가능하게 만든다",
      grammarHint: "this(앞문장 전체 내용)가 주어로 오고 가목적어 it과 목적격보어가 결합된 구조입니다.",
      iconChar: "ⓘ",
      accentColor: "#005dac",
      capsuleBg: "#d0ebff",
      hintBg: "#eef6fc"
    },
    {
      text: "for other scientists",
      tag: "O/C",
      componentLabel: "Verb Phrase",
      componentDesc: "다른 과학자들이",
      grammarHint: "to 부정사구의 행위 주체를 명확히 표출해 주는 의미상의 주어(for + 목적격)입니다.",
      iconChar: "💡",
      accentColor: "#2b8a3e",
      capsuleBg: "#ebfbee",
      hintBg: "#eef8ef"
    },
    {
      text: "to reconsider their data and possibly refute their conclusions.",
      tag: "PREP",
      componentLabel: "Object/Adverbial Phrase",
      componentDesc: "데이터를 재검토하고 반박할 수 있도록",
      grammarHint: "makes의 진짜 목적어 역할을 하는 진목적어 to 부정사구 병렬 연결 구간입니다.",
      iconChar: "🔗",
      accentColor: "#495057",
      capsuleBg: "#e9ecef",
      hintBg: "#f8f9fa"
    }
  ],
  "more important, though, it makes it possible for other scientists to use that data to construct new hypotheses and perform new experiments.": [
    {
      text: "More important, though, it",
      tag: "S+V",
      componentLabel: "Subject Phrase",
      componentDesc: "하지만 더 중요한 것은, 이것이",
      grammarHint: "양보부사 though가 삽입되고 대명사 it이 주어 역할을 담당하는 마디입니다.",
      iconChar: "ⓘ",
      accentColor: "#005dac",
      capsuleBg: "#d0ebff",
      hintBg: "#eef6fc"
    },
    {
      text: "makes it possible for other scientists",
      tag: "O/C",
      componentLabel: "Verb Phrase",
      componentDesc: "타 과학자들이 가능하게 만든다",
      grammarHint: "가목적어 it과 의미상 주어(for other scientists)가 융합된 복합 구문 구조입니다.",
      iconChar: "💡",
      accentColor: "#2b8a3e",
      capsuleBg: "#ebfbee",
      hintBg: "#eef8ef"
    },
    {
      text: "to use that data to construct new hypotheses and perform new experiments.",
      tag: "PREP",
      componentLabel: "Object/Adverbial Phrase",
      componentDesc: "데이터를 사용해 새 실험을 하도록",
      grammarHint: "to use 이하의 진목적어 안에 부사적 목적의 to 부정사(to construct...)가 재결합되었습니다.",
      iconChar: "🔗",
      accentColor: "#495057",
      capsuleBg: "#e9ecef",
      hintBg: "#f8f9fa"
    }
  ],
  "the assumption is that society as a whole will end up knowing more if information is spread as widely as possible.": [
    {
      text: "The assumption is",
      tag: "S+V",
      componentLabel: "Subject Phrase",
      componentDesc: "그 전제는 ~이다",
      grammarHint: "명사 주어와 2형식 불완전자동사 be동사가 만나 보어절(that절)을 기다리는 핵심부입니다.",
      iconChar: "ⓘ",
      accentColor: "#005dac",
      capsuleBg: "#d0ebff",
      hintBg: "#eef6fc"
    },
    {
      text: "that society as a whole will end up knowing more",
      tag: "O/C",
      componentLabel: "Verb Phrase",
      componentDesc: "사회 전체가 결국 더 많이 알게 된다는 것",
      grammarHint: "명사절 접속사 that이 이끄는 보어절이자, end up + 동명사(~로 끝나다) 숙어가 결합된 마디입니다.",
      iconChar: "💡",
      accentColor: "#2b8a3e",
      capsuleBg: "#ebfbee",
      hintBg: "#eef8ef"
    },
    {
      text: "if information is spread as widely as possible.",
      tag: "PREP",
      componentLabel: "Object/Adverbial Phrase",
      componentDesc: "정보가 최대한 널리 퍼지게 된다면",
      grammarHint: "조건의 부사절 if와 원급 비교(as widely as possible - 가능한 한 널리)가 병합된 완성부입니다.",
      iconChar: "🔗",
      accentColor: "#495057",
      capsuleBg: "#e9ecef",
      hintBg: "#f8f9fa"
    }
  ]
};

// 🎨 저시력 유저용 안구보호 고대비 & 저채도 테마별 색상 스키마 매퍼
const getThemeAdjustedStyles = (themeName) => {
  if (themeName === 'dark') {
    return {
      S: '#5c93e6', // 눈부심 차단 파스텔 블루
      V: '#66bb6a', // 파스텔 연두
      O: '#ffe082', // 파스텔 황색
      M: '#ef5350', // 파스텔 적색
      bgS: 'rgba(92, 147, 230, 0.12)',
      bgV: 'rgba(102, 187, 106, 0.12)',
      bgO: 'rgba(255, 224, 130, 0.12)',
      bgM: 'rgba(239, 83, 80, 0.12)',
      cardBg: '#1e1e1e'
    };
  }
  if (themeName === 'yellow') {
    return {
      S: '#5d4037', // 자외선/블루라이트 차단 진브라운
      V: '#2e7d32', // 차분한 녹색
      O: '#ef6c00', // 차분한 주황
      M: '#c62828', // 다크 레드
      bgS: 'rgba(93, 64, 55, 0.08)',
      bgV: 'rgba(46, 125, 50, 0.08)',
      bgO: 'rgba(239, 108, 0, 0.08)',
      bgM: 'rgba(198, 40, 40, 0.08)',
      cardBg: '#fffde7'
    };
  }
  if (themeName === 'high-contrast') {
    return {
      S: 'var(--color-text)', // 완전한 흑백 고대비
      V: 'var(--color-text)',
      O: 'var(--color-text)',
      M: 'var(--color-text)',
      bgS: 'transparent',
      bgV: 'transparent',
      bgO: 'transparent',
      bgM: 'transparent',
      cardBg: 'transparent',
      borderStyle: '3px solid var(--color-text)'
    };
  }
  if (themeName === 'blue-soft') {
    return {
      S: '#1976d2',
      V: '#388e3c',
      O: '#fbc02d',
      M: '#d32f2f',
      bgS: 'rgba(25, 118, 210, 0.06)',
      bgV: 'rgba(56, 142, 60, 0.06)',
      bgO: 'rgba(251, 192, 45, 0.08)',
      bgM: 'rgba(211, 47, 47, 0.06)',
      cardBg: '#f0f4f8'
    };
  }
  
  // 기본 라이트 모드
  return {
    S: '#005dac',
    V: '#196b22',
    O: '#e65100',
    M: '#c62828',
    bgS: 'rgba(0, 93, 172, 0.06)',
    bgV: 'rgba(25, 107, 34, 0.06)',
    bgO: 'rgba(230, 81, 0, 0.06)',
    bgM: 'rgba(198, 40, 40, 0.06)',
    cardBg: '#ffffff'
  };
};

// 지능형 구문 분석 성분 배지 매퍼
const getWordGrammarTag = (chunkText, word, wordIdx, tag, themeName) => {
  const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").toLowerCase().trim();
  if (!cleanWord || cleanWord.length === 0) return null;

  const colors = getThemeAdjustedStyles(themeName);

  if (['PREP', 'to-Inf', 'CONJ', 'AD'].includes(tag)) {
    return wordIdx === 0 ? { label: 'M', color: colors.M, bg: colors.bgM, fontColor: themeName === 'high-contrast' ? 'var(--color-bg)' : colors.M, name: '수식어(Modifier)' } : null;
  }

  if (tag === 'O/C') {
    return wordIdx === 0 ? { label: 'O', color: colors.O, bg: colors.bgO, fontColor: themeName === 'high-contrast' ? 'var(--color-bg)' : colors.O, name: '목적어/보어(Object/Complement)' } : null;
  }

  if (tag === 'S+V') {
    const verbs = [
      'is', 'are', 'was', 'were', 'am', 'has', 'have', 'had', 'warned', 'need', 
      'needs', 'shows', 'show', 'used', 'use', 'studies', 'study', 'helps', 'help', 
      'painted', 'can', 'clean', 'cleans', 'becomes', 'become', 'looking', 'look', 'supports', 'support'
    ];
    
    const words = chunkText.toLowerCase().split(/\s+/).map(w => w.replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim());
    const firstVerbIdx = words.findIndex(w => verbs.includes(w));
    
    if (firstVerbIdx !== -1) {
      if (wordIdx === 0) {
        return { label: 'S', color: colors.S, bg: colors.bgS, fontColor: themeName === 'high-contrast' ? 'var(--color-bg)' : colors.S, name: '주어(Subject)' };
      }
      if (wordIdx === firstVerbIdx) {
        return { label: 'V', color: colors.V, bg: colors.bgV, fontColor: themeName === 'high-contrast' ? 'var(--color-bg)' : colors.V, name: '동사(Verb)' };
      }
    } else {
      if (wordIdx === 0) return { label: 'S', color: colors.S, bg: colors.bgS, fontColor: themeName === 'high-contrast' ? 'var(--color-bg)' : colors.S, name: '주어(Subject)' };
      if (wordIdx === Math.floor(words.length / 2)) return { label: 'V', color: colors.V, bg: colors.bgV, fontColor: themeName === 'high-contrast' ? 'var(--color-bg)' : colors.V, name: '동사(Verb)' };
    }
  }

  return null;
};

export default function ChunkReadingPage() {
  const { 
    activePassage, 
    currentSentenceIndex, 
    fontSize, 
    speakText, 
    addToVocab, 
    removeFromVocab,
    myVocab = [],
    dictMock, 
    parseDynamicWordMeaning, 
    fetchLiveWordDefinition,
    theme,
    nextSentence,
    prevSentence
  } = useApp();
  
  // 모달 팝업 상태
  const [selectedWord, setSelectedWord] = useState(null);
  const [meaning, setMeaning] = useState('');
  const [synonyms, setSynonyms] = useState('');
  const [antonyms, setAntonyms] = useState('');
  const [similarIdioms, setSimilarIdioms] = useState('');

  // ✨ 구문 분석 인터랙티브 퀴즈 상태
  const [showAllAnalysis, setShowAllAnalysis] = useState(false);
  const [revealedCards, setRevealedCards] = useState([]);

  const passages = activePassage ? (activePassage.sentences || []) : [];
  const currentIndex = currentSentenceIndex;

  if (!passages || passages.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p style={{ fontSize: `${fontSize}px`, fontWeight: 'bold' }}>지문이 존재하지 않습니다.</p>
      </div>
    );
  }

  const splitIntoChunksFallback = (sentence) => {
    const regex = /(.*?)(,| that | which | who | and | but | because | however )/gi;
    let chunks = [];
    let match;
    let lastIndex = 0;
    
    while ((match = regex.exec(sentence)) !== null) {
      chunks.push(match[0].trim());
      lastIndex = regex.lastIndex;
    }
    
    const remaining = sentence.slice(lastIndex).trim();
    if (remaining) {
      chunks.push(remaining);
    }
    
    if (chunks.length <= 1) {
      const words = sentence.split(' ');
      const mid = Math.ceil(words.length / 2);
      if (words.length > 4) {
        return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
      }
      return [sentence];
    }
    
    return chunks;
  };

  const rawSentenceObj = passages[currentIndex];
  const currentSentence = typeof rawSentenceObj === 'string' 
    ? rawSentenceObj 
    : (rawSentenceObj?.text || rawSentenceObj?.english || '');

  // DB에 저장된 풍부한 청크 구조 연동
  const chunks = (rawSentenceObj && rawSentenceObj.chunks && rawSentenceObj.chunks.length > 0)
    ? rawSentenceObj.chunks
    : splitIntoChunksFallback(currentSentence).map(text => ({
        text,
        meaning: '',
        tag: 'AD'
      }));

  // 🧬 문장 클리닝 및 동적 족보 매칭 (Stitch 100% 모바일 UI 감성 구현)
  const cleanSentText = currentSentence.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "");
  
  // exact 또는 partial key 매칭을 모두 지원하는 보더리스 매퍼
  const matchedGenealogyKey = Object.keys(MOCK_GENEALOGY_MAP).find(k => {
    const cleanKey = k.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "");
    return cleanSentText.includes(cleanKey) || cleanKey.includes(cleanSentText);
  });
  
  const matchedGenealogy = matchedGenealogyKey ? MOCK_GENEALOGY_MAP[matchedGenealogyKey] : null;

  const processedChunks = chunks.map((chunkObj, idx) => {
    let tag = chunkObj.tag;
    let componentLabel = "수식어 (Modifier)";
    let componentDesc = chunkObj.meaning || "수식 성분";
    let iconChar = "🔗";
    let accentColor = "#495057";
    let capsuleBg = "#e9ecef";

    if (tag === 'S+V') {
      accentColor = "#005dac";
      componentLabel = "주어 + 동사 (Subject + Verb)";
      iconChar = "👤";
      capsuleBg = "#d0ebff";
    } else if (tag === 'O/C') {
      accentColor = "#2b8a3e";
      componentLabel = "목적어 / 보어 (Object / Complement)";
      iconChar = "💎";
      capsuleBg = "#ebfbee";
    } else if (tag === 'to-Inf') {
      accentColor = "#7950f2";
      componentLabel = "to 부정사구 (to-Infinitive)";
      iconChar = "💡";
      capsuleBg = "#f3f0ff";
    } else if (tag === 'CONJ') {
      accentColor = "#d6336c";
      componentLabel = "접속사 / 관계사 마디 (Conjunction)";
      iconChar = "🔗";
      capsuleBg = "#fff0f6";
    } else if (tag === 'PREP') {
      accentColor = "#fd7e14";
      componentLabel = "전치사구 수식어 (Prepositional)";
      iconChar = "📍";
      capsuleBg = "#fff4e6";
      if (componentDesc && !componentDesc.startsWith('(')) {
        componentDesc = `(${componentDesc})`;
      }
    } else {
      accentColor = "#495057";
      componentLabel = "수식어 (Modifier)";
      iconChar = "🔗";
      capsuleBg = "#e9ecef";
      if (componentDesc && !componentDesc.startsWith('(')) {
        componentDesc = `(${componentDesc})`;
      }
    }

    return {
      text: chunkObj.text,
      tag: chunkObj.tag,
      componentLabel,
      componentDesc,
      iconChar,
      accentColor,
      capsuleBg
    };
  });

  const themeStyles = getThemeAdjustedStyles(theme);

  // 단어 클릭 핸들러
  const handleWordClick = async (rawWord) => {
    const cleanWord = rawWord.replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim();
    if (!cleanWord) return;
    
    setSelectedWord(cleanWord);
    setMeaning('뜻을 불러오는 중...');
    setSynonyms('로딩 중...');
    setAntonyms('로딩 중...');
    setSimilarIdioms('');
    
    const entry = await fetchLiveWordDefinition(cleanWord);
    if (entry) {
      setMeaning(entry.meaning);
      setSynonyms(entry.synonyms || '동의어 데이터 없음');
      setAntonyms(entry.antonyms || '반의어 데이터 없음');
      setSimilarIdioms(entry.similarIdioms || '');
    } else {
      const parsedMeaning = parseDynamicWordMeaning(cleanWord);
      setMeaning(parsedMeaning);
      setSynonyms('유추된 단어 (동의어 없음)');
      setAntonyms('유추된 단어 (반의어 없음)');
      setSimilarIdioms('');
    }
  };

  // 나만의 단어장에 저장
  const handleSaveToVocab = () => {
    if (!selectedWord) return;
    addToVocab(selectedWord, meaning, `[청크 학습 중 저장됨] ${currentSentence}`);
    setSelectedWord(null);
  };

  // 개별 카드의 구문 분석 정답 노출 토글
  const toggleCardReveal = (idx) => {
    if (revealedCards.includes(idx)) {
      setRevealedCards(prev => prev.filter(i => i !== idx));
    } else {
      setRevealedCards(prev => [...prev, idx]);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '28px',
      overflowY: 'auto',
      height: '100%',
      position: 'relative',
      paddingBottom: '48px'
    }}>
      
      {/* [Stitch 복제 핵심 1] 크림 옐로우 네오브루탈리즘 청크 보더 상자 */}
      <section style={{
        backgroundColor: '#fbf9e6',
        border: '3px solid #000000',
        borderRadius: '24px',
        padding: '32px 32px 84px 32px', // 오디오 버튼 수납을 위해 하단 패딩 확장
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxShadow: '4px 4px 0px 0px #000000'
      }}>
        {/* 알약 캡슐형 청크들이 100% Stitch 룩앤필로 렌더링 (이미지처럼 수직 나열) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '20px',
          fontSize: `${Math.max(fontSize * 0.9, 28)}px`,
          fontWeight: '900',
          lineHeight: '1.8',
          color: '#000000',
          width: '100%'
        }}>
          {processedChunks.map((chunk, cIdx) => {
            return (
              <span key={cIdx} style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  backgroundColor: chunk.capsuleBg,
                  color: chunk.accentColor,
                  border: '3px solid #000000',
                  borderRadius: '30px',
                  padding: '10px 26px',
                  display: 'inline-flex',
                  flexWrap: 'wrap',
                  gap: '4px',
                  boxShadow: '3px 3px 0px 0px #000000',
                  transition: 'transform 0.15s',
                  userSelect: 'text',
                  fontFamily: "'Outfit', 'Inter', sans-serif"
                }}>
                  {chunk.text.split(/\s+/).map((w, wIdx) => {
                    const cleanWord = w.replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim();
                    if (!cleanWord) return null;
                    return (
                      <span
                        key={wIdx}
                        onClick={() => handleWordClick(w)}
                        style={{
                          cursor: 'pointer',
                          borderRadius: '8px',
                          padding: '2px 6px',
                          transition: 'background-color 0.15s',
                          display: 'inline-block'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        {w}
                      </span>
                    );
                  })}
                </span>
                
                {/* 캡슐들 바로 옆에 굵은 검은색 구분 슬래시 기호 배치 */}
                {cIdx < processedChunks.length - 1 && (
                  <span style={{ 
                    color: '#000000', 
                    fontSize: `${Math.max(fontSize * 0.9, 28)}px`, 
                    fontWeight: '900', 
                    marginLeft: '16px',
                    marginRight: '16px',
                    userSelect: 'none'
                  }}>
                    /
                  </span>
                )}
              </span>
            );
          })}
        </div>

        {/* 거대 플로팅 낭독 원형 스피커 버튼 (Stitch 블루 동그라미 - 보더 박스 내부 수납) */}
        <div style={{ 
          position: 'absolute', 
          bottom: '20px', 
          right: '24px',
          zIndex: 10 
        }}>
          <button
            onClick={() => speakText(currentSentence)}
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: '#005dac',
              color: '#ffffff',
              border: '3.5px solid #000000',
              boxShadow: '3px 3px 0px 0px #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.1s, box-shadow 0.1s'
            }}
            onMouseDown={(e) => { 
              e.currentTarget.style.transform = 'translate(1.5px, 1.5px)'; 
              e.currentTarget.style.boxShadow = '1.5px 1.5px 0px 0px #000000';
            }}
            onMouseUp={(e) => { 
              e.currentTarget.style.transform = 'translate(0px, 0px)'; 
              e.currentTarget.style.boxShadow = '3px 3px 0px 0px #000000';
            }}
            title="문장 전체 낭독하기"
          >
            <span style={{ fontSize: '28px', fontWeight: 'bold' }}>🔊</span>
          </button>
        </div>
      </section>

      {/* [Stitch 복제 핵심 2] 입체적 Neobrutalism SENTENCE CLASSIFICATION 분석 타이틀 */}
      <h2 style={{
        fontSize: '22px',
        fontWeight: '950',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: '#000000',
        textAlign: 'left',
        paddingLeft: '4px',
        margin: '24px 0 8px 0',
        fontFamily: "'Outfit', 'Inter', sans-serif"
      }}>
        SENTENCE CLASSIFICATION
      </h2>

      {/* 옥스포드 20형식 및 국어 문장구조 분류 3D 카드 패널 */}
      <section style={{
        backgroundColor: '#fffbeb',
        border: '3px solid #000000',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '4px 4px 0px 0px #000000',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        textAlign: 'left'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px', fontWeight: '950', color: '#005dac' }}>
            🔍 문장 구조 분석 및 분류 (Sentence Classification)
          </span>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
          {/* 1) 문장 종류 배지 */}
          <div style={{
            backgroundColor: '#d0ebff',
            color: '#005dac',
            border: '2px solid #000000',
            borderRadius: '20px',
            padding: '6px 18px',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '2px 2px 0px 0px #000000'
          }}>
            문장유형: {rawSentenceObj?.classification?.sentenceType || "홑문장"}
          </div>

          {/* 2) 5형식 배지 */}
          <div style={{
            backgroundColor: '#ebfbee',
            color: '#2b8a3e',
            border: '2px solid #000000',
            borderRadius: '20px',
            padding: '6px 18px',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '2px 2px 0px 0px #000000'
          }}>
            구조형식: {rawSentenceObj?.classification?.fiveStructure || "3형식"}
          </div>

          {/* 3) 옥스포드 20형식 배지 */}
          <div style={{
            backgroundColor: '#fff0f6',
            color: '#d6336c',
            border: '2px solid #000000',
            borderRadius: '20px',
            padding: '6px 18px',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '2px 2px 0px 0px #000000'
          }}>
            옥스포드: {rawSentenceObj?.classification?.oxfordPattern || "Pattern 9 (S+V+-ing)"}
          </div>
        </div>
      </section>

      {/* [Stitch 복제 핵심 2] 입체적 Neobrutalism 영어문장블럭 분석 타이틀 */}
      <h2 style={{
        fontSize: '22px',
        fontWeight: '950',
        letterSpacing: '0.04em',
        color: '#000000',
        textAlign: 'left',
        paddingLeft: '4px',
        margin: '24px 0 8px 0',
        fontFamily: "'Outfit', 'Pretendard', 'Inter', sans-serif"
      }}>
        영어문장블럭
      </h2>

      {/* 3D 네오브루탈리즘 분석 카드 리스트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {processedChunks.map((chunk, idx) => {
          return (
            <div 
              key={idx}
              style={{
                backgroundColor: '#ffffff',
                border: '3.5px solid #000000',
                borderRadius: '24px',
                padding: '24px',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '4px 4px 0px 0px #000000',
                textAlign: 'left',
                transition: 'transform 0.15s, box-shadow 0.15s',
                fontFamily: "'Outfit', 'Pretendard', 'Inter', sans-serif"
              }}
            >
              {/* E & 해석 매핑 레이아웃 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                {/* 1) English Chunk (E) */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ 
                    backgroundColor: '#005dac', 
                    color: '#ffffff', 
                    fontSize: '14px', 
                    fontWeight: '900', 
                    padding: '3px 8px', 
                    borderRadius: '6px',
                    border: '2px solid #000000',
                    userSelect: 'none',
                    marginTop: '4px'
                  }}>E</span>
                  <span style={{ 
                    fontSize: '28px', 
                    fontWeight: '900', 
                    color: chunk.accentColor,
                    wordBreak: 'break-word',
                    flex: 1
                  }}>
                    {chunk.text}
                    {/* 동사구일 경우 동그라미(V) 표시를 3D 배지로 이식 */}
                    {chunk.tag === 'S+V' && (
                      <span style={{
                        backgroundColor: '#c62828',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '50%',
                        border: '1.5px solid #000000',
                        marginLeft: '8px',
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        boxShadow: '1px 1px 0px 0px #000000'
                      }}>V</span>
                    )}
                  </span>
                </div>

                {/* 2) Korean Word-by-Word 어순번역 (해석) */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ 
                    backgroundColor: '#e65100', 
                    color: '#ffffff', 
                    fontSize: '14px', 
                    fontWeight: '900', 
                    padding: '3px 8px', 
                    borderRadius: '6px',
                    border: '2px solid #000000',
                    userSelect: 'none',
                    marginTop: '4px'
                  }}>해석</span>
                  <span style={{ 
                    fontSize: '22px', 
                    fontWeight: '850', 
                    color: chunk.accentColor,
                    wordBreak: 'break-word',
                    flex: 1
                  }}>
                    {chunk.componentDesc}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* [Stitch 복제 핵심 3] 하단 네비게이션 3D 입체 버튼 세트 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px', 
        marginTop: '32px',
        width: '100%'
      }}>
        {/* 이전 문장 버튼 */}
        <button
          onClick={prevSentence}
          disabled={currentIndex === 0}
          style={{
            backgroundColor: '#dee2e6',
            color: '#000000',
            border: '3px solid #000000',
            borderRadius: '16px',
            minHeight: '64px',
            fontSize: '22px',
            fontWeight: 'bold',
            boxShadow: currentIndex === 0 ? 'none' : '3px 3px 0px 0px #000000',
            opacity: currentIndex === 0 ? 0.35 : 1,
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            transition: 'transform 0.1s, box-shadow 0.1s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseDown={(e) => {
            if (currentIndex > 0) {
              e.currentTarget.style.transform = 'translate(1.5px, 1.5px)';
              e.currentTarget.style.boxShadow = '1.5px 1.5px 0px 0px #000000';
            }
          }}
          onMouseUp={(e) => {
            if (currentIndex > 0) {
              e.currentTarget.style.transform = 'translate(0px, 0px)';
              e.currentTarget.style.boxShadow = '3px 3px 0px 0px #000000';
            }
          }}
        >
          <span>◀ Previous</span>
        </button>

        {/* 다음 문장 버튼 */}
        <button
          onClick={nextSentence}
          disabled={currentIndex === passages.length - 1}
          style={{
            backgroundColor: '#005dac',
            color: '#ffffff',
            border: '3px solid #000000',
            borderRadius: '16px',
            minHeight: '64px',
            fontSize: '22px',
            fontWeight: 'bold',
            boxShadow: currentIndex === passages.length - 1 ? 'none' : '3px 3px 0px 0px #000000',
            opacity: currentIndex === passages.length - 1 ? 0.35 : 1,
            cursor: currentIndex === passages.length - 1 ? 'not-allowed' : 'pointer',
            transition: 'transform 0.1s, box-shadow 0.1s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseDown={(e) => {
            if (currentIndex < passages.length - 1) {
              e.currentTarget.style.transform = 'translate(1.5px, 1.5px)';
              e.currentTarget.style.boxShadow = '1.5px 1.5px 0px 0px #000000';
            }
          }}
          onMouseUp={(e) => {
            if (currentIndex < passages.length - 1) {
              e.currentTarget.style.transform = 'translate(0px, 0px)';
              e.currentTarget.style.boxShadow = '3px 3px 0px 0px #000000';
            }
          }}
        >
          <span>Next Step ▶</span>
        </button>
      </div>

      {/* 📒 단어/숙어 세부 사전 팝업 모달 (Stitch 명도 및 동의어/반의어 탑재) */}
      {selectedWord && (() => {
        const isSaved = myVocab.some(item => item.word.toLowerCase() === selectedWord.toLowerCase());
        return (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 99999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(4px)',
            padding: '24px'
          }}>
            <div style={{
              backgroundColor: 'var(--color-bg)',
              border: '5px solid var(--color-primary)',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
              width: '100%',
              maxWidth: '550px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              textAlign: 'center',
              animation: 'fadeIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              <div>
                <span style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: 'var(--color-text)', 
                  opacity: 0.6,
                  border: '2px solid var(--color-border)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  backgroundColor: 'var(--color-secondary)',
                  display: 'inline-block'
                }}>
                  📒 단어 스피드 학습 사전
                </span>
                <h3 style={{ fontSize: '40px', fontWeight: '900', color: 'var(--color-primary)', marginTop: '20px', wordBreak: 'break-all', marginBottom: '8px' }}>
                  {selectedWord}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                  {/* 1. 의미 */}
                  <div style={{ 
                    fontSize: '26px', 
                    fontWeight: 'bold', 
                    padding: '16px',
                    backgroundColor: 'var(--color-secondary)',
                    borderRadius: '12px',
                    border: '2px solid var(--color-border)',
                    lineHeight: '1.4'
                  }}>
                    뜻: {meaning}
                  </div>

                  {/* 저장 상태 고대비 배지 */}
                  {isSaved ? (
                    <div style={{
                      backgroundColor: '#ebfbee',
                      color: '#2b8a3e',
                      border: '3px solid #000000',
                      borderRadius: '12px',
                      padding: '12px',
                      fontSize: '20px',
                      fontWeight: '900',
                      boxShadow: '3px 3px 0px 0px #000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontFamily: "'Outfit', 'Inter', sans-serif"
                    }}>
                      <span>✓</span>
                      <span>나의 단어장에 저장되어 있습니다.</span>
                    </div>
                  ) : (
                    <div style={{
                      backgroundColor: '#f1f3f5',
                      color: '#495057',
                      border: '3px solid #000000',
                      borderRadius: '12px',
                      padding: '12px',
                      fontSize: '20px',
                      fontWeight: '900',
                      boxShadow: '3px 3px 0px 0px #000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontFamily: "'Outfit', 'Inter', sans-serif"
                    }}>
                      <span>⚪</span>
                      <span>아직 단어장에 저장되지 않았습니다.</span>
                    </div>
                  )}

                  {/* 2. 동의어 & 반의어 (Stitch 연동형) */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, backgroundColor: 'rgba(46, 125, 50, 0.06)', border: '2px solid #2e7d32', borderRadius: '12px', padding: '10px' }}>
                      <span style={{ fontSize: '13px', color: '#2e7d32', fontWeight: '900' }}>동의어 (Synonym)</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold' }}>{synonyms}</p>
                    </div>
                    <div style={{ flex: 1, backgroundColor: 'rgba(230, 81, 0, 0.06)', border: '2px solid #e65100', borderRadius: '12px', padding: '10px' }}>
                      <span style={{ fontSize: '13px', color: '#e65100', fontWeight: '900' }}>반의어 (Antonym)</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold' }}>{antonyms}</p>
                    </div>
                  </div>

                  {/* 3. 유사 숙어 */}
                  {similarIdioms && (
                    <div style={{ backgroundColor: 'rgba(25, 118, 210, 0.06)', border: '2px solid #1976d2', borderRadius: '12px', padding: '12px', textAlign: 'left' }}>
                      <span style={{ fontSize: '13px', color: '#1976d2', fontWeight: '900' }}>유사 숙어 / 예구</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 'bold' }}>{similarIdioms}</p>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <BigButton
                  variant={isSaved ? "danger" : "success"}
                  onClick={() => {
                    if (isSaved) {
                      removeFromVocab(selectedWord);
                    } else {
                      addToVocab(selectedWord, meaning, `[청크 학습 중 저장됨] ${currentSentence}`);
                    }
                  }}
                  style={{ flex: 1, minHeight: '64px', fontSize: '20px' }}
                >
                  {isSaved ? "❌ 단어장 제거" : "⭐ 단어장 저장"}
                </BigButton>
                <BigButton
                  variant="secondary"
                  onClick={() => setSelectedWord(null)}
                  style={{ flex: 1, minHeight: '64px', fontSize: '20px' }}
                >
                  닫기
                </BigButton>
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// 오염된 텍스트에서 꼬리표 기호들을 깔끔하게 제거해 주는 정밀 필터링 헬퍼
const cleanTranslationText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\s*\.\.\.\s*\[[^\]]+\]/g, '') 
    .replace(/\s*\[[^\]]+\]/g, '')         
    .replace(/\s*\([^)]+\)/g, '')          
    .replace(/\s*\.\.\./g, '')             
    .replace(/\s+/g, ' ')                  
    .trim();
};
