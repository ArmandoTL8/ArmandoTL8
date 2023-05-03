/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  let Synchronization = /*#__PURE__*/function () {
    function Synchronization() {
      this._fnResolve = null;
      this._isResolved = false;
    }
    var _proto = Synchronization.prototype;
    _proto.waitFor = function waitFor() {
      if (this._isResolved) {
        return Promise.resolve();
      } else {
        return new Promise(resolve => {
          this._fnResolve = resolve;
        });
      }
    };
    _proto.resolve = function resolve() {
      if (!this._isResolved) {
        this._isResolved = true;
        if (this._fnResolve) {
          this._fnResolve();
        }
      }
    };
    return Synchronization;
  }();
  return Synchronization;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTeW5jaHJvbml6YXRpb24iLCJfZm5SZXNvbHZlIiwiX2lzUmVzb2x2ZWQiLCJ3YWl0Rm9yIiwiUHJvbWlzZSIsInJlc29sdmUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlN5bmNocm9uaXphdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTeW5jaHJvbml6YXRpb24ge1xuXHRwcml2YXRlIF9mblJlc29sdmU6IEZ1bmN0aW9uIHwgbnVsbDtcblx0cHJpdmF0ZSBfaXNSZXNvbHZlZDogYm9vbGVhbjtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5fZm5SZXNvbHZlID0gbnVsbDtcblx0XHR0aGlzLl9pc1Jlc29sdmVkID0gZmFsc2U7XG5cdH1cblxuXHR3YWl0Rm9yKCkge1xuXHRcdGlmICh0aGlzLl9pc1Jlc29sdmVkKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0XHR0aGlzLl9mblJlc29sdmUgPSByZXNvbHZlO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0cmVzb2x2ZSgpIHtcblx0XHRpZiAoIXRoaXMuX2lzUmVzb2x2ZWQpIHtcblx0XHRcdHRoaXMuX2lzUmVzb2x2ZWQgPSB0cnVlO1xuXHRcdFx0aWYgKHRoaXMuX2ZuUmVzb2x2ZSkge1xuXHRcdFx0XHR0aGlzLl9mblJlc29sdmUoKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU3luY2hyb25pemF0aW9uO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O01BQU1BLGVBQWU7SUFHcEIsMkJBQWM7TUFDYixJQUFJLENBQUNDLFVBQVUsR0FBRyxJQUFJO01BQ3RCLElBQUksQ0FBQ0MsV0FBVyxHQUFHLEtBQUs7SUFDekI7SUFBQztJQUFBLE9BRURDLE9BQU8sR0FBUCxtQkFBVTtNQUNULElBQUksSUFBSSxDQUFDRCxXQUFXLEVBQUU7UUFDckIsT0FBT0UsT0FBTyxDQUFDQyxPQUFPLEVBQUU7TUFDekIsQ0FBQyxNQUFNO1FBQ04sT0FBTyxJQUFJRCxPQUFPLENBQUVDLE9BQU8sSUFBSztVQUMvQixJQUFJLENBQUNKLFVBQVUsR0FBR0ksT0FBTztRQUMxQixDQUFDLENBQUM7TUFDSDtJQUNELENBQUM7SUFBQSxPQUVEQSxPQUFPLEdBQVAsbUJBQVU7TUFDVCxJQUFJLENBQUMsSUFBSSxDQUFDSCxXQUFXLEVBQUU7UUFDdEIsSUFBSSxDQUFDQSxXQUFXLEdBQUcsSUFBSTtRQUN2QixJQUFJLElBQUksQ0FBQ0QsVUFBVSxFQUFFO1VBQ3BCLElBQUksQ0FBQ0EsVUFBVSxFQUFFO1FBQ2xCO01BQ0Q7SUFDRCxDQUFDO0lBQUE7RUFBQTtFQUFBLE9BR2FELGVBQWU7QUFBQSJ9