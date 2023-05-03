// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log","sap/ui/core/mvc/Controller","sap/ushell/EventHub","sap/ushell/Config","sap/ui/core/Component","sap/ui/thirdparty/jquery","sap/ui/model/json/JSONModel","sap/ui/core/theming/Parameters","sap/ui/Device","sap/ushell/resources","sap/ui/core/message/Message","sap/ushell/User","sap/ui/base/Object","sap/ui/core/library","sap/ushell/services/DarkModeSupport"],function(e,t,o,n,r,jQuery,s,i,a,l,h,c,d,p,u){"use strict";var g=p.MessageType;function m(t){switch(t){case"sap_fiori_3":case"sap_fiori_3_dark":return"SAP Quartz";case"sap_horizon":case"sap_horizon_dark":return"SAP Horizon";case"sap_fiori_3_hcb":case"sap_fiori_3_hcw":return l.i18n.getText("AppearanceHighContrastTheme","SAP Quartz");case"sap_horizon_hcb":case"sap_horizon_hcw":return l.i18n.getText("AppearanceHighContrastTheme","SAP Horizon");default:e.error("Can not find common name for the theme",t);return t||""}}var f={base:"sapUshellBaseIconStyle",sap_bluecrystal:"sapUshellBlueCrystalIconStyle",sap_belize_hcb:"sapUshellHCBIconStyle sapUshellHCBIconStyleOnHCB",sap_belize_hcw:"sapUshellHCWIconStyle sapUshellHCWIconStyleOnHCW",sap_belize:"sapUshellBelizeIconStyle",sap_belize_plus:"sapUshellPlusIconStyle",sap_fiori_3_hcb:"sapUshellQuartzHCBIconStyle sapUshellHCBIconStyleOnHCB",sap_fiori_3_hcw:"sapUshellQuartzHCWIconStyle sapUshellHCWIconStyleOnHCW",sap_fiori_3:"sapUshellQuartzLightIconStyle",sap_fiori_3_dark:"sapUshellQuartzDarkIconStyle",sap_horizon_hcb:"sapUshellHorizonHCBIconStyle sapUshellHCBIconStyleOnHCB",sap_horizon_hcw:"sapUshellHorizonHCWIconStyle sapUshellHCWIconStyleOnHCW",sap_horizon:"sapUshellHorizonLightIconStyle",sap_horizon_dark:"sapUshellHorizonDarkIconStyle"};return t.extend("sap.ushell.components.shell.Settings.appearance.Appearance",{TILE_SIZE:{Small:0,Responsive:1,getName:function(e){return Object.keys(this)[e]}},onInit:function(){var e=this.getView();this.oUser=sap.ushell.Container.getUser();this.aThemeListFromServer=e.getViewData().themeList||[];this.oPersonalizers={};var t=l.getTranslationModel();e.setModel(t,"i18n");e.setModel(this.getConfigurationModel(),"config");sap.ui.getCore().attachThemeChanged(this._handleThemeApplied,this);return this.getDarkModeModel(this.aThemeListFromServer).then(function(t){this._oDarkModeModel=t;e.setModel(this._oDarkModeModel,"darkMode");var o=this.oUser.getTheme();e.setModel(new s({options:this._getThemeListData(this.aThemeListFromServer,o),ariaTexts:{headerLabel:l.i18n.getText("Appearance")}}))}.bind(this))},onExit:function(){sap.ui.getCore().detachThemeChanged(this._handleThemeApplied,this)},_getSelectedTheme:function(){var e=this.getView().byId("themeList").getSelectedItem(),t=e?e.getBindingContext():null,o=t?t.getProperty("id"):this.oUser.getTheme();return o},_getThemeListData:function(e,t){if(this.oUser.isSetThemePermitted()===false){var o=t;for(var n=0;n<e.length;n++){if(e[n].id===t){o=e[n].name||t;break}}return[{id:t,name:o}]}var r=this.getView().getModel("darkMode").getData(),s=this._isDarkModeActive();return e.reduce(function(e,o){var n={id:o.id,name:o.name||o.id||"",isVisible:true,isSelected:o.id===t,isSapTheme:!!f[o.id]};if(s&&r.supportedThemes[o.id]){var i=r.supportedThemes[o.id];if(i.complementaryTheme===t||o.id===t){n.isVisible=o.id===t}else{n.isVisible=i.mode===u.Mode.LIGHT}n.combineName=i.combineName}e.push(n);return e},[]).sort(function(e,t){var o=e.name.localeCompare(t.name);if(o===0){o=e.id.localeCompare(t.id)}return o})},getConfigurationModel:function(){return new s({themeConfigurable:n.last("/core/shell/model/setTheme"),sizeBehaviorConfigurable:n.last("/core/home/sizeBehaviorConfigurable"),tileSize:this.TILE_SIZE[n.last("/core/home/sizeBehavior")],contentDensityConfigurable:n.last("/core/shell/model/contentDensity")&&!a.system.phone,isCozyContentMode:document.body.classList.contains("sapUiSizeCozy"),sapUiContentIconColor:i.get("sapUiContentIconColor"),textAlign:a.system.phone?"Left":"Right"})},getDarkModeModel:function(e){var t=new s({});var o={enabled:false,detectionSupported:false,detectionEnabled:false,supportedThemes:{}};var r;if(n.last("/core/darkMode/enabled")){r=sap.ushell.Container.getServiceAsync("DarkModeSupport").then(function(r){o.enabled=true;o.detectionSupported=r.canAutomaticallyToggleDarkMode();o.detectionEnabled=o.detectionSupported&&this.oUser.getDetectDarkMode();o.supportedThemes=this._getSupportedDarkModeThemes(e,n.last("/core/darkMode/supportedThemes")||[]);t.setData(o);return t}.bind(this))}else{t.setData(o);r=Promise.resolve(t)}return r},_getSupportedDarkModeThemes:function(e,t){var o=e.reduce(function(e,t){e[t.id]=t.name;return e},{});return t.reduce(function(e,t){var n=t.light,r=t.dark,s=o[n],i=o[r];if(s&&i&&!e[n]&&!e[r]){var a=m(n);e[n]={mode:u.Mode.LIGHT,complementaryTheme:r,combineName:a};e[r]={mode:u.Mode.DARK,complementaryTheme:n,combineName:a}}return e},{})},onAfterRendering:function(){var e=this._isDarkModeActive(),t=this.getView().getModel("config").getProperty("/themeConfigurable");var o=this.getView().byId("themeList"),n=o.getItems(),r,s;o.toggleStyleClass("sapUshellThemeListDisabled",!t);n.forEach(function(t,o){s=t.getCustomData()[0].getValue();r=t.getContent()[0].getItems()[0].getItems()[0];if(f[s]){r.addStyleClass(f[s])}r.toggleStyleClass("sapUshellDarkMode",e)})},_handleThemeApplied:function(){var e=this.getView().getModel("config");if(e){e.setProperty("/sapUiContentIconColor",i.get("sapUiContentIconColor"));var t=this.oUser.getTheme();var o=this._getThemeListData(this.aThemeListFromServer,t);this.getView().getModel().setProperty("/options",o)}},onCancel:function(){var e=this.getView().getModel("config");if(e.getProperty("/themeConfigurable")){var t=this.oUser.getTheme(),o=this.getView().getModel().getProperty("/options");o.forEach(function(e){e.isSelected=t===e.id});this.getView().getModel().setProperty("/options",o)}if(e.getProperty("/contentDensityConfigurable")){e.setProperty("/isCozyContentMode",this.oUser.getContentDensity()==="cozy")}if(e.getProperty("/sizeBehaviorConfigurable")){e.setProperty("/tileSize",this.TILE_SIZE[n.last("/core/home/sizeBehavior")])}if(this._oDarkModeModel&&this._oDarkModeModel.getProperty("/enabled")){this._oDarkModeModel.setProperty("/detectionEnabled",this.oUser.getDetectDarkMode());this.oUser.resetChangedProperty("detectDarkMode")}},onSave:function(e){this._updateUserPreferences=e;var t=this.getView().getModel("config"),n=[];if(t.getProperty("/themeConfigurable")){n.push(this.onSaveThemes().then(function(){o.emit("themeChanged",Date.now())}))}if(t.getProperty("/contentDensityConfigurable")){n.push(this.onSaveContentDensity())}if(t.getProperty("/sizeBehaviorConfigurable")){n.push(this.onSaveTileSize())}if(this._oDarkModeModel&&this._oDarkModeModel.getProperty("/enabled")){n.push(this.onSaveDarkModeEnabled())}return Promise.all(n).then(function(e){var t=[];e.forEach(function(e){if(e&&d.isA(e,"sap.ui.core.message.Message")){t.push(e)}});return t.length>0?Promise.reject(t):Promise.resolve()})},onSaveThemesSuccess:function(e){e.resetChangedProperty("theme");return this._applyDarkMode()},onSaveThemes:function(){var t=this.getView().getModel("config"),o=this._getSelectedTheme(),n=this.oUser,r=n.getTheme(c.prototype.constants.themeFormat.ORIGINAL_THEME);if(o&&o!==r&&t.getProperty("/themeConfigurable")){n.setTheme(o);return this._updateUserPreferences(n).then(function(){return this.onSaveThemesSuccess(n)}.bind(this)).catch(function(t){if(!t.includes("THEME")){return this.onSaveThemesSuccess(n)}n.setTheme(r);n.resetChangedProperty("theme");e.error("Can not save selected theme",t);throw new h({type:g.Error,description:t})}.bind(this))}return Promise.resolve()},_onSaveContentDensitySuccess:function(e){var t=this.oUser;t.resetChangedProperty("contentDensity");sap.ui.getCore().getEventBus().publish("launchpad","toggleContentDensity",{contentDensity:e});o.emit("toggleContentDensity",{contentDensity:e});return new Promise(function(e){o.once("toggleContentDensity").do(function(){e()})})},onSaveContentDensity:function(){var t=this.getView().getModel("config"),o=this.oUser,n=t.getProperty("/isCozyContentMode")?"cozy":"compact",r=o.getContentDensity();e.debug("[000] onSaveContentDensity","Appearance.controller");if(n!==r&&t.getProperty("/contentDensityConfigurable")){o.setContentDensity(n);e.debug("[000] onSaveContentDensity: sNewContentDensity",n,"Appearance.controller");return this._updateUserPreferences(o).then(function(){return this._onSaveContentDensitySuccess(n)}.bind(this)).catch(function(t){if(!t.includes("CONTENT_DENSITY")){return this._onSaveContentDensitySuccess()}o.setContentDensity(r);o.resetChangedProperty("contentDensity");e.error("Can not save content density configuration",t);throw new h({type:g.Error,message:t})}.bind(this))}return Promise.resolve()},onSaveTileSize:function(){var t=this.getView().getModel("config"),o=this.TILE_SIZE.getName(t.getProperty("/tileSize")),r=n.last("/core/home/sizeBehavior");if(o&&o!==r&&t.getProperty("/sizeBehaviorConfigurable")){return new Promise(function(t,r){this.writeToPersonalization("flp.settings.FlpSettings","sizeBehavior",o).done(function(){n.emit("/core/home/sizeBehavior",o);if(o==="Responsive"){jQuery(".sapUshellTile").removeClass("sapUshellSmall")}else{jQuery(".sapUshellTile").addClass("sapUshellSmall")}t()}).fail(function(t,o){e.error("Can not save tile size configuration",t);var n=new h({type:g.Error,description:t,message:o.message.value,date:o.innererror.timestamp,httpStatus:o.httpStatus});r(n)})}.bind(this))}return Promise.resolve()},onSaveDarkModeEnabledSuccess:function(e,t){return sap.ushell.Container.getServiceAsync("DarkModeSupport").then(function(o){e.resetChangedProperty("detectDarkMode");if(t){o.enableDarkModeBasedOnSystem()}else{o.disableDarkModeBasedOnSystem()}})},onSaveDarkModeEnabled:function(){var t=this._oDarkModeModel.getProperty("/detectionEnabled");var o=this.oUser.getDetectDarkMode();var n=this.oUser;if(t!==o){e.debug("[000] onSaveDarkModeEnabled: setDetectDarkModeEnabled",t,"Appearance.controller");n.setDetectDarkMode(t);return this._updateUserPreferences(this.oUser).then(function(){return this.onSaveDarkModeEnabledSuccess(n,t)}.bind(this)).catch(function(r){if(!r.includes("THEME_DARKMODE_AUTO_DETECTION")){return this.onSaveDarkModeEnabledSuccess(n,t)}n.setDetectDarkMode(o);n.resetChangedProperty("detectDarkMode");e.error("Can not save dark mode configuration",r);throw new h({message:r})}.bind(this))}return Promise.resolve()},writeToPersonalization:function(t,o,n){return jQuery.when(this.getPersonalizer(t,o).then(function(e){return e.setPersData(n)})).catch(function(t){e.error("Personalization service does not work:");e.error(t.name+": "+t.message)})},getPersonalizer:function(e,t){var o=e+"-"+t;if(this.oPersonalizers[o]){return Promise.resolve(this.oPersonalizers[o])}return sap.ushell.Container.getServiceAsync("Personalization").then(function(n){var s=r.getOwnerComponentFor(this);var i={keyCategory:n.constants.keyCategory.FIXED_KEY,writeFrequency:n.constants.writeFrequency.LOW,clientStorageAllowed:true};if(!this.oPersonalizers[o]){this.oPersonalizers[o]=n.getPersonalizer({container:e,item:t},i,s)}return this.oPersonalizers[o]}.bind(this))},_applyDarkMode:function(){var e=this._oDarkModeModel;var t;if(e.getProperty("/enabled")&&e.getProperty("/detectionSupported")&&e.getProperty("/detectionEnabled")){t=sap.ushell.Container.getServiceAsync("DarkModeSupport").then(function(e){e._toggleDarkModeBasedOnSystemColorScheme()})}else{t=Promise.resolve()}return t},_isDarkModeActive:function(){var e=this._oDarkModeModel.getProperty("/");return e.enabled&&e.detectionSupported&&e.detectionEnabled},changeSystemModeDetection:function(e){var t=this._getSelectedTheme();this.getView().getModel().setProperty("/options",this._getThemeListData(this.aThemeListFromServer,t));this.getView().invalidate()}})});
//# sourceMappingURL=Appearance.controller.js.map