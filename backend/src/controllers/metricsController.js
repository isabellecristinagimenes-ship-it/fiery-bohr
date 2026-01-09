const metricsService = require('../services/metricsService');
const sheetsService = require('../services/sheetsService');

class MetricsController {
  async getOverview(req, res) {
    try {
      const data = await metricsService.getOverview();
      res.json(data);
    } catch (error) {
      console.error('Erro:', error);
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
}

module.exports = new MetricsController();
