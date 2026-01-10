require('dotenv').config();
const express = require('express');
const cors = require('cors');
const metricsRoutes = require('./routes/metricsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use('/metrics', metricsRoutes);

const db = require('./models');

app.get('/', (req, res) => res.json({ status: 'ok', port: PORT }));

// Verificação de conexão com o banco e início do servidor
db.sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    return db.sequelize.sync();
  })
  .then(() => {
    console.log('Database & Tables synced successfully.');
    const server = app.listen(PORT, '0.0.0.0', () => {
      const address = server.address();
      console.log(`Server running on port ${PORT}`);
      console.log(`Listening on address: ${JSON.stringify(address)}`);
      console.log(`Environment PORT value: ${process.env.PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1); // Enforce crash if DB fails
  });

// Global Error Handlers (prevent silent deaths)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});
