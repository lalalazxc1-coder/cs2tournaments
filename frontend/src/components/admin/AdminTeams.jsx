import React, { useState, useEffect } from 'react';
import { adminAPI, teamAPI } from '../../utils/api';
import {
    Search, Trash2, Edit, Save, X, Loader2, Users, Shield, Plus, AlertTriangle, CheckCircle
} from 'lucide-react';

import PlayerSearchModal from '../teams/PlayerSearchModal';

const AdminTeams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Edit Modal State
    const [editingTeam, setEditingTeam] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [saving, setSaving] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTeams();
    }, [page, search]);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            console.log('Fetching teams...');
            const response = await adminAPI.getTeams({ search, page });
            console.log('Teams response:', response.data);
            setTeams(response.data.teams || []);
            setTotalPages(response.data.pages || 1);
        } catch (error) {
            console.error('Failed to fetch teams:', error);
            setError('Не удалось загрузить список команд');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту команду? Это действие нельзя отменить.')) return;

        try {
            await adminAPI.deleteTeam(teamId);
            fetchTeams();
        } catch (error) {
            alert('Ошибка при удалении команды');
        }
    };

    const handleEditClick = async (team) => {
        setEditingTeam({ ...team });
        setError('');
        try {
            const res = await teamAPI.getTeam(team.id);
            setTeamMembers(res.data.members || []);
        } catch (err) {
            console.error('Failed to fetch team members', err);
            setTeamMembers([]);
        }
    };

    const handleSaveTeam = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await adminAPI.updateTeam(editingTeam.id, {
                name: editingTeam.name,
                description: editingTeam.description,
                is_active: editingTeam.is_active,
                logo_url: editingTeam.logo_url,
                captain_id: editingTeam.captain_id
            });
            setEditingTeam(null);
            fetchTeams();
        } catch (error) {
            setError('Ошибка при обновлении команды: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm('Удалить участника из команды?')) return;
        try {
            await teamAPI.removeMember(editingTeam.id, userId);
            // Refresh members
            const res = await teamAPI.getTeam(editingTeam.id);
            setTeamMembers(res.data.members || []);
        } catch (error) {
            alert('Ошибка при удалении участника: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleAddMember = async (userId) => {
        try {
            await teamAPI.addMember(editingTeam.id, userId);
            setIsSearchModalOpen(false);
            // Refresh members
            const res = await teamAPI.getTeam(editingTeam.id);
            setTeamMembers(res.data.members || []);
        } catch (error) {
            alert('Ошибка: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div>
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Поиск команды..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cs-orange focus:outline-none transition-colors font-bold"
                    />
                </div>
                <button
                    onClick={fetchTeams}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-bold uppercase"
                >
                    Обновить
                </button>
            </div>

            {error && (
                <div className="mb-6 bg-red-900/20 border border-red-500/20 p-4 flex items-center gap-3 text-red-400 rounded-lg">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="font-bold">{error}</p>
                </div>
            )}

            {/* Teams Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-cs-orange" />
                </div>
            ) : (
                <div className="bg-cs-surface rounded-xl border border-white/5 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/40 text-gray-400 text-sm uppercase font-black tracking-wider">
                                <tr>
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Команда</th>
                                    <th className="p-4">Капитан</th>
                                    <th className="p-4">Статус</th>
                                    <th className="p-4 text-right">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {teams.length > 0 ? (
                                    teams.map(team => (
                                        <tr key={team.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4 text-gray-500 font-mono">#{team.id}</td>
                                            <td className="p-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center mr-3 overflow-hidden flex-shrink-0">
                                                        {team.logo_url ? (
                                                            <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Shield className="w-5 h-5 text-gray-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-white text-lg leading-tight group-hover:text-cs-orange transition-colors">{team.name}</div>
                                                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{team.description || 'Нет описания'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {team.captain ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-cs-orange/20 flex items-center justify-center text-cs-orange text-xs font-bold">
                                                            C
                                                        </div>
                                                        <div>
                                                            <div className="text-white font-bold text-sm">{team.captain.nickname}</div>
                                                            <div className="text-xs text-gray-500">ID: {team.captain.id}</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-red-500 text-sm font-bold">Нет капитана</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-black uppercase tracking-wider ${team.is_active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                    }`}>
                                                    {team.is_active ? 'Активна' : 'Неактивна'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(team)}
                                                        className="p-2 text-cs-blue hover:bg-cs-blue/10 rounded-lg transition-colors"
                                                        title="Редактировать"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTeam(team.id)}
                                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Удалить"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-gray-500">
                                            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p className="text-lg font-bold">Команды не найдены</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 bg-white/5 rounded-lg disabled:opacity-50 text-white hover:bg-white/10 font-bold uppercase text-sm"
                    >
                        Назад
                    </button>
                    <span className="px-4 py-2 text-gray-400 font-mono">
                        {page} / {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 bg-white/5 rounded-lg disabled:opacity-50 text-white hover:bg-white/10 font-bold uppercase text-sm"
                    >
                        Вперед
                    </button>
                </div>
            )}

            {/* Edit Modal */}
            {editingTeam && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
                    <div className="bg-cs-surface rounded-xl border border-white/10 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                            <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                                <Edit className="w-5 h-5 text-cs-orange" />
                                Редактирование команды #{editingTeam.id}
                            </h3>
                            <button onClick={() => setEditingTeam(null)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                            {error && (
                                <div className="mb-6 bg-red-900/20 border border-red-500/20 p-4 flex items-center gap-3 text-red-400 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                    <p className="font-bold">{error}</p>
                                </div>
                            )}

                            <form id="edit-team-form" onSubmit={handleSaveTeam} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Название</label>
                                            <input
                                                type="text"
                                                value={editingTeam.name}
                                                onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-cs-orange focus:outline-none font-bold"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">URL Логотипа</label>
                                            <input
                                                type="text"
                                                value={editingTeam.logo_url || ''}
                                                onChange={(e) => setEditingTeam({ ...editingTeam, logo_url: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-cs-orange focus:outline-none text-sm font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Капитан</label>
                                            <select
                                                value={editingTeam.captain_id || ''}
                                                onChange={(e) => setEditingTeam({ ...editingTeam, captain_id: parseInt(e.target.value) })}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-cs-orange focus:outline-none font-bold"
                                            >
                                                {teamMembers.map(member => (
                                                    <option key={member.user_id} value={member.user_id}>
                                                        {member.user?.nickname || member.user?.username || member.user_id} (ID: {member.user_id})
                                                    </option>
                                                ))}
                                                {!teamMembers.find(m => m.user_id === editingTeam.captain_id) && (
                                                    <option value={editingTeam.captain_id}>Current Captain (ID: {editingTeam.captain_id})</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Описание</label>
                                            <textarea
                                                value={editingTeam.description || ''}
                                                onChange={(e) => setEditingTeam({ ...editingTeam, description: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-cs-orange focus:outline-none h-[124px] resize-none text-sm"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-3 bg-black/20 p-3 rounded-lg border border-white/5">
                                            <input
                                                type="checkbox"
                                                id="is_active"
                                                checked={editingTeam.is_active}
                                                onChange={(e) => setEditingTeam({ ...editingTeam, is_active: e.target.checked })}
                                                className="w-5 h-5 rounded border-gray-600 bg-black/40 text-cs-orange focus:ring-cs-orange"
                                            />
                                            <label htmlFor="is_active" className="text-white font-bold text-sm cursor-pointer select-none">
                                                Активная команда
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Members Management */}
                                <div className="border-t border-white/10 pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="block text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                            <Users className="w-4 h-4 text-cs-orange" />
                                            Состав команды ({teamMembers.length})
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setIsSearchModalOpen(true)}
                                            className="text-xs bg-cs-orange text-black px-3 py-1.5 rounded font-bold uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Добавить
                                        </button>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar bg-black/20 rounded-lg p-2 border border-white/5">
                                        {teamMembers.length > 0 ? (
                                            teamMembers.map(member => (
                                                <div key={member.id} className="flex justify-between items-center bg-white/5 p-3 rounded hover:bg-white/10 transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded bg-black/50 flex items-center justify-center text-xs font-bold text-gray-500">
                                                            {member.user?.avatar_full ? (
                                                                <img src={member.user.avatar_full} className="w-full h-full object-cover rounded" />
                                                            ) : (
                                                                member.user?.nickname?.[0] || '?'
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="text-white font-bold text-sm flex items-center gap-2">
                                                                {member.user?.nickname || 'Unknown'}
                                                                {member.role === 'captain' && <span className="text-xs text-cs-orange bg-cs-orange/10 px-1 rounded">CAP</span>}
                                                            </div>
                                                            <div className="text-xs text-gray-500 font-mono">ID: {member.user_id} • {member.status}</div>
                                                        </div>
                                                    </div>
                                                    {member.role !== 'captain' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveMember(member.user_id)}
                                                            className="text-red-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Исключить"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-gray-500 text-sm">Нет участников</div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setEditingTeam(null)}
                                className="px-6 py-3 font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                form="edit-team-form"
                                disabled={saving}
                                className="px-6 py-3 bg-cs-orange hover:bg-yellow-400 text-black font-black uppercase tracking-wider rounded transition-colors flex items-center gap-2"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PlayerSearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onInvite={handleAddMember}
            />
        </div>
    );
};

export default AdminTeams;
