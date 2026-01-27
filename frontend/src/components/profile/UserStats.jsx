import React from 'react';
import { Crosshair } from 'lucide-react';

const UserStats = ({ profile, handleSteamConnect }) => {
    if (!profile) return null;

    return (
        <div className="w-full">
            {profile.stats ? (
                <div className="bg-cs-surface border border-white/5 p-8 clip-path-slant shadow-xl h-full">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black text-white flex items-center uppercase tracking-tighter">
                            <Crosshair className="w-6 h-6 mr-3 text-cs-orange" />
                            СТАТИСТИКА
                        </h2>
                        <span className="text-cs-text text-xs font-mono bg-black/50 px-2 py-1 border border-white/5 skew-x-[-10deg]">
                            <span className="skew-x-[10deg]">UPD: {profile.stats.last_updated ? new Date(profile.stats.last_updated).toLocaleDateString('ru-RU') : 'N/A'}</span>
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div className="p-6 bg-black/30 border border-white/5 flex flex-col items-center justify-center skew-x-[-5deg]">
                            <div className="skew-x-[5deg] text-center">
                                <div className="text-4xl font-black text-white mb-2">{profile.stats.k_d_ratio}</div>
                                <div className="text-xs text-cs-text font-bold uppercase tracking-widest">K/D Рейтинг</div>
                            </div>
                        </div>
                        <div className="p-6 bg-black/30 border border-white/5 flex flex-col items-center justify-center skew-x-[-5deg]">
                            <div className="skew-x-[5deg] text-center">
                                <div className="text-4xl font-black text-white mb-2">{profile.stats.avg_adr}</div>
                                <div className="text-xs text-cs-text font-bold uppercase tracking-widest">Средний урон</div>
                            </div>
                        </div>
                        <div className="p-6 bg-black/30 border border-white/5 flex flex-col items-center justify-center skew-x-[-5deg]">
                            <div className="skew-x-[5deg] text-center">
                                <div className="text-4xl font-black text-white mb-2">{profile.stats.avg_hs_percent}%</div>
                                <div className="text-xs text-cs-text font-bold uppercase tracking-widest">Процент HS</div>
                            </div>
                        </div>
                    </div>


                </div>
            ) : (
                <div className="bg-cs-surface border border-white/5 p-12 clip-path-slant shadow-xl h-full flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-black/50 flex items-center justify-center mb-6 skew-x-[-10deg] border border-white/5">
                        <Crosshair className="w-10 h-10 text-cs-text skew-x-[10deg]" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wider">Статистика недоступна</h3>
                    <p className="text-cs-text max-w-sm mb-6 font-medium">
                        Привяжите Steam ID, чтобы отслеживать свой прогресс и участвовать в турнирах.
                    </p>
                    <button
                        onClick={handleSteamConnect}
                        className="bg-[#171a21] hover:bg-[#2a475e] text-white font-bold py-3 px-6 transition-all border border-white/10 flex items-center skew-x-[-10deg] uppercase tracking-wider"
                    >
                        <span className="skew-x-[10deg] flex items-center gap-2">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.979 0C5.666 0 .506 4.936.042 11.173l4.35 6.364c.066-.013.13-.028.197-.038l2.972-4.265c-.115-.595-.023-1.22.28-1.76.43-.765 1.252-1.185 2.088-1.07.228.03.448.093.654.18l3.35-4.808c-.02-.21-.033-.423-.033-.638 0-3.422 2.77-6.194 6.184-6.194 1.232 0 2.38.358 3.352.973C21.36 4.17 17.07 0 11.98 0zm8.105 5.92c-2.203 0-3.99 1.788-3.99 3.992 0 .42.068.823.19 1.203l-3.37 4.837c-.52-.18-1.085-.19-1.616.02l-2.95 4.232c-.17.243-.315.503-.433.778l-.56-1.12c-.36-.718-1.23-1.007-1.948-.647-.717.36-1.006 1.23-.646 1.947l2.06 4.12c1.39 1.63 3.44 2.67 5.73 2.69 4.12.03 7.48-3.29 7.51-7.41.01-2.29-1.03-4.34-2.66-5.73l-1.12.56c-.718.36-1.588.07-1.948-.647-.36-.717-.07-1.588.648-1.948l4.23-2.95c-.276-.118-.536-.263-.78-.432l-4.836-3.37c-.38.122-.783.19-1.203.19zm-.58 2.14c1.02 0 1.85.83 1.85 1.85 0 1.02-.83 1.85-1.85 1.85-1.02 0-1.85-.83-1.85-1.85 0-1.02.83-1.85 1.85-1.85z" />
                            </svg>
                            Привязать Steam
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserStats;
