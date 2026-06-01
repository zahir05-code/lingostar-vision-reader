import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import ClassFollowModePage from './ClassFollowModePage';
import ChunkReadingPage from './ChunkReadingPage';
import ParagraphStructurePage from './ParagraphStructurePage';
import VocabularyPage from './VocabularyPage';

export default function StudyContainerPage({ passage, onBack }) {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    brightness,
    setBrightness,
    isInvert,
    setIsInvert,
    isGrayscale,
    setIsGrayscale,
    ttsRate,
    setTtsRate,
    activePassage,
    currentSentenceIndex,
    nextSentence,
    prevSentence
  } = useApp();

  const [activeTab, setActiveTab] = useState('follow'); // 'follow' | 'chunk' | 'structure' | 'vocab'
  const [showPanel, setShowPanel] = useState(false);

  const currentPassage = passage || activePassage;
  const sentences = currentPassage ? (currentPassage.sentences || []) : [];
  const currentIndex = currentSentenceIndex;

  const handleNext = () => {
    nextSentence();
  };

  const handlePrev = () => {
    prevSentence();
  };

  const increaseFontSize = () => {
    if (fontSize < 120) {
      setFontSize(prev => prev + 4);
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 24) {
      setFontSize(prev => prev - 4);
    }
  };

  // 핀치 줌 제스처 핸들러 (Ref & useEffect for passive: false)
  const containerRef = useRef(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let localTouchStartDist = 0;
    let localBaseFontSize = fontSize;

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        localTouchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        localBaseFontSize = fontSize;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2 && localTouchStartDist > 0) {
        if (e.cancelable) e.preventDefault(); // 브라우저 기본 줌 방지
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scale = dist / localTouchStartDist;
        let newSize = Math.round(localBaseFontSize * scale);
        newSize = Math.max(24, Math.min(120, newSize));
        setFontSize(newSize);
      }
    };

    const handleTouchEnd = () => {
      localTouchStartDist = 0;
    };

    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault(); // 브라우저 기본 줌 방지
        const delta = e.deltaY > 0 ? -4 : 4;
        setFontSize(prev => {
          let newSize = prev + delta;
          return Math.max(24, Math.min(120, newSize));
        });
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [fontSize, setFontSize]);

  // 도입-본론-결론 가이드 헬퍼
  const getSectionLabel = (idx) => {
    const total = sentences.length;
    if (total === 0) return '';
    const introEnd = Math.max(1, Math.floor(total * 0.25));
    const bodyEnd = Math.max(introEnd + 1, Math.floor(total * 0.8));

    if (idx < introEnd) return '🔵 도입';
    if (idx < bodyEnd) return '🟡 본론';
    return '🟠 결론';
  };

  return (
    <div 
      ref={containerRef}
      className={`${isInvert ? 'filter-invert' : ''} ${isGrayscale ? 'filter-grayscale' : ''}`}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        gap: '24px', 
        flex: 1,
        touchAction: 'none' // 핀치줌 완벽 제어를 위해 브라우저 터치 액션 억제
      }}
    >
      {/* 화면 조도(눈부심 방지) 글로벌 블랙 암막 오버레이 */}
      {brightness > 0 && (
        <div 
          className="brightness-overlay" 
          style={{ opacity: brightness / 100 }} 
        />
      )}

      {/* 1. 상단 미니맵 헤더 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px 24px',
        backgroundColor: 'var(--color-secondary)',
        borderRadius: '16px',
        border: '3px solid var(--color-border)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: fontSize >= 80 ? 'stretch' : 'center',
          flexDirection: fontSize >= 80 ? 'column' : 'row',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* 목록으로 버튼 */}
          <button 
            onClick={onBack}
            style={{ 
              minWidth: '140px', 
              minHeight: '60px', 
              fontSize: '20px',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              border: '3px solid var(--color-border)'
            }}
          >
            ⬅ 목록
          </button>

          {/* 지문 정보 */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '4px' }}>{passage.title}</h2>
            {(activeTab === 'follow' || activeTab === 'chunk') && (
              <span style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                문장: {currentIndex + 1} / {sentences.length} ({getSectionLabel(currentIndex)})
              </span>
            )}
            {(activeTab === 'structure' || activeTab === 'vocab') && (
              <span style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                심화 학습 분석 모드
              </span>
            )}
          </div>

          {/* 눈보호 접근성 제어 & 폰트 크기 조절기 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setShowPanel(!showPanel)}
              style={{
                minWidth: '150px',
                minHeight: '60px',
                fontSize: '20px',
                backgroundColor: showPanel ? 'var(--color-primary)' : 'var(--color-bg)',
                color: showPanel ? 'var(--color-bg)' : 'var(--color-text)',
                border: '3px solid var(--color-border)'
              }}
            >
              👁️ 눈보호 설정 {showPanel ? '▲' : '▼'}
            </button>

            {/* 글꼴 스텝퍼 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={decreaseFontSize} 
                disabled={fontSize <= 24}
                style={{
                  minWidth: '50px',
                  minHeight: '50px',
                  fontSize: '24px',
                  backgroundColor: fontSize <= 24 ? 'var(--color-border)' : 'var(--color-primary)',
                  opacity: fontSize <= 24 ? 0.5 : 1
                }}
              >
                －
              </button>
              <span style={{ fontSize: '24px', fontWeight: '900', minWidth: '70px', textAlign: 'center' }}>
                {fontSize}px
              </span>
              <button 
                onClick={increaseFontSize} 
                disabled={fontSize >= 120}
                style={{
                  minWidth: '50px',
                  minHeight: '50px',
                  fontSize: '24px',
                  backgroundColor: fontSize >= 120 ? 'var(--color-border)' : 'var(--color-primary)',
                  opacity: fontSize >= 120 ? 0.5 : 1
                }}
              >
                ＋
              </button>
            </div>
          </div>
        </div>

        {/* 👁️ 접근성/눈보호 정밀 제어 패널 */}
        {showPanel && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: '24px',
            backgroundColor: 'var(--color-bg)',
            borderRadius: '16px',
            border: '4px solid var(--color-primary)',
            marginTop: '8px'
          }}>
            {/* 1. 화면 조도 밝기 제어 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '22px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                <span>💡 눈부심 차단 필터 (암막 효과)</span>
                <span style={{ color: 'var(--color-primary)' }}>{brightness}%</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={() => setBrightness(prev => Math.max(0, prev - 5))}
                  style={{ minWidth: '64px', minHeight: '54px', fontSize: '20px', backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)' }}
                >
                  밝게
                </button>
                <input
                  type="range"
                  min="0"
                  max="70"
                  step="5"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  style={{ flex: 1, height: '30px', cursor: 'pointer' }}
                />
                <button
                  onClick={() => setBrightness(prev => Math.min(70, prev + 5))}
                  style={{ minWidth: '64px', minHeight: '54px', fontSize: '20px', backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)' }}
                >
                  어둡게
                </button>
              </div>
            </div>

            {/* 2. 특수 대비 필터 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '22px', fontWeight: 'bold' }}>🌓 특수 시각 대비 모드</span>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  onClick={() => setIsInvert(!isInvert)}
                  style={{
                    flex: 1,
                    minHeight: '64px',
                    fontSize: '20px',
                    backgroundColor: isInvert ? 'var(--color-primary)' : 'var(--color-secondary)',
                    color: isInvert ? 'var(--color-bg)' : 'var(--color-text)',
                    border: '3px solid var(--color-border)'
                  }}
                >
                  색상 반전: {isInvert ? '켜짐' : '꺼짐'}
                </button>
                <button
                  onClick={() => setIsGrayscale(!isGrayscale)}
                  style={{
                    flex: 1,
                    minHeight: '64px',
                    fontSize: '20px',
                    backgroundColor: isGrayscale ? 'var(--color-primary)' : 'var(--color-secondary)',
                    color: isGrayscale ? 'var(--color-bg)' : 'var(--color-text)',
                    border: '3px solid var(--color-border)'
                  }}
                >
                  흑백 모드: {isGrayscale ? '켜짐' : '꺼짐'}
                </button>
              </div>
            </div>

            {/* 3. 배경색 고대비 테마 선택 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '22px', fontWeight: 'bold' }}>🎨 배경 대비 테마 선택</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {[
                  { id: 'light', label: '기본 밝게' },
                  { id: 'dark', label: '어둡게' },
                  { id: 'yellow', label: '눈편한 황색' },
                  { id: 'blue-soft', label: '부드러운 청색' },
                  { id: 'high-contrast', label: '흑백 고대비' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    style={{
                      minHeight: '60px',
                      fontSize: '16px',
                      backgroundColor: theme === t.id ? 'var(--color-primary)' : 'var(--color-secondary)',
                      color: theme === t.id ? 'var(--color-bg)' : 'var(--color-text)',
                      border: '2px solid var(--color-border)'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. 원어민 발음 속도 배속 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '22px', fontWeight: 'bold' }}>🔊 원어민 낭독 발음 속도</span>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[
                  { rate: 0.7, label: '🐢 느리게 (0.7x)' },
                  { rate: 1.0, label: '🚶 보통 (1.0x)' },
                  { rate: 1.3, label: '⚡ 빠르게 (1.3x)' }
                ].map((r) => (
                  <button
                    key={r.rate}
                    onClick={() => setTtsRate(r.rate)}
                    style={{
                      flex: 1,
                      minHeight: '64px',
                      fontSize: '20px',
                      backgroundColor: ttsRate === r.rate ? 'var(--color-primary)' : 'var(--color-secondary)',
                      color: ttsRate === r.rate ? 'var(--color-bg)' : 'var(--color-text)',
                      border: '3px solid var(--color-border)'
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 진행 상태 바 */}
        {(activeTab === 'follow' || activeTab === 'chunk') && sentences.length > 0 && (
          <div style={{
            width: '100%',
            height: '12px',
            backgroundColor: 'var(--color-bg)',
            borderRadius: '6px',
            overflow: 'hidden',
            border: '2px solid var(--color-border)'
          }}>
            <div style={{
              width: `${((currentIndex + 1) / sentences.length) * 100}%`,
              height: '100%',
              backgroundColor: 'var(--color-primary)',
              transition: 'width 0.2s ease-in-out'
            }} />
          </div>
        )}
      </div>

      {/* 2. 중앙 메인 컨텐츠 영역 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'follow' && <ClassFollowModePage />}
        {activeTab === 'chunk' && <ChunkReadingPage />}
        {activeTab === 'structure' && <ParagraphStructurePage />}
        {activeTab === 'vocab' && (
          <VocabularyPage onGoBackToStructure={() => setActiveTab('structure')} />
        )}
      </div>

      {/* 3. 하단 문장 이전/다음 조작 (집중 탭 전용) */}
      {(activeTab === 'follow') && (
        <div style={{ display: 'flex', gap: '24px', marginBottom: '8px' }}>
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            style={{ 
              flex: 1, 
              minHeight: '76px',
              fontSize: '24px',
              opacity: currentIndex === 0 ? 0.3 : 1,
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-text)',
              border: '3px solid var(--color-border)'
            }}
          >
            ◀ 이전 문장
          </button>
          <button 
            onClick={handleNext}
            disabled={currentIndex === sentences.length - 1}
            style={{ 
              flex: 1,
              minHeight: '76px',
              fontSize: '24px',
              opacity: currentIndex === sentences.length - 1 ? 0.3 : 1,
              cursor: currentIndex === sentences.length - 1 ? 'not-allowed' : 'pointer'
            }}
          >
            다음 문장 ▶
          </button>
        </div>
      )}

      {/* 4. 하단 탭바 네비게이션 (모바일 명세 이미지 100% 동일 사양 개편) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        borderTop: '4px solid var(--color-border)',
        paddingTop: '20px',
        backgroundColor: 'var(--color-bg)'
      }}>
        {[
          { id: 'follow', label: 'Focus', desc: '📖 집중', icon: '🎯' },
          { id: 'chunk', label: 'Interpretation', desc: '🪜 영어어순 한국어직독직해', icon: '🪜' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                minHeight: '88px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
                borderRadius: '18px',
                fontSize: '22px',
                backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-secondary)',
                color: isActive ? 'var(--color-bg)' : 'var(--color-text)',
                border: '3.5px solid #000000',
                boxShadow: isActive ? 'none' : '3.5px 3.5px 0px 0px #000000',
                transform: isActive ? 'translate(2.5px, 2.5px)' : 'none',
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '24px' }}>{tab.icon}</span>
                <span style={{ fontWeight: '900' }}>{tab.label}</span>
              </div>
              <span style={{ fontSize: '14px', opacity: 0.8, fontWeight: '900' }}>{tab.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
