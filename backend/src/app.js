require('dotenv').config();
const express = require('express');
const cors = require('cors');
const metricsRoutes = require('./routes/metricsRoutes');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/metrics', metricsRoutes);

app.get('/', (req, res) => res.json({ status: 'ok', port: PORT }));

// Start server immediately to satisfy health checks
const server = app.listen(PORT, () => {
  const address = server.address();
  console.log(`Server running on port ${PORT}`);
  console.log(`Listening on address: ${JSON.stringify(address)}`);
  console.log(`Environment PORT value: ${process.env.PORT}`);
});

// Verificação de conexão com o banco (Async)
db.sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    return db.sequelize.sync();
  })
  .then(() => {
    console.log('Database & Tables synced successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    // Do NOT exit process, just log error so app stays up for debugging
  });

// Global Error Handlers (prevent silent deaths)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  // Keep alive if possible, or exit 1
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});
