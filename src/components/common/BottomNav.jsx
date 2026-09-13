import { CalendarDays, Dumbbell, Home, Swords, Users } from 'lucide-react'
import { VIEWS } from './navigation'

const NAV_ITEMS = [
  { id: VIEWS.DASHBOARD, label: 'Inicio', icon: Home },
  { id: VIEWS.RIVALS, label: 'Rivales', icon: Users },
  { id: VIEWS.MATCHES, label: 'Partidos', icon: Swords },
  { id: VIEWS.TOURNAMENT, label: 'Torneo', icon: CalendarDays },
  { id: VIEWS.TRAININGS, label: 'Entrenar', icon: Dumbbell },
]

export default function BottomNav({ currentView, onNavigate }) {
  return (
    <nav
      aria-label="Navegación principal"
      className="sticky bottom-0 z-30 shrink-0 border-t border-slate-800 bg-slate-900 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-16 w-full flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium ${
                  isActive ? 'text-white' : 'text-slate-400'
                }`}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
