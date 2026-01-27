import { Crown, Trophy, Plus, X, Users, Loader2, Camera, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const MAP_IMAGES = {
    "Ancient": "/ancient.png",
    "Dust II": "/dust2.png",
    "Inferno": "/inferno.png",
    "Mirage": "/mirage.png",
    "Nuke": "/nuke.png",
    "Overpass": "/overpass.png",
    "Anubis": "/anubis.png",
    "Train": "/train.png"
}

const LobbyMatchView = ({ draftState, team1, team2, lobbyId, isAdmin, matches, onRefresh, lobby, overallWinner, showPosterModal, setShowPosterModal }) => {
    // const [matches, setMatches] = useState([]) // Removed internal state
    const [unlinkedMatches, setUnlinkedMatches] = useState([])
    const [showLinkModal, setShowLinkModal] = useState(false)
    const [showStatsModal, setShowStatsModal] = useState(false)
    // const [showPosterModal, setShowPosterModal] = useState(false) // Controlled from parent
    const [selectedMatch, setSelectedMatch] = useState(null)
    const [matchStats, setMatchStats] = useState(null)
    const [selectedMapIndex, setSelectedMapIndex] = useState(null)
    const [loadingUnlinked, setLoadingUnlinked] = useState(false)

    // Lock body scroll when modal is open
    useEffect(() => {
        if (showStatsModal || showPosterModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showStatsModal, showPosterModal]);

    // useEffect(() => {
    //     if (lobbyId) {
    //         fetchMatches()
    //     }
    // }, [lobbyId])

    // const fetchMatches = async () => {
    //     try {
    //         const res = await axios.get(`/api/lobbies/${lobbyId}/matches`)
    //         setMatches(res.data.matches || [])
    //     } catch (error) {
    //         console.error('Error fetching matches:', error)
    //     }
    // }

    const fetchUnlinkedMatches = async () => {
        if (!isAdmin) return
        setLoadingUnlinked(true)
        try {
            const token = localStorage.getItem('token')
            const res = await axios.get(`/api/admin/lobbies/${lobbyId}/unlinked-matches?limit=50`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setUnlinkedMatches(res.data.matches || [])
        } catch (error) {
            console.error('Error fetching unlinked matches:', error)
        } finally {
            setLoadingUnlinked(false)
        }
    }

    const fetchMatchStats = async (matchId) => {
        try {
            const res = await axios.get(`/api/lobbies/matches/${matchId}/stats`)
            setMatchStats(res.data)
        } catch (error) {
            console.error('Error fetching match stats:', error)
        }
    }

    const handleLinkMatch = async (matchId) => {
        try {
            const token = localStorage.getItem('token')
            await axios.post(`/api/admin/lobbies/${lobbyId}/link-match`,
                { match_id: matchId },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setShowLinkModal(false)
            if (onRefresh) onRefresh()
        } catch (error) {
            alert(error.response?.data?.message || 'Ошибка при привязке матча')
        }
    }

    const handleUnlinkMatch = async (matchId, e) => {
        e.stopPropagation()
        if (!confirm('Отвязать матч?')) return
        try {
            const token = localStorage.getItem('token')
            await axios.delete(`/api/admin/lobbies/${lobbyId}/matches/${matchId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (onRefresh) onRefresh()
        } catch (error) {
            alert('Ошибка при отвязке матча')
        }
    }

    const handleMapClick = (match, hasScore) => {
        if (hasScore) {
            // Open stats modal
            setSelectedMatch(match)
            setShowStatsModal(true)
            fetchMatchStats(match.match_id)
        } else if (isAdmin) {
            // Open link modal
            setShowLinkModal(true)
            fetchUnlinkedMatches()
        }
    }

    const calculateTeamStats = (team) => {
        const totalKD = team.reduce((acc, p) => acc + parseFloat(p?.k_d || 0), 0)
        const avgKD = team.length ? (totalKD / team.length).toFixed(2) : 0
        return { avgKD }
    }

    const team1Stats = calculateTeamStats(team1)
    const team2Stats = calculateTeamStats(team2)

    // Normalize map name for better matching
    const normalizeMapName = (mapName) => {
        if (!mapName) return '';
        // Remove prefixes like 'de_', 'cs_', etc. and normalize
        return mapName.toLowerCase()
            .replace(/^(de_|cs_|ar_)/, '')
            .replace(/_/g, '')
            .replace(/\s+/g, '')
            .replace(/2$/, 'ii') // dust2 -> dustii
            .replace(/ii/, ''); // remove ii for comparison (dust ii -> dust)
    }

    // Match picked maps with actual match results
    const pickedMaps = draftState?.veto?.picked || []
    let mapsWithScores = pickedMaps.map((mapItem, index) => {
        const mapNameStr = typeof mapItem === 'string' ? mapItem : mapItem.map;
        const normalizedPickedMap = normalizeMapName(mapNameStr);
        const match = matches.find(m => {
            const normalizedDbMap = normalizeMapName(m.map_name);
            // Check if either contains the other (for partial matching)
            return normalizedDbMap.includes(normalizedPickedMap) || normalizedPickedMap.includes(normalizedDbMap);
        });
        return {
            mapName: mapNameStr,
            match: match || null,
            index: index + 1
        }
    })

    // If no picked maps but we have matches, show them anyway
    if (mapsWithScores.length === 0 && matches.length > 0) {
        mapsWithScores = matches.map((match, index) => ({
            mapName: match.map_name?.replace('de_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown',
            match: match,
            index: index + 1
        }))
    }



    // Get real team name from draftState
    const getTeamName = (dbTeamName) => {
        if (!dbTeamName) return dbTeamName;
        if (dbTeamName.toLowerCase().includes('team a')) {
            return draftState?.teams?.[1]?.name || 'Team 1';
        } else if (dbTeamName.toLowerCase().includes('team b')) {
            return draftState?.teams?.[2]?.name || 'Team 2';
        }
        return dbTeamName;
    }

    // Helper to get MVP from match stats
    const getMVP = () => {
        if (!matchStats?.playerStats) return null;
        // Find player with highest MVP count or highest score/rating
        // The backend already sorts by MVP then Kills, so usually the first one or one with MVP > 0
        // But let's look for explicit MVP > 0 or max rating
        const mvpPlayer = matchStats.playerStats.find(p => p.mvp > 0) || matchStats.playerStats[0];
        return mvpPlayer;
    }



    return (
        <div className="space-y-8">

            {/* Teams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Team 1 */}
                <div className="relative bg-black/30 border border-cs-orange/20 p-6 group hover:border-cs-orange/50 transition-all duration-300">
                    <div>
                        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                            <div>

                                <h2 className="text-3xl font-black text-white uppercase tracking-tight truncate max-w-[200px] md:max-w-xs">
                                    {draftState?.teams?.[1]?.name || 'TEAM 1'}
                                </h2>
                                <div className="text-xs text-cs-text font-mono mt-1">AVG KD: {team1Stats.avgKD}</div>
                            </div>
                            <Crown className="w-8 h-8 text-cs-orange opacity-80" />
                        </div>
                        <div className="space-y-2">
                            {team1.map(player => (
                                <div key={player?.user_id} className="flex items-center justify-between p-3 bg-black/40 border border-white/5 hover:border-cs-orange/30 transition-all group/player">
                                    <div className="flex items-center gap-3">
                                        {draftState?.captains && player?.user_id === draftState.captains[1] && <Crown className="w-3 h-3 text-cs-orange" />}
                                        <Link to={`/user/${player?.custom_url || player?.user_id}`} className="font-bold text-white uppercase hover:text-cs-orange transition-colors tracking-wide">
                                            {player?.nickname || player?.username}
                                        </Link>
                                    </div>
                                    <div className="text-xs font-mono flex gap-3">
                                        <span className={player?.k_d >= 1.2 ? 'text-green-400 font-bold' : 'text-cs-text'}>KD: {player?.k_d}</span>
                                        <span className={player?.win_rate >= 55 ? 'text-green-400 font-bold' : 'text-cs-text'}>WR: {player?.win_rate}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Team 2 */}
                <div className="relative bg-black/30 border border-cs-blue/20 p-6 group hover:border-cs-blue/50 transition-all duration-300">
                    <div>
                        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                            <div>

                                <h2 className="text-3xl font-black text-white uppercase tracking-tight truncate max-w-[200px] md:max-w-xs">
                                    {draftState?.teams?.[2]?.name || 'TEAM 2'}
                                </h2>
                                <div className="text-xs text-cs-text font-mono mt-1">AVG KD: {team2Stats.avgKD}</div>
                            </div>
                            <Crown className="w-8 h-8 text-cs-blue opacity-80" />
                        </div>
                        <div className="space-y-2">
                            {team2.map(player => (
                                <div key={player?.user_id} className="flex items-center justify-between p-3 bg-black/40 border border-white/5 hover:border-cs-blue/30 transition-all group/player">
                                    <div className="flex items-center gap-3">
                                        {draftState?.captains && player?.user_id === draftState.captains[2] && <Crown className="w-3 h-3 text-cs-blue" />}
                                        <Link to={`/user/${player?.custom_url || player?.user_id}`} className="font-bold text-white uppercase hover:text-cs-blue transition-colors tracking-wide">
                                            {player?.nickname || player?.username}
                                        </Link>
                                    </div>
                                    <div className="text-xs font-mono flex gap-3">
                                        <span className={player?.k_d >= 1.2 ? 'text-green-400 font-bold' : 'text-cs-text'}>KD: {player?.k_d}</span>
                                        <span className={player?.win_rate >= 55 ? 'text-green-400 font-bold' : 'text-cs-text'}>WR: {player?.win_rate}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Maps with Scores */}
            {mapsWithScores.length > 0 && (
                <div className="relative bg-black/30 border border-white/10 p-8">
                    <div>
                        <div className="mb-6 flex items-center gap-4">
                            <div className="inline-block bg-cs-orange text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest skew-x-[-10deg]">
                                <span className="skew-x-[10deg] block">RESULTS</span>
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">КАРТЫ МАТЧА</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {mapsWithScores.map(({ mapName, match, index }) => {
                                const mapImage = MAP_IMAGES[mapName]
                                const hasScore = match !== null

                                return (
                                    <div
                                        key={mapName}
                                        onClick={() => handleMapClick(match, hasScore)}
                                        className={`relative h-48 group border-2 transition-all duration-300 overflow-hidden ${hasScore || isAdmin
                                            ? 'cursor-pointer hover:border-cs-orange hover:shadow-[0_0_30px_rgba(233,177,14,0.2)]'
                                            : 'border-white/5'
                                            } ${hasScore ? 'border-white/20' : 'border-white/5'}`}
                                    >
                                        {/* Map Background */}
                                        <div className="absolute inset-0 bg-black scale-110 transform origin-center">
                                            {mapImage && (
                                                <img
                                                    src={mapImage}
                                                    alt={mapName}
                                                    className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-500 group-hover:scale-110"
                                                />
                                            )}
                                            {!mapImage && <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900"></div>}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                        </div>

                                        {/* Content Wrapper - Unskewed */}
                                        <div className="absolute inset-0 p-4 flex flex-col justify-between">
                                            {/* Header */}
                                            <div className="flex justify-between items-start">
                                                <div className="bg-black/60 backdrop-blur-sm border border-white/10 px-2 py-1 skew-x-[-10deg]">
                                                    <span className="text-[10px] font-black text-cs-orange uppercase tracking-widest skew-x-[10deg] block">MAP {index}</span>
                                                </div>

                                                {/* Status Badge */}
                                                {!hasScore && (
                                                    isAdmin ? (
                                                        <div className="bg-cs-orange text-black px-2 py-1 skew-x-[-10deg] flex items-center gap-1">
                                                            <Plus className="w-3 h-3 skew-x-[10deg]" />
                                                            <span className="text-[10px] font-black uppercase tracking-wider skew-x-[10deg] block">ADD</span>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-black/60 text-cs-text px-2 py-1 skew-x-[-10deg] border border-white/10">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider skew-x-[10deg] block">PENDING</span>
                                                        </div>
                                                    )
                                                )}
                                            </div>

                                            {/* Center Content: Name & Score */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter drop-shadow-lg mb-2 group-hover:scale-110 transition-transform duration-300">
                                                    {mapName}
                                                </h3>

                                                {hasScore && (
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className={`text-5xl font-black ${match.winning_team_name === 'Team A' ? 'text-cs-orange' : 'text-white'} drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]`}>
                                                            {match.team_a_score}
                                                        </span>
                                                        <span className="text-white/60 text-3xl font-bold drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">:</span>
                                                        <span className={`text-5xl font-black ${match.winning_team_name === 'Team B' ? 'text-cs-blue' : 'text-white'} drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]`}>
                                                            {match.team_b_score}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer: Winner */}
                                            {hasScore && (
                                                <div className="flex justify-end items-end w-full">
                                                    <div className="flex items-center gap-2">
                                                        <div className="bg-black/80 border border-cs-orange/30 px-3 py-1.5 skew-x-[-10deg] flex items-center gap-2">
                                                            <Trophy className="w-3 h-3 text-cs-orange skew-x-[10deg]" />
                                                            <span className="text-xs font-black text-cs-orange uppercase tracking-wider skew-x-[10deg] block">
                                                                {getTeamName(match.winning_team_name)}
                                                            </span>
                                                        </div>
                                                        {isAdmin && (
                                                            <button
                                                                onClick={(e) => handleUnlinkMatch(match.match_id, e)}
                                                                className="bg-red-500/80 hover:bg-red-500 p-1.5 skew-x-[-10deg] transition-colors pointer-events-auto"
                                                            >
                                                                <X className="w-3 h-3 text-white skew-x-[10deg]" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Match Stats Modal */}
            <AnimatePresence>
                {showStatsModal && selectedMatch && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                            onClick={() => { setShowStatsModal(false); setMatchStats(null) }}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-[#0f1012] border border-white/10 w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col rounded-xl"
                        >
                            {/* Modal Background Image */}
                            <div className="absolute inset-0 pointer-events-none opacity-20">
                                <img
                                    src={MAP_IMAGES[selectedMatch.map_name?.replace('de_', '')] || MAP_IMAGES['Mirage']}
                                    className="w-full h-full object-cover blur-sm"
                                    alt="background"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-[#0f1012]/80 via-[#0f1012]/95 to-[#0f1012]"></div>
                            </div>

                            {/* Header */}
                            <div className="relative z-10 p-4 pb-0 flex justify-between items-start shrink-0">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="bg-cs-orange text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-widest skew-x-[-10deg]">
                                            <span className="skew-x-[10deg]">MATCH #{selectedMatch.match_id}</span>
                                        </div>
                                        <div className="text-white/50 text-[10px] font-bold uppercase tracking-wider font-mono">
                                            {new Date(selectedMatch.game_date).toLocaleDateString()} • {new Date(selectedMatch.game_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic drop-shadow-lg">
                                        {selectedMatch.map_name?.replace('de_', '')}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setShowStatsModal(false); setMatchStats(null) }}
                                        className="group bg-white/5 hover:bg-white/10 border border-white/10 p-1.5 transition-all duration-300 rounded"
                                    >
                                        <X className="w-5 h-5 text-white/70 group-hover:text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="relative z-10 overflow-y-auto p-4 custom-scrollbar flex-1">
                                {/* Scoreboard */}
                                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-6 py-2 relative">
                                    {/* Team A */}
                                    <div className={`relative flex flex-col items-center md:items-end gap-1 w-full md:w-1/3 order-2 md:order-1 ${selectedMatch.winning_team_name === 'Team A' ? '' : 'opacity-60 grayscale-[0.5]'}`}>
                                        {selectedMatch.winning_team_name === 'Team A' && (
                                            <div className="absolute -top-5 md:-top-6 right-1/2 md:right-0 translate-x-1/2 md:translate-x-0 flex items-center gap-1.5 text-cs-orange text-[10px] font-bold uppercase tracking-widest bg-cs-orange/10 px-2 py-0.5 rounded whitespace-nowrap">
                                                <Trophy className="w-3 h-3" /> Winner
                                            </div>
                                        )}
                                        <div className={`text-xl md:text-2xl font-black uppercase tracking-tight text-center md:text-right ${selectedMatch.winning_team_name === 'Team A' ? 'text-cs-orange' : 'text-white'}`}>
                                            {getTeamName('Team A')}
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div className="flex items-center gap-4 md:gap-6 relative z-10 bg-black/40 px-5 py-1.5 rounded-xl border border-white/5 backdrop-blur-sm order-1 md:order-2">
                                        <div className={`text-4xl md:text-6xl font-black tracking-tighter leading-none ${selectedMatch.winning_team_name === 'Team A' ? 'text-cs-orange drop-shadow-[0_0_20px_rgba(233,177,14,0.3)]' : 'text-white'}`}>
                                            {selectedMatch.team_a_score}
                                        </div>
                                        <div className="h-8 md:h-12 w-px bg-white/10 skew-x-[-15deg]"></div>
                                        <div className={`text-4xl md:text-6xl font-black tracking-tighter leading-none ${selectedMatch.winning_team_name === 'Team B' ? 'text-cs-blue drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'text-white'}`}>
                                            {selectedMatch.team_b_score}
                                        </div>
                                    </div>

                                    {/* Team B */}
                                    <div className={`relative flex flex-col items-center md:items-start gap-1 w-full md:w-1/3 order-3 ${selectedMatch.winning_team_name === 'Team B' ? '' : 'opacity-60 grayscale-[0.5]'}`}>
                                        {selectedMatch.winning_team_name === 'Team B' && (
                                            <div className="absolute -top-5 md:-top-6 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 flex items-center gap-1.5 text-cs-blue text-[10px] font-bold uppercase tracking-widest bg-cs-blue/10 px-2 py-0.5 rounded whitespace-nowrap">
                                                <Trophy className="w-3 h-3" /> Winner
                                            </div>
                                        )}
                                        <div className={`text-xl md:text-2xl font-black uppercase tracking-tight text-center md:text-left ${selectedMatch.winning_team_name === 'Team B' ? 'text-cs-blue' : 'text-white'}`}>
                                            {getTeamName('Team B')}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Tables */}
                                <div>
                                    {!matchStats ? (
                                        <div className="flex justify-center py-20">
                                            <Loader2 className="w-12 h-12 animate-spin text-cs-orange" />
                                        </div>
                                    ) : !matchStats.playerStats || matchStats.playerStats.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-white/30 border border-white/5 bg-white/5 rounded-xl">
                                            <p className="font-bold text-xl mb-2 uppercase tracking-wider">Нет данных</p>
                                            <p className="text-sm">Статистика для этого матча недоступна</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-8">
                                            {['Team A', 'Team B'].map(team => {
                                                const teamPlayers = matchStats.playerStats.filter(p => p.team_name === team);
                                                const isWinner = team === selectedMatch.winning_team_name;
                                                const teamColor = team === 'Team A' ? 'text-cs-orange' : 'text-cs-blue';
                                                const borderColor = team === 'Team A' ? 'border-cs-orange' : 'border-cs-blue';

                                                // Sort players: MVP first, then by Kills
                                                teamPlayers.sort((a, b) => {
                                                    if (a.mvp > 0 && b.mvp === 0) return -1;
                                                    if (b.mvp > 0 && a.mvp === 0) return 1;
                                                    return b.kills - a.kills;
                                                });

                                                return (
                                                    <div key={team} className="relative">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h3 className={`text-xl font-black uppercase tracking-wider flex items-center gap-3 ${isWinner ? teamColor : 'text-white/70'}`}>
                                                                {isWinner && <Trophy className="w-5 h-5" />}
                                                                {getTeamName(team)}
                                                            </h3>
                                                            <div className={`h-0.5 flex-1 ml-6 bg-gradient-to-r ${team === 'Team A' ? 'from-cs-orange/50 to-transparent' : 'from-cs-blue/50 to-transparent'}`}></div>
                                                        </div>

                                                        <div className="overflow-x-auto rounded-lg border border-white/5 bg-[#151719]">
                                                            <table className="w-full text-left text-sm">
                                                                <thead>
                                                                    <tr className="bg-white/5 text-white/40 font-bold uppercase tracking-wider text-[10px] border-b border-white/5">
                                                                        <th className="py-2 pl-4">Игрок</th>
                                                                        <th className="py-2 text-center w-10">K</th>
                                                                        <th className="py-2 text-center w-10">D</th>
                                                                        <th className="py-2 text-center w-10">A</th>
                                                                        <th className="py-2 text-center w-14">KD</th>
                                                                        <th className="py-2 text-center w-14">ADR</th>
                                                                        <th className="py-2 text-center w-14">HS%</th>
                                                                        <th className="py-2 text-center w-10 text-cs-orange">5K</th>
                                                                        <th className="py-2 text-center w-10 text-purple-400">4K</th>
                                                                        <th className="py-2 text-center w-10 text-blue-400">3K</th>
                                                                        <th className="py-2 text-center w-10 text-yellow-400">MVP</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-white/5">
                                                                    {teamPlayers.length > 0 ? (
                                                                        teamPlayers.map((p, i) => (
                                                                            <tr key={i} className="hover:bg-white/5 transition-colors group">
                                                                                <td className="py-1.5 pl-4">
                                                                                    <div className="flex items-center gap-2">
                                                                                        {/* Avatar Placeholder */}
                                                                                        <div className={`w-6 h-6 rounded bg-gradient-to-br ${team === 'Team A' ? 'from-cs-orange/20 to-cs-orange/5' : 'from-cs-blue/20 to-cs-blue/5'} flex items-center justify-center text-[9px] font-bold text-white/50 border border-white/10`}>
                                                                                            {p.player_name?.substring(0, 2).toUpperCase()}
                                                                                        </div>
                                                                                        <span className={`font-bold truncate max-w-[120px] text-xs ${p.mvp > 0 ? 'text-yellow-400' : 'text-white group-hover:text-white'}`}>
                                                                                            {p.player_name || 'Unknown'}
                                                                                        </span>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="py-1.5 text-center font-bold text-white text-xs">{p.kills}</td>
                                                                                <td className="py-1.5 text-center font-medium text-white/50 text-xs">{p.deaths}</td>
                                                                                <td className="py-1.5 text-center font-medium text-white/50 text-xs">{p.assists}</td>
                                                                                <td className="py-1.5 text-center">
                                                                                    <span className={`px-1 py-0.5 rounded text-[10px] font-bold ${(p.kills / (p.deaths || 1)) >= 1.5 ? 'bg-green-500/20 text-green-400' :
                                                                                        (p.kills / (p.deaths || 1)) >= 1 ? 'text-green-400' :
                                                                                            'text-white/40'
                                                                                        }`}>
                                                                                        {p.deaths > 0 ? (p.kills / p.deaths).toFixed(2) : p.kills}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="py-1.5 text-center font-medium text-white/70 text-xs">{Math.round(p.adr)}</td>
                                                                                <td className="py-1.5 text-center font-medium text-white/50 text-xs">{Math.round(p.hs_percent)}%</td>
                                                                                <td className="py-1.5 text-center font-bold text-cs-orange text-xs">{p['5k'] > 0 ? p['5k'] : '-'}</td>
                                                                                <td className="py-1.5 text-center font-bold text-purple-400 text-xs">{p['4k'] > 0 ? p['4k'] : '-'}</td>
                                                                                <td className="py-1.5 text-center font-bold text-blue-400 text-xs">{p['3k'] > 0 ? p['3k'] : '-'}</td>
                                                                                <td className="py-1.5 text-center font-bold text-yellow-400 text-xs">
                                                                                    {p.mvp > 0 && (
                                                                                        <div className="flex items-center justify-center gap-1">
                                                                                            <Crown className="w-2.5 h-2.5" /> {p.mvp}
                                                                                        </div>
                                                                                    )}
                                                                                    {p.mvp === 0 && '-'}
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan="11" className="py-8 text-center text-white/20 italic">
                                                                                Нет игроков в этой команде
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Poster Generation Modal */}
            <AnimatePresence>
                {showPosterModal && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                            onClick={() => setShowPosterModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative z-10 flex flex-col items-center gap-4"
                        >
                            {/* Poster Container */}
                            <div className="w-[1000px] h-[562px] bg-[#0f1012] relative overflow-hidden shadow-2xl border border-white/10 flex flex-col group select-none">
                                {/* Background */}
                                <div className="absolute inset-0">
                                    {lobby?.image_url ? (
                                        <>
                                            <img
                                                src={lobby.image_url}
                                                className="w-full h-full object-cover opacity-40"
                                                alt="background"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                                            <div className="absolute inset-0 bg-gradient-to-br from-cs-dark via-[#1a1c20] to-black"></div>
                                            {/* Abstract shapes */}
                                            <div className="absolute -top-20 -right-20 w-96 h-96 bg-cs-orange/10 rounded-full blur-3xl"></div>
                                            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-cs-blue/10 rounded-full blur-3xl"></div>
                                        </>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="relative z-10 flex-1 flex flex-col justify-between p-8">
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <div className="text-white font-black text-3xl uppercase tracking-tighter drop-shadow-lg">
                                                {lobby?.name || 'LOBBY MATCH'}
                                            </div>
                                            <div className="text-white/60 text-sm font-bold uppercase tracking-widest mt-1">
                                                LOBBY RESULT
                                            </div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded">
                                            <span className="text-white font-mono font-bold text-sm">
                                                {new Date().toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Center Score */}
                                    <div className="flex items-center justify-center gap-12">
                                        {/* Team A */}
                                        <div className={`flex flex-col items-end ${overallWinner?.teamName === getTeamName('Team A') ? 'scale-110' : 'opacity-80'} transition-all`}>
                                            <div className={`text-3xl font-black uppercase tracking-tight ${overallWinner?.teamName === getTeamName('Team A') ? 'text-cs-orange' : 'text-white'}`}>
                                                {getTeamName('Team A')}
                                            </div>
                                            {overallWinner?.teamName === getTeamName('Team A') && (
                                                <div className="text-[10px] font-bold text-black bg-cs-orange px-2 py-0.5 uppercase tracking-widest mt-1">Winner</div>
                                            )}
                                        </div>

                                        {/* Score Numbers */}
                                        <div className="flex items-center gap-6 bg-black/40 backdrop-blur-md px-8 py-4 rounded-xl border border-white/10">
                                            <span className={`text-8xl font-black ${overallWinner?.teamName === getTeamName('Team A') ? 'text-cs-orange' : 'text-white'} drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]`}>
                                                {overallWinner ? overallWinner.score.split(':')[0] : '0'}
                                            </span>
                                            <span className="text-white/20 text-6xl font-thin">:</span>
                                            <span className={`text-8xl font-black ${overallWinner?.teamName === getTeamName('Team B') ? 'text-cs-blue' : 'text-white'} drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]`}>
                                                {overallWinner ? overallWinner.score.split(':')[1] : '0'}
                                            </span>
                                        </div>

                                        {/* Team B */}
                                        <div className={`flex flex-col items-start ${overallWinner?.teamName === getTeamName('Team B') ? 'scale-110' : 'opacity-80'} transition-all`}>
                                            <div className={`text-3xl font-black uppercase tracking-tight ${overallWinner?.teamName === getTeamName('Team B') ? 'text-cs-blue' : 'text-white'}`}>
                                                {getTeamName('Team B')}
                                            </div>
                                            {overallWinner?.teamName === getTeamName('Team B') && (
                                                <div className="text-[10px] font-bold text-black bg-cs-blue px-2 py-0.5 uppercase tracking-widest mt-1">Winner</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer: Maps Played */}
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-2">
                                            {mapsWithScores.filter(m => m.match).map((m, idx) => (
                                                <div key={idx} className="flex flex-col items-center bg-black/40 border border-white/10 px-4 py-2 rounded">
                                                    <span className="text-[10px] text-white/50 uppercase font-bold mb-1">{m.mapName}</span>
                                                    <div className="flex items-center gap-2 text-lg">
                                                        <span className={`font-black ${m.match.winning_team_name === 'Team A' ? 'text-cs-orange' : 'text-white'}`}>
                                                            {m.match.team_a_score}
                                                        </span>
                                                        <span className="text-white/30 font-thin">:</span>
                                                        <span className={`font-black ${m.match.winning_team_name === 'Team B' ? 'text-cs-blue' : 'text-white'}`}>
                                                            {m.match.team_b_score}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="text-right">
                                            <div className="text-white/30 text-[10px] uppercase tracking-widest font-bold">Powered by</div>
                                            <div className="text-white font-black text-lg tracking-tighter"><span className="text-cs-orange">CS2 Tournaments</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowPosterModal(false)}
                                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded transition-colors"
                                >
                                    Закрыть
                                </button>
                                <div className="text-white/50 text-sm flex items-center">
                                    <Camera className="w-4 h-4 mr-2" />
                                    Сделайте скриншот (Win+Shift+S)
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Link Match Modal */}
            <AnimatePresence>
                {showLinkModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLinkModal(false)} />
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="relative bg-cs-dark border border-white/20 p-6 max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Привязать Матч</h2>
                                    <p className="text-sm text-cs-text">Выберите матч из загруженных парсером</p>
                                </div>
                                <button onClick={() => setShowLinkModal(false)} className="text-cs-text hover:text-white p-2 hover:bg-white/10 rounded transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {loadingUnlinked ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="w-10 h-10 animate-spin text-cs-orange" />
                                </div>
                            ) : (
                                <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
                                    {unlinkedMatches.length === 0 ? (
                                        <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-xl">
                                            <p className="font-bold text-white text-lg mb-2">Нет непривязанных матчей</p>
                                            <p className="text-cs-text text-sm">Загрузите демо-файл через парсер, чтобы он появился здесь.</p>
                                        </div>
                                    ) : (
                                        unlinkedMatches.map((m) => (
                                            <div
                                                key={m.match_id}
                                                onClick={() => handleLinkMatch(m.match_id)}
                                                className="group relative overflow-hidden border border-white/10 hover:border-cs-orange transition-all cursor-pointer bg-black/40"
                                            >
                                                {/* Map Background */}
                                                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                                                    <img
                                                        src={MAP_IMAGES[m.map_name?.replace('de_', '')] || MAP_IMAGES['Mirage']}
                                                        alt={m.map_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
                                                </div>

                                                <div className="relative z-10 p-4">
                                                    <div className="flex flex-col md:flex-row items-center gap-6 mb-4">
                                                        {/* Map & Date */}
                                                        <div className="w-full md:w-32 flex-shrink-0 text-center md:text-left">
                                                            <div className="text-cs-orange font-black uppercase text-lg tracking-wider">
                                                                {m.map_name?.replace('de_', '')}
                                                            </div>
                                                            <div className="text-xs text-gray-400 font-mono mt-1">
                                                                {new Date(m.game_date).toLocaleDateString()}
                                                            </div>
                                                            <div className="text-xs text-gray-500 font-mono">
                                                                {new Date(m.game_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>

                                                        {/* Score */}
                                                        <div className="flex items-center gap-6 flex-1 justify-center">
                                                            <div className={`text-2xl font-black ${m.winning_team_name?.includes('Team A') ? 'text-green-500' : 'text-white'}`}>
                                                                {m.team_a_score}
                                                            </div>
                                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">VS</div>
                                                            <div className={`text-2xl font-black ${m.winning_team_name?.includes('Team B') ? 'text-green-500' : 'text-white'}`}>
                                                                {m.team_b_score}
                                                            </div>
                                                        </div>

                                                        {/* Match Quality Info */}
                                                        <div className="w-full md:w-48 flex flex-col items-end gap-2">
                                                            <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded border border-white/10">
                                                                <Users className={`w-4 h-4 ${m.match_percentage > 80 ? 'text-green-500' : 'text-yellow-500'}`} />
                                                                <div className="text-xs font-bold text-white">
                                                                    <span className={m.match_percentage > 80 ? 'text-green-500' : 'text-yellow-500'}>
                                                                        {m.matching_players}
                                                                    </span>
                                                                    <span className="text-gray-500 mx-1">/</span>
                                                                    <span className="text-gray-400">10 игроков</span>
                                                                </div>
                                                            </div>
                                                            {m.match_percentage > 90 && (
                                                                <div className="text-[10px] font-bold text-green-500 uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded">
                                                                    Рекомендуемый
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Players List */}
                                                    {m.players && m.players.length > 0 && (
                                                        <div className="border-t border-white/5 pt-3">
                                                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                                                {m.players.slice(0, 10).map((player, idx) => {
                                                                    const isMatch = [
                                                                        ...(team1 || []).map(p => p.steam_id),
                                                                        ...(team2 || []).map(p => p.steam_id)
                                                                    ].includes(player.steam_id);

                                                                    return (
                                                                        <span
                                                                            key={idx}
                                                                            className={`text-[10px] px-2 py-1 rounded border transition-colors ${isMatch
                                                                                ? 'text-green-400 font-bold border-green-500/30 bg-green-500/10 shadow-[0_0_5px_rgba(74,222,128,0.2)]'
                                                                                : 'text-gray-500 bg-black/30 border-white/5'
                                                                                }`}
                                                                        >
                                                                            {player.name || 'Unknown'}
                                                                        </span>
                                                                    );
                                                                })}
                                                                {m.players.length > 10 && (
                                                                    <span className="text-[10px] text-gray-500 px-1 py-1">
                                                                        +{m.players.length - 10}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default LobbyMatchView
