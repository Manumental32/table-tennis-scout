import { createRankingEntry } from '../../utils/dataModels'
import { cleanName, isHeaderLine, splitLines, splitRawLines } from './textUtils'

const FETEMBA_CATEGORY_RE =
  /^(Divisi[oó]n de Honor|(?:Primera|Segunda|Tercera|Cuarta|Quinta|Sexta|S[eé]ptima|Octava) Divisi[oó]n)$/i
const FETEMBA_POSITION_RE = /^(\d{1,4})°$/
const FETEMBA_DATE_RE = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/

function isFetembaRanking(text) {
  return splitRawLines(text).some(
    (line) => /^RATING$/i.test(line) || /^\d{1,4}°\b/.test(line),
  )
}

function toOptionalInt(value) {
  if (value == null || value === '') {
    return null
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

function createFetembaEntry({
  position,
  name,
  club,
  points,
  ratingChange,
  licenseId,
  category,
}) {
  const cleanedName = cleanName(name)

  if (!cleanedName || cleanedName.length < 3) {
    return null
  }

  return createRankingEntry({
    position: toOptionalInt(position),
    name: cleanedName,
    club: cleanName(club),
    points: toOptionalInt(points),
    ratingChange: toOptionalInt(ratingChange),
    licenseId: String(licenseId ?? '').trim(),
    category,
  })
}

function splitLeadingLicense(value) {
  const match = String(value ?? '').match(/^(\d{1,5})\s+(.+,.+)$/)

  if (!match) {
    return { licenseId: '', name: value }
  }

  return {
    licenseId: match[1],
    name: match[2],
  }
}

function parseFetembaTabLine(line, category) {
  const columns = line.split('\t').map((column) => column.trim()).filter(Boolean)

  if (columns.length < 5 || !FETEMBA_POSITION_RE.test(columns[0])) {
    return null
  }

  if (/^\d+$/.test(columns[1]) && columns[2]?.includes(',')) {
    return createFetembaEntry({
      position: columns[0],
      licenseId: columns[1],
      name: columns[2],
      club: columns[3],
      points: columns[4],
      ratingChange: columns[5],
      category,
    })
  }

  if (columns[1]?.includes(',')) {
    const splitName = splitLeadingLicense(columns[1])

    return createFetembaEntry({
      position: columns[0],
      name: splitName.name,
      club: columns[2],
      points: columns[3],
      ratingChange: columns[4],
      licenseId: splitName.licenseId || columns[5],
      category,
    })
  }

  return null
}

function parseFetembaSpacedLine(line, category) {
  const match = line.match(/^(\d{1,4})°\s+(.+)$/)

  if (!match) {
    return null
  }

  const position = match[1]
  const rest = match[2].trim()
  const extractedOrder = rest.match(
    /^(\d{1,5})\s+(.+,.+?)\s+(\d{3,4})\s+(-?\d+)\s*$/,
  )

  if (extractedOrder) {
    const nameAndClub = extractedOrder[2].trim()
    const commaIndex = nameAndClub.indexOf(',')
    const lastName = nameAndClub.slice(0, commaIndex + 1)
    const afterComma = nameAndClub.slice(commaIndex + 1).trim()
    const tokens = afterComma.split(/\s+/)
    const firstName = tokens[0] ?? ''
    const club = tokens.slice(1).join(' ')

    return createFetembaEntry({
      position,
      licenseId: extractedOrder[1],
      name: `${lastName} ${firstName}`.trim(),
      club,
      points: extractedOrder[3],
      ratingChange: extractedOrder[4],
      category,
    })
  }

  const visualOrder = rest.match(/^(.+,.+?)\s+(\d{3,4})\s+(-?\d+)\s+(\d{1,5})\s*$/)

  if (visualOrder) {
    const nameAndClub = visualOrder[1].trim()
    const commaIndex = nameAndClub.indexOf(',')
    const lastName = nameAndClub.slice(0, commaIndex + 1)
    const afterComma = nameAndClub.slice(commaIndex + 1).trim()
    const tokens = afterComma.split(/\s+/)
    const firstName = tokens[0] ?? ''
    const club = tokens.slice(1).join(' ')

    return createFetembaEntry({
      position,
      name: `${lastName} ${firstName}`.trim(),
      club,
      points: visualOrder[2],
      ratingChange: visualOrder[3],
      licenseId: visualOrder[4],
      category,
    })
  }

  return null
}

function parseFetembaRanking(text) {
  const ranking = []
  const warnings = []
  let category = ''

  for (const line of splitRawLines(text)) {
    if (/^RATING$/i.test(line) || FETEMBA_DATE_RE.test(line)) {
      continue
    }

    if (FETEMBA_CATEGORY_RE.test(line)) {
      category = line
      continue
    }

    const entry = parseFetembaTabLine(line, category) ?? parseFetembaSpacedLine(line, category)

    if (entry) {
      ranking.push(entry)
    }
  }

  if (text.trim() && ranking.length === 0) {
    warnings.push('No se pudieron leer jugadores del ranking FETEMBA.')
  }

  return { ranking, warnings }
}

function parseRankingLine(line) {
  const match = line.match(/^\s*(\d+)\s*[.)°º-]?\s+(.+)$/)

  if (!match) {
    return null
  }

  const position = Number.parseInt(match[1], 10)
  let rest = match[2].trim()
  let points = null

  const pointsMatch = rest.match(/(\d{2,5})\s*(?:pts|puntos)?\s*$/i)

  if (pointsMatch) {
    points = Number.parseInt(pointsMatch[1], 10)
    rest = rest.slice(0, pointsMatch.index).trim()
  }

  let name = rest
  let club = ''
  const parenMatch = rest.match(/^(.+?)\s*\(([^)]+)\)\s*$/)

  if (parenMatch) {
    name = parenMatch[1].trim()
    club = parenMatch[2].trim()
  } else {
    const dashMatch = rest.match(/^(.+?)\s+[-–—]\s+(.+)$/)

    if (dashMatch && !/\d/.test(dashMatch[2])) {
      name = dashMatch[1].trim()
      club = dashMatch[2].trim()
    } else {
      const tokens = rest.split(/\s+/)
      const lastToken = tokens[tokens.length - 1]

      if (
        tokens.length >= 3 &&
        lastToken === lastToken.toUpperCase() &&
        lastToken.length <= 12 &&
        /[A-ZÁÉÍÓÚÑ]/.test(lastToken)
      ) {
        club = lastToken
        name = tokens.slice(0, -1).join(' ')
      }
    }
  }

  name = cleanName(name)

  if (!name || name.length < 3) {
    return null
  }

  return createRankingEntry({
    position,
    name,
    club: cleanName(club),
    points,
  })
}

function parseGenericRanking(text) {
  const ranking = []
  const warnings = []

  for (const line of splitLines(text)) {
    if (isHeaderLine(line) || FETEMBA_CATEGORY_RE.test(line)) {
      continue
    }

    const entry = parseRankingLine(line)

    if (entry) {
      ranking.push(entry)
    }
  }

  if (text.trim() && ranking.length === 0) {
    warnings.push('No se pudieron leer jugadores del ranking.')
  }

  return { ranking, warnings }
}

export function parseRanking(text) {
  if (isFetembaRanking(text)) {
    return parseFetembaRanking(text)
  }

  return parseGenericRanking(text)
}
