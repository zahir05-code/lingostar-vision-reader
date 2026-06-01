# LingoStar Vision Reader: Project Overview & Development Guide

## 1. Project Concept
**LingoStar Vision Reader** is a barrier-free English learning application designed for visually impaired students. It adheres to "Mega UI" design principles—maximizing font sizes, high-contrast HSL color mapping, and simplified layout structures to prevent eye strain and facilitate focus for children with low vision.

---

## 2. Design System (Mega UI)
- **Visual Philosophy:** WCAG AAA accessibility standard.
- **Typography:** Large, bold fonts (Outfit) with high letter spacing.
- **Colors:** 
  - Primary: Yellow/Amber for light sensitivity reduction.
  - Accent: Soft Blue/Green for functional distinction.
  - Text: Dark Brown/Black for maximum contrast.
- **Interactive Elements:** Oversized touch targets and clear visual/audio feedback.

---

## 3. Core Learning Scenarios (User Flow)

### Step 1: Passage Insight (지문 탐색)
- **Function:** Provides a high-level overview of a text before detailed reading.
- **Key Features:** Topic, Title, Main Idea, and Structural Summary (Intro/Body/Conclusion).
- **Reference:** `{{DATA:SCREEN:SCREEN_28}}`

### Step 2: Focus Mode (집중 독해)
- **Function:** Minimalist reading environment for individual sentences.
- **Key Features:** Audio pronunciation support, context analysis table.
- **Reference:** `{{DATA:SCREEN:SCREEN_24}}`, `{{DATA:SCREEN:SCREEN_15}}`

### Step 3: Chunk & Grammar Mode (청크 및 문법)
- **Function:** Breaks sentences into meaningful semantic units (Subject, Verb, Object).
- **Key Features:** Visual syntax mapping, direct translation below each chunk, and simplified grammar notes.
- **Reference:** `{{DATA:SCREEN:SCREEN_2}}`, `{{DATA:SCREEN:SCREEN_11}}`

### Step 4: Structure Analysis (문법 구조 분석)
- **Function:** Deep dive into sentence components.
- **Key Features:** Sentence selection navigation (1-5), pattern identification, and word-for-word analysis.
- **Reference:** `{{DATA:SCREEN:SCREEN_1}}`, `{{DATA:SCREEN:SCREEN_19}}`

### Step 5: Passage Type Feedback (글의 종류 학습)
- **Function:** Identifying the genre of the text (Expository, Persuasive, etc.).
- **Key Features:** Interactive buttons with immediate correct/incorrect feedback and reasoning.
- **Reference:** `{{DATA:SCREEN:SCREEN_23}}`, `{{DATA:SCREEN:SCREEN_21}}`

### Step 6: Advanced Vocab Learning (어휘 학습)
- **Function:** Systematic vocabulary mastery.
- **Key Features:** Native pronunciation, synonyms/antonyms, example sentences, and a custom vocabulary list that accumulates words touched during reading.
- **Reference:** `{{DATA:SCREEN:SCREEN_25}}`

### Step 7: Practice & Review (퀴즈 및 결과)
- **Function:** Reinforcing learning through practice.
- **Key Features:** Sentence Scramble (drag-and-drop chunks), Daily Progress Report (sentences read, words mastered, quiz accuracy).
- **Reference:** `{{DATA:SCREEN:SCREEN_16}}`, `{{DATA:SCREEN:SCREEN_13}}`

---

## 4. Key Assets & Development References
- **Design Document:** `{{DATA:DOCUMENT:DOCUMENT_12}}` (Detailed color tokens and typography).
- **Core Illustration:** `{{DATA:IMAGE:IMAGE_29}}` (Companionship theme).
- **Layout Variants:** 
  - Amber Classic: `{{DATA:SCREEN:SCREEN_27}}`
  - Soft Blue: `{{DATA:SCREEN:SCREEN_5}}`
  - Dark Mode: `{{DATA:SCREEN:SCREEN_17}}`
