"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface Question {
    question: string;
    answer: string;
}

export default function ProblemCard({ index, data }: { index: number; data: Question }) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`문제 ${index + 1}: ${data.question}\n정답: ${data.answer}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white rounded-2xl border border-[#e8eaed] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
                <div className="flex justify-between items-start gap-4 mb-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#4285F4] to-[#A142F4] text-white text-sm font-semibold">
                        {index + 1}
                    </span>
                    <button
                        onClick={copyToClipboard}
                        className="text-[#dadce0] hover:text-[#4285F4] transition-colors"
                    >
                        {copied ? <Check className="w-5 h-5 text-[#34A853]" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>
                <p className="text-[#1f1f1f] font-medium leading-relaxed">
                    {data.question}
                </p>
            </div>

            <div className="border-t border-[#e8eaed]">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-4 py-3 flex items-center justify-between text-sm text-[#4285F4] hover:bg-[#f8f9fa] transition-colors font-medium"
                >
                    <span>💡 정답 및 해설 보기</span>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 py-3 text-sm text-[#5f6368] font-medium whitespace-pre-wrap bg-gradient-to-r from-[#4285F4]/5 to-[#A142F4]/5">
                                {data.answer}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
