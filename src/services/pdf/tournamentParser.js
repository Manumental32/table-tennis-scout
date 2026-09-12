import { createPlayerRef } from '../../utils/dataModels'
import { namesMatch, normalizeName } from '../../utils/tournaments'
import { buildFixture } from './fixtureBuilder'
import { parseGroups } from './groupsParser'
import { parseRanking } from './rankingParser'
import { parseTables } from './tablesParser'

function addUniquePlayer(players, candidate) {
  if (!candidate?.name) {
    return
  }

  const existing = players.find((player) => namesMatch(player.name, candidate.name))

  if (existing) {
    if (!existing.club && candidate.club) {
      existing.club = candidate.club
    }

    return
  }

  players.push(
    createPlayerRef({
      name: candidate.name,
      club: candidate.club ?? '',
    }),
  )
}

function collectPlayers(ranking, groups, schedule) {
  const players = []

  ranking.forEach((entry) => addUniquePlayer(players, entry))
  groups.forEach((group) => {
    group.players.forEach((player) => addUniquePlayer(players, player))
  })
  schedule.forEach((entry) => {
    addUniquePlayer(players, { name: entry.playerA })
    addUniquePlayer(players, { name: entry.playerB })
  })

  return players.sort((left, right) =>
    normalizeName(left.name).localeCompare(normalizeName(right.name)),
  )
}

export function parseTournament({
  rankingText = '',
  groupsText = '',
  tablesText = '',
  tablesPages = [],
  playerName = '',
} = {}) {
  const rankingResult = parseRanking(rankingText)
  const groupsResult = parseGroups(groupsText)
  const tablesResult = parseTables(tablesText, tablesPages)
  const players = collectPlayers(
    rankingResult.ranking,
    groupsResult.groups,
    tablesResult.schedule,
  )
  const rankingEntry = rankingResult.ranking.find((entry) =>
    namesMatch(entry.name, playerName),
  )
  const fixture = buildFixture({
    playerName,
    groups: groupsResult.groups,
    schedule: tablesResult.schedule,
    preferredCategory: rankingEntry?.category,
  })
  const warnings = [
    ...rankingResult.warnings,
    ...groupsResult.warnings,
    ...tablesResult.warnings,
  ]

  if (playerName && groupsResult.groups.length > 0 && fixture.length === 0) {
    warnings.push(`No se encontró a ${playerName} en los grupos.`)
  }

  if (fixture.length === 0) {
    warnings.push('El fixture quedó vacío. Completalo a mano antes de confirmar.')
  }

  if (fixture.some((match) => !match.time || !match.table)) {
    warnings.push('Algunos partidos no tienen hora o mesa. Revisalos antes de confirmar.')
  }

  return {
    ranking: rankingResult.ranking,
    groups: groupsResult.groups,
    tables: tablesResult.tables,
    schedule: tablesResult.schedule,
    matches: tablesResult.schedule,
    players,
    fixture,
    warnings,
  }
}
