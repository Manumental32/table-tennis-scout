import RivalProfile from '../components/rivals/RivalProfile'
import ScreenToolbar from '../components/common/ScreenToolbar'

export default function RivalPage({
  rival,
  record,
  onBack,
  onEdit,
  onDelete,
  onOpenScouting,
}) {
  return (
    <>
      <ScreenToolbar title="Perfil" onBack={onBack} />
      <RivalProfile
        rival={rival}
        record={record}
        onEdit={onEdit}
        onDelete={onDelete}
        onOpenScouting={onOpenScouting}
      />
    </>
  )
}
