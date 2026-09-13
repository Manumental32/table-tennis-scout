export default function TrainingList({ trainings, onSelect }) {
  return (
    <ul className="space-y-3">
      {trainings.map((training) => {
        const details = [
          training.groupName && training.groupName !== training.name
            ? training.groupName
            : '',
          training.players.length > 0 ? `${training.players.length} jugadores` : '',
          training.drills.length > 0 ? `${training.drills.length} ejercicios` : '',
        ].filter(Boolean)

        return (
          <li key={training.id}>
            <button
              type="button"
              onClick={() => onSelect(training.id)}
              className="w-full rounded-2xl bg-slate-800 px-4 py-4 text-left"
            >
              <p className="text-base font-semibold text-white">{training.name}</p>
              {details.length > 0 ? (
                <p className="mt-1 text-sm text-slate-300">{details.join(' · ')}</p>
              ) : null}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
