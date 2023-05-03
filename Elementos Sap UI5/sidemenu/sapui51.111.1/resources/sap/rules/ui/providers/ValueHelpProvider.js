/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

 (c) Copyright 2009-2016 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","sap/m/List","sap/m/PlacementType","sap/m/ResponsivePopover","sap/m/StandardListItem","sap/ui/comp/providers/ValueHelpProvider","sap/ui/model/json/JSONModel"],function(jQuery,e,t,o,s,i,a){"use strict";var l=i.extend("sap.rules.ui.providers.ValueHelpProvider",{constructor:function(e){if(e){this._cursorPosition=e.cursorPosition;this._bReplaceWord=e.bReplaceWord;this._businessDataType=e.businessDataType;this._bAddSpace=e.bAddSpace}i.apply(this,arguments);this._onInitialise()}});l.prototype._onOK=function(e){var t=e.getParameter("tokens"),o,s,i=0,a=[],l=null;this._onCancel();if(this.oControl instanceof sap.m.MultiInput){this.oControl.setValue("");this.oControl.setTokens(t);i=t.length;while(i--){l=t[i].data("row");if(l){a.push(l)}}}else{if(t[0]){if(this.bIsSingleIntervalRange){o=t[0].data("range");if(o){if(o.operation==="BT"){s=o.value1+"-"+o.value2}else{s=o.value1}}}else{s=t[0].getKey()}l=t[0].data("row");if(l){a.push(l)}}if(this.oControl instanceof sap.rules.ui.ExpressionAdvanced){this.oControl.setTextOnCursor(s,this._cursorPosition,this._bReplaceWord,this._businessDataType,this._bAddSpace);this.oControl.fireChange({value:s,validated:true})}else{this.oControl.setValue(s);this.oControl.fireChange()}}this._calculateAndSetFilterOutputData(a)};l.prototype._onInitialise=function(e){i.prototype._onInitialise.apply(this,[e]);var t=this.oControl;var o=t.getParent();if(t instanceof sap.rules.ui.DecisionTableCellExpressionAdvanced){t.setBusy(true);o.setModal(true)}else if(this._popover){this._popover.setModal(true)}};l.prototype._onCancel=function(e){this.oValueHelpDialog.close();var t=this.oControl;var o=t.getParent();if(t instanceof sap.rules.ui.DecisionTableCellExpressionAdvanced){o.setModal(false);t.setBusy(false)}else if(this._popover){this._popover.setModal(false)}};l.prototype._createAdditionalValueHelpControls=function(){i.prototype._createAdditionalValueHelpControls.call(this);this.oSmartFilterBar.setExpandAdvancedArea(false)};l.prototype._rebindTable=function(){i.prototype._rebindTable.call(this,arguments);var e=this.oValueHelpDialog.getTable();e.getBinding("rows").attachDataReceived(function(t){e.setBusy(false)},this)};l.prototype._onValueHelpDialogRequired=function(e){i.prototype._onValueHelpDialogRequired.call(this,e);this.oValueHelpDialog.setDescriptionKey(null);var t=this.oValueHelpDialog.getTable();var o=t.getColumns();for(var s=0;s<o.length;s++){o[s].setWidth("auto")}};return l},true);
//# sourceMappingURL=ValueHelpProvider.js.map