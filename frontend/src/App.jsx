import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './components/DashboardLayout'
import DashboardHome from './pages/DashboardHome'
import ClientsPage from './pages/ClientsPage'
import GamesPage from './pages/GamesPage'
import GameBuilderPage from './pages/GameBuilderPage'
import PlayerPage from './pages/PlayerPage'
import LandingPage from './pages/LandingPage'
import GameResponsesPage from './pages/GameResponsesPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div className="loader-spin" />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Player game route */}
      <Route path="/play/:gameName/:companyName" element={<PlayerPage />} />

      {/* Admin dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardHome />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="games" element={<GamesPage />} />
        <Route path="games/:id/builder" element={<GameBuilderPage />} />
        <Route path="games/:id/responses" element={<GameResponsesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
