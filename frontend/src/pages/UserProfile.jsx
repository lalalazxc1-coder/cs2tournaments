import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { userAPI } from '../utils/api'
import { Loader2 } from 'lucide-react'
import { useNavigate, useParams, Outlet } from 'react-router-dom'
import usePageTitle from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'
import UserProfileHeader from '../components/profile/UserProfileHeader'
import UserProfileTabs from '../components/profile/UserProfileTabs'
import PrivateProfileView from '../components/profile/PrivateProfileView'

const UserProfile = ({ publicView = false }) => {
    const { user, isAuthenticated, loading: authLoading } = useAuth()
    const { identifier } = useParams()
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [optimisticStatus, setOptimisticStatus] = useState(undefined)

    usePageTitle(profile?.user?.nickname ? `${profile.user.nickname}` : 'Профиль')

    useEffect(() => {
        if (authLoading) return

        const fetchProfile = async () => {
            try {
                let response
                if (publicView && identifier) {
                    response = await userAPI.getPublicProfile(identifier)
                } else if (!publicView) {
                    response = await userAPI.getProfile()
                } else {
                    navigate('/')
                    return
                }
                setProfile(response.data)
            } catch (err) {
                if (err.response && err.response.status === 403 && err.response.data.is_private) {
                    setProfile(err.response.data)
                } else {
                    console.error('Failed to fetch profile:', err)
                    setError('Не удалось загрузить профиль')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [authLoading, identifier, publicView, navigate])

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-cs-dark flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-cs-orange animate-spin" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-cs-dark flex items-center justify-center text-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Ошибка</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button onClick={() => navigate('/')} className="px-6 py-2 bg-cs-orange text-black font-bold uppercase skew-x-[-10deg]">
                        <span className="skew-x-[10deg]">На главную</span>
                    </button>
                </div>
            </div>
        )
    }

    const { user: userData, stats, friendship_status } = profile

    if (!userData) {
        return (
            <div className="min-h-screen bg-cs-dark flex items-center justify-center text-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Профиль не найден</h2>
                    <button onClick={() => navigate('/')} className="px-6 py-2 bg-cs-orange text-black font-bold uppercase skew-x-[-10deg]">
                        <span className="skew-x-[10deg]">На главную</span>
                    </button>
                </div>
            </div>
        )
    }

    const isOwner = !publicView || (user && user.id === userData.id)

    // Private profile check
    if (profile.is_private) {
        return <PrivateProfileView userData={userData} />;
    }

    return (
        <div className="min-h-screen bg-cs-dark text-white font-sans selection:bg-cs-orange/30 relative overflow-hidden px-4 pt-10">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cs-grid-bg opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-cs-dark/80 via-cs-dark/90 to-cs-dark"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto py-12">
                <Breadcrumbs lastBreadcrumbLabel={`Профиль игрока - ${userData.nickname}`} />

                <UserProfileHeader
                    userData={userData}
                    stats={stats}
                    isOwner={isOwner}
                    isAuthenticated={isAuthenticated}
                    friendshipStatus={optimisticStatus !== undefined ? optimisticStatus : friendship_status}
                    onFriendStatusChange={setOptimisticStatus}
                />

                <UserProfileTabs profile={profile} isOwner={isOwner} />

                <div className="mt-6">
                    <Outlet context={{ profile, isOwner, setProfile, user }} />
                </div>

            </div>
        </div>
    )
}

export default UserProfile
