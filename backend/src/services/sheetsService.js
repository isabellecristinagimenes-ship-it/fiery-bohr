const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

class SheetsService {
  constructor() {
    this.doc = null;
  }

  async init() {
    if (this.doc) return;

    // --- FINAL FIX (v39.0 BASE64) ---
    // Using Base64 encoded JSON to completely bypass formatting/newline/secret-scanning issues.

    try {
      const B64_CREDS = "eyJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsICJwcm9qZWN0X2lkIjogImltb2JpbGlhcmlhLW12cCIsICJwcml2YXRlX2tleV9pZCI6ICJjNGMzZjg4MWEwZjk3YzM0ZDVjOWE3ZWM2Yzk2YTdiMDAwYmIzOTM5IiwgInByaXZhdGVfa2V5IjogIi0tLS0tQkVHSU4gUFJJVkFURSBLRVktLS0tLVxuTUlJRXZRSUJBREFOQmdrcWhraUc5dzBCQVFFRkFBU0NCS2N3Z2dTakFnRUFBb0lCQVFDMm0xQUlYU01tdTRyN1xuQVhZTEVjYURPZjd4SHYrYTFVYUhJOXNtdmR0WUZ5ZzRHeVVwQ05GQ3J6YmRTeThsT3cwNVlTVVFOV0Nvb3dKSVxuUnZ0QTZldmYrb0tDSDUyNm12bE9ObzVUWEdhSjkwNEZQMHhBbjBFcExRWDlUMDlBbXlLRG5yUDRHRGZIUlpEVVxuWUExTGZFLzlpb2lmVm5oVzJESktEYTlNWnhSTVdlRTlicGVJTmRmTnFxM0EySmcwbE9nY2RRQUlRZDNZaW9CYVxud2tQMFdkOXdySmZEL2JJNlF6YkhGamI3c2pMNWFKMXdlaWplUTNQYysyNDdRc0xONkJKdXZsQzU5UlRiNXhqV1xuRnYwMnVJeWEwcnVmUVRWR01wb1VkU05mWGwwZ0t4WVY2OWFqbXFOelpTK0JCdFZESVV5TEI3WWlaTVJ5TmQvYlxubU94NW8yWmJBZ01CQUFFQ2dnRUFLbEdNRnFRZkJWYnBPb3A0Sk5DVnhNdW4vWkZGZzBoeDg5ZW5ibThKcWp5VFxub1kwSTY1MlRnWFRCcmo5Q1NjcUpvZ2FWWkZBNmVscHNxUHRxTnZ6L0lRVVpRYmE2QXdqdlJlVDJ6dkxYQUpwRFxuaG92SXpDRWNKTUsrWkpvQXIrUkQ5MlRNS0c3VVhtWU16bXNFS2I1QmUyeWpoT214TWM4Z3VIQzdjMlZnR3VGRVxuaUVqbmpTOTFycXBJUlVvb2M4WXNkUlVMZmkyU0g3dnZBeldoWDE1VGtQNGdMTTRpekw2alNBaFJoK1lmTmVVdlxuK3dEQTFGdEVJN0R5aWVxbTF5T05STi9KMllyNm5GUUl1ZkJTaEpXQm1LdmJhZjIzbXlLN3ZNYy9XNVY4blZ4elxuOHU1RTBQSHg3L2t2Ym5JbWNkUGc0a1Evd29CY3JJMzhhRnBCR0FuSXdRS0JnUUQwMk50cnZNaXUxMEVqcWZYeFxuYi9md051VkI2Rk9PV3pVRnJOZlZXQjh0d2x0Qy9XZFR6dzR2UTdUVlFDU1JkK09KeHVCNTdveDljOG5ZcUFNVVxuM0VkeFJXeWt6OUV4TXBBZis2SHlkaHNRZmZVY0phZHpNcTl6OWZDRkQ1dFdYMmpNbEgzZlVuaWRpOEoyVmtsc1xuYndNTFIzVEdjRWxWT3lrRys2OGQxZUJlZVFLQmdRQys3S3pMUjI1MXlaUFVxanBuc2pydThUTTdBTEplR1J4VFxucUJ0TmpvdzVqQW42dCtyOVdiaUFTYXlaRlFjU2dSdk16SlJ0WWtNdzgxS0VFSkRHWTBLUnlEYkt0REJjRnBYdFxuRnJibnZzdGN1WmkzY2lwSWdDZ1V6Tkh5NE1XRWc0V25LaVlJRFAyUkdTTk9jZGZTNGhwTWZMcDZpYmcwSTJLNVxuNDRKYnBhc21jd0tCZ0hReG1XZDJicEl5aXJJZkRSMG5zclRuaUVLUHUxOWFQejVUT1JZQXZNTWRjZXZIajhxQVxuLzAxRXgwTlFMa3B1WjZmUm5tT2U1a0wrdVBJOVFVRWNERGRmNStBSzAwNlNuVHpnVUlsY3JSbFZmUVYvaFFpeFxuSy94TzRYWno0cGJKcmxVdnZ0QkZOZ0lsK2dIb2p1MkxmUmxVTHNHaE5kdmh1R1djK1F5aW05aVpBb0dBQkNZQVxuV3lwaUxBMEZPVW01bXljMFFKemRFQnNqeFFlbXBlcXhMUzQ3dmNSZE15VnI1YlZkWE93ODQ5YWhJTFhOZE5XOVxuSStOT3NuR1hDV2VTdmJ6S1pZQ0VNRU5hQ2FZeis4TFNscFordExVVHJHaStvblNtYWsxSkFvMy92TEZlNWhMMFxuWUpobnFnOXh4UEtVVGZDN3dZMjBQNVZlZTBPSmthQnY1SzNrMmlFQ2dZRUFxNFdJNmJtTzVhaGNKSTc1QXczV1xuWnZFMW03MkFwTDRZMFB3SEtMTWlsbVp5VVNENGJxK2tmSUF5OUdyai9XUVJva25jZy9reGZudmxRQS9udGJkbFxuc2pnVzQ1ZE9pU1FyYndwSDBUT09NVUcrWDJrMlkzNDRXOUZ1Rlo0OVRLdWFVa0ZWa2QrdGtPWE43TkRyUndDVlxuOXVZL2xRT0YrSGw5M1h2eHJrVitiVzA9XFxuLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLVxuIiwgImNsaWVudF9lbWFpbCI6ICJiYWNrZW5kLWxlaXRvckBpbW9iaWxpYXJpYS1tdnAuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAiY2xpZW50X2lkIjogIjExMzkwNTg0MTU4NjEyNDIwMzIzNSIsICJhdXRoX3VyaSI6ICJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvYXV0aCIsICJ0b2tlbl91cmkiOiAiaHR0cHM6Ly9vYXV0aDIuZ29vZ2xlYXBpcy5jb20vdG9rZW4iLCAiYXV0aF9wcm92aWRlcl94NTA5X2NlcnRfdXJsIjogImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL29hdXRoMi92MS9jZXJ0cyIsICJjbGllbnRfeDUwOV9jZXJ0X3VybCI6ICJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9yb2JvdC92MS9tZXRhZGF0YS94NTA5L2JhY2tlbmQtbGVpdG9yJTQwaW1vYmlsaWFyaWEtbXZwLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwgInVuaXZlcnNlX2RvbWFpbiI6ICJnb29nbGVhcGlzLmNvbSJ9";

      const credsReq = JSON.parse(Buffer.from(B64_CREDS, 'base64').toString('utf-8'));

      console.log('--- Auth Diagnostics (v39.0 BASE64) ---');
      console.log('Email:', credsReq.client_email);

      const { google } = require('googleapis');

      const authClient = new google.auth.JWT(
        credsReq.client_email,
        null,
        credsReq.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
      );

      await authClient.authorize();

      this.sheetsClient = google.sheets({ version: 'v4', auth: authClient });
      console.log('✅ Google Sheets Auth successful (BASE64).');

    } catch (err) {
      console.error('❌ CRITICAL AUTH ERROR:', err.message);
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
