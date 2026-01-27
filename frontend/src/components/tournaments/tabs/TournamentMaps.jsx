import { useOutletContext } from 'react-router-dom';
import { Map } from 'lucide-react';

const TournamentMaps = () => {
    const { tournament } = useOutletContext();

    let maps = tournament.map_pool;
    try {
        if (typeof maps === 'string') maps = JSON.parse(maps);
    } catch (e) { maps = [] }

    const MAP_IMAGES = {
        'Ancient': '/ancient.png',
        'Anubis': '/anubis.png',
        'Dust2': '/dust2.png',
        'Inferno': '/inferno.png',
        'Mirage': '/mirage.png',
        'Nuke': '/nuke.png',
        'Overpass': '/overpass.png',
        'Vertigo': '/vertigo.png',
        'Train': '/train.png'
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <Map className="w-6 h-6 text-cs-orange" />
                <h3 className="text-2xl font-black text-white uppercase tracking-wider">Пул Карт</h3>
            </div>
            {maps && maps.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {maps.map((map, idx) => (
                        <div key={idx} className="group relative aspect-[16/9] overflow-hidden rounded-lg border border-white/10 shadow-lg transition-all hover:scale-105 hover:border-cs-orange/50 hover:shadow-[0_0_20px_rgba(233,177,14,0.2)]">
                            {/* Image Background */}
                            <div className="absolute inset-0 bg-neutral-900">
                                {MAP_IMAGES[map] ? (
                                    <img
                                        src={MAP_IMAGES[map]}
                                        alt={map}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-cs-surface">
                                        <Map className="w-12 h-12 text-white/10" />
                                    </div>
                                )}
                            </div>

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent group-hover:from-black/80 transition-all"></div>

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                <div className="flex items-center justify-between">
                                    <span className="font-black uppercase tracking-widest text-xl text-white drop-shadow-lg group-hover:text-cs-orange transition-colors">{map}</span>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="bg-cs-orange text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">Active Duty</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-cs-text">Карты не выбраны</p>
            )}
        </div>
    );
};

export default TournamentMaps;
