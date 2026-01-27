import { useState, useEffect } from 'react'
import { X, Search, UserPlus, Loader2, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { teamAPI } from '../../utils/api'

const TeamSearchModal = ({ isOpen, onClose, onInvite }) => {
    const [query, setQuery] = useState('')
    const [teams, setTeams] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length >= 2) {
                searchTeams()
            } else {
                setTeams([])
            }
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [query])

    const searchTeams = async () => {
        setLoading(true)
        try {
            const res = await teamAPI.getTeams({ search: query, limit: 10 })
            setTeams(res.data.teams || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#151515] border border-white/10 w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh] rounded-lg"
                >
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40 rounded-t-lg">
                        <h3 className="font-black text-white uppercase tracking-wider">Пригласить команду</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-4 border-b border-white/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Поиск команды..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 pl-10 pr-4 py-3 text-white focus:border-cs-orange focus:outline-none transition-colors rounded"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-cs-orange" />
                            </div>
                        ) : teams.length > 0 ? (
                            <div className="space-y-2">
                                {teams.map(team => (
                                    <div key={team.id} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group rounded">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-black/50 flex items-center justify-center font-bold text-gray-400 border border-white/10 rounded overflow-hidden">
                                                {team.logo_url ? (
                                                    <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Users className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-cs-orange transition-colors">{team.name}</div>
                                                <div className="text-xs text-gray-500 font-mono">Captain: {team.captain?.nickname || 'Unknown'}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onInvite(team.id)}
                                            className="bg-cs-orange hover:bg-yellow-400 text-black p-2 font-bold rounded transition-transform active:scale-95"
                                            title="Пригласить"
                                        >
                                            <UserPlus className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : query.length >= 2 ? (
                            <div className="text-center py-8 text-gray-500">
                                Команды не найдены
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500/50 text-sm">
                                Введите минимум 2 символа для поиска
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export default TeamSearchModal
