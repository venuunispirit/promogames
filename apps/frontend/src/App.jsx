import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ThemeProvider } from "./pages/ThemeContext"
import { AccessibilityProvider } from './utils/accessibility'
import './pages/Theme.css'
import './index.css'
import { lazy, Suspense } from 'react'

// ── Route-level code splitting ───────────────────────────────────────────────
// Each page is loaded only when its route is visited. This keeps the initial
// bundle small (the old build shipped ~6.5 MB of JS on first load, including
// every game engine — three.js, gsap, leaflet, etc.).
const LoginPage                = lazy(() => import('./pages/LoginPage.jsx'))
const DashboardLayout          = lazy(() => import('./components/DashboardLayout.jsx'))
const DashboardHome            = lazy(() => import('./pages/DashboardHome.jsx'))
const ClientsPage              = lazy(() => import('./pages/ClientsPage.jsx'))
const GamesPage                = lazy(() => import('./pages/GamesPage.jsx'))
const GameBuilderPage          = lazy(() => import('./pages/GameBuilderPage.jsx'))
const TemplateBuilderPage      = lazy(() => import('./pages/TemplateBuilderPage.jsx'))
const TemplatesPage            = lazy(() => import('./pages/TemplatesPage.jsx'))
const SpaceBuilderPage         = lazy(() => import('./pages/SpaceBuilderPage.jsx'))
const Connect4BuilderPage      = lazy(() => import('./pages/Connect4BuilderPage.jsx'))
const ArrowEscapeBuilderPage   = lazy(() => import('./pages/ArrowEscapeBuilderPage.jsx'))
const BrickImagesPage          = lazy(() => import('./pages/BrickImagesPage.jsx'))
const BowlingBuilderPage       = lazy(() => import('./pages/BowlingBuilderPage.jsx'))
const SudokuBuilderPage        = lazy(() => import('./pages/SudokuBuilderPage.jsx'))
const MinesweeperBuilderPage   = lazy(() => import('./pages/MinesweeperBuilderPage.jsx'))
const WordScrambleBuilderPage  = lazy(() => import('./pages/WordScrambleBuilderPage.jsx'))
const RpsBuilderPage           = lazy(() => import('./pages/RpsBuilderPage.jsx'))
const BounceBuilderPage        = lazy(() => import('./pages/BounceBuilderPage.jsx'))
const PlayerPage               = lazy(() => import('./pages/PlayerPage.jsx'))
// Landing page is the entry route — load it eagerly so the hero (the LCP
// element) paints without waiting for a lazily-loaded chunk.
import LandingPage from './pages/LandingPage.jsx'
const GameResponsesPage        = lazy(() => import('./pages/GameResponsesPage.jsx'))
const ArcadePage               = lazy(() => import('./pages/ArcadePage.jsx'))
const CrosswordBuilderPage     = lazy(() => import('./pages/CrosswordBuilderPage.jsx'))
const SpinBuilderTab           = lazy(() => import('./pages/SpinBuilderTab.jsx'))
const MemoryBuilderPage        = lazy(() => import('./pages/MemoryBuilderPage.jsx'))
const JigsawBuilderPage        = lazy(() => import('./pages/JigsawBuilderPage.jsx'))
const WordSearchBuilderPage    = lazy(() => import('./pages/WordSearchBuilderPage.jsx'))
const WordSearchPlayerPage     = lazy(() => import('./pages/WordSearchPlayerPage.jsx'))
const PouringBuilderPage       = lazy(() => import('./pages/PouringBuilderPage.jsx'))
const TyperBuilderPage         = lazy(() => import('./pages/TyperBuilderPage.jsx'))
const MathBuilderPage          = lazy(() => import('./pages/MathBuilderPage.jsx'))
const MazeBuilderPage          = lazy(() => import('./pages/MazeBuilderPage.jsx'))
const ScrewBuilderPage         = lazy(() => import('./pages/ScrewBuilderPage.jsx'))
const TowerBuilderPage         = lazy(() => import('./pages/TowerBuilderPage.jsx'))
const Game2048BuilderPage      = lazy(() => import('./pages/Game2048BuilderPage.jsx'))
const SnakeBuilderPage         = lazy(() => import('./pages/SnakeBuilderPage.jsx'))
const CatchBuilderPage         = lazy(() => import('./pages/CatchBuilderPage.jsx'))
const ReactionBuilderPage      = lazy(() => import('./pages/ReactionBuilderPage.jsx'))
const SimonBuilderPage         = lazy(() => import('./pages/SimonBuilderPage.jsx'))
const FlappyBuilderPage        = lazy(() => import('./pages/FlappyBuilderPage.jsx'))
const BejeweledBuilderPage     = lazy(() => import('./pages/BejeweledBuilderPage.jsx'))
const BejeweledPlayerPage      = lazy(() => import('./pages/BejeweledPlayerPage.jsx'))
const TetrisBuilderPage        = lazy(() => import('./pages/TetrisBuilderPage.jsx'))
const StackBuilderPage         = lazy(() => import('./pages/StackBuilderPage.jsx'))
const WhackAMoleBuilderPage    = lazy(() => import('./pages/WhackAMoleBuilderPage.jsx'))
const HanoiBuilderPage         = lazy(() => import('./pages/HanoiBuilderPage.jsx'))
const BreakoutBuilderPage      = lazy(() => import('./pages/BreakoutBuilderPage.jsx'))
const BubbleShooterBuilderPage = lazy(() => import('./pages/BubbleShooterBuilderPage.jsx'))
const CarLaunchBuilderPage     = lazy(() => import('./pages/CarLaunchBuilderPage.jsx'))
const StressBusterBuilderPage  = lazy(() => import('./pages/frustrationbuildertab.jsx'))
const SoundifyBuilderPage      = lazy(() => import('./pages/soundifybuilderpage.jsx'))
const TicTacToeBuilderPage     = lazy(() => import('./pages/tictactoebuilder.jsx'))
const ChessBuilderPage         = lazy(() => import('./pages/ChessBuilderPage.jsx'))
const ChessPlayerPage          = lazy(() => import('./pages/ChessPlayerPage.jsx'))
const BlockBlasterBuilderPage  = lazy(() => import('./pages/BlockBlasterBuilderPage.jsx'))
const CandyBlastBuilderPage    = lazy(() => import('./pages/CandyBlastBuilderPage.jsx'))
const CarromBuilderPage        = lazy(() => import('./pages/CarromBuilderPage.jsx'))
const ClassicMazeBuilderPage   = lazy(() => import('./pages/ClassicMazeBuilderPage.jsx'))
const LudoBuilderPage          = lazy(() => import('./pages/LudoBuilderPage.jsx'))
const SnakeAndLadderBuilderPage = lazy(() => import('./pages/SnakeAndLadderBuilderPage.jsx'))
const TicTacToeMultiplayerBuilderPage = lazy(() => import('./pages/TicTacToeMultiplayerBuilderPage.jsx'))
const PlayerLayout             = lazy(() => import('./pages/PlayerLayout.jsx'))
const PlayerDashboardPage      = lazy(() => import('./pages/PlayerDashboardPage.jsx'))
const PlayerGamesPage          = lazy(() => import('./pages/PlayerGamesPage.jsx'))
const PlayerRewardsPage        = lazy(() => import('./pages/PlayerRewardsPage.jsx'))
const PlayerProfilePage        = lazy(() => import('./pages/PlayerProfilePage.jsx'))
const PlayersPage              = lazy(() => import('./pages/PlayersPage.jsx'))
const LeaderboardPage          = lazy(() => import('./pages/LeaderboardPage.jsx'))
const Business                 = lazy(() => import('./pages/Business.jsx'))
const CompanyProfilePage       = lazy(() => import('./pages/CompanyProfilePage.jsx'))
const CRMPage                  = lazy(() => import('./pages/CRMPage.jsx'))
const StatusPage               = lazy(() => import('./pages/StatusPage.jsx'))
const BOLogsPage               = lazy(() => import('./pages/BOLogsPage.jsx'))
const RedemptionLogsPage       = lazy(() => import('./pages/RedemptionLogsPage.jsx'))
const BOLayout                 = lazy(() => import('./pages/BOLayout.jsx'))
const BODashboard              = lazy(() => import('./pages/BODashboard.jsx'))
const BOGames                  = lazy(() => import('./pages/BOGames.jsx'))
const BORedemptions            = lazy(() => import('./pages/BORedemptions.jsx'))
const BrandOwnerMyPage         = lazy(() => import('./pages/BrandOwnerMyPage.jsx'))
const GameCategoryPage         = lazy(() => import('./pages/GameCategoryPage.jsx'))
const ThumbnailsPage           = lazy(() => import('./pages/ThumbnailsPage.jsx'))
const TermsPage                = lazy(() => import('./pages/TermsPage.jsx'))
const PrivacyPage              = lazy(() => import('./pages/PrivacyPage.jsx'))
const CookieBanner             = lazy(() => import('./components/CookieBanner.jsx'))

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

