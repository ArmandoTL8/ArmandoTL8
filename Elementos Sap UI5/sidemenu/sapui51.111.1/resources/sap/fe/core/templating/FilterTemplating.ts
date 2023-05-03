import type { Property } from "@sap-ux/vocabularies-types";
import type { EntitySetAnnotations_Capabilities } from "@sap-ux/vocabularies-types/vocabularies/Capabilities_Edm";
import type ConverterContext from "sap/fe/core/converters/ConverterContext";
import modelHelper from "sap/fe/core/helpers/ModelHelper";

export function getIsRequired(converterContext: ConverterContext, sPropertyPath: string): boolean {
	const entitySet = converterContext.getEntitySet();
	const entitySetAnnotations = entitySet?.annotations;
	let capabilities;

	if (!modelHelper.isSingleton(entitySet)) {
		capabilities = entitySetAnnotations?.Capabilities as EntitySetAnnotations_Capabilities;
	}
	const aRequiredProperties = capabilities?.FilterRestrictions?.RequiredProperties as any[];
	let bIsRequired = false;
	if (aRequiredProperties) {
		aRequiredProperties.forEach(function (oRequiredProperty) {
			if (sPropertyPath === oRequiredProperty?.value) {
				bIsRequired = true;
			}
		});
	}
	return bIsRequired;
}

export function isPropertyFilterable(converterContext: ConverterContext, valueListProperty: string): boolean | undefined {
	let bNotFilterable, bHidden;
	const entityType = converterContext.getEntityType();
	const entitySet = converterContext.getEntitySet();
	const entitySetAnnotations = entitySet?.annotations;
	let capabilities;
	if (!modelHelper.isSingleton(entitySet)) {
		capabilities = entitySetAnnotations?.Capabilities as EntitySetAnnotations_Capabilities;
	}
	const nonFilterableProperties = capabilities?.FilterRestrictions?.NonFilterableProperties as any[];
	const properties = entityType.entityProperties;
	properties.forEach((property: Property) => {
		const PropertyPath = property.name;
		if (PropertyPath === valueListProperty) {
			bHidden = property.annotations?.UI?.Hidden?.valueOf();
		}
	});
	if (nonFilterableProperties && nonFilterableProperties.length > 0) {
		for (let i = 0; i < nonFilterableProperties.length; i++) {
			const sPropertyName = nonFilterableProperties[i]?.value;
			if (sPropertyName === valueListProperty) {
				bNotFilterable = true;
			}
		}
	}
	return bNotFilterable || bHidden;
}
