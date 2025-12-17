const express = require('express');
const { authRequired } = require('../middlewares/auth.middleware'); // Autenticación
const {
    createRestaurant,
    getRestaurants,
    getRestaurantById,
    getMyRestaurants,
    updateRestaurant,
    deleteRestaurant
} = require('../controllers/restaurant.controller');

const router = express.Router();

// Ruta para crear restaurante (requiere autenticación)
router.post('/', authRequired, createRestaurant);

// Ruta para obtener todos los restaurantes
router.get('/', getRestaurants);

// Ruta para obtener restaurante por ID
router.get('/:id', getRestaurantById);

// Ruta para actualizar restaurante por ID (requiere autenticación)
router.put('/:id', authRequired, updateRestaurant);

// Ruta para eliminar restaurante por ID (requiere autenticación)
router.delete('/:id', authRequired, deleteRestaurant);

// Ruta para obtener restaurantes del owner autenticado
router.get('/my/restaurants', authRequired, getMyRestaurants);

module.exports = router;
