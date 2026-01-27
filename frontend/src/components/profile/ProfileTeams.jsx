import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Shield, Users, Trophy, Calendar } from 'lucide-react';

const ProfileTeams = () => {
    const { profile, isOwner } = useOutletContext();
    const teams = profile.teams || [];

    return (
        <div className="bg-cs-surface border border-white/10 p-6 clip-path-slant relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10">
                {teams.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {teams.map(team => (
                            <Link
                                key={team.id}
                                to={`/teams/${team.id}`}
                                className="group relative bg-black/20 border border-white/5 hover:border-cs-orange/50 p-4 transition-all duration-300 hover:bg-white/5 overflow-hidden block"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                                    {/* Left: Logo & Name */}
                                    <div className="flex items-start md:items-center gap-4 flex-1 w-full md:w-auto">
                                        <div className="w-12 h-12 bg-black border border-white/10 overflow-hidden skew-x-[-5deg] group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                                            {team.logo_url ? (
                                                <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover skew-x-[5deg]" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-cs-surface">
                                                    <span className="skew-x-[5deg] font-black text-lg text-white/20">{team.name[0]}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="font-bold text-lg text-white uppercase tracking-wider mb-1 group-hover:text-cs-orange transition-colors truncate">
                                                {team.name}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-xs text-cs-text font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="w-3 h-3" />
                                                    <span>{team.members_count || team.members?.length || 0} участников</span>
                                                </div>
                                                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3" />
                                                    <span className="font-mono">{new Date(team.created_at).toLocaleDateString('ru-RU')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Stats */}
                                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0 mt-2 md:mt-0">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-500 bg-yellow-500/10 px-3 py-1 border border-yellow-500/20 skew-x-[-10deg]">
                                            <Trophy className="w-3 h-3 skew-x-[10deg]" />
                                            <span className="skew-x-[10deg]">{team.wins || 0} Побед</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-xs font-bold text-cs-text bg-black/30 px-3 py-1 border border-white/5 skew-x-[-10deg]">
                                            <Shield className="w-3 h-3 skew-x-[10deg]" />
                                            <span className="skew-x-[10deg]">ID: {team.id}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-cs-text text-sm">
                        {isOwner ? 'Вы не состоите ни в одной команде' : 'У данного пользователя нет команд'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileTeams;
