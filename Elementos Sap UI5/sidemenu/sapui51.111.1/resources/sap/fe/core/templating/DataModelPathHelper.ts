import type {
	ConvertedMetadata,
	EntitySet,
	EntityType,
	NavigationProperty,
	Property,
	PropertyPath,
	Singleton
} from "@sap-ux/vocabularies-types";
import type {
	FilterExpressionRestrictionTypeTypes,
	NavigationPropertyRestriction,
	NavigationPropertyRestrictionTypes
} from "@sap-ux/vocabularies-types/vocabularies/Capabilities";
import type {
	EntitySetAnnotations_Capabilities,
	EntityTypeAnnotations_Capabilities
} from "@sap-ux/vocabularies-types/vocabularies/Capabilities_Edm";
import type { BindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { constant, equal, getExpressionFromAnnotation, unresolvableExpression } from "sap/fe/core/helpers/BindingToolkit";
import type { PropertyOrPath } from "sap/fe/core/templating/DisplayModeFormatter";
import { isAnnotationPathExpression, isPathExpression } from "sap/fe/core/templating/PropertyHelper";

export type DataModelObjectPath = {
	startingEntitySet: Singleton | EntitySet;
	contextLocation?: DataModelObjectPath;
	navigationProperties: (NavigationProperty | Property)[];
	targetEntitySet?: Singleton | EntitySet;
	targetEntityType: EntityType;
	targetObject: any;
	convertedTypes: ConvertedMetadata;
};

type ExtractionParametersOnPath = {
	propertyPath?: PropertyOrPath<Property>;
	pathVisitor?: Function;
	ignoreTargetCollection?: boolean;
	authorizeUnresolvable?: boolean;
};

/**
 * Function that returns the relative path to the property from the DataModelObjectPath.
 *
 * @param contextPath The DataModelObjectPath object to the property
 * @returns The path from the root entity set.
 */
export const getRelativePaths = function (contextPath: DataModelObjectPath) {
	return getPathRelativeLocation(contextPath?.contextLocation, contextPath?.navigationProperties).map((np) => np.name);
};

export const getPathRelativeLocation = function (
	contextPath?: DataModelObjectPath,
	visitedNavProps: (NavigationProperty | Property)[] = []
): (NavigationProperty | Property)[] {
	if (!contextPath) {
		return visitedNavProps;
	} else if (visitedNavProps.length >= contextPath.navigationProperties.length) {
		let remainingNavProps: (NavigationProperty | Property)[] = [];
		contextPath.navigationProperties.forEach((navProp, navIndex) => {
			if (visitedNavProps[navIndex] !== navProp) {
				remainingNavProps.push(visitedNavProps[navIndex]);
			}
		});
		remainingNavProps = remainingNavProps.concat(visitedNavProps.slice(contextPath.navigationProperties.length));
		// Clean up NavProp -> Owner
		let currentIdx = 0;
		while (remainingNavProps.length > 1 && currentIdx != remainingNavProps.length - 1) {
			const currentNav = remainingNavProps[currentIdx];
			const nextNavProp = remainingNavProps[currentIdx + 1];
			if (currentNav._type === "NavigationProperty" && currentNav.partner === nextNavProp.name) {
				remainingNavProps.splice(0, 2);
			} else {
				currentIdx++;
			}
		}
		return remainingNavProps;
	} else {
		let extraNavProp: (NavigationProperty | Property)[] = [];
		visitedNavProps.forEach((navProp, navIndex) => {
			if (contextPath.navigationProperties[navIndex] !== navProp) {
				extraNavProp.push(visitedNavProps[navIndex]);
			}
		});
		extraNavProp = extraNavProp.concat(contextPath.navigationProperties.slice(visitedNavProps.length));
		// Clean up NavProp -> Owner
		let currentIdx = 0;
		while (extraNavProp.length > 1 && currentIdx != extraNavProp.length - 1) {
			const currentNav = extraNavProp[currentIdx];
			const nextNavProp = extraNavProp[currentIdx + 1];
			if (currentNav._type === "NavigationProperty" && currentNav.partner === nextNavProp.name) {
				extraNavProp.splice(0, 2);
			} else {
				currentIdx++;
			}
		}
		extraNavProp = extraNavProp.map((navProp) => {
			return navProp._type === "NavigationProperty"
				? (navProp.targetType.navigationProperties.find((np) => np.name === navProp.partner) as NavigationProperty)
				: navProp;
		});
		return extraNavProp;
	}
};

export const enhanceDataModelPath = function (
	dataModelObjectPath: DataModelObjectPath,
	propertyPath?: PropertyOrPath<Property>
): DataModelObjectPath {
	let sPropertyPath: string = "";
	if ((isPathExpression(propertyPath) || isAnnotationPathExpression(propertyPath)) && propertyPath.path) {
		sPropertyPath = propertyPath.path;
	} else if (typeof propertyPath === "string") {
		sPropertyPath = propertyPath;
	}
	let oTarget;
	if (isPathExpression(propertyPath) || isAnnotationPathExpression(propertyPath)) {
		oTarget = propertyPath.$target;
	} else if (dataModelObjectPath.targetEntityType) {
		oTarget = dataModelObjectPath.targetEntityType.resolvePath(sPropertyPath);
	} else {
		oTarget = dataModelObjectPath.targetObject;
	}
	const aPathSplit = sPropertyPath.split("/");
	let currentEntitySet = dataModelObjectPath.targetEntitySet;
	let currentEntityType = dataModelObjectPath.targetEntityType;
	const navigationProperties = dataModelObjectPath.navigationProperties.concat();
	// Process only if we have to go through navigation properties

	let reducedEntityType: EntityType | undefined = dataModelObjectPath.targetEntityType;
	aPathSplit.forEach((pathPart: string) => {
		if (!reducedEntityType) {
			return;
		}
		const potentialNavProp = reducedEntityType.navigationProperties.find((navProp) => navProp.name === pathPart);
		if (potentialNavProp) {
			navigationProperties.push(potentialNavProp);
			currentEntityType = potentialNavProp.targetType;
			if (currentEntitySet && currentEntitySet.navigationPropertyBinding.hasOwnProperty(pathPart)) {
				currentEntitySet = currentEntitySet.navigationPropertyBinding[pathPart] as EntitySet;
			}
			reducedEntityType = currentEntityType;
		} else {
			const potentialComplexType = reducedEntityType.entityProperties.find((navProp) => navProp.name === pathPart);
			if (potentialComplexType?.targetType) {
				navigationProperties.push(potentialComplexType);
				reducedEntityType = currentEntityType;
			} else {
				reducedEntityType = undefined;
			}
		}
	});

	return {
		startingEntitySet: dataModelObjectPath.startingEntitySet,
		navigationProperties: navigationProperties,
		contextLocation: dataModelObjectPath.contextLocation,
		targetEntitySet: currentEntitySet,
		targetEntityType: currentEntityType,
		targetObject: oTarget,
		convertedTypes: dataModelObjectPath.convertedTypes
	};
};

export const getTargetEntitySetPath = function (dataModelObjectPath: DataModelObjectPath): string {
	let targetEntitySetPath: string = `/${dataModelObjectPath.startingEntitySet.name}`;
	let currentEntitySet = dataModelObjectPath.startingEntitySet;
	let navigatedPaths: string[] = [];
	dataModelObjectPath.navigationProperties.forEach((navProp) => {
		navigatedPaths.push(navProp.name);
		if (currentEntitySet && currentEntitySet.navigationPropertyBinding.hasOwnProperty(navigatedPaths.join("/"))) {
			targetEntitySetPath += `/$NavigationPropertyBinding/${navigatedPaths.join("/")}/$`;
			currentEntitySet = currentEntitySet.navigationPropertyBinding[navigatedPaths.join("/")] as EntitySet;
			navigatedPaths = [];
		}
	});
	return targetEntitySetPath;
};

export const getTargetObjectPath = function (dataModelObjectPath: DataModelObjectPath, bRelative: boolean = false): string {
	let path = "";
	if (!dataModelObjectPath.startingEntitySet) {
		return "/";
	}
	if (!bRelative) {
		path += `/${dataModelObjectPath.startingEntitySet.name}`;
	}
	if (dataModelObjectPath.navigationProperties.length > 0) {
		path = setTrailingSlash(path);
		path += dataModelObjectPath.navigationProperties.map((navProp) => navProp.name).join("/");
	}

	if (
		dataModelObjectPath.targetObject?.name &&
		dataModelObjectPath.targetObject._type !== "NavigationProperty" &&
		dataModelObjectPath.targetObject._type !== "EntityType" &&
		dataModelObjectPath.targetObject._type !== "EntitySet" &&
		dataModelObjectPath.targetObject !== dataModelObjectPath.startingEntitySet
	) {
		path = setTrailingSlash(path);
		path += `${dataModelObjectPath.targetObject.name}`;
	} else if (dataModelObjectPath.targetObject && dataModelObjectPath.targetObject.hasOwnProperty("term")) {
		path = setTrailingSlash(path);
		path += `@${dataModelObjectPath.targetObject.term}`;
		if (dataModelObjectPath.targetObject.hasOwnProperty("qualifier") && !!dataModelObjectPath.targetObject.qualifier) {
			path += `#${dataModelObjectPath.targetObject.qualifier}`;
		}
	}
	return path;
};

export const getContextRelativeTargetObjectPath = function (
	dataModelObjectPath: DataModelObjectPath,
	forBindingExpression: boolean = false,
	forFilterConditionPath: boolean = false
): string | undefined {
	if (dataModelObjectPath.contextLocation?.startingEntitySet !== dataModelObjectPath.startingEntitySet) {
		return getTargetObjectPath(dataModelObjectPath);
	}
	return _getContextRelativeTargetObjectPath(dataModelObjectPath, forBindingExpression, forFilterConditionPath);
};

const _getContextRelativeTargetObjectPath = function (
	dataModelObjectPath: DataModelObjectPath,
	forBindingExpression: boolean = false,
	forFilterConditionPath: boolean = false
): string | undefined {
	const navProperties = getPathRelativeLocation(dataModelObjectPath.contextLocation, dataModelObjectPath.navigationProperties);
	if (forBindingExpression) {
		if (navProperties.find((np) => np._type === "NavigationProperty" && np.isCollection)) {
			return undefined;
		}
	}
	let path = forFilterConditionPath
		? navProperties
				.map((navProp) => {
					const isCollection = navProp._type === "NavigationProperty" && navProp.isCollection;
					return isCollection ? `${navProp.name}*` : navProp.name;
				})
				.join("/")
		: navProperties.map((navProp) => navProp.name).join("/");

	if (
		dataModelObjectPath.targetObject &&
		(dataModelObjectPath.targetObject.name ||
			(dataModelObjectPath.targetObject.type === "PropertyPath" && dataModelObjectPath.targetObject.value)) &&
		dataModelObjectPath.targetObject._type !== "NavigationProperty" &&
		dataModelObjectPath.targetObject._type !== "EntityType" &&
		dataModelObjectPath.targetObject._type !== "EntitySet" &&
		dataModelObjectPath.targetObject !== dataModelObjectPath.startingEntitySet
	) {
		path = setTrailingSlash(path);
		path +=
			dataModelObjectPath.targetObject.type === "PropertyPath"
				? `${dataModelObjectPath.targetObject.value}`
				: `${dataModelObjectPath.targetObject.name}`;
	} else if (dataModelObjectPath.targetObject && dataModelObjectPath.targetObject.hasOwnProperty("term")) {
		path = setTrailingSlash(path);
		path += `@${dataModelObjectPath.targetObject.term}`;
		if (dataModelObjectPath.targetObject.hasOwnProperty("qualifier") && !!dataModelObjectPath.targetObject.qualifier) {
			path += `#${dataModelObjectPath.targetObject.qualifier}`;
		}
	} else if (!dataModelObjectPath.targetObject) {
		return undefined;
	}
	return path;
};

export const isPathUpdatable = function (
	dataModelObjectPath: DataModelObjectPath | undefined,
	extractionParametersOnPath?: ExtractionParametersOnPath
): BindingToolkitExpression<boolean> {
	return checkOnPath(
		dataModelObjectPath,
		(annotationObject: NavigationPropertyRestriction | EntitySetAnnotations_Capabilities) => {
			return annotationObject?.UpdateRestrictions?.Updatable;
		},
		extractionParametersOnPath
	);
};

export const isPathSearchable = function (
	dataModelObjectPath: DataModelObjectPath | undefined,
	extractionParametersOnPath?: ExtractionParametersOnPath
): BindingToolkitExpression<boolean> {
	return checkOnPath(
		dataModelObjectPath,
		(annotationObject: NavigationPropertyRestriction | EntitySetAnnotations_Capabilities) => {
			return annotationObject?.SearchRestrictions?.Searchable;
		},
		extractionParametersOnPath
	);
};

export const isPathDeletable = function (
	dataModelObjectPath: DataModelObjectPath | undefined,
	extractionParametersOnPath?: ExtractionParametersOnPath
): BindingToolkitExpression<boolean> {
	return checkOnPath(
		dataModelObjectPath,
		(annotationObject: NavigationPropertyRestriction | EntitySetAnnotations_Capabilities) => {
			return annotationObject?.DeleteRestrictions?.Deletable;
		},
		extractionParametersOnPath
	);
};

export const isPathInsertable = function (
	dataModelObjectPath: DataModelObjectPath | undefined,
	extractionParametersOnPath?: ExtractionParametersOnPath
): BindingToolkitExpression<boolean> {
	return checkOnPath(
		dataModelObjectPath,
		(annotationObject: NavigationPropertyRestriction | EntitySetAnnotations_Capabilities) => {
			return annotationObject?.InsertRestrictions?.Insertable;
		},
		extractionParametersOnPath
	);
};

export const checkFilterExpressionRestrictions = function (
	dataModelObjectPath: DataModelObjectPath,
	allowedExpression: (string | undefined)[]
): BindingToolkitExpression<boolean> {
	return checkOnPath(
		dataModelObjectPath,
		(annotationObject: NavigationPropertyRestriction | EntitySetAnnotations_Capabilities | EntityTypeAnnotations_Capabilities) => {
			if (annotationObject && "FilterRestrictions" in annotationObject) {
				const filterExpressionRestrictions: FilterExpressionRestrictionTypeTypes[] =
					(annotationObject?.FilterRestrictions?.FilterExpressionRestrictions as FilterExpressionRestrictionTypeTypes[]) || [];
				const currentObjectRestriction = filterExpressionRestrictions.find((restriction) => {
					return (restriction.Property as PropertyPath).$target === dataModelObjectPath.targetObject;
				});
				if (currentObjectRestriction) {
					return allowedExpression.indexOf(currentObjectRestriction?.AllowedExpressions?.toString()) !== -1;
				} else {
					return false;
				}
			} else {
				return false;
			}
		}
	);
};

export const checkOnPath = function (
	dataModelObjectPath: DataModelObjectPath | undefined,
	checkFunction: Function,
	extractionParametersOnPath?: ExtractionParametersOnPath
): BindingToolkitExpression<boolean> {
	if (!dataModelObjectPath || !dataModelObjectPath.startingEntitySet) {
		return constant(true);
	}

	dataModelObjectPath = enhanceDataModelPath(dataModelObjectPath, extractionParametersOnPath?.propertyPath);

	let currentEntitySet: EntitySet | Singleton | null = dataModelObjectPath.startingEntitySet;
	let parentEntitySet: EntitySet | Singleton | null = null;
	let visitedNavigationPropsName: string[] = [];
	const allVisitedNavigationProps: (NavigationProperty | Property)[] = [];
	let targetEntitySet: EntitySet | Singleton | null = currentEntitySet;
	const targetEntityType: EntityType | null = dataModelObjectPath.targetEntityType;
	let resetVisitedNavProps = false;

	dataModelObjectPath.navigationProperties.forEach((navigationProperty) => {
		if (resetVisitedNavProps) {
			visitedNavigationPropsName = [];
		}
		visitedNavigationPropsName.push(navigationProperty.name);
		allVisitedNavigationProps.push(navigationProperty);
		if (navigationProperty._type === "Property" || !navigationProperty.containsTarget) {
			// We should have a navigationPropertyBinding associated with the path so far which can consist of ([ContainmentNavProp]/)*[NavProp]
			const fullNavigationPath = visitedNavigationPropsName.join("/");
			if (currentEntitySet && currentEntitySet.navigationPropertyBinding.hasOwnProperty(fullNavigationPath)) {
				parentEntitySet = currentEntitySet;
				currentEntitySet = currentEntitySet.navigationPropertyBinding[fullNavigationPath];
				targetEntitySet = currentEntitySet;
				// If we reached a navigation property with a navigationpropertybinding, we need to reset the visited path on the next iteration (if there is one)
				resetVisitedNavProps = true;
			} else {
				// We really should not end up here but at least let's try to avoid incorrect behavior
				parentEntitySet = currentEntitySet;
				currentEntitySet = null;
				resetVisitedNavProps = true;
			}
		} else {
			parentEntitySet = currentEntitySet;
			targetEntitySet = null;
		}
	});

	// At this point we have navigated down all the nav prop and we should have
	// The target entitySet pointing to either null (in case of containment navprop a last part), or the actual target (non containment as target)
	// The parent entitySet pointing to the previous entitySet used in the path
	// VisitedNavigationPath should contain the path up to this property

	// Restrictions should then be evaluated as ParentEntitySet.NavRestrictions[NavPropertyPath] || TargetEntitySet.Restrictions
	const fullNavigationPath = visitedNavigationPropsName.join("/");
	let restrictions, visitedNavProps;
	if (parentEntitySet !== null) {
		const _parentEntitySet: EntitySet = parentEntitySet;
		_parentEntitySet.annotations?.Capabilities?.NavigationRestrictions?.RestrictedProperties.forEach(
			(restrictedNavProp: NavigationPropertyRestrictionTypes) => {
				if (restrictedNavProp.NavigationProperty?.type === "NavigationPropertyPath") {
					const restrictionDefinition = checkFunction(restrictedNavProp);
					if (fullNavigationPath === restrictedNavProp.NavigationProperty.value && restrictionDefinition !== undefined) {
						const _allVisitedNavigationProps = allVisitedNavigationProps.slice(0, -1);
						visitedNavProps = _allVisitedNavigationProps;
						const pathRelativeLocation = getPathRelativeLocation(dataModelObjectPath?.contextLocation, visitedNavProps).map(
							(np) => np.name
						);
						const pathVisitorFunction = extractionParametersOnPath?.pathVisitor
							? getPathVisitorForSingleton(extractionParametersOnPath.pathVisitor, pathRelativeLocation)
							: undefined; // send pathVisitor function only when it is defined and only send function or defined as a parameter
						restrictions = equal(
							getExpressionFromAnnotation(restrictionDefinition, pathRelativeLocation, undefined, pathVisitorFunction),
							true
						);
					}
				}
			}
		);
	}
	let targetRestrictions;
	if (!extractionParametersOnPath?.ignoreTargetCollection) {
		let restrictionDefinition = checkFunction(targetEntitySet?.annotations?.Capabilities);
		if (targetEntitySet === null && restrictionDefinition === undefined) {
			restrictionDefinition = checkFunction(targetEntityType?.annotations?.Capabilities);
		}
		if (restrictionDefinition !== undefined) {
			const pathRelativeLocation = getPathRelativeLocation(dataModelObjectPath.contextLocation, allVisitedNavigationProps).map(
				(np) => np.name
			);
			const pathVisitorFunction = extractionParametersOnPath?.pathVisitor
				? getPathVisitorForSingleton(extractionParametersOnPath.pathVisitor, pathRelativeLocation)
				: undefined;
			targetRestrictions = equal(
				getExpressionFromAnnotation(restrictionDefinition, pathRelativeLocation, undefined, pathVisitorFunction),
				true
			);
		}
	}

	return (
		restrictions || targetRestrictions || (extractionParametersOnPath?.authorizeUnresolvable ? unresolvableExpression : constant(true))
	);
};

/**
 * Set a trailing slash to a path if not already set.
 *
 * @param path The path
 * @returns The path with a trailing slash
 */
const setTrailingSlash = function (path: string) {
	if (path.length && !path.endsWith("/")) {
		return `${path}/`;
	}
	return path;
};

// This helper method is used to add relative path location argument to singletonPathVisitorFunction i.e. pathVisitor
// pathVisitor method is used later to get the correct bindings for singleton entity
// method is invoked later in pathInModel() method to get the correct binding.
const getPathVisitorForSingleton = function (pathVisitor: Function, pathRelativeLocation: string[]) {
	return function (path: string) {
		return pathVisitor(path, pathRelativeLocation);
	};
};
