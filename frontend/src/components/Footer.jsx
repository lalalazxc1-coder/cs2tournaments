import { Link } from 'react-router-dom'
import { Send, Instagram } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="py-6 px-4 border-t border-white/5 bg-cs-dark relative overflow-hidden mt-auto">
            {/* Decorative line */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cs-orange/30 to-transparent"></div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">

                {/* Logo & Copyright */}
                <div className="flex flex-col items-center md:items-start gap-1">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-cs-orange text-black font-black px-1.5 py-0.5 skew-x-[-10deg] text-sm shadow-[0_0_10px_rgba(233,177,14,0.2)] group-hover:shadow-[0_0_15px_rgba(233,177,14,0.4)] transition-shadow">
                            <span className="skew-x-[10deg] block">CS2</span>
                        </div>
                        <span className="font-bold text-white tracking-widest text-sm group-hover:text-cs-text transition-colors">
                            TOURNAMENTS
                        </span>
                    </Link>
                    <p className="text-[10px] text-cs-text font-medium uppercase tracking-wider">
                        © 2025 CS2TOURNAMENTS.ASIA
                    </p>
                </div>

                {/* Links */}
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-bold tracking-wide text-cs-text uppercase">
                    <Link to="/privacy" className="hover:text-cs-orange transition-colors duration-300">Конфиденциальность</Link>
                    <Link to="/terms" className="hover:text-cs-orange transition-colors duration-300">Соглашение</Link>
                    <Link to="/rules" className="hover:text-cs-orange transition-colors duration-300">Правила</Link>
                    <Link to="/help" className="hover:text-cs-orange transition-colors duration-300">FAQ</Link>
                    <a href="mailto:support@cs2tournaments.asia" target="_blank" rel="noopener noreferrer" className="hover:text-cs-orange transition-colors duration-300">Поддержка</a>
                </div>

                {/* Socials */}
                <div className="flex gap-4">
                    <a href={import.meta.env.VITE_TELEGRAM_LINK} target="_blank" rel="noopener noreferrer" className="text-cs-text hover:text-cs-orange transition-colors">
                        <Send className="w-4 h-4" />
                    </a>
                    <a href={import.meta.env.VITE_INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" className="text-cs-text hover:text-cs-orange transition-colors">
                        <Instagram className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </footer>
    )
}

export default Footer
