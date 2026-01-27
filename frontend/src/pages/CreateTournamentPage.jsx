import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tournamentAPI, teamAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Trophy, Calendar, Users, DollarSign, CheckCircle, AlertCircle, Loader2, Image, Upload, Map, Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import usePageTitle from '../hooks/usePageTitle'
import Breadcrumbs from '../components/Breadcrumbs'

const MAPS = ['Ancient', 'Dust2', 'Inferno', 'Mirage', 'Nuke', 'Overpass', 'Train']

const CreateTournamentPage = () => {
    usePageTitle('Создание турнира')
    const navigate = useNavigate()
    const { user, termsAccepted, isAuthenticated, loading: authLoading } = useAuth()

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                navigate('/')
            } else if (user?.role < 1) {
                navigate('/tournaments')
            }
        }
    }, [authLoading, isAuthenticated, user, navigate])

    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        description: `**Общие положения**
Турнир проводится на платформе CS2TOURNAMENTS.ASIA.
Сетка формируется автоматически после завершения регистрации.

**Как это работает?**
1. **Регистрация**: Капитан подает заявку на участие.
2. **Сетка**: После старта турнира вы увидите своего соперника в сетке.
3. **Матч**: Перейдите на страницу матча для проведения вето (выбора карт).
4. **Сервер**: Капитаны самостоятельно создают лобби в игре или используют сторонние платформы.
5. **Результат**: Победитель загружает скриншот счета на сайт.

**Готовность**
На старт матча отводится 15 минут. Если соперник не явился, сообщите администратору для получения технической победы.

**Призовой фонд**
Распределение призового фонда указано в информации о турнире. Выплаты производятся организатором после завершения турнира.`,
        format: 'single_elimination',
        max_teams: 8,
        start_date: '',
        registration_start_date: '',
        registration_end_date: '',
        prize_pool: '',
        banner_url: '',
        map_pool: [...MAPS],
        prize_distribution: [{ place: '1st', amount: '' }, { place: '2nd', amount: '' }, { place: '3rd', amount: '' }],
        rules: `1. Общие положения
1.1. Турнир проводится по дисциплине Counter-Strike 2.
1.2. Платформа выступает организатором сетки, но не предоставляет игровые серверы.
1.3. Все участники обязаны соблюдать принципы Fair Play и уважительно относиться к соперникам.

2. Организация матча
2.1. Капитаны команд самостоятельно договариваются о месте проведения матча (официальные сервера Valve, Faceit или частные сервера).
2.2. В случае разногласий матч проводится в режиме "Соревновательный" через создание лобби в игре.
2.3. Принимающая сторона (Team 1 в сетке) создает лобби и приглашает соперников.

3. Формат и Настройки
3.1. Карты определяются методом вычеркивания (Veto) на странице матча.
3.2. Настройки сервера: Стандартные соревновательные настройки CS2 (MR12).
3.3. Овертаймы: При счете 12:12 играются овертаймы (MR3), если это позволяет сервер.

4. Игровой процесс
4.1. Запрещено использование любого стороннего ПО, дающего преимущество (читы, скрипты).
4.2. В случае вылета игрока матч ставится на паузу (если возможно). Время ожидания — до 10 минут.

5. Результаты и Споры
5.1. Победитель обязан загрузить скриншот итогового счета на страницу матча.
5.2. За неявку команды в течение 15 минут после времени начала матча присуждается техническое поражение.
5.3. Любые споры решаются администратором турнира. Решение администратора окончательно.`
    })

    const handleMapToggle = (map) => {
        setFormData(prev => {
            const newPool = prev.map_pool.includes(map)
                ? prev.map_pool.filter(m => m !== map)
                : [...prev.map_pool, map]
            return { ...prev, map_pool: newPool }
        })
    }

    const handlePrizeChange = (index, field, value) => {
        const newDist = [...formData.prize_distribution]
        newDist[index][field] = value
        setFormData({ ...formData, prize_distribution: newDist })
    }

    const handleAddPrizePlace = () => {
        setFormData(prev => ({
            ...prev,
            prize_distribution: [...prev.prize_distribution, { place: `${prev.prize_distribution.length + 1}th`, amount: '' }]
        }))
    }

    const handleRemovePrizePlace = (index) => {
        setFormData(prev => ({
            ...prev,
            prize_distribution: prev.prize_distribution.filter((_, i) => i !== index)
        }))
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setError('Пожалуйста, выберите изображение')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Размер файла не должен превышать 5МБ')
            return
        }

        try {
            setUploading(true)
            setError('')
            const response = await teamAPI.uploadImage(file)
            setFormData({ ...formData, banner_url: response.data.url })
        } catch (err) {
            setError('Ошибка при загрузке изображения')
            console.error(err)
        } finally {
            setUploading(false)
        }
    }

    const getCurrentDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const minDate = getCurrentDateTime();

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!termsAccepted) {
            setError('Для создания турнира необходимо принять правила проекта.')
            return
        }

        setLoading(true)

        try {
            if (!formData.name || !formData.start_date || !formData.prize_pool) {
                throw new Error('Пожалуйста, заполните обязательные поля (включая призовой фонд)')
            }

            const totalPrize = parseInt(formData.prize_pool.replace(/[^0-9]/g, '')) || 0;
            const distributedPrize = formData.prize_distribution.reduce((acc, curr) => acc + (parseInt(curr.amount) || 0), 0);

            if (totalPrize !== distributedPrize) {
                throw new Error(`Сумма распределения (${distributedPrize}) должна быть равна призовому фонду (${totalPrize})`);
            }

            await tournamentAPI.createTournament(formData)
            navigate('/tournaments')
        } catch (err) {
            setError(err.response?.data?.message || err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-cs-dark text-white pt-10 px-4 relative overflow-hidden font-sans">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-cs-grid-bg opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-cs-dark/80 via-cs-dark/90 to-cs-dark"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto py-12">
                <Breadcrumbs />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
                    <div className="inline-block bg-cs-orange text-black px-3 py-1 text-xs font-black uppercase tracking-widest mb-2 rounded">
                        <span>Organizer Panel</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase">Создать Турнир</h1>
                    <p className="text-cs-text text-lg font-medium">Организуйте масштабное соревнование с сеткой и призами.</p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="bg-cs-surface border border-white/10 p-8 md:p-12 shadow-2xl rounded-xl"
                >
                    {error && (
                        <div className="mb-8 bg-red-900/20 border border-red-500/20 p-4 flex items-center gap-3 text-red-400 rounded-lg">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="font-bold">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Название Турнира *</label>
                                <div className="relative">
                                    <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cs-text" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 pl-12 pr-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors font-bold uppercase tracking-wider placeholder-cs-text/50 rounded-lg"
                                        placeholder="Major League Season 1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Дата Начала Турнира *</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cs-text" />
                                    <input
                                        type="datetime-local"
                                        min={minDate}
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 pl-12 pr-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors [color-scheme:dark] font-bold rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Начало Регистрации</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cs-text" />
                                    <input
                                        type="datetime-local"
                                        min={minDate}
                                        max={formData.registration_end_date || formData.start_date}
                                        value={formData.registration_start_date || ''}
                                        onChange={(e) => setFormData({ ...formData, registration_start_date: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 pl-12 pr-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors [color-scheme:dark] font-bold rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Конец Регистрации</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cs-text" />
                                    <input
                                        type="datetime-local"
                                        min={formData.registration_start_date || minDate}
                                        max={formData.start_date}
                                        value={formData.registration_end_date || ''}
                                        onChange={(e) => setFormData({ ...formData, registration_end_date: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 pl-12 pr-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors [color-scheme:dark] font-bold rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Макс. Команд</label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cs-text" />
                                    <select
                                        value={formData.max_teams}
                                        onChange={(e) => setFormData({ ...formData, max_teams: parseInt(e.target.value) })}
                                        className="w-full bg-black/40 border border-white/10 pl-12 pr-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors appearance-none font-bold uppercase tracking-wider rounded-lg"
                                    >
                                        <option value="4">4 Команды</option>
                                        <option value="8">8 Команд</option>
                                        <option value="16">16 Команд</option>
                                        <option value="32">32 Команды</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Формат Сетки</label>
                                <div className="relative">
                                    <select
                                        value={formData.format}
                                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 px-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors appearance-none font-bold uppercase tracking-wider rounded-lg"
                                    >
                                        <option value="single_elimination">Single Elimination (На вылет)</option>
                                        <option value="double_elimination">Double Elimination (Сетка лузеров)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Призовой Фонд</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.prize_pool}
                                        onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 px-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors font-bold placeholder-cs-text/50 rounded-lg"
                                        placeholder="100,000 ₸"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Баннер Турнира</label>
                                <div className="flex items-start gap-4">
                                    <div className="w-24 h-24 bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden relative group flex-shrink-0 rounded-lg">
                                        {formData.banner_url ? (
                                            <img src={formData.banner_url} alt="Tournament Banner" className="w-full h-full object-cover" />
                                        ) : (
                                            <Image className="w-8 h-8 text-cs-text/20" />
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 animate-spin text-cs-orange" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="tournament-banner-upload"
                                                disabled={uploading}
                                            />
                                            <label
                                                htmlFor="tournament-banner-upload"
                                                className={`flex items-center justify-center w-full p-4 border-2 border-dashed border-white/10 hover:border-cs-orange/50 hover:bg-white/5 transition-all cursor-pointer h-24 rounded-lg ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                                            >
                                                <div className="text-center">
                                                    <Upload className="w-6 h-6 text-cs-text mx-auto mb-1" />
                                                    <span className="block text-xs font-bold text-white uppercase tracking-wider">Загрузить</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Pool Selection */}
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
                            <Map className="w-5 h-5 text-cs-orange" />
                            Пул Карт
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {MAPS.map(map => (
                                <div
                                    key={map}
                                    onClick={() => handleMapToggle(map)}
                                    className={`cursor-pointer p-4 border transition-all duration-300 relative overflow-hidden group rounded-lg ${formData.map_pool.includes(map)
                                        ? 'bg-cs-orange/20 border-cs-orange text-white'
                                        : 'bg-black/40 border-white/10 text-cs-text hover:bg-white/5'
                                        }`}
                                >
                                    <div className="text-center font-bold uppercase tracking-wider text-sm relative z-10">
                                        {map}
                                    </div>
                                    {formData.map_pool.includes(map) && (
                                        <div className="absolute top-0 right-0 p-1">
                                            <CheckCircle className="w-3 h-3 text-cs-orange" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {formData.map_pool.length === 0 && (
                            <p className="text-red-400 text-sm mt-2 font-bold inline-block bg-red-900/20 px-2 py-1 rounded">
                                <span>Выберите хотя бы одну карту!</span>
                            </p>
                        )}
                    </div>

                    {/* Prize Distribution */}
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-400" />
                            Распределение Призовых
                        </h3>
                        <div className="space-y-4">
                            {formData.prize_distribution.map((item, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="w-24 relative">
                                        <input
                                            type="text"
                                            value={item.place}
                                            onChange={(e) => handlePrizeChange(index, 'place', e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 px-3 py-3 text-white focus:border-cs-orange focus:outline-none font-bold text-center uppercase rounded-lg"
                                            placeholder="Place"
                                        />
                                    </div>
                                    <div className="flex-1 relative">
                                        <input
                                            type="number"
                                            value={item.amount}
                                            onChange={(e) => handlePrizeChange(index, 'amount', e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-cs-orange focus:outline-none font-bold rounded-lg"
                                            placeholder="Сумма (₸)"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePrizePlace(index)}
                                        className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddPrizePlace}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-cs-text hover:text-white border border-white/10 font-bold uppercase tracking-wider text-sm flex items-center gap-2 transition-colors rounded-lg"
                            >
                                <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Добавить место</span>
                            </button>
                        </div>
                    </div>

                    {/* Round Configuration */}
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-wider border-b border-white/10 pb-2">Настройки Матчей</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(() => {
                                const maxTeams = parseInt(formData.max_teams) || 16;
                                const rounds = Math.ceil(Math.log2(maxTeams));
                                const inputs = [];

                                // Upper Bracket Rounds
                                for (let i = 1; i <= rounds; i++) {
                                    const teamsInRound = Math.pow(2, rounds - i + 1);
                                    let label = '';
                                    let key = '';
                                    let displayLabel = '';

                                    if (formData.format === 'double_elimination') {
                                        // Double Elimination Logic
                                        key = `upper_${i}`;
                                        if (i === rounds) {
                                            label = 'Финал Верхней Сетки';
                                        } else {
                                            label = teamsInRound === 4 ? 'Полуфинал' :
                                                teamsInRound === 8 ? 'Четвертьфинал' :
                                                    `1/${teamsInRound / 2}`;
                                        }
                                        displayLabel = `Верхняя сетка - Раунд ${i} (${label})`;
                                    } else {
                                        // Single Elimination Logic
                                        label = teamsInRound === 2 ? 'Финал' :
                                            teamsInRound === 4 ? 'Полуфинал' :
                                                teamsInRound === 8 ? 'Четвертьфинал' :
                                                    `1/${teamsInRound / 2}`;
                                        key = i === rounds ? 'final' : `upper_${i}`;
                                        displayLabel = i === rounds ? 'Гранд-финал' : `Раунд ${i} (${label})`;
                                    }

                                    inputs.push(
                                        <div key={key}>
                                            <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">{displayLabel}</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.round_config?.[key] || 'bo1'}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        round_config: { ...formData.round_config, [key]: e.target.value }
                                                    })}
                                                    className="w-full bg-black/40 border border-white/10 px-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors appearance-none font-bold uppercase tracking-wider rounded-lg"
                                                >
                                                    <option value="bo1">BO1 (Best of 1)</option>
                                                    <option value="bo3">BO3 (Best of 3)</option>
                                                    <option value="bo5">BO5 (Best of 5)</option>
                                                </select>
                                            </div>
                                        </div>
                                    );
                                }

                                // Lower Bracket & Grand Final (Double Elimination)
                                if (formData.format === 'double_elimination') {
                                    // Lower Bracket Default
                                    inputs.push(
                                        <div key="lower_default">
                                            <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Нижняя сетка (Все матчи)</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.round_config?.['lower_default'] || 'bo1'}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        round_config: { ...formData.round_config, 'lower_default': e.target.value }
                                                    })}
                                                    className="w-full bg-black/40 border border-white/10 px-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors appearance-none font-bold uppercase tracking-wider rounded-lg"
                                                >
                                                    <option value="bo1">BO1 (Best of 1)</option>
                                                    <option value="bo3">BO3 (Best of 3)</option>
                                                </select>
                                            </div>
                                        </div>
                                    );

                                    // Grand Final
                                    inputs.push(
                                        <div key="final">
                                            <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider text-cs-orange">Гранд-финал</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.round_config?.['final'] || 'bo3'}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        round_config: { ...formData.round_config, 'final': e.target.value }
                                                    })}
                                                    className="w-full bg-black/40 border border-cs-orange/50 px-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors appearance-none font-bold uppercase tracking-wider rounded-lg"
                                                >
                                                    <option value="bo1">BO1 (Best of 1)</option>
                                                    <option value="bo3">BO3 (Best of 3)</option>
                                                    <option value="bo5">BO5 (Best of 5)</option>
                                                </select>
                                            </div>
                                        </div>
                                    );
                                }

                                return inputs;
                            })()}
                        </div>
                    </div>

                    {/* Rules & Description */}
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-wider border-b border-white/10 pb-2">Правила и Описание</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Описание Турнира</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 px-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors font-medium rounded-lg min-h-[100px]"
                                    placeholder="Краткое описание вашего турнира..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-cs-text mb-2 uppercase tracking-wider">Правила Турнира</label>
                                <textarea
                                    value={formData.rules}
                                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 px-4 py-4 text-white focus:border-cs-orange focus:outline-none transition-colors font-mono text-sm rounded-lg min-h-[300px]"
                                    placeholder="Правила турнира..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                        <button
                            type="button"
                            onClick={() => navigate('/tournaments')}
                            className="px-8 py-4 font-bold text-cs-text hover:text-white transition-colors uppercase tracking-wider rounded-lg"
                        >
                            <span>Отмена</span>
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-cs-orange hover:bg-yellow-400 text-black font-black uppercase tracking-wider shadow-[0_0_20px_rgba(233,177,14,0.2)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                        >
                            <span className="flex items-center gap-2">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                Создать Турнир
                            </span>
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    )
}

export default CreateTournamentPage
