/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

// 1. AppContext 생성
const AppContext = createContext();

// 초정밀 풍부한 영한 및 이디엄/숙어 사전 사전 데이터
// 초정밀 풍부한 영한 및 이디엄/숙어 사전 데이터 (동의어, 반의어, 유사숙어 정보 내장)
const dictMock = {
  "delete": {
    meaning: "삭제하다, 지우다, 없애다",
    synonyms: "remove, erase, eliminate",
    antonyms: "insert, add, keep"
  },
  "swear": {
    meaning: "맹세하다, 선서하다",
    synonyms: "vow, promise",
    antonyms: "deny, break"
  },
  "swore": "맹세했다",
  "done": {
    meaning: "끝난, 다 된, 완료된",
    synonyms: "finished, completed",
    antonyms: "incomplete, ongoing"
  },
  "essential": {
    meaning: "필수적인, 극히 중요한, 본질적인",
    synonyms: "vital, crucial, indispensable, necessary",
    antonyms: "trivial, optional, unnecessary, minor",
    similarIdioms: "play an essential role in (~에 필수적인 역할을 하다)"
  },
  "comprehend": {
    meaning: "충분히 이해하다, 파악하다, 깨닫다",
    synonyms: "understand, grasp, apprehend, perceive",
    antonyms: "misunderstand, ignore, miss, confuse"
  },
  "accessibility": {
    meaning: "접근성, 이용하기 쉬움",
    synonyms: "availability, approachability, reachability",
    antonyms: "inaccessibility, restriction"
  },
  "focus": {
    meaning: "집중하다, 초점, 집중",
    synonyms: "concentrate, center, zero in on",
    antonyms: "disperse, distract, scatter",
    similarIdioms: "focus on (~에 집중하다), center on (~에 초점을 맞추다)"
  },
  "companion": {
    meaning: "동반자, 도우미, 동료, 안내서",
    synonyms: "partner, associate, helper, guide",
    antonyms: "enemy, stranger, opponent"
  },
  "brushstroke": {
    meaning: "붓 터치, 붓질",
    synonyms: "stroke, touch",
    antonyms: "blank"
  },
  "brushstrokes": {
    meaning: "붓 터치들, 붓질들 (화가의 화법)",
    synonyms: "strokes, touches",
    antonyms: "blanks"
  },
  "bold": {
    meaning: "대담한, 선명한, 굵은",
    synonyms: "brave, striking, vivid, clear",
    antonyms: "timid, faint, dull, pale"
  },
  "colors": {
    meaning: "색상들, 색채, 빛깔",
    synonyms: "shades, hues, tones",
    antonyms: "monochrome, darkness"
  },
  "color": {
    meaning: "색상, 색채",
    synonyms: "shade, hue, tone",
    antonyms: "monochrome"
  },
  "thick": {
    meaning: "두꺼운, 굵은, 진한",
    synonyms: "dense, heavy, deep",
    antonyms: "thin, light, sparse"
  },
  "effectively": {
    meaning: "효과적으로, 실질적으로",
    synonyms: "efficiently, successfully, productively",
    antonyms: "ineffectively, uselessly"
  },
  "effective": {
    meaning: "효과적인, 유효한",
    synonyms: "efficient, successful, productive",
    antonyms: "ineffective, useless"
  },
  "in person": {
    meaning: "직접, 몸소, 친히, 실물로",
    synonyms: "directly, face to face, personally",
    antonyms: "indirectly, online, virtually",
    similarIdioms: "face to face (대면하여), directly (직접적으로)"
  },
  "look forward to": {
    meaning: "~을 고대하다, 간절히 기다리다",
    synonyms: "anticipate, await, long for",
    antonyms: "dread, fear, avoid",
    similarIdioms: "long for (~을 갈망하다), be eager for (~을 열망하다)"
  },
  "looking forward to": {
    meaning: "~을 간절히 고대하는 중이다",
    synonyms: "anticipating, awaiting, longing for",
    antonyms: "dreading, fearing",
    similarIdioms: "longing for (~을 갈망하는 중)"
  },
  "visually impaired": {
    meaning: "시각 장애가 있는, 저시력의",
    synonyms: "low-vision, blind, sightless",
    antonyms: "fully-sighted, normal-vision"
  },
  "visually": {
    meaning: "시각적으로, 눈으로 보기에",
    synonyms: "optically, sightly",
    antonyms: "aurally, mentally"
  },
  "impaired": {
    meaning: "손상된, 장애가 있는, 나빠진",
    synonyms: "damaged, disabled, weakened",
    antonyms: "healthy, perfect, unimpaired"
  },
  "assistive technologies": {
    meaning: "보조 기술, 보조 기구",
    synonyms: "supportive gear, accessibility tools",
    antonyms: "standard tools"
  },
  "assistive": {
    meaning: "보조의, 돕는, 지원하는",
    synonyms: "supportive, helpful, aiding",
    antonyms: "obstructive, hindering"
  },
  "technologies": {
    meaning: "기술들, 과학기술들",
    synonyms: "methods, systems, innovations"
  },
  "accessible to": {
    meaning: "~가 접근할 수 있는, 이용할 수 있는",
    synonyms: "available to, open to, reachable by",
    antonyms: "inaccessible to, closed to"
  },
  "learning": {
    meaning: "배움, 학습",
    synonyms: "study, education, acquisition",
    antonyms: "ignorance"
  },
  "low-vision": {
    meaning: "저시력의, 약시의",
    synonyms: "visually impaired, partially blind",
    antonyms: "normal vision, sharp-eyed"
  },
  "vision": {
    meaning: "시력, 시야, 비전, 미래상",
    synonyms: "sight, eye-sight, foresight, dream",
    antonyms: "blindness"
  },
  "reader": {
    meaning: "독자, 읽기 도우미, 낭독기",
    synonyms: "audience, text-to-speech, guide"
  },
  "english": {
    meaning: "영어, 영국의",
    synonyms: "anglo-saxon"
  },
  "passage": {
    meaning: "지문, 구절, 통로, 흐름",
    synonyms: "text, excerpt, paragraph, path",
    antonyms: "whole book"
  },
  "study": {
    meaning: "공부, 학습, 연구, 서재",
    synonyms: "learn, analyze, research",
    antonyms: "play, neglect"
  },
  "student": {
    meaning: "학생",
    synonyms: "learner, pupil, scholar",
    antonyms: "teacher, instructor"
  },
  "students": {
    meaning: "학생들",
    synonyms: "learners, pupils",
    antonyms: "teachers"
  },
  "class": {
    meaning: "수업, 반, 학급, 등급",
    synonyms: "lesson, course, group, grade"
  },
  "chunk": {
    meaning: "청크, 덩어리, 쪼개다",
    synonyms: "block, piece, segment, split",
    antonyms: "whole"
  },
  "structure": {
    meaning: "구조, 구성, 체계",
    synonyms: "system, layout, arrangement",
    antonyms: "chaos, disorder"
  },
  "vocabulary": {
    meaning: "어휘, 단어장, 어휘력",
    synonyms: "wordlist, glossary, lexicon"
  },
  "pronunciation": {
    meaning: "발음, 낭독",
    synonyms: "diction, articulation, speech"
  },
  "native": {
    meaning: "원어민의, 토박이의, 타고난",
    synonyms: "local, indigenous, natural",
    antonyms: "foreign, alien"
  },
  "contrast": {
    meaning: "대비, 대조, 대비시키다",
    synonyms: "difference, distinction, compare",
    antonyms: "similarity, agreement"
  },
  "theme": {
    meaning: "테마, 주제, 제목",
    synonyms: "topic, subject, style"
  },
  "brightness": {
    meaning: "밝기, 조도, 광휘",
    synonyms: "light, luminescence, glow",
    antonyms: "darkness, shadow"
  },
  "pinch": {
    meaning: "집어넣다, 핀치, 꼬집다, 압박",
    synonyms: "squeeze, press",
    antonyms: "expand"
  },
  "zoom": {
    meaning: "줌, 확대/축소, 급상승하다",
    synonyms: "magnify, scale, expand",
    antonyms: "shrink"
  },
  "important": {
    meaning: "중요한, 중대한",
    synonyms: "significant, vital, crucial",
    antonyms: "trivial, minor, useless"
  },
  "difficult": {
    meaning: "어려운, 힘든",
    synonyms: "hard, tough, complex",
    antonyms: "easy, simple, smooth"
  },
  "easy": {
    meaning: "쉬운, 수월한, 안락한",
    synonyms: "simple, effortless, comfortable",
    antonyms: "difficult, hard, painful"
  },
  "artist": {
    meaning: "화가, 예술가",
    synonyms: "painter, creator, master"
  },
  "used": {
    meaning: "사용했다, 익숙한",
    synonyms: "utilized, applied, accustomed",
    antonyms: "unused, brand-new"
  },
  "sunflowers": {
    meaning: "해바라기들",
    synonyms: "helianthuses"
  },
  "sunflower": {
    meaning: "해바라기",
    synonyms: "helianthus"
  },
  "bright": {
    meaning: "밝은, 선명한, 영리한",
    synonyms: "sunny, glowing, smart",
    antonyms: "dark, dull, stupid"
  },
  "yellow": {
    meaning: "노란색의, 황색의",
    synonyms: "amber, gold"
  },
  "shows": {
    meaning: "보여준다, 전시물",
    synonyms: "displays, indicates, exhibits",
    antonyms: "hides, covers"
  },
  "show": {
    meaning: "보여주다, 쇼, 전시",
    synonyms: "display, exhibit, represent",
    antonyms: "hide, conceal"
  },
  "impaired learners": {
    meaning: "장애를 가진 학습자들",
    synonyms: "disabled students, challenged pupils",
    antonyms: "normal students"
  },
  "assistive technology": {
    meaning: "보조 공학 기술",
    synonyms: "accessibility device, support tech",
    antonyms: "standard tech"
  },
  "magnification": {
    meaning: "돋보기 확대, 증폭",
    synonyms: "enlargement, zoom, amplification",
    antonyms: "reduction, shrinkage"
  },
  "customization": {
    meaning: "개인 맞춤화, 커스터마이징",
    synonyms: "personalization, adjustment, tailoring",
    antonyms: "standardization"
  },
  "interventions": {
    meaning: "개입들, 조정들, 교육적 중재",
    synonyms: "treatments, aids, support actions"
  },
  "intervention": {
    meaning: "개입, 조정, 간섭",
    synonyms: "treatment, aid, mediation"
  },
  "experience": {
    meaning: "경험, 체험하다, 겪다",
    synonyms: "undergo, feel, observation",
    antonyms: "avoid"
  },
  "improved": {
    meaning: "개선된, 향상된",
    synonyms: "enhanced, better, advanced",
    antonyms: "worsened, deteriorated"
  },
  "improve": {
    meaning: "개선하다, 향상시키다",
    synonyms: "enhance, boost, advance",
    antonyms: "worsen, damage"
  },
  "accessible": {
    meaning: "접근 가능한, 사용하기 쉬운",
    synonyms: "available, reachable, approachable",
    antonyms: "inaccessible, unreachable"
  },
  "provides": {
    meaning: "제공한다, 지급한다",
    synonyms: "supplies, offers, gives",
    antonyms: "deprives, takes away"
  },
  "provide": {
    meaning: "제공하다, 대비하다",
    synonyms: "supply, offer, give",
    antonyms: "deprive, take"
  },
  "fonts": {
    meaning: "글꼴들, 폰트들",
    synonyms: "typefaces"
  },
  "font": {
    meaning: "글꼴, 폰트",
    synonyms: "typeface"
  },
  "fun": {
    meaning: "재미있는, 즐거운, 재미",
    synonyms: "enjoyment, pleasant, amusing",
    antonyms: "boring, sad, tedious"
  },
  "the": {
    meaning: "그 (정관사)"
  },
  "and": {
    meaning: "그리고, ~와/과"
  },
  "for": {
    meaning: "~을 위한, ~동안에"
  },
  "with": {
    meaning: "~와 함께, ~을 가진"
  },
  "help": {
    meaning: "돕다, 도움, 도우미",
    synonyms: "assist, aid, support",
    antonyms: "hinder, block, obstruct"
  },
  "helper": {
    meaning: "도우미, 조력자",
    synonyms: "assistant, ally, partner",
    antonyms: "hindrance, opponent"
  },
  "becomes": {
    meaning: "~이 된다",
    synonyms: "grows into, turns into"
  },
  "become": {
    meaning: "~이 되다",
    synonyms: "grow into, turn into"
  },
  "hypothesis": {
    meaning: "가설",
    synonyms: "assumption, theory, premise",
    antonyms: "fact, truth, proof"
  },
  "hypotheses": {
    meaning: "가설들",
    synonyms: "assumptions, theories, premises",
    antonyms: "facts, truths, proofs"
  },
  "prove": {
    meaning: "증명하다",
    synonyms: "verify, confirm, validate, demonstrate",
    antonyms: "disprove, refute, deny"
  },
  "experimentally": {
    meaning: "실험적으로",
    synonyms: "heuristically, empirically"
  },
  "in general": {
    meaning: "일반적으로",
    synonyms: "generally, usually, broadly",
    antonyms: "specifically, particularly"
  },
  "themselves": {
    meaning: "그들 자신"
  },
  "derive": {
    meaning: "도출하다, 이끌어내다",
    synonyms: "draw, obtain, extract, deduce",
    similarIdioms: "derive A from B (B로부터 A를 도출하다)"
  },
  "additional": {
    meaning: "추가적인",
    synonyms: "extra, added, supplementary",
    antonyms: "subtracted, basic"
  },
  "theory": {
    meaning: "이론",
    synonyms: "hypothesis, concept, system",
    antonyms: "practice, fact"
  },
  "theories": {
    meaning: "이론들",
    synonyms: "hypotheses, concepts, systems"
  },
  "instead": {
    meaning: "대신에",
    synonyms: "alternatively, rather"
  },
  "publish": {
    meaning: "출판하다, 발표하다",
    synonyms: "release, issue, print, announce",
    antonyms: "conceal, hide, suppress"
  },
  "available": {
    meaning: "이용 가능한, 공개된",
    synonyms: "accessible, obtainable, ready",
    antonyms: "unavailable, limited, restricted"
  },
  "inspection": {
    meaning: "조사, 검토",
    synonyms: "examination, check, review, audit"
  },
  "reconsider": {
    meaning: "다시 고려하다, 재고하다",
    synonyms: "rethink, review, re-evaluate"
  },
  "refute": {
    meaning: "반박하다",
    synonyms: "disprove, contradict, rebut, deny",
    antonyms: "prove, support, verify, confirm"
  },
  "conclusions": {
    meaning: "결론들",
    synonyms: "decisions, deductions, endings"
  },
  "conclusion": {
    meaning: "결론",
    synonyms: "decision, deduction, ending",
    antonyms: "beginning, start"
  },
  "construct": {
    meaning: "세우다, 구성하다, 만들다",
    synonyms: "build, assemble, create, design",
    antonyms: "destroy, demolish, ruin"
  },
  "experiments": {
    meaning: "실험들",
    synonyms: "trials, tests, assays"
  },
  "experiment": {
    meaning: "실험",
    synonyms: "trial, test, assay"
  },
  "assumption": {
    meaning: "가정, 전제",
    synonyms: "supposition, presumption, belief",
    antonyms: "fact, proof, certainty"
  },
  "as a whole": {
    meaning: "전체적으로, 대세로서",
    synonyms: "altogether, in general, entirely",
    antonyms: "partially, individually"
  },
  "spread": {
    meaning: "퍼지다, 퍼뜨리다",
    synonyms: "scatter, distribute, disperse",
    antonyms: "collect, gather, suppress"
  },
  "widely": {
    meaning: "널리, 광범위하게",
    synonyms: "broadly, extensively, commonly",
    antonyms: "narrowly, locally"
  },
  "limited": {
    meaning: "제한된",
    synonyms: "restricted, finite, bounded",
    antonyms: "unlimited, infinite, free"
  },
  "strict": {
    meaning: "엄격한, 엄밀한",
    synonyms: "rigorous, precise, exact, severe",
    antonyms: "loose, lenient, flexible"
  },
  "sense": {
    meaning: "의미, 감각",
    synonyms: "meaning, feeling, intelligence"
  },
  "scientist": {
    meaning: "과학자",
    synonyms: "researcher, scholar"
  },
  "scientists": {
    meaning: "과학자들",
    synonyms: "researchers, scholars"
  },
  "depend on": {
    meaning: "의존하다, ~에 달려있다",
    synonyms: "rely on, count on, turn to, look to, fall back on, lean on",
    similarIdioms: "rely on (~에 의존하다), count on (~을 믿다/의지하다), turn to (~에 의지하다/도움을 청하다), look to (~에게 기대를 걸다/의지하다), fall back on (~에 기대다/의지하다)"
  },
  "farmers": {
    meaning: "농민들, 농부들",
    synonyms: "peasants, growers, cultivators",
    antonyms: "consumers"
  },
  "farmer": {
    meaning: "농민, 농부",
    synonyms: "peasant, grower, cultivator",
    antonyms: "consumer"
  },
  "mouse": {
    meaning: "생쥐, 마우스",
    synonyms: "rodent"
  },
  "mice": {
    meaning: "생쥐들",
    synonyms: "rodents"
  },
  "plague": {
    meaning: "창궐, 전염병, 재앙",
    synonyms: "epidemic, infestation, curse",
    antonyms: "blessing, benefit"
  },
  "terrorise": {
    meaning: "공포에 떨게 하다, 위협하다",
    synonyms: "frighten, intimidate, scare",
    antonyms: "soothe, comfort, reassure"
  },
  "terrorising": {
    meaning: "공포에 떨게 하는, 위협하는",
    synonyms: "frightening, intimidating, scaring",
    antonyms: "soothing, comforting"
  },
  "across": {
    meaning: "~에 걸쳐, 가로질러",
    synonyms: "throughout, over"
  },
  "large": {
    meaning: "광활한, 거대한, 큰",
    synonyms: "huge, vast, broad, massive",
    antonyms: "small, tiny, narrow"
  },
  "swathes": {
    meaning: "넓은 지역들, 구역들",
    synonyms: "strips, bands, tracts"
  },
  "swathe": {
    meaning: "넓은 지역, 구역",
    synonyms: "strip, band, tract"
  },
  "rodent": {
    meaning: "설치류, 쥐",
    synonyms: "mouse, rat"
  },
  "rodents": {
    meaning: "설치류들, 쥐들",
    synonyms: "mice, rats"
  },
  "running": {
    meaning: "달리는, 작동하는, 날뛰는",
    synonyms: "operating, rushing"
  },
  "rampant": {
    meaning: "겉잡을 수 없는, 만연하는, 날뛰는",
    synonyms: "uncontrolled, widespread, epidemic",
    antonyms: "controlled, rare, scarce"
  },
  "homes": {
    meaning: "가정집들, 집들",
    synonyms: "residences, houses"
  },
  "home": {
    meaning: "가정, 집",
    synonyms: "residence, house"
  },
  "ravage": {
    meaning: "황폐화시키다, 파괴하다",
    synonyms: "destroy, devastate, ruin",
    antonyms: "restore, build, save"
  },
  "ravaging": {
    meaning: "황폐화시키는, 파괴하는",
    synonyms: "destroying, devastating, ruining",
    antonyms: "restoring, building"
  },
  "fields": {
    meaning: "밭들, 들판들, 분야들",
    synonyms: "lands, areas, domains"
  },
  "field": {
    meaning: "밭, 들판, 분야",
    synonyms: "land, area, domain"
  },
  "grain": {
    meaning: "곡물",
    synonyms: "cereal, crop"
  },
  "hear": {
    meaning: "듣다, 소문이 나다",
    synonyms: "listen, perceive",
    antonyms: "ignore"
  },
  "hearing": {
    meaning: "청력, 듣기",
    synonyms: "audition"
  }
};

