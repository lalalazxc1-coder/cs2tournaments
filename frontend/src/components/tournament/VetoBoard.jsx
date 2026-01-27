import React from 'react';
import { Ban, CheckCircle } from 'lucide-react';

const MAP_IMAGES = {
    "Ancient": "/ancient.png",
    "Dust II": "/dust2.png",
    "Inferno": "/inferno.png",
    "Mirage": "/mirage.png",
    "Nuke": "/nuke.png",
    "Overpass": "/overpass.png",
    "Anubis": "/anubis.png",
    "Train": "/train.png",
    "Vertigo": "/vertigo.png"
};

const VetoBoard = ({
    mapState,
    isMyTurn,
    currentAction,
    turnTeamName,
    vetoLoading,
    onVetoAction,
    team1Name,
    team2Name
}) => {
    return (
        <div className="bg-cs-surface border border-white/10 p-8 mb-8 clip-path-slant">
            <div className="text-center mb-8">
                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">ВЫБОР КАРТ</h3>
                <p className="text-xl font-black uppercase tracking-wider animate-pulse" style={{ color: isMyTurn ? '#E9B10E' : '#6B7280' }}>
                    {isMyTurn ? `ВАШ ХОД: ${currentAction === 'ban' ? 'БАН' : 'ПИК'}` : `ХОД: ${turnTeamName} - ${currentAction === 'ban' ? 'БАН' : 'ПИК'}`}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mapState?.pool && Array.isArray(mapState.pool) && mapState.pool.map(map => {
                    const isBanned = mapState.banned && Array.isArray(mapState.banned) && mapState.banned.includes(map);
                    const pickedObj = mapState.picked && Array.isArray(mapState.picked) && mapState.picked.find(p => p.map === map);
                    const isPicked = !!pickedObj;
                    const mapImage = MAP_IMAGES[map];

                    return (
                        <button
                            key={map}
                            disabled={isBanned || isPicked || !isMyTurn || vetoLoading}
                            onClick={() => onVetoAction(map)}
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
                                    {pickedObj.picked_by !== 'decider' && (
                                        <div className="absolute bottom-2 text-xs font-bold uppercase tracking-wider bg-black/50 px-2 py-1 rounded">
                                            Pick: {pickedObj.picked_by === 1 ? team1Name : team2Name}
                                        </div>
                                    )}
                                    {pickedObj.picked_by === 'decider' && (
                                        <div className="absolute bottom-2 text-xs font-bold uppercase tracking-wider bg-black/50 px-2 py-1 rounded text-yellow-400">
                                            Decider
                                        </div>
                                    )}
                                </div>
                            )}

                            {!isBanned && !isPicked && isMyTurn && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity z-20 skew-x-[5deg]">
                                    <span className={`font-black uppercase text-lg tracking-wider ${currentAction === 'ban' ? 'text-red-500' : 'text-green-500'}`}>
                                        {currentAction === 'ban' ? 'ЗАБАНИТЬ' : 'ВЫБРАТЬ'}
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default VetoBoard;
