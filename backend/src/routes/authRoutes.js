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
            role: user.role
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Setup Initial Users (Run once)
router.post('/setup', async (req, res) => {
    try {
        const count = await User.count();
        if (count > 0) {
            return res.status(400).json({ message: 'Usuários já existem.' });
        }

        await User.bulkCreate([
            {
                name: 'Administrador',
                email: 'admin@imobiliaria.com',
                password: 'admin', // Default password
                role: 'admin'
            },
            {
                name: 'João Corretor',
                email: 'joao@imobiliaria.com',
                password: 'joao', // Default password
                role: 'broker'
            }
        ]);

        res.json({ message: 'Usuários criados com sucesso!' });
    } catch (error) {
        console.error('Setup Error:', error);
        res.status(500).json({ error: 'Erro ao criar usuários' });
    }
});

module.exports = router;
