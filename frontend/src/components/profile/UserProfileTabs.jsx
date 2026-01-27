import React from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, Users, Swords, Trophy, Shield, Settings } from 'lucide-react';

const UserProfileTabs = ({ profile, isOwner }) => {
    return (
        <div className="grid grid-cols-2 gap-2 md:flex md:gap-2 mb-6 overflow-x-visible">
            <NavLink
                to=""
                end
                className={({ isActive }) => `px-3 py-3 md:px-6 md:py-2 font-bold uppercase tracking-wider skew-x-[-10deg] transition-all flex items-center justify-center md:justify-start gap-2 text-[10px] md:text-sm ${isActive ? 'bg-cs-orange text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
            >
                <span className="skew-x-[10deg] flex items-center gap-1 md:gap-2"><MessageSquare className="w-3 h-3 md:w-4 md:h-4" /> Стена ({profile.wall_posts_count || 0})</span>
            </NavLink>
            <NavLink
                to="friends"
                className={({ isActive }) => `px-3 py-3 md:px-6 md:py-2 font-bold uppercase tracking-wider skew-x-[-10deg] transition-all flex items-center justify-center md:justify-start gap-2 text-[10px] md:text-sm ${isActive ? 'bg-cs-orange text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
            >
                <span className="skew-x-[10deg] flex items-center gap-1 md:gap-2"><Users className="w-3 h-3 md:w-4 md:h-4" /> Друзья ({profile.friends?.filter(f => !f.friendship_status || f.friendship_status === 'accepted' || f.friendship_status === 'friends').length || 0})</span>
            </NavLink>
            <NavLink
                to="matches"
                className={({ isActive }) => `px-3 py-3 md:px-6 md:py-2 font-bold uppercase tracking-wider skew-x-[-10deg] transition-all flex items-center justify-center md:justify-start gap-2 text-[10px] md:text-sm ${isActive ? 'bg-cs-orange text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
            >
                <span className="skew-x-[10deg] flex items-center gap-1 md:gap-2"><Swords className="w-3 h-3 md:w-4 md:h-4" /> Матчи ({profile.user.tournaments_count || 0})</span>
            </NavLink>
            <NavLink
                to="tournaments"
                className={({ isActive }) => `px-3 py-3 md:px-6 md:py-2 font-bold uppercase tracking-wider skew-x-[-10deg] transition-all flex items-center justify-center md:justify-start gap-2 text-[10px] md:text-sm ${isActive ? 'bg-cs-orange text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
            >
                <span className="skew-x-[10deg] flex items-center gap-1 md:gap-2"><Trophy className="w-3 h-3 md:w-4 md:h-4" /> Турниры ({profile.tournaments?.length || 0})</span>
            </NavLink>
            <NavLink
                to="teams"
                className={({ isActive }) => `px-3 py-3 md:px-6 md:py-2 font-bold uppercase tracking-wider skew-x-[-10deg] transition-all flex items-center justify-center md:justify-start gap-2 text-[10px] md:text-sm ${isActive ? 'bg-cs-orange text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
            >
                <span className="skew-x-[10deg] flex items-center gap-1 md:gap-2"><Shield className="w-3 h-3 md:w-4 md:h-4" /> Команды ({profile.teams?.length || 0})</span>
            </NavLink>
            {isOwner && (
                <NavLink
                    to="settings"
                    className={({ isActive }) => `px-3 py-3 md:px-6 md:py-2 font-bold uppercase tracking-wider skew-x-[-10deg] transition-all flex items-center justify-center md:justify-start gap-2 text-[10px] md:text-sm ${isActive ? 'bg-cs-orange text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                >
                    <span className="skew-x-[10deg] flex items-center gap-1 md:gap-2"><Settings className="w-3 h-3 md:w-4 md:h-4" /> Настройки</span>
                </NavLink>
            )}
        </div>
    );
};

export default UserProfileTabs;
