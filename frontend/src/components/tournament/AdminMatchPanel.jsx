import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Loader2 } from 'lucide-react';
import { tournamentAPI, adminAPI } from '../../utils/api';

const LinkMatchForm = ({ bracketId, onLink }) => {
    const [unlinked, setUnlinked] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUnlinked();
    }, []);

    const loadUnlinked = async () => {
        try {
            const res = await adminAPI.getUnlinkedMatches();
            setUnlinked(res.data.matches);
        } catch (e) {
            console.error('Failed to load unlinked matches', e);
        }
    };

    const handleLink = async () => {
        if (!selectedMatch) return;
        setLoading(true);
        try {
            await adminAPI.linkMatch(selectedMatch, { bracket_id: bracketId });
            await onLink();
            setSelectedMatch('');
            loadUnlinked();
        } catch (e) {
            alert('Error linking match: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-4 items-center bg-black/40 p-4 border border-white/10 skew-x-[-5deg]">
            <select
                value={selectedMatch}
                onChange={(e) => setSelectedMatch(e.target.value)}
                className="flex-1 bg-black border border-white/20 p-2 text-white focus:border-cs-orange focus:outline-none skew-x-[5deg]"
            >
                <option value="">-- Выберите матч из парсера --</option>
                {unlinked.map(m => (
                    <option key={m.match_id} value={m.match_id}>
                        {m.map_name} | {new Date(m.game_date).toLocaleString()} | {m.team_a_score}:{m.team_b_score} ({m.demo_filename})
                    </option>
                ))}
            </select>
            <button
                onClick={handleLink}
                disabled={!selectedMatch || loading}
                className="px-4 py-2 bg-cs-orange text-black font-bold uppercase hover:bg-yellow-400 disabled:opacity-50 skew-x-[5deg]"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Привязать'}
            </button>
        </div>
    );
};

const AdminMatchPanel = ({ match, mapState, tournamentId, matchId, onUpdate }) => {
    return (
        <div className="bg-cs-surface border border-cs-orange/30 p-8 mb-8 clip-path-slant relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-cs-orange"></div>
            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter flex items-center gap-3">
                <Shield className="w-6 h-6 text-cs-orange" />
                Панель Администратора
            </h3>

            {/* Linked Matches Section */}
            <div className="mb-8">
                <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-white/10 pb-2">Привязанные матчи (Parser)</h4>
                {match.parserMatches && match.parserMatches.length > 0 ? (
                    <div className="space-y-2">
                        {match.parserMatches.map(pm => (
                            <div key={pm.match_id} className="bg-black/40 border border-white/10 p-3 flex justify-between items-center skew-x-[-5deg]">
                                <div className="skew-x-[5deg]">
                                    <div className="font-bold text-cs-orange">{pm.map_name}</div>
                                    <div className="text-xs text-gray-400">{pm.demo_filename}</div>
                                </div>
                                <div className="skew-x-[5deg] font-mono font-bold text-lg">
                                    <span className="text-blue-400">{pm.team_a_score}</span> : <span className="text-red-400">{pm.team_b_score}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm italic">Нет привязанных матчей</p>
                )}
            </div>

            {/* Link New Match Section */}
            <div className="mb-8">
                <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-white/10 pb-2">Привязать матч</h4>
                <LinkMatchForm bracketId={match.id} onLink={onUpdate} />
            </div>

            <div className="space-y-4">
                <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-wider border-b border-white/10 pb-2">Ручное управление картами</h4>
                {mapState && mapState.picked && mapState.picked.length > 0 ? (
                    mapState.picked.map((pick, index) => (
                        <div key={index} className="bg-black/40 border border-white/10 p-4 flex flex-col md:flex-row items-center justify-between gap-4 skew-x-[-5deg]">
                            <div className="skew-x-[5deg] flex items-center gap-4 min-w-[200px]">
                                <div className="text-cs-orange font-black text-lg uppercase">{pick.map}</div>
                                {pick.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                            </div>

                            <div className="skew-x-[5deg] flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase">{match.team1?.name || 'T1'}</span>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        defaultValue={pick.score1}
                                        id={`score1-${index}`}
                                        className="w-16 bg-black border border-white/20 p-2 text-center font-bold text-white focus:border-cs-orange focus:outline-none"
                                    />
                                </div>
                                <span className="font-black text-white/50">:</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="0"
                                        defaultValue={pick.score2}
                                        id={`score2-${index}`}
                                        className="w-16 bg-black border border-white/20 p-2 text-center font-bold text-white focus:border-cs-orange focus:outline-none"
                                    />
                                    <span className="text-xs font-bold text-gray-400 uppercase">{match.team2?.name || 'T2'}</span>
                                </div>
                            </div>

                            <div className="skew-x-[5deg] flex gap-2">
                                <button
                                    onClick={() => {
                                        const s1 = document.getElementById(`score1-${index}`).value;
                                        const s2 = document.getElementById(`score2-${index}`).value;
                                        if (!s1 || !s2) return alert('Введите счет');

                                        const score1 = parseInt(s1);
                                        const score2 = parseInt(s2);
                                        let winnerId = null;
                                        if (score1 > score2) winnerId = match.team1_id;
                                        else if (score2 > score1) winnerId = match.team2_id;
                                        else return alert('Ничья не допускается');

                                        tournamentAPI.updateMatch(tournamentId, matchId, {
                                            map_results: {
                                                map_index: index,
                                                score1,
                                                score2,
                                                map_winner_id: winnerId
                                            }
                                        }).then(() => onUpdate()).catch(e => alert(e.message));
                                    }}
                                    className="px-4 py-2 bg-white/10 hover:bg-green-600 text-white font-bold uppercase text-xs transition-colors"
                                >
                                    Сохранить
                                </button>
                            </div>
                        </div>
                    ))) : (
                    <p className="text-gray-500 text-sm italic">Карты еще не выбраны</p>
                )}
            </div>
        </div>
    );
};

export default AdminMatchPanel;
