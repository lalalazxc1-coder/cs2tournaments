import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Crosshair, Activity, Star, Zap } from 'lucide-react';

const PlayerComparisonModal = ({ isOpen, onClose, player1, player2 }) => {
    if (!isOpen || !player1 || !player2) return null;

    // Ensure we have numbers
    const p1 = {
        ...player1,
        rating: Number(player1.rating || 0),
        kd: Number(player1.k_d_ratio || 0),
        winrate: Number(player1.win_rate || 0),
        matches: Number(player1.total_matches || 0),
        ace: Number(player1.total_5k || 0),
        mvp: Number(player1.total_MVP || 0),
        name: player1.user?.nickname || player1.player_name || 'Player 1',
        rank: player1.rank
    };

    const p2 = {
        ...player2,
        rating: Number(player2.rating || 0),
        kd: Number(player2.k_d_ratio || 0),
        winrate: Number(player2.win_rate || 0),
        matches: Number(player2.total_matches || 0),
        ace: Number(player2.total_5k || 0),
        mvp: Number(player2.total_MVP || 0),
        name: player2.user?.nickname || player2.player_name || 'Player 2',
        rank: player2.rank
    };

    // Sort so P1 is always the higher rated one for consistent "Leader vs Challenger" narrative, 
    // OR keep them as selected. Let's keep as selected but identify leader.
    const leader = p1.rating > p2.rating ? p1 : p2;
    const trailer = p1.rating > p2.rating ? p2 : p1;
    const ratingDiff = Math.abs(p1.rating - p2.rating);

    // Weights
    const W = { kd: 900, winrate: 10, matches: 2, ace: 50, mvp: 5 };

    // Calculate Impact Diffs (How many points each stat contributes to the gap)
    const diffs = {
        kd: (p1.kd - p2.kd) * W.kd,
        winrate: (p1.winrate - p2.winrate) * W.winrate,
        matches: (p1.matches - p2.matches) * W.matches,
        ace: (p1.ace - p2.ace) * W.ace,
        mvp: (p1.mvp - p2.mvp) * W.mvp
    };

    // Analysis Generation
    const generateAnalysis = () => {
        let sections = [];

        // Intro
        sections.push({
            title: "Сравнение рейтинга",
            text: `Давайте сравним ${p1.name} (#${p1.rank}) и ${p2.name} (#${p2.rank}). Разница в рейтинге: ${ratingDiff} очков (${p1.rating} vs ${p2.rating}).`
        });

        // 1. Shooting (K/D)
        const kdDiff = Math.abs(p1.kd - p2.kd).toFixed(2);
        const kdPoints = Math.abs(diffs.kd).toFixed(0);
        const betterShooter = p1.kd > p2.kd ? p1 : p2;
        const worseShooter = p1.kd > p2.kd ? p2 : p1;

        let kdText = `${betterShooter.name} (${betterShooter.kd}) vs ${worseShooter.name} (${worseShooter.kd}). `;
        if (kdPoints > 50) {
            kdText += `${betterShooter.name} получает на ${kdPoints} очков больше за чистый скилл стрельбы. Он более эффективный убийца.`;
        } else {
            kdText += `Здесь почти равенство (разница всего ${kdPoints} очков). Оба стреляют на одном уровне.`;
        }
        sections.push({ title: "1. Стрельба (K/D)", text: kdText, icon: <Crosshair className="w-4 h-4" /> });

        // 2. Winrate
        const wrDiff = Math.abs(p1.winrate - p2.winrate).toFixed(1);
        const wrPoints = Math.abs(diffs.winrate).toFixed(0);
        const winner = p1.winrate > p2.winrate ? p1 : p2;

        let wrText = `У ${p1.name} ${p1.winrate}%, у ${p2.name} ${p2.winrate}%. `;
        if (wrDiff < 1) {
            wrText += "Здесь полное равенство (почти 0 очков разницы).";
        } else {
            wrText += `${winner.name} побеждает чаще, что дает ему преимущество в ${wrPoints} очков.`;
        }
        sections.push({ title: "2. Винрейт (Победы)", text: wrText, icon: <Trophy className="w-4 h-4" /> });

        // 3. Activity
        const mDiff = Math.abs(p1.matches - p2.matches);
        const mPoints = Math.abs(diffs.matches).toFixed(0);
        const grinder = p1.matches > p2.matches ? p1 : p2;

        let mText = `${grinder.name} сыграл на ${mDiff} матчей больше. `;
        if (mPoints > 100) {
            mText += `Это дает ему заметный бонус в ${mPoints} очков за активность.`;
        } else {
            mText += `Это дает ему всего ${mPoints} очков преимущества. Как видите, "гринд" матчей почти не влияет.`;
        }
        sections.push({ title: "3. Активность (Матчи)", text: mText, icon: <Activity className="w-4 h-4" /> });

        // 4. Highlights (ACE)
        const aceDiff = Math.abs(p1.ace - p2.ace);
        const acePoints = Math.abs(diffs.ace).toFixed(0);
        const aceKing = p1.ace > p2.ace ? p1 : p2;

        let aceText = `У ${p1.name} ${p1.ace} эйсов, у ${p2.name} ${p2.ace}. `;
        if (aceDiff === 0) {
            aceText += "По хайлайтам ничья.";
        } else {
            aceText += `Разница в ${aceDiff} эйса дает ${aceKing.name} ${acePoints} очков преимущества.`;
        }
        sections.push({ title: "4. Хайлайты (ACE)", text: aceText, icon: <Star className="w-4 h-4" /> });

        // 5. Utility (MVP)
        const mvpDiff = Math.abs(p1.mvp - p2.mvp);
        const mvpPoints = Math.abs(diffs.mvp).toFixed(0);
        const mvpKing = p1.mvp > p2.mvp ? p1 : p2;

        let mvpText = `У ${p1.name} ${p1.mvp} MVP, у ${p2.name} ${p2.mvp} MVP. `;
        if (mvpPoints > 200) {
            mvpText += `Разница в ${mvpDiff} MVP дает ${mvpKing.name} колоссальные ${mvpPoints} очков преимущества.`;
        } else {
            mvpText += `Разница дает ${mvpKing.name} ${mvpPoints} очков.`;
        }

        // Determine if MVP was the deciding factor (biggest swing contrary to K/D or just biggest swing)
        const isMvpDecider = Math.abs(diffs.mvp) > Math.abs(diffs.kd) && Math.abs(diffs.mvp) > Math.abs(diffs.winrate);
        const title = isMvpDecider ? "5. Полезность (MVP) — РЕШАЮЩИЙ ФАКТОР" : "5. Полезность (MVP)";

        sections.push({ title: title, text: mvpText, icon: <Zap className="w-4 h-4" /> });

        // Conclusion
        let conclusion = "";
        if (leader.kd < trailer.kd) {
            conclusion = `${trailer.name} — отличный стрелок (лучше, чем топ-${leader.rank}), но ${leader.name} играет более "ярко" и результативно для команды. Именно игровая активность (MVP/ACE/Винрейт) перекрыла отставание в сухой статистике K/D.`;
        } else if (leader.kd > trailer.kd && leader.winrate > trailer.winrate) {
            conclusion = `${leader.name} доминирует по всем фронтам: и стреляет лучше, и побеждает чаще. Заслуженное лидерство.`;
        } else {
            conclusion = `Борьба очень плотная. ${leader.name} вырывается вперед за счет совокупности факторов, хотя ${trailer.name} не уступает в отдельных показателях.`;
        }

        sections.push({ title: "Итог", text: conclusion, isConclusion: true });

        return sections;
    };

    const analysis = generateAnalysis();

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-cs-surface border border-white/10 w-full max-w-4xl shadow-2xl clip-path-slant flex flex-col max-h-[90vh] md:max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                            <h3 className="text-lg md:text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2 md:gap-3">
                                <Activity className="text-cs-orange w-5 h-5 md:w-6 md:h-6" />
                                Анализ сравнения
                            </h3>
                            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-1">
                                <X className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pr-2">
                            {/* Players Header */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                                {[p1, p2].map((p, i) => (
                                    <div key={i} className={`p-3 md:p-4 border ${p.rating === leader.rating ? 'border-cs-orange/50 bg-cs-orange/5' : 'border-white/5 bg-white/5'} flex items-center gap-3 md:gap-4`}>
                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-black/50 border border-white/10 overflow-hidden flex-shrink-0">
                                            {p.user?.avatar_medium ? (
                                                <img src={p.user.avatar_medium} alt={p.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-cs-text">?</div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[10px] md:text-xs text-cs-orange font-bold uppercase">Rank #{p.rank}</div>
                                            <div className="text-lg md:text-xl font-black text-white uppercase leading-none mb-1 truncate">{p.name}</div>
                                            <div className="text-xl md:text-2xl font-mono font-bold text-cs-text">{p.rating} pts</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Analysis Text */}
                            <div className="space-y-3 md:space-y-4">
                                {analysis.map((section, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`p-3 md:p-4 ${section.isConclusion ? 'bg-cs-orange/10 border-l-4 border-cs-orange' : 'bg-black/20 border-l-2 border-white/10'}`}
                                    >
                                        <h4 className={`font-bold uppercase tracking-wider mb-1 md:mb-2 flex items-center gap-2 text-sm md:text-base ${section.isConclusion ? 'text-cs-orange' : 'text-white'}`}>
                                            {section.icon}
                                            {section.title}
                                        </h4>
                                        <p className="text-cs-text leading-relaxed font-medium text-sm md:text-base">
                                            {section.text}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default PlayerComparisonModal;
