import React from 'react';
import { Trophy } from 'lucide-react';

const MatchStatsTable = ({ matchDetails }) => {
    if (!matchDetails || !matchDetails.player_stats) {
        return (
            <div className="text-center text-cs-text py-4 font-bold uppercase tracking-wider">
                Нет статистики игроков
            </div>
        );
    }

    const renderTeamStats = (teamName, score, filterFn) => (
        <div>
            <h3 className="text-lg font-black text-white mb-4 border-b border-white/5 pb-2 flex justify-between items-center uppercase tracking-wider">
                <span>{teamName}</span>
                <span className="text-2xl text-cs-orange">{score}</span>
            </h3>
            <div className="overflow-x-auto border border-white/5 bg-black/20 skew-x-[-2deg] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-cs-orange/50 [&::-webkit-scrollbar-thumb]:rounded-full">
                <table className="w-full text-left text-xs skew-x-[2deg]">
                    <thead className="bg-white/5 text-cs-text font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="py-1 pl-3">Игрок</th>
                            <th className="py-1 text-center">K</th>
                            <th className="py-1 text-center">D</th>
                            <th className="py-1 text-center">A</th>
                            <th className="py-1 text-center">KD</th>
                            <th className="py-1 text-center">KPR</th>
                            <th className="py-1 text-center">HS</th>
                            <th className="py-1 text-center text-cs-orange">5K</th>
                            <th className="py-1 text-center text-purple-400">4K</th>
                            <th className="py-1 text-center text-blue-400">3K</th>
                            <th className="py-1 text-center text-gray-400">2K</th>
                            <th className="py-1 text-center">MVP</th>
                            <th className="py-1 text-center">ADR</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {matchDetails.player_stats
                            .filter(filterFn)
                            .sort((a, b) => b.kills - a.kills)
                            .map((stat) => (
                                <tr key={stat.stat_id} className="hover:bg-white/5">
                                    <td className="py-1 pl-3 font-bold text-white truncate max-w-[100px]">
                                        {stat.nickname || stat.username || stat.player_name || 'Unknown'}
                                    </td>
                                    <td className="py-1 text-center text-green-400 font-bold">{stat.kills}</td>
                                    <td className="py-1 text-center text-red-400">{stat.deaths}</td>
                                    <td className="py-1 text-center text-gray-400">{stat.assists}</td>
                                    <td className="py-1 text-center text-gray-300">{(stat.kills / (stat.deaths || 1)).toFixed(2)}</td>
                                    <td className="py-1 text-center text-gray-300">{stat.kpr}</td>
                                    <td className="py-1 text-center text-gray-300">{stat.hs} ({Math.round(stat.hs_percent)}%)</td>
                                    <td className="py-1 text-center text-cs-orange font-bold">{stat['5k'] > 0 ? stat['5k'] : '-'}</td>
                                    <td className="py-1 text-center text-purple-400 font-bold">{stat['4k'] > 0 ? stat['4k'] : '-'}</td>
                                    <td className="py-1 text-center text-blue-400">{stat['3k'] > 0 ? stat['3k'] : '-'}</td>
                                    <td className="py-1 text-center text-gray-400">{stat['2k'] > 0 ? stat['2k'] : '-'}</td>
                                    <td className="py-1 text-center text-yellow-500">{stat.MVP > 0 ? stat.MVP : '-'}</td>
                                    <td className="py-1 text-center text-gray-400">{Math.round(stat.adr)}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {renderTeamStats(
                'Team A',
                matchDetails.match.team_a_score,
                p => p.team_name === 'Team A' || p.team_name === 'TERRORIST' || p.team_name === '2'
            )}
            {renderTeamStats(
                'Team B',
                matchDetails.match.team_b_score,
                p => p.team_name === 'Team B' || p.team_name === 'CT' || p.team_name === '3'
            )}
        </div>
    );
};

export default MatchStatsTable;
