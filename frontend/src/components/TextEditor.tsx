import React, { useState } from 'react';

const TextEditor: React.FC = () => {
  const [text, setText] = useState('');

  return (
    <textarea
      className="flex-1 p-4 resize-none focus:outline-none"
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="Start writing or paste your text here..."
    />
  );
};

export default TextEditor;