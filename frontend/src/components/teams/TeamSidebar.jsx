import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, UserPlus, X } from 'lucide-react';

const TeamSidebar = ({
    pendingRequests,
    invitedMembers,
    onAcceptRequest,
    onDeclineRequest,
    onCancelInvite
}) => {
    return (
        <div className="space-y-8">
            {/* Pending Requests */}
            <div className="bg-cs-surface border border-white/5 clip-path-slant p-1">
                <div className="bg-neutral-900/80">
                    <div className="p-4 border-b border-white/5">
                        <h3 className="font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cs-blue" /> Заявки ({pendingRequests.length})
                        </h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <Link to={`/user/${(req.user?.custom_url && !req.user.custom_url.includes('/')) ? req.user.custom_url : req.user?.id}`} className="font-bold text-white hover:text-cs-orange transition-colors">
                                        {req.user?.nickname}
                                    </Link>
                                    <span className="text-xs text-cs-text">ID: {req.user_id}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => onAcceptRequest(req.user_id)} className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 py-1 text-xs font-bold uppercase skew-x-[-5deg]">
                                        <span className="skew-x-[5deg]">Принять</span>
                                    </button>
                                    <button onClick={() => onDeclineRequest(req.user_id)} className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-1 text-xs font-bold uppercase skew-x-[-5deg]">
                                        <span className="skew-x-[5deg]">Откл.</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {pendingRequests.length === 0 && (
                            <div className="p-4 text-center text-cs-text text-sm">Нет новых заявок</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Invited Players */}
            <div className="bg-cs-surface border border-white/5 clip-path-slant p-1">
                <div className="bg-neutral-900/80">
                    <div className="p-4 border-b border-white/5">
                        <h3 className="font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-cs-orange" /> Приглашения ({invitedMembers.length})
                        </h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {invitedMembers.map(inv => (
                            <div key={inv.id} className="p-4 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-white">
                                        <Link to={`/user/${(inv.user?.custom_url && !inv.user.custom_url.includes('/')) ? inv.user.custom_url : inv.user?.id}`} className="text-white hover:text-cs-orange transition-colors">
                                            {inv.user?.nickname || 'Unknown'}
                                        </Link>
                                    </div>
                                    <div className="text-xs text-cs-text">ID: {inv.user_id}</div>
                                </div>
                                <button onClick={() => onCancelInvite(inv.user_id)} className="text-red-500 hover:bg-red-500/10 p-2 transition-colors skew-x-[-5deg]">
                                    <X className="w-4 h-4 skew-x-[5deg]" />
                                </button>
                            </div>
                        ))}
                        {invitedMembers.length === 0 && (
                            <div className="p-4 text-center text-cs-text text-sm">Нет отправленных приглашений</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamSidebar;
