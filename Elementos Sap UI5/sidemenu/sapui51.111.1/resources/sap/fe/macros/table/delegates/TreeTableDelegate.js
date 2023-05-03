/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/table/delegates/TableDelegate"],function(e){"use strict";const a=Object.assign({},e,{_internalUpdateBindingInfo:function(a,i){e._internalUpdateBindingInfo.apply(this,[a,i]);const n=a.getPayload();i.parameters.$$aggregation={hierarchyQualifier:n===null||n===void 0?void 0:n.hierarchyQualifier};if(n!==null&&n!==void 0&&n.initialExpansionLevel){i.parameters.$$aggregation.expandTo=n.initialExpansionLevel}}});return a},false);
//# sourceMappingURL=TreeTableDelegate.js.map