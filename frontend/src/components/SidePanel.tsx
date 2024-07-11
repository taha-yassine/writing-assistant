import React, { useState } from 'react';

const SidePanel: React.FC = () => {
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
      <p className="text-sm text-yellow-600 mb-4">
        <strong>Note:</strong> AI is used to perform the analysis. Results may not always be accurate.
      </p>
    </div>
  );
};

export default SidePanel;
