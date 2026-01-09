
import React from 'react';
import { AnalysisResult } from '../types';

interface PronunciationPanelProps {
  result: AnalysisResult;
  onClose: () => void;
}

const PronunciationPanel: React.FC<PronunciationPanelProps> = ({ result, onClose }) => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-amber-900 font-bold flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Pronunciation Breakdown
        </h3>
        <button onClick={onClose} className="text-amber-500 hover:text-amber-700 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="text-xs text-amber-700 mb-4 italic">"{result.sentence}"</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {result.tips.map((tip, idx) => (
          <div key={idx} className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm">
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-gray-900">{tip.word}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                tip.difficulty === 'hard' ? 'bg-red-100 text-red-700' : 
                tip.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 
                'bg-green-100 text-green-700'
              }`}>
                {tip.difficulty}
              </span>
            </div>
            <p className="text-blue-600 font-mono text-xs mb-1">{tip.ipa}</p>
            <p className="text-[11px] text-gray-600 leading-tight">{tip.tip}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-amber-200">
        <p className="text-xs text-amber-800 font-medium">Teacher's Note:</p>
        <p className="text-xs text-amber-700 mt-1">{result.overallAdvice}</p>
      </div>
    </div>
  );
};

export default PronunciationPanel;
