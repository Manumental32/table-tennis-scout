import { createPlayerRef, createTournamentGroup } from '../../utils/dataModels'
import {
  formatFetembaGroupName,
  isFetembaGroupsText,
  normalizeFetembaCategory,
} from './fetemba'
import { cleanName, isHeaderLine, splitLines, splitRawLines, stripLeadingIndex } from './textUtils'

function matchGroupHeader(line) {
  const zonaMatch = line.match(/^zona\s+(\d+)\b/i)

  if (zonaMatch) {
    return zonaMatch[1]
  }

  const groupMatch = line.match(/^(?:grupo|group)\s+([a-z0-9]+)\b/i)
  return groupMatch?.[1]?.toUpperCase() ?? null
}

function parseFetembaPlayerLine(line) {
  if (matchGroupHeader(line) || /^categoria\b/i.test(line) || /^siembra\b/i.test(line)) {
    return null
  }

  const columns = line.split('\t').map((column) => column.trim()).filter(Boolean)

  if (columns.length >= 2 && columns[0].includes(',')) {
    return createPlayerRef({
      name: cleanName(columns[0]),
      club: cleanName(columns[1]),
    })
  }

  const spacedMatch = line.match(/^(.+,.+?)\s{2,}(.+)$/)

  if (spacedMatch) {
    return createPlayerRef({
      name: cleanName(spacedMatch[1]),
      club: cleanName(spacedMatch[2]),
    })
  }

  return null
}

function parseFetembaGroups(text) {
  const groups = []
  const warnings = []
  let category = ''
  let currentGroup = null

  for (const line of splitRawLines(text)) {
    if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(line) || /^siembra\b/i.test(line)) {
      continue
    }

    const categoryMatch = line.match(/^categoria\s+(.+)$/i)

    if (categoryMatch) {
      category = categoryMatch[1].trim()
      currentGroup = null
      continue
    }

    const zona = matchGroupHeader(line)

    if (zona) {
      const name = formatFetembaGroupName(category, zona)
      currentGroup =
        groups.find(
          (group) =>
            group.zona === zona &&
            normalizeFetembaCategory(group.category) ===
              normalizeFetembaCategory(category),
        ) ?? null

      if (!currentGroup) {
        currentGroup = createTournamentGroup({
          name,
          category,
          zona,
          players: [],
        })
        groups.push(currentGroup)
      }

      continue
    }

    if (!currentGroup) {
      continue
    }

    const player = parseFetembaPlayerLine(line)

    if (player) {
      currentGroup.players.push(player)
    }
  }

  if (text.trim() && groups.length === 0) {
    warnings.push('No se pudieron leer las zonas del sembrado FETEMBA.')
  }

  return { groups, warnings }
}

function parsePlayerLine(line) {
  if (matchGroupHeader(line) || isHeaderLine(line)) {
    return null
  }

  if (/^mesa\b/i.test(line) || /\bvs\.?\b/i.test(line) || /^\d{1,2}[:.]\d{2}/.test(line)) {
    return null
  }

  let rest = stripLeadingIndex(line)
  let club = ''
  const parenMatch = rest.match(/^(.+?)\s*\(([^)]+)\)\s*$/)

  if (parenMatch) {
    rest = parenMatch[1]
    club = parenMatch[2]
  }

  rest = cleanName(rest)

  if (!rest || rest.length < 3) {
    return null
  }

  if (/^(grupo|group|mesa|horario|fecha|categoria|categoría|zona)/i.test(rest)) {
    return null
  }

  return createPlayerRef({
    name: rest,
    club: cleanName(club),
  })
}

function parseGenericGroups(text) {
  const groups = []
  const warnings = []
  let currentGroup = null

  for (const line of splitLines(text)) {
    const groupKey = matchGroupHeader(line)

    if (groupKey) {
      currentGroup = createTournamentGroup({
        name: `Grupo ${groupKey}`,
        players: [],
      })
      groups.push(currentGroup)
      continue
    }

    if (!currentGroup) {
      continue
    }

    const player = parsePlayerLine(line)

    if (player) {
      currentGroup.players.push(player)
    }
  }

  if (text.trim() && groups.length === 0) {
    warnings.push('No se pudieron leer grupos.')
  }

  return { groups, warnings }
}

export function parseGroups(text) {
  if (isFetembaGroupsText(text)) {
    return parseFetembaGroups(text)
  }

  return parseGenericGroups(text)
}
