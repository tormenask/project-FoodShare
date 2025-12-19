const Menu = require('../models/menu.model');
const Restaurant = require('../models/restaurant.model');

/**
 * Crear item de menú (solo owner)
 * POST /restaurants/:restaurantId/menu
 */
const createMenuItem = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { name, description, price } = req.body;

        if (!name || !price) {
            return res.status(400).json({
                error: 'Menu name and price are required'
            });
        }

        const restaurant = await Restaurant.findOne({
            where: { id: restaurantId, ownerId: req.user.id }
        });

        if (!restaurant) {
            return res.status(404).json({
                error: 'Restaurant not found or you are not the owner'
            });
        }

        const menuItem = await Menu.create({
            name,
            description,
            price,
            restaurantId
        });

        return res.status(201).json({ menuItem });
    } catch (error) {
        console.error('Error creating menu item:', error);
        return res.status(500).json({
            error: 'Failed to create menu item'
        });
    }
};

/**
 * Listar menú de un restaurante (público)
 * GET /restaurants/:restaurantId/menu
 */
const getMenuByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const menu = await Menu.findAll({
            where: {
                restaurantId,
                isAvailable: true
            }
        });

        return res.status(200).json({ menu });
    } catch (error) {
        console.error('Error fetching menu:', error);
        return res.status(500).json({
            error: 'Failed to fetch menu'
        });
    }
};

module.exports = {
    createMenuItem,
    getMenuByRestaurant
};
