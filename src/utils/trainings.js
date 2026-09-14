import { TRAINING_DRILL_KIND } from './constants'
import { createId, createTraining } from './dataModels'
import {
  GRUPO_ROJO_TRAINING_ID,
  createGrupoRojoTraining,
  getCatalogTrainings,
} from './trainingCatalog'

const REMOVED_CATALOG_DRILL_IDS = new Set(['grupo-rojo-warmup-table'])
const REPLACED_DURATION_LABELS = new Set([
  '2 min 30 s por lado',
  '10 min · cambio cada 2 min 30 s',
])

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

function applyCatalogDrillLayout(training) {
  if (training.id !== GRUPO_ROJO_TRAINING_ID) {
    return training
  }

  const catalogById = new Map(
    createGrupoRojoTraining().drills.map((drill) => [drill.id, drill]),
  )

  return {
    ...training,
    drills: training.drills
      .filter((drill) => !REMOVED_CATALOG_DRILL_IDS.has(drill.id))
      .map((drill) => {
        const catalogDrill = catalogById.get(drill.id)

        if (!catalogDrill) {
          return drill
        }

        const durationLabel =
          !drill.durationLabel || REPLACED_DURATION_LABELS.has(drill.durationLabel)
            ? catalogDrill.durationLabel
            : drill.durationLabel

        return {
          ...drill,
          section: drill.section || catalogDrill.section,
          durationLabel,
        }
      }),
  }
}

export function mergeTrainingCatalog(stored = []) {
  const items = Array.isArray(stored)
    ? stored.map((item) => applyCatalogDrillLayout(createTraining(item)))
    : []
  const storedIds = new Set(items.map((item) => item.id))
  const catalog = getCatalogTrainings().filter((item) => !storedIds.has(item.id))

  return [...catalog, ...items]
}

function groupDrillsBySection(drills) {
  const sections = []
  const indexByTitle = new Map()

  for (const drill of drills) {
    const title = drill.section?.trim() ?? ''

    if (!indexByTitle.has(title)) {
      indexByTitle.set(title, sections.length)
      sections.push({ title, drills: [] })
    }

    sections[indexByTitle.get(title)].drills.push(drill)
  }

  return sections
}

export function groupDrillsByKind(drills = []) {
  return KIND_ORDER.map((kind) => ({
    kind,
    title: KIND_TITLES[kind],
    sections: groupDrillsBySection(drills.filter((drill) => drill.kind === kind)),
  })).filter((group) => group.sections.length > 0)
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
