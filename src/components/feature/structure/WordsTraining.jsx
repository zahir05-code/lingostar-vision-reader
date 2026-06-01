import React from 'react';

/**
 * WordsTraining 컴포넌트
 * 
 * Twins Reading 8단계 학습 중 1단계(기본 단어 공부)와 3단계(심화 단어 다지기)에서
 * 저시력 아동이 시각 피로 없이 단어 카드를 터치하여 뒤집어가며 학습할 수 있도록 돕는
 * 3D Neobrutalism 스타일의 낱말 플립 카드 컴포넌트입니다.
 */
export default function WordsTraining({
  currentReadingStep,
  vocabCards,
  flippedCards,
  setFlippedCards
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 학습 단계 안내 카드 */}
      <div style={{ textAlign: 'center', padding: '20px', border: '3px solid var(--color-border)', borderRadius: '20px' }}>
        <h4 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>
          {currentReadingStep === 1 ? '📒 Words 훈련 1단계 (기본 단어 공부)' : '📒 Words 훈련 3단계 (심화 단어 다지기)'}
        </h4>
        <p style={{ fontSize: '18px', opacity: 0.7, marginTop: '8px', margin: 0 }}>
          지문 속에서 자동으로 선별된 주요 어휘 카드입니다. 카드를 탭하여 뜻과 **동의어, 반의어**를 훈련하세요!
        </p>
      </div>

      {/* 단어 플립 카드 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '20px'
      }}>
        {vocabCards.map((card, idx) => {
          const isFlipped = flippedCards[idx];
          return (
            <div
              key={idx}
              onClick={() => setFlippedCards(prev => ({ ...prev, [idx]: !isFlipped }))}
              style={{
                perspective: '1000px',
                cursor: 'pointer',
                height: '240px'
              }}
            >
              <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                textAlign: 'center',
                transition: 'transform 0.6s',
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'none',
                boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                borderRadius: '24px',
                border: '4px solid var(--color-border)'
              }}>
                {/* 카드 앞면 (영어 단어 노출) */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  backgroundColor: 'var(--color-bg)',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '16px'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'purple', opacity: 0.6 }}>선별 어휘</span>
                  <h4 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--color-primary)', margin: '12px 0 0 0', wordBreak: 'break-all' }}>
                    {card.word}
                  </h4>
                </div>

                {/* 카드 뒷면 (한국어 뜻, 동의어, 반의어, 유사숙어 노출) */}
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  backgroundColor: 'var(--color-secondary)',
                  color: 'var(--color-text)',
                  borderRadius: '20px',
                  transform: 'rotateY(180deg)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '20px',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-primary)' }}>
                    뜻: {card.meaning}
                  </span>
                  {card.synonyms && (
                    <div style={{ fontSize: '15px', fontWeight: 'bold', opacity: 0.9 }}>
                      🔵 동의어: {card.synonyms}
                    </div>
                  )}
                  {card.antonyms && (
                    <div style={{ fontSize: '15px', fontWeight: 'bold', opacity: 0.9 }}>
                      🔴 반의어: {card.antonyms}
                    </div>
                  )}
                  {card.similarIdioms && (
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'purple' }}>
                      💡 유사숙어: {card.similarIdioms}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
