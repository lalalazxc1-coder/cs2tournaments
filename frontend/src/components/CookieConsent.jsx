import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false)
    const { termsAccepted } = useAuth()

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent')
        if (!consent && !termsAccepted) {
            setIsVisible(true)
        } else {
            setIsVisible(false)
        }
    }, [termsAccepted])

    const acceptCookies = () => {
        localStorage.setItem('cookieConsent', 'true')
        setIsVisible(false)
    }

    if (!isVisible) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-cs-surface/95 backdrop-blur-md border-t border-white/10 p-4 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-cs-text font-medium">
                    <p>
                        Мы используем файлы cookie для улучшения работы сайта и анализа трафика.
                        Продолжая использовать сайт, вы соглашаетесь с нашей{' '}
                        <Link to="/privacy" className="text-cs-orange hover:text-white transition-colors font-bold uppercase tracking-wide">
                            Политикой конфиденциальности
                        </Link>
                        .
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={acceptCookies}
                        className="px-6 py-2 bg-cs-orange hover:bg-yellow-400 text-black font-black uppercase tracking-wider skew-x-[-10deg] transition-colors text-sm whitespace-nowrap shadow-[0_0_10px_rgba(233,177,14,0.3)]"
                    >
                        <span className="skew-x-[10deg]">Принять</span>
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 hover:bg-white/10 transition-colors skew-x-[-10deg]"
                    >
                        <X className="w-5 h-5 text-cs-text skew-x-[10deg]" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CookieConsent
