import React, { useState, useRef, useEffect } from 'react';
import './TextEditor.css';

const TextEditor: React.FC<{
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
}> = ({ text, setText }) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean; word: string; correction: string; node: HTMLSpanElement | null; }>({
    x: 0,
    y: 0,
    visible: false,
    word: '',
    correction: '',
    node: null,
  });

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = text;
    }
  }, [text]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu.visible && !event.defaultPrevented) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu.visible]);

  const handleChange = () => {
    if (editorRef.current) {
      const newText = editorRef.current.innerText;
      setText(newText);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (editorRef.current) {
      // caretRangeFromPoint only works in Chrome
      // Needs a better solution for cross-browser compatibility
      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (range) {
        const node = range.startContainer.parentNode as HTMLElement;
        if (node.classList && node.classList.contains('highlight')) {
          const word = node.textContent || '';
          const correction = node.getAttribute('data-correction') || '';
          setContextMenu({
            x: e.clientX,
            y: e.clientY,
            visible: true,
            word,
            correction,
            node: node as HTMLSpanElement,
          });
        } else {
          setContextMenu({
            x: e.clientX,
            y: e.clientY,
            visible: true,
            word: '',
            correction: '',
            node: null,
          });
        }
      }
    }
  };

  const handleContextMenuAction = (action: string) => {
    if (!editorRef.current) return;

    switch (action) {
      case 'correct':
        if (contextMenu.correction && contextMenu.node && contextMenu.node.parentNode) {
          const textNode = document.createTextNode(contextMenu.correction);
          contextMenu.node.parentNode.replaceChild(textNode, contextMenu.node);
          handleChange();
        }
        break;

      // execCommand is being deprecated
      // May need a better solution in the future
      case 'cut':
        document.execCommand('cut');
        break;
      case 'copy':
        document.execCommand('copy');
        break;
      case 'paste':
        document.execCommand('paste');
        break;
    }

    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="flex flex-col h-full relative">
      <div
        ref={editorRef}
        className="flex-1 p-4 overflow-auto border border-gray-300 focus:outline-none whitespace-pre-wrap"
        contentEditable
        onInput={handleChange}
        onContextMenu={handleContextMenu}
        suppressContentEditableWarning
        spellCheck="false"
      />
      {contextMenu.visible && (
        <div
          className="absolute bg-white border border-gray-300 shadow-md rounded text-sm"
          style={{ top: contextMenu.y, left: contextMenu.x, minWidth: '100px' }}
        >
          {contextMenu.correction && (
            <div className="border-b border-gray-200">
              <button 
                className="block w-full text-left px-3 py-1 hover:bg-gray-100" 
                onClick={() => handleContextMenuAction('correct')}
              >
                <span className="font-semibold">{contextMenu.correction}</span>
              </button>
            </div>
          )}
          <div>
            <button className="block w-full text-left px-3 py-1 hover:bg-gray-100" onClick={() => handleContextMenuAction('cut')}>Cut</button>
            <button className="block w-full text-left px-3 py-1 hover:bg-gray-100" onClick={() => handleContextMenuAction('copy')}>Copy</button>
            <button className="block w-full text-left px-3 py-1 hover:bg-gray-100" onClick={() => handleContextMenuAction('paste')}>Paste</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextEditor;