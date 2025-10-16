import Notepad from './components/Notepad'
import LeftSidebar from './components/LeftSidebar'
import RightSidebar from './components/RightSidebar'

function App() {
  return (
    <div className="app">
      <LeftSidebar />
      <Notepad />
      <RightSidebar className="right-sidebar" /> 
    </div>
  )
}

export default App