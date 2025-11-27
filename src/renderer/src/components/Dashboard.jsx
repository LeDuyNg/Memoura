import React, { useState } from 'react';
import '../assets/Dashboard.css';

// Group the folder and its files
import { Fragment } from 'react'; 

function Dashboard({ vaultData, isLoading, error, onFileClick, onAddNote }) {
  const [viewMode, setViewMode] = useState('list');
  
  // Add state to track the *filepath* of the expanded folder
  const [expandedFolder, setExpandedFolder] = useState(null);

  const getFileIcon = (type) => {
    const ext = type.startsWith('.') ? type.substring(1).toUpperCase() : type.toUpperCase();
    switch (ext) {
      case 'MD':
        return 'MD';
      case 'TXT':
        return 'TXT';
      case 'PDF':
        return 'PDF';
      case 'DOC':
      case 'DOCX':
        return 'DOC';
      case 'FOLDER':
        return 'FOLDER';
      default:
        return ext; 
    }
  };

  // Click handler to set or clear the expanded folder
  const handleFolderClick = (folderFilepath) => {
    // If we click the folder that's already open, close it (set to null)
    if (expandedFolder === folderFilepath) {
      setExpandedFolder(null);
    } else {
      // Otherwise, open the clicked folder
      setExpandedFolder(folderFilepath);
    }
  };

  // Helper function to get files for a specific folder path
  const getFilesForFolder = (folderFilepath) => {
    return vaultData.files.filter(file => {
      // Get the parent directory of the file
      const lastSlashIndex = Math.max(file.filepath.lastIndexOf('/'), file.filepath.lastIndexOf('\\'));      
      // If no '/', the parent is the root ("")
      const parentDir = lastSlashIndex === -1 ? "" : file.filepath.substring(0, lastSlashIndex);
      
      // Check if the file's parent directory matches the folder's path
      return parentDir === folderFilepath;
    });
  };

  // Create a new list of folders
  const allFoldersWithRoot = [
    ...vaultData.folders // All the subfolders from the scanner
  ];

  // (Loading and Error handling - keep this)
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
          <h2>All folders ({allFoldersWithRoot.length})</h2>
          
          <div className="folders-list"> 
            
            {allFoldersWithRoot.map(folder => (
              <Fragment key={folder.filepath}>
                
                <div 
                  className="folder-item" 
                  onClick={() => handleFolderClick(folder.filepath)}
                  style={{ cursor: 'pointer' }} // Show it's clickable
                >
                  <div className="folder-icon">
                    {/* Show an icon if it's open or closed */}
                    {expandedFolder === folder.filepath ? '▼' : '►'}
                    {' '}
                    {getFileIcon('folder')}
                  </div>
                  <div className="folder-info">
                    <div className="folder-name">{folder.name}</div>
                    <div className="folder-location">{folder.filepath || './'}</div>
                  </div>
                </div>

                {expandedFolder === folder.filepath && (
                  <div className="expanded-files-container">
                    
                    {/* Get and render the files for *this* folder */}
                    {getFilesForFolder(folder.filepath).map(file => (
                      <div 
                        key={file.filepath} 
                        className="file-item-indent"
                        onClick={() => onFileClick && onFileClick(file)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="file-icon">{getFileIcon(file.filetype)}</span>
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
        <div className="suggested-section">
          <div className="files-header">
            <h2>All files ({vaultData.files.length})</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="filter-btn folder-btn"
                onClick={() => onAddNote && onAddNote()}
                aria-label="Add Note"
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
              {vaultData.files.map(file => (
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
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;