import { useState, useEffect } from 'react'
import { matchesAPI } from '../utils/api'
import { Loader2, Calendar, ChevronRight, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import usePageTitle from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'
import MatchStatsTable from '../components/matches/MatchStatsTable'

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    }
}

const MatchesPage = () => {
    usePageTitle('История матчей')
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [expandedMatch, setExpandedMatch] = useState(null)
    const [matchDetails, setMatchDetails] = useState(null)
    const [loadingDetails, setLoadingDetails] = useState(false)

    useEffect(() => {
        fetchMatches()
    }, [page])

    const fetchMatches = async () => {
        setLoading(true)
        try {
            const response = await matchesAPI.getMatches({ page })
            setMatches(response.data.matches)
            setTotalPages(response.data.pages)
        } catch (error) {
            console.error('Failed to fetch matches:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleMatchClick = async (matchId) => {
        if (expandedMatch === matchId) {
            setExpandedMatch(null)
            setMatchDetails(null)
            return
        }

        setExpandedMatch(matchId)
        setLoadingDetails(true)
        try {
            const response = await matchesAPI.getMatch(matchId)
            setMatchDetails(response.data)
        } catch (error) {
            console.error('Failed to fetch match details:', error)
        } finally {
            setLoadingDetails(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Неизвестно'
        return new Date(dateString).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="min-h-screen bg-cs-dark text-white font-sans selection:bg-cs-orange/30 relative overflow-hidden pt-24">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cs-grid-bg opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-cs-dark/80 via-cs-dark/90 to-cs-dark"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
                <Breadcrumbs />
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    className="text-center mb-12"
                >
                    <div className="inline-block bg-cs-orange text-black px-2 py-1 text-xs font-black uppercase tracking-widest mb-2 skew-x-[-10deg]">
                        <span className="skew-x-[10deg]">Match History</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">
                        ИСТОРИЯ <span className="text-cs-orange">МАТЧЕЙ</span>
                    </h1>
                    <p className="text-cs-text text-lg max-w-2xl mx-auto font-medium">
                        Результаты прошедших игр и подробная статистика.
                    </p>
                </motion.div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-10 h-10 animate-spin text-cs-orange" />
                        </div>
                    ) : matches.length > 0 ? (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.05 } }
                            }}
                        >
                            {matches.map((match) => (
                                <motion.div
                                    key={match.match_id}
                                    variants={fadeInUp}
                                    className="group relative bg-cs-surface border border-white/5 p-1 transition-all duration-300 clip-path-slant hover:border-cs-orange/50 mb-4"
                                >
                                    <div
                                        onClick={() => handleMatchClick(match.match_id)}
                                        className="relative bg-gradient-to-r from-neutral-800 to-cs-surface p-5 flex flex-col md:flex-row items-center justify-between cursor-pointer hover:from-neutral-700 hover:to-cs-surface/80 transition-all gap-6"
                                    >
                                        <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-start flex-1">
                                            {/* Team A */}
                                            <div className={`flex flex-col items-center w-32 text-center ${match.winning_team_name === 'Team A' ? 'opacity-100' : 'opacity-70'}`}>
                                                <span className="text-cs-text text-[10px] font-bold uppercase mb-1 tracking-wider">Team A</span>
                                                <span className={`font-black text-lg truncate w-full uppercase tracking-tight ${match.winning_team_name === 'Team A' ? 'text-cs-orange' : 'text-white'}`}>
                                                    {match.winning_team_name === 'Team A' && <Trophy className="w-3 h-3 inline-block mr-1 mb-1" />}
                                                    Team A
                                                </span>
                                            </div>

                                            {/* Score & Map */}
                                            <div className="flex flex-col items-center px-4 flex-1">
                                                <div className="flex items-center gap-3 text-4xl font-black text-white tracking-widest drop-shadow-lg skew-x-[-10deg]">
                                                    <span className={`skew-x-[10deg] ${match.winning_team_name === 'Team A' ? 'text-cs-orange' : ''}`}>{match.team_a_score ?? '-'}</span>
                                                    <span className="skew-x-[10deg] text-white/20">:</span>
                                                    <span className={`skew-x-[10deg] ${match.winning_team_name === 'Team B' ? 'text-cs-blue' : ''}`}>{match.team_b_score ?? '-'}</span>
                                                </div>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="text-[10px] text-cs-text bg-black/40 px-2 py-0.5 skew-x-[-10deg] border border-white/5 font-mono uppercase">
                                                        <span className="skew-x-[10deg]">{match.map_name || 'Unknown Map'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Team B */}
                                            <div className={`flex flex-col items-center w-32 text-center ${match.winning_team_name === 'Team B' ? 'opacity-100' : 'opacity-70'}`}>
                                                <span className="text-cs-text text-[10px] font-bold uppercase mb-1 tracking-wider">Team B</span>
                                                <span className={`font-black text-lg truncate w-full uppercase tracking-tight ${match.winning_team_name === 'Team B' ? 'text-cs-blue' : 'text-white'}`}>
                                                    Team B
                                                    {match.winning_team_name === 'Team B' && <Trophy className="w-3 h-3 inline-block ml-1 mb-1" />}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4 text-sm text-cs-text w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0 mt-4 md:mt-0">
                                            <div className="flex items-center bg-black/30 px-3 py-1.5 skew-x-[-10deg] border border-white/5">
                                                <span className="skew-x-[10deg] flex items-center gap-2 text-xs font-bold">
                                                    <Calendar className="w-3 h-3 text-cs-text" />
                                                    {formatDate(match.game_date)}
                                                </span>
                                            </div>
                                            <div className={`w-8 h-8 flex items-center justify-center transition-transform duration-300 bg-white/5 border border-white/5 skew-x-[-10deg] ${expandedMatch === match.match_id ? 'rotate-90 text-cs-orange border-cs-orange/50' : 'text-cs-text'}`}>
                                                <ChevronRight className="w-4 h-4 skew-x-[10deg]" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {expandedMatch === match.match_id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-white/5 bg-black/20 overflow-hidden"
                                            >
                                                <div className="p-6">
                                                    {loadingDetails ? (
                                                        <div className="flex justify-center p-8">
                                                            <Loader2 className="w-6 h-6 animate-spin text-cs-orange" />
                                                        </div>
                                                    ) : (
                                                        <MatchStatsTable matchDetails={matchDetails} />
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-24 bg-cs-surface clip-path-slant border border-white/5">
                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wider">Матчи не найдены</h3>
                            <p className="text-cs-text font-medium">История матчей пуста.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-10 gap-3">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-6 py-3 bg-black/40 border border-white/10 text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold uppercase tracking-wider skew-x-[-10deg]"
                        >
                            <span className="skew-x-[10deg]">Назад</span>
                        </button>
                        <span className="px-6 py-3 bg-cs-orange text-black font-black border border-cs-orange skew-x-[-10deg] flex items-center">
                            <span className="skew-x-[10deg]">{page} / {totalPages}</span>
                        </span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-6 py-3 bg-black/40 border border-white/10 text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold uppercase tracking-wider skew-x-[-10deg]"
                        >
                            <span className="skew-x-[10deg]">Вперед</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MatchesPage
