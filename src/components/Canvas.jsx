import React from 'react';
import { Grid } from 'lucide-react';
import DraggableElement from './DraggableElement';

const Canvas = ({
  elements, rootElements, selectedId, setSelectedId,
  updateElement, snapToGrid, setSnapToGrid,
  handleDragEnd, handleCanvasDrop,
  pageColor, bgImage, bgImageStyle, bgImageTileSize, cursor, pageHeight, pagePadding, pageMargin,
}) => {
  // Generate background style based on bgImageStyle
  const getBackgroundStyle = () => {
    if (!bgImage) {
      return snapToGrid ? {
        backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      } : {};
    }

    const baseStyle = {
      backgroundImage: `url(${bgImage})`
    };

    switch (bgImageStyle) {
      case 'cover':
        return { ...baseStyle, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' };
      case 'contain':
        return { ...baseStyle, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' };
      case 'repeat':
        return { ...baseStyle, backgroundSize: 'auto', backgroundRepeat: 'repeat' };
      case 'tile':
        return { ...baseStyle, backgroundSize: `${bgImageTileSize}px ${bgImageTileSize}px`, backgroundRepeat: 'repeat' };
      case 'center':
        return { ...baseStyle, backgroundSize: 'auto', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' };
      default:
        return { ...baseStyle, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' };
    }
  };
  return (
    <div className="flex-1 relative bg-gray-200 overflow-hidden flex flex-col">
      <div className="bg-[#c0c0c0] border-b border-gray-500 p-1 px-2 text-xs flex justify-between items-center">
         <div className="flex gap-4"><span>Design View</span><span>{elements.length} Elements</span></div>
         <div className="flex items-center gap-2"><input type="checkbox" id="snapToggle" checked={snapToGrid} onChange={(e) => setSnapToGrid(e.target.checked)} /><label htmlFor="snapToggle" className="cursor-pointer flex items-center gap-1"><Grid size={12} /> Snap to Grid</label></div>
      </div>
      <div className="relative flex-1 overflow-auto">
          <div onDragOver={e => e.preventDefault()} onDrop={handleCanvasDrop} onClick={() => setSelectedId(null)}
              style={{
                  backgroundColor: pageColor,
                  ...getBackgroundStyle(),
                  cursor: cursor ? `url(${cursor}), auto` : 'default',
                  height: pageHeight + 'px',
                  minHeight: '100%',
                  position: 'relative',
                  width: '100%'
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
  );
};

export default Canvas;
