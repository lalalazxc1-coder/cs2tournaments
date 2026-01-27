const { User } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const axios = require('axios');

exports.setSteamId = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        const userId = req.user.userId;
        const { steam_id } = req.body;
        const STEAM_API_KEY = process.env.STEAM_API_KEY;
        if (!STEAM_API_KEY) {
            console.error('STEAM_API_KEY is not defined in environment variables');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error'
            });
        }

        // Check if Steam ID is already used by another user
        const existingUser = await User.findOne({
            where: {
                steam_id,
                id: { [Op.ne]: userId }
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'This Steam ID is already linked to another account'
            });
        }

        // Fetch Steam Avatar
        let avatar_url = null;
        try {
            const steamResponse = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steam_id}`);
            const players = steamResponse.data?.response?.players;
            if (players && players.length > 0) {
                avatar_url = players[0].avatarfull;
            }
        } catch (steamError) {
            console.error('Error fetching Steam avatar:', steamError);
            // Continue without avatar update if fetch fails
        }

        // Update user's Steam ID and Avatar
        const updateData = { steam_id };
        if (avatar_url) {
            updateData.avatar_url = avatar_url;
        }

        await User.update(
            updateData,
            { where: { id: userId } }
        );

        res.json({
            success: true,
            message: 'Steam ID successfully linked',
            avatar_url
        });

    } catch (error) {
        console.error('Set Steam ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error linking Steam ID'
        });
    }
};

exports.removeSteamId = async (req, res) => {
    try {
        const userId = req.user.userId;

        await User.update(
            { steam_id: null },
            { where: { id: userId } }
        );

        res.json({
            success: true,
            message: 'Steam ID successfully removed'
        });

    } catch (error) {
        console.error('Remove Steam ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing Steam ID'
        });
    }
};

exports.syncSteam = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findByPk(userId);

        if (!user.steam_id) {
            return res.status(400).json({ message: 'Steam account not linked' });
        }

        const STEAM_API_KEY = process.env.STEAM_API_KEY;
        if (!STEAM_API_KEY) {
            return res.status(500).json({ message: 'Server configuration error: Steam API Key missing' });
        }

        const steamResponse = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${user.steam_id}`);
        const players = steamResponse.data?.response?.players;

        if (!players || players.length === 0) {
            return res.status(404).json({ message: 'Steam profile not found' });
        }

        const player = players[0];

        user.nickname = player.personaname;
        user.avatar_full = player.avatarfull;
        user.avatar_medium = player.avatarmedium;
        user.real_name = player.realname || user.real_name;
        user.profile_url = player.profileurl;

        // Reset manual change flags to allow auto-sync
        user.nickname_changed_at = null;
        user.avatar_changed_at = null;

        await user.save();

        res.json({ message: 'Profile synced with Steam', user });

    } catch (error) {
        console.error('Sync Steam error:', error);
        res.status(500).json({ message: 'Error syncing with Steam' });
    }
};
