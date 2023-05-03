/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(
    ["./ThemeTimeSlotTrigger", "./ThemeChangedTrigger", "./RecurringTrigger"],
    function (ThemeTimeSlotTrigger, ThemeChangedTrigger, RecurringTrigger) {
        "use strict";

        return {
            createTrigger: function (oFeaturePushTrigger) {
                var oTrigger = null;
                switch (oFeaturePushTrigger.name) {
                    case "themeTimeSlotTrigger":
                        oTrigger = new ThemeTimeSlotTrigger();
                        oTrigger.initFromJSON(oFeaturePushTrigger);
                        break;
                    case "themeChangedTrigger":
                        oTrigger = new ThemeChangedTrigger();
                        oTrigger.initFromJSON(oFeaturePushTrigger);
                        break;
                    case "recurringTrigger":
                        oTrigger = new RecurringTrigger();
                        oTrigger.initFromJSON(oFeaturePushTrigger);
                        break;
                }
                return oTrigger;
            }
        };
    }
);
