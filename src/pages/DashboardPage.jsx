import { EllipsisVertical, LayoutDashboard } from 'lucide-react'
import { useCallback, useState } from 'react'
import EmptyState from '../components/common/EmptyState'
import ScreenToolbar from '../components/common/ScreenToolbar'
import PlayerProfileForm from '../components/player/PlayerProfileForm'
import StatsView from '../components/stats/StatsView'
import { useAuth } from '../hooks/useAuth'
import { useBackHandler } from '../hooks/useBackNavigation'
import { useMatches } from '../hooks/useMatches'
import { usePlayerProfile } from '../hooks/usePlayerProfile'
import { useRivals } from '../hooks/useRivals'
import { useTeammates } from '../hooks/useTeammates'
import { useTournament } from '../hooks/useTournament'
import {
  formatFixtureLine,
  formatTournamentDate,
  getNextTournament,
} from '../utils/tournaments'

export default function DashboardPage() {
  const { enabled, session, signOut } = useAuth()
  const { profile, saveProfile } = usePlayerProfile()
  const { rivals, getRivalById } = useRivals()
  const { matches } = useMatches()
  const { teammates } = useTeammates()
  const { tournaments } = useTournament()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const handleHardwareBack = useCallback(() => {
    if (isEditingProfile) {
      setIsEditingProfile(false)
      return true
    }

    if (isAccountOpen) {
      setIsAccountOpen(false)
      return true
    }

    return false
  }, [isAccountOpen, isEditingProfile])

  useBackHandler(handleHardwareBack)
  const nextTournament = getNextTournament(tournaments)
  const hasActivity =
    rivals.length > 0 ||
    matches.length > 0 ||
    teammates.length > 0 ||
    tournaments.length > 0

  if (isEditingProfile) {
    return (
      <>
        <ScreenToolbar title="Tu perfil" onBack={() => setIsEditingProfile(false)} />
        <PlayerProfileForm
          profile={profile}
          description="Usamos este nombre para el ranking y para armar tu fixture."
          submitLabel="Guardar"
          onSubmit={(values) => {
            saveProfile(values)
            setIsEditingProfile(false)
          }}
        />
      </>
    )
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-slate-800 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-400">Hola</p>
            <div className="mt-1 flex items-baseline justify-between gap-3">
              <p className="truncate text-xl font-semibold text-white">
                {profile.name}
              </p>
              {profile.club ? (
                <p className="shrink-0 text-sm text-slate-300">({profile.club})</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAccountOpen((current) => !current)}
            aria-expanded={isAccountOpen}
            aria-label="Opciones de cuenta"
            className="flex min-h-10 min-w-10 items-center justify-center rounded-xl text-slate-400"
          >
            <EllipsisVertical className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {isAccountOpen ? (
          <div className="mt-3 space-y-1 border-t border-slate-700 pt-3">
            <button
              type="button"
              onClick={() => {
                setIsAccountOpen(false)
                setIsEditingProfile(true)
              }}
              className="min-h-10 w-full rounded-lg px-1 text-left text-sm text-slate-300"
            >
              Cambiar nombre o club
            </button>
            {enabled && session ? (
              <button
                type="button"
                onClick={() => {
                  setIsAccountOpen(false)
                  void signOut()
                }}
                className="min-h-10 w-full rounded-lg px-1 text-left text-sm text-slate-400"
              >
                {session.isDevSkip ? 'Salir de local' : 'Cerrar sesión'}
              </button>
            ) : null}
            {session?.isDevSkip ? (
              <p className="px-1 pt-1 text-xs leading-relaxed text-slate-500">
                Estás en local. Este dispositivo no sincroniza con la nube.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      {nextTournament ? (
        <section className="rounded-2xl bg-slate-800 px-4 py-4">
          <p className="text-sm text-slate-400">Próximo torneo</p>
          <p className="mt-1 text-lg font-semibold text-white">{nextTournament.name}</p>
          <p className="mt-1 text-sm text-slate-300">
            {[formatTournamentDate(nextTournament.date), nextTournament.category]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <div className="mt-3 space-y-2">
            {nextTournament.fixture.map((fixtureMatch) => (
              <p key={fixtureMatch.id} className="text-sm text-white">
                {formatFixtureLine(fixtureMatch)}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {hasActivity ? (
        <>
          <section className="grid grid-cols-3 gap-3">
            {[
              { label: 'Rivales', value: rivals.length },
              { label: 'Partidos', value: matches.length },
              { label: 'Torneos', value: tournaments.length },
            ].map((item) => (
              <article key={item.label} className="rounded-2xl bg-slate-800 px-3 py-4">
                <p className="text-xs text-slate-300">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
              </article>
            ))}
          </section>
          <StatsView
            matches={matches}
            rivals={rivals}
            tournaments={tournaments}
            getRivalById={getRivalById}
          />
        </>
      ) : (
        <EmptyState
          icon={LayoutDashboard}
          title="Listo para cargar"
          description="Creá un torneo y subí el ranking: te vamos a mostrar tu posición, tus rivales y quiénes de tu club juegan."
        />
      )}
    </div>
  )
}
