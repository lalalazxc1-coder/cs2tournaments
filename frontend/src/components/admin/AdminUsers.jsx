import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
    Search, MoreVertical, Shield, UserX, UserCheck,
    Edit, Save, X, Loader2, Trophy, Swords, History
} from 'lucide-react';

const AdminUsers = () => {
    const { directLogin, token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [userLobbies, setUserLobbies] = useState([]);
    const [userTournaments, setUserTournaments] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [activeModalTab, setActiveModalTab] = useState('info'); // info, lobbies, tournaments

    // Edit State
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({ nickname: '', steam_id: '', player_label: '' });
    const [savingProfile, setSavingProfile] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to first page on search change
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchUsers();
    }, [page, debouncedSearch]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getUsers({ search: debouncedSearch, page });
            setUsers(response.data.users);
            setTotalPages(response.data.pages);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = async (user) => {
        setSelectedUser(user);
        setLoadingDetails(true);
        setActiveModalTab('info');
        try {
            // Fetch stats
            const statsResponse = await adminAPI.getUserStats(user.id);
            setUserStats(statsResponse.data.stats);

            // Initialize profile data
            setProfileData({
                nickname: user.nickname || '',
                steam_id: user.steam_id || '',
                player_label: user.player_label || '',
                real_name: user.real_name || '',
                email: user.email || '',
                custom_url: user.custom_url || '',
                avatar_full: user.avatar_full || '',
                gender: user.gender || ''
            });

            // Fetch history
            const lobbiesResponse = await adminAPI.getUserLobbies(user.id);
            setUserLobbies(lobbiesResponse.data.lobbies);

            const tournamentsResponse = await adminAPI.getUserTournaments(user.id);
            setUserTournaments(tournamentsResponse.data.tournaments);

        } catch (error) {
            console.error('Failed to fetch user details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            await adminAPI.updateUserProfile(selectedUser.id, profileData);
            setEditingProfile(false);
            // Update local state
            setSelectedUser({ ...selectedUser, ...profileData });
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...profileData } : u));
            alert('Профиль обновлен');
        } catch (error) {
            alert('Ошибка при обновлении профиля: ' + (error.response?.data?.message || error.message));
        } finally {
            setSavingProfile(false);
        }
    };

    const handleRoleChange = async (newRole) => {
        if (!window.confirm('Вы уверены, что хотите изменить роль пользователя?')) return;
        try {
            await adminAPI.updateUserRole(selectedUser.id, newRole);
            setSelectedUser({ ...selectedUser, role: newRole });
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u));
        } catch (error) {
            alert('Ошибка при изменении роли');
        }
    };

    const handleBan = async (isBlocked) => {
        // Removed reason prompt as it wasn't used by backend
        const duration = isBlocked ? prompt('Длительность блокировки в днях (0 для вечной):', '0') : null;

        if (isBlocked && duration === null) return; // Cancelled

        let blockedUntil = null;
        if (isBlocked && duration && duration !== '0') {
            const date = new Date();
            date.setDate(date.getDate() + parseInt(duration));
            blockedUntil = date.toISOString();
        }

        try {
            await adminAPI.banUser(selectedUser.id, isBlocked, blockedUntil);
            setSelectedUser({ ...selectedUser, is_blocked: isBlocked, blocked_until: blockedUntil });
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, is_blocked: isBlocked, blocked_until: blockedUntil } : u));
        } catch (error) {
            alert('Ошибка при изменении статуса блокировки');
        }
    };

    const handleImpersonate = async (user = selectedUser) => {
        if (!user) return;
        // Removed confirmation as requested
        try {
            // Save admin token to allow returning
            localStorage.setItem('adminToken', token);

            const response = await adminAPI.impersonateUser(user.id);
            const { token: newToken, user: userData } = response.data;
            directLogin(userData, newToken);
            window.location.href = '/profile'; // Redirect to profile
        } catch (error) {
            alert('Ошибка при авторизации: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div>
            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Поиск по никнейму, Steam ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-10 pr-10 text-white focus:border-brand-primary focus:outline-none"
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                </div>
            ) : (
                <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-800 text-gray-400 text-sm uppercase">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Пользователь</th>
                                <th className="p-4">Роль</th>
                                <th className="p-4">Статус</th>
                                <th className="p-4">Активность</th>
                                <th className="p-4 text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-neutral-800/50 transition-colors">
                                    <td className="p-4 text-gray-400">#{user.id}</td>
                                    <td className="p-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center mr-3 text-brand-primary font-bold overflow-hidden border border-neutral-700">
                                                {user.avatar_medium ? (
                                                    <img src={user.avatar_medium} alt={user.nickname} className="w-full h-full object-cover" />
                                                ) : (
                                                    user.nickname?.[0]?.toUpperCase() || '?'
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white flex items-center gap-2">
                                                    {user.nickname || 'Без никнейма'}
                                                    {user.player_label && (
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                                                            {user.player_label}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">ID: {user.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 2 ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                                            user.role === 1 ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' :
                                                'bg-gray-500/20 text-gray-500 border border-gray-500/30'
                                            }`}>
                                            {user.role === 2 ? 'Admin' : user.role === 1 ? 'Organizer' : 'Player'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {user.is_blocked ? (
                                            <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-red-500/20 text-red-500 border border-red-500/30">
                                                Banned
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-green-500/20 text-green-500 border border-green-500/30">
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            {(() => {
                                                const lastSeen = new Date(user.last_seen);
                                                const now = new Date();
                                                const diffMinutes = (now - lastSeen) / 1000 / 60;
                                                const isOnline = diffMinutes < 5;

                                                return (
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-600'}`}></div>
                                                        <span className={isOnline ? 'text-green-500 font-bold' : 'text-gray-500'}>
                                                            {isOnline ? 'Online' : lastSeen.toLocaleString()}
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                            <div className="text-[10px] text-gray-600">
                                                Рег: {new Date(user.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleImpersonate(user); }}
                                                className="p-2 text-blue-400 hover:text-white hover:bg-blue-600/20 rounded-lg transition-colors"
                                                title="Войти как этот пользователь"
                                            >
                                                <UserCheck className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleUserClick(user)}
                                                className="p-2 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 bg-neutral-800 rounded disabled:opacity-50 text-white hover:bg-neutral-700"
                    >
                        Назад
                    </button>
                    <span className="px-4 py-2 text-gray-400">
                        Страница {page} из {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 bg-neutral-800 rounded disabled:opacity-50 text-white hover:bg-neutral-700"
                    >
                        Вперед
                    </button>
                </div>
            )}

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        {/* Header */}
                        <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-800/50">
                            <div className="flex items-center">
                                <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center mr-4 text-brand-primary font-bold text-xl overflow-hidden border-2 border-neutral-700">
                                    {selectedUser.avatar_full ? (
                                        <img src={selectedUser.avatar_full} alt={selectedUser.nickname} className="w-full h-full object-cover" />
                                    ) : (
                                        selectedUser.nickname?.[0]?.toUpperCase() || '?'
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        {selectedUser.nickname}
                                        {selectedUser.player_label && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                                                {selectedUser.player_label}
                                            </span>
                                        )}
                                    </h2>
                                    <p className="text-gray-400 flex items-center gap-2 mt-0.5 text-xs">
                                        <span>ID: {selectedUser.id}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                        <span>Steam ID: {selectedUser.steam_id || 'Не привязан'}</span>
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-neutral-800 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-neutral-800 px-4 bg-neutral-900/50">
                            <button
                                onClick={() => setActiveModalTab('info')}
                                className={`py-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeModalTab === 'info' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-white'
                                    }`}
                            >
                                Информация
                            </button>
                            <button
                                onClick={() => setActiveModalTab('lobbies')}
                                className={`py-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeModalTab === 'lobbies' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-white'
                                    }`}
                            >
                                Матчи (5x5)
                            </button>
                            <button
                                onClick={() => setActiveModalTab('tournaments')}
                                className={`py-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeModalTab === 'tournaments' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-white'
                                    }`}
                            >
                                Турниры
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 overflow-y-auto flex-1 bg-neutral-900">
                            {loadingDetails ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                                </div>
                            ) : (
                                <>
                                    {activeModalTab === 'info' && (
                                        <div className="flex flex-col lg:flex-row gap-6 h-full">
                                            {/* Left Column: Profile Edit & Access */}
                                            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                                        <Shield className="w-4 h-4 text-brand-primary" />
                                                        Профиль
                                                    </h3>
                                                    {!editingProfile ? (
                                                        <button
                                                            onClick={() => setEditingProfile(true)}
                                                            className="text-brand-primary hover:text-white flex items-center text-xs bg-brand-primary/10 px-2 py-1 rounded hover:bg-brand-primary/20 transition-colors"
                                                        >
                                                            <Edit className="w-3 h-3 mr-1" /> Редактировать
                                                        </button>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={handleSaveProfile}
                                                                disabled={savingProfile}
                                                                className="text-green-500 hover:text-green-400 flex items-center text-xs bg-green-500/10 px-2 py-1 rounded hover:bg-green-500/20 transition-colors"
                                                            >
                                                                <Save className="w-3 h-3 mr-1" /> Сохранить
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingProfile(false)}
                                                                className="text-red-500 hover:text-red-400 flex items-center text-xs bg-red-500/10 px-2 py-1 rounded hover:bg-red-500/20 transition-colors"
                                                            >
                                                                <X className="w-3 h-3 mr-1" /> Отмена
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-[10px] uppercase text-gray-500 mb-1 font-bold">Никнейм</label>
                                                        <input
                                                            type="text"
                                                            value={editingProfile ? profileData.nickname : selectedUser.nickname}
                                                            onChange={(e) => setProfileData({ ...profileData, nickname: e.target.value })}
                                                            disabled={!editingProfile}
                                                            className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-sm text-white disabled:opacity-50 focus:border-brand-primary focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] uppercase text-gray-500 mb-1 font-bold">Реальное имя</label>
                                                        <input
                                                            type="text"
                                                            value={editingProfile ? profileData.real_name : selectedUser.real_name}
                                                            onChange={(e) => setProfileData({ ...profileData, real_name: e.target.value })}
                                                            disabled={!editingProfile}
                                                            className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-sm text-white disabled:opacity-50 focus:border-brand-primary focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] uppercase text-gray-500 mb-1 font-bold">Пол</label>
                                                        <select
                                                            value={editingProfile ? profileData.gender : selectedUser.gender || ''}
                                                            onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                                                            disabled={!editingProfile}
                                                            className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-sm text-white disabled:opacity-50 focus:border-brand-primary focus:outline-none transition-colors"
                                                        >
                                                            <option value="">Не указан</option>
                                                            <option value="male">Мужской</option>
                                                            <option value="female">Женский</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] uppercase text-gray-500 mb-1 font-bold">Steam ID</label>
                                                        <input
                                                            type="text"
                                                            value={editingProfile ? profileData.steam_id : selectedUser.steam_id}
                                                            onChange={(e) => setProfileData({ ...profileData, steam_id: e.target.value })}
                                                            disabled={!editingProfile}
                                                            className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-sm text-white disabled:opacity-50 focus:border-brand-primary focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] uppercase text-gray-500 mb-1 font-bold">Email</label>
                                                        <input
                                                            type="email"
                                                            value={editingProfile ? profileData.email : selectedUser.email}
                                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                            disabled={!editingProfile}
                                                            className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-sm text-white disabled:opacity-50 focus:border-brand-primary focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] uppercase text-gray-500 mb-1 font-bold">Custom URL</label>
                                                        <input
                                                            type="text"
                                                            value={editingProfile ? profileData.custom_url : selectedUser.custom_url}
                                                            onChange={(e) => setProfileData({ ...profileData, custom_url: e.target.value })}
                                                            disabled={!editingProfile}
                                                            className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-sm text-white disabled:opacity-50 focus:border-brand-primary focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] uppercase text-gray-500 mb-1 font-bold">Метка игрока</label>
                                                        <input
                                                            type="text"
                                                            value={editingProfile ? profileData.player_label : selectedUser.player_label || ''}
                                                            onChange={(e) => setProfileData({ ...profileData, player_label: e.target.value })}
                                                            disabled={!editingProfile}
                                                            placeholder="Например: PRO, VIP"
                                                            className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-sm text-white disabled:opacity-50 focus:border-brand-primary focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] uppercase text-gray-500 mb-1 font-bold">Avatar URL</label>
                                                        <input
                                                            type="text"
                                                            value={editingProfile ? profileData.avatar_full : selectedUser.avatar_full}
                                                            onChange={(e) => setProfileData({ ...profileData, avatar_full: e.target.value })}
                                                            disabled={!editingProfile}
                                                            className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-sm text-white disabled:opacity-50 focus:border-brand-primary focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-neutral-800">
                                                    <h3 className="text-base font-bold text-white mb-3">Управление доступом</h3>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-[10px] uppercase text-gray-500 mb-1 font-bold">Роль</label>
                                                            <div className="flex gap-2">
                                                                {[0, 1, 2].map(role => (
                                                                    <button
                                                                        key={role}
                                                                        onClick={() => handleRoleChange(role)}
                                                                        className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${selectedUser.role === role
                                                                            ? 'bg-brand-primary text-black shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                                                                            : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'
                                                                            }`}
                                                                    >
                                                                        {role === 2 ? 'Admin' : role === 1 ? 'Organizer' : 'Player'}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={handleImpersonate}
                                                                className="flex-1 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded transition-colors flex justify-center items-center font-bold text-xs"
                                                            >
                                                                <UserCheck className="w-3 h-3 mr-1" />
                                                                Войти
                                                            </button>

                                                            {selectedUser.is_blocked ? (
                                                                <button
                                                                    onClick={() => handleBan(false)}
                                                                    className="flex-1 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded transition-colors flex justify-center items-center font-bold text-xs"
                                                                >
                                                                    <UserCheck className="w-3 h-3 mr-1" />
                                                                    Разблок.
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleBan(true)}
                                                                    className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded transition-colors flex justify-center items-center font-bold text-xs"
                                                                >
                                                                    <UserX className="w-3 h-3 mr-1" />
                                                                    Заблок.
                                                                </button>
                                                            )}
                                                        </div>
                                                        {selectedUser.blocked_until && (
                                                            <p className="text-[10px] text-red-400 text-center bg-red-500/10 py-1 rounded border border-red-500/20">
                                                                Бан до: {new Date(selectedUser.blocked_until).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column: Stats */}
                                            <div className="w-full lg:w-1/3 border-l border-neutral-800 pl-0 lg:pl-6 pt-6 lg:pt-0">
                                                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                                                    <Trophy className="w-4 h-4 text-brand-primary" />
                                                    Статистика
                                                </h3>
                                                {userStats ? (
                                                    <div className="bg-neutral-800/50 rounded-xl p-3 space-y-3 border border-neutral-700">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="bg-neutral-900 p-2 rounded border border-neutral-800 text-center">
                                                                <div className="text-gray-500 text-[10px] uppercase font-bold mb-0.5">Матчи</div>
                                                                <div className="text-lg font-bold text-white">{userStats.total_matches}</div>
                                                            </div>
                                                            <div className="bg-neutral-900 p-2 rounded border border-neutral-800 text-center">
                                                                <div className="text-gray-500 text-[10px] uppercase font-bold mb-0.5">Win Rate</div>
                                                                <div className="text-lg font-bold text-brand-primary">{userStats.win_rate}%</div>
                                                            </div>
                                                            <div className="bg-neutral-900 p-2 rounded border border-neutral-800 text-center">
                                                                <div className="text-gray-500 text-[10px] uppercase font-bold mb-0.5">K/D</div>
                                                                <div className="text-lg font-bold text-white">{userStats.k_d_ratio}</div>
                                                            </div>
                                                            <div className="bg-neutral-900 p-2 rounded border border-neutral-800 text-center">
                                                                <div className="text-gray-500 text-[10px] uppercase font-bold mb-0.5">HS %</div>
                                                                <div className="text-lg font-bold text-white">{userStats.avg_hs_percent}%</div>
                                                            </div>
                                                        </div>
                                                        <div className="pt-3 border-t border-neutral-700 space-y-2">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-gray-400">Убийств</span>
                                                                <span className="text-white font-mono">{userStats.total_kills}</span>
                                                            </div>
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-gray-400">Смертей</span>
                                                                <span className="text-white font-mono">{userStats.total_deaths}</span>
                                                            </div>
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-gray-400">ADR</span>
                                                                <span className="text-white font-mono">{userStats.avg_adr}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-500 text-xs text-center py-8 bg-neutral-800/30 rounded-xl border border-neutral-800 border-dashed">
                                                        Нет статистики
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeModalTab === 'lobbies' && (
                                        <div>
                                            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                                                <Swords className="w-4 h-4 text-brand-primary" />
                                                История матчей (5x5)
                                            </h3>
                                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                                {userLobbies.length > 0 ? (
                                                    userLobbies.map(lobby => (
                                                        <div key={lobby.id} className="bg-neutral-800 p-3 rounded flex justify-between items-center border border-neutral-700 hover:border-brand-primary/50 transition-colors">
                                                            <div>
                                                                <div className="font-bold text-white text-sm">{lobby.name}</div>
                                                                <div className="text-[10px] text-gray-400">{new Date(lobby.created_at).toLocaleDateString()}</div>
                                                            </div>
                                                            <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${lobby.status === 'finished' ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500'
                                                                }`}>
                                                                {lobby.status}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center text-gray-500 py-8 bg-neutral-800/30 rounded border border-neutral-800 border-dashed text-sm">Нет сыгранных матчей</div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeModalTab === 'tournaments' && (
                                        <div>
                                            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                                                <Trophy className="w-4 h-4 text-brand-primary" />
                                                История турниров
                                            </h3>
                                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                                {userTournaments.length > 0 ? (
                                                    userTournaments.map(tournament => (
                                                        <div key={tournament.id} className="bg-neutral-800 p-3 rounded flex justify-between items-center border border-neutral-700 hover:border-brand-primary/50 transition-colors">
                                                            <div>
                                                                <div className="font-bold text-white text-sm">{tournament.name}</div>
                                                                <div className="text-[10px] text-gray-400">{new Date(tournament.start_date).toLocaleDateString()}</div>
                                                            </div>
                                                            <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${tournament.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                                                                }`}>
                                                                {tournament.status}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center text-gray-500 py-8 bg-neutral-800/30 rounded border border-neutral-800 border-dashed text-sm">Нет участий в турнирах</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
