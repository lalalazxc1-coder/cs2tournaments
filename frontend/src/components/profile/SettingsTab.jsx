import React, { useState, useEffect } from 'react';
import { Settings, Loader2, CheckCircle, Shield, User, Link as LinkIcon, Mail, Save, Smartphone, Monitor, Upload, Palette } from 'lucide-react';
import { userAPI, teamAPI } from '../../utils/api';

const SettingsTab = ({ profile, setProfile, handleSteamConnect }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        nickname: profile?.user?.nickname || '',
        real_name: profile?.user?.real_name || '',
        email: profile?.user?.email || '',
        custom_url: profile?.user?.custom_url || '',
        player_label: profile?.user?.player_label || '',
        gender: profile?.user?.gender || 'male',
        privacy_settings: (typeof profile?.user?.privacy_settings === 'string'
            ? JSON.parse(profile.user.privacy_settings)
            : profile?.user?.privacy_settings) || {
            profile_visibility: 'public',
            wall_visibility: 'public',
            friends_visibility: 'public'
        },
        profile_bg: profile?.user?.profile_bg || ''
    });

    useEffect(() => {
        if (profile?.user) {
            setFormData(prev => ({
                ...prev,
                nickname: profile.user.nickname || '',
                real_name: profile.user.real_name || '',
                email: profile.user.email || '',
                custom_url: profile.user.custom_url || '',
                player_label: profile.user.player_label || '',
                gender: profile.user.gender || 'male',
                privacy_settings: (typeof profile.user.privacy_settings === 'string'
                    ? JSON.parse(profile.user.privacy_settings)
                    : profile.user.privacy_settings) || prev.privacy_settings,
                profile_bg: profile.user.profile_bg || ''
            }));
        }
    }, [profile]);

    useEffect(() => {
        if (activeTab === 'sessions') {
            loadSessions();
        }
    }, [activeTab]);

    const loadSessions = async () => {
        try {
            const response = await userAPI.getSessions();
            setSessions(response.data.sessions || []);
        } catch (error) {
            console.error('Failed to load sessions:', error);
        }
    };

    const handleRevokeSession = async (id) => {
        try {
            await userAPI.revokeSession(id);
            setSessions(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Failed to revoke session:', error);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            const response = await teamAPI.uploadImage(file);
            const avatarUrl = response.data.url;

            await userAPI.updateProfile({
                avatar_full: avatarUrl,
                avatar_medium: avatarUrl
            });

            setMessage({ type: 'success', text: 'Аватар обновлен' });
            window.location.reload();
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка загрузки аватара' });
        } finally {
            setLoading(false);
        }
    };

    const handleSyncSteam = async () => {
        try {
            setLoading(true);
            const response = await userAPI.syncSteam();
            setMessage({ type: 'success', text: 'Профиль синхронизирован со Steam' });
            window.location.reload();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Ошибка синхронизации' });
        } finally {
            setLoading(false);
        }
    };

    if (!profile) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('privacy_')) {
            const key = name.replace('privacy_', '');
            setFormData(prev => ({
                ...prev,
                privacy_settings: {
                    ...prev.privacy_settings,
                    [key]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const response = await userAPI.updateProfile(formData);
            if (setProfile && response.data.user) {
                setProfile(prev => ({ ...prev, user: response.data.user }));
            }
            setMessage({ type: 'success', text: 'Настройки сохранены' });
        } catch (error) {
            let errorText = 'Ошибка сохранения';
            if (error.response?.data?.message) {
                errorText = error.response.data.message;
            } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                // If it's a validation error array, take the first one
                errorText = error.response.data.errors[0].msg || 'Ошибка валидации';
            }
            setMessage({ type: 'error', text: errorText });
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Профиль', icon: User },
        { id: 'appearance', label: 'Оформление', icon: Palette },
        { id: 'privacy', label: 'Приватность', icon: Shield },
        { id: 'sessions', label: 'Сессии', icon: Monitor },
    ];

    return (
        <div className="w-full">
            <div className="bg-cs-surface border border-white/5 p-8 clip-path-slant shadow-xl">
                <h2 className="text-2xl font-black text-white mb-8 flex items-center uppercase tracking-tighter">
                    <Settings className="w-6 h-6 mr-3 text-cs-orange" />
                    НАСТРОЙКИ ПРОФИЛЯ
                </h2>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-full md:w-64 flex-shrink-0 space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full text-left px-4 py-3 font-bold uppercase tracking-wider text-sm flex items-center gap-3 transition-all skew-x-[-5deg] ${activeTab === tab.id
                                    ? 'bg-cs-orange text-black border-l-4 border-black'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border-l-4 border-transparent'
                                    }`}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-black' : 'text-cs-orange'}`} />
                                <span className="skew-x-[5deg]">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        {message && (
                            <div className={`p-4 mb-6 border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'} skew-x-[-5deg]`}>
                                <div className="skew-x-[5deg] font-bold">{message.text}</div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* Avatar Settings */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
                                        <User className="w-5 h-5 text-cs-orange" /> Аватар
                                    </h3>
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 bg-black border border-white/10 overflow-hidden">
                                            <img src={profile.user.avatar_full || profile.user.avatar_medium} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex gap-3">
                                                <label className="inline-flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors">
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    <span className="text-sm font-bold uppercase tracking-wider">Загрузить фото</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                                </label>
                                                {profile.user.steam_id && (
                                                    <button type="button" onClick={handleSyncSteam} className="inline-flex items-center px-4 py-2 bg-[#171a21] hover:bg-[#2a475e] border border-white/10 transition-colors text-white">
                                                        <span className="text-sm font-bold uppercase tracking-wider">Синхронизировать со Steam</span>
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs text-cs-text">JPG, PNG или GIF. Макс. 10MB.</p>
                                        </div>
                                    </div>
                                </div>



                                {/* General Info */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
                                        <User className="w-5 h-5 text-cs-orange" /> Основная информация
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-cs-text uppercase mb-2">Никнейм</label>
                                            <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} className="w-full bg-black/50 border border-white/10 px-4 py-3 text-sm text-white focus:border-cs-orange focus:outline-none transition-colors" placeholder="Ваш никнейм" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-cs-text uppercase mb-2">ФИО / Имя</label>
                                            <input type="text" name="real_name" value={formData.real_name} onChange={handleChange} className="w-full bg-black/50 border border-white/10 px-4 py-3 text-sm text-white focus:border-cs-orange focus:outline-none transition-colors" placeholder="Ваше имя" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-cs-text uppercase mb-2">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/50 border border-white/10 pl-10 pr-4 py-3 text-sm text-white focus:border-cs-orange focus:outline-none transition-colors" placeholder="email@example.com" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-cs-text uppercase mb-2">Пол</label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-black/50 border border-white/10 px-4 py-3 text-sm text-white focus:border-cs-orange focus:outline-none transition-colors">
                                                <option value="male">Мужской</option>
                                                <option value="female">Женский</option>
                                                <option value="other">Другой</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-cs-text uppercase mb-2">Короткая ссылка</label>
                                            <div className="relative">
                                                <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                                <input type="text" name="custom_url" value={formData.custom_url} onChange={handleChange} className="w-full bg-black/50 border border-white/10 pl-10 pr-4 py-3 text-sm text-white focus:border-cs-orange focus:outline-none transition-colors" placeholder="custom-id" />
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-1">cs2tournaments.asia/user/{formData.custom_url || profile.user.id}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-cs-text uppercase mb-2">Метка игрока (Роль в игре)</label>
                                            <input type="text" name="player_label" value={formData.player_label} onChange={handleChange} className="w-full bg-black/50 border border-white/10 px-4 py-3 text-sm text-white focus:border-cs-orange focus:outline-none transition-colors" placeholder="Например: Sniper, IGL" maxLength={30} />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <button type="submit" disabled={loading} className="bg-cs-orange hover:bg-yellow-400 text-black font-black py-3 px-8 uppercase tracking-wider skew-x-[-10deg] flex items-center gap-2 shadow-[0_0_15px_rgba(233,177,14,0.3)] transition-all disabled:opacity-50">
                                        <span className="skew-x-[10deg] flex items-center gap-2">
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            Сохранить изменения
                                        </span>
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'appearance' && (
                            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
                                        <Palette className="w-5 h-5 text-cs-orange" /> Оформление профиля
                                    </h3>
                                    <p className="text-sm text-cs-text mb-4">Выберите фон, который будет отображаться в шапке вашего профиля.</p>

                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                        {[
                                            { id: '', name: 'По умолчанию', img: '/defolt.png' },
                                            { id: 'profile_images/profile1.png', name: 'Фон 1', img: '/profile_images/profile1.png' },
                                            { id: 'profile_images/profile2.jpg', name: 'Фон 2', img: '/profile_images/profile2.jpg' },
                                            { id: 'profile_images/profile3.jpg', name: 'Фон 3', img: '/profile_images/profile3.jpg' },
                                            { id: 'profile_images/profile4.jpg', name: 'Фон 4', img: '/profile_images/profile4.jpg' },
                                            { id: 'profile_images/profile5.jpg', name: 'Фон 5', img: '/profile_images/profile5.jpg' },
                                            { id: 'profile_images/profile6.jpg', name: 'Фон 6', img: '/profile_images/profile6.jpg' },
                                            { id: 'profile_images/profile7.jpg', name: 'Фон 7', img: '/profile_images/profile7.jpg' },
                                            { id: 'profile_images/profile8.jpg', name: 'Фон 8', img: '/profile_images/profile8.jpg' },
                                            { id: 'profile_images/profile9.jpg', name: 'Фон 9', img: '/profile_images/profile9.jpg' },
                                            { id: 'profile_images/profile10.jpg', name: 'Фон 10', img: '/profile_images/profile10.jpg' },
                                            { id: 'profile_images/profile11.jpg', name: 'Фон 11', img: '/profile_images/profile11.jpg' },
                                            { id: 'profile_images/profile12.jpg', name: 'Фон 12', img: '/profile_images/profile13.jpg' },
                                            { id: 'profile_images/profile14.jpg', name: 'Фон 14', img: '/profile_images/profile14.jpg' },
                                            { id: 'profile_images/profile15.jpg', name: 'Фон 15', img: '/profile_images/profile15.jpg' },
                                            { id: 'profile_images/profile16.jpg', name: 'Фон 16', img: '/profile_images/profile16.jpg' },
                                        ].map((bg) => (
                                            <div
                                                key={bg.id}
                                                onClick={() => setFormData(prev => ({ ...prev, profile_bg: bg.id }))}
                                                className={`cursor-pointer border-2 relative group overflow-hidden transition-all ${formData.profile_bg === bg.id ? 'border-cs-orange scale-[1.02] shadow-[0_0_15px_rgba(233,177,14,0.3)]' : 'border-white/10 hover:border-white/30 hover:scale-[1.02]'}`}
                                            >
                                                <div className="aspect-video bg-black">
                                                    <img src={bg.img} alt={bg.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-center backdrop-blur-sm">
                                                    <span className={`text-xs font-bold uppercase ${formData.profile_bg === bg.id ? 'text-cs-orange' : 'text-white'}`}>{bg.name}</span>
                                                </div>
                                                {formData.profile_bg === bg.id && (
                                                    <div className="absolute top-2 right-2 bg-cs-orange text-black rounded-full p-1 shadow-lg">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <button type="submit" disabled={loading} className="bg-cs-orange hover:bg-yellow-400 text-black font-black py-3 px-8 uppercase tracking-wider skew-x-[-10deg] flex items-center gap-2 shadow-[0_0_15px_rgba(233,177,14,0.3)] transition-all disabled:opacity-50">
                                        <span className="skew-x-[10deg] flex items-center gap-2">
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            Сохранить оформление
                                        </span>
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'privacy' && (
                            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-cs-orange" /> Приватность
                                    </h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-cs-text uppercase mb-2">Кто видит мой профиль</label>
                                            <select name="privacy_profile_visibility" value={formData.privacy_settings?.profile_visibility} onChange={handleChange} className="w-full bg-black/50 border border-white/10 px-4 py-3 text-sm text-white focus:border-cs-orange focus:outline-none transition-colors">
                                                <option value="public">Все пользователи</option>
                                                <option value="friends">Только друзья</option>
                                                <option value="private">Только я</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-cs-text uppercase mb-2">Кто может писать на стене</label>
                                            <select name="privacy_wall_visibility" value={formData.privacy_settings?.wall_visibility} onChange={handleChange} className="w-full bg-black/50 border border-white/10 px-4 py-3 text-sm text-white focus:border-cs-orange focus:outline-none transition-colors">
                                                <option value="public">Все пользователи</option>
                                                <option value="friends">Только друзья</option>
                                                <option value="private">Только я</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-cs-text uppercase mb-2">Кто видит список друзей</label>
                                            <select name="privacy_friends_visibility" value={formData.privacy_settings?.friends_visibility} onChange={handleChange} className="w-full bg-black/50 border border-white/10 px-4 py-3 text-sm text-white focus:border-cs-orange focus:outline-none transition-colors">
                                                <option value="public">Все пользователи</option>
                                                <option value="friends">Только друзья</option>
                                                <option value="private">Только я</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <button type="submit" disabled={loading} className="bg-cs-orange hover:bg-yellow-400 text-black font-black py-3 px-8 uppercase tracking-wider skew-x-[-10deg] flex items-center gap-2 shadow-[0_0_15px_rgba(233,177,14,0.3)] transition-all disabled:opacity-50">
                                        <span className="skew-x-[10deg] flex items-center gap-2">
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            Сохранить настройки
                                        </span>
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'sessions' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
                                        <Monitor className="w-5 h-5 text-cs-orange" /> Активные сессии
                                    </h3>
                                    <div className="space-y-3">
                                        {sessions.map(session => (
                                            <div key={session.id} className="bg-black/30 border border-white/5 p-4 flex justify-between items-center skew-x-[-5deg]">
                                                <div className="skew-x-[5deg]">
                                                    <div className="font-bold text-white text-sm flex items-center gap-2">
                                                        {session.user_agent?.includes('Mobile') ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                                                        {session.ip_address}
                                                    </div>
                                                    <div className="text-xs text-cs-text mt-1">
                                                        Последняя активность: {new Date(session.last_active).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="skew-x-[5deg]">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRevokeSession(session.id)}
                                                        className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider"
                                                    >
                                                        Завершить
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {sessions.length === 0 && (
                                            <div className="text-cs-text text-sm italic">Нет активных сессий</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
