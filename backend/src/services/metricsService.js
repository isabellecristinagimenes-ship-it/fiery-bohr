const sheetsService = require('./sheetsService');

class MetricsService {
  async getOverview() {
    const [leads, events] = await Promise.all([
      sheetsService.getLeads(),
      sheetsService.getEvents()
    ]);

    const total_leads = leads.length;
    
    const normalize = s => s ? s.toLowerCase().trim() : '';

    const total_visitas = events.filter(e => normalize(e.tipo_evento) === 'visita').length;
    const total_propostas = events.filter(e => normalize(e.tipo_evento) === 'proposta').length;
    const total_perdas = events.filter(e => normalize(e.tipo_evento) === 'perda').length;

    const leads_by_stage = leads.reduce((acc, lead) => {
      const stage = lead.etapa_atual || 'sem_etapa';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {});

    return {
      total_leads,
      total_visitas,
      total_propostas,
      total_perdas,
      leads_by_stage
    };
  }
}

module.exports = new MetricsService();
