import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tournamentAPI } from '../../utils/api';
import { X } from 'lucide-react';

const MAPS = ['Ancient', 'Anubis', 'Dust2', 'Inferno', 'Mirage', 'Nuke', 'Overpass', 'Vertigo', 'Train'];

const TournamentEditModal = ({ isOpen, onClose, tournament, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        rules: '',
        start_date: '',
        registration_start_date: '',
        registration_end_date: '',
        prize_pool: '',
        format: 'single_elimination',
        max_teams: 8,
        map_pool: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (tournament) {
            setFormData({
                name: tournament.name || '',
                description: tournament.description || '',
                rules: tournament.rules || '',
                start_date: tournament.start_date ? new Date(tournament.start_date).toISOString().slice(0, 16) : '',
                registration_start_date: tournament.registration_start_date ? new Date(tournament.registration_start_date).toISOString().slice(0, 16) : '',
                registration_end_date: tournament.registration_end_date ? new Date(tournament.registration_end_date).toISOString().slice(0, 16) : '',
                prize_pool: tournament.prize_pool || '',
                format: tournament.format || 'single_elimination',
                max_teams: tournament.max_teams || 8,
                map_pool: typeof tournament.map_pool === 'string' ? JSON.parse(tournament.map_pool) : (tournament.map_pool || [])
            });
        }
    }, [tournament]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');
            await tournamentAPI.updateTournament(tournament.id, formData);
            onSave();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при обновлении турнира');
        } finally {
            setLoading(false);
        }
    };

    const toggleMap = (map) => {
        if (formData.map_pool.includes(map)) {
            setFormData({ ...formData, map_pool: formData.map_pool.filter(m => m !== map) });
        } else {
            setFormData({ ...formData, map_pool: [...formData.map_pool, map] });
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-[#151515] border border-white/10 p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-lg"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>

                    <h2 className="text-2xl font-black text-white mb-6 text-center uppercase tracking-wider">Настройки Турнира</h2>

                    {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded mb-6 text-center font-bold">{error}</div>}

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Название</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-cs-orange focus:outline-none font-bold rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Призовой фонд</label>
                                <input
                                    type="text"
                                    value={formData.prize_pool}
                                    onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-cs-orange focus:outline-none font-bold rounded"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Описание</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-cs-orange focus:outline-none font-medium rounded h-24 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Правила</label>
                            <textarea
                                value={formData.rules}
                                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-cs-orange focus:outline-none font-mono text-sm rounded h-32 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Начало регистрации</label>
                                <input
                                    type="datetime-local"
                                    value={formData.registration_start_date}
                                    onChange={(e) => setFormData({ ...formData, registration_start_date: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-cs-orange focus:outline-none font-bold rounded [color-scheme:dark]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Конец регистрации</label>
                                <input
                                    type="datetime-local"
                                    value={formData.registration_end_date}
                                    onChange={(e) => setFormData({ ...formData, registration_end_date: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-cs-orange focus:outline-none font-bold rounded [color-scheme:dark]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Начало турнира</label>
                                <input
                                    type="datetime-local"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-cs-orange focus:outline-none font-bold rounded [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Формат</label>
                                <select
                                    value={formData.format}
                                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-cs-orange focus:outline-none font-bold rounded"
                                >
                                    <option value="single_elimination">Single Elimination</option>
                                    <option value="double_elimination">Double Elimination</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Макс. команд</label>
                                <select
                                    value={formData.max_teams}
                                    onChange={(e) => setFormData({ ...formData, max_teams: parseInt(e.target.value) })}
                                    className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-cs-orange focus:outline-none font-bold rounded"
                                >
                                    <option value="4">4</option>
                                    <option value="8">8</option>
                                    <option value="16">16</option>
                                    <option value="32">32</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Маппул</label>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                {MAPS.map(map => (
                                    <button
                                        key={map}
                                        onClick={() => toggleMap(map)}
                                        className={`p-2 text-xs font-bold border transition-all rounded ${formData.map_pool.includes(map)
                                            ? 'bg-cs-orange text-black border-cs-orange'
                                            : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        {map}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-white/10">
                        <button onClick={onClose} className="px-6 py-3 text-gray-400 hover:text-white font-bold uppercase tracking-wider transition-colors">
                            Отмена
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-3 bg-cs-orange hover:bg-yellow-400 text-black font-black uppercase tracking-wider rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TournamentEditModal;
