import React from 'react';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { CEFRLevel } from '../types';
import { CATEGORY_NAMES } from '../data';
import { Book, CenterCircle, Renew, Chat, Edit, VolumeUp, Document } from '@carbon/icons-react';

interface LearningProgressSummaryProps {
  currentLevel: CEFRLevel;
  onViewDetails?: () => void;
}

export function LearningProgressSummary({ currentLevel, onViewDetails }: LearningProgressSummaryProps) {
  const { progress, getCategoryProgress, getNextRequirement } = useLearningProgress(currentLevel);
  
  const nextRequirement = getNextRequirement();
  
  const categories = Object.keys(CATEGORY_NAMES) as Array<keyof typeof CATEGORY_NAMES>;

  return (
    <div className="learning-progress-summary">
      <div className="summary-header">
        <h3 className="flex items-center gap-2"><Book size={20} /> Seu Progresso de Aprendizado</h3>
        {onViewDetails && (
          <button onClick={onViewDetails} className="view-details-btn">
            Ver Detalhes →
          </button>
        )}
      </div>

      {nextRequirement && (
        <div className="next-up">
          <div className="next-up-header">
            <span className="next-icon"><CenterCircle size={18} /></span>
            <strong>Próximo na Fila:</strong>
          </div>
          <p className="next-requirement">{nextRequirement.name}</p>
          <p className="next-description">{nextRequirement.description}</p>
        </div>
      )}

      <div className="categories-grid">
        {categories.map(category => {
          const categoryProgress = getCategoryProgress(category);
          return (
            <div key={category} className="category-card">
              <div className="category-icon">
                {category === 'vocabulary' && <Book size={20} />}
                {category === 'grammar' && <Document size={20} />}
                {category === 'verbs' && <Renew size={20} />}
                {category === 'speaking' && <Chat size={20} />}
                {category === 'writing' && <Edit size={20} />}
                {category === 'pronunciation' && <VolumeUp size={20} />}
              </div>
              <div className="category-info">
                <h4>{CATEGORY_NAMES[category]}</h4>
                <div className="mini-progress">
                  <div 
                    className="mini-progress-fill"
                    style={{ width: `${categoryProgress.percentage}%` }}
                  />
                </div>
                <span className="category-stats">
                  {categoryProgress.completed}/{categoryProgress.total} ({categoryProgress.percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .learning-progress-summary {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .summary-header h3 {
          margin: 0;
          font-size: 20px;
          color: #1f2937;
        }

        .view-details-btn {
          padding: 8px 16px;
          background: #475569;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .view-details-btn:hover {
          background: #334155;
        }

        .next-up {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #e2e8f0;
        }

        .next-up-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .next-icon {
          font-size: 20px;
        }

        .next-up-header strong {
          color: #334155;
        }

        .next-requirement {
          margin: 5px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }

        .next-description {
          margin: 5px 0 0 0;
          font-size: 14px;
          color: #64748b;
          opacity: 0.9;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .category-card {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          transition: transform 0.2s;
        }

        .category-card:hover {
          transform: translateY(-2px);
          background: #f3f4f6;
        }

        .category-icon {
          font-size: 24px;
          display: flex;
          align-items: center;
        }

        .category-info {
          flex: 1;
        }

        .category-info h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #374151;
        }

        .mini-progress {
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 6px;
        }

        .mini-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #475569 0%, #334155 100%);
          transition: width 0.3s ease;
        }

        .category-stats {
          font-size: 12px;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}
