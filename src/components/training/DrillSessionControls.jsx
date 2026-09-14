import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { TRAINING_DRILL_KIND } from '../../utils/constants'

function getSlotLabel(slot) {
  if (!slot) {
    return ''
  }

  if (slot.kind === TRAINING_DRILL_KIND.CONTINUOUS) {
    return `Turno ${slot.turn} · Continuo ${slot.index} de ${slot.total}`
  }

  if (slot.kind === TRAINING_DRILL_KIND.SERVE) {
    return `Turno ${slot.turn} · Saque ${slot.index} de ${slot.total}`
  }

  return `Turno ${slot.turn}`
}

export default function DrillSessionControls({
  number,
  total,
  slot,
  isCompleted,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  onToggleComplete,
}) {
  return (
    <section className="space-y-3 rounded-2xl bg-slate-800 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">
          {number} / {total}
        </p>
        <p className="text-xs font-medium text-slate-400">
          {slot ? getSlotLabel(slot) : 'Calentamiento'}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggleComplete}
        className={
          isCompleted
            ? 'flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white'
            : 'flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-slate-900'
        }
      >
        <Check className="h-4 w-4" aria-hidden="true" />
        {isCompleted ? 'Hecho hoy' : 'Marcar hecho'}
      </button>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="flex min-h-12 items-center justify-center gap-1 rounded-xl bg-slate-700 text-sm font-medium text-white disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Anterior
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="flex min-h-12 items-center justify-center gap-1 rounded-xl bg-slate-700 text-sm font-medium text-white disabled:opacity-40"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
