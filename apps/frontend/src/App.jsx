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
import SpaceBuilderPage  from './pages/SpaceBuilderPage'
import SpacePlayerPage   from './pages/SpacePlayerPage'
import BounceBuilderPage from './pages/BounceBuilderPage'
import BouncePlayerPage  from './pages/BouncePlayerPage'
import PlayerPage        from './pages/PlayerPage'
import LandingPage       from './pages/LandingPage'
import GameResponsesPage from './pages/GameResponsesPage'
import ArcadePage        from './pages/ArcadePage'
import CrosswordBuilderPage from './pages/CrosswordBuilderPage'
import SpinBuilderTab     from './pages/SpinBuilderTab'
import MemoryBuilderPage  from './pages/MemoryBuilderPage'
import JigsawBuilderPage  from './pages/JigsawBuilderPage'
import WordSearchBuilderPage from './pages/WordSearchBuilderPage'
import PouringBuilderPage from './pages/PouringBuilderPage'
import TyperBuilderPage from './pages/TyperBuilderPage'
import MathBuilderPage from './pages/MathBuilderPage'
import MazeBuilderPage from './pages/MazeBuilderPage'
import ScrewBuilderPage from './pages/ScrewBuilderPage'
import Game2048BuilderPage from './pages/Game2048BuilderPage'
import SnakeBuilderPage from './pages/SnakeBuilderPage'
import CatchBuilderPage from './pages/CatchBuilderPage'
import ReactionBuilderPage from './pages/ReactionBuilderPage'
import SimonBuilderPage from './pages/SimonBuilderPage'
import FlappyBuilderPage from './pages/FlappyBuilderPage'
import PlayerDashboard   from './pages/PlayerDashboard'
import PlayersPage       from './pages/PlayersPage'
import LeaderboardPage   from './pages/LeaderboardPage'
import Business          from './pages/Business'

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
  const token = localStorage.getItem('playerToken') || sessionStorage.getItem('playerToken')
  const user  = localStorage.getItem('playerUser') || sessionStorage.getItem('playerUser')
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
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/business"    element={<Business />} />

      {/* Player game routes */}
      <Route path="/play/:gameName/:companyName" element={<PlayerRoute><SpacePlayerPage /></PlayerRoute>} />

      {/* Player dashboard */}
      <Route path="/player/dashboard" element={<PlayerRoute><PlayerDashboard /></PlayerRoute>} />

      {/* Admin dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index                                  element={<DashboardHome />} />
        <Route path="clients"                         element={<ClientsPage />} />
        <Route path="games"                           element={<GamesPage />} />
        <Route path="games/:id/builder"               element={<GameBuilderPage />} />
        <Route path="games/:id/space-builder"          element={<SpaceBuilderPage />} />
        <Route path="games/:id/bounce-builder"         element={<BounceBuilderPage />} />
        <Route path="games/:id/spin-builder"           element={<SpinBuilderTab />} />
        <Route path="games/:id/memory-builder"        element={<MemoryBuilderPage />} />
        <Route path="games/:id/jigsaw-builder"        element={<JigsawBuilderPage />} />
        <Route path="games/:id/wordsearch-builder"    element={<WordSearchBuilderPage />} />
        <Route path="games/:id/pouring-builder"       element={<PouringBuilderPage />} />
        <Route path="games/:id/typer-builder"          element={<TyperBuilderPage />} />
        <Route path="games/:id/math-builder"           element={<MathBuilderPage />} />
        <Route path="games/:id/maze-builder"           element={<MazeBuilderPage />} />
        <Route path="games/:id/screw-builder"          element={<ScrewBuilderPage />} />
        <Route path="games/:id/responses"             element={<GameResponsesPage />} />
        <Route path="games/:id/2048-builder"           element={<Game2048BuilderPage />} />
        <Route path="games/:id/snake-builder"          element={<SnakeBuilderPage />} />
        <Route path="games/:id/catch-builder"          element={<CatchBuilderPage />} />
        <Route path="games/:id/reaction-builder"       element={<ReactionBuilderPage />} />
        <Route path="games/:id/simon-builder"          element={<SimonBuilderPage />} />
        <Route path="games/:id/flappy-builder"          element={<FlappyBuilderPage />} />
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