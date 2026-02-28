import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  MousePointer2, Move, Type, Image as ImageIcon, Box, Music, Download, Trash2, 
  Layers, Monitor, Sliders, Link as LinkIcon, Minus, Globe, Grid, LayoutTemplate, 
  Hash, BookOpen, Maximize2, BoxSelect, AlignHorizontalJustifyCenter, 
  AlignVerticalJustifyCenter, LogOut, ArrowRightFromLine, Scaling, 
  ArrowUpFromLine, Table, Eye, Bold, Italic, Underline, Strikethrough, 
  CaseUpper, CaseLower, CaseSensitive, RotateCw, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, ArrowUpToLine, ArrowDownToLine, AlignCenterVertical,
  Zap, Copy, ClipboardPaste, Undo2, Redo2, Save, RotateCcw, Palette, ArrowUp, Highlighter
} from 'lucide-react';

/**
 * UTILS & CONSTANTS
 */
const STORAGE_KEY = 'y2k_builder_save_v1';

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const resizeForCursor = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 32, 32);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * RICH TEXT EDITOR COMPONENT
 */
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


/**
 * EXPORT GENERATOR
 */
const generateExportCode = (elements, bgImage, bgMusic, cursor, pageTitle, pageHeight, pagePadding, pageMargin, pageColor) => {
  const allElements = elements;
  const rootElements = elements.filter(el => !el.parentId);
  
  const getElementStyle = (el) => {
    const isChild = !!el.parentId;
    let extraCss = '';
    
    // Core Layout
    if (el.type === 'flex') {
      extraCss += `
        display: flex;
        flex-direction: ${el.flexDirection || 'row'};
        justify-content: ${el.justifyContent || 'flex-start'};
        align-items: ${el.alignItems || 'stretch'};
        gap: ${el.gap || 0}px;
        flex-wrap: wrap;
      `;
    } else if (el.type === 'marquee' || el.type === 'button' || el.type === 'counter') {
      extraCss += 'display: flex; align-items: center; justify-content: center;';
    } else if (el.type === 'table') {
        extraCss += `border-collapse: collapse;`;
    }

    if (el.type !== 'flex' && el.style.verticalAlign && el.style.verticalAlign !== 'top') {
        extraCss += `
            display: flex;
            flex-direction: column;
            justify-content: ${el.style.verticalAlign === 'middle' ? 'center' : 'flex-end'};
        `;
    }

    if (isChild) {
        if (el.flexGrow) extraCss += 'flex-grow: 1;';
        if (el.fullHeight) extraCss += 'height: 100%;';
        if (el.fullWidth) extraCss += 'align-self: stretch; width: 100%;';
    }

    const positionCss = isChild ? `
        position: relative; 
        left: auto; top: auto;
    ` : `
        position: absolute;
        left: ${el.fullWidth ? pagePadding + 'px' : el.x + 'px'};
        top: ${el.y}px;
        z-index: ${el.zIndex};
    `;

    const widthCss = el.fullWidth ? `width: calc(100% - ${pagePadding * 2}px);` : (el.width ? `width: ${el.width}px;` : '');
    const heightCss = (isChild && el.fullHeight) ? '' : (el.height ? `height: ${el.height}px;` : '');

    const paddingCss = `padding: ${el.style.paddingTop || 0}px ${el.style.paddingRight || 0}px ${el.style.paddingBottom || 0}px ${el.style.paddingLeft || 0}px;`;

    // Divider Specific Style
    if (el.type === 'hr') {
        return `
            #${el.id} {
                box-sizing: border-box;
                ${positionCss}
                ${widthCss}
                height: ${el.height}px;
                background-color: ${el.style.backgroundColor || '#000000'};
                ${paddingCss}
                border: none;
                margin: 0;
                background-clip: content-box;
            }
        `;
    }

    // Side-specific Borders
    const borderCss = `
        border-top: ${el.style.borderTopWidth || 0}px ${el.style.borderStyle || 'solid'} ${el.style.borderColor || '#000000'};
        border-right: ${el.style.borderRightWidth || 0}px ${el.style.borderStyle || 'solid'} ${el.style.borderColor || '#000000'};
        border-bottom: ${el.style.borderBottomWidth || 0}px ${el.style.borderStyle || 'solid'} ${el.style.borderColor || '#000000'};
        border-left: ${el.style.borderLeftWidth || 0}px ${el.style.borderStyle || 'solid'} ${el.style.borderColor || '#000000'};
    `;

    // Background Gradient Handling
    let backgroundStyle = `background-color: ${el.style.backgroundColor || 'transparent'};`;
    if (el.style.bgGradientEnabled) {
        backgroundStyle = `background: linear-gradient(${el.style.bgGradientAngle || 0}deg, ${el.style.bgGradientStart || '#ffffff'}, ${el.style.bgGradientEnd || '#000000'});`;
    }

    // Text Color / Gradient Handling
    let colorStyle = `color: ${el.style.color || '#000000'};`;
    if (el.style.textGradientEnabled) {
        colorStyle = `
            background: linear-gradient(${el.style.textGradientAngle || 0}deg, ${el.style.textGradientStart || '#ffffff'}, ${el.style.textGradientEnd || '#000000'});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            color: transparent;
        `;
    }

    const tShadow = el.style.textShadowEnabled 
        ? `${el.style.textShadowX || 2}px ${el.style.textShadowY || 2}px ${el.style.textShadowBlur || 0}px ${el.style.textShadowColor || '#000000'}`
        : 'none';

    return `
      #${el.id} {
        box-sizing: border-box;
        ${positionCss}
        display: ${el.style.display || 'block'};
        ${widthCss}
        ${heightCss}
        overflow: hidden;
        ${backgroundStyle}
        ${colorStyle}
        ${borderCss}
        ${el.style.borderRadius ? `border-radius: ${el.style.borderRadius}px;` : ''}
        ${el.style.fontFamily ? `font-family: ${el.style.fontFamily};` : ''}
        ${el.style.fontSize ? `font-size: ${el.style.fontSize}px;` : ''}
        ${el.style.textAlign ? `text-align: ${el.style.textAlign};` : ''}
        ${paddingCss}
        font-weight: ${el.style.fontWeight || 'normal'};
        font-style: ${el.style.fontStyle || 'normal'};
        text-decoration: ${el.style.textDecoration || 'none'};
        text-transform: ${el.style.textTransform || 'none'};
        letter-spacing: ${el.style.letterSpacing || 0}px;
        line-height: ${el.style.lineHeight || 1.2};
        text-shadow: ${tShadow};
        transform: rotate(${el.rotation || 0}deg) skew(${el.skewX || 0}deg, ${el.skewY || 0}deg);
        opacity: ${el.opacity || 1};
        ${el.isBlinking ? `animation: blinker ${el.blinkSpeed || 1}s linear infinite;` : ''}
        ${extraCss}
      }
    `;
  };

  const styles = elements.map(el => getElementStyle(el)).join('\n');

  const renderElementHtml = (el) => {
    let content = '';
    const children = allElements.filter(child => child.parentId === el.id);
    children.sort((a,b) => a.zIndex - b.zIndex); 

    if (el.type === 'flex') {
      content = children.map(child => renderElementHtml(child)).join('\n');
    } else if (el.type === 'table') {
        const rows = el.rows || 2;
        const cols = el.cols || 2;
        const gap = el.gap || 0; 
        for (let r = 0; r < rows; r++) {
            content += '<tr>';
            for (let c = 0; c < cols; c++) {
                const child = children.find(ch => ch.tableCell === `${r}-${c}`);
                let cellInner = '&nbsp;';
                if (child) {
                    cellInner = renderElementHtml(child);
                }
                const borderStyle = el.style.borderWidth ? `border: 1px solid ${el.style.borderColor};` : '';
                content += `<td style="${borderStyle} padding: ${gap}px; vertical-align: top;">${cellInner}</td>`;
            }
            content += '</tr>';
        }
    } else {
        if (el.type === 'text') { content = String(el.content || ""); }
        else if (el.type === 'image') { content = `<img src="${el.src}" alt="img" style="object-fit: cover; width: 100%; height: 100%;" />`; }
        else if (el.type === 'marquee') { content = `<marquee scrollamount="5" style="width: 100%;">${String(el.content || "")}</marquee>`; }
        else if (el.type === 'button') { content = String(el.content || ""); }
        else if (el.type === 'hr') { content = ''; }
        else if (el.type === 'counter') { content = `004521`; }
        else if (el.type === 'webring') {
            content = `
                <div style="display:flex; flex-direction:column; height:100%; align-items:center; justify-content:center; border:2px outset white; padding:2px;">
                <div style="font-weight:bold; margin-bottom:4px;">${String(el.content || "")}</div>
                <div style="display:flex; gap:10px; font-size:12px;">
                    <a href="#">&lt; Prev</a>
                    <a href="#">Hub</a>
                    <a href="#">Next &gt;</a>
                </div>
                </div>
            `;
        } else if (el.type === 'guestbook') {
            content = `
                <div style="padding:10px; height:100%; overflow:auto;">
                <div style="text-align:center; font-weight:bold; margin-bottom:10px;">${String(el.content || "")}</div>
                <div id="msgs_${el.id}" style="margin-top:10px; text-align:left; font-size:0.9em;">
                    <div style="border-bottom:1px dashed #999; margin-bottom:5px;"><b>CoolGuy99:</b> Awesome site!!</div>
                </div>
                </div>
            `;
        }
    }

    const tag = (el.type === 'hr' || el.type === 'table') ? 'div' : (el.tagName || 'div');
    if (el.href && el.type !== 'guestbook') {
      // FIX: Use inherit to ensure #id styles flow into the anchor correctly
      return `<a id="${el.id}" href="${el.href}" target="_blank">${content}</a>`;
    }
    return `<${tag} id="${el.id}">${content}</${tag}>`;
  };

  const htmlContent = rootElements.map(el => renderElementHtml(el)).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${pageTitle || 'My Y2K Website'}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: ${pageMargin}px;
      padding: 0;
      width: calc(100vw - ${pageMargin * 2}px);
      min-height: ${pageHeight}px;
      overflow-x: hidden;
      background-color: ${pageColor};
      ${bgImage ? `background-image: url('${bgImage}');` : ''}
      background-size: cover;
      ${cursor ? `cursor: url('${cursor}'), auto;` : ''}
    }
    .page-wrapper {
        position: relative;
        padding: ${pagePadding}px;
        min-height: ${pageHeight}px;
        width: 100%;
        box-sizing: border-box;
    }
    a { color: inherit; }
    @keyframes blinker { 50% { opacity: 0; } }
    .blink-text { animation: blinker 1s linear infinite; }
    ${styles}
  </style>
