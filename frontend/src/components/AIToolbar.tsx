import React from 'react';

const AIToolbar: React.FC = () => {
  return (
    <div className="bg-white shadow-md p-4">
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded hover:bg-gray-100">
          Grammar Check
        </button>
        <button className="p-2 rounded hover:bg-gray-100">
          Tone Analysis
        </button>
        <button className="p-2 rounded hover:bg-gray-100">
          Suggestions
        </button>
      </div>
    </div>
  );
};

export default AIToolbar;