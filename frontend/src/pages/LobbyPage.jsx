import axios from 'axios'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { lobbyAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'
import socketService from '../utils/socket'
import LobbyDraft from '../components/LobbyDraft'
import LobbyMatchView from '../components/LobbyMatchView'
import LobbyParticipants from '../components/LobbyParticipants'
import PlayerSearchModal from '../components/teams/PlayerSearchModal'
import usePageTitle from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'
import LobbyHeader from '../components/lobby/LobbyHeader'
import LobbyEditModal from '../components/lobby/LobbyEditModal'
import LobbyStartModal from '../components/lobby/LobbyStartModal'
import PasswordModal from '../components/lobby/PasswordModal'

const LobbyPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [lobby, setLobby] = useState(null)
    const [participants, setParticipants] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [draftState, setDraftState] = useState(null)
    const [selectedCaptains, setSelectedCaptains] = useState([])
    const [showStartModal, setShowStartModal] = useState(false)
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    const [teamNameInput, setTeamNameInput] = useState('')
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editFormData, setEditFormData] = useState({ name: '', date_time: '', map_pool: [] })
    const [matches, setMatches] = useState([])
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

    const [isPosterModalOpen, setIsPosterModalOpen] = useState(false)

    usePageTitle(lobby?.name ? `Лобби: ${lobby.name}` : 'Лобби')

    useEffect(() => {
        fetchLobby()
        socketService.connect();
        socketService.joinTournament(id);
        const handleUpdate = (data) => {
            console.log('Socket: tournament update received', data);
            fetchLobby(false);
        };
        const handleDraft = (ds) => {
            console.log('Socket: draft update received', ds);
            try {
                const state = typeof ds === 'string' ? JSON.parse(ds) : ds;
                setDraftState(state);
            } catch (e) {
                console.error('Error parsing draft state from socket:', e);
            }
        };
        const handleMatchUpdate = () => {
            if (lobby?.status === 'in_progress' || lobby?.status === 'finished' || lobby?.status === 'completed') {
                fetchMatches()
            }
        }

        socketService.on('tournament:update', handleUpdate);
        socketService.on('draft:update', handleDraft);
        socketService.on('match_updated', handleMatchUpdate);

        return () => {
            socketService.off('tournament:update', handleUpdate);
            socketService.off('draft:update', handleDraft);
            socketService.off('match_updated', handleMatchUpdate);
            socketService.leaveTournament(id);
        };
    }, [id, lobby?.status]);

    useEffect(() => {
        if (lobby?.status === 'in_progress' || lobby?.status === 'finished' || lobby?.status === 'completed') {
            fetchMatches()
        }
    }, [lobby?.status])

    const fetchLobby = async (showLoading = true) => {
        if (showLoading) setLoading(true)
        try {
            const res = await lobbyAPI.getLobby(id)
            setLobby(res.data.lobby)
            setParticipants(res.data.participants)

            let draftStateData = res.data.lobby.draft_state;
            if (draftStateData) {
                try {
                    const state = typeof draftStateData === 'string' ? JSON.parse(draftStateData) : draftStateData;
                    setDraftState(state);
                } catch (e) {
                    console.error('Error parsing draft_state:', e);
                    setDraftState(null);
                }
            }

            let parsedMapPool = [];
            try {
                parsedMapPool = res.data.lobby.map_pool ? JSON.parse(res.data.lobby.map_pool) : [];
            } catch (e) {
                console.error('Error parsing map_pool:', e);
                parsedMapPool = [];
            }

            setEditFormData({
                name: res.data.lobby.name,
                description: res.data.lobby.description,
                date_time: res.data.lobby.date_time,
                map_pool: parsedMapPool,
                format: res.data.lobby.format || 'BO3'
            })
        } catch (err) { setError('Failed to load lobby'); console.error(err) } finally { if (showLoading) setLoading(false) }
    }

    const fetchMatches = async () => {
        try {
            const res = await axios.get(`/api/lobbies/${id}/matches`)
            setMatches(res.data.matches || [])
        } catch (error) {
            console.error('Error fetching matches:', error)
        }
    }

    const getTeamName = (teamKey) => {
        if (!draftState?.teams) return teamKey
        if (teamKey === 'Team A') return draftState.teams[1]?.name || 'Team 1'
        if (teamKey === 'Team B') return draftState.teams[2]?.name || 'Team 2'
        return teamKey
    }

    const calculateOverallWinner = () => {
        if (!matches || matches.length === 0) return null
        let teamAWins = 0
        let teamBWins = 0
        matches.forEach(m => {
            if (m.winning_team_name === 'Team A') teamAWins++
            if (m.winning_team_name === 'Team B') teamBWins++
        })
        if (lobby?.status === 'finished' || lobby?.status === 'completed') {
            if (teamAWins > teamBWins) return { teamName: getTeamName('Team A'), score: `${teamAWins}:${teamBWins}` }
            if (teamBWins > teamAWins) return { teamName: getTeamName('Team B'), score: `${teamBWins}:${teamAWins}` }
        }
        return null
    }

    const handleSaveLobby = async () => {
        try {
            await lobbyAPI.updateLobby(id, editFormData)
            setIsEditModalOpen(false)
            fetchLobby()
        } catch (err) { alert(err.response?.data?.message || err.message) }
    }

    const handleJoin = async () => {
        if (!user) return alert('Войдите в систему')

        if (lobby.password) {
            setIsPasswordModalOpen(true);
        } else {
            handlePasswordSubmit(null);
        }
    }

    const handlePasswordSubmit = async (password) => {
        try {
            await lobbyAPI.joinLobby(id, password);
            setIsPasswordModalOpen(false);
            fetchLobby();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    }

    const handleLeave = async () => {
        if (!confirm('Покинуть лобби?')) return
        try { await lobbyAPI.leaveLobby(id); fetchLobby() } catch (err) { alert(err.response?.data?.message || err.message) }
    }

    const handleKick = async (userId) => {
        if (!confirm('Исключить игрока?')) return
        try { await lobbyAPI.kickUser(id, userId); fetchLobby() } catch (err) { alert(err.message) }
    }

    const handleCancel = async () => {
        if (!confirm('Отменить лобби?')) return
        try { await lobbyAPI.cancelLobby(id); navigate('/lobbies') } catch (err) { alert(err.message) }
    }

    const handleReset = async () => {
        if (!confirm('Сбросить лобби? Все текущие настройки драфта будут потеряны.')) return
        try { await lobbyAPI.resetLobby(id); fetchLobby() } catch (err) { alert(err.response?.data?.message || err.message) }
    }

    const handleStartAuto = async () => {
        try {
            await lobbyAPI.startAuto(id);
            setShowStartModal(false);
            fetchLobby()
        } catch (err) { alert(err.response?.data?.message || err.message) }
    }

    const handleStartDraft = async () => {
        try { await lobbyAPI.startDraft(id); setShowStartModal(false); fetchLobby() } catch (err) { alert(err.response?.data?.message || err.message) }
    }

    const handleSetCaptains = async () => {
        if (selectedCaptains.length !== 2) return alert('Выберите двух капитанов')
        try { await lobbyAPI.setCaptains(id, selectedCaptains[0], selectedCaptains[1]); fetchLobby() } catch (err) { alert(err.message) }
    }

    const handleSetTeamName = async () => {
        if (!teamNameInput.trim()) return
        try { await lobbyAPI.setTeamName(id, teamNameInput); setTeamNameInput(''); fetchLobby() } catch (err) { alert(err.message) }
    }

    const handleDraftPick = async (userId) => {
        try { await lobbyAPI.draftPick(id, userId); fetchLobby() } catch (err) { alert(err.message) }
    }

    const handleVetoMap = async (mapName) => {
        try {
            // Don't send action, let backend decide based on current state to avoid sync issues
            await lobbyAPI.vetoMap(id, mapName, null);
            fetchLobby()
        } catch (err) { alert(err.message) }
    }

    const handleInvite = async (userId) => {
        try {
            await lobbyAPI.invite(id, userId);
            setIsInviteModalOpen(false);
            alert('Приглашение отправлено')
        } catch (err) { alert(err.response?.data?.message || err.message) }
    }

    const toggleCaptainSelection = (userId) => {
        if (selectedCaptains.includes(userId)) setSelectedCaptains(prev => prev.filter(id => id !== userId))
        else if (selectedCaptains.length < 2) setSelectedCaptains(prev => [...prev, userId])
    }

    const getTeams = () => {
        if (draftState?.teams) {
            const t1 = draftState.teams[1].players || draftState.teams[1] || [];
            const t2 = draftState.teams[2].players || draftState.teams[2] || [];
            return {
                team1: t1.map(uid => participants.find(p => p.user_id === uid)).filter(Boolean),
                team2: t2.map(uid => participants.find(p => p.user_id === uid)).filter(Boolean)
            }
        }
        return {
            team1: participants.filter(p => p.team_number === 1),
            team2: participants.filter(p => p.team_number === 2)
        }
    }

    const { team1, team2 } = (lobby?.status === 'in_progress' || lobby?.status === 'finished' || lobby?.status === 'completed') ? getTeams() : { team1: [], team2: [] }
    const overallWinner = calculateOverallWinner()

    if (loading) return <div className="min-h-screen bg-cs-dark flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-cs-orange" /></div>
    if (error) return <div className="min-h-screen bg-cs-dark flex items-center justify-center text-red-500 font-bold uppercase tracking-wider">{error}</div>
    if (!lobby) return <div className="min-h-screen bg-cs-dark flex items-center justify-center text-white font-bold uppercase tracking-wider">Лобби не найдено</div>

    const isOrganizer = user?.id === lobby.creator_id || user?.role === 2
    const isJoined = participants.some(p => p.user_id === user?.id)

    return (
        <div className="min-h-screen bg-cs-dark text-white pt-10 px-4 relative overflow-hidden font-sans">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cs-grid-bg opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-cs-dark/80 via-cs-dark/90 to-cs-dark"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 py-12">
                <Breadcrumbs lastBreadcrumbLabel={lobby.name} />

                <LobbyHeader
                    lobby={lobby}
                    isOrganizer={isOrganizer}
                    isJoined={isJoined}
                    overallWinner={overallWinner}
                    onEdit={() => setIsEditModalOpen(true)}
                    onInvite={() => setIsInviteModalOpen(true)}
                    onCancel={handleCancel}
                    onStart={() => setShowStartModal(true)}
                    onReset={handleReset}
                    onJoin={handleJoin}
                    onLeave={handleLeave}
                    participantsCount={participants.length}
                    maxParticipants={lobby.max_participants}
                    participants={participants}
                    onShowPoster={() => setIsPosterModalOpen(true)}
                />

                {lobby.status === 'drafting' && draftState && (
                    <LobbyDraft
                        draftState={draftState}
                        participants={participants}
                        user={user}
                        isOrganizer={isOrganizer}
                        selectedCaptains={selectedCaptains}
                        toggleCaptainSelection={toggleCaptainSelection}
                        handleSetCaptains={handleSetCaptains}
                        teamNameInput={teamNameInput}
                        setTeamNameInput={setTeamNameInput}
                        handleSetTeamName={handleSetTeamName}
                        handleDraftPick={handleDraftPick}
                        handleVetoMap={handleVetoMap}
                        mapPool={lobby.map_pool}
                    />
                )}

                {(lobby.status === 'in_progress' || lobby.status === 'finished' || lobby.status === 'completed') && (
                    <LobbyMatchView
                        draftState={draftState}
                        team1={team1}
                        team2={team2}
                        lobbyId={id}
                        isAdmin={user?.role === 2}
                        matches={matches}
                        onRefresh={fetchMatches}
                        lobby={lobby}
                        overallWinner={overallWinner}
                        showPosterModal={isPosterModalOpen}
                        setShowPosterModal={setIsPosterModalOpen}
                    />
                )}

                {lobby.status === 'registering' && (
                    <LobbyParticipants
                        participants={participants}
                        maxParticipants={lobby.max_participants}
                        isOrganizer={isOrganizer}
                        currentUserId={user?.id}
                        creatorId={lobby.creator_id}
                        onKick={handleKick}
                    />
                )}
            </div>

            <LobbyEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                formData={editFormData}
                setFormData={setEditFormData}
                onSave={handleSaveLobby}
            />

            <LobbyStartModal
                isOpen={showStartModal}
                onClose={() => setShowStartModal(false)}
                onStartAuto={handleStartAuto}
                onStartDraft={handleStartDraft}
            />

            <PlayerSearchModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={handleInvite}
            />

            <PasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                onSubmit={handlePasswordSubmit}
            />
        </div>
    )
}

export default LobbyPage
