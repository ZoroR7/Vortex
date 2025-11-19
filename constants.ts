import { VoiceOption, VoiceType } from './types';

export const GEMINI_VOICES: VoiceOption[] = [
  { id: 'Puck', name: 'Puck (Gemini)', type: VoiceType.ONLINE, gender: 'Male' },
  { id: 'Charon', name: 'Charon (Gemini)', type: VoiceType.ONLINE, gender: 'Male' },
  { id: 'Kore', name: 'Kore (Gemini)', type: VoiceType.ONLINE, gender: 'Female' },
  { id: 'Fenrir', name: 'Fenrir (Gemini)', type: VoiceType.ONLINE, gender: 'Male' },
  { id: 'Zephyr', name: 'Zephyr (Gemini)', type: VoiceType.ONLINE, gender: 'Female' },
];

export const DEFAULT_TEXT = `Welcome to VoxStream AI Reader.

This is a powerful text-to-speech application designed to handle long documents, articles, and research papers with ease.

You can use high-quality AI voices powered by Google's Gemini models, or standard offline voices provided by your browser.

To get started, simply paste your text, upload a file, or enter a URL below. The reader will break down the content into manageable chunks and allow you to listen seamlessly.

Try selecting the "Zephyr" voice for a natural listening experience, or switch to "Offline" mode for zero-latency reading.`;
