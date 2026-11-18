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
    const proposalId = body.proposalSelection || body.selectedProposalId;
    const comparativeId = body.comparativeId || body.comparativeSelection;
    const proposal = body.proposals && body.proposals[proposalId] || {};
    const comparative = body.proposals && body.proposals[comparativeId] || {};
    const questionHeaders = ['primera_atención','mensaje','atractivo','emociones','otra_emoción','identificación','autenticidad','interés','universidad_publicidad','atractivo_publicidad'];
    const headers = [
      'id','fecha','pieza_id','edad','situación', ...questionHeaders,
      'comparativa_id', ...questionHeaders.map(header => `comparativa_${header}`),
      'selecciones_comparativa'
    ];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    } else if (sheet.getLastColumn() < headers.length) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    const answersFor = answers => [
      answers.firstAttention || '', answers.message || '', answers.attractiveness || '',
      (answers.emotions || []).join(' | '), answers.emotionsOther || '',
      answers.identification || '', answers.authenticity || '', answers.interest || '',
      answers.recentUniversityAd || '', answers.adAttraction || ''
    ];
    sheet.appendRow([
      body.id, body.createdAt, proposalId, body.age, body.situation,
      ...answersFor(proposal), comparativeId, ...answersFor(comparative),
      (comparative.comparativeChoices || []).join(' | ')
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error(error.stack || error);
    throw error;
  }
}
