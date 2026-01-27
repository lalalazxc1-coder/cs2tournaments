import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Shield } from 'lucide-react';
import FriendActionButton from './FriendActionButton';

const UserProfileHeader = ({ userData, stats, isOwner, isAuthenticated, friendshipStatus, onFriendStatusChange }) => {
    const [showHistory, setShowHistory] = useState(false);
    const historyRef = useRef(null);

    const lastActiveDate = userData.last_seen ? new Date(userData.last_seen) : null;
    const isOnline = lastActiveDate && (new Date() - lastActiveDate < 5 * 60 * 1000);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (historyRef.current && !historyRef.current.contains(event.target)) {
                setShowHistory(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getLastSeenText = () => {
        if (isOnline) return 'Онлайн';
        if (!lastActiveDate) return 'Оффлайн';

        let dateStr = userData.last_seen;
        if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
            dateStr += 'Z';
        }
        const date = new Date(dateStr);

        return `Был(а): ${date.toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })}`;
    };

    const timeString = new Date(userData.created_at).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="bg-cs-surface border border-white/10 p-8 mb-6 clip-path-slant relative overflow-hidden">
            {userData.profile_bg && (
                <div className="absolute inset-0 z-0">
                    <img
                        src={`/${userData.profile_bg}`}
                        alt="Header Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-cs-surface/95 via-cs-surface/80 to-transparent"></div>
                </div>
            )}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cs-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-24 h-24 md:w-40 md:h-40 bg-black border border-white/10 skew-x-[-5deg] overflow-hidden mx-auto md:mx-0">
                        <img
                            src={userData.avatar_full || userData.avatar_medium || '/defolt.png'}
                            alt="Avatar"
                            className="w-full h-full object-cover skew-x-[5deg] scale-110"
                        />
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row justify-between items-start">
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2 relative">
                                <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                    <span className="hover:text-cs-orange transition-colors">
                                        {userData.nickname}
                                    </span>
                                    {userData.nickname_history && userData.nickname_history.length > 0 && (
                                        <div className="relative" ref={historyRef}>
                                            <button
                                                onClick={() => setShowHistory(!showHistory)}
                                                className="text-white/30 hover:text-white transition-colors p-1"
                                            >
                                                <ChevronDown className={`w-5 h-5 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                                            </button>

                                            {showHistory && (
                                                <div className="absolute top-full left-0 mt-2 w-64 bg-cs-surface border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden backdrop-blur-md normal-case tracking-normal font-normal">
                                                    <div className="p-3 border-b border-white/5 bg-black/20">
                                                        <span className="text-xs font-bold text-white/50 uppercase tracking-wider">История ников</span>
                                                    </div>
                                                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                                        {userData.nickname_history.map((history, index) => (
                                                            <div key={index} className="px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors text-left">
                                                                <div className="font-bold text-white text-sm">{history.nickname}</div>
                                                                <div className="text-xs text-white/40 mt-0.5">
                                                                    {new Date(history.changed_at).toLocaleString('ru-RU', {
                                                                        day: 'numeric',
                                                                        month: 'long',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </h1>
                                {userData.steam_id && (
                                    <a
                                        href={`https://steamcommunity.com/profiles/${userData.steam_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:opacity-80 transition-opacity"
                                        title="Открыть профиль Steam"
                                    >
                                        <img src="/steam-icon.png" className="w-6 h-6 opacity-50 hover:opacity-100 transition-opacity" alt="Steam" />
                                    </a>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium text-cs-text mb-6">
                                {/* ID */}
                                <div className="flex items-center gap-2">
                                    <span className="text-white/30 text-xs uppercase tracking-wider">ID</span>
                                    <span className="text-white font-mono">{userData.id}</span>
                                </div>

                                <span className="text-white/10">•</span>

                                {/* Status */}
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-white/20'}`}></div>
                                    <span className={`${isOnline ? 'text-green-400' : 'text-white/40'}`}>{getLastSeenText()}</span>
                                </div>

                                <span className="text-white/10">•</span>

                                {/* Date */}
                                <div className="flex items-center gap-2 text-white/60">
                                    <span>На сайте с {timeString}</span>
                                </div>

                                {/* Role Badge */}
                                {(userData.role === 1 || userData.role === 2) && (
                                    <>
                                        <span className="text-white/10">•</span>
                                        <div className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${userData.role === 2 ? 'bg-red-500/10 text-red-500' : 'bg-blue-400/10 text-blue-400'
                                            }`}>
                                            {userData.role === 2 ? 'Админ' : 'Организатор'}
                                        </div>
                                    </>
                                )}

                                {/* Custom Label */}
                                {userData.player_label && (
                                    <>
                                        <span className="text-white/10">•</span>
                                        <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-cs-orange bg-cs-orange/10">
                                            {userData.player_label}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="hidden md:block">
                            <FriendActionButton
                                userData={userData}
                                isOwner={isOwner}
                                isAuthenticated={isAuthenticated}
                                initialStatus={friendshipStatus}
                                onStatusChange={onFriendStatusChange}
                            />
                        </div>
                    </div>

                    {/* Mobile Friend Action Button */}
                    <div className="md:hidden w-full mb-6">
                        <FriendActionButton
                            userData={userData}
                            isOwner={isOwner}
                            isAuthenticated={isAuthenticated}
                            initialStatus={friendshipStatus}
                            onStatusChange={onFriendStatusChange}
                            fullWidth={true}
                        />
                    </div>

                    {/* Stats Grid */}
                    {/* Stats Grid */}
                    <div className="flex flex-wrap gap-4">
                        <div className="bg-black/30 px-4 py-2 border-l-2 border-cs-orange min-w-[120px]">
                            <div className="text-[10px] text-cs-text uppercase tracking-wider font-bold">Рейтинг</div>
                            <div className="text-xl font-black text-white leading-none mt-1">{stats?.rating !== undefined ? stats.rating : '-'}</div>
                        </div>
                        <div className="bg-black/30 px-4 py-2 border-l-2 border-blue-500 min-w-[120px]">
                            <div className="text-[10px] text-cs-text uppercase tracking-wider font-bold">Место в топе</div>
                            <div className="text-xl font-black text-white leading-none mt-1">{stats?.rank ? `#${stats.rank}` : '-'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileHeader;
