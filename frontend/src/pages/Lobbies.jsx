import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { lobbyAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Trophy, Calendar, Users, Loader2, Target, CheckCircle, Search, Plus, Star, Swords, Lock, ArrowUpDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ParticipantsProgress, CountdownTimer } from '../components/LobbyComponents'
import usePageTitle from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'
import PasswordModal from '../components/lobby/PasswordModal'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
}

const Lobbies = () => {
  usePageTitle('Лобби 5x5')
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const [lobbies, setLobbies] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [joiningId, setJoiningId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('priority')
  const [formatFilter, setFormatFilter] = useState('all')
  const [passwordModal, setPasswordModal] = useState({ isOpen: false, lobbyId: null })
  const [isSortOpen, setIsSortOpen] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        setFilter('all')
      } else {
        loadInitialLobbies()
      }
    }
  }, [authLoading, isAuthenticated])

  // Regular load when filter changes (user interaction)
  useEffect(() => {
    if (!authLoading && filter !== 'initial') {
      loadLobbies()
    }
  }, [filter, isAuthenticated, authLoading])

  const loadInitialLobbies = async () => {
    try {
      setLoading(true)
      // Fetch all to decide what to show
      const response = await lobbyAPI.getLobbies({})
      const allLobbies = response.data.tournaments || []

      // Smart filter logic
      const myLobbies = allLobbies.filter(l => l.is_joined)
      const hasActiveMy = myLobbies.some(l => ['drafting', 'in_progress'].includes(l.status))
      const hasRegistering = allLobbies.some(l => l.status === 'registering')

      let smartFilter = 'all'
      if (hasActiveMy || myLobbies.length > 0) {
        smartFilter = 'my'
      } else if (hasRegistering) {
        smartFilter = 'registering'
      }

      setFilter(smartFilter)
      setLobbies(allLobbies)
    } catch (error) {
      console.error('Failed to load initial lobbies:', error)
      setFilter('all')
    } finally {
      setLoading(false)
    }
  }

  const loadLobbies = async () => {
    try {
      setLoading(true)
      const params = filter !== 'all' && filter !== 'my' ? { status: filter } : {}
      const response = await lobbyAPI.getLobbies(params)
      setLobbies(response.data.tournaments || [])
    } catch (error) {
      console.error('Failed to load lobbies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinClick = (lobbyId) => {
    if (!isAuthenticated) {
      alert('Пожалуйста, войдите в систему через Telegram для участия');
      return;
    }

    const lobby = lobbies.find(l => l.id === lobbyId);
    if (lobby && lobby.is_private) {
      setPasswordModal({ isOpen: true, lobbyId });
    } else {
      submitJoin(lobbyId);
    }
  }

  const submitJoin = async (lobbyId, password = null) => {
    try {
      setJoiningId(lobbyId);
      await lobbyAPI.joinLobby(lobbyId, password);
      await loadLobbies();
      setPasswordModal({ isOpen: false, lobbyId: null });
    } catch (error) {
      console.error('Failed to join lobby:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Не удалось присоединиться';
      alert(errorMessage);
    } finally {
      setJoiningId(null);
    }
  }

  const handleLeave = async (lobbyId) => {
    if (!isAuthenticated) return;
    if (!window.confirm('Вы уверены, что хотите покинуть лобби?')) return;
    try {
      setJoiningId(lobbyId);
      await lobbyAPI.leaveLobby(lobbyId);
      await loadLobbies();
    } catch (error) {
      console.error('Failed to leave lobby:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Не удалось покинуть лобби';
      alert(errorMessage);
    } finally {
      setJoiningId(null);
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'registering': return 'text-black bg-cs-orange border-cs-orange'
      case 'drafting': return 'text-white bg-purple-600 border-purple-600'
      case 'in_progress': return 'text-white bg-cs-blue border-cs-blue'
      case 'completed': return 'text-cs-text bg-neutral-800 border-neutral-700'
      case 'finished': return 'text-cs-text bg-neutral-800 border-neutral-700'
      case 'cancelled': return 'text-red-400 bg-red-900/50 border-red-900'
      default: return 'text-cs-text bg-neutral-800 border-neutral-700'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'registering': return 'Регистрация'
      case 'drafting': return 'Идет драфт'
      case 'in_progress': return 'Идет игра'
      case 'completed': return 'Завершен'
      case 'finished': return 'Завершен'
      case 'cancelled': return 'Отменен'
      default: return status
    }
  }

  const getFormatColor = (format) => {
    switch (format) {
      case 'BO1': return 'bg-cs-blue/10 text-cs-blue border-cs-blue/20'
      case 'BO3': return 'bg-cs-orange/10 text-cs-orange border-cs-orange/20'
      case 'BO5': return 'bg-red-500/10 text-red-500 border-red-500/20'
      default: return 'bg-white/5 text-cs-text border-white/10'
    }
  }

  const filteredLobbies = lobbies
    .filter(t => filter === 'my' ? t.is_joined : true)
    .filter(t => (filter !== 'all' && filter !== 'my') ? t.status === filter : true)
    .filter(t => searchQuery ? t.name.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    .filter(t => formatFilter !== 'all' ? t.format === formatFilter : true)
    .sort((a, b) => {
      if (sortBy === 'date_new') return new Date(b.date_time) - new Date(a.date_time)
      if (sortBy === 'date_old') return new Date(a.date_time) - new Date(b.date_time)
      if (sortBy === 'participants') return (b.current_participants || 0) - (a.current_participants || 0)

      if (sortBy === 'priority') {
        // 1. Status Weight
        const getWeight = (s) => {
          if (s === 'drafting') return 1
          if (s === 'in_progress') return 2
          if (s === 'registering') return 3
          return 4 // finished, completed, cancelled
        }
        const wA = getWeight(a.status)
        const wB = getWeight(b.status)
        if (wA !== wB) return wA - wB

        // 2. Date Sorting
        const dateA = new Date(a.date_time)
        const dateB = new Date(b.date_time)

        // If finished, show recent first. If active/upcoming, show soonest first.
        if (wA === 4) {
          return dateB - dateA
        }
        return dateA - dateB
      }
      return 0
    })

  const counts = {
    registering: lobbies.filter(t => t.status === 'registering').length,
    drafting: lobbies.filter(t => t.status === 'drafting').length,
    in_progress: lobbies.filter(t => t.status === 'in_progress').length,
    my: lobbies.filter(t => t.is_joined).length,
    all: lobbies.length
  }

  const sortOptions = [
    { value: 'priority', label: 'По умолчанию' },
    { value: 'date_new', label: 'Сначала новые' },
    { value: 'date_old', label: 'Сначала старые' },
    { value: 'participants', label: 'По участникам' },
  ]

  return (
    <div className="min-h-screen bg-cs-dark text-white font-sans selection:bg-cs-orange/30 relative overflow-hidden pt-10">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-cs-grid-bg opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-cs-dark/80 via-cs-dark/90 to-cs-dark"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <Breadcrumbs />
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6">
          <div className="text-left">
            {/*<div className="inline-flex items-center gap-2 px-3 py-1 mb-4 border-l-4 border-cs-orange bg-white/5">
              <span className="text-cs-orange font-bold tracking-widest uppercase text-xs">LOBBIES</span>
            </div>*/}
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tighter uppercase">ЛОББИ</h1>
            <p className="text-cs-text text-lg max-w-2xl font-medium">Присоединяйтесь к матчам, доказывайте свое мастерство и выигрывайте.</p>
          </div>
          {user?.role >= 1 && (
            <Link to="/lobbies/create" className="w-full md:w-auto cs-button bg-cs-orange hover:bg-yellow-400 text-black font-black uppercase tracking-wider py-2 px-4 skew-x-[-10deg] transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(233,177,14,0.2)] whitespace-nowrap flex items-center justify-center gap-2 text-sm">
              <span className="skew-x-[10deg] flex items-center gap-2"><Plus className="w-4 h-4" /> Создать Лобби</span>
            </Link>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 space-y-4">
          <div className="relative skew-x-[-10deg]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cs-text skew-x-[10deg]" />
            <input
              type="text"
              placeholder="ПОИСК ЛОББИ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 px-12 py-3 text-white placeholder-cs-text focus:outline-none focus:border-cs-orange/50 transition-colors uppercase tracking-wider font-bold text-sm skew-x-[10deg]"
            />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="flex flex-wrap items-center p-1 bg-black/40 border border-white/5 skew-x-[-10deg] w-full md:w-auto">
            {[
              ...(isAuthenticated ? [{ value: 'my', label: 'Мои', count: counts.my, icon: Star }] : []),
              { value: 'registering', label: 'Регистрация', count: counts.registering },
              { value: 'drafting', label: 'Драфт', count: counts.drafting },
              { value: 'in_progress', label: 'Идут', count: counts.in_progress, isLive: true },
              { value: 'all', label: 'Все', count: counts.all }
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

          {/* Sort Dropdown */}
          <div className="relative z-20 w-full md:w-auto">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="w-full md:w-auto justify-between md:justify-start px-4 py-2 skew-x-[-10deg] bg-white/5 border border-white/10 hover:border-white/30 text-white text-[11px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <span className="skew-x-[10deg] flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-cs-orange" />
                {sortOptions.find(o => o.value === sortBy)?.label}
              </span>
            </button>

            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-full md:w-48 bg-cs-surface border border-white/10 shadow-xl z-50 py-2"
                >
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => { setSortBy(option.value); setIsSortOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors ${sortBy === option.value ? 'text-cs-orange bg-white/5' : 'text-cs-text hover:text-white hover:bg-white/5'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-cs-orange" /></div>
        ) : filteredLobbies.length > 0 ? (
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-1 gap-4">
            <AnimatePresence mode='wait'>
              {filteredLobbies.map((lobby) => {
                const isUpcoming = new Date(lobby.date_time) > new Date()
                const showTimer = isUpcoming && lobby.status === 'registering'
                return (
                  <motion.div key={lobby.id} variants={fadeInUp} layout className={`group relative bg-cs-surface border p-1 transition-all duration-300 clip-path-slant ${lobby.is_joined ? 'border-green-500/50 shadow-[0_0_20px_rgba(74,222,128,0.1)]' : 'border-white/5 hover:border-cs-orange/50'}`}>
                    <Link to={`/lobbies/${lobby.id}`} className="relative bg-gradient-to-r from-neutral-800 to-cs-surface p-2.5 md:p-3 h-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 overflow-hidden">
                      {lobby.image_url && (
                        <div className="absolute inset-0 z-0">
                          <img src={lobby.image_url} className="w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity" />
                          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/80 to-neutral-900/20"></div>
                        </div>
                      )}

                      {lobby.is_joined && (
                        <div className="absolute top-0 right-0 p-2 z-20">
                          <div className="bg-green-500 text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider skew-x-[-10deg] flex items-center gap-1">
                            <span className="skew-x-[10deg] flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Участвую</span>
                          </div>
                        </div>
                      )}

                      <div className="flex-1 relative z-10">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border ${getStatusColor(lobby.status)} skew-x-[-10deg] inline-block`}>
                            <span className="skew-x-[10deg] block">{getStatusText(lobby.status)}</span>
                          </span>
                          <div className={`flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border skew-x-[-10deg] ${getFormatColor(lobby.format)}`}>
                            <span className="skew-x-[10deg] flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              {lobby.format}
                            </span>
                          </div>
                          {lobby.is_private && (
                            <div className="flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-red-500/30 bg-red-500/10 text-red-400 skew-x-[-10deg]">
                              <span className="skew-x-[10deg] flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Private
                              </span>
                            </div>
                          )}
                        </div>
                        <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tighter group-hover:text-cs-orange transition-colors duration-300">{lobby.name}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-cs-text font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-cs-blue" />
                            <span className="font-mono text-white">{lobby.date_time ? new Date(lobby.date_time).toLocaleString('ru-RU', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBA'}</span>
                          </div>
                          {showTimer && <CountdownTimer dateTime={lobby.date_time} />}
                        </div>
                      </div>

                      <div className="w-full lg:w-48 relative z-10">
                        <ParticipantsProgress current={lobby.current_participants || 0} max={lobby.max_participants} />
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-black/20 border border-white/5 clip-path-slant">
            <div className="bg-white/5 w-20 h-20 flex items-center justify-center mx-auto mb-6 skew-x-[-10deg] border border-white/10">
              <Search className="w-10 h-10 text-cs-text skew-x-[10deg]" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wider">Лобби не найдены</h3>
            <p className="text-cs-text max-w-md mx-auto">{searchQuery ? `По запросу "${searchQuery}" ничего не найдено` : filter === 'my' ? 'Вы еще не участвуете в лобби' : filter === 'all' ? 'В данный момент нет доступных лобби. Загляните позже!' : `Нет лобби со статусом "${getStatusText(filter).toLowerCase()}". Попробуйте изменить фильтр.`}</p>
          </motion.div>
        )}
      </div>
      {/* Password Modal */}
      <PasswordModal
        isOpen={passwordModal.isOpen}
        onClose={() => setPasswordModal({ isOpen: false, lobbyId: null })}
        onSubmit={(password) => submitJoin(passwordModal.lobbyId, password)}
      />
    </div>
  )
}

export default Lobbies
