const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Restaurant = sequelize.define('Restaurant', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'restaurants',
    timestamps: true
});

module.exports = Restaurant;
