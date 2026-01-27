import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { teamAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Users, Plus, Search, Loader2, Shield, Trophy, Target, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import usePageTitle from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    }
}

const TeamCard = ({ team }) => (
    <motion.div
        variants={fadeInUp}
        layout
        className="group relative bg-cs-surface border p-1 transition-all duration-300 clip-path-slant border-white/5 hover:border-cs-orange/50"
    >
        <Link to={`/teams/${team.id}`} className="relative bg-gradient-to-r from-neutral-800 to-cs-surface p-2.5 md:p-3 h-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 overflow-hidden">
            <div className="flex items-center gap-4 flex-1 relative z-10">
                <div className="relative w-12 h-12 md:w-14 md:h-14 flex-shrink-0">
                    <div className="absolute inset-0 bg-cs-orange/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative w-full h-full bg-black/50 flex items-center justify-center border border-white/10 group-hover:border-cs-orange/50 transition-colors overflow-hidden skew-x-[-5deg]">
                        {team.logo_url ? (
                            <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover skew-x-[5deg]" />
                        ) : (
                            <Shield className="w-6 h-6 text-cs-text group-hover:text-cs-orange transition-colors skew-x-[5deg]" />
                        )}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter group-hover:text-cs-orange transition-colors duration-300 mb-1">{team.name}</h3>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="px-2 py-0.5 bg-black/40 border border-white/10 text-[10px] font-bold text-cs-text uppercase tracking-wider skew-x-[-10deg] inline-block">
                            <span className="skew-x-[10deg]">ID: {team.id}</span>
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-cs-text font-bold uppercase tracking-wide">
                            <Users className="w-3 h-3 text-cs-blue" />
                            <span>{team.members?.filter(m => !m.status || m.status === 'member').length || 0} / 5</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6 relative z-10">
                <div className="flex flex-col items-end lg:items-center gap-0.5 min-w-[80px]">
                    <div className="flex items-center gap-2 text-cs-text text-[10px] font-bold uppercase tracking-wider">
                        <Trophy className="w-3 h-3 text-cs-orange" />
                        <span>Турниры</span>
                    </div>
                    <span className="text-lg font-black text-white">{team.tournaments_count || 0}</span>
                </div>
            </div>
        </Link>
    </motion.div>
)

const Teams = () => {
    usePageTitle('Команды')
    const { user, loading: authLoading } = useAuth()
    const [myTeams, setMyTeams] = useState([])
    const [allTeams, setAllTeams] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('all') // 'all' | 'my'

    useEffect(() => {
        if (!authLoading) {
            setViewMode(user ? 'my' : 'all')
            loadTeams()
        }
    }, [user, authLoading])

    const loadTeams = async () => {
        try {
            setLoading(true)

            const promises = [teamAPI.getTeams({ limit: 50 })]
            if (user) {
                promises.push(teamAPI.getTeams({ member_id: user.id, limit: 50 }))
            }

            const results = await Promise.all(promises)

            // Results[0] is all teams
            const allTeamsData = results[0].data.teams || []

            // Results[1] is my teams (if user exists)
            let myTeamsData = []
            if (user && results[1]) {
                myTeamsData = results[1].data.teams || []
            }

            setAllTeams(allTeamsData)
            setMyTeams(myTeamsData)
        } catch (error) {
            console.error('Failed to load teams:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredMyTeams = myTeams.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const filteredAllTeams = allTeams.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const activeList = viewMode === 'my' ? filteredMyTeams : filteredAllTeams

    return (
        <div className="min-h-screen bg-cs-dark text-white font-sans pt-10 relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cs-grid-bg opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-cs-dark/80 via-cs-dark/90 to-cs-dark"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
                <Breadcrumbs />
                <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 md:mb-12 gap-6 text-center md:text-left">
                    <div className="w-full md:w-auto">
                        {/*<div className="inline-flex items-center gap-2 px-3 py-1 mb-4 border-l-4 border-cs-orange bg-white/5 mx-auto md:mx-0">
                            <span className="text-cs-orange font-bold tracking-widest uppercase text-xs">Teams</span>
                        </div>*/}
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tighter uppercase">КОМАНДЫ</h1>
                        <p className="text-cs-text text-sm md:text-lg max-w-2xl font-medium mx-auto md:mx-0">Создайте свою команду или присоединитесь к существующей.</p>
                    </div>
                    {user && (
                        <Link to="/teams/create" className="w-full md:w-auto cs-button bg-cs-orange hover:bg-yellow-400 text-black font-black uppercase tracking-wider py-2 px-4 skew-x-[-10deg] transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(233,177,14,0.2)] whitespace-nowrap flex items-center justify-center gap-2 text-sm">
                            <span className="skew-x-[10deg] flex items-center gap-2"><Plus className="w-4 h-4" /> Создать Команду</span>
                        </Link>
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 space-y-4">
                    <div className="relative skew-x-[-10deg]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cs-text skew-x-[10deg]" />
                        <input
                            type="text"
                            placeholder="ПОИСК КОМАНД..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 px-12 py-3 text-white placeholder-cs-text focus:outline-none focus:border-cs-orange/50 transition-colors uppercase tracking-wider font-bold text-sm skew-x-[10deg]"
                        />
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-8 md:mb-12">
                    <div className="flex flex-wrap items-center p-1 bg-black/40 border border-white/5 skew-x-[-10deg] w-full md:w-auto">
                        {[
                            ...(user ? [{ value: 'my', label: 'Мои', count: myTeams.length, icon: Star }] : []),
                            { value: 'all', label: 'Все', count: allTeams.length }
                        ].map((option, idx, arr) => (
                            <div key={option.value} className="flex items-center flex-grow md:flex-grow-0">
                                <button
                                    onClick={() => setViewMode(option.value)}
                                    className={`relative px-4 md:px-6 py-2 text-[11px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 w-full ${viewMode === option.value
                                        ? 'bg-cs-orange text-black shadow-[0_0_20px_rgba(233,177,14,0.2)]'
                                        : 'text-cs-text hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span className="skew-x-[10deg] flex items-center gap-2 whitespace-nowrap">
                                        {option.icon && <option.icon className={`w-3.5 h-3.5 ${viewMode === option.value ? 'text-black' : 'text-cs-orange'}`} />}
                                        {option.label}
                                        <span className={`font-mono text-[10px] opacity-60 ${viewMode === option.value ? 'text-black' : 'text-cs-text'}`}>
                                            {option.count}
                                        </span>
                                    </span>
                                </button>
                                {idx < arr.length - 1 && (
                                    <div className="w-[1px] h-4 bg-white/10 skew-x-[10deg] hidden md:block" />
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-cs-orange" /></div>
                ) : activeList.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence mode='wait'>
                            {activeList.map(team => (
                                <TeamCard key={team.id} team={team} />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-black/20 border border-white/5 clip-path-slant">
                        <div className="bg-white/5 w-20 h-20 flex items-center justify-center mx-auto mb-6 skew-x-[-10deg] border border-white/10">
                            <Shield className="w-10 h-10 text-cs-text skew-x-[10deg]" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wider">Команды не найдены</h3>
                        <p className="text-cs-text max-w-md mx-auto">
                            {searchQuery ? `По запросу "${searchQuery}" ничего не найдено` : (viewMode === 'my' ? 'Вы еще не состоите ни в одной команде.' : 'Список команд пуст.')}
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default Teams
