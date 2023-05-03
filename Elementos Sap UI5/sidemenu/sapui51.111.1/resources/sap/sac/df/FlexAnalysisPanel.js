/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
sap.ui.define("sap/sac/df/FlexAnalysisPanel",["sap/ui/core/Element"],function(e){var n=e.extend("sap.sac.df.FlexAnalysisPanel",{metadata:{library:"sap.sac.df",properties:{description:"string",title:"string",icon:"sap.ui.core.URI"},aggregations:{content:{type:"sap.ui.core.Control",multiple:false}},defaultAggregation:"content"},getPanelId:function(){var e=this.getId();return e.indexOf("--")!==-1?e.split("--").pop():e},getDocumentType:function(){return sap.firefly.AuGdsDocumentType.QUERY_BUILDER},renderPanelContent:function(e){var n=e&&e.getNativeControl();if(n){var t=this.getContent();if(t){n.insertContent(t)}else{throw new Error("No content defined for custom panel.")}}else{throw new Error("Container control not found. Unable to add custom panel.")}}});return n});
//# sourceMappingURL=FlexAnalysisPanel.js.map