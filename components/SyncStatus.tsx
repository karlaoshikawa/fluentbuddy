import React from 'react';

interface SyncStatusProps {
  isCloudEnabled: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
}

export function SyncStatus({ isCloudEnabled, isSyncing, lastSyncTime }: SyncStatusProps) {
  if (!isCloudEnabled) {
    return (
      <div className="sync-status offline">
        <span className="sync-icon">💾</span>
        <div className="sync-text-container">
          <span className="sync-text">Modo Local</span>
          <span className="sync-subtext">Seu progresso está salvo neste navegador</span>
        </div>
        <style jsx>{`
          .sync-status {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 14px;
            border-radius: 12px;
            font-size: 12px;
            background: #f3f4f6;
            color: #6b7280;
            border: 1px solid #e5e7eb;
          }
          
          .sync-icon {
            font-size: 16px;
          }
          
          .sync-text-container {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          
          .sync-text {
            font-weight: 600;
            color: #4b5563;
          }
          
          .sync-subtext {
            font-size: 10px;
            color: #9ca3af;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`sync-status ${isSyncing ? 'syncing' : 'synced'}`}>
      <span className="sync-icon">
        {isSyncing ? '🔄' : '☁️'}
      </span>
      <span className="sync-text">
        {isSyncing ? 'Sincronizando...' : 'Sincronizado'}
      </span>
      {lastSyncTime && !isSyncing && (
        <span className="sync-time">
          {formatSyncTime(lastSyncTime)}
        </span>
      )}
      
      <style jsx>{`
        .sync-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 12px;
          transition: all 0.3s ease;
        }
        
        .sync-status.syncing {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .sync-status.synced {
          background: #d1fae5;
          color: #065f46;
        }
        
        .sync-icon {
          font-size: 14px;
          animation: ${isSyncing ? 'spin 1s linear infinite' : 'none'};
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .sync-text {
          font-weight: 500;
        }
        
        .sync-time {
          opacity: 0.7;
          font-size: 11px;
        }
      `}</style>
    </div>
  );
}

function formatSyncTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 10) return 'agora';
  if (diffSeconds < 60) return `${diffSeconds}s atrás`;
  if (diffMinutes < 60) return `${diffMinutes}m atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}
