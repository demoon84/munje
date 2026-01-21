# 변경 내역 (2026-01-21)

## 🚀 주요 기능

### 1. API 및 모델
- **직접 Google Gemini API 사용** - 프록시 제거, 직접 API 호출
- **모델 폴백 시스템** - 할당량 초과 시 자동으로 다음 모델 시도
  - 1순위: `gemini-3-flash`
  - 2순위: `gemini-2.5-flash`
  - 3순위: `gemini-2.5-flash-lite`

### 2. 수학 문제 판별
- 업로드된 이미지가 수학 문제가 **아닌 경우** 안내 메시지 표시
- "처음으로 돌아가기" 버튼 제공

### 3. 문제 저장 기능 (LocalStorage)
- **자동 저장** - 문제 생성 시 LocalStorage에 자동 저장
- **저장 목록 보기** - 오른쪽 상단 히스토리 버튼
- **저장된 문제 불러오기** - 클릭으로 이전 문제 확인
- **삭제 기능** - 개별 문제 세트 삭제 가능
- 최대 20개 문제 세트 보관

---

## 🖨️ 인쇄 기능 개선

### 인쇄 레이아웃
- **1페이지**: 문제 10개 (2열 × 5행)
- **2페이지**: 정답 10개 (1열)

### 스타일 개선
- 타이틀 제거 (깔끔한 레이아웃)
- 좌우 여백 최소화 (100% 너비)
- 선(border) 제거
- 폰트 크기 최적화

---

## 💄 UI/UX 개선

### 이미지 미리보기
- 긴 이미지도 최대 60vh로 제한
- "다른 이미지 선택" 버튼 이미지 **정중앙**에 배치
- 로딩 중 딤드 오버레이 (85% 투명도)

### 갤러리 버튼
- `accept="image/*"` 로 변경
- 모바일에서 **사진 보관함 바로 열림**

### 저장된 문제 버튼
- **오른쪽 상단 고정** 위치
- 저장된 개수 표시
- 저장된 문제 목록 **상단 정렬**

### 기타
- ProblemCard 복사 버튼 제거
- Hydration Warning 수정 (`suppressHydrationWarning`)

---

## 📁 파일 변경 목록

| 파일 | 변경 내용 |
|------|----------|
| `src/app/api/generate/route.ts` | 모델 폴백, 직접 API, 수학문제 판별 |
| `src/app/page.tsx` | 저장 기능, 히스토리 UI, 버튼 위치 |
| `src/lib/storage.ts` | LocalStorage 유틸리티 (신규) |
| `src/lib/gemini.ts` | compressToWebP export, GenerateResult 타입 |
| `src/app/globals.css` | 인쇄 CSS, screen-hidden 클래스 |
| `src/components/ProblemCard.tsx` | 복사 버튼 제거 |
| `src/app/layout.tsx` | suppressHydrationWarning 추가 |

---

## 🔧 환경 설정

### 필수 환경변수 (.env.local)
```
GEMINI_API_KEY=your_api_key_here
```

### 배포 URL
- **Production**: https://munje.vercel.app