// 동적 한국어 뜻 유추 엔진 (어근/접미사 규칙 파서 - 하위 호환성 100% 반영)
const parseDynamicWordMeaning = (word) => {
  const clean = word.toLowerCase().trim();
  if (dictMock[clean]) {
    return typeof dictMock[clean] === 'object' ? dictMock[clean].meaning : dictMock[clean];
  }
  
  if (clean.endsWith('s') && clean.length > 3) {
    const singular = clean.slice(0, -1);
    if (dictMock[singular]) {
      return typeof dictMock[singular] === 'object' ? dictMock[singular].meaning : dictMock[singular];
    }
  }
  
  if (clean.endsWith('ed') && clean.length > 4) {
    let base = clean.slice(0, -2);
    if (dictMock[base]) {
      return typeof dictMock[base] === 'object' ? `${dictMock[base].meaning} (과거형)` : `${dictMock[base]} (과거형)`;
    }
    if (clean.endsWith('ied')) {
      base = clean.slice(0, -3) + 'y';
      if (dictMock[base]) {
        return typeof dictMock[base] === 'object' ? `${dictMock[base].meaning} (과거형)` : `${dictMock[base]} (과거형)`;
      }
    }
  }

  if (clean.endsWith('ly') && clean.length > 4) {
    const adj = clean.slice(0, -2);
    if (dictMock[adj]) {
      return typeof dictMock[adj] === 'object' ? `${dictMock[adj].meaning}하게` : `${dictMock[adj]}하게`;
    }
  }
  
  if (clean.endsWith('ing') && clean.length > 5) {
    const verb = clean.slice(0, -3);
    if (dictMock[verb]) {
      return typeof dictMock[verb] === 'object' ? `${dictMock[verb].meaning}하는 중` : `${dictMock[verb]}하는 중`;
    }
  }

  let hint = "";
  if (clean.startsWith('un') || clean.startsWith('in') || clean.startsWith('im')) {
    hint = "[반대] ";
  } else if (clean.startsWith('re')) {
    hint = "[재반복] ";
  }

  return `${hint}(뜻을 알 수 없음 - 사전 수정 필요)`;
};

