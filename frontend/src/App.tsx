import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.tsx'
import Upload from './pages/Upload.tsx'
import Analysis from './pages/Analysis.tsx'
import Training from './pages/Training.tsx'
import Leaderboard from './pages/Leaderboard.tsx'
import Explainability from './pages/Explainability.tsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                    element={<Home />} />
        <Route path="/upload"              element={<Upload />} />
        <Route path="/analysis/:sessionId" element={<Analysis />} />
        <Route path="/training/:sessionId" element={<Training />} />
        <Route path="/leaderboard/:sessionId" element={<Leaderboard />} />
        <Route path="/explain/:sessionId"  element={<Explainability />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App