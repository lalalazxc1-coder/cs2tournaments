import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export const ParticipantsProgress = ({ current, max }) => {
    const percentage = (current / max) * 100
    const isFull = current >= max
    const isAlmostFull = percentage >= 80

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Участники</span>
                <span className={`text-[10px] font-black ${isFull ? 'text-red-400' : isAlmostFull ? 'text-amber-400' : 'text-gray-400'}`}>
                    {current}/{max}
                </span>
            </div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden border border-white/5">
                <div
                    className={`h-full transition-all duration-500 ${isFull ? 'bg-red-500' : isAlmostFull ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

export const CountdownTimer = ({ dateTime }) => {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date()
            const target = new Date(dateTime)
            const diff = target - now

            if (diff <= 0) {
                setTimeLeft('Начался')
                return
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

            if (days > 0) {
                setTimeLeft(`через ${days}д ${hours}ч`)
            } else if (hours > 0) {
                setTimeLeft(`через ${hours}ч ${minutes}м`)
            } else {
                setTimeLeft(`через ${minutes}м`)
            }
        }

        calculateTimeLeft()
        const interval = setInterval(calculateTimeLeft, 60000)

        return () => clearInterval(interval)
    }, [dateTime])

    return (
        <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-bold text-sm">{timeLeft}</span>
        </div>
    )
}
