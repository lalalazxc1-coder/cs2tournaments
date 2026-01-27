import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck, FileText, Scale, BookOpen, Check, ChevronRight, ArrowLeft, AlertTriangle } from 'lucide-react'

// Content components (RulesContent, TermsContent, PrivacyContent) - same as before
const RulesContent = () => (
    <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
        <p>
            Настоящие правила регулируют поведение пользователей на платформе CS2TOURNAMENTS.ASIA. Обратите внимание: платформа предоставляет инструменты для организации матчей, но не предоставляет игровые серверы. Игроки самостоятельно организуют проведение матча (через лобби в игре или сторонние сервисы).
        </p>
        <section>
            <h3 className="text-white font-bold mb-2">1. Аккаунт и безопасность</h3>
            <p className="mb-1">1.1. Запрещено создание нескольких аккаунтов (мультиаккаунтинг) и смурфинг. Один пользователь — один аккаунт.</p>
            <p className="mb-1">1.2. Запрещена передача, продажа или обмен аккаунта. Владелец несет полную ответственность за действия, совершенные с его профиля.</p>
            <p className="text-xs font-bold text-white uppercase mt-2">Наказание: Перманентная блокировка всех связанных аккаунтов.</p>
        </section>
        <section>
            <h3 className="text-white font-bold mb-2">2. Поведение на платформе</h3>
            <p className="mb-1">2.1. Строго запрещено использование оскорбительных, нецензурных или провокационных выражений в никнеймах, названиях команд и метках (тегах).</p>
            <p className="mb-1">2.2. Запрещено оставлять оскорбительные комментарии на стенах пользователей, а также спамить или угрожать в чатах.</p>
            <p className="text-xs font-bold text-white uppercase mt-2">Наказание: Блокировка аккаунта (от временной до перманентной) и удаление запрещенного контента.</p>
        </section>
        <section>
            <h3 className="text-white font-bold mb-2">3. Организация матчей</h3>
            <p className="mb-1">3.1. Так как платформа не предоставляет серверы, капитаны команд/организаторы лобби обязаны самостоятельно создать лобби в игре CS2 и пригласить участников.</p>
            <p className="mb-1">3.2. Участники обязаны явиться на матч в течение 15 минут после согласованного времени старта.</p>
            <p className="text-xs font-bold text-white uppercase mt-2">Наказание: Техническое поражение за неявку.</p>
        </section>
        <section>
            <h3 className="text-white font-bold mb-2">4. Результаты и честная игра</h3>
            <p className="mb-1">4.1. Капитаны обязаны предоставлять достоверные скриншоты результатов матча. Фальсификация результатов строго запрещена.</p>
            <p className="mb-1">4.2. Игроки с активной VAC-блокировкой (полученной менее 365 дней назад) не допускаются к участию в турнирах.</p>
            <p className="mb-1">4.3. Использование читов в матчах, организованных через платформу, влечет блокировку профиля на сайте.</p>
            <p className="text-xs font-bold text-white uppercase mt-2">Наказание: Перманентная блокировка за фальсификацию или читы.</p>
        </section>
        <section>
            <h3 className="text-white font-bold mb-2">5. Создание лобби и турниров</h3>
            <p className="mb-1">5.1. Запрещено создание "фейковых" лобби или турниров с целью обмана пользователей или спама.</p>
            <p className="mb-1">5.2. Организатор обязан следить за проведением матча и своевременно подтверждать результаты.</p>
            <p className="text-xs font-bold text-white uppercase mt-2">Наказание: Блокировка возможности создавать лобби/турниры.</p>
        </section>
    </div>
)

