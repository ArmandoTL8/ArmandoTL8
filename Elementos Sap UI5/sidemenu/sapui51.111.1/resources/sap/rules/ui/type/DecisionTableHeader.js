/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(["jquery.sap.global"],function(jQuery){"use strict";var e=sap.rules.ui.type.ExpressionAbs.extend("sap.rules.ui.type.DecisionTableHeader",{formatValue:function(e){if(!this.expressionLanguage){return e.join(" ")}var r="";if(e[0]){var i=this.expressionLanguage.convertDecisionTableExpressionToDisplayValue(e[0]);if(i.output.converted){var s=i.output.converted;r=s.header}else if(e[0]){r=e[0]}}return r+" "+e[1]}});return e},true);
//# sourceMappingURL=DecisionTableHeader.js.map