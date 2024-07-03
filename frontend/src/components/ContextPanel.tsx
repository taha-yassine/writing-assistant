import React, { useState } from 'react';

const ContextPanel: React.FC = () => {
  const [context, setContext] = useState('');

  return (
    <div className="w-1/4 bg-white shadow-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Context</h2>
      <textarea
        className="w-full h-64 p-2 border rounded resize-none"
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="Add any additional context or notes here..."
      />
      <div className="mt-4">
        <label htmlFor="file-upload" className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Upload File
        </label>
        <input id="file-upload" type="file" className="hidden" />
      </div>
    </div>
  );
};

export default ContextPanel;