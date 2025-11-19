import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Loader2, Volume2, Layers } from 'lucide-react';
import { AudioState, VoiceOption, VoiceType } from '../types';
import { GEMINI_VOICES } from '../constants';

interface ControlPanelProps {
  audioState: AudioState;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onVoiceChange: (voiceId: string) => void;
  onSpeedChange: (speed: number) => void;
  offlineVoices: SpeechSynthesisVoice[];
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  audioState,
  onTogglePlay,
  onNext,
  onPrev,
  onVoiceChange,
  onSpeedChange,
  offlineVoices
}) => {
  
  const allVoices = [
    ...GEMINI_VOICES,
    ...offlineVoices.map(v => ({
      id: v.name,
      name: v.name,
      type: VoiceType.OFFLINE,
      lang: v.lang
    } as VoiceOption))
  ];

  const currentVoice = allVoices.find(v => v.id === audioState.selectedVoiceId) || allVoices[0];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-950/90 border-t border-gray-800 backdrop-blur-xl px-6 py-4 z-50 pb-safe">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Playback Controls */}
        <div className="flex items-center gap-6 order-2 md:order-1">
          <button onClick={onPrev} className="text-gray-400 hover:text-white transition-colors">
            <SkipBack className="w-6 h-6" />
          </button>
          
          <button 
            onClick={onTogglePlay}
            disabled={audioState.isLoading}
            className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {audioState.isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : audioState.isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            )}
          </button>
          
          <button onClick={onNext} className="text-gray-400 hover:text-white transition-colors">
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        {/* Voice & Settings Info */}
        <div className="flex flex-col md:flex-row items-center gap-4 order-1 md:order-2 w-full md:w-auto">
          
          <div className="flex items-center gap-3 bg-gray-900 p-2 rounded-xl border border-gray-800 w-full md:w-auto">
            <div className={`p-2 rounded-lg ${currentVoice.type === VoiceType.ONLINE ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <Layers className="w-4 h-4" />
            </div>
            <select 
              value={audioState.selectedVoiceId}
              onChange={(e) => onVoiceChange(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-200 focus:outline-none w-full md:w-48 cursor-pointer"
            >
              <optgroup label="AI Neural Voices (Gemini)">
                {GEMINI_VOICES.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </optgroup>
              <optgroup label="Offline Voices">
                {offlineVoices.slice(0, 10).map(v => (
                  <option key={v.name} value={v.name}>{v.name.slice(0, 30)}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-gray-900 p-2 rounded-xl border border-gray-800">
            <Volume2 className="w-4 h-4 text-gray-400 ml-2" />
            <div className="flex items-center gap-2 px-2">
               <span className="text-xs text-gray-500 font-mono">SPEED</span>
               <select 
                 value={audioState.playbackRate}
                 onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                 className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer"
               >
                 <option value="0.5">0.5x</option>
                 <option value="0.75">0.75x</option>
                 <option value="1">1.0x</option>
                 <option value="1.25">1.25x</option>
                 <option value="1.5">1.5x</option>
                 <option value="2">2.0x</option>
               </select>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
