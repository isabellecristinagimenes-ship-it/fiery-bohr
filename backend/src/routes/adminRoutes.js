const express = require('express');
const router = express.Router();
const db = require('../models');
const User = db.User;
const Agency = db.Agency;

// Create New Agency (Provisioning)
router.post('/agencies', async (req, res) => {
    try {
        const { agencyName, spreadsheetId, adminName, adminEmail, adminPassword } = req.body;

        // 1. Validation
        if (!agencyName || !adminEmail || !spreadsheetId) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios: Nome da Agência, Email e ID da Planilha.' });
        }

        // 2. Check if Sheet ID is already in use (Optional but good safety)
        const sheetExists = await Agency.findOne({ where: { spreadsheetId } });
        if (sheetExists) {
            return res.status(400).json({ error: 'Este ID de Planilha já está sendo usado por outra agência.' });
        }

        const emailExists = await User.findOne({ where: { email: adminEmail } });
        if (emailExists) {
            return res.status(400).json({ error: 'Este email já está cadastrado no sistema.' });
        }

        // 3. Create Agency
        const newAgency = await Agency.create({
            name: agencyName,
            plan: 'premium',
            active: true,
            spreadsheetId: spreadsheetId
        });

        // 4. Create Admin User for this Agency
        const newUser = await User.create({
            name: adminName || 'Admin',
            email: adminEmail,
            password: adminPassword || '123456', // Default password
            role: 'owner',
            agencyId: newAgency.id
        });

        res.status(201).json({
            message: 'Agência criada com sucesso!',
            agency: newAgency,
            admin: {
                id: newUser.id,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('Admin Error:', error);
        res.status(500).json({ error: 'Erro ao criar agência.' });
    }
});

        });

    } catch (error) {
    console.error('Admin Error:', error);
    res.status(500).json({ error: 'Erro ao criar agência.' });
}
});

// List Agencies (For Dropdown)
router.get('/agencies', async (req, res) => {
    try {
        const agencies = await Agency.findAll({
            attributes: ['id', 'name']
        });
        res.json(agencies);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar agências' });
    }
});

// Create User (Broker/Admin) for Agency
router.post('/users', async (req, res) => {
    try {
        const { name, email, password, role, agencyId } = req.body;

        if (!name || !email || !password || !agencyId) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
            return res.status(400).json({ error: 'Email já cadastrado.' });
        }

        const newUser = await User.create({
            name,
            email,
            password, // In prod use bcrypt
            role: role || 'broker',
            agencyId
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Create User Error:', error);
        res.status(500).json({ error: 'Erro ao criar usuário.' });
    }
});

module.exports = router;
