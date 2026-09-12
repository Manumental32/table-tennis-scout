import { createFixtureMatch } from '../../utils/dataModels'
import { getPlayerGroup, namesMatch } from '../../utils/tournaments'
import { normalizeFetembaCategory } from './fetemba'

function involvesPlayer(entry, playerName) {
  return namesMatch(entry.playerA, playerName) || namesMatch(entry.playerB, playerName)
}

function getOpponentName(entry, playerName) {
  if (namesMatch(entry.playerA, playerName)) {
    return entry.playerB
  }

  if (namesMatch(entry.playerB, playerName)) {
    return entry.playerA
  }

  return ''
}

function findScheduledMatch(schedule, playerName, opponentName) {
  return (
    schedule.find((entry) => {
      if (involvesPlayer(entry, playerName) && involvesPlayer(entry, opponentName)) {
        return true
      }

      return !entry.playerA && namesMatch(entry.playerB, opponentName)
    }) ?? null
  )
}

function sortByTime(left, right) {
  if (!left.time) {
    return 1
  }

  if (!right.time) {
    return -1
  }

  return left.time.localeCompare(right.time)
}

function findZonaSlots(schedule, category, zona) {
  const categoryKey = normalizeFetembaCategory(category)

  return schedule
    .filter(
      (entry) =>
        entry.stage === 'zona' &&
        String(entry.zona) === String(zona) &&
        normalizeFetembaCategory(entry.category) === categoryKey,
    )
    .sort((left, right) => {
      const dayOrder = Number(left.day === 'domingo') - Number(right.day === 'domingo')

      if (dayOrder !== 0) {
        return dayOrder
      }

      return (left.time || '').localeCompare(right.time || '')
    })
}

function buildFromSchedule(playerName, schedule) {
  return schedule
    .filter((entry) => involvesPlayer(entry, playerName))
    .map((entry) =>
      createFixtureMatch({
        time: entry.time,
        opponent: getOpponentName(entry, playerName),
        table: entry.table,
        group: '',
      }),
    )
    .sort(sortByTime)
}

export function buildFixture({ playerName, groups, schedule, preferredCategory = '' }) {
  const playerGroup = getPlayerGroup(groups, playerName, preferredCategory)

  if (!playerGroup) {
    return buildFromSchedule(playerName, schedule)
  }

  const opponents = (playerGroup.players ?? []).filter(
    (player) => !namesMatch(player.name, playerName),
  )
  const zonaSlots = findZonaSlots(schedule, playerGroup.category, playerGroup.zona)

  return opponents
    .map((opponent, index) => {
      const namedMatch = findScheduledMatch(schedule, playerName, opponent.name)
      const zonaSlot = zonaSlots[Math.min(index, Math.max(zonaSlots.length - 1, 0))]

      return createFixtureMatch({
        time: namedMatch?.time || zonaSlot?.time || '',
        opponent: opponent.name,
        table: namedMatch?.table || zonaSlot?.table || '',
        group: playerGroup.name,
      })
    })
    .sort(sortByTime)
}
