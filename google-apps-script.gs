/**
 * Endpoint opcional para recibir respuestas en Google Sheets.
 * 1. Crea una hoja de cálculo y copia su ID desde la URL.
 * 2. En Apps Script, pega este archivo y sustituye SHEET_ID.
 * 3. Implementa > Nueva implementación > Aplicación web.
 *    Ejecutar como: yo | Quién tiene acceso: cualquiera.
 * 4. Copia la URL de la implementación en index.html antes de app.js:
 *    <script>window.UVP_ENDPOINT = 'TU_URL';</script>
 */
const SHEET_ID = '1j-MHNZhJbBRTqt0ocC4KMhIe4PDyenBoeKKKiEhqeoE';
const SHEET_NAME = 'Respuestas';

function doGet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME)
      || spreadsheet.insertSheet(SHEET_NAME);
    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      spreadsheet: spreadsheet.getName(),
      sheet: sheet.getName(),
      rows: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error(error.stack || error);
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: String(error)
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME)
      || SpreadsheetApp.openById(SHEET_ID).insertSheet(SHEET_NAME);
    const proposal = body.proposals && body.proposals[body.selectedProposalId] || {};
    const headers = ['id','fecha','pieza_id','edad','situación','primera_atención','mensaje','atractivo','emociones','identificación','autenticidad','interés','mejoras','comparación'];
    if (sheet.getLastRow() === 0) sheet.appendRow(headers);
    sheet.appendRow([
      body.id, body.createdAt, body.selectedProposalId, body.age, body.situation, proposal.firstAttention,
      proposal.message, proposal.attractiveness, (proposal.emotions || []).join(' | '),
      proposal.identification, proposal.authenticity, proposal.interest,
      proposal.improvement, proposal.comparison
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error(error.stack || error);
    throw error;
  }
}
