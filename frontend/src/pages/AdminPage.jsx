import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, Users, Trophy, Swords, Settings, Gamepad2, Loader2, Save } from 'lucide-react'
import AdminUsers from '../components/admin/AdminUsers'
import AdminTeams from '../components/admin/AdminTeams'
import AdminTournaments from '../components/admin/AdminTournaments'
import AdminMatches from '../components/admin/AdminMatches'
import AdminLobbies from '../components/admin/AdminLobbies'
import { adminAPI } from '../utils/api'
import usePageTitle from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'

const AdminPage = () => {
    usePageTitle('Админ-панель')
    const { user, isAuthenticated, loading } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('users')

    // Settings State
    const [settings, setSettings] = useState({})
    const [loadingSettings, setLoadingSettings] = useState(false)
    const [savingSettings, setSavingSettings] = useState(false)

    useEffect(() => {
        if (loading) return
        if (!isAuthenticated || user?.role !== 2) {
            navigate('/')
            return
        }
        if (activeTab === 'settings') {
            loadSettings()
        }
    }, [activeTab, isAuthenticated, user, navigate, loading])

    const loadSettings = async () => {
        setLoadingSettings(true)
        try {
            const response = await adminAPI.getSettings()
            setSettings(response.data)
        } catch (error) {
            console.error('Failed to load settings:', error)
        } finally {
            setLoadingSettings(false)
        }
    }

    const handleSaveSettings = async (e) => {
        e.preventDefault()
        setSavingSettings(true)
        try {
            await adminAPI.updateSettings(settings)
            alert('Settings saved successfully')
        } catch (error) {
            alert('Failed to save settings')
        } finally {
            setSavingSettings(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-cs-dark flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cs-orange" />
            </div>
        )
    }

    if (!isAuthenticated || user?.role !== 2) return null

    return (
        <div className="min-h-screen bg-cs-dark py-8 px-4 pt-24 relative overflow-hidden font-sans text-white">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cs-grid-bg opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-cs-dark/80 via-cs-dark/90 to-cs-dark"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <Breadcrumbs />
                <div className="inline-block bg-cs-orange text-black px-2 py-1 text-xs font-black uppercase tracking-widest mb-2 skew-x-[-10deg]">
                    <span className="skew-x-[10deg]">System Access</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-8 flex items-center tracking-tighter uppercase">
                    <Shield className="w-8 h-8 mr-3 text-cs-orange" />
                    Панель администратора
                </h1>

                {/* Tabs */}
                <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
                    {[
                        { id: 'users', label: 'Пользователи', icon: Users },
                        { id: 'teams', label: 'Команды', icon: Users },
                        { id: 'tournaments', label: 'Турниры', icon: Trophy },
                        { id: 'lobbies', label: 'Лобби (5x5)', icon: Gamepad2 },
                        { id: 'matches', label: 'Матчи (Парсер)', icon: Swords },
                        { id: 'settings', label: 'Настройки', icon: Settings },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 px-6 font-black uppercase tracking-wider transition-all whitespace-nowrap skew-x-[-10deg] border-b-2 ${activeTab === tab.id
                                ? 'text-cs-orange border-cs-orange bg-white/5'
                                : 'text-cs-text border-transparent hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="skew-x-[10deg] flex items-center gap-2">
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[400px] bg-cs-surface border border-white/5 p-6">
                    {activeTab === 'users' && <AdminUsers />}
                    {activeTab === 'teams' && <AdminTeams />}
                    {activeTab === 'tournaments' && <AdminTournaments />}
                    {activeTab === 'lobbies' && <AdminLobbies />}
                    {activeTab === 'matches' && <AdminMatches />}

                    {activeTab === 'settings' && (
                        <div className="max-w-5xl mx-auto">
                            {loadingSettings ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-cs-orange" />
                                </div>
                            ) : (
                                <form onSubmit={handleSaveSettings}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        {/* Tournaments Setting */}
                                        <div className="bg-black/40 border border-white/10 p-6 hover:border-cs-orange/50 transition-colors group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Trophy className="w-24 h-24 text-cs-orange" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="bg-cs-orange/20 p-2 rounded">
                                                        <Trophy className="w-6 h-6 text-cs-orange" />
                                                    </div>
                                                    <h3 className="text-lg font-black text-white uppercase tracking-wide">Турниры</h3>
                                                </div>
                                                <label className="block text-sm font-bold text-cs-text mb-2 uppercase tracking-wider">
                                                    Макс. активных турниров
                                                </label>
                                                <input
                                                    type="number"
                                                    value={settings.max_concurrent_tournaments || 3}
                                                    onChange={(e) => setSettings({ ...settings, max_concurrent_tournaments: e.target.value })}
                                                    className="w-full bg-black/50 border border-white/10 p-4 text-xl text-white focus:border-cs-orange focus:outline-none font-black mb-2"
                                                />
                                                <p className="text-xs text-cs-text/60 font-mono leading-relaxed">
                                                    Лимит одновременных турниров для одного организатора (статус "Регистрация" или "Идет").
                                                </p>
                                            </div>
                                        </div>

                                        {/* Matches Setting */}
                                        <div className="bg-black/40 border border-white/10 p-6 hover:border-cs-blue/50 transition-colors group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Swords className="w-24 h-24 text-cs-blue" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="bg-cs-blue/20 p-2 rounded">
                                                        <Swords className="w-6 h-6 text-cs-blue" />
                                                    </div>
                                                    <h3 className="text-lg font-black text-white uppercase tracking-wide">Матчи 5x5</h3>
                                                </div>
                                                <label className="block text-sm font-bold text-cs-text mb-2 uppercase tracking-wider">
                                                    Макс. активных лобби
                                                </label>
                                                <input
                                                    type="number"
                                                    value={settings.max_concurrent_matches || 5}
                                                    onChange={(e) => setSettings({ ...settings, max_concurrent_matches: e.target.value })}
                                                    className="w-full bg-black/50 border border-white/10 p-4 text-xl text-white focus:border-cs-blue focus:outline-none font-black mb-2"
                                                />
                                                <p className="text-xs text-cs-text/60 font-mono leading-relaxed">
                                                    Лимит одновременно созданных лобби 5x5 для одного организатора.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Teams Setting */}
                                        <div className="bg-black/40 border border-white/10 p-6 hover:border-green-500/50 transition-colors group relative overflow-hidden md:col-span-2">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Users className="w-24 h-24 text-green-500" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="bg-green-500/20 p-2 rounded">
                                                        <Users className="w-6 h-6 text-green-500" />
                                                    </div>
                                                    <h3 className="text-lg font-black text-white uppercase tracking-wide">Команды</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div>
                                                        <label className="block text-sm font-bold text-cs-text mb-2 uppercase tracking-wider">
                                                            Макс. команд на пользователя
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={settings.max_teams_per_user || 3}
                                                            onChange={(e) => setSettings({ ...settings, max_teams_per_user: e.target.value })}
                                                            className="w-full bg-black/50 border border-white/10 p-4 text-xl text-white focus:border-green-500 focus:outline-none font-black"
                                                        />
                                                    </div>
                                                    <div className="flex items-center">
                                                        <p className="text-sm text-cs-text/60 font-mono leading-relaxed">
                                                            Ограничение на количество команд, в которых пользователь может состоять или быть капитаном одновременно.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={savingSettings}
                                            className="bg-cs-orange hover:bg-yellow-400 text-black font-black uppercase tracking-wider py-4 px-8 transition-all flex items-center gap-3 skew-x-[-10deg] shadow-[0_0_20px_rgba(233,177,14,0.3)] hover:shadow-[0_0_30px_rgba(233,177,14,0.5)]"
                                        >
                                            <span className="skew-x-[10deg] flex items-center gap-2 text-lg">
                                                {savingSettings ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                                Сохранить изменения
                                            </span>
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdminPage
