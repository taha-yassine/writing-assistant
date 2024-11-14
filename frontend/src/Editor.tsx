import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import InlineEditPlugin from './plugins/InlineEditPlugin';
import { useState } from 'react';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';

function $prepopulatedText() {
  const root = $getRoot();
  if (root.getFirstChild() === null) {
      const paragraph = $createParagraphNode();
      paragraph.append(
          $createTextNode('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis mollis est. Sed sit amet libero ut diam efficitur posuere. Mauris venenatis blandit semper. Fusce vitae molestie velit, ac iaculis mi. Morbi sollicitudin consectetur eros. Pellentesque a feugiat velit. Etiam et ultricies dolor. Nulla vitae commodo ligula. Phasellus massa mi, rhoncus id luctus quis, laoreet quis tortor. Vestibulum viverra est orci, a maximus mauris pulvinar in. Phasellus sagittis auctor urna, a porttitor turpis. Integer vel sem bibendum ex eleifend ultrices. Duis viverra posuere eros, at egestas sapien commodo sed.')
      );
      root.append(paragraph);

      const paragraph2 = $createParagraphNode();
      paragraph2.append(
          $createTextNode('Pellentesque egestas pulvinar leo eget lobortis. Donec ultricies ac diam maximus molestie. Aenean elementum tortor ut maximus consectetur. Suspendisse sagittis ligula eu leo convallis, vitae lacinia ligula mollis. Curabitur gravida ante vel lorem aliquam, ac placerat purus commodo. Fusce facilisis felis sit amet eros blandit euismod. Nullam rhoncus congue ante, et gravida felis varius eget. Ut finibus nec massa in laoreet. Sed condimentum eros mauris, id ultricies nulla bibendum vitae.')
      );
      root.append(paragraph2);

      const paragraph3 = $createParagraphNode();
      paragraph3.append(
          $createTextNode(' Proin luctus ullamcorper purus, non lacinia nisl pharetra non. Cras aliquam, nulla vitae euismod tincidunt, eros neque vehicula ipsum, sed suscipit lorem nulla eu nibh. Sed fringilla luctus maximus. Proin volutpat in quam sagittis molestie. Ut eu lectus quis magna consequat consequat. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Integer sollicitudin tempus turpis vel pellentesque. Cras auctor tempor erat nec porta. Integer augue mauris, facilisis et ante id, auctor tincidunt turpis. Etiam efficitur suscipit vestibulum. Mauris suscipit nunc at magna dignissim, eget placerat eros laoreet. Duis lobortis, ex at malesuada ullamcorper, velit velit pharetra lectus, eget pellentesque neque dolor nec est.')
      );
      root.append(paragraph3);

      const paragraph4 = $createParagraphNode();
      paragraph4.append(
          $createTextNode('Curabitur tempor ligula id laoreet auctor. Cras ut posuere purus. In sit amet magna ac odio commodo sodales. In at elit lacus. Cras metus erat, varius ut ante a, fringilla pulvinar arcu. Maecenas et arcu quis quam malesuada blandit. Sed suscipit urna et pellentesque consequat. Morbi eleifend eros massa, ac tempus urna tristique eu.')
      );
      root.append(paragraph4);

      const paragraph5 = $createParagraphNode();
      paragraph5.append(
          $createTextNode('Nullam et venenatis est. Integer efficitur arcu quis risus mattis lobortis. Maecenas non porttitor mauris. Fusce pharetra suscipit nisi at ornare. Quisque finibus ullamcorper dapibus. Vivamus fermentum laoreet pretium. Quisque enim quam, tristique eget fermentum hendrerit, bibendum quis nunc. Fusce at venenatis nibh, et euismod mauris. Sed tincidunt a velit id suscipit. Proin euismod, augue in dignissim venenatis, leo velit egestas urna, ut posuere justo est eu nibh. Nulla vitae velit non massa pretium faucibus.')
      );
      root.append(paragraph5);
  }
}

const theme = {
  paragraph: 'editor-paragraph'
};

function onError(error: Error) {
  console.error(error);
}

function Editor() {
  const initialConfig = {
    namespace: 'Editor',
    editorState: $prepopulatedText,
    theme,
    onError,
  };

  // Stores reference to editor's DOM element for positioning the inline edit input
  const [inlineEditAnchorElem, setInlineEditAnchorElem] = useState<HTMLDivElement | null>(null);

  const onRef = (_inlineEditAnchorElem: HTMLDivElement) => {
    if (_inlineEditAnchorElem !== null) {
      setInlineEditAnchorElem(_inlineEditAnchorElem);
    }
  };
  
  return (
    <LexicalComposer initialConfig={initialConfig}>
      {/* TODO: Add placeholder */}
      <PlainTextPlugin
        contentEditable={
          <div ref={onRef} className="h-full">
            <ContentEditable className="h-full p-4" />
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <AutoFocusPlugin />
      {inlineEditAnchorElem && <InlineEditPlugin anchorElement={inlineEditAnchorElem} />}
    </LexicalComposer>
  );
}

export default Editor;
