import { Trash2 } from 'lucide-react'
import { TRAINING_DRILL_KIND_OPTIONS } from '../../utils/labels'
import { SelectField, TextAreaField, TextField } from '../common/FormField'
import StepBuilder from './StepBuilder'

export default function DrillEditor({
  drill,
  draft,
  onChange,
  onDraftChange,
  onAddStep,
  onRemoveStep,
  onRemove,
}) {
  function handleChange(event) {
    const { name, value } = event.target
    onChange({ ...drill, [name]: value })
  }

  return (
    <article className="space-y-4 rounded-2xl bg-slate-800 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Ejercicio
        </p>
        <button
          type="button"
          onClick={onRemove}
          className="flex min-h-10 items-center gap-1 text-sm font-medium text-red-300"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Quitar
        </button>
      </div>
      <TextField
        label="Nombre"
        name="title"
        value={drill.title}
        onChange={handleChange}
        placeholder="Libre de drive al revés"
        autoComplete="off"
      />
      <SelectField
        label="Tipo"
        name="kind"
        value={drill.kind}
        onChange={handleChange}
        options={TRAINING_DRILL_KIND_OPTIONS}
      />
      <TextField
        label="Duración"
        name="durationLabel"
        value={drill.durationLabel}
        onChange={handleChange}
        placeholder="8 min"
        autoComplete="off"
      />
      <TextAreaField
        label="Cómo se hace"
        name="description"
        value={drill.description}
        onChange={handleChange}
        placeholder="A ataca de drive al revés del bloqueador."
      />
      <StepBuilder
        steps={drill.steps}
        draft={draft}
        onDraftChange={onDraftChange}
        onAdd={onAddStep}
        onRemove={onRemoveStep}
      />
    </article>
  )
}
