const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
console.log('DEBUG: CWD is', process.cwd());
console.log('DEBUG: Env File should be at', path.resolve(__dirname, '.env'));
console.log('DEBUG: DATABASE_URL is', process.env.DATABASE_URL ? 'DEFINED' : 'UNDEFINED');
const db = require('./src/models');

async function inspect() {
    try {
        const users = await db.User.findAll();
        const leads = await db.Lead.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5
        });
        const agencies = await db.Agency.findAll();

        console.log('--- AGENCIES ---');
        console.log(JSON.stringify(agencies, null, 2));

        console.log('--- USERS ---');
        console.log(JSON.stringify(users.map(u => ({ id: u.id, email: u.email, role: u.role, agencyId: u.agencyId })), null, 2));

        console.log('--- LATEST 5 LEADS ---');
        console.log(JSON.stringify(leads.map(l => ({
            id: l.id,
            nome: l.nome_do_lead,
            agencyId: l.agencyId,
            createdAt: l.createdAt
        })), null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

inspect();
