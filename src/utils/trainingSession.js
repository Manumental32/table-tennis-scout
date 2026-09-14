import { TRAINING_DRILL_KIND } from './constants'

export const ROTATION_CONTINUOUS_PER_TURN = 2
export const ROTATION_SERVE_PER_TURN = 2

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function drillsOfKind(drills, kind) {
  return drills.filter((drill) => drill.kind === kind)
}

function formatCountLabel(count, singular, plural) {
  if (count <= 0) {
    return ''
  }

  return `${count} ${count === 1 ? singular : plural}`
}

export function formatTurnSubtitle(continuousCount, serveCount) {
  const parts = [
    formatCountLabel(continuousCount, 'continuo', 'continuos'),
    formatCountLabel(serveCount, 'de saque', 'de saque'),
  ].filter(Boolean)

  return parts.join(' y ')
}

export function getSessionEntries(drills = []) {
  const warmup = drillsOfKind(drills, TRAINING_DRILL_KIND.WARMUP)
  const continuous = drillsOfKind(drills, TRAINING_DRILL_KIND.CONTINUOUS)
  const serve = drillsOfKind(drills, TRAINING_DRILL_KIND.SERVE)
  const other = drills.filter(
    (drill) =>
      drill.kind !== TRAINING_DRILL_KIND.WARMUP &&
      drill.kind !== TRAINING_DRILL_KIND.CONTINUOUS &&
      drill.kind !== TRAINING_DRILL_KIND.SERVE,
  )
  const entries = []

  for (const drill of warmup) {
    entries.push({ drill, turn: 0, group: 'warmup' })
  }

  let continuousIndex = 0
  let serveIndex = 0
  let turn = 1

  while (continuousIndex < continuous.length || serveIndex < serve.length) {
    const turnContinuous = continuous.slice(
      continuousIndex,
      continuousIndex + ROTATION_CONTINUOUS_PER_TURN,
    )
    const turnServe = serve.slice(serveIndex, serveIndex + ROTATION_SERVE_PER_TURN)
    continuousIndex += turnContinuous.length
    serveIndex += turnServe.length

    for (const drill of turnContinuous) {
      entries.push({ drill, turn, group: 'turn' })
    }

    for (const drill of turnServe) {
      entries.push({ drill, turn, group: 'turn' })
    }

    turn += 1
  }

  for (const drill of other) {
    entries.push({ drill, turn: 0, group: 'other' })
  }

  return entries.map((entry, index) => ({
    ...entry,
    number: index + 1,
  }))
}

function groupBySection(entries) {
  const sections = []
  const indexByTitle = new Map()

  for (const entry of entries) {
    const title = entry.drill.section?.trim() ?? ''

    if (!indexByTitle.has(title)) {
      indexByTitle.set(title, sections.length)
      sections.push({ title, entries: [] })
    }

    sections[indexByTitle.get(title)].entries.push(entry)
  }

  return sections
}

export function groupSessionEntries(entries = []) {
  const groups = []
  const warmup = entries.filter((entry) => entry.group === 'warmup')

  if (warmup.length > 0) {
    groups.push({
      id: 'warmup',
      title: 'Calentamiento',
      subtitle: '',
      sections: groupBySection(warmup),
    })
  }

  const turnNumbers = [
    ...new Set(
      entries.filter((entry) => entry.group === 'turn').map((entry) => entry.turn),
    ),
  ]

  for (const turn of turnNumbers) {
    const turnEntries = entries.filter(
      (entry) => entry.group === 'turn' && entry.turn === turn,
    )
    const continuousCount = turnEntries.filter(
      (entry) => entry.drill.kind === TRAINING_DRILL_KIND.CONTINUOUS,
    ).length
    const serveCount = turnEntries.filter(
      (entry) => entry.drill.kind === TRAINING_DRILL_KIND.SERVE,
    ).length

    groups.push({
      id: `turn-${turn}`,
      title: `Turno ${turn}`,
      subtitle: formatTurnSubtitle(continuousCount, serveCount),
      sections: [{ title: '', entries: turnEntries }],
    })
  }

  const other = entries.filter((entry) => entry.group === 'other')

  if (other.length > 0) {
    groups.push({
      id: 'other',
      title: 'Otros',
      subtitle: '',
      sections: [{ title: '', entries: other }],
    })
  }

  return groups
}

export function getSessionEntry(entries, drillId) {
  return entries.find((entry) => entry.drill.id === drillId) ?? null
}

export function getAdjacentDrillId(entries, drillId, offset) {
  const index = entries.findIndex((entry) => entry.drill.id === drillId)

  if (index < 0) {
    return null
  }

  const next = entries[index + offset]
  return next?.drill.id ?? null
}

export function getNextIncompleteDrillId(entries, completedIds, drillId) {
  const completed = new Set(completedIds)
  const index = entries.findIndex((entry) => entry.drill.id === drillId)
  const start = index < 0 ? 0 : index + 1
  const ordered = [...entries.slice(start), ...entries.slice(0, start)]

  return ordered.find((entry) => !completed.has(entry.drill.id))?.drill.id ?? null
}

export function getTurnSlot(entries, drillId) {
  const current = getSessionEntry(entries, drillId)

  if (!current || current.turn === 0) {
    return null
  }

  const sameKind = entries.filter(
    (entry) =>
      entry.turn === current.turn && entry.drill.kind === current.drill.kind,
  )
  const slotIndex = sameKind.findIndex((entry) => entry.drill.id === drillId)

  return {
    turn: current.turn,
    kind: current.drill.kind,
    index: slotIndex + 1,
    total: sameKind.length,
  }
}

export function getKindLabel(kind) {
  if (kind === TRAINING_DRILL_KIND.CONTINUOUS) {
    return 'Continuo'
  }

  if (kind === TRAINING_DRILL_KIND.SERVE) {
    return 'Saque'
  }

  return 'Calentamiento'
}

export function getTurnProgress(entries, completedIds, turn) {
  const turnEntries = entries.filter((entry) => entry.turn === turn)
  const completed = new Set(completedIds)
  const continuous = turnEntries.filter(
    (entry) => entry.drill.kind === TRAINING_DRILL_KIND.CONTINUOUS,
  )
  const serve = turnEntries.filter(
    (entry) => entry.drill.kind === TRAINING_DRILL_KIND.SERVE,
  )

  return {
    continuousDone: continuous.filter((entry) => completed.has(entry.drill.id)).length,
    continuousTotal: continuous.length,
    serveDone: serve.filter((entry) => completed.has(entry.drill.id)).length,
    serveTotal: serve.length,
  }
}
