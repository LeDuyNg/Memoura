// src/App.jsx

import React, { useState, useEffect } from 'react';
import Notepad from "./components/Notepad";
import Sidebar from "./components/Sidebar"; 
import Calendar from './components/Calendar';
import Dashboard from './components/Dashboard';
import AIView from './components/AIView';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [vaultData, setVaultData] = useState({ files: [], folders: [] });
  const [isLoading, setIsLoading] = useState(true); // Start as true
  const [error, setError] = useState(null);

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setActiveView('notepad');
  };
  
  const handleAddNote = async () => {
    try {
      if (!window.api || !window.api.getVaultPath || !window.api.writeFile || !window.api.joinPath) {
        console.error('File API not available');
        return;
      }

      const vaultPath = await window.api.getVaultPath();
      const filename = `new-note-${Date.now()}.md`;
      const relPath = filename; // store at vault root
      const fullPath = window.api.joinPath(vaultPath, relPath);
      const content = `# ${filename.replace('.md','')}
\nStart writing your note here...`;

      const writeResult = await window.api.writeFile(fullPath, content);
      if (writeResult && writeResult.success) {
        // Refresh vault listing
        try {
          const data = await loadVaultFiles();
          setVaultData(data);
          // Attempt to find the new file in the refreshed data
          const newFile = data.files.find(f => f.filepath === relPath || f.name === filename);
          if (newFile) {
            setSelectedFile(newFile);
            setActiveView('notepad');
          }
        } catch (err) {
          console.error('Error reloading vault after creating file:', err);
        }
      } else {
        console.error('Failed to create note', writeResult && writeResult.error);
      }
    } catch (error) {
      console.error('Error creating new note:', error);
    }
  };

  const handleRenameFile = async (oldRelPath, newBaseName) => {
    try {
      if (!window.api || !window.api.getVaultPath || !window.api.renameFile || !window.api.joinPath) {
        console.error('File API not available for rename');
        return { success: false, error: 'API missing' };
      }

      const lastSlash = Math.max(oldRelPath.lastIndexOf('/'), oldRelPath.lastIndexOf('\\'));
      const folder = lastSlash === -1 ? '' : oldRelPath.substring(0, lastSlash);
      const oldName = lastSlash === -1 ? oldRelPath : oldRelPath.substring(lastSlash + 1);
      const extIndex = oldName.lastIndexOf('.');
      const ext = extIndex === -1 ? '' : oldName.substring(extIndex);

      const newName = newBaseName.endsWith(ext) ? newBaseName : `${newBaseName}${ext}`;
      const newRelPath = folder ? `${folder}/${newName}` : newName;

      const vaultPath = await window.api.getVaultPath();
      const fullOld = window.api.joinPath(vaultPath, oldRelPath);
      const fullNew = window.api.joinPath(vaultPath, newRelPath);

      const result = await window.api.renameFile(fullOld, fullNew);
      if (result && result.success) {
        // reload vault and select new file
        try {
          const data = await loadVaultFiles();
          setVaultData(data);
          const newFile = data.files.find(f => f.filepath === newRelPath || f.name === newName);
          if (newFile) {
            setSelectedFile(newFile);
            setActiveView('notepad');
          }
        } catch (err) {
          console.error('Error reloading vault after rename:', err);
        }
        return { success: true };
      } else {
        console.error('Rename failed', result && result.error);
        return { success: false, error: result && result.error };
      }
    } catch (error) {
      console.error('Error during rename:', error);
      return { success: false, error: error.message };
    }
  };
  const [canvasCourses, setCanvasCourses] = useState([]);

  useEffect(() => {
    // Run both tasks in parallel
    const loadAllData = async () => {
      setIsLoading(true);
      setError(null);
      
      // This runs both tasks at the same time and waits for both to finish
      const results = await Promise.allSettled([
        loadVaultFiles(),  // Task 1
        loadCanvasData()   // Task 2
      ]);

      console.log('Data loading results:', results);

      // --- Handle Vault File results ---
      if (results[0].status === 'fulfilled') {
        setVaultData(results[0].value);
      } else {
        // If it failed, log the error
        console.error('Failed to load vault files:', results[0].reason);
        setError('Failed to load vault files.');
      }

      // --- Handle Canvas Data results ---
      if (results[1].status === 'fulfilled') {
        const coursesData = results[1].value;
        setCanvasCourses(coursesData);
      } else {
        // If it failed, log the error
        console.error('Failed to load Canvas courses:', results[1].reason);
        setError('Failed to load Canvas courses.');
      }
      
      setIsLoading(false);
    };

    loadAllData();
  }, []); // Runs once on mount


  // --- Helper function for loading vault ---
  const loadVaultFiles = async () => {
    if (!window.api?.getVaultPath || !window.api?.scanVault) {
      throw new Error("File scanning API is not available.");
    }
    const vaultPath = await window.api.getVaultPath();
    const data = await window.api.scanVault(vaultPath);
    return data;
  };

  // --- Helper function for loading canvas ---
  const loadCanvasData = async () => {
    if (!window.api?.fetchCanvasData) {
      throw new Error("Canvas API is not available.");
    }
    // Pass the base endpoint, the handler in main.js will add the params
    const courses = await window.api.fetchCanvasData('/api/v1/courses'); 
    if (courses.error) {
      // Throw an error to be caught by allSettled
      throw new Error(courses.error);
    }
    return courses;
  };
  return (
    <div className="app">
      <Sidebar 
        setActiveView={setActiveView} 
      />

      <div className="main-content">
        {activeView === 'notepad' && (
          <Notepad selectedFile={selectedFile} onRenameFile={handleRenameFile} />
        )}
        {activeView === 'calendar' && (
          <Calendar
            courses={canvasCourses}
          />
        )}
        {activeView === 'dashboard' && (
          <Dashboard 
            vaultData={vaultData}
            isLoading={isLoading} 
            error={error}
            onFileClick={handleFileClick}
            onAddNote={handleAddNote}
          />
        )}

        {activeView === "ai" && (
          <AIView 
            vaultData={vaultData}
          />
        )}
      </div>
    </div>
  );
}

export default App;