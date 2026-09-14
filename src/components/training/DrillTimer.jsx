import { useEffect, useRef, useState } from 'react'
import { Minus, Pause, Play, Plus, RotateCcw } from 'lucide-react'
import {
  TIMER_DURATION_PRESETS,
  TIMER_SECOND_STEP,
  clampTimerDuration,
  clampTimerMinutes,
  clampTimerPartSeconds,
  durationToParts,
  formatCountdown,
  formatDurationPreset,
  partsToDuration,
  playTimerAlarm,
  playTimerTick,
  unlockTimerAudio,
} from '../../utils/timer'

function getDigitInput(value, clamp) {
  const digits = String(value).replace(/\D/g, '').slice(0, 2)

  if (!digits) {
    return ''
  }

  return String(clamp(digits))
}

function DurationField({ label, value, disabled, onStep, onChange, stepDownLabel, stepUpLabel }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
      <span className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onStep(-1)}
          disabled={disabled}
          aria-label={stepDownLabel}
          className="flex min-h-12 min-w-10 items-center justify-center rounded-xl bg-slate-700 text-white disabled:opacity-40"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          autoComplete="off"
          enterKeyHint="done"
          disabled={disabled}
          value={value}
          onChange={onChange}
          onFocus={(event) => event.target.select()}
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 text-center text-xl font-semibold text-white outline-none focus:border-slate-500 disabled:opacity-40"
        />
        <button
          type="button"
          onClick={onStep(1)}
          disabled={disabled}
          aria-label={stepUpLabel}
          className="flex min-h-12 min-w-10 items-center justify-center rounded-xl bg-slate-700 text-white disabled:opacity-40"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </span>
    </label>
  )
}

