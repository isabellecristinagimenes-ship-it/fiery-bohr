const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

class SheetsService {
  constructor() {
    this.doc = null;
    this.sheetsClient = null;
  }

  async init(spreadsheetId = process.env.GOOGLE_SHEETS_ID) {
    // If we have both doc and client initialized for the SAME spreadsheetId (conceptually), return.
    // However, since we might switch sheets dynamically, let's keep it simple for now:
    // If we have this.doc and it matches the requested ID (if provided), we might skip.
    // For this fix, let's just ensure we have A doc if we need one.

    if (this.doc && this.sheetsClient) return;

    // --- FINAL FIX (v40.0 GOOGLE AUTH WRAPPER) ---
    // Switch to GoogleAuth (higher level) and add deep diagnostics.

    try {
      const B64_CREDS = "eyJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsICJwcm9qZWN0X2lkIjogImltb2JpbGlhcmlhLW12cCIsICJwcml2YXRlX2tleV9pZCI6ICJjNGMzZjg4MWEwZjk3YzM0ZDVjOWE3ZWM2Yzk2YTdiMDAwYmIzOTM5IiwgInByaXZhdGVfa2V5IjogIi0tLS0tQkVHSU4gUFJJVkFURSBLRVktLS0tLVxuTUlJRXZRSUJBREFOQmdrcWhraUc5dzBCQVFFRkFBU0NCS2N3Z2dTakFnRUFBb0lCQVFDMm0xQUlYU01tdTRyN1xuQVhZTEVjYURPZjd4SHYrYTFVYUhJOXNtdmR0WUZ5ZzRHeVVwQ05GQ3J6YmRTeThsT3cwNVlTVVFOV0Nvb3dKSVxuUnZ0QTZldmYrb0tDSDUyNm12bE9ObzVUWEdhSjkwNEZQMHhBbjBFcExRWDlUMDlBbXlLRG5yUDRHRGZIUlpEVVxuWUExTGZFLzlpb2lmVm5oVzJESktEYTlNWnhSTVdlRTlicGVJTmRmTnFxM0EySmcwbE9nY2RRQUlRZDNZaW9CYVxud2tQMFdkOXdySmZEL2JJNlF6YkhGamI3c2pMNWFKMXdlaWplUTNQYysyNDdRc0xONkJKdXZsQzU5UlRiNXhqV1xuRnYwMnVJeWEwcnVmUVRWR01wb1VkU05mWGwwZ0t4WVY2OWFqbXFOelpTK0JCdFZESVV5TEI3WWlaTVJ5TmQvYlxubU94NW8yWmJBZ01CQUFFQ2dnRUFLbEdNRnFRZkJWYnBPb3A0Sk5DVnhNdW4vWkZGZzBoeDg5ZW5iaThKcWp5VFxub1kwSTY1MlRnWFRCcmo5Q1NjcUpvZ2FWWkZBNmVscHNxUHRxTnZ6L0lRVVpRYmE2QXdqdlJlVDJ6dkxYQUpwRFxuaG92SXpDRWNKTUsrWkpvQXIrUkQ5MlRNS0c3VVhtWU16bXNFS2I1QmUyeWpoT214TWM4Z3VIQzdjMlZnR3VGRVxuaUVqbmpTOTFycXBJUlVvb2M4WXNkUlVMZmkyU0g3dnZBeldoWDE1VGtQNGdMTTRpekw2alNBaFJoK1lmTmVVdlxuK3dEQTFGdEVJN0R5aWVxbTF5T05STi9KMllyNm5GUUl1ZkJTaEpXQm1LdmJhZjIzbXlLN3ZNYy9XNVY4blZ4elxuOHU1RTBQSHg3L2t2Ym5JbWNkUGc0a1Evd29CY3JJMzhhRnBCR0FuSXdRS0JnUUQwMk50cnZNaXUxMEVqcWZYeFxuYi9md051VkI2Rk9PV3pVRnJOZlZXQjh0d2x0Qy9XZFR6dzR2UTdUVlFDU1JkK09KeHVCNTdveDljOG5ZcUFNVVxuM0VkeFJXeWt6OUV4TXBBZis2SHlkaHNRZmZVY0phZHpNcTl6OWZDRkQ1dFdYMmpNbEgzZlVuaWRpOEoyVmtsc1xuYndNTFIzVEdjRWxWT3lrRys2OGQxZUJlZVFLQmdRQys3S3pMUjI1MXlaUFVxanBuc2pydThUTTdBTEplR1J4VFxucUJ0TmpvdzVqQW42dCtyOVdiaUFTYXlaRlFjU2dSdk16SlJ0WWtNdzgxS0VFSkRHWTBLUnlEYkt0REJjRnBYdFxuRnJibnZzdGN1WmkzY2lwSWdDZ1V6Tkh5NE1XRWc0V25LaVlJRFAyUkdTTk9jZGZTNGhwTWZMcDZpYmcwSTJLNVxuNDRKYnBhc21jd0tCZ0hReG1XZDJicEl5aXJJZkRSMG5zclRuaUVLUHUxOWFQejVUT1JZQXZNTWRjZXZIajhxQVxuLzAxRXgwTlFMa3B1WjZmUm5tT2U1a0wrdVBJOVFVRWNERGRmNStBSzAwNlNuVHpnVUlsY3JSbFZmUVYvaFFpeFxuSy94TzRYWno0cGJKcmxVdnZ0QkZOZ0lsK2dIb2p1MkxmUmxVTHNHaE5kdmh1R1djK1F5aW05aVpBb0dBQkNZQVxuV3lwaUxBMEZPVW01bXljMFFKemRFQnNqeFFlbXBlcXhMUzQ3dmNSZE15VnI1YlZkWE93ODQ5YWhJTFhOZE5XOVxuSStOT3NuR1hDV2VTdmJ6S1pZQ0VNRU5hQ2FZeis4TFNscFordExVVHJHaStvblNtYWsxSkFvMy92TEZlNWhMMFxuWUpobnFnOXh4UEtVVGZDN3dZMjBQNVZlZTBPSmthQnY1SzNrMmlFQ2dZRUFxNFdJNmJtTzVhaGNKSTc1QXczV1xuWnZFMW03MkFwTDRZMFB3SEtMTWlsbVp5VVNENGJxK2tmSUF5OUdyai9XUVJva25jZy9reGZudmxRQS9udGJkbFxuc2pnVzQ1ZE9pU1FyYndwSDBUT09NVUcrWDJrMlkzNEZXOUZ1Rlo0OVRLdWFVa0ZWa2QrdGtPWE43TkRyUndDVlxuOXVZL2xRT0YrSGw5M1h2eHJrVitiVzA9XG4tLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tXG4iLCAiY2xpZW50X2VtYWlsIjogImJhY2tlbmQtbGVpdG9yQGltb2JpbGlhcmlhLW12cC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsICJjbGllbnRfaWQiOiAiMTEzOTA1ODQxNTg2MTI0MjAzMjM1IiwgImF1dGhfdXJpIjogImh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbS9vL29hdXRoMi9hdXRoIiwgInRva2VuX3VyaSI6ICJodHRwczovL29hdXRoMi5nb29nbGVhcGlzLmNvbS90b2tlbiIsICJhdXRoX3Byb3ZpZGVyX3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRzIiwgImNsaWVudF94NTA5X2NlcnRfdXJsIjogImh0dHBzOi8vd3d3Lm5vb2dsZWFwaXMuY29tL3JvYm90L3YxL21ldGFkYXRhL3g1MDkvYmFja2VuZC1sZWl0b3IlNDBpbW9iaWxpYXJpYS1tdnAuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAidW5pdmVyc2VfZG9tYWluIjogImdvb2dsZWFwaXMuY29tIn0=";

      const credsReq = JSON.parse(Buffer.from(B64_CREDS, 'base64').toString('utf-8'));

      // Sanitization: Ensure real newlines
      if (credsReq.private_key) {
        credsReq.private_key = credsReq.private_key.replace(/\\n/g, '\n');
      }

      console.log('--- Auth Diagnostics (v41.0 FIX) ---');
      console.log('Email:', credsReq.client_email);

      const { google } = require('googleapis');

      // Use higher-level GoogleAuth
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: credsReq.client_email,
          private_key: credsReq.private_key,
        },
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive.file'
        ],
      });

      const authClient = await auth.getClient();

      // 1. Initialize API Client (for append/write)
      this.sheetsClient = google.sheets({ version: 'v4', auth: authClient });

      // 2. Initialize Doc (for read/getRows)
      if (spreadsheetId) {
        console.log(`ℹ️ Initializing Doc with ID: ${spreadsheetId}`);
        const doc = new GoogleSpreadsheet(spreadsheetId, authClient);
        await doc.loadInfo();
        this.doc = doc;
        console.log(`✅ Google Sheet Doc loaded: "${doc.title}" with keys:`, Object.keys(doc.sheetsByTitle));
      } else {
        console.warn('⚠️ No Spreadsheet ID provided to init(). Read operations (getLeads) will fail if this.doc is unused.');
      }

      console.log('✅ Google Sheets Service initialized.');

    } catch (err) {
      console.error('❌ CRITICAL AUTH ERROR:', err.message);
      if (err.stack) console.error(err.stack);
      throw err;
    }
  }

  _getSheet(title) {
    if (!this.doc) throw new Error('Google Spreadsheet Doc not initialized. Missing SPREADSHEET_ID?');

    let sheet = this.doc.sheetsByTitle[title];
    if (!sheet) {
      console.warn(`Aba "${title}" não encontrada. Tentando "Página1" ou primeira aba.`);
      sheet = this.doc.sheetsByTitle['Página1'] || this.doc.sheetsByTitle['Sheet1'] || this.doc.sheetsByIndex[0];
    }
    if (!sheet) throw new Error(`Não foi possível encontrar uma aba válida (tentado: "${title}", "Página1", índice 0).`);
    return sheet;
  }

  async getLeads() {
    // Falls back to Env ID if not initialized
    await this.init();

    // Safety check
    if (!this.doc) {
      console.error("❌ getLeads failed: this.doc is null. Is SPREADSHEET_ID set?");
      return [];
    }

    const sheet = this._getSheet('leads');

    // Ler linhas
    const rows = await sheet.getRows();
    return rows.map(row => {
      // Robust Getter Helper
      const get = (key) => row.get(key) || row.get(key.charAt(0).toUpperCase() + key.slice(1)) || row.get(key.toUpperCase());

      return {
        id: row._rowNumber,
        nome_do_lead: get('nome_do_lead') || get('Nome do Lead'),
        email: get('email'),
        telefone: get('telefone'),
        imovel: get('imovel') || get('Imóvel') || get('Cód. Imóvel'),
        corretor: get('corretor'),
        etapa_atual: get('etapa_atual') || get('Etapa'),
        data_entrada: get('data_entrada') || get('Data Entrada'),
        data_mudancadeetapa: get('data_mudancadeetapa') || '',
        origem: get('origem'),
        valor: get('valor'),
        tipo: get('tipo')
      };
    });
  }

  async updateLead(rowIndex, data, spreadsheetId) {
    await this.init(spreadsheetId);

    // Safety check for ID
    if (!rowIndex) throw new Error('Row Index is required for update');

    const sheet = this._getSheet('leads');
    const rows = await sheet.getRows();

    // Find row by index (Note: _rowNumber is 1-based, array is 0-based, but google-spreadsheet rows don't map perfectly 1:1 if filtered)
    // Safest way: Find the row object with the matching _rowNumber
    const row = rows.find(r => r._rowNumber === parseInt(rowIndex));

    if (!row) {
      throw new Error(`Lead not found (Row ${rowIndex})`);
    }

    // Check if stage is changing to update timestamp
    if (data.etapa_atual && row.get('etapa_atual') !== data.etapa_atual) {
      const oldStage = row.get('etapa_atual');
      const now = new Date();
      const mudancaData = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(now);

      row.assign({
        etapa_atual: data.etapa_atual,
        data_mudancadeetapa: mudancaData
      });
      console.log(`ℹ️ Stage changed. Updated timestamp: ${mudancaData}`);

      // LOG EVENT: STAGE_CHANGE
      // We use rowIndex as leadId
      await this.logEvent(rowIndex, 'STAGE_CHANGE', JSON.stringify({ from: oldStage, to: data.etapa_atual }), spreadsheetId);
    } else if (data.etapa_atual) {
      // Just update without timestamp change if identical (rare but possible)
      row.assign({ etapa_atual: data.etapa_atual });
    }

    // Update fields if provided in data
    if (data.nome_do_lead) row.assign({ nome_do_lead: data.nome_do_lead });
    if (data.telefone) row.assign({ telefone: data.telefone });
    if (data.imovel) row.assign({ imovel: data.imovel });
    if (data.valor_do_imovel) row.assign({ valor_do_imovel: data.valor_do_imovel });
    if (data.tipo_de_imovel) row.assign({ tipo_de_imovel: data.tipo_de_imovel });
    if (data.origem) row.assign({ origem: data.origem });

    // If updating 'imovel', we don't automatically change stage, but we could.
    // Saving...
    await row.save();
    console.log(`✅ Updated Lead at Row ${rowIndex}`);
    return { success: true };
  }

  async addLead(data, spreadsheetId) {
    // If specific ID passed (SaaS mode), use it. otherwise uses default env ID
    await this.init(spreadsheetId);

    const targetId = spreadsheetId || process.env.GOOGLE_SHEETS_ID;
    if (!targetId) {
      throw new Error('CONFIG_ERROR: Agência sem Planilha Google conectada e sem ID padrão.');
    }

    try {
      // 1. Fetch Spreadsheet Metadata to get the real Sheet Name (avoid "Página1" hardcoding errors)
      const meta = await this.sheetsClient.spreadsheets.get({
        spreadsheetId: targetId
      });

      const firstSheetTitle = meta.data.sheets[0].properties.title;
      console.log(`ℹ️ Detected Key Sheet: "${firstSheetTitle}"`);

      // MAPPING UPDATE: Including all fields
      // Headers: nome_do_lead, telefone, data_entrada, data_mudancadeetapa, etapa_atual, imovel, corretor, origem, valor_do_imovel, tipo_de_imovel

      // Fix Date Timezone (Server is UTC, User is BRT)
      const now = new Date();
      const dataEntrada = data.data_entrada || new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(now);

      const values = [
        [
          data.nome_do_lead,                                          // Col A: nome_do_lead
          data.telefone,                                              // Col B: telefone
          dataEntrada,                                                // Col C: data_entrada (Fixed TZ)
          '',                                                         // Col D: data_mudancadeetapa
          data.etapa_atual || 'Novo Lead',                            // Col E: etapa_atual
          data.imovel || 'Interesse Geral',                           // Col F: imovel
          data.corretor || 'Sistema',                                 // Col G: corretor
          data.origem || 'Manual',                                    // Col H: origem (Dynamic now)
          data.valor_do_imovel || '',                                 // Col I: valor_do_imovel
          data.tipo_de_imovel || ''                                   // Col J: tipo_de_imovel
        ]
      ];

      // Fix range quoting for special characters like 'Página1'
      const safeRange = `'${firstSheetTitle}'!A:F`;

      const response = await this.sheetsClient.spreadsheets.values.append({
        spreadsheetId: targetId,
        range: safeRange, // Fixed
        valueInputOption: 'USER_ENTERED',
        resource: { values },
      });

      // Parse Row ID from formatted response (e.g. "Página1!A10:J10")
      const updatedRange = response.data.updates.updatedRange;
      const match = updatedRange.match(/!A(\d+):/);
      const newRowId = match ? match[1] : null;

      console.log('✅ Lead added successfully via Google Sheets API. New ID:', newRowId);

      if (newRowId) {
        await this.logEvent(newRowId, 'CREATED', JSON.stringify({ corretor: data.corretor, origem: data.origem }), targetId);
      }

      return { ...data, added: true, id: newRowId, response: response.data };
    } catch (error) {
      console.error('❌ Error adding lead via Google Sheets API:', error.message);
      if (error.response) {
        console.error('API Error Details:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }

  async logEvent(leadId, type, metadata = '', spreadsheetId) {
    // Best effort logging - don't crash main flow if logging fails
    try {
      await this.init(spreadsheetId);
      const targetId = spreadsheetId || process.env.GOOGLE_SHEETS_ID;

      // Ensure 'events' sheet exists or use a fallback if possible
      // Using google-spreadsheet for easier row adding
      let doc = this.doc;
      if (!doc && targetId) {
        // Re-init doc if missing
        const { google } = require('googleapis');
        // Assumes this.sheetsClient is auth'd, but doc needs its own init or we utilize sheetsClient
        // For simplicity, we skip complex re-init here as init() should have covered it.
        // If this.doc is null, we can't use node-google-spreadsheet easily.
        console.warn("⚠️ logEvent: this.doc is null. Skipping log.");
        return;
      }

      let sheet = doc.sheetsByTitle['events'];
      if (!sheet) {
        // Try creating it if it doesn't exist? For now, just warn.
        // User needs to create 'events' tab.
        console.warn("⚠️ Aba 'events' não encontrada. Criando...");
        sheet = await doc.addSheet({ title: 'events', headerValues: ['event_id', 'lead_id', 'tipo_evento', 'timestamp', 'metadata'] });
      }

      const timestamp = new Date().toISOString();
      const event_id = `${leadId}_${Date.now()}`;

      await sheet.addRow({
        event_id,
        lead_id: leadId,
        tipo_evento: type,
        timestamp,
        metadata
      });
      console.log(`📝 Logged Event: ${type} for Lead ${leadId}`);

    } catch (err) {
      console.error("⚠️ Failed to log event:", err.message);
    }
  }

  async getEvents() {
    await this.init();
    if (!this.doc) return [];

    const sheet = this.doc.sheetsByTitle['events'];
    if (!sheet) {
      return [];
    }

    const rows = await sheet.getRows();
    return rows.map(row => ({
      event_id: row.get('event_id'),
      lead_id: row.get('lead_id'),
      tipo_evento: row.get('tipo_evento'),
      timestamp: row.get('timestamp'),
      metadata: row.get('metadata')
    }));
  }
}

module.exports = new SheetsService();
