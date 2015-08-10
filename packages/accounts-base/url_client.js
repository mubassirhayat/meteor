var Ap = AccountsClient.prototype;

// All of the special hash URLs we support for accounts interactions
var accountsPaths = ["reset-password", "verify-email", "enroll-account"];

var savedHash = window.location.hash;

Ap._initUrlMatching = function () {
  // By default, allow the autologin process to happen.
  this._autoLoginEnabled = true;

  // We only support one callback per URL.
  this._accountsCallbacks = {};

  // Try to match the saved value of window.location.hash.
  this._attemptToMatchHash();
};

// Separate out this functionality for testing

Ap._attemptToMatchHash = function () {
  attemptToMatchHash(this, savedHash, defaultSuccessHandler);
};

// Note that both arguments are optional and are currently only passed by
// accounts_url_tests.js.
function attemptToMatchHash(accounts, hash, success) {
  _.each(accountsPaths, function (urlPart) {
    var token;

    var tokenRegex = new RegExp("^\\#\\/" + urlPart + "\\/(.*)$");
    var match = hash.match(tokenRegex);

    if (match) {
      token = match[1];

      // XXX COMPAT WITH 0.9.3
      if (urlPart === "reset-password") {
        accounts._resetPasswordToken = token;
      } else if (urlPart === "verify-email") {
        accounts._verifyEmailToken = token;
      } else if (urlPart === "enroll-account") {
        accounts._enrollAccountToken = token;
      }
    } else {
      return;
    }

    // If no handlers match the hash, then maybe it's meant to be consumed
    // by some entirely different code, so we only clear it the first time
    // a handler successfully matches. Note that later handlers reuse the
    // savedHash, so clearing window.location.hash here will not interfere
    // with their needs.
    window.location.hash = "";

    // Do some stuff with the token we matched
    success.call(accounts, token, urlPart);
  });
}

function defaultSuccessHandler(token, urlPart) {
  var self = this;

  // put login in a suspended state to wait for the interaction to finish
  self._autoLoginEnabled = false;

  // wait for other packages to register callbacks
  Meteor.startup(function () {
    // if a callback has been registered for this kind of token, call it
    if (self._accountsCallbacks[urlPart]) {
      self._accountsCallbacks[urlPart](token, function () {
        self._enableAutoLogin();
      });
    }
  });
}

// Export for testing
AccountsTest = {
  attemptToMatchHash: function (hash, success) {
    return attemptToMatchHash(Accounts, hash, success);
  }
};

// XXX these should be moved to accounts-password eventually. Right now
// this is prevented by the need to set autoLoginEnabled=false, but in
// some bright future we won't need to do that anymore.

// Documentation for this method can be found in accounts_client.js.
Ap.onResetPasswordLink = function (callback) {
  if (this._accountsCallbacks["reset-password"]) {
    Meteor._debug("Accounts.onResetPasswordLink was called more than once. " +
      "Only one callback added will be executed.");
  }

  this._accountsCallbacks["reset-password"] = callback;
};

// Documentation for this method can be found in accounts_client.js.
Ap.onEmailVerificationLink = function (callback) {
  if (this._accountsCallbacks["verify-email"]) {
    Meteor._debug("Accounts.onEmailVerificationLink was called more than once. " +
      "Only one callback added will be executed.");
  }

  this._accountsCallbacks["verify-email"] = callback;
};

// Documentation for this method can be found in accounts_client.js.
Ap.onEnrollmentLink = function (callback) {
  if (this._accountsCallbacks["enroll-account"]) {
    Meteor._debug("Accounts.onEnrollmentLink was called more than once. " +
      "Only one callback added will be executed.");
  }

  this._accountsCallbacks["enroll-account"] = callback;
};
