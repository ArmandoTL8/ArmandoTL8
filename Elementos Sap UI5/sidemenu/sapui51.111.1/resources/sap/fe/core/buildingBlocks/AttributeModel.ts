import Log from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";
import type { BuildingBlockDefinition } from "sap/fe/core/buildingBlocks/BuildingBlock";
import type Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * Special JSONModel that is used to store the attribute model for the building block.
 * It has specific handling for undefinedValue mapping
 */
class AttributeModel extends JSONModel {
	public $$valueAsPromise: boolean;
	constructor(
		private readonly oNode: Element,
		private readonly oProps: Record<string, unknown>,
		private readonly buildingBlockDefinition: BuildingBlockDefinition
	) {
		super();
		this.$$valueAsPromise = true;
	}
	_getObject(sPath: string, oContext?: Context): unknown {
		if (sPath === undefined || sPath === "") {
			if (oContext !== undefined && oContext.getPath() !== "/") {
				return this._getObject(oContext.getPath(sPath));
			}
			return this.oProps;
		}
		if (sPath === "/undefinedValue" || sPath === "undefinedValue") {
			return undefined;
		}
		// just return the attribute - we can't validate them, and we don't support aggregations for now
		const oValue = ObjectPath.get(sPath.replace(/\//g, "."), this.oProps);
		if (oValue !== undefined) {
			return oValue;
		}
		// Deal with undefined properties
		if (this.oProps.hasOwnProperty(sPath)) {
			return this.oProps[sPath];
		}
		if (sPath.indexOf(":") === -1 && sPath.indexOf("/") === -1) {
			// Gloves are off, if you have this error you forgot to define your property on your metadata but are still using it in the underlying code
			Log.error(`Missing property ${sPath} on building block metadata ${this.buildingBlockDefinition.name}`);
			//throw new Error(`Missing property ${sPath} on macro metadata ${this.buildingBlockDefinition.name}`);
		}
		return this.oNode.getAttribute(sPath);
	}
}

export default AttributeModel;
