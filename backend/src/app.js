require('dotenv').config();
const express = require('express');
const cors = require('cors');
const metricsRoutes = require('./routes/metricsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use('/metrics', metricsRoutes);

app.get('/', (req, res) => res.json({ status: 'ok' }));

// Database Init
const { syncDatabase, testConnection } = require('./models');
(async () => {
  await testConnection();
  await syncDatabase();
})();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
