
import React from 'react';

const ThinkingAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative flex items-center justify-center w-32 h-32">
        <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping"></div>
        <svg 
          className="w-16 h-16 text-cyan-400 animate-pulse" 
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
        </svg>
      </div>
      <p className="text-cyan-400 text-xl font-bold animate-pulse">Formulating thoughts...</p>
    </div>
  );
};

export default ThinkingAnimation;
