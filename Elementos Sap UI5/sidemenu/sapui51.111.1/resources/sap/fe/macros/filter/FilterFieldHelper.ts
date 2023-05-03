import type { Property } from "@sap-ux/vocabularies-types";
import CommonUtils from "sap/fe/core/CommonUtils";
import { compileExpression, EDM_TYPE_MAPPING, getFiscalType, pathInModel } from "sap/fe/core/helpers/BindingToolkit";
import { DataModelObjectPath, getContextRelativeTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { getProperty } from "sap/fe/core/templating/PropertyFormatters";
import type { ComputedAnnotationInterface, MetaModelContext } from "sap/fe/core/templating/UIFormatters";
import FiscalDate from "sap/fe/core/type/FiscalDate";
import CommonHelper from "sap/fe/macros/CommonHelper";
import AnnotationHelper from "sap/ui/model/odata/v4/AnnotationHelper";

const FilterFieldHelper = {
	//FilterField
	isRequiredInFilter: function (path: any, oDetails: any) {
		const oModel = oDetails.context.getModel(),
			sPropertyPath = oDetails.context.getPath(),
			sPropertyLocationPath = CommonHelper.getLocationForPropertyPath(oModel, sPropertyPath);

		let sProperty: string,
			oFR,
			bIsRequired = oModel.getObject(sPropertyLocationPath + "/@com.sap.vocabularies.Common.v1.ResultContext");

		if (!bIsRequired) {
			if (typeof path === "string") {
				sProperty = path;
			} else {
				sProperty = oModel.getObject(`${sPropertyPath}@sapui.name`);
			}
			oFR = CommonUtils.getFilterRestrictionsByPath(sPropertyLocationPath, oModel);
			bIsRequired = oFR && oFR.RequiredProperties && oFR.RequiredProperties.indexOf(sProperty) > -1;
		}
		return bIsRequired;
	},
	maxConditions: function (path: any, oDetails: any) {
		let sProperty,
			maxConditions = -1;
		const oModel = oDetails.context.getModel(),
			sPropertyPath = oDetails.context.getPath();

		const sPropertyLocationPath = CommonHelper.getLocationForPropertyPath(oModel, sPropertyPath);
		if (oModel.getObject(`${sPropertyLocationPath}/@com.sap.vocabularies.Common.v1.ResultContext`) === true) {
			return 1;
		}

		if (typeof path === "string") {
			sProperty = path;
		} else {
			sProperty = oModel.getObject(`${sPropertyPath}@sapui.name`);
		}
		const oFilterRestrictions = CommonUtils.getFilterRestrictionsByPath(sPropertyLocationPath, oModel);
		let oProperty = oModel.getObject(`${sPropertyLocationPath}/${sProperty}`);
		if (!oProperty) {
			oProperty = oModel.getObject(sPropertyPath);
		}
		if (oProperty.$Type === "Edm.Boolean") {
			maxConditions = 1;
		} else if (
			oFilterRestrictions &&
			oFilterRestrictions.FilterAllowedExpressions &&
			oFilterRestrictions.FilterAllowedExpressions[sProperty]
		) {
			const sAllowedExpression = CommonUtils.getSpecificAllowedExpression(oFilterRestrictions.FilterAllowedExpressions[sProperty]);
			if (sAllowedExpression === "SingleValue" || sAllowedExpression === "SingleRange") {
				maxConditions = 1;
			}
		}
		return maxConditions;
	},

	/**
	 * To Create binding for mdc:filterfield conditions.
	 *
	 * @param dataModelObjectPath Data Model Object path to filter field property
	 * @returns Expression binding for conditions for the field
	 */
	getConditionsBinding: function (dataModelObjectPath: DataModelObjectPath) {
		const relativePropertyPath = getContextRelativeTargetObjectPath(dataModelObjectPath, false, true);
		return compileExpression(pathInModel(`/conditions/${relativePropertyPath}`, "$filters"));
	},

	constraints: function (oProperty: MetaModelContext, oInterface: ComputedAnnotationInterface) {
		const sValue = AnnotationHelper.format(oProperty, oInterface) as string,
			aMatches = sValue && sValue.match(/constraints:.*?({.*?})/);
		let sConstraints = aMatches && aMatches[1];
		// Workaround. Add "V4: true" to DateTimeOffset constraints. AnnotationHelper is not aware of this flag.
		if (sValue.indexOf("sap.ui.model.odata.type.DateTimeOffset") > -1) {
			if (sConstraints) {
				sConstraints = `${sConstraints.substr(0, aMatches?.[1].indexOf("}"))}, V4: true}`;
			} else {
				sConstraints = "{V4: true}";
			}
		}
		// Remove {nullable:false} from the constraints as it prevents from having an empty filter field
		// in the case of a single-value filter
		if (sConstraints && sConstraints.indexOf("'nullable':false") >= 0) {
			sConstraints = sConstraints.replace(/,[ ]*'nullable':false/, "").replace(/'nullable':false[, ]*/, "");
			if (sConstraints === "{}") {
				return undefined;
			}
		}
		return sConstraints || undefined;
	},
	formatOptions: function (context: MetaModelContext, annotationInterface: ComputedAnnotationInterface) {
		// as the Annotation helper always returns "parseKeepsEmptyString: true" we need to prevent this in case a property (of type string) is nullable
		// Filling oInterface.arguments with an array where the first parameter is null, and the second contains the "expected"
		// parseKeepsEmptyString value follows a proposal from the model colleagues to "overrule" the behavior of the AnnotationHelper
		if (context.$Type === "Edm.String") {
			if (!context.hasOwnProperty("$Nullable") || context.$Nullable === true) {
				annotationInterface.arguments = [null, { parseKeepsEmptyString: false }];
			}
			const fiscalType = getFiscalType(getProperty(context, annotationInterface));
			if (fiscalType) {
				if (!annotationInterface.arguments) {
					annotationInterface.arguments = [null, {}];
				}
				annotationInterface.arguments[1].fiscalType = fiscalType;
			}
		}
		const sValue = AnnotationHelper.format(context, annotationInterface) as string,
			aMatches = sValue && sValue.match(/formatOptions:.*?({.*?})/);
		return (aMatches && aMatches[1]) || undefined;
	},
	getDataType: function (property: Property) {
		if (property.type === "Edm.String") {
			const fiscalType = getFiscalType(property);
			if (fiscalType) {
				return "sap.fe.core.type.FiscalDate";
			}
		}
		const typeMapping = EDM_TYPE_MAPPING[property.type];
		return typeMapping ? typeMapping.type : property.type;
	},
	getPlaceholder: function (property: Property): string | undefined {
		if (property.type === "Edm.String") {
			const fiscalType = getFiscalType(property);
			if (fiscalType) {
				return new FiscalDate({ fiscalType }, {}).getPattern();
			}
		}
		return undefined;
	}
};

export default FilterFieldHelper;
