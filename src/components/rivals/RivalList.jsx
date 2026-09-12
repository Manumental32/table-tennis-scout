import { getOptionLabel, HAND_OPTIONS, PLAY_STYLE_OPTIONS } from '../../utils/labels'
import { HAND, PLAY_STYLE } from '../../utils/constants'

export default function RivalList({ rivals, onSelect }) {
  return (
    <ul className="space-y-3">
      {rivals.map((rival) => {
        const details = [
          rival.club,
          rival.hand !== HAND.UNKNOWN
            ? getOptionLabel(HAND_OPTIONS, rival.hand)
            : '',
          rival.mainStrength !== PLAY_STYLE.UNKNOWN
            ? getOptionLabel(PLAY_STYLE_OPTIONS, rival.mainStrength)
            : '',
        ].filter(Boolean)

        return (
          <li key={rival.id}>
            <button
              type="button"
              onClick={() => onSelect(rival.id)}
              className="w-full rounded-2xl bg-slate-800 px-4 py-4 text-left"
            >
              <p className="text-base font-semibold text-white">{rival.name}</p>
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
