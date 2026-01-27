import React from 'react';
import { Shield } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';

const PrivateProfileView = ({ userData }) => {
    return (
        <div className="min-h-screen bg-cs-dark text-white font-sans selection:bg-cs-orange/30 relative overflow-hidden px-4 pt-10">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cs-grid-bg opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-cs-dark/80 via-cs-dark/90 to-cs-dark"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto py-12">
                <Breadcrumbs lastBreadcrumbLabel={`Профиль игрока - ${userData.nickname}`} />

                <div className="bg-cs-surface border border-white/10 p-8 mb-6 clip-path-slant relative overflow-hidden flex flex-col items-center text-center">
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-black border-2 border-white/10 skew-x-[-5deg] overflow-hidden mb-6">
                        <img
                            src={userData.avatar_full || userData.avatar_medium || '/defolt.png'}
                            alt="Avatar"
                            className="w-full h-full object-cover skew-x-[5deg] scale-110"
                        />
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
                        {userData.nickname}
                    </h1>
                    <div className="flex items-center gap-2 text-cs-text mb-6">
                        <Shield className="w-5 h-5" />
                        <span className="font-bold uppercase tracking-wider">Профиль скрыт настройками приватности</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivateProfileView;
