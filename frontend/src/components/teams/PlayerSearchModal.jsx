import { useState, useEffect } from 'react'
import { X, Search, UserPlus, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { playersAPI } from '../../utils/api'

const PlayerSearchModal = ({ isOpen, onClose, onInvite }) => {
    const [query, setQuery] = useState('')
    const [players, setPlayers] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length >= 2) {
                searchPlayers()
            } else {
                setPlayers([])
            }
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [query])

    const searchPlayers = async () => {
        setLoading(true)
        try {
            const res = await playersAPI.getPlayers({ search: query, limit: 10 })
            // Filter only players with user account
            const users = res.data.players.filter(p => p.user)
            setPlayers(users)
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
                    className="bg-cs-surface border border-white/10 w-full max-w-lg shadow-2xl clip-path-slant flex flex-col max-h-[80vh]"
                >
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                        <h3 className="font-black text-white uppercase tracking-wider">Пригласить игрока</h3>
                        <button onClick={onClose} className="text-cs-text hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-4 border-b border-white/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cs-text" />
                            <input
                                type="text"
                                placeholder="Поиск по нику или Steam ID..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 pl-10 pr-4 py-3 text-white focus:border-cs-orange focus:outline-none transition-colors skew-x-[-5deg]"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-cs-orange" />
                            </div>
                        ) : players.length > 0 ? (
                            <div className="space-y-2">
                                {players.map(player => (
                                    <div key={player.id} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-black/50 flex items-center justify-center font-bold text-cs-text border border-white/10 skew-x-[-10deg]">
                                                <span className="skew-x-[10deg]">{player.user.nickname?.[0] || '?'}</span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-cs-orange transition-colors">{player.user.nickname}</div>
                                                <div className="text-xs text-cs-text font-mono">ID: {player.user.id}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onInvite(player.user.id)}
                                            className="bg-cs-orange hover:bg-yellow-400 text-black p-2 font-bold skew-x-[-10deg] transition-transform active:scale-95"
                                            title="Пригласить"
                                        >
                                            <UserPlus className="w-5 h-5 skew-x-[10deg]" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : query.length >= 2 ? (
                            <div className="text-center py-8 text-cs-text">
                                Игроки не найдены
                            </div>
                        ) : (
                            <div className="text-center py-8 text-cs-text/50 text-sm">
                                Введите минимум 2 символа для поиска
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export default PlayerSearchModal
