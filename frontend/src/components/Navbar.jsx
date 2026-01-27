import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { User, LogOut, Menu, ShieldAlert, Gamepad2 } from 'lucide-react'
import NotificationDropdown from './NotificationDropdown'

const Navbar = () => {
  const { user, isAuthenticated, logout, loginWithSteam } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navRef = useRef(null)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && navRef.current && !navRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  const navLinks = [
    { path: '/', label: 'ГЛАВНАЯ' },
    { path: '/lobbies', label: 'ЛОББИ' },
    { path: '/tournaments', label: 'ТУРНИРЫ' },
    { path: '/teams', label: 'КОМАНДЫ' },
    { path: '/players', label: 'РЕЙТИНГ' }
  ]

  return (
    <>
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-cs-dark/90 backdrop-blur-md border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Left Side: Logo & Mobile Menu */}
            <div className="flex items-center gap-3 md:gap-0">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-cs-orange text-black font-black px-1.5 py-0.5 md:px-2 md:py-1 skew-x-[-10deg] text-lg md:text-xl shadow-[0_0_15px_rgba(233,177,14,0.3)] group-hover:shadow-[0_0_25px_rgba(233,177,14,0.5)] transition-shadow">
                  <span className="skew-x-[10deg] block">CS2</span>
                </div>
                <span className="font-bold text-white tracking-widest text-xs md:text-lg group-hover:text-cs-text transition-colors hidden sm:block">
                  TOURNAMENTS
                </span>
              </Link>

              {/* Mobile Menu Button (Moved to left) */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-1.5 text-cs-text hover:text-white hover:bg-white/5 focus:outline-none ml-2 border border-white/10 skew-x-[-10deg]"
              >
                <Menu className="w-5 h-5 skew-x-[10deg]" />
              </button>
            </div>

            {/* Desktop Navigation (Center) */}
            <div className="hidden md:flex items-center space-x-1 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-1.5 text-xs font-bold transition-all duration-300 group uppercase tracking-widest ${location.pathname === link.path
                    ? 'text-white'
                    : 'text-cs-text hover:text-white'
                    }`}
                >
                  <span className="relative z-10">{link.label}</span>
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-white/5 border border-white/5 skew-x-[-10deg]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-cs-orange transition-all duration-300 transform scale-x-0 group-hover:scale-x-100 ${location.pathname === link.path ? 'scale-x-100' : ''}`}></div>
                </Link>
              ))}
            </div>

            {/* Right Side: User Actions */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* Desktop User Actions */}
                  <div className="hidden md:flex items-center space-x-3 pl-3 border-l border-white/10">
                    {user?.role === 2 && (
                      <Link
                        to="/admin"
                        className="text-cs-text hover:text-red-500 transition-colors p-2"
                        title="Панель Администратора"
                      >
                        <ShieldAlert className="w-5 h-5" />
                      </Link>
                    )}

                    <NotificationDropdown />

                    <Link
                      to="/profile"
                      className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-white/5 border border-white/5 hover:border-cs-orange/50 transition-all group skew-x-[-10deg]"
                    >
                      <div className="skew-x-[10deg] flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-cs-orange to-yellow-600 flex items-center justify-center text-black font-bold shadow-lg overflow-hidden">
                          {user?.avatar_medium ? (
                            <img src={user.avatar_medium} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-gray-200 group-hover:text-white max-w-[100px] truncate uppercase">
                          {user?.displayName || user?.nickname || 'Профиль'}
                        </span>
                      </div>
                    </Link>
                    <button
                      onClick={logout}
                      className="p-2 text-cs-text hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Выйти"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Mobile User Actions */}
                  <div className="flex md:hidden items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                    <NotificationDropdown />
                    <Link to="/profile" className="relative w-8 h-8 bg-white/5 border border-white/10 overflow-hidden skew-x-[-10deg]">
                      <div className="skew-x-[10deg] w-full h-full">
                        {user?.avatar_medium ? (
                          <img src={user.avatar_medium} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-cs-text">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                </>
              ) : (
                <button
                  onClick={loginWithSteam}
                  className="flex items-center space-x-2 bg-cs-orange hover:bg-yellow-400 text-black px-3 py-1.5 md:px-5 md:py-2 font-black shadow-[0_0_15px_rgba(233,177,14,0.3)] hover:shadow-[0_0_25px_rgba(233,177,14,0.5)] hover:-translate-y-0.5 transition-all duration-300 skew-x-[-10deg]"
                >
                  <div className="skew-x-[10deg] flex items-center gap-2 uppercase tracking-wider text-[10px] md:text-xs">
                    <Gamepad2 className="w-3 h-3 md:w-4 h-4" />
                    <span className="hidden sm:inline">Войти через Steam</span>
                    <span className="sm:hidden">Войти</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-cs-dark/95 backdrop-blur-xl border-t border-white/10">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-sm font-bold transition-all uppercase tracking-wider skew-x-[-5deg] ${location.pathname === link.path
                    ? 'bg-cs-orange/10 text-cs-orange border-l-2 border-cs-orange'
                    : 'text-cs-text hover:text-white hover:bg-white/5'
                    }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-white/10 my-4 pt-4 space-y-3">
                {isAuthenticated ? (
                  <>
                    {user?.role === 2 && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center px-4 py-3 bg-red-500/10 text-red-500 font-bold skew-x-[-5deg]"
                      >
                        <ShieldAlert className="w-5 h-5 mr-3" />
                        АДМИН ПАНЕЛЬ
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 bg-white/5 text-white font-bold skew-x-[-5deg]"
                    >
                      <User className="w-5 h-5 mr-3 text-cs-orange" />
                      {user?.displayName || user?.nickname || 'Профиль'}
                    </Link>
                    <button
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="w-full text-left flex items-center px-4 py-3 text-red-400 hover:bg-red-500/10 font-bold skew-x-[-5deg]"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      ВЫХОД
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { loginWithSteam(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center px-4 py-3 bg-cs-orange text-black font-black uppercase tracking-wider skew-x-[-5deg]"
                  >
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    ВОЙТИ ЧЕРЕЗ STEAM
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

export default Navbar