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
    </div>
  );
};

export default SidePanel;
