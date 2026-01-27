import { Crown, User, Ban, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const MAP_IMAGES = {
    "Ancient": "/ancient.png",
    "Dust II": "/dust2.png",
    "Inferno": "/inferno.png",
    "Mirage": "/mirage.png",
    "Nuke": "/nuke.png",
    "Overpass": "/overpass.png",
    "Anubis": "/anubis.png",
    "Train": "/train.png"
}

const LobbyDraft = ({
    draftState,
    participants,
    user,
    isOrganizer,
    selectedCaptains,
    toggleCaptainSelection,
    handleSetCaptains,
    teamNameInput,
    setTeamNameInput,
    handleSetTeamName,
    handleDraftPick,
    handleVetoMap,
    mapPool
}) => {
    const draftStage = draftState?.stage

    return (
        <div className="bg-cs-surface border border-white/10 p-8 mb-8 clip-path-slant">
            {/* Stage 1: Captain Selection */}
            {draftStage === 'captains_selection' && (
                <div className="text-center">
                    <div className="inline-block bg-cs-orange text-black px-2 py-1 text-xs font-black uppercase tracking-widest mb-2 skew-x-[-10deg]">
                        <span className="skew-x-[10deg]">Phase 1</span>
                    </div>
                    <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">ВЫБОР КАПИТАНОВ</h2>
                    {isOrganizer ? (
                        <>
                            <p className="text-cs-text mb-8 font-medium">Выберите двух игроков, которые станут капитанами команд.</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                                {participants.map(p => (
                                    <div
                                        key={p.user_id}
                                        onClick={() => toggleCaptainSelection(p.user_id)}
                                        className={`p-4 border cursor-pointer transition-all skew-x-[-5deg] ${selectedCaptains.includes(p.user_id)
                                            ? 'bg-cs-orange/20 border-cs-orange text-cs-orange'
                                            : 'bg-black/40 border-white/5 hover:border-white/20 text-white'
                                            }`}
                                    >
                                        <div className="font-bold truncate skew-x-[5deg] uppercase tracking-wider">{p.nickname || p.username}</div>
                                        <div className="text-xs text-cs-text mt-1 skew-x-[5deg] font-mono">KD: {p.k_d}</div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleSetCaptains}
                                disabled={selectedCaptains.length !== 2}
                                className="px-8 py-3 bg-cs-orange disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-400 text-black font-black uppercase tracking-wider skew-x-[-10deg] shadow-[0_0_15px_rgba(233,177,14,0.3)]"
                            >
                                <span className="skew-x-[10deg]">Подтвердить капитанов</span>
                            </button>
                        </>
                    ) : (
                        <div className="text-cs-text animate-pulse font-bold uppercase tracking-widest">Организатор выбирает капитанов...</div>
                    )}
                </div>
            )}

            {/* Stage 1.5: Team Naming */}
            {draftStage === 'team_naming' && (
                <div className="text-center max-w-4xl mx-auto">
                    <div className="inline-block bg-cs-orange text-black px-2 py-1 text-xs font-black uppercase tracking-widest mb-2 skew-x-[-10deg]">
                        <span className="skew-x-[10deg]">Phase 2</span>
                    </div>
                    <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">НАЗВАНИЕ КОМАНД</h2>

                    {/* Coin Flip Result */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="bg-black/40 border border-white/10 p-6 mb-8 skew-x-[-5deg] relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-cs-orange"></div>
                        <div className="skew-x-[5deg] flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    animate={{ rotateY: [0, 360, 360, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    className="bg-cs-orange/20 p-3 rounded-full border border-cs-orange/50"
                                >
                                    <div className="w-8 h-8 flex items-center justify-center text-2xl">🪙</div>
                                </motion.div>
                                <div className="text-left">
                                    <div className="text-cs-text text-xs font-bold uppercase tracking-widest mb-1">Результат Жеребьевки</div>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-xl font-black text-white uppercase tracking-tight"
                                    >
                                        Победил <span className="text-cs-orange">{participants.find(p => p.user_id === draftState.first_pick_captain)?.nickname}</span>
                                    </motion.div>
                                </div>
                            </div>

                            <div className="flex-1 w-full md:w-auto">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="bg-black/40 p-3 border border-white/5"
                                    >
                                        <div className="text-cs-orange font-bold uppercase mb-1">Первый Пик Игрока</div>
                                        <div className="text-white font-medium">{participants.find(p => p.user_id === draftState.first_pick_captain)?.nickname}</div>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 }}
                                        className="bg-black/40 p-3 border border-white/5"
                                    >
                                        <div className="text-cs-blue font-bold uppercase mb-1">Первый Бан Карты</div>
                                        <div className="text-white font-medium">
                                            {participants.find(p => p.user_id === (draftState.captains[1] === draftState.first_pick_captain ? draftState.captains[2] : draftState.captains[1]))?.nickname}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1, 2].map(teamNum => {
                            const captainId = draftState.captains[teamNum]
                            const isCaptain = user?.id === captainId
                            const teamName = draftState.teams[teamNum].name

                            return (
                                <div key={teamNum} className="bg-black/30 p-6 border border-white/5 skew-x-[-5deg]">
                                    <div className="skew-x-[5deg]">
                                        <div className="text-cs-orange font-black mb-2 uppercase tracking-widest">TEAM {teamNum}</div>
                                        <div className="text-xl font-bold mb-4 text-white uppercase">
                                            <Link to={`/user/${participants.find(p => p.user_id === captainId)?.custom_url || captainId}`} className="hover:text-cs-orange transition-colors">
                                                {participants.find(p => p.user_id === captainId)?.nickname}
                                            </Link>
                                        </div>

                                        {teamName ? (
                                            <div className="text-2xl font-black text-white bg-black/50 py-3 border border-white/10 uppercase tracking-tighter">
                                                {teamName}
                                            </div>
                                        ) : isCaptain ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Название команды"
                                                    value={teamNameInput}
                                                    onChange={(e) => setTeamNameInput(e.target.value)}
                                                    className="w-full bg-black border border-white/10 px-3 py-2 text-white font-bold uppercase placeholder-white/30 focus:border-cs-orange focus:outline-none"
                                                />
                                                <button
                                                    onClick={handleSetTeamName}
                                                    className="bg-cs-orange text-black p-2 font-black uppercase hover:bg-yellow-400 transition-colors"
                                                >
                                                    OK
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-cs-text italic font-medium">Ожидание названия...</div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div >
            )}

            {/* Stage 2 & 3: Player Pick */}
            {
                draftStage === 'player_picking' && (
                    <div className="relative">
                        {/* Turn Indicator / VS Header */}
                        <div className="flex justify-center items-center mb-10 relative">
                            <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                            <div className="relative z-10 flex items-center gap-8 bg-cs-surface px-8 py-2 border border-white/10 skew-x-[-10deg]">
                                <div className={`text-right ${draftState.turn === draftState.captains[1] ? 'opacity-100' : 'opacity-50'} transition-opacity skew-x-[10deg]`}>
                                    <div className="text-cs-orange font-black text-2xl uppercase tracking-tighter leading-none">{draftState.teams[1].name || 'TEAM 1'}</div>
                                    {draftState.turn === draftState.captains[1] && <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest animate-pulse">Выбирает</div>}
                                </div>
                                <div className="text-4xl font-black text-white italic skew-x-[10deg] px-4">VS</div>
                                <div className={`text-left ${draftState.turn === draftState.captains[2] ? 'opacity-100' : 'opacity-50'} transition-opacity skew-x-[10deg]`}>
                                    <div className="text-cs-blue font-black text-2xl uppercase tracking-tighter leading-none">{draftState.teams[2].name || 'TEAM 2'}</div>
                                    {draftState.turn === draftState.captains[2] && <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest animate-pulse">Выбирает</div>}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Team 1 Roster (Left) */}
                            <div className="lg:col-span-3 flex flex-col gap-4">
                                <div className="bg-gradient-to-b from-cs-orange/10 to-transparent border border-cs-orange/20 border-t-4 border-t-cs-orange p-4 shadow-[0_0_20px_rgba(233,177,14,0.1)]">
                                    <div>
                                        <h3 className="text-cs-orange font-black uppercase tracking-widest text-sm mb-4">Состав {draftState.teams[1].name || 'Team 1'}</h3>
                                        <div className="space-y-2">
                                            {(draftState.teams[1].players || draftState.teams[1]).map(uid => (
                                                <div key={uid} className="flex items-center p-3 bg-black/40 border-l-2 border-cs-orange/50">
                                                    <User className="w-4 h-4 mr-3 text-cs-orange" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-white uppercase truncate text-sm">
                                                            {participants.find(p => p.user_id === uid)?.nickname}
                                                        </div>
                                                    </div>
                                                    {uid === draftState.captains[1] && <Crown className="w-3 h-3 text-cs-orange" />}
                                                </div>
                                            ))}
                                            {Array.from({ length: 5 - (draftState.teams[1].players?.length || 0) }).map((_, i) => (
                                                <div key={i} className="p-3 bg-white/5 border-l-2 border-white/5 border-dashed text-white/20 text-xs font-bold uppercase text-center">
                                                    Пустой слот
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Player Pool (Center) */}
                            <div className="lg:col-span-6">
                                <div className="bg-black/20 border border-white/5 p-1 skew-x-[-2deg] h-full">
                                    <div className="bg-cs-surface/50 p-4 h-full skew-x-[2deg]">
                                        <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
                                            <h3 className="text-white font-black uppercase tracking-wider">Доступные игроки</h3>
                                            <span className="text-cs-text text-xs font-bold uppercase">{draftState.pool.length} игроков</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {draftState.pool.map(uid => {
                                                const player = participants.find(p => p.user_id === uid)
                                                const isTurn = user?.id === draftState.turn
                                                return (
                                                    <button
                                                        key={uid}
                                                        disabled={!isTurn}
                                                        onClick={() => handleDraftPick(uid)}
                                                        className="group relative bg-black/40 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 hover:border-cs-orange/50 transition-all p-3 text-left flex flex-col gap-2 overflow-hidden"
                                                    >
                                                        <div className="absolute top-0 right-0 p-1">
                                                            <div className="bg-white/10 text-[10px] font-mono px-1.5 py-0.5 text-cs-text">R: {((parseFloat(player?.k_d) * 1000) || 0).toFixed(0)}</div>
                                                        </div>

                                                        <div className="font-black text-white uppercase tracking-wide text-lg group-hover:text-cs-orange transition-colors truncate pr-8">
                                                            {player?.nickname}
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-2 text-[10px] uppercase font-bold text-cs-text">
                                                            <div className="bg-black/30 px-1.5 py-1 border border-white/5 text-center">
                                                                <span className={player?.k_d >= 1.2 ? 'text-green-400' : ''}>KD {player?.k_d}</span>
                                                            </div>
                                                            <div className="bg-black/30 px-1.5 py-1 border border-white/5 text-center">
                                                                <span className={player?.win_rate >= 55 ? 'text-green-400' : ''}>{player?.win_rate}% WR</span>
                                                            </div>
                                                            <div className="bg-black/30 px-1.5 py-1 border border-white/5 text-center">
                                                                {player?.matches} M
                                                            </div>
                                                        </div>

                                                        {isTurn && (
                                                            <div className="absolute inset-0 bg-cs-orange/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="bg-cs-orange text-black font-black uppercase text-xs px-3 py-1 skew-x-[-10deg] shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                                    <span className="skew-x-[10deg]">Выбрать</span>
                                                                </span>
                                                            </div>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Team 2 Roster (Right) */}
                            <div className="lg:col-span-3 flex flex-col gap-4">
                                <div className="bg-gradient-to-b from-cs-blue/10 to-transparent border border-cs-blue/20 border-t-4 border-t-cs-blue p-4 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                                    <div>
                                        <h3 className="text-cs-blue font-black uppercase tracking-widest text-sm mb-4 text-right">Состав {draftState.teams[2].name || 'Team 2'}</h3>
                                        <div className="space-y-2">
                                            {(draftState.teams[2].players || draftState.teams[2]).map(uid => (
                                                <div key={uid} className="flex items-center justify-end p-3 bg-black/40 border-r-2 border-cs-blue/50">
                                                    {uid === draftState.captains[2] && <Crown className="w-3 h-3 text-cs-blue mr-auto" />}
                                                    <div className="flex-1 min-w-0 text-right">
                                                        <div className="font-bold text-white uppercase truncate text-sm">
                                                            {participants.find(p => p.user_id === uid)?.nickname}
                                                        </div>
                                                    </div>
                                                    <User className="w-4 h-4 ml-3 text-cs-blue" />
                                                </div>
                                            ))}
                                            {Array.from({ length: 5 - (draftState.teams[2].players?.length || 0) }).map((_, i) => (
                                                <div key={i} className="p-3 bg-white/5 border-r-2 border-white/5 border-dashed text-white/20 text-xs font-bold uppercase text-center">
                                                    Пустой слот
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Stage 4: Map Veto */}
            {
                draftStage === 'veto' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="inline-block bg-cs-orange text-black px-2 py-1 text-xs font-black uppercase tracking-widest mb-2 skew-x-[-10deg]">
                                <span className="skew-x-[10deg]">Phase 3</span>
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">ВЫБОР КАРТ</h2>
                            <p className="text-xl text-cs-orange font-black animate-pulse uppercase tracking-wider">
                                {draftState.turn === user?.id ? 'ВАШ ХОД: ' : `ХОД: ${participants.find(p => p.user_id === draftState.turn)?.nickname} - `}
                                {draftState.veto.sequence[draftState.veto.current_step] === 'ban' ? 'БАН' : 'ПИК'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {(JSON.parse(mapPool || '["Ancient", "Dust II", "Inferno", "Mirage", "Nuke", "Train", "Overpass"]')).map(map => {
                                const isBanned = draftState.veto.banned.includes(map)
                                const isPicked = draftState.veto.picked.some(p => (typeof p === 'string' ? p : p.map) === map)
                                const action = draftState.veto.sequence[draftState.veto.current_step]
                                const mapImage = MAP_IMAGES[map]

                                return (
                                    <button
                                        key={map}
                                        disabled={isBanned || isPicked || user?.id !== draftState.turn}
                                        onClick={() => handleVetoMap(map)}
                                        className={`relative h-40 border-2 overflow-hidden transition-all group skew-x-[-5deg] ${isBanned ? 'border-red-500/50 opacity-50 grayscale' :
                                            isPicked ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' :
                                                'border-white/10 hover:border-cs-orange'
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-black skew-x-[5deg] scale-110">
                                            {mapImage && (
                                                <img
                                                    src={mapImage}
                                                    alt={map}
                                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                                                />
                                            )}
                                            {!mapImage && <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 opacity-80"></div>}
                                        </div>

                                        <div className="absolute inset-0 flex items-center justify-center font-black text-2xl uppercase tracking-widest z-10 drop-shadow-lg text-white skew-x-[5deg]">
                                            {map}
                                        </div>

                                        {isBanned && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20 skew-x-[5deg]">
                                                <Ban className="w-16 h-16 text-red-500" />
                                            </div>
                                        )}

                                        {isPicked && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 z-20 skew-x-[5deg]">
                                                <CheckCircle className="w-16 h-16 text-green-500" />
                                            </div>
                                        )}

                                        {!isBanned && !isPicked && user?.id === draftState.turn && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity z-20 skew-x-[5deg]">
                                                <span className={`font-black uppercase text-lg tracking-wider ${action === 'ban' ? 'text-red-500' : 'text-green-500'}`}>
                                                    {action === 'ban' ? 'ЗАБАНИТЬ' : 'ВЫБРАТЬ'}
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )
            }
        </div >
    )
}

export default LobbyDraft
