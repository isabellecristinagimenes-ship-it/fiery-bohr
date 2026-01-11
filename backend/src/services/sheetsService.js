const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

class SheetsService {
  constructor() {
    this.doc = null;
  }

  async init() {
    if (this.doc) return;

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('Credenciais do Google Sheets (Email/Key) não configuradas.');
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
    console.log('Email configured:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL); // Log the email to check for typos
    console.log('Key length:', privateKey.length);
    console.log('Key start:', privateKey.substring(0, 20));
    console.log('Key end:', privateKey.substring(privateKey.length - 20));

    // CLEANING LOGIC:
    // 1. Remove quotes if wrapped
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }

    console.log('Email configured:', SERVICE_ACCOUNT_EMAIL); // Log the email to check for typos
    console.log('Key length:', PRIVATE_KEY.length);
    console.log('Key start:', PRIVATE_KEY.substring(0, 20));
    console.log('Key end:', PRIVATE_KEY.substring(PRIVATE_KEY.length - 20));

    try {
      const auth = new google.auth.JWT(
        SERVICE_ACCOUNT_EMAIL,
        null,
        PRIVATE_KEY,
        scopes
      );

      sheetsClient = google.sheets({ version: 'v4', auth });
      console.log('✅ Google Sheets Auth successful.');
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

  async addLead(data, spreadsheetId) {
    if (!spreadsheetId) {
      throw new Error('CONFIG_ERROR: Agência sem Planilha Google conectada.');
    }
    await this.init(); // Ensure sheetsClient is initialized

    try {
      const values = [
        [
          data.data_entrada || new Date().toLocaleDateString('pt-BR'),
          data.nome_do_lead,
          data.telefone,
          data.imovel || 'Interesse Geral', // Detalhes do imóvel
          data.corretor || 'Sistema',      // Quem atendeu
          data.etapa_atual || 'Novo'        // Status inicial
        ]
      ];

      const response = await this.sheetsClient.spreadsheets.values.append({
        spreadsheetId,
        range: 'Página1!A:F', // Assuming 'Página1' and columns A-F for these fields
        valueInputOption: 'USER_ENTERED',
        resource: { values },
      });

      console.log('✅ Lead added successfully via Google Sheets API.');
      return { ...data, added: true, response: response.data };
    } catch (error) {
      console.error('❌ Error adding lead via Google Sheets API:', error.message);
      if (error.response) {
        console.error('API Error Details:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
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
