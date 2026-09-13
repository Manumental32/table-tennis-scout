import { normalizeFetembaCategory } from '../services/pdf/fetemba'
import { TOURNAMENT_STATUS } from './constants'
import { TOURNAMENT_STATUS_OPTIONS, getOptionLabel } from './labels'
import { formatMatchDate } from './matches'

function toDayKey(dateValue) {
  const parsedDate = new Date(dateValue)

  if (Number.isNaN(parsedDate.getTime())) {
    return ''
  }

  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  const day = String(parsedDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatTournamentDate(dateValue) {
  return formatMatchDate(dateValue)
}

export function isUpcomingTournament(tournament, now = new Date()) {
  const tournamentDay = toDayKey(tournament?.date)
  return Boolean(tournamentDay) && tournamentDay >= toDayKey(now)
}

export function getNextTournament(tournaments = [], now = new Date()) {
  return (
    tournaments
      .filter(
        (tournament) =>
          tournament.status === TOURNAMENT_STATUS.CONFIRMED &&
          tournament.fixture?.length > 0 &&
          isUpcomingTournament(tournament, now),
      )
      .sort((left, right) => {
        const leftTime = new Date(left.date || 0).getTime()
        const rightTime = new Date(right.date || 0).getTime()
        return leftTime - rightTime
      })[0] ?? null
  )
}

export function getTournamentStatusLabel(status) {
  return getOptionLabel(TOURNAMENT_STATUS_OPTIONS, status)
}

export function getTournamentStatusClassName(status) {
  if (status === TOURNAMENT_STATUS.CONFIRMED) {
    return 'text-emerald-400'
  }

  if (status === TOURNAMENT_STATUS.REVIEW) {
    return 'text-amber-300'
  }

  return 'text-slate-300'
}

export function sortTournaments(tournaments) {
  return [...tournaments].sort((left, right) => {
    const leftTime = new Date(left.date || 0).getTime()
    const rightTime = new Date(right.date || 0).getTime()
    return rightTime - leftTime
  })
}

export function normalizeName(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function clubsMatch(left, right) {
  const first = normalizeName(left)
  const second = normalizeName(right)

  if (!first || !second) {
    return false
  }

  return first === second || first.includes(second) || second.includes(first)
}

export function namesMatch(left, right) {
  const first = normalizeName(left)
  const second = normalizeName(right)

  if (!first || !second) {
    return false
  }

  if (first === second) {
    return true
  }

  if (first.includes(second) || second.includes(first)) {
    return true
  }

  const firstParts = first.split(' ')
  const secondParts = second.split(' ')
  const firstSorted = [...firstParts].sort().join(' ')
  const secondSorted = [...secondParts].sort().join(' ')

  if (firstSorted === secondSorted) {
    return true
  }

  const firstLast = firstParts[0]
  const secondLast = secondParts[0]

  return firstLast.length >= 4 && firstLast === secondLast
}

export function getPlayerGroup(groups, playerName, preferredCategory = '') {
  if (!Array.isArray(groups) || !playerName) {
    return null
  }

  const matches = groups.filter((group) =>
    (group.players ?? []).some((player) => namesMatch(player.name, playerName)),
  )

  if (preferredCategory) {
    const preferredKey = normalizeFetembaCategory(preferredCategory)
    const preferred = matches.find(
      (group) =>
        preferredKey &&
        normalizeFetembaCategory(group.category) === preferredKey,
    )

    if (preferred) {
      return preferred
    }
  }

  return matches[0] ?? null
}

export function findOpponentClub(tournament, opponentName) {
  if (!tournament || !opponentName) {
    return ''
  }

  for (const group of tournament.groups ?? []) {
    const player = (group.players ?? []).find((item) =>
      namesMatch(item.name, opponentName),
    )

    if (player?.club) {
      return player.club
    }
  }

  const rankingEntry = (tournament.ranking ?? []).find((entry) =>
    namesMatch(entry.name, opponentName),
  )

  return rankingEntry?.club ?? ''
}

export function formatFixtureLine(match) {
  const time = match.time || 'Sin hora'
  const opponent = match.opponent || 'Rival sin nombre'
  const table = match.table ? `Mesa ${match.table}` : 'Sin mesa'

  return `${time} — vs ${opponent} — ${table}`
}

export function getTournamentScreen(status) {
  if (status === TOURNAMENT_STATUS.CONFIRMED) {
    return 'fixture'
  }

  if (status === TOURNAMENT_STATUS.REVIEW) {
    return 'review'
  }

  return 'detail'
}
