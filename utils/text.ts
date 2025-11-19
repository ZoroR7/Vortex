import { TextChunk } from '../types';

/**
 * Splits text into manageable chunks (sentences/paragraphs) suitable for TTS.
 * We aim for chunks that are roughly 200-500 characters to balance API latency and flow.
 */
export const chunkText = (text: string): TextChunk[] => {
  // Normalize newlines
  const normalized = text.replace(/\r\n/g, '\n');
  
  // Split by double newline (paragraphs) first
  const paragraphs = normalized.split(/\n\s*\n/);
  
  const chunks: TextChunk[] = [];
  let currentIndex = 0;

  paragraphs.forEach((para) => {
    const paraTrimmed = para.trim();
    if (!paraTrimmed) {
      currentIndex += para.length + 1; // +1 for the split char estimate
      return;
    }

    // If paragraph is huge, split by sentences
    if (paraTrimmed.length > 500) {
      // Simple sentence split on . ! ? followed by space or end of line
      const sentences = paraTrimmed.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [paraTrimmed];
      
      sentences.forEach(sentence => {
        const sentenceTrimmed = sentence.trim();
        if (sentenceTrimmed) {
           chunks.push({
            id: crypto.randomUUID(),
            text: sentenceTrimmed,
            startCharIndex: text.indexOf(sentenceTrimmed, currentIndex),
            endCharIndex: text.indexOf(sentenceTrimmed, currentIndex) + sentenceTrimmed.length
          });
        }
      });
    } else {
      // Keep small paragraphs together for better flow
      chunks.push({
        id: crypto.randomUUID(),
        text: paraTrimmed,
        startCharIndex: text.indexOf(paraTrimmed, currentIndex),
        endCharIndex: text.indexOf(paraTrimmed, currentIndex) + paraTrimmed.length
      });
    }
    
    currentIndex = text.indexOf(paraTrimmed, currentIndex) + paraTrimmed.length;
  });

  return chunks;
};

export const calculateStats = (text: string) => {
  const words = text.trim().split(/\s+/).length;
  // Avg reading speed ~200 wpm
  const minutes = Math.ceil(words / 200);
  return {
    totalWords: words,
    estimatedTime: minutes > 60 ? `${Math.floor(minutes/60)}h ${minutes%60}m` : `${minutes} min`
  };
};
