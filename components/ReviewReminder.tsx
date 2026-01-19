import React, { useState } from 'react';
import { ReviewItem } from '../types';
import { ChevronRight, Renew, Calendar, ChevronUp, ChevronDown } from '@carbon/icons-react';

interface ReviewReminderProps {
  dueItems: ReviewItem[];
  upcomingItems: ReviewItem[];
  onReviewClick: () => void;
}

export function ReviewReminder({ dueItems, upcomingItems, onReviewClick }: ReviewReminderProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  if (dueItems.length === 0 && upcomingItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {dueItems.length > 0 && (
              <div className={isExpanded ? "mb-3" : ""}>
                <div className="flex items-center space-x-2 mb-2">
                  <Renew size={24} className="text-slate-700" />
                  <h3 className="font-bold text-slate-900">Revisão Espaçada</h3>
                  <span className="bg-slate-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {dueItems.length}
                  </span>
                </div>
                
                <div 
                  className={`transition-all duration-300 overflow-hidden ${
                    isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-sm text-slate-700 mb-2">
                    Você tem <strong>{dueItems.length} {dueItems.length === 1 ? 'tópico' : 'tópicos'}</strong> para revisar hoje!
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A repetição espaçada ajuda a fixar o conhecimento na memória de longo prazo. 
                    A IA vai testar esses tópicos durante a conversa.
                  </p>
                </div>
              </div>
            )}

            {upcomingItems.length > 0 && dueItems.length === 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar size={24} className="text-slate-700" />
                  <h3 className="font-bold text-slate-900">Próximas Revisões</h3>
                </div>
                <div 
                  className={`transition-all duration-300 overflow-hidden ${
                    isExpanded ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-sm text-slate-700">
                    {upcomingItems.length} {upcomingItems.length === 1 ? 'tópico agendado' : 'tópicos agendados'} para os próximos 7 dias
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {dueItems.length > 0 && (
              <button
                onClick={onReviewClick}
                className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center space-x-2 shadow-md"
              >
                <span>Iniciar Revisão</span>
                <ChevronRight size={16} />
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isExpanded ? "Retrair" : "Expandir"}
            >
              {isExpanded ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>
          </div>
        </div>

        <div 
          className={`transition-all duration-300 overflow-hidden ${
            isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {dueItems.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-600 font-semibold mb-2">Tópicos para revisar:</p>
              <div className="flex flex-wrap gap-2">
                {dueItems.slice(0, 5).map((item, idx) => (
                  <span
                    key={idx}
                    className="bg-white text-slate-700 px-2 py-1 rounded-lg text-xs font-medium border border-slate-200"
                  >
                    {item.requirementId.split('-').slice(2).join(' ')}
                  </span>
                ))}
                {dueItems.length > 5 && (
                  <span className="text-xs text-slate-500 px-2 py-1">
                    +{dueItems.length - 5} mais
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
