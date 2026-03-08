import React, { useState, useRef, useEffect } from 'react';
import {
  MousePointer2, Type, Image as ImageIcon, Box, Music, Minus, Globe, Hash, BookOpen,
  BoxSelect, Table, Move, Monitor, Save, RotateCcw, Eye, Download, Undo2, Redo2,
  ClipboardPaste, X, Plus, FolderOpen, Pencil, Trash2, Code, Upload, FileArchive, FileJson
} from 'lucide-react';

const LeftSidebar = ({
  undo, redo, historyIndex, historyLength,
  addElement, pasteElement, clipboard,
  bgImage, bgImageStyle, setBgImageStyle, bgImageTileSize, setBgImageTileSize, handleBgDrop, clearBgImage,
  bgMusic, bgMusicName, bgMusicMode, setBgMusicMode, handleAudioDrop, clearBgMusic,
  keepAudioBase64, setKeepAudioBase64, 
  keepImagesBase64, setKeepImagesBase64, // <-- NEW
  cursor, handleCursorDrop, clearCursor,
  pageTitle, setPageTitle,
  htmlFilename, setHtmlFilename, // <-- NEW
  pageColor, setPageColor,
  pageHeight, setPageHeight,
  pagePadding, setPagePadding,
  pageMargin, setPageMargin,
  saveProject, clearProject,
  handleSample, handleExport, handleExportEntireSite, // <-- NEW
  handleExportJSON, handleImportJSON,
  handleExportAll, handleImportAll,
  projects, currentProjectId, createNewProject, switchProject, renameProject, deleteProject,
}) => {
  const fileInputRef = useRef(null);
  const backupInputRef = useRef(null);
  const [showProjectList, setShowProjectList] = useState(false);
  const [renamingProjectId, setRenamingProjectId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const dropdownRef = useRef(null);

  const currentProject = projects[currentProjectId];
  const projectList = Object.values(projects).sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProjectList(false);
        setRenamingProjectId(null);
      }
    };

    if (showProjectList) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProjectList]);

  const handleRenameStart = (project) => {
    setRenamingProjectId(project.id);
    setRenameValue(project.name);
  };

  const handleRenameSubmit = (projectId) => {
    if (renameValue.trim()) {
      renameProject(projectId, renameValue.trim());
    }
    setRenamingProjectId(null);
    setRenameValue('');
  };

  const handleRenameCancel = () => {
    setRenamingProjectId(null);
    setRenameValue('');
  };

  return (
    <div className="w-64 flex flex-col border-r-2 border-white border-r-[#808080] shadow-[inset_-2px_-2px_#ffffff,inset_2px_2px_#dfdfdf] h-screen">
      <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white p-1 px-2 font-bold text-sm flex items-center gap-2">
        <Monitor size={14} /> WebBuilder 2000
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {/* Project Manager */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-gray-600 mb-1 border-b border-gray-400 pb-1 flex items-center justify-between">
            <span>PROJECTS</span>
            <button onClick={createNewProject} className="text-blue-600 hover:text-blue-800" title="Create new project">
              <Plus size={14} />
            </button>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProjectList(!showProjectList)}
              className="w-full flex items-center justify-between gap-2 px-2 py-1.5 bg-white border-2 border-gray-400 text-sm hover:bg-gray-50"
            >
              <div className="flex items-center gap-2 truncate">
                <FolderOpen size={14} />
                <span className="truncate">{currentProject?.name || 'Select Project'}</span>
              </div>
              <span className="text-xs">{projectList.length}</span>
            </button>
            {showProjectList && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-400 shadow-lg z-50 max-h-64 overflow-y-auto">
                {projectList.map(project => (
                  <div key={project.id} className={`flex items-center gap-1 px-2 py-1.5 hover:bg-blue-50 ${project.id === currentProjectId ? 'bg-blue-100' : ''}`}>
                    {renamingProjectId === project.id ? (
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSubmit(project.id);
                          if (e.key === 'Escape') handleRenameCancel();
                        }}
                        onBlur={() => handleRenameSubmit(project.id)}
                        className="flex-1 text-xs p-0.5 border border-gray-400"
                        autoFocus
                      />
                    ) : (
                      <>
                        <button onClick={() => { switchProject(project.id); setShowProjectList(false); }} className="flex-1 text-left text-xs truncate min-w-0">
                          {project.name}
                        </button>
                        <button onClick={() => handleRenameStart(project)} className="p-0.5 hover:bg-blue-200 rounded shrink-0 w-6 h-6 flex items-center justify-center" title="Rename project">
                          <Pencil size={12} />
                        </button>
                        {projectList.length > 1 ? (
                          <button onClick={() => { deleteProject(project.id); setShowProjectList(false); }} className="p-0.5 hover:bg-red-200 rounded text-red-600 shrink-0 w-6 h-6 flex items-center justify-center" title="Delete project">
                            <Trash2 size={12} />
                          </button>
                        ) : (
                          <div className="w-6 h-6 shrink-0"></div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-1 mb-2">
          <button onClick={undo} disabled={historyIndex === 0} className={`flex-1 flex items-center justify-center gap-1 p-1 bg-[#c0c0c0] border-2 border-white border-b-black border-r-black text-xs ${historyIndex === 0 ? 'opacity-30' : 'hover:bg-[#d0d0d0] active:border-t-black active:border-l-black active:border-b-white active:border-r-white'}`} title="Undo (Ctrl+Z)"><Undo2 size={12}/> Undo</button>
          <button onClick={redo} disabled={historyIndex === historyLength - 1} className={`flex-1 flex items-center justify-center gap-1 p-1 bg-[#c0c0c0] border-2 border-white border-b-black border-r-black text-xs ${historyIndex === historyLength - 1 ? 'opacity-30' : 'hover:bg-[#d0d0d0] active:border-t-black active:border-l-black active:border-b-white active:border-r-white'}`} title="Redo (Ctrl+Y)"><Redo2 size={12}/> Redo</button>
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
          <button onClick={() => addElement('custom-html')} className="w-full flex items-center gap-2 px-2 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black text-sm hover:bg-[#d0d0d0]"><Code size={14} /> Custom HTML</button>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold text-gray-600 mb-1 border-b border-gray-400 pb-1">ASSETS</div>
          <div className="relative">
            <div onDragOver={e => e.preventDefault()} onDrop={handleBgDrop} className="group relative border-2 border-dashed border-gray-500 bg-[#e0e0e0] p-2 text-center text-xs text-gray-600 hover:bg-white cursor-pointer">
              {bgImage ? (<img src={bgImage} alt="bg" className="w-full h-12 object-cover border border-gray-400 mb-1" />) : (<div className="flex flex-col items-center py-2"><ImageIcon size={16} className="mb-1 opacity-50" /><span>Drop Background</span></div>)}
            </div>
            {bgImage && (
              <button onClick={clearBgImage} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5" title="Clear background image"><X size={12} /></button>
            )}
          </div>
          {bgImage && (
            <div className="bg-[#f0f0f0] border border-gray-400 p-2 text-[10px] space-y-2">
              <div>
                <label className="font-bold block mb-1">BG Style:</label>
                <select value={bgImageStyle} onChange={(e) => setBgImageStyle(e.target.value)} className="w-full text-[10px] p-1 border border-gray-600">
                  <option value="cover">Cover (Fill)</option>
                  <option value="contain">Contain (Fit)</option>
                  <option value="repeat">Repeat (Small Tile)</option>
                  <option value="tile">Tile (Custom)</option>
                  <option value="center">Center (No Repeat)</option>
                </select>
              </div>
              {bgImageStyle === 'tile' && (
                <div>
                  <label className="font-bold block mb-1">Tile Size (px):</label>
                  <input type="number" value={bgImageTileSize} onChange={(e) => setBgImageTileSize(parseInt(e.target.value) || 200)} className="w-full text-[10px] p-1 border border-gray-600" min="10" max="1000" />
                </div>
              )}
            </div>
          )}

          {/* AUDIO DROP ZONE */}
          <div className="relative">
            <div onDragOver={e => e.preventDefault()} onDrop={handleAudioDrop} className="group relative border-2 border-dashed border-gray-500 bg-[#e0e0e0] p-2 text-center text-xs text-gray-600 hover:bg-white cursor-pointer">
              <div className="flex flex-col items-center py-2"><Music size={16} className={`mb-1 ${bgMusic ? 'text-blue-600 animate-pulse' : 'opacity-50'}`} /><span>{bgMusicName || 'Drop MP3 Audio'}</span></div>
            </div>
            {bgMusic && (
              <button onClick={clearBgMusic} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5" title="Clear background music"><X size={12} /></button>
            )}
          </div>
          {bgMusic && (
            <div className="bg-[#f0f0f0] border border-gray-400 p-2 text-[10px] mt-1">
              <label className="font-bold block mb-1">Audio Mode:</label>
              <div className="flex gap-1 mb-1">
                <button onClick={() => setBgMusicMode('webaudio')} className={`flex-1 px-1 py-1 border border-black text-[9px] ${bgMusicMode === 'webaudio' ? 'bg-blue-200 font-bold' : 'bg-white'}`} title="Seamless looping using Web Audio API">Seamless</button>
                <button onClick={() => setBgMusicMode('audio-tag')} className={`flex-1 px-1 py-1 border border-black text-[9px] ${bgMusicMode === 'audio-tag' ? 'bg-blue-200 font-bold' : 'bg-white'}`} title="Standard HTML5 audio tag with controls">&lt;audio&gt;</button>
              </div>
              
              <div className="mt-2 pt-2 border-t border-gray-400 flex items-start gap-1">
                <input 
                  type="checkbox" 
                  id="keepBase64" 
                  checked={keepAudioBase64} 
                  onChange={(e) => setKeepAudioBase64(e.target.checked)}
                  className="mt-0.5 cursor-pointer"
                />
                <label htmlFor="keepBase64" className="text-[9px] text-gray-700 leading-tight cursor-pointer" title="Embeds the audio directly into the HTML to bypass Neocities free-tier file restrictions.">
                  Embed Base64 <br/><span className="text-[8px] text-gray-500">(Neocities Mode)</span>
                </label>
              </div>
            </div>
          )}

          <div className="relative">
            <div onDragOver={e => e.preventDefault()} onDrop={handleCursorDrop} className="group relative border-2 border-dashed border-gray-500 bg-[#e0e0e0] p-2 text-center text-xs text-gray-600 hover:bg-white cursor-pointer">
              {cursor ? (<div className="flex items-center justify-center h-8"><img src={cursor} alt="cursor" className="w-6 h-6 object-contain" /></div>) : (<div className="flex flex-col items-center py-2"><MousePointer2 size={16} className="mb-1 opacity-50" /><span>Drop Cursor</span></div>)}
            </div>
            {cursor && (
              <button onClick={clearCursor} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5" title="Clear custom cursor"><X size={12} /></button>
            )}
          </div>
        </div>

        {/* --- PAGE SETTINGS UPDATE --- */}
        <div className="pt-4 mt-4 border-t border-gray-400">
           <div className="text-xs font-bold text-gray-600 mb-1">PAGE SETTINGS</div>
           <div className="space-y-1">
              
              {/* NEW: Filename Input */}
              <div className="flex items-center gap-1">
                  <label className="text-[10px] w-14">Filename:</label>
                  <div className="flex-1 flex items-center bg-white border-2 border-[#808080] border-t-black border-l-black">
                     <input 
                       type="text" 
                       value={htmlFilename} 
                       onChange={(e) => setHtmlFilename(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))} 
                       className="w-full text-xs p-1 outline-none" 
                       placeholder="index" 
                     />
                     <span className="text-[10px] text-gray-500 pr-1">.html</span>
                  </div>
              </div>

              <div className="flex items-center gap-1 mt-1 mb-2">
                 <label className="text-[10px] w-14">Title:</label>
                 <input type="text" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} className="flex-1 text-xs p-1 border-2 border-[#808080] border-t-black border-l-black" placeholder="Page Title" />
              </div>
              
              <div className="flex items-center gap-1"><label className="text-[10px] w-14">Color:</label><input type="color" value={pageColor} onChange={(e) => setPageColor(e.target.value)} className="flex-1 h-6 border-2 border-[#808080]" /></div>
              <div className="flex items-center gap-1"><label className="text-[10px] w-14">Height:</label><input type="number" value={pageHeight} onChange={(e) => setPageHeight(parseInt(e.target.value) || 800)} className="flex-1 text-xs p-1 border-2 border-[#808080] border-t-black border-l-black" /></div>
              <div className="flex items-center gap-1"><label className="text-[10px] w-14">Padding:</label><input type="number" value={pagePadding} onChange={(e) => setPagePadding(parseInt(e.target.value) || 0)} className="flex-1 text-xs p-1 border-2 border-[#808080] border-t-black border-l-black" /></div>
              <div className="flex items-center gap-1"><label className="text-[10px] w-14">Margin:</label><input type="number" value={pageMargin} onChange={(e) => setPageMargin(parseInt(e.target.value) || 0)} className="flex-1 text-xs p-1 border-2 border-[#808080] border-t-black border-l-black" /></div>

              {/* NEW: Image Base64 Checkbox */}
              <div className="mt-2 pt-2 border-t border-gray-300">
                <div className="flex items-start gap-1">
                  <input 
                    type="checkbox" 
                    id="keepImgBase64" 
                    checked={keepImagesBase64} 
                    onChange={(e) => setKeepImagesBase64(e.target.checked)} 
                    className="mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="keepImgBase64" className="text-[9px] text-gray-700 leading-tight cursor-pointer">
                    Embed all images as Base64 <br/><span className="text-[8px] text-gray-500">(1 big HTML file, no image folder)</span>
                  </label>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* --- NEW ORGANIZED EXPORT SECTION --- */}
      <div className="p-2 border-t border-white border-t-[#808080] bg-[#d4d0c8] space-y-3 overflow-y-auto max-h-[40vh]">
         
         {/* Live Preview / Save State */}
         <div className="grid grid-cols-2 gap-1 mb-2">
            <button onClick={handleSample} className="flex items-center justify-center gap-1 px-1 py-1.5 bg-[#c0c0c0] border-2 border-white border-b-black border-r-black font-bold text-[10px] hover:bg-[#d0d0d0] active:border-t-black active:border-l-black active:border-b-white active:border-r-white"><Eye size={12} /> Preview</button>
            <button onClick={saveProject} className="flex items-center justify-center gap-1 px-1 py-1.5 bg-green-200 border-2 border-white border-b-black border-r-black font-bold text-[10px] hover:bg-green-300 active:border-t-black active:border-l-black active:border-b-white active:border-r-white"><Save size={12} /> Save Edits</button>
         </div>

         {/* WEB EXPORTS */}
         <div className="border border-gray-500 p-1.5 bg-[#e8e8e8]">
            <div className="text-[10px] font-bold text-black mb-1 flex items-center gap-1"><Globe size={12}/> Publish to Web</div>
            
            <button onClick={handleExport} className="w-full mb-1 flex flex-col items-center justify-center px-2 py-1.5 bg-white border border-gray-400 hover:bg-blue-50 text-left">
               <div className="font-bold text-[11px] text-blue-800 flex items-center gap-1 w-full"><Download size={10}/> Export Current Page</div>
               <div className="text-[8px] text-gray-600 w-full leading-tight">Downloads just this page & its media.</div>
            </button>

            <button onClick={handleExportEntireSite} className="w-full flex flex-col items-center justify-center px-2 py-1.5 bg-white border border-gray-400 hover:bg-purple-50 text-left">
               <div className="font-bold text-[11px] text-purple-800 flex items-center gap-1 w-full"><FileArchive size={10}/> Export Entire Site (ZIP)</div>
               <div className="text-[8px] text-gray-600 w-full leading-tight">Zips all projects together for Neocities.</div>
            </button>
         </div>

         {/* BUILDER SAVE/LOAD FILES */}
         <div className="border border-gray-500 p-1.5 bg-[#e8e8e8]">
            <div className="text-[10px] font-bold text-black mb-1 flex items-center gap-1"><FileJson size={12}/> Builder Files (JSON)</div>
            
            <div className="grid grid-cols-2 gap-1 mb-1">
               <button onClick={handleExportJSON} className="flex items-center justify-center gap-1 px-2 py-1 bg-white border border-gray-400 text-[10px] hover:bg-gray-100" title="Save this project's raw data">Save Page</button>
               <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-1 px-2 py-1 bg-white border border-gray-400 text-[10px] hover:bg-gray-100" title="Load a raw project file">Load Page</button>
            </div>
            
            <div className="grid grid-cols-2 gap-1">
               <button onClick={handleExportAll} className="flex items-center justify-center gap-1 px-2 py-1 bg-white border border-gray-400 text-[10px] hover:bg-gray-100" title="Backup all projects">Backup All</button>
               <button onClick={() => backupInputRef.current?.click()} className="flex items-center justify-center gap-1 px-2 py-1 bg-white border border-gray-400 text-[10px] hover:bg-gray-100" title="Restore all projects">Restore All</button>
            </div>
         </div>
         
         <input ref={fileInputRef} type="file" accept=".json" onChange={(e) => { handleImportJSON(e.target.files[0]); e.target.value = ''; }} className="hidden" />
         <input ref={backupInputRef} type="file" accept=".json" onChange={(e) => { handleImportAll(e.target.files[0]); e.target.value = ''; }} className="hidden" />
      </div>
    </div>
  );
};

export default LeftSidebar;