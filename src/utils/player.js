import { createPlayerProfile } from './dataModels'
import { findRankingEntry } from './ranking'
import { sortTournaments } from './tournaments'

export function hasPlayerProfile(profile) {
  return Boolean(profile?.name?.trim())
}

export function suggestPlayerProfile(tournaments = []) {
  const tournament = sortTournaments(tournaments).find((item) =>
    item.playerName?.trim(),
  )

  if (!tournament) {
    return createPlayerProfile()
  }

  const rankingEntry = findRankingEntry(
    tournament.ranking ?? [],
    tournament.playerName,
  )

  return createPlayerProfile({
    name: tournament.playerName.trim(),
    club: rankingEntry?.club ?? '',
  })
}
