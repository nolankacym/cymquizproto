/**
 * Cymbiotika Quiz — Google Sheet collector (Apps Script Web App)
 * =============================================================================
 * Appends quiz responses + feedback (POSTed from the quiz page) to this
 * spreadsheet's "Responses" and "Feedback" tabs.
 *
 * SCHEMA-ADAPTIVE: columns are driven by the data that arrives. Known fields
 * use the PREFERRED order below; any NEW field the quiz starts sending is
 * appended as a new column automatically — so you never have to redeploy this
 * script again when the quiz's fields change.
 *
 * SETUP (one time):
 *   1. Open the Google Sheet → Extensions → Apps Script. Replace all code with
 *      this file and Save (⌘/Ctrl-S).
 *   2. Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy
 *      (or New deployment → Web app, Execute as: Me, Access: Anyone).
 *   3. Confirm by opening the /exec URL — it should report version "v3".
 */

var VERSION = "v3";

// Preferred leading column order per tab. Anything not listed is appended.
var PREFERRED = {
  Responses: [
    "submission_id", "timestamp", "name", "email",
    "focus", "wishlist", "feeling", "barriers", "experience",
    "routine_now", "flags", "commitment", "begin", "mindset",
    "dd_energy", "dd_gut", "dd_stress", "dd_beauty", "dd_other"
  ],
  Feedback: ["submission_id", "timestamp", "name", "email", "rating", "ease", "comment"]
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var data = JSON.parse(e.postData.contents);
    var sheetName = (data.type === "feedback") ? "Feedback" : "Responses";
    delete data.type;
    writeRow(sheetName, data);
    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return jsonOut({ ok: true, version: VERSION, message: "Cymbiotika quiz collector is running." });
}

function writeRow(sheetName, data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

  var hasHeader = sheet.getLastRow() > 0 && sheet.getLastColumn() > 0;
  var header = hasHeader ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].filter(String) : [];

  // Desired header = existing header, seeded/extended with preferred order, then
  // any brand-new keys from this payload (so new fields never get dropped).
  var desired = header.slice();
  var add = function (k) { if (k && desired.indexOf(k) === -1) desired.push(k); };
  (PREFERRED[sheetName] || []).forEach(add);
  Object.keys(data).forEach(add);

  var changed = desired.length !== header.length || desired.some(function (h, i) { return h !== header[i]; });
  if (changed) {
    sheet.getRange(1, 1, 1, desired.length).setValues([desired]).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  var row = desired.map(function (k) {
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
