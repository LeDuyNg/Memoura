import React, { useState, useEffect } from 'react';
import { marked } from 'marked'; 
import Notepad from "./components/Notepad";
import Sidebar from "./components/Sidebar"; 
import Calendar from './components/Calendar';
import Dashboard from './components/Dashboard';
import AIView from './components/AIView';
import FlashcardView from './components/FlashcardView'; 
import PomodoroView from './components/PomodoroView'; 

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [vaultData, setVaultData] = useState({ files: [], folders: [] });
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null);

  // --- DELETE MODAL STATE ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // --- CREATE FOLDER MODAL STATE ---
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // --- CREATE FILE MODAL STATE ---
  const [showCreateFileModal, setShowCreateFileModal] = useState(false);
  const [createFileTargetFolder, setCreateFileTargetFolder] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState(".txt"); 

  // --- RENAME MODAL STATE ---
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [itemToRename, setItemToRename] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // --- NEW: SUCCESS MODAL STATE ---
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // --- POMODORO STATE ---
  const [pomoMode, setPomoMode] = useState('focus'); 
  const [pomoTimeLeft, setPomoTimeLeft] = useState(25 * 60);
  const [pomoIsActive, setPomoIsActive] = useState(false);
  const [pomoTask, setPomoTask] = useState('');

  // --- POMODORO LOGIC ---
  useEffect(() => {
    let interval = null;
    if (pomoIsActive && pomoTimeLeft > 0) {
      interval = setInterval(() => {
        setPomoTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (pomoTimeLeft === 0) {
      setPomoIsActive(false);
      clearInterval(interval);
      if (Notification.permission === 'granted') {
        new Notification("Timer Finished", { 
          body: pomoMode === 'focus' ? "Time for a break!" : "Back to work!" 
        });
      }
    }
    return () => clearInterval(interval);
  }, [pomoIsActive, pomoTimeLeft, pomoMode]);

  const handlePomoSwitchMode = (newMode) => {
    setPomoMode(newMode);
    setPomoIsActive(false);
    switch (newMode) {
      case 'focus': setPomoTimeLeft(25 * 60); break;
      case 'short': setPomoTimeLeft(5 * 60); break;
      case 'long': setPomoTimeLeft(15 * 60); break;
      default: setPomoTimeLeft(25 * 60);
    }
  };

  const handlePomoToggle = () => setPomoIsActive(!pomoIsActive);
  const handlePomoReset = () => {
    setPomoIsActive(false);
    switch (pomoMode) {
      case 'focus': setPomoTimeLeft(25 * 60); break;
      case 'short': setPomoTimeLeft(5 * 60); break;
      case 'long': setPomoTimeLeft(15 * 60); break;
      default: break;
    }
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setActiveView('notepad');
  };
  const [canvasCourses, setCanvasCourses] = useState([]);

  // --- Loaders ---
  const loadVaultFiles = async () => {
    if (!window.api?.getVaultPath || !window.api?.scanVault) {
      throw new Error("File scanning API is not available.");
    }
    const vaultPath = await window.api.getVaultPath();
    const data = await window.api.scanVault(vaultPath);
    return data;
  };

  const loadCanvasData = async () => {
    if (!window.api?.fetchCanvasData) {
      throw new Error("Canvas API is not available.");
    }
    const courses = await window.api.fetchCanvasData('/api/v1/courses'); 
    if (courses.error) throw new Error(courses.error);
    return courses;
  };

  // --- Handlers: File Operations ---
  const handleCreateFolder = () => { setNewFolderName(""); setShowCreateFolderModal(true); };
  
  const confirmCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const vaultPath = await window.api.getVaultPath();
      const fullPath = await window.api.joinPath(vaultPath, newFolderName);
      const result = await window.api.createFolder(fullPath);
      if (result.success) {
        await loadVaultFiles().then(data => setVaultData(data));
        setShowCreateFolderModal(false);
      } else {
        alert("Failed to create folder: " + result.error);
      }
    } catch (err) { console.error(err); }
  };

  const handleCreateNotePrompt = (folderPath) => {
    setCreateFileTargetFolder(folderPath);
    setNewFileName("");
    setNewFileType(".txt"); 
    setShowCreateFileModal(true);
  };

  const confirmCreateFile = async () => {
    if (!newFileName.trim()) return;
    try {
      const vaultPath = await window.api.getVaultPath();
      const fileNameWithExt = `${newFileName}${newFileType}`;
      const fullPath = await window.api.joinPath(vaultPath, createFileTargetFolder, fileNameWithExt);
      const result = await window.api.writeFile(fullPath, "");
      if (result.success) {
        await loadVaultFiles().then(data => setVaultData(data));
        setShowCreateFileModal(false);
      } else {
        alert("Failed to create file: " + result.error);
      }
    } catch (err) { console.error(err); alert("Error creating file."); }
  };

  const handleRenameRequest = (item, type) => {
    setItemToRename({ type, data: item });
    setRenameValue(item.name);
    setShowRenameModal(true);
  };

  const confirmRename = async () => {
    if (!renameValue.trim() || !itemToRename) return;
    try {
      const vaultPath = await window.api.getVaultPath();
      const oldFullPath = await window.api.joinPath(vaultPath, itemToRename.data.filepath);
      const parts = itemToRename.data.filepath.split(/[/\\]/);
      parts.pop(); 
      const parentDir = parts.join('/'); 
      const newRelativePath = parentDir ? `${parentDir}/${renameValue}` : renameValue;
      const newFullPath = await window.api.joinPath(vaultPath, newRelativePath);
      const result = await window.api.renameItem(oldFullPath, newFullPath);
      if (result.success) {
        await loadVaultFiles().then(data => setVaultData(data));
        setShowRenameModal(false);
        setItemToRename(null);
      } else {
        alert("Failed to rename: " + result.error);
      }
    } catch (err) { console.error(err); alert("Error renaming item."); }
  };

  const handleDeleteFile = (file) => {
    setItemToDelete({ type: 'file', data: file });
    setShowDeleteModal(true);
  };

  const handleDeleteFolder = (folder) => {
    setItemToDelete({ type: 'folder', data: folder });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const vaultPath = await window.api.getVaultPath();
      const fullPath = await window.api.joinPath(vaultPath, itemToDelete.data.filepath);
      let result;
      if (itemToDelete.type === 'file') {
        result = await window.api.deleteFile(fullPath);
      } else {
        result = await window.api.deleteFolder(fullPath);
      }
      if (result.success) {
        await loadVaultFiles().then(data => setVaultData(data));
        setShowDeleteModal(false);
        setItemToDelete(null);
      } else {
        alert(`Failed to delete ${itemToDelete.type}: ` + result.error);
      }
    } catch (err) { console.error(err); alert("Error deleting item."); }
  };

  const cancelDelete = () => { setShowDeleteModal(false); setItemToDelete(null); };

  // --- EXPORT TO PDF HANDLER ---
  const handleExportFile = async (file) => {
    try {
      const vaultPath = await window.api.getVaultPath();
      const fullPath = await window.api.joinPath(vaultPath, file.filepath);
      const result = await window.api.readFile(fullPath);

      if (!result.success) {
        alert("Failed to read file for export.");
        return;
      }

      const content = result.content;
      let htmlContent = '';

      if (file.name.endsWith('.md')) {
        // Convert Markdown to HTML
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; padding: 40px; color: #000; }
              h1, h2, h3 { border-bottom: 1px solid #eee; padding-bottom: 0.3em; margin-top: 24px; }
              code { background: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
              pre { background: #f0f0f0; padding: 15px; border-radius: 5px; overflow-x: auto; }
              blockquote { border-left: 4px solid #ccc; margin: 0; padding-left: 16px; color: #666; }
              img { max-width: 100%; }
            </style>
          </head>
          <body>
            ${marked(content)}
          </body>
          </html>
        `;
      } else {
        // Plain Text
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: monospace; white-space: pre-wrap; padding: 40px; color: #000; }
            </style>
          </head>
          <body>
            ${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
          </body>
          </html>
        `;
      }

      const pdfName = file.name.replace(/\.(md|txt)$/, '.pdf');
      const exportResult = await window.api.exportToPdf(htmlContent, pdfName);

      if (exportResult.success) {
        // --- MODIFIED: Trigger Custom Success Modal ---
        setSuccessMessage("PDF Exported Successfully!");
        setShowSuccessModal(true);
      } else if (!exportResult.canceled) {
        alert("Failed to export PDF: " + exportResult.error);
      }

    } catch (err) {
      console.error("Export Error:", err);
      alert("An error occurred during export.");
    }
  };


  // --- Effects ---
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      setError(null);
      const results = await Promise.allSettled([loadVaultFiles(), loadCanvasData()]);
      if (results[0].status === 'fulfilled') setVaultData(results[0].value);
      else { console.error(results[0].reason); setError('Failed to load vault files.'); }
      if (results[1].status === 'fulfilled') setCanvasCourses(results[1].value);
      else { console.error(results[1].reason); setError('Failed to load Canvas courses.'); }
      setIsLoading(false);
    };
    loadAllData();
  }, []); 

  useEffect(() => {
    if (activeView === 'dashboard' || activeView === 'flashcards') {
      loadVaultFiles().then(data => setVaultData(data)).catch(err => console.error(err));
    }
  }, [activeView]);

  return (
    <div className="app">
      <Sidebar setActiveView={setActiveView} />

      <div className="main-content">
        {activeView === 'notepad' && <Notepad selectedFile={selectedFile} />}
        {activeView === 'calendar' && <Calendar courses={canvasCourses} />}
        {activeView === 'dashboard' && (
          <Dashboard 
            vaultData={vaultData}
            isLoading={isLoading} 
            error={error} 
            onFileClick={handleFileClick}
            onDeleteFile={handleDeleteFile}
            onCreateFolder={handleCreateFolder}
            onDeleteFolder={handleDeleteFolder}
            onCreateNote={handleCreateNotePrompt}
            onRenameItem={handleRenameRequest}
            onExportFile={handleExportFile}
          />
        )}
        {activeView === "ai" && <AIView vaultData={vaultData} />}
        {activeView === "flashcards" && <FlashcardView vaultData={vaultData} onDeleteFile={handleDeleteFile} />}
        {activeView === "pomodoro" && (
          <PomodoroView 
            mode={pomoMode} timeLeft={pomoTimeLeft} isActive={pomoIsActive}
            task={pomoTask} setTask={setPomoTask}
            onSwitchMode={handlePomoSwitchMode} onToggleTimer={handlePomoToggle} onResetTimer={handlePomoReset}
          />
        )}

        {/* Modals (Delete, Create Folder, Create File, Rename) */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={cancelDelete}>
            <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Delete {itemToDelete?.type === 'folder' ? 'Folder' : 'File'}</h2>
                <button className="close-btn" onClick={cancelDelete}>&times;</button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete <strong>"{itemToDelete?.data.name}"</strong>?</p>
                {itemToDelete?.type === 'folder' && <p className="warning-text">This will delete the folder AND all files inside it!</p>}
                <p className="warning-text">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={cancelDelete}>Cancel</button>
                <button className="btn-confirm-delete" onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {showCreateFolderModal && (
          <div className="modal-overlay" onClick={() => setShowCreateFolderModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"><h2>Create New Folder</h2><button className="close-btn" onClick={() => setShowCreateFolderModal(false)}>&times;</button></div>
              <div className="modal-body">
                <label style={{display: 'block', marginBottom: '8px', color: '#d1d1d6', fontSize: '14px'}}>Folder Name</label>
                <input type="text" className="modal-input" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="e.g., Project Beta" autoFocus onKeyDown={(e) => e.key === 'Enter' && confirmCreateFolder()} />
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowCreateFolderModal(false)}>Cancel</button>
                <button className="btn-confirm-create" onClick={confirmCreateFolder}>Create</button>
              </div>
            </div>
          </div>
        )}

        {showCreateFileModal && (
          <div className="modal-overlay" onClick={() => setShowCreateFileModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"><h2>Create New File</h2><button className="close-btn" onClick={() => setShowCreateFileModal(false)}>&times;</button></div>
              <div className="modal-body">
                <div style={{ marginBottom: '16px' }}>
                  <label style={{display: 'block', marginBottom: '8px', color: '#d1d1d6', fontSize: '14px'}}>File Name</label>
                  <input type="text" className="modal-input" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} placeholder="e.g., Meeting Notes" autoFocus onKeyDown={(e) => e.key === 'Enter' && confirmCreateFile()} />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '8px', color: '#d1d1d6', fontSize: '14px'}}>File Type</label>
                  <div className="radio-group">
                    <label className={`radio-label ${newFileType === '.txt' ? 'selected' : ''}`}><input type="radio" name="fileType" value=".txt" checked={newFileType === '.txt'} onChange={(e) => setNewFileType(e.target.value)} />Text (.txt)</label>
                    <label className={`radio-label ${newFileType === '.md' ? 'selected' : ''}`}><input type="radio" name="fileType" value=".md" checked={newFileType === '.md'} onChange={(e) => setNewFileType(e.target.value)} />Markdown (.md)</label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowCreateFileModal(false)}>Cancel</button>
                <button className="btn-confirm-create" onClick={confirmCreateFile}>Create</button>
              </div>
            </div>
          </div>
        )}

        {showRenameModal && (
          <div className="modal-overlay" onClick={() => setShowRenameModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"><h2>Rename {itemToRename?.type === 'folder' ? 'Folder' : 'File'}</h2><button className="close-btn" onClick={() => setShowRenameModal(false)}>&times;</button></div>
              <div className="modal-body">
                <label style={{display: 'block', marginBottom: '8px', color: '#d1d1d6', fontSize: '14px'}}>New Name</label>
                <input type="text" className="modal-input" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && confirmRename()} />
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowRenameModal(false)}>Cancel</button>
                <button className="btn-confirm-create" onClick={confirmRename}>Rename</button>
              </div>
            </div>
          </div>
        )}

        {/* --- NEW: Success Modal --- */}
        {showSuccessModal && (
          <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
            <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Success</h2>
                <button className="close-btn" onClick={() => setShowSuccessModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <p className="success-text">{successMessage}</p>
              </div>
              <div className="modal-footer">
                <button className="btn-confirm-success" onClick={() => setShowSuccessModal(false)}>OK</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;