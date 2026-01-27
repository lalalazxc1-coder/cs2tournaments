import React, { useState, useEffect } from 'react';
import { teamAPI } from '../../utils/api';
import { Shield, Users, Crown, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const TeamDetailsModal = ({ isOpen, onClose, teamId }) => {
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && teamId) {
            loadTeam();
        } else {
            setTeam(null);
            setLoading(true);
        }
    }, [isOpen, teamId]);

    const loadTeam = async () => {
        try {
            setLoading(true);
            const response = await teamAPI.getTeam(teamId);
            setTeam(response.data);
        } catch (err) {
            setError('Не удалось загрузить информацию о команде');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative bg-cs-surface border border-white/10 max-w-2xl w-full shadow-2xl clip-path-slant overflow-hidden"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {loading ? (
                            <div className="p-12 flex justify-center">
                                <Loader2 className="w-10 h-10 animate-spin text-cs-orange" />
                            </div>
                        ) : error ? (
                            <div className="p-12 text-center text-red-500 font-bold uppercase">{error}</div>
                        ) : team ? (
                            <div>
                                {/* Header */}
                                <div className="bg-gradient-to-r from-neutral-800 to-cs-surface p-8 relative">
                                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                                        <div className="w-24 h-24 bg-black/50 flex items-center justify-center border border-white/10 shadow-2xl skew-x-[-5deg]">
                                            {team.logo_url ? (
                                                <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover skew-x-[5deg]" />
                                            ) : (
                                                <Shield className="w-12 h-12 text-cs-text skew-x-[5deg]" />
                                            )}
                                        </div>
                                        <div className="text-center md:text-left">
                                            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">{team.name}</h2>
                                            <p className="text-cs-text text-sm max-w-md">{team.description || 'Нет описания'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 bg-neutral-900/90">
                                    <div className="flex items-center gap-4 mb-6 text-sm font-bold text-cs-text">
                                        <span className="flex items-center gap-2 bg-black/30 px-3 py-1 border border-white/5 skew-x-[-10deg]">
                                            <span className="skew-x-[10deg] flex items-center gap-2">
                                                <Users className="w-4 h-4" /> {team.members?.length || 0} / 5
                                            </span>
                                        </span>
                                        <span className="flex items-center gap-2 bg-black/30 px-3 py-1 border border-white/5 skew-x-[-10deg]">
                                            <span className="skew-x-[10deg] flex items-center gap-2">
                                                <Crown className="w-4 h-4 text-cs-orange" /> Капитан:
                                                <Link to={`/user/${(team.captain?.custom_url && !team.captain.custom_url.includes('/')) ? team.captain.custom_url : team.captain?.id}`} className="text-white hover:text-cs-orange transition-colors ml-1" onClick={onClose}>
                                                    {team.captain?.nickname || 'Unknown'}
                                                </Link>
                                            </span>
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-black text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                                        <Users className="w-5 h-5 text-cs-orange" /> Состав
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {team.members?.map(member => (
                                            <div key={member.id} className="p-3 bg-white/5 border border-white/5 flex items-center gap-3">
                                                <div className="w-8 h-8 bg-black/50 flex items-center justify-center font-bold text-cs-text border border-white/10 skew-x-[-10deg]">
                                                    <span className="skew-x-[10deg]">{member.user?.nickname?.[0] || '?'}</span>
                                                </div>
                                                <div>
                                                    <Link to={`/user/${(member.user?.custom_url && !member.user.custom_url.includes('/')) ? member.user.custom_url : member.user?.id}`} className="font-bold text-white uppercase tracking-tight flex items-center gap-2 hover:text-cs-orange transition-colors" onClick={onClose}>
                                                        {member.user?.nickname || 'Unknown'}
                                                        {member.role === 'captain' && <Crown className="w-3 h-3 text-cs-orange" />}
                                                    </Link>
                                                    <div className="text-[10px] text-cs-text font-mono uppercase">
                                                        K/D: {member.user?.player_summary?.k_d_ratio || '0.00'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TeamDetailsModal;
