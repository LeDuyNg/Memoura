import Notepad from "./components/Notepad";
import Sidebar from "./components/Sidebar"; 

function App() {
  return (
    <div className="app">
      <Sidebar />
      <Notepad />
    </div>
  );
}

export default App;