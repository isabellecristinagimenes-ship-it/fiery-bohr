require('dotenv').config({ path: './backend/.env' });
const db = require('./backend/src/models');

async function inspect() {
    try {
        const users = await db.User.findAll();
        const leads = await db.Lead.findAll();
        const agencies = await db.Agency.findAll();

        console.log('--- AGENCIES ---');
        console.log(JSON.stringify(agencies, null, 2));

        console.log('--- USERS ---');
        console.log(JSON.stringify(users.map(u => ({ id: u.id, email: u.email, role: u.role, agencyId: u.agencyId })), null, 2));

        console.log('--- LEADS ---');
        console.log(JSON.stringify(leads.map(l => ({ id: l.id, nome: l.nome_do_lead, agencyId: l.agencyId })), null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

inspect();
