/* Aerowave demo page.
 * Loaded synchronously in <head> so ?reset runs before the Salesforce
 * Embedded Messaging bootstrap can read any stored chat session. */
(function () {
  'use strict';

  // Demo helper: ?reset wipes this origin's storage, then reloads clean.
  if (new URLSearchParams(window.location.search).has('reset')) {
    try { window.localStorage.clear(); } catch (e) {}
    try { window.sessionStorage.clear(); } catch (e) {}
    window.location.replace(window.location.pathname + window.location.hash);
    return;
  }

  // Open the Salesforce chat if the widget has loaded. Otherwise do nothing:
  // the widget's own launcher still works once it appears.
  function launchChat() {
    var bootstrap = window.embeddedservice_bootstrap;
    var api = bootstrap && bootstrap.utilAPI;
    if (!api || typeof api.launchChat !== 'function') return;
    try {
      var result = api.launchChat();
      // launchChat returns a Promise that rejects if the chat is busy or already open.
      if (result && typeof result.catch === 'function') result.catch(function () {});
    } catch (e) {}
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    var button = target && target.closest ? target.closest('[data-launch-chat]') : null;
    if (button) launchChat();
  });
})();
