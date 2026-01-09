
import React from 'react';
import { UserStats } from '../types';
import { Renew } from '@carbon/icons-react';

interface EvolutionDashboardProps {
  stats: UserStats;
  isAssessing: boolean;
}

const EvolutionDashboard: React.FC<EvolutionDashboardProps> = ({ stats, isAssessing }) => {
  const getLevelColor = (level: string) => {
    if (level.startsWith('A')) return 'bg-slate-600';
    if (level.startsWith('B')) return 'bg-slate-700';
    return 'bg-slate-800';
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
          <div className="flex items-center space-x-2 text-slate-600 font-bold text-xs animate-pulse">
            <Renew size={16} className="animate-spin" />
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
        </div>
      </div>

      <div className="flex-1 w-full grid grid-cols-3 gap-4">
        <ProgressBar label="Grammar" value={stats.grammar} color="bg-slate-600" />
        <ProgressBar label="Vocabulary" value={stats.vocabulary} color="bg-slate-700" />
        <ProgressBar label="Communication" value={stats.communication} color="bg-slate-800" />
      </div>
    </div>
  );
};

export default EvolutionDashboard;
