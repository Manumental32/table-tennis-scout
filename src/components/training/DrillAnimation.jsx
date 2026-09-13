import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { DRILL_ACTOR } from '../../utils/constants'
import { getDrillActionLabel } from '../../utils/labels'
import { getDrillZoneIds } from '../../utils/trainingZones'
import TableZoneMap from '../common/TableZoneMap'

const STEP_MS = 1400

export default function DrillAnimation({ drill }) {
  const steps = drill.steps
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const step = steps[stepIndex]
  const zoneIds = getDrillZoneIds(steps)

  useEffect(() => {
    if (!isPlaying || steps.length === 0) {
      return undefined
    }

    const timerId = window.setInterval(() => {
      setStepIndex((current) => (current + 1) % steps.length)
    }, STEP_MS)

    return () => {
      window.clearInterval(timerId)
    }
  }, [isPlaying, steps.length])

  if (!step) {
    return (
      <p className="text-sm leading-relaxed text-slate-300">{drill.description}</p>
    )
  }

  const actorClass =
    step.actor === DRILL_ACTOR.B ? 'text-emerald-300' : 'text-sky-300'

  function goTo(nextIndex) {
    setIsPlaying(false)
    setStepIndex((nextIndex + steps.length) % steps.length)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-slate-300">{drill.description}</p>
      <p className="text-xs leading-relaxed text-slate-400">
        A abajo · B arriba. Zonas para diestros: izquierda es revés, derecha es
        drive.
      </p>

      <TableZoneMap
        selectedIds={zoneIds}
        activeZoneId={step.zoneId}
        readOnly
        forceVisible
        title=""
        opponentLabel="B"
        ownLabel="A"
      />

      <section className="rounded-2xl bg-slate-800 px-4 py-4">
        <p className={`text-sm font-semibold ${actorClass}`}>Jugador {step.actor}</p>
        <p className="mt-1 text-lg font-semibold text-white">
          {step.label || getDrillActionLabel(step.action)}
        </p>
        <p className="mt-1 text-sm text-slate-400">
          {stepIndex + 1} / {steps.length}
        </p>
      </section>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => goTo(stepIndex - 1)}
          className="flex min-h-12 items-center justify-center gap-1 rounded-xl bg-slate-800 text-sm font-medium text-white"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Anterior
        </button>
        <button
          type="button"
          onClick={() => setIsPlaying((current) => !current)}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-slate-900"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Play className="h-4 w-4" aria-hidden="true" />
          )}
          {isPlaying ? 'Pausa' : 'Play'}
        </button>
        <button
          type="button"
          onClick={() => goTo(stepIndex + 1)}
          className="flex min-h-12 items-center justify-center gap-1 rounded-xl bg-slate-800 text-sm font-medium text-white"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
