# 수학친구 🧮✨

> AI가 수학 문제를 분석하고 비슷한 유형의 연습 문제를 생성해주는 스마트 학습 도우미

![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?logo=react)
![Gemini AI](https://img.shields.io/badge/Gemini-2.0_Flash-4285F4?logo=google)
![License](https://img.shields.io/badge/License-MIT-green)

## 📖 소개

**수학친구**는 학생들이 수학 문제를 사진으로 찍어 업로드하면, Google Gemini AI가 해당 문제를 분석하고 **유사한 유형의 문제 10개**를 자동으로 생성해주는 웹 애플리케이션입니다.

## ✨ 주요 기능

### 📷 이미지 기반 문제 분석
- **카메라 촬영**: 모바일에서 직접 수학 문제 촬영
- **갤러리 업로드**: 저장된 이미지 파일 선택
- 지원 형식: JPG, JPEG, PNG, GIF, HEIC, HEIF

### 🤖 AI 문제 생성
- Google Gemini 2.0 Flash 모델 사용
- 이미지 속 수학 문제의 원리와 난이도 자동 분석
- 동일한 유형의 **연습 문제 10개** 자동 생성
- 각 문제에 대한 **정답 및 풀이** 제공

### 🎨 모던 UI/UX
- Gemini 스타일의 깔끔한 라이트 테마
- 블루/퍼플 그라데이션 액센트
- 반응형 모바일 최적화 디자인
- 부드러운 애니메이션 효과

### 🖨️ 인쇄 지원
- 생성된 문제 인쇄 기능
- PDF 저장 가능

## 🛠️ 기술 스택

| 분류 | 기술 |
|------|------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS 4 |
| **AI** | Google Gemini API (gemini-2.0-flash) |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |
| **State** | Zustand |
| **Deployment** | Vercel |

## 🚀 시작하기

### 사전 요구사항
- Node.js 18+
- Google Gemini API 키 ([발급받기](https://aistudio.google.com/apikey))

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/your-username/munje.git
cd munje

# 의존성 설치
npm install

# 환경 변수 설정
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 모바일에서 테스트

```bash
# 로컬 네트워크에서 접속 가능하도록 실행
npm run dev -- --hostname 0.0.0.0
```

같은 Wi-Fi 네트워크의 모바일 기기에서 `http://[컴퓨터IP]:3000` 으로 접속

## 📁 프로젝트 구조

```
munje/
├── src/
│   ├── app/
│   │   ├── api/generate/   # 문제 생성 API 라우트
│   │   ├── globals.css     # 전역 스타일
│   │   ├── layout.tsx      # 레이아웃
│   │   └── page.tsx        # 메인 페이지
│   ├── components/
│   │   └── ProblemCard.tsx # 문제 카드 컴포넌트
│   └── lib/
│       └── gemini.ts       # Gemini API 호출 유틸
├── public/
│   └── logo.png            # 앱 로고
└── vercel.json             # Vercel 배포 설정
```

## 🌐 배포

Vercel에 자동 배포 설정:

1. Vercel에 프로젝트 연결
2. 환경 변수에 `GEMINI_API_KEY` 추가
3. 배포 완료!

**라이브 데모**: [https://math-friend.vercel.app](https://math-friend.vercel.app)

## 📝 사용 방법

1. **카메라** 또는 **갤러리** 버튼 클릭
2. 수학 문제가 담긴 이미지 선택/촬영
3. **문제 생성하기** 버튼 클릭
4. AI가 분석 후 유사 문제 10개 생성
5. 각 문제의 **정답 및 해설 보기** 클릭으로 답안 확인
6. 필요시 **인쇄** 버튼으로 출력

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

---

Made with ❤️ for students who want to practice math