// Shown briefly while a lazily-loaded route's chunk downloads
function RouteFallback() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg)', transition: 'var(--transition)',
    }}>
      <div className="loader-spin" />
    </div>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
    <Routes>
      {/* Public */}
      <Route path="/"           element={<LandingPage />} />
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/arcade"     element={<ArcadePage />} />
      <Route path="/games/:categorySlug" element={<GameCategoryPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/business"    element={<Business />} />
      <Route path="/company"     element={<CompanyProfilePage />} />
      <Route path="/terms"       element={<TermsPage />} />
      <Route path="/privacy"     element={<PrivacyPage />} />

      {/* Player game routes */}
      <Route path="/play/:gameName/:companyName" element={<PlayerPageWrapper />} />
      <Route path="/play/:gameName" element={<PlayerPageWrapper />} />
      <Route path="/play/bejeweled/:id" element={<BejeweledPlayerPage />} />
      <Route path="/play/chess" element={<ChessPlayerPage />} />
      <Route path="/play/chess/:gameName/:companyName" element={<ChessPlayerPage />} />

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
        <Route path="thumbnails"                      element={<ThumbnailsPage />} />
        <Route path="templates"                       element={<TemplatesPage />} />
        <Route path="templates/new"                   element={<TemplateBuilderPage />} />
        <Route path="templates/:id"                   element={<TemplateBuilderPage />} />
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
        <Route path="games/:id/tower-builder"          element={<TowerBuilderPage />} />
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
        <Route path="games/:id/chess-builder"          element={<ChessBuilderPage />} />
        <Route path="games/:id/blockblaster-builder"   element={<BlockBlasterBuilderPage />} />
        <Route path="games/:id/candyblast-builder"     element={<CandyBlastBuilderPage />} />
        <Route path="games/:id/Carrom-builder"          element={<CarromBuilderPage />} />
        <Route path="games/:id/classicmaze-builder"    element={<ClassicMazeBuilderPage />} />
        <Route path="games/:id/ludo-builder"           element={<LudoBuilderPage />} />
        <Route path="games/:id/snakeandladder-builder" element={<SnakeAndLadderBuilderPage />} />
        <Route path="games/:id/tictactoemultiplayer-builder" element={<TicTacToeMultiplayerBuilderPage />} />
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
    </Suspense>
  )
}

export default function App() {
  return (
    <AccessibilityProvider>
      <ThemeProvider>
        <a href="#main-content" className="skip-link"></a>
        <div id="main-content" tabIndex={-1}>
          <AppRoutes />
          <CookieBanner />
        </div>
      </ThemeProvider>
    </AccessibilityProvider>
  )
}