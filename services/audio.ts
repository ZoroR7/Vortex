export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  
  // Offline synthesis
  private synthesis: SpeechSynthesis = window.speechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    // Init AudioContext lazily to comply with browser autoplay policies
  }

  private initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // --- PCM Audio Handling (Gemini) ---

  private async decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    this.initContext();
    if (!this.audioContext) throw new Error("AudioContext not initialized");

    // Manual decoding for raw PCM from Gemini (mono, 24kHz usually)
    
    const dataView = new DataView(arrayBuffer);
    // Check if it's 16-bit PCM. 
    // Create Int16Array
    const int16Data = new Int16Array(arrayBuffer);
    const float32Data = new Float32Array(int16Data.length);
    
    for (let i = 0; i < int16Data.length; i++) {
      // Convert Int16 to Float32 (-1.0 to 1.0)
      float32Data[i] = int16Data[i] / 32768.0;
    }

    const buffer = this.audioContext.createBuffer(1, float32Data.length, 24000);
    buffer.copyToChannel(float32Data, 0);
    return buffer;
  }

  public async playPCM(arrayBuffer: ArrayBuffer, volume: number = 1, onEnded?: () => void): Promise<void> {
    this.stop(); // Stop any previous audio
    this.initContext();
    
    if (!this.audioContext || !this.gainNode) return;

    try {
      const audioBuffer = await this.decodeAudioData(arrayBuffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      this.gainNode.gain.value = volume;
      source.connect(this.gainNode);
      
      source.onended = () => {
        if (onEnded) onEnded();
      };

      source.start(0);
      this.currentSource = source;
    } catch (e) {
      console.error("Error playing PCM", e);
      if (onEnded) onEnded(); // Fail gracefully so queue continues
    }
  }

  // --- Offline Synthesis Handling ---

  public playSynthesis(text: string, voice: SpeechSynthesisVoice | null, rate: number, volume: number, onEnded?: () => void) {
    this.stop();
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.rate = rate; // 0.1 to 10
    utterance.volume = volume;
    
    utterance.onend = () => {
      if (onEnded) onEnded();
    };
    
    utterance.onerror = (e) => {
      // Ignore interruption errors caused by navigation/stopping
      // Using 'any' cast because SpeechSynthesisErrorEvent properties vary slightly by browser/ts version
      const errorEvent = e as any;
      if (errorEvent.error === 'interrupted' || errorEvent.error === 'canceled') {
        return;
      }
      
      console.error("Synthesis error", e);
      if (onEnded) onEnded();
    };

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
  }

  public stop() {
    // Stop PCM
    if (this.currentSource) {
      try {
        this.currentSource.onended = null; // Prevent callback on manual stop
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (e) { /* ignore if already stopped */ }
      this.currentSource = null;
    }

    // Stop Synthesis
    if (this.synthesis.speaking || this.synthesis.pending) {
      this.synthesis.cancel();
    }
    this.currentUtterance = null;
  }

  public pause() {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
    if (this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  public resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }
  
  public getOfflineVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }
}

export const audioPlayer = new AudioPlayer();