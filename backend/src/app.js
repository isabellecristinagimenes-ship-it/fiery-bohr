require('dotenv').config();
// v14 Force Deploy - Retry Agency Routes
const express = require('express');
const cors = require('cors');
const metricsRoutes = require('./routes/metricsRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const db = require('./models');

const app = express();
const PORT = 8080; // Hardcoded to force Railway detection

app.use(cors());
app.use(express.json());
app.use('/metrics', metricsRoutes);
app.use('/auth', authRoutes);
app.use('/metrics', metricsRoutes);
app.use('/auth', authRoutes);
// app.use('/admin', adminRoutes); // TEMPORARY DISABLE

// --- INLINED ADMIN ROUTES (v18 FORCE) ---
const User = db.User;
const Agency = db.Agency;

app.get('/admin/agencies', async (req, res) => {
  try {
    const agencies = await Agency.findAll({ attributes: ['id', 'name', 'spreadsheetId'] });
    res.json(agencies);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar agências (Inlined)' });
  }
});

app.post('/admin/agencies', async (req, res) => {
  try {
    console.log("Creating Agency (Inlined):", req.body);
    const { agencyName, spreadsheetId, adminName, adminEmail, adminPassword } = req.body;

    // Quick Validation
    if (!agencyName || !adminEmail || !spreadsheetId) return res.status(400).json({ error: 'Campos obrigatórios faltando.' });

    const newAgency = await Agency.create({ name: agencyName, spreadsheetId, plan: 'premium', active: true });

    await User.create({
      name: adminName || 'Admin',
      email: adminEmail,
      password: adminPassword || 'mudar123',
      role: 'owner',
      agencyId: newAgency.id
    });

    res.status(201).json({ message: 'Agência Criada (v18 Inlined)', agency: newAgency });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no Inlined Route: ' + error.message });
  }
});

app.get('/admin/users/:agencyId', async (req, res) => {
  const users = await User.findAll({ where: { agencyId: req.params.agencyId } });
  res.json(users);
});

app.post('/admin/users', async (req, res) => {
  const { name, email, password, role, agencyId } = req.body;
  try {
    const user = await User.create({ name, email, password, role, agencyId });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
// ----------------------------------------

app.get('/', (req, res) => res.json({ status: 'ok', service: 'fiery-bohr-backend' }));

// Function to start server
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected.');
    await db.sequelize.sync({ alter: true });
    console.log('✅ Database synced (Alter mode).');
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    // We do not exit here, to allow the Metrics API to run even if DB fails
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📧 Configured Email: [${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}]`);
  });
};

startServer();
