import React from 'react';

export const VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', label: 'Calm Professional', gender: 'Female' },
  { id: '29vD33N1CtxCmqQRPOHJ', name: 'Drew', label: 'News Anchor', gender: 'Male' },
  { id: '2EiwWnXFnvU5JabPnv8n', name: 'Clyde', label: 'Deep Executive', gender: 'Male' },
  { id: 'zrHiDhphv9ZnVXBqCLjz', name: 'Mimi', label: 'Youthful', gender: 'Female' },
];

interface VoiceSelectorProps {
  selectedVoice: string;
  onSelect: (id: string) => void;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onSelect }) => {
  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-lg mb-8">
      {VOICES.map((voice) => (
        <button
          key={voice.id}
          onClick={() => onSelect(voice.id)}
          className={`
            p-4 rounded-xl border-2 text-left transition-all
            ${selectedVoice === voice.id 
              ? 'border-cyan-400 bg-cyan-900/20 shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
              : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600'}
          `}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className={`font-bold ${selectedVoice === voice.id ? 'text-white' : 'text-zinc-400'}`}>
                {voice.label}
              </p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">{voice.gender}</p>
            </div>
            {selectedVoice === voice.id && (
              <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"></div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default VoiceSelector;