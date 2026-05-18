import { useState } from 'react';

export default function ChunkReadingPage({ passages, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!passages || passages.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <h2 style={{ fontSize: '40px' }}>지문이 없습니다.</h2>
        <button onClick={onBack}>돌아가기</button>
      </div>
    );
  }

  // 간단한 청크 분리 로직 (MVP용: 콤마, 접속사 앞, 전치사 앞 등 간단한 규칙 적용)
  // 실제로는 자연어 처리 API나 더 정교한 규칙이 필요하지만, 여기서는 Mock 수준으로 분리합니다.
  const splitIntoChunks = (sentence) => {
    // 1. 콤마 뒤 분리
    // 2. that, which, who 등 관계사 앞 분리
    // 3. and, but 등 접속사 앞 분리
    // MVP이므로 정규식으로 간단히 쪼갭니다.
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

    // 만약 전혀 분리되지 않았다면 공백을 기준으로 적당히 나눕니다 (임시 방편)
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

  const currentSentence = passages[currentIndex];
  const chunks = splitIntoChunks(currentSentence);

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
        <div style={{ width: '80px' }}></div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflowY: 'auto',
        padding: '16px'
      }}>
        {chunks.map((chunk, idx) => (
          <div key={idx} style={{
            padding: '24px',
            border: '4px solid var(--color-border)',
            borderRadius: '12px',
            backgroundColor: 'var(--color-bg)'
          }}>
            <p style={{
              fontSize: '48px',
              fontWeight: 'bold',
              lineHeight: '1.4',
              wordBreak: 'keep-all'
            }}>
              {chunk}
            </p>
          </div>
        ))}
      </div>

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
