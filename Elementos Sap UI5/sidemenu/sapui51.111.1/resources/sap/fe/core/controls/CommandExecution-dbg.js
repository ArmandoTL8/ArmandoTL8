/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/CommandExecution", "sap/ui/core/Component", "sap/ui/core/Element", "sap/ui/core/Shortcut"], function (Log, ClassSupport, CoreCommandExecution, Component, Element, Shortcut) {
  "use strict";

  var _dec, _class;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let CommandExecution = (_dec = defineUI5Class("sap.fe.core.controls.CommandExecution"), _dec(_class = /*#__PURE__*/function (_CoreCommandExecution) {
    _inheritsLoose(CommandExecution, _CoreCommandExecution);
    function CommandExecution(sId, mSettings) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return _CoreCommandExecution.call(this, sId, mSettings) || this;
    }
    var _proto = CommandExecution.prototype;
    _proto.setParent = function setParent(oParent) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      _CoreCommandExecution.prototype.setParent.call(this, oParent);
      const aCommands = oParent.data("sap.ui.core.Shortcut");
      if (Array.isArray(aCommands) && aCommands.length > 0) {
        const oCommand = oParent.data("sap.ui.core.Shortcut")[aCommands.length - 1],
          oShortcut = oCommand.shortcutSpec;
        if (oShortcut) {
          // Check if single key shortcut
          for (const key in oShortcut) {
            if (oShortcut[key] && key !== "key") {
              return this;
            }
          }
        }
        return this;
      }
    };
    _proto.destroy = function destroy(bSuppressInvalidate) {
      const oParent = this.getParent();
      if (oParent) {
        const oCommand = this._getCommandInfo();
        if (oCommand) {
          Shortcut.unregister(this.getParent(), oCommand.shortcut);
        }
        this._cleanupContext(oParent);
      }
      Element.prototype.destroy.apply(this, [bSuppressInvalidate]);
    };
    _proto.setVisible = function setVisible(bValue) {
      let oCommand,
        oParentControl = this.getParent(),
        oComponent;
      while (!oComponent && oParentControl) {
        oComponent = Component.getOwnerComponentFor(oParentControl);
        oParentControl = oParentControl.getParent();
      }
      if (oComponent) {
        oCommand = oComponent.getCommand(this.getCommand());
        if (oCommand) {
          _CoreCommandExecution.prototype.setVisible.call(this, bValue);
        } else {
          Log.info("There is no shortcut definition registered in the manifest for the command : " + this.getCommand());
        }
      }
      return this;
    };
    return CommandExecution;
  }(CoreCommandExecution)) || _class);
  return CommandExecution;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb21tYW5kRXhlY3V0aW9uIiwiZGVmaW5lVUk1Q2xhc3MiLCJzSWQiLCJtU2V0dGluZ3MiLCJzZXRQYXJlbnQiLCJvUGFyZW50IiwiYUNvbW1hbmRzIiwiZGF0YSIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsIm9Db21tYW5kIiwib1Nob3J0Y3V0Iiwic2hvcnRjdXRTcGVjIiwia2V5IiwiZGVzdHJveSIsImJTdXBwcmVzc0ludmFsaWRhdGUiLCJnZXRQYXJlbnQiLCJfZ2V0Q29tbWFuZEluZm8iLCJTaG9ydGN1dCIsInVucmVnaXN0ZXIiLCJzaG9ydGN1dCIsIl9jbGVhbnVwQ29udGV4dCIsIkVsZW1lbnQiLCJwcm90b3R5cGUiLCJhcHBseSIsInNldFZpc2libGUiLCJiVmFsdWUiLCJvUGFyZW50Q29udHJvbCIsIm9Db21wb25lbnQiLCJDb21wb25lbnQiLCJnZXRPd25lckNvbXBvbmVudEZvciIsImdldENvbW1hbmQiLCJMb2ciLCJpbmZvIiwiQ29yZUNvbW1hbmRFeGVjdXRpb24iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNvbW1hbmRFeGVjdXRpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgeyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBDb3JlQ29tbWFuZEV4ZWN1dGlvbiBmcm9tIFwic2FwL3VpL2NvcmUvQ29tbWFuZEV4ZWN1dGlvblwiO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50XCI7XG5pbXBvcnQgRWxlbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRWxlbWVudFwiO1xuaW1wb3J0IFNob3J0Y3V0IGZyb20gXCJzYXAvdWkvY29yZS9TaG9ydGN1dFwiO1xuXG50eXBlICRDb21tYW5kRXhlY3V0aW9uU2V0dGluZ3MgPSB7XG5cdHZpc2libGU6IGJvb2xlYW4gfCBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG5cdGVuYWJsZWQ6IGJvb2xlYW4gfCBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG5cdGV4ZWN1dGU6IEZ1bmN0aW9uO1xuXHRjb21tYW5kOiBzdHJpbmc7XG59O1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbHMuQ29tbWFuZEV4ZWN1dGlvblwiKVxuY2xhc3MgQ29tbWFuZEV4ZWN1dGlvbiBleHRlbmRzIENvcmVDb21tYW5kRXhlY3V0aW9uIHtcblx0Y29uc3RydWN0b3Ioc0lkPzogc3RyaW5nIHwgJENvbW1hbmRFeGVjdXRpb25TZXR0aW5ncywgbVNldHRpbmdzPzogJENvbW1hbmRFeGVjdXRpb25TZXR0aW5ncykge1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0c3VwZXIoc0lkLCBtU2V0dGluZ3MpO1xuXHR9XG5cdHNldFBhcmVudChvUGFyZW50OiBhbnkpIHtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHN1cGVyLnNldFBhcmVudChvUGFyZW50KTtcblx0XHRjb25zdCBhQ29tbWFuZHMgPSBvUGFyZW50LmRhdGEoXCJzYXAudWkuY29yZS5TaG9ydGN1dFwiKTtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShhQ29tbWFuZHMpICYmIGFDb21tYW5kcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRjb25zdCBvQ29tbWFuZCA9IG9QYXJlbnQuZGF0YShcInNhcC51aS5jb3JlLlNob3J0Y3V0XCIpW2FDb21tYW5kcy5sZW5ndGggLSAxXSxcblx0XHRcdFx0b1Nob3J0Y3V0ID0gb0NvbW1hbmQuc2hvcnRjdXRTcGVjO1xuXHRcdFx0aWYgKG9TaG9ydGN1dCkge1xuXHRcdFx0XHQvLyBDaGVjayBpZiBzaW5nbGUga2V5IHNob3J0Y3V0XG5cdFx0XHRcdGZvciAoY29uc3Qga2V5IGluIG9TaG9ydGN1dCkge1xuXHRcdFx0XHRcdGlmIChvU2hvcnRjdXRba2V5XSAmJiBrZXkgIT09IFwia2V5XCIpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0aGlzO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXHR9XG5cblx0ZGVzdHJveShiU3VwcHJlc3NJbnZhbGlkYXRlOiBib29sZWFuKSB7XG5cdFx0Y29uc3Qgb1BhcmVudCA9IHRoaXMuZ2V0UGFyZW50KCk7XG5cdFx0aWYgKG9QYXJlbnQpIHtcblx0XHRcdGNvbnN0IG9Db21tYW5kID0gdGhpcy5fZ2V0Q29tbWFuZEluZm8oKTtcblx0XHRcdGlmIChvQ29tbWFuZCkge1xuXHRcdFx0XHRTaG9ydGN1dC51bnJlZ2lzdGVyKHRoaXMuZ2V0UGFyZW50KCksIG9Db21tYW5kLnNob3J0Y3V0KTtcblx0XHRcdH1cblx0XHRcdHRoaXMuX2NsZWFudXBDb250ZXh0KG9QYXJlbnQpO1xuXHRcdH1cblx0XHRFbGVtZW50LnByb3RvdHlwZS5kZXN0cm95LmFwcGx5KHRoaXMsIFtiU3VwcHJlc3NJbnZhbGlkYXRlXSk7XG5cdH1cblx0c2V0VmlzaWJsZShiVmFsdWU6IGJvb2xlYW4pIHtcblx0XHRsZXQgb0NvbW1hbmQsXG5cdFx0XHRvUGFyZW50Q29udHJvbCA9IHRoaXMuZ2V0UGFyZW50KCksXG5cdFx0XHRvQ29tcG9uZW50OiBhbnk7XG5cblx0XHR3aGlsZSAoIW9Db21wb25lbnQgJiYgb1BhcmVudENvbnRyb2wpIHtcblx0XHRcdG9Db21wb25lbnQgPSBDb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3Iob1BhcmVudENvbnRyb2wpO1xuXHRcdFx0b1BhcmVudENvbnRyb2wgPSBvUGFyZW50Q29udHJvbC5nZXRQYXJlbnQoKTtcblx0XHR9XG5cblx0XHRpZiAob0NvbXBvbmVudCkge1xuXHRcdFx0b0NvbW1hbmQgPSBvQ29tcG9uZW50LmdldENvbW1hbmQodGhpcy5nZXRDb21tYW5kKCkpO1xuXG5cdFx0XHRpZiAob0NvbW1hbmQpIHtcblx0XHRcdFx0c3VwZXIuc2V0VmlzaWJsZShiVmFsdWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0TG9nLmluZm8oXCJUaGVyZSBpcyBubyBzaG9ydGN1dCBkZWZpbml0aW9uIHJlZ2lzdGVyZWQgaW4gdGhlIG1hbmlmZXN0IGZvciB0aGUgY29tbWFuZCA6IFwiICsgdGhpcy5nZXRDb21tYW5kKCkpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb21tYW5kRXhlY3V0aW9uO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7OztNQWVNQSxnQkFBZ0IsV0FEckJDLGNBQWMsQ0FBQyx1Q0FBdUMsQ0FBQztJQUFBO0lBRXZELDBCQUFZQyxHQUF3QyxFQUFFQyxTQUFxQyxFQUFFO01BQzVGO01BQ0E7TUFBQSxPQUNBLGlDQUFNRCxHQUFHLEVBQUVDLFNBQVMsQ0FBQztJQUN0QjtJQUFDO0lBQUEsT0FDREMsU0FBUyxHQUFULG1CQUFVQyxPQUFZLEVBQUU7TUFDdkI7TUFDQTtNQUNBLGdDQUFNRCxTQUFTLFlBQUNDLE9BQU87TUFDdkIsTUFBTUMsU0FBUyxHQUFHRCxPQUFPLENBQUNFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztNQUN0RCxJQUFJQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ0gsU0FBUyxDQUFDLElBQUlBLFNBQVMsQ0FBQ0ksTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNyRCxNQUFNQyxRQUFRLEdBQUdOLE9BQU8sQ0FBQ0UsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUNELFNBQVMsQ0FBQ0ksTUFBTSxHQUFHLENBQUMsQ0FBQztVQUMxRUUsU0FBUyxHQUFHRCxRQUFRLENBQUNFLFlBQVk7UUFDbEMsSUFBSUQsU0FBUyxFQUFFO1VBQ2Q7VUFDQSxLQUFLLE1BQU1FLEdBQUcsSUFBSUYsU0FBUyxFQUFFO1lBQzVCLElBQUlBLFNBQVMsQ0FBQ0UsR0FBRyxDQUFDLElBQUlBLEdBQUcsS0FBSyxLQUFLLEVBQUU7Y0FDcEMsT0FBTyxJQUFJO1lBQ1o7VUFDRDtRQUNEO1FBQ0EsT0FBTyxJQUFJO01BQ1o7SUFDRCxDQUFDO0lBQUEsT0FFREMsT0FBTyxHQUFQLGlCQUFRQyxtQkFBNEIsRUFBRTtNQUNyQyxNQUFNWCxPQUFPLEdBQUcsSUFBSSxDQUFDWSxTQUFTLEVBQUU7TUFDaEMsSUFBSVosT0FBTyxFQUFFO1FBQ1osTUFBTU0sUUFBUSxHQUFHLElBQUksQ0FBQ08sZUFBZSxFQUFFO1FBQ3ZDLElBQUlQLFFBQVEsRUFBRTtVQUNiUSxRQUFRLENBQUNDLFVBQVUsQ0FBQyxJQUFJLENBQUNILFNBQVMsRUFBRSxFQUFFTixRQUFRLENBQUNVLFFBQVEsQ0FBQztRQUN6RDtRQUNBLElBQUksQ0FBQ0MsZUFBZSxDQUFDakIsT0FBTyxDQUFDO01BQzlCO01BQ0FrQixPQUFPLENBQUNDLFNBQVMsQ0FBQ1QsT0FBTyxDQUFDVSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUNULG1CQUFtQixDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUFBLE9BQ0RVLFVBQVUsR0FBVixvQkFBV0MsTUFBZSxFQUFFO01BQzNCLElBQUloQixRQUFRO1FBQ1hpQixjQUFjLEdBQUcsSUFBSSxDQUFDWCxTQUFTLEVBQUU7UUFDakNZLFVBQWU7TUFFaEIsT0FBTyxDQUFDQSxVQUFVLElBQUlELGNBQWMsRUFBRTtRQUNyQ0MsVUFBVSxHQUFHQyxTQUFTLENBQUNDLG9CQUFvQixDQUFDSCxjQUFjLENBQUM7UUFDM0RBLGNBQWMsR0FBR0EsY0FBYyxDQUFDWCxTQUFTLEVBQUU7TUFDNUM7TUFFQSxJQUFJWSxVQUFVLEVBQUU7UUFDZmxCLFFBQVEsR0FBR2tCLFVBQVUsQ0FBQ0csVUFBVSxDQUFDLElBQUksQ0FBQ0EsVUFBVSxFQUFFLENBQUM7UUFFbkQsSUFBSXJCLFFBQVEsRUFBRTtVQUNiLGdDQUFNZSxVQUFVLFlBQUNDLE1BQU07UUFDeEIsQ0FBQyxNQUFNO1VBQ05NLEdBQUcsQ0FBQ0MsSUFBSSxDQUFDLCtFQUErRSxHQUFHLElBQUksQ0FBQ0YsVUFBVSxFQUFFLENBQUM7UUFDOUc7TUFDRDtNQUNBLE9BQU8sSUFBSTtJQUNaLENBQUM7SUFBQTtFQUFBLEVBekQ2Qkcsb0JBQW9CO0VBQUEsT0E0RHBDbkMsZ0JBQWdCO0FBQUEifQ==