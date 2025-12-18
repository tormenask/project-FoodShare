const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');

router.get('/live', (req, res) => {
  res.status(200).json({ 
    status: 'alive',
    service: 'order-service',
    timestamp: new Date().toISOString()
  });
});

router.get('/ready', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ 
      status: 'ready',
      service: 'order-service',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'not ready',
      service: 'order-service',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ 
      status: 'healthy',
      service: 'order-service',
      version: process.env.VERSION || '1.0.0',
      uptime: process.uptime(),
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      service: 'order-service',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;