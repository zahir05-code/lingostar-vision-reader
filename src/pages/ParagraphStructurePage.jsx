import { useState, useMemo } from 'react';
import { BigButton } from '../components/BigButton';
import { useApp } from '../context/AppContext';
import { extractHighLevelVocab } from '../utils/textParser';
import WordsTraining from '../components/feature/structure/WordsTraining';
import PassageInsight from '../components/feature/structure/PassageInsight';
import SentenceStructure from '../components/feature/structure/SentenceStructure';

// 2025년 6월 고1 34번 영어 모의고사 지문 해설 이미지 1~5 100% 싱크 해설 데이터
const STITCH_PARAGRAPH_DATA = {
  title: "2025년 6월 고1 34번 영어모의고사 지문 해설",
  slogan: "“과학은 혼자 하지 않는다: 지식은 공유될 때 발전한다”",
  intro: "이번 문제는 지문 속 빈칸에 어떤 문장이 들어가야 가장 자연스러운지 판단하는 유형이에요.\n핵심은 과학적 발견이 개인 소유가 아니라 공유될 때 가치가 커진다는 점을 중심으로 설명합니다.",
  sentences: [
    {
      eng: [
        { text: "When", highlight: "red", bold: true },
        { text: " scientists make an important new discovery / or " },
        { text: "experimentally", highlight: "underline", bold: true },
        { text: " prove some hypothesis,/ they do not, " },
        { text: "in general", highlight: "blue-underline", bold: true },
        { text: ", keep that information to themselves /*" },
        { text: "so that", highlight: "red-underline", bold: true },
        { text: " they alone can consider its meaning / " },
        { text: "and", highlight: "underline", bold: true },
        { text: " derive additional theories from it." }
      ],
      kor: [
        { text: "과학자들은 중요한 새로운 발견을 하거나 /" },
        { text: "실험적으로", highlight: "underline", bold: true },
        { text: " 어떤 가설을 증명할 때, / 그들은 " },
        { text: "일반적으로", highlight: "blue-underline", bold: true },
        { text: ", 그 정보를 자신만 알고 있지는 않는다 / 오직 그들만 그 의미를 생각할 수 있도록 " },
        { text: "하기 위해서", highlight: "red-underline", bold: true },
        { text: " / 그리고 그 정보에서 추가 이론을 이끌어내기 " },
        { text: "위해서.", highlight: "red-underline", bold: true }
      ]
    },
    {
      eng: [
        { text: "Instead", highlight: "red", bold: true },
        { text: ",/ they " },
        { text: "publish", highlight: "underline", bold: true },
        { text: " their results /" },
        { text: "and make", highlight: "underline", bold: true },
        { text: " their data available for inspection." }
      ],
      kor: [
        { text: "대신에", highlight: "red", bold: true },
        { text: ", 그들은 그 결과를 발표하고 / 그 데이터를 검토할 수 있도록 공개한다" }
      ]
    },
    {
      eng: [
        { text: "This makes it possible /" },
        { text: "for other scientists", highlight: "red", bold: true },
        { text: " to " },
        { text: "reconsider", highlight: "underline", bold: true },
        { text: " their data/ " },
        { text: "and possibly refute", highlight: "red-underline", bold: true },
        { text: " their conclusions." }
      ],
      kor: [
        { text: "이것은 가능하게 만든다 / " },
        { text: "다른 과학자들이", highlight: "red", bold: true },
        { text: " 그 데이터를 다시 검토하고/ " },
        { text: "어쩌면 그들의 결론을 반박할 수도 있도록", highlight: "red-underline", bold: true }
      ]
    },
    {
      eng: [
        { text: "More important, " },
        { text: "though", highlight: "blue-underline", bold: true },
        { text: ",/ it makes " },
        { text: "it possible for", highlight: "underline", bold: true },
        { text: " other scientists to use " },
        { text: "that data", highlight: "red", bold: true },
        { text: " / to construct new hypotheses/ " },
        { text: "and", highlight: "red", bold: true },
        { text: " perform new experiments." }
      ],
      kor: [
        { text: "하지만, 더 중요한 것은", highlight: "blue-underline", bold: true },
        { text: " / 이것이 가능하게 한다는 점이다 / 다른 과학자들이 그 데이터를 이용해 / 새로운 가설을 만들고 / 새로운 실험을 하도록" }
      ]
    },
    {
      eng: [
        { text: "The assumption is /" },
        { text: "that", highlight: "red", bold: true },
        { text: " society " },
        { text: "as a whole", highlight: "underline", bold: true },
        { text: " / " },
        { text: "will end up knowing", highlight: "underline", bold: true },
        { text: " more /" },
        { text: "if", highlight: "red", bold: true },
        { text: " information is spread " },
        { text: "as widely as possible", highlight: "blue", bold: true },
        { text: ",/ rather than being limited to a few people." }
      ],
      kor: [
        { text: "가정은 이렇다 / 사회 전체가/ " },
        { text: "결국 더 많은 것을 알게 될 것이라는 것", highlight: "red", bold: true },
        { text: "/ 정보가 " },
        { text: "가능한 한 널리 퍼질 경우", highlight: "blue", bold: true },
        { text: " / 소수에게만 제한되는 것이 아니라" }
      ],
      footnote: "* The assumption is that ~ → \"그 가정은 ~라는 것이다.\""
    },
    {
      eng: [
        { text: "In a strict sense", highlight: "blue", bold: true },
        { text: ", / every scientist " },
        { text: "depends on the work of other scientists", highlight: "red", bold: true },
        { text: " ." }
      ],
      kor: [
        { text: "엄밀한 의미에서", highlight: "blue", bold: true },
        { text: ", /모든 과학자는 " },
        { text: "다른 과학자들의 연구에 의존한다", highlight: "red", bold: true }
      ]
    }
  ],
  tips: [
    { step: 1, title: "빈칸 앞뒤 흐름 읽기", desc: "문맥의 연결성, 주제의 지속성을 확인!" },
    { step: 2, title: "핵심 키워드 반복 or 연결어 단서 찾기", desc: '"depends on" ➔ "no idea stands alone"으로 연결 자연스럽다!' },
    { step: 3, title: "문장 전체 분위기 고려", desc: "과학은 공동 작업 ➔ 혼자 시작되는 아이디어는 없다 ➔ 내용 흐름 일관!" }
  ],
  grammar: [
    { rule: "derive A from B", desc: "B로부터 A를 도출하다" },
    { rule: "make it possible for A to B", desc: "A가 B하도록 가능하게 하다" },
    { rule: "refute", desc: "반박하다" },
    { rule: "perform experiments", desc: "실험을 수행하다" },
    { rule: "assumption", desc: "가정" },
    { rule: "depend on", desc: "의존하다, ~에 달려있다 (💡 유사의미 동의 숙어 족보: rely on, count on, turn to, look to, fall back on)" }
  ],
  answer: {
    num: "⑤",
    text: "depends on the work of other scientists",
    translation: "다른 과학자들의 연구에 의존한다"
  }
};

// 문장을 의미 단위로 끊어주는 헬퍼 함수
const parseSlashSentence = (sentence) => {
  const clean = sentence.trim();
  if (!clean) return "";
  
  const words = clean.split(' ');
  const result = [];
  let currentChunk = [];
  
  const cutWords = [
    'although', 'when', 'if', 'because', 'after', 'before', 'since', 'while',
    'with', 'of', 'to', 'in', 'for', 'at', 'by', 'on', 'about', 'from', 'into', 'through',
    'that', 'which', 'who', 'whom', 'whose', 'where', 'why', 'how',
    'and', 'but', 'or', 'so', 'yet',
    'is', 'are', 'was', 'were', 'am',
    'does', 'do', 'did', 'has', 'have', 'had',
    'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must'
  ];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const lower = word.toLowerCase().replace(/[^a-z]/g, '');
    
    if (i > 0 && cutWords.includes(lower)) {
      if (currentChunk.length > 0) {
        result.push(currentChunk.join(' '));
      }
      currentChunk = [word];
    } else {
      currentChunk.push(word);
    }
  }
  if (currentChunk.length > 0) {
    result.push(currentChunk.join(' '));
  }
  
  return result.join(' / ');
};

// 🎨 고대비 테마 색상 스키마 매퍼
const getThemeAdjustedStyles = (themeName) => {
  if (themeName === 'dark') {
    return {
      accent: '#5c93e6',
      badgeBg: '#ab47bc',
      introBg: 'rgba(92, 147, 230, 0.12)',
      bodyBg: 'rgba(255, 224, 130, 0.12)',
      conclusionBg: 'rgba(239, 83, 80, 0.12)',
      cardBg: '#2a2a2a',
      gold: '#ffd54f'
    };
  }
  if (themeName === 'yellow') {
    return {
      accent: '#5d4037',
      badgeBg: '#5d4037',
      introBg: 'rgba(93, 64, 55, 0.08)',
      bodyBg: 'rgba(46, 125, 50, 0.08)',
      conclusionBg: 'rgba(198, 40, 40, 0.08)',
      cardBg: '#fffde7',
      gold: '#fbc02d'
    };
  }
  if (themeName === 'high-contrast') {
    return {
      accent: 'var(--color-text)',
      badgeBg: 'var(--color-text)',
      introBg: 'transparent',
      bodyBg: 'transparent',
      conclusionBg: 'transparent',
      cardBg: 'transparent',
      gold: 'var(--color-text)'
    };
  }
  return {
    accent: '#1976d2',
    badgeBg: 'purple',
    introBg: 'rgba(33, 150, 243, 0.06)',
    bodyBg: 'rgba(251, 192, 45, 0.06)',
    conclusionBg: 'rgba(230, 81, 0, 0.06)',
    cardBg: '#ffffff',
    gold: '#fbc02d'
  };
};

