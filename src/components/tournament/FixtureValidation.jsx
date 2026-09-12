import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { createFixtureMatch } from '../../utils/dataModels'
import { getPlayerGroup, namesMatch } from '../../utils/tournaments'
import { CONTROL_CLASS, TextField } from '../common/FormField'

function getInitialRows(tournament) {
  if (Array.isArray(tournament.fixture) && tournament.fixture.length > 0) {
    return tournament.fixture.map((match) => createFixtureMatch(match))
  }

  return [createFixtureMatch({ group: '' })]
}

export default function FixtureValidation({
  tournament,
  onConfirm,
  onOpenRanking,
  onBackToPdfs,
}) {
  const rankingEntry = (tournament.ranking ?? []).find((entry) =>
    namesMatch(entry.name, tournament.playerName),
  )
  const detectedGroup = getPlayerGroup(
    tournament.groups,
    tournament.playerName,
    rankingEntry?.category,
  )
  const [rows, setRows] = useState(() => getInitialRows(tournament))
  const [formError, setFormError] = useState('')

  function updateRow(id, field, value) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
  }

  function addRow() {
    setRows((current) => [
      ...current,
      createFixtureMatch({
        group: current[0]?.group || detectedGroup?.name || '',
      }),
    ])
  }

  function removeRow(id) {
    setRows((current) =>
      current.length === 1 ? current : current.filter((row) => row.id !== id),
    )
  }

  function handleConfirm() {
    const cleaned = rows
      .map((row) => ({
        ...row,
        opponent: row.opponent.trim(),
        time: row.time.trim(),
        table: row.table.trim(),
        group: row.group.trim(),
      }))
      .filter((row) => row.opponent)

    if (cleaned.length === 0) {
      setFormError('Agregá al menos un rival antes de confirmar.')
      return
    }

    setFormError('')
    onConfirm(cleaned)
  }

  return (
    <div className="space-y-4 pb-6">
      <section className="rounded-2xl bg-slate-800 px-4 py-4">
        <p className="text-sm text-slate-400">Jugador</p>
        <p className="mt-1 text-lg font-semibold text-white">
          {tournament.playerName}
        </p>
        {detectedGroup ? (
          <>
            <p className="mt-3 text-sm font-semibold text-white">{detectedGroup.name}</p>
            <p className="mt-1 text-sm text-slate-300">
              {detectedGroup.players.map((player) => player.name).join(' · ')}
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-slate-300">
            No se detectó un grupo. Completá los partidos a mano.
          </p>
        )}
      </section>

      {tournament.parseWarnings?.length > 0 ? (
        <section className="rounded-2xl bg-amber-950/60 px-4 py-4">
          <p className="text-sm font-semibold text-amber-200">Revisá estos puntos</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-100">
            {tournament.parseWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {rows.map((row, index) => (
        <section key={row.id} className="space-y-3 rounded-2xl bg-slate-800 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Partido {index + 1}
            </p>
            <button
              type="button"
              onClick={() => removeRow(row.id)}
              aria-label="Quitar partido"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-slate-700 text-slate-300"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <TextField
            label="Rival"
            value={row.opponent}
            onChange={(event) => updateRow(row.id, 'opponent', event.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Hora
              </span>
              <input
                className={CONTROL_CLASS}
                value={row.time}
                placeholder="08:30"
                onChange={(event) => updateRow(row.id, 'time', event.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Mesa
              </span>
              <input
                className={CONTROL_CLASS}
                value={row.table}
                placeholder="4"
                onChange={(event) => updateRow(row.id, 'table', event.target.value)}
              />
            </label>
          </div>
        </section>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-800 text-sm font-medium text-white"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Agregar partido
      </button>

      {formError ? <p className="text-sm text-red-400">{formError}</p> : null}

      <button
        type="button"
        onClick={handleConfirm}
        className="min-h-14 w-full rounded-2xl bg-white text-base font-semibold text-slate-900"
      >
        Confirmar fixture
      </button>
      {tournament.ranking?.length > 0 ? (
        <button
          type="button"
          onClick={onOpenRanking}
          className="min-h-12 w-full text-sm font-medium text-slate-300"
        >
          Ver ranking
        </button>
      ) : null}
      <button
        type="button"
        onClick={onBackToPdfs}
        className="min-h-12 w-full text-sm font-medium text-slate-300"
      >
        Volver a los PDFs
      </button>
    </div>
  )
}
