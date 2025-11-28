import React, { useEffect } from 'react';
import '../assets/PomodoroView.css';

function PomodoroView({ 
  mode, 
  timeLeft, 
  isActive, 
  task, 
  setTask, 
  onSwitchMode, 
  onToggleTimer, 
  onResetTimer 
}) {
  
  useEffect(() => {
    // Request notification permission on mount
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="pomodoro-container">
      <div className="pomo-header">
        <h1>Focus Timer</h1>
      </div>

      <div className="pomo-content">
        <div className="mode-selector">
          <button 
            className={`mode-btn ${mode === 'focus' ? 'active' : ''}`}
            onClick={() => onSwitchMode('focus')}
          >
            Focus
          </button>
          <button 
            className={`mode-btn ${mode === 'short' ? 'active' : ''}`}
            onClick={() => onSwitchMode('short')}
          >
            Short Break
          </button>
          <button 
            className={`mode-btn ${mode === 'long' ? 'active' : ''}`}
            onClick={() => onSwitchMode('long')}
          >
            Long Break
          </button>
        </div>

        <div className="timer-display">
          <div className="time-text">{formatTime(timeLeft)}</div>
          <div className="status-text">
            {isActive ? (mode === 'focus' ? 'Stay Focused' : 'Relax') : 'Paused'}
          </div>
        </div>

        <div className="controls">
          <button className={`control-btn main-btn ${isActive ? 'active' : ''}`} onClick={onToggleTimer}>
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button className="control-btn reset-btn" onClick={onResetTimer}>
            Reset
          </button>
        </div>

        <div className="task-section">
          <input 
            type="text" 
            className="task-input" 
            placeholder="What are you working on?"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default PomodoroView;