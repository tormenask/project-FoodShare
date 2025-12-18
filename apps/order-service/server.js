// server.js - Order Service Main Entry Point
const express = require('express');
const { sequelize } = require('./config/database');
const { connectRabbitMQ, publishEvent } = require('./config/rabbitmq');
const orderRoutes = require('./routes/orderRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/health', healthRoutes);
app.use('/api/orders', orderRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server gracefully...');
  await sequelize.close();
  process.exit(0);
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database models synced');
    
    await connectRabbitMQ();
    console.log('✅ RabbitMQ connected');
    
    app.listen(PORT, () => {
      console.log(`🚀 Order Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;