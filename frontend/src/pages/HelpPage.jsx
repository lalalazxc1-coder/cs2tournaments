import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, FileText, AlertCircle } from 'lucide-react'
import usePageTitle from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'

const HelpPage = () => {
    usePageTitle('Помощь')
    const [activeAccordion, setActiveAccordion] = useState(null)

    const toggleAccordion = (index) => {
        setActiveAccordion(activeAccordion === index ? null : index)
    }

    const faqs = [
        {
            q: "Как начать пользоваться платформой?",
            a: "Для начала работы необходимо авторизоваться через Steam. Нажмите кнопку 'Войти через Steam' в правом верхнем углу. Это автоматически создаст ваш профиль и подтянет базовую информацию. После входа вы сможете участвовать в турнирах, создавать лобби и команды."
        },
        {
            q: "Как настроить свой профиль?",
            a: "Перейдите в свой профиль (кликните по аватарке в меню). В настройках вы можете изменить никнейм, а также выбрать уникальное оформление: загрузить аватар и выбрать фон профиля из доступной коллекции. Фон будет отображаться в шапке вашего профиля и в таблице рейтинга."
        },
        {
            q: "Система рейтинга и статистики",
            a: "Мы отслеживаем вашу статистику (K/D, Winrate, HS%, MVP) во всех матчах на платформе. Рейтинг рассчитывается на основе ваших побед и личной эффективности. Чем лучше вы играете, тем выше ваше место в глобальном топе игроков (раздел 'Рейтинг'). Вы также можете сравнивать свою статистику с другими игроками."
        },
        {
            q: "Как создать команду или вступить в неё?",
            a: "В разделе 'Команды' вы можете создать свой коллектив, указав название, тег и загрузив логотип. Капитан команды может приглашать игроков по ссылке-приглашению или через поиск. Вступление в команду позволяет участвовать в командных турнирах."
        },
        {
            q: "Турниры: участие и создание",
            a: "В разделе 'Турниры' вы найдете список активных соревнований. Чтобы принять участие, ваша команда должна соответствовать требованиям турнира. Любой пользователь также может стать организатором: нажмите 'Создать турнир', настройте формат (Single Elimination, BO1/BO3), призовой фонд и расписание. Организатор управляет сеткой и матчами."
        },
        {
            q: "Игровые лобби (Миксы)",
            a: "Хотите просто поиграть 5x5? Зайдите в раздел 'Лобби'. Вы можете присоединиться к открытому лобби или создать свое. При создании вы выбираете карты, режим (BO1/BO3) и настройки матча. В лобби работает система авто-баланса команд по рейтингу для честной игры."
        },
        {
            q: "Процесс матча и Veto",
            a: "Перед началом матча капитаны проходят процесс Veto (вычеркивание карт), чтобы определить карту игры. После этого организатор матча сообщает IP сервера и пароль для подключения. По завершении матча результат вносится в систему."
        },
        {
            q: "Что делать, если возникла проблема?",
            a: "Если вы столкнулись с технической ошибкой, нарушением правил или нечестной игрой, обратитесь к администратору турнира или напишите в поддержку через Telegram-бота (ссылка в меню)."
        }
    ]

    return (
        <div className="min-h-screen bg-cs-dark pt-24 pb-12 px-4 text-white font-sans relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cs-grid-bg opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-cs-dark/80 via-cs-dark/90 to-cs-dark"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <Breadcrumbs />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="mb-12">
                        <div className="inline-block bg-cs-orange text-black px-2 py-1 text-xs font-black uppercase tracking-widest mb-2 skew-x-[-10deg]">
                            <span className="skew-x-[10deg]">Support</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase italic">
                            Центр <span className="text-cs-orange">Поддержки</span>
                        </h1>
                        <p className="text-cs-text max-w-2xl text-lg font-medium">
                            Ответы на частые вопросы и инструкции по использованию платформы.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-cs-surface border border-white/10 p-6 clip-path-slant group hover:border-cs-orange/50 transition-colors">
                            <HelpCircle className="w-8 h-8 text-cs-orange mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wider">Частые вопросы</h3>
                            <p className="text-cs-text text-sm font-medium">Ответы на популярные вопросы о платформе.</p>
                        </div>
                        <div className="bg-cs-surface border border-white/10 p-6 clip-path-slant group hover:border-cs-blue/50 transition-colors">
                            <AlertCircle className="w-8 h-8 text-cs-blue mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wider">Обновления</h3>
                            <p className="text-cs-text text-sm font-medium">История изменений и новые функции.</p>
                        </div>
                        <div className="bg-cs-surface border border-white/10 p-6 clip-path-slant group hover:border-green-500/50 transition-colors">
                            <FileText className="w-8 h-8 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wider">Правила</h3>
                            <p className="text-cs-text text-sm font-medium">Правила проведения турниров и использования.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-wider pl-4 border-l-4 border-cs-orange">Популярные вопросы</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="bg-cs-surface border border-white/10 overflow-hidden clip-path-slant"
                                >
                                    <button
                                        onClick={() => toggleAccordion(index)}
                                        className="w-full flex justify-between items-center p-6 text-left hover:bg-white/5 transition-colors"
                                    >
                                        <span className="font-bold text-lg text-white uppercase tracking-tight">{faq.q}</span>
                                        <ChevronDown className={`w-5 h-5 text-cs-orange transition-transform duration-300 ${activeAccordion === index ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {activeAccordion === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                            >
                                                <div className="px-6 pb-6 text-cs-text leading-relaxed border-t border-white/5 pt-4 font-medium">
                                                    {faq.a}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default HelpPage
