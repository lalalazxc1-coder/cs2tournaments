import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import TournamentBracket from '../TournamentBracket';

const TournamentBracketPage = () => {
    const { tournament, isOrganizer, bracketData, handleUpdateMatch } = useOutletContext();
    const location = useLocation();
    const navigate = useNavigate();

    const handleTeamClick = (teamId) => {
        if (!teamId) return;
        window.open(`/teams/${teamId}`, '_blank');
    };

    return (
        <div className="bg-cs-surface border border-white/5 clip-path-slant p-1 h-full min-h-[600px] animate-fade-in">
            <div className="bg-neutral-900/80 h-full flex flex-col p-6 overflow-hidden">
                <div className="w-full flex-grow flex flex-col">
                    <div className="flex-grow overflow-x-auto custom-scrollbar">
                        <TournamentBracket
                            matches={bracketData}
                            format={tournament.format}
                            isOrganizer={isOrganizer}
                            onUpdateMatch={handleUpdateMatch}
                            onTeamClick={handleTeamClick}
                            currentPath={location.pathname}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentBracketPage;
