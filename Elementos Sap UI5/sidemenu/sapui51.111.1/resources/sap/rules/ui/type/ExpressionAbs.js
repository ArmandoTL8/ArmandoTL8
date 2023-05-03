/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(["jquery.sap.global"],function(jQuery){"use strict";var e=sap.ui.model.CompositeType.extend("sap.rules.ui.type.ExpressionAbs",{constructor:function(e,s){this.bParseWithValues=true;this.expressionLanguage=e instanceof Object?e:sap.ui.getCore().byId(e);this.sExpressionLanguageVersion=s},validateValue:function(){return true},setExpressionLanguage:function(e){this.expressionLanguage=e instanceof Object?e:sap.ui.getCore().byId(e)},setExpressionLanguageVersion:function(e){this.sExpressionLanguageVersion=e}});return e},true);
//# sourceMappingURL=ExpressionAbs.js.map