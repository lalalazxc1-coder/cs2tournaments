import React from 'react';
import { Users, Shield } from 'lucide-react';

const TournamentTeamsList = ({ tournament, onTeamClick }) => {
    return (
        <div className="bg-cs-surface border border-white/5 clip-path-slant p-1 h-full">
            <div className="bg-neutral-900/80 h-full flex flex-col">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-wider">
                        <Users className="w-5 h-5 text-cs-orange" /> Команды <span className="text-cs-text text-sm">({tournament.teams_count || tournament.teams?.length || 0}/{tournament.max_teams})</span>
                    </h2>
                </div>
                <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto flex-grow custom-scrollbar">
                    {tournament.teams?.map((tt, index) => (
                        <div
                            onClick={() => onTeamClick(tt.team_id)}
                            key={tt.id}
                            className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group cursor-pointer"
                        >
                            <span className="text-cs-text font-mono w-6 font-bold">#{index + 1}</span>
                            <div className="w-10 h-10 bg-black/50 flex items-center justify-center border border-white/10 skew-x-[-10deg] group-hover:border-cs-orange/50 transition-colors">
                                {tt.team?.logo_url ? <img src={tt.team.logo_url} alt={tt.team.name} className="w-full h-full object-cover skew-x-[10deg]" /> : <Shield className="w-5 h-5 text-cs-text skew-x-[10deg]" />}
                            </div>
                            <div className="font-black text-white uppercase tracking-tight group-hover:text-cs-orange transition-colors">{tt.team?.name}</div>
                        </div>
                    ))}
                    {(!tournament.teams || tournament.teams.length === 0) && (
                        <div className="p-8 text-center text-cs-text font-bold uppercase tracking-wider">Пока нет зарегистрированных команд</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TournamentTeamsList;
