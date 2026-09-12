export function splitLines(text) {
  return String(text ?? '')
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

export function splitRawLines(text) {
  return String(text ?? '')
    .split(/\r?\n/)
    .map((line) => line.replace(/[^\S\t]+/g, ' ').replace(/\t+/g, '\t').trim())
    .filter(Boolean)
}

export function cleanName(value) {
  return String(value ?? '')
    .replace(/[•·|]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[-–—,:]+/, '')
    .replace(/[-–—,:]+$/, '')
    .trim()
}

export function isHeaderLine(line) {
  const normalized = line.toLowerCase()

  return /^(pos|posicion|posición|nombre|jugador|club|puntos|ranking|categoria|categoría|pagina|página|hoja|horario|fecha)\b/.test(
    normalized,
  )
}

export function stripLeadingIndex(line) {
  return line.replace(/^\d+\s*[.)°º-]?\s+/, '').trim()
}

export function normalizeTime(value) {
  if (!value) {
    return ''
  }

  const [hours, minutes] = String(value).replace('.', ':').split(':')

  if (!hours || !minutes) {
    return ''
  }

  return `${hours.padStart(2, '0')}:${minutes}`
}
