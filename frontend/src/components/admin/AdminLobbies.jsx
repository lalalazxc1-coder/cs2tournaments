import React, { useState, useEffect } from 'react';
import { adminAPI, lobbyAPI } from '../../utils/api';
import { Loader2, Search, Edit, Trash2, X, Save, Gamepad2, Users, ChevronLeft, ChevronRight } from 'lucide-react';

const CS2_MAPS = ['Ancient', 'Anubis', 'Dust II', 'Inferno', 'Mirage', 'Nuke', 'Overpass', 'Vertigo', 'Train'];

const AdminLobbies = () => {
    // Data State
    const [lobbies, setLobbies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    // Filter State
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    // Modal State
    const [activeModal, setActiveModal] = useState(null); // 'edit'
    const [selectedLobby, setSelectedLobby] = useState(null);
    const [activeTab, setActiveTab] = useState('general'); // 'general', 'participants'

    // Form State
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    // Participants State
    const [participants, setParticipants] = useState([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [newParticipantId, setNewParticipantId] = useState('');
    const [addingParticipant, setAddingParticipant] = useState(false);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch Data
    useEffect(() => {
        fetchLobbies();
    }, [debouncedSearch, page]);

    const fetchLobbies = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getLobbies({ search: debouncedSearch, page, limit });
            setLobbies(response.data.lobbies);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Failed to fetch lobbies:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchParticipants = async (lobbyId) => {
        setLoadingParticipants(true);
        try {
            const response = await adminAPI.getLobbyParticipants(lobbyId);
            setParticipants(response.data.participants);
        } catch (error) {
            console.error('Failed to fetch participants:', error);
        } finally {
            setLoadingParticipants(false);
        }
    };

    // Handlers
    const handleEditClick = (lobby) => {
        setSelectedLobby(lobby);

        let maps = [];
        try {
            if (typeof lobby.map_pool === 'string') {
                maps = JSON.parse(lobby.map_pool);
            } else if (Array.isArray(lobby.map_pool)) {
                maps = lobby.map_pool;
            }
        } catch (e) {
            maps = lobby.map_pool ? lobby.map_pool.split(',').map(s => s.trim()) : [];
        }

        setFormData({
            name: lobby.name,
            status: lobby.status,
            map_pool: maps,
            format: lobby.format,
            max_participants: lobby.max_participants,
            date_time: lobby.date_time
        });
        setActiveModal('edit');
        setActiveTab('general');
        fetchParticipants(lobby.id);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить это лобби? Это действие нельзя отменить.')) return;
        try {
            await adminAPI.deleteLobby(id);
            fetchLobbies();
        } catch (error) {
            alert('Ошибка при удалении лобби');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminAPI.updateLobby(selectedLobby.id, formData);
            alert('Лобби обновлено');
            setActiveModal(null);
            fetchLobbies();
        } catch (error) {
            alert('Ошибка при сохранении: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const handleAddParticipant = async (e) => {
        e.preventDefault();
        if (!newParticipantId) return;

        setAddingParticipant(true);
        try {
            await adminAPI.addLobbyUser(selectedLobby.id, newParticipantId);
            setNewParticipantId('');
            fetchParticipants(selectedLobby.id);
            alert('Участник добавлен');
        } catch (error) {
            alert('Ошибка: ' + (error.response?.data?.message || error.message));
        } finally {
            setAddingParticipant(false);
        }
    };

    const handleKickUser = async (userId) => {
        if (!window.confirm('Исключить игрока?')) return;
        try {
            await adminAPI.kickLobbyUser(selectedLobby.id, userId);
            fetchParticipants(selectedLobby.id);
        } catch (error) {
            alert('Ошибка при исключении игрока');
        }
    };

    const toggleMap = (map) => {
        const currentMaps = formData.map_pool || [];
        if (currentMaps.includes(map)) {
            setFormData({ ...formData, map_pool: currentMaps.filter(m => m !== map) });
        } else {
            setFormData({ ...formData, map_pool: [...currentMaps, map] });
        }
    };

    // Render Helpers
    const getStatusBadge = (status) => {
        const styles = {
            registering: 'bg-yellow-500/20 text-yellow-500',
            live: 'bg-red-500/20 text-red-500',
            finished: 'bg-blue-500/20 text-blue-500',
            cancelled: 'bg-neutral-500/20 text-gray-400'
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${styles[status] || 'bg-green-500/20 text-green-500'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white">Лобби (5x5)</h2>
                <p className="text-gray-400 text-sm">Управление игровыми лобби и участниками</p>
            </div>

            {/* Filters */}
            <div className="flex gap-4 bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Поиск лобби..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-brand-primary focus:outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-800 text-gray-400 text-sm uppercase">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Название</th>
                                <th className="p-4">Статус</th>
                                <th className="p-4">Формат</th>
                                <th className="p-4">Дата</th>
                                <th className="p-4 text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : lobbies.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        Лобби не найдены
                                    </td>
                                </tr>
                            ) : (
                                lobbies.map((lobby) => (
                                    <tr key={lobby.id} className="hover:bg-neutral-800/50 transition-colors group">
                                        <td className="p-4 text-gray-500">#{lobby.id}</td>
                                        <td className="p-4 font-bold text-white">{lobby.name}</td>
                                        <td className="p-4">{getStatusBadge(lobby.status)}</td>
                                        <td className="p-4 text-gray-300">{lobby.format}</td>
                                        <td className="p-4 text-gray-300 text-sm">
                                            {new Date(lobby.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditClick(lobby)}
                                                    className="p-2 bg-neutral-800 rounded-lg text-blue-500 hover:text-white hover:bg-blue-600 transition-colors"
                                                    title="Редактировать"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(lobby.id)}
                                                    className="p-2 bg-neutral-800 rounded-lg text-red-500 hover:text-white hover:bg-red-600 transition-colors"
                                                    title="Удалить"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-neutral-800 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Всего: {total}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 bg-neutral-800 rounded-lg text-gray-400 hover:text-white disabled:opacity-50"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="px-4 py-2 bg-neutral-800 rounded-lg text-gray-300">
                            {page}
                        </span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page * limit >= total}
                            className="p-2 bg-neutral-800 rounded-lg text-gray-400 hover:text-white disabled:opacity-50"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {activeModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-neutral-800">
                            <h3 className="text-xl font-bold text-white flex items-center">
                                <Gamepad2 className="w-6 h-6 mr-3 text-brand-primary" />
                                Редактирование: {selectedLobby?.name}
                            </h3>
                            <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-neutral-800 px-6">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general'
                                    ? 'border-brand-primary text-brand-primary'
                                    : 'border-transparent text-gray-400 hover:text-white'
                                    }`}
                            >
                                Основное
                            </button>
                            <button
                                onClick={() => setActiveTab('participants')}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'participants'
                                    ? 'border-brand-primary text-brand-primary'
                                    : 'border-transparent text-gray-400 hover:text-white'
                                    }`}
                            >
                                Участники ({participants.length})
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {activeTab === 'general' ? (
                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Название</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-brand-primary focus:outline-none"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Формат</label>
                                                <select
                                                    value={formData.format}
                                                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-brand-primary focus:outline-none"
                                                >
                                                    <option value="1x1">1x1</option>
                                                    <option value="2x2">2x2</option>
                                                    <option value="5x5">5x5</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Статус</label>
                                                <select
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-brand-primary focus:outline-none"
                                                >
                                                    <option value="registering">Registering</option>
                                                    <option value="live">Live</option>
                                                    <option value="finished">Finished</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Макс. участников</label>
                                                <input
                                                    type="number"
                                                    value={formData.max_participants}
                                                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-brand-primary focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Map Pool</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                            {CS2_MAPS.map(map => (
                                                <button
                                                    key={map}
                                                    type="button"
                                                    onClick={() => toggleMap(map)}
                                                    className={`p-2 rounded-lg text-sm font-medium transition-all border ${formData.map_pool?.includes(map)
                                                        ? 'bg-brand-primary text-black border-brand-primary'
                                                        : 'bg-neutral-800 text-gray-400 border-neutral-700 hover:border-gray-500'
                                                        }`}
                                                >
                                                    {map}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="bg-brand-primary hover:bg-amber-500 text-black font-bold py-2 px-6 rounded-lg transition-colors flex items-center"
                                        >
                                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Сохранить'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            placeholder="ID Пользователя"
                                            value={newParticipantId}
                                            onChange={(e) => setNewParticipantId(e.target.value)}
                                            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:border-brand-primary focus:outline-none"
                                        />
                                        <button
                                            onClick={handleAddParticipant}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
                                        >
                                            Добавить
                                        </button>
                                    </div>

                                    <div className="overflow-hidden rounded-lg border border-neutral-800">
                                        <table className="w-full text-left">
                                            <thead className="bg-neutral-800 text-gray-400 text-sm uppercase">
                                                <tr>
                                                    <th className="p-4">ID</th>
                                                    <th className="p-4">Никнейм</th>
                                                    <th className="p-4 text-right">Действия</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-800">
                                                {loadingParticipants ? (
                                                    <tr>
                                                        <td colSpan="3" className="p-8 text-center">
                                                            <Loader2 className="w-6 h-6 animate-spin text-brand-primary mx-auto" />
                                                        </td>
                                                    </tr>
                                                ) : participants.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="3" className="p-8 text-center text-gray-500">
                                                            Нет участников
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    participants.map((p) => (
                                                        <tr key={p.user_id} className="hover:bg-neutral-800/50">
                                                            <td className="p-4 text-gray-500">#{p.user_id}</td>
                                                            <td className="p-4 text-white font-medium">{p.nickname}</td>
                                                            <td className="p-4 text-right">
                                                                <button
                                                                    onClick={() => handleKickUser(p.user_id)}
                                                                    className="text-red-500 hover:text-red-400 font-medium text-sm"
                                                                >
                                                                    Исключить
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLobbies;
