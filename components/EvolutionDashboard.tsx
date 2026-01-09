
import React from 'react';
import { UserStats } from '../types';

interface EvolutionDashboardProps {
  stats: UserStats;
  isAssessing: boolean;
}

const EvolutionDashboard: React.FC<EvolutionDashboardProps> = ({ stats, isAssessing }) => {
  const getLevelColor = (level: string) => {
    if (level.startsWith('A')) return 'bg-blue-500';
    if (level.startsWith('B')) return 'bg-green-600';
    return 'bg-amber-500';
  };

  const ProgressBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="flex-1 min-w-[100px]">
      <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out`} 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 relative overflow-hidden">
      {isAssessing && (
        <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10 backdrop-blur-[1px]">
          <div className="flex items-center space-x-2 text-blue-600 font-bold text-xs animate-pulse">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Analisando Performance...</span>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-3">
        <div className={`${getLevelColor(stats.level)} text-white w-14 h-14 rounded-xl flex flex-col items-center justify-center shadow-lg transform rotate-3 transition-colors duration-500`}>
          <span className="text-xs font-bold leading-none">LEVEL</span>
          <span className="text-2xl font-black">{stats.level}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Status CEFR</span>
          <span className="text-sm font-bold text-gray-700">
            {stats.level.startsWith('A') ? 'Basic User' : stats.level.startsWith('B') ? 'Independent User' : 'Proficient User'}
          </span>
          <div className="flex items-center mt-1 text-[9px] text-gray-400 font-medium">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Uso: Est. Low Cost
          </div>
        </div>
      </div>

      <div className="flex-1 w-full grid grid-cols-3 gap-4">
        <ProgressBar label="Grammar" value={stats.grammar} color="bg-indigo-500" />
        <ProgressBar label="Vocabulary" value={stats.vocabulary} color="bg-emerald-500" />
        <ProgressBar label="Communication" value={stats.communication} color="bg-rose-500" />
      </div>
    </div>
  );
};

export default EvolutionDashboard;
