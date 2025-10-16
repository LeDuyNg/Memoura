import React from 'react';

function RightSidebar({ className }) { 
  return (
    <div className={`sidebar ${className}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">Tools</h2>
      </div>
      <div className="sidebar-content">
        <h3>ADD THESE LATER</h3>
        <ul>
          <li>Calendar</li>
          <li>AI Assistant</li>
        </ul>
      </div>
    </div>
  );
}

export default RightSidebar;