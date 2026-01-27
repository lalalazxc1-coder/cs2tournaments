import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, NavLink, Outlet } from 'react-router-dom'
import { tournamentAPI, teamAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'
import usePageTitle from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'

import TournamentHeader from '../components/tournaments/TournamentHeader'
import TournamentEditModal from '../components/tournaments/TournamentEditModal'
import TeamSearchModal from '../components/tournaments/TeamSearchModal'

const TournamentPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { user, isAuthenticated } = useAuth()
    const [tournament, setTournament] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [myTeams, setMyTeams] = useState([])
    const [selectedTeam, setSelectedTeam] = useState('')
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    const [isBracketFullScreen, setIsBracketFullScreen] = useState(false)

    usePageTitle(tournament?.name ? `Турнир: ${tournament.name}` : 'Турнир')

    useEffect(() => {
        loadTournament()
        if (user) loadMyTeams()
    }, [id, user])

    const loadTournament = async () => {
        try {
            setLoading(true)
            const response = await tournamentAPI.getTournament(id)
            setTournament(response.data)
        } catch (err) {
            setError('Failed to load tournament')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const loadMyTeams = async () => {
        try {
            const response = await teamAPI.getTeams({ captain_id: user.id, limit: 100 })
            const captainTeams = response.data.teams || []
            setMyTeams(captainTeams)
            if (captainTeams.length > 0) setSelectedTeam(captainTeams[0].id)
        } catch (err) {
            console.error(err)
        }
    }

    const handleRegister = async () => {
        if (!selectedTeam) return alert('Выберите команду')
        const teamToRegister = myTeams.find(t => t.id == selectedTeam)
        if (!teamToRegister) return alert('Команда не найдена')
        const memberCount = teamToRegister.members?.filter(m => !m.status || m.status === 'member').length || 0
        if (memberCount < 5) return alert('В команде должно быть минимум 5 участников для регистрации в турнире')

        try {
            await tournamentAPI.registerTeam(id, selectedTeam)
            loadTournament()
        } catch (err) {
            alert(err.response?.data?.message || err.message)
        }
    }

    const handleLeave = async () => {
        if (!confirm('Вы уверены, что хотите снять команду с турнира?')) return
        try {
            await tournamentAPI.leaveTournament(id)
            loadTournament()
        } catch (err) {
            alert(err.response?.data?.message || err.message)
        }
    }

    const handleStart = async () => {
        if (!confirm('Начать турнир? Будет сгенерирована сетка.')) return
        try {
            await tournamentAPI.startTournament(id)
            loadTournament()
        } catch (err) {
            alert(err.response?.data?.message || err.message)
        }
    }

    const handleUpdateMatch = async (matchId, winnerId) => {
        try {
            await tournamentAPI.updateMatch(id, matchId, winnerId)
            loadTournament()
        } catch (err) {
            alert(err.response?.data?.message || err.message)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Вы уверены, что хотите удалить этот турнир? Это действие необратимо.')) return
        try {
            await tournamentAPI.deleteTournament(id)
            navigate('/tournaments')
        } catch (err) {
            alert(err.response?.data?.message || err.message)
        }
    }

    const handleInviteTeam = async (teamId) => {
        try {
            await tournamentAPI.inviteTeam(id, teamId)
            alert('Приглашение отправлено')
            setIsInviteModalOpen(false)
        } catch (err) {
            alert(err.response?.data?.message || err.message)
        }
    }

    if (loading) return <div className="min-h-screen bg-cs-dark flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-cs-orange" /></div>
    if (error) return <div className="min-h-screen bg-cs-dark flex items-center justify-center text-red-500 font-bold uppercase tracking-wider">{error}</div>
    if (!tournament) return <div className="min-h-screen bg-cs-dark flex items-center justify-center text-white font-bold uppercase tracking-wider">Турнир не найден</div>

    const isOrganizer = user?.id === tournament.creator_id || user?.role === 'admin' || user?.role === 2
    const isRegistered = tournament.teams?.some(tt => tt.team?.captain_id == user?.id)

    // Helper to generate placeholder bracket
    const getBracketData = () => {
        if (tournament.brackets && tournament.brackets.length > 0) return tournament.brackets;

        // Generate placeholder if no brackets exist
        const maxTeams = tournament.max_teams || 8;
        const format = tournament.format || 'single_elimination';
        const placeholders = [];

        // Simple Single Elimination Placeholder
        const totalRounds = Math.ceil(Math.log2(maxTeams));
        let matchIdCounter = 1;

        for (let r = 1; r <= totalRounds; r++) {
            const matchesInRound = Math.pow(2, totalRounds - r);
            for (let m = 1; m <= matchesInRound; m++) {
                placeholders.push({
                    id: `preview-${r}-${m}`,
                    match_id: `preview-${r}-${m}`,
                    round: r,
                    match_number: m,
                    group: r === totalRounds ? 'final' : 'upper',
                    team1: null,
                    team2: null,
                    status: 'scheduled',
                    match_type: 'bo1' // Default visualization
                });
                matchIdCounter++;
            }
        }


        if (format === 'double_elimination') {
            const lowerRounds = totalRounds - 1;
            for (let r = 1; r <= lowerRounds; r++) {
                const matchesInRound = Math.max(1, Math.pow(2, totalRounds - 1 - r));

                for (let m = 1; m <= matchesInRound; m++) {
                    placeholders.push({
                        id: `preview-lower-${r}-${m}`,
                        match_id: `preview-lower-${r}-${m}`,
                        round: r,
                        match_number: m,
                        group: 'lower',
                        team1: null,
                        team2: null,
                        status: 'scheduled',
                        match_type: 'bo1'
                    });
                }
            }
        }
        return placeholders;
    };

    // Helper to calculate standings for completed tournaments
    const getStandings = () => {
        if (tournament.status !== 'completed' || !tournament.brackets) return {};

        const standings = {};
        const finalMatch = tournament.brackets.find(m => m.group === 'final' || m.round === Math.max(...tournament.brackets.map(b => b.round)));

        if (finalMatch && finalMatch.winner_id) {
            // 1st Place
            const winnerId = finalMatch.winner_id;
            const winnerTeam = winnerId === finalMatch.team1_id ? finalMatch.team1 : finalMatch.team2;
            standings['1st'] = winnerTeam;

            // 2nd Place
            const loserId = winnerId === finalMatch.team1_id ? finalMatch.team2_id : finalMatch.team1_id;
            const loserTeam = winnerId === finalMatch.team1_id ? finalMatch.team2 : finalMatch.team1;
            standings['2nd'] = loserTeam;
        }

        // 3rd/4th Place (Semi-final losers)
        // This is a simplification for Single Elimination
        const semiFinalRound = Math.max(...tournament.brackets.map(b => b.round)) - 1;
        if (semiFinalRound > 0) {
            const semiFinals = tournament.brackets.filter(m => m.round === semiFinalRound);
            const losers = [];
            semiFinals.forEach(match => {
                if (match.winner_id) {
                    const loserId = match.winner_id === match.team1_id ? match.team2_id : match.team1_id;
                    const loserTeam = match.winner_id === match.team1_id ? match.team2 : match.team1;
                    if (loserTeam) losers.push(loserTeam);
                }
            });
            if (losers.length > 0) {
                standings['3rd'] = losers[0]; // Shared 3rd/4th usually, but just assigning for list
                if (losers.length > 1) standings['4th'] = losers[1];
            }
        }

        return standings;
    };

    const bracketData = getBracketData();
    const standings = getStandings();

    return (
        <div className="min-h-screen bg-cs-dark text-white pt-10 px-4 relative overflow-hidden font-sans">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cs-grid-bg opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-cs-dark/80 via-cs-dark/90 to-cs-dark"></div>
            </div>

            <div className={`max-w-7xl mx-auto relative z-10 py-12 ${isBracketFullScreen ? 'max-w-full px-4' : ''}`}>
                <Breadcrumbs lastBreadcrumbLabel={tournament.name} />

                {!isBracketFullScreen && (
                    <TournamentHeader
                        tournament={tournament}
                        isOrganizer={isOrganizer}
                        isAuthenticated={isAuthenticated}
                        isRegistered={isRegistered}
                        myTeams={myTeams}
                        selectedTeam={selectedTeam}
                        setSelectedTeam={setSelectedTeam}
                        onRegister={handleRegister}
                        onLeave={handleLeave}
                        onStart={handleStart}
                        onEdit={() => setIsEditModalOpen(true)}
                        onInvite={() => setIsInviteModalOpen(true)}
                        onDelete={handleDelete}
                    />
                )}

                {/* Tabs Navigation */}
                <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-1">
                    {[
                        { id: 'info', label: 'Информация' },
                        { id: 'rules', label: 'Правила' },
                        { id: 'maps', label: 'Пул Карт' },
                        { id: 'teams', label: 'Команды' },
                        { id: 'bracket', label: 'Сетка' },
                        { id: 'matches', label: 'Матчи' },
                        { id: 'prize', label: 'Призовые' }
                    ].map(tab => (
                        <NavLink
                            key={tab.id}
                            to={tab.id}
                            className={({ isActive }) => `px-6 py-3 font-black uppercase tracking-wider text-sm skew-x-[-10deg] transition-all relative overflow-hidden ${isActive
                                ? 'bg-cs-orange text-black shadow-[0_0_20px_rgba(233,177,14,0.4)]'
                                : 'bg-black/40 text-cs-text hover:text-white hover:bg-white/5 border border-white/5'
                                }`}
                        >
                            <span className="skew-x-[10deg] block">
                                {tab.label}
                            </span>
                        </NavLink>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    <Outlet context={{
                        tournament,
                        isOrganizer,
                        isAuthenticated,
                        isRegistered,
                        myTeams,
                        selectedTeam,
                        setSelectedTeam,
                        bracketData,
                        standings,
                        handleUpdateMatch
                    }} />
                </div>
            </div>

            <TournamentEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                tournament={tournament}
                onSave={loadTournament}
            />

            <TeamSearchModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={handleInviteTeam}
            />
        </div >
    )
}

export default TournamentPage
