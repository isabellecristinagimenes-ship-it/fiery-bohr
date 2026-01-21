const metricsService = require('../services/metricsService');
const sheetsService = require('../services/sheetsService');
const db = require('../models');

class MetricsController {
  async getOverview(req, res) {
    try {
      // In a real SaaS, we would use req.user.agencyId from a middleware
      // For MVP, we assume the agencyId is passed in query or headers
      // OR for now, we just return mock data structure until we fully migrate metricsService

      const data = await metricsService.getOverview();
      // NOTE: true database metrics service still needs to be built to replace sheetService

      res.json(data);
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({ error: error.message || 'Erro interno' });
    }
  }

  async getLeads(req, res) {
    try {
      // Fetch from Google Sheets for MVP/Pipeline fix
      console.log('DEBUG: Fetching leads from Google Sheets (MVP Mode)');

      // Ensure sheetsService is initialized with default ID if needed
      const leads = await sheetsService.getLeads();

      console.log(`DEBUG: Found ${leads.length} leads in Sheets.`);

      res.json(leads);
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({ error: error.message || 'Erro interno' });
    }
  }

  async addLead(req, res) {
    try {
      const { nome_do_lead, telefone, agencyId, corretor, imovel, tipo_de_imovel, valor_do_imovel, origem } = req.body;

      if (!nome_do_lead) {
        return res.status(400).json({ error: 'Nome do lead é obrigatório' });
      }

      // Fetch Agency to get custom Spreadsheet ID
      const agency = await db.Agency.findByPk(agencyId);

      if (!agency || !agency.spreadsheetId) {
        return res.status(400).json({
          error: 'CONFIGURAÇÃO INCOMPLETA: Esta agência não tem uma Planilha Google conectada. Por favor, contate o administrador.'
        });
      }

      // Add to Google Sheets (Dynamic ID)
      await sheetsService.addLead({
        nome_do_lead,
        telefone,
        corretor,
        imovel: imovel || 'Interesse Geral', // Use provided value or fallback
        tipo_de_imovel,
        valor_do_imovel,
        origem
      }, agency.spreadsheetId);

      // Create directly in DB for SaaS
      const newLead = await db.Lead.create({
        nome_do_lead,
        telefone,
        agencyId,
        corretor,
        etapa_atual: 'Novo',
        origem: 'Manual'
      });

      // LOG EVENT: CREATED
      await db.LeadEvent.create({
        leadId: newLead.id,
        agencyId,
        type: 'CREATED',
        metadata: { corretor }
      });

      res.status(201).json(newLead);
    } catch (error) {
      console.error('Erro ao adicionar lead:', error);
      res.status(500).json({ error: error.message || 'Erro ao salvar lead' });
    }
  }

  async updateLead(req, res) {
    try {
      const { id } = req.params; // This is the Row Index
      const { agencyId, ...updateData } = req.body;

      console.log(`DEBUG: Updating Lead ID (Row): ${id}`, updateData);

      // In real SaaS, check agencyId permissions. 
      // For now, we trust the frontend sends the right ID.

      // If agencyId is passed, we could fetch specific sheet ID, 
      // but init() falls back to env so it works for MVP.
      let targetSpreadsheetId = null;
      if (agencyId) {
        const agency = await db.Agency.findByPk(agencyId);
        if (agency) targetSpreadsheetId = agency.spreadsheetId;
      }

      await sheetsService.updateLead(id, updateData, targetSpreadsheetId);

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating lead:', error);
      res.status(500).json({ error: error.message || 'Error updating lead' });
    }
  }

