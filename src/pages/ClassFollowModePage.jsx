import { useState } from 'react';

export default function ClassFollowModePage({ passages, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!passages || passages.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <h2 style={{ fontSize: '40px' }}>지문이 없습니다.</h2>
        <button onClick={onBack}>돌아가기</button>
      </div>
    );
  }

  const handleNext = () => {
    if (currentIndex < passages.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '24px' }}>
      {/* 미니맵 헤더 */}
      <div style={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '16px 24px',
        backgroundColor: 'var(--color-secondary)',
        borderRadius: '12px'
      }}>
        <button 
          onClick={onBack}
          style={{ minWidth: 'auto', minHeight: '48px', padding: '0 16px', fontSize: '20px' }}
        >
          목록으로
        </button>
        <span style={{ fontSize: '32px', fontWeight: 'bold' }}>
          {currentIndex + 1} / {passages.length}
        </span>
        <div style={{ width: '80px' }}></div> {/* 정렬을 위한 빈 공간 */}
      </div>

      {/* 집중 읽기 메인 텍스트 */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        border: '4px solid var(--color-border)',
        borderRadius: '12px',
        backgroundColor: 'var(--color-bg)'
      }}>
        <p style={{
          fontSize: '64px',
          fontWeight: 'bold',
          textAlign: 'center',
          lineHeight: '1.4',
          wordBreak: 'keep-all'
        }}>
          {passages[currentIndex]}
        </p>
      </div>

      {/* 네비게이션 버튼 */}
      <div style={{ display: 'flex', gap: '24px' }}>
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{ 
            flex: 1, 
            opacity: currentIndex === 0 ? 0.3 : 1,
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-text)'
          }}
        >
          이전 문장
        </button>
        <button 
          onClick={handleNext}
          disabled={currentIndex === passages.length - 1}
          style={{ 
            flex: 1,
            opacity: currentIndex === passages.length - 1 ? 0.3 : 1,
            cursor: currentIndex === passages.length - 1 ? 'not-allowed' : 'pointer'
          }}
        >
          다음 문장
        </button>
      </div>
    </div>
  );
}
