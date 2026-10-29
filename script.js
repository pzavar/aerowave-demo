/* Aerowave demo page.
 * Loaded synchronously in <head> so the ?reset check registers its listener
 * before the Salesforce Embedded Messaging bootstrap fires its ready event. */
(function () {
  'use strict';

  // The widget mirrors its session into Salesforce's own iframe and copies it
  // back on load, so wiping this origin's storage doesn't start a new chat.
  // clearSession(true) ends the conversation server-side and clears both
  // copies, then rebuilds the widget. It only works after the ready event.
  var clearing = false;

  function clearChatSession() {
    var bootstrap = window.embeddedservice_bootstrap;
    var api = bootstrap && bootstrap.userVerificationAPI;
    if (clearing || !api || typeof api.clearSession !== 'function') return null;
    clearing = true;
    var done = function () { clearing = false; };
    // The promise only settles once the widget's iframe answers, so don't let
    // a lost reply block the next reset.
    setTimeout(done, 10000);
    try {
      return Promise.resolve(api.clearSession(true)).then(done, done);
    } catch (e) {
      done();
      return null;
    }
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

  // End the current chat and open a fresh one, the same way the widget's
  // own reset-and-relaunch does.
  function startNewChat() {
    var cleared = clearChatSession();
    if (cleared) cleared.then(launchChat);
  }

  // Demo helper: ?reset ends any existing chat once the widget is ready, then
  // drops the parameter from the address bar.
  if (new URLSearchParams(window.location.search).has('reset')) {
    window.addEventListener('onEmbeddedMessagingReady', function onReady() {
      // Clearing re-fires the ready event, so stop listening first.
      window.removeEventListener('onEmbeddedMessagingReady', onReady);
      clearChatSession();
    });
    try {
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    } catch (e) {}
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    var button = target && target.closest ? target.closest('[data-launch-chat]') : null;
    if (button) launchChat();
  });

  // Demo helper: Alt+Shift+N (Option+Shift+N on Mac) ends the chat and opens
  // a new one. Keys typed inside the chat window don't reach this page, so
  // click the page first.
  document.addEventListener('keydown', function (event) {
    if (event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey && event.code === 'KeyN') {
      event.preventDefault();
      startNewChat();
    }
  });
})();
