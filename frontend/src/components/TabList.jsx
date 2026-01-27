import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const TabList = ({ tabs }) => {
    const location = useLocation();

    return (
        <div className="flex flex-wrap gap-2 mb-12">
            {tabs.map((tab) => {
                const isActive = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path));
                return (
                    <Link
                        key={tab.path}
                        to={tab.path}
                        className={`px-6 py-2.5 skew-x-[-10deg] text-sm font-black uppercase tracking-wider transition-all duration-300 border flex items-center gap-2 ${isActive
                            ? 'bg-cs-orange text-black border-cs-orange shadow-[0_0_15px_rgba(233,177,14,0.3)]'
                            : 'bg-white/5 text-cs-text border-white/5 hover:border-white/20 hover:text-white'
                            }`}
                    >
                        <span className="skew-x-[10deg] flex items-center gap-2">
                            {tab.icon && <tab.icon className="w-4 h-4" />}
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={`px-1.5 py-0.5 text-[10px] ${isActive ? 'bg-black/20' : 'bg-white/10'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
};

export default TabList;
