import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

export default function VocabularyPage({ onGoBackToStructure }) {
  const { 
    fontSize, 
    speakText, 
    myVocab, 
    setMyVocab,
    removeFromVocab, 
    dictMock, 
    parseDynamicWordMeaning, 
    theme,
    setCurrentReadingStep,
    activePassage
  } = useApp();

  // 📒 핵심 5대 보증 어휘 데이터 족보
  const defaultWords = useMemo(() => [
    {
      word: "companion",
      partOfSpeech: "Noun / 명사",
      pronunciation: "/kəmˈpænjən/",
      meaning: "동반자, 반려자, 친구",
      synonyms: ["partner", "associate", "friend"],
      antonyms: ["enemy", "stranger"],
      idioms: [
        { eng: "A loyal companion", kor: "충실한 동반자" },
        { eng: "Constant companion", kor: "늘 붙어 다니는 친구" }
      ],
      exampleEng: "A dog is often described as man's best companion.",
      exampleKor: "개는 종종 인간의 가장 좋은 동반자로 묘사됩니다."
    },
    {
      word: "essential",
      partOfSpeech: "Adjective / 형용사",
      pronunciation: "/ɪˈsenʃl/",
      meaning: "필수적인, 극히 중요한, 본질적인",
      synonyms: ["crucial", "vital", "necessary", "indispensable"],
      antonyms: ["unnecessary", "optional", "trivial", "secondary"],
      idioms: [
        { eng: "Essential element", kor: "본질적인 요소" },
        { eng: "Play an essential role", kor: "필수적인 역할을 하다" }
      ],
      exampleEng: "Water is essential for all living things.",
      exampleKor: "물은 모든 생명체에게 필수적입니다."
    },
    {
      word: "comprehend",
      partOfSpeech: "Verb / 동사",
      pronunciation: "/ˌkɒmprɪˈhend/",
      meaning: "충분히 이해하다, 파악하다, 깨닫다",
      synonyms: ["understand", "grasp", "apprehend", "realize"],
      antonyms: ["misunderstand", "misinterpret", "ignore"],
      idioms: [
        { eng: "Hard to comprehend", kor: "이해하기 어려운" },
        { eng: "Comprehend the situation", kor: "상황을 충분히 이해하다" }
      ],
      exampleEng: "She could not comprehend the meaning of his behavior.",
      exampleKor: "그녀는 그의 행동의 의미를 충분히 이해할 수 없었습니다."
    },
    {
      word: "accessibility",
      partOfSpeech: "Noun / 명사",
      pronunciation: "/əkˌsesəˈbɪləti/",
      meaning: "접근성, 이용 가능성, 이용하기 쉬움",
      synonyms: ["reachability", "availability", "approachability"],
      antonyms: ["inaccessibility", "unavailability"],
      idioms: [
        { eng: "Web accessibility", kor: "웹 접근성" },
        { eng: "Improve accessibility", kor: "접근성을 개선하다" }
      ],
      exampleEng: "The building has good accessibility for disabled people.",
      exampleKor: "그 건물은 장애인들이 이용하기에 좋은 접근성을 가지고 있습니다."
    },
    {
      word: "focus",
      partOfSpeech: "Verb & Noun / 동사 및 명사",
      pronunciation: "/ˈfəʊkəs/",
      meaning: "집중하다, 초점, 집중",
      synonyms: ["concentrate", "center", "highlight", "core"],
      antonyms: ["distract", "scatter", "ignore"],
      idioms: [
        { eng: "Focus on learning", kor: "학습에 집중하다" },
        { eng: "Out of focus", kor: "초점이 맞지 않는" }
      ],
      exampleEng: "You need to focus on your study.",
      exampleKor: "당신은 공부에 집중해야 합니다."
    }
  ], []);

  // --- 상태 변수 ---
  const [selectedWord, setSelectedWord] = useState("companion");
  const [activeMenuWord, setActiveMenuWord] = useState(null); // 'more_vert' 삭제 팝업 토글용
  const [showAchievement, setShowAchievement] = useState(false); // 🏆 일일 학습 성과 보고서 오버레이 모달 상태

  // --- 삭제 핸들러 ---
  const handleDeleteVocab = (e, wordToDelete) => {
    e.stopPropagation();
    removeFromVocab(wordToDelete);
    setActiveMenuWord(null);
    if (selectedWord.toLowerCase() === wordToDelete.toLowerCase()) {
      setSelectedWord("companion");
    }
  };

  // --- 단어장 파일 내보내기 (Export JSON) ---
  const handleExportVocab = () => {
    if (myVocab.length === 0) {
      alert("내보낼 단어가 없습니다. 먼저 단어를 저장해 주세요!");
      return;
    }
    
    try {
      const dataStr = JSON.stringify(myVocab, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `lingostar_vocab_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      speakText("Vocabulary backup exported successfully.");
      alert("⭐ 단어장이 성공적으로 내보내졌습니다. 다운로드된 파일을 안전하게 보관하세요!");
    } catch (error) {
      console.error("Export vocab failed:", error);
      alert("단어장 내보내기에 실패했습니다.");
    }
  };

  // --- 단어장 파일 가져오기 (Import JSON) ---
  const handleImportVocab = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        
        // 데이터 형식 정합성 검증
        if (!Array.isArray(importedData)) {
          throw new Error("올바른 백업 파일 형식이 아닙니다. (배열 형태가 아님)");
        }

        const validWords = importedData.filter(item => item && typeof item === 'object' && item.word);
        if (validWords.length === 0) {
          throw new Error("가져올 유효한 단어가 없습니다.");
        }

        // 기존 단어들과 중복 제거하면서 병합
        setMyVocab(prev => {
          const updated = [...prev];
          let addedCount = 0;
          
          validWords.forEach(item => {
            if (!updated.some(existing => existing.word.toLowerCase() === item.word.toLowerCase())) {
              updated.push({
                word: item.word.trim(),
                meaning: item.meaning ? item.meaning.trim() : '뜻 정보 없음',
                synonyms: item.synonyms || '',
                antonyms: item.antonyms || '',
                similarIdioms: item.similarIdioms || '',
                sentence: item.sentence || '가져온 단어 백업',
                addedAt: item.addedAt || new Date().toISOString()
              });
              addedCount++;
            }
          });

          speakText(`${addedCount} new words imported successfully.`);
          alert(`⭐ 단어장 복원 완료!\n새로운 단어 ${addedCount}개가 단어장에 추가되었습니다.`);
          return updated;
        });

      } catch (error) {
        console.error("Import vocab failed:", error);
        alert(`단어장 가져오기 실패: ${error.message}`);
      } finally {
        e.target.value = ''; // 파일 인풋 값 초기화
      }
    };
    reader.readAsText(file);
  };

  // --- 실시간 뜻 보정 헬퍼 ---
  const getCorrectedMeaning = (item) => {
    const cleanWord = item.word.toLowerCase().trim();
    const cleanMeaning = item.meaning ? item.meaning.trim() : '';
    
    if (!cleanMeaning || 
        cleanMeaning.toLowerCase() === cleanWord || 
        cleanMeaning.includes('(학습용 추천 단어)') || 
        cleanMeaning.includes('뜻을 알 수 없음') || 
        cleanMeaning === item.word) {
      const entry = dictMock[cleanWord];
      return entry ? (typeof entry === 'object' ? entry.meaning : entry) : parseDynamicWordMeaning(item.word);
    }
    return item.meaning;
  };

  // --- 선택된 단어 상세 정보 족보 동적 연합기 ---
  const activeWordDetail = useMemo(() => {
    const lower = selectedWord.toLowerCase().trim();
    const foundDefault = defaultWords.find(w => w.word.toLowerCase() === lower);
    if (foundDefault) return foundDefault;

    const foundEntry = dictMock[lower];
    if (foundEntry && typeof foundEntry === 'object') {
      const synonymsArray = foundEntry.synonyms ? foundEntry.synonyms.split(',').map(s => s.trim()) : [];
      const antonymsArray = foundEntry.antonyms ? foundEntry.antonyms.split(',').map(a => a.trim()) : [];
      const idiomsArray = foundEntry.similarIdioms ? foundEntry.similarIdioms.split(',').map(i => ({ eng: i.trim(), kor: "동의 숙어" })) : [];

      return {
        word: selectedWord,
        partOfSpeech: selectedWord.includes(' ') ? "Idiom / 숙어" : "Vocabulary / 단어",
        pronunciation: `/${lower}/`,
        meaning: foundEntry.meaning,
        synonyms: synonymsArray.length > 0 ? synonymsArray : ["N/A"],
        antonyms: antonymsArray.length > 0 ? antonymsArray : ["N/A"],
        idioms: idiomsArray.length > 0 ? idiomsArray : [{ eng: lower, kor: foundEntry.meaning }],
        exampleEng: `Learning "${selectedWord}" with LingoStar is highly efficient.`,
        exampleKor: `LingoStar와 함께 "${foundEntry.meaning}"을(를) 학습하는 것은 아주 효과적입니다.`
      };
    }

    // Fallback
    const parsedMeaning = parseDynamicWordMeaning(selectedWord);
    return {
      word: selectedWord,
      partOfSpeech: selectedWord.includes(' ') ? "Idiom / 숙어" : "Vocabulary / 단어",
      pronunciation: `/${lower}/`,
      meaning: parsedMeaning,
      synonyms: ["N/A"],
      antonyms: ["N/A"],
      idioms: [{ eng: lower, kor: parsedMeaning }],
      exampleEng: `We are exploring the context for "${selectedWord}".`,
      exampleKor: `우리는 "${parsedMeaning}"에 대한 맥락을 관찰하고 있습니다.`
    };
  }, [selectedWord, defaultWords, dictMock, parseDynamicWordMeaning]);

  // --- 테마 기반 동적 파스텔 톤 매핑 ---
  const dynamicColorSchema = useMemo(() => {
    if (theme === 'dark') {
      return {
        bg: '#1a1a1a',
        cardBg: '#2a2a2a',
        primary: '#ffd54f',
        text: '#ffffff',
        border: 'var(--color-border)',
        synonymBg: '#1e3822',
        synonymText: '#88d982',
        antonymBg: '#3e1e1e',
        antonymText: '#ff8a80',
        idiomBg: '#1f2a3a',
        exampleBg: '#2a201b'
      };
    }
    if (theme === 'yellow') {
      return {
        bg: '#fffde7',
        cardBg: '#ffffff',
        primary: '#005dac',
        text: '#2c160e',
        border: '#5d4037',
        synonymBg: '#fff1ed',
        synonymText: '#196b22',
        antonymBg: '#fff1ed',
        antonymText: '#e53935',
        idiomBg: '#ffe9e3',
        exampleBg: '#ffe2da'
      };
    }
    // Default & HighContrast
    return {
      bg: 'var(--color-bg)',
      cardBg: '#ffffff',
      primary: '#005dac',
      text: 'var(--color-text)',
      border: 'var(--color-border)',
      synonymBg: '#f0fcf4',
      synonymText: '#2e7d32',
      antonymBg: '#fff5f5',
      antonymText: '#c62828',
      idiomBg: '#f1f3f5',
      exampleBg: '#f8f9fa'
    };
  }, [theme]);

  return (
    <div style={{
      backgroundColor: dynamicColorSchema.bg,
      color: dynamicColorSchema.text,
      fontFamily: "'Outfit', 'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      gap: '48px',
      padding: '16px',
      paddingBottom: '140px',
      minHeight: '100%',
      overflowY: 'auto'
    }}>
      {/* 🚀 1. Main Word Focus 섹션 */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#005dac' }}>star</span>
          <h2 style={{ fontSize: '32px', fontWeight: '900', color: dynamicColorSchema.text, margin: 0 }}>
            Main Word Focus
          </h2>
        </div>

        {/* 메가 카드 프레임 (3D 네오브루탈리즘 그림자) */}
        <div style={{
          backgroundColor: dynamicColorSchema.cardBg,
          border: `3px solid ${dynamicColorSchema.border}`,
          borderRadius: '24px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          boxShadow: `8px 8px 0px 0px ${dynamicColorSchema.border === 'var(--color-border)' ? 'rgba(0,0,0,0.15)' : dynamicColorSchema.border}`,
          transition: 'all 0.15s ease'
        }}>
          {/* 단어 및 발음기호 + 거대 3D 스피커 플로팅 단추 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{
                fontSize: `${fontSize * 1.3}px`,
                fontWeight: '900',
                color: '#005dac',
                letterSpacing: '0.05em',
                wordBreak: 'break-all'
              }}>
                {activeWordDetail.word}
              </span>
              <p style={{
                fontSize: '24px',
                fontWeight: '900',
                color: '#5f6365',
                marginTop: '12px',
                margin: '12px 0 0 0'
              }}>
                {activeWordDetail.pronunciation}
              </p>
            </div>
            <button
              onClick={() => speakText(activeWordDetail.word)}
              className="material-symbols-outlined active-scale"
              style={{
                fontSize: '56px',
                backgroundColor: '#005dac',
                color: '#ffffff',
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0px 4px 12px rgba(0, 93, 172, 0.3)',
                transition: 'transform 0.1s'
              }}
              aria-label="Listen to pronunciation"
            >
              volume_up
            </button>
          </div>

          {/* 품사 및 뜻 */}
          <div style={{
            borderTop: `2px solid ${theme === 'dark' ? '#444' : '#e0e3e5'}`,
            paddingTop: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div>
              <span style={{
                display: 'inline-block',
                padding: '8px 16px',
                backgroundColor: '#dde0e2',
                borderRadius: '9999px',
                fontSize: '20px',
                fontWeight: '900',
                color: '#5f6365'
              }}>
                {activeWordDetail.partOfSpeech}
              </span>
            </div>
            <p style={{
              fontSize: `${fontSize * 0.95}px`,
              fontWeight: '700',
              color: dynamicColorSchema.text,
              margin: 0
            }}>
              {activeWordDetail.meaning}
            </p>
          </div>

          {/* 동의어 (Synonyms) & 반의어 (Antonyms) grid 쪼개기 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {/* Synonyms 박스 */}
            <div style={{
              backgroundColor: dynamicColorSchema.synonymBg,
              padding: '24px',
              borderRadius: '16px',
              border: `2px solid ${theme === 'dark' ? '#444' : '#c1c6d4'}`
            }}>
              <p style={{
                fontSize: '24px',
                fontWeight: '900',
                color: dynamicColorSchema.synonymText,
                margin: '0 0 12px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>add_circle</span>
                Synonyms
              </p>
              <p style={{ fontSize: '24px', fontWeight: '500', color: dynamicColorSchema.text, margin: 0 }}>
                {activeWordDetail.synonyms.join(', ')}
              </p>
            </div>

            {/* Antonyms 박스 */}
            <div style={{
              backgroundColor: dynamicColorSchema.synonymBg, // low-container 색 동일 활용
              padding: '24px',
              borderRadius: '16px',
              border: `2px solid ${theme === 'dark' ? '#444' : '#c1c6d4'}`
            }}>
              <p style={{
                fontSize: '24px',
                fontWeight: '900',
                color: dynamicColorSchema.antonymText,
                margin: '0 0 12px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>remove_circle</span>
                Antonyms
              </p>
              <p style={{ fontSize: '24px', fontWeight: '500', color: dynamicColorSchema.text, margin: 0 }}>
                {activeWordDetail.antonyms.join(', ')}
              </p>
            </div>
          </div>

          {/* 관련 이디엄 숙어 박스 */}
          <div style={{
            backgroundColor: dynamicColorSchema.idiomBg,
            padding: '24px',
            borderRadius: '16px',
            border: `2px solid ${dynamicColorSchema.border}`
          }}>
            <p style={{
              fontSize: '24px',
              fontWeight: '900',
              color: '#005dac',
              margin: '0 0 12px 0'
            }}>
              Related Idioms / Phrases:
            </p>
            <ul style={{
              fontSize: '22px',
              fontWeight: '500',
              color: dynamicColorSchema.text,
              listStyleType: 'disc',
              listStylePosition: 'inside',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {activeWordDetail.idioms.map((idm, idx) => (
                <li key={idx}>
                  <span style={{ fontWeight: '900', fontStyle: 'italic' }}>{idm.eng}:</span> {idm.kor}
                </li>
              ))}
            </ul>
          </div>

          {/* 예문 박스 */}
          <div style={{
            backgroundColor: dynamicColorSchema.exampleBg,
            padding: '24px',
            borderRadius: '16px',
            border: `2px solid ${dynamicColorSchema.border}`
          }}>
            <p style={{
              fontSize: '24px',
              fontWeight: '900',
              color: '#005dac',
              margin: '0 0 16px 0'
            }}>
              Example Sentence:
            </p>
            <p style={{
              fontSize: `${fontSize * 0.85}px`,
              fontWeight: '900',
              fontStyle: 'italic',
              color: dynamicColorSchema.text,
              lineHeight: '1.5',
              margin: 0
            }}>
              "{activeWordDetail.exampleEng}"
            </p>
            <p style={{
              fontSize: '22px',
              fontWeight: '500',
              color: dynamicColorSchema.text,
              opacity: 0.8,
              marginTop: '12px',
              margin: '12px 0 0 0'
            }}>
              "{activeWordDetail.exampleKor}"
            </p>
          </div>
        </div>
      </section>

      {/* 🚀 2. My Vocabulary List 섹션 */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#005dac' }}>list_alt</span>
          <h2 style={{ fontSize: '32px', fontWeight: '900', color: dynamicColorSchema.text, margin: 0 }}>
            My Vocabulary List
          </h2>
        </div>

        {/* 인포 설명 팁 배너 */}
        <div style={{
          backgroundColor: theme === 'dark' ? '#252525' : '#ffffff',
          border: `2px solid ${dynamicColorSchema.border}`,
          borderRadius: '16px',
          padding: '20px 24px',
          fontStyle: 'italic',
          fontSize: '22px',
          fontWeight: '500',
          color: '#5f6365',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0px 2px 6px rgba(0,0,0,0.02)'
        }}>
          <span className="material-symbols-outlined" style={{ color: '#005dac', fontSize: '28px' }}>info</span>
          Touch unknown words in the text to add them here!
        </div>

        {/* 📥 로컬 무설치 백업 및 복원 패널 */}
        <div style={{
          backgroundColor: theme === 'dark' ? '#252525' : '#fffde7', // 노랑 독서용/밝은 테마에 맞춤형 pastel HSL
          border: `3px solid ${dynamicColorSchema.border}`,
          borderRadius: '24px',
          padding: '24px',
          boxShadow: `4px 4px 0px 0px ${dynamicColorSchema.border === 'var(--color-border)' ? 'rgba(0,0,0,0.1)' : dynamicColorSchema.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginTop: '8px'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '900',
            color: '#005dac',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span className="material-symbols-outlined">save</span>
            단어장 로컬 백업 & 복원 (클라우드 미사용)
          </h3>
          <p style={{ fontSize: '18px', opacity: 0.8, margin: 0, fontWeight: '700', lineHeight: '1.4' }}>
            브라우저 캐시 삭제 시 데이터가 날아가는 것을 방지하기 위해 단어장을 파일로 저장하고 불러올 수 있습니다.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {/* 백업 파일 다운로드 */}
            <button
              onClick={handleExportVocab}
              className="active-scale"
              style={{
                flex: 1,
                minHeight: '64px',
                backgroundColor: '#a3f69c',
                color: '#005312',
                border: `3.5px solid ${dynamicColorSchema.border}`,
                borderRadius: '16px',
                fontSize: '20px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: `3px 3px 0px 0px ${dynamicColorSchema.border === 'var(--color-border)' ? 'rgba(0,0,0,0.15)' : dynamicColorSchema.border}`
              }}
            >
              <span className="material-symbols-outlined">download</span>
              단어장 파일 내보내기 (다운로드)
            </button>

            {/* 백업 파일 불러오기 */}
            <button
              onClick={() => document.getElementById('vocab-import-input').click()}
              className="active-scale"
              style={{
                flex: 1,
                minHeight: '64px',
                backgroundColor: '#a5c8ff',
                color: '#002f6c',
                border: `3.5px solid ${dynamicColorSchema.border}`,
                borderRadius: '16px',
                fontSize: '20px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: `3px 3px 0px 0px ${dynamicColorSchema.border === 'var(--color-border)' ? 'rgba(0,0,0,0.15)' : dynamicColorSchema.border}`
              }}
            >
              <span className="material-symbols-outlined">upload</span>
              백업 파일 불러오기 (가져오기)
            </button>
            <input
              type="file"
              id="vocab-import-input"
              accept=".json"
              onChange={handleImportVocab}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* 저장된 단어 목록 그리드 수평 3D 목록 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          {myVocab.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 16px',
              border: `3px dashed ${dynamicColorSchema.border}`,
              borderRadius: '24px',
              backgroundColor: 'transparent'
            }}>
              <p style={{ fontSize: '24px', fontWeight: '900', opacity: 0.6 }}>
                아직 지문에서 저장한 단어가 없습니다.<br />
                [Focus] 탭에서 본문의 단어/숙어를 터치하여 실시간 저장해보세요!
              </p>
            </div>
          ) : (
            myVocab.map((item, idx) => {
              const isSelected = selectedWord.toLowerCase() === item.word.toLowerCase();
              const isMenuOpen = activeMenuWord === item.word;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedWord(item.word)}
                  style={{
                    border: `3px solid ${dynamicColorSchema.border}`,
                    borderRadius: '20px',
                    padding: '16px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '96px',
                    backgroundColor: isSelected ? 'var(--color-secondary)' : (theme === 'dark' ? '#2a2a2a' : '#ffffff'),
                    cursor: 'pointer',
                    boxShadow: isSelected ? 'none' : `4px 4px 0px 0px ${dynamicColorSchema.border === 'var(--color-border)' ? 'rgba(0,0,0,0.1)' : dynamicColorSchema.border}`,
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* 볼륨 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(item.word);
                      }}
                      className="material-symbols-outlined active-scale"
                      style={{
                        fontSize: '32px',
                        color: '#005dac',
                        padding: '12px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 93, 172, 0.08)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.1s'
                      }}
                      aria-label="Listen"
                    >
                      volume_up
                    </button>

                    {/* 단어 텍스트 및 뜻 */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '28px', fontWeight: '900', color: '#005dac' }}>
                        {item.word}
                      </span>
                      <span style={{ fontSize: '20px', fontWeight: '700', color: dynamicColorSchema.text, opacity: 0.8 }}>
                        {getCorrectedMeaning(item)}
                      </span>
                    </div>
                  </div>

                  {/* 3점 더보기 메뉴 버튼 */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuWord(isMenuOpen ? null : item.word);
                      }}
                      className="material-symbols-outlined"
                      style={{
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#5f6365',
                        fontSize: '36px',
                        cursor: 'pointer',
                        padding: '8px'
                      }}
                    >
                      more_vert
                    </button>

                    {/* 3D Neobrutalism 삭제 플로팅 툴팁 메뉴 */}
                    {isMenuOpen && (
                      <div style={{
                        position: 'absolute',
                        right: '0',
                        top: '48px',
                        backgroundColor: '#ffffff',
                        border: `3px solid ${dynamicColorSchema.border}`,
                        borderRadius: '12px',
                        boxShadow: `4px 4px 0px 0px ${dynamicColorSchema.border === 'var(--color-border)' ? 'rgba(0,0,0,0.15)' : dynamicColorSchema.border}`,
                        zIndex: 10,
                        width: '140px',
                        overflow: 'hidden'
                      }}>
                        <button
                          onClick={(e) => handleDeleteVocab(e, item.word)}
                          style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '18px',
                            fontWeight: '900',
                            color: '#e53935',
                            backgroundColor: '#fff5f5',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                          삭제하기
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 🚀 3. 하단 액션 버튼 그룹 (100% 싱크) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        paddingTop: '36px',
        paddingBottom: '24px'
      }}>
        {/* 이전 탭으로 이동 */}
        <button
          onClick={() => {
            setCurrentReadingStep(7); // 7단계 정밀문장분석 탭으로 연동!
            if (typeof onGoBackToStructure === 'function') {
              onGoBackToStructure(); // 'Vocab' 탭에서 'Structure' 탭으로 스위칭!
            }
          }}
          className="active-scale"
          style={{
            height: '80px',
            backgroundColor: dynamicColorSchema.cardBg,
            border: `3px solid ${dynamicColorSchema.border}`,
            borderRadius: '16px',
            fontSize: '24px',
            fontWeight: '900',
            color: dynamicColorSchema.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            boxShadow: `4px 4px 0px 0px ${dynamicColorSchema.border === 'var(--color-border)' ? 'rgba(0,0,0,0.1)' : dynamicColorSchema.border}`,
            transition: 'all 0.15s ease'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>navigate_before</span>
          Previous
        </button>

        {/* 홈으로 완료 복귀 ➔ [🏆 동기부여 성취 보고서 대시보드 트리거!] */}
        <button
          onClick={() => {
            speakText("Congratulations! Daily learning report generated successfully.");
            setShowAchievement(true);
          }}
          className="active-scale"
          style={{
            height: '80px',
            backgroundColor: '#005dac',
            color: '#ffffff',
            border: '4px solid #1976d2',
            borderRadius: '16px',
            fontSize: '24px',
            fontWeight: '900',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            boxShadow: '0px 6px 16px rgba(0, 93, 172, 0.4)',
            transition: 'all 0.15s ease'
          }}
        >
          Finish & Home
          <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>check_circle</span>
        </button>
      </div>

      {/* 🏆 [100% 동일 구현] GREAT JOB! 일일 학습 성과 보고서 풀스크린 모달 */}
      {showAchievement && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: theme === 'dark' ? '#1a1a1a' : (theme === 'yellow' ? '#fffde7' : '#faf9f6'),
          color: theme === 'dark' ? '#ffffff' : '#2c160e',
          zIndex: 2000,
          padding: '40px 24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
          fontFamily: "'Outfit', 'Inter', sans-serif"
        }}>
          {/* 골드 트로피 3D 원형 배지 */}
          <div style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            backgroundColor: theme === 'dark' ? '#2e7d32' : '#ccff90', // 연초록 배지
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `3px solid ${theme === 'dark' ? 'white' : '#5d4037'}`,
            boxShadow: `4px 4px 0px 0px ${theme === 'dark' ? 'white' : '#5d4037'}`,
            marginTop: '20px',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '72px', animation: 'bounce 2s infinite', display: 'inline-block' }}>🏆</span>
          </div>

          {/* GREAT JOB! 텍스트 및 설명 */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '900',
              color: '#005dac',
              margin: 0,
              letterSpacing: '0.05em'
            }}>
              GREAT JOB!
            </h1>
            <p style={{
              fontSize: '22px',
              fontWeight: '700',
              color: theme === 'dark' ? '#ffffff' : '#2c160e',
              lineHeight: '1.6',
              maxWidth: '500px',
              margin: 0
            }}>
              You've reached your daily goal! Let's look at what you achieved today.
            </p>
          </div>

          {/* 3대 성취 3D Neobrutalism 카드 세트 */}
          <div style={{
            width: '100%',
            maxWidth: '500px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* 카드 1: SENTENCES READ (분홍색) */}
            <div style={{
              backgroundColor: theme === 'dark' ? '#2c2c2c' : '#ffe9e3',
              border: `3px solid ${dynamicColorSchema.border}`,
              borderRadius: '24px',
              padding: '24px',
              boxShadow: `6px 6px 0px 0px ${dynamicColorSchema.border === 'var(--color-border)' ? 'rgba(0,0,0,0.15)' : dynamicColorSchema.border}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#005dac' }}>menu_book</span>
              <span style={{ fontSize: '18px', fontWeight: '900', color: '#5f6365', letterSpacing: '0.05em' }}>SENTENCES READ</span>
              <span style={{ fontSize: '48px', fontWeight: '900', color: theme === 'dark' ? '#ffffff' : '#2c160e', margin: 0 }}>
                {activePassage?.sentences?.length || 6}
              </span>
            </div>

            {/* 카드 2: NEW WORDS (하늘색) */}
            <div style={{
              backgroundColor: theme === 'dark' ? '#2c2c2c' : '#d4e3ff',
              border: `3px solid ${dynamicColorSchema.border}`,
              borderRadius: '24px',
              padding: '24px',
              boxShadow: `6px 6px 0px 0px ${dynamicColorSchema.border === 'var(--color-border)' ? 'rgba(0,0,0,0.15)' : dynamicColorSchema.border}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#005dac' }}>record_voice_over</span>
              <span style={{ fontSize: '18px', fontWeight: '900', color: '#5f6365', letterSpacing: '0.05em' }}>NEW WORDS</span>
              <span style={{ fontSize: '48px', fontWeight: '900', color: theme === 'dark' ? '#ffffff' : '#2c160e', margin: 0 }}>
                {myVocab.length || 12}
              </span>
            </div>

            {/* 카드 3: QUIZ ACCURACY (초록색) */}
            <div style={{
              backgroundColor: theme === 'dark' ? '#2c2c2c' : '#b9f6ca',
              border: `3px solid ${dynamicColorSchema.border}`,
              borderRadius: '24px',
              padding: '24px',
              boxShadow: `6px 6px 0px 0px ${dynamicColorSchema.border === 'var(--color-border)' ? 'rgba(0,0,0,0.15)' : dynamicColorSchema.border}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#196b22' }}>check_circle</span>
              <span style={{ fontSize: '18px', fontWeight: '900', color: '#196b22', letterSpacing: '0.05em' }}>QUIZ ACCURACY</span>
              <span style={{ fontSize: '48px', fontWeight: '900', color: theme === 'dark' ? '#ffffff' : '#2c160e', margin: 0 }}>100%</span>
            </div>
          </div>

          {/* Words Mastered Today 단어 캡슐 목록 */}
          <div style={{
            width: '100%',
            maxWidth: '500px',
            marginTop: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: '#005dac', fontSize: '28px' }}>star</span>
              <h3 style={{ fontSize: '26px', fontWeight: '900', color: theme === 'dark' ? '#ffffff' : '#2c160e', margin: 0 }}>
                Words Mastered Today
              </h3>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }}>
              {(myVocab.length > 0 ? myVocab.slice(0, 6) : [
                { word: 'companion' },
                { word: 'support' },
                { word: 'difficult' },
                { word: 'journey' },
                { word: 'adventure' },
                { word: 'learning' }
              ]).map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: theme === 'dark' ? '#333333' : '#e0e3e5',
                    border: `2px solid ${dynamicColorSchema.border}`,
                    borderRadius: '9999px',
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    boxShadow: `2px 2px 0px 0px ${dynamicColorSchema.border === 'var(--color-border)' ? 'rgba(0,0,0,0.1)' : dynamicColorSchema.border}`
                  }}
                >
                  <span style={{
                    fontSize: '20px',
                    fontWeight: '900',
                    color: theme === 'dark' ? '#ffffff' : '#2c160e',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.word}
                  </span>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#196b22', fontWeight: 'bold' }}>check_circle</span>
                </div>
              ))}
            </div>
          </div>

          {/* 하단 3D 액션 버튼 그룹 */}
          <div style={{
            width: '100%',
            maxWidth: '500px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginTop: '24px',
            paddingBottom: '60px'
          }}>
            {/* REVIEW AGAIN */}
            <button
              onClick={() => {
                speakText("Reviewing today's lessons again.");
                setShowAchievement(false);
              }}
              className="active-scale"
              style={{
                height: '64px',
                backgroundColor: theme === 'dark' ? '#2a2a2a' : '#ffe9e3',
                border: `3px solid ${dynamicColorSchema.border}`,
                borderRadius: '9999px',
                fontSize: '22px',
                fontWeight: '900',
                color: theme === 'dark' ? '#ffffff' : '#2c160e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: `4px 4px 0px 0px ${dynamicColorSchema.border === 'var(--color-border)' ? 'rgba(0,0,0,0.1)' : dynamicColorSchema.border}`,
                transition: 'all 0.15s ease'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px', fontWeight: '900' }}>sync</span>
              REVIEW AGAIN
            </button>

            {/* NEXT LESSON */}
            <button
              onClick={() => {
                speakText("Moving forward to the next lesson! Great job today.");
                window.location.reload();
              }}
              className="active-scale"
              style={{
                height: '64px',
                backgroundColor: '#005dac',
                color: '#ffffff',
                border: '4px solid #1976d2',
                borderRadius: '9999px',
                fontSize: '22px',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0px 6px 16px rgba(0, 93, 172, 0.4)',
                transition: 'all 0.15s ease'
              }}
            >
              NEXT LESSON
              <span className="material-symbols-outlined" style={{ fontSize: '24px', fontWeight: '900' }}>arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* 미크로 인터랙션용 스타일 */}
      <style>{`
        .active-scale:active {
          transform: scale(0.95) !important;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
