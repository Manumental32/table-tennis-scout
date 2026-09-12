const CATEGORY_DEFS = [
  {
    key: 'DH',
    short: 'DH',
    display: 'División de Honor',
    labels: ['division de honor', 'división de honor', 'dh'],
  },
  {
    key: '1RA',
    short: '1RA',
    display: '1ra',
    labels: ['primera division', 'primera división', '1ra'],
  },
  {
    key: '2DA',
    short: '2DA',
    display: '2da',
    labels: ['segunda division', 'segunda división', '2da'],
  },
  {
    key: '3RA',
    short: '3RA',
    display: '3ra',
    labels: ['tercera division', 'tercera división', '3ra'],
  },
  {
    key: '4TA',
    short: '4TA',
    display: '4ta',
    labels: ['cuarta division', 'cuarta división', '4ta'],
  },
  {
    key: '5TA',
    short: '5TA',
    display: '5ta',
    labels: ['quinta division', 'quinta división', '5ta'],
  },
  {
    key: '6TA',
    short: '6TA',
    display: '6ta',
    labels: ['sexta division', 'sexta división', '6ta'],
  },
  {
    key: '7MA',
    short: '7MA',
    display: '7ma',
    labels: ['septima division', 'séptima división', '7ma'],
  },
  {
    key: '8VA',
    short: '8VA',
    display: '8va',
    labels: ['octava division', 'octava división', '8va'],
  },
]

function normalizeLabel(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeFetembaCategory(value) {
  const normalized = normalizeLabel(value)

  if (!normalized) {
    return ''
  }

  const match = CATEGORY_DEFS.find(
    (category) =>
      category.key === String(value ?? '').toUpperCase() ||
      category.labels.some((label) => normalized === label || normalized.includes(label)),
  )

  return match?.key ?? ''
}

export function formatFetembaCategory(value) {
  const key = normalizeFetembaCategory(value)
  return CATEGORY_DEFS.find((category) => category.key === key)?.display ?? value
}

export function formatFetembaGroupName(category, zona) {
  const label = formatFetembaCategory(category)
  return zona ? `${label} · Zona ${zona}` : label
}

export function parseZonaRange(value) {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')

  if (!normalized) {
    return []
  }

  if (normalized === 'TODAS') {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  }

  const rangeMatch = normalized.match(/^(\d+)\s+A\s+(\d+)$/)

  if (rangeMatch) {
    const start = Number.parseInt(rangeMatch[1], 10)
    const end = Number.parseInt(rangeMatch[2], 10)
    const zonas = []

    for (let zona = start; zona <= end; zona += 1) {
      zonas.push(zona)
    }

    return zonas
  }

  const pairMatch = normalized.match(/^(\d+)\s+Y\s+(\d+)$/)

  if (pairMatch) {
    return [Number.parseInt(pairMatch[1], 10), Number.parseInt(pairMatch[2], 10)]
  }

  if (/^\d+$/.test(normalized)) {
    return [Number.parseInt(normalized, 10)]
  }

  return []
}

export function isFetembaGroupsText(text) {
  return /siembra zonas|\bzona\s+\d+\b|categoria\s+/i.test(text)
}

export function isFetembaTablesText(text) {
  return /mesa\s+1\b.*mesa\s+2\b|super serie|n° de zona|zona\s+\d+/i.test(text)
}
