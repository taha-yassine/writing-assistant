import React, { useState } from 'react';
import { useTextAnalysis } from '../hooks/useTextAnalysis';

const TextEditor: React.FC = () => {
  const [text, setText] = useState('');
  const { performProcessing, loading, error } = useTextAnalysis();

  const handleProcess = async () => {
    if (text.trim()) {
      const result = await performProcessing(text);
      console.log('Process result:', result);
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      <textarea
        className="flex-1 p-4 resize-none focus:outline-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start writing or paste your text here..."
        spellCheck="false"
      />
      <button
        className="absolute bottom-4 right-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
        onClick={handleProcess}
        disabled={loading || !text.trim()}
      >
        {loading ? 'Processing...' : 'Process'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default TextEditor;