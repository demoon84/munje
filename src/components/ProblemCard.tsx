"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Question {
    question: string;
    answer: string;
}

export default function ProblemCard({ index, data }: { index: number; data: Question }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white rounded-2xl border border-[#e8eaed] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#4285F4] to-[#A142F4] text-white text-sm font-semibold flex-shrink-0">
                        {index + 1}
                    </span>
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
