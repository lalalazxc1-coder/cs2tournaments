import { useState, useEffect } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { userAPI } from '../../utils/api'
import { Loader2, Swords, Calendar, Users, Trophy, Clock } from 'lucide-react'

const ProfileMatches = () => {
    const { profile, isOwner } = useOutletContext()
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const itemsPerPage = 10

    useEffect(() => {
        fetchMatches()
    }, [])

    const fetchMatches = async () => {
        setLoading(true)
        try {
            const response = await userAPI.getUserMatches(profile.user.id)
            setMatches(response.data.matches || [])
        } catch (error) {
            console.error('Failed to fetch matches:', error)
        } finally {
            setLoading(false)
        }
    }

    const totalPages = Math.ceil(matches.length / itemsPerPage)
    const currentMatches = matches.slice((page - 1) * itemsPerPage, page * itemsPerPage)

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
            case 'finished': return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20'
            case 'in_progress': return 'bg-cs-blue/10 text-cs-blue border-cs-blue/20'
            case 'drafting': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
            case 'registering': return 'bg-cs-orange/10 text-cs-orange border-cs-orange/20'
            default: return 'bg-white/5 text-white border-white/10'
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'completed':
            case 'finished': return 'Завершен'
            case 'cancelled': return 'Отменен'
            case 'in_progress': return 'Идет игра'
            case 'drafting': return 'Драфт'
            case 'registering': return 'Регистрация'
            default: return status
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-cs-surface border border-white/10 p-6 clip-path-slant relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cs-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="flex flex-col gap-4 relative z-10">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-cs-orange mx-auto" />
                        </div>
                    ) : currentMatches.length > 0 ? (
                        currentMatches.map((match) => (
                            <Link to={`/lobbies/${match.id}`} key={match.id} className="group relative bg-black/20 border border-white/5 hover:border-cs-orange/50 p-4 transition-all duration-300 hover:bg-white/5 overflow-hidden block">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                                    <div className="flex items-start md:items-center gap-4 flex-1 w-full md:w-auto">
                                        <div className="w-10 h-10 bg-white/5 flex items-center justify-center border border-white/10 skew-x-[-10deg]">
                                            <Swords className="w-5 h-5 text-cs-text skew-x-[10deg]" />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-mono text-white/30">#{match.id}</span>
                                                <div className="font-bold text-white uppercase tracking-wider group-hover:text-cs-orange transition-colors">{match.name}</div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-xs text-cs-text font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Trophy className="w-3 h-3" />
                                                    <span>{match.format}</span>
                                                </div>
                                                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{new Date(match.date_time).toLocaleDateString('ru-RU')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                        <div className={`px-3 py-1 text-xs font-black uppercase tracking-wider skew-x-[-10deg] border ${getStatusColor(match.status)}`}>
                                            <span className="skew-x-[10deg] flex items-center gap-1.5">
                                                {match.status === 'in_progress' && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>}
                                                {getStatusText(match.status)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-xs font-bold text-cs-text bg-black/30 px-2 py-1 border border-white/5 skew-x-[-10deg]">
                                            <Users className="w-3 h-3 skew-x-[10deg]" />
                                            <span className="skew-x-[10deg]">{match.current_participants} / {match.max_participants}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-12 text-cs-text text-sm">
                            {isOwner ? 'У вас нет сыгранных матчей' : 'Матчи не найдены'}
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-3">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-black uppercase tracking-wider skew-x-[-10deg]"
                    >
                        <span className="skew-x-[10deg]">Назад</span>
                    </button>
                    <span className="px-4 py-2 bg-cs-orange text-black font-black skew-x-[-10deg] flex items-center">
                        <span className="skew-x-[10deg]">{page} / {totalPages}</span>
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-black uppercase tracking-wider skew-x-[-10deg]"
                    >
                        <span className="skew-x-[10deg]">Вперед</span>
                    </button>
                </div>
            )}
        </div>
    )
}

export default ProfileMatches
