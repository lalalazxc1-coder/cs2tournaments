import { useOutletContext, useNavigate } from 'react-router-dom';
import TournamentTeamsList from '../TournamentTeamsList';

const TournamentTeams = () => {
    const { tournament } = useOutletContext();
    const navigate = useNavigate();

    const handleTeamClick = (teamId) => {
        if (!teamId) return;
        window.open(`/teams/${teamId}`, '_blank');
    };

    return (
        <div className="animate-fade-in">
            <TournamentTeamsList
                tournament={tournament}
                onTeamClick={handleTeamClick}
            />
        </div>
    );
};

export default TournamentTeams;
