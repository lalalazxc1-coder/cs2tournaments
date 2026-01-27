import React from 'react';
import { User, CheckCircle } from 'lucide-react';

const ProfileInfo = ({ profile }) => {
    if (!profile) return null;

    return (
        <div className="max-w-2xl mx-auto md:mx-0">
            <div className="bg-cs-surface border border-white/5 p-8 clip-path-slant">
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-black/50 flex items-center justify-center mx-auto mb-6 border border-cs-orange/30 relative group skew-x-[-5deg]">
                        <div className="skew-x-[5deg] w-full h-full overflow-hidden">
                            {profile.user?.avatar_url ? (
                                <img src={profile.user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-10 h-10 text-cs-text group-hover:text-cs-orange transition-colors" />
                                </div>
                            )}
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">
                        {profile.user?.nickname || profile.user?.username || 'Игрок'}
                    </h2>
                    <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest border skew-x-[-10deg] ${profile.user?.role === 2 ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        profile.user?.role === 1 ? 'bg-cs-orange/10 text-cs-orange border-cs-orange/20' :
                            'bg-cs-blue/10 text-cs-blue border-cs-blue/20'
                        }`}>
                        <span className="skew-x-[10deg] block">
                            {profile.user?.role === 2 ? '👑 АДМИН' :
                                profile.user?.role === 1 ? '🎯 ОРГАНИЗАТОР' :
                                    '🎮 ИГРОК'}
                        </span>
                    </span>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-black/30 border border-white/5 skew-x-[-5deg]">
                        <span className="text-cs-text text-xs font-bold uppercase tracking-wider skew-x-[5deg]">Telegram ID</span>
                        <span className="text-white font-mono text-sm skew-x-[5deg]">{profile.user?.telegram_id}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-black/30 border border-white/5 skew-x-[-5deg]">
                        <span className="text-cs-text text-xs font-bold uppercase tracking-wider skew-x-[5deg]">Steam ID</span>
                        {profile.user?.steam_id ? (
                            <span className="text-green-400 font-mono text-sm skew-x-[5deg]">{profile.user.steam_id}</span>
                        ) : (
                            <span className="text-cs-text text-sm skew-x-[5deg]">Не привязан</span>
                        )}
                    </div>
                    <div className="flex justify-between items-center p-4 bg-black/30 border border-white/5 skew-x-[-5deg]">
                        <span className="text-cs-text text-xs font-bold uppercase tracking-wider skew-x-[5deg]">Статус</span>
                        <span className={`font-bold text-xs uppercase tracking-wider skew-x-[5deg] ${profile.user?.is_blocked ? 'text-red-500' : 'text-green-500'}`}>
                            {profile.user?.is_blocked ? 'Заблокирован' : 'Активен'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-black/30 border border-white/5 skew-x-[-5deg]">
                        <span className="text-cs-text text-xs font-bold uppercase tracking-wider skew-x-[5deg]">Турниров</span>
                        <span className="text-white font-bold skew-x-[5deg]">{profile.user?.tournaments_count || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-black/30 border border-white/5 skew-x-[-5deg]">
                        <span className="text-cs-text text-xs font-bold uppercase tracking-wider skew-x-[5deg]">Матчей</span>
                        <span className="text-white font-bold skew-x-[5deg]">{profile.stats?.internal_matches_count || 0}</span>
                    </div>
                    {profile.user?.player_label && (
                        <div className="flex justify-between items-center p-4 bg-black/30 border border-white/5 skew-x-[-5deg]">
                            <span className="text-cs-text text-xs font-bold uppercase tracking-wider skew-x-[5deg]">Метка</span>
                            <span className="text-cs-orange font-bold skew-x-[5deg]">{profile.user.player_label}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
