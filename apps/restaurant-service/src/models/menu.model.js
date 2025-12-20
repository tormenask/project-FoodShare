const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Menu = sequelize.define('Menu', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    isAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'menu',
    timestamps: true
});

module.exports = Menu;
