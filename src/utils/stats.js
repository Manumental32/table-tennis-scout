import { HAND, MATCH_RESULT, RUBBER } from './constants'
import { HAND_OPTIONS, RUBBER_OPTIONS, getOptionLabel } from './labels'
import { isCoachedMatch, sortMatchesByDate } from './matches'
import { getLosingPhrases, getWinningPhrases } from './suggestions'

export function getOwnMatches(matches) {
  return matches.filter((match) => !isCoachedMatch(match))
}

export function getDecidedMatches(matches) {
  return getOwnMatches(matches).filter(
    (match) =>
      match.result === MATCH_RESULT.WIN || match.result === MATCH_RESULT.LOSS,
  )
}

export function countMatchSets(match) {
  return (match.sets ?? []).reduce(
    (totals, set) => {
      if (set.playerScore > set.opponentScore) {
        return { won: totals.won + 1, lost: totals.lost }
      }

      if (set.opponentScore > set.playerScore) {
        return { won: totals.won, lost: totals.lost + 1 }
      }

      return totals
    },
    { won: 0, lost: 0 },
  )
}

export function createRecord(matches = []) {
  const decided = getDecidedMatches(matches)
  const wins = decided.filter((match) => match.result === MATCH_RESULT.WIN).length
  const losses = decided.length - wins
  const sets = decided.reduce(
    (totals, match) => {
      const matchSets = countMatchSets(match)
      return {
        won: totals.won + matchSets.won,
        lost: totals.lost + matchSets.lost,
      }
    },
    { won: 0, lost: 0 },
  )

  return {
    played: decided.length,
    wins,
    losses,
    pending: getOwnMatches(matches).length - decided.length,
    winRate: decided.length > 0 ? wins / decided.length : null,
    setsWon: sets.won,
    setsLost: sets.lost,
  }
}

export function formatWinRate(winRate) {
  if (winRate == null) {
    return '—'
  }

  return `${Math.round(winRate * 100)}%`
}

export function formatRecordScore(record) {
  if (!record) {
    return 'Sin partidos'
  }

  if (record.played === 0 && record.pending === 0) {
    return 'Sin partidos'
  }

  return `${record.wins}-${record.losses}`
}

export function getRivalRecord(matches, rivalId) {
  if (!rivalId) {
    return createRecord([])
  }

  return createRecord(
    getOwnMatches(matches).filter((match) => match.rivalId === rivalId),
  )
}

export function getRivalRecords(matches, rivals) {
  return rivals
    .map((rival) => ({
      rival,
      record: getRivalRecord(matches, rival.id),
    }))
    .filter((item) => item.record.played > 0 || item.record.pending > 0)
    .sort((left, right) => {
      if (right.record.played !== left.record.played) {
        return right.record.played - left.record.played
      }

      return (right.record.winRate ?? -1) - (left.record.winRate ?? -1)
    })
}

export function getTournamentRecords(matches, tournaments) {
  return tournaments
    .map((tournament) => ({
      tournament,
      record: createRecord(
        getOwnMatches(matches).filter(
          (match) => match.tournamentId === tournament.id,
        ),
      ),
    }))
    .filter((item) => item.record.played > 0 || item.record.pending > 0)
    .sort((left, right) => right.record.played - left.record.played)
}

function getGroupedRecords(matches, getGroup) {
  const groups = new Map()

  for (const match of getOwnMatches(matches)) {
    const group = getGroup(match)

    if (!group) {
      continue
    }

    const current = groups.get(group.key) ?? {
      key: group.key,
      label: group.label,
      matches: [],
    }
    current.matches.push(match)
    groups.set(group.key, current)
  }

  return [...groups.values()]
    .map((group) => ({
      key: group.key,
      label: group.label,
      record: createRecord(group.matches),
    }))
    .filter((item) => item.record.played > 0)
    .sort((left, right) => right.record.played - left.record.played)
}

export function getHandRecords(matches, getRivalById) {
  return getGroupedRecords(matches, (match) => {
    const rival = match.rivalId ? getRivalById(match.rivalId) : null

    if (!rival || rival.hand === HAND.UNKNOWN) {
      return null
    }

    return {
      key: rival.hand,
      label: getOptionLabel(HAND_OPTIONS, rival.hand),
    }
  })
}

export function getRubberRecords(matches, getRivalById) {
  return getGroupedRecords(matches, (match) => {
    const rival = match.rivalId ? getRivalById(match.rivalId) : null

    if (!rival || rival.forehandRubber === RUBBER.UNKNOWN) {
      return null
    }

    return {
      key: rival.forehandRubber,
      label: getOptionLabel(RUBBER_OPTIONS, rival.forehandRubber),
    }
  })
}

export function getRecentForm(matches, limit = 5) {
  return sortMatchesByDate(getDecidedMatches(matches))
    .slice(0, limit)
    .reverse()
    .map((match) => ({
      id: match.id,
      result: match.result,
    }))
}

export { getLosingPhrases, getWinningPhrases }

export function getTacticalInsights(matches, getRivalById, limit = 5) {
  return sortMatchesByDate(getOwnMatches(matches))
    .filter((match) => {
      const analysis = match.postMatchAnalysis
      return Boolean(
        analysis?.whatWorked || analysis?.whatDidNotWork || analysis?.advice,
      )
    })
    .slice(0, limit)
    .map((match) => {
      const rival = match.rivalId ? getRivalById(match.rivalId) : null

      return {
        id: match.id,
        rivalName: rival?.name ?? 'Rival',
        whatWorked: match.postMatchAnalysis.whatWorked,
        whatDidNotWork: match.postMatchAnalysis.whatDidNotWork,
        advice: match.postMatchAnalysis.advice,
      }
    })
}
