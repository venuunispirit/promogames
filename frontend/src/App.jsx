import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ThemeProvider } from "./pages/ThemeContext"
import './pages/Theme.css'
import LoginPage         from './pages/LoginPage'
import DashboardLayout   from './components/DashboardLayout'
import DashboardHome     from './pages/DashboardHome'
import ClientsPage       from './pages/ClientsPage'
import GamesPage         from './pages/GamesPage'
import GameBuilderPage   from './pages/GameBuilderPage'
import PlayerPage        from './pages/PlayerPage'
import LandingPage       from './pages/LandingPage'
import GameResponsesPage from './pages/GameResponsesPage'
import ArcadePage        from './pages/ArcadePage'
import CrosswordBuilderTab from './pages/CrosswordBuilderTab'
import PlayerDashboard   from './pages/PlayerDashboard'
import PlayersPage       from './pages/PlayersPage'
import LeaderboardPage   from './pages/LeaderboardPage' // ← ADD THIS

// ── Admin protected route ─────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg)', transition: 'var(--transition)',
    }}>
      <div className="loader-spin" />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

// ── Player protected route ────────────────────────────────────────────────────
function PlayerRoute({ children }) {
  const token = localStorage.getItem('playerToken')
  const user  = localStorage.getItem('playerUser')
  if (!token || !user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"           element={<LandingPage />} />
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/arcade"     element={<ArcadePage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} /> {/* ← ADD THIS */}

      {/* Player game route */}
      <Route path="/play/:gameName/:companyName" element={<PlayerPage />} />

      {/* Player dashboard */}
      <Route path="/player/dashboard" element={<PlayerRoute><PlayerDashboard /></PlayerRoute>} />

      {/* Admin dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index                                  element={<DashboardHome />} />
        <Route path="clients"                         element={<ClientsPage />} />
        <Route path="games"                           element={<GamesPage />} />
        <Route path="games/:id/builder"               element={<GameBuilderPage />} />
        <Route path="games/:id/crossword-builder"     element={<CrosswordBuilderTab />} />
        <Route path="games/:id/responses"             element={<GameResponsesPage />} />
        <Route path="players"                         element={<PlayersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  )
}