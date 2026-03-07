import React, { useState, useRef, useEffect } from 'react';
import { Link as LinkIcon } from 'lucide-react';
import placeholder from '../assets/400x400.png';
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
      case 'image': return <img src={element.src ? element.src : placeholder} alt="" className="w-full h-full object-cover pointer-events-none" />;
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

export default StaticElement;
