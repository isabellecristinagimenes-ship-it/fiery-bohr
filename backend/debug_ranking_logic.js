const leads = [
    {
        id: '1',
        imovel: '123', // From screenshot
        corretor: 'isa',
        data_entrada: '01/01/2026', // Assume entered this year
        etapa_atual: 'Visita',
        data_mudancadeetapa: '15/01/2026'
    },
    {
        id: '2',
        imovel: '12',
        corretor: 'isa',
        data_entrada: '01/01/2026',
        etapa_atual: 'Visita',
        data_mudancadeetapa: '' // Missing qualification date?
    },
    {
        id: '3',
        imovel: 'Other',
        corretor: 'OtherUser',
        data_entrada: '01/01/2026',
        etapa_atual: 'Qualificado',
        data_mudancadeetapa: '01/01/2026'
    }
];

const start = new Date('2026-01-01T00:00:00.000Z');
const end = new Date();
const targetCorretor = 'isa';

const stats = {};

const parseSheetDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) return null;
    return new Date(`${year}-${month}-${day}`); // YYYY-MM-DD
};

const normalize = (str) => str ? String(str).toLowerCase().trim() : '';

leads.forEach(lead => {
    if (targetCorretor && normalize(lead.corretor) !== normalize(targetCorretor)) {
        return;
    }

    const propName = lead.imovel || 'Indefinido';
    if (!stats[propName]) {
        stats[propName] = {
            name: propName,
            novos: 0,
            qualificados: 0,
            visitas: 0,
            totalTime: 0,
            qualificacoesCountForTime: 0
        };
    }

    const entryDate = parseSheetDate(lead.data_entrada);
    // Count 'Novos'
    if (entryDate && entryDate >= start && entryDate <= end) {
        stats[propName].novos++;
    }

    const isQualifiedStage = lead.etapa_atual &&
        (lead.etapa_atual.toLowerCase().includes('qualifi') || lead.etapa_atual.toLowerCase().includes('visita') || lead.etapa_atual.toLowerCase().includes('proposta') || lead.etapa_atual.toLowerCase().includes('fechado'));

    if (isQualifiedStage) {
        let qualDate = parseSheetDate(lead.data_mudancadeetapa);
        const effectiveDate = qualDate || entryDate;

        if (effectiveDate && effectiveDate >= start && effectiveDate <= end) {
            stats[propName].qualificados++;
        }
    }

    // Auto-fill visits logic
    if (lead.etapa_atual && ['Visita', 'Proposta', 'Negócio Fechado'].includes(lead.etapa_atual)) {
        if (stats[propName] && stats[propName].visitas === 0) {
            stats[propName].visitas = 1;
        }
    }
});

console.log('--- Stats Before Filtering ---');
console.log(JSON.stringify(stats, null, 2));

const ranking = Object.values(stats)
    .filter(s => s.novos >= 1 && s.qualificados >= 1) // Min Threshold
    .sort((a, b) => b.qualificados - a.qualificados); // Simple sort

console.log('--- Ranking After Filtering ---');
console.log(JSON.stringify(ranking, null, 2));

if (ranking.length === 0) {
    console.log('❌ All properties were filtered out due to thresholds!');
} else {
    console.log('✅ Properties passed filtering.');
}