const TermsContent = () => (
    <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
        <p>
            Настоящее Лицензионное соглашение (далее — "Соглашение") является юридически обязательным документом, регулирующим отношения между Администрацией сервиса CS2TOURNAMENTS.ASIA (далее — "Администрация") и физическим лицом (далее — "Пользователь"), использующим данный сервис.
        </p>
        <section>
            <h3 className="text-white font-bold mb-2">1. Предмет соглашения</h3>
            <p className="mb-1">1.1. Администрация предоставляет Пользователю право использования сервиса для организации и участия в киберспортивных турнирах, создания игровых лобби, поиска команды и отслеживания игровой статистики на условиях простой (неисключительной) лицензии.</p>
            <p className="mb-1">1.2. Использование сервиса является бесплатным, за исключением дополнительных платных услуг, условия предоставления которых регулируются отдельными соглашениями.</p>
        </section>
        <section>
            <h3 className="text-white font-bold mb-2">2. Права и обязанности сторон</h3>
            <p className="mb-1">2.1. Пользователь обязуется предоставлять достоверную информацию при авторизации через Steam и не использовать сервис для нарушения законодательства или прав третьих лиц.</p>
            <p className="mb-1">2.2. Администрация обязуется обеспечивать работоспособность сервиса, однако не гарантирует его бесперебойную работу и не несет ответственности за временные сбои.</p>
            <p className="mb-1">2.3. Администрация имеет право в одностороннем порядке ограничивать доступ Пользователя к сервису в случае нарушения им условий настоящего Соглашения или Правил проекта.</p>
        </section>
        <section>
            <h3 className="text-white font-bold mb-2">3. Интеллектуальная собственность</h3>
            <p className="mb-1">3.1. Все объекты, размещенные на сервисе, включая элементы дизайна, текст, графические изображения, иллюстрации, видео, скрипты, программы, музыку, звуки и другие объекты и их подборки (далее — Контент), являются объектами исключительных прав Администрации и других правообладателей.</p>
            <p className="mb-1">3.2. Никакой Контент не может быть скопирован (воспроизведен), переработан, распространен, отображен во фрейме, опубликован, скачан, передан, продан или иным способом использован целиком или по частям без предварительного разрешения правообладателя.</p>
        </section>
        <section>
            <h3 className="text-white font-bold mb-2">4. Ответственность сторон</h3>
            <p className="mb-1">4.1. Пользователь несет полную ответственность за сохранность своих учетных данных Steam и за все действия, совершенные под его учетной записью.</p>
            <p className="mb-1">4.2. Администрация не несет ответственности за любой прямой или косвенный ущерб, возникший в результате использования или невозможности использования сервиса.</p>
        </section>
        <section>
            <h3 className="text-white font-bold mb-2">5. Заключительные положения</h3>
            <p className="mb-1">5.1. Настоящее Соглашение может быть изменено Администрацией без какого-либо специального уведомления. Новая редакция Соглашения вступает в силу с момента ее размещения в сети Интернет.</p>
            <p className="mb-1">5.2. Все споры и разногласия, возникающие в связи с исполнением настоящего Соглашения, разрешаются путем переговоров.</p>
        </section>
    </div>
)

