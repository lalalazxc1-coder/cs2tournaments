import { useOutletContext } from 'react-router-dom';

const TournamentRules = () => {
    const { tournament } = useOutletContext();

    return (
        <div className="bg-cs-surface border border-white/5 clip-path-slant p-8 animate-fade-in">
            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-wider">Правила</h3>
            <div className="prose prose-invert max-w-none text-cs-text">
                {tournament.rules ? (
                    <div className="whitespace-pre-wrap font-medium">{tournament.rules}</div>
                ) : (
                    <p className="text-cs-text/50 italic">Правила не указаны</p>
                )}
            </div>
        </div>
    );
};

export default TournamentRules;
