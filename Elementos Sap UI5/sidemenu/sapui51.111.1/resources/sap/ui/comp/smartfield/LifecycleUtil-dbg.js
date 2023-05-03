/*
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define("sap/ui/comp/smartfield/LifecycleUtil", [
	"sap/base/util/Deferred"
], function(
	Deferred
) {
	"use strict";

	/**
	 * @param {sap.ui.comp.smartfield.SmartField} oSmartField control
	 * @author SAP SE
	 * @version 1.111.1
	 * @private
	 * @since 1.110.0
	 * @alias sap.ui.comp.smartfield.LifecycleUtil
	 */
	var LifecycleUtil = {};

	LifecycleUtil._getNextModeRenderedPromise = function () {
		var pOnAfterRendering;

		pOnAfterRendering = new Promise(function (fnResolve) {
			var oDelegate = {
				onAfterRendering: function (oEvent) {
					var oControl = this._oControl[this.getMode()];

					if (oControl && oControl.getFocusDomRef()) {
						this.removeEventDelegate(oDelegate);
						fnResolve();
					}
				}.bind(this)
			};

			this.addEventDelegate(oDelegate);
		}.bind(this));

		return pOnAfterRendering;
	};

	LifecycleUtil._createICRenderedDeferred = function () {
		var oDef;

		// Old deferred is never resolved we just create a new one and assign it
		// as early as possible.
		oDef = new Deferred();
		this._oRenderedWithContext = oDef;

		Promise.all([
			// SmartField is rendered with inner controls
			new Promise(function (fnResolve) {
				var oDelegate = {
					onAfterRendering: function (oEvent) {
						var oControl = this._oControl[this.getMode()],
							oContent = this.getAggregation("_content");

						if (!oControl) {
							return;
						}

						// Only resolve when we have actually rendered controls
						if (
							oControl.getDomRef() &&
							oControl.getFocusDomRef() &&
							oControl === oContent
						) {
							this.removeEventDelegate(oDelegate); // Resolve once
							fnResolve();
						}
					}.bind(this)
				};

				this.addEventDelegate(oDelegate);
			}.bind(this))
		]).then(function () {
			// We have rendered internal controls with the last binding context
			oDef.resolve();
		});
	};

	LifecycleUtil._getICRenderedPromise = function () {
		var oR = this._oRenderedWithContext;
		return oR ? oR.promise : undefined;
	};

	return LifecycleUtil;

}, true);
