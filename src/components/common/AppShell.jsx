import BottomNav from './BottomNav'
import Header from './Header'
import { getViewTitle } from './navigation'

export default function AppShell({
  currentView,
  onNavigate,
  title,
  showNav = true,
  children,
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col bg-slate-900">
      <Header title={title ?? getViewTitle(currentView)} />
      <main id="app-content" className="flex-1 overflow-y-auto px-4 py-4">
        {children}
      </main>
      {showNav ? <BottomNav currentView={currentView} onNavigate={onNavigate} /> : null}
    </div>
  )
}
