import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';

/**
 * SentenceStructure 컴포넌트
 * 
 * Twins Reading 8단계 학습 중 4단계(구조 분석 2 - Sentence Structure)를 담당하는 독립형 컴포넌트입니다.
 * 문장별 세로 성분(주어, 동사, 목적어/수식어) 시각화 및 글의 종류(장르) 4지선다 퀴즈를 
 * 저시력 아동이 시선 분산 없이 수행할 수 있도록 3D Neobrutalism 스타일로 렌더링합니다.
 */
export default function SentenceStructure() {
  const { 
    activePassage, 
    fontSize, 
    speakText, 
    theme 
  } = useApp();

  const [quizCurrentSentenceIdx, setQuizCurrentSentenceIdx] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);

  if (!activePassage) {
    return (
      <div style={{ textAlign: 'center', padding: '24px', fontSize: '20px', fontWeight: 'bold' }}>
        지문 데이터를 불러오는 중입니다...
      </div>
    );
  }

  const sentences = activePassage.sentences || [];
  const sObj = sentences[quizCurrentSentenceIdx];
  const sTxt = typeof sObj === 'string' ? sObj : (sObj?.text || sObj?.english || '');
  const chunks = sObj?.chunks || [];

  // 2025년 6월 고1 34번 모의고사 지문인지 판별
  const is34MockExam = activePassage && (
    activePassage.title?.includes("34") || 
    activePassage.fullText?.toLowerCase().includes("experimentally prove some hypothesis")
  );

  // 34번 지문의 문장별 세로 성분(주어 / 동사 / 목적어) 및 배경지식 정밀 족보 데이터
  const mockBreakdowns = [
    {
      english: "When scientists make an important new discovery or experimentally prove some hypothesis,",
      subject: "When scientists",
      verb: "make / experimentally prove",
      object: "an important new discovery / some hypothesis",
      passageType: "설명문",
      passageFeedback: "정답이에요! 이 글은 과학적 발견이 개인 소유가 아니라 공유될 때 가치가 커진다는 점을 설명하는 글이에요.",
      backgroundInsight: "🌍 [과학의 공공성]: 과학은 혼자 하는 마술이 아니라 인류 공동의 자산입니다. 가설을 세우고 증명할 때, 이를 숨기지 않고 널리 밝히는 사회적 약속이 과학 발전을 태동시켰습니다."
    },
    {
      english: "they do not, in general, keep that information to themselves so that they alone can consider its meaning",
      subject: "they",
      verb: "do not keep",
      object: "that information to themselves so that they alone can consider...",
      passageType: "설명문",
      passageFeedback: "정답이에요! 이 글은 과학적 발견이 어떻게 공유되는지 설명하는 설명문 형태의 논설 흐름을 띱니다.",
      backgroundInsight: "🌍 [지식 독점 방지]: 가치 있는 학술 정보를 독점하지 않는 것이 학계의 원칙입니다. 개방된 지식만이 인류 전체의 지혜를 한 단계 더 끌어올리는 거름이 됩니다."
    },
    {
      english: "Instead, they publish their results and make their data available for inspection.",
      subject: "Instead, they",
      verb: "publish / and make",
      object: "their results / their data available for inspection",
      passageType: "설명문",
      passageFeedback: "정답이에요! 과학적 데이터를 발표하고 검토용으로 공개하는 것은 지식 공유의 설명문 유형입니다.",
      backgroundInsight: "🌍 [Peer Review (동료 평가)]: 논문을 출판(publish)하여 전 세계의 다른 전문가들에게 혹혹한 검토(inspection)를 받게 함으로써, 발견의 오류를 제거하고 신뢰성을 단단하게 다집니다."
    },
    {
      english: "This makes it possible for other scientists to reconsider their data and possibly refute their conclusions.",
      subject: "This (앞 문장 내용)",
      verb: "makes it possible",
      object: "for other scientists to reconsider their data / refute their conclusions",
      passageType: "설명문",
      passageFeedback: "정답이에요! 다른 과학자들이 데이터를 검토하고 반박하게 돕는 과정의 정보를 설명하고 있습니다.",
      backgroundInsight: "🌍 [반박을 통한 지식의 진보]: 기존의 정설에 끊임없이 의문(reconsider)을 제기하고 반박(refute)하는 치열한 학문적 논쟁이 있어야만 비로소 '진짜 진리'가 세상에 우뚝 서게 됩니다."
    },
    {
      english: "More important, though, it makes it possible for other scientists to use that data to construct new hypotheses and perform new experiments.",
      subject: "More important, though, it",
      verb: "makes it possible",
      object: "for other scientists to use that data to construct new hypotheses...",
      passageType: "설명문",
      passageFeedback: "정답이에요! 타 과학자들이 가설과 실험을 추가적으로 진행할 수 있는 가능성을 설명하는 글이에요.",
      backgroundInsight: "🌍 [거인의 어깨 위에 올라타기]: 뉴턴의 말처럼, 모든 위대한 과학은 이전 학자들의 소중한 데이터를 발판(construct new hypotheses) 삼아 한걸음 더 앞서 나아갈 수 있습니다."
    },
    {
      english: "The assumption is that society as a whole will end up knowing more if information is spread as widely as possible.",
      subject: "The assumption / society as a whole",
      verb: "is that / will end up knowing",
      object: "more / if information is spread as widely as possible...",
      passageType: "설명문",
      passageFeedback: "정답이에요! 정보가 널리 공유될 때 사회 전체가 더 많이 알게 된다는 사실을 설명하는 전형적인 설명문입니다.",
      backgroundInsight: "🌍 [집단 지성의 승리]: 극소수의 엘리트만 비밀리에 지식을 통제할 때보다, 지식이 세상에 널리 퍼질 때(spread widely) 인류 문명은 대폭발 수준의 급성장을 이룰 수 있습니다."
    }
  ];

  // 🧬 2025년 고1 6월 모의고사 예시 지문인지 판별 (Stitch 3D 똑같이 만들기)
  const isExamplePassage = activePassage && (
    activePassage.title?.toLowerCase().includes("loyal") || 
    activePassage.fullText?.toLowerCase().includes("a loyal companion")
  );

  // 예시 지문 3대 성분 및 배경지식 족보 데이터
  const exampleBreakdowns = [
    {
      english: "A loyal companion always supports you through difficult times.",
      subject: "A loyal companion",
      verb: "always supports",
      object: "you through difficult times.",
      passageType: "설명문",
      passageFeedback: "정답이에요! 이 글은 강아지의 특징을 설명하는 글이에요.",
      backgroundInsight: "🐶 [반려견의 헌신]: 개는 단순한 동물이 아니라 인간과 수천 년을 함께해 온 충성스러운 동반자(loyal companion)입니다. 우리가 힘들고 어려울 때(difficult times), 조건 없는 사랑과 지지(always supports)로 우리를 감싸 안아줍니다."
    }
  ];

  const activeBreakdown = is34MockExam && mockBreakdowns[quizCurrentSentenceIdx] 
    ? mockBreakdowns[quizCurrentSentenceIdx] 
    : (isExamplePassage && exampleBreakdowns[quizCurrentSentenceIdx]
      ? exampleBreakdowns[quizCurrentSentenceIdx]
      : {
          english: sTxt,
          subject: chunks.find(c => c.tag === 'S+V')?.text || chunks[0]?.text || "Subject component detection in progress...",
          verb: chunks.find(c => c.tag === 'to-Inf' || c.text.toLowerCase().includes('is') || c.text.toLowerCase().includes('are'))?.text || chunks[1]?.text || "Verb component detection in progress...",
          object: chunks.find(c => c.tag === 'O/C' || c.tag === 'PREP')?.text || chunks.slice(2).map(c => c.text).join(' ') || "Object/Adverbial component... (계속 분석 중)",
          passageType: "설명문",
          passageFeedback: "정답이에요! 이 지문은 독자에게 유익한 정보와 흐름을 객관적 사실을 근거로 기술하는 설명문입니다.",
          backgroundInsight: "🌍 [배경지식 통찰]: 이 지문의 핵심적인 배경 맥락과 사실적 원인-결과 지식 구조를 이해하는 훈련 영역입니다."
        });

  const passageOptions = ["설명문", "논설문", "일기문", "실용문"];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '28px',
      backgroundColor: theme === 'yellow' ? '#fffde7' : (theme === 'dark' ? '#1d1d1d' : '#fffdec'),
      padding: '32px',
      borderRadius: '28px',
      border: '3px solid var(--color-border)',
      boxShadow: '8px 8px 0px 0px var(--color-border)',
      fontFamily: "'Outfit', 'Inter', sans-serif"
    }}>
      {/* 상단 SENTENCE STRUCTURE 및 Stage 진행바 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--color-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
          Sentence Structure
        </h3>
        <span style={{ fontSize: '24px', fontWeight: '900', color: '#005dac' }}>
          Stage {quizCurrentSentenceIdx + 1}/{sentences.length}
        </span>
      </div>

      {/* 파란색 프로그레스 바 */}
      <div style={{
        width: '100%',
        height: '10px',
        backgroundColor: '#e9ecef',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '2px solid var(--color-border)'
      }}>
        <div style={{
          width: `${((quizCurrentSentenceIdx + 1) / (sentences.length || 1)) * 100}%`,
          height: '100%',
          backgroundColor: '#005dac',
          transition: 'width 0.3s ease-in-out'
        }} />
      </div>

      {/* 🔢 Sentence Selection 인터랙티브 네비게이터 단추 세트 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '4px', alignItems: 'center' }}>
        <span style={{ fontSize: '18px', fontWeight: '900', color: 'var(--color-text)', opacity: 0.8, marginRight: '6px' }}>
          문장 선택 (Sentence Selection):
        </span>
        {sentences.map((_, sIdx) => {
          const isCurrent = quizCurrentSentenceIdx === sIdx;
          return (
            <button
              key={sIdx}
              onClick={() => {
                setQuizCurrentSentenceIdx(sIdx);
                setQuizSelectedOption(null);
              }}
              className="active-scale"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                border: '3px solid #000000',
                backgroundColor: isCurrent ? '#005dac' : 'var(--color-secondary)',
                color: isCurrent ? '#ffffff' : 'var(--color-text)',
                fontSize: '22px',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: isCurrent ? 'none' : '3px 3px 0px 0px #000000',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {sIdx + 1}
            </button>
          );
        })}
      </div>

      {/* 🎨 따뜻한 삽화 일러스트 */}
      {(isExamplePassage || is34MockExam) && (
        <div style={{
          width: '100%',
          border: '3.5px solid #000000',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '4px 4px 0px 0px #000000',
          marginTop: '8px',
          backgroundColor: '#ffffff'
        }}>
          <img 
            src={isExamplePassage 
              ? "file:///C:/Users/User/.gemini/antigravity/brain/f1dbc0ff-1a39-4d73-bc20-85c28a1d27ab/loyal_dog_illustration_1779979239458.png"
              : "file:///C:/Users/User/.gemini/antigravity/brain/f1dbc0ff-1a39-4d73-bc20-85c28a1d27ab/scientific_share_illustration_1779979261176.png"
            } 
            alt="Learning Visual Insight illustration" 
            style={{
              width: '100%',
              maxHeight: '280px',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </div>
      )}

      {/* 1. 핵심 영어 문장 3D Neobrutalism 프레임 */}
      <div style={{
        backgroundColor: 'var(--color-bg)',
        border: '3px solid var(--color-border)',
        borderRadius: '24px',
        padding: '36px 28px',
        boxShadow: '4px 4px 0px 0px var(--color-border)',
        textAlign: 'center',
        marginTop: '8px'
      }}>
        <p style={{
          fontSize: `${fontSize * 1.05}px`,
          fontWeight: '900',
          lineHeight: '1.5',
          color: 'var(--color-text)',
          margin: 0,
          wordBreak: 'break-word'
        }}>
          {activeBreakdown.english}
        </p>
      </div>

      {/* 2. 세로 기둥 타임라인형 문장 성분 Breakdown 카드 목록 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        paddingLeft: '64px',
        marginTop: '16px',
        gap: '24px'
      }}>
        {/* 세로 갈색 연결 기둥선 */}
        <div style={{
          position: 'absolute',
          left: '22px',
          top: '20px',
          bottom: '20px',
          width: '6px',
          backgroundColor: '#8d6e63',
          borderRadius: '10px',
          zIndex: 1
        }} />

        {/* 성분 1: SUBJECT (파란색) */}
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative', gap: '20px' }}>
          {/* 왼쪽 파란색 사람 아이콘 */}
          <div style={{
            position: 'absolute',
            left: '-64px',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#005dac',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 'bold',
            border: '3.5px solid #000000',
            zIndex: 2,
            boxShadow: '2px 2px 0px 0px #000000'
          }}>
            👤
          </div>

          {/* 주어 성분 블록 카드 */}
          <div style={{
            flex: 1,
            backgroundColor: '#1976d2',
            color: 'white',
            border: '3.5px solid #000000',
            borderRadius: '24px',
            padding: '18px 24px',
            boxShadow: '4px 4px 0px 0px #000000',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <span style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8 }}>
              Subject
            </span>
            <span style={{ fontSize: `${fontSize * 0.85}px`, fontWeight: '900' }}>
              {activeBreakdown.subject}
            </span>
          </div>
        </div>

        {/* 성분 2: VERB (초록색) */}
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative', gap: '20px' }}>
          {/* 왼쪽 초록색 번개 아이콘 */}
          <div style={{
            position: 'absolute',
            left: '-64px',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#2e7d32',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 'bold',
            border: '3.5px solid #000000',
            zIndex: 2,
            boxShadow: '2px 2px 0px 0px #000000'
          }}>
            ⚡
          </div>

          {/* 동사 성분 블록 카드 */}
          <div style={{
            flex: 1,
            backgroundColor: '#2e7d32',
            color: 'white',
            border: '3.5px solid #000000',
            borderRadius: '24px',
            padding: '18px 24px',
            boxShadow: '4px 4px 0px 0px #000000',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <span style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8 }}>
              Verb
            </span>
            <span style={{ fontSize: `${fontSize * 0.85}px`, fontWeight: '900' }}>
              {activeBreakdown.verb}
            </span>
          </div>
        </div>

        {/* 성분 3: OBJECT / ADVERBIAL (회색) */}
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative', gap: '20px' }}>
          {/* 왼쪽 회색 큐브 아이콘 */}
          <div style={{
            position: 'absolute',
            left: '-64px',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#868e96',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 'bold',
            border: '3.5px solid #000000',
            zIndex: 2,
            boxShadow: '2px 2px 0px 0px #000000'
          }}>
            💎
          </div>

          {/* 목적어/부사구 성분 블록 카드 */}
          <div style={{
            flex: 1,
            backgroundColor: '#e9ecef',
            color: '#000000',
            border: '3.5px solid #000000',
            borderRadius: '24px',
            padding: '18px 24px',
            boxShadow: '4px 4px 0px 0px #000000',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <span style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#495057' }}>
              Object / Adverbial
            </span>
            <span style={{ fontSize: `${fontSize * 0.85}px`, fontWeight: '900', color: '#000000' }}>
              {activeBreakdown.object}
            </span>
          </div>
        </div>
      </div>

      {/* 🌍 배경지식 통찰 (Background Insight) 3D Neobrutalism 카드 */}
      <div style={{
        backgroundColor: theme === 'dark' ? '#2c2c2c' : (theme === 'yellow' ? '#fff9c4' : '#f0f4f8'),
        border: '3px solid var(--color-border)',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '4px 4px 0px 0px var(--color-border)',
        marginTop: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <h4 style={{
          fontSize: '24px',
          fontWeight: '900',
          color: theme === 'dark' ? '#ffeb3b' : (theme === 'yellow' ? '#5d4037' : '#005dac'),
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>🌍</span> 배경지식 통찰 (Background Insight)
        </h4>
        <p style={{
          fontSize: '20px',
          fontWeight: '800',
          lineHeight: '1.6',
          color: 'var(--color-text)',
          margin: 0
        }}>
          {activeBreakdown.backgroundInsight}
        </p>
      </div>

      {/* 3. 글의 종류 (Passage Type) 4선지 퀴즈 섹션 */}
      <div style={{
        marginTop: '20px',
        borderTop: '3px solid var(--color-border)',
        paddingTop: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h4 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--color-text)', margin: 0 }}>
            글의 종류 (Passage Type)
          </h4>
          <p style={{ fontSize: '18px', opacity: 0.8, margin: 0 }}>
            이 글은 어떤 목적으로 쓰여졌을까요?
          </p>
        </div>

        {/* 퀴즈 단추 그룹 (Neobrutalism 3D) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginTop: '8px'
        }}>
          {passageOptions.map((opt) => {
            const isActive = quizSelectedOption === opt;
            
            let btnBg = 'var(--color-bg)';
            let btnColor = 'var(--color-text)';
            let borderStyle = '3px solid var(--color-border)';

            if (isActive) {
              btnBg = '#005dac';
              btnColor = 'white';
              borderStyle = '3px solid var(--color-border)';
            }

            return (
              <button
                key={opt}
                onClick={() => {
                  setQuizSelectedOption(opt);
                  if (opt === activeBreakdown.passageType) {
                    speakText("Correct answer! Great job.");
                  } else {
                    speakText("Try again.");
                  }
                }}
                style={{
                  backgroundColor: btnBg,
                  color: btnColor,
                  border: borderStyle,
                  borderRadius: '20px',
                  padding: '20px 24px',
                  fontSize: '22px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: isActive ? 'none' : '3px 3px 0px 0px var(--color-border)',
                  transition: 'all 0.15s',
                  minHeight: '68px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'translate(-1px, -1px)';
                    e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-border)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'translate(0px, 0px)';
                    e.currentTarget.style.boxShadow = '3px 3px 0px 0px var(--color-border)';
                  }
                }}
              >
                {opt}
                {isActive && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#2e7d32',
                    color: '#ffffff',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    fontSize: '18px',
                    fontWeight: '900',
                    border: '2px solid #000000',
                    boxShadow: '1.5px 1.5px 0px 0px #000000',
                    marginLeft: '8px'
                  }}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 4. AI THOUGHT 피드백 힌트 점선 카드 */}
        {quizSelectedOption && (
          <div style={{
            border: '3.5px solid var(--color-border)',
            borderStyle: 'solid',
            borderRadius: '24px',
            padding: '24px',
            backgroundColor: quizSelectedOption === activeBreakdown.passageType ? 'rgba(46, 125, 50, 0.05)' : 'rgba(230, 81, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            animation: 'fadeIn 0.2s ease-out',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#005dac', fontWeight: '900', fontSize: '20px' }}>
              <span>THOUGHT_ ⎋</span>
              <span style={{ fontSize: '14px', opacity: 0.6 }}>(눈보호 및 AI 힌트 메세지)</span>
            </div>
            <p style={{
              fontSize: '20px',
              fontWeight: '800',
              lineHeight: '1.6',
              color: 'var(--color-text)',
              margin: 0
            }}>
              {quizSelectedOption === activeBreakdown.passageType
                ? activeBreakdown.passageFeedback
                : `오답이에요! ${activeBreakdown.passageType}가 정답인 이유: 정보를 객관적으로 명료하게 설명하며 독자에게 지식을 전달하는 내용입니다.`}
            </p>
          </div>
        )}
      </div>

      {/* 5. 이전 / 다음 문장 3D 네비게이터 단추 */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginTop: '12px'
      }}>
        <button
          onClick={() => {
            if (quizCurrentSentenceIdx > 0) {
              setQuizCurrentSentenceIdx(prev => prev - 1);
              setQuizSelectedOption(null);
            }
          }}
          disabled={quizCurrentSentenceIdx === 0}
          style={{
            flex: 1,
            padding: '16px 24px',
            fontSize: '20px',
            fontWeight: '900',
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-text)',
            border: '3px solid var(--color-border)',
            borderRadius: '16px',
            cursor: quizCurrentSentenceIdx === 0 ? 'default' : 'pointer',
            opacity: quizCurrentSentenceIdx === 0 ? 0.4 : 1,
            boxShadow: quizCurrentSentenceIdx === 0 ? 'none' : '3px 3px 0px 0px var(--color-border)',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          ◀ Previous
        </button>
        <button
          onClick={() => {
            if (quizCurrentSentenceIdx < sentences.length - 1) {
              setQuizCurrentSentenceIdx(prev => prev + 1);
              setQuizSelectedOption(null);
            }
          }}
          disabled={quizCurrentSentenceIdx === sentences.length - 1}
          style={{
            flex: 1,
            padding: '16px 24px',
            fontSize: '20px',
            fontWeight: '900',
            backgroundColor: '#005dac',
            color: 'white',
            border: '3px solid var(--color-border)',
            borderRadius: '16px',
            cursor: quizCurrentSentenceIdx === sentences.length - 1 ? 'default' : 'pointer',
            opacity: quizCurrentSentenceIdx === sentences.length - 1 ? 0.4 : 1,
            boxShadow: quizCurrentSentenceIdx === sentences.length - 1 ? 'none' : '3px 3px 0px 0px var(--color-border)',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          Next Step ▶
        </button>
      </div>
    </div>
  );
}
