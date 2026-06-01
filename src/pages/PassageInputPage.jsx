import { useState } from 'react';
import { BigButton } from '../components/BigButton';
import { splitIntoSentences, parseFullPassage, splitIntoChunks } from '../utils/textParser';
import { uploadPassage } from '../utils/firebase';
import { useApp } from '../context/AppContext';
import { analyzeRawPassageWithGemini, parseAnalyzedMaterialWithGemini } from '../utils/gemini';

export default function PassageInputPage({ onSave, onCancel }) {
  const { user, setActivePassage, dictMock, parseDynamicWordMeaning } = useApp(); // 전역 AppContext 연동
  const [step, setStep] = useState(1);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const grade = 'Middle-3'; // 기본 학년 값 추가
  const [sentenceMappings, setSentenceMappings] = useState([]); // { english, korean }[]
  const [isSaving, setIsSaving] = useState(false); // 로딩 상태
  const [cameraModalOpen, setCameraModalOpen] = useState(false); // 카메라 스캔 모달
  const [ocrScanning, setOcrScanning] = useState(false); // OCR 스캔 분석 로딩
  
  const [bgKnowledge, setBgKnowledge] = useState(''); // 지문 배경지식 편집 상태
  const [isLoading, setIsLoading] = useState(false); // AI 분석 로딩
  const [loadingText, setLoadingText] = useState('');
  const [generatedVocab, setGeneratedVocab] = useState([]); // AI가 추출해 낸 어휘 리스트

  const ocrSampleText = `Vincent van Gogh's Sunflowers is a very famous painting that shows bright yellow sunflowers in a vase. When I look at it, I feel happy and warm. The artist used thick paint and bold colors to help visually impaired learners experience art more effectively. Magnification and color customization are essential interventions that provide improved learning experiences. With the help of assistive technology, studying English passages becomes fun and accessible to every student in class in person. We are looking forward to making the world a more equal and beautiful place together.`;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const fileName = file.name;
    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    
    if (extension === '.txt') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setText(event.target.result);
        alert(`📂 [${fileName}] 텍스트 파일 로딩 성공!`);
      };
      reader.readAsText(file);
    } else {
      // PDF or DOCX Mock OCR/Text Extractor 시뮬레이터 작동
      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
        setText(ocrSampleText);
        alert(`📂 [${fileName}] 지능형 보조 문서 해독 완료!\n텍스트 지문이 자동으로 추출되어 입력창에 채워졌습니다.`);
      }, 1200);
    }
  };

  const handleCameraCapture = () => {
    setOcrScanning(true);
    setTimeout(() => {
      setOcrScanning(false);
      setCameraModalOpen(false);
      setText(ocrSampleText);
      alert(`📷 [외부 지문 OCR 분석 대성공]\nVan Gogh의 Sunflowers 영어 지문(6문장)이 성공적으로 스캔 해독되어 채워졌습니다!`);
    }, 1500);
  };

  const handleNextStep = async () => {
    if (!text.trim()) {
      alert('영어 지문을 입력해 주세요!');
      return;
    }

    const savedKey = localStorage.getItem('lingostar_gemini_api_key') || '';
    const isAnalyzedMaterial = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);

    // API Key가 등록되어 있다면 Gemini AI 가동!
    if (savedKey) {
      setIsLoading(true);
      try {
        if (isAnalyzedMaterial) {
          setLoadingText('AI 스마트 해독기가 외부 자료의 잡음을 제거하고 영어 문장, 슬래시 청크, 직독직해 어순을 분해 정밀 분석하고 있습니다... (약 2~3초 소요)');
          const result = await parseAnalyzedMaterialWithGemini(text, savedKey);
          
          if (result && result.sentences && result.sentences.length > 0) {
            setTitle(result.title || '해독된 외부 지문');
            
            // 영어 원문 재구성
            const reconstructedText = result.sentences.map(s => s.english).join(' ');
            setText(reconstructedText);
            
            // 매핑 상태 구성 (직독직해 번역 미리 적용) - chunks 안전 복구 탑재 (유효 글자 청크 가드 이식)
            setSentenceMappings(result.sentences.map(s => {
              // 텍스트가 실제로 있고 비어 있지 않은 유효 청크만 수집
              let finalChunks = (s.chunks || []).filter(c => c && c.text && c.text.trim().length > 0);
              if (finalChunks.length === 0) {
                // AI 응답 chunks가 빈 배열이거나 쓸데없는 노이즈로 비어 있을 때 오프라인 구동 실시간 치유
                finalChunks = splitIntoChunks(s.english || s.text, dictMock);
              }
              return {
                english: s.english,
                chunks: finalChunks.map(c => ({
                  text: c.text || s.english,
                  meaning: c.meaning || c.text || "해석 정보가 없습니다.",
                  tag: c.tag || "S+V",
                  userKorean: c.meaning || c.text || "해석 정보가 없습니다." // AI 번역 적용
                }))
              };
            }));
            
            setGeneratedVocab(result.vocab || []);
            setBgKnowledge(result.backgroundKnowledge || '');
            setStep(2);
            alert('🎉 [AI 스마트 외부자료 해독 대성공]\n유료 분석자료 텍스트의 영어문장, 슬래시 청크, 직독직해가 한 번에 완벽 해독되어 3D Neobrutalism 배리어프리 리더 뷰에 매핑되었습니다!');
          } else {
            throw new Error("지문 구조 해독에 실패했습니다.");
          }
        } else {
          setLoadingText('Gemini AI가 영어 원문의 전체 맥락 분석, 청크 슬래시 분할 및 10대 고난이도 어휘(뜻/동의어/반의어) 사전 구축을 진행 중입니다... (약 2초 소요)');
          const result = await analyzeRawPassageWithGemini(text, savedKey);
          
          if (result && result.sentences && result.sentences.length > 0) {
            setTitle(result.title || 'AI 분석 지문');
            
            // 매핑 상태 구성 (직독직해 번역 미리 적용) - chunks 안전 복구 탑재 (유효 글자 청크 가드 이식)
            setSentenceMappings(result.sentences.map(s => {
              let finalChunks = (s.chunks || []).filter(c => c && c.text && c.text.trim().length > 0);
              if (finalChunks.length === 0) {
                finalChunks = splitIntoChunks(s.english || s.text, dictMock);
              }
              return {
                english: s.english,
                chunks: finalChunks.map(c => ({
                  text: c.text || s.english,
                  meaning: c.meaning || c.text || "해석 정보가 없습니다.",
                  tag: c.tag || "S+V",
                  userKorean: c.meaning || c.text || "해석 정보가 없습니다." // AI 번역 적용
                }))
              };
            }));
            
            setGeneratedVocab(result.vocab || []);
            setBgKnowledge(result.backgroundKnowledge || '');
            setStep(2);
          } else {
            throw new Error("영어 원문 AI 분석 결과가 올바르지 않습니다.");
          }
        }
      } catch (error) {
        console.error("AI Analysis failed, falling back to offline method:", error);
        alert(`⚠️ [AI 스마트 분석 에러 발생]\n오류 내용: ${error.message}\n\n키 발급 상태와 네트워크 연결을 검토해 주세요. 현재 창은 기존 오프라인 수동 편집 모드로 안전하게 전환합니다.`);
        runOfflineParsing();
      } finally {
        setIsLoading(false);
      }
    } else {
      // API Key가 없는 기존 오프라인 모드
      if (isAnalyzedMaterial) {
        alert('⚠️ [외부자료 해독 불가] 외부 유료 분석자료 복사본을 구조적으로 자동 해독하려면 상단의 LingoStar AI 설정 패널에 Free Gemini API Key를 등록하셔야 합니다. 현재는 단순 본문 추출 방식으로 구동합니다.');
      }
      runOfflineParsing();
    }
  };

  const runOfflineParsing = () => {
    // [💡 Safeguard] 복사/붙여넣기 지문 내용 자동 감지 기반 고품질 배경지식 동적 주입!
    const lowerText = text.toLowerCase();
    let detectedBg = '';
    
    if (lowerText.includes('van gogh') || lowerText.includes('sunflower')) {
      detectedBg = "반 고흐의 '해바라기'는 그가 아를에서 동료 고갱과의 우정을 기원하며 노란색의 밝은 집을 장식하기 위해 그린 연작입니다. 특히 두꺼운 물감 질감을 살린 임파스토(Impasto) 화법은 현대에 이르러 저시력/시각 장애 학생을 위한 배리어프리 촉각 입체 예술 기술과 연결되어, 시각을 넘어선 손끝의 촉각 감각으로 예술을 감상할 수 있는 새로운 차원의 접근성을 제공하고 있습니다.";
    } else if (lowerText.includes('peer review') || lowerText.includes('scientific') || lowerText.includes('sharing')) {
      detectedBg = "근대 과학 혁명을 이끈 힘은 지식의 사유화가 아닌 논문 발행과 동료 검토(Peer Review)를 통한 활발한 '공유의 역사'였습니다. 인류 공동의 지적 자산이 주는 문명사적 가치를 다루며, 오늘날 오픈 소스나 공공 데이터 공유 정신이 어떻게 현대 지식 사회를 유지하고 발전시키는지 설명해 줍니다.";
    } else if (lowerText.includes('dog') || lowerText.includes('cortisol') || lowerText.includes('companion')) {
      detectedBg = "인류 역사상 개가 인간의 최초의 동반자가 된 생물학적 배경을 다룹니다. 개와의 상호작용이 스트레스 호르몬인 코르티솔(Cortisol) 수치를 낮추고 옥시토신 분비를 촉진한다는 현대 의학적 연구 결과는 단순한 애완동물을 넘어 정서 치유와 심리적 안정감을 제공하는 배리어프리 동물 매개 치료 맥락과 깊게 연결되어 있습니다.";
    } else if (lowerText.includes('dating') || lowerText.includes('fernanda') || lowerText.includes('apps')) {
      detectedBg = "현대 디지털 사회에서 데이팅 앱과 같은 알고리즘 기반 매칭 기술이 인간 관계에 미치는 심리적/사회적 영향을 다룹니다. 편리한 연결 이면에 숨겨진 피로감과 인간 소외 현상을 성찰하게 하며, 인위적인 디지털 매칭에서 벗어나 주체적이고 자연스러운 인간 관계의 소중함을 되찾으려는 현대 사회의 디지털 디톡스(Digital Detox) 맥락을 담고 있습니다.";
    } else {
      detectedBg = "이 지문은 다양한 학술/인문 분야의 독해 능력을 기르기 위한 지문입니다. 지문에 담긴 어휘의 영한 어순 매핑과 끊어읽기 구조를 학습하며 독해력을 넓혀보세요.";
    }
    
    setBgKnowledge(detectedBg);
    const cleanedSentences = splitIntoSentences(text);

    if (cleanedSentences.length === 0) {
      alert('분석 가능한 영어 문장이 없습니다. 다시 입력해 주세요.');
      return;
    }

    const autoTitle = cleanedSentences[0]
      ? (cleanedSentences[0].length > 30 ? cleanedSentences[0].slice(0, 30) + '...' : cleanedSentences[0])
      : '새로운 지문';
    setTitle(autoTitle);

    setSentenceMappings(cleanedSentences.map(english => {
      let chunks = splitIntoChunks(english, dictMock);
      if (!chunks || chunks.length === 0) {
        chunks = [{ text: english, meaning: "해석 정보가 없습니다.", tag: "S+V" }];
      }
      return {
        english,
        chunks: chunks.map(c => ({ 
          text: c.text || english, 
          meaning: c.meaning || "해석 정보가 없습니다.", 
          tag: c.tag || "S+V", 
          userKorean: c.meaning || '' 
        }))
      };
    }));

    setStep(2);
  };

  // 청크별 한국어 변경 핸들러
  const handleChunkKoreanChange = (sentIdx, chunkIdx, value) => {
    setSentenceMappings(prev => {
      const updated = [...prev];
      const updatedChunks = [...updated[sentIdx].chunks];
      updatedChunks[chunkIdx] = { ...updatedChunks[chunkIdx], userKorean: value };
      updated[sentIdx] = { ...updated[sentIdx], chunks: updatedChunks };
      return updated;
    });
  };



  // AI 직독직해 초안 자동 생성 (청크별 지능형 영한 결합 파서)
  const handleGenerateAiDraft = () => {
    setSentenceMappings(prev =>
      prev.map(item => ({
        ...item,
        chunks: item.chunks.map(c => {
          // 청크 내 단어별 뜻 수집 및 자연스러운 한글 결합
          const wordsList = c.text.replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim().split(/\s+/);
          const translatedWords = wordsList.map(w => {
            const lower = w.toLowerCase();
            const entry = dictMock[lower] || parseDynamicWordMeaning(w);
            const meaningStr = entry 
              ? (typeof entry === 'object' ? entry.meaning : entry) 
              : '';
            
            if (!meaningStr || meaningStr.includes('뜻을 알 수 없음')) return '';
            // 여러 개의 사전 단어 뜻 중 첫 번째 대표 뜻만 추출
            return meaningStr.split(',')[0].trim();
          }).filter(Boolean);

          let combinedMeaning = translatedWords.join(' ');
          
          // 사전 매핑 결과가 없을 때의 똑똑한 가이드 번역 생성
          if (!combinedMeaning || combinedMeaning.trim().length === 0) {
            combinedMeaning = c.meaning 
              ? c.meaning.replace(/^[a-zA-Z\s]+(?=행동|상태|대상|위치|~|\.\.)/, '').trim()
              : '어순 번역 준비 완료';
          }



          return {
            ...c,
            userKorean: combinedMeaning
          };
        })
      }))
    );
  };

  const handleSave = () => {
    // 1. 임시 고유 ID 생성 (Firestore 업로드 완료 전에 상태 관리용으로 사용)
    const tempDocId = 'local-' + Date.now();
    const passageData = parseFullPassage(title || '새로운 지문', grade, text, dictMock);
    
    // AI가 추출한 어휘 딕셔너리 목록을 지문에 탑재! (B안 핵심 데이터 스키마 확장)
    if (generatedVocab && generatedVocab.length > 0) {
      passageData.vocab = generatedVocab;
    }

    // 배경지식 정보 주입 (입력된 값이 있으면 사용, 없으면 디폴트)
    passageData.backgroundKnowledge = bgKnowledge.trim() || '이 지문에 담긴 깊은 배경과 맥락을 학습하며 문해력을 넓혀보세요.';
    
    // 청크별 사용자 번역을 passageData에 주입
    passageData.sentences = passageData.sentences.map((sent, idx) => {
      const mapping = sentenceMappings[idx];
      if (!mapping) return sent;
      return {
        ...sent,
        chunks: sent.chunks.map((chunk, cIdx) => ({
          ...chunk,
          meaning: (mapping.chunks[cIdx]?.userKorean) || chunk.meaning || ''
        }))
      };
    });

    const savedPassage = { id: tempDocId, ...passageData, createdAt: new Date() };

    // 2. LocalStorage에 즉시 동기화 캐싱 (네트워크 대기 없이 즉각 로컬 영속화!)
    try {
      const existing = localStorage.getItem('lingo-passages');
      const list = existing ? JSON.parse(existing) : [];
      // 중복 방지
      const filtered = list.filter(item => item.title !== savedPassage.title);
      const updatedList = [savedPassage, ...filtered];
      localStorage.setItem('lingo-passages', JSON.stringify(updatedList));
    } catch (e) {
      console.warn("Local storage cache write failed:", e);
    }

    // 3. UI 및 부모 상태에 즉시 전파 (탭 터치 즉시 복귀!)
    setActivePassage(savedPassage);
    if (onSave) {
      onSave(savedPassage);
    }

    // 4. 백그라운드에서 Firestore 비동기 업로드 실행 (UI 스레드를 방해하지 않음!)
    const loggedInUid = user ? user.uid : 'guest_user';
    uploadPassage(loggedInUid, passageData)
      .then((realDocId) => {
        console.log("Firestore background sync successful! Assigned real ID:", realDocId);
        // 백그라운드 완료 후 LocalStorage에 실제 Firestore ID 반영
        try {
          const existing = localStorage.getItem('lingo-passages');
          if (existing) {
            const list = JSON.parse(existing);
            const updated = list.map(item => item.id === tempDocId ? { ...item, id: realDocId } : item);
            localStorage.setItem('lingo-passages', JSON.stringify(updated));
          }
        } catch (e) {
          console.warn("Background ID replace failed:", e);
        }
      })
      .catch((error) => {
        console.warn("Firestore background sync failed, data is safely cached in LocalStorage:", error);
      });
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      gap: '32px', 
      paddingBottom: '64px',
      fontFamily: "'Outfit', 'Pretendard', sans-serif"
    }}>
      
      {/* 고대비 단계 표시 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontSize: '44px', margin: 0, fontWeight: '900', color: 'var(--color-text)' }}>
          📝 새 지문 추가
        </h2>
      </div>

      {/* 1단계: 영어 본문 통입력 */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', flex: 1 }}>

          <div className="neo-3d-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, backgroundColor: '#fffdec', marginTop: '12px' }}>
            <label htmlFor="passage-text" style={{ fontSize: '32px', fontWeight: '900', color: 'var(--color-text)' }}>
              ✍️ 영어 지문 또는 외부 분석자료 붙여넣기
            </label>
            <p style={{ fontSize: '20px', fontWeight: '700', opacity: 0.8, margin: 0, color: 'var(--color-text)' }}>
              학습할 전체 영어 문단 또는 외부 분석자료 복사본을 아래 창에 바로 붙여넣으세요. LingoStar가 한글 포함 여부를 자동 감지하여 알맞은 모드로 인텔리전트하게 해독합니다.
            </p>

            {/* 외부 지문 수집용 초강력 A11y 버튼 세트 (파일 업로드 & 카메라 스캔) */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', margin: '8px 0' }}>
              <input 
                type="file" 
                id="passage-file-input" 
                style={{ display: 'none' }} 
                accept=".txt,.pdf,.docx" 
                onChange={handleFileUpload} 
              />
              <button
                className="neo-3d-button"
                onClick={() => document.getElementById('passage-file-input').click()}
                style={{ 
                  flex: 1, 
                  backgroundColor: '#a5c8ff', 
                  color: '#002f6c', 
                  fontSize: '20px', 
                  minHeight: '64px',
                  boxShadow: '4px 4px 0px 0px #5d4037'
                }}
              >
                📂 영어 지문 파일 읽기 (.txt, .pdf, .docx)
              </button>
              <button
                className="neo-3d-button"
                onClick={() => setCameraModalOpen(true)}
                style={{ 
                  flex: 1, 
                  backgroundColor: '#ffe9e3', 
                  color: '#5d4037', 
                  fontSize: '20px', 
                  minHeight: '64px',
                  boxShadow: '4px 4px 0px 0px #5d4037'
                }}
              >
                📷 카메라 외부지문 촬영 (Mock OCR)
              </button>
            </div>

            <textarea 
              id="passage-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Vincent van Gogh's Sunflowers is a very famous painting that shows bright yellow sunflowers in a vase. When I look at it..."
              className="neo-3d-input"
              style={{
                flex: 1,
                fontSize: '26px',
                padding: '24px',
                resize: 'none',
                lineHeight: '1.6',
                minHeight: '280px',
                borderWidth: '4px',
                boxShadow: '6px 6px 0px 0px #5d4037'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <button 
              className="neo-3d-button"
              onClick={onCancel}
              style={{ flex: 1, backgroundColor: '#ffffff', color: '#5d4037' }}
            >
              취소
            </button>
            <button 
              className="neo-3d-button"
              onClick={handleNextStep}
              style={{ flex: 2, backgroundColor: '#a5c8ff', color: '#002f6c' }}
            >
              다음: 해석 대칭 매핑하기 ▶
            </button>
          </div>
        </div>
      )}

      {/* 2단계: 문장별 한국어 매핑 */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', flex: 1 }}>
          
          <div className="neo-3d-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#fffdec', padding: '32px' }}>
            <h3 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--color-text)', margin: 0 }}>
              💡 구/절 덩어리별 직독직해 매핑
            </h3>
            <p style={{ fontSize: '20px', fontWeight: '700', opacity: 0.8, margin: 0, color: 'var(--color-text)' }}>
              각 영어 문장의 끊어읽기 청크 아래에 매핑되는 한국어 직독직해(영어 어순 해설)를 최종 조율하세요.
            </p>

            <button
              className="neo-3d-button"
              onClick={handleGenerateAiDraft}
              style={{ 
                width: '100%', 
                backgroundColor: '#a3f69c', 
                color: '#005312', 
                fontSize: '22px',
                minHeight: '64px',
                boxShadow: '4px 4px 0px 0px #5d4037'
              }}
            >
              ✨ AI 직독직해 한글 초안 자동 생성하기
            </button>
          </div>

          {/* 문장 대칭 다중 매핑 리스트 */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '32px', 
            overflowY: 'auto', 
            maxHeight: '600px',
            paddingRight: '16px'
          }}>
            {sentenceMappings.map((mapping, sentIdx) => {
              // chunks가 없거나 비어 있으면 가로 테두리선(빈 카드) 렌더링을 완전히 차단
              if (!mapping.chunks || mapping.chunks.length === 0) return null;

              return (
                <div 
                  key={sentIdx} 
                  className="neo-3d-card"
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0', 
                    padding: 0,
                    backgroundColor: 'var(--color-bg)',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}
                >
                  {/* 문장 번호 헤더 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '20px 24px',
                    backgroundColor: '#ffe9e3',
                    borderBottom: '4px solid #5d4037'
                  }}>
                    <span className="neo-badge" style={{ 
                      backgroundColor: 'var(--color-primary)', 
                      color: 'var(--color-bg)', 
                      fontSize: '18px',
                      boxShadow: 'none',
                      border: '3px solid #5d4037'
                    }}>
                      문장 {sentIdx + 1}
                    </span>
                    <span style={{ fontSize: '20px', fontWeight: '900', color: '#5d4037' }}>
                      English Sentence structure mapping
                    </span>
                  </div>

                  {/* 청크별 영어 ↔ 한국어 대응 카드 */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '20px', 
                    padding: '24px',
                    backgroundColor: 'var(--color-bg)'
                  }}>
                    {(mapping.chunks || []).map((chunk, chunkIdx) => {
                      // 개별 청크 텍스트가 유효하지 않으면 렌더링 스킵하여 찌그러진 가로줄 생성 원천 차단!
                      if (!chunk || !chunk.text || !chunk.text.trim()) return null;

                      return (
                        <div
                          key={chunkIdx}
                          className="neo-3d-card"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '24px',
                            backgroundColor: chunkIdx % 2 === 0 ? 'var(--color-bg)' : 'var(--color-secondary)',
                            padding: '20px',
                            borderRadius: '16px',
                            border: '3px solid #5d4037',
                            boxShadow: '4px 4px 0px 0px #5d4037',
                            flexShrink: 0
                          }}
                        >
                          {/* 좌: 영어 청크 */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: '8px'
                          }}>
                            <span className="neo-badge" style={{
                              alignSelf: 'flex-start',
                              fontSize: '14px',
                              fontWeight: '900',
                              backgroundColor: '#a5c8ff',
                              color: '#002f6c',
                              padding: '4px 10px',
                              borderWidth: '2px',
                              boxShadow: '1px 1px 0px 0px #5d4037',
                              flexShrink: 0
                            }}>
                              🏷️ 영어 청크 {chunkIdx + 1}
                            </span>
                            <p style={{
                              fontSize: '22px',
                              fontWeight: '900',
                              color: 'var(--color-text)',
                              margin: 0,
                              lineHeight: '1.5',
                              wordBreak: 'break-word'
                            }}>
                              {chunk.text}
                            </p>
                          </div>

                          {/* 우: 한국어 직독직해 입력 */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}>
                            <label style={{
                              fontSize: '15px',
                              fontWeight: '900',
                              color: '#5d4037',
                              marginBottom: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              🇰🇷 어순 직독직해 번역
                            </label>
                            <textarea
                              value={chunk.userKorean || ''}
                              onChange={(e) => handleChunkKoreanChange(sentIdx, chunkIdx, e.target.value)}
                              placeholder={`예) ${chunk.meaning || '직독직해 번역을 입력하세요'}`}
                              className="neo-3d-input"
                              style={{
                                fontSize: '20px',
                                fontWeight: '900',
                                padding: '12px 16px',
                                minHeight: '60px',
                                resize: 'vertical',
                                lineHeight: '1.4',
                                width: '100%',
                                boxSizing: 'border-box',
                                borderWidth: '3px',
                                boxShadow: '3px 3px 0px 0px #5d4037'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 지문 배경지식 편집 카드 */}
          <div className="neo-3d-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#FFFDF2', borderColor: '#5d4037', borderWidth: '3px', boxShadow: '4px 4px 0px 0px #5d4037', padding: '24px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#005dac', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              💡 지문 배경지식 (Passage Background Knowledge) 설정
            </h3>
            <p style={{ fontSize: '16px', fontWeight: '800', opacity: 0.8, margin: 0, color: 'var(--color-text)' }}>
              지문과 관련된 과학적, 역사적, 문화적 배경지식을 입력해 두시면 학생들이 Passage Insight 단계에서 학습 배경으로 습득할 수 있습니다. (AI 스캔 시 한글 자동 생성)
            </p>
            <textarea
              value={bgKnowledge}
              onChange={(e) => setBgKnowledge(e.target.value)}
              placeholder="예) 반 고흐의 '해바라기'는 그가 아를에서 동료 고갱과의 우정을 기원하며 방을 장식하기 위해 그린 그림으로..."
              className="neo-3d-input"
              style={{
                fontSize: '18px',
                fontWeight: '800',
                padding: '14px 18px',
                minHeight: '100px',
                resize: 'vertical',
                lineHeight: '1.5',
                width: '100%',
                boxSizing: 'border-box',
                borderWidth: '3px',
                boxShadow: '3px 3px 0px 0px #5d4037'
              }}
            />
          </div>

          {/* 조작 버튼 */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <button 
              className="neo-3d-button"
              onClick={() => setStep(1)}
              style={{ flex: 1, backgroundColor: '#ffffff', color: '#5d4037' }}
            >
              ◀ 본문 수정하러 가기
            </button>
            <button 
              className="neo-3d-button"
              onClick={handleSave}
              disabled={isSaving}
              style={{ flex: 2, backgroundColor: '#a3f69c', color: '#005312' }}
            >
              {isSaving ? 'LingoStar 저장 중...' : '✅ LingoStar 지문 최종 저장하기'}
            </button>
          </div>
        </div>
      )}

      {/* 📷 카메라 OCR 스캔 시뮬레이션 모달 (Neobrutalism 3D 개편) */}
      {cameraModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(8px)',
          padding: '24px'
        }}>
          <div className="neo-3d-card" style={{
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            borderWidth: '5px',
            boxShadow: '12px 12px 0px 0px #5d4037',
            padding: '40px',
            width: '100%',
            maxWidth: '640px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'relative',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <h3 style={{ 
              fontSize: '36px', 
              fontWeight: '900', 
              color: 'var(--color-primary)', 
              margin: 0, 
              textAlign: 'center',
              textShadow: '2px 2px 0px #ffe9e3'
            }}>
              📷 카메라 외부지문 OCR 스캐너
            </h3>
            
            {/* 뷰파인더 카메라 화면 느낌 */}
            <div style={{
              width: '100%',
              height: '340px',
              border: '4px solid #5d4037',
              borderRadius: '20px',
              backgroundColor: '#111',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
            }}>
              {/* 스캔 빔 모션 CSS */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '6px',
                backgroundColor: 'hsl(140, 100%, 50%)',
                boxShadow: '0 0 20px hsl(140, 100%, 50%)',
                animation: 'scanMotion 2s linear infinite'
              }} />
              
              {ocrScanning ? (
                <div style={{ textAlign: 'center', color: '#fff' }}>
                  <div className="neo-3d-card" style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: '24px',
                    borderColor: 'hsl(140, 100%, 50%)',
                    boxShadow: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div className="spinner" style={{
                      width: '64px', height: '64px',
                      border: '8px solid #333',
                      borderTop: '8px solid hsl(140, 100%, 50%)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>영어 지문 스캔 분석 중...</p>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#aaa', padding: '24px' }}>
                  <span style={{ fontSize: '80px', filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.5))' }}>📷</span>
                  <p style={{ fontSize: '22px', marginTop: '20px', color: '#fff', fontWeight: '900' }}>
                    [영어 문서를 뷰파인더 중앙에 맞추세요]
                  </p>
                  <p style={{ fontSize: '16px', opacity: 0.8, color: '#ccc' }}>
                    가로 정렬 가이드 및 눈부심 방지 가이드가 활성화되어 있습니다.
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
              <button
                className="neo-3d-button"
                onClick={handleCameraCapture}
                disabled={ocrScanning}
                style={{ flex: 2, backgroundColor: '#a3f69c', color: '#005312' }}
              >
                📸 찰칵! 지문 촬영 및 텍스트 추출
              </button>
              <button
                className="neo-3d-button"
                onClick={() => setCameraModalOpen(false)}
                disabled={ocrScanning}
                style={{ flex: 1, backgroundColor: '#ffffff', color: '#5d4037' }}
              >
                닫기
              </button>
            </div>
          </div>
          <style>{`
            @keyframes scanMotion {
              0% { top: 0%; }
              50% { top: 100%; }
              100% { top: 0%; }
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}

      {/* AI 스마트 분석 로딩 오버레이 모달 */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 999999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(8px)',
          padding: '24px'
        }}>
          <div className="neo-3d-card" style={{
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            borderWidth: '5px',
            boxShadow: '12px 12px 0px 0px #5d4037',
            padding: '40px',
            width: '100%',
            maxWidth: '580px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            textAlign: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <span style={{ fontSize: '72px', animation: 'spin 3s linear infinite', display: 'inline-block' }}>⚙️</span>
            <h3 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--color-primary)', margin: 0 }}>
              LingoStar AI 분석 진행 중
            </h3>
            <p style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, lineHeight: '1.5', color: 'var(--color-text)' }}>
              {loadingText}
            </p>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '2px solid var(--color-border)'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--color-primary)',
                animation: 'loadingProgress 2s ease-in-out infinite'
              }} />
            </div>
          </div>
          <style>{`
            @keyframes loadingProgress {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}

    </div>
  );
}
