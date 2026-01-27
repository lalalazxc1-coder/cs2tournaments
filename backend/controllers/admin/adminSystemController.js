const { SystemSetting } = require('../../models');

exports.getSettings = async (req, res) => {
    try {
        const settings = await SystemSetting.findAll();
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });
        res.json(settingsMap);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Ошибка при получении настроек' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { settings } = req.body;

        for (const [key, value] of Object.entries(settings)) {
            await SystemSetting.upsert({
                key,
                value: String(value)
            });
        }

        res.json({ message: 'Настройки обновлены' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Ошибка при обновлении настроек' });
    }
};
