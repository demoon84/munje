"use client";

import { useState, useRef, useEffect } from 'react';
import { Camera, Image, Loader2, X, Printer, Sparkles, Plus, AlertCircle, Home, History, Trash2 } from 'lucide-react';
import { generateQuestions, compressToWebP, Question } from '@/lib/gemini';
import { saveQuestions, getSavedQuestions, deleteQuestionSet, formatDate, SavedQuestionSet } from '@/lib/storage';
import ProblemCard from '@/components/ProblemCard';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notMathProblem, setNotMathProblem] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [savedSets, setSavedSets] = useState<SavedQuestionSet[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // 저장된 문제 불러오기
  useEffect(() => {
    setSavedSets(getSavedQuestions());
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 즉시 미리보기 표시 (원본 이미지)
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // 백그라운드에서 WebP로 압축
    try {
      const compressed = await compressToWebP(file);
      setSelectedFile(compressed);
    } catch (error) {
      console.error("압축 실패, 원본 사용:", error);
      setSelectedFile(file);
    }
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setNotMathProblem(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setQuestions([]);
    setNotMathProblem(null);

    try {
      const result = await generateQuestions(selectedFile);

      if (result.notMathProblem) {
        setNotMathProblem(result.message || "수학 문제가 아닌 이미지입니다.");
      } else if (result.questions) {
        setQuestions(result.questions);
        // 자동 저장
        saveQuestions(result.questions, preview || undefined);
        setSavedSets(getSavedQuestions());
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewQuestion = () => {
    setQuestions([]);
    setSelectedFile(null);
    setPreview(null);
    setNotMathProblem(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleLoadSaved = (set: SavedQuestionSet) => {
    setQuestions(set.questions);
    setShowHistory(false);
    setSelectedFile(null);
    setPreview(null);
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 문제를 삭제하시겠습니까?')) {
      deleteQuestionSet(id);
      setSavedSets(getSavedQuestions());
    }
  };

  return (
    <main className={`fixed inset-0 bg-white ${preview && !questions.length && !loading ? 'overflow-hidden' : 'overflow-y-auto'}`}>
      {/* Top Right History Button */}
      {savedSets.length > 0 && !showHistory && !questions.length && (
        <button
          onClick={() => setShowHistory(true)}
          className="fixed top-4 right-4 z-40 flex items-center gap-2 px-3 py-2 text-sm text-[#5f6368] bg-white/90 backdrop-blur-sm rounded-full hover:bg-[#f1f3f4] transition-colors shadow-md border border-[#e8eaed] no-print"
        >
          <History className="w-4 h-4" />
          {savedSets.length}
        </button>
      )}

      {/* Main Content */}
      <div className={`px-4 max-w-lg mx-auto ${preview || questions.length > 0 || showHistory ? 'pt-8 space-y-6' : 'min-h-screen flex flex-col items-center justify-center pb-[10vh]'}`}>
        {/* Description - only show on initial screen */}
        {!preview && !questions.length && !showHistory && (
          <div className="text-center mb-8">
            <p className="text-[#5f6368] text-base leading-relaxed">
              수학 문제를 촬영하면<br />
              <span className="bg-gradient-to-r from-[#4285F4] to-[#A142F4] bg-clip-text text-transparent font-semibold">AI가 비슷한 유형의 문제 10개</span>를 만들어드려요!
            </p>
          </div>
        )}

        {/* Saved Questions History */}
        {showHistory && (
          <section className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#1f1f1f]">📚 저장된 문제</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-sm text-[#5f6368] hover:text-[#1f1f1f]"
              >
                닫기
              </button>
            </div>
            <div className="space-y-3">
              {savedSets.map((set) => (
                <div
                  key={set.id}
                  onClick={() => handleLoadSaved(set)}
                  className="p-4 bg-[#f8f9fa] rounded-xl cursor-pointer hover:bg-[#e8eaed] transition-colors flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-[#1f1f1f]">
                      문제 {set.questions.length}개
                    </p>
                    <p className="text-sm text-[#5f6368]">
                      {formatDate(set.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSaved(set.id, e)}
                    className="p-2 text-[#5f6368] hover:text-[#EA4335] hover:bg-white rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {savedSets.length === 0 && (
              <p className="text-center text-[#5f6368] py-8">
                저장된 문제가 없습니다
              </p>
            )}
          </section>
        )}

        {/* Action Area - hide when questions are generated */}
        {!questions.length && !showHistory && (
          <section>

            {/* Hidden file inputs */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={cameraInputRef}
              onChange={handleFileSelect}
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
            />

            {/* Preview or Buttons */}
            {preview ? (
              <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center overflow-auto py-4">
                <div className="relative w-full max-w-sm">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full rounded-2xl border border-[#e8eaed] shadow-lg max-h-[60vh] object-contain"
                  />
                  {/* Centered delete button on image */}
                  {!loading && (
                    <button
                      onClick={handleCancelFile}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 bg-white/95 text-[#5f6368] rounded-full hover:bg-white hover:text-[#1f1f1f] transition-colors shadow-lg border border-[#e8eaed]"
                    >
                      <X className="w-4 h-4" />
                      다른 이미지 선택
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-36 h-36 flex flex-col items-center justify-center gap-3 bg-[#f8f9fa] hover:bg-[#f1f3f4] text-[#1f1f1f] rounded-3xl font-medium active:scale-[0.98] transition-all border-2 border-transparent hover:border-[#4285F4]/30 shadow-sm hover:shadow-md"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4285F4] to-[#A142F4] flex items-center justify-center">
                    <Camera className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm font-medium text-[#5f6368]">카메라</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-36 h-36 flex flex-col items-center justify-center gap-3 bg-[#f8f9fa] hover:bg-[#f1f3f4] text-[#1f1f1f] rounded-3xl font-medium active:scale-[0.98] transition-all border-2 border-transparent hover:border-[#A142F4]/30 shadow-sm hover:shadow-md"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#A142F4] to-[#4285F4] flex items-center justify-center">
                    <Image className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm font-medium text-[#5f6368]">갤러리</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* Not Math Problem Message */}
        {notMathProblem && (
          <section className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 rounded-full bg-[#EA4335]/10 flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-[#EA4335]" />
            </div>
            <h2 className="text-xl font-semibold text-[#1f1f1f] mb-2">
              수학 문제가 아니에요
            </h2>
            <p className="text-[#5f6368] mb-8 max-w-sm">
              {notMathProblem}
            </p>
            <button
              onClick={handleNewQuestion}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4285F4] to-[#A142F4] text-white rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              <Home className="w-5 h-5" />
              처음으로 돌아가기
            </button>
          </section>
        )}

        {/* Results */}
        {questions.length > 0 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
            <div className="flex justify-between items-center px-1 no-print">
              <h2 className="text-lg font-semibold text-[#1f1f1f]">
                ✨ 생성된 문제
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleNewQuestion}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#A142F4] bg-[#A142F4]/10 rounded-full hover:bg-[#A142F4]/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  새 문제
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#4285F4] bg-[#4285F4]/10 rounded-full hover:bg-[#4285F4]/20 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  인쇄
                </button>
              </div>
            </div>

            <div className="space-y-4 no-print">
              {questions.map((q, i) => (
                <ProblemCard key={i} index={i} data={q} />
              ))}
            </div>

            {/* Print Layout - Questions Page */}
            <div className="screen-hidden print-questions">
              {questions.map((q, i) => (
                <div key={i} className="print-question-item">
                  <div className="print-question-number">문제 {i + 1}</div>
                  <div>{q.question}</div>
                </div>
              ))}
            </div>

            {/* Print Layout - Answers Page */}
            <div className="screen-hidden print-answers">
              {questions.map((q, i) => (
                <div key={i} className="print-answer-item">
                  <div className="print-answer-number">{i + 1}.</div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{q.answer}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Fixed Bottom Button */}
      {preview && !questions.length && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm safe-area-bottom no-print">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-[#4285F4] to-[#A142F4] hover:from-[#3b78e7] hover:to-[#9333EA] text-white font-semibold text-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            문제 생성하기
          </button>
        </div>
      )}

      {/* Dimmed Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 no-print">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <Loader2 className="w-10 h-10 animate-spin text-[#4285F4]" />
            <p className="text-[#1f1f1f] font-medium">문제를 생성하고 있어요...</p>
            <p className="text-sm text-[#5f6368]">잠시만 기다려주세요</p>
          </div>
        </div>
      )}
    </main>
  );
}
