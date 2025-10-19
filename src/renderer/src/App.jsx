import React, { useState } from 'react';
import Notepad from "./components/Notepad";
import Sidebar from "./components/Sidebar"; 
import Calendar from './components/Calendar';
function App() {
  // State to manage which component is active. Default to 'notepad'
  const [activeView, setActiveView] = useState('notepad');
  return (
    <div className="app">
      <Sidebar setActiveView={setActiveView}/>

      <div className="main-content">
        {activeView === 'notepad' && <Notepad />}
        {activeView === 'calendar' && <Calendar />}
      </div>
    </div>
  );
}

export default App;