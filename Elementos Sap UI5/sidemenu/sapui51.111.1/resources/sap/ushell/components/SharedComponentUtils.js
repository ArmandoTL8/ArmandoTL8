// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/Device","sap/ushell/Config","sap/ushell/UserActivityLog","sap/base/Log","sap/ui/core/Component"],function(e,t,n,i,s){"use strict";var r={PERS_KEY:"flp.settings.FlpSettings",bFlpSettingsAdded:false,toggleUserActivityLog:function(){t.on("/core/extension/SupportTicket").do(function(e){if(e){n.activate()}else{n.deactivate()}})},initializeAccessKeys:function(){if(e.system.desktop){sap.ui.require(["sap/ushell/components/ComponentKeysHandler","sap/ushell/renderers/fiori2/AccessKeysHandler"],function(e,t){e.getInstance().then(function(e){t.registerAppKeysHandler(e.handleFocusOnMe)})})}},getEffectiveHomepageSetting:function(e,n){var i,s=t.last(n)!==false,r=e.split("/").reverse()[0];if(s){i=this._getPersonalization(r)}else{i=Promise.resolve()}return i.then(function(n){n=n||t.last(e);if(n!==undefined){t.emit(e,n)}return n}).catch(function(){return t.last(e)})},_getPersonalization:function(e){return r.getPersonalizer(e,sap.ushell.Container.getRenderer("fiori2")).then(function(t){return new Promise(function(n,s){t.getPersData().done(n).fail(function(t){i.error("Failed to load "+e+" from the personalization",t,"sap.ushell.components.flp.settings.FlpSettings");s()})})})},getPersonalizer:function(e,t){return sap.ushell.Container.getServiceAsync("Personalization").then(function(n){var i=s.getOwnerComponentFor(t);var r={keyCategory:n.constants.keyCategory.FIXED_KEY,writeFrequency:n.constants.writeFrequency.LOW,clientStorageAllowed:true};var o={container:this.PERS_KEY,item:e};return n.getPersonalizer(o,r,i)}.bind(this))}};return r});
//# sourceMappingURL=SharedComponentUtils.js.map