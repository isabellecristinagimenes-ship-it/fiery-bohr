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
      end.setHours(23, 59, 59, 999);

      // Fetch Leads (Primary Source for Backfill) and Events (for incremental precision)
      const [leads, events] = await Promise.all([
        sheetsService.getLeads(),
        sheetsService.getEvents()
      ]);

      const stats = {};

      // Helper to parse "DD/MM/YYYY" from Sheet
      const parseSheetDate = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return null;
        const [day, month, year] = dateStr.split('/');
        if (!day || !month || !year) return null;
        return new Date(`${year}-${month}-${day}`); // YYYY-MM-DD
      };

      // 1. Process Actual Leads (Historical Data)
      // Filter by Corretor if requested
      const targetCorretor = req.query.corretor;

      const normalize = (str) => str ? String(str).toLowerCase().trim() : '';

      leads.forEach(lead => {
        // Filter: If targetCorretor is set, skip if mismatch
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

        // Count 'Qualificados' logic
        const isQualifiedStage = lead.etapa_atual &&
          (lead.etapa_atual.toLowerCase().includes('qualifi') || lead.etapa_atual.toLowerCase().includes('visita') || lead.etapa_atual.toLowerCase().includes('proposta') || lead.etapa_atual.toLowerCase().includes('fechado'));

        if (isQualifiedStage) {
          // Try to get qualification date
          let qualDate = parseSheetDate(lead.data_mudancadeetapa);

          // If no update date, but it IS qualified, should we count it? 
          // Only if we can determine it happened in the period. 
          // Fallback: use entryDate if missing (dangerous assumption but better than 0 for MVP)
          // STRICTER: Only count if we have the date OR if entryDate is in period (cohort assumption)
          const effectiveDate = qualDate || entryDate;

          if (effectiveDate && effectiveDate >= start && effectiveDate <= end) {
            stats[propName].qualificados++;

            // Time to Qualify
            if (entryDate && qualDate) {
              const duration = qualDate - entryDate;
              if (duration >= 0) {
                stats[propName].totalTime += duration;
                stats[propName].qualificacoesCountForTime++;
              }
            }
          }
        }
      });

      // 2. Merge Visits from Events (if any exist)
      // Since sheet doesn't have 'visitas' column, we rely on events for this specific metric
      // or we count 'Visita' stage presence as at least 1 visit.
      events.forEach(event => {
        // ... existing event logic for visits ...
        const eventDate = new Date(event.timestamp);
        if (eventDate < start || eventDate > end) return;

        if (event.tipo_evento === 'VISITA') {
          // We need to match lead_id to property. 
          // We can find lead in 'leads' array by id (rowNumber)
          const lead = leads.find(l => String(l.id) === String(event.lead_id));

          // Strict Filter for events too
          if (targetCorretor && lead && normalize(lead.corretor) !== normalize(targetCorretor)) {
            return;
          }

          if (lead && lead.imovel) {
            const pName = lead.imovel;
            if (stats[pName]) stats[pName].visitas++;
          }
        }
      });

      // Auto-fill visits based on Stage if events are empty (Backfill heuristic)
      leads.forEach(lead => {
        // Filter again for this loop
        if (targetCorretor && normalize(lead.corretor) !== normalize(targetCorretor)) {
          return;
        }

        if (lead.etapa_atual && ['Visita', 'Proposta', 'Negócio Fechado'].includes(lead.etapa_atual)) {
          const propName = lead.imovel || 'Indefinido';
          // If we have 0 visits logged but stage is Visit+, assume at least 1
          if (stats[propName] && stats[propName].visitas === 0) {
            stats[propName].visitas = 1;
          }
        }
      });

      const ranking = Object.values(stats)
        .filter(s => s.novos >= 1 || s.qualificados >= 1 || s.visitas >= 1) // Relaxed Threshold: Show if ANY activity exists
        .map(s => {
          const qualRatio = s.novos > 0 ? (s.qualificados / s.novos) : 0;
          const avgTime = s.qualificacoesCountForTime > 0 ? (s.totalTime / s.qualificacoesCountForTime) : 0; // 0 if N/A
          return { ...s, qualRatio, avgTime };
        })
        .sort((a, b) => {
          // 1. Rate (Desc)
          if (b.qualRatio !== a.qualRatio) return b.qualRatio - a.qualRatio;
          // 2. Count Qualified (Desc)
          if (b.qualificados !== a.qualificados) return b.qualificados - a.qualificados;
          // 3. Avg Time (Asc) - lower is better (but exclude 0/invalid)
          // If one is 0 (invalid) and other is valid, prefer valid? Or handle as Infinity?
          // Simple: just plain diff
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