const PrivacyContent = () => (
    <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
        <p>
            Настоящая Политика конфиденциальности описывает порядок сбора, хранения, использования и раскрытия информации, предоставляемой пользователями при использовании сервиса CS2TOURNAMENTS.ASIA.
        </p>
        <section>
            <h3 className="text-white font-bold mb-2">1. Сбор информации</h3>
            <p className="mb-1">1.1. Мы собираем информацию, которую вы предоставляете нам автоматически при авторизации через Steam: Steam ID, публичное имя профиля, ссылка на аватар.</p>
            <p className="mb-1">1.2. Мы автоматически собираем техническую информацию при использовании сервиса: IP-адрес, тип браузера, время доступа, файлы cookie.</p>
        </section>
        <section>
            <h3 className="text-white font-bold mb-2">2. Использование информации</h3>
            <p className="mb-1">2.1. Собранная информация используется для: предоставления доступа к функционалу сервиса, проведения турниров, обработки статистики матчей, связи с пользователями.</p>
            <p className="mb-1">2.2. Мы используем данные Steam API для получения публичной информации о вашем игровом профиле (аватар, никнейм, статистика) с целью верификации и отображения на сайте.</p>
        </section>
        <section>
            <h3 className="text-white font-bold mb-2">3. Раскрытие информации</h3>
            <p className="mb-1">3.1. Мы не передаем ваши персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством, или когда это необходимо для обеспечения работы сервиса.</p>
            <p className="mb-1">3.2. Публичная информация вашего профиля (никнейм, статистика, история матчей) доступна другим пользователям сервиса.</p>
        </section>
        <section>
            <h3 className="text-white font-bold mb-2">4. Защита данных</h3>
            <p className="mb-1">4.1. Мы принимаем необходимые организационные и технические меры для защиты вашей персональной информации от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования, распространения.</p>
        </section>
        <section>
            <h3 className="text-white font-bold mb-2">5. Права пользователей</h3>
            <p className="mb-1">5.1. Вы имеете право в любой момент изменить свои настройки конфиденциальности в профиле Steam, что повлияет на отображение данных на нашем сервисе.</p>
            <p className="mb-1">5.2. Вы можете запросить удаление своего аккаунта и всех связанных с ним данных, обратившись в службу поддержки.</p>
        </section>
    </div>
)

