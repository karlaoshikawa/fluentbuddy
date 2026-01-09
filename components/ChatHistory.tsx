
import React, { useEffect, useRef } from 'react';
import { TranscriptionEntry } from '../types';

interface ChatHistoryProps {
  entries: TranscriptionEntry[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ entries }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-white rounded-xl border border-gray-100 shadow-inner max-h-[400px]"
    >
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 italic">
          <p>Your conversation history will appear here...</p>
        </div>
      ) : (
        entries.map((entry, idx) => (
          <div 
            key={idx} 
            className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                entry.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
              }`}
            >
              <p className="font-medium text-[10px] uppercase mb-1 opacity-70">
                {entry.role === 'user' ? 'You' : 'Teacher'}
              </p>
              <p className="leading-relaxed">{entry.text}</p>
              <p className="text-[9px] mt-1 text-right opacity-50">
                {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatHistory;
