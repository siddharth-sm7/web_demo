export type RobotState = 'idle' | 'listening' | 'speaking' | 'thinking';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'langpal';
  timestamp: Date;
}

export interface WebRTCState {
  isConnected: boolean;
  isMicActive: boolean;
  isProcessing: boolean;
  error: string | null;
}

export interface WebRTCActions {
  startConversation: () => void;
  endConversation: () => void;
  toggleMic: () => void;
}