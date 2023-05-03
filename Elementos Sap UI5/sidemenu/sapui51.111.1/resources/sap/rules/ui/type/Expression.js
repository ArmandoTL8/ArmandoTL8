/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(["jquery.sap.global","sap/rules/ui/type/ExpressionAbs"],function(jQuery,e){"use strict";var s=e.extend("sap.rules.ui.type.Expression",{formatValue:function(e){var s=e;var r=sap.rules.ui.ExpressionType.All;if(!this.expressionLanguage){return s}if(s){var u=this.expressionLanguage.convertDecisionTableExpressionToDisplayValue(s,"","",r);if(u.output.status==="Success"){return u.output.converted.header}}return s},parseValue:function(e){var s=sap.rules.ui.ExpressionType.All;if(!this.expressionLanguage){return e}if(e){var r=this.expressionLanguage.convertDecisionTableExpressionToModelValue(e,"","",s);if(r.output.status==="Success"){return r.output.converted.header}}return e}});return s},true);
//# sourceMappingURL=Expression.js.map