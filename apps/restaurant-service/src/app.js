const express = require('express');
const bodyParser = require('body-parser');
const restaurantRoutes = require('./routes/restaurant.routes');
const healthCheck = require('./health');

const app = express();



// Middlewares globales
app.use(bodyParser.json());

// Health check (para K8s)
app.get('/health', healthCheck);

// Rutas
app.use('/restaurants', restaurantRoutes);

// Handler básico de errores
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
