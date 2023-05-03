/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/modeler/ui/utils/nullObjectChecker"],function(e){"use strict";var n=500;var r={};r.prepareModel=function(r,t){var i;if(!e.checkIsNotNullOrUndefined(t)){t=n}i=new sap.ui.model.json.JSONModel;i.setSizeLimit(t);i.setData({Objects:r});return i};r.convert=function(n,t){var i=[],u;if(!e.checkIsNotNullOrUndefinedOrBlank(n)){return undefined}n.forEach(function(n){if(!e.checkIsNotNullOrUndefined(n)){return}u={};u.key=n instanceof Object?n.key:n;u.name=n instanceof Object?n.name:n;i.push(u)});return r.prepareModel(i,t)};return r},true);
//# sourceMappingURL=optionsValueModelBuilder.js.map