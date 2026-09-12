export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center px-2 py-16 text-center">
      {Icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-300">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
      ) : null}
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-300">
        {description}
      </p>
    </div>
  )
}
