import React, { useState } from 'react';
import '../assets/AIView.css';

function AIView({ vaultData }) {
  // States: 'selection', 'input-flashcards', 'input-summarize'
  const [viewState, setViewState] = useState('selection'); 
  const [inputText, setInputText] = useState('');
  
  // Status tracking: 'idle', 'loading', 'success', 'error'
  const [status, setStatus] = useState('idle'); 
  const [resultMsg, setResultMsg] = useState('');

  // Modal State
  const [showFileModal, setShowFileModal] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [selectedFilePath, setSelectedFilePath] = useState(null);

  // Track which action triggered the modal ('summarize' or 'flashcards')
  const [modalTargetAction, setModalTargetAction] = useState(null);

  // --- Handler for Flashcards ---
  const handleGenerateFlashcards = async () => {
    if (!inputText.trim()) return;

    setStatus('loading');
    setResultMsg('');

    try {
      const vaultPath = await window.api.getVaultPath();
      // Pass selectedFilePath to the backend
      const result = await window.api.generateFlashcards(inputText, vaultPath, selectedFilePath);

      if (result.error) {
        setStatus('error');
        setResultMsg(result.error);
      } else {
        setStatus('success');
        setResultMsg(`Success! Generated ${result.count} flashcards.\nSaved to: ${result.filePath}`);
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setResultMsg("Failed to communicate with AI handler.");
    }
  };

  // --- Handler for Summary ---
  const handleSummarize = async () => {
    if (!inputText.trim()) return;
    if (!selectedFilePath) {
      alert("Please select a file first so we know where to save the summary, or use the Flashcard feature for raw text.");
      return;
    }

    setStatus('loading');
    setResultMsg('');

    try {
      const result = await window.api.summarizeText(inputText, selectedFilePath);

      if (result.error) {
        setStatus('error');
        setResultMsg(result.error);
      } else {
        setStatus('success');
        setResultMsg(`Success! Summary created.\nSaved to: ${result.filePath}`);
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setResultMsg("Failed to communicate with AI handler.");
    }
  };

  const openFileModal = (action) => {
    setModalTargetAction(action);
    setShowFileModal(true);
  };

  const handleFileSelect = async (file) => {
    try {
      const vaultPath = await window.api.getVaultPath();
      const fullPath = await window.api.joinPath(vaultPath, file.filepath);
      const result = await window.api.readFile(fullPath);

      if (result.success) {
        setInputText(result.content);
        setSelectedFilePath(fullPath);
        
        if (modalTargetAction === 'summarize') {
          setViewState('input-summarize');
        } else if (modalTargetAction === 'flashcards') {
          setViewState('input-flashcards');
        }

        setShowFileModal(false);
      } else {
        alert("Could not read file: " + result.error);
      }
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderPath]: !prev[folderPath]
    }));
  };

  const getFilesForFolder = (folderPath) => {
    if (!vaultData || !vaultData.files) return [];
    return vaultData.files.filter(file => {
      const lastSlashIndex = Math.max(file.filepath.lastIndexOf('/'), file.filepath.lastIndexOf('\\'));
      const parentDir = lastSlashIndex === -1 ? "" : file.filepath.substring(0, lastSlashIndex);
      return parentDir === folderPath && (file.filetype === '.md' || file.filetype === '.txt');
    });
  };

  const resetView = () => {
    setViewState('selection');
    setStatus('idle');
    setInputText('');
    setResultMsg('');
    setSelectedFilePath(null);
    setModalTargetAction(null);
  };

  // --- RENDER: SELECTION MENU ---
  if (viewState === 'selection') {
    return (
      <div className="ai-container">
        <div className="button-wrapper">
          <button 
            className="ai-card-btn"
            onClick={() => openFileModal('summarize')}
          >
            <div className="icon">📝</div>
            <h2>Summarize Text</h2>
          </button>

          <button 
            className="ai-card-btn"
            onClick={() => openFileModal('flashcards')}
          >
            <div className="icon">🗂️</div>
            <h2>Generate Flashcards</h2>
          </button>
        </div>

        {/* --- MODAL --- */}
        {showFileModal && (
          <div className="modal-overlay" onClick={() => setShowFileModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Select a file to {modalTargetAction === 'summarize' ? 'summarize' : 'create flashcards'}</h2>
                <button className="close-btn" onClick={() => setShowFileModal(false)}>&times;</button>
              </div>
              
              <div className="file-list">
                {/* --- MODIFIED: Removed 'Vault Root' section completely --- */}

                {/* Actual Folders (Filtered) */}
                {vaultData && vaultData.folders
                  .filter(folder => folder.name !== 'Flashcards') // Filter out Flashcards folder
                  .map(folder => (
                    <div key={folder.filepath} className="folder-group">
                      <div className="folder-select-item" onClick={() => toggleFolder(folder.filepath)}>
                        <div className="folder-info-group">
                          <span className="folder-icon">{expandedFolders[folder.filepath] ? '📂' : '📁'}</span>
                          <span className="folder-name">{folder.name}</span>
                        </div>
                        <span className="folder-arrow">{expandedFolders[folder.filepath] ? '▼' : '▶'}</span>
                      </div>
                      
                      {expandedFolders[folder.filepath] && (
                        <div className="folder-files">
                          {getFilesForFolder(folder.filepath).length > 0 ? getFilesForFolder(folder.filepath).map(file => (
                            <div key={file.filepath} className="file-nested-item" onClick={() => handleFileSelect(file)}>
                              <span className="file-icon">📄</span>
                              <span className="file-name">{file.name}</span>
                            </div>
                          )) : <div className="no-files-in-folder">No text files</div>}
                        </div>
                      )}
                    </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER: INPUT SCREEN ---
  return (
    <div className="ai-container" style={{ display: 'block' }}>
      <div className="ai-header">
        <button className="back-btn" onClick={resetView}>
          ← Back
        </button>
        <h1>
          {viewState === 'input-summarize' ? 'Summarize Text' : 'Generate Flashcards'}
        </h1>
        <div style={{width: '60px'}}></div>
      </div>

      <div className="ai-content">
        <div className="input-section">
          <label>
            {viewState === 'input-summarize' ? 'Content to summarize:' : 'Content for flashcards:'}
          </label>
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Selected file content will appear here..."
            disabled={status === 'loading'}
          />
          
          <button 
            className="generate-btn" 
            onClick={viewState === 'input-flashcards' ? handleGenerateFlashcards : handleSummarize}
            disabled={status === 'loading' || !inputText.trim()}
          >
            {status === 'loading' ? 'Processing with Ollama...' : 'Generate'}
          </button>

          {status !== 'idle' && (
            <div className={`status-container`}>
              {status === 'loading' && <p style={{color: '#007aff'}}>🤖 AI is thinking...</p>}
              {status === 'error' && <p style={{color: '#ff3b30'}}>❌ Error: {resultMsg}</p>}
              {status === 'success' && (
                <div style={{color: '#34c759', whiteSpace: 'pre-wrap', marginTop: '10px'}}>
                  <p>✅ {resultMsg}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIView;