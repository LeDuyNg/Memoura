import React, { useState } from 'react';
import '../assets/Dashboard.css';

function Dashboard() {
  const [viewMode, setViewMode] = useState('list'); 

  // THGIS IS JUST SAMPLE STUFF REMOVE IT LATER LOLOOLOL
  const suggestedFolders = [
    {
      id: 1,
      name: "test folder 1",
      location: "",
      type: "folder"
    },
    {
      id: 2,
      name: "test folder 2",
      location: "",
      type: "folder"
    }
  ];

  const suggestedFiles = [
    {
      id: 1,
      name: "test file 1",
      reason: "random name edited • 6:31 PM",
      owner: "random name",
      location: "",
      type: "txt"
    },
    {
      id: 2,
      name: "test file 2",
      reason: "You've opened frequently",
      owner: "me",
      location: "",
      type: "pdf"
    },
    {
      id: 3,
      name: "test file 3",
      reason: "You edited • Oct 11, 2025",
      owner: "me",
      location: "",
      type: "doc"
    },
    {
      id: 4,
      name: "test file 4",
      reason: "random name edited • Oct 22, 2025",
      owner: "random name",
      location: "",
      type: "txt"
    },
    {
      id: 5,
      name: "test file 5",
      reason: "You opened • Oct 11, 2025",
      owner: "me",
      location: "",
      type: "pdf"
    },
    {
      id: 6,
      name: "test file 6",
      reason: "You opened • Oct 11, 2025",
      owner: "me",
      location: "",
      type: "doc"
    },
    {
      id: 7,
      name: "test file 7",
      reason: "You opened • Oct 11, 2025",
      owner: "random name",
      location: "",
      type: "txt"
    },
    {
      id: 8,
      name: "test file 8",
      reason: "random name edited • Oct 3, 2025",
      owner: "random name",
      location: "",
      type: "pdf"
    },
    {
      id: 9,
      name: "test file 9",
      reason: "random name edited • Oct 3, 2025",
      owner: "random name",
      location: "",
      type: "doc"
    },
    {
      id: 10,
      name: "test file 10",
      reason: "You opened • Oct 21, 2025",
      owner: "random name",
      location: "",
      type: "txt"
    }
  ];

  const getFileIcon = (type) => {
    switch (type) {
      case 'txt':
        return 'TXT';
      case 'pdf':
        return 'PDF';
      case 'doc':
        return 'DOC';
      case 'folder':
        return 'FOLDER';
      default:
        return 'TXT';
    }
  };

  const getOwnerIcon = (owner) => {
    if (owner === 'me') return 'ME';
    if (owner === 'random name') return 'USER';
    return 'USER';
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome to Memoura</h1>
      </div>

      <div className="dashboard-content">
        {/* All Folders */}
        <div className="suggested-section">
          <h2>All folders</h2>
          <div className="folders-grid">
            {suggestedFolders.map(folder => (
              <div key={folder.id} className="folder-item">
                <div className="folder-icon">
                  {getFileIcon(folder.type)}
                </div>
                <div className="folder-info">
                  <div className="folder-name">{folder.name}</div>
                  <div className="folder-location">{folder.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="suggested-section">
          <div className="files-header">
            <h2>All files</h2>
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

          <div className="files-table">
            <div className="table-header">
              <div className="col-name">Name</div>
              <div className="col-type">Type</div>
              <div className="col-actions"></div>
            </div>
            
            <div className="table-body">
              {suggestedFiles.map(file => (
                <div key={file.id} className="file-row">
                  <div className="col-name">
                    <span className="file-name">{file.name}</span>
                  </div>
                  <div className="col-type">
                    <span className="file-type">{getFileIcon(file.type)}</span>
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
