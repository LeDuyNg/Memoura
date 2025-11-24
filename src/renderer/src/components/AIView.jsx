import React, { useState } from 'react';
import '../assets/AIView.css';

function AIView({ vaultData }) {
  // States: 'selection', 'input-flashcards', 'input-summarize'
  const [viewState, setViewState] = useState('selection'); 
  const [inputText, setInputText] = useState('');
  
  // Status tracking: 'idle', 'loading', 'success', 'error'
  const [status, setStatus] = useState('idle'); 
  const [resultMsg, setResultMsg] = useState('');

  const handleGenerateFlashcards = async () => {
    if (!inputText.trim()) return;

    setStatus('loading');
    setResultMsg('');

    try {
      // 1. Get the vault path dynamically so we know where to save
      const vaultPath = await window.api.getVaultPath();

      // 2. Call the AI handler in the main process
      const result = await window.api.generateFlashcards(inputText, vaultPath);

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

  const resetView = () => {
    setViewState('selection');
    setStatus('idle');
    setInputText('');
    setResultMsg('');
  };

  // --- RENDER: SELECTION MENU ---
  if (viewState === 'selection') {
    return (
      <div className="ai-container">
        <div className="button-wrapper">
          <button 
            className="ai-card-btn"
            onClick={() => setViewState('input-summarize')}
          >
            <div className="icon">📝</div>
            <h2>Summarize Text</h2>
          </button>

          <button 
            className="ai-card-btn"
            onClick={() => setViewState('input-flashcards')}
          >
            <div className="icon">🗂️</div>
            <h2>Generate Flashcards</h2>
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER: INPUT SCREEN ---
  return (
    <div className="ai-container" style={{ display: 'block' }}> {/* Reset flex centering */}
      <div className="ai-header">
        <button className="back-btn" onClick={resetView}>
          ← Back
        </button>
        <h1>
          {viewState === 'input-summarize' ? 'Summarize Text' : 'Generate Flashcards'}
        </h1>
        {/* Spacer to balance header */}
        <div style={{width: '60px'}}></div>
      </div>

      <div className="ai-content">
        <div className="input-section">
          <label>
            {viewState === 'input-summarize' ? 'Paste text to summarize:' : 'Paste notes to generate flashcards:'}
          </label>
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your content here..."
            disabled={status === 'loading'}
          />
          
          <button 
            className="generate-btn" 
            onClick={viewState === 'input-flashcards' ? handleGenerateFlashcards : () => alert("Summary feature coming soon!")}
            disabled={status === 'loading' || !inputText.trim()}
          >
            {status === 'loading' ? 'Processing with Ollama...' : 'Generate'}
          </button>

          {/* Status Message Display */}
          {status !== 'idle' && (
            <div className={`status-container`}>
              {status === 'loading' && <p style={{color: '#007aff'}}>🤖 AI is thinking... (This may take a moment)</p>}
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