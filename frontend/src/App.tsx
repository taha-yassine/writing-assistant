import React, { useState, useEffect } from 'react';
import TextEditor from './components/TextEditor';
import SidePanel from './components/SidePanel';
import { useTextProcessing } from './hooks/useTextProcessing';

function App() {
  const [text, setText] = useState(() => {
    return process.env.NODE_ENV === 'development'
      ? "Onceupon a tyme, in a far-of kingdum, their lived a yung princes named Lila. She wuz knoen four her bravry and kind-ness, but alsso for her aqward social skils. Lila luvd to explorr the vast forrest that surounded the casstle, were she wood often loose her self in thort. One daye, while wanderring thru the woods, she stuhmbled upon an anchient, crumbelling tower. Intreiged, Lila decidid to clime it's weatherd steps. At the top, she found an od, sparkeling miror that shoed her not her own reflecshun, but a vision of the kingdum's futur. Exited and a litle bit scared, Lila runed back to the casstle to tel her parrents about her discoverry. But when she tryed to explein what she had seen, the words came out all jumbeldup and non-sensical. The king and queeen were very conserned and sent for the court wizzard to help. The wizzard, an ecentric old man with a long, floing beard, arrived in a puff of purpel smoke. He lissened carefully to Lila's garbled tale and, with a knowing twinkle in his eye, cast a spell to help her comminicate more clearley. From that day foward, Lila's words flowed as smoovly as a gentlestream, and she was able to shair her vision of the future with the entire kingdum. And they all lived happilee ever after... or did they?"
      : '';
  });
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const { performProcessing, loading, error } = useTextProcessing();

  useEffect(() => {
    updateCounts(text);
  }, [text]);

  const updateCounts = (text: string) => {
    const words = text.trim().split(/\s+/);
    setWordCount(words.length);
    setCharCount(text.length);
  };

  /**
   * Transforms the <suggestion> tags in the response to <span> tags
   * with the appropriate class and data attributes for highlighting.
   * @param text - The text containing <suggestion> tags.
   * @returns The transformed text with <span> tags.
   */
  const processResponse = (text: string): string => {
    return text
      .replace(/<suggestion data="([^"]+)">/g, '<span class="highlight" data-correction="$1">')
      .replace(/<\/suggestion>/g, '</span>');
  };

  const handleProcess = async () => {
    if (text.trim()) {
      const result = await performProcessing(text);
      if (result) {
        const transformedText = processResponse(result);
        setText(transformedText);
      } else {
        console.error('Text processing failed');
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1">
        <TextEditor
          text={text}
          setText={setText}
        />
      </div>
      <SidePanel
        wordCount={wordCount}
        charCount={charCount}
        onProcess={handleProcess}
        loading={loading}
      />
    </div>
  );
}

export default App;