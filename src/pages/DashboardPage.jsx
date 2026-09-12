import { LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import EmptyState from '../components/common/EmptyState'
import PlayerProfileForm from '../components/player/PlayerProfileForm'
import StatsView from '../components/stats/StatsView'
import { useAuth } from '../hooks/useAuth'
import { useMatches } from '../hooks/useMatches'
import { usePlayerProfile } from '../hooks/usePlayerProfile'
import { useRivals } from '../hooks/useRivals'
import { useTeammates } from '../hooks/useTeammates'
import { useTournament } from '../hooks/useTournament'
import { TOURNAMENT_STATUS } from '../utils/constants'
import { formatFixtureLine, formatTournamentDate, sortTournaments } from '../utils/tournaments'

function getNextTournament(tournaments) {
  return (
    sortTournaments(tournaments).find(
      (tournament) =>
        tournament.status === TOURNAMENT_STATUS.CONFIRMED &&
        tournament.fixture?.length > 0,
    ) ?? null
  )
}

export default function DashboardPage() {
  const { enabled, session, signOut } = useAuth()
  const { profile, saveProfile } = usePlayerProfile()
  const { rivals, getRivalById } = useRivals()
  const { matches } = useMatches()
  const { teammates } = useTeammates()
  const { tournaments } = useTournament()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const nextTournament = getNextTournament(tournaments)
  const hasActivity =
    rivals.length > 0 ||
    matches.length > 0 ||
    teammates.length > 0 ||
    tournaments.length > 0

  if (isEditingProfile) {
    return (
      <PlayerProfileForm
        profile={profile}
        description="Usamos este nombre para el ranking y para armar tu fixture."
        submitLabel="Guardar"
        onSubmit={(values) => {
          saveProfile(values)
          setIsEditingProfile(false)
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-slate-800 px-4 py-4">
        <p className="text-sm text-slate-400">Hola</p>
        <p className="mt-1 text-xl font-semibold text-white">{profile.name}</p>
        {profile.club ? (
          <p className="mt-1 text-sm text-slate-300">{profile.club}</p>
        ) : null}
        <button
          type="button"
          onClick={() => setIsEditingProfile(true)}
          className="mt-4 min-h-12 w-full rounded-xl bg-slate-700 text-sm font-medium text-white"
        >
          Cambiar mi nombre o club
        </button>
        {enabled && session ? (
          <button
            type="button"
            onClick={() => {
              void signOut()
            }}
            className="mt-2 min-h-12 w-full rounded-xl bg-slate-700 text-sm font-medium text-slate-200"
          >
            Cerrar sesión
          </button>
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
