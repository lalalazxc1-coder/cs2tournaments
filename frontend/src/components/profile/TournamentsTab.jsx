import React from 'react';
import { Trophy, Calendar, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TournamentsTab = ({ tournaments }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center uppercase tracking-tighter">
                <Trophy className="w-6 h-6 mr-3 text-cs-orange" />
                МОИ ТУРНИРЫ
            </h2>

            {tournaments.length > 0 ? (
                tournaments.map((tournament) => (
                    <div key={tournament.id} className="bg-cs-surface border border-white/5 clip-path-slant overflow-hidden hover:border-cs-orange/30 transition-all duration-300">
                        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-start flex-1">
                                <div className="flex flex-col">
                                    <div className="text-xl font-black text-white tracking-wide uppercase">
                                        {tournament.name}
                                    </div>
                                    <div className="text-xs text-cs-text mt-1 font-mono flex items-center gap-3 uppercase tracking-widest">
                                        <span className="flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(tournament.date_time).toLocaleDateString('ru-RU')}
                                        </span>
                                        <span className="flex items-center">
                                            <Users className="w-3 h-3 mr-1" />
                                            {tournament.current_participants}/{tournament.max_participants}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider border skew-x-[-10deg] ${tournament.status === 'upcoming' || tournament.status === 'registration' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                        tournament.status === 'ongoing' ? 'bg-cs-orange/10 text-cs-orange border-cs-orange/20' :
                                            tournament.status === 'completed' ? 'bg-cs-blue/10 text-cs-blue border-cs-blue/20' :
                                                'bg-red-500/10 text-red-500 border-red-500/20'
                                    }`}>
                                    <span className="skew-x-[10deg] block">
                                        {tournament.status === 'upcoming' || tournament.status === 'registration' ? 'Регистрация' :
                                            tournament.status === 'ongoing' ? 'Идет' :
                                                tournament.status === 'completed' ? 'Завершен' :
                                                    tournament.status === 'registration_closed' ? 'Регистрация закрыта' : tournament.status}
                                    </span>
                                </span>
                                <Link to={`/tournaments/${tournament.id}`} className="w-8 h-8 flex items-center justify-center text-cs-text hover:text-white hover:bg-white/10 transition-colors skew-x-[-10deg] border border-transparent hover:border-white/10">
                                    <ChevronRight className="w-5 h-5 skew-x-[10deg]" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-24 bg-cs-surface border border-white/5 clip-path-slant">
                    <div className="w-20 h-20 bg-black/50 flex items-center justify-center mx-auto mb-6 skew-x-[-10deg] border border-white/5">
                        <Trophy className="w-10 h-10 text-cs-text skew-x-[10deg]" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wider">Нет активных турниров</h3>
                    <p className="text-cs-text font-medium">
                        Вы пока не участвуете ни в одном турнире.
                    </p>
                </div>
            )}
        </div>
    );
};

export default TournamentsTab;
