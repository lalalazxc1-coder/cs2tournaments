import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Search, UserPlus, X, Check, UserMinus, Gift, Trash2 } from 'lucide-react';
import { userAPI } from '../../utils/api';

const ProfileFriends = () => {
    const { profile, isOwner, setProfile } = useOutletContext();
    const { friends } = profile;
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('friends'); // friends, incoming, outgoing

    const handleAcceptRequest = async (friendId) => {
        try {
            await userAPI.addFriend(friendId);
            setProfile(prev => ({
                ...prev,
                friends: prev.friends.map(f =>
                    f.id === friendId ? { ...f, friendship_status: 'friends' } : f
                )
            }));
        } catch (err) {
            console.error('Failed to accept request:', err);
        }
    };

    const handleRemoveFriend = async (friendId) => {
        if (!confirm('Вы действительно хотите удалить этого пользователя из друзей?')) return;
        try {
            await userAPI.removeFriend(friendId);
            setProfile(prev => ({
                ...prev,
                friends: prev.friends.filter(f => f.id !== friendId)
            }));
        } catch (err) {
            console.error('Failed to remove friend:', err);
        }
    };

    // Filter friends based on active tab
    let displayedFriends = friends || [];
    if (activeTab === 'friends') {
        displayedFriends = (friends || []).filter(f => !f.friendship_status || f.friendship_status === 'accepted' || f.friendship_status === 'friends');
    } else if (activeTab === 'incoming') {
        displayedFriends = (friends || []).filter(f => f.friendship_status === 'pending_received');
    } else if (activeTab === 'outgoing') {
        displayedFriends = (friends || []).filter(f => f.friendship_status === 'pending_sent');
    }

    // Filter by search term
    displayedFriends = displayedFriends.filter(friend =>
        friend.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-cs-surface border border-white/10 clip-path-slant flex flex-col">
            {/* Header & Search */}
            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Tabs (Only for owner) */}
                {isOwner ? (
                    <div className="flex gap-1">
                        <button
                            onClick={() => setActiveTab('friends')}
                            className={`px-4 py-2 font-bold uppercase text-xs skew-x-[-10deg] transition-colors ${activeTab === 'friends' ? 'bg-cs-orange text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            <span className="skew-x-[10deg]">Друзья</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('incoming')}
                            className={`px-4 py-2 font-bold uppercase text-xs skew-x-[-10deg] transition-colors ${activeTab === 'incoming' ? 'bg-cs-orange text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            <span className="skew-x-[10deg]">Входящие</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('outgoing')}
                            className={`px-4 py-2 font-bold uppercase text-xs skew-x-[-10deg] transition-colors ${activeTab === 'outgoing' ? 'bg-cs-orange text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            <span className="skew-x-[10deg]">Исходящие</span>
                        </button>
                    </div>
                ) : (
                    <div className="font-bold text-white uppercase tracking-wider">Все друзья</div>
                )}

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Поиск..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 py-2 pl-10 pr-4 text-sm text-white focus:border-cs-orange focus:outline-none skew-x-[-5deg]"
                    />
                    <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            {/* Friends List */}
            <div className="flex-1">
                {displayedFriends.length > 0 ? (
                    <div className="flex flex-col">
                        {displayedFriends.map(friend => (
                            <div
                                key={friend.id}
                                className="flex flex-col md:flex-row items-center gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors group"
                            >
                                {/* User Info */}
                                <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                                    <Link to={`/user/${(friend.custom_url && !friend.custom_url.includes('/')) ? friend.custom_url : friend.id}`} className="flex-shrink-0 relative">
                                        <div className="w-10 h-10 rounded-full bg-black border border-white/10 overflow-hidden group-hover:border-cs-orange transition-colors">
                                            <img
                                                src={friend.avatar_medium || '/defolt.png'}
                                                alt={friend.nickname}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </Link>
                                    <div className="flex flex-col">
                                        <Link to={`/user/${(friend.custom_url && !friend.custom_url.includes('/')) ? friend.custom_url : friend.id}`} className="font-bold text-white group-hover:text-cs-orange transition-colors text-sm">
                                            {friend.nickname}
                                        </Link>
                                    </div>
                                </div>

                                {/* Placeholder Stats (Hidden on mobile for now) */}
                                <div className="hidden md:block text-xs text-gray-500 w-32 text-center">
                                    {/* дружат с ... */}
                                </div>
                                <div className="hidden md:block text-xs text-gray-500 w-32 text-center">
                                    {/* ... игр вместе */}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                                    {isOwner && (
                                        <div className="flex items-center gap-2">
                                            {activeTab === 'friends' && (
                                                <button
                                                    onClick={() => handleRemoveFriend(friend.id)}
                                                    className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors text-xs font-medium px-2 py-1"
                                                    title="Удалить из друзей"
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span className="hidden md:inline">Удалить</span>
                                                </button>
                                            )}
                                            {activeTab === 'incoming' && (
                                                <>
                                                    <button
                                                        onClick={() => handleAcceptRequest(friend.id)}
                                                        className="p-2 text-green-500 hover:bg-green-500/10 transition-colors rounded-full"
                                                        title="Принять"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveFriend(friend.id)}
                                                        className="p-2 text-red-500 hover:bg-red-500/10 transition-colors rounded-full"
                                                        title="Отклонить"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            {activeTab === 'outgoing' && (
                                                <button
                                                    onClick={() => handleRemoveFriend(friend.id)}
                                                    className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors text-xs font-medium px-2 py-1"
                                                    title="Отменить заявку"
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span className="hidden md:inline">Отменить</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-cs-text text-sm">
                        {!isOwner && !profile.privacy?.can_view_friends ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-2">
                                    <UserMinus className="w-6 h-6 opacity-50" />
                                </div>
                                <span className="font-bold text-white">{profile.user.nickname} скрыл свой список друзей</span>
                            </div>
                        ) : (
                            <div>
                                {searchTerm ? 'Ничего не найдено' : (
                                    activeTab === 'incoming' ? 'У вас нет входящих заявок' :
                                        activeTab === 'outgoing' ? 'У вас нет исходящих заявок' :
                                            isOwner ? 'У вас нет друзей' : 'У данного пользователя нет друзей'
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileFriends;
