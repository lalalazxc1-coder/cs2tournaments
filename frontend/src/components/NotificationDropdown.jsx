import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, Trash2 } from 'lucide-react'
import { notificationAPI } from '../utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import socketService from '../utils/socket'
import { useAuth } from '../context/AuthContext'

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const dropdownRef = useRef(null)
    const navigate = useNavigate()
    const { user } = useAuth()

    const fetchNotifications = async () => {
        try {
            const res = await notificationAPI.getNotifications()
            setNotifications(res.data)
            setUnreadCount(res.data.filter(n => !n.is_read).length)
        } catch (err) {
            console.error(err)
        }
    }

    // WebSocket для реал-тайм уведомлений
    useEffect(() => {
        fetchNotifications()

        if (user?.id) {
            // Подключаемся к WebSocket
            socketService.connect();
            socketService.joinNotifications(user.id);

            // Слушаем новые уведомления
            const handleNewNotification = (notification) => {
                console.log('🔔 Получено новое уведомление:', notification);
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
            };

            socketService.on('notification:new', handleNewNotification);

            return () => {
                socketService.off('notification:new', handleNewNotification);
            };
        }
    }, [user?.id])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleMarkRead = async (id) => {
        try {
            await notificationAPI.markRead(id)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (err) {
            console.error(err)
        }
    }

    const handleReadAll = async () => {
        try {
            await notificationAPI.readAll()
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        } catch (err) {
            console.error(err)
        }
    }

    const handleClearRead = async () => {
        try {
            await notificationAPI.clearRead()
            setNotifications(prev => prev.filter(n => !n.is_read))
        } catch (err) {
            console.error(err)
        }
    }

    const handleClick = async (notification) => {
        if (!notification.is_read) {
            handleMarkRead(notification.id)
        }

        if (notification.link) {
            let link = notification.link;
            // Fix legacy links pointing to /profile/ instead of /user/
            if (link.startsWith('/profile/') && !['friends', 'teams', 'matches', 'tournaments', 'settings'].some(sub => link.includes(`/${sub}`))) {
                link = link.replace('/profile/', '/user/');
            }
            navigate(link)
            setIsOpen(false)
            return
        }

        if (notification.type === 'lobby_invite') {
            let lobbyId = notification.related_id;
            if (!lobbyId && notification.data) {
                try {
                    const data = typeof notification.data === 'string' ? JSON.parse(notification.data) : notification.data;
                    lobbyId = data.lobbyId;
                } catch (e) { }
            }
            if (lobbyId) {
                navigate(`/lobbies/${lobbyId}`);
                setIsOpen(false);
                return;
            }
        }

        if (notification.related_id) {
            if (notification.type === 'team_invite' || notification.type === 'team_add') {
                navigate(`/teams/${notification.related_id}`)
            } else if (['friend_request', 'friend_accept', 'friend_request_declined'].includes(notification.type)) {
                // For friend notifications, related_id is the user_id of the friend
                navigate(`/user/${notification.related_id}`)
            } else if (['wall_post', 'wall_comment', 'wall_like', 'like', 'comment'].includes(notification.type)) {
                // Navigate to the user's own profile where the wall is located
                navigate('/profile')
            } else if (notification.type === 'lobby_created' || (notification.type === 'info' && notification.message.toLowerCase().includes('лобби'))) {
                navigate(`/lobbies/${notification.related_id}`)
            } else {
                navigate(`/tournaments/${notification.related_id}`)
            }
            setIsOpen(false)
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-cs-text hover:text-white hover:bg-white/5 transition-colors skew-x-[-10deg]"
            >
                <div className="skew-x-[10deg]">
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-cs-orange rounded-full text-[10px] flex items-center justify-center text-black font-black border border-black">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-cs-surface border border-white/10 shadow-2xl overflow-hidden z-50 clip-path-slant"
                    >
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/50">
                            <h3 className="font-black text-white uppercase tracking-wider">Уведомления</h3>
                            <div className="flex gap-2">
                                {notifications.some(n => n.is_read) && (
                                    <button
                                        onClick={handleClearRead}
                                        className="text-xs text-red-500 hover:text-red-400 font-bold flex items-center uppercase tracking-wide"
                                        title="Удалить прочитанные"
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        Очистить
                                    </button>
                                )}
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleReadAll}
                                        className="text-xs text-cs-orange hover:text-yellow-400 font-bold flex items-center uppercase tracking-wide"
                                    >
                                        <Check className="w-3 h-3 mr-1" />
                                        Прочитать
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-cs-text text-sm font-medium uppercase tracking-wide">
                                    Нет новых уведомлений
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleClick(notification)}
                                            className={`p-4 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${!notification.is_read ? 'bg-cs-orange/5' : ''}`}
                                        >
                                            <div className={`w-2 h-2 mt-2 flex-shrink-0 skew-x-[-10deg] ${!notification.is_read ? 'bg-cs-orange' : 'bg-gray-600'}`} />
                                            <div>
                                                <p className={`text-sm ${!notification.is_read ? 'text-white font-bold' : 'text-cs-text'}`}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-cs-text/60 mt-1 font-mono">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default NotificationDropdown
