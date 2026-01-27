const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const secret = process.env.JWT_SECRET_KEY;
if (!secret) {
    throw new Error('JWT_SECRET_KEY is not defined in environment variables');
}

module.exports = {
    secret: secret,
    expiresIn: '24h'
};
