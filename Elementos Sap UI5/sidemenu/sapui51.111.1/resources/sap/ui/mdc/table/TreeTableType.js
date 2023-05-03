/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./GridTableType"],function(e){"use strict";var t;var r=e.extend("sap.ui.mdc.table.TreeTableType",{metadata:{library:"sap.ui.mdc"}});r.prototype.loadModules=function(){if(t){return Promise.resolve()}return Promise.all([e.prototype.loadModules.apply(this,arguments),this.loadUiTableLibrary().then(function(){return new Promise(function(e,r){sap.ui.require(["sap/ui/table/TreeTable"],function(r){t=r;e()},function(){r("Failed to load some modules")})})})])};r.prototype.createTable=function(e){var r=this.getTable();if(!r||!t){return null}var i=new t(e,this.getTableSettings());i._oProxy._bEnableV4=true;return i};r.prototype.getTableSettings=function(){var t=this.getTable();var r=t?t.bDelegateInitialized&&t.getControlDelegate().isSelectionSupported(t):false;var i=e.prototype.getTableSettings.apply(this,arguments);if(!r){i.plugins[0].destroy();delete i.plugins;i.selectionMode="None"}return i};return r});
//# sourceMappingURL=TreeTableType.js.map