const TermsAcceptanceModal = () => {
    const { user, isAuthenticated, termsAccepted, acceptTerms } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [activeTab, setActiveTab] = useState('welcome') // welcome, rules, terms, privacy
    const [readDocs, setReadDocs] = useState({
        rules: false,
        terms: false,
        privacy: false
    })

    useEffect(() => {
        if (isAuthenticated && user && !termsAccepted) {
            setIsOpen(true)
        } else {
            setIsOpen(false)
        }
    }, [isAuthenticated, user, termsAccepted])

    const handleAccept = () => {
        acceptTerms()
        localStorage.setItem('cookieConsent', 'true') // Also accept cookies
        setIsOpen(false)
    }

    const markAsRead = (doc) => {
        setReadDocs(prev => ({ ...prev, [doc]: true }))
    }

    const allRead = readDocs.rules && readDocs.terms && readDocs.privacy

    if (!isOpen) return null

    // Banner Mode
    if (!isExpanded) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-[100] bg-cs-surface border-t border-cs-orange/50 shadow-2xl p-4 md:p-6"
                >
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-cs-orange/10 rounded-full hidden md:block">
                                <AlertTriangle className="w-6 h-6 text-cs-orange" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold uppercase tracking-wide mb-1">Требуется действие</h3>
                                <p className="text-gray-400 text-sm">
                                    Для участия в турнирах и матчах необходимо принять правила проекта. <br className="hidden md:block" />
                                    Без этого доступ к функционалу ограничен.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="w-full md:w-auto px-8 py-3 bg-cs-orange text-black font-black uppercase tracking-wider hover:bg-white transition-colors clip-path-slant whitespace-nowrap"
                        >
                            Ознакомиться и принять
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        )
    }

    // Expanded Modal Mode
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/95 backdrop-blur-md"
                    onClick={() => setIsExpanded(false)} // Click outside to close (collapse to banner)
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative bg-cs-surface border border-white/10 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 bg-black/20 flex-shrink-0 flex justify-between items-center">
                        <div className="flex items-center justify-between w-full">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-cs-orange" />
                                {activeTab === 'welcome' ? 'Добро пожаловать' :
                                    activeTab === 'rules' ? 'Правила проекта' :
                                        activeTab === 'terms' ? 'Лицензионное соглашение' : 'Политика конфиденциальности'}
                            </h2>
                            {activeTab !== 'welcome' && (
                                <button
                                    onClick={() => setActiveTab('welcome')}
                                    className="text-gray-400 hover:text-white text-sm font-bold uppercase flex items-center gap-1 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Назад
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
                        {activeTab === 'welcome' && (
                            <div className="space-y-6">
                                Для доступа к платформе CS2TOURNAMENTS.ASIA необходимо ознакомиться и принять следующие документы.
                                Принимая условия, вы также соглашаетесь с использованием файлов cookie.

                                <div className="space-y-3">
                                    <button
                                        onClick={() => { setActiveTab('rules'); markAsRead('rules'); }}
                                        className={`w-full flex items-center justify-between p-4 border transition-all group ${readDocs.rules ? 'bg-green-500/10 border-green-500/30' : 'bg-black/20 border-white/5 hover:border-cs-orange/50'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${readDocs.rules ? 'bg-green-500 text-black border-green-500' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                                                {readDocs.rules ? <Check className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                                            </div>
                                            <div className="text-left">
                                                <div className={`font-bold text-sm uppercase ${readDocs.rules ? 'text-green-400' : 'text-white group-hover:text-cs-orange'}`}>Правила проекта</div>
                                                <div className="text-xs text-gray-500">Поведение, баны и штрафы</div>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-5 h-5 ${readDocs.rules ? 'text-green-500' : 'text-gray-600 group-hover:text-white'}`} />
                                    </button>

                                    <button
                                        onClick={() => { setActiveTab('terms'); markAsRead('terms'); }}
                                        className={`w-full flex items-center justify-between p-4 border transition-all group ${readDocs.terms ? 'bg-green-500/10 border-green-500/30' : 'bg-black/20 border-white/5 hover:border-cs-blue/50'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${readDocs.terms ? 'bg-green-500 text-black border-green-500' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                                                {readDocs.terms ? <Check className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
                                            </div>
                                            <div className="text-left">
                                                <div className={`font-bold text-sm uppercase ${readDocs.terms ? 'text-green-400' : 'text-white group-hover:text-cs-blue'}`}>Лицензионное соглашение</div>
                                                <div className="text-xs text-gray-500">Права и обязанности сторон</div>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-5 h-5 ${readDocs.terms ? 'text-green-500' : 'text-gray-600 group-hover:text-white'}`} />
                                    </button>

                                    <button
                                        onClick={() => { setActiveTab('privacy'); markAsRead('privacy'); }}
                                        className={`w-full flex items-center justify-between p-4 border transition-all group ${readDocs.privacy ? 'bg-green-500/10 border-green-500/30' : 'bg-black/20 border-white/5 hover:border-purple-500/50'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${readDocs.privacy ? 'bg-green-500 text-black border-green-500' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                                                {readDocs.privacy ? <Check className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                            </div>
                                            <div className="text-left">
                                                <div className={`font-bold text-sm uppercase ${readDocs.privacy ? 'text-green-400' : 'text-white group-hover:text-purple-500'}`}>Политика конфиденциальности</div>
                                                <div className="text-xs text-gray-500">Обработка ваших данных</div>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-5 h-5 ${readDocs.privacy ? 'text-green-500' : 'text-gray-600 group-hover:text-white'}`} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'rules' && <RulesContent />}
                        {activeTab === 'terms' && <TermsContent />}
                        {activeTab === 'privacy' && <PrivacyContent />}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-white/10 bg-black/20 flex-shrink-0 flex gap-4">
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="flex-1 bg-white/5 text-gray-400 font-bold uppercase py-3 hover:bg-white/10 transition-colors"
                        >
                            Свернуть
                        </button>
                        {activeTab === 'welcome' ? (
                            <button
                                onClick={handleAccept}
                                disabled={!allRead}
                                className={`flex-[2] font-black uppercase py-4 tracking-wider text-sm clip-path-slant transition-all ${allRead
                                    ? 'bg-white text-black hover:bg-cs-orange cursor-pointer'
                                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {allRead ? 'Я ознакомился и принимаю условия' : 'Ознакомьтесь со всеми документами'}
                            </button>
                        ) : (
                            <button
                                onClick={() => setActiveTab('welcome')}
                                className="flex-[2] bg-white/10 text-white font-bold uppercase py-3 hover:bg-white/20 transition-colors"
                            >
                                Вернуться к списку
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export default TermsAcceptanceModal
