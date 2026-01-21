require('dotenv').config({ path: '.env' });
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// Mock Env for local run if needed, or rely on .env
// process.env.GOOGLE_SHEETS_ID = ...

async function inspectSheet() {
    try {
        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID, serviceAccountAuth);
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle['leads']; // Verify name
        const rows = await sheet.getRows();

        console.log(`Loaded ${rows.length} rows.`);

        rows.forEach((row, index) => {
            const imovel = row.get('imovel');
            const corretor = row.get('corretor');
            if (corretor && corretor.toLowerCase() === 'isa') {
                console.log(`Row ${index + 2}: Imovel=${imovel}, Corretor=${corretor}, DataEntrada='${row.get('data_entrada')}', Etapa='${row.get('etapa_atual')}'`);
            }
        });

    } catch (err) {
        console.error("Error:", err);
    }
}

inspectSheet();
