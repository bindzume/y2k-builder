import React from 'react';
import { Grid } from 'lucide-react';
import DraggableElement from './DraggableElement';

const Canvas = ({
  elements, rootElements, selectedId, setSelectedId,
  updateElement, snapToGrid, setSnapToGrid,
  handleDragEnd, handleCanvasDrop,
  pageColor, bgImage, cursor, pageHeight, pagePadding, pageMargin,
}) => {
  return (
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
  );
};

export default Canvas;
