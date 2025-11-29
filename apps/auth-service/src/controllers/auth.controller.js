const { AuthService } = require("../services/auth.service.js");
const User = require('../models/User.js');
const logger = require('../utils/logger');

const AuthController = {
    register: async (req, res) => {
        try {
            const { email, password } = req.body;
            const tokens = await AuthService.register(email, password);

            logger.info({
                event: "user_register_success",
                message: "Nuevo registro",
                email,
                ip: req.ip,
                path: req.originalUrl
            });

            res.status(201).json(tokens);

        } catch (error) {

            if (error.message === 'User already exists') {
                logger.warn({
                    event: "user_register_exists",
                    message: "Intento de registro con email existente",
                    email: req.body.email,
                    ip: req.ip,
                    path: req.originalUrl
                });

                return res.status(409).json({ error: 'El usuario ya existe.' });
            }

            logger.error({
                event: "user_register_error",
                message: "Error en registro",
                error: error.message,
                ip: req.ip,
                path: req.originalUrl
            });

            res.status(400).json({ error: 'Datos inválidos o incompletos.' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const tokens = await AuthService.login(email, password);

            logger.info({
                event: "user_login_success",
                message: "Login exitoso",
                email,
                ip: req.ip,
                path: req.originalUrl
            });

            res.json(tokens);

        } catch (error) {

            if (error.message === 'Invalid email or password') {
                logger.warn({
                    event: "user_login_failed",
                    message: "Login fallido",
                    email: req.body.email,
                    ip: req.ip,
                    path: req.originalUrl
                });

                return res.status(401).json({ error: 'Credenciales incorrectas.' });
            }

            logger.error({
                event: "user_login_error",
                message: "Error en login",
                error: error.message,
                ip: req.ip,
                path: req.originalUrl
            });

            res.status(400).json({ error: 'Datos inválidos o incompletos.' });
        }
    },

    refresh: async (req, res) => {
        try {
            const { refreshToken } = req.body;
            const tokens = await AuthService.refresh(refreshToken);

            logger.info({
                event: "token_refresh_success",
                message: "Refresh token usado correctamente",
                ip: req.ip,
                path: req.originalUrl
            });

            res.json(tokens);

        } catch (error) {
            logger.warn({
                event: "token_refresh_failed",
                message: "Error en refresh token",
                error: error.message,
                ip: req.ip,
                path: req.originalUrl
            });

            res.status(401).json({ error: 'Token de refresco inválido o expirado.' });
        }
    },

    profile: async (req, res) => {
        try {
            const user = await User.findByPk(req.user.id);

            if (!user) {
                logger.warn({
                    event: "user_profile_not_found",
                    message: "Perfil no encontrado",
                    userId: req.user.id,
                    ip: req.ip,
                    path: req.originalUrl
                });

                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                id: user.id,
                email: user.email,
                name: user.name || null
            });

        } catch (error) {
            logger.error({
                event: "user_profile_error",
                message: "Error obteniendo perfil",
                userId: req.user.id,
                error: error.message,
                ip: req.ip,
                path: req.originalUrl
            });

            res.status(500).json({ error: 'Error fetching profile' });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const { name } = req.body;

            await User.update(
                { name },
                { where: { id: req.user.id } }
            );

            logger.info({
                event: "user_profile_updated",
                message: "Perfil actualizado",
                userId: req.user.id,
                newName: name,
                ip: req.ip,
                path: req.originalUrl
            });

            res.json({ success: true });

        } catch (error) {
            logger.error({
                event: "user_profile_update_error",
                message: "Error actualizando perfil",
                userId: req.user.id,
                error: error.message,
                ip: req.ip,
                path: req.originalUrl
            });

            res.status(500).json({ error: 'Error updating profile' });
        }
    },

    validateToken: async (req, res) => {
        try {
            const token = req.body.token;
            const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.id);

            if (!user) {
                logger.warn({
                    event: "token_validation_failed",
                    message: "Token válido pero usuario no encontrado",
                    userId: decoded.id,
                    ip: req.ip,
                    path: req.originalUrl
                });

                return res.status(401).json({ valid: false });
            }

            logger.info({
                event: "token_validated",
                message: "Token validado correctamente",
                userId: user.id,
                email: user.email,
                ip: req.ip,
                path: req.originalUrl
            });

            return res.json({
                valid: true,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            logger.warn({
                event: "token_invalid",
                message: "Token inválido",
                error: error.message,
                ip: req.ip,
                path: req.originalUrl
            });

            res.json({ valid: false, message: 'Invalid token' });
        }
    }
};

module.exports = { AuthController };
