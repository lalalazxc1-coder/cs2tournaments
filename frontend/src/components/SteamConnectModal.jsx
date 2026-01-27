import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const SteamConnectModal = ({ isOpen, onClose }) => {
    const { user, login } = useAuth()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const handleMessage = async (event) => {
            if (event.data && event.data.type === 'STEAM_AUTH_SUCCESS') {
                const steamId = event.data.steamId;
                setLoading(true);
                try {
                    // Link Steam ID to current user
                    const response = await axios.post('/api/user/set_steam_id', { steam_id: steamId });
                    if (response.data.success) {
                        // Reload page to refresh user data or update context
                        window.location.reload();
                    }
                } catch (error) {
                    console.error('Failed to link Steam ID:', error);
                    alert('Ошибка привязке Steam ID: ' + (error.response?.data?.message || error.message));
                } finally {
                    setLoading(false);
                    onClose();
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onClose]);

    const handleSteamLogin = () => {
        const width = 800;
        const height = 600;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        window.open(
            '/api/auth/steam',
            'SteamAuth',
            `width=${width},height=${height},top=${top},left=${left}`
        );
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-cs-surface border border-white/10 p-8 max-w-md w-full shadow-2xl clip-path-slant"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-[#171a21]/50 flex items-center justify-center mx-auto mb-4 border border-[#171a21] skew-x-[-10deg]">
                            <svg className="w-8 h-8 text-white skew-x-[10deg]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.979 0C5.666 0 .506 4.936.042 11.173l4.35 6.364c.066-.013.13-.028.197-.038l2.972-4.265c-.115-.595-.023-1.22.28-1.76.43-.765 1.252-1.185 2.088-1.07.228.03.448.093.654.18l3.35-4.808c-.02-.21-.033-.423-.033-.638 0-3.422 2.77-6.194 6.184-6.194 1.232 0 2.38.358 3.352.973C21.36 4.17 17.07 0 11.98 0zm8.105 5.92c-2.203 0-3.99 1.788-3.99 3.992 0 .42.068.823.19 1.203l-3.37 4.837c-.52-.18-1.085-.19-1.616.02l-2.95 4.232c-.17.243-.315.503-.433.778l-.56-1.12c-.36-.718-1.23-1.007-1.948-.647-.717.36-1.006 1.23-.646 1.947l2.06 4.12c1.39 1.63 3.44 2.67 5.73 2.69 4.12.03 7.48-3.29 7.51-7.41.01-2.29-1.03-4.34-2.66-5.73l-1.12.56c-.718.36-1.588.07-1.948-.647-.36-.717-.07-1.588.648-1.948l4.23-2.95c-.276-.118-.536-.263-.78-.432l-4.836-3.37c-.38.122-.783.19-1.203.19zm-.58 2.14c1.02 0 1.85.83 1.85 1.85 0 1.02-.83 1.85-1.85 1.85-1.02 0-1.85-.83-1.85-1.85 0-1.02.83-1.85 1.85-1.85z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Привязка Steam</h3>
                        <p className="text-cs-text font-medium">
                            Для участия в турнирах и просмотра статистики необходимо привязать аккаунт Steam.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleSteamLogin}
                            disabled={loading}
                            className="w-full bg-[#171a21] hover:bg-[#2a475e] text-white font-bold py-3.5 transition-all border border-white/10 flex items-center justify-center gap-2 skew-x-[-5deg] uppercase tracking-wider"
                        >
                            <span className="skew-x-[5deg]">
                                {loading ? 'Привязка...' : 'Войти через Steam'}
                            </span>
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full bg-transparent hover:bg-white/5 text-cs-text hover:text-white font-bold py-3.5 transition-all skew-x-[-5deg] uppercase tracking-wider"
                        >
                            <span className="skew-x-[5deg]">Позже</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SteamConnectModal;
