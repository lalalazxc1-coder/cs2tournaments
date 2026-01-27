import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Crown } from 'lucide-react';

const LobbyStartModal = ({ isOpen, onClose, onStartAuto, onStartDraft }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-cs-surface border border-white/10 p-8 max-w-md w-full shadow-2xl clip-path-slant">
                    <h2 className="text-2xl font-black text-white mb-6 text-center uppercase tracking-wider">НАЧАТЬ ЛОББИ</h2>

                    <div className="space-y-4">
                        <button onClick={onStartAuto} className="w-full p-4 bg-black/40 hover:bg-black/60 border border-white/5 text-left transition-all group skew-x-[-5deg]">
                            <div className="flex items-center mb-2 skew-x-[5deg]"><Swords className="w-6 h-6 text-cs-blue mr-3" /><span className="font-bold text-white text-lg uppercase">Автобаланс</span></div>
                            <p className="text-cs-text text-sm skew-x-[5deg]">Система автоматически распределит игроков.</p>
                        </button>
                        <button onClick={onStartDraft} className="w-full p-4 bg-black/40 hover:bg-black/60 border border-white/5 text-left transition-all group skew-x-[-5deg]">
                            <div className="flex items-center mb-2 skew-x-[5deg]"><Crown className="w-6 h-6 text-cs-orange mr-3" /><span className="font-bold text-white text-lg uppercase">Драфт Капитанов</span></div>
                            <p className="text-cs-text text-sm skew-x-[5deg]">Выбор капитанов, драфт игроков и мап-вето.</p>
                        </button>
                    </div>

                    <button onClick={onClose} className="mt-6 w-full py-3 text-cs-text hover:text-white font-bold uppercase tracking-wider">Отмена</button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LobbyStartModal;
