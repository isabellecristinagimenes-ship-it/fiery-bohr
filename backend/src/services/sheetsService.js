const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const crypto = require('crypto');

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

    // Ensure the key is correctly formatted with newlines
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    // Remove extra quotes if present
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.substring(1, privateKey.length - 1);
    }

    // Diagnostic logs (non-sensitive)
    console.log('--- Auth Diagnostics ---');
    console.log('Node version:', process.version);
    console.log('Private key length:', privateKey.length);
    console.log('Private key starts with:', privateKey.substring(0, 25));
    console.log('Private key ends with:', privateKey.substring(privateKey.length - 25));
    console.log('NODE_OPTIONS:', process.env.NODE_OPTIONS);
    try {
      const { getProviders } = crypto;
      if (getProviders) {
        console.log('OpenSSL Providers:', getProviders());
      }
    } catch (e) {
      console.log('Could not check crypto providers');
    }
    console.log('------------------------');

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
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
