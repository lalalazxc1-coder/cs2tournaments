import { useOutletContext } from 'react-router-dom';
import { DollarSign, Shield } from 'lucide-react';

const TournamentPrize = () => {
    const { tournament, standings } = useOutletContext();

    let distribution = [];
    try {
        distribution = typeof tournament.prize_distribution === 'string'
            ? JSON.parse(tournament.prize_distribution)
            : tournament.prize_distribution || [];
    } catch (e) { distribution = [] }

    return (
        <div className="bg-cs-surface border border-white/5 clip-path-slant p-8 animate-fade-in">
            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-wider flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-green-400" />
                Призовой Фонд
            </h3>
            {distribution && distribution.length > 0 ? (
                <div className="max-w-md">
                    <div className="space-y-2 mb-6">
                        {distribution.map((item, idx) => {
                            // Try to match place string (e.g., "1st", "2nd") to standings keys
                            const placeKey = item.place.toLowerCase().replace('th', '').replace('st', '').replace('nd', '').replace('rd', '');
                            let team = null;

                            // Direct map or fuzzy match
                            if (standings) {
                                if (standings[item.place]) team = standings[item.place];
                                else if (standings[placeKey]) team = standings[placeKey];
                                else if (item.place.includes('1')) team = standings['1st'];
                                else if (item.place.includes('2')) team = standings['2nd'];
                                else if (item.place.includes('3')) team = standings['3rd'];
                                else if (item.place.includes('4')) team = standings['4th'];
                            }

                            return (
                                <div key={idx} className={`flex justify-between items-center p-4 border border-white/5 ${team ? 'bg-cs-orange/10 border-cs-orange/30' : 'bg-black/20'}`}>
                                    <div className="flex items-center gap-4">
                                        <span className={`font-black uppercase tracking-wider text-lg ${team ? 'text-cs-orange' : 'text-cs-text'}`}>{item.place}</span>
                                        {team && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-black/50 flex items-center justify-center border border-white/10">
                                                    {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-cover" /> : <Shield className="w-3 h-3 text-gray-500" />}
                                                </div>
                                                <span className="text-white font-bold">{team.name}</span>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-white font-bold text-xl">{parseInt(item.amount).toLocaleString()} ₸</span>
                                </div>
                            );
                        })}
                        <div className="border-t border-white/10 pt-4 mt-4 flex justify-between items-center text-2xl font-black text-cs-orange">
                            <span>Всего</span>
                            <span>{tournament.prize_pool ? parseInt(tournament.prize_pool).toLocaleString() : 0} ₸</span>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-cs-text">Призовой фонд не указан</p>
            )}
        </div>
    );
};

export default TournamentPrize;
