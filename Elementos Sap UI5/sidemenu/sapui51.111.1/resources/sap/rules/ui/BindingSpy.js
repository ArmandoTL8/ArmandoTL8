/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(["jquery.sap.global","./library","sap/ui/base/ManagedObject"],function(jQuery,e,r){"use strict";var i=r.extend("sap.rules.ui.BindingSpy",{metadata:{properties:{propertyToSpy:{type:"any",group:"Misc",bindable:"bindable"}},library:"sap.rules.ui",events:{change:{}}}});sap.rules.ui.BindingSpy.prototype.setPropertyToSpy=function(e){this.setProperty("propertyToSpy",e);if(e!==null){this.fireChange({value:e})}};return i},true);
//# sourceMappingURL=BindingSpy.js.map