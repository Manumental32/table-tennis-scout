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

  return Object.values(values).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0
    }

    return Boolean(value)
  })
}

export function parseSetScore(value) {
  const parsedScore = Number.parseInt(value, 10)

  if (Number.isNaN(parsedScore)) {
    return 0
  }

  return Math.min(99, Math.max(0, parsedScore))
}

export function isClosedSet(playerScore, opponentScore) {
  const player = parseSetScore(playerScore)
  const opponent = parseSetScore(opponentScore)
  const high = Math.max(player, opponent)
  const low = Math.min(player, opponent)
  const diff = high - low

  if (high < 11 || diff < 2) {
    return false
  }

  return high === 11 || diff === 2
}

export function hasBothSetScores(playerScore, opponentScore) {
  return String(playerScore).trim() !== '' && String(opponentScore).trim() !== ''
}

export function getSetScoreHint(playerScore, opponentScore) {
  if (!hasBothSetScores(playerScore, opponentScore) || isClosedSet(playerScore, opponentScore)) {
    return ''
  }

  const player = parseSetScore(playerScore)
  const opponent = parseSetScore(opponentScore)
  const high = Math.max(player, opponent)
  const low = Math.min(player, opponent)

  if (high > 11 && high - low !== 2) {
    return 'Después de 10-10 se gana por 2: 12-10, 13-11, 14-12.'
  }

  if (high >= 11 && high - low < 2) {
    return 'Falta diferencia de 2 para cerrar el set.'
  }

  return 'El set cierra en 11, o por 2 si hay deuce.'
}

export function getResultFromSets(sets = []) {
  let playerSets = 0
  let opponentSets = 0

  for (const set of sets) {
    if (!isClosedSet(set.playerScore, set.opponentScore)) {
      continue
    }

    if (parseSetScore(set.playerScore) > parseSetScore(set.opponentScore)) {
      playerSets += 1
    } else {
      opponentSets += 1
    }
  }

  if (playerSets === 0 && opponentSets === 0) {
    return MATCH_RESULT.UNKNOWN
  }

  if (playerSets > opponentSets) {
    return MATCH_RESULT.WIN
  }

  if (opponentSets > playerSets) {
    return MATCH_RESULT.LOSS
  }

  return MATCH_RESULT.UNKNOWN
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
