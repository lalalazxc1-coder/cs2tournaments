import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { tournamentAPI, userAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Trophy, Calendar, Users, Loader2, Plus, Search, Filter, DollarSign, Swords, Star, CheckCircle, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ParticipantsProgress } from '../components/LobbyComponents'
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

const Tournaments = () => {
  usePageTitle('Турниры')
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [formatFilter, setFormatFilter] = useState('all')

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        setFilter('all')
      } else {
        loadInitialTournaments()
      }
    }
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    if (!authLoading && filter !== 'initial') {
      loadTournaments()
    }
  }, [filter, authLoading, isAuthenticated])

  const loadInitialTournaments = async () => {
    try {
      setLoading(true)
      // Fetch all to decide what to show
      const response = await tournamentAPI.getTournaments({})
      let displayData = response.data.tournaments || []

      // Need to check joined status to make smart decision
      if (isAuthenticated) {
        try {
          const userResponse = await userAPI.getTournaments()
          const userTournaments = userResponse.data.tournaments || userResponse.data || []
          const myIds = new Set(userTournaments.map(t => t.tournament?.id || t.id))

          displayData = displayData.map(t => ({
            ...t,
            is_joined: myIds.has(t.id)
          }))
        } catch (err) {
          console.error('Failed to fetch user tournaments:', err)
        }
      }

      // Smart filter logic
      const myTournaments = displayData.filter(t => t.is_joined)
      const hasActiveMy = myTournaments.some(t => ['active', 'registration'].includes(t.status)) // Assuming 'active' covers in-progress
      const hasRegistration = displayData.some(t => t.status === 'registration' || t.status === 'upcoming')

      let smartFilter = 'all'
      if (hasActiveMy || myTournaments.length > 0) {
        smartFilter = 'my'
      } else if (hasRegistration) {
        smartFilter = 'registration'
      }

      setFilter(smartFilter)
      setTournaments(displayData)
    } catch (error) {
      console.error('Failed to load initial tournaments:', error)
      setFilter('all')
    } finally {
      setLoading(false)
    }
  }

  const loadTournaments = async () => {
    try {
      setLoading(true)

      // 1. Fetch standard tournaments list (source of truth for display)
      const params = (filter !== 'all' && filter !== 'my' && filter !== 'registration') ? { status: filter } : {}
      const response = await tournamentAPI.getTournaments(params)
      let displayData = response.data.tournaments || []

      if (filter === 'registration') {
        displayData = displayData.filter(t => t.status === 'registration' || t.status === 'upcoming')
      }

      // 2. If authenticated, fetch user tournaments to mark is_joined
      if (isAuthenticated) {
        try {
          const userResponse = await userAPI.getTournaments()
          const userTournaments = userResponse.data.tournaments || userResponse.data || []
          const myIds = new Set(userTournaments.map(t => t.tournament?.id || t.id))

          displayData = displayData.map(t => ({
            ...t,
            is_joined: myIds.has(t.id)
          }))

          // If filter is 'my', filter the displayData
          if (filter === 'my') {
            displayData = displayData.filter(t => t.is_joined)
          }
        } catch (err) {
          console.error('Failed to fetch user tournaments:', err)
        }
      }

      setTournaments(displayData)
    } catch (error) {
      console.error('Failed to load tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'registration': return 'text-black bg-cs-orange border-cs-orange'
      case 'active': return 'text-white bg-green-600 border-green-600'
      case 'completed': return 'text-cs-text bg-neutral-800 border-neutral-700'
      default: return 'text-cs-text bg-neutral-800 border-neutral-700'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'registration': return 'Регистрация'
      case 'active': return 'Идет'
      case 'completed': return 'Завершен'
      default: return status
    }
  }

  const getFormatLabel = (format) => {
    switch (format) {
      case 'single_elimination': return 'Single Elimination'
      case 'double_elimination': return 'Double Elimination'
      default: return format
    }
  }

  const filteredTournaments = tournaments
    .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(t => formatFilter !== 'all' ? t.format === formatFilter : true)
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(a.start_date) - new Date(b.start_date)
      if (sortBy === 'participants') return (b.teams_count || 0) - (a.teams_count || 0)
      if (sortBy === 'prize') return (parseInt(b.prize_pool) || 0) - (parseInt(a.prize_pool) || 0)
      return 0
    })

  const counts = {
    my: isAuthenticated ? tournaments.filter(t => t.is_joined).length : 0,
    registration: tournaments.filter(t => t.status === 'registration' || t.status === 'upcoming').length,
    active: tournaments.filter(t => t.status === 'active').length,
    completed: tournaments.filter(t => t.status === 'completed').length,
    all: tournaments.length
  }

  return (
    <div className="min-h-screen bg-cs-dark text-white font-sans pt-10 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-cs-grid-bg opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-cs-dark/80 via-cs-dark/90 to-cs-dark"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <Breadcrumbs />
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            {/*<div className="inline-flex items-center gap-2 px-3 py-1 mb-4 border-l-4 border-cs-orange bg-white/5">
              <span className="text-cs-orange font-bold tracking-widest uppercase text-xs">Tournaments</span>
            </div>*/}
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tighter uppercase">ТУРНИРЫ</h1>
            <p className="text-cs-text text-lg max-w-2xl font-medium">Соревнуйтесь командами за призовой фонд и славу.</p>
          </div>
          {user?.role >= 1 && (
            <Link to="/tournaments/create" className="cs-button bg-cs-orange hover:bg-yellow-400 text-black font-black uppercase tracking-wider py-2 px-4 skew-x-[-10deg] transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(233,177,14,0.2)] whitespace-nowrap flex items-center gap-2 text-sm">
              <span className="skew-x-[10deg] flex items-center gap-2"><Plus className="w-4 h-4" /> Создать Турнир</span>
            </Link>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 space-y-4">
          <div className="relative skew-x-[-10deg]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cs-text skew-x-[10deg]" />
            <input
              type="text"
              placeholder="ПОИСК ТУРНИРОВ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 px-12 py-3 text-white placeholder-cs-text focus:outline-none focus:border-cs-orange/50 transition-colors uppercase tracking-wider font-bold text-sm skew-x-[10deg]"
            />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="flex flex-wrap items-center p-1 bg-black/40 border border-white/5 skew-x-[-10deg] w-full md:w-auto">
            {[
              ...(isAuthenticated ? [{ value: 'my', label: 'Мои', icon: Star }] : []),
              { value: 'registration', label: 'Регистрация' },
              { value: 'active', label: 'Активные', isLive: true },
              { value: 'completed', label: 'Завершенные' },
              { value: 'all', label: 'Все' }
            ].map((option, idx, arr) => (
              <div key={option.value} className="flex items-center flex-grow md:flex-grow-0">
                <button
                  onClick={() => setFilter(option.value)}
                  className={`relative px-4 md:px-6 py-2 text-[11px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 w-full ${filter === option.value
                    ? 'bg-cs-orange text-black shadow-[0_0_20px_rgba(233,177,14,0.2)]'
                    : 'text-cs-text hover:text-white hover:bg-white/5'
                    }`}
                >
                  <span className="skew-x-[10deg] flex items-center gap-2 whitespace-nowrap">
                    {option.icon && <option.icon className={`w-3.5 h-3.5 ${filter === option.value ? 'text-black' : 'text-cs-orange'}`} />}
                    {option.isLive && (
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${filter === option.value ? 'bg-black' : 'bg-red-500'}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${filter === option.value ? 'bg-black' : 'bg-red-500'}`}></span>
                      </span>
                    )}
                    {option.label}
                    <span className={`font-mono text-[10px] opacity-60 ${filter === option.value ? 'text-black' : 'text-cs-text'}`}>
                      {counts[option.value]}
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
        ) : filteredTournaments.length > 0 ? (
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-1 gap-6">
            <AnimatePresence mode='wait'>
              {filteredTournaments.map(tournament => (
                <motion.div
                  key={tournament.id}
                  variants={fadeInUp}
                  layout
                  className={`group relative bg-cs-surface border p-1 transition-all duration-300 clip-path-slant ${tournament.is_joined ? 'border-green-500/50 shadow-[0_0_20px_rgba(74,222,128,0.1)]' : 'border-white/5 hover:border-cs-orange/50'}`}
                >
                  <Link to={`/tournaments/${tournament.id}`} className="relative bg-gradient-to-r from-neutral-800 to-cs-surface p-2.5 md:p-3 h-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 overflow-hidden">
                    {tournament.is_joined && (
                      <div className="absolute top-0 right-0 p-2 z-10">
                        <div className="bg-green-500 text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider skew-x-[-10deg] flex items-center gap-1">
                          <span className="skew-x-[10deg] flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Участвую</span>
                        </div>
                      </div>
                    )}

                    <div className="flex-1 relative z-10">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border ${getStatusColor(tournament.status)} skew-x-[-10deg] inline-block`}>
                          <span className="skew-x-[10deg] block">{getStatusText(tournament.status)}</span>
                        </span>
                        <div className="flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border skew-x-[-10deg] bg-white/5 text-cs-text border-white/10">
                          <span className="skew-x-[10deg] flex items-center gap-1">
                            <Swords className="w-3 h-3" />
                            {getFormatLabel(tournament.format)}
                          </span>
                        </div>
                        {tournament.prize_pool && (
                          <div className="flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border skew-x-[-10deg] bg-cs-orange/10 text-cs-orange border-cs-orange/20">
                            <span className="skew-x-[10deg] flex items-center gap-1">
                              {parseInt(tournament.prize_pool).toLocaleString('ru-RU')} ₸
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tighter group-hover:text-cs-orange transition-colors duration-300">{tournament.name}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-cs-text font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-cs-blue" />
                          <span className="font-mono text-white">{new Date(tournament.start_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-48 relative z-10">
                      <ParticipantsProgress current={tournament.teams_count || 0} max={tournament.max_teams} label="Команды" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-black/20 border border-white/5 clip-path-slant">
            <div className="bg-white/5 w-20 h-20 flex items-center justify-center mx-auto mb-6 skew-x-[-10deg] border border-white/10">
              <Trophy className="w-10 h-10 text-cs-text skew-x-[10deg]" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wider">Турниры не найдены</h3>
            <p className="text-cs-text max-w-md mx-auto">
              {searchQuery ? `По запросу "${searchQuery}" ничего не найдено` : 'В данный момент нет турниров с выбранным статусом.'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Tournaments
