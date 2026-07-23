/**
 * Cymbiotika Quiz — Google Sheet collector (Apps Script Web App)
 * =============================================================================
 * Receives quiz responses + feedback POSTed from the quiz page and appends them
 * as rows to THIS spreadsheet (creates "Responses" and "Feedback" tabs).
 *
 * SETUP (one time):
 *   1. Open the Google Sheet you want the data in.
 *   2. Extensions → Apps Script. Delete any starter code, paste this whole file.
 *   3. Click Deploy → New deployment → (gear) Web app.
 *        - Description: Cymbiotika quiz collector
 *        - Execute as: Me
 *        - Who has access: Anyone
 *      Deploy, authorize when prompted, and COPY the "Web app" URL
 *      (looks like https://script.google.com/macros/s/AKfyc.../exec).
 *   4. Send that URL back so it can be wired into the quiz build.
 *
 * To update the code later, re-Deploy → Manage deployments → Edit → Version: New.
 */

var RESPONSE_FIELDS = [
  "submission_id", "timestamp", "email",
  "focus", "wishlist", "feeling", "barriers", "experience",
  "routine_now", "flags", "commitment", "begin", "mindset",
  "dd_energy", "dd_gut", "dd_stress", "dd_beauty", "dd_other"
];
var FEEDBACK_FIELDS = ["submission_id", "timestamp", "email", "rating", "ease", "comment"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // avoid two submissions clobbering each other
  try {
    var data = JSON.parse(e.postData.contents);
    if ((data.type || "response") === "feedback") {
      appendRow("Feedback", FEEDBACK_FIELDS, data);
    } else {
      appendRow("Responses", RESPONSE_FIELDS, data);
    }
    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Lets you sanity-check the deployment by opening the URL in a browser.
// The `version` confirms the LATEST code is actually live after redeploying.
function doGet() {
  return jsonOut({ ok: true, version: "email-v2", message: "Cymbiotika quiz collector is running." });
}

function appendRow(sheetName, fields, data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(fields);
    sheet.getRange(1, 1, 1, fields.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  } else {
    // Self-heal the header row if the schema changed (e.g. name -> email).
    var lastCol = sheet.getLastColumn();
    var header = lastCol ? sheet.getRange(1, 1, 1, Math.max(lastCol, fields.length)).getValues()[0] : [];
    var mismatch = fields.some(function (f, i) { return header[i] !== f; });
    if (mismatch) {
      sheet.getRange(1, 1, 1, fields.length).setValues([fields]).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  }
  var row = fields.map(function (k) {
    var v = data[k];
    if (v === undefined || v === null) return "";
    if (Object.prototype.toString.call(v) === "[object Array]") return v.join("; ");
    return v;
  });
  sheet.appendRow(row);
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
