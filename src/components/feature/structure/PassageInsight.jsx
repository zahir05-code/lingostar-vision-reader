import React from 'react';
import { useApp } from '../../../context/AppContext';

/**
 * PassageInsight 컴포넌트
 * 
 * Twins Reading 8단계 학습 중 2단계(구조 분석 1 - Passage Insight)를 담당하는 독립형 컴포넌트입니다.
 * 지문의 전체적인 흐름(Topic, Title, Main Idea, 도입-본론-결론 3단계 타임라인, Final Summary)을
 * 저시력 아동이 시선 이동을 줄이면서 편안하게 훑어볼 수 있도록 3D Neobrutalism 스타일로 렌더링합니다.
 */
export default function PassageInsight() {
  const { 
    activePassage, 
    speakText, 
    setCurrentReadingStep, 
    theme 
  } = useApp();

  // --- 지문 통찰 (Passage Insight) 데이터 동적 파싱 및 유추 로직 ---
  const getPassageInsightData = () => {
    const defaultData = {
      topic: "Companionship",
      title: "The Loyal Dog",
      mainIdea: "Dogs as emotional support.",
      backgroundKnowledge: "개가 인간의 가장 충직한 동반자이자 감정적 지지대가 된 역사적 배경과 상호 작용에 관한 지식입니다. 개는 고대로부터 인간의 사냥과 보호를 도우며 깊은 유대감을 나누어 왔으며, 현대에 이르러서는 단순한 반려동물을 넘어 스트레스 호르몬인 코르티솔을 낮추고 옥시토신을 분비시켜 주는 정서적 치유의 핵심 존재로 자리 잡았습니다.",
      structuralBreakdown: [
        {
          phase: "Introduction (도입)",
          content: "A dog as a loyal companion.",
          summary: "Dogs have been humanity's closest friends throughout history."
        },
        {
          phase: "Body (본론)",
          content: "Supporting through difficult times.",
          summary: "Dogs provide essential emotional support when people face life's hardships."
        },
        {
          phase: "Conclusion (결론)",
          content: "The value of true companionship.",
          summary: "The deep bond between humans and dogs is a unique and valuable treasure."
        }
      ],
      finalSummary: "This passage explores the enduring loyalty of dogs and their vital role in providing comfort and companionship to humans through all stages of life."
    };

    if (!activePassage) return defaultData;

    const titleLower = activePassage.title?.toLowerCase() || '';
    const textLower = activePassage.fullText?.toLowerCase() || '';

    // 1. The Loyal Dog 지문 매핑
    if (titleLower.includes('loyal') || titleLower.includes('dog') || textLower.includes('loyal companion')) {
      return defaultData;
    }

    // 2. Van Gogh's Sunflowers 지문 매핑
    if (titleLower.includes('sunflower') || textLower.includes('sunflower') || textLower.includes('gogh')) {
      return {
        topic: "Art & Perception",
        title: "Van Gogh's Sunflowers",
        mainIdea: "Experiencing art through texture and color.",
        backgroundKnowledge: "반 고흐의 '해바라기'는 그가 프랑스 아를에서 동료 화가 고갱과의 공동생활을 기대하며 그의 방을 꾸미기 위해 그린 역사적인 연작입니다. 반 고흐 특유의 두껍게 칠하는 임파스토(Impasto) 화법과 밝고 대담한 노란색의 대비는 강렬한 생명력과 에너지를 전달하며, 이 강한 질감은 현대 보조 공학 기술을 통해 시각 장애 학생들도 촉각으로 감상할 수 있는 배리어 프리(Barrier-free) 예술의 대표적 대상이 되고 있습니다.",
        structuralBreakdown: [
          {
            phase: "Introduction (도입)",
            content: "Warmth and happiness from bright colors.",
            summary: "The bright yellow sunflowers in a vase make viewers feel happy and warm."
          },
          {
            phase: "Body (본론)",
            content: "Techniques and accessibility in art.",
            summary: "Van Gogh used thick paint and bold colors, which can be enhanced by modern assistive technologies."
          },
          {
            phase: "Conclusion (결론)",
            content: "An inclusive and equal world of learning.",
            summary: "With assistive technology, studying English and art becomes fun and accessible for every student in person."
          }
        ],
        finalSummary: "This passage describes how Van Gogh's Sunflowers uses bold techniques to express warmth, and how modern assistive technologies can make art and English learning accessible and enjoyable for everyone."
      };
    }

    // 3. 2025년 6월 고1 34번 과학 지문 매핑
    if (titleLower.includes('34') || textLower.includes('scientists') || textLower.includes('hypothesis')) {
      return {
        topic: "Scientific Ethics",
        title: "Public Sharing in Science",
        mainIdea: "Science progresses through open information sharing.",
        backgroundKnowledge: "과학사에서 지식의 공개적 공유와 검증은 근대 과학 혁명(Scientific Revolution)을 이끈 가장 핵심적인 동력입니다. 갈릴레오, 뉴턴 등 초기 과학자들은 발견을 학회와 논문을 통해 투명하게 공개하여 동료들의 검토(Peer Review)와 비판을 받았습니다. 이러한 상호 검증과 반박 과정을 거치며 과학적 사실은 더욱 견고해졌고, 지식의 사회적 자산화(Open Science)를 통해 오늘날 눈부신 인류 공동의 문명 발전을 이끌어 냈습니다.",
        structuralBreakdown: [
          {
            phase: "Introduction (도입)",
            content: "Scientists do not keep discovery to themselves.",
            summary: "When scientists prove some hypothesis, they publish results and make data public."
          },
          {
            phase: "Body (본론)",
            content: "Allowing other scientists to test and refute.",
            summary: "Open data makes it possible for others to reconsider conclusions and correct errors."
          },
          {
            phase: "Conclusion (결론)",
            content: "Constructing new hypotheses for social progress.",
            summary: "Society as a whole will end up knowing more if information is spread as widely as possible."
          }
        ],
        finalSummary: "This passage highlights that science is not a private endeavor, but a public asset that grows when scientists publish, test, and build upon each other's open findings to benefit society as a whole."
      };
    }

    // 임의의 커스텀 지문 추가 시 동적 3단 내용/요약 분할 Fallback 시스템
    const totalSentences = activePassage.sentences?.length || 0;
    const sentenceTexts = activePassage.sentences?.map(s => typeof s === 'string' ? s : (s.english || s.text || '')) || [];
    
    const introText = sentenceTexts[0] || "Introduction of the passage.";
    const bodyText = sentenceTexts[Math.floor(totalSentences / 2)] || "Development of main details.";
    const conclusionText = sentenceTexts[totalSentences - 1] || "Conclusion and summary.";

    return {
      topic: "General Reading",
      title: activePassage.title || "Selected Passage",
      mainIdea: "Grasping the main theme of the reading text.",
      backgroundKnowledge: activePassage.backgroundKnowledge || "이 지문은 인류의 지적 성취와 관련된 깊은 사회문화적/과학적 의미를 담고 있습니다. 본문을 읽으면서 글쓴이가 전달하고자 하는 핵심 메시지와 각 구문의 정밀한 인과관계를 차분하게 분석하며 학습을 넓혀보세요.",
      structuralBreakdown: [
        {
          phase: "Introduction (도입)",
          content: introText.length > 50 ? introText.slice(0, 50) + "..." : introText,
          summary: "The author introduces the main topic and background context of this reading passage."
        },
        {
          phase: "Body (본론)",
          content: bodyText.length > 50 ? bodyText.slice(0, 50) + "..." : bodyText,
          summary: "Detailed supporting points are presented to elaborate on the core message."
        },
        {
          phase: "Conclusion (결론)",
          content: conclusionText.length > 50 ? conclusionText.slice(0, 50) + "..." : conclusionText,
          summary: "The text wraps up by summarizing main points and providing final remarks."
        }
      ],
      finalSummary: `This passage titled "${activePassage.title || 'Selected Passage'}" guides learners through a structured text, starting from an informative introduction to supporting core points and closing with a meaningful conclusion.`
    };
  };

  const data = getPassageInsightData();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      backgroundColor: '#FCF9E3', // 따뜻하고 눈 편한 황색 배경 (WCAG AAA 표준 준수)
      padding: '36px 28px',
      borderRadius: '28px',
      border: '3.5px solid #5d4037',
      boxShadow: '8px 8px 0px 0px #5d4037',
      fontFamily: "'Outfit', 'Inter', 'Pretendard', sans-serif",
      color: '#5d4037'
    }}>
      {/* 1. 상단 미니 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2.5px solid rgba(93, 64, 55, 0.2)',
        paddingBottom: '16px'
      }}>
        {/* LingoStar 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '28px', fontWeight: '900', color: '#0B5ED7' }}>
            LingoStar
          </span>
        </div>
        {/* Stage 1/4 배지 */}
        <div style={{
          fontSize: '20px',
          fontWeight: '900',
          color: '#5d4037',
          backgroundColor: 'rgba(93, 64, 55, 0.08)',
          padding: '6px 16px',
          borderRadius: '20px',
          border: '2px solid #5d4037'
        }}>
          Stage 1/4
        </div>
        {/* 공유 아이콘 피드백 */}
        <div style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => speakText("Sharing features are in preparation.")}>
          ✈️
        </div>
      </div>

      {/* 2. 메인 타이틀 & 데코레이션 밑줄 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
        <h2 style={{
          fontSize: '44px',
          fontWeight: '900',
          color: '#0B5ED7',
          margin: 0,
          letterSpacing: '-0.5px'
        }}>
          Passage Insight
        </h2>
        <div style={{
          width: '120px',
          height: '6px',
          backgroundColor: '#0B5ED7',
          borderRadius: '10px'
        }} />
      </div>

      {/* 3. 핵심 정보 3대 고대비 카드 (Topic, Title, Main Idea) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
        {[
          { tag: "Topic", text: data.topic },
          { tag: "Title", text: data.title },
          { tag: "Main Idea", text: data.mainIdea }
        ].map((card, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#FFF0EA', // 살구빛 둥근 Neobrutalism 카드
              border: '3.5px solid #5d4037',
              borderRadius: '24px',
              padding: '24px 28px',
              boxShadow: '4px 4px 0px 0px #5d4037',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              position: 'relative'
            }}
          >
            {/* 좌상단 회색 성분 뱃지 */}
            <div style={{
              alignSelf: 'flex-start',
              backgroundColor: '#5A5A5A',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: '900',
              padding: '4px 14px',
              borderRadius: '12px',
              fontFamily: "'Outfit', sans-serif"
            }}>
              {card.tag}
            </div>
            {/* 본문 설명 텍스트 */}
            <p style={{
              fontSize: '28px',
              fontWeight: '900',
              color: '#1E1E1E',
              margin: 0,
              lineHeight: '1.3'
            }}>
              {card.text}
            </p>
          </div>
        ))}
      </div>

      {/* 3.5. 지문 배경지식 (Passage Background Knowledge) 카드 */}
      {data.backgroundKnowledge && (
        <div
          style={{
            backgroundColor: '#FFFDED', // 아주 부드럽고 따뜻한 노란 전구빛 카드
            border: '3.5px solid #5d4037',
            borderRadius: '24px',
            padding: '24px 28px',
            boxShadow: '4px 4px 0px 0px #5d4037',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '12px'
          }}
        >
          <div style={{
            alignSelf: 'flex-start',
            backgroundColor: '#0B5ED7',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: '900',
            padding: '4px 14px',
            borderRadius: '12px',
            fontFamily: "'Outfit', sans-serif"
          }}>
            💡 지문 배경지식 (Background Knowledge)
          </div>
          <p style={{
            fontSize: '22px',
            fontWeight: '800',
            color: '#2B2B2B',
            margin: 0,
            lineHeight: '1.6',
            letterSpacing: '0.3px',
            textAlign: 'justify'
          }}>
            {data.backgroundKnowledge}
          </p>
        </div>
      )}

      {/* 4. 영어문장블럭 섹션 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px' }}>
        <h3 style={{
          fontSize: '32px',
          fontWeight: '900',
          color: '#1E1E1E',
          margin: 0
        }}>
          영어문장블럭
        </h3>

        {/* 수직 타임라인 그룹 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          paddingLeft: '72px',
          gap: '32px'
        }}>
          {/* 수직 타임라인 갈색 중심선 */}
          <div style={{
            position: 'absolute',
            left: '26px',
            top: '28px',
            bottom: '28px',
            width: '4px',
            backgroundColor: '#5d4037',
            zIndex: 1
          }} />

          {/* 수직 노드 1, 2, 3 렌더러 */}
          {data.structuralBreakdown.map((item, idx) => {
            // 성분 인덱스에 따른 노드 아이콘 분기
            let iconText = "I→";
            if (idx === 1) iconText = "📄";
            if (idx === 2) iconText = "⚙";

            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {/* 타임라인 파란색 원형 아이콘 */}
                <div style={{
                  position: 'absolute',
                  left: '-72px',
                  top: '8px',
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#0B5ED7',
                  color: '#FFFFFF',
                  border: '3.5px solid #5d4037',
                  boxShadow: '3px 3px 0px 0px #5d4037',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: '900',
                  zIndex: 2
                }}>
                  {iconText}
                </div>

                {/* 타임라인 설명 카드 */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '3.5px solid #5d4037',
                  borderRadius: '24px',
                  padding: '24px',
                  boxShadow: '4px 4px 0px 0px #5d4037',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: '#0B5ED7' }}>
                    {item.phase}
                  </span>
                  <span style={{ fontSize: '26px', fontWeight: '900', color: '#1E1E1E' }}>
                    {item.content}
                  </span>
                  {/* 파란색 둥근 요약 캡슐 */}
                  <div style={{
                    backgroundColor: '#0B5ED7',
                    color: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    fontSize: '22px',
                    fontWeight: '800',
                    lineHeight: '1.4',
                    border: '3px solid #5d4037',
                    boxShadow: '3px 3px 0px 0px #5d4037',
                    marginTop: '8px'
                  }}>
                    {item.summary}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. 최종 한 줄 요약 (녹색 강조 박스) */}
      <div style={{
        backgroundColor: '#2E7D32', // 숲속 녹색
        color: '#FFFFFF',
        border: '4px solid #5d4037',
        borderRadius: '24px',
        padding: '32px 24px',
        boxShadow: '6px 6px 0px 0px #5d4037',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        marginTop: '24px',
        textAlign: 'center'
      }}>
        {/* 노란색 별 데코 */}
        <span style={{ fontSize: '36px', color: '#FFEB3B' }}>☆</span>
        <h4 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>
          Final Summary
        </h4>
        <p style={{
          fontSize: '24px',
          fontWeight: '800',
          lineHeight: '1.6',
          letterSpacing: '0.5px',
          margin: 0
        }}>
          {data.finalSummary}
        </p>
      </div>

      {/* 6. Next Step 둥근 파란색 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
        <button
          onClick={() => {
            speakText("Moving to the next study step.");
            setCurrentReadingStep(3); // 3단계(단어 훈련 2)로 이동
          }}
          className="neo-3d-button"
          style={{
            backgroundColor: '#0B5ED7',
            color: '#FFFFFF',
            border: '4px solid #5d4037',
            boxShadow: '6px 6px 0px 0px #5d4037',
            borderRadius: '50px',
            padding: '20px 48px',
            fontSize: '26px',
            fontWeight: '900',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          Next Step ➔
        </button>
      </div>
    </div>
  );
}