export default function ParagraphStructurePage() {
  const { 
    activePassage, 
    fontSize, 
    speakText, 
    addToVocab, 
    removeFromVocab,
    dictMock, 
    parseDynamicWordMeaning, 
    fetchLiveWordDefinition,
    theme,
    currentReadingStep,
    setCurrentReadingStep,
    readingCounts,
    setReadingCounts,
    myVocab = []
  } = useApp();

  const themeStyles = getThemeAdjustedStyles(theme);

  // --- 상태 변수 ---
  const [isStitchView, setIsStitchView] = useState(true);
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordMeaning, setWordMeaning] = useState('');
  const [wordSynonyms, setWordSynonyms] = useState('');
  const [wordAntonyms, setWordAntonyms] = useState('');
  const [wordSimilarIdioms, setWordSimilarIdioms] = useState('');
  
  const [flippedCards, setFlippedCards] = useState({});
  const [selectedSection, setSelectedSection] = useState('intro'); // 'intro', 'body', 'conclusion'
  
  // 7단계용 문장별 분류 저장소 (홑/겹문장 체크 상태)
  const [sentenceClassifications, setSentenceClassifications] = useState({});
  
  // 8단계용 영작 퀴즈 상태 { sentenceIndex: [선택한 단어 리스트] }
  const [quizAnswers, setQuizAnswers] = useState({});

  // 8단계 청크 순서 배열 퀴즈용 셔플 상태 변수
  const [shuffledChunksMap, setShuffledChunksMap] = useState({});



  const sentences = activePassage ? (activePassage.sentences || []) : [];

  // 동적으로 고1 이상 핵심 어휘 표출용 단어 목록 (the, a, in, be/have동사, 조동사 등 차단)
  const highLevelVocab = useMemo(() => {
    if (activePassage && activePassage.fullText) {
      return extractHighLevelVocab(activePassage.fullText, dictMock);
    }
    return [];
  }, [activePassage, dictMock]);

  // 지문 내의 고유 주요 어휘 리스트 동적 선별 (1 & 3단계용)
  const vocabCards = useMemo(() => {
    if (activePassage) {
      let baseVocab = [];
      // 🌟 만약 Gemini AI가 추출해 둔 어휘 목록이 지문 데이터 내에 있다면 최우선 활용! (B안 동적 사전)
      if (activePassage.vocab && activePassage.vocab.length > 0) {
        baseVocab = [...activePassage.vocab];
      } else if (activePassage.fullText) {
        // 오프라인 Fallback: easy stopwords가 완벽히 차단된 정교한 어휘 추출기 호출
        baseVocab = extractHighLevelVocab(activePassage.fullText, dictMock);
      }

      // 🌟 지문당 자동축출어휘 최소 15개 이상 무조건 보장 가드 🌟
      // 만약 AI 추출본이나 기존 리스트가 15개 미만이면, extractHighLevelVocab에서 추가로 메꿔서 15개 이상으로 정밀 보장합니다.
      if (baseVocab.length < 15 && activePassage.fullText) {
        const fallbackVocab = extractHighLevelVocab(activePassage.fullText, dictMock);
        const existingWords = new Set(baseVocab.map(v => v.word.toLowerCase().trim()));
        for (const item of fallbackVocab) {
          const cleanItemWord = item.word.toLowerCase().trim();
          if (!existingWords.has(cleanItemWord)) {
            baseVocab.push(item);
            existingWords.add(cleanItemWord);
            if (baseVocab.length >= 15) break;
          }
        }
      }
      return baseVocab;
    }
    return [];
  }, [activePassage, dictMock]);

  const isWordSaved = selectedWord ? myVocab.some(item => item.word.toLowerCase() === selectedWord.toLowerCase()) : false;

  if (!sentences || sentences.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p style={{ fontSize: `${fontSize}px`, fontWeight: 'bold' }}>지문 데이터가 존재하지 않습니다.</p>
      </div>
    );
  }

  // --- 삼중 구조 문장 분할 ---
  const total = sentences.length;
  const introEnd = Math.max(1, Math.floor(total * 0.25));
  const bodyEnd = Math.max(introEnd + 1, Math.floor(total * 0.8));

  const introSentences = sentences.slice(0, introEnd);
  const bodySentences = sentences.slice(introEnd, bodyEnd);
  const conclusionSentences = sentences.slice(bodyEnd);

  // --- 단어 터치 사전 핸들러 ---
  const handleWordClick = async (rawWord) => {
    const cleanWord = rawWord.replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '').trim();
    if (!cleanWord) return;
    
    setSelectedWord(cleanWord);
    setWordMeaning('뜻을 불러오는 중...');
    setWordSynonyms('로딩 중...');
    setWordAntonyms('로딩 중...');
    setWordSimilarIdioms('');
    
    const entry = await fetchLiveWordDefinition(cleanWord);
    if (entry) {
      setWordMeaning(entry.meaning);
      setWordSynonyms(entry.synonyms || '동의어 데이터 없음');
      setWordAntonyms(entry.antonyms || '반의어 데이터 없음');
      setWordSimilarIdioms(entry.similarIdioms || '');
    } else {
      const parsedMeaning = parseDynamicWordMeaning(cleanWord);
      setWordMeaning(parsedMeaning);
      setWordSynonyms('유추된 단어 (동의어 없음)');
      setWordAntonyms('유추된 단어 (반의어 없음)');
      setWordSimilarIdioms('');
    }
  };

  const handleSaveToVocab = () => {
    if (!selectedWord) return;
    addToVocab(selectedWord, wordMeaning, '본문 독해 중 직접 터치하여 저장됨');
    setSelectedWord(null);
  };

  const renderClickableWords = (text) => {
    if (!text) return null;
    return text.split(/\s+/).map((w, i) => (
      <span
        key={i}
        onClick={() => handleWordClick(w)}
        style={{
          cursor: 'pointer',
          borderRadius: '6px',
          padding: '2px 6px',
          transition: 'background 0.15s',
          display: 'inline',
          borderBottom: 'none'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-secondary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        title="터치하여 어휘 분석 확인"
      >
        {w}{' '}
      </span>
    ));
  };

  // --- 6단계 8회독 카운터 핸들러 ---
  const handleReadIncrement = (index) => {
    const currentCount = readingCounts[index] || 0;
    if (currentCount < 8) {
      const updated = {
        ...readingCounts,
        [index]: currentCount + 1
      };
      setReadingCounts(updated);
      if (currentCount + 1 === 8) {
        speakText("Congratulations! Eight times read successfully.");
      }
    }
  };

  // --- 7단계 형식/구조 판별 핸들러 ---
  const handleClassificationChange = (index, field, value) => {
    setSentenceClassifications(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value
      }
    }));
  };

  // --- 8단계 영작 단어 클릭 핸들러 ---
  const handleQuizWordClick = (sentIdx, word, originalWords) => {
    const currentAnswers = quizAnswers[sentIdx] || [];
    if (currentAnswers.includes(word)) {
      setQuizAnswers(prev => ({
        ...prev,
        [sentIdx]: currentAnswers.filter(w => w !== word)
      }));
    } else {
      const nextAnswers = [...currentAnswers, word];
      setQuizAnswers(prev => ({
        ...prev,
        [sentIdx]: nextAnswers
      }));

      // 완결 여부 체크 및 오디오 피드백
      if (nextAnswers.length === originalWords.length) {
        const buildStr = nextAnswers.map(w => w.replace(/[.,]/g, '').toLowerCase()).join(' ');
        const targetStr = originalWords.map(w => w.replace(/[.,]/g, '').toLowerCase()).join(' ');
        if (buildStr === targetStr) {
          speakText("Excellent! Perfect English structure.");
        }
      }
    }
  };

  const resetQuiz = (sentIdx) => {
    setQuizAnswers(prev => ({
      ...prev,
      [sentIdx]: []
    }));
  };

  // --- 8단계 청크 획득기 (호이스팅 보장 기명 함수) ---
  function getSentenceChunks(sObj, sentIdx) {
    const is34MockExam = activePassage && (
      activePassage.title?.includes("34") || 
      activePassage.fullText?.toLowerCase().includes("experimentally prove some hypothesis")
    );

    const mockExamChunks = [
      [
        "When scientists make an important new discovery or experimentally prove some hypothesis,",
        "they do not, in general, keep that information to themselves",
        "so that they alone can consider its meaning and derive additional theories from it."
      ],
      [
        "Instead,",
        "they publish their results",
        "and make their data available for inspection."
      ],
      [
        "This makes it possible",
        "for other scientists",
        "to reconsider their data and possibly refute their conclusions."
      ],
      [
        "More important, though,",
        "it makes it possible for other scientists to use that data",
        "to construct new hypotheses and perform new experiments."
      ],
      [
        "The assumption is that society as a whole",
        "will end up knowing more",
        "if information is spread as widely as possible, rather than being limited to a few people."
      ],
      [
        "In a strict sense,",
        "every scientist",
        "depends on the work of other scientists."
      ]
    ];

    if (is34MockExam && mockExamChunks[sentIdx]) {
      return mockExamChunks[sentIdx];
    }

    if (sObj && sObj.chunks && sObj.chunks.length > 0) {
      return sObj.chunks.map(c => c.text);
    }
    
    const txt = typeof sObj === 'string' ? sObj : (sObj?.text || sObj?.english || '');
    const parts = txt.split(' / ').filter(Boolean);
    if (parts.length > 1) return parts;

    const words = txt.split(/\s+/).filter(Boolean);
    const mid1 = Math.floor(words.length / 3);
    const mid2 = Math.floor(words.length * 2 / 3);
    if (words.length >= 3) {
      return [
        words.slice(0, mid1).join(' '),
        words.slice(mid1, mid2).join(' '),
        words.slice(mid2).join(' ')
      ];
    }
    return [txt];
  }

  // --- 8단계 청크 셔플 상태 일괄 초기화 (렌더링 부작용 원천 해결) ---
  useEffect(() => {
    if (!activePassage || !activePassage.sentences) return;
    
    const initialMap = {};
    activePassage.sentences.forEach((sObj, sentIdx) => {
      const original = getSentenceChunks(sObj, sentIdx);
      const shuffled = [...original].sort(() => Math.random() - 0.5);
      if (shuffled.join(' ') === original.join(' ') && original.length > 1) {
        shuffled.sort(() => Math.random() - 0.5);
      }
      initialMap[sentIdx] = shuffled;
    });
    setShuffledChunksMap(initialMap);
  }, [activePassage]);

  // --- 8단계 청크 셔플 상태 관리 (렌더링 도중 setState 제거하여 무한 루프 완치) ---
  const getShuffledChunksForSentence = (sObj, sentIdx) => {
    const key = sentIdx;
    if (shuffledChunksMap[key]) {
      return shuffledChunksMap[key];
    }
    
    // 맵에 초기화가 지연되거나 누락되었을 때를 대비한 안전 폴백 (상태 변이를 시도하지 않음!)
    const original = getSentenceChunks(sObj, sentIdx);
    const shuffled = [...original].sort(() => Math.random() - 0.5);
    if (shuffled.join(' ') === original.join(' ') && original.length > 1) {
      shuffled.sort(() => Math.random() - 0.5);
    }
    return shuffled;
  };

  // --- 8단계 청크 클릭 핸들러 ---
  const handleQuizChunkClick = (sentIdx, chunk, correctChunks) => {
    const currentAnswers = quizAnswers[sentIdx] || [];
    const safeChunk = chunk || "";
    
    if (currentAnswers.includes(safeChunk)) {
      setQuizAnswers(prev => ({
        ...prev,
        [sentIdx]: currentAnswers.filter(c => c !== safeChunk)
      }));
    } else {
      const nextAnswers = [...currentAnswers, safeChunk];
      setQuizAnswers(prev => ({
        ...prev,
        [sentIdx]: nextAnswers
      }));

      // 🔊 [배리어 프리 보완] 청크 터치 시 즉시 원어민 오디오 발음 낭독으로 청각 힌트 제공!
      speakText(safeChunk.replace(/[^a-zA-Z\s]/g, ""));

      if (nextAnswers.length === correctChunks.length) {
        const buildStr = nextAnswers.map(c => (c || "").replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim().toLowerCase()).join(' ');
        const targetStr = correctChunks.map(c => (c || "").replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim().toLowerCase()).join(' ');
        if (buildStr === targetStr) {
          speakText("Excellent! Perfect sentence arrangement.");
        } else {
          speakText("Try again.");
        }
      }
    }
  };

  // --- 8단계 수동 셔플 ---
  const handleShuffleChunks = (sObj, sentIdx) => {
    const original = getSentenceChunks(sObj, sentIdx);
    const shuffled = [...original].sort(() => Math.random() - 0.5);
    if (shuffled.join(' ') === original.join(' ') && original.length > 1) {
      shuffled.sort(() => Math.random() - 0.5);
    }
    setShuffledChunksMap(prev => ({
      ...prev,
      [sentIdx]: shuffled
    }));
    setQuizAnswers(prev => ({
      ...prev,
      [sentIdx]: []
    }));
  };

  // --- Stitch 원본 모의고사 해설지 100% 동일 뷰 렌더러 ---
  const renderStitchView = () => {
    // 2025년 6월 고1 34번 모의고사 지문인지 판별하여 맞춤 데이터 혹은 동적 데이터 추출
    const is34MockExam = activePassage && (
      activePassage.title?.includes("34") || 
      activePassage.fullText?.toLowerCase().includes("experimentally prove some hypothesis")
    );

    const docData = is34MockExam ? STITCH_PARAGRAPH_DATA : {
      title: activePassage?.title || "영어 모의고사 지문 해설",
      slogan: `“지문 구조를 꿰뚫어 독해력을 완성하다”`,
      intro: "이 지문의 문맥 연결성과 핵심적인 흐름을 이해하는 유형이에요.\n구조적 끊어읽기와 표현을 통해 지문을 마스터해 봅시다.",
      sentences: (activePassage?.sentences || []).map(s => {
        const txt = typeof s === 'string' ? s : (s.text || s.english || '');
        let chunks = s.chunks || [];
        
        // 🚨 런타임 빈화면 크래시 방어: chunks가 비어있거나 없을 때 동적 구문 청크 자동 생성!
        if (chunks.length === 0 && txt) {
          const fallbackMeaning = typeof s === 'object' && s.meaning 
            ? s.meaning 
            : (typeof s === 'object' && s.korean ? s.korean : "어순 번역 준비 완료");
          chunks = [{ text: txt, meaning: fallbackMeaning, tag: 'S+V' }];
        }

        // 3단계 신규 직역/의역/구조분석 바인딩
        const directTranslation = s.directTranslation || chunks.map(c => c.meaning || '').join(' / ');
        const naturalTranslation = s.naturalTranslation || s.meaning || chunks.map(c => c.meaning || '').join(' ').replace(/\s+/g, ' ');
        const structureAnalysis = s.structureAnalysis || '';

        return {
          engText: chunks.map(c => c.text).join(' / '),
          directTranslation,
          naturalTranslation,
          structureAnalysis,
          eng: chunks.map((c, cIdx) => ({
            text: (c.text || "") + (cIdx < chunks.length - 1 ? " / " : ""),
            highlight: c.tag === 'CONJ' ? 'red' : (c.tag === 'PREP' ? 'blue' : '')
          })),
          kor: chunks.map((c, cIdx) => ({
            text: (c.meaning || c.text || "") + (cIdx < chunks.length - 1 ? " / " : ""),
            highlight: c.tag === 'CONJ' ? 'red' : (c.tag === 'PREP' ? 'blue' : '')
          }))
        };
      }),
      tips: [
        { step: 1, title: "핵심 화두 제시 파악하기", desc: "문장이 던지는 첫 주제와 배경 설명을 파악하세요!" },
        { step: 2, title: "어휘와 구문 흐름 파악하기", desc: "주요 접속사와 부사 힌트를 바탕으로 인과/대조를 잇습니다." },
        { step: 3, title: "글의 요지 및 목적 도출하기", desc: "도입-본론-맺음말을 통해 전달하고자 하는 궁극적 메세지를 확립합니다." }
      ],
      grammar: highLevelVocab.slice(0, 5).map(v => ({
        rule: v.word,
        desc: v.meaning
      })),
      answer: {
        num: "핵심 어구",
        text: highLevelVocab[0]?.word || "N/A",
        translation: highLevelVocab[0]?.meaning || "N/A"
      }
    };

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        backgroundColor: theme === 'yellow' ? '#fffde7' : (theme === 'dark' ? '#1a1a1a' : '#faf9f6'),
        padding: '36px',
        borderRadius: '32px',
        border: '4px solid #5d4037',
        boxShadow: '8px 8px 0px 0px #5d4037',
        fontFamily: "'Outfit', 'Inter', sans-serif"
      }}>
        {/* 상단 헤더 링커 */}
        <div style={{ 
          fontSize: '20px', 
          fontWeight: '800', 
          color: theme === 'dark' ? '#8bc34a' : '#2e7d32', 
          textDecoration: 'none',
          cursor: 'pointer',
          marginBottom: '8px'
        }}>
          {docData.title}
        </div>

        {/* 🔬 거대 타이틀 및 아이콘 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '42px' }}>🔬</span>
          <h2 style={{ 
            fontSize: '38px', 
            fontWeight: '900', 
            margin: 0, 
            color: 'var(--color-primary)' 
          }}>
            {is34MockExam ? "2025년 고등 영어 모의고사" : "고등 영어 모의고사 구조 해설"}
          </h2>
        </div>

        {/* 큰따옴표 핵심 슬로건 */}
        <div style={{
          fontSize: '30px',
          fontWeight: '900',
          color: theme === 'dark' ? '#ffeb3b' : '#388e3c',
          borderLeft: '8px solid var(--color-primary)',
          paddingLeft: '20px',
          margin: '12px 0',
          lineHeight: '1.4'
        }}>
          {docData.slogan}
        </div>

        {/* ✨ 영어 지문 분석 구분 */}
        <div style={{
          fontSize: '24px',
          fontWeight: '800',
          color: theme === 'dark' ? '#ffb74d' : '#f57c00',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>✨</span>
          <span>{is34MockExam ? "영어 지문 분석: 문장 삽입 문제" : "영어 지문 정밀 구조 분석"}</span>
        </div>

        {/* 설명 카드 */}
        <div style={{
          backgroundColor: theme === 'dark' ? '#2c2c2c' : '#f8f9fa',
          border: '3.5px solid #5d4037',
          borderRadius: '20px',
          padding: '24px',
          fontSize: '20px',
          fontWeight: '700',
          lineHeight: '1.7',
          color: 'var(--color-text)',
          whiteSpace: 'pre-line',
          boxShadow: '4px 4px 0px 0px #5d4037'
        }}>
          {docData.intro}
        </div>

        {/* 1:1 직독직해 문장 리스트 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginTop: '20px' }}>
          {docData.sentences.map((sent, sIdx) => {
            const hasDetailedAnalysis = sent.structureAnalysis && sent.structureAnalysis.trim().length > 0;

            return (
              <div 
                key={sIdx} 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  padding: '36px',
                  backgroundColor: themeStyles.cardBg,
                  border: '3.5px solid #5d4037',
                  borderRadius: '28px',
                  boxShadow: '6px 6px 0px 0px #5d4037',
                  flexShrink: 0
                }}
              >
                {/* 1. 영어 문장 (슬래시 청크 구분) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ 
                      fontSize: `${fontSize}px`, 
                      fontWeight: '900', 
                      lineHeight: '1.7', 
                      color: 'var(--color-text)',
                      wordBreak: 'break-word',
                      flex: 1
                    }}>
                      {sent.engText}
                    </div>
                    <button
                      onClick={() => speakText(sent.engText.replace(/\s*\/\s*/g, ' '))}
                      style={{
                        padding: '10px 20px',
                        fontSize: '18px',
                        fontWeight: '900',
                        backgroundColor: 'var(--color-secondary)',
                        border: '3px solid #5d4037',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        boxShadow: '2px 2px 0px 0px #5d4037',
                        alignSelf: 'flex-start'
                      }}
                    >
                      🔊 듣기
                    </button>
                  </div>
                </div>

                <div style={{ borderTop: '3px dashed #5d4037', margin: '4px 0' }}></div>

                {/* 2. 직역: (어순 번역) */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <span className="neo-badge" style={{
                    alignSelf: 'flex-start',
                    fontSize: '15px',
                    fontWeight: '900',
                    backgroundColor: '#ffe9e3',
                    color: '#5d4037',
                    borderWidth: '2px',
                    boxShadow: 'none'
                  }}>
                    2. "직역" (어순 번역)
                  </span>
                  <p style={{
                    fontSize: `${fontSize * 0.85}px`,
                    fontWeight: '800',
                    lineHeight: '1.7',
                    color: theme === 'dark' ? '#bbb' : '#495057',
                    margin: 0,
                    wordBreak: 'break-word'
                  }}>
                    {sent.directTranslation}
                  </p>
                </div>

                {/* 3. 의역: (자연스러운 한국어 번역) */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <span className="neo-badge" style={{
                    alignSelf: 'flex-start',
                    fontSize: '15px',
                    fontWeight: '900',
                    backgroundColor: '#a3f69c',
                    color: '#005312',
                    borderWidth: '2px',
                    boxShadow: 'none'
                  }}>
                    3. "의역" (자연스러운 번역)
                  </span>
                  <p style={{
                    fontSize: `${fontSize * 0.85}px`,
                    fontWeight: '800',
                    lineHeight: '1.7',
                    color: theme === 'dark' ? '#bbb' : '#495057',
                    margin: 0,
                    wordBreak: 'break-word'
                  }}>
                    {sent.naturalTranslation}
                  </p>
                </div>

                {/* 4. 영어 문장 구조식 분석 (구조와 기능) */}
                {hasDetailedAnalysis && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    backgroundColor: theme === 'dark' ? '#2c2c2c' : '#f5f9ff',
                    border: '3px solid #5d4037',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '4px 4px 0px 0px #5d4037',
                    marginTop: '8px'
                  }}>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '900',
                      color: '#005dac',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      📘 3. 영어 문장 구조식 분석 (구조 및 기능)
                    </span>
                    <p style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      lineHeight: '1.8',
                      color: 'var(--color-text)',
                      margin: 0,
                      whiteSpace: 'pre-wrap'
                    }}>
                      {sent.structureAnalysis}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ✅ 문제 풀이 팁 요약 (문장 삽입 문제) */}
        <div style={{
          border: '4px solid #5d4037',
          borderRadius: '28px',
          padding: '32px',
          backgroundColor: theme === 'dark' ? '#252525' : '#f4fbf7',
          boxShadow: '6px 6px 0px 0px #5d4037',
          marginTop: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <span style={{ fontSize: '32px' }}>✅</span>
            <h3 style={{ 
              fontSize: '26px', 
              fontWeight: '900', 
              margin: 0, 
              color: '#2e7d32' 
            }}>
              문제 풀이 팁 요약 (문장 삽입 문제)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {docData.tips.map((tip, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  backgroundColor: 'var(--color-bg)',
                  border: '3.5px solid #5d4037',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '3px 3px 0px 0px #5d4037'
                }}
              >
                {/* 파란색 사각형 숫자 배지 */}
                <div style={{
                  backgroundColor: '#005dac',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: '900',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {tip.step}
                </div>

                <div style={{ fontSize: '20px', fontWeight: '800', lineHeight: '1.5' }}>
                  <span style={{ color: '#005dac', marginRight: '8px' }}>{tip.title}</span>
                  <span style={{ color: 'var(--color-text)' }}>➔ {tip.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 📘 문법 및 표현 포인트 */}
        <div style={{
          border: '4px solid #5d4037',
          borderRadius: '28px',
          padding: '32px',
          backgroundColor: theme === 'dark' ? '#252525' : '#f0f7ff',
          boxShadow: '6px 6px 0px 0px #5d4037',
          marginTop: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <span style={{ fontSize: '32px' }}>📘</span>
            <h3 style={{ 
              fontSize: '26px', 
              fontWeight: '900', 
              margin: 0, 
              color: '#005dac' 
            }}>
              문법 및 표현 포인트
            </h3>
          </div>

          <ul style={{ 
            fontSize: '22px', 
            fontWeight: '800', 
            lineHeight: '2', 
            margin: 0, 
            paddingLeft: '24px',
            color: 'var(--color-text)'
          }}>
            {docData.grammar.map((gram, idx) => (
              <li key={idx} style={{ marginBottom: '12px' }}>
                <span style={{ color: '#2e7d32', fontWeight: '900' }}>{gram.rule}</span>: {gram.desc}
              </li>
            ))}
          </ul>
        </div>

        {/* 정답 확인 카드 */}
        <div style={{
          border: '4px solid #388e3c',
          borderRadius: '28px',
          padding: '32px',
          backgroundColor: theme === 'dark' ? '#1e3822' : '#e8f5e9',
          boxShadow: '6px 6px 0px 0px #388e3c',
          marginTop: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '28px', fontWeight: '900', color: '#2e7d32' }}>
            <span>✅ 정답:</span>
            <span style={{ backgroundColor: '#2e7d32', color: 'white', padding: '4px 14px', borderRadius: '12px' }}>
              {docData.answer.num} {docData.answer.text}
            </span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '800', margin: '14px 0 0 0', paddingLeft: '8px', color: 'var(--color-text)' }}>
            👉 {docData.answer.translation}
          </p>
        </div>

        {/* 📌 고1 이상 핵심 어휘 필터링 단어장 정리 테이블 */}
        <div style={{
          border: '4px solid #5d4037',
          borderRadius: '28px',
          padding: '32px',
          backgroundColor: 'var(--color-bg)',
          boxShadow: '6px 6px 0px 0px #5d4037',
          marginTop: '16px'
        }}>
          {/* 단어 정리 상단 헤더 & 일괄 누적 단추 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '16px',
            marginBottom: '24px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '32px' }}>📌</span>
              <h3 style={{ 
                fontSize: '26px', 
                fontWeight: '900', 
                margin: 0, 
                color: 'purple' 
              }}>
                단어 및 숙어 정리
              </h3>
            </div>

            {/* 🌟 지문 전체 단어/숙어 한방 일괄 누적 BigButton */}
            <BigButton
              variant="success"
              onClick={() => {
                let addedCount = 0;
                highLevelVocab.forEach(vocab => {
                  const alreadyExists = myVocab.some(
                    v => v.word.toLowerCase() === vocab.word.toLowerCase()
                  );
                  if (!alreadyExists) {
                    addToVocab(vocab.word, vocab.meaning, '지문 단어장 일괄 누적으로 저장됨');
                    addedCount++;
                  }
                });
                if (addedCount > 0) {
                  speakText(`${addedCount} new words and idioms added successfully.`);
                } else {
                  speakText("All words and idioms are already saved.");
                }
              }}
              style={{ minHeight: '60px', padding: '12px 24px', fontSize: '18px' }}
            >
              🌟 이 지문 단어/숙어 전체 일괄 누적하기
            </BigButton>
          </div>

          <div style={{
            overflow: 'hidden',
            border: '3px solid var(--color-border)',
            borderRadius: '20px'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '22px',
              fontWeight: '800',
              textAlign: 'left'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: 'var(--color-secondary)',
                  borderBottom: '3px solid var(--color-border)'
                }}>
                  <th style={{ padding: '18px 24px', width: '35%', borderRight: '3px solid var(--color-border)' }}>단어/숙어</th>
                  <th style={{ padding: '18px 24px', width: '45%', borderRight: '3px solid var(--color-border)' }}>뜻</th>
                  <th style={{ padding: '18px 24px', width: '20%', textAlign: 'center' }}>단어장 누적</th>
                </tr>
              </thead>
              <tbody>
                {highLevelVocab.map((vocab, vIdx) => {
                  // 이미 내 단어장(myVocab)에 등록되었는지 실시간 체크
                  const isSaved = myVocab.some(
                    item => item.word.toLowerCase() === vocab.word.toLowerCase()
                  );

                  return (
                    <tr 
                      key={vIdx} 
                      style={{
                        borderBottom: vIdx < highLevelVocab.length - 1 ? '2px solid var(--color-border)' : 'none',
                        backgroundColor: vIdx % 2 === 0 ? 'var(--color-bg)' : 'rgba(0,0,0,0.01)',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setSelectedWord(vocab.word);
                        setWordMeaning(vocab.meaning);
                        setWordSynonyms(vocab.synonyms || '동의어 데이터 없음');
                        setWordAntonyms(vocab.antonyms || '반의어 데이터 없음');
                        setWordSimilarIdioms(vocab.similarIdioms || '');
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = vIdx % 2 === 0 ? 'var(--color-bg)' : 'rgba(0,0,0,0.01)'}
                    >
                      <td style={{ 
                        padding: '18px 24px', 
                        fontWeight: '900', 
                        color: 'var(--color-primary)',
                        borderRight: '3px solid var(--color-border)',
                        wordBreak: 'break-all'
                      }}>
                        {vocab.word}
                      </td>
                      <td style={{ 
                        padding: '18px 24px', 
                        color: 'var(--color-text)',
                        borderRight: '3px solid var(--color-border)'
                      }}>
                        {vocab.meaning}
                      </td>
                      <td style={{ 
                        padding: '12px 16px',
                        textAlign: 'center',
                        verticalAlign: 'middle'
                      }}>
                        {isSaved ? (
                          <span style={{
                            backgroundColor: '#e8f5e9',
                            color: '#2e7d32',
                            padding: '6px 16px',
                            borderRadius: '30px',
                            fontSize: '16px',
                            fontWeight: '900',
                            border: '2px solid #2e7d32',
                            display: 'inline-block'
                          }}>
                            ⭐ 누적 완료
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // 부모 행 tr의 onClick(사전 팝업)을 차단하여 단어장 누적만 트리거!
                              addToVocab(vocab.word, vocab.meaning, '모의고사 구조분석 단어장에서 즉시 누적됨');
                              speakText(`Saved ${vocab.word} to vocabulary.`);
                            }}
                            style={{
                              backgroundColor: 'purple',
                              color: 'white',
                              border: '2px solid var(--color-border)',
                              borderRadius: '12px',
                              padding: '8px 16px',
                              fontSize: '16px',
                              fontWeight: '900',
                              cursor: 'pointer',
                              boxShadow: '2px 2px 0px 0px var(--color-border)',
                              transition: 'all 0.15s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translate(-1px, -1px)';
                              e.currentTarget.style.boxShadow = '3px 3px 0px 0px var(--color-border)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translate(0px, 0px)';
                              e.currentTarget.style.boxShadow = '2px 2px 0px 0px var(--color-border)';
                            }}
                          >
                            ➕ 단어장 누적
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {highLevelVocab.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
                      검출된 고1 이상 핵심 어휘가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- 입체 5단계 계단 렌더러 ---
  const render5StepsDiagram = () => {
    const stepsData = [
      { step: 'STEP 1', label: '단어', color: '#e53935', text: '단어가 모여 문장을 이룹니다.' },
      { step: 'STEP 2', label: '문장', color: '#ffa000', text: '문장이 모여 문단을 이룹니다.' },
      { step: 'STEP 3', label: '문단', color: '#388e3c', text: '문단이 유기적인 흐름을 만듭니다.' },
      { step: 'STEP 4', label: '구조', color: '#00796b', text: '3중 구조(도입-본문-맺음)를 구축합니다.' },
      { step: 'STEP 5', label: '지문 완성', color: '#1976d2', text: '목적에 맞는 하나의 온전한 글이 완성됩니다!' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '24px 0' }}>
        <h4 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--color-primary)', borderBottom: '3px solid var(--color-border)', paddingBottom: '8px' }}>
          🪜 글 구조 이해: 5단계 입체 계단 다이어그램
        </h4>
        <p style={{ fontSize: '18px', opacity: 0.8, margin: 0 }}>
          비문학 글은 무작위로 적힌 글이 아닙니다. 아래 5단계 유기적 결합 단계를 통해 완성도 높은 3중 입체 지문으로 빌드됩니다.
        </p>
        
        {/* 계단 레이아웃 (Stitch 사양과 100% 동일하게 복제!) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '40px',
          backgroundColor: theme === 'dark' ? '#222' : '#f1f3f5',
          borderRadius: '24px',
          border: '4px solid var(--color-border)',
          marginTop: '12px'
        }}>
          {stepsData.map((stepObj, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: themeStyles.cardBg,
                borderRadius: '20px',
                padding: '20px 32px',
                marginLeft: `${i * 48}px`, // Stitch 스타일의 점진적 계단형 정렬
                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                border: theme === 'high-contrast' ? '3px solid var(--color-text)' : '3px solid var(--color-border)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
                width: 'fit-content',
                minWidth: '600px'
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.transform = 'translateY(-2px)'; 
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.transform = 'translateY(0px)'; 
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.04)';
              }}
            >
              {/* 알약 캡슐형 STEP 뱃지 */}
              <span style={{
                backgroundColor: stepObj.color,
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: '900',
                padding: '6px 16px',
                borderRadius: '30px',
                marginRight: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                letterSpacing: '0.05em'
              }}>
                {stepObj.step}
              </span>
              
              {/* 본문 레이블 & 화살표 & 설명 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  fontSize: '28px', 
                  fontWeight: '900', 
                  color: stepObj.color,
                  marginRight: '4px'
                }}>
                  {stepObj.label}
                </span>
                
                <span style={{ 
                  fontSize: '22px', 
                  fontWeight: 'bold', 
                  color: '#868e96',
                  margin: '0 8px'
                }}>
                  ➔
                </span>
                
                <span style={{ 
                  fontSize: '22px', 
                  fontWeight: 'bold', 
                  color: 'var(--color-text)'
                }}>
                  {stepObj.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- 도입-본문-맺음말 브릿지 맵 렌더러 ---
  const renderBridgeDiagram = () => {
    // 본문 세부 노드 리스트 (기획서 황색 캡슐 4개 그대로 구현)
    const bodyCapules = ['논거 전개 1', '세부 사례 2', '논리 심화 3', '대조 부연 4'];
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '24px 0' }}>
        <h4 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--color-primary)', borderBottom: '3px solid var(--color-border)', paddingBottom: '8px' }}>
          🌁 글 구조분석: 도입 ➔ 본문 ➔ 맺음말 브릿지 맵
        </h4>
        <p style={{ fontSize: '18px', opacity: 0.8, margin: 0 }}>
          비문학 지문의 3중 핵심 구조입니다. **[도입]** 노드를 클릭하면 도입부 2문장의 상세 문법 다이어그램이 활성화됩니다.
        </p>

        {/* 다이어그램 뷰포트 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--color-secondary)',
          borderRadius: '24px',
          border: '3px solid var(--color-border)',
          padding: '48px 24px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '380px',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          {/* 유기적 곡선 SVG 배경 라인 */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} className="bridge-svg">
            <path d="M 120 190 Q 250 80, 360 80" fill="none" stroke="var(--color-border)" strokeWidth="4" strokeDasharray="8 6" />
            <path d="M 120 190 Q 250 150, 360 150" fill="none" stroke="var(--color-border)" strokeWidth="4" strokeDasharray="8 6" />
            <path d="M 120 190 Q 250 230, 360 230" fill="none" stroke="var(--color-border)" strokeWidth="4" strokeDasharray="8 6" />
            <path d="M 120 190 Q 250 300, 360 300" fill="none" stroke="var(--color-border)" strokeWidth="4" strokeDasharray="8 6" />

            <path d="M 360 80 Q 470 80, 600 190" fill="none" stroke="var(--color-border)" strokeWidth="4" strokeDasharray="8 6" />
            <path d="M 360 150 Q 470 150, 600 190" fill="none" stroke="var(--color-border)" strokeWidth="4" strokeDasharray="8 6" />
            <path d="M 360 230 Q 470 230, 600 190" fill="none" stroke="var(--color-border)" strokeWidth="4" strokeDasharray="8 6" />
            <path d="M 360 300 Q 470 300, 600 190" fill="none" stroke="var(--color-border)" strokeWidth="4" strokeDasharray="8 6" />
          </svg>

          {/* 1. 도입 노드 (파란색 캡슐) */}
          <button
            onClick={() => setSelectedSection('intro')}
            style={{
              zIndex: 2,
              backgroundColor: '#1976d2',
              color: '#fff',
              border: selectedSection === 'intro' ? '6px solid #fff' : '3px solid var(--color-border)',
              borderRadius: '50px',
              padding: '24px 36px',
              fontSize: '24px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(25, 118, 210, 0.4)',
              transition: 'transform 0.2s',
              minWidth: '150px',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            도입 (Intro)
            <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>총 {introSentences.length}문장</div>
          </button>

          {/* 2. 본문 노드 세로 병렬 그룹 (황색 캡슐 4개) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', zIndex: 2 }}>
            {bodyCapules.map((capName, cIdx) => (
              <button
                key={cIdx}
                onClick={() => setSelectedSection('body')}
                style={{
                  backgroundColor: '#fbc02d',
                  color: '#000',
                  border: selectedSection === 'body' ? '5px solid #000' : '3px solid var(--color-border)',
                  borderRadius: '30px',
                  padding: '14px 28px',
                  fontSize: '18px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  boxShadow: '0 6px 16px rgba(251, 192, 45, 0.3)',
                  transition: 'transform 0.15s',
                  minWidth: '220px',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {capName}
                {cIdx === 0 && <span style={{ fontSize: '12px', marginLeft: '6px', opacity: 0.7 }}>(총 {bodySentences.length}문장)</span>}
              </button>
            ))}
          </div>

          {/* 3. 맺음말 노드 (파란색 캡슐) */}
          <button
            onClick={() => setSelectedSection('conclusion')}
            style={{
              zIndex: 2,
              backgroundColor: '#1976d2',
              color: '#fff',
              border: selectedSection === 'conclusion' ? '6px solid #fff' : '3px solid var(--color-border)',
              borderRadius: '50px',
              padding: '24px 36px',
              fontSize: '24px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(25, 118, 210, 0.4)',
              transition: 'transform 0.2s',
              minWidth: '150px',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            맺음 (Ending)
            <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>총 {conclusionSentences.length}문장</div>
          </button>
        </div>

        {/* 선택한 영역 문장 리스트 & 도입부 2문장 이미지적 문법 분석 */}
        <div style={{
          marginTop: '16px',
          padding: '28px',
          border: '4px solid var(--color-border)',
          borderRadius: '24px',
          backgroundColor: 'var(--color-bg)'
        }}>
          {selectedSection === 'intro' && (
            <div>
              <span style={{ fontSize: '14px', fontWeight: '900', color: '#1976d2', backgroundColor: 'rgba(25, 118, 210, 0.1)', padding: '6px 14px', borderRadius: '20px' }}>
                🔵 도입 (Introduction) 영역 활성화
              </span>
              <h5 style={{ fontSize: '26px', fontWeight: '900', marginTop: '16px', marginBottom: '12px' }}>
                도입부 문장 분석 및 비주얼 이미지 맵 (Visual Syntax Map)
              </h5>
              <p style={{ fontSize: '18px', opacity: 0.8, marginBottom: '24px' }}>
                도입부 문장의 의미 덩어리(청크)를 한눈에 볼 수 있는 블록 다이어그램 맵입니다. S/V 밑줄 대신 직관적인 컬러 블록이 뼈대를 보여줍니다.
              </p>

              {/* 도입부 2문장 이상 감지 시 문법 이미지 구조도 제공 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {introSentences.slice(0, 2).map((sObj, sIdx) => {
                  const txt = typeof sObj === 'string' ? sObj : (sObj?.text || sObj?.english || '');
                  const chunksList = parseSlashSentence(txt).split(' / ');
                  
                  return (
                    <div
                      key={sIdx}
                      style={{
                        padding: '24px',
                        borderRadius: '20px',
                        border: '3px solid #1976d2',
                        backgroundColor: themeStyles.introBg,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ backgroundColor: '#1976d2', color: '#fff', fontSize: '14px', fontWeight: '900', padding: '3px 10px', borderRadius: '8px' }}>
                          도입 문장 {sIdx + 1}
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', opacity: 0.7 }}>시각 구문 지도</span>
                      </div>

                      {/* 청크를 아름다운 3D 컬러 블록(이미지 다이어그램)으로 표현 */}
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '12px',
                        padding: '16px',
                        backgroundColor: 'var(--color-bg)',
                        borderRadius: '16px',
                        border: '2px solid var(--color-border)'
                      }}>
                        {chunksList.map((chunk, cIdx) => {
                          // 각 청크 순서대로 미려한 HSL 컬러 블록 생성
                          const blockColors = [
                            { bg: 'rgba(25, 118, 210, 0.15)', border: '#1976d2', text: '#1565c0', label: '화두 제시' },
                            { bg: 'rgba(67, 160, 71, 0.15)', border: '#43a047', text: '#2e7d32', label: '핵심 서술' },
                            { bg: 'rgba(251, 192, 45, 0.2)', border: '#fbc02d', text: '#f57f17', label: '부연 보어' },
                            { bg: 'rgba(230, 81, 0, 0.15)', border: '#e65100', text: '#d84315', label: '상세 수식' }
                          ];
                          const cStyle = blockColors[cIdx % blockColors.length];

                          return (
                            <div
                              key={cIdx}
                              style={{
                                flex: '1 1 auto',
                                padding: '16px 20px',
                                backgroundColor: cStyle.bg,
                                border: `3px solid ${cStyle.border}`,
                                borderRadius: '12px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                                minWidth: '160px'
                              }}
                            >
                              <span style={{ fontSize: '11px', fontWeight: '900', color: cStyle.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                [{cStyle.label}]
                              </span>
                              <span style={{ fontSize: `${fontSize * 0.7}px`, fontWeight: '900', color: 'var(--color-text)' }}>
                                {chunk}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '6px 0 0 0', color: 'var(--color-text)', lineHeight: '1.6' }}>
                        👉 직독직해 어순 번역: {sObj?.chunks?.map(c => c.meaning).join(' / ') || '어순 분석 제공됨'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedSection === 'body' && (
            <div>
              <span style={{ fontSize: '14px', fontWeight: '900', backgroundColor: 'rgba(251, 192, 45, 0.15)', padding: '6px 14px', borderRadius: '20px', color: '#f57f17' }}>
                🟡 본론 (Body) 영역 활성화
              </span>
              <h5 style={{ fontSize: '26px', fontWeight: '900', marginTop: '16px', marginBottom: '12px' }}>
                본론부 구조 독해
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                {bodySentences.map((sObj, idx) => (
                  <p key={idx} style={{ fontSize: `${fontSize}px`, fontWeight: 'bold', lineHeight: '1.6' }}>
                    <span style={{ color: '#f57f17', marginRight: '10px' }}>[{idx + 1 + introSentences.length}]</span>
                    {renderClickableWords(typeof sObj === 'string' ? sObj : (sObj?.text || sObj?.english || ''))}
                  </p>
                ))}
              </div>
            </div>
          )}

          {selectedSection === 'conclusion' && (
            <div>
              <span style={{ fontSize: '14px', fontWeight: '900', color: '#1976d2', backgroundColor: 'rgba(25, 118, 210, 0.1)', padding: '6px 14px', borderRadius: '20px' }}>
                🔵 결론 (Conclusion) 영역 활성화
              </span>
              <h5 style={{ fontSize: '26px', fontWeight: '900', marginTop: '16px', marginBottom: '12px' }}>
                결론부 구조 독해
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                {conclusionSentences.map((sObj, idx) => (
                  <p key={idx} style={{ fontSize: `${fontSize}px`, fontWeight: 'bold', lineHeight: '1.6' }}>
                    <span style={{ color: '#1976d2', marginRight: '10px' }}>[{idx + 1 + introSentences.length + bodySentences.length}]</span>
                    {renderClickableWords(typeof sObj === 'string' ? sObj : (sObj?.text || sObj?.english || ''))}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- 7단계 3단 테이블 렌더러 (E+EK+분류) ---
  const render3StepTableCard = (sObj, index) => {
    const txt = typeof sObj === 'string' ? sObj : (sObj?.text || sObj?.english || '');
    
    // EK 한글 직독직해 어순 맵 확보
    const chunks = sObj?.chunks || [];
    
    // 홑문장 형식 라디오 옵션
    const simpleSentenceTypes = ['1형식', '2형식', '3형식', '4형식', '5형식'];
    // 겹문장 종류 옵션
    const complexSentenceTypes = ['대등문장', '종속문장', '명사절안음', '관형절안음', '인용절안음'];

    const currentCls = sentenceClassifications[index] || { isSimple: true, type: '' };

    return (
      <div
        key={index}
        style={{
          border: '4px solid var(--color-border)',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: 'var(--color-bg)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
        }}
      >
        {/* 행 1: E (영어 원문) */}
        <div style={{
          backgroundColor: themeStyles.cardBg,
          padding: '24px',
          borderBottom: '3px solid var(--color-border)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: '15px', fontWeight: '900', padding: '4px 12px', borderRadius: '8px' }}>
              문장 {index + 1} 영어 (E)
            </span>
            <button
              onClick={() => speakText(txt)}
              style={{
                padding: '8px 16px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: 'var(--color-secondary)',
                border: '2px solid var(--color-border)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              🔊 듣기
            </button>
          </div>
          <p style={{ fontSize: `${fontSize}px`, fontWeight: 'bold', lineHeight: '1.6', margin: 0 }}>
            {renderClickableWords(txt)}
          </p>
        </div>

        {/* 행 2: 해석 (한글 직독직해 어순) */}
        <div style={{
          padding: '24px',
          borderBottom: '3px solid var(--color-border)',
          backgroundColor: theme === 'high-contrast' ? 'transparent' : 'rgba(0,0,0,0.02)'
        }}>
          <span style={{ backgroundColor: 'purple', color: '#fff', fontSize: '15px', fontWeight: '900', padding: '4px 12px', borderRadius: '8px', display: 'inline-block', marginBottom: '14px' }}>
            어순 번역 (해석)
          </span>
          
          {/* 어순별 캡슐 시각 표출 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            {chunks.map((c, cIdx) => {
              // 기획서 둥근 캡슐 표현 (동사는 빨간색 둥글게, 주어는 파란색, 수식어는 괄호)
              let borderStyle = '2px solid var(--color-border)';
              let textColor = 'var(--color-text)';
              let textWrap = c.meaning || '';
              
              if (c.tag === 'S+V') {
                borderStyle = '3px solid #1976d2'; // 주어동사는 파란색 테두리
                textColor = '#1565c0';
              } else if (c.tag === 'to-Inf' || c.text.toLowerCase().includes('is') || c.text.toLowerCase().includes('are')) {
                borderStyle = '3px solid #e53935'; // 동사 성분 빨간색 테두리
                textColor = '#d32f2f';
              } else if (c.tag === 'PREP') {
                textWrap = `(${c.meaning})`; // 수식어구는 괄호 처리
              }

              return (
                <div
                  key={cIdx}
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    border: borderStyle,
                    color: textColor,
                    padding: '8px 18px',
                    borderRadius: '30px',
                    fontSize: '20px',
                    fontWeight: '900',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.03)'
                  }}
                >
                  {textWrap}
                </div>
              );
            })}
          </div>
        </div>

        {/* 행 3: 분류 (홑문장/겹문장) */}
        <div style={{
          backgroundColor: 'var(--color-secondary)',
          padding: '24px'
        }}>
          <span style={{ backgroundColor: '#2e7d32', color: '#fff', fontSize: '15px', fontWeight: '900', padding: '4px 12px', borderRadius: '8px', display: 'inline-block', marginBottom: '14px' }}>
            구문 분류
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 1. 홑/겹 대분류 라디오 단추 */}
            <div style={{ display: 'flex', gap: '24px' }}>
              <label style={{ fontSize: '20px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name={`sentence-type-${index}`}
                  checked={currentCls.isSimple}
                  onChange={() => handleClassificationChange(index, 'isSimple', true)}
                  style={{ width: '24px', height: '24px' }}
                />
                홑문장 [1~5형식]
              </label>
              <label style={{ fontSize: '20px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name={`sentence-type-${index}`}
                  checked={!currentCls.isSimple}
                  onChange={() => handleClassificationChange(index, 'isSimple', false)}
                  style={{ width: '24px', height: '24px' }}
                />
                겹문장
              </label>
            </div>

            {/* 2. 형식 및 상세 분류 단추 목록 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {currentCls.isSimple ? (
                simpleSentenceTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleClassificationChange(index, 'type', type)}
                    style={{
                      padding: '10px 18px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      backgroundColor: currentCls.type === type ? '#2e7d32' : 'var(--color-bg)',
                      color: currentCls.type === type ? '#fff' : 'var(--color-text)',
                      border: '2px solid var(--color-border)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {type}
                  </button>
                ))
              ) : (
                complexSentenceTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleClassificationChange(index, 'type', type)}
                    style={{
                      padding: '10px 18px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      backgroundColor: currentCls.type === type ? '#1976d2' : 'var(--color-bg)',
                      color: currentCls.type === type ? '#fff' : 'var(--color-text)',
                      border: '2px solid var(--color-border)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {type}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- 8단계 [Arrange the sentence] 청크 순서 조립 퀴즈 컴포넌트 렌더러 ---
  const renderQuizCard = (sObj, sentIdx) => {
    // 34번 모의고사 지문 족보 청크 및 동적 fallback 획득
    const correctChunks = getSentenceChunks(sObj, sentIdx);
    
    // 셔플된 상태 획득
    const shuffledChunks = getShuffledChunksForSentence(sObj, sentIdx);

    // 사용자가 현재 조립한 퀴즈 정답 배열
    const selectedList = quizAnswers[sentIdx] || [];

    // 동적 팁 문구
    const getSentenceStructureTip = (idx) => {
      const tips = [
        "When + Subject + Verb + Adverbial Clause",
        "Adverb + Subject + Verb + Object",
        "Subject + Verb + Object + infinitive (reconsider)",
        "Adverbial + Subject + Verb + Object",
        "Subject + Verb + Noun Clause (that...)",
        "Adverbial + Subject + Verb + Prepositional Object"
      ];
      return tips[idx] || "Subject + Adverb + Verb + Object";
    };

    return (
      <div
        key={sentIdx}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          backgroundColor: theme === 'yellow' ? '#fffde7' : (theme === 'dark' ? '#1a1a1a' : '#fffdec'),
          padding: '32px',
          borderRadius: '28px',
          border: '3px solid var(--color-border)',
          boxShadow: '6px 6px 0px 0px var(--color-border)',
          fontFamily: "'Outfit', 'Inter', sans-serif"
        }}
      >
        {/* LEVEL 4 EXERCISE 초록 배지 */}
        <div>
          <span style={{
            display: 'inline-block',
            backgroundColor: theme === 'dark' ? '#1b3e1f' : '#a3f69c',
            color: theme === 'dark' ? '#88d982' : '#005312',
            fontSize: '18px',
            fontWeight: '900',
            padding: '8px 20px',
            borderRadius: '9999px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            Level 4 Exercise
          </span>
        </div>

        {/* Arrange the sentence 타이틀 및 설명 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{
            fontSize: '38px',
            fontWeight: '900',
            color: 'var(--color-text)',
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            Arrange the sentence
          </h2>
          <p style={{
            fontSize: '20px',
            fontWeight: '500',
            color: 'var(--color-text)',
            opacity: 0.8,
            lineHeight: '1.4',
            margin: 0
          }}>
            Tap or drag the word chunks into the correct order to form a meaningful sentence.
          </p>
        </div>

        {/* 둥근 핑크색 점선 드롭 영역 (Drop word chunks here) */}
        <div style={{
          minHeight: '180px',
          border: '3px solid var(--color-border)',
          borderRadius: '24px',
          padding: '24px',
          backgroundColor: theme === 'dark' ? '#252525' : '#ffe9e3',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.02)',
          transition: 'all 0.2s'
        }}>
          {selectedList.length === 0 ? (
            <span style={{
              fontSize: '22px',
              fontWeight: '900',
              color: 'var(--color-text)',
              opacity: 0.3,
              letterSpacing: '0.02em'
            }}>
              Drop word chunks here
            </span>
          ) : (
            selectedList.map((chunk, cIdx) => (
              <button
                key={cIdx}
                onClick={() => handleQuizChunkClick(sentIdx, chunk, correctChunks)}
                className="active-scale"
                style={{
                  padding: '16px 24px',
                  fontSize: '22px',
                  fontWeight: '900',
                  backgroundColor: theme === 'dark' ? '#5c93e6' : '#ffdbd0',
                  color: theme === 'dark' ? 'white' : '#2c160e',
                  border: '3px solid var(--color-border)',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0px 0px var(--color-border)',
                  textAlign: 'left',
                  lineHeight: '1.3'
                }}
              >
                {chunk}
              </button>
            ))
          )}
        </div>

        {/* Sentence Chunks 헤더 & SHUFFLE 단추 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '8px'
        }}>
          <span style={{ fontSize: '22px', fontWeight: '900', color: 'var(--color-text)' }}>
            Sentence Chunks
          </span>
          <button
            onClick={() => handleShuffleChunks(sObj, sentIdx)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#005dac',
              fontSize: '20px',
              fontWeight: '900',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '8px',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 93, 172, 0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px', fontWeight: '900' }}>shuffle</span>
            SHUFFLE
          </button>
        </div>

        {/* 세로 3D 보관함 및 청크 세트 */}
        <div style={{
          backgroundColor: theme === 'dark' ? '#252525' : '#ffffff',
          border: '4px solid var(--color-border)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '6px 6px 0px 0px var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {shuffledChunks.map((chunk, chIdx) => {
            const isSelected = selectedList.includes(chunk);
            return (
              <button
                key={chIdx}
                onClick={() => handleQuizChunkClick(sentIdx, chunk, correctChunks)}
                disabled={isSelected}
                className={isSelected ? "" : "active-scale"}
                style={{
                  padding: '24px',
                  fontSize: '22px',
                  fontWeight: '900',
                  backgroundColor: isSelected ? 'var(--color-secondary)' : (theme === 'dark' ? '#333333' : '#ffe9e3'),
                  color: isSelected ? 'transparent' : 'var(--color-text)',
                  border: '3px solid var(--color-border)',
                  borderRadius: '20px',
                  cursor: isSelected ? 'default' : 'pointer',
                  minHeight: '72px',
                  boxShadow: isSelected ? 'none' : '0px 4px 0px 0px var(--color-border)',
                  textAlign: 'left',
                  lineHeight: '1.4',
                  transition: 'all 0.15s ease',
                  opacity: isSelected ? 0.2 : 1
                }}
              >
                {chunk}
              </button>
            );
          })}
        </div>

        {/* 🐶 하단 댕댕이 문법 팁 카드 */}
        <div style={{
          backgroundColor: theme === 'dark' ? '#252525' : '#1c1b1f',
          borderRadius: '24px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '3px solid var(--color-border)',
          boxShadow: '4px 4px 0px 0px var(--color-border)',
          marginTop: '8px'
        }}>
          <span style={{ fontSize: '32px' }}>🐶</span>
          <span style={{
            fontSize: '20px',
            fontWeight: '900',
            letterSpacing: '0.02em',
            color: '#ffb74d',
            lineHeight: '1.4'
          }}>
            TIP: {getSentenceStructureTip(sentIdx)}
          </span>
        </div>

        {/* 🔄 다시하기 단추 */}
        <BigButton
          variant="secondary"
          onClick={() => resetQuiz(sentIdx)}
          style={{ width: '100%', minHeight: '64px', fontSize: '18px', marginTop: '8px' }}
        >
          🔄 영작 다시 하기
        </BigButton>
      </div>
    );
  };

  // --- 지문 통찰 (Passage Insight) 컴포넌트로 분리 이전 완료 ---



  const renderTwinsReadingCourse = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* 🚀 Twins Reading 8단계 Stepper Navigator Bar */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '24px',
          backgroundColor: 'var(--color-secondary)',
          borderRadius: '24px',
          border: '4px solid var(--color-border)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '28px', fontWeight: '900', margin: 0, color: 'var(--color-primary)' }}>
              🏁 Twins Reading 8단계 비문학 독해 코스
            </h3>
            <span style={{ fontSize: '18px', fontWeight: '900', color: 'purple' }}>
              진행도: {currentReadingStep} / 8 단계
            </span>
          </div>

          {/* Stepper 단추 가로 배열 (Mega UI) */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '10px',
            marginTop: '10px'
          }}>
            {[
              { step: 1, label: '단어 훈련 1' },
              { step: 2, label: '구조 분석 1' },
              { step: 3, label: '단어 훈련 2' },
              { step: 4, label: '구조 분석 2' },
              { step: 5, label: '영문 분석 1' },
              { step: 6, label: '문장 8회독' },
              { step: 7, label: '정밀 문장분석' },
              { step: 8, label: '영어 어순영작' }
            ].map(opt => (
              <button
                key={opt.step}
                onClick={() => setCurrentReadingStep(opt.step)}
                style={{
                  padding: '12px 6px',
                  fontSize: '16px',
                  fontWeight: '900',
                  backgroundColor: currentReadingStep === opt.step ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: currentReadingStep === opt.step ? 'white' : 'var(--color-text)',
                  border: '3px solid var(--color-border)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: currentReadingStep === opt.step ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                {opt.step}. {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- 단계별 분기 레이아웃 렌더링 --- */}

        {/* 1단계 & 3단계: 단어 플립북 훈련 (모듈화 완료) */}
        {(currentReadingStep === 1 || currentReadingStep === 3) && (
          <WordsTraining
            currentReadingStep={currentReadingStep}
            vocabCards={vocabCards}
            flippedCards={flippedCards}
            setFlippedCards={setFlippedCards}
          />
        )}

        {/* 2단계: 비문학 지문 통찰 (Passage Insight - Stage 1/4) (모듈화 완료) */}
        {currentReadingStep === 2 && <PassageInsight />}

        {/* 4단계: SENTENCE STRUCTURE (Stage 3/4) 세로 성분 분석 & 글의 종류 장르 퀴즈 훈련 */}
        {currentReadingStep === 4 && <SentenceStructure />}

        {/* 5단계: 영문 분석 1단계 (슬래시 끊어읽기) */}
        {currentReadingStep === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ padding: '20px', border: '3px solid var(--color-border)', borderRadius: '20px' }}>
              <h4 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>
                🌿 5단계 [영어로 영어로 분석]
              </h4>
              <p style={{ fontSize: '18px', opacity: 0.7, marginTop: '8px', margin: 0 }}>
                의미 덩어리별 수직 슬래시(/) 끊어 읽기를 통해 시선 분산을 막고, 정상 시력 유저와 동일한 속도로 빠르게 영문을 이해하는 훈련 단계입니다.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {sentences.map((sObj, idx) => {
                const txt = typeof sObj === 'string' ? sObj : (sObj?.text || sObj?.english || '');
                const parsed = parseSlashSentence(txt);
                return (
                  <div key={idx} style={{ padding: '24px', border: '3px solid var(--color-border)', borderRadius: '20px', backgroundColor: 'var(--color-bg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--color-primary)' }}>문장 {idx + 1}</span>
                      <button
                        onClick={() => speakText(parsed)}
                        style={{ padding: '4px 12px', fontSize: '14px', fontWeight: 'bold', backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        🔊 읽어주기
                      </button>
                    </div>
                    <p style={{ fontSize: `${fontSize}px`, fontWeight: 'bold', lineHeight: '2', margin: 0 }}>
                      {parsed.split(' / ').map((chunk, cIdx, arr) => (
                        <span key={cIdx}>
                          {renderClickableWords(chunk)}
                          {cIdx < arr.length - 1 && <span style={{ color: 'var(--color-primary)', margin: '0 10px', fontWeight: '900' }}>/</span>}
                        </span>
                      ))}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6단계: 문장 8회독 다독 챌린지 */}
        {currentReadingStep === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ padding: '20px', border: '3px solid var(--color-border)', borderRadius: '20px', textAlign: 'center' }}>
              <h4 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>
                🚀 6단계 [문장 8회독 챌린지]
              </h4>
              <p style={{ fontSize: '18px', opacity: 0.7, marginTop: '8px', margin: 0 }}>
                영어 문장을 반복해서 눈으로 추적 낭독하며 8회독 스탬프를 완성하세요! 다독은 지문 완벽 지각의 열쇠입니다.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {sentences.map((sObj, idx) => {
                const txt = typeof sObj === 'string' ? sObj : (sObj?.text || sObj?.english || '');
                const count = readingCounts[idx] || 0;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '24px',
                      borderRadius: '20px',
                      border: count === 8 ? '4px solid #43a047' : '3px solid var(--color-border)',
                      backgroundColor: count === 8 ? 'rgba(67, 160, 73, 0.05)' : 'var(--color-bg)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '24px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--color-primary)' }}>문장 {idx + 1}</span>
                      <p style={{ fontSize: `${fontSize}px`, fontWeight: 'bold', lineHeight: '1.6', margin: '8px 0 0 0' }}>
                        {renderClickableWords(txt)}
                      </p>
                    </div>

                    {/* 8회독 클릭 단추 */}
                    <button
                      onClick={() => handleReadIncrement(idx)}
                      style={{
                        minWidth: '120px',
                        minHeight: '80px',
                        backgroundColor: count === 8 ? '#43a047' : 'var(--color-secondary)',
                        color: count === 8 ? '#fff' : 'var(--color-text)',
                        border: '3px solid var(--color-border)',
                        borderRadius: '16px',
                        fontSize: '22px',
                        fontWeight: '900',
                        cursor: count === 8 ? 'default' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: count === 8 ? 'none' : '0 4px 10px rgba(0,0,0,0.06)'
                      }}
                    >
                      {count === 8 ? (
                        <span>🎉 완수!</span>
                      ) : (
                        <>
                          <span>회독수</span>
                          <span style={{ fontSize: '26px' }}>{count} / 8</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7단계: 정밀 문장 분석 3단 테이블 (E+EK+분류) */}
        {currentReadingStep === 7 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ padding: '20px', border: '3px solid var(--color-border)', borderRadius: '20px' }}>
              <h4 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>
                📊 7단계 [정밀 문장 분석 표]
              </h4>
              <p style={{ fontSize: '18px', opacity: 0.7, marginTop: '8px', margin: 0 }}>
                기획서 사양 그대로 영어 원문(E)과 일대일 대응 어순 번역(EK), 그리고 홑문장(1~5형식) 및 겹문장 구문 분류를 시각 매핑한 테이블 분석기입니다.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {sentences.map((sObj, idx) => render3StepTableCard(sObj, idx))}
            </div>
          </div>
        )}

        {/* 8단계: 영어 어순 영작 퀴즈 */}
        {currentReadingStep === 8 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ padding: '20px', border: '3px solid var(--color-border)', borderRadius: '20px', textAlign: 'center' }}>
              <h4 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>
                ✏️ 8단계 [영어 어순 영작 훈련]
              </h4>
              <p style={{ fontSize: '18px', opacity: 0.7, marginTop: '8px', margin: 0 }}>
                한글 직독직해 어순 힌트를 보고, 흩어진 단어 타일을 탭하여 영어 문장 구조에 정확히 부합하는 문장으로 조립하세요!
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {sentences.map((sObj, idx) => renderQuizCard(sObj, idx))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '32px', 
      overflowY: 'auto', 
      height: '100%',
      paddingBottom: '80px'
    }}>
      {/* 🌟 탭 스위처: Stitch 원본 해설지 vs 8단계 학습 코스 */}
      <div style={{
        display: 'flex',
        gap: '16px',
        margin: '0 0 12px 0',
        flexShrink: 0
      }}>
        <button
          onClick={() => setIsStitchView(true)}
          style={{
            flex: 1,
            padding: '18px 24px',
            fontSize: '22px',
            fontWeight: '900',
            backgroundColor: isStitchView ? 'var(--color-primary)' : 'var(--color-bg)',
            color: isStitchView ? 'white' : 'var(--color-text)',
            border: '3px solid var(--color-border)',
            borderRadius: '16px',
            cursor: 'pointer',
            boxShadow: isStitchView ? '5px 5px 0px 0px var(--color-border)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          📄 Stitch 원본 모의고사 해설지 뷰
        </button>
        <button
          onClick={() => setIsStitchView(false)}
          style={{
            flex: 1,
            padding: '18px 24px',
            fontSize: '22px',
            fontWeight: '900',
            backgroundColor: !isStitchView ? 'var(--color-primary)' : 'var(--color-bg)',
            color: !isStitchView ? 'white' : 'var(--color-text)',
            border: '3px solid var(--color-border)',
            borderRadius: '16px',
            cursor: 'pointer',
            boxShadow: !isStitchView ? '5px 5px 0px 0px var(--color-border)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          🏁 Twins Reading 8단계 훈련 코스
        </button>
      </div>

      {isStitchView ? renderStitchView() : renderTwinsReadingCourse()}

      {/* 📒 단어 터치 사전 팝업 모달 */}
      {selectedWord && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}
          onClick={() => setSelectedWord(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-bg)',
              border: '6px solid var(--color-primary)',
              borderRadius: '24px',
              padding: '36px',
              boxShadow: '0 12px 48px rgba(0,0,0,0.3)',
              width: '100%',
              maxWidth: '560px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              animation: 'modalPop 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <span style={{
                fontSize: '15px', fontWeight: 'bold',
                color: 'var(--color-text)', opacity: 0.6,
                border: '2px solid var(--color-border)',
                padding: '4px 12px', borderRadius: '20px',
                backgroundColor: 'var(--color-secondary)'
              }}>
                📒 어휘 구조 분석기
              </span>
              <h3 style={{ fontSize: '38px', fontWeight: '900', color: 'var(--color-primary)', marginTop: '16px', wordBreak: 'break-all' }}>
                {selectedWord}
              </h3>
              
              <div style={{
                fontSize: '26px', fontWeight: 'bold', marginTop: '16px',
                padding: '16px', backgroundColor: 'var(--color-secondary)',
                borderRadius: '12px', border: '2px solid var(--color-border)', lineHeight: '1.4'
              }}>
                뜻: {wordMeaning}
              </div>

              {/* 저장 상태 고대비 배지 */}
              {isWordSaved ? (
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
                  marginTop: '16px',
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
                  marginTop: '16px',
                  fontFamily: "'Outfit', 'Inter', sans-serif"
                }}>
                  <span>⚪</span>
                  <span>아직 단어장에 저장되지 않았습니다.</span>
                </div>
              )}

              {/* 🔵 동의어 & 유사숙어 패밀리 3D 캡슐화 (터치 시 원어민 음성 낭독) */}
              {wordSynonyms && wordSynonyms !== '동의어 데이터 없음' && (
                <div style={{
                  fontSize: '18px', fontWeight: 'bold', marginTop: '12px',
                  padding: '16px', backgroundColor: 'rgba(25, 118, 210, 0.05)',
                  borderRadius: '16px', border: '3px solid var(--color-border)',
                  boxShadow: '3px 3px 0px 0px var(--color-border)',
                  lineHeight: '1.4'
                }}>
                  <div style={{ marginBottom: '10px', color: '#1565c0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px' }}>
                    <span>🔵</span>
                    <span>동의어/유사숙어 패밀리 (터치 시 🔊 낭독)</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                    {wordSynonyms.split(',').map((syn, sIdx) => {
                      const cleanSyn = syn.trim();
                      if (!cleanSyn) return null;
                      return (
                        <button
                          key={sIdx}
                          onClick={() => speakText(cleanSyn)}
                          style={{
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-text)',
                            border: '2px solid var(--color-border)',
                            borderRadius: '20px',
                            padding: '6px 14px',
                            fontSize: '16px',
                            fontWeight: '900',
                            cursor: 'pointer',
                            boxShadow: '2px 2px 0px 0px var(--color-border)',
                            transition: 'all 0.15s',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translate(-1px, -1px)';
                            e.currentTarget.style.boxShadow = '3px 3px 0px 0px var(--color-border)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translate(0px, 0px)';
                            e.currentTarget.style.boxShadow = '2px 2px 0px 0px var(--color-border)';
                          }}
                        >
                          🔊 {cleanSyn}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 🔴 반의어 */}
              <div style={{
                fontSize: '18px', fontWeight: 'bold', marginTop: '12px',
                padding: '12px', backgroundColor: 'rgba(198, 40, 40, 0.08)',
                borderRadius: '12px', border: '2px solid rgba(198, 40, 40, 0.2)', lineHeight: '1.4'
              }}>
                🔴 반의어 (Antonyms):
                <div style={{ fontSize: '20px', fontWeight: '900', marginTop: '4px', color: '#c62828' }}>{wordAntonyms}</div>
              </div>

              {/* 💡 유사의미 숙어 뜻풀이 목록 3D 캡슐화 */}
              {wordSimilarIdioms && (
                <div style={{
                  fontSize: '18px', fontWeight: 'bold', marginTop: '12px',
                  padding: '16px', backgroundColor: 'rgba(156, 39, 176, 0.05)',
                  borderRadius: '16px', border: '3px solid var(--color-border)',
                  boxShadow: '3px 3px 0px 0px var(--color-border)',
                  lineHeight: '1.4'
                }}>
                  <div style={{ marginBottom: '10px', color: 'purple', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px' }}>
                    <span>💡</span>
                    <span>유사의미 숙어 뜻풀이 (터치 시 🔊 낭독)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {wordSimilarIdioms.split(',').map((idiom, iIdx) => {
                      const cleanIdiom = idiom.trim();
                      if (!cleanIdiom) return null;
                      
                      const voiceText = cleanIdiom.split('(')[0].trim();

                      return (
                        <div
                          key={iIdx}
                          onClick={() => speakText(voiceText)}
                          style={{
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-text)',
                            border: '2px solid var(--color-border)',
                            borderRadius: '12px',
                            padding: '10px 16px',
                            fontSize: '16px',
                            fontWeight: '900',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '2px 2px 0px 0px var(--color-border)',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translate(-1px, -1px)';
                            e.currentTarget.style.boxShadow = '3px 3px 0px 0px var(--color-border)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translate(0px, 0px)';
                            e.currentTarget.style.boxShadow = '2px 2px 0px 0px var(--color-border)';
                          }}
                        >
                          <span style={{ color: 'purple' }}>🔊 {cleanIdiom}</span>
                          <span style={{ fontSize: '12px', opacity: 0.6 }}>듣기 ➔</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <BigButton
                variant={isWordSaved ? "danger" : "success"}
                onClick={() => {
                  if (isWordSaved) {
                    removeFromVocab(selectedWord);
                  } else {
                    addToVocab(selectedWord, wordMeaning, '본문 독해 중 직접 터치하여 저장됨');
                  }
                }}
                style={{ flex: 1, minHeight: '64px', fontSize: '20px' }}
              >
                {isWordSaved ? "❌ 단어장 제거" : "⭐ 단어장 저장"}
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
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
