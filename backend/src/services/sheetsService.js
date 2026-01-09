const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

class SheetsService {
  constructor() {
    this.doc = null;
  }

  async init() {
    if (this.doc) return;

    if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('Credenciais do Google Sheets não configuradas (.env).');
    }

    // Tratamento de quebra de linha para chaves privadas (comum dar erro em deploys)
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    // Diagnostic logs (non-sensitive)
    console.log('--- Auth Diagnostics ---');
    console.log('Node version:', process.version);
    console.log('Raw key length:', privateKey ? privateKey.length : 0);

    if (privateKey) {
      privateKey = privateKey.trim();
      // Remove all leading/trailing quotes
      while (privateKey.startsWith('"') || privateKey.startsWith("'")) {
        privateKey = privateKey.substring(1).trim();
      }
      while (privateKey.endsWith('"') || privateKey.endsWith("'")) {
        privateKey = privateKey.substring(0, privateKey.length - 1).trim();
      }

      // Ensure the key is correctly formatted with newlines
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
    }

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID, serviceAccountAuth);
    await doc.loadInfo();
    this.doc = doc;
  }

  async getLeads() {
    await this.init();
    const sheet = this.doc.sheetsByTitle['leads'];
    if (!sheet) throw new Error('Aba "leads" não encontrada na planilha.');

    // Ler linhas
    const rows = await sheet.getRows();
    return rows.map(row => ({
      nome_do_lead: row.get('nome_do_lead'),
      telefone: row.get('telefone'),
      data_entrada: row.get('data_entrada'),
      data_mudancadeetapa: row.get('data_mudancadeetapa'),
      etapa_atual: row.get('etapa_atual'),
      imovel: row.get('imovel'),
      corretor: row.get('corretor'),
      origem: row.get('origem'),
      valor_do_imovel: row.get('valor_do_imovel'),
      tipo_de_imovel: row.get('tipo_de_imovel')
    }));
  }

  async addLead(leadData) {
    await this.init();
    const sheet = this.doc.sheetsByTitle['leads'];
    if (!sheet) throw new Error('Aba "leads" não encontrada na planilha.');

    // Map internal field names to Sheet headers
    // Assuming Sheet Headers: nome_do_lead, telefone, etapa_atual, imovel, valor_do_imovel, corretor, origem, data_entrada
    const row = await sheet.addRow({
      nome_do_lead: leadData.nome_do_lead,
      telefone: leadData.telefone,
      etapa_atual: leadData.etapa_atual || 'Novo Lead',
      imovel: leadData.imovel || '',
      valor_do_imovel: leadData.valor_do_imovel || '',
      corretor: leadData.corretor || '',
      origem: leadData.origem || 'Manual',
      data_entrada: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    });
    return row;
  }

  async getEvents() {
    await this.init();
    const sheet = this.doc.sheetsByTitle['events'];
    if (!sheet) throw new Error('Aba "events" não encontrada na planilha.');

    const rows = await sheet.getRows();
    return rows.map(row => ({
      event_id: row.get('event_id'),
      lead_id: row.get('lead_id'),
      tipo_evento: row.get('tipo_evento'),
      timestamp: row.get('timestamp'),
      observacao: row.get('observacao'),
      motivo_perda: row.get('motivo_perda')
    }));
  }
}

module.exports = new SheetsService();
