import React from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Crown, Trash2 } from 'lucide-react';

const TeamRoster = ({
    activeMembers,
    isCaptain,
    user,
    onInviteClick,
    onRemoveMember
}) => {
    return (
        <>
            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 flex-shrink-0">
                <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-wider">
                    <Users className="w-5 h-5 text-cs-orange" /> Состав Команды
                </h2>
                {isCaptain && activeMembers.length < 5 && (
                    <div className="w-full md:w-auto">
                        <button
                            onClick={onInviteClick}
                            className="bg-cs-orange hover:bg-yellow-400 text-black px-4 py-2 font-bold transition-colors skew-x-[-10deg] flex items-center gap-2 shadow-[0_0_15px_rgba(233,177,14,0.3)]"
                        >
                            <UserPlus className="w-5 h-5 skew-x-[10deg]" />
                            <span className="skew-x-[10deg]">Пригласить участника</span>
                        </button>
                    </div>
                )}
            </div>
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                {activeMembers.map(member => (
                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-black/50 flex items-center justify-center font-bold text-cs-text border border-white/10 skew-x-[-10deg]">
                                <span className="skew-x-[10deg]">{member.user?.nickname?.[0] || '?'}</span>
                            </div>
                            <div>
                                <Link to={`/user/${(member.user?.custom_url && !member.user.custom_url.includes('/')) ? member.user.custom_url : member.user?.id}`} className="font-black text-white flex items-center gap-2 uppercase tracking-tight group-hover:text-cs-orange transition-colors">
                                    {member.user?.nickname || 'Unknown'}
                                    {member.role === 'captain' && <Crown className="w-3 h-3 text-cs-orange" />}
                                </Link>
                                <div className="text-xs text-cs-text font-mono uppercase">Role: {member.role}</div>
                            </div>
                        </div>
                        {isCaptain && member.user_id !== user.id && (
                            <button onClick={() => onRemoveMember(member.user_id)} className="text-red-500 hover:bg-red-500/10 p-2 transition-colors skew-x-[-10deg]">
                                <Trash2 className="w-4 h-4 skew-x-[10deg]" />
                            </button>
                        )}
                    </div>
                ))}
                {activeMembers.length === 0 && (
                    <div className="p-8 text-center text-cs-text font-bold uppercase tracking-wider">В команде пока нет участников</div>
                )}
            </div>
        </>
    );
};

export default TeamRoster;
