import { useState } from "react";

// Import the icons you copied into src/assets
import ToggleIcon from "../assets/arrow_left_double.svg";
import HomeIcon from "../assets/home.svg";
import DashboardIcon from "../assets/dashboard.svg";

import CreateIcon from "../assets/create_folder.svg";
import TodoIcon from "../assets/checklist.svg";
import CalendarIcon from "../assets/calendar.svg";
import AiIcon from "../assets/ai.svg";

import ArrowIcon from "../assets/arrow_down.svg";

function Sidebar() {
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
          <a href="#">
            <img src={HomeIcon} alt="Home" />
            <span>Home</span>
          </a>
        </li>

        <li>
          <a href="#">
            <img src={DashboardIcon} alt="Dashboard" />
            <span>Dashboard</span>
          </a>
        </li>



        {/* --- Create Sub-menu --- */}
        <li>
          <button
            onClick={() => handleToggleSubMenu("create")}
            className={`dropdown-btn ${
              openSubMenu === "create" ? "rotate" : ""
            }`}
          >
            <img src={CreateIcon} alt="Create" />
            <span>Create</span>
            <img src={ArrowIcon} alt="Expand" />
          </button>
          <ul
            className={`sub-menu ${openSubMenu === "create" ? "show" : ""}`}
          >
            <div>
              <li>
                <a href="#">Folder</a>
              </li>
              <li>
                <a href="#">Document</a>
              </li>
            </div>
          </ul>
        </li>

        {/* --- Todo-Lists Sub-menu --- */}
        <li>
          <button
            onClick={() => handleToggleSubMenu("todo")}
            className={`dropdown-btn ${
              openSubMenu === "todo" ? "rotate" : ""
            }`}
          >
            <img src={TodoIcon} alt="Todo Lists" />
            <span>Todo-Lists</span>
            <img src={ArrowIcon} alt="Expand" />
          </button>
          <ul className={`sub-menu ${openSubMenu === "todo" ? "show" : ""}`}>
            <div>
              <li>
                <a href="#">gavin</a>
              </li>
              <li>
                <a href="#">is</a>
              </li>
              <li>
                <a href="#">the</a>
              </li>
              <li>
                <a href="#">best</a>
              </li>
            </div>
          </ul>
        </li>

        <li>
          <a href="#">
            <img src={CalendarIcon} alt="Calendar" />
            <span>Calendar</span>
          </a>
        </li>

        <li>
          <a href="#">
            <img src={AiIcon} alt="AI" />
            <span>AI</span>
          </a>
        </li>

        <li class="bottom-message">
          <span>created by the 4 greatest minds the world has ever freaking seen</span>
        </li>


      </ul>
    </nav>
  );
}

export default Sidebar;