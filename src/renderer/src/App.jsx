// src/App.jsx

import React, { useState, useEffect } from 'react';
import Notepad from "./components/Notepad";
import Sidebar from "./components/Sidebar"; 
import Calendar from './components/Calendar';
import Dashboard from './components/Dashboard';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  
  // Initialize state to hold both files and folders
  const [vaultData, setVaultData] = useState({ files: [], folders: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFiles = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const vaultPath = await window.api.getVaultPath();

        if (window.api && window.api.scanVault) {
        
          // The function now returns an object { files, folders }
          const data = await window.api.scanVault(vaultPath);
          
          // Set the entire object in state
          setVaultData(data);

        } else {
          console.error("Error: window.api.scanVault is not available.");
          setError("File scanning API is not loaded.");
        }

      } catch (err) {
        console.error("Error scanning vault:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadFiles();
  }, []); // Runs once on mount

  return (
    <div className="app">
      <Sidebar 
        setActiveView={setActiveView} 
        files={vaultData.files} 
        folders={vaultData.folders} 
      />

      <div className="main-content">
        {activeView === 'notepad' && <Notepad />}
        {activeView === 'calendar' && <Calendar />}
        {activeView === 'dashboard' && (
          <Dashboard 
            vaultData={vaultData}
            isLoading={isLoading} 
            error={error} 
          />
        )}
      </div>
    </div>
  );
}

export default App;