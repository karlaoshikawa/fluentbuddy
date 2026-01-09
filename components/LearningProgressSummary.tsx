import React from 'react';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { CEFRLevel } from '../types';
import { CATEGORY_NAMES } from '../data';

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
        <h3>📚 Seu Progresso de Aprendizado</h3>
        {onViewDetails && (
          <button onClick={onViewDetails} className="view-details-btn">
            Ver Detalhes →
          </button>
        )}
      </div>

      {nextRequirement && (
        <div className="next-up">
          <div className="next-up-header">
            <span className="next-icon">🎯</span>
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
                {category === 'vocabulary' && '📖'}
                {category === 'grammar' && '📝'}
                {category === 'verbs' && '🔄'}
                {category === 'speaking' && '🗣️'}
                {category === 'writing' && '✍️'}
                {category === 'pronunciation' && '🎵'}
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
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .view-details-btn:hover {
          background: #5568d3;
        }

        .next-up {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
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
          color: #92400e;
        }

        .next-requirement {
          margin: 5px 0;
          font-size: 16px;
          font-weight: 600;
          color: #78350f;
        }

        .next-description {
          margin: 5px 0 0 0;
          font-size: 14px;
          color: #92400e;
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
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
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
