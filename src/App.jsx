import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Landing from './pages/Landing'
import Search from './pages/Search'
import Results from './pages/Results'
import Signup from './pages/Signup'
import Login from './pages/Login'
import ProSuccess from './pages/ProSuccess'
import DevResetButton from './components/DevResetButton'
import ProBadge from './components/ProBadge'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/search" element={<Search />} />
          <Route path="/results" element={<Results />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pro-success" element={<ProSuccess />} />
        </Routes>
        <ProBadge />
        <DevResetButton />
      </BrowserRouter>
    </AuthProvider>
  )
}
