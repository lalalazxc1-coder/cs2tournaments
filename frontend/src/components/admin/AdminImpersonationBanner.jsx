import React from 'react';
import { Shield, LogOut } from 'lucide-react';

const AdminImpersonationBanner = () => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) return null;

    const handleReturnToAdmin = () => {
        localStorage.setItem('token', adminToken);
        localStorage.removeItem('adminToken');
        window.location.href = '/admin';
    };

    return (
        <div className="fixed bottom-4 right-4 z-[9999] animate-bounce-in">
            <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-white/20 flex items-center gap-4 skew-x-[-5deg]">
                <div className="skew-x-[5deg] flex items-center gap-4">
                    <div className="bg-white/20 p-2 rounded-full">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="font-black uppercase tracking-wider text-sm">Режим просмотра</div>
                        <div className="text-xs opacity-80">Вы вошли как другой пользователь</div>
                    </div>
                    <button
                        onClick={handleReturnToAdmin}
                        className="ml-4 bg-white text-red-600 px-4 py-2 font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors rounded shadow-lg flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Вернуться
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminImpersonationBanner;
