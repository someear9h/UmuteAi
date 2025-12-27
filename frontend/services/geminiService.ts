import { IntentResponse } from "../types";

// Matches the Prefix in backend/core/config.py + Router prefix
const API_URL = "http://localhost:8000/api/speech"; 

export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  try {
    // Convert base64 back to Blob for upload
    const byteCharacters = atob(base64Audio);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/webm;codecs=opus' });

    const formData = new FormData();
    formData.append("file", blob, "recording.webm");

    const response = await fetch(`${API_URL}/transcribe`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Transcription failed");
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Backend Transcription Error:", error);
    throw error;
  }
};

export const deduceIntent = async (fragmentedText: string): Promise<IntentResponse> => {
  try {
    const response = await fetch(`${API_URL}/deduce-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: fragmentedText }),
    });

    if (!response.ok) throw new Error("Intent deduction failed");
    return await response.json();
  } catch (error) {
    console.error("Backend Intent Error:", error);
    throw error;
  }
};

export const speakText = async (text: string, voiceId: string = "21m00Tcm4TlvDq8ikWAM"): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/speak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice_id: voiceId }),
    });

    if (!response.ok) throw new Error("Speech generation failed");
    
    const data = await response.json();
    const base64Audio = data.audio_base64;

    // --- FIX STARTS HERE ---
    
    // 1. Convert Base64 -> ArrayBuffer (Standard MP3 file bytes)
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // 2. Use Native Browser Decoding (Handles MP3/WAV automatically)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // This function automatically detects it's an MP3 and decodes it correctly
    const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
    
    // 3. Play it
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
    
    // --- FIX ENDS HERE ---

  } catch (error) {
    console.error("Backend Speech Error:", error);
  }
};

// // --- Utilities ---
// function decode(base64: string) {
//   const binaryString = atob(base64);
//   const len = binaryString.length;
//   const bytes = new Uint8Array(len);
//   for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
//   return bytes;
// }

// async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
//   const dataInt16 = new Int16Array(data.buffer);
//   const frameCount = dataInt16.length / numChannels;
//   const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
//   for (let channel = 0; channel < numChannels; channel++) {
//     const channelData = buffer.getChannelData(channel);
//     for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
//   }
//   return buffer;
// }