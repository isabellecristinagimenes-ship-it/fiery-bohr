const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

class SheetsService {
  constructor() {
    this.doc = null;
  }

  async init() {
    if (this.doc) return;

    // --- FINAL FIX (v40.0 GOOGLE AUTH WRAPPER) ---
    // Switch to GoogleAuth (higher level) and add deep diagnostics.

    try {
      const B64_CREDS = "eyJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsICJwcm9qZWN0X2lkIjogImltb2JpbGlhcmlhLW12cCIsICJwcml2YXRlX2tleV9pZCI6ICJjNGMzZjg4MWEwZjk3YzM0ZDVjOWE3ZWM2Yzk2YTdiMDAwYmIzOTM5IiwgInByaXZhdGVfa2V5IjogIi0tLS0tQkVHSU4gUFJJVkFURSBLRVktLS0tLVxuTUlJRXZRSUJBREFOQmdrcWhraUc5dzBCQVFFRkFBU0NCS2N3Z2dTakFnRUFBb0lCQVFDMm0xQUlYU01tdTRyN1xuQVhZTEVjYURPZjd4SHYrYTFVYUhJOXNtdmR0WUZ5ZzRHeVVwQ05GQ3J6YmRTeThsT3cwNVlTVVFOV0Nvb3dKSVxuUnZ0QTZldmYrb0tDSDUyNm12bE9ObzVUWEdhSjkwNEZQMHhBbjBFcExRWDlUMDlBbXlLRG5yUDRHRGZIUlpEVVxuWUExTGZFLzlpb2lmVm5oVzJESktEYTlNWnhSTVdlRTlicGVJTmRmTnFxM0EySmcwbE9nY2RRQUlRZDNZaW9CYVxud2tQMFdkOXdySmZEL2JJNlF6YkhGamI3c2pMNWFKMXdlaWplUTNQYysyNDdRc0xONkJKdXZsQzU5UlRiNXhqV1xuRnYwMnVJeWEwcnVmUVRWR01wb1VkU05mWGwwZ0t4WVY2OWFqbXFOelpTK0JCdFZESVV5TEI3WWlaTVJ5TmQvYlxubU94NW8yWmJBZ01CQUFFQ2dnRUFLbEdNRnFRZkJWYnBPb3A0Sk5DVnhNdW4vWkZGZzBoeDg5ZW5iaThKcWp5VFxub1kwSTY1MlRnWFRCcmo5Q1NjcUpvZ2FWWkZBNmVscHNxUHRxTnZ6L0lRVVpRYmE2QXdqdlJlVDJ6dkxYQUpwRFxuaG92SXpDRWNKTUsrWkpvQXIrUkQ5MlRNS0c3VVhtWU16bXNFS2I1QmUyeWpoT214TWM4Z3VIQzdjMlZnR3VGRVxuaUVqbmpTOTFycXBJUlVvb2M4WXNkUlVMZmkyU0g3dnZBeldoWDE1VGtQNGdMTTRpekw2alNBaFJoK1lmTmVVdlxuK3dEQTFGdEVJN0R5aWVxbTF5T05STi9KMllyNm5GUUl1ZkJTaEpXQm1LdmJhZjIzbXlLN3ZNYy9XNVY4blZ4elxuOHU1RTBQSHg3L2t2Ym5JbWNkUGc0a1Evd29CY3JJMzhhRnBCR0FuSXdRS0JnUUQwMk50cnZNaXUxMEVqcWZYeFxuYi9md051VkI2Rk9PV3pVRnJOZlZXQjh0d2x0Qy9XZFR6dzR2UTdUVlFDU1JkK09KeHVCNTdveDljOG5ZcUFNVVxuM0VkeFJXeWt6OUV4TXBBZis2SHlkaHNRZmZVY0phZHpNcTl6OWZDRkQ1dFdYMmpNbEgzZlVuaWRpOEoyVmtsc1xuYndNTFIzVEdjRWxWT3lrRys2OGQxZUJlZVFLQmdRQys3S3pMUjI1MXlaUFVxanBuc2pydThUTTdBTEplR1J4VFxucUJ0TmpvdzVqQW42dCtyOVdiaUFTYXlaRlFjU2dSdk16SlJ0WWtNdzgxS0VFSkRHWTBLUnlEYkt0REJjRnBYdFxuRnJibnZzdGN1WmkzY2lwSWdDZ1V6Tkh5NE1XRWc0V25LaVlJRFAyUkdTTk9jZGZTNGhwTWZMcDZpYmcwSTJLNVxuNDRKYnBhc21jd0tCZ0hReG1XZDJicEl5aXJJZkRSMG5zclRuaUVLUHUxOWFQejVUT1JZQXZNTWRjZXZIajhxQVxuLzAxRXgwTlFMa3B1WjZmUm5tT2U1a0wrdVBJOVFVRWNERGRmNStBSzAwNlNuVHpnVUlsY3JSbFZmUVYvaFFpeFxuSy94TzRYWno0cGJKcmxVdnZ0QkZOZ0lsK2dIb2p1MkxmUmxVTHNHaE5kdmh1R1djK1F5aW05aVpBb0dBQkNZQVxuV3lwaUxBMEZPVW01bXljMFFKemRFQnNqeFFlbXBlcXhMUzQ3dmNSZE15VnI1YlZkWE93ODQ5YWhJTFhOZE5XOVxuSStOT3NuR1hDV2VTdmJ6S1pZQ0VNRU5hQ2FZeis4TFNscFordExVVHJHaStvblNtYWsxSkFvMy92TEZlNWhMMFxuWUpobnFnOXh4UEtVVGZDN3dZMjBQNVZlZTBPSmthQnY1SzNrMmlFQ2dZRUFxNFdJNmJtTzVhaGNKSTc1QXczV1xuWnZFMW03MkFwTDRZMFB3SEtMTWlsbVp5VVNENGJxK2tmSUF5OUdyai9XUVJva25jZy9reGZudmxRQS9udGJkbFxuc2pnVzQ1ZE9pU1FyYndwSDBUT09NVUcrWDJrMlkzNEZXOUZ1Rlo0OVRLdWFVa0ZWa2QrdGtPWE43TkRyUndDVlxuOXVZL2xRT0YrSGw5M1h2eHJrVitiVzA9XG4tLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tXG4iLCAiY2xpZW50X2VtYWlsIjogImJhY2tlbmQtbGVpdG9yQGltb2JpbGlhcmlhLW12cC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsICJjbGllbnRfaWQiOiAiMTEzOTA1ODQxNTg2MTI0MjAzMjM1IiwgImF1dGhfdXJpIjogImh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbS9vL29hdXRoMi9hdXRoIiwgInRva2VuX3VyaSI6ICJodHRwczovL29hdXRoMi5nb29nbGVhcGlzLmNvbS90b2tlbiIsICJhdXRoX3Byb3ZpZGVyX3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRzIiwgImNsaWVudF94NTA5X2NlcnRfdXJsIjogImh0dHBzOi8vd3d3Lm5vb2dsZWFwaXMuY29tL3JvYm90L3YxL21ldGFkYXRhL3g1MDkvYmFja2VuZC1sZWl0b3IlNDBpbW9iaWxpYXJpYS1tdnAuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAidW5pdmVyc2VfZG9tYWluIjogImdvb2dsZWFwaXMuY29tIn0=";

      const credsReq = JSON.parse(Buffer.from(B64_CREDS, 'base64').toString('utf-8'));

      // Sanitization: Ensure real newlines
      if (credsReq.private_key) {
        credsReq.private_key = credsReq.private_key.replace(/\\n/g, '\n');
      }

      console.log('--- Auth Diagnostics (v40.0 GOOGLE AUTH) ---');
      console.log('Email:', credsReq.client_email);
      console.log('Key Length:', credsReq.private_key ? credsReq.private_key.length : 0);
      console.log('Key Start:', credsReq.private_key ? credsReq.private_key.substring(0, 30) : 'MISSING');
      console.log('Key End:', credsReq.private_key ? credsReq.private_key.substring(credsReq.private_key.length - 20) : 'MISSING');

      const { google } = require('googleapis');

      // Use higher-level GoogleAuth
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: credsReq.client_email,
          private_key: credsReq.private_key,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const authClient = await auth.getClient();

      // GoogleAuth returns an authenticated client directly
      this.sheetsClient = google.sheets({ version: 'v4', auth: authClient });
      console.log('✅ Google Sheets Auth successful (GOOGLE AUTH).');

    } catch (err) {
      console.error('❌ CRITICAL AUTH ERROR:', err.message);
      if (err.stack) console.error(err.stack);
      throw err;
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
      // 1. Fetch Spreadsheet Metadata to get the real Sheet Name (avoid "Página1" hardcoding errors)
      const meta = await this.sheetsClient.spreadsheets.get({
        spreadsheetId
      });

      const firstSheetTitle = meta.data.sheets[0].properties.title;
      console.log(`ℹ️ Detected Key Sheet: "${firstSheetTitle}"`);

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
        range: `${firstSheetTitle}!A:F`, // Dynamic Range
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
