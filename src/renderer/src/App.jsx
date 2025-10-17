import { useState } from "react";
import Notepad from "./components/Notepad";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";

function App() {
  const [leftSidebarVisible, setLeftSidebarVisible] = useState(true);
  const [rightSidebarVisible, setRightSidebarVisible] = useState(true);

  return (
    <div className="app">
      <LeftSidebar
        leftSidebarVisible={leftSidebarVisible}
        setLeftSidebarVisible={setLeftSidebarVisible}
      />
      <Notepad />
      <RightSidebar
        className="right-sidebar"
        rightSidebarVisible={rightSidebarVisible}
        setRightSidebarVisible={setRightSidebarVisible}
      />
    </div>
  );
}

export default App;
