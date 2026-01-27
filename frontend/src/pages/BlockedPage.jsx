import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut } from 'lucide-react';

const BlockedPage = () => {
    const { user, logout } = useAuth();

    if (!user || !user.is_blocked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Доступ разрешен</h1>
                    <p className="text-gray-400 mb-6">Вы не заблокированы. Перенаправление...</p>
                    <a href="/" className="px-6 py-2 bg-brand-primary text-black font-bold rounded-lg hover:bg-brand-primary/90 transition-colors">
                        На главную
                    </a>
                </div>
            </div>
        );
    }

    const blockedUntil = user.blocked_until ? new Date(user.blocked_until) : null;
    const isPermanent = !blockedUntil;

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white p-4">
            <div className="max-w-md w-full bg-neutral-800 rounded-xl border border-red-500/30 p-8 text-center shadow-2xl">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <ShieldAlert className="w-10 h-10" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">Аккаунт заблокирован</h1>
                <p className="text-gray-400 mb-6">
                    Ваш доступ к платформе был ограничен администратором.
                </p>

                <div className="bg-neutral-900/50 rounded-lg p-4 mb-8 border border-neutral-700">
                    <div className="text-sm text-gray-500 uppercase font-bold mb-1">Срок блокировки</div>
                    <div className="text-xl font-bold text-white">
                        {isPermanent ? (
                            <span className="text-red-500">Навсегда</span>
                        ) : (
                            <span>до {blockedUntil.toLocaleDateString()} {blockedUntil.toLocaleTimeString()}</span>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={logout}
                        className="w-full py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center"
                    >
                        <LogOut className="w-5 h-5 mr-2" />
                        Выйти из аккаунта
                    </button>

                    <a
                        href="/help"
                        className="block w-full py-3 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        Связаться с поддержкой
                    </a>
                </div>
            </div>
        </div>
    );
};

export default BlockedPage;
