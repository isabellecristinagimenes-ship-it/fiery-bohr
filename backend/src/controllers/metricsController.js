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
        whereClause.agencyId = agencyId;
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

      // Create directly in DB for SaaS
      const newLead = await db.Lead.create({
        nome_do_lead,
        telefone,
        agencyId,
        corretor,
        etapa_atual: 'Novo',
        origem: 'Manual'
      });

      res.status(201).json(newLead);
    } catch (error) {
      console.error('Erro ao adicionar lead:', error);
      res.status(500).json({ error: error.message || 'Erro ao salvar lead' });
    }
  }
}

module.exports = new MetricsController();
