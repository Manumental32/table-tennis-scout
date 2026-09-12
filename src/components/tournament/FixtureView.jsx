import { useState } from 'react'
import { Pencil, Trash2, Trophy } from 'lucide-react'
import { ANALYSIS_SECTION } from '../../utils/constants'
import { hasFilledFields } from '../../utils/matches'
import {
  formatFixtureLine,
  formatTournamentDate,
  getPlayerGroup,
} from '../../utils/tournaments'

const ANALYSIS_ACTIONS = [
  { id: ANALYSIS_SECTION.PRE, label: 'Pre' },
  { id: ANALYSIS_SECTION.DURING, label: 'Durante' },
  { id: ANALYSIS_SECTION.POST, label: 'Post' },
]

function getSectionValues(match, section) {
  if (!match) {
    return null
  }

  if (section === ANALYSIS_SECTION.DURING) {
    return match.duringMatchNotes
  }

  if (section === ANALYSIS_SECTION.POST) {
    return match.postMatchAnalysis
  }

  return match.preMatchStrategy
}

export default function FixtureView({
  tournament,
  getMatchForFixture,
  onOpenAnalysis,
  onOpenRanking,
  onEditFixture,
  onEditTournament,
  onDelete,
}) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const group = getPlayerGroup(tournament.groups, tournament.playerName)
  const groupName = tournament.fixture[0]?.group || group?.name || ''

  return (
    <div className="space-y-4 pb-6">
      <section className="rounded-2xl bg-slate-800 px-4 py-4">
        <p className="text-xl font-semibold text-white">{tournament.name}</p>
        <p className="mt-1 text-sm text-slate-300">
          {[formatTournamentDate(tournament.date), tournament.category]
            .filter(Boolean)
            .join(' · ') || 'Sin fecha ni categoría'}
        </p>
        <p className="mt-3 text-sm text-slate-400">Jugador</p>
        <p className="mt-1 text-base font-semibold text-white">
          {tournament.playerName}
        </p>
        {groupName ? (
          <p className="mt-2 text-sm font-semibold text-white">{groupName}</p>
        ) : null}
      </section>

      <section className="space-y-3">
        {tournament.fixture.map((fixtureMatch) => {
          const linkedMatch = getMatchForFixture?.(fixtureMatch) ?? null

          return (
            <article key={fixtureMatch.id} className="rounded-2xl bg-slate-800 px-4 py-4">
              <p className="text-base font-semibold text-white">
                {formatFixtureLine(fixtureMatch)}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {ANALYSIS_ACTIONS.map((action) => {
                  const isFilled = hasFilledFields(
                    getSectionValues(linkedMatch, action.id),
                  )

                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => onOpenAnalysis(fixtureMatch.id, action.id)}
                      className={`min-h-12 rounded-xl text-sm font-semibold ${
                        isFilled
                          ? 'bg-white text-slate-900'
                          : 'bg-slate-700 text-white'
                      }`}
                    >
                      {action.label}
                    </button>
                  )
                })}
              </div>
            </article>
          )
        })}
      </section>

      {tournament.ranking?.length > 0 ? (
        <button
          type="button"
          onClick={onOpenRanking}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 text-base font-semibold text-white"
        >
          <Trophy className="h-5 w-5" aria-hidden="true" />
          Ver ranking
        </button>
      ) : null}

      <button
        type="button"
        onClick={onEditFixture}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-base font-semibold text-slate-900"
      >
        <Pencil className="h-5 w-5" aria-hidden="true" />
        Corregir fixture
      </button>
      <button
        type="button"
        onClick={onEditTournament}
        className="min-h-14 w-full rounded-2xl bg-slate-800 text-base font-semibold text-white"
      >
        Editar torneo
      </button>

      {isConfirmingDelete ? (
        <div className="space-y-3 rounded-2xl bg-slate-800 px-4 py-4">
          <p className="text-sm text-slate-300">¿Borrar este torneo?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(false)}
              className="min-h-12 rounded-xl bg-slate-700 text-sm font-medium text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="min-h-12 rounded-xl bg-red-500 text-sm font-semibold text-white"
            >
              Borrar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsConfirmingDelete(true)}
          className="flex min-h-12 w-full items-center justify-center gap-2 text-sm font-medium text-red-400"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Eliminar torneo
        </button>
      )}
    </div>
  )
}
