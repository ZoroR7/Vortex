import React, { useState } from 'react';
import { Link, FileText, X, Loader2, Globe } from 'lucide-react';
import { geminiService } from '../services/gemini';

interface InputAreaProps {
  onTextSubmit: (text: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ onTextSubmit, isOpen, onClose }) => {
  const [mode, setMode] = useState<'text' | 'url'>('text');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError(null);
    if (!inputValue.trim()) return;

    if (mode === 'text') {
      onTextSubmit(inputValue);
      onClose();
    } else {
      // URL Mode
      setIsLoading(true);
      try {
        const text = await geminiService.extractTextFromUrl(inputValue);
        onTextSubmit(text);
        onClose();
      } catch (err) {
        setError("Failed to extract content. The URL might be protected or invalid. Please copy and paste the text manually.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Add Content</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button 
            onClick={() => setMode('text')}
            className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${mode === 'text' ? 'text-white bg-gray-800' : 'text-gray-500 hover:bg-gray-800/50'}`}
          >
            <FileText className="w-4 h-4" /> Paste Text
          </button>
          <button 
            onClick={() => setMode('url')}
            className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${mode === 'url' ? 'text-white bg-gray-800' : 'text-gray-500 hover:bg-gray-800/50'}`}
          >
            <Globe className="w-4 h-4" /> Extract from URL (AI)
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'text' ? (
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Paste your article, document, or essay here..."
              className="w-full h-64 bg-gray-950 border border-gray-800 rounded-xl p-4 text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
            />
          ) : (
            <div className="py-12 px-4 text-center">
              <div className="max-w-md mx-auto">
                <label className="block text-left text-sm font-medium text-gray-400 mb-2">Web Article URL</label>
                <div className="relative">
                   <Link className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                   <input 
                    type="url"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="https://example.com/article"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                   />
                </div>
                <p className="text-xs text-gray-500 mt-4 text-left">
                  Note: We use Gemini AI to visit the page and extract the main content. This works best for articles and blogs.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-400 hover:text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isLoading || !inputValue.trim()}
            className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {mode === 'url' ? 'Extract & Load' : 'Load Text'}
          </button>
        </div>

      </div>
    </div>
  );
};
