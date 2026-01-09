
import React from 'react';

interface VisualizerProps {
  isActive: boolean;
  status: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ isActive, status }) => {
  return (
    <div className="flex items-center justify-center space-x-1 h-12">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-300 ${
            isActive 
              ? 'bg-blue-500 wave-animation' 
              : 'bg-gray-300 h-2'
          }`}
          style={{
            height: isActive ? `${Math.random() * 20 + 10}px` : '8px',
            animationDelay: `${i * 0.1}s`,
            animationDuration: isActive ? `${0.5 + Math.random()}s` : '0s'
          }}
        />
      ))}
    </div>
  );
};

export default Visualizer;
