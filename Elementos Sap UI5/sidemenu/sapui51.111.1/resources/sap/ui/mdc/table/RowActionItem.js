/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Element","../library","sap/ui/core/IconPool","sap/ui/core/Core"],function(t,e,i,n){"use strict";var o=e.RowAction;var r=t.extend("sap.ui.mdc.table.RowActionItem",{metadata:{library:"sap.ui.mdc",properties:{type:{type:"sap.ui.mdc.RowAction"},text:{type:"string"},icon:{type:"sap.ui.core.URI"},visible:{type:"boolean",defaultValue:true}},events:{press:{parameters:{bindingContext:{type:"sap.ui.model.Context"}}}}}});var a={navigationIcon:"navigation-right-arrow"};r.prototype._getText=function(){var t;if(this.getText()){t=this.getText()}else{var e=n.getLibraryResourceBundle("sap.ui.mdc");if(this.getType()===o.Navigation){t=e.getText("table.ROW_ACTION_ITEM_NAVIGATE")}}return t};r.prototype._getIcon=function(){var t;if(this.getIcon()){t=this.getIcon()}else if(this.getType()===o.Navigation){t=i.getIconURI(a["navigationIcon"])}return t};r.prototype._onPress=function(t){this.firePress({bindingContext:t.bindingContext})};return r});
//# sourceMappingURL=RowActionItem.js.map