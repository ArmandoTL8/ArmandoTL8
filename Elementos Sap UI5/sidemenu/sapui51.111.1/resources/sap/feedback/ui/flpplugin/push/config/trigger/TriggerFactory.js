/*!
 * SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(["./ThemeTimeSlotTrigger","./ThemeChangedTrigger","./RecurringTrigger"],function(e,r,i){"use strict";return{createTrigger:function(n){var g=null;switch(n.name){case"themeTimeSlotTrigger":g=new e;g.initFromJSON(n);break;case"themeChangedTrigger":g=new r;g.initFromJSON(n);break;case"recurringTrigger":g=new i;g.initFromJSON(n);break}return g}}});
//# sourceMappingURL=TriggerFactory.js.map