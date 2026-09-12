import { useState } from 'react'
import { OptionalSection } from '../common/FormField'

function getStoredFileName(pdfMeta) {
  return pdfMeta?.fileName || ''
}

function PdfSlot({ label, description, storedName, selectedName, onChange }) {
  return (
    <label className="block rounded-2xl bg-slate-800 px-4 py-4">
      <span className="block text-sm font-semibold text-white">{label}</span>
      <span className="mt-1 block text-sm text-slate-300">{description}</span>
      <span className="mt-2 block text-sm text-slate-400">
        {selectedName || storedName || 'Ningún archivo'}
      </span>
      <input
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <span className="mt-3 flex min-h-12 items-center justify-center rounded-xl bg-slate-700 text-sm font-medium text-white">
        Elegir PDF
      </span>
    </label>
  )
}

export default function TournamentPdfUpload({
  tournament,
  onProcess,
  onManual,
  onUseSample,
  isProcessing,
  error,
}) {
  const [files, setFiles] = useState({
    ranking: null,
    groups: null,
    tables: null,
  })
  const [pasted, setPasted] = useState({
    ranking: tournament.extractedTexts?.ranking ?? '',
    groups: tournament.extractedTexts?.groups ?? '',
    tables: tournament.extractedTexts?.tables ?? '',
  })

  function handleFileChange(key, file) {
    setFiles((current) => ({ ...current, [key]: file }))
  }

  function handlePasteChange(event) {
    const { name, value } = event.target
    setPasted((current) => ({ ...current, [name]: value }))
  }

  function handleProcess() {
    onProcess({
      rankingFile: files.ranking,
      groupsFile: files.groups,
      tablesFile: files.tables,
      rankingText: pasted.ranking,
      groupsText: pasted.groups,
      tablesText: pasted.tables,
    })
  }

  return (
    <div className="space-y-4">
      <PdfSlot
        label="Ranking"
        description="Lista de jugadores y puntos."
        storedName={getStoredFileName(tournament.rankingPdf)}
        selectedName={files.ranking?.name ?? ''}
        onChange={(file) => handleFileChange('ranking', file)}
      />
      <PdfSlot
        label="Grupos"
        description="Quién está en cada grupo."
        storedName={getStoredFileName(tournament.groupsPdf)}
        selectedName={files.groups?.name ?? ''}
        onChange={(file) => handleFileChange('groups', file)}
      />
      <PdfSlot
        label="Mesas"
        description="Horarios y número de mesa."
        storedName={getStoredFileName(tournament.tablesPdf)}
        selectedName={files.tables?.name ?? ''}
        onChange={(file) => handleFileChange('tables', file)}
      />

      <OptionalSection
        title="Pegar texto"
        description="Si el PDF no se lee bien, pegá el contenido."
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Texto de ranking
          </span>
          <textarea
            name="ranking"
            value={pasted.ranking}
            onChange={handlePasteChange}
            className="min-h-28 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-white outline-none placeholder:text-slate-500 focus:border-slate-500"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Texto de grupos
          </span>
          <textarea
            name="groups"
            value={pasted.groups}
            onChange={handlePasteChange}
            className="min-h-28 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-white outline-none placeholder:text-slate-500 focus:border-slate-500"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Texto de mesas
          </span>
          <textarea
            name="tables"
            value={pasted.tables}
            onChange={handlePasteChange}
            className="min-h-28 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-white outline-none placeholder:text-slate-500 focus:border-slate-500"
          />
        </label>
      </OptionalSection>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        type="button"
        onClick={handleProcess}
        disabled={isProcessing}
        className="min-h-14 w-full rounded-2xl bg-white text-base font-semibold text-slate-900 disabled:opacity-60"
      >
        {isProcessing ? 'Procesando…' : 'Procesar y armar fixture'}
      </button>
      <button
        type="button"
        onClick={onManual}
        disabled={isProcessing}
        className="min-h-14 w-full rounded-2xl bg-slate-800 text-base font-semibold text-white disabled:opacity-60"
      >
        Armar fixture a mano
      </button>
      <button
        type="button"
        onClick={onUseSample}
        disabled={isProcessing}
        className="min-h-12 w-full text-sm font-medium text-slate-300 disabled:opacity-60"
      >
        Probar con un ejemplo
      </button>
    </div>
  )
}
