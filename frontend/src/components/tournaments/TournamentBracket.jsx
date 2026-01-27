import React, { useState, useRef } from 'react';
import { Trophy, Shield, MoreHorizontal, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const TournamentBracket = ({ matches, format, isOrganizer, onUpdateMatch, currentPath, onTeamClick }) => {
    const scrollContainerRef = useRef(null);
    const [activeView, setActiveView] = useState('upper'); // 'upper', 'lower', 'final'

    // Filter matches by group
    const upperMatches = matches.filter(m => !m.group || m.group === 'upper');
    const lowerMatches = matches.filter(m => m.group === 'lower');
    const finalMatches = matches.filter(m => m.group === 'final');

    const hasLowerBracket = format === 'double_elimination' || lowerMatches.length > 0;

    // Calculate total rounds from Upper/Final matches only for correct naming
    // Lower bracket rounds (which can be more numerous) should not affect Upper Bracket naming
    const upperAndFinalRounds = [...upperMatches, ...finalMatches].map(m => m.round);
    const totalRounds = upperAndFinalRounds.length > 0 ? Math.max(...upperAndFinalRounds) : 0;

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 320; // w-64 (256px) + gap-12 (48px) + padding adjustment
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const getRoundName = (roundNum, totalRounds, section) => {
        if (section === 'lower') return `Lower Round ${roundNum}`;

        const roundsFromFinal = totalRounds - roundNum;
        if (roundsFromFinal === 0) return 'Final';
        if (roundsFromFinal === 1) return 'Semi Final';
        if (roundsFromFinal === 2) return 'Quarter Final';
        const fraction = Math.pow(2, roundsFromFinal);
        return `1/${fraction} Final`;
    };

    const renderBracketSection = (sectionMatches, title, sectionType) => {
        if (sectionMatches.length === 0) return (
            <div className="flex items-center justify-center h-64 text-gray-500 font-bold uppercase tracking-wider">
                Матчи отсутствуют
            </div>
        );

        const rounds = sectionMatches.reduce((acc, match) => {
            if (!acc[match.round]) acc[match.round] = [];
            acc[match.round].push(match);
            return acc;
        }, {});

        const roundNumbers = Object.keys(rounds).sort((a, b) => parseInt(a) - parseInt(b));

        return (
            <div className="mb-16 min-w-max animate-fade-in">
                <div className="flex gap-12 px-4 pb-4">
                    {roundNumbers.map((roundNum, index) => {
                        const isFirstRound = index === 0;
                        const isLastRound = index === roundNumbers.length - 1;

                        return (
                            <div key={roundNum} className="flex flex-col relative group/round w-64">
                                {/* Round Header */}
                                <div className="mb-6 text-center h-10">
                                    <div className="inline-block bg-black/40 border border-white/10 px-6 py-2 skew-x-[-10deg] w-full">
                                        <span className="text-cs-orange font-black uppercase tracking-widest text-xs skew-x-[10deg] block">
                                            {getRoundName(parseInt(roundNum), totalRounds, sectionType)}
                                        </span>
                                    </div>
                                </div>

                                {/* Matches Column */}
                                <div className="flex flex-col flex-grow">
                                    {rounds[roundNum].sort((a, b) => a.match_number - b.match_number).map((match, matchIdx) => (
                                        <div key={match.id} className="flex-1 flex flex-col justify-center relative min-h-[120px]">
                                            {/* Input Connector (Left) */}
                                            {!isFirstRound && (
                                                <div className="absolute left-[-24px] top-1/2 w-6 h-px bg-white/10"></div>
                                            )}

                                            {/* Match Card */}
                                            <MatchCard
                                                match={match}
                                                isOrganizer={isOrganizer}
                                                onUpdateMatch={onUpdateMatch}
                                                currentPath={currentPath}
                                                onTeamClick={onTeamClick}
                                            />

                                            {/* Output Connector (Right) */}
                                            {!isLastRound && (
                                                <>
                                                    {/* If Odd (Top of pair) */}
                                                    {match.match_number % 2 !== 0 && (
                                                        <div className="absolute right-[-24px] bottom-0 w-6 h-1/2 border-r border-b border-white/10"></div>
                                                    )}
                                                    {/* If Even (Bottom of pair) */}
                                                    {match.match_number % 2 === 0 && (
                                                        <div className="absolute right-[-24px] top-0 w-6 h-1/2 border-r border-t border-white/10"></div>
                                                    )}
                                                    {/* Horizontal line from card to connector curve */}
                                                    <div className="absolute right-[-24px] top-1/2 w-6 h-px bg-white/10"></div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="relative">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-black/20 p-4 border border-white/5 rounded-lg gap-4">
                <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-cs-orange" />
                    <span className="font-bold text-white uppercase tracking-wider">
                        {hasLowerBracket ? 'Double Elimination' : 'Single Elimination'}
                    </span>
                </div>

                {/* View Switcher for Double Elimination */}
                {hasLowerBracket && (
                    <div className="flex bg-black/40 p-1 rounded border border-white/10">
                        <button
                            onClick={() => setActiveView('upper')}
                            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors rounded ${activeView === 'upper' ? 'bg-cs-orange text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            Upper
                        </button>
                        <button
                            onClick={() => setActiveView('lower')}
                            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors rounded ${activeView === 'lower' ? 'bg-cs-orange text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            Lower
                        </button>
                        <button
                            onClick={() => setActiveView('final')}
                            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors rounded ${activeView === 'final' ? 'bg-cs-orange text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            Final
                        </button>
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 bg-black/40 border border-white/10 hover:bg-white/10 text-white transition-colors skew-x-[-10deg]"
                    >
                        <ChevronLeft className="w-5 h-5 skew-x-[10deg]" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 bg-black/40 border border-white/10 hover:bg-white/10 text-white transition-colors skew-x-[-10deg]"
                    >
                        <ChevronRight className="w-5 h-5 skew-x-[10deg]" />
                    </button>
                </div>
            </div>

            {/* Scrollable Container */}
            <div
                ref={scrollContainerRef}
                className="overflow-hidden pb-4 scroll-smooth min-h-[400px]"
            >
                {!hasLowerBracket ? (
                    // Single Elimination View
                    renderBracketSection([...upperMatches, ...finalMatches], 'Playoffs', 'upper')
                ) : (
                    // Double Elimination View (Tabbed)
                    <>
                        {activeView === 'upper' && renderBracketSection([...upperMatches, ...finalMatches], 'Upper Bracket', 'upper')}
                        {activeView === 'lower' && renderBracketSection(lowerMatches, 'Lower Bracket', 'lower')}
                        {activeView === 'final' && renderBracketSection(finalMatches, 'Grand Final', 'final')}
                    </>
                )}
            </div>
        </div>
    );
};

const TeamDisplay = ({ team, id, isWinner, score, onTeamClick }) => {
    const getTeamName = (team, id) => {
        if (team) return team.name;
        if (id) return `Team ${id}`;
        return 'TBD';
    };

    const getTeamLogo = (team) => {
        if (team && team.logo_url) return <img src={team.logo_url} alt="" className="w-full h-full object-cover" />;
        return <Shield className="w-3 h-3 text-gray-500" />;
    };

    const handleClick = (e) => {
        e.stopPropagation();
        if (id && onTeamClick) {
            onTeamClick(id);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`flex items-center justify-between p-2.5 transition-colors relative overflow-hidden group/team ${isWinner ? 'bg-gradient-to-r from-cs-orange/10 to-transparent' : 'hover:bg-white/5'
                } ${id ? 'cursor-pointer' : ''}`}
        >
            <div className="flex items-center gap-3 overflow-hidden z-10">
                <div className="w-6 h-6 bg-black/50 flex items-center justify-center border border-white/10 shrink-0 skew-x-[-5deg]">
                    <div className="skew-x-[5deg] w-full h-full flex items-center justify-center">
                        {getTeamLogo(team)}
                    </div>
                </div>
                <span className={`font-bold truncate text-sm tracking-tight ${isWinner ? 'text-cs-orange' : 'text-gray-300 group-hover/team:text-white'}`}>
                    {getTeamName(team, id)}
                </span>
            </div>

            {/* Score or Status */}
            <div className="flex items-center gap-2 z-10">
                {isWinner && <Trophy className="w-3 h-3 text-cs-orange" />}
                {score !== undefined && (
                    <span className={`font-mono font-bold text-lg ${isWinner ? 'text-white' : 'text-gray-500'}`}>
                        {score}
                    </span>
                )}
            </div>

            {/* Winner Indicator Bar */}
            {isWinner && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-cs-orange"></div>
            )}
        </div>
    );
};

const MatchCard = ({ match, isOrganizer, onUpdateMatch, currentPath, onTeamClick }) => {
    const navigate = useNavigate();

    const handleWinner = (winnerId) => {
        const teamName = winnerId === match.team1_id
            ? (match.team1?.name || `Team ${match.team1_id}`)
            : (match.team2?.name || `Team ${match.team2_id}`);

        if (window.confirm(`Объявить победителем ${teamName}?`)) {
            onUpdateMatch(match.id, winnerId);
        }
    };

    const handleMatchClick = () => {
        if (match.id) {
            navigate(`/tournaments/${match.tournament_id}/match/${match.id}`);
        }
    };

    // Calculate scores from map_state if available
    let score1 = 0;
    let score2 = 0;

    if (match.map_state && match.map_state.picked) {
        match.map_state.picked.forEach(map => {
            if (map.winner_id === match.team1_id) score1++;
            if (map.winner_id === match.team2_id) score2++;
        });
    }

    const isLive = match.status === 'live';
    const isCompleted = match.status === 'completed';
    const isVeto = match.map_state?.stage === 'veto';

    return (
        <div className="relative group">
            <div
                onClick={handleMatchClick}
                className={`w-64 bg-cs-surface border transition-all duration-300 relative overflow-hidden clip-path-slant ${isLive ? 'border-cs-orange shadow-[0_0_15px_rgba(255,153,0,0.2)]' :
                    isCompleted ? 'border-white/10 hover:border-white/30' :
                        'border-white/5 hover:border-cs-orange/50'
                    }`}
            >
                {/* Status Bar */}
                <div className="flex justify-between items-center px-3 py-1 bg-black/40 border-b border-white/5 text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-gray-500">
                        {match.match_type ? match.match_type.toUpperCase() : 'BO1'}
                    </span>
                    <div className="flex items-center gap-2">
                        {isLive && (
                            <span className="flex items-center gap-1 text-red-500 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                LIVE
                            </span>
                        )}
                        {isVeto && <span className="text-cs-orange">VETO</span>}
                        {isCompleted && <span className="text-green-500">Finished</span>}
                    </div>
                </div>

                {/* Teams */}
                <div className="flex flex-col divide-y divide-white/5 bg-gradient-to-b from-transparent to-black/20">
                    <TeamDisplay
                        team={match.team1}
                        id={match.team1_id}
                        isWinner={match.winner_id === match.team1_id}
                        score={isCompleted || isLive ? score1 : undefined}
                        onTeamClick={onTeamClick}
                    />
                    <TeamDisplay
                        team={match.team2}
                        id={match.team2_id}
                        isWinner={match.winner_id === match.team2_id}
                        score={isCompleted || isLive ? score2 : undefined}
                        onTeamClick={onTeamClick}
                    />
                </div>
            </div>

            {/* Admin Quick Actions */}
            {isOrganizer && match.team1_id && match.team2_id && !match.winner_id && (
                <div className="absolute -right-8 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleWinner(match.team1_id); }}
                        className="w-6 h-6 bg-neutral-800 border border-white/20 hover:bg-green-600 hover:border-green-500 text-white flex items-center justify-center transition-colors"
                        title="Win T1"
                    >
                        <span className="text-[10px] font-bold">1</span>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleWinner(match.team2_id); }}
                        className="w-6 h-6 bg-neutral-800 border border-white/20 hover:bg-green-600 hover:border-green-500 text-white flex items-center justify-center transition-colors"
                        title="Win T2"
                    >
                        <span className="text-[10px] font-bold">2</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default TournamentBracket;
