import { motion } from 'framer-motion'
import usePageTitle from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'

const PrivacyPage = () => {
    usePageTitle('Политика конфиденциальности')
    return (
        <div className="min-h-screen bg-cs-dark pt-24 pb-12 px-4 text-white font-sans relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cs-grid-bg opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-cs-dark/80 via-cs-dark/90 to-cs-dark"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <Breadcrumbs />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-cs-surface border border-white/10 p-8 md:p-12 shadow-2xl">
                        <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">Политика конфиденциальности</h1>

                        <div className="space-y-8 text-gray-300 text-sm leading-relaxed font-normal">
                            <p>
                                Настоящая Политика конфиденциальности описывает порядок сбора, хранения, использования и раскрытия информации, предоставляемой пользователями при использовании сервиса CS2TOURNAMENTS.ASIA.
                            </p>

                            <section>
                                <h2 className="text-lg font-bold text-white mb-3">1. Сбор информации</h2>
                                <p className="mb-2">
                                    1.1. Мы собираем информацию, которую вы предоставляете нам автоматически при авторизации через Steam: Steam ID, публичное имя профиля, ссылка на аватар.
                                </p>
                                <p>
                                    1.2. Мы автоматически собираем техническую информацию при использовании сервиса: IP-адрес, тип браузера, время доступа, файлы cookie.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold text-white mb-3">2. Использование информации</h2>
                                <p className="mb-2">
                                    2.1. Собранная информация используется для: предоставления доступа к функционалу сервиса, проведения турниров, обработки статистики матчей, связи с пользователями.
                                </p>
                                <p>
                                    2.2. Мы используем данные Steam API для получения публичной информации о вашем игровом профиле (аватар, никнейм, статистика) с целью верификации и отображения на сайте.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold text-white mb-3">3. Раскрытие информации</h2>
                                <p className="mb-2">
                                    3.1. Мы не передаем ваши персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством, или когда это необходимо для обеспечения работы сервиса.
                                </p>
                                <p>
                                    3.2. Публичная информация вашего профиля (никнейм, статистика, история матчей) доступна другим пользователям сервиса.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold text-white mb-3">4. Защита данных</h2>
                                <p className="mb-2">
                                    4.1. Мы принимаем необходимые организационные и технические меры для защиты вашей персональной информации от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования, распространения.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold text-white mb-3">5. Права пользователей</h2>
                                <p className="mb-2">
                                    5.1. Вы имеете право в любой момент изменить свои настройки конфиденциальности в профиле Steam, что повлияет на отображение данных на нашем сервисе.
                                </p>
                                <p>
                                    5.2. Вы можете запросить удаление своего аккаунта и всех связанных с ним данных, обратившись в службу поддержки.
                                </p>
                            </section>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default PrivacyPage
