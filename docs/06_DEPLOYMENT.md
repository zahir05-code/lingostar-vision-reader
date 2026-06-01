# 06. Deployment Plan (LingoStar Vision Reader)

작성일: 2026년 05월 18일
수정일: 2026년 05월 18일

## 1. 배포 플랫폼
- **Vercel** 또는 **Netlify** (Zero-configuration 배포 지원)
- GitHub Repository와 연동하여 main 브랜치 푸시 시 자동 배포(CI/CD) 적용

## 2. 빌드 스크립트
본 프로젝트는 Vite + React를 사용하므로 표준 빌드 스크립트를 사용한다.
- **Install**: `npm install`
- **Build**: `npm run build`
- **Output Directory**: `dist`

## 3. 환경 변수 및 데이터 보안 (Environment Variables & Data Security)
실제 모바일 및 웹 출시 빌드를 위해 Firebase 연동에 필요한 클라이언트 API 키 및 설정을 주입합니다.
- **주입 키**: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` 등
- 배포 플랫폼(Vercel/Firebase Console)의 Environment Variables 설정 탭을 통해 안전하게 주입합니다.
- 절대로 `.env` 파일을 GitHub에 커밋하지 않고, `.env.example`을 통해 필요 사양만 안내합니다.

## 4. 배포 전 체크리스트
- [ ] `npm run build` 성공 여부 로컬 확인
- [ ] 브라우저 콘솔 창에 Error 로그가 없는지 확인
- [ ] 개인정보, API 키 등이 코드에 하드코딩 되어있지 않은지 재확인
- [ ] 모든 페이지(라우트)가 새로고침 시 404 에러를 뱉지 않는지 확인 (Vercel의 런타임 리다이렉트 설정 등)
