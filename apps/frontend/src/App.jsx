import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ThemeProvider } from "./pages/ThemeContext"
import './pages/Theme.css'
import LoginPage         from './pages/LoginPage'
import DashboardLayout   from './components/DashboardLayout'
import DashboardHome     from './pages/DashboardHome'
import ClientsPage       from './pages/ClientsPage'
import GamesPage         from './pages/GamesPage'
import GameBuilderPage   from './pages/GameBuilderPage'
import SpaceBuilderPage from './pages/SpaceBuilderPage'
import Connect4BuilderPage from './pages/Connect4BuilderPage'
import ArrowEscapeBuilderPage from './pages/ArrowEscapeBuilderPage'
import BrickImagesPage from './pages/BrickImagesPage'
import BowlingBuilderPage from './pages/BowlingBuilderPage'
import SudokuBuilderPage from './pages/SudokuBuilderPage'
import MinesweeperBuilderPage from './pages/MinesweeperBuilderPage'
import WordScrambleBuilderPage from './pages/WordScrambleBuilderPage'
import RpsBuilderPage from './pages/RpsBuilderPage'
import BounceBuilderPage from './pages/BounceBuilderPage'
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
import BejeweledBuilderPage from './pages/BejeweledBuilderPage'
import BejeweledPlayerPage from './pages/BejeweledPlayerPage'
import TetrisBuilderPage from './pages/TetrisBuilderPage'
import StackBuilderPage from './pages/StackBuilderPage'
import WhackAMoleBuilderPage from './pages/WhackAMoleBuilderPage'
import HanoiBuilderPage from './pages/HanoiBuilderPage'
import BreakoutBuilderPage from './pages/BreakoutBuilderPage'
import BubbleShooterBuilderPage from './pages/BubbleShooterBuilderPage'
import CarLaunchBuilderPage from './pages/CarLaunchBuilderPage'
import StressBusterBuilderPage from './pages/frustrationbuildertab'
import SoundifyBuilderPage from './pages/soundifybuilderpage'
import TicTacToeBuilderPage from './pages/tictactoebuilder'
import PlayerLayout      from './pages/PlayerLayout'
import PlayerDashboardPage from './pages/PlayerDashboardPage'
import PlayerGamesPage   from './pages/PlayerGamesPage'
import PlayerRewardsPage from './pages/PlayerRewardsPage'
import PlayerProfilePage from './pages/PlayerProfilePage'
import PlayersPage       from './pages/PlayersPage'
import LeaderboardPage   from './pages/LeaderboardPage'
import Business          from './pages/Business'
import CompanyProfilePage from './pages/CompanyProfilePage'
import CRMPage           from './pages/CRMPage'

import StatusPage         from './pages/StatusPage'
import BOLogsPage         from './pages/BOLogsPage'
import RedemptionLogsPage from './pages/RedemptionLogsPage'
import BOLayout          from './pages/BOLayout'
import BODashboard       from './pages/BODashboard'
import BOGames           from './pages/BOGames'
import BORedemptions     from './pages/BORedemptions'
import BrandOwnerMyPage  from './pages/BrandOwnerMyPage'

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

function PlayerPageWrapper() {
  const { gameName } = useParams()
  return <PlayerPage key={gameName} />
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
      <Route path="/company"     element={<CompanyProfilePage />} />

      {/* Player game routes */}
      <Route path="/play/:gameName/:companyName" element={<PlayerPageWrapper />} />
      <Route path="/play/bejeweled/:id" element={<BejeweledPlayerPage />} />

      {/* Player dashboard */}
      <Route path="/player" element={<PlayerRoute><PlayerLayout /></PlayerRoute>}>
        <Route path="dashboard" element={<PlayerDashboardPage />} />
        <Route path="dashboard/games" element={<PlayerGamesPage />} />
        <Route path="rewards" element={<PlayerRewardsPage />} />
        <Route path="profile" element={<PlayerProfilePage />} />
      </Route>

      {/* Admin dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index                                  element={<DashboardHome />} />
        <Route path="clients"                         element={<ClientsPage />} />
        <Route path="games"                           element={<GamesPage />} />
        <Route path="games/:id/crossword-builder"     element={<CrosswordBuilderPage />} />
        <Route path="games/:id/builder"               element={<GameBuilderPage />} />
        <Route path="games/:id/space-builder"          element={<SpaceBuilderPage />} />
        <Route path="games/:id/connect4-builder"       element={<Connect4BuilderPage />} />
        <Route path="games/:id/bowling-builder"        element={<BowlingBuilderPage />} />
        <Route path="games/:id/sudoku-builder"         element={<SudokuBuilderPage />} />
        <Route path="games/:id/minesweeper-builder"    element={<MinesweeperBuilderPage />} />
        <Route path="games/:id/wordscramble-builder"   element={<WordScrambleBuilderPage />} />
        <Route path="games/:id/rps-builder"            element={<RpsBuilderPage />} />
        <Route path="games/:id/arrowescape-builder"    element={<ArrowEscapeBuilderPage />} />
        <Route path="brick-images"                     element={<BrickImagesPage />} />
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
        <Route path="games/:id/bejeweled-builder"      element={<BejeweledBuilderPage />} />
        <Route path="games/:id/tetris-builder"        element={<TetrisBuilderPage />} />
        <Route path="games/:id/stack-builder"         element={<StackBuilderPage />} />
        <Route path="games/:id/whackamole-builder"    element={<WhackAMoleBuilderPage />} />
        <Route path="games/:id/hanoi-builder"         element={<HanoiBuilderPage />} />
        <Route path="games/:id/breakout-builder"      element={<BreakoutBuilderPage />} />
        <Route path="games/:id/bubbleshooter-builder" element={<BubbleShooterBuilderPage />} />
        <Route path="games/:id/carlaunch-builder"     element={<CarLaunchBuilderPage />} />
        <Route path="games/:id/frustration-builder"   element={<StressBusterBuilderPage />} />
        <Route path="games/:id/soundify-builder"      element={<SoundifyBuilderPage />} />
        <Route path="games/:id/tictactoe-builder"     element={<TicTacToeBuilderPage />} />
        <Route path="players"                         element={<PlayersPage />} />
        <Route path="crm"                             element={<CRMPage />} />

        <Route path="status"                         element={<StatusPage />} />
        <Route path="bo-logs"                        element={<BOLogsPage />} />
        <Route path="business/redemption-logs"       element={<RedemptionLogsPage />} />
      </Route>

      {/* Business Owner routes */}
      <Route path="/bo" element={<BOLayout />}>
        <Route path="dashboard"                       element={<BODashboard />} />
        <Route path="games"                           element={<BOGames />} />
        <Route path="redemptions"                     element={<BORedemptions />} />
        <Route path="my-page"                         element={<BrandOwnerMyPage />} />
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