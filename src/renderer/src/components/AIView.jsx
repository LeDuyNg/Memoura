import React, { useState } from 'react';
import '../assets/AIView.css';

function AIView() {
  // State to track which tool is selected (if you want to expand logic later)
  const [selectedTool, setSelectedTool] = useState(null);

  const handleToolSelect = (toolName) => {
    setSelectedTool(toolName);
    console.log(`Selected tool: ${toolName}`);
    // You can add logic here later to switch views
  };

  return (
    <div className="ai-container">
      <div className="button-wrapper">
        {/* Button 1: Summarize */}
        <button 
          className={`ai-card-btn ${selectedTool === 'summarize' ? 'active' : ''}`}
          onClick={() => handleToolSelect('summarize')}
        >
          <div className="icon">📝</div>
          <h2>Summarize Text</h2>
        </button>

        {/* Button 2: Flashcards */}
        <button 
          className={`ai-card-btn ${selectedTool === 'flashcards' ? 'active' : ''}`}
          onClick={() => handleToolSelect('flashcards')}
        >
          <div className="icon">🗂️</div>
          <h2>Generate Flashcards</h2>
        </button>
      </div>
    </div>
  );
}

export default AIView;