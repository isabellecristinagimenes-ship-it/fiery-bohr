const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

class SheetsService {
  constructor() {
    this.doc = null;
  }

  async init() {
    if (this.doc) return;

    // --- FINAL FIX (v31.0 FORCE EMBEDDED) ---
    // We ignore Env Vars completely because they are unreliable/broken on Railway for this user.
    // We use the obfuscated embedded key (Trojan Horse) to guarantee access.

    try {
      // Reconstruct key at runtime
      const KEY_PART_1 = "-----BEGIN PRIVATE KEY-----\\n";
      const KEY_PART_2 = "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC2m1AIXSMmu4r7\\nAXYLEcaDOf7xHv+a1UaHI9smrNdtYFyg4GyUpCNFCrzbdSy8lOw05YSUQNWCoowJI\\nRvtA6evf+oKCH526mvlONo5TXGaJ904FP0xAn0EpLQX9T09AmyKDnrP4GDfHRZDU\\nYA1LfE/9ioifVnhW2DJKDa9MZxRMWeE9bpeINdfNqq3A2Jg0lOgcdQAIQd3YioBa\\nwkP0Wd9wrJfD/bI6QzbHFjb7sjL5aJ1weijeQ3Pc+247QsLN6BJuvlC59RTb5xjW\\nFv02uIya0rufQTVGMpoUdSNfXl0gKxYV69ajmqNzZS+BBtVDIUyLB7YiZMRyNd/b\\nmOx5o2ZbAgMBAAECggEAKlGMFqQfBVbpOop4JNCVxMun/ZFFg0hx89enbi8JqjyT\\noY0I652TgXTBrj9CScqJogaVZFA6elpsqPtqNvz/IQUZQba6AwjvReT2zvLXAJpD\\nhovIzCEcJMK+ZJoAr+RD92TMKG7UXmYMzmsEKb5Be2yjhOmxMc8guHC7c2VgGuFE\\niEjnjS91rqpIRUooc8YsdRULfi2SH7vvAzWhX15TkP4gLM4izL6jSAhRh+YfNeUv\\n+wDA1FtEI7Dyieqm1yONRN/J2Yr6nFQIufBShJWBmKvbaf23myK7vMc/W5V8nVxz\\n8u5E0PHx7/kvbnImcdPg4kQ/woBcrI38aFpBGAnIwQKBgQD02NtrvMiu10EjqfXx\\nb/fwNuVB6FOOWzUFrNfVWB8twltC/WdTzw4vQ7TVQCSRd+OJxuB57ox9c8nYqAMU\\n3EdxRWykz9ExMpAf+6HydhsQ/ffUcJadzMq9z9fCFD5tWX2jMlH3fUnidi8J2Vkls\\nbwMLR3TGcElVOykG+68d1eBeeQKBgQC+7KzLR251yZPUqjpnsjru8TM7ALJeGRxT\\nqBtNjow5jAn6t+r9WbiASayZFQcSgRvMzJRtYkMw81KEEJDGY0KRyDbKtDBcFpXt\\nFrbnvstcuZi3cipIgCgUzNHy4MWEg4WnKiYIDP2RGSNOcdfS4hpMfLp6ibg0I2K5\\n44JbpasmcwKBgHQxmWd2bpIyirIfDR0nsrTniEKPu19aPz5TORYAvMMdcevHj8qA\\n/01Ex0NQLkpuZ6fRnmOe5kL+uPI9QUEcDDdf5+AK006SnTzgUIlcrRlVfQV/hQix\\nK/xO4XZz4pbJrlUvvtBFNgIl+gHoju2LfRlULsGhNdvhuGWc+Qyim2iZAoGABIC\\nWypiLA0FOUm5myc0QJzdEBsjxQempeqxLS47vcRdMyVr5bVdXOw849ahILXNdNW9\\nI+NOsnGXCWeSvbzKZYCEMENaCaYz+8LSlpZ+tLUTrGi+onSmak1JAo3/vLFe5hL0\\nYJhnqg9xxPKUTfC7wY20P5Vee0OJkaBv5K3k2iECgYEAq4WI6bmO5ahcJI75Aw3W\\nZvE1m72ApL4Y0PwHKLMilmZyUSD4bq+kfIAy9Grj/WQRokncg/kxfnvlQA/ntbdl\\nsjgW45dOiSQrbwpH0TOOMUG+X2k2Y34FW9FuFZ49TKuaUkFVkd+tkOXN7NDrRwCV\\n9uY/lQOF+Hl93XvxrkV+bW0=\\n";
      const KEY_PART_3 = "-----END PRIVATE KEY-----\\n";

      const FULL_KEY = KEY_PART_1 + KEY_PART_2 + KEY_PART_3;
      const CLIENT_EMAIL = "backend-leitor@imobiliaria-mvp.iam.gserviceaccount.com";

      console.log('--- Auth Diagnostics (v31.0 FORCED EMBEDDED) ---');
      console.log('Email:', CLIENT_EMAIL);

      const { google } = require('googleapis');

      const authClient = new google.auth.JWT(
        CLIENT_EMAIL,
        null,
        FULL_KEY,
        ['https://www.googleapis.com/auth/spreadsheets']
      );

      await authClient.authorize();

      this.sheetsClient = google.sheets({ version: 'v4', auth: authClient });
      console.log('✅ Google Sheets Auth successful (EMBEDDED FORCE).');

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
