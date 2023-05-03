/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock","sap/fe/core/buildingBlocks/BuildingBlockRuntime"],function(e,t){"use strict";var o,n;var i={};var r=t.xml;var c=e.defineBuildingBlock;var l=e.BuildingBlockBase;function s(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;a(e,t)}function a(e,t){a=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,o){t.__proto__=o;return t};return a(e,t)}let u=(o=c({name:"FlexibleColumnLayoutActions",namespace:"sap.fe.macros.fcl",publicNamespace:"sap.fe.macros"}),o(n=function(e){s(t,e);function t(){return e.apply(this,arguments)||this}i=t;var o=t.prototype;o.getTemplate=function e(){return r`
            <m:OverflowToolbarButton
                id="fe::FCLStandardAction::FullScreen"
                type="Transparent"
                icon="{fclhelper>/actionButtonsInfo/switchIcon}"
                visible="{fclhelper>/actionButtonsInfo/switchVisible}"
                press="._routing.switchFullScreen()"
            />
            <m:OverflowToolbarButton
                id="fe::FCLStandardAction::Close"
                type="Transparent"
                icon="sap-icon://decline"
                tooltip="{sap.fe.i18n>C_COMMON_SAPFE_CLOSE}"
                visible="{fclhelper>/actionButtonsInfo/closeVisible}"
                press="._routing.closeColumn()"
            />`};return t}(l))||n);i=u;return i},false);
//# sourceMappingURL=FlexibleColumnLayoutActions.js.map