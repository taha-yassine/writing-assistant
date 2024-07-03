import React from 'react';
import TextEditor from './components/TextEditor';
import ContextPanel from './components/ContextPanel';
import AIToolbar from './components/AIToolbar';

function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <AIToolbar />
        <TextEditor />
      </div>
      <ContextPanel />
    </div>
  );
}

export default App;
