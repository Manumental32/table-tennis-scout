import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  SAMPLE_GROUPS_TEXT,
  SAMPLE_RANKING_TEXT,
  SAMPLE_TABLES_TEXT,
} from '../src/services/pdf/sampleTexts.js'

function escapePdfText(text) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function buildPdf(text) {
  const lines = text.split('\n')
  const contentLines = ['BT', '/F1 12 Tf', '50 760 Td', '16 TL']

  for (const line of lines) {
    contentLines.push(`(${escapePdfText(line)}) Tj`)
    contentLines.push('T*')
  }

  contentLines.push('ET')
  const stream = `${contentLines.join('\n')}\n`
  const objects = {
    1: '<< /Type /Catalog /Pages 2 0 R >>',
    2: '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    3: '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    4: `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`,
    5: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  }

  let pdf = '%PDF-1.4\n'
  const offsets = [0]

  for (let index = 1; index <= 5; index += 1) {
    offsets[index] = Buffer.byteLength(pdf)
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`
  }

  const xrefStart = Buffer.byteLength(pdf)
  pdf += 'xref\n0 6\n0000000000 65535 f \n'

  for (let index = 1; index <= 5; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`
  }

  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`
  return pdf
}

const outputDir = path.resolve(process.cwd(), 'public/sample-pdfs')
await mkdir(outputDir, { recursive: true })

const files = [
  ['ranking.pdf', SAMPLE_RANKING_TEXT],
  ['groups.pdf', SAMPLE_GROUPS_TEXT],
  ['tables.pdf', SAMPLE_TABLES_TEXT],
]

for (const [fileName, text] of files) {
  await writeFile(path.join(outputDir, fileName), buildPdf(text))
}

console.log(`Sample PDFs written to ${outputDir}`)
