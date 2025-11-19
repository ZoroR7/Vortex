import React, { useEffect, useRef } from 'react';
import { TextChunk } from '../types';

interface ReaderDisplayProps {
  chunks: TextChunk[];
  activeChunkIndex: number;
  fontSize: number;
  fontFamily: 'sans' | 'serif';
}

export const ReaderDisplay: React.FC<ReaderDisplayProps> = ({ 
  chunks, 
  activeChunkIndex, 
  fontSize,
  fontFamily 
}) => {
  const activeRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to active chunk
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeChunkIndex]);

  return (
    <div 
      ref={containerRef}
      className={`max-w-3xl mx-auto pb-40 px-6 md:px-0 leading-relaxed transition-all duration-300 ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      {chunks.length === 0 && (
        <div className="text-center text-gray-500 mt-20">
          <p>No content to read.</p>
          <p className="text-sm mt-2">Use the input tools to add text.</p>
        </div>
      )}

      {chunks.map((chunk, index) => {
        const isActive = index === activeChunkIndex;
        return (
          <span
            key={chunk.id}
            ref={isActive ? activeRef : null}
            className={`
              inline-block py-1 px-1 rounded-md transition-colors duration-200
              ${isActive 
                ? 'bg-indigo-500/20 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.1)] border-b-2 border-indigo-500/50' 
                : 'text-gray-300 hover:bg-gray-800/50'
              }
            `}
          >
            {chunk.text}{' '}
          </span>
        );
      })}
    </div>
  );
};
