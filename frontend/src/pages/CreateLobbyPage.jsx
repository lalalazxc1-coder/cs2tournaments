import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { lobbyAPI, teamAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Trophy, Calendar, Users, Map, Swords, Info, CheckCircle, AlertCircle, Loader2, Image, Upload } from 'lucide-react'
import { motion } from 'framer-motion'
import usePageTitle from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'

const CreateLobbyPage = () => {
    usePageTitle('Создание лобби')
    const navigate = useNavigate()
    const { user, termsAccepted, isAuthenticated, loading: authLoading } = useAuth()

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/')
        }
    }, [authLoading, isAuthenticated, navigate])

    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        format: 'BO1',
        max_participants: 10,
        date_time: '',
        map_pool: ['Ancient', 'Dust II', 'Inferno', 'Mirage', 'Nuke', 'Overpass', 'Train'],
        password: '',
        image_url: ''
    })

    // Fixed map pool, no toggle needed

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setError('Пожалуйста, выберите изображение')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Размер файла не должен превышать 5МБ')
            return
        }

        try {
            setUploading(true)
            setError('')
            const response = await teamAPI.uploadImage(file)
            setFormData({ ...formData, image_url: response.data.url })
        } catch (err) {
            setError('Ошибка при загрузке изображения')
            console.error(err)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!termsAccepted) {
            setError('Для создания лобби необходимо принять правила проекта.')
            return
        }

        setLoading(true)

        try {
            if (!formData.name || !formData.date_time) {
                throw new Error('Пожалуйста, заполните обязательные поля')
            }

            if (formData.map_pool.length < (formData.format === 'BO1' ? 3 : formData.format === 'BO3' ? 5 : 7)) {
                throw new Error(`Для формата ${formData.format} нужно выбрать минимум ${formData.format === 'BO1' ? 3 : formData.format === 'BO3' ? 5 : 7} карт`)
            }

            await lobbyAPI.createLobby(formData)
            navigate('/lobbies')
        } catch (err) {
            setError(err.response?.data?.message || err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-cs-dark text-white pt-24 pb-12 px-4 relative overflow-hidden font-sans">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cs-grid-bg opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-cs-dark/80 via-cs-dark/90 to-cs-dark"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
                <Breadcrumbs />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
                    <div className="inline-block bg-cs-orange text-black px-2 py-1 text-xs font-black uppercase tracking-widest mb-2 skew-x-[-10deg]">
                        <span className="skew-x-[10deg]">New Lobby</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase">Создать Лобби</h1>
                    <p className="text-cs-text text-lg font-medium max-w-2xl mx-auto">Настройте параметры матча 5x5, выберите карты и пригласите игроков.</p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="bg-cs-surface border border-white/10 p-8 md:p-12 shadow-2xl clip-path-slant"
                >
                    {error && (
                        <div className="mb-8 bg-red-900/20 border border-red-500/20 p-4 flex items-center gap-3 text-red-400 skew-x-[-5deg]">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 skew-x-[5deg]" />
                            <p className="skew-x-[5deg] font-bold">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Название Лобби *</label>
                                <div className="relative skew-x-[-5deg]">
                                    <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cs-text skew-x-[5deg]" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 pl-12 pr-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors font-bold uppercase tracking-wider placeholder-cs-text/50"
                                        placeholder="Например: Вечерний микс 5x5"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Пароль (Опционально)</label>
                                <div className="relative skew-x-[-5deg]">
                                    <Swords className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cs-text skew-x-[5deg]" />
                                    <input
                                        type="text"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 pl-12 pr-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors font-bold tracking-wider placeholder-cs-text/50"
                                        placeholder="Оставьте пустым для открытого лобби"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Дата и Время *</label>
                                <div className="relative skew-x-[-5deg]">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cs-text skew-x-[5deg]" />
                                    <input
                                        type="datetime-local"
                                        value={formData.date_time}
                                        onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 pl-12 pr-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors [color-scheme:dark] font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Формат</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['BO1', 'BO3', 'BO5'].map(fmt => (
                                        <button
                                            key={fmt}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, format: fmt })}
                                            className={`py-3 font-black uppercase tracking-wider border transition-all skew-x-[-5deg] ${formData.format === fmt
                                                ? 'bg-cs-orange text-black border-cs-orange'
                                                : 'bg-black/40 text-cs-text border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <span className="skew-x-[5deg]">{fmt}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Постер Лобби</label>
                                <div className="flex items-start gap-4">
                                    <div className="w-24 h-24 bg-black/40 border border-white/10 flex items-center justify-center skew-x-[-5deg] overflow-hidden relative group flex-shrink-0">
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
                                                id="lobby-poster-upload"
                                                disabled={uploading}
                                            />
                                            <label
                                                htmlFor="lobby-poster-upload"
                                                className={`flex items-center justify-center w-full p-4 border-2 border-dashed border-white/10 hover:border-cs-orange/50 hover:bg-white/5 transition-all cursor-pointer h-24 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                                            >
                                                <div className="text-center skew-x-[5deg]">
                                                    <Upload className="w-6 h-6 text-cs-text mx-auto mb-1" />
                                                    <span className="block text-xs font-bold text-white uppercase tracking-wider">Загрузить</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Описание</label>
                                <div className="relative skew-x-[-5deg]">
                                    <Info className="absolute left-4 top-4 w-5 h-5 text-cs-text skew-x-[5deg]" />
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 pl-12 pr-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors h-[100px] resize-none font-medium placeholder-cs-text/50"
                                        placeholder="Дополнительная информация..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Макс. Участников</label>
                                <div className="relative skew-x-[-5deg]">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cs-text skew-x-[5deg]" />
                                    <select
                                        value={formData.max_participants}
                                        onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                                        className="w-full bg-black/40 border border-white/10 pl-12 pr-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors appearance-none font-bold uppercase tracking-wider"
                                    >
                                        <option value="10">10 Игроков (5x5)</option>
                                        <option value="12">12 Игроков (с заменами)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-black text-cs-text mb-4 uppercase tracking-wider flex items-center gap-2">
                            <Map className="w-4 h-4" /> Официальный Маппул (Active Duty)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {formData.map_pool.map(map => (
                                <div
                                    key={map}
                                    className="py-3 px-2 text-sm font-bold border transition-all skew-x-[-5deg] bg-cs-blue/20 text-cs-blue border-cs-blue/50 shadow-[0_0_10px_rgba(59,130,246,0.2)] text-center cursor-default"
                                >
                                    <span className="skew-x-[5deg] uppercase tracking-wider">{map}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-cs-text mt-3 skew-x-[-5deg]">
                            <span className="skew-x-[5deg]">* Используется фиксированный набор карт. Изменение маппула недоступно.</span>
                        </p>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                        <button
                            type="button"
                            onClick={() => navigate('/lobbies')}
                            className="px-8 py-4 font-bold text-cs-text hover:text-white transition-colors uppercase tracking-wider skew-x-[-5deg]"
                        >
                            <span className="skew-x-[5deg]">Отмена</span>
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-cs-orange hover:bg-yellow-400 text-black font-black uppercase tracking-wider shadow-[0_0_20px_rgba(233,177,14,0.2)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed skew-x-[-5deg]"
                        >
                            <span className="skew-x-[5deg] flex items-center gap-2">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                Создать Лобби
                            </span>
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    )
}

export default CreateLobbyPage
