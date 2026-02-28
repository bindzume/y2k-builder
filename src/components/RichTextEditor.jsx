import React, { useRef, useEffect } from 'react';
import { Palette, Highlighter } from 'lucide-react';

const RichTextEditor = ({ content, onChange }) => {
  const editorRef = useRef(null);

  // Sync content when it changes externally (e.g. undo/redo, new selection)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
        // Prevent cursor jumps by checking if content actually differs
        if (editorRef.current.innerHTML !== (content || '')) {
            editorRef.current.innerHTML = content || '';
        }
    }
  }, [content]);

  const handleInput = (e) => {
    onChange(e.currentTarget.innerHTML);
  };

  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const toggleBlink = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (range.collapsed) return; // Ignore empty selection

    // Check if we are currently inside a blink tag
    let node = range.commonAncestorContainer;
    let existingBlink = null;

    // Traverse up to find if we are strictly inside a blink tag
    while (node && node !== editorRef.current) {
        if (node.nodeType === 1 && node.classList.contains('blink-text')) {
            existingBlink = node;
            break;
        }
        node = node.parentNode;
    }

    if (existingBlink) {
        // UNBLINK: Move children out and remove the span
        const parent = existingBlink.parentNode;
        while (existingBlink.firstChild) {
            parent.insertBefore(existingBlink.firstChild, existingBlink);
        }
        parent.removeChild(existingBlink);
    } else {
        // BLINK: Wrap selection
        // Use extractContents -> wrap -> insertNode to handle complex/partial selections
        const contents = range.extractContents();
        const span = document.createElement('span');
        span.className = 'blink-text';

        // Clean up nested blinks inside the selected content to prevent <span class="blink"><span class="blink">...
        const nestedBlinks = contents.querySelectorAll('.blink-text');
        nestedBlinks.forEach(n => {
            const p = n.parentNode;
            while (n.firstChild) p.insertBefore(n.firstChild, n);
            p.removeChild(n);
        });

        span.appendChild(contents);
        range.insertNode(span);
    }

    // Clear selection and update
    selection.removeAllRanges();
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  return (
    <div className="flex flex-col border border-gray-500 bg-white">
        <div className="flex flex-wrap gap-1 p-1 bg-[#e0e0e0] border-b border-gray-500 select-none">
            <button onMouseDown={(e) => {e.preventDefault(); execCmd('bold');}} className="w-5 h-5 flex items-center justify-center font-bold text-xs border border-gray-400 bg-[#c0c0c0] hover:bg-white" title="Bold">B</button>
            <button onMouseDown={(e) => {e.preventDefault(); execCmd('italic');}} className="w-5 h-5 flex items-center justify-center italic text-xs border border-gray-400 bg-[#c0c0c0] hover:bg-white" title="Italic">I</button>
            <button onMouseDown={(e) => {e.preventDefault(); execCmd('underline');}} className="w-5 h-5 flex items-center justify-center underline text-xs border border-gray-400 bg-[#c0c0c0] hover:bg-white" title="Underline">U</button>
            <div className="w-px h-5 bg-gray-400 mx-0.5"></div>

            <div className="w-5 h-5 relative flex items-center justify-center border border-gray-400 bg-[#c0c0c0] hover:bg-white" title="Text Color">
                <Palette size={10} />
                <input
                    type="color"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => execCmd('foreColor', e.target.value)}
                />
            </div>
            <div className="w-5 h-5 relative flex items-center justify-center border border-gray-400 bg-[#c0c0c0] hover:bg-white" title="Highlight Color">
                <Highlighter size={10} />
                <input
                    type="color"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => execCmd('hiliteColor', e.target.value)}
                />
            </div>

            <div className="w-px h-5 bg-gray-400 mx-0.5"></div>
            <button onMouseDown={(e) => {e.preventDefault(); toggleBlink();}} className="w-5 h-5 flex items-center justify-center text-[9px] font-bold text-red-600 border border-gray-400 bg-[#c0c0c0] hover:bg-white" title="Toggle Blink Selection">Z</button>
        </div>
        <div
            ref={editorRef}
            className="w-full h-24 p-1 text-xs outline-none overflow-y-auto font-mono text-black"
            contentEditable
            onInput={handleInput}
            onBlur={() => {}}
        />
    </div>
  );
};

export default RichTextEditor;
