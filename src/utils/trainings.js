import { TRAINING_DRILL_KIND } from './constants'
import { createId, createTraining } from './dataModels'
import { getCatalogTrainings } from './trainingCatalog'

const KIND_ORDER = [
  TRAINING_DRILL_KIND.WARMUP,
  TRAINING_DRILL_KIND.CONTINUOUS,
  TRAINING_DRILL_KIND.SERVE,
]

const KIND_TITLES = {
  [TRAINING_DRILL_KIND.WARMUP]: 'Calentamiento',
  [TRAINING_DRILL_KIND.CONTINUOUS]: 'Ejercicios continuos',
  [TRAINING_DRILL_KIND.SERVE]: 'Ejercicios con saque',
}

export function mergeTrainingCatalog(stored = []) {
  const items = Array.isArray(stored)
    ? stored.map((item) => createTraining(item))
    : []
  const storedIds = new Set(items.map((item) => item.id))
  const catalog = getCatalogTrainings().filter((item) => !storedIds.has(item.id))

  return [...catalog, ...items]
}

export function groupDrillsByKind(drills = []) {
  return KIND_ORDER.map((kind) => ({
    kind,
    title: KIND_TITLES[kind],
    drills: drills.filter((drill) => drill.kind === kind),
  })).filter((group) => group.drills.length > 0)
}

export function hasDrillSteps(drill) {
  return Array.isArray(drill?.steps) && drill.steps.length > 0
}

export function formatPlayerList(players = []) {
  return players.filter(Boolean).join(' · ')
}

export function formatPlayerLines(players = []) {
  return players.filter(Boolean).join('\n')
}

export function parsePlayerLines(value) {
  if (!value) {
    return []
  }

  return String(value)
    .split(/\n|,/)
    .map((name) => name.trim())
    .filter(Boolean)
}

export function isCatalogTraining(training) {
  return Boolean(training?.isCatalog)
}

export function cloneTraining(training) {
  const source = createTraining(training ?? {})

  return createTraining({
    ...source,
    id: createId(),
    name: source.name ? `${source.name} (copia)` : 'Copia',
    isCatalog: false,
    drills: source.drills.map((drill) => ({
      ...drill,
      id: createId(),
    })),
  })
}
