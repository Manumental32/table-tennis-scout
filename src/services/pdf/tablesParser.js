import { createScheduleEntry } from '../../utils/dataModels'
import {
  isFetembaTablesText,
  normalizeFetembaCategory,
  parseZonaRange,
} from './fetemba'
import { cleanName, normalizeTime, splitLines } from './textUtils'

const TIME_RE = /\b(\d{1,2}[:.]\d{2})\b/
const TABLE_RE = /\bmesa\s*(\d+)\b/i
const CATEGORY_SHORT_RE = /^(DH|1RA|2DA|3RA|4TA|5TA|6TA|7MA|8VA)$/
const ZONA_RE = /^ZONA\s+(\d+)$/i
const KNOCKOUT_RE = /^(16°|8°|4°|SE|FI)\s+(DH|1RA|2DA|3RA|4TA|5TA|6TA|7MA|8VA)$/
const MESA_HEADER_RE = /^MESA\s+(\d+)$/i

function nearestBy(items, value, readValue) {
  if (items.length === 0) {
    return null
  }

  return items.reduce((best, item) => {
    const bestDistance = Math.abs(readValue(best) - value)
    const itemDistance = Math.abs(readValue(item) - value)
    return itemDistance < bestDistance ? item : best
  })
}

function detectDay(items) {
  const footer = items.find((item) => /s[aá]bado/i.test(item.str) || /domingo/i.test(item.str))

  if (!footer) {
    return ''
  }

  if (/s[aá]bado/i.test(footer.str)) {
    return 'sábado'
  }

  if (/domingo/i.test(footer.str)) {
    return 'domingo'
  }

  return ''
}

function parseGridPage(items) {
  const mesas = items
    .filter((item) => MESA_HEADER_RE.test(item.str))
    .map((item) => ({
      number: MESA_HEADER_RE.exec(item.str)[1],
      x: item.x,
    }))

  if (mesas.length === 0) {
    return []
  }

  const times = items
    .filter((item) => item.x < 30 && /^\d{1,2}:\d{2}$/.test(item.str))
    .map((item) => ({
      time: normalizeTime(item.str),
      y: item.y,
    }))
  const categories = items.filter((item) => CATEGORY_SHORT_RE.test(item.str))
  const zonas = items.filter((item) => ZONA_RE.test(item.str))
  const knockouts = items.filter((item) => KNOCKOUT_RE.test(item.str))
  const day = detectDay(items)
  const schedule = []

  for (const zonaItem of zonas) {
    const zonaMatch = zonaItem.str.match(ZONA_RE)
    const categoryItem = categories
      .filter(
        (item) =>
          Math.abs(item.x - zonaItem.x) < 22 &&
          item.y > zonaItem.y &&
          item.y - zonaItem.y < 28,
      )
      .sort((left, right) => left.y - right.y)[0]

    if (!categoryItem || !zonaMatch) {
      continue
    }

    const mesa = nearestBy(mesas, zonaItem.x, (item) => item.x)
    const time = nearestBy(times, categoryItem.y, (item) => item.y)

    schedule.push(
      createScheduleEntry({
        time: time?.time ?? '',
        table: mesa?.number ?? '',
        category: categoryItem.str,
        zona: zonaMatch[1],
        stage: 'zona',
        day,
      }),
    )
  }

  for (const knockoutItem of knockouts) {
    const knockoutMatch = knockoutItem.str.match(KNOCKOUT_RE)
    const mesa = nearestBy(mesas, knockoutItem.x, (item) => item.x)
    const time = nearestBy(times, knockoutItem.y, (item) => item.y)

    schedule.push(
      createScheduleEntry({
        time: time?.time ?? '',
        table: mesa?.number ?? '',
        category: knockoutMatch[2],
        zona: '',
        stage: knockoutMatch[1],
        day,
      }),
    )
  }

  return schedule
}

function parseHorariosSummary(items) {
  const categoryItems = items.filter((item) => normalizeFetembaCategory(item.str))
  const timeItems = items.filter(
    (item) => item.x > 280 && /^\d{1,2}:\d{2}$/.test(item.str),
  )
  const zonaItems = items.filter((item) => parseZonaRange(item.str).length > 0)
  const schedule = []

  for (const zonaItem of zonaItems) {
    const timeItem = timeItems.find((item) => Math.abs(item.y - zonaItem.y) < 4)

    if (!timeItem) {
      continue
    }

    const categoryItem = categoryItems
      .filter((item) => Math.abs(item.x - zonaItem.x) < 220 && Math.abs(item.y - zonaItem.y) < 55)
      .sort(
        (left, right) =>
          Math.abs(left.y - zonaItem.y) - Math.abs(right.y - zonaItem.y),
      )[0]

    if (!categoryItem) {
      continue
    }

    const day = zonaItem.x < 400 ? 'sábado' : 'domingo'

    for (const zona of parseZonaRange(zonaItem.str)) {
      schedule.push(
        createScheduleEntry({
          time: normalizeTime(timeItem.str),
          table: '',
          category: categoryItem.str,
          zona: String(zona),
          stage: 'zona',
          day,
        }),
      )
    }
  }

  return schedule
}

