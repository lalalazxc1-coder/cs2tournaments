import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { dashboardAPI } from '../utils/api'
import usePageTitle from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'
import GlitchText from '../components/GlitchText'
import {
  BarChart2, UserCheck, History, Zap,
  Swords, Loader2, Crosshair, Trophy,
  Shield, Target, Users, Medal, ChevronRight,
  Gamepad2, Flag, Star
} from 'lucide-react'

// --- Анимационные варианты ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const LandingPage = () => {
  usePageTitle('Главная')
  const [topPlayers, setTopPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const playersRes = await dashboardAPI.getTopPlayers(3)
        if (playersRes.data && playersRes.data.players) {
          setTopPlayers(playersRes.data.players)
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const features = [
    { icon: Trophy, title: 'ТУРНИРЫ', desc: 'Ежедневные кубки, лиги и крупные ивенты с призовыми.', color: 'text-cs-orange' },
    { icon: Gamepad2, title: 'ЛОББИ 5x5', desc: 'Создавай матчи 5 на 5, тренируйся или играй миксы.', color: 'text-cs-blue' },
    { icon: Flag, title: 'КОМАНДЫ', desc: 'Собери свой состав, управляй ростером и побеждай.', color: 'text-green-500' },
    { icon: BarChart2, title: 'СТАТИСТИКА', desc: 'Твой личный прогресс и детальная статистика.', color: 'text-purple-500' },
    { icon: UserCheck, title: 'ПРОФИЛЬ ИГРОКА', desc: 'Привязка Steam ID. Твоя полная история матчей.', color: 'text-gray-400' },
    { icon: Zap, title: 'БЫСТРЫЙ СТАРТ', desc: 'Мгновенная регистрация команд и игроков на турниры.', color: 'text-yellow-400' }
  ]

  const renderTopPlayer = (player, index) => {
    const rank = index + 1;
    const isFirst = rank === 1;

    // Podium styling configuration
    const config = {
      1: {
        height: "h-[380px] md:h-[420px]",
        width: "w-full max-w-[300px] md:w-80",
        border: "border-yellow-500",
        glow: "shadow-[0_0_50px_rgba(234,179,8,0.2)]",
        bg: "bg-gradient-to-b from-yellow-500/10 to-black/80",
        text: "text-yellow-500",
        badge: "bg-yellow-500 text-black",
        icon: "text-yellow-400",
        scale: "md:-mt-12 z-20"
      },
      2: {
        height: "h-[340px] md:h-[360px]",
        width: "w-full max-w-[280px] md:w-72",
        border: "border-gray-400",
        glow: "shadow-[0_0_30px_rgba(156,163,175,0.1)]",
        bg: "bg-gradient-to-b from-gray-400/10 to-black/80",
        text: "text-gray-400",
        badge: "bg-gray-400 text-black",
        icon: "text-gray-300",
        scale: "z-10"
      },
      3: {
        height: "h-[340px] md:h-[360px]",
        width: "w-full max-w-[280px] md:w-72",
        border: "border-orange-700",
        glow: "shadow-[0_0_30px_rgba(194,65,12,0.1)]",
        bg: "bg-gradient-to-b from-orange-700/10 to-black/80",
        text: "text-orange-700",
        badge: "bg-orange-700 text-white",
        icon: "text-orange-600",
        scale: "z-10"
      }
    }[rank] || {
      height: "h-80",
      width: "w-72",
      border: "border-white/10",
      glow: "",
      bg: "bg-white/5",
      text: "text-white",
      badge: "bg-white/10",
      icon: "text-white",
      scale: ""
    };

    const profileId = (player.custom_url && !player.custom_url.includes('/')) ? player.custom_url : player.id || player.steam_id;

    return (
      <motion.div
        key={index}
        variants={fadeInUp}
        className={`relative group cursor-pointer transition-all duration-500 ${config.width} ${config.scale}`}
      >
        <Link to={`/user/${profileId}`} className="block h-full">
          <div className={`h-full bg-cs-surface border ${config.border} ${config.glow} relative overflow-hidden clip-path-slant transition-transform duration-300 group-hover:-translate-y-2 flex flex-col`}>

            {/* Background Gradient & Effects */}
            <div className={`absolute inset-0 ${config.bg} opacity-50`}></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

            {/* Rank Badge */}
            <div className="absolute top-0 left-0 z-20">
              <div className={`${config.badge} px-4 py-2 font-black uppercase tracking-widest text-sm skew-x-[-10deg] origin-top-left shadow-lg`}>
                <span className="skew-x-[10deg] block">TOP {rank}</span>
              </div>
            </div>

            {/* Avatar Section */}
            <div className="relative flex-1 flex items-center justify-center pt-8 pb-4 overflow-hidden">
              {isFirst && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                  <Trophy className={`w-8 h-8 ${config.icon} drop-shadow-[0_0_10px_rgba(234,179,8,0.5)] animate-pulse`} />
                </div>
              )}

              <div className={`relative w-32 h-32 md:w-40 md:h-40`}>
                <div className={`absolute inset-0 border-2 ${config.border} rotate-45 transition-transform duration-700 group-hover:rotate-90`}></div>
                <div className={`absolute inset-0 border-2 ${config.border} -rotate-12 opacity-50`}></div>
                <img
                  src={player.avatar_url || `https://ui-avatars.com/api/?name=${player.name}&background=random`}
                  alt={player.name}
                  className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-cover shadow-2xl"
                />
              </div>
            </div>

            {/* Info Section */}
            <div className="relative z-10 p-6 bg-black/40 backdrop-blur-sm border-t border-white/5">
              <h3 className={`text-2xl font-black uppercase tracking-wider mb-4 text-center truncate ${isFirst ? 'text-white' : 'text-gray-200'}`}>
                {player.name}
              </h3>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-cs-text font-bold uppercase tracking-wider">K/D</span>
                  <span className={`font-black text-lg ${config.text}`}>{player.kd_ratio?.toFixed(2)}</span>
                </div>
                <div className="flex flex-col gap-1 border-x border-white/10">
                  <span className="text-[10px] text-cs-text font-bold uppercase tracking-wider">Win Rate</span>
                  <span className="font-black text-lg text-white">{player.win_rate}%</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-cs-text font-bold uppercase tracking-wider">Матчи</span>
                  <span className="font-black text-lg text-white">{player.matches}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="bg-cs-dark text-white min-h-screen font-sans selection:bg-cs-orange/30 overflow-x-hidden">

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/video.mp4" type="video/mp4" />
          </video>

          {/* Overlay 70% */}
          <div className="absolute inset-0 bg-black/70"></div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-cs-grid-bg opacity-20"></div>

          {/* Bottom fade */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cs-dark/50 to-cs-dark"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Text Content - Centered if no visual card */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-12 text-center flex flex-col items-center -mt-12 md:-mt-20"
          >
            <div className="w-full max-w-7xl mx-auto mb-8">
              <Breadcrumbs />
            </div>

            {/* Logo/Image Section */}
            <motion.div variants={fadeInUp} className="mb-8">
              <img
                src="/land.png"
                alt="CS2 Tournaments"
                className="w-auto h-40 md:h-56 mx-auto object-contain drop-shadow-[0_0_35px_rgba(233,177,14,0.4)] hover:scale-105 transition-transform duration-500"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 mb-6 border-l-4 border-cs-orange bg-white/5">
              <span className="text-cs-orange font-bold tracking-widest uppercase text-xs">Киберспортивная Платформа</span>
            </motion.div>

            <motion.div variants={fadeInUp} className="mb-6">
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none text-white">
                <GlitchText text="БОЛЬШЕ ЧЕМ" className="inline-block mr-4 mb-2" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cs-orange to-yellow-200">ПРОСТО ИГРА</span>
              </h1>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-lg md:text-xl text-cs-text max-w-3xl mb-10 font-medium leading-relaxed flex flex-col gap-2">
              <p>
                Присоединяйся к сообществу лучших. Организуй свой турнир, играй командные матчи или сражайся за призы в наших ивентах. Умные сетки. Честный рейтинг.
              </p>
              <p>
                Все условия для профессионального роста твоего состава.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4 mb-12">
              <Link to="/tournaments" className="cs-button bg-cs-orange hover:bg-yellow-400 text-black font-black uppercase tracking-wider py-4 px-8 skew-x-[-10deg] inline-flex items-center gap-2 transition-transform hover:scale-105">
                <span className="skew-x-[10deg] flex items-center gap-2"><Trophy className="w-5 h-5" /> Турниры</span>
              </Link>
              <Link to="/lobbies" className="cs-button bg-cs-blue hover:bg-blue-500 text-white font-black uppercase tracking-wider py-4 px-8 skew-x-[-10deg] inline-flex items-center gap-2 transition-transform hover:scale-105">
                <span className="skew-x-[10deg] flex items-center gap-2"><Gamepad2 className="w-5 h-5" /> Лобби 5x5</span>
              </Link>
              <Link to="/teams/create" className="cs-button bg-transparent border border-white/20 hover:border-white text-white font-bold uppercase tracking-wider py-4 px-8 skew-x-[-10deg] inline-flex items-center gap-2 transition-all hover:bg-white/5">
                <span className="skew-x-[10deg] flex items-center gap-2"><Flag className="w-5 h-5" /> Создать Команду</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`group bg-cs-surface border border-white/5 p-8 hover:border-cs-orange/50 transition-colors duration-300 relative overflow-hidden ${feature.featured ? 'bg-gradient-to-br from-cs-surface to-cs-orange/5 border-cs-orange/20' : ''}`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <feature.icon className="w-24 h-24" />
                </div>

                <div className={`w-12 h-12 ${feature.featured ? 'bg-cs-orange text-black' : 'bg-white/5 text-white'} flex items-center justify-center mb-6 skew-x-[-10deg]`}>
                  <feature.icon className="w-6 h-6 skew-x-[10deg]" />
                </div>

                <h3 className="text-xl font-black uppercase mb-3 tracking-wide">{feature.title}</h3>
                <p className="text-cs-text leading-relaxed text-sm font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- HALL OF FAME --- */}
      <section className="py-12 md:py-24 bg-black/20 relative border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 md:mb-16 gap-6 text-center md:text-left">
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2">
                ЗАЛ <span className="text-cs-orange">СЛАВЫ</span>
              </h2>
              <p className="text-cs-text font-medium text-sm md:text-base">Элита нашей платформы.</p>
            </div>
            <Link to="/players" className="flex items-center gap-2 text-cs-orange font-bold uppercase tracking-wider hover:text-white transition-colors text-sm md:text-base">
              Все Игроки <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cs-orange" />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 items-center md:justify-center md:items-end">
              {topPlayers.slice(0, 3).map((player, index) => renderTopPlayer(player, index))}
            </div>
          )}
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-cs-blue/5"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8">
            ГОТОВ К <span className="text-cs-blue">СОРЕВНОВАНИЯМ?</span>
          </h2>
          <p className="text-xl text-cs-text max-w-2xl mx-auto mb-12">
            Стань частью элиты. Покажи свой скилл и забирай реальные призы.
          </p>
          <Link to="/tournaments" className="cs-button bg-white text-black hover:bg-cs-blue hover:text-white font-black uppercase tracking-wider py-5 px-12 skew-x-[-10deg] inline-block transition-all">
            <span className="skew-x-[10deg] block">НАЙТИ ТУРНИР</span>
          </Link>
        </div>
      </section>

    </div>
  )
}

export default LandingPage