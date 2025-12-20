const express = require('express');
const { authRequired } = require('../middlewares/auth.middleware');
const {
    createMenuItem,
    getMenuByRestaurant
} = require('../controllers/menu.controller');

const router = express.Router();

// Crear item de menú (owner)
router.post(
    '/restaurants/:restaurantId/menu',
    authRequired,
    createMenuItem
);

// Listar menú (público)
router.get(
    '/restaurants/:restaurantId/menu',
    getMenuByRestaurant
);

module.exports = router;
