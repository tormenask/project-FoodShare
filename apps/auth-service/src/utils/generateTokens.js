const jwt = require('jsonwebtoken');

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES || '1h' }
    );

    const refreshToken = jwt.sign(
        { id: userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d' }
    )

    return { accessToken, refreshToken };
}

module.exports = { generateTokens };

