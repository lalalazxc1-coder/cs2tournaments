import React from 'react';
import { Trophy, Calendar, DollarSign, Play, Swords, Users, Settings, UserPlus, XCircle, Clock, Crown, ChevronRight } from 'lucide-react';

const TournamentHeader = ({
    tournament,
    isOrganizer,
    isAuthenticated,
    isRegistered,
    myTeams,
    selectedTeam,
    setSelectedTeam,
    onRegister,
    onLeave,
    onStart,
    onEdit,
    onInvite,
    onDelete
}) => {
    // Determine winner logic
    let winnerName = null;
    if (tournament.status === 'completed' && tournament.brackets && tournament.brackets.length > 0) {
        const finalMatch = tournament.brackets.find(m => m.group === 'final');
        if (finalMatch && finalMatch.winner_id) {
            const t = tournament.teams.find(tt => tt.team_id === finalMatch.winner_id);
            if (t) winnerName = t.team.name;
        } else {
            const maxRound = Math.max(...tournament.brackets.map(m => m.round));
            const lastMatches = tournament.brackets.filter(m => m.round === maxRound && m.winner_id);
            if (lastMatches.length > 0) {
                const lastMatch = lastMatches[0];
                const t = tournament.teams.find(tt => tt.team_id === lastMatch.winner_id);
                if (t) winnerName = t.team.name;
            }
        }
    }

    // Timeline steps configuration
    const formatDate = (dateString) => {
        if (!dateString) return 'TBD';
        return new Date(dateString).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const steps = [
        {
            id: 'registration',
            label: 'Регистрация',
            date: formatDate(tournament.registration_start_date),
            activeStates: ['upcoming', 'registration']
        },
        {
            id: 'waiting',
            label: 'Ожидание',
            date: formatDate(tournament.registration_end_date),
            activeStates: ['registration_closed']
        },
        {
            id: 'ongoing',
            label: 'Турнир',
            date: formatDate(tournament.start_date),
            activeStates: ['ongoing']
        },
        {
            id: 'completed',
            label: 'Завершен',
            date: tournament.end_date ? formatDate(tournament.end_date) : 'TBD',
            activeStates: ['completed']
        }
    ];

    const getCurrentStepIndex = () => {
        if (tournament.status === 'upcoming' || tournament.status === 'registration') return 0;
        if (tournament.status === 'registration_closed') return 1;
        if (tournament.status === 'ongoing') return 2;
        if (tournament.status === 'completed') return 3;
        return 0;
    };

    const currentStepIndex = getCurrentStepIndex();

    return (
        <div className="mb-12 font-sans">
            {/* 1. Banner Section */}
            <div className="relative w-full h-[200px] md:h-[280px] bg-black/50 overflow-hidden border border-white/10 rounded-t-sm group shadow-2xl">
                {tournament.banner_url ? (
                    <img src={tournament.banner_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full bg-cs-surface flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cs-surface via-neutral-900 to-black"></div>
                        <Swords className="w-24 h-24 text-white/5 relative z-10" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </div>

            {/* 2. Info Bar */}
            <div className="bg-cs-surface border-x border-b border-white/10 p-6 flex flex-col xl:flex-row items-center justify-between gap-6 relative z-20 shadow-2xl">

                {/* Left: Info */}
                <div className="flex flex-col md:flex-row items-center gap-8 w-full xl:w-auto text-center md:text-left">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{tournament.name}</h1>
                            {winnerName && (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Trophy className="w-3 h-3" /> {winnerName}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-4 text-sm font-medium text-cs-text mt-1">
                            <span className="flex items-center gap-1.5">
                                <Crown className="w-4 h-4 text-cs-orange" /> by <span className="text-white font-bold">{tournament.creator?.nickname || 'Admin'}</span>
                            </span>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-cs-blue" /> {new Date(tournament.start_date).toLocaleDateString()}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <span className="uppercase">{tournament.format}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <span className="flex items-center gap-1.5 whitespace-nowrap">
                                <Users className="w-4 h-4 text-cs-blue" /> {tournament.teams_count || 0} / {tournament.max_teams}
                            </span>
                            {tournament.prize_pool && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                    <span className="flex items-center gap-1.5 text-green-400 whitespace-nowrap">
                                        {parseInt(tournament.prize_pool).toLocaleString('ru-RU')} ₸
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Actions & Controls */}
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">

                    {/* Organizer Controls */}
                    {isOrganizer && (
                        <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
                            <button onClick={onEdit} className="p-2 hover:bg-white/10 text-cs-text hover:text-white transition-colors rounded" title="Настройки">
                                <Settings className="w-5 h-5" />
                            </button>
                            <button onClick={onInvite} className="p-2 hover:bg-white/10 text-cs-text hover:text-white transition-colors rounded" title="Пригласить">
                                <UserPlus className="w-5 h-5" />
                            </button>
                            <button onClick={onDelete} className="p-2 hover:bg-red-500/20 text-red-500 transition-colors rounded" title="Отменить">
                                <XCircle className="w-5 h-5" />
                            </button>

                            {(tournament.status === 'registration' || tournament.status === 'upcoming' || tournament.status === 'registration_closed') && (
                                <>
                                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                                    <button onClick={onStart} className="px-4 py-1.5 bg-cs-orange hover:bg-yellow-400 text-black font-bold uppercase tracking-wider text-xs rounded transition-all">
                                        Начать
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Registration Logic */}
                    {(() => {
                        const now = new Date();
                        const regStart = tournament.registration_start_date ? new Date(tournament.registration_start_date) : null;
                        const regEnd = tournament.registration_end_date ? new Date(tournament.registration_end_date) : null;
                        const isRegOpen = (!regStart || now >= regStart) && (!regEnd || now <= regEnd) && tournament.status !== 'registration_closed' && tournament.status !== 'ongoing' && tournament.status !== 'completed';

                        if (isRegistered) {
                            if (tournament.status === 'registration' || tournament.status === 'upcoming' || tournament.status === 'registration_closed') {
                                return (
                                    <button
                                        onClick={onLeave}
                                        className="group relative px-8 py-3 font-black uppercase tracking-widest text-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 overflow-hidden skew-x-[-10deg] bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        <span className="relative skew-x-[10deg] flex items-center gap-2">
                                            Снять команду
                                        </span>
                                    </button>
                                );
                            }
                            return null;
                        }

                        if (regStart && now < regStart) {
                            return (
                                <div className="flex items-center gap-3 bg-black/20 border border-white/5 px-4 py-2 rounded-lg">
                                    <div className="flex flex-col items-end leading-tight">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Регистрация откроется</span>
                                        <span className="text-white font-bold text-xs">{regStart.toLocaleString()}</span>
                                    </div>
                                    <Clock className="w-4 h-4 text-gray-500" />
                                </div>
                            );
                        }

                        if ((regEnd && now > regEnd) || tournament.status === 'registration_closed') {
                            return (
                                <div className="px-8 py-3 bg-gray-700 text-gray-500 font-black uppercase tracking-widest text-sm skew-x-[-10deg] cursor-not-allowed">
                                    <span className="skew-x-[10deg]">Регистрация закрыта</span>
                                </div>
                            );
                        }

                        if (isRegOpen && !isAuthenticated) {
                            return (
                                <button onClick={() => alert('Для участия авторизуйтесь')} className="group relative px-8 py-3 font-black uppercase tracking-widest text-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 overflow-hidden skew-x-[-10deg] bg-gradient-to-r from-cs-orange to-yellow-500 hover:from-yellow-400 hover:to-yellow-300 text-black shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <span className="relative skew-x-[10deg]">Войти для участия</span>
                                </button>
                            );
                        }

                        if (isRegOpen && isAuthenticated && myTeams.length > 0) {
                            return (
                                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                    <select
                                        value={selectedTeam}
                                        onChange={(e) => setSelectedTeam(e.target.value)}
                                        className="bg-black/20 border border-white/10 px-3 py-3 text-white focus:border-cs-orange focus:outline-none rounded font-bold uppercase tracking-wider text-sm min-w-[180px]"
                                    >
                                        {myTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                    <button
                                        onClick={onRegister}
                                        className="group relative px-8 py-3 font-black uppercase tracking-widest text-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 overflow-hidden skew-x-[-10deg] bg-gradient-to-r from-cs-orange to-yellow-500 hover:from-yellow-400 hover:to-yellow-300 text-black shadow-[0_0_30px_rgba(234,179,8,0.3)]"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        <span className="relative skew-x-[10deg] flex items-center gap-2">
                                            Участвовать <ChevronRight className="w-4 h-4" />
                                        </span>
                                    </button>
                                </div>
                            );
                        }

                        return null;
                    })()}
                </div>
            </div>

            {/* 3. Timeline */}
            <div className="mt-8 px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative">
                    {/* Progress Line */}
                    <div className="absolute top-2 left-0 w-full h-0.5 bg-white/10 hidden md:block"></div>
                    <div
                        className="absolute top-2 left-0 h-0.5 bg-cs-orange transition-all duration-500 hidden md:block"
                        style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {steps.map((step, index) => {
                        const isActive = index <= currentStepIndex;

                        return (
                            <div key={step.id} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 w-full md:w-auto mb-4 md:mb-0">
                                <div className={`w-4 h-4 rounded-full border-2 transition-colors duration-300 flex-shrink-0 ${isActive ? 'bg-cs-orange border-cs-orange' : 'bg-cs-surface border-white/20'}`}></div>
                                <div className="flex flex-col md:items-center">
                                    <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-cs-text'}`}>{step.label}</span>
                                    <span className="text-[10px] font-medium text-gray-500 mt-1">{step.date}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TournamentHeader;
