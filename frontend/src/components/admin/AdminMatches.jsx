import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { Trash2, Search, Calendar, Map, Trophy, AlertTriangle, Loader2 } from 'lucide-react';

const AdminMatches = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalMatches, setTotalMatches] = useState(0);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchMatches();
    }, [page]);

    const fetchMatches = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getMatches({ page, limit: 20 });
            setMatches(response.data.matches);
            setTotalPages(response.data.pages);
            setTotalMatches(response.data.total);
        } catch (error) {
            console.error('Failed to fetch matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMatch = async (matchId) => {
        if (!window.confirm('Вы уверены? Это действие удалит матч и откатит статистику всех игроков. Это действие необратимо.')) {
            return;
        }

        setDeletingId(matchId);
        try {
            await adminAPI.deleteMatch(matchId);
            // Refresh list
            fetchMatches();
        } catch (error) {
            console.error('Failed to delete match:', error);
            alert('Ошибка при удалении матча');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Управление матчами (Парсер)</h2>
                <div className="text-gray-400 text-sm">
                    Всего матчей: <span className="text-white font-bold">{totalMatches}</span>
                </div>
            </div>

            {loading && matches.length === 0 ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                </div>
            ) : (
                <>
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-800 text-gray-400 font-bold uppercase">
                                    <tr>
                                        <th className="p-4">ID</th>
                                        <th className="p-4">Карта / Дата</th>
                                        <th className="p-4 text-center">Счет</th>
                                        <th className="p-4 text-center">Победитель</th>
                                        <th className="p-4 text-center">Раунды</th>
                                        <th className="p-4 text-right">Действия</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800">
                                    {matches.map((match) => (
                                        <tr key={match.match_id} className="hover:bg-neutral-800/50 transition-colors">
                                            <td className="p-4 text-gray-500 font-mono">#{match.match_id}</td>
                                            <td className="p-4">
                                                <div className="flex items-center">
                                                    <Map className="w-4 h-4 mr-2 text-gray-500" />
                                                    <span className="font-bold text-white mr-2">{match.map_name}</span>
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {new Date(match.game_date).toLocaleDateString()} {new Date(match.game_date).toLocaleTimeString()}
                                                </div>
                                                {match.demo_filename && (
                                                    <div className="text-[10px] text-gray-600 mt-1 truncate max-w-[200px]" title={match.demo_filename}>
                                                        {match.demo_filename}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="font-mono text-lg font-bold text-white">
                                                    <span className="text-blue-400">{match.team_a_score}</span>
                                                    <span className="mx-2 text-gray-600">:</span>
                                                    <span className="text-red-400">{match.team_b_score}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase ${match.winning_team_name === 'Team A' ? 'bg-blue-500/10 text-blue-500' :
                                                        match.winning_team_name === 'Team B' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'
                                                    }`}>
                                                    <Trophy className="w-3 h-3 mr-1" />
                                                    {match.winning_team_name}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center text-gray-400">
                                                {match.total_rounds}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteMatch(match.match_id)}
                                                    disabled={deletingId === match.match_id}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Удалить матч и откатить статистику"
                                                >
                                                    {deletingId === match.match_id ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {matches.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                Матчи не найдены
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center space-x-2 mt-6">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-neutral-800 text-white rounded-lg disabled:opacity-50 hover:bg-neutral-700"
                            >
                                Назад
                            </button>
                            <span className="px-4 py-2 text-gray-400">
                                Страница {page} из {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 bg-neutral-800 text-white rounded-lg disabled:opacity-50 hover:bg-neutral-700"
                            >
                                Вперед
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminMatches;
