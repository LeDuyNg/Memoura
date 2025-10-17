import tripleBarLogo from "../assets/tripleBarLogo.svg";
import PropTypes from "prop-types";

function LeftSidebar({ leftSidebarVisible, setLeftSidebarVisible }) {
  return (
    <div className={`sidebar ${!leftSidebarVisible ? "hidden" : ""}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">Memoura</h2>
        <button
          onClick={() => setLeftSidebarVisible(!leftSidebarVisible)}
          className={`toggle-sidebar-button left-button ${!leftSidebarVisible ? "button-hidden" : ""}`}
        >
          <img src={tripleBarLogo} alt="Toggle Left Sidebar" />
        </button>
      </div>

      <div className="sidebar-content">
        <h3>ADD THESE LATER</h3>
        <ul>
          <li>File Navigation</li>
          <li>Settings</li>
          <li>Search</li>
        </ul>
      </div>

      <div className="sidebar-footer">
        <p>Developed by 4 of the greatest minds the world has ever seen</p>
      </div>
    </div>
  );
}

LeftSidebar.propTypes = {
  leftSidebarVisible: PropTypes.bool.isRequired,
  setLeftSidebarVisible: PropTypes.func.isRequired,
};

export default LeftSidebar;
