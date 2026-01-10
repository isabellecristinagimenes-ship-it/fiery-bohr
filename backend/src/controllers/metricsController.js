const metricsService = require('../services/metricsService');
const sheetsService = require('../services/sheetsService');

class MetricsController {
  async getOverview(req, res) {
    try {
      const data = await metricsService.getOverview();
      res.json(data);
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({ error: error.message || 'Erro interno' });
    }
  }

  async getLeads(req, res) {
    try {
      const data = await sheetsService.getLeads();
      res.json(data);
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({ error: error.message || 'Erro interno' });
    }
  }

  async addLead(req, res) {
    try {
      const { nome_do_lead, telefone } = req.body;

      if (!nome_do_lead) {
        return res.status(400).json({ error: 'Nome do lead é obrigatório' });
      }

      // TODO: Add stricter validation or sanitization here

      const newLead = await sheetsService.addLead(req.body);
      res.status(201).json(newLead);
    } catch (error) {
      console.error('Erro ao adicionar lead:', error);
      res.status(500).json({ error: error.message || 'Erro ao salvar lead' });
    }
  }
}

module.exports = new MetricsController();
