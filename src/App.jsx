import { useState, useEffect, useCallback } from 'react';
import PassageInputPage from './pages/PassageInputPage';
import StudyContainerPage from './pages/StudyContainerPage';
import { db } from './utils/firebase';
import { useApp } from './context/AppContext'; // AppContext 연동
import spaceRobotImage from './assets/cute_space_robot.png';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy
} from 'firebase/firestore';
import './index.css';

function App() {
  const { setActivePassage, setCurrentSentenceIndex } = useApp(); // 전역 헬퍼 추출
  const [currentPage, setCurrentPage] = useState('home');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('lingo-theme') || 'light';
  });
  const [passagesList, setPassagesList] = useState([]);
  const [selectedPassage, setSelectedPassage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Apply theme to document element whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 타임아웃 처리용 유틸리티 (Firebase 응답 지연 시 로컬스토리지 즉시 전환)
  const withTimeout = (promise, ms = 1500) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Firebase Timeout")), ms))
    ]);
  };

  // 로컬스토리지 JSON 파싱 에러 런타임 크래시 방어 헬퍼
  const safeJsonParse = (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item);
    } catch {
      console.warn(`LocalStorage Parse Warning for ${key}, using default fallback.`);
      return defaultValue;
    }
  };

  const fetchPassages = useCallback(async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'passages'), orderBy('createdAt', 'desc'));
      const querySnapshot = await withTimeout(getDocs(q), 1500);
      const list = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        let sList = data.sentences || [];
        
        // 꼬인 중복 저장 및 비정상 오브젝트 정밀 구조 복구 가드
        if (sList && !Array.isArray(sList) && typeof sList === 'object') {
          if (Array.isArray(sList.sentences)) {
            sList = sList.sentences;
          } else {
            sList = [];
          }
        } else if (!Array.isArray(sList)) {
          sList = [];
        }

        list.push({
          id: doc.id,
          title: data.title || '제목 없는 지문',
          sentences: sList,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
        });
      });
      setPassagesList(list);
      // 로컬스토리지에 최신 백업 저장
      localStorage.setItem('lingo-passages', JSON.stringify(list));
    } catch (error) {
      console.warn("Firestore fetch failed or timed out. Falling back to LocalStorage:", error);
      const localData = safeJsonParse('lingo-passages', []);
      const parsed = localData.map(item => {
        let sList = item.sentences || [];
        if (sList && !Array.isArray(sList) && typeof sList === 'object') {
          if (Array.isArray(sList.sentences)) {
            sList = sList.sentences;
          } else {
            sList = [];
          }
        } else if (!Array.isArray(sList)) {
          sList = [];
        }
        return {
          ...item,
          sentences: sList,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
        };
      });
      setPassagesList(parsed);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch passages from Firestore on mount
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await fetchPassages();
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [fetchPassages]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('lingo-theme', newTheme);
  };

  const handleSavePassage = async (savedPassage) => {
    setIsLoading(true);
    try {
      console.log("Successfully saved passage object to state context:", savedPassage);
      // PassageInputPage에서 이미 Firestore/LocalStorage 영속화 저장이 대성공하였으므로,
      // 여기서는 목록 리프레시와 홈 화면 복귀만을 유기적으로 관장해 중복 저장을 원천 차단합니다.
      await fetchPassages();
      setCurrentPage('home');
    } catch (error) {
      console.warn("Passage listing refresh failed, returning to home:", error);
      setCurrentPage('home');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePassage = async (id, e) => {
    e.stopPropagation(); // 카드 클릭 방지
    if (!confirm("정말로 이 지문을 삭제하시겠습니까?")) return;
    
    setIsLoading(true);
    try {
      if (id.startsWith('local-')) {
        throw new Error("Local item bypass");
      }
      await withTimeout(deleteDoc(doc(db, 'passages', id)), 1500);
      await fetchPassages();
    } catch (error) {
      console.warn("Firestore delete failed or local bypass. Removing from LocalStorage:", error);
      const localData = safeJsonParse('lingo-passages', []);
      const updated = localData.filter(item => item.id !== id);
      localStorage.setItem('lingo-passages', JSON.stringify(updated));
      
      const parsed = updated.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt)
      }));
      setPassagesList(parsed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPassage = (passage) => {
    setSelectedPassage(passage);
    setActivePassage(passage); // 전역 AppContext 상태 동시 동기화 (설계 규격 융합)
    setCurrentSentenceIndex(0); // 첫 문장부터 시작하도록 리셋
    setCurrentPage('study');
  };

  // Format date helper
  const formatDate = (date) => {
    if (!date) return '';
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  // 파스텔 테마 색상 순환 배열
  const pastelCardColors = [
    '#ffe9e3', // 복숭아 핑크
    '#a5c8ff', // 소프트 블루
    '#fffde7', // 크림 옐로우
    '#a3f69c', // 민트 그린
    '#f3e5f5'  // 라벤더 퍼플
  ];

  return (
    <div className="app-container" style={{ fontFamily: "'Outfit', 'Pretendard', sans-serif" }}>
      {/* 1. Neobrutalism 3D 탑 헤더 바 */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '40px',
        borderBottom: '4px solid #5d4037',
        paddingBottom: '24px',
        paddingTop: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '42px', filter: 'drop-shadow(2px 2px 0px #5d4037)' }}>⭐</span>
          <h1 style={{ 
            fontSize: '44px', 
            fontWeight: '900', 
            letterSpacing: '-1.5px',
            color: 'var(--color-text)',
            margin: 0,
            textShadow: theme === 'high-contrast' ? 'none' : '3px 3px 0px #ffe9e3'
          }}>
            LingoStar <span style={{ color: 'var(--color-primary)' }}>Vision</span>
          </h1>
        </div>
        
        {/* 테마 셀렉터 3D 입체화 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label htmlFor="theme-selector" style={{ fontSize: '22px', fontWeight: '900', color: 'var(--color-text)' }}>
            🎨 테마
          </label>
          <select 
            id="theme-selector"
            value={theme} 
            onChange={(e) => handleThemeChange(e.target.value)}
            className="neo-3d-input"
            style={{ 
              fontSize: '20px', 
              padding: '8px 16px', 
              cursor: 'pointer',
              minWidth: '180px',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              borderColor: '#5d4037'
            }}
          >
            <option value="light">밝게 (Light)</option>
            <option value="dark">어둡게 (Dark)</option>
            <option value="yellow">독서용 (Yellow)</option>
            <option value="blue-soft">안구편한 (Blue Soft)</option>
            <option value="high-contrast">고대비 (High Contrast)</option>
          </select>
        </div>
      </header>

      {/* 로딩 인디케이터 (프리미엄 로딩 상태 디자인) */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(6px)'
        }}>
          <div className="neo-3d-card" style={{
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            padding: '48px 64px',
            textAlign: 'center',
            maxWidth: '480px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px'
          }}>
            <div className="spinner" style={{
              width: '80px',
              height: '80px',
              border: '10px solid #5d4037',
              borderTop: '10px solid var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <p style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>
              데이터 동기화 중...
            </p>
          </div>
        </div>
      )}

      {/* 1. 홈 대시보드 화면 */}
      {currentPage === 'home' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', flex: 1 }}>
          
          {/* 거대 웰컴 히어로 카드 배너 */}
          <div className="neo-3d-card" style={{
            backgroundColor: theme === 'dark' ? '#222' : '#ffe9e3',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: '40px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* 우주를 유영하며 둥둥 뜨는 귀여운 AI 로봇 애니메이션 이미지 */}
              <style>{`
                @keyframes floatRobotAnimation {
                  0% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-12px) rotate(4deg); }
                  100% { transform: translateY(0px) rotate(0deg); }
                }
              `}</style>
              <div style={{
                alignSelf: 'flex-start',
                marginBottom: '4px',
                animation: 'floatRobotAnimation 3.5s ease-in-out infinite',
                filter: 'drop-shadow(4px 4px 0px rgba(93, 64, 55, 0.15))'
              }}>
                <img 
                  src={spaceRobotImage} 
                  alt="Cute Space AI Robot" 
                  style={{
                    height: '96px',
                    width: 'auto',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                />
              </div>
              <h2 style={{ 
                fontSize: '44px', 
                fontWeight: '900', 
                color: 'var(--color-text)',
                margin: 0,
                letterSpacing: '-1px'
              }}>
                LingoStar 대시보드 🌟
              </h2>
            </div>

            <div style={{ marginTop: '12px' }}>
              <button 
                onClick={() => setCurrentPage('input')} 
                className="neo-3d-button"
                style={{ 
                  backgroundColor: '#a3f69c', 
                  color: '#005312',
                  fontSize: '26px',
                  width: '100%',
                  padding: '24px'
                }}
              >
                ➕ 학습할 새 영어 지문 입력하기 (OCR / 파일)
              </button>
            </div>
          </div>

          {/* 지문 리스트 섹션 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-0.5px' }}>
              📖 나의 학습 지문 책장
            </h2>

            {passagesList.length === 0 ? (
              /* 빈 대시보드 상태 (Empty State - Neobrutalism) */
              <div className="neo-3d-card" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '80px 24px',
                borderStyle: 'dashed',
                backgroundColor: 'transparent',
                gap: '24px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '96px', filter: 'drop-shadow(3px 3px 0px #5d4037)' }}>📚</span>
                <div>
                  <h3 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>저장된 영어 지문이 없습니다</h3>
                  <p style={{ fontSize: '22px', opacity: 0.8, fontWeight: '700' }}>
                    위의 초록색 새 지문 입력 버튼을 눌러 첫 영어 지문을 추가해보세요!
                  </p>
                </div>
              </div>
            ) : (
              /* 지문 목록 대시보드 (Premium Pastel 3D Grid) */
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(100%, 1fr))', 
                gap: '28px' 
              }}>
                {(() => {
                  // 💡 [배리어 프리 최적화] 동일 제목 지문 중복 렌더링 자동 방지 (가장 최신 등록 지문만 대표 노출)
                  const seenTitles = new Set();
                  const uniquePassages = passagesList.filter(p => {
                    const titleKey = (p.title || '').trim().toLowerCase();
                    if (seenTitles.has(titleKey)) return false;
                    seenTitles.add(titleKey);
                    return true;
                  });

                  return uniquePassages.map((passage, index) => {
                    // 💡 [안구 피로 극소화 최적화] 알록달록한 다채색 파스텔을 전면 차단하고,
                    // 유저가 선택한 [눈보호 전용 테마 변수]에 100% 동화시켜 시각적 소음(Visual Clutter)을 원천 차단합니다.
                    const cardBg = 'var(--color-bg)';
                    const shadowColor = 'var(--color-border)';

                    return (
                      <div 
                        key={passage.id} 
                        className="neo-3d-card"
                        style={{
                          backgroundColor: cardBg,
                          borderColor: 'var(--color-border)',
                          borderWidth: '3px',
                          boxShadow: `4px 4px 0px 0px ${shadowColor}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          padding: '24px',
                          borderRadius: '20px',
                          position: 'relative',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* 지문 카드 탑 헤더 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                            <h3 style={{ 
                              fontSize: '28px', 
                              fontWeight: '900', 
                              color: 'var(--color-text)', 
                              margin: 0,
                              lineHeight: '1.2',
                              wordBreak: 'break-all'
                            }}>
                              {passage.title}
                            </h3>
                            
                            {/* 메타 정보 3D 배지 (눈부심 방지 테마 동화) */}
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '2px' }}>
                              <span className="neo-badge" style={{ 
                                backgroundColor: 'var(--color-secondary)', 
                                color: 'var(--color-text)', 
                                fontSize: '15px', 
                                padding: '4px 10px',
                                borderWidth: '2px',
                                boxShadow: `1px 1px 0px 0px ${shadowColor}`
                              }}>
                                📝 문장 {(passage.sentences || []).length}개
                              </span>
                              <span className="neo-badge" style={{ 
                                backgroundColor: 'var(--color-secondary)', 
                                color: 'var(--color-text)', 
                                fontSize: '15px', 
                                padding: '4px 10px',
                                borderWidth: '2px',
                                boxShadow: `1px 1px 0px 0px ${shadowColor}`
                              }}>
                                📅 {formatDate(passage.createdAt)}
                              </span>
                            </div>
                          </div>

                          <button 
                            onClick={(e) => handleDeletePassage(passage.id, e)}
                            className="neo-3d-button"
                            style={{ 
                              backgroundColor: '#ff8a8a', 
                              color: '#530000',
                              minHeight: '44px',
                              minWidth: '72px',
                              padding: '0 12px',
                              fontSize: '16px',
                              borderWidth: '2.5px',
                              boxShadow: `2px 2px 0px 0px ${shadowColor}`
                            }}
                          >
                            삭제
                          </button>
                        </div>

                        {/* 본문 미리보기 (문단 20~30개 훑을 때 시선 분산 방지를 위해 1줄로 압축 제한!) */}
                        <p style={{ 
                          fontSize: '18px', 
                          fontWeight: '700',
                          color: 'var(--color-text)',
                          opacity: 0.7, 
                          display: '-webkit-box', 
                          WebkitLineClamp: 1, 
                          WebkitBoxOrient: 'vertical', 
                          overflow: 'hidden',
                          lineHeight: '1.4',
                          wordBreak: 'keep-all',
                          margin: 0
                        }}>
                          {(passage.sentences || []).map(s => typeof s === 'string' ? s : (s?.english || s?.text || '')).join(' ')}
                        </p>

                        {/* 학습 시작 버튼 (거대 터치 72px 보장하면서 조도 통화 완료) */}
                        <div style={{ marginTop: '4px' }}>
                          <button 
                            className="neo-3d-button"
                            style={{ 
                              width: '100%', 
                              backgroundColor: 'var(--color-secondary)', 
                              color: 'var(--color-primary)',
                              minHeight: '64px',
                              fontSize: '20px',
                              borderWidth: '3px',
                              boxShadow: `3px 3px 0px 0px ${shadowColor}`
                            }} 
                            onClick={() => handleSelectPassage(passage)}
                          >
                            📖 이 지문 학습 시작하기 ▶
                          </button>
                        </div>
                      </div>
                    );
                  })
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. 새 지문 입력 화면 */}
      {currentPage === 'input' && (
        <PassageInputPage 
          onSave={handleSavePassage} 
          onCancel={() => setCurrentPage('home')} 
        />
      )}

      {/* 3. 통합 지문 상세 학습 화면 */}
      {currentPage === 'study' && selectedPassage && (
        <StudyContainerPage 
          passage={selectedPassage} 
          onBack={() => {
            setSelectedPassage(null);
            setCurrentPage('home');
          }} 
        />
      )}
    </div>
  );
}

export default App;