// 실시간 어휘 세부 번역 및 사전 유추 백업 엔진
const fetchLiveWordDefinition = async (word) => {
  const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "").trim();
  if (!cleanWord) return null;
  
  const lower = cleanWord.toLowerCase();
  
  // 1) 로컬 사전 매칭
  if (dictMock[lower]) {
    const entry = dictMock[lower];
    return typeof entry === 'object' ? { word: cleanWord, synonyms: "정보 없음", antonyms: "정보 없음", similarIdioms: "", ...entry } : { word: cleanWord, meaning: entry, synonyms: "정보 없음", antonyms: "정보 없음", similarIdioms: "" };
  }
  
  // 복수/동사 굴절형 접미사 검사
  let base = lower;
  if (lower.endsWith('s') && lower.length > 3 && dictMock[lower.slice(0, -1)]) {
    base = lower.slice(0, -1);
  } else if (lower.endsWith('ed') && lower.length > 4 && dictMock[lower.slice(0, -2)]) {
    base = lower.slice(0, -2);
  } else if (lower.endsWith('ly') && lower.length > 4 && dictMock[lower.slice(0, -2)]) {
    base = lower.slice(0, -2);
  } else if (lower.endsWith('ing') && lower.length > 5 && dictMock[lower.slice(0, -3)]) {
    base = lower.slice(0, -3);
  }
  
  if (base !== lower && dictMock[base]) {
    const entry = dictMock[base];
    const parsedMeaning = parseDynamicWordMeaning(cleanWord);
    return typeof entry === 'object' ? { word: cleanWord, synonyms: entry.synonyms || "정보 없음", antonyms: entry.antonyms || "정보 없음", similarIdioms: entry.similarIdioms || "", ...entry, meaning: parsedMeaning } : { word: cleanWord, meaning: parsedMeaning, synonyms: "정보 없음", antonyms: "정보 없음", similarIdioms: "" };
  }

  // 2) 실시간 Gemini API 유추 백업 작동
  const savedKey = localStorage.getItem('lingostar_gemini_api_key') || '';
  if (savedKey) {
    try {
      const { fetchWordDefinitionWithGemini } = await import('../utils/gemini');
      const apiResult = await fetchWordDefinitionWithGemini(cleanWord, savedKey);
      if (apiResult && apiResult.meaning && !apiResult.meaning.includes('오류')) {
        return apiResult;
      }
    } catch (err) {
      console.error("Live AI lookup failed, falling back to dynamic parser:", err);
    }
  }

  // 3) 폴백: 동적 접미사 유추
  const parsedMeaning = parseDynamicWordMeaning(cleanWord);
  return {
    word: cleanWord,
    meaning: parsedMeaning,
    synonyms: "정보 없음",
    antonyms: "정보 없음",
    similarIdioms: ""
  };
};

