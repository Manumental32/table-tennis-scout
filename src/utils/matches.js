import { MATCH_KIND, MATCH_RESULT } from './constants'
import { RESULT_OPTIONS, getOptionLabel } from './labels'

export function formatMatchDate(dateValue) {
  if (!dateValue) {
    return 'Sin fecha'
  }

  const parsedDate = new Date(dateValue)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Sin fecha'
  }

  return parsedDate.toLocaleDateString('es-AR')
}

export function toDateInputValue(dateValue) {
  if (!dateValue) {
    return ''
  }

  const parsedDate = new Date(dateValue)

  if (Number.isNaN(parsedDate.getTime())) {
    return ''
  }

  return parsedDate.toISOString().slice(0, 10)
}

export function fromDateInputValue(value) {
  if (!value) {
    return new Date().toISOString()
  }

  return new Date(`${value}T12:00:00`).toISOString()
}

export function formatScore(sets) {
  if (!Array.isArray(sets)) {
    return ''
  }

  return sets
    .filter((set) => set.playerScore > 0 || set.opponentScore > 0)
    .map((set) => `${set.playerScore}-${set.opponentScore}`)
    .join('  ')
}

export function getResultLabel(result) {
  return getOptionLabel(RESULT_OPTIONS, result)
}

export function sortMatchesByDate(matches) {
  return [...matches].sort((left, right) => {
    return new Date(right.date).getTime() - new Date(left.date).getTime()
  })
}

export function getMatchKind(match) {
  return match?.kind === MATCH_KIND.COACHED ? MATCH_KIND.COACHED : MATCH_KIND.OWN
}

export function isCoachedMatch(match) {
  return getMatchKind(match) === MATCH_KIND.COACHED
}

export function findOwnMatchForRival(matches, tournamentId, rivalId) {
  if (!tournamentId || !rivalId) {
    return null
  }

  return (
    matches.find(
      (match) =>
        !isCoachedMatch(match) &&
        match.tournamentId === tournamentId &&
        match.rivalId === rivalId,
    ) ?? null
  )
}

export function filterMatches(matches, getRivalById, getTeammateById, query) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return matches
  }

  return matches.filter((match) => {
    const rival = match.rivalId ? getRivalById(match.rivalId) : null
    const teammate = match.teammateId ? getTeammateById?.(match.teammateId) : null
    const haystack = [
      rival?.name,
      rival?.club,
      teammate?.name,
      teammate?.club,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedQuery)
  })
}

export function getMatchTitle(match, rival, teammate) {
  if (isCoachedMatch(match)) {
    return teammate?.name ?? 'Compañero sin asignar'
  }

  return rival?.name ?? 'Rival sin asignar'
}

export function hasFilledFields(values) {
  if (!values) {
    return false
  }

  return Object.values(values).some((value) => Boolean(value))
}

export function parseSetScore(value) {
  const parsedScore = Number.parseInt(value, 10)
  return Number.isNaN(parsedScore) ? 0 : parsedScore
}

export function getResultClassName(result) {
  if (result === MATCH_RESULT.WIN) {
    return 'text-emerald-400'
  }

  if (result === MATCH_RESULT.LOSS) {
    return 'text-red-400'
  }

  return 'text-slate-300'
}
