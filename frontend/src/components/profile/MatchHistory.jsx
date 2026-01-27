import React from 'react';
import { Swords, Calendar, ChevronRight, Loader2, Users, Trophy } from 'lucide-react';

const MatchHistory = ({ matches, expandedMatch, handleMatchClick, loadingDetails, matchDetails, profile }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center uppercase tracking-tighter">
                <Swords className="w-6 h-6 mr-3 text-cs-orange" />
                ИСТОРИЯ МАТЧЕЙ (5x5)
            </h2>

            {matches.length > 0 ? (
                matches.map((match) => (
                    <div key={match.id} className="bg-cs-surface border border-white/5 clip-path-slant overflow-hidden hover:border-cs-orange/30 transition-all duration-300">
                        <div
                            onClick={() => handleMatchClick(match.id)}
                            className="p-6 flex flex-col md:flex-row items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors gap-6"
                        >
                            <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-start flex-1">
                                <div className="flex flex-col items-center px-4 flex-1 md:flex-none">
                                    <div className="text-xl font-black text-white tracking-wide uppercase">
                                        {match.name}
                                    </div>
                                    <div className="text-[10px] text-cs-text mt-1 font-mono uppercase tracking-widest">
                                        {match.format} • {match.status}
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <div className={`text-sm font-black uppercase tracking-wider ${match.status === 'finished' ? 'text-green-500' :
                                        match.status === 'in_progress' ? 'text-cs-blue' :
                                            match.status === 'cancelled' ? 'text-red-500' : 'text-cs-orange'
                                        }`}>
                                        {match.status === 'finished' ? 'ЗАВЕРШЕН' :
                                            match.status === 'in_progress' ? 'ИДЕТ' :
                                                match.status === 'cancelled' ? 'ОТМЕНЕН' : 'РЕГИСТРАЦИЯ'}
                                    </div>
                                    <div className="text-xs text-cs-text flex items-center mt-1 font-bold">
                                        <Users className="w-3 h-3 mr-1" />
                                        {match.current_participants} / {match.max_participants}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-cs-text w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                                <div className="flex items-center bg-black/30 px-3 py-1.5 border border-white/5 skew-x-[-10deg]">
                                    <span className="skew-x-[10deg] flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-cs-text" />
                                        {new Date(match.date_time).toLocaleDateString('ru-RU')}
                                    </span>
                                </div>
                                <div className={`w-8 h-8 flex items-center justify-center transition-transform duration-300 ${expandedMatch === match.id ? 'rotate-90 text-cs-orange' : 'text-cs-text'}`}>
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {expandedMatch === match.id && (
                            <div className="border-t border-white/5 bg-black/20 p-6">
                                {loadingDetails ? (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="w-6 h-6 animate-spin text-cs-orange" />
                                    </div>
                                ) : matchDetails && matchDetails.participants ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Team 1 */}
                                        <div>
                                            <h3 className="text-lg font-black text-white mb-4 border-b border-white/5 pb-2 flex justify-between items-center uppercase tracking-wider">
                                                <span className="text-cs-blue">CT Side</span>
                                            </h3>
                                            <div className="space-y-2">
                                                {matchDetails.participants
                                                    .filter(p => p.team_number === 1)
                                                    .map((p) => (
                                                        <div key={p.user_id} className="flex items-center justify-between bg-black/40 p-2 border border-white/5 skew-x-[-5deg]">
                                                            <span className="text-white font-bold text-sm skew-x-[5deg]">{p.nickname}</span>
                                                            <div className="flex items-center space-x-2 text-xs text-cs-text skew-x-[5deg]">
                                                                <span>KD: {p.k_d}</span>
                                                                <span>WR: {p.win_rate}%</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                {matchDetails.participants.filter(p => p.team_number === 1).length === 0 && (
                                                    <div className="text-cs-text text-sm italic">Нет игроков</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Team 2 */}
                                        <div>
                                            <h3 className="text-lg font-black text-white mb-4 border-b border-white/5 pb-2 flex justify-between items-center uppercase tracking-wider">
                                                <span className="text-cs-orange">T Side</span>
                                            </h3>
                                            <div className="space-y-2">
                                                {matchDetails.participants
                                                    .filter(p => p.team_number === 2)
                                                    .map((p) => (
                                                        <div key={p.user_id} className="flex items-center justify-between bg-black/40 p-2 border border-white/5 skew-x-[-5deg]">
                                                            <span className="text-white font-bold text-sm skew-x-[5deg]">{p.nickname}</span>
                                                            <div className="flex items-center space-x-2 text-xs text-cs-text skew-x-[5deg]">
                                                                <span>KD: {p.k_d}</span>
                                                                <span>WR: {p.win_rate}%</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                {matchDetails.participants.filter(p => p.team_number === 2).length === 0 && (
                                                    <div className="text-cs-text text-sm italic">Нет игроков</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Unassigned / Registered */}
                                        {matchDetails.participants.some(p => !p.team_number) && (
                                            <div className="md:col-span-2 mt-4">
                                                <h3 className="text-sm font-bold text-cs-text mb-2 uppercase tracking-wider">Ожидают распределения</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {matchDetails.participants
                                                        .filter(p => !p.team_number)
                                                        .map((p) => (
                                                            <span key={p.user_id} className="bg-black/40 px-3 py-1 text-xs text-cs-text border border-white/5 skew-x-[-10deg]">
                                                                <span className="skew-x-[10deg]">{p.nickname}</span>
                                                            </span>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center text-cs-text">Нет данных о матче</div>
                                )}
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <div className="text-center py-24 bg-cs-surface border border-white/5 clip-path-slant">
                    <div className="w-20 h-20 bg-black/50 flex items-center justify-center mx-auto mb-6 skew-x-[-10deg] border border-white/5">
                        <Swords className="w-10 h-10 text-cs-text skew-x-[10deg]" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wider">Матчи не найдены</h3>
                    <p className="text-cs-text font-medium">
                        Вы еще не участвовали ни в одном матче (лобби).
                    </p>
                </div>
            )}
        </div>
    );
};

export default MatchHistory;
