// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/mvc/Controller"],function(n){"use strict";return n.extend("sap.ushell.components.contentFinder.controller.ContentFinderDialog",{onInit:function(){},hide:function(n){n.getSource().getParent().close();this.oEventBus.publish("contentFinderCancel")}})});
//# sourceMappingURL=ContentFinderDialog.controller.js.map