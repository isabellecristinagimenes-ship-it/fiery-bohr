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

    if (!privateKey) {
      console.error('❌ GOOGLE_PRIVATE_KEY está vazia ou indefinida!');
      throw new Error('GOOGLE_PRIVATE_KEY missing');
    }

    // Diagnostic logs (masked)
    console.log('--- Auth Diagnostics ---');
    console.log('Node version:', process.version);
    console.log('Key length:', privateKey.length);
    console.log('Key start:', privateKey.substring(0, 20));
    console.log('Key end:', privateKey.substring(privateKey.length - 20));

    // CLEANING LOGIC:
    // 1. Remove quotes if wrapped
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }

    // 2. Handle escaped newlines (e.g. from JSON or copied env vars)
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID, serviceAccountAuth);

    try {
      await doc.loadInfo();
      console.log('✅ Google Sheets Auth successful. Doc title:', doc.title);
      this.doc = doc;
    } catch (err) {
      console.error('❌ Google Sheets Auth FAILED:', err.message);
      if (err.response) {
        console.error('API Error Details:', JSON.stringify(err.response.data, null, 2));
      }
      throw err; // Re-throw so the API request fails visibly
    }
  }

  _getSheet(title) {
    let sheet = this.doc.sheetsByTitle[title];
    if (!sheet) {
      console.warn(`Aba "${title}" não encontrada. Tentando "Página1" ou primeira aba.`);
      sheet = this.doc.sheetsByTitle['Página1'] || this.doc.sheetsByTitle['Sheet1'] || this.doc.sheetsByIndex[0];
    }
    if (!sheet) throw new Error(`Não foi possível encontrar uma aba válida (tentado: "${title}", "Página1", índice 0).`);
    return sheet;
  }

  async getLeads() {
    await this.init();
    const sheet = this._getSheet('leads');

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

  async addLead(data) {
    await this.init();
    const sheet = this._getSheet('leads');

    const newLead = {
      nome_do_lead: data.nome_do_lead,
      telefone: data.telefone,
      data_entrada: data.data_entrada || new Date().toISOString().split('T')[0], // YYYY-MM-DD
      data_mudancadeetapa: data.data_mudancadeetapa || new Date().toISOString().split('T')[0],
      etapa_atual: data.etapa_atual || 'Novo Lead',
      imovel: data.imovel || '',
      corretor: data.corretor || '',
      origem: data.origem || 'Manual',
      valor_do_imovel: data.valor_do_imovel || '',
      tipo_de_imovel: data.tipo_de_imovel || ''
    };

    await sheet.addRow(newLead);
    return newLead;
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
