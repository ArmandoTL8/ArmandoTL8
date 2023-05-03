/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define([],function(){"use strict";return{getAppLifeCycleService:function(){return sap.ushell.Container.getService("AppLifeCycle")},getCurrentApp:function(){return this.getAppLifeCycleService().getCurrentApplication()},getUserInfo:function(){return sap.ushell.Container.getService("UserInfo")},getAppConfig:function(){return sap.ui.getCore().getConfiguration()},getTheme:function(){return this.getAppConfig().getTheme()},getLanguage:function(){return this.getAppConfig().getLocale().getLanguage()}}});
//# sourceMappingURL=UI5Utils.js.map