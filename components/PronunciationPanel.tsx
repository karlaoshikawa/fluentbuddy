
import React from 'react';
import { AnalysisResult } from '../types';
import { Microphone, Close } from '@carbon/icons-react';

interface PronunciationPanelProps {
  result: AnalysisResult;
  onClose: () => void;
}

const PronunciationPanel: React.FC<PronunciationPanelProps> = ({ result, onClose }) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-900 font-bold flex items-center gap-2">
          <Microphone size={20} />
          Pronunciation Breakdown
        </h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-700 transition-colors">
          <Close size={20} />
        </button>
      </div>

      <p className="text-xs text-slate-600 mb-4 italic">"{result.sentence}"</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {result.tips.map((tip, idx) => (
          <div key={idx} className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm">
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-gray-900">{tip.word}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                tip.difficulty === 'hard' ? 'bg-slate-200 text-slate-900' : 
                tip.difficulty === 'medium' ? 'bg-slate-100 text-slate-700' : 
                'bg-slate-50 text-slate-600'
              }`}>
                {tip.difficulty}
              </span>
            </div>
            <p className="text-slate-600 font-mono text-xs mb-1">{tip.ipa}</p>
            <p className="text-[11px] text-gray-600 leading-tight">{tip.tip}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-700 font-medium">Teacher's Note:</p>
        <p className="text-xs text-slate-600 mt-1">{result.overallAdvice}</p>
      </div>
    </div>
  );
};

export default PronunciationPanel;
