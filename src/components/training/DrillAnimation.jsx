import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'
import { DRILL_ACTOR } from '../../utils/constants'
import { getDrillActionLabel } from '../../utils/labels'
import {
  getZoneStrokeLabel,
  parseZoneId,
} from '../../utils/tableZones'
import { getDrillZoneIds } from '../../utils/trainingZones'
import TableZoneMap from '../common/TableZoneMap'

const STEP_MS = 1600

export default function DrillAnimation({ drill }) {
  const steps = drill.steps
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(steps.length > 1)
  const step = steps[stepIndex]
  const zoneIds = getDrillZoneIds(steps)
  const isLastStep = stepIndex >= steps.length - 1
  const showPlaying = isPlaying && !isLastStep
  const strokeLabel = step?.zoneId ? getZoneStrokeLabel(step.zoneId) : ''
  const hasZone = Boolean(parseZoneId(step?.zoneId))

  useEffect(() => {
    if (!isPlaying || steps.length === 0 || isLastStep) {
      return undefined
    }

    const timerId = window.setTimeout(() => {
      const nextIndex = stepIndex + 1
      setStepIndex(nextIndex)

      if (nextIndex >= steps.length - 1) {
        setIsPlaying(false)
      }
    }, STEP_MS)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [isLastStep, isPlaying, stepIndex, steps.length])

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

  function handlePlayToggle() {
    if (showPlaying) {
      setIsPlaying(false)
      return
    }

    if (isLastStep) {
      setStepIndex(0)
    }

    setIsPlaying(true)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-slate-300">{drill.description}</p>
      <p className="text-xs leading-relaxed text-slate-400">
        A abajo · B arriba. En diestros, el revés queda a la izquierda de cada
        jugador y el drive a la derecha.
      </p>

      <TableZoneMap
        selectedIds={zoneIds}
        activeZoneId={hasZone ? step.zoneId : ''}
        ballLabel={String(stepIndex + 1)}
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
        {strokeLabel ? (
          <p
            className={`mt-1 text-sm font-semibold ${
              strokeLabel === 'Revés'
                ? 'text-sky-300'
                : strokeLabel === 'Drive'
                  ? 'text-amber-300'
                  : 'text-slate-300'
            }`}
          >
            {strokeLabel}
          </p>
        ) : null}
        <p className="mt-1 text-sm text-slate-400">
          {isLastStep && !showPlaying
            ? `Paso ${stepIndex + 1} de ${steps.length} · Fin`
            : `${stepIndex + 1} / ${steps.length}`}
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
          onClick={handlePlayToggle}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-slate-900"
        >
          {showPlaying ? (
            <Pause className="h-4 w-4" aria-hidden="true" />
          ) : isLastStep ? (
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Play className="h-4 w-4" aria-hidden="true" />
          )}
          {showPlaying ? 'Pausa' : isLastStep ? 'Repetir' : 'Play'}
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
