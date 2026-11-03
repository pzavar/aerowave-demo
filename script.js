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

  // The widget's API exists before it's usable: launchChat rejects until the
  // ready event fires. Track that so an early click can wait for it.
  var ready = false;
  var launchQueued = false;
  var resetCleared = null;

  // Open the Salesforce chat if the widget has loaded. Otherwise do nothing:
  // the widget's own launcher still works once it appears.
  function launchChat() {
    var bootstrap = window.embeddedservice_bootstrap;
    var api = bootstrap && bootstrap.utilAPI;
    if (!api || typeof api.launchChat !== 'function') return null;
    try {
      // launchChat returns a Promise that rejects if the chat is busy or already open.
      return Promise.resolve(api.launchChat()).catch(function () {});
    } catch (e) {
      return null;
    }
  }

  function setBusy(selector, busy) {
    var buttons = document.querySelectorAll(selector);
    for (var i = 0; i < buttons.length; i++) {
      if (busy) buttons[i].setAttribute('aria-busy', 'true');
      else buttons[i].removeAttribute('aria-busy');
    }
  }

  // Salesforce takes a few seconds to start a conversation before the chat
  // window appears, so show the buttons as busy until it does. A click before
  // the widget is ready opens the chat once it is, instead of being dropped.
  function openChat() {
    var idle = function () { setBusy('[data-launch-chat]', false); };
    setBusy('[data-launch-chat]', true);
    // launchChat never settles if Salesforce never answers, and the widget
    // may never load, so don't leave the buttons busy forever.
    setTimeout(function () {
      launchQueued = false;
      idle();
    }, 20000);
    if (!ready) {
      launchQueued = true;
      return;
    }
    var launched = launchChat();
    if (launched) launched.then(idle, idle);
    else idle();
  }

  function flushQueuedLaunch() {
    if (!launchQueued) return;
    launchQueued = false;
    var idle = function () { setBusy('[data-launch-chat]', false); };
    // With ?reset, open the fresh chat once the old one has been cleared.
    Promise.resolve(resetCleared).then(launchChat).then(idle, idle);
  }

  // End the current chat and open a fresh one, the same way the widget's
  // own reset-and-relaunch does.
  function startNewChat() {
    var cleared = clearChatSession();
    if (!cleared) return;
    setBusy('[data-new-chat]', true);
    var idle = function () { setBusy('[data-new-chat]', false); };
    // If Salesforce never answers, launchChat never settles. Re-enable the
    // button anyway so it can be tried again.
    setTimeout(idle, 20000);
    cleared.then(launchChat).then(idle, idle);
  }

  // Demo helper: ?reset ends any existing chat once the widget is ready, then
  // drops the parameter from the address bar.
  if (new URLSearchParams(window.location.search).has('reset')) {
    window.addEventListener('onEmbeddedMessagingReady', function onReady() {
      // Clearing re-fires the ready event, so stop listening first.
      window.removeEventListener('onEmbeddedMessagingReady', onReady);
      resetCleared = clearChatSession();
    });
    try {
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    } catch (e) {}
  }

  // Registered after the ?reset listener so a reset starts before a queued
  // launch. The event fires again after each clear; ready stays true.
  window.addEventListener('onEmbeddedMessagingReady', function () {
    ready = true;
    flushQueuedLaunch();
  });

  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    if (target.closest('[data-launch-chat]')) openChat();
    else if (target.closest('[data-new-chat]')) startNewChat();
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
