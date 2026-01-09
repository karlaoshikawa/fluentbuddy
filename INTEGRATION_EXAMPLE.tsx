// Exemplo de como integrar o sistema de aprendizado no App.tsx

import React, { useState } from 'react';
import { useLiveChat } from './hooks/useLiveChat';
import { useProgressTracker } from './hooks/useProgressTracker';
import { useLearningProgress } from './hooks/useLearningProgress';
import { TEACHER_PERSONAS, SYSTEM_INSTRUCTION } from './constants';
import { LearningPath } from './components/LearningPath';
import { LearningProgressSummary } from './components/LearningProgressSummary';
import { ConnectionStatus, TeacherPersona } from './types';

const AppWithLearning: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<TeacherPersona>(TEACHER_PERSONAS[0]);
  const [showLearningPath, setShowLearningPath] = useState(false);
  
  // Rastreamento de progresso geral
  const { stats, isAssessing, runAssessment } = useProgressTracker();
  
  // Rastreamento de requisitos de aprendizado
  const { 
    progress, 
    getAIContext,
    getNextRequirement 
  } = useLearningProgress(stats.level);

  // Integrar contexto de aprendizado na IA
  const learningContext = getAIContext();

  const { 
    status, 
    transcriptions, 
    isMuted, 
    setIsMuted, 
    startSession, 
    stopSession 
  } = useLiveChat(
    selectedPersona, 
    stats.level, 
    runAssessment,
    learningContext // Passar contexto para a IA
  );

  const handleStart = async () => {
    // Ao iniciar, a IA já saberá o que o usuário precisa praticar
    await startSession();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>FluentBuddy - AI English Teacher</h1>
        <div className="level-indicator">
          Current Level: {stats.level}
        </div>
      </header>

      {!showLearningPath ? (
        <div className="main-content">
          {/* Dashboard Principal */}
          <div className="dashboard-section">
            <LearningProgressSummary 
              currentLevel={stats.level}
              onViewDetails={() => setShowLearningPath(true)}
            />
          </div>

          {/* Área de Chat */}
          <div className="chat-section">
            <div className="persona-selector">
              {TEACHER_PERSONAS.map(persona => (
                <button
                  key={persona.id}
                  onClick={() => setSelectedPersona(persona)}
                  className={selectedPersona.id === persona.id ? 'active' : ''}
                >
                  {persona.name}
                </button>
              ))}
            </div>

            <button 
              onClick={status === ConnectionStatus.CONNECTED ? stopSession : handleStart}
              className={status === ConnectionStatus.CONNECTED ? 'stop-btn' : 'start-btn'}
            >
              {status === ConnectionStatus.CONNECTED ? 'Stop Session' : 'Start Learning'}
            </button>

            {status === ConnectionStatus.CONNECTED && (
              <div className="active-session">
                <div className="transcriptions">
                  {transcriptions.map((t, i) => (
                    <div key={i} className={`message ${t.role}`}>
                      <strong>{t.role === 'user' ? 'You' : selectedPersona.name}:</strong>
                      <p>{t.text}</p>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="mute-btn"
                >
                  {isMuted ? '🔇 Unmute' : '🔊 Mute'}
                </button>
              </div>
            )}
          </div>

          {/* Estatísticas */}
          <div className="stats-section">
            <div className="stat-card">
              <h3>Grammar</h3>
              <div className="stat-value">{stats.grammar}%</div>
            </div>
            <div className="stat-card">
              <h3>Vocabulary</h3>
              <div className="stat-value">{stats.vocabulary}%</div>
            </div>
            <div className="stat-card">
              <h3>Communication</h3>
              <div className="stat-value">{stats.communication}%</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="learning-path-view">
          <button 
            onClick={() => setShowLearningPath(false)}
            className="back-btn"
          >
            ← Back to Dashboard
          </button>
          <LearningPath currentLevel={stats.level} />
        </div>
      )}

      <style jsx>{`
        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .app-header {
          text-align: center;
          color: white;
          margin-bottom: 30px;
        }

        .app-header h1 {
          margin: 0;
          font-size: 36px;
        }

        .level-indicator {
          margin-top: 10px;
          font-size: 18px;
          opacity: 0.9;
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .dashboard-section,
        .chat-section,
        .stats-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
        }

        .persona-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .persona-selector button {
          padding: 10px 20px;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .persona-selector button.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .start-btn,
        .stop-btn,
        .back-btn {
          padding: 15px 30px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .start-btn {
          background: #10b981;
          color: white;
        }

        .start-btn:hover {
          background: #059669;
        }

        .stop-btn {
          background: #ef4444;
          color: white;
        }

        .stop-btn:hover {
          background: #dc2626;
        }

        .back-btn {
          background: #6b7280;
          color: white;
          margin-bottom: 20px;
        }

        .active-session {
          margin-top: 20px;
        }

        .transcriptions {
          max-height: 400px;
          overflow-y: auto;
          margin-bottom: 15px;
        }

        .message {
          margin-bottom: 15px;
          padding: 10px;
          border-radius: 8px;
        }

        .message.user {
          background: #e0e7ff;
        }

        .message.teacher {
          background: #f3f4f6;
        }

        .message strong {
          display: block;
          margin-bottom: 5px;
        }

        .message p {
          margin: 0;
        }

        .mute-btn {
          padding: 10px 20px;
          border: none;
          background: #f3f4f6;
          border-radius: 8px;
          cursor: pointer;
        }

        .stats-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .stat-card {
          text-align: center;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .stat-card h3 {
          margin: 0 0 10px 0;
          color: #6b7280;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #667eea;
        }

        .learning-path-view {
          max-width: 1200px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
};

export default AppWithLearning;
