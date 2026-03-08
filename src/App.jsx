import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { STORAGE_KEY } from './utils/constants';
import { fileToBase64, resizeForCursor } from './utils/fileHelpers';
import { generateExportCode } from './utils/exportGenerator';
import { exportWebsiteAsZip } from './utils/exportToZip';
import { exportEntireSiteAsZip } from './utils/exportEntireSiteAsZip'; // <-- NEW IMPORT
import LeftSidebar from './components/LeftSidebar';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import localforage from 'localforage';

const PROJECTS_STORAGE_KEY = 'y2k-builder-projects';
const CURRENT_PROJECT_KEY = 'y2k-builder-current-project';

export default function App() {
  // Project management
  const [projects, setProjects] = useState({});
  const [currentProjectId, setCurrentProjectId] = useState(null);

  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [clipboard, setClipboard] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const [bgImageStyle, setBgImageStyle] = useState('cover'); // 'cover', 'contain', 'repeat', 'tile', 'center'
  const [bgImageTileSize, setBgImageTileSize] = useState(200);
  const [bgMusic, setBgMusic] = useState(null);
  const [bgMusicName, setBgMusicName] = useState('');
  const [bgMusicMode, setBgMusicMode] = useState('webaudio'); // 'webaudio' or 'audio-tag'
  const [cursor, setCursor] = useState(null);
  const [pageTitle, setPageTitle] = useState('My Y2K Website');
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [pageHeight, setPageHeight] = useState(800);
  const [pagePadding, setPagePadding] = useState(0);
  const [pageMargin, setPageMargin] = useState(0);
  const [pageColor, setPageColor] = useState('#ffffffff');
  
  // Export Settings State
  const [keepAudioBase64, setKeepAudioBase64] = useState(true); 
  const [htmlFilename, setHtmlFilename] = useState('index'); // <-- ADDED
  const [keepImagesBase64, setKeepImagesBase64] = useState(false); // <-- ADDED

  const rootElements = useMemo(() => elements.filter(el => !el.parentId), [elements]);
  const selectedElement = elements.find(el => el.id === selectedId);

  // Get current project data
  const getCurrentProjectData = () => ({
    elements,
    pageTitle,
    htmlFilename, // <-- ADDED
    keepImagesBase64, // <-- ADDED
    pageHeight,
    pagePadding,
    pageMargin,
    pageColor,
    bgImage,
    bgImageStyle,
    bgImageTileSize,
    bgMusic,
    bgMusicName,
    bgMusicMode,
    cursor
  });

  // Load a project's data into state
  const loadProjectData = (data) => {
    setElements(data.elements || []);
    setHistory([data.elements || []]);
    setHistoryIndex(0);
    setPageTitle(data.pageTitle || 'My Y2K Website');
    setHtmlFilename(data.htmlFilename || 'index'); // <-- ADDED
    setKeepImagesBase64(data.keepImagesBase64 || false); // <-- ADDED
    setPageHeight(data.pageHeight || 800);
    setPagePadding(data.pagePadding || 0);
    setPageMargin(data.pageMargin || 0);
    setPageColor(data.pageColor || '#c0c0c0');
    setBgImage(data.bgImage);
    setBgImageStyle(data.bgImageStyle || 'cover');
    setBgImageTileSize(data.bgImageTileSize || 200);
    setBgMusic(data.bgMusic);
    setBgMusicName(data.bgMusicName || '');
    setBgMusicMode(data.bgMusicMode || 'webaudio');
    setCursor(data.cursor);
  };

  // Initialize projects from localForage (with localStorage migration)
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        let loadedProjects = {};
        let loadedCurrentId = null;

        const savedProjects = await localforage.getItem(PROJECTS_STORAGE_KEY);
        const savedCurrentId = await localforage.getItem(CURRENT_PROJECT_KEY);

        if (savedProjects) {
          loadedProjects = savedProjects;
          loadedCurrentId = savedCurrentId;
        } else {
          // Fallback: Migrate from old localStorage to localForage
          const legacyProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
          const oldSave = localStorage.getItem(STORAGE_KEY);

          if (legacyProjects) {
            loadedProjects = JSON.parse(legacyProjects);
            loadedCurrentId = localStorage.getItem(CURRENT_PROJECT_KEY);
            await localforage.setItem(PROJECTS_STORAGE_KEY, loadedProjects);
            await localforage.setItem(CURRENT_PROJECT_KEY, loadedCurrentId);
            localStorage.removeItem(PROJECTS_STORAGE_KEY);
            localStorage.removeItem(CURRENT_PROJECT_KEY);
          } else if (oldSave) {
            const oldData = JSON.parse(oldSave);
            const projectId = `project_${Date.now()}`;
            loadedProjects = {
              [projectId]: {
                id: projectId, name: oldData.pageTitle || 'My Y2K Website', data: oldData, lastModified: Date.now()
              }
            };
            loadedCurrentId = projectId;
            await localforage.setItem(PROJECTS_STORAGE_KEY, loadedProjects);
            await localforage.setItem(CURRENT_PROJECT_KEY, loadedCurrentId);
            localStorage.removeItem(STORAGE_KEY);
          }
        }

        if (Object.keys(loadedProjects).length === 0) {
          const projectId = `project_${Date.now()}`;
          loadedProjects = {
            [projectId]: {
              id: projectId, name: 'My Y2K Website', data: getCurrentProjectData(), lastModified: Date.now()
            }
          };
          loadedCurrentId = projectId;
          await localforage.setItem(PROJECTS_STORAGE_KEY, loadedProjects);
          await localforage.setItem(CURRENT_PROJECT_KEY, loadedCurrentId);
        }

        setProjects(loadedProjects);
        setCurrentProjectId(loadedCurrentId);
        if (loadedCurrentId && loadedProjects[loadedCurrentId]) {
          loadProjectData(loadedProjects[loadedCurrentId].data);
        }
      } catch (e) {
        console.error("Failed to load projects", e);
        const projectId = `project_${Date.now()}`;
        setProjects({
          [projectId]: { id: projectId, name: 'Error Recovery', data: getCurrentProjectData(), lastModified: Date.now() }
        });
        setCurrentProjectId(projectId);
      }
    };

    initializeStorage();
  }, []);

  const saveProject = useCallback(() => {
    if (!currentProjectId) return;

    const projectData = {
      elements,
      pageTitle,
      htmlFilename, // <-- ADDED
      keepImagesBase64, // <-- ADDED
      pageHeight,
      pagePadding,
      pageMargin,
      pageColor,
      bgImage,
      bgImageStyle,
      bgImageTileSize,
      bgMusic,
      bgMusicName,
      bgMusicMode,
      cursor
    };

    setProjects(prevProjects => {
      const updatedProjects = {
        ...prevProjects,
        [currentProjectId]: {
          ...prevProjects[currentProjectId],
          data: projectData,
          lastModified: Date.now()
        }
      };

      localforage.setItem(PROJECTS_STORAGE_KEY, updatedProjects);
      localforage.setItem(CURRENT_PROJECT_KEY, currentProjectId);

      return updatedProjects;
    });
  }, [currentProjectId, elements, pageTitle, htmlFilename, keepImagesBase64, pageHeight, pagePadding, pageMargin, pageColor, bgImage, bgImageStyle, bgImageTileSize, bgMusic, bgMusicName, bgMusicMode, cursor]);

  useEffect(() => {
    if (!currentProjectId) return;
    const timeoutId = setTimeout(() => { saveProject(); }, 1000);
    return () => clearTimeout(timeoutId);
  }, [currentProjectId, saveProject]);

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

  const createNewProject = () => {
    if (currentProjectId) saveProject();

    const projectId = `project_${Date.now()}`;
    const newProject = {
      id: projectId,
      name: 'New Website',
      data: {
        elements: [],
        pageTitle: 'New Website',
        htmlFilename: 'index', // <-- ADDED
        keepImagesBase64: false, // <-- ADDED
        pageHeight: 800,
        pagePadding: 0,
        pageMargin: 0,
        pageColor: '#ffffffff',
        bgImage: null,
        bgImageStyle: 'cover',
        bgImageTileSize: 200,
        bgMusic: null,
        bgMusicName: '',
        bgMusicMode: 'webaudio',
        cursor: null
      },
      lastModified: Date.now()
    };

    const updatedProjects = { ...projects, [projectId]: newProject };
    setProjects(updatedProjects);
    setCurrentProjectId(projectId);
    loadProjectData(newProject.data);

    localforage.setItem(PROJECTS_STORAGE_KEY, updatedProjects);
    localforage.setItem(CURRENT_PROJECT_KEY, projectId);
  };

  const switchProject = (projectId) => {
    if (projectId === currentProjectId) return;
    if (currentProjectId) saveProject();
    setCurrentProjectId(projectId);
    if (projects[projectId]) {
      loadProjectData(projects[projectId].data);
      localforage.setItem(CURRENT_PROJECT_KEY, projectId);
    }
  };

  const renameProject = (projectId, newName) => {
    const updatedProjects = {
      ...projects,
      [projectId]: {
        ...projects[projectId],
        name: newName,
        lastModified: Date.now()
      }
    };
    setProjects(updatedProjects);
    localforage.setItem(PROJECTS_STORAGE_KEY, updatedProjects);
  };

  const deleteProject = (projectId) => {
    if (Object.keys(projects).length === 1) {
      alert("You cannot delete the last project.");
      return;
    }
    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;

    const updatedProjects = { ...projects };
    delete updatedProjects[projectId];

    setProjects(updatedProjects);
    localforage.setItem(PROJECTS_STORAGE_KEY, updatedProjects);

    if (projectId === currentProjectId) {
      const nextProjectId = Object.keys(updatedProjects)[0];
      setCurrentProjectId(nextProjectId);
      loadProjectData(updatedProjects[nextProjectId].data);
      localforage.setItem(CURRENT_PROJECT_KEY, nextProjectId);
    }
  };

  const clearProject = () => {
    if(confirm("Are you sure? This will clear all elements and settings from the current project. This cannot be undone.")) {
        setElements([]);
        setHistory([[]]);
        setHistoryIndex(0);
        setBgImage(null);
        setBgImageStyle('cover');
        setBgImageTileSize(200);
        setBgMusic(null);
        setBgMusicName('');
        setBgMusicMode('webaudio');
        setCursor(null);
        setPageTitle('My Y2K Website');
        setHtmlFilename('index'); // <-- ADDED
        setKeepImagesBase64(false); // <-- ADDED
        setPageHeight(800);
        setPagePadding(0);
        setPageMargin(0);
        setPageColor('#ffffffff');
    }
  };

  const clearBgImage = () => setBgImage(null);
  const clearBgMusic = () => { setBgMusic(null); setBgMusicName(''); };
  const clearCursor = () => setCursor(null);

  const handleSample = () => {
    const code = generateExportCode(elements, bgImage, bgImageStyle, bgImageTileSize, bgMusic, bgMusicMode, cursor, pageTitle, pageHeight, pagePadding, pageMargin, pageColor);
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleExport = () => {
    htmlFilename, // <-- ADDED
    exportWebsiteAsZip(elements, bgImage, bgImageStyle, bgImageTileSize, bgMusic, bgMusicMode, cursor, pageTitle, pageHeight, pagePadding, pageMargin, pageColor, keepAudioBase64, htmlFilename, keepImagesBase64);
  };

  // 👇 ADDED THIS NEW FUNCTION FOR ENTIRE SITE EXPORT 👇
  const handleExportEntireSite = () => {
    const hasIndexFile = Object.values(projects).some(project => {
        const name = (project.data?.htmlFilename || project.name).toLowerCase();
        return name === 'index' || name === 'index.html';
    });

    if (!hasIndexFile) {
        const proceed = window.confirm(
            "⚠️ WARNING: Missing Homepage!\n\nNone of your projects have the filename 'index'. Neocities requires an 'index.html' file to act as your main homepage.\n\nDo you want to download anyway?"
        );
        if (!proceed) return;
    }

    exportEntireSiteAsZip(projects, keepAudioBase64);
  };

  const handleExportJSON = () => {
    const data = getCurrentProjectData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pageTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
  };

  const handleImportJSON = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      loadProjectData(data);
    } catch (e) {
      alert('Failed to import: Invalid JSON file');
    }
  };

  const handleExportAll = () => {
    const allData = { projects: projects, currentProjectId: currentProjectId };
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'y2k-builder-backup.json';
    a.click();
  };

  const handleImportAll = async (file) => {
    if (!file) return;
    if (!confirm('This will replace all your projects. Continue?')) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setProjects(data.projects);
      setCurrentProjectId(data.currentProjectId);
      loadProjectData(data.projects[data.currentProjectId].data);
      localforage.setItem(PROJECTS_STORAGE_KEY, data.projects);
      localforage.setItem(CURRENT_PROJECT_KEY, data.currentProjectId);
    } catch (e) {
      alert('Failed to import: Invalid backup file');
    }
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
    if (type === 'counter') {
      width = 150; height = 40;
      const uniqueCode = `visitor_${Math.random().toString(36).substring(2, 15)}`;
      customProps = { ...customProps, uniqueCode, badgeLabel: 'Visitors', badgeColor: '%23263759', badgeStyle: 'flat-square', badgeLabelStyle: 'default' };
    }
    if (type === 'guestbook') { width = 250; height = 200; content = 'My Guestbook'; baseStyle.borderTopWidth = 2; baseStyle.borderRightWidth = 2; baseStyle.borderBottomWidth = 2; baseStyle.borderLeftWidth = 2; baseStyle.borderStyle = 'dashed'; }
    if (type === 'image') { width = 150; height = 150; }
    if (type === 'custom-html') { width = 300; height = 100; content = '<div>Paste your HTML here...</div>'; baseStyle.borderTopWidth = 1; baseStyle.borderRightWidth = 1; baseStyle.borderBottomWidth = 1; baseStyle.borderLeftWidth = 1; baseStyle.borderStyle = 'dashed'; baseStyle.borderColor = '#999999'; }

    const newElement = {
      id: newId, type, x: 50 + (elements.length * 20), y: 50 + (elements.length * 20),
      width, height, zIndex: elements.length + 1, content, href: '', isBlinking: false, fullWidth: false, fullHeight: false, flexGrow: false,
      tagName: 'div', parentId: null, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 5, rows: 2, cols: 2,
      rotation: 0, skewX: 0, skewY: 0, opacity: 1, blinkSpeed: 1,
      src: type === 'image' ? null : null, style: baseStyle, ...customProps
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

      <LeftSidebar
        keepAudioBase64={keepAudioBase64}
        setKeepAudioBase64={setKeepAudioBase64}
        htmlFilename={htmlFilename} // <-- ADDED
        setHtmlFilename={setHtmlFilename} // <-- ADDED
        keepImagesBase64={keepImagesBase64} // <-- ADDED
        setKeepImagesBase64={setKeepImagesBase64} // <-- ADDED
        undo={undo}
        redo={redo}
        historyIndex={historyIndex}
        historyLength={history.length}
        addElement={addElement}
        pasteElement={pasteElement}
        clipboard={clipboard}
        bgImage={bgImage}
        bgImageStyle={bgImageStyle}
        setBgImageStyle={setBgImageStyle}
        bgImageTileSize={bgImageTileSize}
        setBgImageTileSize={setBgImageTileSize}
        handleBgDrop={handleBgDrop}
        clearBgImage={clearBgImage}
        bgMusic={bgMusic}
        bgMusicName={bgMusicName}
        bgMusicMode={bgMusicMode}
        setBgMusicMode={setBgMusicMode}
        handleAudioDrop={handleAudioDrop}
        clearBgMusic={clearBgMusic}
        cursor={cursor}
        handleCursorDrop={handleCursorDrop}
        clearCursor={clearCursor}
        pageTitle={pageTitle}
        setPageTitle={setPageTitle}
        pageColor={pageColor}
        setPageColor={setPageColor}
        pageHeight={pageHeight}
        setPageHeight={setPageHeight}
        pagePadding={pagePadding}
        setPagePadding={setPagePadding}
        pageMargin={pageMargin}
        setPageMargin={setPageMargin}
        saveProject={saveProject}
        clearProject={clearProject}
        handleSample={handleSample}
        handleExport={handleExport}
        handleExportEntireSite={handleExportEntireSite} // <-- ADDED
        handleExportJSON={handleExportJSON}
        handleImportJSON={handleImportJSON}
        handleExportAll={handleExportAll}
        handleImportAll={handleImportAll}
        projects={projects}
        currentProjectId={currentProjectId}
        createNewProject={createNewProject}
        switchProject={switchProject}
        renameProject={renameProject}
        deleteProject={deleteProject}
      />

      <Canvas
        elements={elements}
        rootElements={rootElements}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        updateElement={updateElement}
        snapToGrid={snapToGrid}
        setSnapToGrid={setSnapToGrid}
        handleDragEnd={handleDragEnd}
        handleCanvasDrop={handleCanvasDrop}
        pageColor={pageColor}
        bgImage={bgImage}
        bgImageStyle={bgImageStyle}
        bgImageTileSize={bgImageTileSize}
        cursor={cursor}
        pageHeight={pageHeight}
        pagePadding={pagePadding}
        pageMargin={pageMargin}
      />

      <PropertiesPanel
        selectedElement={selectedElement}
        updateElement={updateElement}
        updateStyle={updateStyle}
        copyElement={copyElement}
        deleteElement={deleteElement}
        handleUnparent={handleUnparent}
        handleAlign={handleAlign}
        setSelectedId={setSelectedId}
      />
    </div>
  );
}