require('dotenv').config();

const app = require('./app');
const { connectDB, sequelize } = require('./config/database');

require('./models/restaurant.model');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();

        await sequelize.sync();
        console.log('Database synced (restaurant-service)');

        app.listen(PORT, () => {
            console.log(`Restaurant Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start Restaurant Service:', error);
        process.exit(1);
    }
};

startServer();
