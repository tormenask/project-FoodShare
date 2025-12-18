const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false, // desactiva logs SQL (mejor para prod)
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully (restaurant-service)');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

module.exports = {
    sequelize,
    connectDB
};
