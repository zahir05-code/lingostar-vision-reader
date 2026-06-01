import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { BigButton } from "../components/BigButton";

const TAG_DISPLAY_MAP = {
  "S+V": "주어 + 서술동사 뼈대",
  "O/C": "목적어 / 보어",
  "to-Inf": "to 부정사 수식어구",
  "CONJ": "연결 접속사구"
};

// 🎨 초정밀 단어별 [접/주/동/수] 문장 성분 약어 배지 매퍼
const getDetailedWordTags = (word, cleanWord) => {
  const w = cleanWord.toLowerCase();
  
  // 접속사 / 연결어 (접)
  if (['as', 'that', 'unless', 'because', 'although', 'when', 'if', 'since', 'while', 'and', 'but', 'or', 'so'].includes(w)) {
    return { label: '접', color: '#ab47bc', name: '접속사/연결어' };
  }
  // 주어 성분 (주)
  if (['talks', 'message', 'threat', 'civilisation', 'iran', 'deal', 'war', 'ceasefire', 'april', 'trump', 'president', 'donald', 'sunflowers', 'painting', 'artist', 'learners', 'magnification', 'customization', 'technology', 'we', 'studying', 'animals', 'humans', 'robots'].includes(w)) {
    return { label: '주', color: '#1e88e5', name: '주어' };
  }
  // 동사 성분 (동)
  if (['echoed', 'would', 'die', 'agreed', 'end', 'was', 'announced', 'stalled', 'have', 'has', 'warned', 'stalls', 'is', 'ticking', 'need', 'needs', 'shows', 'show', 'used', 'use', 'studies', 'study', 'helps', 'help', 'painted', 'becomes', 'become', 'looking', 'look'].includes(w)) {
    return { label: '동', color: '#43a047', name: '서술동사' };
  }
  // to 부정사 및 전치사구 도입부 (수식어구 / 수)
  if (['to', 'in', 'before', 'shortly', 'early', 'of', 'for', 'with', 'about', 'by', 'from', 'at', 'into', 'through', 'on'].includes(w)) {
    return { label: '수', color: '#f57c00', name: '수식어구' };
  }
  
  return null;
};

// 🎨 상세 구문 성분 및 다이어그램 분석 유틸
const generateDetailedGrammarGuide = (text) => {
  if (!text) return null;
  const clean = text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim();
  const words = clean.split(/\s+/);
  
  // talks + have stalled 분석
  if (words.includes('talks') && (words.includes('stalled') || words.includes('have'))) {
    return {
      steps: [
        { num: '① talks (주어)', desc: '협상들이라는 핵심 주체 성분(주어)입니다.' },
        { num: '② have stalled (서술동사)', desc: 'have stalled(착수 후 교착상태에 빠졌다)는 동작/상태를 나타내는 서술어 성분입니다.' }
      ],
      diagram: "talks (주어) + have stalled (서술동사) [완전 1형식 구조]",
      bone: "talks + have stalled (협상이 결렬/중단되었다)",
      flesh: "수직 끊어읽기 구획을 기준으로 문장 뼈대를 확인해 보세요."
    };
  } else if (words.includes('threat') || words.includes('civilisation')) {
    return {
      steps: [
        { num: "① trump's message (주어)", desc: "트럼프의 메시지라는 핵심 주체 성분(주어)입니다." },
        { num: "② echoed (서술동사)", desc: "echoed(반영했다, 메아리쳤다)는 서술어 성분입니다." },
        { num: "③ his threat (목적어)", desc: "his threat(그의 위협)은 서술어의 직접적인 대상(목적어)입니다." },
        { num: "④ that a 'whole civilisation' would die (동격 접속사절)", desc: "that절 이하가 threat의 구체적인 내용을 동격으로 채워주는 수식절입니다." }
      ],
      diagram: "trump's message (주) + echoed (동) + his threat (목) + [that a 'whole civilisation' would die] (동격절)",
      bone: "trump's message echoed his threat (트럼프의 메시지는 그의 위협을 메아리쳤다)",
      flesh: "어떤 위협? ➔ that a 'whole civilisation' would die (전체 문명이 멸망하리라는 위협)"
    };
  } else {
    // 기본 지능형 분석 생성기
    const subjects = words.filter(w => ['president', 'trump', 'donald', 'sunflowers', 'painting', 'artist', 'learners', 'magnification', 'customization', 'technology', 'we', 'studying', 'animals', 'humans', 'robots'].includes(w));
    const verbs = words.filter(w => ['has', 'warned', 'need', 'needs', 'shows', 'show', 'used', 'use', 'studies', 'study', 'helps', 'help', 'painted', 'is', 'are', 'was', 'were', 'am', 'becomes', 'become', 'looking', 'look'].includes(w));
    
    const sub = subjects[0] || "핵심 주어구";
    const vb = verbs[0] || "서술동사구";
    
    const steps = [
      {
        num: `① ${sub} (주어)`,
        desc: `문장의 주체가 되는 핵심 명사 성분(주어)입니다.`
      },
      {
        num: `② ${vb} (동사)`,
        desc: `주어의 행동이나 상태를 나타내는 핵심 동사 성분입니다.`
      }
    ];
    
    if (words.includes('to')) {
      steps.push({
        num: "③ to 부정사 수식어구",
        desc: "to 부정사 구문이 수식 및 부사적 용법으로 작용해 문장을 확장합니다."
      });
    }

    return {
      steps,
      diagram: `${sub} (주어) + ${vb} (동사) + [수식/목적 성분]`,
      bone: `${sub} + ${vb} (기본 뼈대 구조)`,
      flesh: "수직 슬래시(/) 끊어읽기 구획을 바탕으로 문장 구조를 한눈에 관통해 보세요!"
    };
  }
};

