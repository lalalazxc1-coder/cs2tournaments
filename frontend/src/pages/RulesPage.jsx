import { motion } from 'framer-motion'
import usePageTitle from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'

const RulesPage = () => {
    usePageTitle('Правила')
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
                        <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">Правила проекта</h1>

                        <div className="space-y-8 text-gray-300 text-sm leading-relaxed font-normal">
                            <p>
                                Настоящие правила регулируют поведение пользователей на платформе CS2TOURNAMENTS.ASIA. Обратите внимание: платформа предоставляет инструменты для организации матчей, но не предоставляет игровые серверы. Игроки самостоятельно организуют проведение матча (через лобби в игре или сторонние сервисы).
                            </p>

                            <section>
                                <h2 className="text-lg font-bold text-white mb-3">1. Аккаунт и безопасность</h2>
                                <p className="mb-2">
                                    1.1. Запрещено создание нескольких аккаунтов (мультиаккаунтинг) и смурфинг. Один пользователь — один аккаунт.
                                </p>
                                <p className="mb-2">
                                    1.2. Запрещена передача, продажа или обмен аккаунта. Владелец несет полную ответственность за действия, совершенные с его профиля.
                                </p>
                                <p className="font-bold text-white uppercase text-xs">
                                    Наказание: Перманентная блокировка всех связанных аккаунтов.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold text-white mb-3">2. Поведение на платформе</h2>
                                <p className="mb-2">
                                    2.1. Строго запрещено использование оскорбительных, нецензурных или провокационных выражений в никнеймах, названиях команд и метках (тегах).
                                </p>
                                <p className="mb-2">
                                    2.2. Запрещено оставлять оскорбительные комментарии на стенах пользователей, а также спамить или угрожать в чатах.
                                </p>
                                <p className="font-bold text-white uppercase text-xs">
                                    Наказание: Блокировка аккаунта (от временной до перманентной) и удаление запрещенного контента.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold text-white mb-3">3. Организация матчей</h2>
                                <p className="mb-2">
                                    3.1. Так как платформа не предоставляет серверы, капитаны команд/организаторы лобби обязаны самостоятельно создать лобби в игре CS2 и пригласить участников.
                                </p>
                                <p className="mb-2">
                                    3.2. Участники обязаны явиться на матч в течение 15 минут после согласованного времени старта.
                                </p>
                                <p className="font-bold text-white uppercase text-xs">
                                    Наказание: Техническое поражение за неявку.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold text-white mb-3">4. Результаты и честная игра</h2>
                                <p className="mb-2">
                                    4.1. Капитаны обязаны предоставлять достоверные скриншоты результатов матча. Фальсификация результатов строго запрещена.
                                </p>
                                <p className="mb-2">
                                    4.2. Игроки с активной VAC-блокировкой (полученной менее 365 дней назад) не допускаются к участию в турнирах.
                                </p>
                                <p className="mb-2">
                                    4.3. Использование читов в матчах, организованных через платформу, влечет блокировку профиля на сайте.
                                </p>
                                <p className="font-bold text-white uppercase text-xs">
                                    Наказание: Перманентная блокировка за фальсификацию или читы.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold text-white mb-3">5. Создание лобби и турниров</h2>
                                <p className="mb-2">
                                    5.1. Запрещено создание "фейковых" лобби или турниров с целью обмана пользователей или спама.
                                </p>
                                <p className="mb-2">
                                    5.2. Организатор обязан следить за проведением матча и своевременно подтверждать результаты.
                                </p>
                                <p className="font-bold text-white uppercase text-xs">
                                    Наказание: Блокировка возможности создавать лобби/турниры.
                                </p>
                            </section>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default RulesPage
