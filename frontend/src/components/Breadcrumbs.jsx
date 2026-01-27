import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const routeNameMap = {
    'lobbies': 'Лобби',
    'tournaments': 'Турниры',
    'teams': 'Команды',
    'players': 'Рейтинг',
    'matches': 'Матчи',
    'profile': 'Профиль',
    'create': 'Создание',
    'admin': 'Админ-панель',
    'help': 'Помощь',
    'privacy': 'Конфиденциальность',
    'rules': 'Правила',
    'terms': 'Соглашение',
    'user': 'Пользователь'
}

const Breadcrumbs = ({ items, lastBreadcrumbLabel }) => {
    const location = useLocation()

    let crumbs = []

    if (items) {
        crumbs = items
    } else {
        const pathnames = location.pathname.split('/').filter((x) => x)
        crumbs = pathnames.map((value, index) => {
            let to = `/${pathnames.slice(0, index + 1).join('/')}`
            const isLast = index === pathnames.length - 1

            let label = routeNameMap[value] || value

            // Special handling for 'user' route -> redirect to /players
            if (value === 'user') {
                to = '/players'
                label = 'Игроки'
            }

            // Handle IDs (simple heuristic: if it looks like a number or UUID, or is long)
            if (value.match(/^[0-9]+$/) || value.length > 20) {
                label = `#${value.substring(0, 8)}`
            }

            if (isLast && lastBreadcrumbLabel) {
                label = lastBreadcrumbLabel
            }

            return { label, path: to, isLast }
        })
    }

    if (location.pathname === '/') return null

    return (
        <nav className="flex items-center text-sm text-cs-text mb-6 overflow-x-auto whitespace-nowrap pb-2">
            <Link to="/" className="hover:text-white transition-colors flex items-center">
                <Home className="w-4 h-4" />
            </Link>
            {crumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                    <ChevronRight className="w-4 h-4 mx-2 text-white/20" />
                    {crumb.isLast ? (
                        <span className="text-white font-bold uppercase tracking-wider">{crumb.label}</span>
                    ) : (
                        <Link to={crumb.path} className="hover:text-white transition-colors uppercase tracking-wider font-medium">
                            {crumb.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    )
}

export default Breadcrumbs
