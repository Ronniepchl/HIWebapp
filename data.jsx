/* data.jsx — data layer for InsureFlow
   The app loads its real data from Google Sheets at runtime (see
   Code-Webapp.gs + window.loadSheetData below). No mock records are
   shipped: window.DATA starts empty and the UI shows skeleton
   placeholders until the live data arrives. */

/* Empty shape so the app renders skeletons (never mock data) before load. */
window.DATA = {
  CUSTOMERS: [],
  LEADS: [],
  AGENTS: [],
  TASKS: [],
  ACTIVITIES: [],
  PRIORITY: [],
  UPCOMING: [],
  SUMMARY: { customers: [], business: [], recruit: [] },
  PREMIUM_TREND: [],
  CEO_FOCUS: null,
  PULSE: null,
  MONTHLY: null,
};

/* Static option lists used by the add/edit forms (not data records). */
window.POLICY_TYPES = ['Whole Life','Whole Life A90','Health','Health Plus','Term Life','Endowment','Motor + Life'];
window.TIERS = ['VIP','Gold','Standard'];

/* ===========================================================
   Live Google Sheets connection
   -----------------------------------------------------------
   Paste the deployed Apps Script Web App URL (ending in /exec)
   from Code-Webapp.gs below.

   window.loadSheetData(onSuccess, onError) fetches the sheet via
   JSONP (a <script> tag) so it works from any static host with
   no CORS configuration on the Apps Script side.
   =========================================================== */
window.SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwAr2_iLrs-9lSPofLQ_TMAXBj0ohh58IpPfz2MzPVju0O9NDpptSxCsXglkZKc9Ea-3w/exec'; // e.g. 'https://script.google.com/macros/s/AKfy.../exec'

window.loadSheetData = function (onSuccess, onError) {
  var url = window.SHEET_WEBAPP_URL;
  if (!url) { if (onError) onError('no-url'); return; }
  var cb = '__ifsheet_' + Date.now();
  var script = document.createElement('script');
  var done = false;
  var timer = setTimeout(function () {
    if (!done) { done = true; cleanup(); if (onError) onError('timeout'); }
  }, 15000);
  function cleanup() {
    clearTimeout(timer);
    try { delete window[cb]; } catch (e) { window[cb] = undefined; }
    if (script.parentNode) script.parentNode.removeChild(script);
  }
  window[cb] = function (data) {
    if (done) return;
    done = true; cleanup();
    if (data && data.error) { if (onError) onError(data.error); }
    else if (onSuccess) onSuccess(data);
  };
  script.onerror = function () {
    if (!done) { done = true; cleanup(); if (onError) onError('script-error'); }
  };
  script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + cb + '&t=' + Date.now();
  document.body.appendChild(script);
};
