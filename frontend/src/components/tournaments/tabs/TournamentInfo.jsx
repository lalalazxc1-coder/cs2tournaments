import { useOutletContext } from 'react-router-dom';

const TournamentInfo = () => {
    const { tournament } = useOutletContext();

    return (
        <div className="bg-cs-surface border border-white/5 clip-path-slant p-8 animate-fade-in">
            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-wider">О Турнире</h3>
            <div className="w-full">
                <div className="text-cs-text text-lg leading-relaxed">
                    {tournament.description ? (
                        tournament.description.split('\n').map((line, i) => {
                            if (!line.trim()) return <div key={i} className="h-2"></div>;
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                                <p key={i} className="mb-1 text-cs-text">
                                    {parts.map((part, j) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                            return <strong key={j} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                                        }
                                        return part;
                                    })}
                                </p>
                            );
                        })
                    ) : (
                        <p className="text-cs-text/50 italic">Описание отсутствует</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TournamentInfo;
