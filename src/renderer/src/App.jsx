import React, { useState } from 'react';
import Notepad from "./components/Notepad";
import Sidebar from "./components/Sidebar"; 
import Calendar from './components/Calendar';
import Dashboard from './components/Dashboard';
function App() {
  // State to manage which component is active. Default to 'dashboard'
  const [activeView, setActiveView] = useState('dashboard');
  return (
    <div className="app">
      <Sidebar setActiveView={setActiveView}/>

      <div className="main-content">
        {activeView === 'notepad' && <Notepad />}
        {activeView === 'calendar' && <Calendar />}
        {activeView === 'dashboard' && <Dashboard />}
      </div>
    </div>
  );
}

export default App;