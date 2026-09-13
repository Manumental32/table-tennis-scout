import MatchDetail from '../components/matches/MatchDetail'
import ScreenToolbar from '../components/common/ScreenToolbar'
import { isCoachedMatch } from '../utils/matches'

export default function MatchPage({
  match,
  rival,
  teammate,
  tournament,
  onBack,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <ScreenToolbar
        title={isCoachedMatch(match) ? 'Coucheo' : 'Partido'}
        onBack={onBack}
      />
      <MatchDetail
        match={match}
        rival={rival}
        teammate={teammate}
        tournament={tournament}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  )
}
