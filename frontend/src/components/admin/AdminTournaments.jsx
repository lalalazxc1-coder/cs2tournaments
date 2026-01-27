import React, { useState, useEffect } from 'react';
import { adminAPI, tournamentAPI } from '../../utils/api';
import { Loader2, Search, Edit, Trash2, X, Save, Plus, Users, Trophy, Calendar, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';

const AdminTournaments = () => {
    // Data State
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    // Filter State
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    // Modal State
    const [activeModal, setActiveModal] = useState(null); // 'create', 'edit'
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [activeTab, setActiveTab] = useState('general'); // 'general', 'teams'

    // Form State
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    // Teams Management State
    const [teams, setTeams] = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [newTeamId, setNewTeamId] = useState('');

    // Matches Management State
    const [brackets, setBrackets] = useState([]);
    const [loadingBrackets, setLoadingBrackets] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [selectedBracketId, setSelectedBracketId] = useState(null);
    const [unlinkedMatches, setUnlinkedMatches] = useState([]);
    const [loadingUnlinked, setLoadingUnlinked] = useState(false);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch Data
    useEffect(() => {
        fetchTournaments();
    }, [debouncedSearch, page]);

    const fetchTournaments = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getTournaments({
                search: debouncedSearch,
                page,
                limit
            });
            setTournaments(response.data.tournaments);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Failed to load tournaments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeams = async (tournamentId) => {
        setLoadingTeams(true);
        try {
            const response = await tournamentAPI.getTournamentTeams(tournamentId);
            setTeams(response.data);
        } catch (error) {
            console.error('Failed to load teams:', error);
        } finally {
            setLoadingTeams(false);
        }
    };

    const fetchBrackets = async (tournamentId) => {
        setLoadingBrackets(true);
        try {
            const response = await tournamentAPI.getTournament(tournamentId);
            setBrackets(response.data.brackets || []);
        } catch (error) {
            console.error('Failed to load brackets:', error);
        } finally {
            setLoadingBrackets(false);
        }
    };

    const fetchUnlinkedMatches = async () => {
        setLoadingUnlinked(true);
        try {
            const response = await adminAPI.getUnlinkedMatches();
            setUnlinkedMatches(response.data.matches || []);
        } catch (error) {
            console.error('Failed to load unlinked matches:', error);
        } finally {
            setLoadingUnlinked(false);
        }
    };

    // Handlers
    const handleCreateClick = () => {
        setFormData({
            name: '',
            format: 'single_elimination',
            max_teams: 16,
            start_date: '',
            prize_pool: '',
            round_config: {}
        });
        setActiveModal('create');
        setActiveTab('general');
    };

    const handleEditClick = (tournament) => {
        setSelectedTournament(tournament);
        setFormData({
            name: tournament.name,
            description: tournament.description || '',
            format: tournament.format,
            max_teams: tournament.max_teams,
            start_date: tournament.start_date ? new Date(tournament.start_date).toISOString().slice(0, 16) : '',
            prize_pool: tournament.prize_pool || '',
            status: tournament.status,
            rules: tournament.rules || '',
            round_config: tournament.round_config || {}
        });
        setActiveModal('edit');
        setActiveTab('general');
        fetchTeams(tournament.id);
        fetchBrackets(tournament.id);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот турнир? Это действие нельзя отменить.')) return;
        try {
            await adminAPI.deleteTournament(id);
            fetchTournaments();
        } catch (error) {
            alert('Ошибка при удалении турнира');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (activeModal === 'create') {
                await tournamentAPI.createTournament(formData);
                alert('Турнир создан');
            } else {
                await adminAPI.updateTournament(selectedTournament.id, formData);
                alert('Турнир обновлен');
            }
            setActiveModal(null);
            fetchTournaments();
        } catch (error) {
            alert('Ошибка при сохранении: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const handleAddTeam = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.addTournamentTeam(selectedTournament.id, newTeamId);
            setNewTeamId('');
            fetchTeams(selectedTournament.id);
            alert('Команда добавлена');
        } catch (error) {
            alert('Ошибка: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleKickTeam = async (teamId) => {
        if (!window.confirm('Исключить команду?')) return;
        try {
            await adminAPI.kickTournamentTeam(selectedTournament.id, teamId);
            fetchTeams(selectedTournament.id);
        } catch (error) {
            alert('Ошибка при исключении команды');
        }
    };

    const handleOpenLinkModal = (bracketId) => {
        setSelectedBracketId(bracketId);
        setShowLinkModal(true);
        fetchUnlinkedMatches();
    };

    const handleLinkMatch = async (matchId) => {
        try {
            await adminAPI.linkMatch(matchId, { bracket_id: selectedBracketId });
            setShowLinkModal(false);
            fetchBrackets(selectedTournament.id);
            alert('Матч успешно привязан');
        } catch (error) {
            alert('Ошибка при привязке: ' + (error.response?.data?.message || error.message));
        }
    };

    // Render Helpers
    const getStatusBadge = (status) => {
        const styles = {
            upcoming: 'bg-blue-500/20 text-blue-500',
            registration: 'bg-green-500/20 text-green-500',
            registration_closed: 'bg-yellow-500/20 text-yellow-500',
            ongoing: 'bg-purple-500/20 text-purple-500',
            completed: 'bg-neutral-500/20 text-gray-400',
            cancelled: 'bg-red-500/20 text-red-500'
        };
        const labels = {
            upcoming: 'Анонс',
            registration: 'Регистрация',
            registration_closed: 'Рег. закрыта',
            ongoing: 'Идет',
            completed: 'Завершен',
            cancelled: 'Отменен'
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${styles[status] || styles.completed}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Турниры</h2>
                    <p className="text-gray-400 text-sm">Управление турнирами и участниками</p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="flex items-center px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-black font-bold rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Создать турнир
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Поиск турнира..."
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
                                <th className="p-4">Даты</th>
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
                            ) : tournaments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        Турниры не найдены
                                    </td>
                                </tr>
                            ) : (
                                tournaments.map((t) => (
                                    <tr key={t.id} className="hover:bg-neutral-800/50 transition-colors group">
                                        <td className="p-4 text-gray-500">#{t.id}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-white">{t.name}</div>
                                            <div className="text-xs text-gray-500">{t.current_participants || 0} / {t.max_teams || t.max_participants} команд</div>
                                        </td>
                                        <td className="p-4">{getStatusBadge(t.status)}</td>
                                        <td className="p-4 text-gray-300 text-sm capitalize">{t.format.replace('_', ' ')}</td>
                                        <td className="p-4 text-gray-300 text-sm">
                                            {new Date(t.start_date).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditClick(t)}
                                                    className="p-2 bg-neutral-800 rounded-lg text-blue-500 hover:text-white hover:bg-blue-600 transition-colors"
                                                    title="Редактировать"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(t.id)}
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
                            <h3 className="text-xl font-bold text-white">
                                {activeModal === 'create' ? 'Создание турнира' : `Редактирование: ${selectedTournament?.name}`}
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
                            {activeModal === 'edit' && (
                                <>
                                    <button
                                        onClick={() => setActiveTab('teams')}
                                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'teams'
                                            ? 'border-brand-primary text-brand-primary'
                                            : 'border-transparent text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        Команды ({teams.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('matches')}
                                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'matches'
                                            ? 'border-brand-primary text-brand-primary'
                                            : 'border-transparent text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        Матчи ({brackets.length})
                                    </button>
                                </>
                            )}
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
                                                    <option value="single_elimination">Single Elimination</option>
                                                    <option value="double_elimination">Double Elimination</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Статус</label>
                                                <select
                                                    value={formData.status || 'upcoming'}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-brand-primary focus:outline-none"
                                                >
                                                    <option value="upcoming">Анонс</option>
                                                    <option value="registration">Регистрация открыта</option>
                                                    <option value="registration_closed">Регистрация закрыта</option>
                                                    <option value="ongoing">Идет</option>
                                                    <option value="completed">Завершен</option>
                                                    <option value="cancelled">Отменен</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Дата начала</label>
                                                <input
                                                    type="datetime-local"
                                                    value={formData.start_date}
                                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-brand-primary focus:outline-none"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Макс. команд</label>
                                                <input
                                                    type="number"
                                                    value={formData.max_teams}
                                                    onChange={(e) => setFormData({ ...formData, max_teams: e.target.value })}
                                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-brand-primary focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Призовой фонд</label>
                                                <input
                                                    type="text"
                                                    value={formData.prize_pool}
                                                    onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-brand-primary focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Round Configuration */}
                                    <div className="border-t border-neutral-800 pt-6">
                                        <h4 className="text-lg font-bold text-white mb-4">Настройки матчей (BO1/BO3/BO5)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {(() => {
                                                const maxTeams = parseInt(formData.max_teams) || 16;
                                                const rounds = Math.ceil(Math.log2(maxTeams));
                                                const inputs = [];

                                                // Upper Bracket Rounds
                                                for (let i = 1; i <= rounds; i++) {
                                                    const teamsInRound = Math.pow(2, rounds - i + 1);
                                                    const label = teamsInRound === 2 ? 'Финал' :
                                                        teamsInRound === 4 ? 'Полуфинал' :
                                                            teamsInRound === 8 ? 'Четвертьфинал' :
                                                                `1/${teamsInRound / 2}`;

                                                    // Key for upper bracket rounds: "upper_1", "upper_2", etc.
                                                    // Or just use round number if simple. 
                                                    // Backend logic uses "upper_{round}" or just "{round}".
                                                    // Let's use "upper_{i}" for clarity, but backend fallback supports simple numbers.
                                                    // Actually, let's map it to what the user sees.
                                                    // Round 1 is 1/16 (if 32 teams), Round 2 is 1/8...
                                                    // Wait, round 1 is always the first round played.
                                                    // If 16 teams: Round 1 (1/8), Round 2 (1/4), Round 3 (1/2), Round 4 (Final).

                                                    const key = i === rounds ? 'final' : `upper_${i}`;
                                                    const displayLabel = i === rounds ? 'Гранд-финал' : `Раунд ${i} (${label})`;

                                                    inputs.push(
                                                        <div key={key}>
                                                            <label className="block text-sm text-gray-400 mb-1">{displayLabel}</label>
                                                            <select
                                                                value={formData.round_config?.[key] || 'bo1'}
                                                                onChange={(e) => setFormData({
                                                                    ...formData,
                                                                    round_config: { ...formData.round_config, [key]: e.target.value }
                                                                })}
                                                                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-brand-primary focus:outline-none"
                                                            >
                                                                <option value="bo1">BO1 (Best of 1)</option>
                                                                <option value="bo3">BO3 (Best of 3)</option>
                                                                <option value="bo5">BO5 (Best of 5)</option>
                                                            </select>
                                                        </div>
                                                    );
                                                }

                                                // Lower Bracket (if double elimination)
                                                if (formData.format === 'double_elimination') {
                                                    inputs.push(
                                                        <div key="lower_default" className="md:col-span-2 mt-2">
                                                            <label className="block text-sm text-gray-400 mb-1">Нижняя сетка (по умолчанию)</label>
                                                            <select
                                                                value={formData.round_config?.['lower_default'] || 'bo1'}
                                                                onChange={(e) => setFormData({
                                                                    ...formData,
                                                                    round_config: { ...formData.round_config, 'lower_default': e.target.value }
                                                                })}
                                                                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:border-brand-primary focus:outline-none"
                                                            >
                                                                <option value="bo1">BO1</option>
                                                                <option value="bo3">BO3</option>
                                                            </select>
                                                            <p className="text-xs text-gray-500 mt-1">Для нижней сетки обычно используется BO1, кроме финала нижней сетки.</p>
                                                        </div>
                                                    );
                                                }

                                                return inputs;
                                            })()}
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
                            ) : activeTab === 'teams' ? (
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            placeholder="ID Команды"
                                            value={newTeamId}
                                            onChange={(e) => setNewTeamId(e.target.value)}
                                            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:border-brand-primary focus:outline-none"
                                        />
                                        <button
                                            onClick={handleAddTeam}
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
                                                    <th className="p-4">Команда</th>
                                                    <th className="p-4">Статус</th>
                                                    <th className="p-4 text-right">Действия</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-800">
                                                {loadingTeams ? (
                                                    <tr>
                                                        <td colSpan="4" className="p-8 text-center">
                                                            <Loader2 className="w-6 h-6 animate-spin text-brand-primary mx-auto" />
                                                        </td>
                                                    </tr>
                                                ) : teams.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="p-8 text-center text-gray-500">
                                                            Нет команд
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    teams.map((t) => (
                                                        <tr key={t.team_id} className="hover:bg-neutral-800/50">
                                                            <td className="p-4 text-gray-500">#{t.team_id}</td>
                                                            <td className="p-4 text-white font-medium">{t.team?.name || 'Unknown'}</td>
                                                            <td className="p-4">
                                                                <span className="px-2 py-1 rounded text-xs bg-neutral-700 text-gray-300">
                                                                    {t.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <button
                                                                    onClick={() => handleKickTeam(t.team_id)}
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
                            ) : (
                                <div className="space-y-6">
                                    <div className="overflow-hidden rounded-lg border border-neutral-800">
                                        <table className="w-full text-left">
                                            <thead className="bg-neutral-800 text-gray-400 text-sm uppercase">
                                                <tr>
                                                    <th className="p-4">Раунд</th>
                                                    <th className="p-4">Матч</th>
                                                    <th className="p-4">Команды</th>
                                                    <th className="p-4">Статус</th>
                                                    <th className="p-4 text-right">Привязка</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-800">
                                                {loadingBrackets ? (
                                                    <tr>
                                                        <td colSpan="5" className="p-8 text-center">
                                                            <Loader2 className="w-6 h-6 animate-spin text-brand-primary mx-auto" />
                                                        </td>
                                                    </tr>
                                                ) : brackets.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="p-8 text-center text-gray-500">
                                                            Сетка еще не сгенерирована
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    brackets.map((b) => (
                                                        <tr key={b.id} className="hover:bg-neutral-800/50">
                                                            <td className="p-4 text-gray-500">R{b.round}</td>
                                                            <td className="p-4 text-gray-500">#{b.match_number} ({b.group})</td>
                                                            <td className="p-4">
                                                                <div className="flex flex-col gap-1">
                                                                    <div className={`text-sm ${b.winner_id === b.team1_id ? 'text-green-500 font-bold' : 'text-white'}`}>
                                                                        {b.team1?.name || 'TBD'}
                                                                    </div>
                                                                    <div className={`text-sm ${b.winner_id === b.team2_id ? 'text-green-500 font-bold' : 'text-white'}`}>
                                                                        {b.team2?.name || 'TBD'}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-4">
                                                                <span className={`px-2 py-1 rounded text-xs ${b.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-neutral-700 text-gray-300'}`}>
                                                                    {b.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <button
                                                                    onClick={() => handleOpenLinkModal(b.id)}
                                                                    className="text-brand-primary hover:text-amber-400 font-medium text-sm"
                                                                >
                                                                    Привязать матч
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

            {/* Link Match Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-neutral-800">
                            <h3 className="text-xl font-bold text-white">Выберите матч из парсера</h3>
                            <button onClick={() => setShowLinkModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            {loadingUnlinked ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                                </div>
                            ) : unlinkedMatches.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    Нет доступных непривязанных матчей
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {unlinkedMatches.map((m) => (
                                        <div
                                            key={m.match_id}
                                            onClick={() => handleLinkMatch(m.match_id)}
                                            className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg cursor-pointer hover:border-brand-primary transition-colors"
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString()}</span>
                                                <span className="text-xs font-bold text-brand-primary">{m.map_name}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="text-lg font-bold text-white">
                                                    {m.team_a_score} : {m.team_b_score}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Победитель: <span className="text-white">{m.winning_team_name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTournaments;
