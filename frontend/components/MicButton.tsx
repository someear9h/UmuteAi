
import React from 'react';

interface MicButtonProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

const MicButton: React.FC<MicButtonProps> = ({ isListening, onStart, onStop, disabled }) => {
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    onStart();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (disabled) return;
    onStop();
  };

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      disabled={disabled}
      className={`
        relative flex items-center justify-center
        w-48 h-48 md:w-64 md:h-64 rounded-full transition-all duration-300
        ${isListening 
          ? 'bg-red-600 border-4 border-red-400 animate-pulse-neon' 
          : 'bg-cyan-500 border-4 border-cyan-300 hover:bg-cyan-400 active:scale-95 shadow-lg shadow-cyan-500/50'}
        ${disabled ? 'opacity-20 cursor-not-allowed grayscale' : 'cursor-pointer'}
      `}
    >
      <div className="flex flex-col items-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`w-20 h-20 md:w-24 md:h-24 ${isListening ? 'text-white' : 'text-black'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path 
            strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
          />
        </svg>
        <span className={`mt-2 font-bold text-lg md:text-xl uppercase tracking-widest ${isListening ? 'text-white' : 'text-black'}`}>
          {isListening ? 'Release' : 'Tap & Hold'}
        </span>
      </div>
    </button>
  );
};

export default MicButton;
