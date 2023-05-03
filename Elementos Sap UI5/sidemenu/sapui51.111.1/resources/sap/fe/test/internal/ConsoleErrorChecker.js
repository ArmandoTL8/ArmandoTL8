/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  function wrapPatterns(pattern) {
    if (pattern instanceof RegExp) {
      return message => message.match(pattern) !== null;
    } else {
      return message => message.includes(pattern);
    }
  }

  /**
   * List of error message patterns that are always accepted.
   */
  const GLOBALLY_ACCEPTED_ERRORS = ["failed to load JavaScript resource: sap/esh/search/ui/i18n.js" // shell
  ].map(wrapPatterns);
  let ConsoleErrorChecker = /*#__PURE__*/function () {
    function ConsoleErrorChecker(window) {
      this.matchers = [];
      this.messages = [];
      this.observer = new MutationObserver(mutations => {
        const opaFrame = mutations.reduce((iFrame, mutation) => {
          if (iFrame !== null) {
            return iFrame;
          }
          for (const node of Array.from(mutation.addedNodes)) {
            if (node instanceof Element) {
              const element = node.querySelector("#OpaFrame");
              if (element instanceof HTMLIFrameElement && element.contentWindow) {
                return element;
              }
            }
          }
          return iFrame;
        }, null);
        if (opaFrame && opaFrame.contentWindow) {
          this.prepareWindow(opaFrame.contentWindow);
        }
      });
      QUnit.moduleStart(() => {
        this.observer.observe(window.document.body, {
          childList: true
        });
      });
      QUnit.moduleDone(() => {
        this.observer.disconnect();
      });
      QUnit.testStart(() => {
        this.reset();
      });
      QUnit.log(() => {
        this.handleFailedMessages();
      });
      this.karma = window.__karma__;

      // either go for Karma config option "ui5.config.strictConsoleErrors" or use URL query parameter "strict"
      const search = new URLSearchParams(window.location.search);
      const urlParam = search.get("strictConsoleErrors");
      if (urlParam !== null) {
        this.isStrict = urlParam === "true";
      } else {
        var _this$karma, _this$karma$config$ui;
        this.isStrict = ((_this$karma = this.karma) === null || _this$karma === void 0 ? void 0 : (_this$karma$config$ui = _this$karma.config.ui5) === null || _this$karma$config$ui === void 0 ? void 0 : _this$karma$config$ui.config.strictconsoleerrors) ?? false;
      }
      this.reset();
    }
    var _proto = ConsoleErrorChecker.prototype;
    _proto.handleFailedMessages = function handleFailedMessages() {
      const failedMessages = this.messages;
      this.messages = [];
      if (failedMessages.length > 0) {
        QUnit.assert.pushResult({
          result: false,
          source: "FE Console Log Check",
          message: `There were ${failedMessages.length} unexpected console errors`,
          actual: failedMessages,
          expected: []
        });
      }
    };
    _proto.reset = function reset() {
      this.messages = [];

      // this sets the default to apply if no allowed patterns are set via setAcceptedErrorPatterns().
      if (this.isStrict) {
        this.matchers = GLOBALLY_ACCEPTED_ERRORS;
      } else {
        this.matchers = [() => true];
      }
    };
    _proto.setAcceptedErrorPatterns = function setAcceptedErrorPatterns(patterns) {
      if (!patterns || patterns.length === 0) {
        this.matchers = GLOBALLY_ACCEPTED_ERRORS;
      } else {
        this.matchers = patterns.map(wrapPatterns).concat(GLOBALLY_ACCEPTED_ERRORS);
      }
    };
    _proto.checkAndLog = function checkAndLog(type) {
      for (var _len = arguments.length, data = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        data[_key - 1] = arguments[_key];
      }
      // only check the error messages
      if (type === "error") {
        const messageText = data[0];
        const isAllowed = this.matchers.some(matcher => matcher(messageText));
        if (!isAllowed) {
          this.messages.push(messageText);
        }
      }
      if (this.karma) {
        // wrap the data to facilitate parsing in the backend
        const wrappedData = data.map(d => [d]);
        this.karma.log(type, wrappedData);
      }
    };
    _proto.prepareWindow = function prepareWindow(window) {
      var _this = this;
      const console = window.console;

      // capture console.log(), console.debug(), etc.
      const patchConsoleMethod = method => {
        const fnOriginal = console[method];
        console[method] = function () {
          for (var _len2 = arguments.length, data = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            data[_key2] = arguments[_key2];
          }
          _this.checkAndLog(method, ...data);
          return fnOriginal.apply(console, data);
        };
      };
      patchConsoleMethod("log");
      patchConsoleMethod("debug");
      patchConsoleMethod("info");
      patchConsoleMethod("warn");
      patchConsoleMethod("error");

      // capture console.assert()
      // see https://console.spec.whatwg.org/#assert
      console.assert = function () {
        let condition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        if (condition) {
          return;
        }
        const message = "Assertion failed";
        for (var _len3 = arguments.length, data = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          data[_key3 - 1] = arguments[_key3];
        }
        if (data.length === 0) {
          data.push(message);
        } else {
          let first = data[0];
          if (typeof first !== "string") {
            data.unshift(message);
          } else {
            first = `${message}: ${first}`;
            data[0] = first;
          }
        }
        console.error(...data);
      };

      // capture errors
      function onPromiseRejection(event) {
        var _event$reason;
        const message = `UNHANDLED PROMISE REJECTION: ${event.reason}`;
        this.checkAndLog("error", message, (_event$reason = event.reason) === null || _event$reason === void 0 ? void 0 : _event$reason.stack);
      }
      function onError(event) {
        const message = event.message;
        this.checkAndLog("error", message, event.filename);
      }
      window.addEventListener("error", onError.bind(this), {
        passive: true
      });
      window.addEventListener("unhandledrejection", onPromiseRejection.bind(this), {
        passive: true
      });
    };
    ConsoleErrorChecker.getInstance = function getInstance(window) {
      // the global instance is needed to support multiple tests in a row (in Karma)
      if (!window.sapFEConsoleErrorChecker) {
        window.sapFEConsoleErrorChecker = new ConsoleErrorChecker(window);
      }
      return window.sapFEConsoleErrorChecker;
    };
    return ConsoleErrorChecker;
  }();
  return ConsoleErrorChecker.getInstance(window);
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ3cmFwUGF0dGVybnMiLCJwYXR0ZXJuIiwiUmVnRXhwIiwibWVzc2FnZSIsIm1hdGNoIiwiaW5jbHVkZXMiLCJHTE9CQUxMWV9BQ0NFUFRFRF9FUlJPUlMiLCJtYXAiLCJDb25zb2xlRXJyb3JDaGVja2VyIiwid2luZG93IiwibWF0Y2hlcnMiLCJtZXNzYWdlcyIsIm9ic2VydmVyIiwiTXV0YXRpb25PYnNlcnZlciIsIm11dGF0aW9ucyIsIm9wYUZyYW1lIiwicmVkdWNlIiwiaUZyYW1lIiwibXV0YXRpb24iLCJub2RlIiwiQXJyYXkiLCJmcm9tIiwiYWRkZWROb2RlcyIsIkVsZW1lbnQiLCJlbGVtZW50IiwicXVlcnlTZWxlY3RvciIsIkhUTUxJRnJhbWVFbGVtZW50IiwiY29udGVudFdpbmRvdyIsInByZXBhcmVXaW5kb3ciLCJRVW5pdCIsIm1vZHVsZVN0YXJ0Iiwib2JzZXJ2ZSIsImRvY3VtZW50IiwiYm9keSIsImNoaWxkTGlzdCIsIm1vZHVsZURvbmUiLCJkaXNjb25uZWN0IiwidGVzdFN0YXJ0IiwicmVzZXQiLCJsb2ciLCJoYW5kbGVGYWlsZWRNZXNzYWdlcyIsImthcm1hIiwiX19rYXJtYV9fIiwic2VhcmNoIiwiVVJMU2VhcmNoUGFyYW1zIiwibG9jYXRpb24iLCJ1cmxQYXJhbSIsImdldCIsImlzU3RyaWN0IiwiY29uZmlnIiwidWk1Iiwic3RyaWN0Y29uc29sZWVycm9ycyIsImZhaWxlZE1lc3NhZ2VzIiwibGVuZ3RoIiwiYXNzZXJ0IiwicHVzaFJlc3VsdCIsInJlc3VsdCIsInNvdXJjZSIsImFjdHVhbCIsImV4cGVjdGVkIiwic2V0QWNjZXB0ZWRFcnJvclBhdHRlcm5zIiwicGF0dGVybnMiLCJjb25jYXQiLCJjaGVja0FuZExvZyIsInR5cGUiLCJkYXRhIiwibWVzc2FnZVRleHQiLCJpc0FsbG93ZWQiLCJzb21lIiwibWF0Y2hlciIsInB1c2giLCJ3cmFwcGVkRGF0YSIsImQiLCJjb25zb2xlIiwicGF0Y2hDb25zb2xlTWV0aG9kIiwibWV0aG9kIiwiZm5PcmlnaW5hbCIsImFwcGx5IiwiY29uZGl0aW9uIiwiZmlyc3QiLCJ1bnNoaWZ0IiwiZXJyb3IiLCJvblByb21pc2VSZWplY3Rpb24iLCJldmVudCIsInJlYXNvbiIsInN0YWNrIiwib25FcnJvciIsImZpbGVuYW1lIiwiYWRkRXZlbnRMaXN0ZW5lciIsImJpbmQiLCJwYXNzaXZlIiwiZ2V0SW5zdGFuY2UiLCJzYXBGRUNvbnNvbGVFcnJvckNoZWNrZXIiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNvbnNvbGVFcnJvckNoZWNrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBCcm93c2VyQ29uc29sZUxvZ09wdGlvbnMgfSBmcm9tIFwia2FybWFcIjtcblxudHlwZSBNZXNzYWdlTWF0Y2hlckZ1bmN0aW9uID0gKG1lc3NhZ2U6IHN0cmluZykgPT4gYm9vbGVhbjtcbnR5cGUgS2FybWEgPSB7XG5cdGxvZzogKGxldmVsOiBCcm93c2VyQ29uc29sZUxvZ09wdGlvbnNbXCJsZXZlbFwiXSwgLi4uZGF0YTogYW55W10pID0+IHZvaWQ7XG5cdGNvbmZpZzoge1xuXHRcdHVpNT86IHtcblx0XHRcdGNvbmZpZzoge1xuXHRcdFx0XHRzdHJpY3Rjb25zb2xlZXJyb3JzPzogYm9vbGVhbjsgLy8gS2FybWEgb3B0aW9ucyBhcmUgYWxsIGxvd2VyY2FzZSBhdCBydW50aW1lIVxuXHRcdFx0fTtcblx0XHR9O1xuXHR9O1xufTtcblxuZnVuY3Rpb24gd3JhcFBhdHRlcm5zKHBhdHRlcm46IFJlZ0V4cCB8IHN0cmluZyk6IE1lc3NhZ2VNYXRjaGVyRnVuY3Rpb24ge1xuXHRpZiAocGF0dGVybiBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuXHRcdHJldHVybiAobWVzc2FnZSkgPT4gbWVzc2FnZS5tYXRjaChwYXR0ZXJuKSAhPT0gbnVsbDtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gKG1lc3NhZ2UpID0+IG1lc3NhZ2UuaW5jbHVkZXMocGF0dGVybik7XG5cdH1cbn1cblxuLyoqXG4gKiBMaXN0IG9mIGVycm9yIG1lc3NhZ2UgcGF0dGVybnMgdGhhdCBhcmUgYWx3YXlzIGFjY2VwdGVkLlxuICovXG5jb25zdCBHTE9CQUxMWV9BQ0NFUFRFRF9FUlJPUlMgPSBbXG5cdFwiZmFpbGVkIHRvIGxvYWQgSmF2YVNjcmlwdCByZXNvdXJjZTogc2FwL2VzaC9zZWFyY2gvdWkvaTE4bi5qc1wiIC8vIHNoZWxsXG5dLm1hcCh3cmFwUGF0dGVybnMpO1xuXG5jbGFzcyBDb25zb2xlRXJyb3JDaGVja2VyIHtcblx0cHJpdmF0ZSBtYXRjaGVyczogTWVzc2FnZU1hdGNoZXJGdW5jdGlvbltdID0gW107XG5cdHByaXZhdGUgbWVzc2FnZXM6IHN0cmluZ1tdID0gW107XG5cdHByaXZhdGUgcmVhZG9ubHkga2FybWE6IEthcm1hIHwgdW5kZWZpbmVkO1xuXHRwcml2YXRlIHJlYWRvbmx5IGlzU3RyaWN0OiBib29sZWFuO1xuXG5cdHByaXZhdGUgcmVhZG9ubHkgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zKSA9PiB7XG5cdFx0Y29uc3Qgb3BhRnJhbWUgPSBtdXRhdGlvbnMucmVkdWNlKChpRnJhbWU6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCwgbXV0YXRpb246IE11dGF0aW9uUmVjb3JkKSA9PiB7XG5cdFx0XHRpZiAoaUZyYW1lICE9PSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiBpRnJhbWU7XG5cdFx0XHR9XG5cblx0XHRcdGZvciAoY29uc3Qgbm9kZSBvZiBBcnJheS5mcm9tKG11dGF0aW9uLmFkZGVkTm9kZXMpKSB7XG5cdFx0XHRcdGlmIChub2RlIGluc3RhbmNlb2YgRWxlbWVudCkge1xuXHRcdFx0XHRcdGNvbnN0IGVsZW1lbnQgPSBub2RlLnF1ZXJ5U2VsZWN0b3IoXCIjT3BhRnJhbWVcIik7XG5cdFx0XHRcdFx0aWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSUZyYW1lRWxlbWVudCAmJiBlbGVtZW50LmNvbnRlbnRXaW5kb3cpIHtcblx0XHRcdFx0XHRcdHJldHVybiBlbGVtZW50O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gaUZyYW1lO1xuXHRcdH0sIG51bGwpO1xuXG5cdFx0aWYgKG9wYUZyYW1lICYmIG9wYUZyYW1lLmNvbnRlbnRXaW5kb3cpIHtcblx0XHRcdHRoaXMucHJlcGFyZVdpbmRvdyhvcGFGcmFtZS5jb250ZW50V2luZG93KTtcblx0XHR9XG5cdH0pO1xuXG5cdGNvbnN0cnVjdG9yKHdpbmRvdzogV2luZG93ICYgeyBfX2thcm1hX18/OiBLYXJtYSB9KSB7XG5cdFx0UVVuaXQubW9kdWxlU3RhcnQoKCkgPT4ge1xuXHRcdFx0dGhpcy5vYnNlcnZlci5vYnNlcnZlKHdpbmRvdy5kb2N1bWVudC5ib2R5LCB7IGNoaWxkTGlzdDogdHJ1ZSB9KTtcblx0XHR9KTtcblxuXHRcdFFVbml0Lm1vZHVsZURvbmUoKCkgPT4ge1xuXHRcdFx0dGhpcy5vYnNlcnZlci5kaXNjb25uZWN0KCk7XG5cdFx0fSk7XG5cblx0XHRRVW5pdC50ZXN0U3RhcnQoKCkgPT4ge1xuXHRcdFx0dGhpcy5yZXNldCgpO1xuXHRcdH0pO1xuXG5cdFx0UVVuaXQubG9nKCgpID0+IHtcblx0XHRcdHRoaXMuaGFuZGxlRmFpbGVkTWVzc2FnZXMoKTtcblx0XHR9KTtcblxuXHRcdHRoaXMua2FybWEgPSB3aW5kb3cuX19rYXJtYV9fO1xuXG5cdFx0Ly8gZWl0aGVyIGdvIGZvciBLYXJtYSBjb25maWcgb3B0aW9uIFwidWk1LmNvbmZpZy5zdHJpY3RDb25zb2xlRXJyb3JzXCIgb3IgdXNlIFVSTCBxdWVyeSBwYXJhbWV0ZXIgXCJzdHJpY3RcIlxuXHRcdGNvbnN0IHNlYXJjaCA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG5cdFx0Y29uc3QgdXJsUGFyYW0gPSBzZWFyY2guZ2V0KFwic3RyaWN0Q29uc29sZUVycm9yc1wiKTtcblx0XHRpZiAodXJsUGFyYW0gIT09IG51bGwpIHtcblx0XHRcdHRoaXMuaXNTdHJpY3QgPSB1cmxQYXJhbSA9PT0gXCJ0cnVlXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuaXNTdHJpY3QgPSB0aGlzLmthcm1hPy5jb25maWcudWk1Py5jb25maWcuc3RyaWN0Y29uc29sZWVycm9ycyA/PyBmYWxzZTtcblx0XHR9XG5cblx0XHR0aGlzLnJlc2V0KCk7XG5cdH1cblxuXHRwcml2YXRlIGhhbmRsZUZhaWxlZE1lc3NhZ2VzKCkge1xuXHRcdGNvbnN0IGZhaWxlZE1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlcztcblx0XHR0aGlzLm1lc3NhZ2VzID0gW107XG5cblx0XHRpZiAoZmFpbGVkTWVzc2FnZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0UVVuaXQuYXNzZXJ0LnB1c2hSZXN1bHQoe1xuXHRcdFx0XHRyZXN1bHQ6IGZhbHNlLFxuXHRcdFx0XHRzb3VyY2U6IFwiRkUgQ29uc29sZSBMb2cgQ2hlY2tcIixcblx0XHRcdFx0bWVzc2FnZTogYFRoZXJlIHdlcmUgJHtmYWlsZWRNZXNzYWdlcy5sZW5ndGh9IHVuZXhwZWN0ZWQgY29uc29sZSBlcnJvcnNgLFxuXHRcdFx0XHRhY3R1YWw6IGZhaWxlZE1lc3NhZ2VzLFxuXHRcdFx0XHRleHBlY3RlZDogW11cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVzZXQoKSB7XG5cdFx0dGhpcy5tZXNzYWdlcyA9IFtdO1xuXG5cdFx0Ly8gdGhpcyBzZXRzIHRoZSBkZWZhdWx0IHRvIGFwcGx5IGlmIG5vIGFsbG93ZWQgcGF0dGVybnMgYXJlIHNldCB2aWEgc2V0QWNjZXB0ZWRFcnJvclBhdHRlcm5zKCkuXG5cdFx0aWYgKHRoaXMuaXNTdHJpY3QpIHtcblx0XHRcdHRoaXMubWF0Y2hlcnMgPSBHTE9CQUxMWV9BQ0NFUFRFRF9FUlJPUlM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubWF0Y2hlcnMgPSBbKCkgPT4gdHJ1ZV07XG5cdFx0fVxuXHR9XG5cblx0c2V0QWNjZXB0ZWRFcnJvclBhdHRlcm5zKHBhdHRlcm5zPzogKFJlZ0V4cCB8IHN0cmluZylbXSkge1xuXHRcdGlmICghcGF0dGVybnMgfHwgcGF0dGVybnMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHR0aGlzLm1hdGNoZXJzID0gR0xPQkFMTFlfQUNDRVBURURfRVJST1JTO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLm1hdGNoZXJzID0gcGF0dGVybnMubWFwKHdyYXBQYXR0ZXJucykuY29uY2F0KEdMT0JBTExZX0FDQ0VQVEVEX0VSUk9SUyk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBjaGVja0FuZExvZyh0eXBlOiBCcm93c2VyQ29uc29sZUxvZ09wdGlvbnNbXCJsZXZlbFwiXSwgLi4uZGF0YTogYW55W10pIHtcblx0XHQvLyBvbmx5IGNoZWNrIHRoZSBlcnJvciBtZXNzYWdlc1xuXHRcdGlmICh0eXBlID09PSBcImVycm9yXCIpIHtcblx0XHRcdGNvbnN0IG1lc3NhZ2VUZXh0ID0gZGF0YVswXTtcblx0XHRcdGNvbnN0IGlzQWxsb3dlZCA9IHRoaXMubWF0Y2hlcnMuc29tZSgobWF0Y2hlcikgPT4gbWF0Y2hlcihtZXNzYWdlVGV4dCkpO1xuXHRcdFx0aWYgKCFpc0FsbG93ZWQpIHtcblx0XHRcdFx0dGhpcy5tZXNzYWdlcy5wdXNoKG1lc3NhZ2VUZXh0KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAodGhpcy5rYXJtYSkge1xuXHRcdFx0Ly8gd3JhcCB0aGUgZGF0YSB0byBmYWNpbGl0YXRlIHBhcnNpbmcgaW4gdGhlIGJhY2tlbmRcblx0XHRcdGNvbnN0IHdyYXBwZWREYXRhID0gZGF0YS5tYXAoKGQpID0+IFtkXSk7XG5cdFx0XHR0aGlzLmthcm1hLmxvZyh0eXBlLCB3cmFwcGVkRGF0YSk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBwcmVwYXJlV2luZG93KHdpbmRvdzogV2luZG93KSB7XG5cdFx0Y29uc3QgY29uc29sZTogQ29uc29sZSA9ICh3aW5kb3cgYXMgYW55KS5jb25zb2xlO1xuXG5cdFx0Ly8gY2FwdHVyZSBjb25zb2xlLmxvZygpLCBjb25zb2xlLmRlYnVnKCksIGV0Yy5cblx0XHRjb25zdCBwYXRjaENvbnNvbGVNZXRob2QgPSAobWV0aG9kOiBcImxvZ1wiIHwgXCJpbmZvXCIgfCBcIndhcm5cIiB8IFwiZXJyb3JcIiB8IFwiZGVidWdcIikgPT4ge1xuXHRcdFx0Y29uc3QgZm5PcmlnaW5hbCA9IGNvbnNvbGVbbWV0aG9kXTtcblx0XHRcdGNvbnNvbGVbbWV0aG9kXSA9ICguLi5kYXRhOiBhbnlbXSk6IHZvaWQgPT4ge1xuXHRcdFx0XHR0aGlzLmNoZWNrQW5kTG9nKG1ldGhvZCwgLi4uZGF0YSk7XG5cdFx0XHRcdHJldHVybiBmbk9yaWdpbmFsLmFwcGx5KGNvbnNvbGUsIGRhdGEpO1xuXHRcdFx0fTtcblx0XHR9O1xuXG5cdFx0cGF0Y2hDb25zb2xlTWV0aG9kKFwibG9nXCIpO1xuXHRcdHBhdGNoQ29uc29sZU1ldGhvZChcImRlYnVnXCIpO1xuXHRcdHBhdGNoQ29uc29sZU1ldGhvZChcImluZm9cIik7XG5cdFx0cGF0Y2hDb25zb2xlTWV0aG9kKFwid2FyblwiKTtcblx0XHRwYXRjaENvbnNvbGVNZXRob2QoXCJlcnJvclwiKTtcblxuXHRcdC8vIGNhcHR1cmUgY29uc29sZS5hc3NlcnQoKVxuXHRcdC8vIHNlZSBodHRwczovL2NvbnNvbGUuc3BlYy53aGF0d2cub3JnLyNhc3NlcnRcblx0XHRjb25zb2xlLmFzc2VydCA9IGZ1bmN0aW9uIChjb25kaXRpb24gPSBmYWxzZSwgLi4uZGF0YTogYW55W10pIHtcblx0XHRcdGlmIChjb25kaXRpb24pIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBtZXNzYWdlID0gXCJBc3NlcnRpb24gZmFpbGVkXCI7XG5cdFx0XHRpZiAoZGF0YS5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0ZGF0YS5wdXNoKG1lc3NhZ2UpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bGV0IGZpcnN0ID0gZGF0YVswXTtcblx0XHRcdFx0aWYgKHR5cGVvZiBmaXJzdCAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdGRhdGEudW5zaGlmdChtZXNzYWdlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmaXJzdCA9IGAke21lc3NhZ2V9OiAke2ZpcnN0fWA7XG5cdFx0XHRcdFx0ZGF0YVswXSA9IGZpcnN0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGNvbnNvbGUuZXJyb3IoLi4uZGF0YSk7XG5cdFx0fTtcblxuXHRcdC8vIGNhcHR1cmUgZXJyb3JzXG5cdFx0ZnVuY3Rpb24gb25Qcm9taXNlUmVqZWN0aW9uKHRoaXM6IENvbnNvbGVFcnJvckNoZWNrZXIsIGV2ZW50OiBQcm9taXNlUmVqZWN0aW9uRXZlbnQpIHtcblx0XHRcdGNvbnN0IG1lc3NhZ2UgPSBgVU5IQU5ETEVEIFBST01JU0UgUkVKRUNUSU9OOiAke2V2ZW50LnJlYXNvbn1gO1xuXHRcdFx0dGhpcy5jaGVja0FuZExvZyhcImVycm9yXCIsIG1lc3NhZ2UsIGV2ZW50LnJlYXNvbj8uc3RhY2spO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIG9uRXJyb3IodGhpczogQ29uc29sZUVycm9yQ2hlY2tlciwgZXZlbnQ6IEVycm9yRXZlbnQpIHtcblx0XHRcdGNvbnN0IG1lc3NhZ2UgPSBldmVudC5tZXNzYWdlO1xuXHRcdFx0dGhpcy5jaGVja0FuZExvZyhcImVycm9yXCIsIG1lc3NhZ2UsIGV2ZW50LmZpbGVuYW1lKTtcblx0XHR9XG5cblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIG9uRXJyb3IuYmluZCh0aGlzKSwgeyBwYXNzaXZlOiB0cnVlIH0pO1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwidW5oYW5kbGVkcmVqZWN0aW9uXCIsIG9uUHJvbWlzZVJlamVjdGlvbi5iaW5kKHRoaXMpLCB7IHBhc3NpdmU6IHRydWUgfSk7XG5cdH1cblxuXHRzdGF0aWMgZ2V0SW5zdGFuY2Uod2luZG93OiBXaW5kb3cgJiB7IHNhcEZFQ29uc29sZUVycm9yQ2hlY2tlcj86IENvbnNvbGVFcnJvckNoZWNrZXIgfSk6IENvbnNvbGVFcnJvckNoZWNrZXIge1xuXHRcdC8vIHRoZSBnbG9iYWwgaW5zdGFuY2UgaXMgbmVlZGVkIHRvIHN1cHBvcnQgbXVsdGlwbGUgdGVzdHMgaW4gYSByb3cgKGluIEthcm1hKVxuXHRcdGlmICghd2luZG93LnNhcEZFQ29uc29sZUVycm9yQ2hlY2tlcikge1xuXHRcdFx0d2luZG93LnNhcEZFQ29uc29sZUVycm9yQ2hlY2tlciA9IG5ldyBDb25zb2xlRXJyb3JDaGVja2VyKHdpbmRvdyk7XG5cdFx0fVxuXHRcdHJldHVybiB3aW5kb3cuc2FwRkVDb25zb2xlRXJyb3JDaGVja2VyO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbnNvbGVFcnJvckNoZWNrZXIuZ2V0SW5zdGFuY2Uod2luZG93KTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQWNBLFNBQVNBLFlBQVksQ0FBQ0MsT0FBd0IsRUFBMEI7SUFDdkUsSUFBSUEsT0FBTyxZQUFZQyxNQUFNLEVBQUU7TUFDOUIsT0FBUUMsT0FBTyxJQUFLQSxPQUFPLENBQUNDLEtBQUssQ0FBQ0gsT0FBTyxDQUFDLEtBQUssSUFBSTtJQUNwRCxDQUFDLE1BQU07TUFDTixPQUFRRSxPQUFPLElBQUtBLE9BQU8sQ0FBQ0UsUUFBUSxDQUFDSixPQUFPLENBQUM7SUFDOUM7RUFDRDs7RUFFQTtBQUNBO0FBQ0E7RUFDQSxNQUFNSyx3QkFBd0IsR0FBRyxDQUNoQywrREFBK0QsQ0FBQztFQUFBLENBQ2hFLENBQUNDLEdBQUcsQ0FBQ1AsWUFBWSxDQUFDO0VBQUMsSUFFZFEsbUJBQW1CO0lBNkJ4Qiw2QkFBWUMsTUFBc0MsRUFBRTtNQUFBLEtBNUI1Q0MsUUFBUSxHQUE2QixFQUFFO01BQUEsS0FDdkNDLFFBQVEsR0FBYSxFQUFFO01BQUEsS0FJZEMsUUFBUSxHQUFHLElBQUlDLGdCQUFnQixDQUFFQyxTQUFTLElBQUs7UUFDL0QsTUFBTUMsUUFBUSxHQUFHRCxTQUFT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