export default function DrillTimer({ defaultSeconds }) {
  const initialSeconds = clampTimerDuration(defaultSeconds)
  const initialParts = durationToParts(initialSeconds)
  const [minutesInput, setMinutesInput] = useState(String(initialParts.minutes))
  const [secondsInput, setSecondsInput] = useState(String(initialParts.seconds))
  const [remainingMs, setRemainingMs] = useState(initialSeconds * 1000)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const endAtRef = useRef(null)
  const lastTickSecondRef = useRef(null)
  const wakeLockRef = useRef(null)

  const durationSeconds = partsToDuration(
    minutesInput || initialParts.minutes,
    secondsInput || initialParts.seconds,
  )
  const remainingSeconds = Math.ceil(remainingMs / 1000)
  const canEdit = !isRunning

  useEffect(() => {
    if (!isRunning || endAtRef.current === null) {
      return undefined
    }

    function tick() {
      const left = Math.max(0, endAtRef.current - Date.now())
      setRemainingMs(left)

      if (left === 0) {
        setIsRunning(false)
        setIsFinished(true)
        endAtRef.current = null
        playTimerAlarm()
        return
      }

      if (left <= 5000) {
        const second = Math.ceil(left / 1000)

        if (lastTickSecondRef.current !== second) {
          lastTickSecondRef.current = second
          playTimerTick()
        }
      }
    }

    tick()
    const timerId = window.setInterval(tick, 200)

    return () => {
      window.clearInterval(timerId)
    }
  }, [isRunning])

  useEffect(() => {
    if (!isRunning) {
      void wakeLockRef.current?.release()
      wakeLockRef.current = null
      return undefined
    }

    let cancelled = false

    async function requestLock() {
      if (!('wakeLock' in navigator)) {
        return
      }

      try {
        const sentinel = await navigator.wakeLock.request('screen')

        if (cancelled) {
          void sentinel.release()
          return
        }

        wakeLockRef.current = sentinel
      } catch {
        wakeLockRef.current = null
      }
    }

    void requestLock()

    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        void requestLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisibility)
      void wakeLockRef.current?.release()
      wakeLockRef.current = null
    }
  }, [isRunning])

  function applyDuration(nextSeconds) {
    const safeSeconds = clampTimerDuration(nextSeconds)
    const parts = durationToParts(safeSeconds)
    setMinutesInput(String(parts.minutes))
    setSecondsInput(String(parts.seconds))
    setRemainingMs(safeSeconds * 1000)
    setIsFinished(false)
    endAtRef.current = null
    lastTickSecondRef.current = null
  }

  function stepMinutes(delta) {
    return () => {
      const parts = durationToParts(durationSeconds)
      applyDuration(partsToDuration(parts.minutes + delta, parts.seconds))
    }
  }

  function stepSeconds(delta) {
    return () => {
      applyDuration(durationSeconds + delta * TIMER_SECOND_STEP)
    }
  }

  function startTimer() {
    unlockTimerAudio()
    const nextDuration = partsToDuration(
      minutesInput || initialParts.minutes,
      secondsInput || initialParts.seconds,
    )
    const nextRemaining =
      remainingMs > 0 && !isFinished ? remainingMs : nextDuration * 1000

    applyDuration(nextDuration)
    setRemainingMs(nextRemaining)
    setIsFinished(false)
    endAtRef.current = Date.now() + nextRemaining
    lastTickSecondRef.current = null
    setIsRunning(true)
  }

  function pauseTimer() {
    setIsRunning(false)
    if (endAtRef.current !== null) {
      setRemainingMs(Math.max(0, endAtRef.current - Date.now()))
    }
    endAtRef.current = null
  }

  function resetTimer() {
    setIsRunning(false)
    applyDuration(durationSeconds)
  }

  const clockClass = isFinished
    ? 'text-5xl font-semibold tabular-nums text-emerald-400'
    : remainingSeconds <= 10 && (isRunning || remainingMs < durationSeconds * 1000)
      ? 'text-5xl font-semibold tabular-nums text-amber-400'
      : 'text-5xl font-semibold tabular-nums text-white'

  return (
    <section className="space-y-4 rounded-2xl bg-slate-800 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Timer
        </h3>
        <p className="text-sm text-slate-400">
          {isFinished ? 'Listo' : isRunning ? 'En curso' : 'MM:SS'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DurationField
          label="Minutos"
          value={minutesInput}
          disabled={!canEdit}
          onStep={stepMinutes}
          stepDownLabel="Bajar minutos"
          stepUpLabel="Subir minutos"
          onChange={(event) => {
            const nextValue = getDigitInput(event.target.value, clampTimerMinutes)
            setMinutesInput(nextValue)
            if (nextValue !== '') {
              applyDuration(partsToDuration(nextValue, secondsInput || 0))
            }
          }}
        />
        <DurationField
          label="Segundos"
          value={secondsInput}
          disabled={!canEdit}
          onStep={stepSeconds}
          stepDownLabel="Bajar 15 segundos"
          stepUpLabel="Subir 15 segundos"
          onChange={(event) => {
            const nextValue = getDigitInput(event.target.value, clampTimerPartSeconds)
            setSecondsInput(nextValue)
            if (nextValue !== '') {
              applyDuration(partsToDuration(minutesInput || 0, nextValue))
            }
          }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {TIMER_DURATION_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => applyDuration(preset)}
            disabled={!canEdit}
            className={
              durationSeconds === preset
                ? 'min-h-10 rounded-xl bg-white px-3 text-sm font-semibold text-slate-900 disabled:opacity-40'
                : 'min-h-10 rounded-xl bg-slate-700 px-3 text-sm font-medium text-white disabled:opacity-40'
            }
          >
            {formatDurationPreset(preset)}
          </button>
        ))}
      </div>

      <p className={`text-center ${clockClass}`} aria-live={isFinished ? 'assertive' : 'off'}>
        {formatCountdown(remainingSeconds)}
      </p>

      <div className="grid grid-cols-2 gap-2">
        {isRunning ? (
          <button
            type="button"
            onClick={pauseTimer}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-slate-900"
          >
            <Pause className="h-4 w-4" aria-hidden="true" />
            Pausa
          </button>
        ) : (
          <button
            type="button"
            onClick={startTimer}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-slate-900"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            {isFinished
              ? 'Otra vez'
              : remainingMs < durationSeconds * 1000
                ? 'Seguir'
                : 'Empezar'}
          </button>
        )}
        <button
          type="button"
          onClick={resetTimer}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-700 text-sm font-medium text-white"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reiniciar
        </button>
      </div>
    </section>
  )
}
