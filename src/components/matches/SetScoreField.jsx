import { Minus, Plus } from 'lucide-react'

function clampScore(value) {
  const digits = String(value).replace(/\D/g, '').slice(0, 2)

  if (!digits) {
    return ''
  }

  return String(Math.min(99, Number.parseInt(digits, 10)))
}

export default function SetScoreField({ label, value, onChange, isWinner = false }) {
  function step(delta) {
    const current = value === '' ? 0 : Number.parseInt(value, 10) || 0
    onChange(String(Math.min(99, Math.max(0, current + delta))))
  }

  const inputClass = isWinner
    ? 'min-h-12 min-w-0 flex-1 rounded-xl border border-emerald-500 bg-slate-900 text-center text-xl font-semibold text-white outline-none focus:border-emerald-400'
    : 'min-h-12 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 text-center text-xl font-semibold text-white outline-none focus:border-slate-500'

  return (
    <label className="block min-w-0">
      <span
        className="mb-1.5 block truncate text-sm font-medium text-slate-300"
        title={label}
      >
        {label}
      </span>
      <span className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label={`Bajar puntos de ${label}`}
          className="flex min-h-12 min-w-10 items-center justify-center rounded-xl bg-slate-700 text-white"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          autoComplete="off"
          enterKeyHint="done"
          value={value}
          onChange={(event) => onChange(clampScore(event.target.value))}
          onFocus={(event) => event.target.select()}
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => step(1)}
          aria-label={`Subir puntos de ${label}`}
          className="flex min-h-12 min-w-10 items-center justify-center rounded-xl bg-slate-700 text-white"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </span>
    </label>
  )
}
