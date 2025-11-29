const express = require('express');
const { AuthController } = require('../controllers/auth.controller.js');
const { authRequired, requireRole } = require('../middlewares/auth.middleware.js');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validaciones para registro y login
const validateRegister = [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateLogin = [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

router.post('/register', validateRegister, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/refresh', AuthController.refresh);

router.get('/profile', authRequired, AuthController.profile);
router.put('/profile', authRequired, AuthController.updateProfile);

router.post('/validate', AuthController.validateToken);

router.get('/admin-only', authRequired, requireRole('admin'), (req, res) => {
    res.json({ message: 'Welcome, admin!' });
});
module.exports = router;