</head>
<body>
  <div class="page-wrapper">
    ${htmlContent}
  </div>
</body>
</html>`;
};

/**
 * EDITOR COMPONENTS
 */

const StaticElement = ({ element, globalSelectedId, onSelect, onUpdate, allElements }) => {
  const isSelected = element.id === globalSelectedId;
  const [isResizing, setIsResizing] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startDims = useRef({ w: 0, h: 0 });

  const handleMouseDown = (e) => {
    e.stopPropagation();
    onSelect(element.id);
  };

  const handleResizeDown = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startDims.current = { w: element.width, h: element.height };
  };

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e) => {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      onUpdate(element.id, {
        width: Math.max(20, startDims.current.w + dx),
        height: Math.max(2, startDims.current.h + dy)
      });
    };
    const handleMouseUp = () => setIsResizing(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, element.id, onUpdate]);

  const tShadow = element.style.textShadowEnabled 
    ? `${element.style.textShadowX || 2}px ${element.style.textShadowY || 2}px ${element.style.textShadowBlur || 0}px ${element.style.textShadowColor || '#000000'}`
    : 'none';

  const { textShadow, ...cleanStyle } = element.style;

  const commonStyle = {
    ...cleanStyle,
    position: 'relative',
    display: element.style.display || 'block',
    width: element.fullWidth ? '100%' : (element.width || 'auto'),
    height: element.fullHeight ? '100%' : (element.height || 'auto'),
    cursor: 'pointer',
    boxSizing: 'border-box',
    animation: element.isBlinking ? `blinker ${element.blinkSpeed || 1}s linear infinite` : 'none',
    flexGrow: element.flexGrow ? 1 : 0,
    transform: `rotate(${element.rotation || 0}deg) skew(${element.skewX || 0}deg, ${element.skewY || 0}deg)`,
    opacity: element.opacity,
    textShadow: tShadow,
    borderTop: `${element.style.borderTopWidth || 0}px ${element.style.borderStyle || 'solid'} ${element.style.borderColor || '#000000'}`,
    borderRight: `${element.style.borderRightWidth || 0}px ${element.style.borderStyle || 'solid'} ${element.style.borderColor || '#000000'}`,
    borderBottom: `${element.style.borderBottomWidth || 0}px ${element.style.borderStyle || 'solid'} ${element.style.borderColor || '#000000'}`,
    borderLeft: `${element.style.borderLeftWidth || 0}px ${element.style.borderStyle || 'solid'} ${element.style.borderColor || '#000000'}`,
  };

  if (element.type === 'hr') {
    commonStyle.backgroundClip = 'content-box';
  }

  if (element.style.bgGradientEnabled) {
    commonStyle.background = `linear-gradient(${element.style.bgGradientAngle || 0}deg, ${element.style.bgGradientStart || '#ffffff'}, ${element.style.bgGradientEnd || '#000000'})`;
  }
  if (element.style.textGradientEnabled) {
    commonStyle.background = `linear-gradient(${element.style.textGradientAngle || 0}deg, ${element.style.textGradientStart || '#ffffff'}, ${element.style.textGradientEnd || '#000000'})`;
    commonStyle.WebkitBackgroundClip = 'text';
    commonStyle.WebkitTextFillColor = 'transparent';
    commonStyle.backgroundClip = 'text';
    commonStyle.color = 'transparent';
  }

  if (element.type !== 'flex' && element.style.verticalAlign && element.style.verticalAlign !== 'top') {
    commonStyle.display = 'flex';
    commonStyle.flexDirection = 'column';
    commonStyle.justifyContent = element.style.verticalAlign === 'middle' ? 'center' : 'flex-end';
  }

  if (element.type === 'flex') {
    commonStyle.display = 'flex';
    commonStyle.flexDirection = element.flexDirection || 'row';
    commonStyle.justifyContent = element.justifyContent || 'flex-start';
    commonStyle.alignItems = element.alignItems || 'stretch';
    commonStyle.gap = (element.gap || 0) + 'px';
    commonStyle.flexWrap = 'wrap';
  }

  const renderContent = () => {
    const children = allElements.filter(el => el.parentId === element.id);
    children.sort((a,b) => a.zIndex - b.zIndex);

    if (element.type === 'flex') {
      return (
        <>
          {children.map(child => (
            <StaticElement key={child.id} element={child} globalSelectedId={globalSelectedId} onSelect={onSelect} onUpdate={onUpdate} allElements={allElements} />
          ))}
          {children.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs pointer-events-none border border-dashed border-gray-400 m-2 text-center text-inherit">
              Flex Container
            </div>
          )}
        </>
      );
    }

    if (element.type === 'table') {
      const rows = element.rows || 2;
      const cols = element.cols || 2;
      const gap = element.gap || 0; 
      const borderStyle = element.style.borderWidth ? `${element.style.borderWidth}px ${element.style.borderStyle} ${element.style.borderColor}` : '1px dashed #ccc';
      let tableGrid = [];
      for (let r = 0; r < rows; r++) {
        let rowCells = [];
        for (let c = 0; c < cols; c++) {
          const child = children.find(ch => ch.tableCell === `${r}-${c}`);
          rowCells.push(
            <td key={c} style={{ border: '1px dashed #ccc', padding: gap + 'px', verticalAlign: 'top', height: '50px' }}>
              {child ? (
                <StaticElement key={child.id} element={child} globalSelectedId={globalSelectedId} onSelect={onSelect} onUpdate={onUpdate} allElements={allElements} />
              ) : (<div className="w-full h-full min-h-[20px]"></div>)}
            </td>
          );
        }
        tableGrid.push(<tr key={r}>{rowCells}</tr>);
      }
      return (<table style={{ width: '100%', height: '100%', borderCollapse: 'collapse' }}><tbody>{tableGrid}</tbody></table>);
    }

    switch (element.type) {
      case 'image': return <img src={element.src} alt="" className="w-full h-full object-cover pointer-events-none" />;
      case 'text': return <div className="pointer-events-none break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: element.content }} />;
      case 'button': return <div className="flex items-center justify-center pointer-events-none text-inherit h-full" dangerouslySetInnerHTML={{ __html: element.content }} />;
      case 'hr': return <div className="w-full h-full" />; // Background handled by wrapper
      case 'webring': return (
        <div className="w-full h-full bg-[#c0c0c0] border-2 border-white border-outset flex flex-col items-center justify-center p-1 pointer-events-none text-xs">
          <div className="font-bold mb-1" dangerouslySetInnerHTML={{ __html: element.content }} />
          <div className="flex gap-2 text-[10px] text-blue-800 underline"><span>&lt; Prev</span><span>Hub</span><span>Next &gt;</span></div>
        </div>
      );
      case 'counter': return <div className="w-full h-full bg-black text-[#00FF00] font-mono flex items-center justify-center tracking-widest text-lg border-2 border-[#808080] border-inset pointer-events-none">004521</div>;
      case 'marquee': return <div className="w-full h-full flex items-center bg-inherit text-inherit overflow-hidden"><marquee scrollamount="5" className="w-full" dangerouslySetInnerHTML={{ __html: element.content }} /></div>;
      default: return <div className="w-full h-full pointer-events-none overflow-hidden" />;
    }
  };

  return (
    <div id={`preview-${element.id}`} style={commonStyle} onMouseDown={handleMouseDown} onClick={(e) => e.stopPropagation()}>
      {renderContent()}
      {element.href && (
        <div className="absolute top-0 right-0 p-0.5 bg-blue-600 z-50">
           <LinkIcon size={8} className="text-white" />
        </div>
      )}
      {isSelected && (
        <>
          <div className="absolute inset-0 border border-dashed border-blue-600 pointer-events-none" style={{ zIndex: 999 }} />
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-600 cursor-se-resize border border-white" onMouseDown={handleResizeDown} style={{ zIndex: 1000 }} />
        </>
      )}
    </div>
  );
};

const DraggableElement = ({ element, isSelected, globalSelectedId, onSelect, onUpdate, snapToGrid, onDragEnd, allElements }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startDims = useRef({ w: 0, h: 0 });

  const handleMouseDown = (e) => {
    e.stopPropagation();
    onSelect(element.id);
    setIsDragging(true);
    startPos.current = { x: e.clientX - element.x, y: e.clientY - element.y };
  };

  const handleResizeDown = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startDims.current = { w: element.width, h: element.height };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        if (element.fullWidth) {
           let newY = e.clientY - startPos.current.y;
           if (snapToGrid) newY = Math.round(newY / 20) * 20;
           onUpdate(element.id, { y: newY });
           return;
        }
        let newX = e.clientX - startPos.current.x;
        let newY = e.clientY - startPos.current.y;
        if (snapToGrid) {
          newX = Math.round(newX / 20) * 20;
          newY = Math.round(newY / 20) * 20;
        }
        onUpdate(element.id, { x: newX, y: newY });
      } else if (isResizing) {
        let newW = startDims.current.w + (e.clientX - startPos.current.x);
        let newH = startDims.current.h + (e.clientY - startPos.current.y);
        if (element.fullWidth) newW = element.width; 
        if (snapToGrid) {
          if (!element.fullWidth) newW = Math.round(newW / 20) * 20;
          newH = Math.round(newH / 20) * 20;
        }
        onUpdate(element.id, { width: Math.max(20, newW), height: Math.max(2, newH) });
      }
    };
    const handleMouseUp = (e) => {
      if (isDragging) { onDragEnd(element.id, e.clientX, e.clientY); }
      setIsDragging(false);
      setIsResizing(false);
    };
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, element, onUpdate, snapToGrid, onDragEnd]);

  const tShadow = element.style.textShadowEnabled 
    ? `${element.style.textShadowX || 2}px ${element.style.textShadowY || 2}px ${element.style.textShadowBlur || 0}px ${element.style.textShadowColor || '#000000'}`
    : 'none';

  const { textShadow, ...cleanStyle } = element.style;

  const commonStyle = {
    ...cleanStyle,
    position: 'absolute',
    display: element.style.display || 'block',
    left: element.fullWidth ? 0 : element.x,
    top: element.y,
    width: element.fullWidth ? '100%' : element.width,
    height: element.height,
    zIndex: element.zIndex,
    cursor: isDragging ? 'grabbing' : 'grab',
    boxSizing: 'border-box',
    animation: element.isBlinking ? `blinker ${element.blinkSpeed || 1}s linear infinite` : 'none',
    transform: `rotate(${element.rotation || 0}deg) skew(${element.skewX || 0}deg, ${element.skewY || 0}deg)`,
    opacity: element.opacity,
    textShadow: tShadow,
    borderTop: `${element.style.borderTopWidth || 0}px ${element.style.borderStyle || 'solid'} ${element.style.borderColor || '#000000'}`,
    borderRight: `${element.style.borderRightWidth || 0}px ${element.style.borderStyle || 'solid'} ${element.style.borderColor || '#000000'}`,
    borderBottom: `${element.style.borderBottomWidth || 0}px ${element.style.borderStyle || 'solid'} ${element.style.borderColor || '#000000'}`,
    borderLeft: `${element.style.borderLeftWidth || 0}px ${element.style.borderStyle || 'solid'} ${element.style.borderColor || '#000000'}`,
  };

  if (element.type === 'hr') {
    commonStyle.backgroundClip = 'content-box';
  }

  if (element.style.bgGradientEnabled) {
      commonStyle.background = `linear-gradient(${element.style.bgGradientAngle || 0}deg, ${element.style.bgGradientStart || '#ffffff'}, ${element.style.bgGradientEnd || '#000000'})`;
  }
  if (element.style.textGradientEnabled) {
      commonStyle.background = `linear-gradient(${element.style.textGradientAngle || 0}deg, ${element.style.textGradientStart || '#ffffff'}, ${element.style.textGradientEnd || '#000000'})`;
      commonStyle.WebkitBackgroundClip = 'text';
      commonStyle.WebkitTextFillColor = 'transparent';
      commonStyle.backgroundClip = 'text';
      commonStyle.color = 'transparent';
  }

  if (element.type !== 'flex' && element.style.verticalAlign && element.style.verticalAlign !== 'top') {
    commonStyle.display = 'flex';
    commonStyle.flexDirection = 'column';
    commonStyle.justifyContent = element.style.verticalAlign === 'middle' ? 'center' : 'flex-end';
  }

  if (element.type === 'flex') {
      commonStyle.display = 'flex';
      commonStyle.flexDirection = element.flexDirection || 'row';
      commonStyle.justifyContent = element.justifyContent || 'flex-start';
      commonStyle.alignItems = element.alignItems || 'stretch';
      commonStyle.gap = (element.gap || 0) + 'px';
      commonStyle.flexWrap = 'wrap';
  }

  const renderContent = () => {
    const children = allElements.filter(el => el.parentId === element.id);
    children.sort((a,b) => a.zIndex - b.zIndex);

    if (element.type === 'flex') {
        return (
        <>
          {children.map(child => (
            <StaticElement key={child.id} element={child} globalSelectedId={globalSelectedId} onSelect={onSelect} onUpdate={onUpdate} allElements={allElements} />
          ))}
          {children.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs pointer-events-none border border-dashed border-gray-400 m-2 text-center text-inherit">
              Flex Container
            </div>
          )}
        </>
      );
    }

    if (element.type === 'table') {
        const rows = element.rows || 2;
        const cols = element.cols || 2;
        const gap = element.gap || 0; 
        const borderStyle = element.style.borderWidth ? `${element.style.borderWidth}px ${element.style.borderStyle} ${element.style.borderColor}` : '1px dashed #ccc';
        let tableGrid = [];
        for (let r = 0; r < rows; r++) {
            let rowCells = [];
            for (let c = 0; c < cols; c++) {
                const child = children.find(ch => ch.tableCell === `${r}-${c}`);
                rowCells.push(
                    <td key={c} style={{ border: borderStyle, padding: gap + 'px', verticalAlign: 'top', height: '50px' }}>
                        {child ? (
                            <StaticElement key={child.id} element={child} globalSelectedId={globalSelectedId} onSelect={onSelect} onUpdate={onUpdate} allElements={allElements} />
                        ) : (<div className="w-full h-full min-h-[20px]"></div>)}
                    </td>
                );
            }
            tableGrid.push(<tr key={r}>{rowCells}</tr>);
        }
        return (<table style={{ width: '100%', height: '100%', borderCollapse: 'collapse' }}><tbody>{tableGrid}</tbody></table>);
    }

    switch (element.type) {
      case 'image': return <img src={element.src} alt="" className="w-full h-full object-cover pointer-events-none" />;
      case 'text': return <div className="pointer-events-none break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: element.content }} />;
      case 'button': return <div className="flex items-center justify-center pointer-events-none text-inherit h-full" dangerouslySetInnerHTML={{ __html: element.content }} />;
      case 'hr': return <div className="w-full h-full" />; // Background handled by wrapper
      case 'webring': return (
          <div className="w-full h-full bg-[#c0c0c0] border-2 border-white border-outset flex flex-col items-center justify-center p-1 pointer-events-none">
             <div className="font-bold mb-1 text-xs" dangerouslySetInnerHTML={{ __html: element.content }} />
             <div className="flex gap-2 text-[10px] text-blue-800 underline"><span>&lt; Prev</span><span>Hub</span><span>Next &gt;</span></div>
          </div>
      );
      case 'counter': return <div className="w-full h-full bg-black text-[#00FF00] font-mono flex items-center justify-center tracking-widest text-lg border-2 border-[#808080] border-inset pointer-events-none">004521</div>;
      case 'marquee': return <div className="w-full h-full flex items-center bg-inherit text-inherit overflow-hidden"><marquee scrollamount="5" className="w-full" dangerouslySetInnerHTML={{ __html: element.content }} /></div>;
      default: return <div className="w-full h-full pointer-events-none overflow-hidden" />;
    }
  };

  return (
    <div 
      id={`preview-${element.id}`}
      style={commonStyle} 
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
    >
      {renderContent()}
      {element.href && (
        <div className="absolute top-0 right-0 p-0.5 bg-blue-600 z-50">
           <LinkIcon size={8} className="text-white" />
        </div>
      )}
      {isSelected && (
        <>
          <div className="absolute inset-0 border border-dashed border-blue-600 pointer-events-none" style={{ zIndex: 999 }} />
          <div className={`absolute bottom-0 right-0 w-4 h-4 bg-blue-600 border border-white ${element.fullWidth ? 'cursor-ns-resize' : 'cursor-se-resize'}`} onMouseDown={handleResizeDown} style={{ zIndex: 1000 }} />
          <div className="absolute -top-6 left-0 bg-blue-600 text-white text-xs px-1 font-mono" style={{ zIndex: 1000 }}>ID: {element.id}</div>
        </>
      )}
    </div>
  );
};

export default function App() {
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [clipboard, setClipboard] = useState(null);
  
  const [selectedId, setSelectedId] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const [bgMusic, setBgMusic] = useState(null);
  const [bgMusicName, setBgMusicName] = useState('');
  const [cursor, setCursor] = useState(null);
  const [pageTitle, setPageTitle] = useState('My Y2K Website');
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [pageHeight, setPageHeight] = useState(800);
  const [pagePadding, setPagePadding] = useState(0);
  const [pageMargin, setPageMargin] = useState(0);
  const [pageColor, setPageColor] = useState('#ffffffff');
  
  const rootElements = useMemo(() => elements.filter(el => !el.parentId), [elements]);
  const selectedElement = elements.find(el => el.id === selectedId);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setElements(data.elements || []);
        setHistory([data.elements || []]);
        setHistoryIndex(0);
        setPageTitle(data.pageTitle || 'My Y2K Website');
        setPageHeight(data.pageHeight || 800);
        setPagePadding(data.pagePadding || 0);
        setPageMargin(data.pageMargin || 0);
        setPageColor(data.pageColor || '#c0c0c0');
        setBgImage(data.bgImage);
        setBgMusic(data.bgMusic);
        setBgMusicName(data.bgMusicName || '');
        setCursor(data.cursor);
      } catch (e) { console.error("Failed to load save", e); }
    }
  }, []);

  const saveToHistory = (newElements) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      if (newHistory.length > 50) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setElements(newElements);
  };

  const undo = () => {
      if (historyIndex > 0) {
          const newIdx = historyIndex - 1;
          setHistoryIndex(newIdx);
          setElements(history[newIdx]);
      }
  };

  const redo = () => {
      if (historyIndex < history.length - 1) {
          const newIdx = historyIndex + 1;
          setHistoryIndex(newIdx);
          setElements(history[newIdx]);
      }
  };

  const copyElement = () => {
      if (!selectedElement) return;
      const getDescendants = (parentId) => {
          let found = [];
          const children = elements.filter(el => el.parentId === parentId);
          children.forEach(child => {
              found.push(child);
              found = [...found, ...getDescendants(child.id)];
          });
          return found;
      };
      const elementCopy = JSON.parse(JSON.stringify(selectedElement));
      const descendants = getDescendants(selectedElement.id).map(d => JSON.parse(JSON.stringify(d)));
      setClipboard({ root: elementCopy, descendants });
  };

  const pasteElement = () => {
      if (!clipboard) return;
      const idMap = {};
      const generateNewId = (oldId) => {
          const newId = `el_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          idMap[oldId] = newId;
          return newId;
      };
      const newRoot = { ...clipboard.root };
      const oldRootId = newRoot.id;
      newRoot.id = generateNewId(oldRootId);
      newRoot.parentId = null; 
      newRoot.x += 20;
      newRoot.y += 20;
      const newDescendants = clipboard.descendants.map(d => {
          const clone = { ...d };
          clone.id = generateNewId(clone.id);
          return clone;
      });
      newDescendants.forEach(d => {
          d.parentId = idMap[d.parentId] || newRoot.id;
      });
      const newElements = [...elements, newRoot, ...newDescendants];
      saveToHistory(newElements);
      setSelectedId(newRoot.id);
  };

  const deleteElement = () => {
    if (selectedId) {
      const newElements = elements.filter(el => el.id !== selectedId && el.parentId !== selectedId);
      saveToHistory(newElements);
      setSelectedId(null);
    }
  };

  const handleUnparent = () => {
    if(selectedElement && selectedElement.parentId) {
        const newElements = elements.map(el => 
          el.id === selectedElement.id ? { ...el, parentId: null, x: 50, y: 50, flexGrow: false, fullHeight: false } : el
        );
        saveToHistory(newElements);
    }
  };

  const handleAlign = (axis) => {
    if (!selectedElement || selectedElement.parentId) return; 
    if (axis === 'horizontal') {
      const containerWidth = window.innerWidth - 256; 
      const newX = (containerWidth - (selectedElement.width || 0)) / 2;
      updateElement(selectedId, { x: newX });
    } else if (axis === 'vertical') {
      const newY = (pageHeight - (selectedElement.height || 0)) / 2;
      updateElement(selectedId, { y: newY });
    }
  };

  const updateElement = (id, updates) => {
    const newElements = elements.map(el => el.id === id ? { ...el, ...updates } : el);
    saveToHistory(newElements);
  };

  const updateStyle = (key, value) => {
    if (!selectedId) return;
    const newElements = elements.map(el => el.id === selectedId ? { ...el, style: { ...el.style, [key]: value } } : el);
    saveToHistory(newElements);
  };

  const handleDragEnd = (id, clientX, clientY) => {
    const draggedEl = elements.find(e => e.id === id);
    if(!draggedEl) return;
    const potentialContainers = elements.filter(el => (el.type === 'flex' || el.type === 'table') && el.id !== id);
    const validContainers = potentialContainers.filter(container => {
      let current = container;
      while(current.parentId) {
        if (current.parentId === id) return false; 
        current = elements.find(e => e.id === current.parentId);
        if (!current) break;
      }
      if (container.parentId === id) return false;
      const domEl = document.getElementById(`preview-${container.id}`);
      if (!domEl) return false;
      const rect = domEl.getBoundingClientRect();
      return (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom);
    });
    validContainers.sort((a,b) => b.zIndex - a.zIndex);
    if (validContainers.length > 0) { 
      updateElement(id, { parentId: validContainers[0].id }); 
    }
  };

  const saveProject = () => {
    const data = {
      elements, pageTitle, pageHeight, pagePadding, pageMargin, pageColor,
      bgImage, bgMusic, bgMusicName, cursor
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const clearProject = () => {
    if(confirm("Are you sure? This will delete your current project and cannot be undone.")) {
        localStorage.removeItem(STORAGE_KEY);
        setElements([]);
        setHistory([[]]);
        setHistoryIndex(0);
        setBgImage(null);
        setBgMusic(null);
        setCursor(null);
    }
  };

  const handleSample = () => {
    const code = generateExportCode(elements, bgImage, bgMusic, cursor, pageTitle, pageHeight, pagePadding, pageMargin, pageColor);
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleExport = () => {
    const code = generateExportCode(elements, bgImage, bgMusic, cursor, pageTitle, pageHeight, pagePadding, pageMargin, pageColor);
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'index.html'; a.click();
  };

  const addElement = (type, customProps = {}) => {
    const newId = `el_${Date.now()}`;
    const baseStyle = {
      color: '#000000', fontSize: 16, fontFamily: 'Times New Roman', textAlign: 'left',
      backgroundColor: type === 'box' || type === 'marquee' || type === 'guestbook' || type === 'flex' || type === 'table' ? '#ffffff' : 'transparent',
      borderColor: '#000000', borderWidth: 0, borderStyle: 'solid', borderRadius: 0, 
      borderTopWidth: 0, borderRightWidth: 0, borderBottomWidth: 0, borderLeftWidth: 0, 
      paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, fontWeight: 'normal',
      fontStyle: 'normal', textDecoration: 'none', textTransform: 'none', letterSpacing: 0, lineHeight: 1.2, textShadow: 'none',
      textShadowEnabled: false, textShadowX: 2, textShadowY: 2, textShadowBlur: 0, textShadowColor: '#000000',
      display: 'block', verticalAlign: 'top',
      bgGradientEnabled: false, bgGradientStart: '#ffffff', bgGradientEnd: '#000000', bgGradientAngle: 0,
      textGradientEnabled: false, textGradientStart: '#ffffff', textGradientEnd: '#000000', textGradientAngle: 0
    };

    let width = 100, height = 50, content = '';
    if (type === 'text') { width = 200; content = 'New Text...'; }
    if (type === 'marquee') { width = 200; content = 'Welcome to my site!'; }
    if (type === 'flex') { width = 300; height = 150; baseStyle.borderTopWidth = 1; baseStyle.borderRightWidth = 1; baseStyle.borderBottomWidth = 1; baseStyle.borderLeftWidth = 1; baseStyle.borderStyle = 'dotted'; }
    if (type === 'table') { width = 300; height = 150; baseStyle.borderTopWidth = 1; baseStyle.borderRightWidth = 1; baseStyle.borderBottomWidth = 1; baseStyle.borderLeftWidth = 1; baseStyle.borderStyle = 'solid'; }
    if (type === 'button') { width = 100; height = 30; content = 'Click Me'; baseStyle.backgroundColor = '#c0c0c0'; baseStyle.borderTopWidth = 2; baseStyle.borderRightWidth = 2; baseStyle.borderBottomWidth = 2; baseStyle.borderLeftWidth = 2; baseStyle.borderStyle = 'outset'; baseStyle.borderColor = '#ffffff'; baseStyle.textAlign = 'center'; }
    if (type === 'box') { baseStyle.borderTopWidth = 2; baseStyle.borderRightWidth = 2; baseStyle.borderBottomWidth = 2; baseStyle.borderLeftWidth = 2; }
    if (type === 'hr') { width = 200; height = 4; baseStyle.backgroundColor = '#000000'; }
    if (type === 'webring') { width = 150; height = 60; content = 'Cool Webring'; }
    if (type === 'counter') { width = 120; height = 40; }
    if (type === 'guestbook') { width = 250; height = 200; content = 'My Guestbook'; baseStyle.borderTopWidth = 2; baseStyle.borderRightWidth = 2; baseStyle.borderBottomWidth = 2; baseStyle.borderLeftWidth = 2; baseStyle.borderStyle = 'dashed'; }
    if (type === 'image') { width = 150; height = 150; }

    const newElement = {
      id: newId, type, x: 50 + (elements.length * 20), y: 50 + (elements.length * 20),
      width, height, zIndex: elements.length + 1, content, href: '', isBlinking: false, fullWidth: false, fullHeight: false, flexGrow: false, 
      tagName: 'div', parentId: null, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 5, rows: 2, cols: 2,
      rotation: 0, skewX: 0, skewY: 0, opacity: 1, blinkSpeed: 1,
      src: type === 'image' ? 'https://placehold.co/150x150?text=IMG' : null, style: baseStyle, ...customProps 
    };
    saveToHistory([...elements, newElement]);
    setSelectedId(newId);
  };

  const handleBgDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const base64 = await fileToBase64(file);
      setBgImage(base64);
    }
  };

  const handleCursorDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const base64 = await resizeForCursor(file);
      setCursor(base64);
    }
  };

  const handleAudioDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      const base64 = await fileToBase64(file);
      setBgMusic(base64); setBgMusicName(file.name);
    }
  };

  const handleCanvasDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.type.startsWith('image/')) {
      const base64 = await fileToBase64(file);
      const newId = `img_${Date.now()}`;
      const newElement = {
        id: newId, type: 'image', x: e.nativeEvent.offsetX - 75, y: e.nativeEvent.offsetY - 75,
        width: 150, height: 150, zIndex: elements.length + 1, src: base64, href: '',
        fullWidth: false, fullHeight: false, flexGrow: false, parentId: null,
        rotation: 0, skewX: 0, skewY: 0, opacity: 1, blinkSpeed: 1,
        style: { 
          color: '#000000', fontSize: 16, fontFamily: 'Times New Roman', textAlign: 'left',
          backgroundColor: 'transparent', borderColor: 'black', borderWidth: 0, borderStyle: 'solid', 
          paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, fontWeight: 'normal',
          fontStyle: 'normal', textDecoration: 'none', textTransform: 'none', letterSpacing: 0, lineHeight: 1.2, textShadow: 'none',
          textShadowEnabled: false, textShadowX: 2, textShadowY: 2, textShadowBlur: 0, textShadowColor: '#000000',
          display: 'block', verticalAlign: 'top',
          bgGradientEnabled: false, bgGradientStart: '#ffffff', bgGradientEnd: '#000000', bgGradientAngle: 0,
          textGradientEnabled: false, textGradientStart: '#ffffff', textGradientEnd: '#000000', textGradientAngle: 0
        }
      };
      saveToHistory([...elements, newElement]); setSelectedId(newId);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#c0c0c0] text-black overflow-hidden font-sans select-none">
        <style>{`@keyframes blinker { 50% { opacity: 0; } } .blink-text { animation: blinker 1s linear infinite; }`}</style>
      
      {/* LEFT SIDEBAR */}
      <div className="w-64 flex flex-col border-r-2 border-white border-r-[#808080] shadow-[inset_-2px_-2px_#ffffff,inset_2px_2px_#dfdfdf]">
        <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white p-1 px-2 font-bold text-sm flex items-center gap-2">
          <Monitor size={14} /> WebBuilder 2000
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="flex gap-1 mb-2">
            <button onClick={undo} disabled={historyIndex === 0} className={`flex-1 flex items-center justify-center gap-1 p-1 bg-[#c0c0c0] border-2 border-black text-xs ${historyIndex === 0 ? 'opacity-30' : 'hover:bg-[#d0d0d0]'}`} title="Undo (Ctrl+Z)"><Undo2 size={12}/> Undo</button>
            <button onClick={redo} disabled={historyIndex === history.length - 1} className={`flex-1 flex items-center justify-center gap-1 p-1 bg-[#c0c0c0] border-2 border-black text-xs ${historyIndex === history.length - 1 ? 'opacity-30' : 'hover:bg-[#d0d0d0]'}`} title="Redo (Ctrl+Y)"><Redo2 size={12}/> Redo</button>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-600 mb-1 border-b border-gray-400 pb-1">TOOLBOX</div>
            <button onClick={() => addElement('text')} className="w-full flex items-center gap-2 px-2 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black text-sm hover:bg-[#d0d0d0]"><Type size={14} /> Text</button>
            <button onClick={() => addElement('box')} className="w-full flex items-center gap-2 px-2 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black text-sm hover:bg-[#d0d0d0]"><Box size={14} /> Box / Div</button>
            <button onClick={() => addElement('flex')} className="w-full flex items-center gap-2 px-2 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black text-sm hover:bg-[#d0d0d0]"><BoxSelect size={14} /> Flex Box</button>
            <button onClick={() => addElement('table')} className="w-full flex items-center gap-2 px-2 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black text-sm hover:bg-[#d0d0d0]"><Table size={14} /> Table</button>
            <button onClick={pasteElement} disabled={!clipboard} className={`w-full flex items-center gap-2 px-2 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black text-sm ${!clipboard ? 'opacity-50' : 'hover:bg-[#d0d0d0]'}`} title="Paste from builder clipboard"><ClipboardPaste size={14} /> Paste Item</button>
            <button onClick={() => addElement('image')} className="w-full flex items-center gap-2 px-2 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black text-sm hover:bg-[#d0d0d0]"><ImageIcon size={14} /> Image</button>
            <button onClick={() => addElement('button')} className="w-full flex items-center gap-2 px-2 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black text-sm hover:bg-[#d0d0d0]"><div className="w-3 h-3 bg-gray-400 border border-black"></div> Button</button>
            <button onClick={() => addElement('marquee')} className="w-full flex items-center gap-2 px-2 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black text-sm hover:bg-[#d0d0d0]"><Move size={14} /> Marquee</button>
            <button onClick={() => addElement('webring')} className="w-full flex items-center gap-2 px-2 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black text-sm hover:bg-[#d0d0d0]"><Globe size={14} /> Webring Widget</button>
            <button onClick={() => addElement('counter')} className="w-full flex items-center gap-2 px-2 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black text-sm hover:bg-[#d0d0d0]"><Hash size={14} /> Visitor Counter</button>
            <button onClick={() => addElement('guestbook')} className="w-full flex items-center gap-2 px-2 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black text-sm hover:bg-[#d0d0d0]"><BookOpen size={14} /> Guestbook</button>
            <button onClick={() => addElement('hr')} className="w-full flex items-center gap-2 px-2 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black text-sm hover:bg-[#d0d0d0]"><Minus size={14} /> Divider (HR)</button>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-600 mb-1 border-b border-gray-400 pb-1">ASSETS</div>
            <div onDragOver={e => e.preventDefault()} onDrop={handleBgDrop} className="group relative border-2 border-dashed border-gray-500 bg-[#e0e0e0] p-2 text-center text-xs text-gray-600 hover:bg-white cursor-pointer">
              {bgImage ? (<img src={bgImage} alt="bg" className="w-full h-12 object-cover border border-gray-400 mb-1" />) : (<div className="flex flex-col items-center py-2"><ImageIcon size={16} className="mb-1 opacity-50" /><span>Drop Background</span></div>)}
            </div>
            <div onDragOver={e => e.preventDefault()} onDrop={handleAudioDrop} className="group relative border-2 border-dashed border-gray-500 bg-[#e0e0e0] p-2 text-center text-xs text-gray-600 hover:bg-white cursor-pointer">
              <div className="flex flex-col items-center py-2"><Music size={16} className={`mb-1 ${bgMusic ? 'text-blue-600 animate-pulse' : 'opacity-50'}`} /><span>{bgMusicName || 'Drop MP3 Audio'}</span></div>
            </div>
             <div onDragOver={e => e.preventDefault()} onDrop={handleCursorDrop} className="group relative border-2 border-dashed border-gray-500 bg-[#e0e0e0] p-2 text-center text-xs text-gray-600 hover:bg-white cursor-pointer">
               {cursor ? (<div className="flex items-center justify-center h-8"><img src={cursor} alt="cursor" className="w-6 h-6 object-contain" /></div>) : (<div className="flex flex-col items-center py-2"><MousePointer2 size={16} className="mb-1 opacity-50" /><span>Drop Cursor</span></div>)}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-400">
             <div className="text-xs font-bold text-gray-600 mb-1">PAGE SETTINGS</div>
             <div className="space-y-1">
                <input type="text" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} className="w-full text-xs p-1 border-2 border-[#808080] border-t-black border-l-black" placeholder="Page Title" />
                <div className="flex items-center gap-1">
                    <label className="text-[10px]">Color:</label>
                    <input type="color" value={pageColor} onChange={(e) => setPageColor(e.target.value)} className="flex-1 h-6 border-2 border-[#808080]" />
                </div>
                <div className="flex items-center gap-1"><label className="text-[10px]">Height:</label><input type="number" value={pageHeight} onChange={(e) => setPageHeight(parseInt(e.target.value) || 800)} className="flex-1 text-xs p-1 border-2 border-[#808080] border-t-black border-l-black" /></div>
                <div className="flex items-center gap-1"><label className="text-[10px]">Padding:</label><input type="number" value={pagePadding} onChange={(e) => setPagePadding(parseInt(e.target.value) || 0)} className="flex-1 text-xs p-1 border-2 border-[#808080] border-t-black border-l-black" /></div>
                <div className="flex items-center gap-1"><label className="text-[10px]">Margin:</label><input type="number" value={pageMargin} onChange={(e) => setPageMargin(parseInt(e.target.value) || 0)} className="flex-1 text-xs p-1 border-2 border-[#808080] border-t-black border-l-black" /></div>
             </div>
          </div>
        </div>

        <div className="p-2 border-t border-white border-t-[#808080] space-y-2">
           <div className="grid grid-cols-2 gap-1">
                <button onClick={saveProject} className="flex items-center justify-center gap-1 px-1 py-1.5 bg-green-200 border-2 border-black font-bold text-[10px] hover:bg-green-300"><Save size={12} /> Save Project</button>
                <button onClick={clearProject} className="flex items-center justify-center gap-1 px-1 py-1.5 bg-red-100 border-2 border-black font-bold text-[10px] hover:bg-red-200"><RotateCcw size={12} /> Clear Page</button>
           </div>
           <button onClick={handleSample} className="w-full flex items-center justify-center gap-2 px-2 py-2 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black font-bold text-sm hover:bg-[#d0d0d0]"><Eye size={16} /> Sample HTML</button>
           <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 px-2 py-2 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black font-bold text-sm hover:bg-[#d0d0d0]"><Download size={16} /> Export HTML</button>
        </div>
      </div>

      {/* MAIN CANVAS */}
      <div className="flex-1 relative bg-gray-200 overflow-hidden flex flex-col">
        <div className="bg-[#c0c0c0] border-b border-gray-500 p-1 px-2 text-xs flex justify-between items-center">
           <div className="flex gap-4"><span>Design View</span><span>{elements.length} Elements</span></div>
           <div className="flex items-center gap-2"><input type="checkbox" id="snapToggle" checked={snapToGrid} onChange={(e) => setSnapToGrid(e.target.checked)} /><label htmlFor="snapToggle" className="cursor-pointer flex items-center gap-1"><Grid size={12} /> Snap to Grid</label></div>
        </div>
        <div className="relative flex-1 overflow-auto">
            <div onDragOver={e => e.preventDefault()} onDrop={handleCanvasDrop} onClick={() => setSelectedId(null)}
                style={{ 
                    backgroundColor: pageColor, backgroundImage: bgImage ? `url(${bgImage})` : (snapToGrid ? 'radial-gradient(#ccc 1px, transparent 1px)' : undefined), backgroundSize: snapToGrid ? '20px 20px' : 'cover', cursor: cursor ? `url(${cursor}), auto` : 'default', height: pageHeight + 'px', minHeight: '100%', position: 'relative', width: '100%'
                }}
            >
                <div style={{ position: 'relative', width: '100%', height: '100%', padding: pagePadding + 'px', margin: pageMargin + 'px', boxSizing: 'border-box' }}>
                    {rootElements.map(el => (
                      <DraggableElement key={el.id} element={el} isSelected={selectedId === el.id} globalSelectedId={selectedId} onSelect={setSelectedId} onUpdate={updateElement} snapToGrid={snapToGrid} onDragEnd={handleDragEnd} allElements={elements} />
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: Properties */}
      {selectedElement ? (
        <div className="w-64 bg-[#c0c0c0] border-l-2 border-white border-l-[#808080] flex flex-col shadow-[inset_2px_2px_#ffffff]">
           <div className="bg-gradient-to-r from-[#808000] to-[#b0b000] text-white p-1 px-2 font-bold text-sm flex items-center gap-2"><Sliders size={14} /> Properties</div>
          <div className="p-4 space-y-4 overflow-y-auto">
            
            {/* ACTION BAR */}
            <div className="flex gap-1 mb-2 pb-2 border-b border-gray-400">
                <button onClick={copyElement} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-gray-200 border border-black text-[10px] hover:bg-gray-300" title="Deep copy element and children"><Copy size={12} /> Copy</button>
                <button onClick={deleteElement} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-red-100 border border-red-500 text-red-600 text-[10px] hover:bg-red-200"><Trash2 size={12} /> Delete</button>
            </div>

            {selectedElement.parentId && (
                <div className="space-y-2 mb-2 pb-2 border-b border-gray-400">
                    <div className="text-xs bg-yellow-200 p-1 border border-black font-bold text-center">Inside Container</div>
                    <div className="flex gap-1 mt-2">
                        <button onClick={() => setSelectedId(selectedElement.parentId)} className="flex-1 flex items-center justify-center gap-2 px-2 py-1 bg-blue-100 border border-blue-500 text-xs hover:bg-blue-200 font-bold"><ArrowUp size={12} /> Select Parent</button>
                        <button onClick={handleUnparent} className="flex-1 flex items-center justify-center gap-2 px-2 py-1 bg-red-100 border border-red-500 text-xs hover:bg-red-300 font-bold"><LogOut size={12} /> Ungroup</button>
                    </div>
                </div>
            )}

            {selectedElement.type === 'hr' ? (
                /* SIMPLIFIED HR CONTROLS */
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold flex items-center gap-1"><Scaling size={12}/> Divider Settings</label>
                        <div className="flex gap-1">
                            <div className="flex-1">
                                <label className="text-[10px]">Width (px)</label>
                                <input type="number" value={selectedElement.width || 0} onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })} className="w-full text-[10px] border border-black p-1" disabled={selectedElement.fullWidth} />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px]">Thickness (px)</label>
                                <input type="number" value={selectedElement.height || 0} onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) })} className="w-full text-[10px] border border-black p-1" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1 mb-2 pb-2 border-b border-gray-400">
                      <label className="text-xs font-bold flex items-center gap-1"><ArrowRightFromLine size={12}/> Padding (px)</label>
                      <div className="grid grid-cols-2 gap-1">
                        <input type="number" value={selectedElement.style.paddingTop || 0} onChange={(e) => updateStyle('paddingTop', parseInt(e.target.value))} className="w-full text-[10px] border border-black p-1" title="Top" />
                        <input type="number" value={selectedElement.style.paddingRight || 0} onChange={(e) => updateStyle('paddingRight', parseInt(e.target.value))} className="w-full text-[10px] border border-black p-1" title="Right" />
                        <input type="number" value={selectedElement.style.paddingBottom || 0} onChange={(e) => updateStyle('paddingBottom', parseInt(e.target.value))} className="w-full text-[10px] border border-black p-1" title="Bottom" />
                        <input type="number" value={selectedElement.style.paddingLeft || 0} onChange={(e) => updateStyle('paddingLeft', parseInt(e.target.value))} className="w-full text-[10px] border border-black p-1" title="Left" />
                      </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold">Color</label>
                        <input type="color" value={selectedElement.style.backgroundColor || '#000000'} onChange={(e) => updateStyle('backgroundColor', e.target.value)} className="h-8 w-full p-0 border-0" />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <input type="checkbox" id="fullWidthToggle" checked={selectedElement.fullWidth || false} onChange={(e) => updateElement(selectedElement.id, { fullWidth: e.target.checked })} />
                        <label htmlFor="fullWidthToggle" className="text-xs font-bold flex items-center gap-1"><Maximize2 size={10} /> Full Width?</label>
                    </div>
                </div>
            ) : (
                /* FULL CONTROLS FOR OTHER TOOLS */
                <>
                {!selectedElement.parentId && (
                  <div className="space-y-2 mb-2 pb-2 border-b border-gray-400">
                     <label className="text-xs font-bold">Align on Canvas</label>
                     <div className="flex gap-2">
                        <button onClick={() => handleAlign('horizontal')} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-gray-200 border border-black text-[10px] hover:bg-gray-300"><AlignHorizontalJustifyCenter size={12} /> Center X</button>
                        <button onClick={() => handleAlign('vertical')} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-gray-200 border border-black text-[10px] hover:bg-gray-300"><AlignVerticalJustifyCenter size={12} /> Center Y</button>
                     </div>
                  </div>
                )}
                
                {selectedElement.parentId && (
                    <div className="space-y-2 mb-2 pb-2 border-b border-gray-400">
                        <div className="flex items-center gap-2 mt-1"><input type="checkbox" id="flexGrowToggle" checked={selectedElement.flexGrow || false} onChange={(e) => updateElement(selectedElement.id, { flexGrow: e.target.checked })} /><label htmlFor="flexGrowToggle" className="text-xs font-bold text-blue-800">Flex Grow</label></div>
                        <div className="flex items-center gap-2 mt-1"><input type="checkbox" id="fullHeightToggle" checked={selectedElement.fullHeight || false} onChange={(e) => updateElement(selectedElement.id, { fullHeight: e.target.checked })} /><label htmlFor="fullHeightToggle" className="text-xs font-bold flex items-center gap-1"><ArrowUpFromLine size={10} /> Full Height</label></div>
                    </div>
                )}
                
                {selectedElement.type === 'flex' && (<div className="space-y-2 mb-2 pb-2 border-b border-gray-400"><label className="text-xs font-bold text-blue-800 flex items-center gap-1"><BoxSelect size={12}/> Flex</label>
                    <div className="flex gap-1"><button onClick={() => updateElement(selectedElement.id, { flexDirection: 'row' })} className={`flex-1 text-[10px] border border-black ${selectedElement.flexDirection === 'row' ? 'bg-blue-200' : 'bg-white'}`}>Row</button><button onClick={() => updateElement(selectedElement.id, { flexDirection: 'column' })} className={`flex-1 text-[10px] border border-black ${selectedElement.flexDirection === 'column' ? 'bg-blue-200' : 'bg-white'}`}>Col</button></div>
                    <select value={selectedElement.justifyContent || 'flex-start'} onChange={(e) => updateElement(selectedElement.id, { justifyContent: e.target.value })} className="w-full text-[10px] border border-black font-mono"><option value="flex-start">Start</option><option value="center">Center</option><option value="flex-end">End</option><option value="space-between">Between</option></select>
                    <select value={selectedElement.alignItems || 'stretch'} onChange={(e) => updateElement(selectedElement.id, { alignItems: e.target.value })} className="w-full text-[10px] border border-black font-mono mt-1"><option value="stretch">Stretch</option><option value="flex-start">Start</option><option value="center">Center</option><option value="flex-end">End</option></select>
                    <div className="flex items-center gap-1 mt-1"><label className="text-[10px]">Gap:</label><input type="number" value={selectedElement.gap || 0} onChange={(e) => updateElement(selectedElement.id, { gap: parseInt(e.target.value) })} className="flex-1 text-[10px] border border-black p-1" /></div>
                </div>)}

                <div className="space-y-2 mb-2 pb-2 border-b border-gray-400">
                    <label className="text-xs font-bold flex items-center gap-1"><RotateCw size={12}/> Transforms & Layout</label>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2"><label className="text-[10px] w-12">Display:</label><select value={selectedElement.style.display || 'block'} onChange={(e) => updateStyle('display', e.target.value)} className="flex-1 text-[10px] border border-black"><option value="block">Block</option><option value="inline-block">Inline-Block</option></select></div>
                        <div><div className="flex justify-between text-[10px] mb-1"><span>Rotation: {selectedElement.rotation || 0}°</span><button onClick={() => updateElement(selectedElement.id, { rotation: 0 })} className="underline text-[8px]">reset</button></div><input type="range" min="-180" max="180" value={selectedElement.rotation || 0} onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })} className="w-full h-2 bg-gray-400 rounded-lg appearance-none cursor-pointer" /></div>
                        <div><div className="flex justify-between text-[10px] mb-1"><span>Opacity: {Math.round((selectedElement.opacity || 1) * 100)}%</span></div><input type="range" min="0" max="1" step="0.05" value={selectedElement.opacity === undefined ? 1 : selectedElement.opacity} onChange={(e) => updateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })} className="w-full h-2 bg-gray-400 rounded-lg appearance-none cursor-pointer" /></div>
                    </div>
                </div>

                <div className="space-y-2 mb-2 pb-2 border-b border-gray-400">
                  <label className="text-xs font-bold flex items-center gap-1"><Type size={12}/> Typography</label>
                  
                  <div className="flex gap-1 mb-2">
                      <button onClick={() => updateStyle('textAlign', 'left')} className={`flex-1 p-1 border border-black ${selectedElement.style.textAlign === 'left' ? 'bg-blue-200' : 'bg-gray-100'}`}><AlignLeft size={12}/></button>
                      <button onClick={() => updateStyle('textAlign', 'center')} className={`flex-1 p-1 border border-black ${selectedElement.style.textAlign === 'center' ? 'bg-blue-200' : 'bg-gray-100'}`}><AlignCenter size={12}/></button>
                      <button onClick={() => updateStyle('textAlign', 'right')} className={`flex-1 p-1 border border-black ${selectedElement.style.textAlign === 'right' ? 'bg-blue-200' : 'bg-gray-100'}`}><AlignRight size={12}/></button>
                      <button onClick={() => updateStyle('textAlign', 'justify')} className={`flex-1 p-1 border border-black ${selectedElement.style.textAlign === 'justify' ? 'bg-blue-200' : 'bg-gray-100'}`}><AlignJustify size={12}/></button>
                  </div>
                  <div className="flex gap-1 mb-2">
                      <button onClick={() => updateStyle('verticalAlign', 'top')} className={`flex-1 p-1 border border-black ${selectedElement.style.verticalAlign === 'top' ? 'bg-blue-200' : 'bg-gray-100'}`}><ArrowUpToLine size={12}/></button>
                      <button onClick={() => updateStyle('verticalAlign', 'middle')} className={`flex-1 p-1 border border-black ${selectedElement.style.verticalAlign === 'middle' ? 'bg-blue-200' : 'bg-gray-100'}`}><AlignCenterVertical size={12}/></button>
                      <button onClick={() => updateStyle('verticalAlign', 'bottom')} className={`flex-1 p-1 border border-black ${selectedElement.style.verticalAlign === 'bottom' ? 'bg-blue-200' : 'bg-gray-100'}`}><ArrowDownToLine size={12}/></button>
                  </div>

                  <div className="flex gap-1"><select value={selectedElement.style.fontFamily || 'Times New Roman'} onChange={(e) => updateStyle('fontFamily', e.target.value)} className="flex-1 text-[10px] border border-black font-mono"><option value="Times New Roman">Times New Roman</option><option value="Arial">Arial</option><option value="Courier New">Courier New</option><option value="Comic Sans MS">Comic Sans MS</option><option value="Verdana">Verdana</option><option value="Impact">Impact</option></select><input type="number" value={selectedElement.style.fontSize || 16} onChange={(e) => updateStyle('fontSize', parseInt(e.target.value))} className="w-12 text-[10px] border border-black p-1" /></div>
                  <div className="flex gap-1">
                    <button onClick={() => updateStyle('fontWeight', selectedElement.style.fontWeight === 'bold' ? 'normal' : 'bold')} className={`p-1 border border-black ${selectedElement.style.fontWeight === 'bold' ? 'bg-blue-200' : 'bg-gray-100'}`}><Bold size={12}/></button>
                    <button onClick={() => updateStyle('fontStyle', selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic')} className={`p-1 border border-black ${selectedElement.style.fontStyle === 'italic' ? 'bg-blue-200' : 'bg-gray-100'}`}><Italic size={12}/></button>
                    <button onClick={() => updateStyle('textDecoration', selectedElement.style.textDecoration === 'underline' ? 'none' : 'underline')} className={`p-1 border border-black ${selectedElement.style.textDecoration === 'underline' ? 'bg-blue-200' : 'bg-gray-100'}`}><Underline size={12}/></button>
                    <button onClick={() => updateStyle('textDecoration', selectedElement.style.textDecoration === 'line-through' ? 'none' : 'line-through')} className={`p-1 border border-black ${selectedElement.style.textDecoration === 'line-through' ? 'bg-blue-200' : 'bg-gray-100'}`}><Strikethrough size={12}/></button>
                  </div>
                  <div className="flex gap-1 items-center"><label className="text-[10px] w-12">Case:</label><div className="flex gap-1 flex-1"><button onClick={() => updateStyle('textTransform', 'none')} className={`flex-1 p-1 border border-black text-[10px] ${selectedElement.style.textTransform === 'none' ? 'bg-blue-200' : 'bg-gray-100'}`}>Aa</button><button onClick={() => updateStyle('textTransform', 'uppercase')} className={`flex-1 p-1 border border-black text-[10px] ${selectedElement.style.textTransform === 'uppercase' ? 'bg-blue-200' : 'bg-gray-100'}`}>AA</button><button onClick={() => updateStyle('textTransform', 'capitalize')} className={`flex-1 p-1 border border-black text-[10px] ${selectedElement.style.textTransform === 'capitalize' ? 'bg-blue-200' : 'bg-gray-100'}`}>Aa^</button></div></div>
                  <div className="flex gap-1 items-center"><div className="flex-1"><label className="text-[10px] block">Tracking</label><input type="number" step="0.5" value={selectedElement.style.letterSpacing || 0} onChange={(e) => updateStyle('letterSpacing', parseFloat(e.target.value))} className="w-full text-[10px] border border-black p-1" /></div><div className="flex-1"><label className="text-[10px] block">Line H</label><input type="number" step="0.1" value={selectedElement.style.lineHeight || 1.2} onChange={(e) => updateStyle('lineHeight', parseFloat(e.target.value))} className="w-full text-[10px] border border-black p-1" /></div></div>
                  
                  {/* Text Gradient UI */}
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold flex items-center gap-1"><Palette size={10}/> Text Gradient</label>
                        <input type="checkbox" checked={selectedElement.style.textGradientEnabled || false} onChange={(e) => updateStyle('textGradientEnabled', e.target.checked)} />
                    </div>
                    {selectedElement.style.textGradientEnabled && (
                        <div className="space-y-2 p-1 border border-gray-400 bg-gray-100 rounded">
                            <div className="flex gap-1"><input type="color" value={selectedElement.style.textGradientStart || '#ffffff'} onChange={(e) => updateStyle('textGradientStart', e.target.value)} className="flex-1 h-5 border border-black" /><input type="color" value={selectedElement.style.textGradientEnd || '#000000'} onChange={(e) => updateStyle('textGradientEnd', e.target.value)} className="flex-1 h-5 border border-black" /></div>
                            <div className="flex items-center gap-1"><label className="text-[8px]">Angle:</label><input type="range" min="0" max="360" value={selectedElement.style.textGradientAngle || 0} onChange={(e) => updateStyle('textGradientAngle', parseInt(e.target.value))} className="flex-1 h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer" /><span className="text-[8px]">{selectedElement.style.textGradientAngle || 0}°</span></div>
                        </div>
                    )}
                  </div>

                  <div>
                      <label className="text-[10px] block font-bold mt-1">Text Shadow</label>
                      <div className="flex items-center justify-between mb-1">
                          <label className="text-[9px]">Enabled</label>
                          <input type="checkbox" checked={selectedElement.style.textShadowEnabled || false} onChange={(e) => updateStyle('textShadowEnabled', e.target.checked)} />
                      </div>
                      {selectedElement.style.textShadowEnabled && (
                        <div className="grid grid-cols-2 gap-1 mt-1">
                            <div className="flex flex-col gap-1"><div className="flex justify-between text-[8px]"><span>X: {selectedElement.style.textShadowX}</span></div><input type="range" min="-10" max="10" value={selectedElement.style.textShadowX || 2} onChange={(e) => updateStyle('textShadowX', parseInt(e.target.value))} className="w-full h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer" /></div>
                            <div className="flex flex-col gap-1"><div className="flex justify-between text-[8px]"><span>Y: {selectedElement.style.textShadowY}</span></div><input type="range" min="-10" max="10" value={selectedElement.style.textShadowY || 2} onChange={(e) => updateStyle('textShadowY', parseInt(e.target.value))} className="w-full h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer" /></div>
                            <div className="flex flex-col gap-1"><div className="flex justify-between text-[8px]"><span>Blur: {selectedElement.style.textShadowBlur}</span></div><input type="range" min="0" max="20" value={selectedElement.style.textShadowBlur || 0} onChange={(e) => updateStyle('textShadowBlur', parseInt(e.target.value))} className="w-full h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer" /></div>
                            <input type="color" value={selectedElement.style.textShadowColor || '#000000'} onChange={(e) => updateStyle('textShadowColor', e.target.value)} className="w-full h-5 border border-black" />
                        </div>
                      )}
                  </div>
                  <div className="flex gap-1 items-center mt-2">
                    <label className="text-[10px] w-12">Blink Speed:</label>
                    <div className="flex-1 flex flex-col gap-1">
                        <input type="range" min="0.1" max="3" step="0.1" value={selectedElement.blinkSpeed || 1} onChange={(e) => updateElement(selectedElement.id, { blinkSpeed: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer" />
                        <div className="flex justify-between text-[8px]"><span>Faster</span><span>{selectedElement.blinkSpeed || 1}s</span><span>Slower</span></div>
                    </div>
                  </div>
                  {selectedElement.type === 'text' && (<div className="flex items-center gap-2 mt-1"><input type="checkbox" id="blinkToggle" checked={selectedElement.isBlinking || false} onChange={(e) => updateElement(selectedElement.id, { isBlinking: e.target.checked })} /><label htmlFor="blinkToggle" className="text-xs font-bold text-red-600 flex items-center gap-1"><Zap size={10} /> Blinking?</label></div>)}
                </div>

                <div className="space-y-1 mb-2 pb-2 border-b border-gray-400"><label className="text-xs font-bold flex items-center gap-1"><Scaling size={12}/> Sizes (px)</label>
                  <div className="flex gap-1">
                    <div className="flex-1"><label className="text-[10px]">W</label><input type="number" value={selectedElement.width || 0} onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })} className="w-full text-[10px] border border-black p-1" disabled={selectedElement.fullWidth} /></div>
                    <div className="flex-1"><label className="text-[10px]">H</label><input type="number" value={selectedElement.height || 0} onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) })} className="w-full text-[10px] border border-black p-1" disabled={selectedElement.fullHeight} /></div>
                  </div>
                </div>
                <div className="space-y-1 mb-2 pb-2 border-b border-gray-400"><label className="text-xs font-bold flex items-center gap-1"><ArrowRightFromLine size={12}/> Padding (px)</label>
                  <div className="grid grid-cols-2 gap-1">
                    <input type="number" value={selectedElement.style.paddingTop || 0} onChange={(e) => updateStyle('paddingTop', parseInt(e.target.value))} className="w-full text-[10px] border border-black p-1" title="Top" />
                    <input type="number" value={selectedElement.style.paddingRight || 0} onChange={(e) => updateStyle('paddingRight', parseInt(e.target.value))} className="w-full text-[10px] border border-black p-1" title="Right" />
                    <input type="number" value={selectedElement.style.paddingBottom || 0} onChange={(e) => updateStyle('paddingBottom', parseInt(e.target.value))} className="w-full text-[10px] border border-black p-1" title="Bottom" />
                    <input type="number" value={selectedElement.style.paddingLeft || 0} onChange={(e) => updateStyle('paddingLeft', parseInt(e.target.value))} className="w-full text-[10px] border border-black p-1" title="Left" />
                  </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold">Text Color</label>
                    <div className="flex gap-2 items-center">
                        <input type="color" value={selectedElement.style.color || '#000000'} onChange={(e) => updateStyle('color', e.target.value)} className="h-6 w-8 p-0 border-0" disabled={selectedElement.style.textGradientEnabled} />
                        {selectedElement.style.textGradientEnabled && <span className="text-[8px] italic">Using Gradient</span>}
                    </div>
                </div>

                <div className="space-y-1 mt-2">
                    <label className="text-xs font-bold">Background Color</label>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-[9px]">Use Gradient</label>
                        <input type="checkbox" checked={selectedElement.style.bgGradientEnabled || false} onChange={(e) => updateStyle('bgGradientEnabled', e.target.checked)} />
                    </div>
                    {selectedElement.style.bgGradientEnabled ? (
                        <div className="space-y-2 p-1 border border-gray-400 bg-gray-100 rounded">
                            <div className="flex gap-1"><input type="color" value={selectedElement.style.bgGradientStart || '#ffffff'} onChange={(e) => updateStyle('bgGradientStart', e.target.value)} className="flex-1 h-5 border border-black" /><input type="color" value={selectedElement.style.bgGradientEnd || '#000000'} onChange={(e) => updateStyle('bgGradientEnd', e.target.value)} className="flex-1 h-5 border border-black" /></div>
                            <div className="flex items-center gap-1"><label className="text-[8px]">Angle:</label><input type="range" min="0" max="360" value={selectedElement.style.bgGradientAngle || 0} onChange={(e) => updateStyle('bgGradientAngle', parseInt(e.target.value))} className="flex-1 h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer" /><span className="text-[8px]">{selectedElement.style.bgGradientAngle || 0}°</span></div>
                        </div>
                    ) : (
                        <div className="flex gap-2"><input type="color" value={(selectedElement.style.backgroundColor === 'transparent' || !selectedElement.style.backgroundColor) ? '#ffffff' : selectedElement.style.backgroundColor} onChange={(e) => updateStyle('backgroundColor', e.target.value)} className="h-6 w-8 p-0 border-0" /><button onClick={() => updateStyle('backgroundColor', 'transparent')} className="text-xs px-2 bg-gray-300 border border-gray-500 font-bold">Trans.</button></div>
                    )}
                </div>

                <div className="space-y-1 mt-2 pt-2 border-t border-gray-400">
                    <label className="text-xs font-bold">Border Controls</label>
                    <div className="grid grid-cols-2 gap-1 mb-2">
                        <div><label className="text-[8px] block">Top Width</label><input type="number" value={selectedElement.style.borderTopWidth || 0} onChange={(e) => updateStyle('borderTopWidth', parseInt(e.target.value))} className="w-full text-[10px] p-1 border-2 border-[#808080] border-t-black border-l-black" /></div>
                        <div><label className="text-[8px] block">Right Width</label><input type="number" value={selectedElement.style.borderRightWidth || 0} onChange={(e) => updateStyle('borderRightWidth', parseInt(e.target.value))} className="w-full text-[10px] p-1 border-2 border-[#808080] border-t-black border-l-black" /></div>
                        <div><label className="text-[8px] block">Bottom Width</label><input type="number" value={selectedElement.style.borderBottomWidth || 0} onChange={(e) => updateStyle('borderBottomWidth', parseInt(e.target.value))} className="w-full text-[10px] p-1 border-2 border-[#808080] border-t-black border-l-black" /></div>
                        <div><label className="text-[8px] block">Left Width</label><input type="number" value={selectedElement.style.borderLeftWidth || 0} onChange={(e) => updateStyle('borderLeftWidth', parseInt(e.target.value))} className="w-full text-[10px] p-1 border-2 border-[#808080] border-t-black border-l-black" /></div>
                    </div>
                    <div className="flex gap-1 mb-1">
                        <div className="flex-1">
                            <label className="text-[8px]">Style</label>
                            <select value={selectedElement.style.borderStyle || 'solid'} onChange={(e) => updateStyle('borderStyle', e.target.value)} className="w-full text-[10px] p-1 border-2 border-[#808080] border-t-black border-l-black">
                                <option value="solid">Solid</option>
                                <option value="dashed">Dashed</option>
                                <option value="dotted">Dotted</option>
                                <option value="double">Double</option>
                                <option value="ridge">Ridge</option>
                                <option value="groove">Groove</option>
                                <option value="inset">Inset</option>
                                <option value="outset">Outset</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[8px]"><span>Rounding (px): {selectedElement.style.borderRadius || 0}</span></div>
                        <input type="range" min="0" max="100" value={selectedElement.style.borderRadius || 0} onChange={(e) => updateStyle('borderRadius', parseInt(e.target.value))} className="w-full h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <input type="color" value={selectedElement.style.borderColor || '#000000'} onChange={(e) => updateStyle('borderColor', e.target.value)} className="h-6 w-full p-0 border-0 mt-1" />
                </div>

                <div className="space-y-2 mb-2 mt-2 pb-2 border-b border-gray-400">
                    <label className="text-xs font-bold">Element Content</label>
                    {(selectedElement.type === 'text' || selectedElement.type === 'marquee' || selectedElement.type === 'button' || selectedElement.type === 'webring') && (<div className="border border-gray-400"><RichTextEditor content={selectedElement.content} onChange={(html) => updateElement(selectedElement.id, { content: html })} /></div>)}
                    {selectedElement.type === 'image' && (<div><input type="text" value={selectedElement.src || ''} onChange={(e) => updateElement(selectedElement.id, { src: e.target.value })} className="w-full text-xs p-1 border-2 border-[#808080] border-t-black border-l-black font-mono" /></div>)}
                    {(selectedElement.type === 'button' || selectedElement.type === 'text' || selectedElement.type === 'image') && (<div><label className="text-[10px] block">Link URL</label><input type="text" placeholder="https://..." value={selectedElement.href || ''} onChange={(e) => updateElement(selectedElement.id, { href: e.target.value })} className="w-full text-xs p-1 border-2 border-[#808080] border-t-black border-l-black font-mono text-blue-800" /></div>)}
                    
                    <div className="flex items-center gap-2 mt-2">
                        <input type="checkbox" id="fullWidthToggle" checked={selectedElement.fullWidth || false} onChange={(e) => updateElement(selectedElement.id, { fullWidth: e.target.checked })} />
                        <label htmlFor="fullWidthToggle" className="text-xs font-bold flex items-center gap-1"><Maximize2 size={10} /> Full Width?</label>
                    </div>
                </div>
                </>
            )}

            <div className="space-y-1 mt-2"><label className="text-xs font-bold">Layer</label><div className="flex gap-2"><button onClick={() => updateElement(selectedElement.id, { zIndex: selectedElement.zIndex - 1 })} className="px-2 bg-gray-300 border border-gray-500 text-xs">-</button><span className="text-xs self-center">{selectedElement.zIndex}</span><button onClick={() => updateElement(selectedElement.id, { zIndex: selectedElement.zIndex + 1 })} className="px-2 bg-gray-300 border border-gray-500 text-xs">+</button></div></div>
            <div className="pt-4 mt-4 border-t border-gray-400"><button onClick={deleteElement} className="w-full flex items-center justify-center gap-2 px-2 py-1 bg-red-100 border border-red-500 text-red-600 text-xs font-bold hover:bg-red-200"><Trash2 size={12} /> Delete Element</button></div>
          </div>
        </div>
      ) : (
        <div className="w-64 bg-[#c0c0c0] border-l-2 border-white border-l-[#808080] flex flex-col shadow-[inset_2px_2px_#ffffff] items-center justify-center text-gray-500 text-sm p-4 text-center"><Layers className="mb-2 opacity-50" />Select an element to edit properties</div>
      )}
    </div>
  );
}