import TableDelegate from "sap/fe/macros/table/delegates/TableDelegate";

/**
 * Helper class for sap.ui.mdc.Table.
 * <h3><b>Note:</b></h3>
 * This class is experimental and not intended for productive usage, since the API/behavior has not been finalized.
 *
 * @author SAP SE
 * @private
 * @experimental
 * @since 1.69
 * @alias sap.fe.macros.TableDelegate
 */
const TreeTableDelegate = Object.assign({}, TableDelegate, {
	_internalUpdateBindingInfo: function (table: any, bindingInfo: any) {
		TableDelegate._internalUpdateBindingInfo.apply(this, [table, bindingInfo]);

		const payload = table.getPayload();
		bindingInfo.parameters.$$aggregation = {
			hierarchyQualifier: payload?.hierarchyQualifier
		};

		if (payload?.initialExpansionLevel) {
			bindingInfo.parameters.$$aggregation.expandTo = payload.initialExpansionLevel;
		}
	}
});

export default TreeTableDelegate;
