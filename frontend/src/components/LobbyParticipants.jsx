import { Users, Ban } from 'lucide-react'
import { Link } from 'react-router-dom'

const LobbyParticipants = ({ participants, maxParticipants, isOrganizer, currentUserId, creatorId, onKick }) => {
    return (
        <div className="bg-cs-surface clip-path-slant border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-wider">
                    <Users className="w-5 h-5 text-cs-orange" />
                    Участники <span className="text-cs-orange">({participants.length}/{maxParticipants})</span>
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-white/5 text-cs-text text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 text-left">#</th>
                            <th className="px-6 py-4 text-left">Игрок</th>
                            <th className="px-6 py-4 text-center">K/D</th>
                            <th className="px-6 py-4 text-center">Win Rate</th>
                            <th className="px-6 py-4 text-center">Матчи</th>
                            {isOrganizer && <th className="px-6 py-4 text-right">Действия</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {participants.map((p, index) => (
                            <tr key={p.user_id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-cs-text font-mono font-bold">{index + 1}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Link to={`/user/${(p.custom_url && !p.custom_url.includes('/')) ? p.custom_url : p.user_id}`} className="font-black text-white text-lg uppercase tracking-tight hover:text-cs-orange transition-colors">
                                            {p.nickname || p.username}
                                        </Link>
                                        {p.user_id === creatorId && (
                                            <span className="bg-cs-orange/20 text-cs-orange text-[10px] px-2 py-0.5 uppercase font-black tracking-wider skew-x-[-10deg] border border-cs-orange/30">
                                                <span className="skew-x-[10deg]">Орг</span>
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className={`px-6 py-4 text-center font-bold ${p.k_d >= 1.2 ? 'text-green-400' : 'text-cs-text'}`}>
                                    {p.k_d}
                                </td>
                                <td className={`px-6 py-4 text-center font-bold ${p.win_rate >= 55 ? 'text-green-400' : 'text-cs-text'}`}>
                                    {p.win_rate}%
                                </td>
                                <td className="px-6 py-4 text-center text-cs-text font-medium">
                                    {p.matches}
                                </td>
                                {isOrganizer && p.user_id !== creatorId && (
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onKick(p.user_id)}
                                            className="text-red-500 hover:bg-red-500/10 p-2 transition-colors group"
                                            title="Исключить"
                                        >
                                            <Ban className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {participants.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-cs-text font-medium uppercase tracking-wider">
                                    Пока нет участников
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default LobbyParticipants
