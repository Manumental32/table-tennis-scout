import {
  BUILD,
  DRILL_ACTION,
  DRILL_ACTOR,
  GRIP,
  HAND,
  HEIGHT,
  MATCH_RESULT,
  MOBILITY,
  PLAY_STYLE,
  RHYTHM,
  RUBBER,
  TOURNAMENT_STATUS,
  TRAINING_DRILL_KIND,
} from './constants'

export const HEIGHT_OPTIONS = [
  { value: HEIGHT.UNKNOWN, label: 'Sin dato' },
  { value: HEIGHT.HIGH, label: 'Alto' },
  { value: HEIGHT.LOW, label: 'Bajo' },
]

export const BUILD_OPTIONS = [
  { value: BUILD.UNKNOWN, label: 'Sin dato' },
  { value: BUILD.AGILE, label: 'Ágil' },
  { value: BUILD.HEAVY, label: 'Fuerte' },
]

export const MOBILITY_OPTIONS = [
  { value: MOBILITY.UNKNOWN, label: 'Sin dato' },
  { value: MOBILITY.NORMAL, label: 'De pie' },
  { value: MOBILITY.WHEELCHAIR, label: 'Silla de ruedas' },
]

export const HAND_OPTIONS = [
  { value: HAND.UNKNOWN, label: 'Sin dato' },
  { value: HAND.RIGHT, label: 'Diestro' },
  { value: HAND.LEFT, label: 'Zurdo' },
]

export const GRIP_OPTIONS = [
  { value: GRIP.SHAKEHAND, label: 'Convencional' },
  { value: GRIP.PENHOLD, label: 'Pluma' },
  { value: GRIP.SEEMILLER, label: 'Seemiller' },
  { value: GRIP.UNKNOWN, label: 'Sin dato' },
]

export const RUBBER_OPTIONS = [
  { value: RUBBER.INVERTED, label: 'Lisa' },
  { value: RUBBER.SHORT_PIPS, label: 'Picos cortos' },
  { value: RUBBER.LONG_PIPS, label: 'Picos largos' },
  { value: RUBBER.ANTI, label: 'Anti' },
  { value: RUBBER.UNKNOWN, label: 'Sin dato' },
]

export const PLAY_STYLE_OPTIONS = [
  { value: PLAY_STYLE.UNKNOWN, label: 'Sin dato' },
  { value: PLAY_STYLE.ATTACKER, label: 'Atacante' },
  { value: PLAY_STYLE.COUNTER_ATTACKER, label: 'Contraatacante' },
  { value: PLAY_STYLE.DEFENDER, label: 'Defensor' },
  { value: PLAY_STYLE.BLOCKER, label: 'Bloqueo' },
  { value: PLAY_STYLE.AWAY, label: 'Fondo' },
  { value: PLAY_STYLE.SPIN, label: 'Con efecto' },
  { value: PLAY_STYLE.FLAT, label: 'Plano' },
]

export const RHYTHM_OPTIONS = [
  { value: RHYTHM.UNKNOWN, label: 'Sin dato' },
  { value: RHYTHM.FAST, label: 'Rápido' },
  { value: RHYTHM.SLOW, label: 'Lento' },
  { value: RHYTHM.MIXED, label: 'Mixto' },
]

export const RESULT_OPTIONS = [
  { value: MATCH_RESULT.WIN, label: 'Victoria' },
  { value: MATCH_RESULT.LOSS, label: 'Derrota' },
  { value: MATCH_RESULT.UNKNOWN, label: 'Sin resultado' },
]

export const TOURNAMENT_STATUS_OPTIONS = [
  { value: TOURNAMENT_STATUS.DRAFT, label: 'Borrador' },
  { value: TOURNAMENT_STATUS.REVIEW, label: 'Para revisar' },
  { value: TOURNAMENT_STATUS.CONFIRMED, label: 'Confirmado' },
]

export const TRAINING_DRILL_KIND_OPTIONS = [
  { value: TRAINING_DRILL_KIND.WARMUP, label: 'Calentamiento' },
  { value: TRAINING_DRILL_KIND.CONTINUOUS, label: 'Continuo' },
  { value: TRAINING_DRILL_KIND.SERVE, label: 'Con saque' },
]

export const DRILL_ACTOR_OPTIONS = [
  { value: DRILL_ACTOR.A, label: 'Jugador A' },
  { value: DRILL_ACTOR.B, label: 'Jugador B' },
]

export const DRILL_ACTION_OPTIONS = [
  { value: DRILL_ACTION.SERVE, label: 'Saque' },
  { value: DRILL_ACTION.RECEIVE, label: 'Recepción' },
  { value: DRILL_ACTION.DRIVE, label: 'Drive' },
  { value: DRILL_ACTION.BACKHAND, label: 'Revés' },
  { value: DRILL_ACTION.BLOCK, label: 'Bloqueo' },
  { value: DRILL_ACTION.TOP, label: 'Top' },
  { value: DRILL_ACTION.PIVOT, label: 'Pívot' },
  { value: DRILL_ACTION.CHOP, label: 'Corte' },
  { value: DRILL_ACTION.FLAT, label: 'Plano' },
  { value: DRILL_ACTION.FREE, label: 'Punto libre' },
]

export function getOptionLabel(options, value) {
  return options.find((option) => option.value === value)?.label ?? 'Sin dato'
}

export function getDrillActionLabel(action) {
  return getOptionLabel(DRILL_ACTION_OPTIONS, action)
}
