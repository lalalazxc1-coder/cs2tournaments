import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Crown, Upload, Check, UserPlus, Clock, X, LogOut, Trash2 } from 'lucide-react';

const TeamHeader = ({
    team,
    user,
    isCaptain,
    activeMembers,
    userMemberRecord,
    userStatus,
    onLogoUpload,
    onJoinTeam,
    onAcceptRequest,
    onDeclineRequest,
    onLeaveTeam,
    onDeleteTeam
}) => {
    return (
        <div className="bg-cs-surface border border-white/10 p-1 mb-8 clip-path-slant">
            <div className="bg-gradient-to-r from-neutral-800 to-cs-surface p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cs-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-32 h-32 bg-black/50 flex items-center justify-center border border-white/10 shadow-2xl skew-x-[-5deg] relative overflow-hidden">
                            {team.logo_url ? (
                                <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover skew-x-[5deg]" />
                            ) : (
                                <Shield className="w-16 h-16 text-cs-text skew-x-[5deg]" />
                            )}
                        </div>

                        {isCaptain && (
                            <label className="cursor-pointer group flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cs-text hover:text-white transition-colors bg-white/5 px-3 py-1.5 border border-white/10 hover:border-cs-orange/50 skew-x-[-5deg]">
                                <input type="file" className="hidden" accept="image/*" onChange={onLogoUpload} />
                                <Upload className="w-3 h-3 group-hover:text-cs-orange transition-colors skew-x-[5deg]" />
                                <span className="skew-x-[5deg]">Изменить лого</span>
                            </label>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-block bg-cs-blue/10 text-cs-blue px-2 py-1 text-xs font-black uppercase tracking-widest mb-2 skew-x-[-10deg]">
                            <span className="skew-x-[10deg]">Team Profile</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter uppercase">{team.name}</h1>
                        <p className="text-cs-text text-lg max-w-2xl mb-6 font-medium">{team.description || 'Нет описания'}</p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold text-cs-text mb-6">
                            <span className="flex items-center gap-2 bg-black/30 px-3 py-1 border border-white/5 skew-x-[-10deg]">
                                <span className="skew-x-[10deg] flex items-center gap-2"><Users className="w-4 h-4" /> {activeMembers.length} / 5 Участников</span>
                            </span>
                            <span className="flex items-center gap-2 bg-black/30 px-3 py-1 border border-white/5 skew-x-[-10deg]">
                                <span className="skew-x-[10deg] flex items-center gap-2"><Crown className="w-4 h-4 text-cs-orange" /> Капитан:
                                    <Link to={`/user/${(team.captain?.custom_url && !team.captain.custom_url.includes('/')) ? team.captain.custom_url : team.captain?.id}`} className="text-white hover:text-cs-orange transition-colors">
                                        {team.captain?.nickname || 'Unknown'}
                                    </Link>
                                </span>
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            {!userMemberRecord && (
                                activeMembers.length >= 5 ? (
                                    <button disabled className="px-6 py-3 bg-green-500/10 text-green-500 font-black uppercase tracking-wider border border-green-500/20 skew-x-[-10deg] cursor-default">
                                        <span className="skew-x-[10deg] flex items-center gap-2"><Check className="w-5 h-5" /> Команда сформирована</span>
                                    </button>
                                ) : (
                                    user && (
                                        <button onClick={onJoinTeam} className="px-6 py-3 bg-cs-orange hover:bg-yellow-400 text-black font-black uppercase tracking-wider shadow-[0_0_20px_rgba(233,177,14,0.2)] skew-x-[-10deg]">
                                            <span className="skew-x-[10deg] flex items-center gap-2"><UserPlus className="w-5 h-5" /> Вступить в команду</span>
                                        </button>
                                    )
                                )
                            )}
                            {userStatus === 'pending' && (
                                <button disabled className="px-6 py-3 bg-white/10 text-white/50 font-bold uppercase tracking-wider skew-x-[-10deg] cursor-not-allowed border border-white/5">
                                    <span className="skew-x-[10deg] flex items-center gap-2"><Clock className="w-5 h-5" /> Заявка отправлена</span>
                                </button>
                            )}
                            {userStatus === 'invited' && (
                                <div className="flex gap-2">
                                    <button onClick={() => onAcceptRequest(user.id)} className="px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-wider shadow-[0_0_20px_rgba(34,197,94,0.2)] skew-x-[-10deg]">
                                        <span className="skew-x-[10deg] flex items-center gap-2"><Check className="w-5 h-5" /> Принять приглашение</span>
                                    </button>
                                    <button onClick={() => onDeclineRequest(user.id)} className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold uppercase tracking-wider skew-x-[-10deg]">
                                        <span className="skew-x-[10deg] flex items-center gap-2"><X className="w-5 h-5" /> Отклонить</span>
                                    </button>
                                </div>
                            )}
                            {userStatus === 'member' && !isCaptain && (
                                <button onClick={onLeaveTeam} className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold uppercase tracking-wider skew-x-[-10deg]">
                                    <span className="skew-x-[10deg] flex items-center gap-2"><LogOut className="w-5 h-5" /> Покинуть команду</span>
                                </button>
                            )}
                            {isCaptain && (
                                <button onClick={onDeleteTeam} className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold uppercase tracking-wider skew-x-[-10deg]">
                                    <span className="skew-x-[10deg] flex items-center gap-2"><Trash2 className="w-5 h-5" /> Удалить команду</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamHeader;
