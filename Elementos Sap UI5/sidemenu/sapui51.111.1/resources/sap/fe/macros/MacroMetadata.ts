import deepClone from "sap/base/util/deepClone";
import merge from "sap/base/util/merge";
import uid from "sap/base/util/uid";
import ConverterContext from "sap/fe/core/converters/ConverterContext";
const fnGetOverrides = function (mControlConfiguration: any, sID: string) {
	const oProps: any = {};
	if (mControlConfiguration) {
		const oControlConfig = mControlConfiguration[sID];
		if (oControlConfig) {
			Object.keys(oControlConfig).forEach(function (sConfigKey: string) {
				oProps[sConfigKey] = oControlConfig[sConfigKey];
			});
		}
	}
	return oProps;
};
const fnSetDefaultValue = function (oProps: any, sPropName: string, oOverrideValue: any, bForceUpdate: boolean) {
	if (oProps[sPropName] === undefined || bForceUpdate) {
		oProps[sPropName] = oOverrideValue;
	}
};
const MacroMetadata = {
	metadata: {
		properties: {
			_flexId: {
				type: "string"
			}
		}
	},
	extend: function (fnName: any, oContent: any) {
		oContent.metadata.properties._flexId = MacroMetadata.metadata.properties._flexId;
		oContent.hasValidation = true;
		oContent.getOverrides = fnGetOverrides.bind(oContent);
		oContent.setDefaultValue = fnSetDefaultValue.bind(oContent);
		oContent.getConverterContext = function (oVisualizationObjectPath: any, contextPath: any, mSettings: any, mExtraParams: any) {
			const oAppComponent = mSettings.appComponent;
			const originalViewData = mSettings.models.viewData && mSettings.models.viewData.getData();
			let viewData = Object.assign({}, originalViewData);
			delete viewData.resourceBundle;
			viewData = deepClone(viewData);
			viewData.controlConfiguration = merge(viewData.controlConfiguration, mExtraParams);
			return ConverterContext.createConverterContextForMacro(
				oVisualizationObjectPath.startingEntitySet.name,
				mSettings.models.metaModel,
				oAppComponent && oAppComponent.getDiagnostics(),
				merge,
				oVisualizationObjectPath.contextLocation,
				viewData
			);
		};
		oContent.createBindingContext = function (oData: any, mSettings: any) {
			const sContextPath = `/uid--${uid()}`;
			mSettings.models.converterContext.setProperty(sContextPath, oData);
			return mSettings.models.converterContext.createBindingContext(sContextPath);
		};
		oContent.parseAggregation = function (oAggregation: any, fnCallback: Function) {
			const oOutObjects: any = {};
			if (oAggregation && oAggregation.children.length > 0) {
				const children = oAggregation.children;
				for (let childIdx = 0; childIdx < children.length; childIdx++) {
					const childObject = fnCallback(children[childIdx], childIdx);
					if (childObject) {
						oOutObjects[childObject.key] = childObject;
					}
				}
			}
			return oOutObjects;
		};

		oContent.getContentId = function (sMacroId: string) {
			return `${sMacroId}-content`;
		};

		return oContent;
	}
};

export default MacroMetadata;
