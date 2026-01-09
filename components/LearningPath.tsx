import React, { useState, useEffect } from 'react';
import { 
  CEFR_LEVEL_REQUIREMENTS, 
  CATEGORY_NAMES, 
  LearningRequirement,
  getRequirementsByCategory,
  getTotalRequirements,
  getCompletedRequirements,
  getProgressPercentage
} from '../data';
import { CEFRLevel, UserProgress } from '../types';
import { SyncStatus } from './SyncStatus';
import { useFirebaseSync } from '../hooks/useFirebaseSync';

interface LearningPathProps {
  currentLevel: CEFRLevel;
}

export function LearningPath({ currentLevel }: LearningPathProps) {
  const { isInitialized, isSyncing, lastSyncTime } = useFirebaseSync();
  
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('learning_progress');
    return saved ? JSON.parse(saved) : {
      currentLevel,
      completedRequirements: [],
      lastUpdated: new Date(),
      notes: {}
    };
  });

  const [selectedCategory, setSelectedCategory] = useState<LearningRequirement['category'] | 'all'>('all');
  const [expandedRequirement, setExpandedRequirement] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('learning_progress', JSON.stringify(progress));
  }, [progress]);

  const levelData = CEFR_LEVEL_REQUIREMENTS[currentLevel];
  const requirements = selectedCategory === 'all' 
    ? levelData.requirements 
    : getRequirementsByCategory(currentLevel, selectedCategory);

  const toggleRequirement = (id: string) => {
    setProgress(prev => {
      const isCompleted = prev.completedRequirements.includes(id);
      return {
        ...prev,
        completedRequirements: isCompleted
          ? prev.completedRequirements.filter(rid => rid !== id)
          : [...prev.completedRequirements, id],
        lastUpdated: new Date()
      };
    });
  };

  const addNote = (id: string, note: string) => {
    setProgress(prev => ({
      ...prev,
      notes: { ...prev.notes, [id]: note }
    }));
  };

  const getCategoryProgress = (category: LearningRequirement['category']) => {
    const categoryReqs = getRequirementsByCategory(currentLevel, category);
    const completed = categoryReqs.filter(req => 
      progress.completedRequirements.includes(req.id)
    ).length;
    return {
      completed,
      total: categoryReqs.length,
      percentage: Math.round((completed / categoryReqs.length) * 100)
    };
  };

  const totalProgress = getProgressPercentage(currentLevel);

  return (
    <div className="learning-path">
      <div className="level-header">
        <div className="header-top">
          <div>
            <h2>{levelData.displayName} - {levelData.level}</h2>
            <p className="level-description">{levelData.description}</p>
          </div>
          <SyncStatus 
            isCloudEnabled={isInitialized}
            isSyncing={isSyncing}
            lastSyncTime={lastSyncTime}
          />
        </div>
        
        <div className="overall-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <span className="progress-text">
            {progress.completedRequirements.length} / {getTotalRequirements(currentLevel)} completos ({totalProgress}%)
          </span>
        </div>
      </div>

      <div className="category-filters">
        <button 
          className={selectedCategory === 'all' ? 'active' : ''}
          onClick={() => setSelectedCategory('all')}
        >
          Todos
        </button>
        {Object.entries(CATEGORY_NAMES).map(([key, name]) => {
          const catProgress = getCategoryProgress(key as LearningRequirement['category']);
          return (
            <button
              key={key}
              className={selectedCategory === key ? 'active' : ''}
              onClick={() => setSelectedCategory(key as LearningRequirement['category'])}
            >
              {name} ({catProgress.completed}/{catProgress.total})
            </button>
          );
        })}
      </div>

      <div className="requirements-list">
        {requirements.map(req => {
          const isCompleted = progress.completedRequirements.includes(req.id);
          const isExpanded = expandedRequirement === req.id;
          const userNote = progress.notes[req.id] || '';

          return (
            <div 
              key={req.id} 
              className={`requirement-card ${isCompleted ? 'completed' : ''}`}
            >
              <div className="requirement-header">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => toggleRequirement(req.id)}
                  className="completion-checkbox"
                />
                <div className="requirement-title">
                  <h3>{req.name}</h3>
                  <span className="category-badge">{CATEGORY_NAMES[req.category]}</span>
                </div>
                <button 
                  className="expand-btn"
                  onClick={() => setExpandedRequirement(isExpanded ? null : req.id)}
                >
                  {isExpanded ? '▲' : '▼'}
                </button>
              </div>

              <p className="requirement-description">{req.description}</p>

              {isExpanded && (
                <div className="requirement-details">
                  {req.examples && req.examples.length > 0 && (
                    <div className="examples-section">
                      <h4>Exemplos:</h4>
                      <ul>
                        {req.examples.map((example, idx) => (
                          <li key={idx}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="notes-section">
                    <h4>Suas Anotações:</h4>
                    <textarea
                      value={userNote}
                      onChange={(e) => addNote(req.id, e.target.value)}
                      placeholder="Adicione suas anotações, dúvidas ou progressos aqui..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .learning-path {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 15px;
        }

        .
        .level-header {
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
        }

        .level-header h2 {
          margin: 0 0 10px 0;
          font-size: 28px;
        }

        .level-description {
          margin: 10px 0;
          opacity: 0.9;
        }

        .overall-progress {
          margin-top: 20px;
        }

        .progress-bar {
          width: 100%;
          height: 12px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #4ade80;
          transition: width 0.3s ease;
        }

        .progress-text {
          display: block;
          margin-top: 8px;
          font-size: 14px;
        }

        .category-filters {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .category-filters button {
          padding: 10px 20px;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .category-filters button:hover {
          border-color: #667eea;
          background: #f3f4f6;
        }

        .category-filters button.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .requirements-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .requirement-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s;
        }

        .requirement-card:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        .requirement-card.completed {
          background: #f0fdf4;
          border-color: #4ade80;
        }

        .requirement-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 10px;
        }

        .completion-checkbox {
          width: 24px;
          height: 24px;
          cursor: pointer;
        }

        .requirement-title {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .requirement-title h3 {
          margin: 0;
          font-size: 18px;
          color: #1f2937;
        }

        .category-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #e0e7ff;
          color: #4338ca;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .expand-btn {
          padding: 8px 12px;
          background: #f3f4f6;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .expand-btn:hover {
          background: #e5e7eb;
        }

        .requirement-description {
          margin: 0 0 0 39px;
          color: #6b7280;
          font-size: 14px;
        }

        .requirement-details {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
          margin-left: 39px;
        }

        .examples-section,
        .notes-section {
          margin-bottom: 15px;
        }

        .examples-section h4,
        .notes-section h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .examples-section ul {
          margin: 0;
          padding-left: 20px;
        }

        .examples-section li {
          margin-bottom: 5px;
          color: #6b7280;
          font-size: 14px;
        }

        .notes-section textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
        }

        .notes-section textarea:focus {
          outline: none;
          border-color: #667eea;
        }
      `}</style>
    </div>
  );
}
