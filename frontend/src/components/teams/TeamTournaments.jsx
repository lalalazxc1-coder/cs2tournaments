import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';

const TeamTournaments = ({ team }) => {
    const navigate = useNavigate();

    return (
        <>
            <div className="p-6 border-b border-white/5 flex-shrink-0">
                <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-wider">
                    <Trophy className="w-5 h-5 text-cs-orange" /> История Турниров
                </h2>
            </div>
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                {team.tournamentEntries && team.tournamentEntries.length > 0 ? (
                    team.tournamentEntries.map(entry => (
                        <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-black/50 flex items-center justify-center border border-white/10 skew-x-[-10deg]">
                                    <Trophy className="w-5 h-5 text-cs-orange skew-x-[10deg]" />
                                </div>
                                <div>
                                    <div className="font-black text-white uppercase tracking-tight group-hover:text-cs-orange transition-colors">
                                        {entry.tournament?.name || 'Unknown Tournament'}
                                    </div>
                                    <div className="text-xs text-cs-text font-mono uppercase">
                                        {entry.tournament?.start_date ? new Date(entry.tournament.start_date).toLocaleDateString() : 'TBA'} • {entry.tournament?.status}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => navigate(`/tournaments/${entry.tournament?.id}`)} className="text-cs-text hover:text-white px-3 py-1 border border-white/10 hover:border-white/30 text-xs font-bold uppercase skew-x-[-10deg] transition-all">
                                <span className="skew-x-[10deg]">Info</span>
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-cs-text font-bold uppercase tracking-wider">
                        Команда еще не участвовала в турнирах
                    </div>
                )}
            </div>
        </>
    );
};

export default TeamTournaments;
