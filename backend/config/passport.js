const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const { User } = require('../models');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new SteamStrategy({
    returnURL: process.env.STEAM_RETURN_URL || 'http://localhost:5000/auth/steam/return',
    realm: process.env.STEAM_REALM || 'http://localhost:5000/',
    apiKey: process.env.STEAM_API_KEY
},
    async function (identifier, profile, done) {
        try {
            if (!profile || !profile.id) {
                console.error('Passport Strategy: No profile or ID found');
                return done(new Error('No Steam profile or ID found'), null);
            }

            const steamId = profile.id;
            console.log('Passport Strategy: Processing login for steam_id:', steamId);

            const avatarFull = profile.photos && profile.photos[2] ? profile.photos[2].value : null;
            const avatarMedium = profile.photos && profile.photos[1] ? profile.photos[1].value : null;
            const realName = profile._json.realname || null;
            const profileUrl = profile._json.profileurl || null;

            let user;
            try {
                user = await User.findOne({ where: { steam_id: steamId } });
            } catch (err) {
                console.error('Passport Strategy: User.findOne failed:', err);
                return done(err, null);
            }

            try {
                if (!user) {
                    console.log('Passport Strategy: Creating new user for steam_id:', steamId);
                    user = await User.create({
                        steam_id: steamId,
                        nickname: profile.displayName,
                        avatar_full: avatarFull,
                        avatar_medium: avatarMedium,
                        profile_url: profileUrl,
                        real_name: realName,
                        last_seen: new Date()
                    });
                } else {
                    console.log('Passport Strategy: Updating existing user:', user.id);
                    if (!user.nickname_changed_at) {
                        user.nickname = profile.displayName;
                    }
                    if (!user.avatar_changed_at) {
                        user.avatar_full = avatarFull;
                        user.avatar_medium = avatarMedium;
                    }
                    user.profile_url = profileUrl;
                    user.real_name = realName;
                    user.last_seen = new Date();
                    await user.save();
                }

                return done(null, user);
            } catch (err) {
                console.error('Passport Strategy: User create/save failed:', err);
                return done(err, null);
            }
        } catch (err) {
            console.error('Passport Strategy: Unexpected error:', err);
            return done(err, null);
        }
    }
));

module.exports = passport;
