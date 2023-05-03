/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
sap.ui.define("sap/sac/df/types/export/PDFConfig",["sap/ui/base/ManagedObject","sap/sac/df/firefly/library"],function(e,t){"use strict";return e.extend("sap.sac.df.types.export.PDFConfig",{metadata:{properties:{pageSize:{type:"string",defaultValue:"a4"},fontSize:{type:"number",defaultValue:6},orientation:{type:"string",defaultValue:"landscape"},builtInFont:{type:"string",defaultValue:"Helvetica"},autoSize:{type:"boolean",defaultValue:true},freezeRows:{type:"number"},numberLocation:{type:"string"}}},getFireflyConfig:function(e){var i=t.PdfConfig.createDefault(t.PrFactory.createStructure(),e);i.setPageSize(this.getPageSize());i.setFontSize(this.getFontSize());i.setOrientation(this.getOrientation());i.setBuiltInFont(this.getBuiltInFont());i.setAutoSize(this.getAutoSize());i.setFreezeRows(this.getFreezeRows());i.setNumberLocation(this.getNumberLocation());return i}})});
//# sourceMappingURL=PDFConfig.js.map