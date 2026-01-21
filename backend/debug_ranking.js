const sheetsService = require('./src/services/sheetsService');

async function testRanking() {
    try {
        console.log("Fetching leads...");
        const leads = await sheetsService.getLeads();
        console.log(`Fetched ${leads.length} leads.`);

        if (leads.length > 0) {
            console.log("Sample Lead:", leads[0]);
        }

        const stats = {};
        const parseSheetDate = (dateStr) => {
            if (!dateStr || typeof dateStr !== 'string') return null;
            const parts = dateStr.split('/');
            if (parts.length !== 3) return null;
            const [day, month, year] = parts;
            return new Date(`${year}-${month}-${day}`);
        };

        // Simulate "Last 30 Days" or "All Time" to catch data
        const end = new Date();
        const start = new Date();
        start.setFullYear(2023); // Wide range to catch older data

        console.log(`Filtering from ${start.toISOString()} to ${end.toISOString()}`);

        leads.forEach((lead, idx) => {
            const propName = lead.imovel || 'Indefinido';
            if (!stats[propName]) {
                stats[propName] = { name: propName, novos: 0, qualificados: 0 };
            }

            const entryDate = parseSheetDate(lead.data_entrada);
            // console.log(`Row ${idx}: ${lead.data_entrada} -> ${entryDate}`);

            if (entryDate && entryDate >= start && entryDate <= end) {
                stats[propName].novos++;
            }

            const isQualified = lead.etapa_atual &&
                (lead.etapa_atual.toLowerCase().includes('qualifi') ||
                    lead.etapa_atual.toLowerCase().includes('visita') ||
                    lead.etapa_atual.toLowerCase().includes('proposta') ||
                    lead.etapa_atual.toLowerCase().includes('fechado'));

            if (isQualified) {
                stats[propName].qualificados++;
            }
        });

        console.log("Stats calculated:", JSON.stringify(stats, null, 2));

        const ranking = Object.values(stats)
            .filter(s => s.novos >= 1 && s.qualificados >= 1)
            .sort((a, b) => (b.qualificados / b.novos) - (a.qualificados / a.novos));

        console.log("Final Ranking:", ranking);

    } catch (error) {
        console.error("Error:", error);
    }
}

testRanking();
