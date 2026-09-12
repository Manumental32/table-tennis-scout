import {
  BUILD,
  GRIP,
  HAND,
  HEIGHT,
  MATCH_RESULT,
  MOBILITY,
  PLAY_STYLE,
  RHYTHM,
  RUBBER,
  TOURNAMENT_STATUS,
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

export function getOptionLabel(options, value) {
  return options.find((option) => option.value === value)?.label ?? 'Sin dato'
}
