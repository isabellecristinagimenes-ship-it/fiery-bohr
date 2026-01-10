require('dotenv').config();
const express = require('express');
const cors = require('cors');
const metricsRoutes = require('./routes/metricsRoutes');
const db = require('./models');

const app = express();
const PORT = 8080; // Hardcoded to force Railway detection

app.use(cors());
app.use(express.json());
app.use('/metrics', metricsRoutes);

app.get('/', (req, res) => res.json({ status: 'ok', service: 'fiery-bohr-backend' }));

// Function to start server
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected.');
    await db.sequelize.sync();
    console.log('✅ Database synced.');
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    // We do not exit here, to allow the Metrics API to run even if DB fails
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
