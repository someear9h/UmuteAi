
import React from 'react';

interface OptionCardProps {
  text: string;
  onClick: () => void;
  index: number;
}

const OptionCard: React.FC<OptionCardProps> = ({ text, onClick, index }) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-6 md:p-8 bg-zinc-900 border-2 border-zinc-700 hover:border-cyan-400 hover:bg-zinc-800 active:bg-zinc-700 transition-all rounded-2xl shadow-xl group"
    >
      <div className="flex items-center space-x-4">
        <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-cyan-900 text-cyan-400 font-bold border border-cyan-700 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
          {index + 1}
        </span>
        <p className="text-xl md:text-2xl font-medium leading-tight text-zinc-100 group-hover:text-white">
          {text}
        </p>
      </div>
    </button>
  );
};

export default OptionCard;
