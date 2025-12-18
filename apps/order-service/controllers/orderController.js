const Order = require('../models/Order');
const { publishEvent } = require('../config/rabbitmq');
const { validateRestaurant } = require('../services/restaurantClient');


exports.createOrder = async (req, res) => {
  try {
    const { restaurantId, userId, items, deliveryAddress, customerName, customerPhone, notes } = req.body;
    
    // Validar campos requeridos
    if (!restaurantId || !items || !customerName || !customerPhone) {
      return res.status(400).json({ 
        error: 'Missing required fields: restaurantId, items, customerName, customerPhone' 
      });
    }
    
    // 🆕 VALIDAR RESTAURANTE CON EL RESTAURANT SERVICE
    console.log('🔄 Validating restaurant with Restaurant Service...');
    const restaurantValidation = await validateRestaurant(restaurantId);
    
    if (!restaurantValidation.valid) {
      return res.status(404).json({ 
        error: restaurantValidation.error || 'Restaurant validation failed' 
      });
    }
    
    // Si hay warning (servicio no disponible), continuar pero avisar
    if (restaurantValidation.warning) {
      console.warn('⚠️ ', restaurantValidation.warning);
    }
    
    // Calcular total
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    // Crear pedido
    const order = await Order.create({
      restaurantId,
      userId: userId || null,
      items,
      totalAmount,
      deliveryAddress,
      customerName,
      customerPhone,
      notes,
      status: 'nuevo'
    });
    
    // Publicar evento order.created
    await publishEvent('order.created', {
      orderId: order.id,
      restaurantId: order.restaurantId,
      restaurantName: restaurantValidation.data?.name || 'Unknown',
      userId: order.userId,
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
      createdAt: order.createdAt
    });
    
    console.log('✅ Order created successfully:', order.id);
    
    res.status(201).json({
      message: 'Order created successfully',
      order,
      restaurant: restaurantValidation.data,
      warning: restaurantValidation.warning
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { restaurantId, userId, status } = req.query;
    
    const where = {};
    if (restaurantId) where.restaurantId = restaurantId;
    if (userId) where.userId = userId;
    if (status) where.status = status;
    
    const orders = await Order.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ 
      count: orders.length,
      orders 
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['nuevo', 'en_preparacion', 'listo', 'entregado', 'cancelado'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const oldStatus = order.status;
    order.status = status;
    await order.save();
    
    await publishEvent('order.status.updated', {
      orderId: order.id,
      restaurantId: order.restaurantId,
      oldStatus,
      newStatus: status,
      updatedAt: order.updatedAt
    });
    
    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.status === 'entregado') {
      return res.status(400).json({ error: 'Cannot cancel a delivered order' });
    }
    
    const oldStatus = order.status;
    order.status = 'cancelado';
    await order.save();
    
    await publishEvent('order.status.updated', {
      orderId: order.id,
      restaurantId: order.restaurantId,
      oldStatus,
      newStatus: 'cancelado',
      updatedAt: order.updatedAt
    });
    
    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: error.message });
  }
};