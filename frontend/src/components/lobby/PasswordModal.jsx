import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';

const PasswordModal = ({ isOpen, onClose, onSubmit }) => {
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
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative bg-cs-surface border border-white/10 p-8 max-w-md w-full shadow-2xl clip-path-slant"
                    >
                        <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">Введите пароль</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            onSubmit(e.target.password.value);
                        }}>
                            <div className="relative skew-x-[-5deg] mb-6">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cs-text skew-x-[5deg]" />
                                <input
                                    name="password"
                                    type="password"
                                    autoFocus
                                    className="w-full bg-black/40 border border-white/10 pl-12 pr-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors font-bold tracking-wider placeholder-cs-text/50"
                                    placeholder="Пароль от лобби"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-6 skew-x-[-10deg] transition-all border border-white/10 hover:border-white/30 uppercase tracking-wider"
                                >
                                    <span className="skew-x-[10deg]">Отмена</span>
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-cs-orange hover:bg-yellow-400 text-black font-black py-3 px-6 skew-x-[-10deg] transition-all shadow-[0_0_20px_rgba(233,177,14,0.2)] uppercase tracking-wider"
                                >
                                    <span className="skew-x-[10deg]">Войти</span>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PasswordModal;
