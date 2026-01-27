import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { teamAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Users, Trophy, Loader2 } from 'lucide-react'
import PlayerSearchModal from '../components/teams/PlayerSearchModal'
import usePageTitle from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'
import TeamHeader from '../components/teams/TeamHeader'
import TeamRoster from '../components/teams/TeamRoster'
import TeamTournaments from '../components/teams/TeamTournaments'
import TeamSidebar from '../components/teams/TeamSidebar'

const TeamPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [team, setTeam] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('roster')

    usePageTitle(team?.name ? `Команда: ${team.name}` : 'Команда')

    useEffect(() => {
        loadTeam()
    }, [id])

    const loadTeam = async () => {
        try {
            setLoading(true)
            const response = await teamAPI.getTeam(id)
            setTeam(response.data)
        } catch (err) {
            setError('Failed to load team')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleInviteMember = async (userId) => {
        try {
            await teamAPI.addMember(id, userId)
            setIsInviteModalOpen(false)
            alert('Приглашение отправлено')
            loadTeam()
        } catch (err) {
            alert(err.response?.data?.message || err.message)
        }
    }

    const handleJoinTeam = async () => {
        try {
            await teamAPI.joinTeam(id)
            alert('Заявка отправлена')
            loadTeam()
        } catch (err) {
            alert(err.response?.data?.message || err.message)
        }
    }

    const handleAcceptRequest = async (userId) => {
        try {
            await teamAPI.acceptMember(id, userId)
            loadTeam()
        } catch (err) {
            alert(err.response?.data?.message || err.message)
        }
    }

    const handleDeclineRequest = async (userId) => {
        if (!confirm('Отклонить заявку?')) return
        try {
            await teamAPI.removeMember(id, userId)
            loadTeam()
        } catch (err) {
            alert(err.response?.data?.message || err.message)
        }
    }

    const handleCancelInvite = async (userId) => {
        if (!confirm('Отменить приглашение?')) return
        try {
            await teamAPI.removeMember(id, userId)
            loadTeam()
        } catch (err) {
            alert(err.response?.data?.message || err.message)
        }
    }

    const handleRemoveMember = async (userId) => {
        if (!confirm('Удалить участника?')) return
        try {
            await teamAPI.removeMember(id, userId)
            loadTeam()
        } catch (err) {
            alert(err.response?.data?.message || err.message)
        }
    }

    const handleLeaveTeam = async () => {
        if (!confirm('Вы уверены, что хотите покинуть команду?')) return
        try {
            await teamAPI.removeMember(id, user.id)
            navigate('/teams')
        } catch (err) {
            alert(err.response?.data?.message || err.message)
        }
    }

    const handleDeleteTeam = async () => {
        if (!confirm('Вы уверены, что хотите удалить команду? Это действие необратимо.')) return
        try {
            await teamAPI.deleteTeam(id)
            navigate('/teams')
        } catch (err) {
            alert(err.response?.data?.message || err.message)
        }
    }

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите изображение')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Размер файла не должен превышать 5МБ')
            return
        }

        try {
            const uploadResponse = await teamAPI.uploadImage(file)
            const newLogoUrl = uploadResponse.data.url

            await teamAPI.updateTeam(id, { logo_url: newLogoUrl })
            setTeam(prev => ({ ...prev, logo_url: newLogoUrl }))
        } catch (err) {
            alert(err.response?.data?.message || 'Ошибка при обновлении логотипа')
        }
    }

    if (loading) return <div className="min-h-screen bg-cs-dark flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-cs-orange" /></div>
    if (error) return <div className="min-h-screen bg-cs-dark flex items-center justify-center text-red-500 font-bold uppercase tracking-wider">{error}</div>
    if (!team) return <div className="min-h-screen bg-cs-dark flex items-center justify-center text-white font-bold uppercase tracking-wider">Команда не найдена</div>

    const isCaptain = user?.id === team.captain_id

    // Filter members
    const activeMembers = team.members?.filter(m => !m.status || m.status === 'member') || []
    const pendingRequests = team.members?.filter(m => m.status === 'pending') || []
    const invitedMembers = team.members?.filter(m => m.status === 'invited') || []

    const userMemberRecord = team.members?.find(m => m.user_id === user?.id)
    const userStatus = userMemberRecord?.status || (userMemberRecord ? 'member' : null)

    return (
        <div className="min-h-screen bg-cs-dark text-white pt-24 pb-32 px-4 relative overflow-hidden font-sans">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cs-grid-bg opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-cs-dark/80 via-cs-dark/90 to-cs-dark"></div>
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                <Breadcrumbs lastBreadcrumbLabel={team.name} />

                <TeamHeader
                    team={team}
                    user={user}
                    isCaptain={isCaptain}
                    activeMembers={activeMembers}
                    userMemberRecord={userMemberRecord}
                    userStatus={userStatus}
                    onLogoUpload={handleLogoUpload}
                    onJoinTeam={handleJoinTeam}
                    onAcceptRequest={handleAcceptRequest}
                    onDeclineRequest={handleDeclineRequest}
                    onLeaveTeam={handleLeaveTeam}
                    onDeleteTeam={handleDeleteTeam}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2">
                        {/* Tabs */}
                        <div className="flex gap-1 mb-4">
                            <button
                                onClick={() => setActiveTab('roster')}
                                className={`flex-1 py-3 font-black uppercase tracking-wider skew-x-[-10deg] transition-all border ${activeTab === 'roster'
                                    ? 'bg-cs-orange text-black border-cs-orange'
                                    : 'bg-white/5 text-cs-text border-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <span className="skew-x-[10deg] flex items-center justify-center gap-2">
                                    <Users className="w-4 h-4" /> Состав
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('tournaments')}
                                className={`flex-1 py-3 font-black uppercase tracking-wider skew-x-[-10deg] transition-all border ${activeTab === 'tournaments'
                                    ? 'bg-cs-orange text-black border-cs-orange'
                                    : 'bg-white/5 text-cs-text border-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <span className="skew-x-[10deg] flex items-center justify-center gap-2">
                                    <Trophy className="w-4 h-4" /> Турниры
                                </span>
                            </button>
                        </div>

                        <style>{`
                            .custom-scrollbar::-webkit-scrollbar {
                                width: 6px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-track {
                                background: rgba(255, 255, 255, 0.05);
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb {
                                background: #E9B10E;
                                border-radius: 3px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                background: #FFC107;
                            }
                        `}</style>

                        <div className="bg-cs-surface border border-white/5 clip-path-slant p-1 h-full min-h-[400px]">
                            <div className="bg-neutral-900/80 h-full flex flex-col">
                                {activeTab === 'roster' ? (
                                    <TeamRoster
                                        activeMembers={activeMembers}
                                        isCaptain={isCaptain}
                                        user={user}
                                        onInviteClick={() => setIsInviteModalOpen(true)}
                                        onRemoveMember={handleRemoveMember}
                                    />
                                ) : (
                                    <TeamTournaments team={team} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar for Captain (Requests/Invites) */}
                    {isCaptain && (
                        <TeamSidebar
                            pendingRequests={pendingRequests}
                            invitedMembers={invitedMembers}
                            onAcceptRequest={handleAcceptRequest}
                            onDeclineRequest={handleDeclineRequest}
                            onCancelInvite={handleCancelInvite}
                        />
                    )}
                </div>
            </div>

            <PlayerSearchModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={handleInviteMember}
            />
        </div>
    )
}

export default TeamPage
