const MIN_MINUTES = 0
const MAX_MINUTES = 99
const MIN_SECONDS = 0
const MAX_SECONDS = 59
const DEFAULT_SECONDS = 8 * 60
const MIN_DURATION_SECONDS = 1
const MAX_DURATION_SECONDS = MAX_MINUTES * 60 + MAX_SECONDS

let audioContext = null

export function clampTimerMinutes(value) {
  const parsed = Number.parseInt(value, 10)

  if (Number.isNaN(parsed)) {
    return 0
  }

  return Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, parsed))
}

export function clampTimerPartSeconds(value) {
  const parsed = Number.parseInt(value, 10)

  if (Number.isNaN(parsed)) {
    return 0
  }

  return Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, parsed))
}

export function clampTimerDuration(totalSeconds) {
  const parsed = Number.parseInt(totalSeconds, 10)

  if (Number.isNaN(parsed)) {
    return DEFAULT_SECONDS
  }

  return Math.min(MAX_DURATION_SECONDS, Math.max(MIN_DURATION_SECONDS, parsed))
}

export function durationToParts(totalSeconds) {
  const safeSeconds = clampTimerDuration(totalSeconds)

  return {
    minutes: Math.floor(safeSeconds / 60),
    seconds: safeSeconds % 60,
  }
}

export function partsToDuration(minutes, seconds) {
  return clampTimerDuration(clampTimerMinutes(minutes) * 60 + clampTimerPartSeconds(seconds))
}

export function parseDurationSeconds(label) {
  const text = String(label ?? '')
  const labeledMatch = text.match(/(\d+)\s*(min|minuto)s?(?:\s+(\d+)\s*s)?/i)

  if (labeledMatch) {
    return partsToDuration(labeledMatch[1], labeledMatch[3] ?? 0)
  }

  const clockMatch = text.match(/(?:^|[^\d])(\d{1,2}):(\d{2})(?:[^\d]|$)/)

  if (!clockMatch) {
    return 0
  }

  return partsToDuration(clockMatch[1], clockMatch[2])
}

export function getDefaultDrillSeconds(drill, training) {
  return (
    parseDurationSeconds(drill?.durationLabel) ||
    parseDurationSeconds(training?.drillDurationLabel) ||
    DEFAULT_SECONDS
  )
}

export function formatCountdown(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds)
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function formatDurationPreset(totalSeconds) {
  const { minutes, seconds } = durationToParts(totalSeconds)

  if (seconds === 0) {
    return `${minutes} min`
  }

  return formatCountdown(totalSeconds)
}

export function unlockTimerAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext

  if (!AudioContextClass) {
    return null
  }

  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContextClass()
  }

  if (audioContext.state === 'suspended') {
    void audioContext.resume()
  }

  return audioContext
}

function playTone(context, { frequency, start, duration, gain = 0.28, type = 'sine' }) {
  const oscillator = context.createOscillator()
  const gainNode = context.createGain()
  const attack = Math.min(0.012, duration / 4)
  const release = Math.min(0.03, duration / 3)

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, start)
  gainNode.gain.setValueAtTime(0.0001, start)
  gainNode.gain.exponentialRampToValueAtTime(gain, start + attack)
  gainNode.gain.setValueAtTime(gain, start + Math.max(attack, duration - release))
  gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gainNode)
  gainNode.connect(context.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

function playAlarmBurst(context, start, frequency) {
  playTone(context, {
    frequency,
    start,
    duration: 0.24,
    gain: 0.78,
    type: 'square',
  })
  playTone(context, {
    frequency: frequency * 2,
    start,
    duration: 0.24,
    gain: 0.28,
    type: 'square',
  })
}

function vibrate(pattern) {
  if (typeof navigator === 'undefined' || !navigator.vibrate) {
    return
  }

  navigator.vibrate(pattern)
}

export function playTimerTick() {
  const context = unlockTimerAudio()

  if (context) {
    playTone(context, {
      frequency: 740,
      start: context.currentTime,
      duration: 0.09,
      gain: 0.18,
    })
  }

  vibrate(60)
}

export function playTimerAlarm() {
  const context = unlockTimerAudio()

  if (context) {
    const start = context.currentTime
    const cycle = 0.34

    for (let index = 0; index < 8; index += 1) {
      playAlarmBurst(context, start + index * cycle, index % 2 === 0 ? 932 : 698)
    }
  }

  vibrate([280, 70, 280, 70, 280, 70, 420, 70, 520])
}

export const TIMER_DURATION_PRESETS = [150, 300, 480, 600, 1200]
export const TIMER_SECOND_STEP = 15
