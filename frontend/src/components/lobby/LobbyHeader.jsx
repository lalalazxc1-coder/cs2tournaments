import React from 'react';
import { Clock, Trophy, UserPlus, MapPin, Users, Swords, Crown, AlertCircle, Calendar, CheckCircle, Settings, XCircle, ChevronRight } from 'lucide-react';

const LobbyHeader = ({
    lobby,
    isOrganizer,
    isJoined,
    overallWinner,
    onEdit,
    onInvite,
    onCancel,
    onStart,
    onReset,
    onJoin,
    onLeave,
    participantsCount,
    maxParticipants,
    participants,
    onShowPoster
}) => {
    // Timeline steps configuration
    const steps = [
        { id: 'registering', label: 'Регистрация', date: lobby.date_time },
        { id: 'drafting', label: 'Драфт', date: 'Live' },
        { id: 'in_progress', label: 'Игра', date: 'Live' },
        { id: 'finished', label: 'Завершен', date: 'TBD' }
    ];

    const getStepIndex = (status) => {
        if (status === 'completed') return 3;
        return steps.findIndex(s => s.id === status);
    };

    const currentStepIndex = getStepIndex(lobby.status);

    const creatorName = lobby.creator?.nickname || participants?.find(p => p.user_id === lobby.creator_id)?.nickname || 'Unknown';

    return (
        <div className="mb-12">
            {/* 1. Banner Section */}
            <div className="relative w-full h-[200px] md:h-[280px] bg-black/50 overflow-hidden border border-white/10 rounded-t-sm group shadow-2xl">
                {lobby.image_url ? (
                    <img src={lobby.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full bg-cs-surface flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cs-surface via-neutral-900 to-black"></div>
                        <Swords className="w-24 h-24 text-white/5 relative z-10" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    </div>
                )}

                {/* Subtle Gradient Overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </div>

            {/* 2. Info Bar */}
            <div className="bg-cs-surface border-x border-b border-white/10 p-6 flex flex-col xl:flex-row items-center justify-between gap-6 relative z-20 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center gap-8 w-full xl:w-auto text-center md:text-left">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{lobby.name}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-4 text-sm font-medium text-cs-text">
                            <span className="flex items-center gap-1.5"><Crown className="w-4 h-4 text-cs-orange" /> by <span className="text-white font-bold">{creatorName}</span></span>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-cs-blue" /> {new Date(lobby.date_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <span className="uppercase">{lobby.format}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-cs-blue" /> {participantsCount} / {maxParticipants}</span>
                        </div>
                        {lobby.description && (
                            <p className="text-cs-text/80 text-sm mt-3 max-w-2xl leading-relaxed border-l-2 border-white/10 pl-3 break-words break-all">
                                {lobby.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">
                    {isOrganizer && lobby.status === 'registering' && (
                        <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
                            <button onClick={onEdit} className="p-2 hover:bg-white/10 text-cs-text hover:text-white transition-colors rounded" title="Настройки">
                                <Settings className="w-5 h-5" />
                            </button>
                            <button
                                onClick={onInvite}
                                disabled={participantsCount >= maxParticipants}
                                className={`p-2 transition-colors rounded ${participantsCount >= maxParticipants ? 'text-gray-600 cursor-not-allowed' : 'hover:bg-white/10 text-cs-text hover:text-white'}`}
                                title="Пригласить"
                            >
                                <UserPlus className="w-5 h-5" />
                            </button>
                            <button onClick={onCancel} className="p-2 hover:bg-red-500/20 text-red-500 transition-colors rounded" title="Отменить">
                                <XCircle className="w-5 h-5" />
                            </button>
                            <div className="w-px h-6 bg-white/10 mx-1"></div>
                            <button onClick={onStart} className="px-4 py-1.5 bg-cs-orange hover:bg-yellow-400 text-black font-bold uppercase tracking-wider text-xs rounded transition-all">
                                Начать
                            </button>
                        </div>
                    )}

                    {isOrganizer && (lobby.status === 'drafting' || lobby.status === 'in_progress') && (
                        <button onClick={onReset} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold text-xs rounded transition-colors uppercase tracking-wider">
                            Сбросить
                        </button>
                    )}

                    {lobby.status === 'registering' && (
                        <button
                            onClick={isJoined ? onLeave : onJoin}
                            disabled={!isJoined && participantsCount >= maxParticipants}
                            className={`group relative px-8 py-3 font-black uppercase tracking-widest text-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 overflow-hidden skew-x-[-10deg] ${isJoined
                                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20'
                                : (participantsCount >= maxParticipants ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-cs-orange to-yellow-500 hover:from-yellow-400 hover:to-yellow-300 text-black shadow-[0_0_30px_rgba(234,179,8,0.3)]')
                                }`}
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <span className="relative skew-x-[10deg] flex items-center gap-2">
                                {isJoined ? 'Покинуть' : (participantsCount >= maxParticipants ? 'Мест нет' : <>Участвовать <ChevronRight className="w-4 h-4" /></>)}
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* Winner Section */}
            {overallWinner && (
                <div className="mt-6 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div
                        onClick={onShowPoster}
                        className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 border border-yellow-500/30 px-12 py-6 rounded-lg flex items-center gap-6 shadow-[0_0_30px_rgba(234,179,8,0.1)] relative overflow-hidden group cursor-pointer hover:shadow-[0_0_50px_rgba(234,179,8,0.2)] transition-all"
                    >
                        <div className="absolute inset-0 bg-yellow-500/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <Trophy className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                        <div className="flex flex-col">
                            <span className="text-yellow-500 text-xs font-bold uppercase tracking-[0.2em] mb-1">Победитель матча</span>
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-black text-white uppercase tracking-tight">{overallWinner.teamName}</span>
                                <span className="text-xl font-bold text-white/50">
                                    {overallWinner.score}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                        const isCurrent = index === currentStepIndex;

                        return (
                            <div key={step.id} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 w-full md:w-auto mb-4 md:mb-0">
                                <div className={`w-4 h-4 rounded-full border-2 transition-colors duration-300 flex-shrink-0 ${isActive ? 'bg-cs-orange border-cs-orange shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-cs-surface border-white/20'}`}></div>
                                <div className="flex flex-col md:items-center">
                                    <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-cs-text'}`}>{step.label}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LobbyHeader;