export default function ClassFollowModePage({ onGoToVocab }) {
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
    fetchLiveWordDefinition
  } = useApp(); // 전역 AppContext 연동
  
  // 모달 팝업 상태
  const [selectedWord, setSelectedWord] = useState(null);
  const [meaning, setMeaning] = useState('');
  
  // 터치/클릭 다중 선택 모드 활성화 여부
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  // 다중 선택된 단어들의 인덱스 배열
  const [selectedIndices, setSelectedIndices] = useState([]);
  
  // 드래그 선택 영역 감지를 위한 상태
  const [draggedText, setDraggedText] = useState('');
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const sentenceRef = useRef(null); // 스크린 리더 포커스 락인용 ref

  // currentSentenceIndex 변경 시 문장 영역에 초점을 맞추어 스크린 리더 음성 낭독 정합성 보장 (Focus Lock-in)
  useEffect(() => {
    if (sentenceRef.current) {
      sentenceRef.current.focus();
    }
  }, [currentSentenceIndex]);

  if (!activePassage || !activePassage.sentences || activePassage.sentences.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p style={{ fontSize: '32px', fontWeight: 'bold' }}>지문이 존재하지 않습니다. 메인에서 입력해 주세요.</p>
      </div>
    );
  }

  // 3단계 parseFullPassage 데이터 스키마 구조 연동
  const sentenceObj = activePassage.sentences[currentSentenceIndex];
  const currentSentence = sentenceObj ? sentenceObj.text : '';
  

    
  const words = currentSentence.split(/\s+/);

  // 마우스/터치 드래그 선택 영역 실시간 탐색 핸들러
  const handleTextSelection = (e) => {
    const selection = window.getSelection();
    if (!selection) return;
    const selectedStr = selection.toString().trim();
    
    // 특수문자 정돈 후 단어가 있는 경우만 처리
    if (selectedStr && selectedStr.length > 1) {
      // 문장 부호 정돈
      const cleanStr = selectedStr.replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, " ").replace(/\s+/g, " ").trim();
      if (cleanStr) {
        setDraggedText(cleanStr);
        
        // 플로팅 버튼이 표시될 마우스/터치 좌표 계산
        const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || 150;
        const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY) || 150;
        
        setDragPosition({
          x: clientX,
          y: clientY - 80 // 드래그 지점 위쪽에 뜨도록 마진 부여
        });
      }
    } else {
      setDraggedText('');
    }
  };

  // 플로팅 드래그 단어 추가 버튼 클릭 핸들러
  const handleAddDraggedText = async () => {
    if (!draggedText) return;
    const cleanWord = draggedText.replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim();
    if (!cleanWord) return;

    setSelectedWord(cleanWord);
    setDraggedText('');
    window.getSelection().removeAllRanges(); // 드래그 영역 해제
    
    setMeaning('뜻을 불러오는 중...');
    const entry = await fetchLiveWordDefinition(cleanWord);
    if (entry) {
      setMeaning(entry.meaning);
    } else {
      setMeaning(parseDynamicWordMeaning(cleanWord));
    }
  };

  // 단어 클릭 핸들러 (단일 클릭 모드 vs 다중 선택 모드)
  const handleWordClick = async (rawWord, index) => {
    // 문장부호 제거
    const cleanWord = rawWord.replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim();
    if (!cleanWord) return;

    if (multiSelectMode) {
      // 다중 선택 모드: 선택된 단어 토글
      if (selectedIndices.includes(index)) {
        setSelectedIndices(prev => prev.filter(i => i !== index));
      } else {
        // 순서 상관없이 정렬하여 자연스러운 구(phrase)가 이루어지도록 함
        setSelectedIndices(prev => [...prev, index].sort((a, b) => a - b));
      }
    } else {
      // 단일 클릭 모드: 기존 팝업 오픈
      setSelectedWord(cleanWord);
      setMeaning('뜻을 불러오는 중...');
      
      const entry = await fetchLiveWordDefinition(cleanWord);
      if (entry) {
        setMeaning(entry.meaning);
      } else {
        setMeaning(parseDynamicWordMeaning(cleanWord));
      }
    }
  };

  // 선택된 다중 단어들 조합해서 이디엄으로 띄우기
  const handleViewMultiSelectMeaning = () => {
    if (selectedIndices.length === 0) return;
    
    // 선택된 인덱스들의 원본 단어를 공백으로 병합
    const combinedPhrase = selectedIndices.map(i => words[i].replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim()).join(' ');
    const lower = combinedPhrase.toLowerCase();
    
    // 사전 매칭 또는 동적 유추
    const foundMeaning = dictMock[lower] || parseDynamicWordMeaning(combinedPhrase);
    
    setSelectedWord(combinedPhrase);
    setMeaning(foundMeaning);
  };

  // 나만의 단어장에 최종 저장
  const handleSaveToVocab = () => {
    if (!selectedWord) return;
    addToVocab(selectedWord, meaning, currentSentence);
    
    // 초기화
    setSelectedWord(null);
    setSelectedIndices([]);
    setDraggedText('');
  };

  return (
    <div 
      ref={containerRef}
      onMouseUp={handleTextSelection}
      onTouchEnd={handleTextSelection}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '32px 24px',
        border: '6px solid var(--color-border)',
        borderRadius: '24px',
        backgroundColor: 'var(--color-bg)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
        minHeight: '350px',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      {/* 플로팅 드래그 추가 툴팁 */}
      {draggedText && (
        <BigButton
          variant="primary"
          onClick={handleAddDraggedText}
          style={{
            position: 'fixed',
            left: `${dragPosition.x}px`,
            top: `${dragPosition.y}px`,
            zIndex: 999,
            borderRadius: '30px',
            padding: '0 24px',
            fontSize: '18px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            whiteSpace: 'nowrap',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          ➕ [선택 영역 추가] "{draggedText.length > 15 ? draggedText.slice(0, 15) + '...' : draggedText}"
        </BigButton>
      )}

      {/* 상단 조작바 (TTS 낭독 & 숙어 다중선택 토글) */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '3px solid var(--color-border)',
        paddingBottom: '16px',
        width: '100%'
      }}>
        {/* TTS 낭독 */}
        <BigButton
          variant="primary"
          onClick={() => speakText(currentSentence)}
          style={{ flex: '1 1 220px' }}
        >
          🔊 원어민 낭독 (TTS)
        </BigButton>

        {/* 나의 단어장 탭 이동 단축 버튼 */}
        <BigButton
          variant="secondary"
          onClick={onGoToVocab}
          style={{ flex: '1 1 280px' }}
        >
          ⭐ 나의 단어장
        </BigButton>
      </div>

      {/* 다중 선택 진행 힌트 패널 */}
      {multiSelectMode && (
        <div style={{
          padding: '16px 24px',
          backgroundColor: 'var(--color-secondary)',
          borderRadius: '16px',
          border: '3px dashed var(--color-primary)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text)' }}>
            💡 [숙어 선택] 본문의 단어를 순서대로 터치하여 숙어나 이디엄 덩어리를 만드세요!
          </p>
          {selectedIndices.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: '900', 
                color: 'var(--color-primary)', 
                backgroundColor: 'var(--color-bg)',
                padding: '8px 20px',
                borderRadius: '8px',
                border: '2px solid var(--color-border)'
              }}>
                조합된 단어: {selectedIndices.map(i => words[i].replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim()).join(' ')}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <BigButton
                  variant="primary"
                  onClick={handleViewMultiSelectMeaning}
                  style={{ minWidth: '180px', height: '64px', fontSize: '18px' }}
                >
                  🔍 숙어 뜻 확인
                </BigButton>
                <BigButton
                  variant="secondary"
                  onClick={() => setSelectedIndices([])}
                  style={{ minWidth: '100px', height: '64px', fontSize: '18px' }}
                >
                  초기화
                </BigButton>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 개별 단어 단위로 클릭 가능한 문장 영역 */}
      <div 
        ref={sentenceRef}
        tabIndex="-1"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '24px 16px', // 배지가 단어와 겹치지 않게 수직 간격 충분히 확장
          lineHeight: '2.6', // 줄간격 확장
          padding: '32px 16px',
          userSelect: 'text',
          outline: 'none'
        }}
      >
        {words.map((w, index) => {
          const isSelected = selectedIndices.includes(index);
          const cleanWord = w.replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim();
          
          // 단어별 초정밀 [접/주/동/수] 약어 배지 및 컬러 획득
          const prevWord = index > 0 ? words[index - 1].replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "") : "";
          const nextWord = index < words.length - 1 ? words[index + 1].replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "") : "";
          const detailedTag = getDetailedWordTags(w, cleanWord, prevWord, nextWord);
          
          // 형용사구 수식 시작점 (to, that 등)에 역방향 수식 화살표 장식 가미
          const isModifierStart = ['to', 'that', 'which', 'who'].includes(cleanWord.toLowerCase());
          
          return (
            <span
              key={index}
              onClick={() => handleWordClick(w, index)}
              style={{
                position: 'relative',
                display: 'inline-block',
                paddingTop: '0', // 배지 공간 제거하여 단정하게 정렬
                transition: 'all 0.2s'
              }}
            >
              {/* 🏷️ 초정밀 성분 약어 배지 꼬리표 - 눈 피로 방지를 위해 완전히 제거 */}

              <span
                style={{
                  fontSize: `${fontSize}px`,
                  fontWeight: '900',
                  cursor: 'pointer',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  transition: 'all 0.2s',
                  // 밑줄 시각 장식: 눈의 피로를 최소화하기 위해 밑줄은 완벽히 제거
                  borderBottom: 'none',
                  backgroundColor: isSelected ? 'rgba(0, 102, 204, 0.15)' : 'transparent',
                  color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                  display: 'inline-block',
                  userSelect: 'text'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {w}
              </span>
            </span>
          );
        })}
      </div>

      {/* ✨ 초정밀 영어 문장 구조식 직독직해 학습 가이드 */}

      {/* 단어/숙어 간이 사전 팝업 모달 */}
      {selectedWord && (() => {
        const isSaved = myVocab.some(item => item.word.toLowerCase() === selectedWord.toLowerCase());
        return (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'var(--color-bg)',
            border: '5px solid var(--color-primary)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
            zIndex: 1000,
            width: '90%',
            maxWidth: '550px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            textAlign: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div>
              <span style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: 'var(--color-text)', 
                opacity: 0.6,
                border: '2px solid var(--color-border)',
                padding: '4px 12px',
                borderRadius: '20px',
                backgroundColor: 'var(--color-secondary)'
              }}>
                {selectedWord.includes(' ') ? '📝 이디엄 / 숙어' : '📒 단어'}
              </span>
              <h3 style={{ fontSize: '38px', fontWeight: '900', color: 'var(--color-primary)', marginTop: '16px', wordBreak: 'break-all' }}>
                {selectedWord}
              </h3>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                marginTop: '16px',
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
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <BigButton
                variant={isSaved ? "danger" : "success"}
                onClick={() => {
                  if (isSaved) {
                    removeFromVocab(selectedWord);
                  } else {
                    addToVocab(selectedWord, meaning, currentSentence);
                  }
                }}
                style={{ flex: 1, minHeight: '64px', fontSize: '20px' }}
              >
                {isSaved ? "❌ 단어장 제거" : "⭐ 단어장 저장"}
              </BigButton>
              <BigButton
                variant="secondary"
                onClick={() => {
                  setSelectedWord(null);
                  setSelectedIndices([]);
                  setDraggedText('');
                }}
                style={{ flex: 1, minHeight: '64px', fontSize: '20px' }}
              >
                닫기
              </BigButton>
            </div>
          </div>
        );
      })()}

      {/* 스타일 애니메이션 주입 */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}

// 영어 알파벳/기호로만 구성되어 번역이 폴백된 상태인지 스캔하는 접근성 가이드 헬퍼
const isEnglishOnly = (text) => {
  if (!text) return true;
  return !/[ㄱ-ㅎㅏ-ㅣ가-힣]/i.test(text);
};

// 오염된 텍스트에서 꼬리표 기호들을 깔끔하게 제거해 주는 정밀 필터링 헬퍼
const cleanTranslationText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\s*\.\.\.\s*\[[^\]]+\]/g, '') // " ... [주어+동사]" 패턴 제거
    .replace(/\s*\[[^\]]+\]/g, '')         // "[to 부정사 수식어구]" 패턴 제거
    .replace(/\s*\([^)]+\)/g, '')          // "(~하기 위한 것)" 패턴 제거
    .replace(/\s*\.\.\./g, '')             // 잔여 "..." 기호 제거
    .replace(/\s+/g, ' ')                  // 중복 공백 정돈
    .trim();
};
