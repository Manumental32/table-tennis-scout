export const TABLE_SIDE = {
  OPPONENT: 'opponent',
  OWN: 'own',
}

export const TABLE_DEPTH = {
  SHORT: 'short',
  LONG: 'long',
}

export const TABLE_LANE = {
  LEFT: 'left',
  MIDDLE: 'middle',
  RIGHT: 'right',
}

const SIDE_LABELS = {
  [TABLE_SIDE.OPPONENT]: 'Rival',
  [TABLE_SIDE.OWN]: 'Vos',
}

const DEPTH_LABELS = {
  [TABLE_DEPTH.SHORT]: 'Corto',
  [TABLE_DEPTH.LONG]: 'Largo',
}

const STROKE_LABELS = {
  BACKHAND: 'Revés',
  MIDDLE: 'Medio',
  FOREHAND: 'Drive',
}

export function getZoneStroke(zoneId) {
  const parsed = parseZoneId(zoneId)

  if (!parsed) {
    return ''
  }

  if (parsed.lane === TABLE_LANE.MIDDLE) {
    return 'middle'
  }

  if (parsed.side === TABLE_SIDE.OWN) {
    return parsed.lane === TABLE_LANE.LEFT ? 'backhand' : 'forehand'
  }

  return parsed.lane === TABLE_LANE.LEFT ? 'forehand' : 'backhand'
}

export function getZoneStrokeLabel(zoneId) {
  const stroke = getZoneStroke(zoneId)

  if (stroke === 'backhand') {
    return STROKE_LABELS.BACKHAND
  }

  if (stroke === 'forehand') {
    return STROKE_LABELS.FOREHAND
  }

  if (stroke === 'middle') {
    return STROKE_LABELS.MIDDLE
  }

  return ''
}

export function getLaneStrokeLabel(side, lane) {
  return getZoneStrokeLabel(getZoneId(side, TABLE_DEPTH.LONG, lane))
}

function isValidPart(value, allowed) {
  return Object.values(allowed).includes(value)
}

export function getZoneId(side, depth, lane) {
  return `${side}-${depth}-${lane}`
}

export function parseZoneId(zoneId) {
  const [side, depth, lane] = String(zoneId ?? '').split('-')

  if (
    !isValidPart(side, TABLE_SIDE) ||
    !isValidPart(depth, TABLE_DEPTH) ||
    !isValidPart(lane, TABLE_LANE)
  ) {
    return null
  }

  return { side, depth, lane }
}

export function sanitizeZoneIds(value) {
  if (!Array.isArray(value)) {
    return []
  }

  const unique = []
  const seen = new Set()

  for (const zoneId of value) {
    if (!parseZoneId(zoneId) || seen.has(zoneId)) {
      continue
    }

    seen.add(zoneId)
    unique.push(zoneId)
  }

  return unique
}

export function toggleZone(zoneIds, zoneId) {
  const current = sanitizeZoneIds(zoneIds)

  if (current.includes(zoneId)) {
    return current.filter((item) => item !== zoneId)
  }

  return [...current, zoneId]
}

export function hasSelectedZones(zoneIds) {
  return sanitizeZoneIds(zoneIds).length > 0
}

export function formatZoneLabel(zoneId) {
  const parsed = parseZoneId(zoneId)

  if (!parsed) {
    return ''
  }

  return `${SIDE_LABELS[parsed.side]}, ${DEPTH_LABELS[parsed.depth].toLowerCase()} ${getZoneStrokeLabel(zoneId).toLowerCase()}`
}

export function getZoneAriaLabel(zoneId) {
  const parsed = parseZoneId(zoneId)

  if (!parsed) {
    return 'Zona'
  }

  return `${SIDE_LABELS[parsed.side]}, ${DEPTH_LABELS[parsed.depth].toLowerCase()}, ${getZoneStrokeLabel(zoneId).toLowerCase()}`
}

export function getZoneShortLabel(zoneId) {
  const parsed = parseZoneId(zoneId)

  if (!parsed) {
    return ''
  }

  return `${DEPTH_LABELS[parsed.depth]}\n${getZoneStrokeLabel(zoneId)}`
}

function getRow(side, depth) {
  return [
    getZoneId(side, depth, TABLE_LANE.LEFT),
    getZoneId(side, depth, TABLE_LANE.MIDDLE),
    getZoneId(side, depth, TABLE_LANE.RIGHT),
  ]
}

export function getOpponentRows() {
  return [
    getRow(TABLE_SIDE.OPPONENT, TABLE_DEPTH.LONG),
    getRow(TABLE_SIDE.OPPONENT, TABLE_DEPTH.SHORT),
  ]
}

export function getOwnRows() {
  return [
    getRow(TABLE_SIDE.OWN, TABLE_DEPTH.SHORT),
    getRow(TABLE_SIDE.OWN, TABLE_DEPTH.LONG),
  ]
}

export const TABLE_SIDE_LABELS = SIDE_LABELS
