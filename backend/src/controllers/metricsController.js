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
      // SAAS ISOLATION: 
      // We expect 'x-agency-id' header or query param for now, 
      // since we don't have a full JWT middleware yet.
      const agencyId = req.headers['x-agency-id'] || req.query.agencyId;

      let whereClause = {};
      if (agencyId) {
        // PERMITIR LEADS LEGADOS (agencyId IS NULL) - FIX TEMPORÁRIO
        whereClause = {
          [db.Sequelize.Op.or]: [
            { agencyId: agencyId },
            { agencyId: null }
          ]
        };
      }

      // Fetch from DB instead of Sheets for SaaS
      const leads = await db.Lead.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']]
      });

      res.json(leads);
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({ error: error.message || 'Erro interno' });
    }
  }

  async addLead(req, res) {
    try {
      const { nome_do_lead, telefone, agencyId, corretor } = req.body;

      if (!nome_do_lead) {
        return res.status(400).json({ error: 'Nome do lead é obrigatório' });
      }

      // Fetch Agency to get custom Spreadsheet ID
      const agency = await db.Agency.findByPk(agencyId);
      const customSheetId = agency?.spreadsheetId; // Will be undefined if not set, service handles fallback

      // Add to Google Sheets (Dynamic ID)
      await sheetsService.addLead({
        nome_do_lead,
        telefone,
        corretor,
        imovel: 'Interesse Geral'
      }, customSheetId);

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

      const events = await db.LeadEvent.findAll({
        where: {
          agencyId,
          createdAt: { [db.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)] }
        },
        include: [{ model: db.Lead, as: 'lead' }]
      });

      const propStats = {};

      events.forEach(event => {
        const propName = event.lead ? event.lead.imovel : 'Unknown';
        if (!propStats[propName]) propStats[propName] = { newLeads: 0, qualified: 0 };

        if (event.type === 'CREATED') propStats[propName].newLeads++;
        if (event.type === 'STAGE_CHANGE' && event.metadata?.to === 'Qualificado') propStats[propName].qualified++;
      });

      const ranking = Object.entries(propStats)
        .filter(([_, stats]) => stats.newLeads >= 10 && stats.qualified >= 5)
        .map(([name, stats]) => {
          const qualRatio = stats.newLeads > 0 ? (stats.qualified / stats.newLeads) : 0;
          return { name, ...stats, qualRatio };
        })
        .sort((a, b) => b.qualRatio - a.qualRatio)
        .slice(0, 3);

      res.json(ranking);
    } catch (error) {
      console.error('Prop Ranking Error:', error);
      res.status(500).json({ error: 'Erro ao calcular ranking imóveis' });
    }
  }
}

module.exports = new MetricsController();
