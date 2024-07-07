import React from 'react';
import TextEditor from './components/TextEditor';
import SidePanel from './components/SidePanel';

function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1">
        <TextEditor />
      </div>
      <SidePanel />
    </div>
  );
}

export default App;
