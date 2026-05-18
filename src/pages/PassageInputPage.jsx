import { useState } from 'react';

export default function PassageInputPage({ onSave, onCancel }) {
  const [text, setText] = useState('');

  const handleSave = () => {
    if (!text.trim()) return;
    
    // 단순 문장 분리 로직 (마침표, 물음표, 느낌표 기준)
    // 정규식을 사용해 구두점 뒤에 공백이 있는 경우를 기준으로 분리하고, 빈 문자열 제거
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const cleanedSentences = sentences.map(s => s.trim()).filter(s => s.length > 0);
    
    onSave(cleanedSentences);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '24px' }}>
      <h2 style={{ fontSize: '40px' }}>지문 입력</h2>
      <textarea 
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="여기에 영어 지문을 붙여넣으세요..."
        style={{
          flex: 1,
          fontSize: '32px',
          padding: '24px',
          borderRadius: '12px',
          border: '4px solid var(--color-border)',
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-text)',
          resize: 'none'
        }}
      />
      <div style={{ display: 'flex', gap: '24px' }}>
        <button 
          onClick={onCancel}
          style={{ flex: 1, backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)' }}
        >
          취소
        </button>
        <button 
          onClick={handleSave}
          style={{ flex: 2 }}
        >
          저장하기
        </button>
      </div>
    </div>
  );
}
