import tripleBarLogo from "../assets/tripleBarLogo.svg";
import PropTypes from "prop-types";

function RightSidebar({
  className,
  rightSidebarVisible,
  setRightSidebarVisible,
}) {
  return (
    <div
      className={`sidebar ${className} ${!rightSidebarVisible ? "hidden" : ""}`}
    >
      <div className="sidebar-header">
        <h2 className="sidebar-title">Tools</h2>
        <button
          onClick={() => setRightSidebarVisible(!rightSidebarVisible)}
          className={`toggle-sidebar-button right-button ${!rightSidebarVisible ? "button-hidden" : ""}`}
        >
          <img src={tripleBarLogo} alt="Toggle Right Sidebar" />
        </button>
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

RightSidebar.propTypes = {
  className: PropTypes.string.isRequired,
  rightSidebarVisible: PropTypes.bool.isRequired,
  setRightSidebarVisible: PropTypes.func.isRequired,
};

export default RightSidebar;
