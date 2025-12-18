const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  restaurantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'restaurant_id'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id'
  },
  status: {
    type: DataTypes.ENUM('nuevo', 'en_preparacion', 'listo', 'entregado', 'cancelado'),
    defaultValue: 'nuevo',
    allowNull: false
  },
  items: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      isValidItems(value) {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('Items must be a non-empty array');
        }
        value.forEach(item => {
          if (!item.productId || !item.name || !item.quantity || !item.price) {
            throw new Error('Each item must have productId, name, quantity, and price');
          }
        });
      }
    }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount'
  },
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'delivery_address'
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'customer_name'
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'customer_phone'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'orders',
  timestamps: true,
  underscored: true
});

module.exports = Order;