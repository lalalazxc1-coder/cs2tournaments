import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useState, useEffect, Suspense, lazy } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { AuthProvider, useAuth } from './context/AuthContext'
import SteamConnectModal from './components/SteamConnectModal'
import TermsAcceptanceModal from './components/TermsAcceptanceModal'
import AdminImpersonationBanner from './components/admin/AdminImpersonationBanner'
import CookieConsent from './components/CookieConsent'
import { Loader2 } from 'lucide-react'

// Lazy Load Pages
const LandingPage = lazy(() => import('./pages/LandingPage'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const Tournaments = lazy(() => import('./pages/Tournaments'))
const TournamentPage = lazy(() => import('./pages/TournamentPage'))
const TournamentMatchPage = lazy(() => import('./pages/TournamentMatchPage'))
const CreateTournamentPage = lazy(() => import('./pages/CreateTournamentPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const RulesPage = lazy(() => import('./pages/RulesPage'))
const HelpPage = lazy(() => import('./pages/HelpPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const BlockedPage = lazy(() => import('./pages/BlockedPage'))
const PlayersPage = lazy(() => import('./pages/PlayersPage'))
const Lobbies = lazy(() => import('./pages/Lobbies'))
const LobbyPage = lazy(() => import('./pages/LobbyPage'))
const CreateLobbyPage = lazy(() => import('./pages/CreateLobbyPage'))
const Teams = lazy(() => import('./pages/Teams'))
const TeamPage = lazy(() => import('./pages/TeamPage'))
const CreateTeamPage = lazy(() => import('./pages/CreateTeamPage'))
const MatchesPage = lazy(() => import('./pages/MatchesPage'))

const TournamentInfo = lazy(() => import('./components/tournaments/tabs/TournamentInfo'))
const TournamentRules = lazy(() => import('./components/tournaments/tabs/TournamentRules'))
const TournamentMaps = lazy(() => import('./components/tournaments/tabs/TournamentMaps'))
const TournamentTeams = lazy(() => import('./components/tournaments/tabs/TournamentTeams'))
const TournamentBracketPage = lazy(() => import('./components/tournaments/tabs/TournamentBracketPage'))
const TournamentMatches = lazy(() => import('./components/tournaments/tabs/TournamentMatches'))
const TournamentPrize = lazy(() => import('./components/tournaments/tabs/TournamentPrize'))

// Lazy Load Profile Components
const ProfileWall = lazy(() => import('./components/profile/ProfileWall'))
const ProfileFriends = lazy(() => import('./components/profile/ProfileFriends'))
const ProfileTeams = lazy(() => import('./components/profile/ProfileTeams'))
const ProfileMatches = lazy(() => import('./components/profile/ProfileMatches'))
const ProfileTournaments = lazy(() => import('./components/profile/ProfileTournaments'))
const ProfileSettings = lazy(() => import('./components/profile/ProfileSettings'))

// Loading Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-neutral-900">
    <Loader2 className="w-10 h-10 text-cs-orange animate-spin" />
  </div>
)

// Telegram OAuth callback component
const TelegramAuthCallback = () => {
  // This will be handled by AuthContext useEffect
  return <div>Обработка авторизации...</div>
}

const RedirectToUser = () => {
  const { identifier } = useParams()
  return <Navigate to={`/user/${identifier}`} replace />
}

const AppContent = () => {
  const { user, isAuthenticated } = useAuth()
  const [showSteamModal, setShowSteamModal] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user && !user.steam_id) {
      const dismissed = sessionStorage.getItem('steam_modal_dismissed');
      if (!dismissed) {
        setShowSteamModal(true);
      }
    } else {
      setShowSteamModal(false);
    }
  }, [isAuthenticated, user]);

  const closeSteamModal = () => {
    setShowSteamModal(false);
    sessionStorage.setItem('steam_modal_dismissed', 'true');
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route path="/profile" element={<UserProfile />}>
              <Route index element={<ProfileWall />} />
              <Route path="friends" element={<ProfileFriends />} />
              <Route path="teams" element={<ProfileTeams />} />
              <Route path="matches" element={<ProfileMatches />} />
              <Route path="tournaments" element={<ProfileTournaments />} />
              <Route path="settings" element={<ProfileSettings />} />
            </Route>

            <Route path="/user/:identifier" element={<UserProfile publicView={true} />}>
              <Route index element={<ProfileWall />} />
              <Route path="friends" element={<ProfileFriends />} />
              <Route path="teams" element={<ProfileTeams />} />
              <Route path="matches" element={<ProfileMatches />} />
              <Route path="tournaments" element={<ProfileTournaments />} />
              <Route path="settings" element={<ProfileSettings />} />
            </Route>

            <Route path="/u/:identifier" element={<RedirectToUser />} />

            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournaments/create" element={<CreateTournamentPage />} />
            <Route path="/tournaments/:id" element={<TournamentPage />}>
              <Route index element={<Navigate to="info" replace />} />
              <Route path="info" element={<TournamentInfo />} />
              <Route path="rules" element={<TournamentRules />} />
              <Route path="maps" element={<TournamentMaps />} />
              <Route path="teams" element={<TournamentTeams />} />
              <Route path="bracket" element={<TournamentBracketPage />} />
              <Route path="matches" element={<TournamentMatches />} />
              <Route path="prize" element={<TournamentPrize />} />
            </Route>
            <Route path="/tournaments/:id/match/:matchId" element={<TournamentMatchPage />} />
            <Route path="/lobbies" element={<Lobbies />} />
            <Route path="/lobbies/create" element={<CreateLobbyPage />} />
            <Route path="/lobbies/:id" element={<LobbyPage />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/create" element={<CreateTeamPage />} />
            <Route path="/teams/:id" element={<TeamPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/auth/telegram" element={<TelegramAuthCallback />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/blocked" element={<BlockedPage />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
      <CookieConsent />
      <AdminImpersonationBanner />
      <SteamConnectModal isOpen={showSteamModal} onClose={closeSteamModal} />
      <TermsAcceptanceModal />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
