import {
  formatFetembaCategory,
  normalizeFetembaCategory,
} from '../services/pdf/fetemba'
import { clubsMatch, namesMatch } from './tournaments'

const CATEGORY_ORDER = ['DH', '1RA', '2DA', '3RA', '4TA', '5TA', '6TA', '7MA', '8VA']
const LARGE_RANKING_LIMIT = 150

export function sortRanking(entries) {
  return [...entries].sort((left, right) => {
    const leftPosition = left.position ?? Number.MAX_SAFE_INTEGER
    const rightPosition = right.position ?? Number.MAX_SAFE_INTEGER

    if (leftPosition !== rightPosition) {
      return leftPosition - rightPosition
    }

    return (right.points ?? 0) - (left.points ?? 0)
  })
}

export function getRankingCategoryKey(category) {
  return normalizeFetembaCategory(category) || String(category ?? '').trim()
}

export function getRankingCategories(entries) {
  const seen = new Map()

  for (const entry of entries) {
    const key = getRankingCategoryKey(entry.category)

    if (!key || seen.has(key)) {
      continue
    }

    seen.set(key, formatFetembaCategory(entry.category) || entry.category)
  }

  return [...seen.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((left, right) => {
      const leftIndex = CATEGORY_ORDER.indexOf(left.value)
      const rightIndex = CATEGORY_ORDER.indexOf(right.value)

      if (leftIndex === -1 && rightIndex === -1) {
        return left.label.localeCompare(right.label, 'es')
      }

      if (leftIndex === -1) {
        return 1
      }

      if (rightIndex === -1) {
        return -1
      }

      return leftIndex - rightIndex
    })
}

export function findRankingEntry(entries, name) {
  if (!name) {
    return null
  }

  return entries.find((entry) => namesMatch(entry.name, name)) ?? null
}

export function getDefaultRankingCategory(entries, playerName, tournamentCategory = '') {
  const playerEntry = findRankingEntry(entries, playerName)
  const playerCategory = getRankingCategoryKey(playerEntry?.category)

  if (playerCategory) {
    return playerCategory
  }

  const tournamentKey = getRankingCategoryKey(tournamentCategory)

  if (
    tournamentKey &&
    getRankingCategories(entries).some((category) => category.value === tournamentKey)
  ) {
    return tournamentKey
  }

  return ''
}

export function filterRanking(entries, { query = '', category = '', club = '' } = {}) {
  const normalizedQuery = query.trim().toLowerCase()
  const categoryKey = getRankingCategoryKey(category)

  return sortRanking(
    entries.filter((entry) => {
      if (categoryKey) {
        const entryKey = getRankingCategoryKey(entry.category)

        if (entryKey !== categoryKey) {
          return false
        }
      }

      if (club && !clubsMatch(entry.club, club)) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      const haystack = [entry.name, entry.club]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedQuery)
    }),
  )
}

export function needsRankingSearch(entries, query, category, club = '') {
  if (club) {
    return false
  }

  return (
    !getRankingCategoryKey(category) &&
    !query.trim() &&
    entries.length > LARGE_RANKING_LIMIT
  )
}

export function formatRankingPoints(points) {
  if (points == null) {
    return '—'
  }

  return String(points)
}

export function formatRatingChange(change) {
  if (change == null || change === 0) {
    return ''
  }

  return change > 0 ? `+${change}` : String(change)
}

export function getRatingChangeClassName(change) {
  if (change > 0) {
    return 'text-emerald-400'
  }

  if (change < 0) {
    return 'text-red-400'
  }

  return 'text-slate-400'
}

export function isRankingOpponent(entry, opponentNames) {
  return opponentNames.some((name) => namesMatch(entry.name, name))
}

export function isRankingClubmate(entry, club, playerName) {
  if (!club || namesMatch(entry.name, playerName)) {
    return false
  }

  return clubsMatch(entry.club, club)
}
