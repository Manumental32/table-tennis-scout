export default function Header({ title }) {
  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-slate-800 bg-slate-900/95 px-4 py-4 backdrop-blur">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        Scout TT
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-white">{title}</h1>
    </header>
  )
}
