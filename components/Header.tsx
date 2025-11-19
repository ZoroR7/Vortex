import React from 'react';
import { Mic, FileText, Settings } from 'lucide-react';

export const Header: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => {
  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Mic className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            VoxStream
          </h1>
          <p className="text-xs text-gray-500 font-medium tracking-wide">AI NEURAL READER</p>
        </div>
      </div>
      
      <button 
        onClick={onOpenSettings}
        className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
      >
        <Settings className="w-5 h-5" />
      </button>
    </header>
  );
};
