import React from 'react';

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

const MatchMaps = ({ mapState, team1Name, team2Name }) => {
    return (
        <div className="bg-cs-surface border border-white/10 p-8 mb-8 clip-path-slant">
            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter text-center">КАРТЫ МАТЧА</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mapState?.picked?.length > 0 ? (
                    mapState.picked.map((pick, index) => (
                        <div key={index} className="bg-black/30 border border-white/5 p-4 skew-x-[-5deg]">
                            <div className="skew-x-[5deg] flex items-center gap-4">
                                <div className="w-16 h-16 bg-black/50 border border-white/10 overflow-hidden">
                                    {MAP_IMAGES[pick.map] && <img src={MAP_IMAGES[pick.map]} alt={pick.map} className="w-full h-full object-cover" />}
                                </div>
                                <div>
                                    <div className="text-cs-orange font-black text-lg uppercase tracking-wider">{pick.map}</div>
                                    <div className="text-cs-text text-sm font-medium uppercase">
                                        {pick.picked_by === 'decider' ? 'Decider' : `Pick: ${pick.picked_by === 1 ? team1Name : team2Name}`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))) : (
                    <p className="text-gray-500 text-sm italic">Карты еще не выбраны</p>
                )}
            </div>
        </div>
    );
};

export default MatchMaps;
