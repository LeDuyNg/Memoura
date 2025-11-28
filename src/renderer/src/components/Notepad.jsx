import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import '../assets/Notepad.css';

function Notepad({ selectedFile }) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (selectedFile && selectedFile.filepath) {
      loadFileContent();
    } else {
      setContent('');
      setSaveStatus('');
    }
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const loadFileContent = async () => {
    if (!selectedFile || !selectedFile.filepath) return;

    setIsLoading(true);
    setSaveStatus('Loading...');
    try {
      if (window.api && window.api.getVaultPath && window.api.readFile && window.api.joinPath) {
        const vaultPath = await window.api.getVaultPath();
        const fullPath = window.api.joinPath(vaultPath, selectedFile.filepath);

        const result = await window.api.readFile(fullPath);
        if (result.success) {
          setContent(result.content);
          setSaveStatus('Loaded');
          setTimeout(() => setSaveStatus(''), 2000);
        } else {
          setContent(`Error loading file: ${result.error}`);
          setSaveStatus('Error loading');
        }
      } else {
        setContent('File reading API not available');
        setSaveStatus('Error');
      }
    } catch (error) {
      console.error('Error loading file:', error);
      setContent(`Error: ${error.message}`);
      setSaveStatus('Error');
    } finally {
      setIsLoading(false);
    }
  };

  const saveFile = async (fileContent) => {
    if (!selectedFile || !selectedFile.filepath) return;

    try {
      if (window.api && window.api.getVaultPath && window.api.writeFile && window.api.joinPath) {
        const vaultPath = await window.api.getVaultPath();
        const fullPath = window.api.joinPath(vaultPath, selectedFile.filepath);

        const result = await window.api.writeFile(fullPath, fileContent);
        if (result.success) {
          setSaveStatus('Saved');
          setTimeout(() => setSaveStatus(''), 2000);
        } else {
          setSaveStatus('Save failed');
          setTimeout(() => setSaveStatus(''), 3000);
        }
      }
    } catch (error) {
      console.error('Error saving file:', error);
      setSaveStatus('Save error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setSaveStatus('Saving...');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (selectedFile && selectedFile.filepath) {
      saveTimeoutRef.current = setTimeout(() => {
        saveFile(newContent);
      }, 1000);
    }
  };

  const isMarkdown = selectedFile?.name?.endsWith('.md');

  return (
    <main className="notepad">
      {selectedFile && (
        <div className="notepad-header">
          <div className="notepad-meta">
            <h1 className="notepad-title">{selectedFile.name}</h1>
            <p className="notepad-path">{selectedFile.filepath || 'No path specified'}</p>
          </div>

          <div className="notepad-actions">
            {isMarkdown && (
              <button
                className={`notepad-preview-toggle ${showPreview ? 'active' : ''}`}
                onClick={() => setShowPreview(!showPreview)}
                aria-label="Toggle preview"
              >
                {showPreview ? 'Edit' : 'Preview'}
              </button>
            )}
            {saveStatus && (
              <div
                className="notepad-save-status"
                style={{
                  backgroundColor:
                    saveStatus === 'Saved'
                      ? 'rgba(76, 175, 80, 0.12)'
                      : saveStatus === 'Saving...' || saveStatus === 'Loading...'
                      ? 'rgba(255, 193, 7, 0.12)'
                      : saveStatus.includes('Error') || saveStatus.includes('failed')
                      ? 'rgba(244, 67, 54, 0.12)'
                      : 'rgba(33, 150, 243, 0.12)',
                  color:
                    saveStatus === 'Saved'
                      ? '#81c784'
                      : saveStatus === 'Saving...' || saveStatus === 'Loading...'
                      ? '#ffb74d'
                      : saveStatus.includes('Error') || saveStatus.includes('failed')
                      ? '#e57373'
                      : '#64b5f6'
                }}
              >
                {saveStatus}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="notepad-container">
        <textarea
          className="notepad-textarea"
          placeholder={selectedFile ? 'Start editing...' : 'Select a file to edit'}
          value={content}
          onChange={handleContentChange}
          disabled={isLoading || !selectedFile}
          style={{
            display: showPreview && isMarkdown ? 'none' : 'block'
          }}
        />
        {isMarkdown && showPreview && (
          <div
            className="notepad-preview"
            dangerouslySetInnerHTML={{ __html: marked(content) }}
          />
        )}
      </div>
    </main>
  );
}

export default Notepad;