function isSameZonaSlot(left, right) {
  return (
    left.stage === 'zona' &&
    right.stage === 'zona' &&
    left.day === right.day &&
    left.zona === right.zona &&
    normalizeFetembaCategory(left.category) === normalizeFetembaCategory(right.category)
  )
}

function mergeZonaSlots(summary, grid) {
  const merged = grid.map((entry) => ({ ...entry }))

  for (const entry of summary) {
    const existing = merged.find((item) => isSameZonaSlot(item, entry))

    if (!existing) {
      merged.push({ ...entry })
      continue
    }

    if (!existing.table && entry.table) {
      existing.table = entry.table
    }

    if (entry.time && (!existing.time || entry.time < existing.time)) {
      existing.time = entry.time
    }
  }

  return merged
}

function isSummaryPage(items) {
  return items.some((item) => /n° de zona|horarios super serie/i.test(item.str))
}

function parseFetembaTables(text, pages = []) {
  const warnings = []
  const fromGrid = pages
    .filter((page) => (page.items ?? []).some((item) => MESA_HEADER_RE.test(item.str)))
    .flatMap((page) => parseGridPage(page.items ?? []))
  const fromSummary = pages
    .filter((page) => isSummaryPage(page.items ?? []))
    .flatMap((page) => parseHorariosSummary(page.items ?? []))
  const knockoutEntries = fromGrid.filter((entry) => entry.stage !== 'zona')
  const schedule = [
    ...mergeZonaSlots(
      fromSummary,
      fromGrid.filter((entry) => entry.stage === 'zona'),
    ),
    ...knockoutEntries,
  ]
  const tableNumbers = [
    ...new Set(schedule.map((entry) => entry.table).filter(Boolean)),
  ]

  if (text.trim() && schedule.length === 0) {
    warnings.push('No se pudieron leer horarios ni mesas del cronograma FETEMBA.')
  }

  return {
    schedule,
    tables: tableNumbers.map((number) => ({ number })),
    warnings,
  }
}

function parseScheduleLine(line, currentTable) {
  const timeMatch = line.match(TIME_RE)
  const tableMatch = line.match(TABLE_RE)
  const table = tableMatch?.[1] ?? currentTable ?? ''
  const rest = line
    .replace(TIME_RE, ' ')
    .replace(TABLE_RE, ' ')
    .replace(/[—–]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()

  if (!rest) {
    return null
  }

  const vsOnlyMatch = rest.match(/^(?:vs\.?|contra)\s+(.+)$/i)

  if (vsOnlyMatch) {
    return createScheduleEntry({
      time: normalizeTime(timeMatch?.[1]),
      table,
      playerA: '',
      playerB: cleanName(vsOnlyMatch[1]),
    })
  }

  const vsParts = rest.split(/\s+(?:vs\.?|v\/|contra)\s+/i)

  if (vsParts.length === 2) {
    return createScheduleEntry({
      time: normalizeTime(timeMatch?.[1]),
      table,
      playerA: cleanName(vsParts[0]),
      playerB: cleanName(vsParts[1]),
    })
  }

  const dashParts = rest.split(/\s+-\s+/)

  if (
    dashParts.length === 2 &&
    dashParts[0].length > 2 &&
    dashParts[1].length > 2 &&
    (timeMatch || table)
  ) {
    return createScheduleEntry({
      time: normalizeTime(timeMatch?.[1]),
      table,
      playerA: cleanName(dashParts[0]),
      playerB: cleanName(dashParts[1]),
    })
  }

  return null
}

function parseGenericTables(text) {
  const schedule = []
  const tableNumbers = []
  const warnings = []
  let currentTable = ''

  for (const line of splitLines(text)) {
    const tableOnlyMatch = line.match(/^mesa\s+(\d+)\s*$/i)

    if (tableOnlyMatch) {
      currentTable = tableOnlyMatch[1]

      if (!tableNumbers.includes(currentTable)) {
        tableNumbers.push(currentTable)
      }

      continue
    }

    const entry = parseScheduleLine(line, currentTable)

    if (!entry) {
      continue
    }

    schedule.push(entry)

    if (entry.table && !tableNumbers.includes(entry.table)) {
      tableNumbers.push(entry.table)
    }
  }

  if (text.trim() && schedule.length === 0) {
    warnings.push('No se pudieron leer horarios ni mesas.')
  }

  return {
    schedule,
    tables: tableNumbers.map((number) => ({ number })),
    warnings,
  }
}

export function parseTables(text, pages = []) {
  if (pages.length > 0 || isFetembaTablesText(text)) {
    return parseFetembaTables(text, pages)
  }

  return parseGenericTables(text)
}
