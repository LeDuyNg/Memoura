import React, { useState, useEffect } from 'react';
import '../assets/FlashcardView.css';

// --- MODIFIED: Accept onDeleteFile prop ---
function FlashcardView({ vaultData, onDeleteFile }) {
  const [viewState, setViewState] = useState('list'); // 'list' or 'study'
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [currentSet, setCurrentSet] = useState(null); // The full JSON object of the selected set
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter vaultData for .json files in a "Flashcards" folder
  useEffect(() => {
    if (vaultData && vaultData.files) {
      const sets = vaultData.files.filter(file => 
        // Check if it's a JSON file AND inside a Flashcards folder (case insensitive check for folder)
        file.filetype === '.json' && 
        (file.filepath.includes('Flashcards/') || file.filepath.includes('Flashcards\\'))
      );
      setFlashcardSets(sets);
    }
  }, [vaultData]);

  const handleSelectSet = async (file) => {
    setLoading(true);
    try {
      const vaultPath = await window.api.getVaultPath();
      const fullPath = await window.api.joinPath(vaultPath, file.filepath);
      const result = await window.api.readFile(fullPath);

      if (result.success) {
        try {
          const parsedContent = JSON.parse(result.content);
          // Ensure we have a valid structure (array or object with flashcards array)
          const cards = Array.isArray(parsedContent) 
            ? parsedContent 
            : (parsedContent.flashcards || []);
          
          if (cards.length > 0) {
            setCurrentSet({
              name: file.name.replace('.json', ''),
              cards: cards
            });
            setViewState('study');
            setCurrentCardIndex(0);
            setIsFlipped(false);
          } else {
            alert("This file contains no flashcards.");
          }
        } catch (parseErr) {
          alert("Error parsing JSON: " + parseErr.message);
        }
      } else {
        alert("Could not read file: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load flashcard set.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentSet && currentCardIndex < currentSet.cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex(prev => prev + 1), 150); // Small delay for smooth flip reset
    }
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex(prev => prev - 1), 150);
    }
  };

  const handleBackToList = () => {
    setViewState('list');
    setCurrentSet(null);
  };

  // --- RENDER: LIST VIEW ---
  if (viewState === 'list') {
    return (
      <div className="flashcard-container">
        <div className="fc-header">
          <h1>Flashcard Decks</h1>
          <p>{flashcardSets.length} decks found in /Flashcards</p>
        </div>

        <div className="decks-grid">
          {flashcardSets.length > 0 ? (
            flashcardSets.map((file) => (
              <div 
                key={file.filepath} 
                className="deck-card"
                onClick={() => handleSelectSet(file)}
              >
                {/* --- ADDED: Delete Button --- */}
                <button 
                  className="delete-deck-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile && onDeleteFile(file);
                  }}
                  title="Delete Deck"
                >
                  🗑️
                </button>

                <div className="deck-icon">🗂️</div>
                <div className="deck-info">
                  <h3>{file.name.replace('.json', '').replace(/flashcards_/i, '')}</h3>
                  <span className="deck-path">{file.filepath}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-decks">
              <p>No flashcard sets found.</p>
              <p className="sub-text">Use the AI tool to generate some!</p>
            </div>
          )}
        </div>
        {loading && <div className="loading-overlay">Loading deck...</div>}
      </div>
    );
  }

  // --- RENDER: STUDY VIEW ---
  const currentCard = currentSet.cards[currentCardIndex];

  return (
    <div className="flashcard-container study-mode">
      <div className="fc-header study-header">
        <button className="back-btn" onClick={handleBackToList}>← Back to Decks</button>
        <h2>{currentSet.name}</h2>
        <span className="progress-pill">{currentCardIndex + 1} / {currentSet.cards.length}</span>
      </div>

      <div className="study-area">
        <div 
          className={`flashcard ${isFlipped ? 'flipped' : ''}`} 
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="card-face front">
            <div className="card-label">QUESTION</div>
            <div className="card-content">{currentCard.question}</div>
            <div className="click-hint">Click to flip</div>
          </div>
          <div className="card-face back">
            <div className="card-label">ANSWER</div>
            <div className="card-content">{currentCard.answer}</div>
          </div>
        </div>

        <div className="controls">
          <button 
            className="control-btn" 
            onClick={handlePrev} 
            disabled={currentCardIndex === 0}
          >
            ← Previous
          </button>
          <button 
            className="control-btn" 
            onClick={handleNext} 
            disabled={currentCardIndex === currentSet.cards.length - 1}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default FlashcardView;