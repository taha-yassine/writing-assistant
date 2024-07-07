import React, { useState, useRef, useEffect } from 'react';
import { useTextProcessing } from '../hooks/useTextProcessing';
import './TextEditor.css';

const TextEditor: React.FC = () => {
  const [text, setText] = useState(() => {
    return process.env.NODE_ENV === 'development'
      ? "Onceupon a tyme, in a far-of kingdum, their lived a yung princes named Lila. She wuz knoen four her bravry and kind-ness, but alsso for her aqward social skils. Lila luvd to explorr the vast forrest that surounded the casstle, were she wood often loose her self in thort. One daye, while wanderring thru the woods, she stuhmbled upon an anchient, crumbelling tower. Intreiged, Lila decidid to clime it's weatherd steps. At the top, she found an od, sparkeling miror that shoed her not her own reflecshun, but a vision of the kingdum's futur. Exited and a litle bit scared, Lila runed back to the casstle to tel her parrents about her discoverry. But when she tryed to explein what she had seen, the words came out all jumbeldup and non-sensical. The king and queeen were very conserned and sent for the court wizzard to help. The wizzard, an ecentric old man with a long, floing beard, arrived in a puff of purpel smoke. He lissened carefully to Lila's garbled tale and, with a knowing twinkle in his eye, cast a spell to help her comminicate more clearley. From that day foward, Lila's words flowed as smoovly as a gentlestream, and she was able to shair her vision of the future with the entire kingdum. And they all lived happilee ever after... or did they?"
      : '';
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [corrections, setCorrections] = useState<string[]>([]);

  const editorRef = useRef<HTMLDivElement>(null);
  const { performProcessing, loading, error } = useTextProcessing();

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = text;
    }
  }, []);

  useEffect(() => {
    highlightErrors();
  }, [errors, corrections]);

  const handleChange = () => {
    if (editorRef.current) {
      setText(editorRef.current.innerText);
    }
  };

  const handleProcess = async () => {
    if (text.trim()) {
      const result = await performProcessing(text);
      if (result) {
        const [newErrors, newCorrections] = result;
        setErrors(newErrors);
        setCorrections(newCorrections);
      } else {
        console.error('Text processing failed');
      }
    }
  };

  const highlightErrors = () => {
    if (editorRef.current && errors.length > 0) {
      let content = text;
      errors.forEach((error, index) => {
        const regex = new RegExp(`\\b${escapeRegExp(error)}\\b`, 'g');
        content = content.replace(regex, `<span class="highlight">${error}</span>`);
      });
      editorRef.current.innerHTML = content;
    }
  };

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  return (
    <div className="flex flex-col h-full">
      <div
        ref={editorRef}
        className="flex-1 p-4 overflow-auto border border-gray-300 focus:outline-none whitespace-pre-wrap"
        contentEditable
        onInput={handleChange}
        suppressContentEditableWarning
        spellCheck="false"
      />
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none self-end"
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
