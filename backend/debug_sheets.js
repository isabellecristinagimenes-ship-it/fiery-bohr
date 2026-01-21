
const sheetsService = require('./src/services/sheetsService');

async function debug() {
    console.log('--- STARTING DEBUG ---');
    // Set the ID manually for this run
    process.env.GOOGLE_SHEETS_ID = '13xQqQ85iApue9RcHLmyzmHGM3hVAAg42GAcgNGNbNZw';

    try {
        console.log('1. Initializing Service...');
        await sheetsService.init();

        if (!sheetsService.doc) {
            console.error('❌ Doc not loaded.');
            return;
        }

        console.log(`✅ Doc Title: "${sheetsService.doc.title}"`);

        // Check available sheets
        const sheetTitle = 'Página1'; // Or whatever logic _getSheet uses
        let sheet = sheetsService.doc.sheetsByTitle['leads'] ||
            sheetsService.doc.sheetsByTitle['Página1'] ||
            sheetsService.doc.sheetsByTitle['Sheet1'] ||
            sheetsService.doc.sheetsByIndex[0];

        if (!sheet) {
            console.error('❌ No sheet found!');
            return;
        }

        console.log(`ℹ️ Converting Sheet: "${sheet.title}"`);

        const rows = await sheet.getRows();
        console.log(`ℹ️ Found ${rows.length} rows.`);

        if (rows.length > 0) {
            console.log('--- HEADERS (Keys via toObject) ---');
            // google-spreadsheet v4 rows are objects, keys are headers
            // If using raw, try toObject() or just keys
            try {
                console.log(rows[0].toObject ? Object.keys(rows[0].toObject()) : Object.keys(rows[0]));
            } catch (e) {
                console.log('Keys error:', e.message);
            }

            console.log('--- FIRST ROW DATA DUMP ---');
            console.log(rows[0]); // Dump the whole object to see structure
        } else {
            // If no rows, load header row
            await sheet.loadHeaderRow();
            console.log('--- HEADERS (Empty Sheet) ---');
            console.log(sheet.headerValues);
        }

    } catch (err) {
        console.error('❌ ERROR:', err);
    }
}

debug();
