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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
