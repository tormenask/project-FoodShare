const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const authRequired = async (req, res, next) => {
    try {
        const header = req.headers.authorization;

        if (!header) {
            logger.warn({
                event: "auth_missing_header",
                message: "Acceso denegado: falta el header de autorización",
                ip: req.ip,
                path: req.originalUrl
            });

            return res.status(401).json({ error: 'Missing authorization header' });
        }

        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id);

        if (!user) {
            logger.warn({
                event: "auth_user_not_found",
                message: "Acceso denegado: usuario no encontrado",
                userId: decoded.id,
                ip: req.ip,
                path: req.originalUrl
            });

            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;

        logger.info({
            event: "auth_success",
            message: "Acceso autorizado",
            userId: user.id,
            role: user.role,
            ip: req.ip,
            path: req.originalUrl
        });

        next();

    } catch (error) {
        logger.warn({
            event: "auth_invalid_token",
            message: "Acceso denegado: token inválido o error",
            error: error.message,
            ip: req.ip,
            path: req.originalUrl
        });

        return res.status(401).json({ error: 'Unauthorized' });
    }
};


const requireRole = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            logger.warn({
                event: "auth_forbidden",
                message: "Acceso prohibido: rol insuficiente",
                requiredRoles: roles,
                userId: req.user.id,
                userRole: req.user.role,
                ip: req.ip,
                path: req.originalUrl
            });

            return res.status(403).json({ error: 'Forbidden' });
        }

        logger.info({
            event: "auth_role_success",
            message: "Acceso permitido a ruta protegida",
            userId: req.user.id,
            role: req.user.role,
            ip: req.ip,
            path: req.originalUrl
        });

        next();
    };
};

module.exports = { authRequired, requireRole };
