import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { MATCH_RESULT } from '../../utils/constants'
import {
  formatMatchDate,
  formatScore,
  getMatchTitle,
  getResultClassName,
  getResultLabel,
  hasFilledFields,
  isCoachedMatch,
} from '../../utils/matches'
import { hasSelectedZones } from '../../utils/tableZones'
import TableZoneMap from '../common/TableZoneMap'

function DetailBlock({ title, fields }) {
  const visibleFields = fields.filter((field) => field.value)

  if (visibleFields.length === 0) {
    return null
  }

  return (
    <section className="space-y-3 rounded-2xl bg-slate-800 px-4 py-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h3>
      {visibleFields.map((field) => (
        <div key={field.label}>
          <p className="text-sm text-slate-400">{field.label}</p>
          <p className="mt-1 whitespace-pre-line text-sm text-white">
            {field.value}
          </p>
        </div>
      ))}
    </section>
  )
}

export default function MatchDetail({
  match,
  rival,
  teammate,
  tournament,
  onEdit,
  onDelete,
}) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const score = match.score || formatScore(match.sets)
  const resultLabel = getResultLabel(match.result)
  const resultClassName = getResultClassName(match.result)
  const isCoaching = isCoachedMatch(match)
  const title = getMatchTitle(match, rival, teammate)
  const setsWithNotes = Array.isArray(match.sets)
    ? match.sets.filter(
        (set) => set.playerScore > 0 || set.opponentScore > 0 || set.notes,
      )
    : []

  return (
    <div className="space-y-4 pb-6">
      <section className="rounded-2xl bg-slate-800 px-4 py-4">
        {isCoaching ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Coucheo
          </p>
        ) : null}
        <p className="mt-1 text-xl font-semibold text-white">{title}</p>
        {isCoaching && rival?.name ? (
          <p className="mt-1 text-sm text-slate-300">vs {rival.name}</p>
        ) : null}
        <p className={`mt-2 text-base font-semibold ${resultClassName}`}>
          {resultLabel}
        </p>
        <p className="mt-1 text-sm text-slate-300">
          {formatMatchDate(match.date)}
          {tournament?.name ? ` · ${tournament.name}` : ''}
        </p>
        {score ? (
          <p className="mt-3 text-lg font-semibold text-white">{score}</p>
        ) : null}
        {match.result === MATCH_RESULT.UNKNOWN && !score ? (
          <p className="mt-3 text-sm text-slate-400">Todavía no hay sets.</p>
        ) : null}
      </section>

      {setsWithNotes.length > 0 ? (
        <section className="space-y-3 rounded-2xl bg-slate-800 px-4 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Sets
          </h3>
          {setsWithNotes.map((set, index) => (
            <div key={`detail-set-${index}`}>
              <p className="text-sm font-medium text-white">
                Set {index + 1} · {set.playerScore}-{set.opponentScore}
              </p>
              {set.notes ? (
                <p className="mt-1 text-sm text-slate-300">{set.notes}</p>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {match.notes ? (
        <section className="rounded-2xl bg-slate-800 px-4 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Notas
          </h3>
          <p className="mt-2 whitespace-pre-line text-sm text-white">
            {match.notes}
          </p>
        </section>
      ) : null}

      {hasFilledFields(match.preMatchStrategy) ? (
        <>
          {hasSelectedZones(match.preMatchStrategy.targetZones) ? (
            <TableZoneMap
              selectedIds={match.preMatchStrategy.targetZones}
              readOnly
            />
          ) : null}
          <DetailBlock
            title={isCoaching ? 'Plan para el compañero' : 'Pre-partido'}
            fields={[
              { label: 'Saques', value: match.preMatchStrategy.serves },
              { label: 'Recepción', value: match.preMatchStrategy.receive },
              {
                label: 'Efectos y ritmo',
                value: match.preMatchStrategy.effectsAndRhythm,
              },
              {
                label: 'Ubicación',
                value: match.preMatchStrategy.tablePlacement,
              },
              { label: 'Zonas', value: match.preMatchStrategy.targetAreas },
              { label: 'Hacer', value: match.preMatchStrategy.thingsToDo },
              { label: 'Evitar', value: match.preMatchStrategy.thingsToAvoid },
              { label: 'Objetivo', value: match.preMatchStrategy.mainObjective },
            ]}
          />
        </>
      ) : null}

      {hasFilledFields(match.duringMatchNotes) ? (
        <DetailBlock
          title="Durante"
          fields={[
            {
              label: 'Qué está funcionando',
              value: match.duringMatchNotes.whatIsWorking,
            },
            {
              label: 'Qué cambiar',
              value: match.duringMatchNotes.whatToChange,
            },
            { label: 'Notas', value: match.duringMatchNotes.notes },
          ]}
        />
      ) : null}

      {hasFilledFields(match.postMatchAnalysis) ? (
        <DetailBlock
          title={isCoaching ? 'Devolución' : 'Post-partido'}
          fields={[
            {
              label: isCoaching ? 'Qué le funcionó' : 'Qué funcionó',
              value: match.postMatchAnalysis.whatWorked,
            },
            {
              label: isCoaching ? 'Qué no le funcionó' : 'Qué no funcionó',
              value: match.postMatchAnalysis.whatDidNotWork,
            },
            {
              label: isCoaching ? 'Errores que tuvo' : 'Mis errores',
              value: match.postMatchAnalysis.myMistakes,
            },
            {
              label: isCoaching ? 'Qué decirle' : 'Para el próximo',
              value: match.postMatchAnalysis.advice,
            },
            {
              label: 'Debilidades del rival',
              value: isCoaching
                ? ''
                : match.postMatchAnalysis.opponentWeaknessesDiscovered,
            },
            { label: 'Notas', value: match.postMatchAnalysis.notes },
          ]}
        />
      ) : null}

      <button
        type="button"
        onClick={onEdit}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 text-base font-semibold text-white"
      >
        <Pencil className="h-5 w-5" aria-hidden="true" />
        {isCoaching ? 'Editar coucheo' : 'Editar partido'}
      </button>

      {isConfirmingDelete ? (
        <div className="rounded-2xl bg-slate-800 px-4 py-4">
          <p className="text-sm text-slate-300">
            ¿Eliminar este registro? Esta acción no se puede deshacer.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(false)}
              className="min-h-12 rounded-xl bg-slate-700 font-medium text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="min-h-12 rounded-xl bg-red-500 font-medium text-white"
            >
              Eliminar
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
          Eliminar
        </button>
      )}
    </div>
  )
}
