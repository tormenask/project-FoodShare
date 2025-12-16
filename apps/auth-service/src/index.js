
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes.js');
require('dotenv').config();
const logger = require('./utils/logger');
const sequelize = require('./models/sequelize');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);


const PORT = process.env.PORT || 3000;
sequelize.sync()
  .then(() => {
    logger.info('Database synced');
    app.listen(PORT, () => {
      logger.info(`Auth service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Unable to sync database: ' + err);
  });