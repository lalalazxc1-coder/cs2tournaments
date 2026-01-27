import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { playersAPI } from '../utils/api'
import { Search, Trophy, Loader2, User, Medal, X, Scale } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import usePageTitle from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'
import PlayerComparisonModal from '../components/PlayerComparisonModal'

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    }
}

const PlayersPage = () => {
    usePageTitle('Рейтинг игроков')
    const navigate = useNavigate()
    const [players, setPlayers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Comparison State
    const [compareMode, setCompareMode] = useState(false)
    const [selectedPlayers, setSelectedPlayers] = useState([])
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)

    useEffect(() => {
        fetchPlayers()
    }, [page, search])

    const fetchPlayers = async () => {
        setLoading(true)
        try {
            const response = await playersAPI.getPlayers({ page, search })

            setPlayers(response.data.players)
            setTotalPages(response.data.pages)
        } catch (error) {
            console.error('Failed to fetch players:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        setSearch(e.target.value)
        setPage(1) // Reset to first page on search
    }

    const handlePlayerClick = (player) => {
        if (compareMode) {
            togglePlayerSelection(player);
            return;
        }

        const user = player.user || {};
        // If user has a custom URL, use it, otherwise use ID
        const profileId = (user.custom_url && !user.custom_url.includes('/')) ? user.custom_url : user.id || player.player_steamid;

        // If we have a valid ID/URL, navigate
        if (profileId) {
            navigate(`/user/${profileId}`);
        }
    }

    const togglePlayerSelection = (player) => {
        if (selectedPlayers.find(p => p.player_steamid === player.player_steamid)) {
            setSelectedPlayers(prev => prev.filter(p => p.player_steamid !== player.player_steamid));
        } else {
            if (selectedPlayers.length < 2) {
                // Add rank to player object for context
                const index = players.findIndex(p => p.player_steamid === player.player_steamid);
                const rank = (page - 1) * 20 + index + 1;
                setSelectedPlayers(prev => [...prev, { ...player, rank }]);
            }
        }
    }

    const getRankIcon = (rank) => {
        if (rank === 1) return <Medal className="w-6 h-6 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-400 drop-shadow-[0_0_10px_rgba(156,163,175,0.5)]" />
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-700 drop-shadow-[0_0_10px_rgba(180,83,9,0.5)]" />
        return null
    }

    return (
        <div className="min-h-screen bg-cs-dark text-white font-sans selection:bg-cs-orange/30 relative overflow-hidden pt-10">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cs-grid-bg opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-cs-dark/80 via-cs-dark/90 to-cs-dark"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
                <Breadcrumbs />
                {/* Header */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 md:mb-12 gap-6 text-center md:text-left"
                >
                    <div className="w-full md:w-auto">
                        {/*<div className="inline-flex items-center gap-2 px-3 py-1 mb-4 border-l-4 border-cs-orange bg-white/5 mx-auto md:mx-0">
                            <span className="text-cs-orange font-bold tracking-widest uppercase text-xs">Leaderboards</span>
                        </div>*/}
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tighter uppercase">
                            РЕЙТИНГ <span className="text-cs-orange">ИГРОКОВ</span>
                        </h1>
                        <p className="text-cs-text text-sm md:text-lg max-w-2xl font-medium mx-auto md:mx-0">
                            Лучшие игроки платформы, отсортированные по эффективности и статистике.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setCompareMode(!compareMode);
                            setSelectedPlayers([]);
                        }}
                        className={`w-full md:w-auto px-6 py-3 border ${compareMode ? 'bg-cs-orange text-black border-cs-orange' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'} transition-colors font-black uppercase tracking-wider skew-x-[-10deg] flex items-center justify-center gap-2`}
                    >
                        <Scale className="w-5 h-5 skew-x-[10deg]" />
                        <span className="skew-x-[10deg]">{compareMode ? 'Отмена' : 'Сравнить'}</span>
                    </button>
                </motion.div>

                {/* Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 space-y-4"
                >
                    <div className="relative skew-x-[-10deg]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cs-text skew-x-[10deg]" />
                        <input
                            type="text"
                            placeholder="ПОИСК ИГРОКА..."
                            value={search}
                            onChange={handleSearch}
                            className="w-full bg-black/40 border border-white/10 px-12 py-3 text-white placeholder-cs-text focus:outline-none focus:border-cs-orange/50 transition-colors uppercase tracking-wider font-bold text-sm skew-x-[10deg]"
                        />
                    </div>
                </motion.div>

                {/* Players Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-cs-surface border border-white/5 overflow-hidden shadow-2xl clip-path-slant p-1"
                >
                    <div className="bg-gradient-to-b from-neutral-800 to-cs-surface overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-1">
                            <thead className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                                <tr>
                                    {compareMode && <th className="px-2 md:px-4 py-3 w-10"></th>}
                                    <th className="px-2 md:px-4 py-3 text-center w-12 md:w-16">#</th>
                                    <th className="px-2 md:px-4 py-3">Игрок</th>
                                    <th className="px-2 md:px-4 py-3 text-center">Матчи</th>
                                    <th className="px-2 md:px-4 py-3 text-center">Винрейт</th>
                                    <th className="px-2 md:px-4 py-3 text-center">K/D</th>
                                    <th className="hidden md:table-cell px-4 py-3 text-center">HS %</th>
                                    <th className="hidden md:table-cell px-4 py-3 text-center">ACE</th>
                                    <th className="hidden md:table-cell px-4 py-3 text-center">MVP</th>
                                    <th className="px-2 md:px-4 py-3 text-center text-cs-orange">Рейтинг</th>
                                </tr>
                            </thead>
                            <tbody className="">
                                {loading ? (
                                    <tr>
                                        <td colSpan={compareMode ? 10 : 9} className="p-12 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-cs-orange mx-auto" />
                                        </td>
                                    </tr>
                                ) : players.length > 0 ? (
                                    players.map((playerStat, index) => {
                                        const user = playerStat.user || {}
                                        const stats = playerStat;
                                        const rank = stats.rank || ((page - 1) * 20 + index + 1)

                                        const rowStyle = user.profile_bg ? {
                                            backgroundImage: `linear-gradient(90deg, rgba(23, 26, 33, 0.98) 0%, rgba(23, 26, 33, 0.85) 50%, rgba(23, 26, 33, 0.98) 100%), url(/${user.profile_bg})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        } : {};

                                        return (
                                            <tr
                                                key={playerStat.player_steamid}
                                                onClick={() => handlePlayerClick(playerStat)}
                                                style={rowStyle}
                                                className={`hover:bg-white/5 transition-all group cursor-pointer ${selectedPlayers.find(p => p.player_steamid === playerStat.player_steamid) ? 'bg-white/10' : ''}`}
                                            >
                                                {compareMode && (
                                                    <td className="p-2 md:p-3 text-center">
                                                        <div className={`w-4 h-4 border ${selectedPlayers.find(p => p.player_steamid === playerStat.player_steamid) ? 'bg-cs-orange border-cs-orange' : 'border-white/20'} flex items-center justify-center transition-colors`}>
                                                            {selectedPlayers.find(p => p.player_steamid === playerStat.player_steamid) && <div className="w-2.5 h-2.5 bg-black" />}
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="p-2 md:p-3 text-center font-bold text-gray-500 group-hover:text-white transition-colors">
                                                    <div className="flex justify-center items-center">
                                                        {playerStat.total_matches < 10 ? (
                                                            <span className="text-[10px] font-mono opacity-50" title="Калибровка (нужно 10 матчей)">—</span>
                                                        ) : (
                                                            getRankIcon(rank) || <span className="text-xs opacity-50 font-mono">#{rank}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-2 md:p-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-7 h-7 md:w-9 md:h-9 bg-black/50 flex items-center justify-center border border-white/10 group-hover:border-cs-orange/50 transition-colors overflow-hidden skew-x-[-10deg]">
                                                            {user.avatar_medium || user.avatar_full ? (
                                                                <img src={user.avatar_medium || user.avatar_full} alt={user.nickname} className="w-full h-full object-cover skew-x-[10deg]" />
                                                            ) : (
                                                                <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-cs-text group-hover:text-cs-orange transition-colors skew-x-[10deg]" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-white text-xs md:text-base group-hover:text-cs-orange transition-colors uppercase tracking-tight truncate max-w-[80px] md:max-w-none">
                                                                {user.nickname || stats.player_name || 'Unknown'}
                                                            </div>
                                                            <div className="text-[10px] md:text-xs text-cs-orange font-mono font-bold">
                                                                {user.player_label || ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-2 md:p-3 text-center">
                                                    <div className="font-bold text-white font-mono text-[11px] md:text-sm">{stats.total_matches || 0}</div>
                                                </td>
                                                <td className="p-2 md:p-3 text-center">
                                                    <div className={`font-bold font-mono text-[11px] md:text-sm ${(stats.win_rate || 0) >= 50 ? 'text-green-400' :
                                                        (stats.win_rate || 0) >= 40 ? 'text-yellow-400' : 'text-red-400'
                                                        }`}>
                                                        {stats.win_rate ? Number(stats.win_rate).toFixed(1) : 0}%
                                                    </div>
                                                </td>
                                                <td className="p-2 md:p-3 text-center">
                                                    <div className={`font-bold font-mono text-[11px] md:text-sm ${(stats.k_d_ratio || 0) >= 1.2 ? 'text-green-400' :
                                                        (stats.k_d_ratio || 0) >= 1.0 ? 'text-yellow-400' : 'text-red-400'
                                                        }`}>
                                                        {stats.k_d_ratio ? Number(stats.k_d_ratio).toFixed(2) : 0.0}
                                                    </div>
                                                </td>
                                                <td className="hidden md:table-cell p-3 text-center text-cs-text font-mono text-sm">
                                                    {stats.avg_hs_percent ? Number(stats.avg_hs_percent).toFixed(1) : 0}%
                                                </td>
                                                <td className="hidden md:table-cell p-3 text-center">
                                                    <div className="font-bold text-white font-mono text-sm">{stats.total_5k || 0}</div>
                                                </td>
                                                <td className="hidden md:table-cell p-3 text-center">
                                                    <div className="font-bold text-white font-mono text-sm">{stats.total_MVP || 0}</div>
                                                </td>
                                                <td className="p-2 md:p-3 text-center">
                                                    <div className="font-black text-cs-orange text-xs md:text-base font-mono">
                                                        {stats.total_matches < 10 ? (
                                                            <span className="text-[10px] text-white/30 font-bold" title="Калибровка">TBD</span>
                                                        ) : (
                                                            Math.round(Number(stats.rating || 0))
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={compareMode ? 10 : 9} className="p-12 text-center text-cs-text font-bold uppercase tracking-wider">
                                            Игроки не найдены
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-10 gap-3">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-black uppercase tracking-wider skew-x-[-10deg] text-sm"
                        >
                            <span className="skew-x-[10deg]">Назад</span>
                        </button>
                        <span className="px-4 py-2 bg-cs-orange text-black font-black skew-x-[-10deg] flex items-center text-sm">
                            <span className="skew-x-[10deg]">{page} / {totalPages}</span>
                        </span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-black uppercase tracking-wider skew-x-[-10deg] text-sm"
                        >
                            <span className="skew-x-[10deg]">Вперед</span>
                        </button>
                    </div>
                )}


                {/* Comparison Floating Bar */}
                <AnimatePresence>
                    {compareMode && selectedPlayers.length > 0 && (
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            className="fixed bottom-0 left-0 right-0 md:bottom-8 md:left-1/2 md:right-auto md:-translate-x-1/2 z-40 bg-cs-surface border-t md:border border-cs-orange/50 p-4 shadow-2xl flex flex-row justify-between md:justify-start items-center gap-4 md:gap-6 md:clip-path-slant w-full md:w-auto"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {selectedPlayers.map(p => (
                                        <div key={p.player_steamid} className="w-10 h-10 bg-black/50 border border-white/10 overflow-hidden rounded-full md:rounded-none relative z-10">
                                            {p.user?.avatar_medium ? (
                                                <img src={p.user.avatar_medium} alt={p.player_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/50">?</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-white font-bold uppercase tracking-wider text-xs md:text-sm">
                                    <span className="hidden md:inline">Выбрано: </span>
                                    <span className="text-cs-orange">{selectedPlayers.length}</span> / 2
                                </div>
                            </div>

                            <button
                                disabled={selectedPlayers.length !== 2}
                                onClick={() => setIsCompareModalOpen(true)}
                                className="px-4 md:px-6 py-2 bg-cs-orange text-black font-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:text-black transition-colors skew-x-[-10deg] text-sm md:text-base"
                            >
                                <span className="skew-x-[10deg]">Сравнить</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <PlayerComparisonModal
                    isOpen={isCompareModalOpen}
                    onClose={() => setIsCompareModalOpen(false)}
                    player1={selectedPlayers[0]}
                    player2={selectedPlayers[1]}
                />
            </div>
        </div>
    )
}

export default PlayersPage
