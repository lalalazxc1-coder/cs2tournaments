import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { teamAPI } from '../../utils/api';
import { Image, Upload, Loader2 } from 'lucide-react';

const LobbyEditModal = ({ isOpen, onClose, formData, setFormData, onSave }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Пожалуйста, выберите изображение');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Размер файла не должен превышать 5МБ');
            return;
        }

        try {
            setUploading(true);
            setError('');
            const response = await teamAPI.uploadImage(file);
            setFormData({ ...formData, image_url: response.data.url });
        } catch (err) {
            setError('Ошибка при загрузке изображения');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-cs-surface border border-white/10 p-8 max-w-2xl w-full shadow-2xl clip-path-slant max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <h2 className="text-2xl font-black text-white mb-6 text-center uppercase tracking-wider">Настройки Лобби</h2>
                    {error && <div className="text-red-500 text-sm font-bold mb-4 text-center">{error}</div>}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-cs-text mb-2 uppercase">Название</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-cs-orange focus:outline-none font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-cs-text mb-2 uppercase">Постер</label>
                            <div className="flex items-start gap-4">
                                <div className="w-20 h-20 bg-black/40 border border-white/10 flex items-center justify-center skew-x-[-5deg] overflow-hidden relative group flex-shrink-0">
                                    {formData.image_url ? (
                                        <img src={formData.image_url} alt="Lobby Poster" className="w-full h-full object-cover skew-x-[5deg]" />
                                    ) : (
                                        <Image className="w-8 h-8 text-cs-text/20 skew-x-[5deg]" />
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-cs-orange skew-x-[5deg]" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="relative skew-x-[-5deg]">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="lobby-edit-poster-upload"
                                            disabled={uploading}
                                        />
                                        <label
                                            htmlFor="lobby-edit-poster-upload"
                                            className={`flex items-center justify-center w-full p-3 border-2 border-dashed border-white/10 hover:border-cs-orange/50 hover:bg-white/5 transition-all cursor-pointer h-20 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                                        >
                                            <div className="text-center skew-x-[5deg]">
                                                <Upload className="w-5 h-5 text-cs-text mx-auto mb-1" />
                                                <span className="block text-[10px] font-bold text-white uppercase tracking-wider">Загрузить</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-cs-text mb-2 uppercase">Описание</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-cs-orange focus:outline-none font-bold h-24 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-cs-text mb-2 uppercase">Дата и Время</label>
                            <input
                                type="datetime-local"
                                value={formData.date_time}
                                onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-cs-orange focus:outline-none font-bold [color-scheme:dark]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-cs-text mb-2 uppercase">Формат</label>
                            <select
                                value={formData.format || 'BO3'}
                                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-cs-orange focus:outline-none font-bold"
                            >
                                <option value="BO1">BO1</option>
                                <option value="BO3">BO3</option>
                                <option value="BO5">BO5</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-cs-text mb-2 uppercase">Маппул</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Ancient', 'Dust II', 'Inferno', 'Mirage', 'Nuke', 'Overpass', 'Anubis', 'Train', 'Vertigo'].map(map => (
                                    <button
                                        key={map}
                                        onClick={() => {
                                            const newPool = formData.map_pool.includes(map)
                                                ? formData.map_pool.filter(m => m !== map)
                                                : [...formData.map_pool, map];
                                            setFormData({ ...formData, map_pool: newPool });
                                        }}
                                        className={`p-2 text-xs font-bold border transition-all skew-x-[-5deg] ${formData.map_pool.includes(map)
                                            ? 'bg-cs-blue/20 text-cs-blue border-cs-blue/50'
                                            : 'bg-black/40 text-cs-text border-white/5'
                                            }`}
                                    >
                                        <span className="skew-x-[5deg] uppercase">{map}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                        <button onClick={onClose} className="px-6 py-3 text-cs-text hover:text-white font-bold uppercase">Отмена</button>
                        <button onClick={onSave} className="px-6 py-3 bg-cs-orange text-black font-black uppercase tracking-wider skew-x-[-10deg] hover:bg-yellow-400">
                            <span className="skew-x-[10deg]">Сохранить</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LobbyEditModal;
