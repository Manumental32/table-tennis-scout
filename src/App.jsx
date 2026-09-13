import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import AuthForm from './components/auth/AuthForm'
import AppShell from './components/common/AppShell'
import { VIEWS } from './components/common/navigation'
import PlayerProfileForm from './components/player/PlayerProfileForm'
import { useAuth } from './hooks/useAuth'
import { useBackFallback, useLockHardwareBack } from './hooks/useBackNavigation'
import { usePlayerProfile } from './hooks/usePlayerProfile'
import { useTournament } from './hooks/useTournament'
import DashboardPage from './pages/DashboardPage'
import MatchesPage from './pages/MatchesPage'
import RivalsPage from './pages/RivalsPage'
import TournamentPage from './pages/TournamentPage'
import TrainingsPage from './pages/TrainingsPage'
import { getRemoteConfigError } from './services/supabase/client'
import { suggestPlayerProfile } from './utils/player'

const PAGES = {
  [VIEWS.DASHBOARD]: DashboardPage,
  [VIEWS.RIVALS]: RivalsPage,
  [VIEWS.MATCHES]: MatchesPage,
  [VIEWS.TOURNAMENT]: TournamentPage,
  [VIEWS.TRAININGS]: TrainingsPage,
}

function AppContent() {
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD)
  const { saveProfile, hasProfile } = usePlayerProfile()
  const { tournaments } = useTournament()
  const Page = PAGES[currentView] ?? DashboardPage
  const goHome = useCallback(() => {
    setCurrentView(VIEWS.DASHBOARD)
  }, [])

  useBackFallback(goHome)

  if (!hasProfile) {
    const suggestedProfile = suggestPlayerProfile(tournaments)

    return (
      <AppShell currentView={currentView} title="¿Quién sos?" showNav={false}>
        <PlayerProfileForm
          profile={suggestedProfile}
          description="Así el ranking te muestra tu posición y el torneo arma el fixture con tus rivales y mesas."
          submitLabel="Empezar"
          onSubmit={saveProfile}
        />
      </AppShell>
    )
  }

  return (
    <AppShell currentView={currentView} onNavigate={setCurrentView}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          <Page onNavigate={setCurrentView} />
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}

export default function App() {
  const auth = useAuth()
  useLockHardwareBack()

  if (!auth.ready) {
    return (
      <AppShell title="Scout TT" showNav={false}>
        <p className="text-sm text-slate-300">Cargando…</p>
      </AppShell>
    )
  }

  if (auth.enabled && !auth.session) {
    return (
      <AppShell title="Tu cuenta" showNav={false}>
        <AuthForm
          onSignIn={auth.signIn}
          onSignUp={auth.signUp}
          onEnterLocal={auth.enterLocalDev}
          allowLocalDev={auth.canSkipLocal}
          configError={getRemoteConfigError()}
        />
      </AppShell>
    )
  }

  if (auth.enabled && !auth.hydrated) {
    return (
      <AppShell title="Scout TT" showNav={false}>
        {auth.hydrateError ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-slate-300">
              {auth.hydrateError}
            </p>
            <button
              type="button"
              onClick={() => {
                void auth.retryHydrate()
              }}
              className="min-h-14 w-full rounded-2xl bg-white text-base font-semibold text-slate-900"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={auth.skipHydrate}
              className="min-h-12 w-full rounded-xl bg-slate-800 text-sm font-medium text-white"
            >
              Seguir en este dispositivo
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-300">Sincronizando tu historial…</p>
        )}
      </AppShell>
    )
  }

  return <AppContent />
}