// 2. LocalStorage 헬퍼 함수 정의 (오프라인 영속성 보장)
const getUserKey = (uid, key) => {
  const cleanUid = uid || 'guest_user';
  return `lingostar_user_${cleanUid}_${key}`;
};

const getLocalStorageItem = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    
    // JSON 파싱 실패 방지: 따옴표 없는 날것의 문자열은 파싱 없이 즉시 반환
    try {
      return JSON.parse(item);
    } catch {
      return item; // 일반 문자열로 즉시 반환
    }
  } catch (error) {
    console.error(`LocalStorage Read Error for ${key}:`, error);
    return defaultValue;
  }
};

const setLocalStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`LocalStorage Write Error for ${key}:`, error);
  }
};

// 3. AppProvider 구현
export const AppProvider = ({ children }) => {
  // --- 전역 접근성 및 학습 상태 변수 ---
  const [theme, setTheme] = useState(() => getLocalStorageItem(getUserKey(null, 'theme'), 'light'));
  const [fontSize, setFontSize] = useState(() => getLocalStorageItem(getUserKey(null, 'fontSize'), 40));
  const [letterSpacing, setLetterSpacing] = useState(() => getLocalStorageItem(getUserKey(null, 'letterSpacing'), 2));
  const [lineHeight, setLineHeight] = useState(() => getLocalStorageItem(getUserKey(null, 'lineHeight'), 2.0));
  
  // --- 시각 보조 추가 상태 변수 ---
  const [brightness, setBrightness] = useState(() => getLocalStorageItem(getUserKey(null, 'brightness'), 0));
  const [isInvert, setIsInvert] = useState(() => getLocalStorageItem(getUserKey(null, 'isInvert'), false));
  const [isGrayscale, setIsGrayscale] = useState(() => getLocalStorageItem(getUserKey(null, 'isGrayscale'), false));
  const [ttsRate, setTtsRate] = useState(() => getLocalStorageItem(getUserKey(null, 'ttsRate'), 1.0));
  
  // --- 학습 데이터 및 단어장 상태 변수 ---
  const [activePassage, setActivePassage] = useState(() => getLocalStorageItem(getUserKey(null, 'activePassage'), null));
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(() => getLocalStorageItem(getUserKey(null, 'currentSentenceIndex'), 0));
  const [myVocab, setMyVocab] = useState(() => getLocalStorageItem(getUserKey(null, 'myVocab'), []));
  const [user, setUser] = useState(null); // Firebase Auth 인증 정보 저장용

  const [currentReadingStep, setCurrentReadingStep] = useState(1);
  const [readingCounts, setReadingCounts] = useState(() => getLocalStorageItem(getUserKey(null, 'readingCounts'), {}));
  
  // --- 원어민 음성(TTS) 재생 상태 트래커 ---
  const [currentlySpeakingText, setCurrentlySpeakingText] = useState('');

  // --- 사용자 로그인 갱신 시 전용 데이터 역추출 동기화 효과 ---
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const cleanUid = user ? user.uid : 'guest_user';
    setTheme(getLocalStorageItem(getUserKey(cleanUid, 'theme'), 'light'));
    setFontSize(getLocalStorageItem(getUserKey(cleanUid, 'fontSize'), 40));
    setLetterSpacing(getLocalStorageItem(getUserKey(cleanUid, 'letterSpacing'), 2));
    setLineHeight(getLocalStorageItem(getUserKey(cleanUid, 'lineHeight'), 2.0));
    setBrightness(getLocalStorageItem(getUserKey(cleanUid, 'brightness'), 0));
    setIsInvert(getLocalStorageItem(getUserKey(cleanUid, 'isInvert'), false));
    setIsGrayscale(getLocalStorageItem(getUserKey(cleanUid, 'isGrayscale'), false));
    setTtsRate(getLocalStorageItem(getUserKey(cleanUid, 'ttsRate'), 1.0));
    setActivePassage(getLocalStorageItem(getUserKey(cleanUid, 'activePassage'), null));
    setCurrentSentenceIndex(getLocalStorageItem(getUserKey(cleanUid, 'currentSentenceIndex'), 0));
    setMyVocab(getLocalStorageItem(getUserKey(cleanUid, 'myVocab'), []));
    setReadingCounts(getLocalStorageItem(getUserKey(cleanUid, 'readingCounts'), {}));
  }, [user]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // --- 테마(Theme) 변경 실시간 DOM 반영 효과 ---
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setLocalStorageItem(getUserKey(user?.uid, 'theme'), theme);
  }, [theme, user]);

  // --- 타이포그래피 변수 CSS Variables 동적 매핑 효과 ---
  useEffect(() => {
    document.documentElement.style.setProperty('--size-font-base', `${fontSize}px`);
    setLocalStorageItem(getUserKey(user?.uid, 'fontSize'), fontSize);
  }, [fontSize, user]);

  useEffect(() => {
    // 자간 수치 매핑
    document.documentElement.style.setProperty('--letter-spacing-base', `${letterSpacing}px`);
    setLocalStorageItem(getUserKey(user?.uid, 'letterSpacing'), letterSpacing);
  }, [letterSpacing, user]);

  useEffect(() => {
    // 줄간격 수치 매핑
    document.documentElement.style.setProperty('--line-height-base', `${lineHeight}`);
    setLocalStorageItem(getUserKey(user?.uid, 'lineHeight'), lineHeight);
  }, [lineHeight, user]);

  // --- 시각 보조 추가 상태 보존 효과 ---
  useEffect(() => {
    setLocalStorageItem(getUserKey(user?.uid, 'brightness'), brightness);
  }, [brightness, user]);

  // autoPopulateVocab 제거됨 (사용자 명시적 요청: 자동 단어 추출 차단)

  useEffect(() => {
    setLocalStorageItem(getUserKey(user?.uid, 'isInvert'), isInvert);
  }, [isInvert, user]);

  useEffect(() => {
    setLocalStorageItem(getUserKey(user?.uid, 'isGrayscale'), isGrayscale);
  }, [isGrayscale, user]);

  useEffect(() => {
    setLocalStorageItem(getUserKey(user?.uid, 'ttsRate'), ttsRate);
  }, [ttsRate, user]);

  useEffect(() => {
    setLocalStorageItem(getUserKey(user?.uid, 'activePassage'), activePassage);
    // 지문이 새로 활성화되면 스텝퍼와 회독 기록을 리셋 (자동 단어장 채우기는 영구 중단)
    if (activePassage) {
      setCurrentReadingStep(1);
      setReadingCounts({});
      setLocalStorageItem(getUserKey(user?.uid, 'readingCounts'), {});
    }
  }, [activePassage, user]);

  useEffect(() => {
    setLocalStorageItem(getUserKey(user?.uid, 'currentSentenceIndex'), currentSentenceIndex);
  }, [currentSentenceIndex, user]);

  useEffect(() => {
    setLocalStorageItem(getUserKey(user?.uid, 'myVocab'), myVocab);
  }, [myVocab, user]);

  useEffect(() => {
    setLocalStorageItem(getUserKey(user?.uid, 'readingCounts'), readingCounts);
  }, [readingCounts, user]);

  // --- 헬퍼 액션 메서드 ---
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // 💡 [원어민 음성 토글 재생/정지 제어 가드]
      // 만약 이미 말하고 있는 도중에 해당 버튼을 또 클릭했다면, 즉시 오디오 중지하고 반환!
      if (window.speechSynthesis.speaking && currentlySpeakingText === text) {
        window.speechSynthesis.cancel();
        setCurrentlySpeakingText('');
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = ttsRate;
      
      utterance.onend = () => {
        setCurrentlySpeakingText('');
      };
      utterance.onerror = () => {
        setCurrentlySpeakingText('');
      };

      setCurrentlySpeakingText(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('원어민 발음(TTS)이 이 브라우저 환경에서 지원되지 않습니다.');
    }
  };

  const nextSentence = () => {
    if (activePassage && activePassage.sentences && currentSentenceIndex < activePassage.sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
    }
  };

  const prevSentence = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(prev => prev - 1);
    }
  };

  const resetProgress = () => {
    setCurrentSentenceIndex(0);
  };

  // --- 📒 모르는 단어 누적 저장 시 동의어, 반의어, 유사숙어 자동 융합 매핑 ---
  const addToVocab = (word, meaning, sentence) => {
    const cleanWord = word.trim();
    if (!cleanWord) return;
    
    const lower = cleanWord.toLowerCase();
    
    // 이미 등록된 단어인지 검사
    if (!myVocab.some(item => item.word.toLowerCase() === lower)) {
      const dictEntry = dictMock[lower];
      
      // 뜻 정보 정밀 보정 및 자가 치유
      let finalMeaning = meaning || "";
      if (!finalMeaning || 
          finalMeaning.includes("뜻을 알 수 없음") || 
          finalMeaning.toLowerCase() === lower) {
        finalMeaning = typeof dictEntry === 'object' ? dictEntry.meaning : dictEntry;
        if (!finalMeaning) {
          finalMeaning = parseDynamicWordMeaning(cleanWord);
        }
      }

      const synonyms = typeof dictEntry === 'object' ? dictEntry.synonyms || '' : '';
      const antonyms = typeof dictEntry === 'object' ? dictEntry.antonyms || '' : '';
      const similarIdioms = typeof dictEntry === 'object' ? dictEntry.similarIdioms || '' : '';

      const updated = [...myVocab, {
        word: cleanWord,
        meaning: finalMeaning,
        synonyms: synonyms,
        antonyms: antonyms,
        similarIdioms: similarIdioms,
        sentence: sentence || '',
        addedAt: new Date().toISOString()
      }];
      setMyVocab(updated);
      alert(`⭐ 단어 및 숙어장에 추가되었습니다:\n[${cleanWord} : ${finalMeaning}]`);
    } else {
      alert(`이미 등록된 단어/숙어입니다:\n[${cleanWord}]`);
    }
  };

  const removeFromVocab = (word) => {
    const updated = myVocab.filter(item => item.word.toLowerCase() !== word.toLowerCase());
    setMyVocab(updated);
  };

  return (
    <AppContext.Provider value={{
      theme,
      setTheme,
      fontSize,
      setFontSize,
      letterSpacing,
      setLetterSpacing,
      lineHeight,
      setLineHeight,
      brightness,
      setBrightness,
      isInvert,
      setIsInvert,
      isGrayscale,
      setIsGrayscale,
      ttsRate,
      setTtsRate,
      activePassage,
      setActivePassage,
      currentSentenceIndex,
      setCurrentSentenceIndex,
      myVocab,
      setMyVocab,
      user,
      setUser,
      speakText,
      currentlySpeakingText,
      setCurrentlySpeakingText,
      nextSentence,
      prevSentence,
      resetProgress,
      addToVocab,
      removeFromVocab,
      dictMock,
      parseDynamicWordMeaning,
      fetchLiveWordDefinition,
      currentReadingStep,
      setCurrentReadingStep,
      readingCounts,
      setReadingCounts
    }}>
      {children}
    </AppContext.Provider>
  );
};

// 4. Custom Hook 구현으로 사용성 극대화
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp Context must be used within an AppProvider');
  }
  return context;
};
