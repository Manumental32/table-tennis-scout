import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = workerUrl

function joinLineItems(items) {
  const sortedItems = [...items].sort((left, right) => left.x - right.x)

  if (sortedItems.length === 0) {
    return ''
  }

  let line = sortedItems[0].str

  for (let index = 1; index < sortedItems.length; index += 1) {
    const gap = sortedItems[index].x - sortedItems[index - 1].x
    line += gap > 6 ? '\t' : ' '
    line += sortedItems[index].str
  }

  return line.replace(/[^\S\t]+/g, ' ').replace(/\t+/g, '\t').trim()
}

function itemsToText(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return ''
  }

  const rows = items
    .filter((item) => typeof item.str === 'string' && item.str.length > 0)
    .map((item) => ({
      str: item.str,
      x: item.transform?.[4] ?? 0,
      y: Math.round(item.transform?.[5] ?? 0),
      hasEOL: Boolean(item.hasEOL),
    }))
    .sort((left, right) => right.y - left.y || left.x - right.x)

  const lines = []
  let currentY = null
  let currentItems = []

  for (const item of rows) {
    if (currentY === null || Math.abs(item.y - currentY) > 5) {
      if (currentItems.length > 0) {
        lines.push(joinLineItems(currentItems))
      }

      currentItems = [item]
      currentY = item.y
    } else {
      currentItems.push(item)
    }

    if (item.hasEOL) {
      lines.push(joinLineItems(currentItems))
      currentItems = []
      currentY = null
    }
  }

  if (currentItems.length > 0) {
    lines.push(joinLineItems(currentItems))
  }

  return lines.filter(Boolean).join('\n')
}

export function collectPageItems(items) {
  if (!Array.isArray(items)) {
    return []
  }

  return items
    .filter((item) => typeof item.str === 'string' && item.str.trim().length > 0)
    .map((item) => ({
      str: item.str.trim(),
      x: item.transform?.[4] ?? 0,
      y: item.transform?.[5] ?? 0,
    }))
}

async function loadPdf(file) {
  const data = await file.arrayBuffer()
  return getDocument({ data }).promise
}

export async function extractPdfPages(file) {
  if (!file) {
    return []
  }

  const pdf = await loadPdf(file)
  const pages = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const items = collectPageItems(content.items)
    pages.push({
      pageNumber,
      items,
      text: itemsToText(content.items),
    })
  }

  return pages
}

export async function extractPdfText(file) {
  if (!file) {
    return ''
  }

  const pages = await extractPdfPages(file)
  return pages
    .map((page) => page.text)
    .filter(Boolean)
    .join('\n')
}
