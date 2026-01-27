import React, { useState, useRef } from 'react';
import { Loader2, UserMinus, Clock, UserPlus, X } from 'lucide-react';
import { userAPI } from '../../utils/api';

const FriendActionButton = ({ userData, isOwner, isAuthenticated, initialStatus, onStatusChange, fullWidth = false }) => {
    const [loading, setLoading] = useState(false);
    const [optimisticStatus, setOptimisticStatus] = useState(undefined);
    const lastAddActionTime = useRef(0);

    if (isOwner || !isAuthenticated) return null;

    const currentStatus = optimisticStatus !== undefined ? optimisticStatus : (initialStatus || 'none');

    const handleFriendAction = async (action) => {
        if (loading) return;

        // Anti-flood: Prevent spamming friend requests
        if (action === 'add') {
            const now = Date.now();
            if (now - lastAddActionTime.current < 5000) {
                alert('Пожалуйста, подождите 5 секунд перед отправкой повторной заявки.');
                return;
            }
            lastAddActionTime.current = now;
        }

        setLoading(true);

        // Store previous status for rollback
        const previousStatus = currentStatus;

        try {
            let newStatus;
            if (action === 'add') {
                newStatus = 'pending_sent';
                setOptimisticStatus(newStatus);
                await userAPI.addFriend(userData.id);
            } else if (action === 'cancel') {
                newStatus = 'none';
                setOptimisticStatus(newStatus);
                await userAPI.removeFriend(userData.id);
            } else if (action === 'accept') {
                newStatus = 'friends';
                setOptimisticStatus(newStatus);
                await userAPI.addFriend(userData.id);
            } else if (action === 'remove') {
                if (!confirm('Вы действительно хотите удалить этого пользователя из друзей?')) {
                    setLoading(false);
                    return;
                }
                newStatus = 'none';
                setOptimisticStatus(newStatus);
                await userAPI.removeFriend(userData.id);
            }

            if (onStatusChange) {
                onStatusChange(newStatus);
            }

        } catch (err) {
            console.error('Friend action error:', err);
            // Revert on error
            setOptimisticStatus(previousStatus);
            const errorMessage = err.response?.data?.message || 'Ошибка при выполнении действия';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <button disabled className={`px-4 py-2 bg-white/5 text-white/50 border border-white/10 font-bold uppercase tracking-wider skew-x-[-10deg] cursor-not-allowed flex items-center gap-2 ${fullWidth ? 'w-full justify-center' : ''}`}>
                <span className="skew-x-[10deg] flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Загрузка...</span>
            </button>
        );
    }

    switch (currentStatus) {
        case 'friends':
            return (
                <button onClick={() => handleFriendAction('remove')} className={`px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white font-bold uppercase tracking-wider skew-x-[-10deg] transition-all flex items-center gap-2 ${fullWidth ? 'w-full justify-center' : ''}`}>
                    <span className="skew-x-[10deg] flex items-center gap-2"><UserMinus className="w-4 h-4" /> Удалить</span>
                </button>
            );
        case 'pending_sent':
            return (
                <button onClick={() => handleFriendAction('cancel')} className={`px-4 py-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/50 hover:bg-yellow-500 hover:text-black font-bold uppercase tracking-wider skew-x-[-10deg] transition-all flex items-center gap-2 ${fullWidth ? 'w-full justify-center' : ''}`}>
                    <span className="skew-x-[10deg] flex items-center gap-2"><Clock className="w-4 h-4" /> Заявка отправлена</span>
                </button>
            );
        case 'pending_received':
            return (
                <div className={`flex gap-2 ${fullWidth ? 'w-full' : ''}`}>
                    <button onClick={() => handleFriendAction('accept')} className={`px-4 py-2 bg-green-500 text-white hover:bg-green-600 font-bold uppercase tracking-wider skew-x-[-10deg] transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)] ${fullWidth ? 'flex-1 justify-center' : ''}`}>
                        <span className="skew-x-[10deg] flex items-center gap-2"><UserPlus className="w-4 h-4" /> Принять</span>
                    </button>
                    <button onClick={() => handleFriendAction('cancel')} className="px-3 py-2 bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white font-bold uppercase tracking-wider skew-x-[-10deg] transition-all flex items-center justify-center" title="Отклонить">
                        <span className="skew-x-[10deg]"><X className="w-5 h-5" /></span>
                    </button>
                </div>
            );
        default:
            return (
                <button onClick={() => handleFriendAction('add')} className={`px-4 py-2 bg-cs-orange text-black hover:bg-yellow-400 font-bold uppercase tracking-wider skew-x-[-10deg] transition-all flex items-center gap-2 ${fullWidth ? 'w-full justify-center' : ''}`}>
                    <span className="skew-x-[10deg] flex items-center gap-2"><UserPlus className="w-4 h-4" /> Добавить</span>
                </button>
            );
    }
};

export default FriendActionButton;
