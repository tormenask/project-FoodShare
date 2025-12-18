// services/restaurantClient.js
const axios = require('axios');

const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3002';

/**
 * Valida si un restaurante existe y está disponible
 */
async function validateRestaurant(restaurantId) {
  try {
    console.log(`🔍 Validating restaurant: ${restaurantId}`);
    
    const response = await axios.get(`${RESTAURANT_SERVICE_URL}/restaurants/${restaurantId}`, {
      timeout: 5000,
      validateStatus: (status) => status < 500
    });
    
    if (response.status === 404) {
      return { 
        valid: false, 
        error: 'Restaurant not found' 
      };
    }
    
    // 🔧 FIX: La respuesta del Restaurant Service viene envuelta en { restaurant: {...} }
    const restaurant = response.data.restaurant || response.data;
    
    // Verificar si el restaurante está activo
    if (restaurant.isActive === false) {
      return { 
        valid: false, 
        error: 'Restaurant is not active' 
      };
    }
    
    console.log(`✅ Restaurant validated: ${restaurant.name}`);
    
    return { 
      valid: true, 
      data: restaurant 
    };
    
  } catch (error) {
    console.error(`❌ Error validating restaurant ${restaurantId}:`, error.message);
    
    // Si el servicio no está disponible, permitir la operación pero avisar
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.warn('⚠️  Restaurant service unavailable, allowing order...');
      return { 
        valid: true, 
        warning: 'Restaurant service unavailable, validation skipped' 
      };
    }
    
    return { 
      valid: false, 
      error: 'Failed to validate restaurant' 
    };
  }
}

/**
 * Obtiene información de un restaurante
 */
async function getRestaurant(restaurantId) {
  try {
    const response = await axios.get(`${RESTAURANT_SERVICE_URL}/restaurants/${restaurantId}`, {
      timeout: 5000
    });
    
    // Extraer el objeto restaurant de la respuesta
    const restaurant = response.data.restaurant || response.data;
    
    return { 
      success: true, 
      data: restaurant 
    };
  } catch (error) {
    console.error(`Error fetching restaurant ${restaurantId}:`, error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Lista todos los restaurantes disponibles
 */
async function listRestaurants() {
  try {
    const response = await axios.get(`${RESTAURANT_SERVICE_URL}/restaurants`, {
      timeout: 5000
    });
    
    return { 
      success: true, 
      data: response.data 
    };
  } catch (error) {
    console.error('Error listing restaurants:', error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

module.exports = {
  validateRestaurant,
  getRestaurant,
  listRestaurants
};