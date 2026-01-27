import { useState, useEffect } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { userAPI } from '../../utils/api'
import { Loader2, Trophy, Calendar, Users, Shield, Medal } from 'lucide-react'

const ProfileTournaments = () => {
    const { profile, isOwner } = useOutletContext()
    const tournaments = profile.tournaments || []

    const getStatusColor = (status) => {
        switch (status) {
            case 'upcoming':
            case 'registration': return 'bg-blue-400/10 text-blue-400 border-blue-400/20'
            case 'ongoing':
            case 'in_progress': return 'bg-green-400/10 text-green-400 border-green-400/20'
            case 'completed': return 'bg-gray-400/10 text-gray-400 border-gray-400/20'
            default: return 'bg-white/5 text-white border-white/10'
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'upcoming': return 'Предстоящий'
            case 'registration': return 'Регистрация'
            case 'ongoing': return 'Идет сейчас'
            case 'in_progress': return 'Идет сейчас'
            case 'completed': return 'Завершен'
            default: return status
        }
    }

    if (tournaments.length === 0) {
        return (
            <div className="bg-cs-surface border border-white/10 p-6 clip-path-slant relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cs-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="text-center py-12 text-cs-text text-sm relative z-10">
                    {isOwner ? 'Вы не участвовали ни в одном турнире' : 'Турниры не найдены'}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-cs-surface border border-white/10 p-6 clip-path-slant relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cs-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="flex flex-col gap-4 relative z-10">
                {tournaments.map((tournament) => (
                    <Link
                        key={tournament.id}
                        to={`/tournaments/${tournament.id}`}
                        className="group relative bg-black/20 border border-white/5 hover:border-cs-orange/50 p-4 transition-all duration-300 hover:bg-white/5 overflow-hidden block"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                            <div className="flex items-start md:items-center gap-4 flex-1 w-full md:w-auto">
                                <div className="w-12 h-12 bg-gradient-to-br from-cs-surface to-black border border-white/10 flex items-center justify-center skew-x-[-10deg]">
                                    <Trophy className="w-6 h-6 text-cs-orange skew-x-[10deg]" />
                                </div>

                                <div className="flex-1">
                                    <div className="font-bold text-lg text-white uppercase tracking-wider mb-1 group-hover:text-cs-orange transition-colors">
                                        {tournament.name}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-cs-text font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" />
                                            <span className="font-mono">{new Date(tournament.date_time || tournament.start_date).toLocaleDateString('ru-RU')}</span>
                                        </div>
                                        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                        <div className="flex items-center gap-1.5">
                                            <Shield className="w-3 h-3" />
                                            <span className="uppercase">{tournament.format}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                <div className={`px-3 py-1 text-xs font-black uppercase tracking-wider skew-x-[-10deg] border ${getStatusColor(tournament.status)}`}>
                                    <span className="skew-x-[10deg] flex items-center gap-1.5">
                                        {(tournament.status === 'ongoing' || tournament.status === 'in_progress') && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                                        )}
                                        {getStatusText(tournament.status)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5 text-xs font-bold text-cs-text bg-black/30 px-2 py-1 border border-white/5 skew-x-[-10deg]">
                                    <Users className="w-3 h-3 skew-x-[10deg]" />
                                    <span className="skew-x-[10deg]">{tournament.current_participants || tournament.teams_count || 0} / {tournament.max_participants || tournament.max_teams}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default ProfileTournaments
