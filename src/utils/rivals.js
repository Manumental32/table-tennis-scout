import { namesMatch } from './tournaments'

function normalizeSearchText(value) {
  return value.trim().toLowerCase()
}

function splitLines(value) {
  if (!value) {
    return []
  }

  return value
    .split('\n')
    .map((line) => line.replace(/^[•\-*]\s*/, '').trim())
    .filter(Boolean)
}

function compact(values) {
  return values.filter(Boolean)
}

export function findRivalByName(rivals, name) {
  if (!name) {
    return null
  }

  return rivals.find((rival) => namesMatch(rival.name, name)) ?? null
}

export function filterRivals(rivals, query) {
  const normalizedQuery = normalizeSearchText(query)

  if (!normalizedQuery) {
    return rivals
  }

  return rivals.filter((rival) => {
    const name = normalizeSearchText(rival.name ?? '')
    const club = normalizeSearchText(rival.club ?? '')
    return name.includes(normalizedQuery) || club.includes(normalizedQuery)
  })
}

export function getScoutingPlan(rival) {
  const thingsToDo = splitLines(rival.thingsToDo)
  const thingsToAvoid = splitLines(rival.thingsToAvoid)
  const objectives = splitLines(rival.mainObjective)

  return {
    thingsToDo:
      thingsToDo.length > 0
        ? thingsToDo
        : compact([
            rival.preferredServe ? `Saque: ${rival.preferredServe}` : '',
            rival.preferredBall ? `Pelota: ${rival.preferredBall}` : '',
            rival.mainStrengthDescription,
          ]),
    thingsToAvoid:
      thingsToAvoid.length > 0
        ? thingsToAvoid
        : compact([
            rival.problematicReceive
              ? `Recepción: ${rival.problematicReceive}`
              : '',
            rival.mainWeaknessDescription,
          ]),
    objectives:
      objectives.length > 0
        ? objectives
        : compact([
            rival.distanceFromTable
              ? `Distancia: ${rival.distanceFromTable}`
              : '',
          ]),
  }
}
