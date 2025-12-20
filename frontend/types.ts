
export enum AppStatus {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  TRANSCRIBING = 'TRANSCRIBING',
  PROCESSING = 'PROCESSING',
  SELECTING = 'SELECTING',
  SPEAKING = 'SPEAKING',
  ERROR = 'ERROR'
}

export interface IntentResponse {
  options: string[];
}

export interface TranscriptionResult {
  text: string;
}
