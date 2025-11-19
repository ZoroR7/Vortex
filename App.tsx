import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { ReaderDisplay } from './components/ReaderDisplay';
import { InputArea } from './components/InputArea';
import { chunkText, calculateStats } from './utils/text';
import { geminiService } from './services/gemini';
import { audioPlayer } from './services/audio';
import { AudioState, TextChunk, VoiceType } from './types';
import { DEFAULT_TEXT, GEMINI_VOICES } from './constants';
import { Plus, Type, RotateCcw, Clock } from 'lucide-react';

function App() {
  // --- State ---
  const [chunks, setChunks] = useState<TextChunk[]>([]);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isLoading: false,
    currentChunkIndex: 0,
    playbackRate: 1,
    volume: 1,
    selectedVoiceId: 'Zephyr', // Default AI voice
    autoScroll: true,
  });
  const [offlineVoices, setOfflineVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [stats, setStats] = useState({ totalWords: 0, estimatedTime: '0m' });
  
  // Visual Settings
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif'>('sans');

  // Refs for managing playback loop
  const playbackRef = useRef({
    chunks: [] as TextChunk[],
    currentIndex: 0,
    isPlaying: false,
    selectedVoiceId: 'Zephyr',
    rate: 1
  });

  // Sync ref with state
  useEffect(() => {
    playbackRef.current.chunks = chunks;
    playbackRef.current.currentIndex = audioState.currentChunkIndex;
    playbackRef.current.isPlaying = audioState.isPlaying;
    playbackRef.current.selectedVoiceId = audioState.selectedVoiceId;
    playbackRef.current.rate = audioState.playbackRate;
  }, [chunks, audioState.currentChunkIndex, audioState.isPlaying, audioState.selectedVoiceId, audioState.playbackRate]);

  // --- Initialization ---

  useEffect(() => {
    // Load default text
    handleTextLoad(DEFAULT_TEXT);

    // Load offline voices
    const loadVoices = () => {
      setOfflineVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => audioPlayer.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Logic ---

  const handleTextLoad = (text: string) => {
    const newChunks = chunkText(text);
    setChunks(newChunks);
    setStats(calculateStats(text));
    setAudioState(prev => ({ ...prev, currentChunkIndex: 0, isPlaying: false }));
    audioPlayer.stop();
  };

  const playNextChunk = async () => {
    const { chunks, currentIndex, isPlaying, selectedVoiceId, rate } = playbackRef.current;

    if (!isPlaying || currentIndex >= chunks.length) {
      setAudioState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
      return;
    }

    const currentChunk = chunks[currentIndex];
    const isGeminiVoice = GEMINI_VOICES.some(v => v.id === selectedVoiceId);

    try {
      setAudioState(prev => ({ ...prev, isLoading: true }));

      if (isGeminiVoice) {
        // Online Gemini Voice
        const audioBuffer = await geminiService.generateSpeech(currentChunk.text, selectedVoiceId);
        
        if (!playbackRef.current.isPlaying) return; // Check if stopped while fetching

        if (audioBuffer) {
          setAudioState(prev => ({ ...prev, isLoading: false }));
          await audioPlayer.playPCM(audioBuffer, 1, () => {
             advanceChunk();
          });
        }
      } else {
        // Offline Voice
        setAudioState(prev => ({ ...prev, isLoading: false }));
        const voice = offlineVoices.find(v => v.name === selectedVoiceId) || null;
        audioPlayer.playSynthesis(currentChunk.text, voice, rate, 1, () => {
          advanceChunk();
        });
      }
    } catch (error) {
      console.error("Playback error:", error);
      setAudioState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
    }
  };

  const advanceChunk = () => {
    // Update state index
    setAudioState(prev => {
      const nextIndex = prev.currentChunkIndex + 1;
      // Check boundaries
      if (nextIndex >= playbackRef.current.chunks.length) {
        return { ...prev, isPlaying: false, currentChunkIndex: 0 };
      }
      return { ...prev, currentChunkIndex: nextIndex };
    });
  };

  // Effect to trigger playback when index changes while playing
  useEffect(() => {
    if (audioState.isPlaying && !audioState.isLoading) {
      playNextChunk();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioState.currentChunkIndex, audioState.isPlaying]);


  // --- Handlers ---

  const togglePlay = () => {
    if (audioState.isPlaying) {
      audioPlayer.pause(); // Or stop
      audioPlayer.stop();
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    } else {
      setAudioState(prev => ({ ...prev, isPlaying: true }));
      // This state change triggers the effect above
    }
  };

  const skip = (direction: 'next' | 'prev') => {
    audioPlayer.stop();
    setAudioState(prev => {
      const newIndex = direction === 'next' 
        ? Math.min(prev.currentChunkIndex + 1, chunks.length - 1)
        : Math.max(prev.currentChunkIndex - 1, 0);
      return { ...prev, currentChunkIndex: newIndex, isPlaying: prev.isPlaying }; // Maintain playing state to auto-resume
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-indigo-500/30">
      <Header onOpenSettings={() => {}} />
      
      <main className="pt-8 px-4 md:px-8 max-w-6xl mx-auto">
        
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsInputOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-indigo-900/20"
            >
              <Plus className="w-4 h-4" /> New Content
            </button>
            
            <div className="h-6 w-px bg-gray-800"></div>
            
            <div className="flex items-center gap-2 text-gray-400 text-sm">
               <Clock className="w-4 h-4" />
               <span>{stats.estimatedTime} read</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-950 p-1 rounded-lg border border-gray-800">
             <button 
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"
              >
               <Type className="w-3 h-3" />
             </button>
             <span className="text-xs font-mono text-gray-500 w-8 text-center">{fontSize}</span>
             <button 
                onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"
              >
               <Type className="w-5 h-5" />
             </button>
             <div className="h-4 w-px bg-gray-800 mx-1"></div>
             <button 
                onClick={() => setFontFamily(fontFamily === 'sans' ? 'serif' : 'sans')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md text-xs font-bold uppercase w-12"
             >
               {fontFamily}
             </button>
          </div>
        </div>

        {/* Main Reader */}
        <div className="min-h-[60vh]">
          <ReaderDisplay 
            chunks={chunks} 
            activeChunkIndex={audioState.currentChunkIndex}
            fontSize={fontSize}
            fontFamily={fontFamily}
          />
        </div>

      </main>

      <ControlPanel 
        audioState={audioState}
        onTogglePlay={togglePlay}
        onNext={() => skip('next')}
        onPrev={() => skip('prev')}
        onVoiceChange={(id) => {
          audioPlayer.stop();
          setAudioState(prev => ({ ...prev, selectedVoiceId: id, isPlaying: false }));
        }}
        onSpeedChange={(speed) => setAudioState(prev => ({ ...prev, playbackRate: speed }))}
        offlineVoices={offlineVoices}
      />

      <InputArea 
        isOpen={isInputOpen}
        onClose={() => setIsInputOpen(false)}
        onTextSubmit={handleTextLoad}
      />
    </div>
  );
}

export default App;
