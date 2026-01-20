"use client";

import { useState, useRef } from 'react';
import { Camera, Image, Loader2, X, Printer, Sparkles } from 'lucide-react';
import { generateQuestions, Question } from '@/lib/gemini';
import ProblemCard from '@/components/ProblemCard';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setQuestions([]);

    try {
      const result = await generateQuestions(selectedFile);
      setQuestions(result);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className={`fixed inset-0 bg-white ${preview && !questions.length ? 'overflow-hidden' : 'overflow-y-auto'}`}>
      {/* Main Content */}
      <div className={`px-4 max-w-lg mx-auto ${preview || questions.length > 0 ? 'pt-8 space-y-6' : 'min-h-screen flex flex-col items-center justify-center pb-[10vh]'}`}>
        {/* Description - only show on initial screen */}
        {!preview && !questions.length && (
          <div className="text-center mb-8">
            <p className="text-[#5f6368] text-base leading-relaxed">
              수학 문제를 촬영하면<br />
              <span className="bg-gradient-to-r from-[#4285F4] to-[#A142F4] bg-clip-text text-transparent font-semibold">AI가 비슷한 유형의 문제 10개</span>를 만들어드려요!
            </p>
          </div>
        )}

        {/* Action Area */}
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
            accept=".jpg,.jpeg,.png,.gif,.heic,.heif"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />

          {/* Preview or Buttons */}
          {preview ? (
            <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center">
              <div className="relative w-full max-w-sm">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full rounded-2xl border border-[#e8eaed] shadow-lg"
                />
                <button
                  onClick={handleCancelFile}
                  className="absolute top-3 right-3 p-2 bg-white/90 text-[#5f6368] rounded-full hover:bg-white hover:text-[#1f1f1f] transition-colors shadow-lg border border-[#e8eaed]"
                >
                  <X className="w-5 h-5" />
                </button>
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

        {/* Results */}
        {questions.length > 0 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-lg font-semibold text-[#1f1f1f]">
                ✨ 생성된 문제
              </h2>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#4285F4] bg-[#4285F4]/10 rounded-full hover:bg-[#4285F4]/20 transition-colors"
              >
                <Printer className="w-4 h-4" />
                인쇄
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, i) => (
                <ProblemCard key={i} index={i} data={q} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Fixed Bottom Button */}
      {preview && !questions.length && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm safe-area-bottom">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-[#4285F4] to-[#A142F4] hover:from-[#3b78e7] hover:to-[#9333EA] text-white font-semibold text-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                분석중...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                문제 생성하기
              </>
            )}
          </button>
        </div>
      )}
    </main>
  );
}
