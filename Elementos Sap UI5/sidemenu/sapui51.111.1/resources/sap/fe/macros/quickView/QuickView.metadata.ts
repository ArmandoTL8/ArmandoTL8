import { AnnotationTerm, NavigationProperty, Property } from "@sap-ux/vocabularies-types";
import * as Edm from "@sap-ux/vocabularies-types/Edm";
import { CommonAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Common";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import {
	BindingToolkitExpression,
	CompiledBindingToolkitExpression,
	compileExpression,
	getExpressionFromAnnotation,
	pathInModel
} from "sap/fe/core/helpers/BindingToolkit";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { isProperty } from "sap/fe/core/templating/PropertyHelper";
import {
	getDynamicPathFromSemanticObject,
	getSemanticObjectMappings,
	getSemanticObjects,
	getSemanticObjectUnavailableActions,
	hasSemanticObject
} from "sap/fe/core/templating/SemanticObjectHelper";
import type { SemanticObjectCustomData } from "sap/fe/macros/field/FieldTemplating";
import * as FieldTemplating from "sap/fe/macros/field/FieldTemplating";
import { getDataModelObjectPathForValue } from "sap/fe/macros/field/FieldTemplating";
import MacroMetadata from "sap/fe/macros/MacroMetadata";
import {
	RegisteredPayload,
	RegisteredSemanticObjectMapping,
	RegisteredSemanticObjectUnavailableActions
} from "sap/fe/macros/quickView/QuickViewDelegate";

