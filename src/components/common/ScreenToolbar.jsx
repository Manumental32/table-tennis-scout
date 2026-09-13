import { ArrowLeft } from 'lucide-react'

export default function ScreenToolbar({ title, onBack }) {
  return (
    <div className="sticky -top-4 z-20 -mx-4 -mt-4 mb-4 flex items-center gap-2 border-b border-slate-800 bg-slate-900 px-4 py-3">
      <button
        type="button"
        onClick={onBack}
        aria-label="Volver"
        className="flex min-h-12 min-w-12 items-center justify-center rounded-xl bg-slate-800 text-white"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <h2 className="flex-1 text-lg font-semibold text-white">{title}</h2>
    </div>
  )
}
