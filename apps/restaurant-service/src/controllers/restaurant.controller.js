const Restaurant = require('../models/restaurant.model');

/**
 * Crear restaurante (owner autenticado)
 * POST /restaurants
 */
const createRestaurant = async (req, res) => {
    try {
        const { name, description, address, phone } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Restaurant name is required' });
        }

        const restaurant = await Restaurant.create({
            name,
            description,
            address,
            phone,
            ownerId: req.user.id,
            isActive: true
        });

        return res.status(201).json({ restaurant });
    } catch (error) {
        console.error('Error creating restaurant:', error);
        return res.status(500).json({ error: 'Failed to create restaurant' });
    }
};

/**
 * Listar restaurantes públicos activos
 * GET /restaurants
 */
const getRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.findAll({
            where: { isActive: true }
        });

        return res.status(200).json({ restaurants });
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        return res.status(500).json({ error: 'Failed to fetch restaurants' });
    }
};

/**
 * Obtener restaurante por ID (público)
 * GET /restaurants/:id
 */ 
const getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await Restaurant.findByPk(id);

        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        return res.status(200).json({ restaurant });
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        return res.status(500).json({ error: 'Failed to fetch restaurant' });
    }
};

/**
 * Listar restaurantes del owner autenticado
 * GET /restaurants/my/restaurants
 */
const getMyRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.findAll({
            where: { ownerId: req.user.id }
        });

        return res.status(200).json({ restaurants });
    } catch (error) {
        console.error('Error fetching owner restaurants:', error);
        return res.status(500).json({ error: 'Failed to fetch restaurants' });
    }
};

/**
 * Actualizar restaurante (solo owner)
 * PUT /restaurants/:id
 */
const updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, address, phone, isActive } = req.body;

        const restaurant = await Restaurant.findOne({
            where: { id, ownerId: req.user.id }
        });

        if (!restaurant) {
            return res.status(404).json({
                error: 'Restaurant not found or you are not the owner'
            });
        }

        restaurant.name = name ?? restaurant.name;
        restaurant.description = description ?? restaurant.description;
        restaurant.address = address ?? restaurant.address;
        restaurant.phone = phone ?? restaurant.phone;

        if (typeof isActive === 'boolean') {
            restaurant.isActive = isActive;
        }

        await restaurant.save();

        return res.status(200).json({ restaurant });
    } catch (error) {
        console.error('Error updating restaurant:', error);
        return res.status(500).json({ error: 'Failed to update restaurant' });
    }
};
/**
 * Eliminar restaurante (solo owner)
 * DELETE /restaurants/:id
 */
const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await Restaurant.findOne({
            where: { id, ownerId: req.user.id }
        });

        if (!restaurant) {
            return res.status(404).json({
                error: 'Restaurant not found or you are not the owner'
            });
        }

        await restaurant.destroy();

        return res.status(200).json({
            message: 'Restaurant deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting restaurant:', error);
        return res.status(500).json({
            error: 'Failed to delete restaurant'
        });
    }
};


module.exports = {
    createRestaurant,
    getRestaurants,
    getRestaurantById,
    getMyRestaurants,
    updateRestaurant,
    deleteRestaurant
};
