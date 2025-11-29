
const bcrypt = require("bcryptjs");
const { generateTokens } = require("../utils/generateTokens.js");
const User = require("../models/User.js");
const jwt = require("jsonwebtoken");

const AuthService = {
    async register(email, password) {
        const exists = await User.findOne({ where: { email } });
        if (exists) throw new Error('User already exists');

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashed });
        return generateTokens(user.id);
    },
    async login(email, password) {
        const user = await User.findOne({ where: { email } });
        if (!user) throw new Error('Invalid email or password');

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error('Invalid email or password');

        return generateTokens(user.id);
    },
    async refresh(refreshToken) {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        return generateTokens(decoded.id);
    }
}
module.exports = { AuthService };