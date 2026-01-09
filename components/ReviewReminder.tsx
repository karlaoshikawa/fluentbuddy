import React from 'react';
import { ReviewItem } from '../types';

interface ReviewReminderProps {
  dueItems: ReviewItem[];
  upcomingItems: ReviewItem[];
  onReviewClick: () => void;
}

export function ReviewReminder({ dueItems, upcomingItems, onReviewClick }: ReviewReminderProps) {
  if (dueItems.length === 0 && upcomingItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {dueItems.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🔄</span>
                <h3 className="font-bold text-amber-900">Revisão Espaçada</h3>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {dueItems.length}
                </span>
              </div>
              <p className="text-sm text-amber-800 mb-2">
                Você tem <strong>{dueItems.length} {dueItems.length === 1 ? 'tópico' : 'tópicos'}</strong> para revisar hoje!
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                A repetição espaçada ajuda a fixar o conhecimento na memória de longo prazo. 
                A IA vai testar esses tópicos durante a conversa.
              </p>
            </div>
          )}

          {upcomingItems.length > 0 && dueItems.length === 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">📅</span>
                <h3 className="font-bold text-amber-900">Próximas Revisões</h3>
              </div>
              <p className="text-sm text-amber-800">
                {upcomingItems.length} {upcomingItems.length === 1 ? 'tópico agendado' : 'tópicos agendados'} para os próximos 7 dias
              </p>
            </div>
          )}
        </div>

        {dueItems.length > 0 && (
          <button
            onClick={onReviewClick}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center space-x-2 shadow-md"
          >
            <span>Iniciar Revisão</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {dueItems.length > 0 && (
        <div className="mt-3 pt-3 border-t border-amber-200">
          <p className="text-xs text-amber-700 font-semibold mb-2">Tópicos para revisar:</p>
          <div className="flex flex-wrap gap-2">
            {dueItems.slice(0, 5).map((item, idx) => (
              <span
                key={idx}
                className="bg-white text-amber-800 px-2 py-1 rounded-lg text-xs font-medium border border-amber-200"
              >
                {item.requirementId.split('-').pop()}
              </span>
            ))}
            {dueItems.length > 5 && (
              <span className="text-amber-600 text-xs font-medium px-2 py-1">
                +{dueItems.length - 5} mais
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
