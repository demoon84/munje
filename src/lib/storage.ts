import { Question } from './gemini';

export interface SavedQuestionSet {
    id: string;
    questions: Question[];
    createdAt: string;
    imagePreview?: string; // base64 thumbnail
}

const STORAGE_KEY = 'munje_saved_questions';

/**
 * 저장된 모든 문제 세트 가져오기
 */
export function getSavedQuestions(): SavedQuestionSet[] {
    if (typeof window === 'undefined') return [];

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

/**
 * 새 문제 세트 저장
 */
export function saveQuestions(questions: Question[], imagePreview?: string): string {
    const saved = getSavedQuestions();
    const id = Date.now().toString();

    const newSet: SavedQuestionSet = {
        id,
        questions,
        createdAt: new Date().toISOString(),
        imagePreview: imagePreview?.slice(0, 500), // 썸네일만 저장
    };

    // 최신 항목을 맨 앞에 추가, 최대 20개 유지
    const updated = [newSet, ...saved].slice(0, 20);

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
        // Storage full - remove oldest items
        const reduced = updated.slice(0, 10);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reduced));
    }

    return id;
}

/**
 * 특정 문제 세트 가져오기
 */
export function getQuestionSet(id: string): SavedQuestionSet | null {
    const saved = getSavedQuestions();
    return saved.find(s => s.id === id) || null;
}

/**
 * 문제 세트 삭제
 */
export function deleteQuestionSet(id: string): void {
    const saved = getSavedQuestions();
    const updated = saved.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * 모든 저장된 문제 삭제
 */
export function clearAllQuestions(): void {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * 날짜 포맷팅
 */
export function formatDate(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
    });
}
