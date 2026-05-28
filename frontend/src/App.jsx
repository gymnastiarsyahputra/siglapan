import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ManajemenPage from './pages/ManajemenPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-green-700 text-white px-6 py-3 flex items-center gap-6 shadow-md">
          <span className="font-bold text-xl tracking-wide">🌾 SIGLAPAN</span>
          <a href="/" className="hover:text-green-200 text-sm font-medium transition">Peta</a>
          <a href="/manajemen" className="hover:text-green-200 text-sm font-medium transition">Manajemen Data</a>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/manajemen" element={<ManajemenPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App