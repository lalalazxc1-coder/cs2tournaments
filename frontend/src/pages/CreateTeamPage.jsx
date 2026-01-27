import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { teamAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Shield, Info, Image, CheckCircle, AlertCircle, Loader2, Upload } from 'lucide-react'
import { motion } from 'framer-motion'
import usePageTitle from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'

const CreateTeamPage = () => {
    usePageTitle('Создание команды')
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
        logo_url: ''
    })

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
            setFormData({ ...formData, logo_url: response.data.url })
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
            setError('Для создания команды необходимо принять правила проекта.')
            return
        }

        setLoading(true)

        try {
            if (!formData.name) throw new Error('Название команды обязательно')
            await teamAPI.createTeam(formData)
            navigate('/teams')
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

            <div className="relative z-10 max-w-2xl mx-auto">
                <Breadcrumbs />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
                    <div className="inline-block bg-cs-orange text-black px-2 py-1 text-xs font-black uppercase tracking-widest mb-2 skew-x-[-10deg]">
                        <span className="skew-x-[10deg]">New Team</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase">Создать Команду</h1>
                    <p className="text-cs-text text-lg font-medium">Соберите свой состав и начните путь к победам.</p>
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

                    <div className="space-y-6 mb-8">
                        <div>
                            <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Название Команды *</label>
                            <div className="relative skew-x-[-5deg]">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cs-text skew-x-[5deg]" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 pl-12 pr-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors font-bold uppercase tracking-wider placeholder-cs-text/50"
                                    placeholder="Например: NaVi"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Описание</label>
                            <div className="relative skew-x-[-5deg]">
                                <Info className="absolute left-4 top-4 w-5 h-5 text-cs-text skew-x-[5deg]" />
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 pl-12 pr-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors h-[120px] resize-none font-medium placeholder-cs-text/50"
                                    placeholder="О вашей команде..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Логотип Команды</label>
                            <div className="flex items-start gap-4">
                                <div className="w-32 h-32 bg-black/40 border border-white/10 flex items-center justify-center skew-x-[-5deg] overflow-hidden relative group">
                                    {formData.logo_url ? (
                                        <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover skew-x-[5deg]" />
                                    ) : (
                                        <Shield className="w-12 h-12 text-cs-text/20 skew-x-[5deg]" />
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-cs-orange skew-x-[5deg]" />
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
                                            id="logo-upload"
                                            disabled={uploading}
                                        />
                                        <label
                                            htmlFor="logo-upload"
                                            className={`flex items-center justify-center w-full p-4 border-2 border-dashed border-white/10 hover:border-cs-orange/50 hover:bg-white/5 transition-all cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                                        >
                                            <div className="text-center skew-x-[5deg]">
                                                <Upload className="w-8 h-8 text-cs-text mx-auto mb-2" />
                                                <span className="block text-sm font-bold text-white uppercase tracking-wider">Загрузить Логотип</span>
                                                <span className="block text-xs text-cs-text mt-1">PNG, JPG, GIF до 5MB</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                        <button
                            type="button"
                            onClick={() => navigate('/teams')}
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
                                Создать
                            </span>
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    )
}

export default CreateTeamPage