  // --- ANALYTICS: Broker Ranking ---
  async getBrokerRanking(req, res) {
    try {
      const agencyId = req.headers['x-agency-id'] || req.query.agencyId;
      const { startDate, endDate } = req.query;

      const events = await db.LeadEvent.findAll({
        where: {
          agencyId,
          createdAt: { [db.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)] }
        },
        include: [{ model: db.Lead, as: 'lead' }]
      });

      const brokerStats = {};

      events.forEach(event => {
        const brokerName = event.lead ? event.lead.corretor : 'Unknown';
        if (!brokerStats[brokerName]) brokerStats[brokerName] = { newLeads: 0, qualified: 0, visits: 0 };

        if (event.type === 'CREATED') brokerStats[brokerName].newLeads++;
        if (event.type === 'STAGE_CHANGE' && event.metadata?.to === 'Qualificado') brokerStats[brokerName].qualified++;
        if (event.type === 'VISIT') brokerStats[brokerName].visits++;
      });

      const ranking = Object.entries(brokerStats)
        .filter(([_, stats]) => stats.newLeads >= 1)
        .map(([name, stats]) => {
          const qualRatio = stats.newLeads > 0 ? (stats.qualified / stats.newLeads) : 0;
          const visitRatio = stats.qualified > 0 ? (stats.visits / stats.qualified) : 0;
          const finalScore = (qualRatio * 0.5) + (visitRatio * 0.5);
          return { name, ...stats, finalScore };
        })
        .sort((a, b) => b.finalScore - a.finalScore)
        .slice(0, 3);

      res.json(ranking);
    } catch (error) {
      console.error('Ranking Error:', error);
      res.status(500).json({ error: 'Erro ao calcular ranking' });
    }
  }

  // --- ANALYTICS: Property Ranking ---
  async getPropertyRanking(req, res) {
    try {
      const agencyId = req.headers['x-agency-id'] || req.query.agencyId;
      const { startDate, endDate } = req.query;
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Adjust end date to include the full day
      end.setHours(23, 59, 59, 999);

      // Fetch Events and Leads (to map ID to Property if needed, though events should ideally have it or we resolve it)
      // Current events might not have 'imovel' directly if we only log lead_id. 
      // We need to join with Leads.
      const [events, leads] = await Promise.all([
        sheetsService.getEvents(),
        sheetsService.getLeads()
      ]);

      // Create a map of Lead ID -> Property Name
      const leadPropertyMap = {};
      const leadCreationTimeMap = {}; // To calc duration
      leads.forEach(l => {
        leadPropertyMap[l.id] = l.imovel;
      });

      // Also build map from Create Events for duration calc
      events.forEach(e => {
        if (e.tipo_evento === 'CREATED') {
          leadCreationTimeMap[e.lead_id] = new Date(e.timestamp);
        }
      });
      // Fallback: If no created event (old lead), use current time or skip duration?
      // User criterion: "Menor tempo médio até qualificação"

      const stats = {};

      events.forEach(event => {
        const eventDate = new Date(event.timestamp);
        if (eventDate < start || eventDate > end) return;

        const propName = leadPropertyMap[event.lead_id] || 'Desconhecido';
        if (!stats[propName]) {
          stats[propName] = {
            name: propName,
            novos: 0,
            qualificados: 0,
            visitas: 0,
            totalTime: 0, // ms
            qualificacoesCountForTime: 0
          };
        }

        if (event.tipo_evento === 'CREATED') {
          stats[propName].novos++;
        }

        if (event.tipo_evento === 'STAGE_CHANGE' && (event.metadata?.includes('Qualificado') || event.metadata?.includes('Qualificação'))) {
          // Check if truly moving TO qualificado
          // Our logEvent saves JSON metadata: { from, to }
          let isQualify = false;
          try {
            const meta = JSON.parse(event.metadata);
            if (meta.to === 'Qualificação' || meta.to === 'Qualificado') isQualify = true;
          } catch (e) {
            // specific fallback or ignore
            if (String(event.metadata).includes('Qualific')) isQualify = true;
          }

          if (isQualify) {
            stats[propName].qualificados++;

            // Calc Duration
            const createdTime = leadCreationTimeMap[event.lead_id];
            if (createdTime) {
              const duration = eventDate - createdTime;
              if (duration > 0) {
                stats[propName].totalTime += duration;
                stats[propName].qualificacoesCountForTime++;
              }
            }
          }
        }

        if (event.tipo_evento === 'VISITA') {
          stats[propName].visitas++;
        }
      });

      const ranking = Object.values(stats)
        .filter(s => s.novos >= 1 && s.qualificados >= 1) // Rule: At least 1 new AND 1 qualified
        .map(s => {
          const qualRatio = s.novos > 0 ? (s.qualificados / s.novos) : 0;
          const avgTime = s.qualificacoesCountForTime > 0 ? (s.totalTime / s.qualificacoesCountForTime) : Infinity;
          return { ...s, qualRatio, avgTime };
        })
        .sort((a, b) => {
          // 1. Rate (Desc)
          if (b.qualRatio !== a.qualRatio) return b.qualRatio - a.qualRatio;
          // 2. Count Qualified (Desc)
          if (b.qualificados !== a.qualificados) return b.qualificados - a.qualificados;
          // 3. Avg Time (Asc) - lower is better
          if (a.avgTime !== b.avgTime) return a.avgTime - b.avgTime;
          // 4. Visits (Desc)
          if (b.visitas !== a.visitas) return b.visitas - a.visitas;
          // 5. Name (Asc)
          return a.name.localeCompare(b.name);
        })
        .slice(0, 3);

      res.json(ranking);
    } catch (error) {
      console.error('Prop Ranking Error:', error);
      res.status(500).json({ error: 'Erro ao calcular ranking imóveis' });
    }
  }
}

module.exports = new MetricsController();
