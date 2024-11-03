import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';

const theme = {
};

function onError(error: Error) {
  console.error(error);
}

function Editor() {
  const initialConfig = {
    namespace: 'Editor',
    theme,
    onError,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      {/* TODO: Add placeholder */}
      <PlainTextPlugin
        contentEditable={<ContentEditable className="h-full p-4" />}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <AutoFocusPlugin />
    </LexicalComposer>
  );
}

export default Editor;
