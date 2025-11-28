import React, { useState, Fragment } from 'react';
import '../assets/Dashboard.css';

function Dashboard({ vaultData, isLoading, error, onFileClick, onAddNote, onDeleteFile, onCreateFolder, onDeleteFolder, onCreateNote }) {
  const [viewMode, setViewMode] = useState('list');
  const [expandedFolder, setExpandedFolder] = useState(null);

  const getFileIcon = (type) => {
    const ext = type.startsWith('.') ? type.substring(1).toUpperCase() : type.toUpperCase();
    switch (ext) {
      case 'MD': return 'MD';
      case 'TXT': return 'TXT';
      case 'PDF': return 'PDF';
      case 'DOC': case 'DOCX': return 'DOC';
      case 'FOLDER': return 'FOLDER';
      default: return ext; 
    }
  };

  const handleFolderClick = (folderFilepath) => {
    if (expandedFolder === folderFilepath) {
      setExpandedFolder(null);
    } else {
      setExpandedFolder(folderFilepath);
    }
  };

  const getFilesForFolder = (folderFilepath) => {
    return vaultData.files.filter(file => {
      const lastSlashIndex = Math.max(file.filepath.lastIndexOf('/'), file.filepath.lastIndexOf('\\'));      
      const parentDir = lastSlashIndex === -1 ? "" : file.filepath.substring(0, lastSlashIndex);
      return parentDir === folderFilepath;
    });
  };

  // --- MODIFIED: Filter out 'Flashcards' folder ---
  const allFoldersWithRoot = vaultData.folders.filter(folder => folder.name !== 'Flashcards');

  // --- NEW: Filter out files that are inside the Flashcards folder for the main list ---
  const visibleFiles = vaultData.files.filter(file => !file.filepath.includes('Flashcards/'));

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header"><h1>Welcome to Memoura</h1></div>
        <div className="dashboard-content"><p>Scanning vault...</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header"><h1>Welcome to Memoura</h1></div>
        <div className="dashboard-content"><p className="error-message">Error: {error}</p></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome to Memoura</h1>
      </div>

      <div className="dashboard-content">

        <div className="suggested-section">
          {/* --- HEADER WITH CREATE FOLDER BUTTON --- */}
          <div className="section-header-row">
            <h2>All folders ({allFoldersWithRoot.length})</h2>
            <button 
              className="create-folder-btn"
              onClick={onCreateFolder}
              title="Create New Folder"
            >
              <span className="plus-icon">+</span> 📁 New Folder
            </button>
          </div>
          
          <div className="folders-list"> 
            {allFoldersWithRoot.map(folder => (
              <Fragment key={folder.filepath}>
                <div 
                  className="folder-item" 
                  onClick={() => handleFolderClick(folder.filepath)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="folder-icon" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <span style={{ marginRight: '10px' }}>
                      {expandedFolder === folder.filepath ? '▼' : '►'}
                    </span>
                    <span style={{ marginRight: '8px' }}>📁</span>
                    {/* Display actual folder name */}
                    <span style={{ fontWeight: '600', flex: 1 }}>{folder.name}</span>
                    
                    {/* --- DELETE FOLDER BUTTON --- */}
                    <button 
                      className="delete-icon-btn"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        onDeleteFolder && onDeleteFolder(folder);
                      }}
                      title="Delete Folder"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {expandedFolder === folder.filepath && (
                  <div className="expanded-files-container">
                    
                    {/* --- CREATE FILE BUTTON INSIDE FOLDER --- */}
                    <div className="folder-actions-row">
                      <button 
                        className="create-file-small-btn"
                        onClick={() => onCreateNote && onCreateNote(folder.filepath)}
                      >
                        + New File
                      </button>
                    </div>

                    {getFilesForFolder(folder.filepath).map(file => (
                      <div 
                        key={file.filepath} 
                        className="file-item-indent"
                        onClick={() => onFileClick && onFileClick(file)}
                        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', paddingRight: '10px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="file-icon">{getFileIcon(file.filetype)}</span>
                          <span>{file.name}</span>
                        </div>
                        
                        <button 
                          className="delete-folder-btn"
                          onClick={(e) => {
                            e.stopPropagation(); 
                            onDeleteFile && onDeleteFile(file);
                          }}
                          title="Delete File"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>

        {/* <div className="suggested-section">
          <div className="files-header">
            <h2>All files ({visibleFiles.length})</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="filter-btn folder-btn"
                onClick={() => onCreateNote && onCreateNote("")} // Create in root
              >
                + Add Note
              </button>
              <div className="view-controls">
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  ☰
                </button>
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  ⊞
                </button>
              </div>
            </div>
          </div>

          <div className="files-table">
            <div className="table-header">
              <div className="col-name">Name</div>
              <div className="col-type">Type</div>
              <div className="col-actions"></div>
            </div>
            
            <div className="table-body">
              {visibleFiles.map(file => (
                <div 
                  key={file.filepath} 
                  className="file-row"
                  onClick={() => onFileClick && onFileClick(file)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="col-name">
                    <span className="file-name">{file.name}</span>
                  </div>
                  <div className="col-type">
                    <span className="file-type">{getFileIcon(file.filetype)}</span>
                  </div>
                  <div className="col-actions">
                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile && onDeleteFile(file);
                      }}
                      title="Delete File"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default Dashboard;