import React, { useState, useEffect } from 'react';
import {
  Trash2, Layers, Sliders, Scaling, ArrowRightFromLine, Maximize2,
  AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter, LogOut,
  ArrowUpFromLine, BoxSelect, RotateCw, Type, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, ArrowUpToLine, ArrowDownToLine, AlignCenterVertical,
  Zap, Copy, Bold, Italic, Underline, Strikethrough, Palette, ArrowUp,
  MousePointer, MousePointerClick
} from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { fileToBase64 } from '../utils/fileHelpers';




const PropertiesPanel = ({
  selectedElement,
  updateElement,
  updateStyle,
  copyElement,
  deleteElement,
  handleUnparent,
  handleAlign,
  setSelectedId,
}) => {
  const [tempColor, setTempColor] = useState(null);

  useEffect(() => {
    setTempColor(null);
  }, [selectedElement?.id]);

  // 👇 ADD THIS NEW FUNCTION 👇
  const handleDimensionChange = (dimension, value) => {
    const newValue = parseInt(value) || 0;
    const updates = { [dimension]: newValue };

    // If locked, calculate the aspect ratio and apply it to the counterpart
    if (selectedElement.lockAspectRatio && selectedElement.width && selectedElement.height) {
      const ratio = selectedElement.width / selectedElement.height;
      
      if (dimension === 'width') {
        updates.height = Math.round(newValue / ratio);
      } else if (dimension === 'height') {
        updates.width = Math.round(newValue * ratio);
      }
    }

    updateElement(selectedElement.id, updates);
  };
  
  const handleBgImageDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files && e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const base64 = await fileToBase64(file);
      updateStyle('backgroundImage', base64);
    }
  };

  if (!selectedElement) {
    return (
      <div className="w-64 bg-[#c0c0c0] border-l-2 border-white border-l-[#808080] flex flex-col shadow-[inset_2px_2px_#ffffff] items-center justify-center text-gray-500 text-sm p-4 text-center"><Layers className="mb-2 opacity-50" />Select an element to edit properties</div>
    );
  }

  return (
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
                    <div><label className="text-[8px] block">Top</label><input type="number" value={selectedElement.style.paddingTop || 0} onChange={(e) => updateStyle('paddingTop', parseInt(e.target.value))} className="w-full text-[10px] border border-black p-1" /></div>
                    <div><label className="text-[8px] block">Right</label><input type="number" value={selectedElement.style.paddingRight || 0} onChange={(e) => updateStyle('paddingRight', parseInt(e.target.value))} className="w-full text-[10px] border border-black p-1" /></div>
                    <div><label className="text-[8px] block">Bottom</label><input type="number" value={selectedElement.style.paddingBottom || 0} onChange={(e) => updateStyle('paddingBottom', parseInt(e.target.value))} className="w-full text-[10px] border border-black p-1" /></div>
                    <div><label className="text-[8px] block">Left</label><input type="number" value={selectedElement.style.paddingLeft || 0} onChange={(e) => updateStyle('paddingLeft', parseInt(e.target.value))} className="w-full text-[10px] border border-black p-1" /></div>
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

                <div className="mt-3 pt-2 border-t border-gray-300">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold">Marquee Scroll</label>
                        <input type="checkbox" checked={selectedElement.marqueeEnabled || false} onChange={(e) => updateElement(selectedElement.id, { marqueeEnabled: e.target.checked })} />
                    </div>
                    {selectedElement.marqueeEnabled && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <label className="text-[10px]">Direction:</label>
                                <select value={selectedElement.marqueeDirection || 'left'} onChange={(e) => updateElement(selectedElement.id, { marqueeDirection: e.target.value })} className="flex-1 text-[10px] border border-black">
                                    <option value="left">← Left</option>
                                    <option value="right">→ Right</option>
                                    <option value="up">↑ Up</option>
                                    <option value="down">↓ Down</option>
                                </select>
                            </div>
                            <div>
                                <div className="flex justify-between text-[8px] mb-1">
                                    <span>Speed: {selectedElement.marqueeSpeed || 10}s</span>
                                    <span className="text-gray-500">Slower ← → Faster</span>
                                </div>
                                <input type="range" min="3" max="30" value={selectedElement.marqueeSpeed || 10} onChange={(e) => updateElement(selectedElement.id, { marqueeSpeed: parseInt(e.target.value) })} className="w-full h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer" />
                            </div>
                        </div>
                    )}
                </div>
            </div>)}

            <div className="space-y-2 mb-2 pb-2 border-b border-gray-400">
                <label className="text-xs font-bold flex items-center gap-1"><RotateCw size={12}/> Transforms & Layout</label>
                <div className="space-y-2">
                    <div className="flex items-center gap-2"><label className="text-[10px] w-12">Display:</label><select value={selectedElement.style.display || 'block'} onChange={(e) => updateStyle('display', e.target.value)} className="flex-1 text-[10px] border border-black"><option value="block">Block</option><option value="inline-block">Inline-Block</option></select></div>
                    <div><div className="flex justify-between text-[10px] mb-1"><span>Rotation: {selectedElement.rotation || 0}°</span><button onClick={() => updateElement(selectedElement.id, { rotation: 0 })} className="underline text-[8px]">reset</button></div><input type="range" min="-180" max="180" value={selectedElement.rotation || 0} onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })} className="w-full h-2 bg-gray-400 rounded-lg appearance-none cursor-pointer" /></div>
                    <div><div className="flex justify-between text-[10px] mb-1"><span>Opacity: {Math.round((selectedElement.opacity || 1) * 100)}%</span></div><input type="range" min="0" max="1" step="0.05" value={selectedElement.opacity === undefined ? 1 : selectedElement.opacity} onChange={(e) => updateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })} className="w-full h-2 bg-gray-400 rounded-lg appearance-none cursor-pointer" /></div>
                </div>
            </div>

            {!['image', 'counter', 'hr', 'table', 'flex'].includes(selectedElement.type) && (
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
            </div>
            )}

            <div className="space-y-2 mb-2 pb-2 border-b border-gray-400">
              <div className="flex gap-1 items-center">
                <label className="text-[10px] w-12">Blink Speed:</label>
                <div className="flex-1 flex flex-col gap-1">
                    <input type="range" min="0.1" max="3" step="0.1" value={selectedElement.blinkSpeed || 1} onChange={(e) => updateElement(selectedElement.id, { blinkSpeed: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer" />
                    <div className="flex justify-between text-[8px]"><span>Faster</span><span>{selectedElement.blinkSpeed || 1}s</span><span>Slower</span></div>
                </div>
              </div>
              <div className="flex items-center gap-2"><input type="checkbox" id="blinkToggle" checked={selectedElement.isBlinking || false} onChange={(e) => updateElement(selectedElement.id, { isBlinking: e.target.checked })} /><label htmlFor="blinkToggle" className="text-xs font-bold text-red-600 flex items-center gap-1"><Zap size={10} /> Blinking?</label></div>
            </div>

            <div className="space-y-1 mb-2 pb-2 border-b border-gray-400"><label className="text-xs font-bold flex items-center gap-1"><Scaling size={12}/> Sizes (px)</label>
              <div className="flex gap-1">
                <div className="flex-1"><label className="text-[10px]">W</label><input type="number" value={selectedElement.width || 0} onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })} className="w-full text-[10px] border border-black p-1" disabled={selectedElement.fullWidth} /></div>
                <div className="flex-1"><label className="text-[10px]">H</label><input type="number" value={selectedElement.height || 0} onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) })} className="w-full text-[10px] border border-black p-1" disabled={selectedElement.fullHeight} /></div>
              </div>
            </div>
            <div className="space-y-1 mb-2 pb-2 border-b border-gray-400"><label className="text-xs font-bold flex items-center gap-1"><ArrowRightFromLine size={12}/> Padding (px)</label>
              <div className="grid grid-cols-2 gap-1">
                <div><label className="text-[8px] block">Top</label><input type="number" value={selectedElement.style.paddingTop || 0} onChange={(e) => updateStyle('paddingTop', parseInt(e.target.value))} className="w-full text-[10px] border border-black p-1" /></div>
                <div><label className="text-[8px] block">Right</label><input type="number" value={selectedElement.style.paddingRight || 0} onChange={(e) => updateStyle('paddingRight', parseInt(e.target.value))} className="w-full text-[10px] border border-black p-1" /></div>
                <div><label className="text-[8px] block">Bottom</label><input type="number" value={selectedElement.style.paddingBottom || 0} onChange={(e) => updateStyle('paddingBottom', parseInt(e.target.value))} className="w-full text-[10px] border border-black p-1" /></div>
                <div><label className="text-[8px] block">Left</label><input type="number" value={selectedElement.style.paddingLeft || 0} onChange={(e) => updateStyle('paddingLeft', parseInt(e.target.value))} className="w-full text-[10px] border border-black p-1" /></div>
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
                {/* Background image controls (allow flexboxes and other elements to have images). Supports drag-and-drop. */}
                <div className="mt-2" onDragOver={(e) => e.preventDefault()} onDrop={handleBgImageDrop}>
                  <label className="text-[10px] block">Background Image URL / Drop Image Here</label>
                  <div className="flex items-center gap-2">
                    <input type="text" value={selectedElement.style.backgroundImage || ''} onChange={(e) => updateStyle('backgroundImage', e.target.value)} placeholder="https://... or drop image" className="flex-1 text-xs p-1 border-2 border-[#808080] border-t-black border-l-black font-mono" />
                    {selectedElement.style.backgroundImage && (
                      <button onClick={() => updateStyle('backgroundImage', '')} className="text-xs px-2 bg-red-200 border border-black">Clear</button>
                    )}
                  </div>
                  {selectedElement.style.backgroundImage && (
                    <div className="mt-2 border border-gray-300 p-1 inline-flex items-center gap-2">
                      <img src={selectedElement.style.backgroundImage} alt="bg-preview" className="w-12 h-8 object-cover border" />
                      <div className="text-[10px] text-gray-700">Preview</div>
                    </div>
                  )}
                  <div className="flex gap-1 mt-2">
                    <select value={selectedElement.style.backgroundImageStyle || 'cover'} onChange={(e) => updateStyle('backgroundImageStyle', e.target.value)} className="flex-1 text-[10px] p-1 border-2 border-[#808080] border-t-black border-l-black">
                      <option value="cover">Cover (Fill)</option>
                      <option value="contain">Contain (Fit)</option>
                      <option value="repeat">Repeat (Tile)</option>
                      <option value="center">Center (No Repeat)</option>
                      <option value="auto">Auto</option>
                    </select>
                    {selectedElement.style.backgroundImageStyle === 'repeat' && (
                      <input type="number" value={selectedElement.style.backgroundImageTileSize || 200} onChange={(e) => updateStyle('backgroundImageTileSize', parseInt(e.target.value) || 200)} className="w-24 text-[10px] p-1 border-2 border-[#808080]" />
                    )}
                  </div>
                </div>
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
                {selectedElement.type === 'custom-html' && (
                  <div>
                    <label className="text-[10px] block mb-1">Custom HTML Code</label>
                    <textarea
                      value={selectedElement.content || ''}
                      onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                      className="w-full text-xs p-2 border-2 border-[#808080] border-t-black border-l-black font-mono"
                      placeholder="<div>Your HTML here...</div>"
                      rows={8}
                      spellCheck={false}
                    />
                    <div className="text-[8px] text-gray-600 mt-1">Paste any HTML, CSS, or JavaScript. Be careful with scripts!</div>
                  </div>
                )}
                {selectedElement.type === 'counter' && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] block mb-1">Unique Code (Path)</label>
                      <input
                        type="text"
                        value={selectedElement.uniqueCode || ''}
                        onChange={(e) => updateElement(selectedElement.id, { uniqueCode: e.target.value })}
                        className="w-full text-xs p-1 border-2 border-[#808080] border-t-black border-l-black font-mono"
                        placeholder="visitor_123abc"
                      />
                      <div className="text-[8px] text-gray-600 mt-1">Unique identifier for tracking</div>
                    </div>
                    <div>
                      <label className="text-[10px] block mb-1">Badge Label</label>
                      <input
                        type="text"
                        value={selectedElement.badgeLabel}
                        onChange={(e) => updateElement(selectedElement.id, { badgeLabel: e.target.value })}
                        className="w-full text-xs p-1 border-2 border-[#808080] border-t-black border-l-black"
                        placeholder="Visitors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] block mb-1">Badge Color</label>
                      <div className="flex gap-1">
                        <input
                          type="color"
                          value={tempColor || (selectedElement.badgeColor || '%23263759').replace('%23', '#')}
                          onChange={(e) => setTempColor(e.target.value)}
                          className="flex-1 h-8 border-2 border-[#808080]"
                        />
                        <button
                          onClick={() => { updateElement(selectedElement.id, { badgeColor: (tempColor || (selectedElement.badgeColor || '%23263759').replace('%23', '#')).replace('#', '%23') }); setTempColor(null); }}
                          className="px-2 text-xs bg-blue-200 border border-black hover:bg-blue-300"
                        >
                          Set
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] block mb-1">Badge Style</label>
                      <select
                        value={selectedElement.badgeStyle || 'flat-square'}
                        onChange={(e) => updateElement(selectedElement.id, { badgeStyle: e.target.value })}
                        className="w-full text-xs p-1 border-2 border-[#808080] border-t-black border-l-black"
                      >
                        <option value="flat-square">Flat Square</option>
                        <option value="plastic">Plastic</option>
                        <option value="default">Default</option>
                        <option value="flat">Flat</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] block mb-1">Label Style</label>
                      <select
                        value={selectedElement.badgeLabelStyle || 'default'}
                        onChange={(e) => updateElement(selectedElement.id, { badgeLabelStyle: e.target.value })}
                        className="w-full text-xs p-1 border-2 border-[#808080] border-t-black border-l-black"
                      >
                        <option value="default">Default</option>
                        <option value="upper">Upper</option>
                        <option value="lower">Lower</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </div>
                )}
                {selectedElement.type === 'image' && (<div onDragOver={(e) => e.preventDefault()} onDrop={async (e) => { e.preventDefault(); const file = e.dataTransfer?.files?.[0]; if (file && file.type.startsWith('image/')) { const base64 = await fileToBase64(file); updateElement(selectedElement.id, { src: base64 }); } }}><label className="text-[10px] block">Image URL / Drop Image</label><input type="text" value={selectedElement.src || ''} onChange={(e) => updateElement(selectedElement.id, { src: e.target.value })} className="w-full text-xs p-1 border-2 border-[#808080] border-t-black border-l-black font-mono" placeholder="https://... or drop image" /></div>)}
                {selectedElement.type === 'image' && (
  <div className="space-y-2 mb-2 pb-2 border-b border-gray-400">
    <label className="text-xs font-bold flex items-center gap-1">
      Image Settings
    </label>
    
    <button 
      onClick={() => {
        // Load the image in memory to get its true native dimensions
        const img = new Image();
        img.onload = () => {
          updateElement(selectedElement.id, { 
            width: img.naturalWidth, 
            height: img.naturalHeight 
          });
        };
        img.src = selectedElement.src;
      }} 
      className="w-full flex items-center justify-center gap-1 px-2 py-1 bg-gray-200 border border-black text-[10px] hover:bg-gray-300"
    >
      <Maximize2 size={12} /> Snap to Native Resolution
    </button>

    <div className="flex items-center gap-2 mt-2">
      <input 
        type="checkbox" 
        id="lockAspectToggle" 
        checked={selectedElement.lockAspectRatio || false} 
        onChange={(e) => updateElement(selectedElement.id, { lockAspectRatio: e.target.checked })} 
      />
      <label htmlFor="lockAspectToggle" className="text-xs font-bold">Lock Aspect Ratio</label>
    </div>
  </div>
)}
                {/* Show Link URL for all element types so any tool can become clickable */}
                <div><label className="text-[10px] block">Link URL</label><input type="text" placeholder="https://..." value={selectedElement.href || ''} onChange={(e) => updateElement(selectedElement.id, { href: e.target.value })} className="w-full text-xs p-1 border-2 border-[#808080] border-t-black border-l-black font-mono text-blue-800" /></div>

                <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" id="fullWidthToggle" checked={selectedElement.fullWidth || false} onChange={(e) => updateElement(selectedElement.id, { fullWidth: e.target.checked })} />
                    <label htmlFor="fullWidthToggle" className="text-xs font-bold flex items-center gap-1"><Maximize2 size={10} /> Full Width?</label>
                </div>
            </div>
            {/* INTERACTION STATES */}
            <div className="space-y-2 mt-2 pt-2 border-t border-gray-400">
                <label className="text-xs font-bold flex items-center gap-1"><MousePointer size={12}/> Interactions</label>

                {/* ON HOVER */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold flex items-center gap-1"><MousePointer size={10}/> On Hover</label>
                        <input type="checkbox" checked={selectedElement.hoverEnabled || false} onChange={(e) => updateElement(selectedElement.id, { hoverEnabled: e.target.checked })} />
                    </div>
                    {selectedElement.hoverEnabled && (
                        <div className="space-y-2 p-2 border border-gray-400 bg-gray-100 rounded">
                            <div className="flex gap-2 items-center">
                                <label className="text-[8px] w-10">BG:</label>
                                <input type="color" value={(selectedElement.hoverStyle?.backgroundColor && selectedElement.hoverStyle.backgroundColor !== 'transparent') ? selectedElement.hoverStyle.backgroundColor : '#ffffff'} onChange={(e) => updateElement(selectedElement.id, { hoverStyle: { ...selectedElement.hoverStyle, backgroundColor: e.target.value } })} className="h-5 flex-1 border border-black p-0" />
                                <button onClick={() => updateElement(selectedElement.id, { hoverStyle: { ...selectedElement.hoverStyle, backgroundColor: undefined } })} className="text-[8px] px-1 bg-gray-300 border border-gray-500">Clear</button>
                            </div>
                            <div className="flex gap-2 items-center">
                                <label className="text-[8px] w-10">Text:</label>
                                <input type="color" value={selectedElement.hoverStyle?.color || '#000000'} onChange={(e) => updateElement(selectedElement.id, { hoverStyle: { ...selectedElement.hoverStyle, color: e.target.value } })} className="h-5 flex-1 border border-black p-0" />
                                <button onClick={() => updateElement(selectedElement.id, { hoverStyle: { ...selectedElement.hoverStyle, color: undefined } })} className="text-[8px] px-1 bg-gray-300 border border-gray-500">Clear</button>
                            </div>
                            <div className="flex gap-2 items-center">
                                <label className="text-[8px] w-10">Border:</label>
                                <input type="color" value={selectedElement.hoverStyle?.borderColor || '#000000'} onChange={(e) => updateElement(selectedElement.id, { hoverStyle: { ...selectedElement.hoverStyle, borderColor: e.target.value } })} className="h-5 flex-1 border border-black p-0" />
                                <button onClick={() => updateElement(selectedElement.id, { hoverStyle: { ...selectedElement.hoverStyle, borderColor: undefined } })} className="text-[8px] px-1 bg-gray-300 border border-gray-500">Clear</button>
                            </div>
                            <div>
                                <div className="flex justify-between text-[8px] mb-1"><span>Opacity: {selectedElement.hoverStyle?.opacity !== undefined ? Math.round(selectedElement.hoverStyle.opacity * 100) + '%' : 'inherit'}</span><button onClick={() => updateElement(selectedElement.id, { hoverStyle: { ...selectedElement.hoverStyle, opacity: undefined } })} className="underline text-[7px]">clear</button></div>
                                <input type="range" min="0" max="1" step="0.05" value={selectedElement.hoverStyle?.opacity !== undefined ? selectedElement.hoverStyle.opacity : (selectedElement.opacity === undefined ? 1 : selectedElement.opacity)} onChange={(e) => updateElement(selectedElement.id, { hoverStyle: { ...selectedElement.hoverStyle, opacity: parseFloat(e.target.value) } })} className="w-full h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer" />
                            </div>
                            <div>
                                <div className="flex justify-between text-[8px] mb-1"><span>Scale: {selectedElement.hoverStyle?.scale !== undefined ? selectedElement.hoverStyle.scale + 'x' : 'inherit'}</span><button onClick={() => updateElement(selectedElement.id, { hoverStyle: { ...selectedElement.hoverStyle, scale: undefined } })} className="underline text-[7px]">clear</button></div>
                                <input type="range" min="0.5" max="2" step="0.05" value={selectedElement.hoverStyle?.scale !== undefined ? selectedElement.hoverStyle.scale : 1} onChange={(e) => updateElement(selectedElement.id, { hoverStyle: { ...selectedElement.hoverStyle, scale: parseFloat(e.target.value) } })} className="w-full h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer" />
                            </div>
                            <div onDragOver={(e) => e.preventDefault()} onDrop={async (e) => { e.preventDefault(); const file = e.dataTransfer?.files?.[0]; if (file && file.type.startsWith('image/')) { const base64 = await fileToBase64(file); updateElement(selectedElement.id, { hoverStyle: { ...selectedElement.hoverStyle, backgroundImage: base64 } }); } }}>
                                <label className="text-[8px] block">BG Image / Drop</label>
                                <div className="flex items-center gap-1">
                                    <input type="text" value={selectedElement.hoverStyle?.backgroundImage || ''} onChange={(e) => updateElement(selectedElement.id, { hoverStyle: { ...selectedElement.hoverStyle, backgroundImage: e.target.value || undefined } })} placeholder="URL or drop" className="flex-1 text-[8px] p-1 border border-black font-mono" />
                                    {selectedElement.hoverStyle?.backgroundImage && <button onClick={() => updateElement(selectedElement.id, { hoverStyle: { ...selectedElement.hoverStyle, backgroundImage: undefined } })} className="text-[8px] px-1 bg-red-200 border border-black">X</button>}
                                </div>
                            </div>
                            {selectedElement.type === 'image' && (
                                <div onDragOver={(e) => e.preventDefault()} onDrop={async (e) => { e.preventDefault(); const file = e.dataTransfer?.files?.[0]; if (file && file.type.startsWith('image/')) { const base64 = await fileToBase64(file); updateElement(selectedElement.id, { hoverStyle: { ...selectedElement.hoverStyle, src: base64 } }); } }}>
                                    <label className="text-[8px] block">Image Src / Drop</label>
                                    <div className="flex items-center gap-1">
                                        <input type="text" value={selectedElement.hoverStyle?.src || ''} onChange={(e) => updateElement(selectedElement.id, { hoverStyle: { ...selectedElement.hoverStyle, src: e.target.value || undefined } })} placeholder="URL or drop" className="flex-1 text-[8px] p-1 border border-black font-mono" />
                                        {selectedElement.hoverStyle?.src && <button onClick={() => updateElement(selectedElement.id, { hoverStyle: { ...selectedElement.hoverStyle, src: undefined } })} className="text-[8px] px-1 bg-red-200 border border-black">X</button>}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ON CLICK */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold flex items-center gap-1"><MousePointerClick size={10}/> On Click</label>
                        <input type="checkbox" checked={selectedElement.clickEnabled || false} onChange={(e) => updateElement(selectedElement.id, { clickEnabled: e.target.checked })} />
                    </div>
                    {selectedElement.clickEnabled && (
                        <div className="space-y-2 p-2 border border-gray-400 bg-gray-100 rounded">
                            <div className="flex gap-2 items-center">
                                <label className="text-[8px] w-10">BG:</label>
                                <input type="color" value={(selectedElement.clickStyle?.backgroundColor && selectedElement.clickStyle.backgroundColor !== 'transparent') ? selectedElement.clickStyle.backgroundColor : '#ffffff'} onChange={(e) => updateElement(selectedElement.id, { clickStyle: { ...selectedElement.clickStyle, backgroundColor: e.target.value } })} className="h-5 flex-1 border border-black p-0" />
                                <button onClick={() => updateElement(selectedElement.id, { clickStyle: { ...selectedElement.clickStyle, backgroundColor: undefined } })} className="text-[8px] px-1 bg-gray-300 border border-gray-500">Clear</button>
                            </div>
                            <div className="flex gap-2 items-center">
                                <label className="text-[8px] w-10">Text:</label>
                                <input type="color" value={selectedElement.clickStyle?.color || '#000000'} onChange={(e) => updateElement(selectedElement.id, { clickStyle: { ...selectedElement.clickStyle, color: e.target.value } })} className="h-5 flex-1 border border-black p-0" />
                                <button onClick={() => updateElement(selectedElement.id, { clickStyle: { ...selectedElement.clickStyle, color: undefined } })} className="text-[8px] px-1 bg-gray-300 border border-gray-500">Clear</button>
                            </div>
                            <div className="flex gap-2 items-center">
                                <label className="text-[8px] w-10">Border:</label>
                                <input type="color" value={selectedElement.clickStyle?.borderColor || '#000000'} onChange={(e) => updateElement(selectedElement.id, { clickStyle: { ...selectedElement.clickStyle, borderColor: e.target.value } })} className="h-5 flex-1 border border-black p-0" />
                                <button onClick={() => updateElement(selectedElement.id, { clickStyle: { ...selectedElement.clickStyle, borderColor: undefined } })} className="text-[8px] px-1 bg-gray-300 border border-gray-500">Clear</button>
                            </div>
                            <div>
                                <div className="flex justify-between text-[8px] mb-1"><span>Opacity: {selectedElement.clickStyle?.opacity !== undefined ? Math.round(selectedElement.clickStyle.opacity * 100) + '%' : 'inherit'}</span><button onClick={() => updateElement(selectedElement.id, { clickStyle: { ...selectedElement.clickStyle, opacity: undefined } })} className="underline text-[7px]">clear</button></div>
                                <input type="range" min="0" max="1" step="0.05" value={selectedElement.clickStyle?.opacity !== undefined ? selectedElement.clickStyle.opacity : (selectedElement.opacity === undefined ? 1 : selectedElement.opacity)} onChange={(e) => updateElement(selectedElement.id, { clickStyle: { ...selectedElement.clickStyle, opacity: parseFloat(e.target.value) } })} className="w-full h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer" />
                            </div>
                            <div>
                                <div className="flex justify-between text-[8px] mb-1"><span>Scale: {selectedElement.clickStyle?.scale !== undefined ? selectedElement.clickStyle.scale + 'x' : 'inherit'}</span><button onClick={() => updateElement(selectedElement.id, { clickStyle: { ...selectedElement.clickStyle, scale: undefined } })} className="underline text-[7px]">clear</button></div>
                                <input type="range" min="0.5" max="2" step="0.05" value={selectedElement.clickStyle?.scale !== undefined ? selectedElement.clickStyle.scale : 1} onChange={(e) => updateElement(selectedElement.id, { clickStyle: { ...selectedElement.clickStyle, scale: parseFloat(e.target.value) } })} className="w-full h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer" />
                            </div>
                            <div onDragOver={(e) => e.preventDefault()} onDrop={async (e) => { e.preventDefault(); const file = e.dataTransfer?.files?.[0]; if (file && file.type.startsWith('image/')) { const base64 = await fileToBase64(file); updateElement(selectedElement.id, { clickStyle: { ...selectedElement.clickStyle, backgroundImage: base64 } }); } }}>
                                <label className="text-[8px] block">BG Image / Drop</label>
                                <div className="flex items-center gap-1">
                                    <input type="text" value={selectedElement.clickStyle?.backgroundImage || ''} onChange={(e) => updateElement(selectedElement.id, { clickStyle: { ...selectedElement.clickStyle, backgroundImage: e.target.value || undefined } })} placeholder="URL or drop" className="flex-1 text-[8px] p-1 border border-black font-mono" />
                                    {selectedElement.clickStyle?.backgroundImage && <button onClick={() => updateElement(selectedElement.id, { clickStyle: { ...selectedElement.clickStyle, backgroundImage: undefined } })} className="text-[8px] px-1 bg-red-200 border border-black">X</button>}
                                </div>
                            </div>
                            {selectedElement.type === 'image' && (
                                <div onDragOver={(e) => e.preventDefault()} onDrop={async (e) => { e.preventDefault(); const file = e.dataTransfer?.files?.[0]; if (file && file.type.startsWith('image/')) { const base64 = await fileToBase64(file); updateElement(selectedElement.id, { clickStyle: { ...selectedElement.clickStyle, src: base64 } }); } }}>
                                    <label className="text-[8px] block">Image Src / Drop</label>
                                    <div className="flex items-center gap-1">
                                        <input type="text" value={selectedElement.clickStyle?.src || ''} onChange={(e) => updateElement(selectedElement.id, { clickStyle: { ...selectedElement.clickStyle, src: e.target.value || undefined } })} placeholder="URL or drop" className="flex-1 text-[8px] p-1 border border-black font-mono" />
                                        {selectedElement.clickStyle?.src && <button onClick={() => updateElement(selectedElement.id, { clickStyle: { ...selectedElement.clickStyle, src: undefined } })} className="text-[8px] px-1 bg-red-200 border border-black">X</button>}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* TRANSITION DURATION (shared) */}
                {(selectedElement.hoverEnabled || selectedElement.clickEnabled) && (
                    <div>
                        <div className="flex justify-between text-[8px] mb-1"><span>Transition: {selectedElement.transitionDuration}s</span></div>
                        <input type="range" min="0" max="2" step="0.05" value={selectedElement.transitionDuration} onChange={(e) => updateElement(selectedElement.id, { transitionDuration: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer" />
                    </div>
                )}
            </div>
            </>
        )}

        <div className="space-y-1 mt-2"><label className="text-xs font-bold">Layer</label><div className="flex gap-2"><button onClick={() => updateElement(selectedElement.id, { zIndex: selectedElement.zIndex - 1 })} className="px-2 bg-gray-300 border border-gray-500 text-xs">-</button><span className="text-xs self-center">{selectedElement.zIndex}</span><button onClick={() => updateElement(selectedElement.id, { zIndex: selectedElement.zIndex + 1 })} className="px-2 bg-gray-300 border border-gray-500 text-xs">+</button></div></div>
        <div className="pt-4 mt-4 border-t border-gray-400"><button onClick={deleteElement} className="w-full flex items-center justify-center gap-2 px-2 py-1 bg-red-100 border border-red-500 text-red-600 text-xs font-bold hover:bg-red-200"><Trash2 size={12} /> Delete Element</button></div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
