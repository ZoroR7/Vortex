export enum VoiceType {
  OFFLINE = 'OFFLINE',
  ONLINE = 'ONLINE',
}

export interface VoiceOption {
  id: string;
  name: string;
  type: VoiceType;
  lang?: string;
  gender?: 'Male' | 'Female' | 'Neutral';
}

export interface TextChunk {
  id: string;
  text: string;
  startCharIndex: number;
  endCharIndex: number;
}

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  currentChunkIndex: number;
  playbackRate: number;
  volume: number;
  selectedVoiceId: string;
  autoScroll: boolean;
}

export interface ProcessingStats {
  totalWords: number;
  estimatedTime: string;
}
