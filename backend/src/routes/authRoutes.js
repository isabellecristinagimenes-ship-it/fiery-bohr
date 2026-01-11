const express = require('express');
const router = express.Router();
const db = require('../models');
const User = db.User;

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        // Simple password check (In prod, use bcrypt)
        if (user.password !== password) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        // Return user info (excluding password)
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            agencyId: user.agencyId
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Setup Initial Users (Run once)
// Setup Initial Users (Run once)
router.post('/setup', async (req, res) => {
    try {
        // Create Demo Agency
        const [agency, created] = await db.Agency.findOrCreate({
            where: { name: 'Imobiliária MVP' },
            defaults: {
                plan: 'premium',
                active: true
            }
        });

        const agencyId = agency.id;

        // Check if users exist for this agency, if not create them
        const adminEmail = 'admin@imobiliaria.com';
        const adminUser = await User.findOne({ where: { email: adminEmail } });

        if (!adminUser) {
            await User.create({
                name: 'Administrador',
                email: adminEmail,
                password: 'admin', // In production use bcrypt
                role: 'owner',
                agencyId: agencyId
            });
        }

        const brokerEmail = 'joao@imobiliaria.com';
        const brokerUser = await User.findOne({ where: { email: brokerEmail } });

        if (!brokerUser) {
            await User.create({
                name: 'João Corretor',
                email: brokerEmail,
                password: 'joao', // In production use bcrypt
                role: 'broker',
                agencyId: agencyId
            });
        }

        res.json({ message: 'Setup completed. Agência e Usuários configurados.' });
    } catch (error) {
        console.error('Setup Error:', error);
        res.status(500).json({ error: 'Erro ao criar configuração inicial' });
    }
});

module.exports = router;
