import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useState, useRef } from "react";
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_NORMAL, KEY_MODIFIER_COMMAND } from "lexical";
import { createDOMRange } from "@lexical/selection";

/**
 * Plugin that adds an inline edit input box triggered by Cmd/Ctrl+K
 */
function InlineEditPlugin({ anchorElement = document.body }: { anchorElement?: HTMLElement }) {
    const [editor] = useLexicalComposerContext();
    const [show, setShow] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [position, setPosition] = useState<{ top: string; left: string }>({ top: '0px', left: '0px' });
    
    // Detect if user is on Mac for correct modifier key handling
    const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

    // Handle Cmd/Ctrl+K in editor to show/focus input
    const handleEditorShortcut = useCallback((event: KeyboardEvent) => {
        const { code, metaKey, ctrlKey } = event;
        const isModifierKey = isMac ? metaKey : ctrlKey;

        if (code === 'KeyK' && isModifierKey) {
            event.preventDefault();
            if (!show) {
                setShow(true);
            } else {
                if (inputRef.current === document.activeElement) {
                    editor.focus();
                } else {
                    inputRef.current?.focus();
                }
            }
            return true;
        }
        return false;
    }, [isMac, show, editor]);

    // Handle keyboard shortcuts when input is focused
    const handleInputShortcut = useCallback((event: React.KeyboardEvent) => {
        const isModifierKey = isMac ? event.metaKey : event.ctrlKey;
        const isCtrlK = (event.key === 'k' || event.key === 'K') && isModifierKey;

        if (event.key === 'Escape') {
            // Hide input on Esc and refocus editor
            setShow(false);
            editor.focus();
        } else if (isCtrlK) {
            // Focus editor on Cmd/Ctrl+K without hiding input
            event.preventDefault();
            editor.focus();
        }
    }, [editor, isMac]);

    // Register the keyboard command handler
    useEffect(() => {
        const unregister = editor.registerCommand(
            KEY_MODIFIER_COMMAND,
            handleEditorShortcut,
            COMMAND_PRIORITY_NORMAL
        );
        return () => unregister();
    }, [editor, handleEditorShortcut]);

    // Auto-focus input when shown
    useEffect(() => {
        if (show && inputRef.current) {
            inputRef.current.focus();
        }
    }, [show]);

    // Position the input box above the text selection
    useEffect(() => {
        if (show) {
            editor.getEditorState().read(() => {
                const selection = $getSelection();
                if (selection && $isRangeSelection(selection)) {
                    const anchor = selection.anchor;
                    const focus = selection.focus;
                    const range = createDOMRange(editor, anchor.getNode(), anchor.offset, focus.getNode(), focus.offset);
                    if (range) {
                        const rect = range.getBoundingClientRect();
                        setPosition({
                            top: `${rect.top - 30}px`, 
                            left: `${rect.left}px`,
                        });
                    }
                }
            });
        }
    }, [show, editor]);

    return show ? createPortal(
        <div className="absolute shadow rounded-md" style={position}>
            <input 
                ref={inputRef}
                type="text"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none"
                placeholder="Enter text..."
                onKeyDown={handleInputShortcut}
            />
        </div>
    , anchorElement) : null;
}

export default InlineEditPlugin;