const QuickView = MacroMetadata.extend("sap.fe.macros.quickView.QuickView", {
	/**
	 * Name of the building block control.
	 */
	name: "QuickView",
	/**
	 *
	 * Namespace of the building block control
	 */
	namespace: "sap.fe.macros",
	/**
	 * Fragment source of the building block (optional) - if not set, fragment is generated from namespace and name
	 */
	fragment: "sap.fe.macros.quickView.QuickView",
	/**
	 * The metadata describing the building block control.
	 */
	metadata: {
		/**
		 * Define building block stereotype for documentation
		 */
		stereotype: "xmlmacro",
		/**
		 * Location of the designtime info
		 */
		designtime: "sap/fe/macros/quickView/QuickView.designtime",
		/**
		 * Properties.
		 */
		properties: {
			dataField: {
				type: "sap.ui.model.Context",
				required: true,
				$kind: "Property",
				$Type: [
					"com.sap.vocabularies.UI.v1.DataField",
					"com.sap.vocabularies.UI.v1.DataFieldWithUrl",
					"com.sap.vocabularies.UI.v1.DataFieldForAnnotation",
					"com.sap.vocabularies.UI.v1.DataPointType"
				]
			},
			semanticObject: {
				type: "string"
			},
			/**
			 * Metadata path to the entity set
			 */
			contextPath: {
				type: "sap.ui.model.Context",
				required: false
			},
			/**
			 * Context pointing to an array of key value that is used for custom data generation
			 */
			semanticObjectsToResolve: {
				type: "sap.ui.model.Context",
				required: false,
				computed: true
			}
		},

		events: {}
	},
	create: function (oProps: any) {
		let oDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(oProps.dataField, oProps.contextPath);
		const valueDataModelPath = getDataModelObjectPathForValue(oDataModelPath);
		oDataModelPath = valueDataModelPath || oDataModelPath;

		const valueProperty = oDataModelPath.targetObject;
		const hasQuickViewFacets = valueProperty
			? FieldTemplating.isUsedInNavigationWithQuickViewFacets(oDataModelPath, valueProperty) + ""
			: "false";

		const commonAnnotations = valueProperty?.annotations?.Common;
		//we will need to pass the relativeLocation=getRelativePaths(oDataModelPath); to fieldTemplating#getSemanticObjectExpressionToResolve

		const aSemObjExprToResolve: SemanticObjectCustomData[] = commonAnnotations
			? FieldTemplating.getSemanticObjectExpressionToResolve(commonAnnotations, true)
			: [];

		const pathOfDynamicSemanticObject = getDynamicPathFromSemanticObject(oProps.semanticObject);
		if (pathOfDynamicSemanticObject) {
			aSemObjExprToResolve.push({
				key: pathOfDynamicSemanticObject,
				value: oProps.semanticObject
			});
		}
		oProps.semanticObjectsToResolve = FieldTemplating.getSemanticObjects(aSemObjExprToResolve); // this is used via semanticObjectsToResolve>
		const relativePathToQuickViewEntity = this._getRelativePathToQuickViewEntity(oDataModelPath);
		// it can be that there is no targetEntityset for the context location so we use the targetObjectFullyQualifiedName
		const quickViewEntity = relativePathToQuickViewEntity
			? `/${
					oDataModelPath.contextLocation?.targetEntitySet?.name ||
					oDataModelPath.contextLocation?.targetObject?.fullyQualifiedName
			  }/${relativePathToQuickViewEntity}`
			: undefined;
		const navigationPath = relativePathToQuickViewEntity ? compileExpression(pathInModel(relativePathToQuickViewEntity)) : undefined;

		const propertyWithSemanticObject = this._getPropertyWithSemanticObject(oDataModelPath);
		let mainSemanticObject;
		const { semanticObjectsList, qualifierMap } = this._getSemanticObjectsForPayloadAndQualifierMap(propertyWithSemanticObject);
		const semanticObjectMappings = this._getSemanticObjectMappingsForPayload(propertyWithSemanticObject, qualifierMap);
		const semanticObjectUnavailableActions = this._getSemanticObjectUnavailableActionsForPayload(
			propertyWithSemanticObject,
			qualifierMap
		);
		if (isProperty(propertyWithSemanticObject)) {
			// TODO why should this be different for navigation: when we add this some links disappear
			mainSemanticObject = qualifierMap["main"] || qualifierMap[""];
		}
		this._addCustomSemanticObjectToSemanticObjectListForPayload(semanticObjectsList, oProps.semanticObject as string | undefined);
		const propertyPathLabel = valueProperty.annotations?.Common?.Label?.valueOf() || "";

		const payload: RegisteredPayload = {
			semanticObjects: semanticObjectsList,
			entityType: quickViewEntity,
			semanticObjectUnavailableActions: semanticObjectUnavailableActions,
			semanticObjectMappings: semanticObjectMappings,
			mainSemanticObject: mainSemanticObject,
			propertyPathLabel: propertyPathLabel,
			dataField: quickViewEntity === undefined ? oProps.dataField.getPath() : undefined,
			contact: undefined,
			navigationPath: navigationPath,
			hasQuickViewFacets: hasQuickViewFacets
		};
		oProps.delegateConfiguration = JSON.stringify({
			name: "sap/fe/macros/quickView/QuickViewDelegate",
			payload: payload
		});

		return oProps;
	},
	/**
	 * Get the relative path to the entity which quick view Facets we want to display.
	 *
	 * @param propertyDataModelPath
	 * @returns A path if it exists.
	 */
	_getRelativePathToQuickViewEntity: function (propertyDataModelPath: DataModelObjectPath): string | undefined {
		let relativePathToQuickViewEntity: string | undefined;
		const quickViewNavProp = this._getNavPropToQuickViewEntity(propertyDataModelPath);
		if (quickViewNavProp) {
			relativePathToQuickViewEntity = propertyDataModelPath.navigationProperties.reduce((relativPath: string, navProp) => {
				if (
					navProp.name !== quickViewNavProp.name &&
					!propertyDataModelPath.contextLocation?.navigationProperties.find(
						(contextNavProp) => contextNavProp.name === navProp.name
					)
				) {
					// we keep only navProperties that are part of the relativePath and not the one for quickViewNavProp
					return `${relativPath}${navProp.name}/`;
				}
				return relativPath;
			}, "");
			relativePathToQuickViewEntity = `${relativePathToQuickViewEntity}${quickViewNavProp.name}`;
		}
		return relativePathToQuickViewEntity;
	},
	/**
	 * Get the property or the navigation property in  its relative path that holds semanticObject annotation if it exists.
	 *
	 * @param dataModelObjectPath
	 * @returns A property or a NavProperty or undefined
	 */
	_getPropertyWithSemanticObject: function (dataModelObjectPath: DataModelObjectPath) {
		let propertyWithSemanticObject: Property | NavigationProperty | undefined;
		if (hasSemanticObject(dataModelObjectPath.targetObject)) {
			propertyWithSemanticObject = dataModelObjectPath.targetObject;
		} else if (dataModelObjectPath.navigationProperties.length > 0) {
			// there are no semantic objects on the property itself so we look for some on nav properties
			for (const navProperty of dataModelObjectPath.navigationProperties) {
				if (
					!dataModelObjectPath.contextLocation?.navigationProperties.find(
						(contextNavProp) => contextNavProp.fullyQualifiedName === navProperty.fullyQualifiedName
					) &&
					!propertyWithSemanticObject &&
					hasSemanticObject(navProperty)
				) {
					propertyWithSemanticObject = navProperty;
				}
			}
		}
		return propertyWithSemanticObject;
	},
	/**
	 * Get the semanticObject compile biding from metadata and a map to the qualifiers.
	 *
	 * @param propertyWithSemanticObject The property that holds semanticObject annotataions if it exists
	 * @returns An object containing semanticObjectList and qualifierMap
	 */
	_getSemanticObjectsForPayloadAndQualifierMap: function (propertyWithSemanticObject: Property | NavigationProperty | undefined) {
		const qualifierMap: { [key: string]: CompiledBindingToolkitExpression } = {};
		const semanticObjectsList: string[] = [];
		if (propertyWithSemanticObject !== undefined) {
			for (const semanticObject of getSemanticObjects(propertyWithSemanticObject)) {
				const compiledSemanticObject = compileExpression(
					getExpressionFromAnnotation(semanticObject) as BindingToolkitExpression<string>
				);
				// this should not happen, but we make sure not to add twice the semanticObject otherwise the mdcLink crashes
				if (compiledSemanticObject && !semanticObjectsList.includes(compiledSemanticObject)) {
					qualifierMap[semanticObject.qualifier || ""] = compiledSemanticObject;
					semanticObjectsList.push(compiledSemanticObject);
				}
			}
		}
		return { semanticObjectsList, qualifierMap };
	},
	/**
	 * Get the semanticObjectMappings from metadata in the payload expected structure.
	 *
	 * @param propertyWithSemanticObject
	 * @param qualifierMap
	 * @returns A payload structure for semanticObjectMappings
	 */
	_getSemanticObjectMappingsForPayload: function (
		propertyWithSemanticObject: Property | NavigationProperty | undefined,
		qualifierMap: { [key: string]: CompiledBindingToolkitExpression }
	) {
		const semanticObjectMappings: RegisteredSemanticObjectMapping[] = [];
		if (propertyWithSemanticObject !== undefined) {
			for (const semanticObjectMapping of getSemanticObjectMappings(propertyWithSemanticObject)) {
				const correspondingSemanticObject = qualifierMap[semanticObjectMapping.qualifier || ""];
				if (correspondingSemanticObject) {
					semanticObjectMappings.push({
						semanticObject: correspondingSemanticObject,
						items: semanticObjectMapping.map((semanticObjectMappingType) => {
							return {
								key: semanticObjectMappingType.LocalProperty.value,
								value: semanticObjectMappingType.SemanticObjectProperty.valueOf() as string
							};
						})
					});
				}
			}
		}
		return semanticObjectMappings;
	},
	/**
	 * Get the semanticObjectUnavailableActions from metadata in the payload expected structure.
	 *
	 * @param propertyWithSemanticObject
	 * @param qualifierMap
	 * @returns A payload structure for semanticObjectUnavailableActions
	 */
	_getSemanticObjectUnavailableActionsForPayload: function (
		propertyWithSemanticObject: Property | NavigationProperty | undefined,
		qualifierMap: { [key: string]: CompiledBindingToolkitExpression }
	) {
		const semanticObjectUnavailableActions: RegisteredSemanticObjectUnavailableActions = [];
		if (propertyWithSemanticObject !== undefined) {
			for (const unavailableActionAnnotation of getSemanticObjectUnavailableActions(propertyWithSemanticObject) as ({
				term: CommonAnnotationTerms.SemanticObjectUnavailableActions;
			} & AnnotationTerm<Edm.String[]>)[]) {
				const correspondingSemanticObject = qualifierMap[unavailableActionAnnotation.qualifier || ""];
				if (correspondingSemanticObject) {
					semanticObjectUnavailableActions.push({
						semanticObject: correspondingSemanticObject,
						actions: unavailableActionAnnotation.map((unavailableAction) => unavailableAction as string)
					});
				}
			}
		}
		return semanticObjectUnavailableActions;
	},
	/**
	 * Add customObject(s) to the semanticObject list for the payload if it exists.
	 *
	 * @param semanticObjectsList
	 * @param customSemanticObject
	 */
	_addCustomSemanticObjectToSemanticObjectListForPayload: function (
		semanticObjectsList: string[],
		customSemanticObject: string | undefined
	): void {
		if (customSemanticObject) {
			// the custom semantic objects are either a single string/key to custom data or a stringified array
			if (customSemanticObject[0] !== "[") {
				// customSemanticObject = "semanticObject" | "{pathInModel}"
				if (semanticObjectsList.indexOf(customSemanticObject) === -1) {
					semanticObjectsList.push(customSemanticObject);
				}
			} else {
				// customSemanticObject = '["semanticObject1","semanticObject2"]'
				for (const semanticObject of JSON.parse(customSemanticObject)) {
					if (semanticObjectsList.indexOf(semanticObject) === -1) {
						semanticObjectsList.push(semanticObject);
					}
				}
			}
		}
	},
	/**
	 * Get the navigationProperty to an entity with QuickViewFacets that can be linked to the property.
	 *
	 * @param propertyDataModelPath
	 * @returns A navigation property if it exists.
	 */
	_getNavPropToQuickViewEntity: function (propertyDataModelPath: DataModelObjectPath) {
		//TODO we should investigate to put this code as common with FieldTemplating.isUsedInNavigationWithQuickViewFacets
		const property = propertyDataModelPath.targetObject as Property;
		const navigationProperties = propertyDataModelPath.targetEntityType.navigationProperties;
		let quickViewNavProp = navigationProperties.find((navProp: NavigationProperty) => {
			return navProp.referentialConstraint?.some((referentialConstraint) => {
				return referentialConstraint?.sourceProperty === property.name && navProp?.targetType?.annotations?.UI?.QuickViewFacets;
			});
		});
		if (!quickViewNavProp && propertyDataModelPath.contextLocation?.targetEntitySet !== propertyDataModelPath.targetEntitySet) {
			const semanticKeys = propertyDataModelPath?.targetEntityType?.annotations?.Common?.SemanticKey || [];
			const isPropertySemanticKey = semanticKeys.some(function (semanticKey) {
				return semanticKey?.$target?.name === property.name;
			});
			const lastNavProp = propertyDataModelPath.navigationProperties[propertyDataModelPath.navigationProperties.length - 1];
			if ((isPropertySemanticKey || property.isKey) && propertyDataModelPath?.targetEntityType?.annotations?.UI?.QuickViewFacets) {
				quickViewNavProp = lastNavProp as unknown as NavigationProperty;
			}
		}
		return quickViewNavProp;
	}
});

export default QuickView;
