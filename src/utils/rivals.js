import { namesMatch, normalizeName } from './tournaments'

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

export function collectRankingCandidates(tournaments = [], knownPeople = [], playerName = '') {
  const seen = new Set(
    knownPeople
      .map((person) => normalizeName(person.name))
      .filter(Boolean),
  )
  const selfName = normalizeName(playerName)
  const candidates = []

  for (const tournament of tournaments) {
    const entries = [...(tournament.ranking ?? []), ...(tournament.players ?? [])]

    for (const entry of entries) {
      const name = String(entry.name ?? '').trim()
      const key = normalizeName(name)

      if (!key || key === selfName || seen.has(key)) {
        continue
      }

      seen.add(key)
      candidates.push({
        name,
        club: String(entry.club ?? '').trim(),
        tournamentId: tournament.id,
        tournamentName: tournament.name,
      })
    }
  }

  return candidates.sort((left, right) =>
    left.name.localeCompare(right.name, 'es'),
  )
}

export function collectRankingClubs(tournaments = []) {
  const seen = new Set()
  const clubs = []

  for (const tournament of tournaments) {
    const entries = [...(tournament.ranking ?? []), ...(tournament.players ?? [])]

    for (const entry of entries) {
      const club = String(entry.club ?? '').trim()
      const key = normalizeName(club)

      if (!key || seen.has(key)) {
        continue
      }

      seen.add(key)
      clubs.push(club)
    }
  }

  return clubs.sort((left, right) => left.localeCompare(right, 'es'))
}

export function filterRankingClubs(clubs, query) {
  const normalizedQuery = normalizeSearchText(query)

  if (!normalizedQuery) {
    return []
  }

  return clubs.filter((club) => {
    const value = normalizeSearchText(club)
    return value.includes(normalizedQuery) && value !== normalizedQuery
  })
}

const SUGGESTION_LIMIT = 8

export function toRankingNameSuggestions(candidates, query, preferredTournamentId) {
  if (!String(query ?? '').trim()) {
    return []
  }

  return filterRankingCandidates(candidates, query, preferredTournamentId)
    .filter(
      (candidate) => normalizeName(candidate.name) !== normalizeName(query),
    )
    .slice(0, SUGGESTION_LIMIT)
    .map((candidate) => ({
      id: `${candidate.tournamentId}-${candidate.name}`,
      label: candidate.name,
      subtitle: [candidate.club, candidate.tournamentName]
        .filter(Boolean)
        .join(' · '),
      value: candidate,
    }))
}

export function toRankingClubSuggestions(clubs, query) {
  return filterRankingClubs(clubs, query)
    .slice(0, SUGGESTION_LIMIT)
    .map((club) => ({
      id: club,
      label: club,
      value: club,
    }))
}

export function filterRankingCandidates(candidates, query, preferredTournamentId) {
  const normalizedQuery = normalizeSearchText(query)
  const filtered = normalizedQuery
    ? candidates.filter((candidate) => {
        const name = normalizeSearchText(candidate.name)
        const club = normalizeSearchText(candidate.club)
        return name.includes(normalizedQuery) || club.includes(normalizedQuery)
      })
    : candidates

  if (!preferredTournamentId) {
    return filtered
  }

  return [...filtered].sort((left, right) => {
    const leftPreferred = left.tournamentId === preferredTournamentId ? 0 : 1
    const rightPreferred = right.tournamentId === preferredTournamentId ? 0 : 1
    return leftPreferred - rightPreferred
  })
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
