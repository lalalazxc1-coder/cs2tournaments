import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { tournamentAPI, matchesAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'
import usePageTitle from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'
import MatchHeader from '../components/tournament/MatchHeader'
import VetoBoard from '../components/tournament/VetoBoard'
import AdminMatchPanel from '../components/tournament/AdminMatchPanel'
import MatchMaps from '../components/tournament/MatchMaps'
import MatchStatsTable from '../components/matches/MatchStatsTable'

const TournamentMatchPage = () => {
    const { id, matchId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [match, setMatch] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [vetoLoading, setVetoLoading] = useState(false)
    const [linkedMatchDetails, setLinkedMatchDetails] = useState([])

    usePageTitle('Матч турнира')

    const fetchMatch = async () => {
        try {
            const res = await tournamentAPI.getBrackets(id)
            const foundMatch = res.data.find(m => m.id === parseInt(matchId))

            if (foundMatch) {
                if (typeof foundMatch.map_state === 'string') {
                    try {
                        foundMatch.map_state = JSON.parse(foundMatch.map_state)
                    } catch (e) {
                        console.error('Error parsing map_state', e)
                    }
                }
                setMatch(foundMatch)

                // Fetch linked match details if any
                if (foundMatch.parserMatches && foundMatch.parserMatches.length > 0) {
                    const details = [];
                    for (const pm of foundMatch.parserMatches) {
                        try {
                            const res = await matchesAPI.getMatch(pm.match_id);
                            details.push(res.data);
                        } catch (e) {
                            console.error('Failed to fetch linked match details', e);
                        }
                    }
                    setLinkedMatchDetails(details);
                } else {
                    setLinkedMatchDetails([]);
                }

            } else {
                setError('Матч не найден')
            }
        } catch (err) {
            setError('Ошибка загрузки матча')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMatch()
        const interval = setInterval(fetchMatch, 5000)
        return () => clearInterval(interval)
    }, [id, matchId])

    useEffect(() => {
        if (match && !match.map_state && !vetoLoading) {
            const isCap1 = match.team1?.captain_id === user?.id;
            const isCap2 = match.team2?.captain_id === user?.id;

            if (isCap1 || isCap2) {
                startVeto();
            }
        }
    }, [match, user])

    const startVeto = async () => {
        if (vetoLoading) return;
        setVetoLoading(true);
        try {
            await tournamentAPI.startVeto(id, matchId);
            await fetchMatch();
        } catch (err) {
            console.error('Error starting veto', err);
        } finally {
            setVetoLoading(false);
        }
    }

    const handleVetoAction = async (mapName) => {
        if (vetoLoading) return
        setVetoLoading(true)
        try {
            await tournamentAPI.vetoMap(id, matchId, mapName)
            await fetchMatch()
        } catch (err) {
            alert(err.response?.data?.message || err.message)
        } finally {
            setVetoLoading(false)
        }
    }

    if (loading) return <div className="min-h-screen bg-cs-dark flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-cs-orange" /></div>
    if (error) return <div className="min-h-screen bg-cs-dark flex items-center justify-center text-red-500 font-bold uppercase tracking-wider">{error}</div>
    if (!match) return null

    const mapState = match.map_state
    const isVetoStage = mapState && mapState.stage === 'veto'
    const isCompleted = match.status === 'completed' || (mapState && mapState.stage === 'completed')

    const isCaptain1 = match.team1?.captain_id === user?.id
    const isCaptain2 = match.team2?.captain_id === user?.id
    const isCaptain = isCaptain1 || isCaptain2

    let isMyTurn = false
    let turnTeamName = ''

    if (isVetoStage) {
        if (mapState.turn) {
            isMyTurn = String(mapState.turn) === String(user?.id);
            if (String(mapState.turn) === String(match.team1?.captain_id)) {
                turnTeamName = match.team1?.name;
            } else if (String(mapState.turn) === String(match.team2?.captain_id)) {
                turnTeamName = match.team2?.name;
            }
        } else {
            const turnTeamNum = (mapState.current_step % 2 === 0) ? 1 : 2
            isMyTurn = (turnTeamNum === 1 && isCaptain1) || (turnTeamNum === 2 && isCaptain2)
            turnTeamName = turnTeamNum === 1 ? match.team1?.name : match.team2?.name
        }
    }

    const currentAction = isVetoStage && mapState?.sequence && mapState.sequence[mapState.current_step] ? mapState.sequence[mapState.current_step] : null

    return (
        <div className="min-h-screen bg-cs-dark text-white pt-10 px-4 relative overflow-hidden font-sans">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cs-grid-bg opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-cs-dark/80 via-cs-dark/90 to-cs-dark"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10 py-12">
                <Breadcrumbs />

                <MatchHeader match={match} />

                {isVetoStage && (
                    <VetoBoard
                        mapState={mapState}
                        isMyTurn={isMyTurn}
                        currentAction={currentAction}
                        turnTeamName={turnTeamName}
                        vetoLoading={vetoLoading}
                        onVetoAction={handleVetoAction}
                        team1Name={match.team1?.name || 'T1'}
                        team2Name={match.team2?.name || 'T2'}
                    />
                )}

                {(user?.role === 2 || match.tournament_creator_id === user?.id) && (
                    <AdminMatchPanel
                        match={match}
                        mapState={mapState}
                        tournamentId={id}
                        matchId={matchId}
                        onUpdate={fetchMatch}
                    />
                )}

                {(isCompleted || (mapState && mapState.stage === 'completed')) && mapState && (
                    <MatchMaps
                        mapState={mapState}
                        team1Name={match.team1?.name || 'T1'}
                        team2Name={match.team2?.name || 'T2'}
                    />
                )}

                {/* Linked Match Stats */}
                {linkedMatchDetails.length > 0 && (
                    <div className="mt-12 space-y-12">
                        {linkedMatchDetails.map((details, index) => (
                            <div key={index} className="bg-cs-surface border border-white/5 p-6 clip-path-slant relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-cs-orange"></div>
                                <h3 className="text-xl font-black text-white mb-6 uppercase tracking-wider flex items-center gap-3">
                                    <span className="text-cs-orange">#</span>
                                    Статистика матча: {details.match.map_name}
                                </h3>
                                <MatchStatsTable matchDetails={details} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default TournamentMatchPage
