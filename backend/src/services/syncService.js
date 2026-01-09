const { Lead } = require('../models');
const sheetsService = require('./sheetsService');

class SyncService {
    /**
     * Saves a new lead to both Google Sheets and the Database.
     * "Code-First" approach: validate and structure here, then push to external sources.
     */
    async createLead(leadData) {
        // 1. Save to Database (Source of Truth for Code)
        const newLead = await Lead.create({
            nome_do_lead: leadData.nome_do_lead,
            telefone: leadData.telefone,
            etapa_atual: leadData.etapa_atual,
            imovel: leadData.imovel,
            tipo_de_imovel: leadData.tipo_de_imovel,
            valor_do_imovel: leadData.valor_do_imovel,
            corretor: leadData.corretor,
            origem: leadData.origem
        });

        // 2. Save to Google Sheets (External View)
        try {
            await sheetsService.addLead(leadData);
        } catch (error) {
            console.error('Failed to sync new lead to Sheets:', error);
            // We might want to mark the DB record as "unsynced" in a robust system
        }

        return newLead;
    }
}

module.exports = new SyncService();
