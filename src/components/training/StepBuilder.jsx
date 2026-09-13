import { Trash2 } from 'lucide-react'
import { DRILL_ACTION } from '../../utils/constants'
import { createDrillStep } from '../../utils/dataModels'
import {
  DRILL_ACTION_OPTIONS,
  DRILL_ACTOR_OPTIONS,
  getDrillActionLabel,
} from '../../utils/labels'
import { formatZoneLabel } from '../../utils/tableZones'
import TableZoneMap from '../common/TableZoneMap'
import { SelectField, TextField } from '../common/FormField'

function formatStepLine(step) {
  const action = step.label || getDrillActionLabel(step.action)
  const zone = step.zoneId ? formatZoneLabel(step.zoneId) : 'sin zona'
  return `${step.actor} · ${action} · ${zone}`
}

export default function StepBuilder({ steps, draft, onDraftChange, onAdd, onRemove }) {
  function handleDraftField(event) {
    const { name, value } = event.target
    onDraftChange({ ...draft, [name]: value })
  }

  function handleZoneChange(nextIds) {
    const nextZoneId = nextIds.find((zoneId) => zoneId !== draft.zoneId) ?? ''
    onDraftChange({ ...draft, zoneId: nextZoneId })
  }

  function handleAdd() {
    onAdd(
      createDrillStep({
        actor: draft.actor,
        action: draft.action,
        zoneId: draft.action === DRILL_ACTION.FREE ? '' : draft.zoneId,
        label: draft.label.trim(),
      }),
    )
    onDraftChange({ ...draft, zoneId: '', label: '' })
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-300">Pasos A / B</p>
      {steps.length > 0 ? (
        <ul className="space-y-2">
          {steps.map((step, index) => (
            <li
              key={`${step.actor}-${step.action}-${step.zoneId}-${index}`}
              className="flex items-center gap-2 rounded-xl bg-slate-700 px-3 py-2"
            >
              <p className="flex-1 text-sm text-white">{formatStepLine(step)}</p>
              <button
                type="button"
                onClick={() => onRemove(index)}
                aria-label={`Quitar paso ${index + 1}`}
                className="flex min-h-10 min-w-10 items-center justify-center text-red-300"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400">
          Tocá una zona, elegí quién pega y agregá el paso.
        </p>
      )}

      <SelectField
        label="Quién"
        name="actor"
        value={draft.actor}
        onChange={handleDraftField}
        options={DRILL_ACTOR_OPTIONS}
      />
      <SelectField
        label="Acción"
        name="action"
        value={draft.action}
        onChange={handleDraftField}
        options={DRILL_ACTION_OPTIONS}
      />
      <TextField
        label="Nota del paso"
        name="label"
        value={draft.label}
        onChange={handleDraftField}
        placeholder="Saque corto"
        autoComplete="off"
      />
      {draft.action === DRILL_ACTION.FREE ? null : (
        <TableZoneMap
          selectedIds={draft.zoneId ? [draft.zoneId] : []}
          onChange={handleZoneChange}
          title="Zona de la pelota"
          description="Tocá dónde cae o se juega la pelota."
          opponentLabel="B"
          ownLabel="A"
        />
      )}
      <button
        type="button"
        onClick={handleAdd}
        className="min-h-12 w-full rounded-xl bg-slate-700 text-sm font-medium text-white"
      >
        Agregar paso
      </button>
    </div>
  )
}
