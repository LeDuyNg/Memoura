import { useState } from "react";

import ToggleIcon from "../assets/arrow_left_double.svg";
import DashboardIcon from "../assets/dashboard.svg";
import CalendarIcon from "../assets/calendar.svg";
import AiIcon from "../assets/ai.svg";
import FlashcardIcon from "../assets/flashcards.svg"; 
import TimerIcon from "../assets/timer.svg";


function Sidebar({setActiveView}) {
  const [isClosed, setIsClosed] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null); 

  const handleToggleSidebar = () => {
    setIsClosed(!isClosed);
    setOpenSubMenu(null); 
  };

  const handleToggleSubMenu = (menuName) => {
    if (isClosed) {
      setIsClosed(false); 
    }
    setOpenSubMenu(openSubMenu === menuName ? null : menuName);
  };

  const handleNavClick = (e, viewName) => {
    e.preventDefault();
    setActiveView(viewName);
  };

  return (
    <nav id="sidebar" className={isClosed ? "close" : ""}>
      <ul>
        <li>
          <span className="logo">Memoura</span>
          <button
            onClick={handleToggleSidebar}
            id="toggle-btn"
            className={isClosed ? "rotate" : ""}
          >
            <img src={ToggleIcon} alt="Toggle Sidebar" />
          </button>
        </li>

        <li>
          <a href="#" onClick={(e) => handleNavClick(e, 'dashboard')}>
            <img src={DashboardIcon} alt="Dashboard" />
            <span>Dashboard</span>
          </a>
        </li>

        <li>
          <a href="#" id="Calendar Button" onClick={(e) => handleNavClick(e, 'calendar')}>
            <img src={CalendarIcon} alt="Calendar" />
            <span>Calendar</span>
          </a>
        </li>

        <li>
          <a href="#" onClick={(e) => handleNavClick(e, 'ai')}>
            <img src={AiIcon} alt="AI" />
            <span>AI</span>
          </a>
        </li>

        <li>
          <a href="#" onClick={(e) => handleNavClick(e, 'flashcards')}>
            <img src={FlashcardIcon} alt="Flashcards" />
            <span>Flashcards</span>
          </a>
        </li>

        <li>
          <a href="#" onClick={(e) => handleNavClick(e, 'pomodoro')}>
            <img src={TimerIcon} alt="Pomodoro" />
            <span>Pomodoro</span>
          </a>
        </li>

        {/* <li className="bottom-message">
          <span>created by the 4 greatest minds the world has ever freaking seen</span>
        </li> */}
      </ul>
    </nav>
  );
}

export default Sidebar;