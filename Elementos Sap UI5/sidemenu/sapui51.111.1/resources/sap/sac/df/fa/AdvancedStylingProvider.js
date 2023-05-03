/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
sap.ui.define("sap/sac/df/fa/AdvancedStylingProvider",["sap/ui/base/Object"],function(e){"use strict";var a={TableDefinition:{CType:"VisualizationTableDefinition",ScopedStyle:[],ShowFormulas:false,ShowFreezeLines:true,ShowGrid:false,ShowReferences:false,ShowSubtitle:false,ShowTableDetails:false,ShowTableTitle:false,StripeDataColumns:false,StripeDataRows:false,Styles:[],TableHeaderCompactionType:"PreferablyColumn",TableMarkup:[]}};var t=e.extend("sap.sac.df.fa.FlexAnalysisContextMenuProvider",{constructor:function(){this.astRegistry={};this.astRegistry.default=a},registerAdvancedStylingTemplate:function(e,a){this.astRegistry[e]=a},getTemplate:function(e){var t=this.astRegistry[e]||a;return t}});return t});
//# sourceMappingURL=AdvancedStylingProvider.js.map