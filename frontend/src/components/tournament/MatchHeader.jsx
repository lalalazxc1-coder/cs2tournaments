import React from 'react';

const MatchHeader = ({ match }) => {
    return (
        <div className="bg-cs-surface border border-white/10 p-8 mb-8 clip-path-slant relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cs-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 text-center">
                <div className="inline-block bg-cs-blue/10 text-cs-blue px-2 py-1 text-xs font-black uppercase tracking-widest mb-4 skew-x-[-10deg]">
                    <span className="skew-x-[10deg]">Match Room</span>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-8">
                    {/* Team 1 */}
                    <div className="text-center">
                        <div className="w-24 h-24 mx-auto bg-black/40 border border-white/10 flex items-center justify-center mb-4 skew-x-[-5deg]">
                            {match.team1?.logo_url ? (
                                <img src={match.team1.logo_url} alt={match.team1.name} className="w-full h-full object-cover skew-x-[5deg]" />
                            ) : (
                                <span className="text-4xl font-black text-white/20 skew-x-[5deg]">T1</span>
                            )}
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{match.team1?.name || 'TBD'}</h2>
                        {match.winner_id === match.team1_id && <div className="text-cs-orange font-bold text-sm mt-1 uppercase tracking-widest">Winner</div>}
                    </div>

                    <div className="text-center">
                        <div className="text-4xl font-black text-white/50 italic skew-x-[-10deg] mb-2">VS</div>
                        <div className="text-cs-text font-bold uppercase tracking-wider text-sm bg-black/30 px-3 py-1 skew-x-[-10deg] border border-white/5">
                            <span className="skew-x-[10deg]">{match.match_type ? match.match_type.toUpperCase() : 'BO1'}</span>
                        </div>
                    </div>

                    {/* Team 2 */}
                    <div className="text-center">
                        <div className="w-24 h-24 mx-auto bg-black/40 border border-white/10 flex items-center justify-center mb-4 skew-x-[-5deg]">
                            {match.team2?.logo_url ? (
                                <img src={match.team2.logo_url} alt={match.team2.name} className="w-full h-full object-cover skew-x-[5deg]" />
                            ) : (
                                <span className="text-4xl font-black text-white/20 skew-x-[5deg]">T2</span>
                            )}
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{match.team2?.name || 'TBD'}</h2>
                        {match.winner_id === match.team2_id && <div className="text-cs-orange font-bold text-sm mt-1 uppercase tracking-widest">Winner</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchHeader;
