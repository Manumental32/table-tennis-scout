import { parseTournament } from './tournamentParser'

async function loadExtractor() {
  return import('./pdfExtractor')
}

async function resolveSourceText(file, fallbackText) {
  if (file) {
    const { extractPdfText } = await loadExtractor()
    return extractPdfText(file)
  }

  return String(fallbackText ?? '')
}

export function createPdfMetaFromFile(file) {
  if (!file) {
    return null
  }

  return {
    fileName: file.name,
    size: file.size,
  }
}

export async function processTournamentSources({
  rankingFile,
  groupsFile,
  tablesFile,
  rankingText = '',
  groupsText = '',
  tablesText = '',
  playerName = '',
}) {
  let tablesPages = []
  let resolvedTablesText = tablesText

  if (tablesFile) {
    const { extractPdfPages } = await loadExtractor()
    tablesPages = await extractPdfPages(tablesFile)
    resolvedTablesText = tablesPages.map((page) => page.text).filter(Boolean).join('\n')
  }

  const extracted = {
    ranking: await resolveSourceText(rankingFile, rankingText),
    groups: await resolveSourceText(groupsFile, groupsText),
    tables: resolvedTablesText,
  }
  const parsed = parseTournament({
    rankingText: extracted.ranking,
    groupsText: extracted.groups,
    tablesText: extracted.tables,
    tablesPages,
    playerName,
  })

  return {
    extracted,
    ...parsed,
  }
}
