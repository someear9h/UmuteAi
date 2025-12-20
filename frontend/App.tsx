import React, { useState, useRef } from 'react';
import { AppStatus } from './types';
import { transcribeAudio, deduceIntent, speakText } from './services/geminiService';
import MicButton from './components/MicButton';
import OptionCard from './components/OptionCard';
import ThinkingAnimation from './components/ThinkingAnimation';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [options, setOptions] = useState<string[]>([]);
  const [transcription, setTranscription] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        processAudio(audioBlob);
      };

      mediaRecorder.start();
      setStatus(AppStatus.LISTENING);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setErrorMessage("Microphone access denied.");
      setStatus(AppStatus.ERROR);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processAudio = async (blob: Blob) => {
    setStatus(AppStatus.TRANSCRIBING);
    setErrorMessage(""); 

    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      reader.onloadend = async () => {
        try {
          const base64Result = reader.result as string;
          const base64Audio = base64Result.split(',')[1];
          
          // 1. Send to Backend for Transcription
          const rawText = await transcribeAudio(base64Audio);
          
          if (!rawText || rawText.trim().length === 0) {
            setErrorMessage("I couldn't hear anything.");
            setStatus(AppStatus.ERROR);
            return;
          }
          
          setTranscription(rawText);

          // 2. Send to Backend for Intent
          setStatus(AppStatus.PROCESSING);
          const result = await deduceIntent(rawText);
          
          if (!result.options || result.options.length === 0) {
             throw new Error("No options generated.");
          }

          setOptions(result.options);
          setStatus(AppStatus.SELECTING);

        } catch (innerError: any) {
          console.error("Process Error:", innerError);
          setErrorMessage("Failed to process audio.");
          setStatus(AppStatus.ERROR);
        }
      };
      
    } catch (err: any) {
      setErrorMessage("Could not read audio file");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleOptionClick = async (text: string) => {
    setStatus(AppStatus.SPEAKING);
    try {
      await speakText(text);
      setTimeout(() => setStatus(AppStatus.IDLE), 2000);
    } catch (err) {
      setStatus(AppStatus.IDLE);
    }
  };

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setOptions([]);
    setTranscription("");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-6 font-sans">
      {/* BRANDING HEADER */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter" style={{ fontFamily: 'monospace' }}>
            UNMUTE<span className="text-cyan-500">.AI</span>
          </h1>
          <p className="text-[10px] font-bold text-zinc-500 tracking-[0.4em] uppercase mt-1">
            Reconnecting the Signal
          </p>
        </div>
        <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e] animate-pulse"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        {status === AppStatus.IDLE && (
          <div className="text-center space-y-12 animate-in fade-in duration-700">
            <MicButton isListening={false} onStart={startRecording} onStop={stopRecording} />
            <p className="text-sm text-zinc-600 uppercase tracking-widest">Hold to Unmute</p>
          </div>
        )}

        {status === AppStatus.LISTENING && (
          <div className="text-center space-y-12">
            <p className="text-3xl text-cyan-400 font-bold animate-pulse">Listening...</p>
            <MicButton isListening={true} onStart={startRecording} onStop={stopRecording} />
          </div>
        )}

        {(status === AppStatus.TRANSCRIBING || status === AppStatus.PROCESSING) && (
          <div className="text-center space-y-8">
            <ThinkingAnimation />
            <div className="space-y-2">
              <p className="text-zinc-500 uppercase text-xs tracking-widest font-bold">
                {status === AppStatus.TRANSCRIBING ? "Analyzing Audio..." : "Reconstructing Intent..."}
              </p>
              {transcription && (
                <p className="text-xl text-zinc-400 italic opacity-50">"{transcription}..."</p>
              )}
            </div>
          </div>
        )}

        {status === AppStatus.SELECTING && (
          <div className="w-full space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-cyan-400">Select Output</h2>
            </div>
            
            <div className="space-y-4">
              {options.map((opt, i) => (
                <OptionCard key={i} index={i} text={opt} onClick={() => handleOptionClick(opt)} />
              ))}
            </div>

            <button onClick={reset} className="w-full py-4 text-zinc-600 hover:text-white text-xs uppercase tracking-widest">
              Cancel
            </button>
          </div>
        )}

        {status === AppStatus.SPEAKING && (
          <div className="text-center space-y-12 animate-in zoom-in duration-300">
             <div className="w-48 h-48 mx-auto rounded-full border-4 border-cyan-500 flex items-center justify-center shadow-[0_0_80px_rgba(34,211,238,0.3)]">
                <div className="w-full h-2 bg-cyan-400 animate-pulse"></div>
             </div>
            <p className="text-2xl font-bold text-white tracking-tight">Speaking...</p>
          </div>
        )}

        {status === AppStatus.ERROR && (
          <div className="text-center space-y-4 animate-in shake duration-500">
            <p className="text-xl text-red-500 font-mono">{errorMessage}</p>
            <button onClick={reset} className="text-white underline">Retry</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;