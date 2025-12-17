const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación por JWT
 * - Valida token
 * - Inyecta req.user
 */
const authRequired = (req, res, next) => {
    try {
        const header = req.headers.authorization;

        if (!header) {
            return res.status(401).json({
                error: 'Missing authorization header'
            });
        }

        const [type, token] = header.split(' ');

        if (type !== 'Bearer' || !token) {
            return res.status(401).json({
                error: 'Invalid authorization format'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        /**
         * IMPORTANTE:
         * No consultamos DB
         * Confiamos en el JWT emitido por auth-service
         */
        req.user = {
            id: decoded.id
        };

        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Invalid or expired token'
        });
    }
};

module.exports = { authRequired };
