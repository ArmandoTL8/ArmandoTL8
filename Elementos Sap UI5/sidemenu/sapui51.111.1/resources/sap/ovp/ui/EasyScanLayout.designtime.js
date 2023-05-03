/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ovp/ui/ComponentContainerDesigntimeMetadata","sap/ovp/app/resources"],function(a,e){"use strict";return{actions:{},aggregations:{content:{domRef:".sapUiComponentContainer",actions:{},propagateMetadata:function(e){var t=e.getMetadata().getName();if(t==="sap.ui.core.ComponentContainer"){return a}else{return{actions:"not-adaptable"}}},propagateRelevantContainer:false}},name:{singular:e&&e.getText("Card"),plural:e&&e.getText("Cards")}}},false);
//# sourceMappingURL=EasyScanLayout.designtime.js.map