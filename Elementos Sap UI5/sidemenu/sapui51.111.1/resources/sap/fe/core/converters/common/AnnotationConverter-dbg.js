/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
 sap.ui.define([], function() {
    var AnnotationConverter;
/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 634:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.convert = void 0;
const utils_1 = __webpack_require__(401);
/**
 *
 */
class Path {
    /**
     * @param pathExpression
     * @param targetName
     * @param annotationsTerm
     * @param term
     */
    constructor(pathExpression, targetName, annotationsTerm, term) {
        this.path = pathExpression.Path;
        this.type = 'Path';
        this.$target = targetName;
        this.term = term;
        this.annotationsTerm = annotationsTerm;
    }
}
/**
 * Creates a Map based on the fullyQualifiedName of each object part of the metadata.
 *
 * @param rawMetadata the rawMetadata we're working against
 * @returns the objectmap for easy access to the different object of the metadata
 */
function buildObjectMap(rawMetadata) {
    var _a;
    const objectMap = {};
    if ((_a = rawMetadata.schema.entityContainer) === null || _a === void 0 ? void 0 : _a.fullyQualifiedName) {
        objectMap[rawMetadata.schema.entityContainer.fullyQualifiedName] = rawMetadata.schema.entityContainer;
    }
    for (const entitySet of rawMetadata.schema.entitySets) {
        objectMap[entitySet.fullyQualifiedName] = entitySet;
    }
    for (const singleton of rawMetadata.schema.singletons) {
        objectMap[singleton.fullyQualifiedName] = singleton;
    }
    for (const action of rawMetadata.schema.actions) {
        objectMap[action.fullyQualifiedName] = action;
        if (action.isBound) {
            const unBoundActionName = action.fullyQualifiedName.split('(')[0];
            if (!objectMap[unBoundActionName]) {
                objectMap[unBoundActionName] = {
                    _type: 'UnboundGenericAction',
                    actions: []
                };
            }
            objectMap[unBoundActionName].actions.push(action);
            const actionSplit = action.fullyQualifiedName.split('(');
            objectMap[`${actionSplit[1].split(')')[0]}/${actionSplit[0]}`] = action;
        }
        for (const parameter of action.parameters) {
            objectMap[parameter.fullyQualifiedName] = parameter;
        }
    }
    for (const actionImport of rawMetadata.schema.actionImports) {
        objectMap[actionImport.fullyQualifiedName] = actionImport;
    }
    for (const complexType of rawMetadata.schema.complexTypes) {
        objectMap[complexType.fullyQualifiedName] = complexType;
        for (const property of complexType.properties) {
            objectMap[property.fullyQualifiedName] = property;
        }
    }
    for (const typeDefinition of rawMetadata.schema.typeDefinitions) {
        objectMap[typeDefinition.fullyQualifiedName] = typeDefinition;
    }
    for (const entityType of rawMetadata.schema.entityTypes) {
        entityType.annotations = {}; // 'annotations' property is mandatory
        objectMap[entityType.fullyQualifiedName] = entityType;
        objectMap[`Collection(${entityType.fullyQualifiedName})`] = entityType;
        for (const property of entityType.entityProperties) {
            objectMap[property.fullyQualifiedName] = property;
            // Handle complex types
            const complexTypeDefinition = objectMap[property.type];
            if ((0, utils_1.isComplexTypeDefinition)(complexTypeDefinition)) {
                for (const complexTypeProp of complexTypeDefinition.properties) {
                    const complexTypePropTarget = Object.assign(complexTypeProp, {
                        _type: 'Property',
                        fullyQualifiedName: property.fullyQualifiedName + '/' + complexTypeProp.name
                    });
                    objectMap[complexTypePropTarget.fullyQualifiedName] = complexTypePropTarget;
                }
            }
        }
        for (const navProperty of entityType.navigationProperties) {
            objectMap[navProperty.fullyQualifiedName] = navProperty;
        }
    }
    for (const annotationSource of Object.keys(rawMetadata.schema.annotations)) {
        for (const annotationList of rawMetadata.schema.annotations[annotationSource]) {
            const currentTargetName = (0, utils_1.unalias)(rawMetadata.references, annotationList.target);
            annotationList.annotations.forEach((annotation) => {
                let annotationFQN = `${currentTargetName}@${(0, utils_1.unalias)(rawMetadata.references, annotation.term)}`;
                if (annotation.qualifier) {
                    annotationFQN += `#${annotation.qualifier}`;
                }
                objectMap[annotationFQN] = annotation;
                annotation.fullyQualifiedName = annotationFQN;
            });
        }
    }
    return objectMap;
}
/**
 * Combine two strings representing path in the metamodel while ensuring their specificities (annotation...) are respected.
 *
 * @param currentTarget the current path
 * @param path the part we want to append
 * @returns the complete path including the extension.
 */
function combinePath(currentTarget, path) {
    if (path.startsWith('@')) {
        return currentTarget + (0, utils_1.unalias)(utils_1.defaultReferences, path);
    }
    else {
        return currentTarget + '/' + path;
    }
}
const ALL_ANNOTATION_ERRORS = {};
let ANNOTATION_ERRORS = [];
/**
 * @param path
 * @param oErrorMsg
 */
function addAnnotationErrorMessage(path, oErrorMsg) {
    if (!ALL_ANNOTATION_ERRORS[path]) {
        ALL_ANNOTATION_ERRORS[path] = [oErrorMsg];
    }
    else {
        ALL_ANNOTATION_ERRORS[path].push(oErrorMsg);
    }
}
/**
 * Resolves a specific path based on the objectMap.
 *
 * @param objectMap
 * @param currentTarget
 * @param path
 * @param pathOnly
 * @param includeVisitedObjects
 * @param annotationsTerm
 * @returns the resolved object
 */
function _resolveTarget(objectMap, currentTarget, path, pathOnly = false, includeVisitedObjects = false, annotationsTerm) {
    let oErrorMsg;
    if (!path) {
        return undefined;
    }
    const aVisitedObjects = [];
    if (currentTarget && currentTarget._type === 'Property') {
        currentTarget = objectMap[currentTarget.fullyQualifiedName.split('/')[0]];
    }
    path = combinePath(currentTarget.fullyQualifiedName, path);
    const pathSplit = path.split('/');
    const targetPathSplit = [];
    pathSplit.forEach((pathPart) => {
        // Separate out the annotation
        if (pathPart.indexOf('@') !== -1) {
            const [splittedPath, annotationPath] = pathPart.split('@');
            targetPathSplit.push(splittedPath);
            targetPathSplit.push(`@${annotationPath}`);
        }
        else {
            targetPathSplit.push(pathPart);
        }
    });
    let currentPath = path;
    let currentContext = currentTarget;
    const target = targetPathSplit.reduce((currentValue, pathPart) => {
        if (pathPart === '$Type' && currentValue._type === 'EntityType') {
            return currentValue;
        }
        if (pathPart === '$' && currentValue._type === 'EntitySet') {
            return currentValue;
        }
        if ((pathPart === '@$ui5.overload' || pathPart === '0') && currentValue._type === 'Action') {
            return currentValue;
        }
        if (pathPart.length === 0) {
            // Empty Path after an entitySet means entityType
            if (currentValue &&
                (currentValue._type === 'EntitySet' || currentValue._type === 'Singleton') &&
                currentValue.entityType) {
                if (includeVisitedObjects) {
                    aVisitedObjects.push(currentValue);
                }
                currentValue = currentValue.entityType;
            }
            if (currentValue && currentValue._type === 'NavigationProperty' && currentValue.targetType) {
                if (includeVisitedObjects) {
                    aVisitedObjects.push(currentValue);
                }
                currentValue = currentValue.targetType;
            }
            return currentValue;
        }
        if (includeVisitedObjects && currentValue !== null && currentValue !== undefined) {
            aVisitedObjects.push(currentValue);
        }
        if (!currentValue) {
            currentPath = pathPart;
        }
        else if ((currentValue._type === 'EntitySet' || currentValue._type === 'Singleton') && pathPart === '$Type') {
            currentValue = currentValue.targetType;
            return currentValue;
        }
        else if ((currentValue._type === 'EntitySet' || currentValue._type === 'Singleton') &&
            pathPart === '$NavigationPropertyBinding') {
            currentValue = currentValue.navigationPropertyBinding;
            return currentValue;
        }
        else if ((currentValue._type === 'EntitySet' || currentValue._type === 'Singleton') &&
            currentValue.entityType) {
            currentPath = combinePath(currentValue.entityTypeName, pathPart);
        }
        else if (currentValue._type === 'NavigationProperty') {
            currentPath = combinePath(currentValue.fullyQualifiedName, pathPart);
            if (!objectMap[currentPath]) {
                // Fallback log error
                currentPath = combinePath(currentValue.targetTypeName, pathPart);
            }
        }
        else if (currentValue._type === 'Property') {
            // ComplexType or Property
            if (currentValue.targetType) {
                currentPath = combinePath(currentValue.targetType.fullyQualifiedName, pathPart);
            }
            else {
                currentPath = combinePath(currentValue.fullyQualifiedName, pathPart);
            }
        }
        else if (currentValue._type === 'Action' && currentValue.isBound) {
            currentPath = combinePath(currentValue.fullyQualifiedName, pathPart);
            if (pathPart === '$Parameter') {
                return currentValue.parameters;
            }
            if (!objectMap[currentPath]) {
                currentPath = combinePath(currentValue.sourceType, pathPart);
            }
        }
        else if (currentValue._type === 'ActionParameter') {
            currentPath = combinePath(currentTarget.fullyQualifiedName.substring(0, currentTarget.fullyQualifiedName.lastIndexOf('/')), pathPart);
            if (!objectMap[currentPath]) {
                let lastIdx = currentTarget.fullyQualifiedName.lastIndexOf('/');
                if (lastIdx === -1) {
                    lastIdx = currentTarget.fullyQualifiedName.length;
                }
                currentPath = combinePath(objectMap[currentTarget.fullyQualifiedName.substring(0, lastIdx)].sourceType, pathPart);
            }
        }
        else {
            currentPath = combinePath(currentValue.fullyQualifiedName, pathPart);
            if (pathPart !== 'name' && currentValue[pathPart] !== undefined) {
                return currentValue[pathPart];
            }
            else if (pathPart === '$AnnotationPath' && currentValue.$target) {
                const contextToResolve = objectMap[currentValue.fullyQualifiedName.split('@')[0]];
                const subTarget = _resolveTarget(objectMap, contextToResolve, currentValue.value, false, true);
                subTarget.visitedObjects.forEach((visitedSubObject) => {
                    if (aVisitedObjects.indexOf(visitedSubObject) === -1) {
                        aVisitedObjects.push(visitedSubObject);
                    }
                });
                return subTarget.target;
            }
            else if (pathPart === '$Path' && currentValue.$target) {
                currentContext = aVisitedObjects
                    .concat()
                    .reverse()
                    .find((obj) => obj._type === 'EntityType' ||
                    obj._type === 'EntitySet' ||
                    obj._type === 'Singleton' ||
                    obj._type === 'NavigationProperty');
                if (currentContext) {
                    const subTarget = _resolveTarget(objectMap, currentContext, currentValue.path, false, true);
                    subTarget.visitedObjects.forEach((visitedSubObject) => {
                        if (aVisitedObjects.indexOf(visitedSubObject) === -1) {
                            aVisitedObjects.push(visitedSubObject);
                        }
                    });
                    return subTarget.target;
                }
                return currentValue.$target;
            }
            else if (pathPart.startsWith('$Path') && currentValue.$target) {
                const intermediateTarget = currentValue.$target;
                currentPath = combinePath(intermediateTarget.fullyQualifiedName, pathPart.substring(5));
            }
            else if (currentValue.hasOwnProperty('$Type') && !objectMap[currentPath]) {
                // This is now an annotation value
                const entityType = objectMap[currentValue.fullyQualifiedName.split('@')[0]];
                if (entityType) {
                    currentPath = combinePath(entityType.fullyQualifiedName, pathPart);
                }
            }
        }
        return objectMap[currentPath];
    }, null);
    if (!target) {
        if (annotationsTerm) {
            const annotationType = inferTypeFromTerm(annotationsTerm, currentTarget);
            oErrorMsg = {
                message: 'Unable to resolve the path expression: ' +
                    '\n' +
                    path +
                    '\n' +
                    '\n' +
                    'Hint: Check and correct the path values under the following structure in the metadata (annotation.xml file or CDS annotations for the application): \n\n' +
                    '<Annotation Term = ' +
                    annotationsTerm +
                    '>' +
                    '\n' +
                    '<Record Type = ' +
                    annotationType +
                    '>' +
                    '\n' +
                    '<AnnotationPath = ' +
                    path +
                    '>'
            };
            addAnnotationErrorMessage(path, oErrorMsg);
        }
        else {
            oErrorMsg = {
                message: 'Unable to resolve the path expression: ' +
                    path +
                    '\n' +
                    '\n' +
                    'Hint: Check and correct the path values under the following structure in the metadata (annotation.xml file or CDS annotations for the application): \n\n' +
                    '<Annotation Term = ' +
                    pathSplit[0] +
                    '>' +
                    '\n' +
                    '<PropertyValue  Path= ' +
                    pathSplit[1] +
                    '>'
            };
            addAnnotationErrorMessage(path, oErrorMsg);
        }
    }
    if (pathOnly) {
        return currentPath;
    }
    if (includeVisitedObjects) {
        return {
            visitedObjects: aVisitedObjects,
            target: target
        };
    }
    return target;
}
/**
 * Typeguard to check if the path contains an annotation.
 *
 * @param pathStr the path to evaluate
 * @returns true if there is an annotation in the path.
 */
function isAnnotationPath(pathStr) {
    return pathStr.indexOf('@') !== -1;
}
function parseValue(propertyValue, valueFQN, objectMap, context) {
    if (propertyValue === undefined) {
        return undefined;
    }
    switch (propertyValue.type) {
        case 'String':
            return propertyValue.String;
        case 'Int':
            return propertyValue.Int;
        case 'Bool':
            return propertyValue.Bool;
        case 'Decimal':
            return (0, utils_1.Decimal)(propertyValue.Decimal);
        case 'Date':
            return propertyValue.Date;
        case 'EnumMember':
            return (0, utils_1.alias)(context.rawMetadata.references, propertyValue.EnumMember);
        case 'PropertyPath':
            return {
                type: 'PropertyPath',
                value: propertyValue.PropertyPath,
                fullyQualifiedName: valueFQN,
                $target: _resolveTarget(objectMap, context.currentTarget, propertyValue.PropertyPath, false, false, context.currentTerm)
            };
        case 'NavigationPropertyPath':
            return {
                type: 'NavigationPropertyPath',
                value: propertyValue.NavigationPropertyPath,
                fullyQualifiedName: valueFQN,
                $target: _resolveTarget(objectMap, context.currentTarget, propertyValue.NavigationPropertyPath, false, false, context.currentTerm)
            };
        case 'AnnotationPath':
            const annotationTarget = _resolveTarget(objectMap, context.currentTarget, (0, utils_1.unalias)(context.rawMetadata.references, propertyValue.AnnotationPath), true, false, context.currentTerm);
            const annotationPath = {
                type: 'AnnotationPath',
                value: propertyValue.AnnotationPath,
                fullyQualifiedName: valueFQN,
                $target: annotationTarget,
                annotationsTerm: context.currentTerm,
                term: '',
                path: ''
            };
            context.unresolvedAnnotations.push({ inline: false, toResolve: annotationPath });
            return annotationPath;
        case 'Path':
            const $target = _resolveTarget(objectMap, context.currentTarget, propertyValue.Path, true, false, context.currentTerm);
            const path = new Path(propertyValue, $target, context.currentTerm, '');
            context.unresolvedAnnotations.push({
                inline: isAnnotationPath(propertyValue.Path),
                toResolve: path
            });
            return path;
        case 'Record':
            return parseRecord(propertyValue.Record, valueFQN, objectMap, context);
        case 'Collection':
            return parseCollection(propertyValue.Collection, valueFQN, objectMap, context);
        case 'Apply':
        case 'Null':
        case 'Not':
        case 'Eq':
        case 'Ne':
        case 'Gt':
        case 'Ge':
        case 'Lt':
        case 'Le':
        case 'If':
        case 'And':
        case 'Or':
        default:
            return propertyValue;
    }
}
/**
 * Infer the type of a term based on its type.
 *
 * @param annotationsTerm The annotation term
 * @param annotationTarget the annotation target
 * @param currentProperty the current property of the record
 * @returns the inferred type.
 */
function inferTypeFromTerm(annotationsTerm, annotationTarget, currentProperty) {
    let targetType = utils_1.TermToTypes[annotationsTerm];
    if (currentProperty) {
        annotationsTerm = annotationsTerm.split('.').slice(0, -1).join('.') + '.' + currentProperty;
        targetType = utils_1.TermToTypes[annotationsTerm];
    }
    const oErrorMsg = {
        isError: false,
        message: `The type of the record used within the term ${annotationsTerm} was not defined and was inferred as ${targetType}.
Hint: If possible, try to maintain the Type property for each Record.
<Annotations Target="${annotationTarget}">
	<Annotation Term="${annotationsTerm}">
		<Record>...</Record>
	</Annotation>
</Annotations>`
    };
    addAnnotationErrorMessage(annotationTarget + '/' + annotationsTerm, oErrorMsg);
    return targetType;
}
function isDataFieldWithForAction(annotationContent, annotationTerm) {
    return (annotationContent.hasOwnProperty('Action') &&
        (annotationTerm.$Type === 'com.sap.vocabularies.UI.v1.DataFieldForAction' ||
            annotationTerm.$Type === 'com.sap.vocabularies.UI.v1.DataFieldWithAction'));
}
function parseRecordType(recordDefinition, context) {
    let targetType;
    if (!recordDefinition.type && context.currentTerm) {
        targetType = inferTypeFromTerm(context.currentTerm, context.currentTarget.fullyQualifiedName, context.currentProperty);
    }
    else {
        targetType = (0, utils_1.unalias)(context.rawMetadata.references, recordDefinition.type);
    }
    return targetType;
}
function parseRecord(recordDefinition, currentFQN, objectMap, context) {
    const targetType = parseRecordType(recordDefinition, context);
    const annotationTerm = {
        $Type: targetType,
        fullyQualifiedName: currentFQN,
        annotations: {}
    };
    const annotationContent = {};
    if (Array.isArray(recordDefinition.annotations)) {
        const subAnnotationList = {
            target: currentFQN,
            annotations: recordDefinition.annotations,
            __source: context.currentSource
        };
        context.additionalAnnotations.push(subAnnotationList);
    }
    if (recordDefinition.propertyValues) {
        recordDefinition.propertyValues.forEach((propertyValue) => {
            var _a;
            context.currentProperty = propertyValue.name;
            annotationContent[propertyValue.name] = parseValue(propertyValue.value, `${currentFQN}/${propertyValue.name}`, objectMap, context);
            if (Array.isArray(propertyValue.annotations)) {
                const subAnnotationList = {
                    target: `${currentFQN}/${propertyValue.name}`,
                    annotations: propertyValue.annotations,
                    __source: context.currentSource
                };
                context.additionalAnnotations.push(subAnnotationList);
            }
            if (isDataFieldWithForAction(annotationContent, annotationTerm)) {
                // try to resolve to a bound action of the annotation target
                annotationContent.ActionTarget = (_a = context.currentTarget.actions) === null || _a === void 0 ? void 0 : _a[annotationContent.Action];
                if (!annotationContent.ActionTarget) {
                    const action = objectMap[annotationContent.Action];
                    if (action === null || action === void 0 ? void 0 : action.isBound) {
                        // bound action of a different entity type
                        annotationContent.ActionTarget = action;
                    }
                    else if (action) {
                        // unbound action --> resolve via the action import
                        annotationContent.ActionTarget = action.action;
                    }
                }
                if (!annotationContent.ActionTarget) {
                    // Add to diagnostics debugger;
                    ANNOTATION_ERRORS.push({
                        message: 'Unable to resolve the action ' +
                            annotationContent.Action +
                            ' defined for ' +
                            annotationTerm.fullyQualifiedName
                    });
                }
            }
        });
        context.currentProperty = undefined;
    }
    return Object.assign(annotationTerm, annotationContent);
}
/**
 * Retrieve or infer the collection type based on its content.
 *
 * @param collectionDefinition
 * @returns the type of the collection
 */
function getOrInferCollectionType(collectionDefinition) {
    let type = collectionDefinition.type;
    if (type === undefined && collectionDefinition.length > 0) {
        const firstColItem = collectionDefinition[0];
        if (firstColItem.hasOwnProperty('PropertyPath')) {
            type = 'PropertyPath';
        }
        else if (firstColItem.hasOwnProperty('Path')) {
            type = 'Path';
        }
        else if (firstColItem.hasOwnProperty('AnnotationPath')) {
            type = 'AnnotationPath';
        }
        else if (firstColItem.hasOwnProperty('NavigationPropertyPath')) {
            type = 'NavigationPropertyPath';
        }
        else if (typeof firstColItem === 'object' &&
            (firstColItem.hasOwnProperty('type') || firstColItem.hasOwnProperty('propertyValues'))) {
            type = 'Record';
        }
        else if (typeof firstColItem === 'string') {
            type = 'String';
        }
    }
    else if (type === undefined) {
        type = 'EmptyCollection';
    }
    return type;
}
function parseCollection(collectionDefinition, parentFQN, objectMap, context) {
    const collectionDefinitionType = getOrInferCollectionType(collectionDefinition);
    switch (collectionDefinitionType) {
        case 'PropertyPath':
            return collectionDefinition.map((propertyPath, propertyIdx) => {
                return {
                    type: 'PropertyPath',
                    value: propertyPath.PropertyPath,
                    fullyQualifiedName: `${parentFQN}/${propertyIdx}`,
                    $target: _resolveTarget(objectMap, context.currentTarget, propertyPath.PropertyPath, false, false, context.currentTerm)
                };
            });
        case 'Path':
            return collectionDefinition.map((pathValue) => {
                const $target = _resolveTarget(objectMap, context.currentTarget, pathValue.Path, true, false, context.currentTerm);
                const path = new Path(pathValue, $target, context.currentTerm, '');
                context.unresolvedAnnotations.push({
                    inline: isAnnotationPath(pathValue.Path),
                    toResolve: path
                });
                return path;
            });
        case 'AnnotationPath':
            return collectionDefinition.map((annotationPath, annotationIdx) => {
                const annotationTarget = _resolveTarget(objectMap, context.currentTarget, annotationPath.AnnotationPath, true, false, context.currentTerm);
                const annotationCollectionElement = {
                    type: 'AnnotationPath',
                    value: annotationPath.AnnotationPath,
                    fullyQualifiedName: `${parentFQN}/${annotationIdx}`,
                    $target: annotationTarget,
                    annotationsTerm: context.currentTerm,
                    term: '',
                    path: ''
                };
                context.unresolvedAnnotations.push({
                    inline: false,
                    toResolve: annotationCollectionElement
                });
                return annotationCollectionElement;
            });
        case 'NavigationPropertyPath':
            return collectionDefinition.map((navPropertyPath, navPropIdx) => {
                return {
                    type: 'NavigationPropertyPath',
                    value: navPropertyPath.NavigationPropertyPath,
                    fullyQualifiedName: `${parentFQN}/${navPropIdx}`,
                    $target: _resolveTarget(objectMap, context.currentTarget, navPropertyPath.NavigationPropertyPath, false, false, context.currentTerm)
                };
            });
        case 'Record':
            return collectionDefinition.map((recordDefinition, recordIdx) => {
                return parseRecord(recordDefinition, `${parentFQN}/${recordIdx}`, objectMap, context);
            });
        case 'Apply':
        case 'Null':
        case 'If':
        case 'Eq':
        case 'Ne':
        case 'Lt':
        case 'Gt':
        case 'Le':
        case 'Ge':
        case 'Not':
        case 'And':
        case 'Or':
            return collectionDefinition.map((ifValue) => {
                return ifValue;
            });
        case 'String':
            return collectionDefinition.map((stringValue) => {
                if (typeof stringValue === 'string') {
                    return stringValue;
                }
                else if (stringValue === undefined) {
                    return stringValue;
                }
                else {
                    return stringValue.String;
                }
            });
        default:
            if (collectionDefinition.length === 0) {
                return [];
            }
            throw new Error('Unsupported case');
    }
}
function convertAnnotation(annotation, objectMap, context) {
    if (annotation.record) {
        return parseRecord(annotation.record, annotation.fullyQualifiedName, objectMap, context);
    }
    else if (annotation.collection === undefined) {
        if (annotation.value) {
            return parseValue(annotation.value, annotation.fullyQualifiedName, objectMap, context);
        }
        else {
            return true;
        }
    }
    else if (annotation.collection) {
        const collection = parseCollection(annotation.collection, annotation.fullyQualifiedName, objectMap, context);
        collection.fullyQualifiedName = annotation.fullyQualifiedName;
        return collection;
    }
    else {
        throw new Error('Unsupported case');
    }
}
/**
 * Creates a resolvePath function for a given entityType.
 *
 * @param entityType The entityType for which the function should be created
 * @param objectMap The current objectMap
 * @returns the resolvePath function that starts at the entityType
 */
function createResolvePathFn(entityType, objectMap) {
    return function (relativePath, includeVisitedObjects) {
        const annotationTerm = '';
        return _resolveTarget(objectMap, entityType, relativePath, false, includeVisitedObjects, annotationTerm);
    };
}
function resolveV2NavigationProperty(navProp, associations, objectMap, outNavProp) {
    const targetAssociation = associations.find((association) => association.fullyQualifiedName === navProp.relationship);
    if (targetAssociation) {
        const associationEnd = targetAssociation.associationEnd.find((end) => end.role === navProp.toRole);
        if (associationEnd) {
            outNavProp.targetType = objectMap[associationEnd.type];
            outNavProp.isCollection = associationEnd.multiplicity === '*';
        }
    }
    outNavProp.referentialConstraint = navProp.referentialConstraint || [];
}
function resolveV4NavigationProperty(navProp, objectMap, outNavProp) {
    outNavProp.targetType = objectMap[navProp.targetTypeName];
    outNavProp.partner = navProp.partner;
    outNavProp.isCollection = navProp.isCollection;
    outNavProp.containsTarget = navProp.containsTarget;
    outNavProp.referentialConstraint = navProp.referentialConstraint;
}
function isV4NavigationProperty(navProp) {
    return !!navProp.targetTypeName;
}
function prepareNavigationProperties(navigationProperties, associations, objectMap) {
    return navigationProperties.map((navProp) => {
        const outNavProp = {
            _type: 'NavigationProperty',
            name: navProp.name,
            fullyQualifiedName: navProp.fullyQualifiedName,
            isCollection: false,
            containsTarget: false,
            referentialConstraint: [],
            annotations: {},
            partner: '',
            targetType: undefined,
            targetTypeName: ''
        };
        if (isV4NavigationProperty(navProp)) {
            resolveV4NavigationProperty(navProp, objectMap, outNavProp);
        }
        else {
            resolveV2NavigationProperty(navProp, associations, objectMap, outNavProp);
        }
        if (outNavProp.targetType) {
            outNavProp.targetTypeName = outNavProp.targetType.fullyQualifiedName;
        }
        objectMap[outNavProp.fullyQualifiedName] = outNavProp;
        return outNavProp;
    });
}
/**
 * @param entityTypes
 * @param associations
 * @param objectMap
 */
function resolveNavigationProperties(entityTypes, associations, objectMap) {
    entityTypes.forEach((entityType) => {
        entityType.navigationProperties = prepareNavigationProperties(entityType.navigationProperties, associations, objectMap);
        entityType.resolvePath = createResolvePathFn(entityType, objectMap);
    });
}
/**
 * @param namespace
 * @param actions
 * @param objectMap
 */
function linkActionsToEntityType(namespace, actions, objectMap) {
    actions.forEach((action) => {
        if (!action.annotations) {
            action.annotations = {};
        }
        if (action.isBound) {
            const sourceEntityType = objectMap[action.sourceType];
            action.sourceEntityType = sourceEntityType;
            if (sourceEntityType) {
                if (!sourceEntityType.actions) {
                    sourceEntityType.actions = {};
                }
                sourceEntityType.actions[`${namespace}.${action.name}`] = action;
            }
            action.returnEntityType = objectMap[action.returnType];
        }
    });
}
function linkActionImportsToActions(actionImports, objectMap) {
    actionImports.forEach((actionImport) => {
        actionImport.action = objectMap[actionImport.actionName];
    });
}
/**
 * @param entitySets
 * @param objectMap
 * @param references
 */
function linkEntityTypeToEntitySet(entitySets, objectMap, references) {
    entitySets.forEach((entitySet) => {
        entitySet.entityType = objectMap[entitySet.entityTypeName];
        if (!entitySet.entityType) {
            entitySet.entityType = objectMap[(0, utils_1.unalias)(references, entitySet.entityTypeName)];
        }
        if (!entitySet.annotations) {
            entitySet.annotations = {};
        }
        if (!entitySet.entityType.annotations) {
            entitySet.entityType.annotations = {};
        }
        entitySet.entityType.keys.forEach((keyProp) => {
            keyProp.isKey = true;
        });
    });
}
/**
 * @param singletons
 * @param objectMap
 * @param references
 */
function linkEntityTypeToSingleton(singletons, objectMap, references) {
    singletons.forEach((singleton) => {
        singleton.entityType = objectMap[singleton.entityTypeName];
        if (!singleton.entityType) {
            singleton.entityType = objectMap[(0, utils_1.unalias)(references, singleton.entityTypeName)];
        }
        if (!singleton.annotations) {
            singleton.annotations = {};
        }
        if (!singleton.entityType.annotations) {
            singleton.entityType.annotations = {};
        }
        singleton.entityType.keys.forEach((keyProp) => {
            keyProp.isKey = true;
        });
    });
}
/**
 * @param entityTypes
 * @param objectMap
 */
function linkPropertiesToComplexTypes(entityTypes, objectMap) {
    /**
     * @param property
     */
    function link(property) {
        if (!property.annotations) {
            property.annotations = {};
        }
        try {
            if (property.type.indexOf('Edm') !== 0) {
                let complexType;
                if (property.type.startsWith('Collection')) {
                    const complexTypeName = property.type.substring(11, property.type.length - 1);
                    complexType = objectMap[complexTypeName];
                }
                else {
                    complexType = objectMap[property.type];
                }
                if (complexType) {
                    property.targetType = complexType;
                    if (complexType.properties) {
                        complexType.properties.forEach(link);
                    }
                }
            }
        }
        catch (sError) {
            throw new Error('Property Type is not defined');
        }
    }
    entityTypes.forEach((entityType) => {
        entityType.entityProperties.forEach(link);
    });
}
/**
 * @param complexTypes
 * @param associations
 * @param objectMap
 */
function prepareComplexTypes(complexTypes, associations, objectMap) {
    complexTypes.forEach((complexType) => {
        complexType.annotations = {};
        complexType.properties.forEach((property) => {
            if (!property.annotations) {
                property.annotations = {};
            }
        });
        complexType.navigationProperties = prepareNavigationProperties(complexType.navigationProperties, associations, objectMap);
    });
}
/**
 * Split the alias from the term value.
 *
 * @param references the current set of references
 * @param termValue the value of the term
 * @returns the term alias and the actual term value
 */
function splitTerm(references, termValue) {
    const aliasedTerm = (0, utils_1.alias)(references, termValue);
    const lastDot = aliasedTerm.lastIndexOf('.');
    const termAlias = aliasedTerm.substring(0, lastDot);
    const term = aliasedTerm.substring(lastDot + 1);
    return [termAlias, term];
}
/**
 * Creates the function that will resolve a specific path.
 *
 * @param convertedOutput
 * @param objectMap
 * @returns the function that will allow to resolve element globally.
 */
function createGlobalResolve(convertedOutput, objectMap) {
    return function resolvePath(sPath, resolveDirectly = false) {
        if (resolveDirectly) {
            let targetPath = sPath;
            if (!sPath.startsWith('/')) {
                targetPath = `/${sPath}`;
            }
            const targetResolution = _resolveTarget(objectMap, convertedOutput, targetPath, false, true);
            if (targetResolution.target) {
                targetResolution.visitedObjects.push(targetResolution.target);
            }
            return {
                target: targetResolution.target,
                objectPath: targetResolution.visitedObjects
            };
        }
        const aPathSplit = sPath.split('/');
        if (aPathSplit.shift() !== '') {
            throw new Error('Cannot deal with relative path');
        }
        const entitySetName = aPathSplit.shift();
        const entitySet = convertedOutput.entitySets.find((et) => et.name === entitySetName);
        const singleton = convertedOutput.singletons.find((et) => et.name === entitySetName);
        if (!entitySet && !singleton) {
            return {
                target: convertedOutput.entityContainer,
                objectPath: [convertedOutput.entityContainer]
            };
        }
        if (aPathSplit.length === 0) {
            return {
                target: entitySet || singleton,
                objectPath: [convertedOutput.entityContainer, entitySet || singleton]
            };
        }
        else {
            const targetResolution = _resolveTarget(objectMap, entitySet || singleton, '/' + aPathSplit.join('/'), false, true);
            if (targetResolution.target) {
                targetResolution.visitedObjects.push(targetResolution.target);
            }
            return {
                target: targetResolution.target,
                objectPath: targetResolution.visitedObjects
            };
        }
    };
}
function ensureAnnotations(currentTarget, vocAlias) {
    if (!currentTarget.annotations) {
        currentTarget.annotations = {};
    }
    if (!currentTarget.annotations[vocAlias]) {
        currentTarget.annotations[vocAlias] = {};
    }
    if (!currentTarget.annotations._annotations) {
        currentTarget.annotations._annotations = {};
    }
}
function processAnnotations(currentContext, annotationList, objectMap, bOverrideExisting) {
    const currentTarget = currentContext.currentTarget;
    const currentTargetName = currentTarget.fullyQualifiedName;
    annotationList.annotations.forEach((annotation) => {
        var _a, _b;
        currentContext.currentSource = annotation.__source || annotationList.__source;
        const [vocAlias, vocTerm] = splitTerm(utils_1.defaultReferences, annotation.term);
        ensureAnnotations(currentTarget, vocAlias);
        const vocTermWithQualifier = `${vocTerm}${annotation.qualifier ? '#' + annotation.qualifier : ''}`;
        if (!bOverrideExisting && ((_b = (_a = currentTarget.annotations) === null || _a === void 0 ? void 0 : _a[vocAlias]) === null || _b === void 0 ? void 0 : _b[vocTermWithQualifier]) !== undefined) {
            return;
        }
        currentContext.currentTerm = annotation.term;
        currentTarget.annotations[vocAlias][vocTermWithQualifier] = convertAnnotation(annotation, objectMap, currentContext);
        switch (typeof currentTarget.annotations[vocAlias][vocTermWithQualifier]) {
            case 'string':
                // eslint-disable-next-line no-new-wrappers
                currentTarget.annotations[vocAlias][vocTermWithQualifier] = new String(currentTarget.annotations[vocAlias][vocTermWithQualifier]);
                break;
            case 'boolean':
                // eslint-disable-next-line no-new-wrappers
                currentTarget.annotations[vocAlias][vocTermWithQualifier] = new Boolean(currentTarget.annotations[vocAlias][vocTermWithQualifier]);
                break;
            default:
                // do nothing
                break;
        }
        if (currentTarget.annotations[vocAlias][vocTermWithQualifier] !== null &&
            typeof currentTarget.annotations[vocAlias][vocTermWithQualifier] === 'object' &&
            !currentTarget.annotations[vocAlias][vocTermWithQualifier].annotations) {
            currentTarget.annotations[vocAlias][vocTermWithQualifier].annotations = {};
        }
        if (currentTarget.annotations[vocAlias][vocTermWithQualifier] !== null &&
            typeof currentTarget.annotations[vocAlias][vocTermWithQualifier] === 'object') {
            currentTarget.annotations[vocAlias][vocTermWithQualifier].term = (0, utils_1.unalias)(utils_1.defaultReferences, `${vocAlias}.${vocTerm}`);
            currentTarget.annotations[vocAlias][vocTermWithQualifier].qualifier = annotation.qualifier;
            currentTarget.annotations[vocAlias][vocTermWithQualifier].__source = currentContext.currentSource;
        }
        const annotationTarget = `${currentTargetName}@${(0, utils_1.unalias)(utils_1.defaultReferences, vocAlias + '.' + vocTermWithQualifier)}`;
        if (Array.isArray(annotation.annotations)) {
            const subAnnotationList = {
                target: annotationTarget,
                annotations: annotation.annotations,
                __source: currentContext.currentSource
            };
            currentContext.additionalAnnotations.push(subAnnotationList);
        }
        else if (annotation.annotations && !currentTarget.annotations[vocAlias][vocTermWithQualifier].annotations) {
            currentTarget.annotations[vocAlias][vocTermWithQualifier].annotations = annotation.annotations;
        }
        currentTarget.annotations._annotations[`${vocAlias}.${vocTermWithQualifier}`] =
            currentTarget.annotations._annotations[(0, utils_1.unalias)(utils_1.defaultReferences, `${vocAlias}.${vocTermWithQualifier}`)] =
                currentTarget.annotations[vocAlias][vocTermWithQualifier];
        objectMap[annotationTarget] = currentTarget.annotations[vocAlias][vocTermWithQualifier];
    });
}
/**
 * Process all the unresolved targets so far to try and see if they are resolveable in the end.
 *
 * @param unresolvedTargets
 * @param objectMap
 */
function processUnresolvedTargets(unresolvedTargets, objectMap) {
    unresolvedTargets.forEach((resolvable) => {
        const targetToResolve = resolvable.toResolve;
        const targetStr = targetToResolve.$target;
        const resolvedTarget = objectMap[targetStr];
        const { annotationsTerm, annotationType } = targetToResolve;
        delete targetToResolve.annotationType;
        delete targetToResolve.annotationsTerm;
        if (resolvable.inline && !(resolvedTarget instanceof String)) {
            // inline the resolved target
            let keys;
            for (keys in targetToResolve) {
                delete targetToResolve[keys];
            }
            Object.assign(targetToResolve, resolvedTarget);
        }
        else {
            // assign the resolved target
            targetToResolve.$target = resolvedTarget;
        }
        if (!resolvedTarget) {
            targetToResolve.targetString = targetStr;
            if (annotationsTerm && annotationType) {
                const oErrorMsg = {
                    message: 'Unable to resolve the path expression: ' +
                        targetStr +
                        '\n' +
                        '\n' +
                        'Hint: Check and correct the path values under the following structure in the metadata (annotation.xml file or CDS annotations for the application): \n\n' +
                        '<Annotation Term = ' +
                        annotationsTerm +
                        '>' +
                        '\n' +
                        '<Record Type = ' +
                        annotationType +
                        '>' +
                        '\n' +
                        '<AnnotationPath = ' +
                        targetStr +
                        '>'
                };
                addAnnotationErrorMessage(targetStr, oErrorMsg);
            }
            else {
                const property = targetToResolve.term;
                const path = targetToResolve.path;
                const termInfo = targetStr ? targetStr.split('/')[0] : targetStr;
                const oErrorMsg = {
                    message: 'Unable to resolve the path expression: ' +
                        targetStr +
                        '\n' +
                        '\n' +
                        'Hint: Check and correct the path values under the following structure in the metadata (annotation.xml file or CDS annotations for the application): \n\n' +
                        '<Annotation Term = ' +
                        termInfo +
                        '>' +
                        '\n' +
                        '<PropertyValue Property = ' +
                        property +
                        '        Path= ' +
                        path +
                        '>'
                };
                addAnnotationErrorMessage(targetStr, oErrorMsg);
            }
        }
    });
}
/**
 * Merge annotation from different source together by overwriting at the term level.
 *
 * @param rawMetadata
 * @returns the resulting merged annotations
 */
function mergeAnnotations(rawMetadata) {
    const annotationListPerTarget = {};
    Object.keys(rawMetadata.schema.annotations).forEach((annotationSource) => {
        rawMetadata.schema.annotations[annotationSource].forEach((annotationList) => {
            const currentTargetName = (0, utils_1.unalias)(rawMetadata.references, annotationList.target);
            annotationList.__source = annotationSource;
            if (!annotationListPerTarget[currentTargetName]) {
                annotationListPerTarget[currentTargetName] = {
                    annotations: annotationList.annotations.concat(),
                    target: currentTargetName
                };
                annotationListPerTarget[currentTargetName].__source = annotationSource;
            }
            else {
                annotationList.annotations.forEach((annotation) => {
                    const findIndex = annotationListPerTarget[currentTargetName].annotations.findIndex((referenceAnnotation) => {
                        return (referenceAnnotation.term === annotation.term &&
                            referenceAnnotation.qualifier === annotation.qualifier);
                    });
                    annotation.__source = annotationSource;
                    if (findIndex !== -1) {
                        annotationListPerTarget[currentTargetName].annotations.splice(findIndex, 1, annotation);
                    }
                    else {
                        annotationListPerTarget[currentTargetName].annotations.push(annotation);
                    }
                });
            }
        });
    });
    return annotationListPerTarget;
}
/**
 * Convert a RawMetadata into an object representation to be used to easily navigate a metadata object and its annotation.
 *
 * @param rawMetadata
 * @returns the converted representation of the metadata.
 */
function convert(rawMetadata) {
    ANNOTATION_ERRORS = [];
    const objectMap = buildObjectMap(rawMetadata);
    resolveNavigationProperties(rawMetadata.schema.entityTypes, rawMetadata.schema.associations, objectMap);
    rawMetadata.schema.entityContainer.annotations = {};
    linkActionsToEntityType(rawMetadata.schema.namespace, rawMetadata.schema.actions, objectMap);
    linkActionImportsToActions(rawMetadata.schema.actionImports, objectMap);
    linkEntityTypeToEntitySet(rawMetadata.schema.entitySets, objectMap, rawMetadata.references);
    linkEntityTypeToSingleton(rawMetadata.schema.singletons, objectMap, rawMetadata.references);
    linkPropertiesToComplexTypes(rawMetadata.schema.entityTypes, objectMap);
    prepareComplexTypes(rawMetadata.schema.complexTypes, rawMetadata.schema.associations, objectMap);
    const unresolvedTargets = [];
    const unresolvedAnnotations = [];
    const annotationListPerTarget = mergeAnnotations(rawMetadata);
    Object.keys(annotationListPerTarget).forEach((currentTargetName) => {
        const annotationList = annotationListPerTarget[currentTargetName];
        const objectMapElement = objectMap[currentTargetName];
        if (!objectMapElement && (currentTargetName === null || currentTargetName === void 0 ? void 0 : currentTargetName.indexOf('@')) > 0) {
            unresolvedAnnotations.push(annotationList);
        }
        else if (objectMapElement) {
            let allTargets = [objectMapElement];
            let bOverrideExisting = true;
            if (objectMapElement._type === 'UnboundGenericAction') {
                allTargets = objectMapElement.actions;
                bOverrideExisting = false;
            }
            allTargets.forEach((currentTarget) => {
                const currentContext = {
                    additionalAnnotations: unresolvedAnnotations,
                    currentSource: annotationList.__source,
                    currentTarget: currentTarget,
                    currentTerm: '',
                    rawMetadata: rawMetadata,
                    unresolvedAnnotations: unresolvedTargets
                };
                processAnnotations(currentContext, annotationList, objectMap, bOverrideExisting);
            });
        }
    });
    const extraUnresolvedAnnotations = [];
    unresolvedAnnotations.forEach((annotationList) => {
        const currentTargetName = (0, utils_1.unalias)(rawMetadata.references, annotationList.target);
        let [baseObj, annotationPart] = currentTargetName.split('@');
        const targetSplit = annotationPart.split('/');
        baseObj = baseObj + '@' + targetSplit[0];
        const currentTarget = targetSplit.slice(1).reduce((currentObj, path) => {
            return currentObj === null || currentObj === void 0 ? void 0 : currentObj[path];
        }, objectMap[baseObj]);
        if (!currentTarget || typeof currentTarget !== 'object') {
            ANNOTATION_ERRORS.push({
                message: 'The following annotation target was not found on the service ' + currentTargetName
            });
        }
        else {
            const currentContext = {
                additionalAnnotations: extraUnresolvedAnnotations,
                currentSource: annotationList.__source,
                currentTarget: currentTarget,
                currentTerm: '',
                rawMetadata: rawMetadata,
                unresolvedAnnotations: unresolvedTargets
            };
            processAnnotations(currentContext, annotationList, objectMap, false);
        }
    });
    processUnresolvedTargets(unresolvedTargets, objectMap);
    for (const property in ALL_ANNOTATION_ERRORS) {
        ANNOTATION_ERRORS.push(ALL_ANNOTATION_ERRORS[property][0]);
    }
    rawMetadata.entitySets = rawMetadata.schema.entitySets;
    const extraReferences = rawMetadata.references.filter((reference) => {
        return utils_1.defaultReferences.find((defaultRef) => defaultRef.namespace === reference.namespace) === undefined;
    });
    const convertedOutput = {
        version: rawMetadata.version,
        annotations: rawMetadata.schema.annotations,
        namespace: rawMetadata.schema.namespace,
        entityContainer: rawMetadata.schema.entityContainer,
        actions: rawMetadata.schema.actions,
        actionImports: rawMetadata.schema.actionImports,
        entitySets: rawMetadata.schema.entitySets,
        singletons: rawMetadata.schema.singletons,
        entityTypes: rawMetadata.schema.entityTypes,
        complexTypes: rawMetadata.schema.complexTypes,
        typeDefinitions: rawMetadata.schema.typeDefinitions,
        references: utils_1.defaultReferences.concat(extraReferences),
        diagnostics: ANNOTATION_ERRORS.concat()
    };
    convertedOutput.resolvePath = createGlobalResolve(convertedOutput, objectMap);
    return convertedOutput;
}
exports.convert = convert;


/***/ }),

/***/ 995:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(634), exports);
__exportStar(__webpack_require__(127), exports);
__exportStar(__webpack_require__(401), exports);


/***/ }),

/***/ 401:
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Decimal = exports.isComplexTypeDefinition = exports.TermToTypes = exports.unalias = exports.alias = exports.defaultReferences = void 0;
exports.defaultReferences = [
    { alias: 'Capabilities', namespace: 'Org.OData.Capabilities.V1', uri: '' },
    { alias: 'Aggregation', namespace: 'Org.OData.Aggregation.V1', uri: '' },
    { alias: 'Validation', namespace: 'Org.OData.Validation.V1', uri: '' },
    { namespace: 'Org.OData.Core.V1', alias: 'Core', uri: '' },
    { namespace: 'Org.OData.Measures.V1', alias: 'Measures', uri: '' },
    { namespace: 'com.sap.vocabularies.Common.v1', alias: 'Common', uri: '' },
    { namespace: 'com.sap.vocabularies.UI.v1', alias: 'UI', uri: '' },
    { namespace: 'com.sap.vocabularies.Session.v1', alias: 'Session', uri: '' },
    { namespace: 'com.sap.vocabularies.Analytics.v1', alias: 'Analytics', uri: '' },
    { namespace: 'com.sap.vocabularies.CodeList.v1', alias: 'CodeList', uri: '' },
    { namespace: 'com.sap.vocabularies.PersonalData.v1', alias: 'PersonalData', uri: '' },
    { namespace: 'com.sap.vocabularies.Communication.v1', alias: 'Communication', uri: '' },
    { namespace: 'com.sap.vocabularies.HTML5.v1', alias: 'HTML5', uri: '' }
];
/**
 * Transform an unaliased string representation annotation to the aliased version.
 *
 * @param references currentReferences for the project
 * @param unaliasedValue the unaliased value
 * @returns the aliased string representing the same
 */
function alias(references, unaliasedValue) {
    if (!references.reverseReferenceMap) {
        references.reverseReferenceMap = references.reduce((map, ref) => {
            map[ref.namespace] = ref;
            return map;
        }, {});
    }
    if (!unaliasedValue) {
        return unaliasedValue;
    }
    const lastDotIndex = unaliasedValue.lastIndexOf('.');
    const namespace = unaliasedValue.substring(0, lastDotIndex);
    const value = unaliasedValue.substring(lastDotIndex + 1);
    const reference = references.reverseReferenceMap[namespace];
    if (reference) {
        return `${reference.alias}.${value}`;
    }
    else if (unaliasedValue.indexOf('@') !== -1) {
        // Try to see if it's an annotation Path like to_SalesOrder/@UI.LineItem
        const [preAlias, ...postAlias] = unaliasedValue.split('@');
        return `${preAlias}@${alias(references, postAlias.join('@'))}`;
    }
    else {
        return unaliasedValue;
    }
}
exports.alias = alias;
/**
 * Transform an aliased string representation annotation to the unaliased version.
 *
 * @param references currentReferences for the project
 * @param aliasedValue the aliased value
 * @returns the unaliased string representing the same
 */
function unalias(references, aliasedValue) {
    if (!references.referenceMap) {
        references.referenceMap = references.reduce((map, ref) => {
            map[ref.alias] = ref;
            return map;
        }, {});
    }
    if (!aliasedValue) {
        return aliasedValue;
    }
    const [vocAlias, ...value] = aliasedValue.split('.');
    const reference = references.referenceMap[vocAlias];
    if (reference) {
        return `${reference.namespace}.${value.join('.')}`;
    }
    else if (aliasedValue.indexOf('@') !== -1) {
        // Try to see if it's an annotation Path like to_SalesOrder/@UI.LineItem
        const [preAlias, ...postAlias] = aliasedValue.split('@');
        return `${preAlias}@${unalias(references, postAlias.join('@'))}`;
    }
    else {
        return aliasedValue;
    }
}
exports.unalias = unalias;
var TermToTypes;
(function (TermToTypes) {
    TermToTypes["Org.OData.Authorization.V1.SecuritySchemes"] = "Org.OData.Authorization.V1.SecurityScheme";
    TermToTypes["Org.OData.Authorization.V1.Authorizations"] = "Org.OData.Authorization.V1.Authorization";
    TermToTypes["Org.OData.Core.V1.Revisions"] = "Org.OData.Core.V1.RevisionType";
    TermToTypes["Org.OData.Core.V1.Links"] = "Org.OData.Core.V1.Link";
    TermToTypes["Org.OData.Core.V1.Example"] = "Org.OData.Core.V1.ExampleValue";
    TermToTypes["Org.OData.Core.V1.Messages"] = "Org.OData.Core.V1.MessageType";
    TermToTypes["Org.OData.Core.V1.ValueException"] = "Org.OData.Core.V1.ValueExceptionType";
    TermToTypes["Org.OData.Core.V1.ResourceException"] = "Org.OData.Core.V1.ResourceExceptionType";
    TermToTypes["Org.OData.Core.V1.DataModificationException"] = "Org.OData.Core.V1.DataModificationExceptionType";
    TermToTypes["Org.OData.Core.V1.IsLanguageDependent"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.DereferenceableIDs"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.ConventionalIDs"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.Permissions"] = "Org.OData.Core.V1.Permission";
    TermToTypes["Org.OData.Core.V1.DefaultNamespace"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.Immutable"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.Computed"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.ComputedDefaultValue"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.IsURL"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.IsMediaType"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.ContentDisposition"] = "Org.OData.Core.V1.ContentDispositionType";
    TermToTypes["Org.OData.Core.V1.OptimisticConcurrency"] = "Edm.PropertyPath";
    TermToTypes["Org.OData.Core.V1.AdditionalProperties"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.AutoExpand"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.AutoExpandReferences"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.MayImplement"] = "Org.OData.Core.V1.QualifiedTypeName";
    TermToTypes["Org.OData.Core.V1.Ordered"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.PositionalInsert"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Core.V1.AlternateKeys"] = "Org.OData.Core.V1.AlternateKey";
    TermToTypes["Org.OData.Core.V1.OptionalParameter"] = "Org.OData.Core.V1.OptionalParameterType";
    TermToTypes["Org.OData.Core.V1.OperationAvailable"] = "Edm.Boolean";
    TermToTypes["Org.OData.Core.V1.SymbolicName"] = "Org.OData.Core.V1.SimpleIdentifier";
    TermToTypes["Org.OData.Capabilities.V1.ConformanceLevel"] = "Org.OData.Capabilities.V1.ConformanceLevelType";
    TermToTypes["Org.OData.Capabilities.V1.AsynchronousRequestsSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.BatchContinueOnErrorSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.IsolationSupported"] = "Org.OData.Capabilities.V1.IsolationLevel";
    TermToTypes["Org.OData.Capabilities.V1.CrossJoinSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.CallbackSupported"] = "Org.OData.Capabilities.V1.CallbackType";
    TermToTypes["Org.OData.Capabilities.V1.ChangeTracking"] = "Org.OData.Capabilities.V1.ChangeTrackingType";
    TermToTypes["Org.OData.Capabilities.V1.CountRestrictions"] = "Org.OData.Capabilities.V1.CountRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.NavigationRestrictions"] = "Org.OData.Capabilities.V1.NavigationRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.IndexableByKey"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.TopSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.SkipSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.ComputeSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.SelectSupport"] = "Org.OData.Capabilities.V1.SelectSupportType";
    TermToTypes["Org.OData.Capabilities.V1.BatchSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.BatchSupport"] = "Org.OData.Capabilities.V1.BatchSupportType";
    TermToTypes["Org.OData.Capabilities.V1.FilterRestrictions"] = "Org.OData.Capabilities.V1.FilterRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.SortRestrictions"] = "Org.OData.Capabilities.V1.SortRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.ExpandRestrictions"] = "Org.OData.Capabilities.V1.ExpandRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.SearchRestrictions"] = "Org.OData.Capabilities.V1.SearchRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.KeyAsSegmentSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.QuerySegmentSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.InsertRestrictions"] = "Org.OData.Capabilities.V1.InsertRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.DeepInsertSupport"] = "Org.OData.Capabilities.V1.DeepInsertSupportType";
    TermToTypes["Org.OData.Capabilities.V1.UpdateRestrictions"] = "Org.OData.Capabilities.V1.UpdateRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.DeepUpdateSupport"] = "Org.OData.Capabilities.V1.DeepUpdateSupportType";
    TermToTypes["Org.OData.Capabilities.V1.DeleteRestrictions"] = "Org.OData.Capabilities.V1.DeleteRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.CollectionPropertyRestrictions"] = "Org.OData.Capabilities.V1.CollectionPropertyRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.OperationRestrictions"] = "Org.OData.Capabilities.V1.OperationRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.AnnotationValuesInQuerySupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Capabilities.V1.ModificationQueryOptions"] = "Org.OData.Capabilities.V1.ModificationQueryOptionsType";
    TermToTypes["Org.OData.Capabilities.V1.ReadRestrictions"] = "Org.OData.Capabilities.V1.ReadRestrictionsType";
    TermToTypes["Org.OData.Capabilities.V1.CustomHeaders"] = "Org.OData.Capabilities.V1.CustomParameter";
    TermToTypes["Org.OData.Capabilities.V1.CustomQueryOptions"] = "Org.OData.Capabilities.V1.CustomParameter";
    TermToTypes["Org.OData.Capabilities.V1.MediaLocationUpdateSupported"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Aggregation.V1.ApplySupported"] = "Org.OData.Aggregation.V1.ApplySupportedType";
    TermToTypes["Org.OData.Aggregation.V1.Groupable"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Aggregation.V1.Aggregatable"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Aggregation.V1.ContextDefiningProperties"] = "Edm.PropertyPath";
    TermToTypes["Org.OData.Aggregation.V1.LeveledHierarchy"] = "Edm.PropertyPath";
    TermToTypes["Org.OData.Aggregation.V1.RecursiveHierarchy"] = "Org.OData.Aggregation.V1.RecursiveHierarchyType";
    TermToTypes["Org.OData.Aggregation.V1.AvailableOnAggregates"] = "Org.OData.Aggregation.V1.AvailableOnAggregatesType";
    TermToTypes["Org.OData.Validation.V1.Minimum"] = "Edm.PrimitiveType";
    TermToTypes["Org.OData.Validation.V1.Maximum"] = "Edm.PrimitiveType";
    TermToTypes["Org.OData.Validation.V1.Exclusive"] = "Org.OData.Core.V1.Tag";
    TermToTypes["Org.OData.Validation.V1.AllowedValues"] = "Org.OData.Validation.V1.AllowedValue";
    TermToTypes["Org.OData.Validation.V1.MultipleOf"] = "Edm.Decimal";
    TermToTypes["Org.OData.Validation.V1.Constraint"] = "Org.OData.Validation.V1.ConstraintType";
    TermToTypes["Org.OData.Validation.V1.ItemsOf"] = "Org.OData.Validation.V1.ItemsOfType";
    TermToTypes["Org.OData.Validation.V1.OpenPropertyTypeConstraint"] = "Org.OData.Core.V1.QualifiedTypeName";
    TermToTypes["Org.OData.Validation.V1.DerivedTypeConstraint"] = "Org.OData.Core.V1.QualifiedTypeName";
    TermToTypes["Org.OData.Validation.V1.AllowedTerms"] = "Org.OData.Core.V1.QualifiedTermName";
    TermToTypes["Org.OData.Validation.V1.ApplicableTerms"] = "Org.OData.Core.V1.QualifiedTermName";
    TermToTypes["Org.OData.Validation.V1.MaxItems"] = "Edm.Int64";
    TermToTypes["Org.OData.Validation.V1.MinItems"] = "Edm.Int64";
    TermToTypes["Org.OData.Measures.V1.Scale"] = "Edm.Byte";
    TermToTypes["Org.OData.Measures.V1.DurationGranularity"] = "Org.OData.Measures.V1.DurationGranularityType";
    TermToTypes["com.sap.vocabularies.Analytics.v1.Dimension"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Analytics.v1.Measure"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Analytics.v1.AccumulativeMeasure"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Analytics.v1.RolledUpPropertyCount"] = "Edm.Int16";
    TermToTypes["com.sap.vocabularies.Analytics.v1.PlanningAction"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Analytics.v1.AggregatedProperties"] = "com.sap.vocabularies.Analytics.v1.AggregatedPropertyType";
    TermToTypes["com.sap.vocabularies.Common.v1.ServiceVersion"] = "Edm.Int32";
    TermToTypes["com.sap.vocabularies.Common.v1.ServiceSchemaVersion"] = "Edm.Int32";
    TermToTypes["com.sap.vocabularies.Common.v1.TextFor"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.IsLanguageIdentifier"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.TextFormat"] = "com.sap.vocabularies.Common.v1.TextFormatType";
    TermToTypes["com.sap.vocabularies.Common.v1.IsDigitSequence"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsUpperCase"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCurrency"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsUnit"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.UnitSpecificScale"] = "Edm.PrimitiveType";
    TermToTypes["com.sap.vocabularies.Common.v1.UnitSpecificPrecision"] = "Edm.PrimitiveType";
    TermToTypes["com.sap.vocabularies.Common.v1.SecondaryKey"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.MinOccurs"] = "Edm.Int64";
    TermToTypes["com.sap.vocabularies.Common.v1.MaxOccurs"] = "Edm.Int64";
    TermToTypes["com.sap.vocabularies.Common.v1.AssociationEntity"] = "Edm.NavigationPropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.DerivedNavigation"] = "Edm.NavigationPropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.Masked"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.MaskedAlways"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.SemanticObjectMapping"] = "com.sap.vocabularies.Common.v1.SemanticObjectMappingType";
    TermToTypes["com.sap.vocabularies.Common.v1.IsInstanceAnnotation"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.FilterExpressionRestrictions"] = "com.sap.vocabularies.Common.v1.FilterExpressionRestrictionType";
    TermToTypes["com.sap.vocabularies.Common.v1.FieldControl"] = "com.sap.vocabularies.Common.v1.FieldControlType";
    TermToTypes["com.sap.vocabularies.Common.v1.Application"] = "com.sap.vocabularies.Common.v1.ApplicationType";
    TermToTypes["com.sap.vocabularies.Common.v1.Timestamp"] = "Edm.DateTimeOffset";
    TermToTypes["com.sap.vocabularies.Common.v1.ErrorResolution"] = "com.sap.vocabularies.Common.v1.ErrorResolutionType";
    TermToTypes["com.sap.vocabularies.Common.v1.Messages"] = "Edm.ComplexType";
    TermToTypes["com.sap.vocabularies.Common.v1.numericSeverity"] = "com.sap.vocabularies.Common.v1.NumericMessageSeverityType";
    TermToTypes["com.sap.vocabularies.Common.v1.MaximumNumericMessageSeverity"] = "com.sap.vocabularies.Common.v1.NumericMessageSeverityType";
    TermToTypes["com.sap.vocabularies.Common.v1.IsActionCritical"] = "Edm.Boolean";
    TermToTypes["com.sap.vocabularies.Common.v1.Attributes"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.RelatedRecursiveHierarchy"] = "Edm.AnnotationPath";
    TermToTypes["com.sap.vocabularies.Common.v1.Interval"] = "com.sap.vocabularies.Common.v1.IntervalType";
    TermToTypes["com.sap.vocabularies.Common.v1.ResultContext"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.WeakReferentialConstraint"] = "com.sap.vocabularies.Common.v1.WeakReferentialConstraintType";
    TermToTypes["com.sap.vocabularies.Common.v1.IsNaturalPerson"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.ValueList"] = "com.sap.vocabularies.Common.v1.ValueListType";
    TermToTypes["com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers"] = "com.sap.vocabularies.Common.v1.SimpleIdentifier";
    TermToTypes["com.sap.vocabularies.Common.v1.ValueListWithFixedValues"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.ValueListMapping"] = "com.sap.vocabularies.Common.v1.ValueListMappingType";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYear"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarHalfyear"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarQuarter"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarMonth"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarWeek"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsDayOfCalendarMonth"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsDayOfCalendarYear"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearHalfyear"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearQuarter"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearMonth"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearWeek"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarDate"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYear"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalPeriod"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearPeriod"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalQuarter"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearQuarter"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalWeek"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearWeek"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsDayOfFiscalYear"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearVariant"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.MutuallyExclusiveTerm"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Common.v1.DraftRoot"] = "com.sap.vocabularies.Common.v1.DraftRootType";
    TermToTypes["com.sap.vocabularies.Common.v1.DraftNode"] = "com.sap.vocabularies.Common.v1.DraftNodeType";
    TermToTypes["com.sap.vocabularies.Common.v1.DraftActivationVia"] = "com.sap.vocabularies.Common.v1.SimpleIdentifier";
    TermToTypes["com.sap.vocabularies.Common.v1.EditableFieldFor"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.SemanticKey"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.Common.v1.SideEffects"] = "com.sap.vocabularies.Common.v1.SideEffectsType";
    TermToTypes["com.sap.vocabularies.Common.v1.DefaultValuesFunction"] = "com.sap.vocabularies.Common.v1.QualifiedName";
    TermToTypes["com.sap.vocabularies.Common.v1.FilterDefaultValue"] = "Edm.PrimitiveType";
    TermToTypes["com.sap.vocabularies.Common.v1.FilterDefaultValueHigh"] = "Edm.PrimitiveType";
    TermToTypes["com.sap.vocabularies.Common.v1.SortOrder"] = "com.sap.vocabularies.Common.v1.SortOrderType";
    TermToTypes["com.sap.vocabularies.Common.v1.RecursiveHierarchy"] = "com.sap.vocabularies.Common.v1.RecursiveHierarchyType";
    TermToTypes["com.sap.vocabularies.Common.v1.CreatedAt"] = "Edm.DateTimeOffset";
    TermToTypes["com.sap.vocabularies.Common.v1.CreatedBy"] = "com.sap.vocabularies.Common.v1.UserID";
    TermToTypes["com.sap.vocabularies.Common.v1.ChangedAt"] = "Edm.DateTimeOffset";
    TermToTypes["com.sap.vocabularies.Common.v1.ChangedBy"] = "com.sap.vocabularies.Common.v1.UserID";
    TermToTypes["com.sap.vocabularies.Common.v1.ApplyMultiUnitBehaviorForSortingAndFiltering"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.CodeList.v1.CurrencyCodes"] = "com.sap.vocabularies.CodeList.v1.CodeListSource";
    TermToTypes["com.sap.vocabularies.CodeList.v1.UnitsOfMeasure"] = "com.sap.vocabularies.CodeList.v1.CodeListSource";
    TermToTypes["com.sap.vocabularies.CodeList.v1.StandardCode"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.CodeList.v1.ExternalCode"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.CodeList.v1.IsConfigurationDeprecationCode"] = "Edm.Boolean";
    TermToTypes["com.sap.vocabularies.Communication.v1.Contact"] = "com.sap.vocabularies.Communication.v1.ContactType";
    TermToTypes["com.sap.vocabularies.Communication.v1.Address"] = "com.sap.vocabularies.Communication.v1.AddressType";
    TermToTypes["com.sap.vocabularies.Communication.v1.IsEmailAddress"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Communication.v1.IsPhoneNumber"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Communication.v1.Event"] = "com.sap.vocabularies.Communication.v1.EventData";
    TermToTypes["com.sap.vocabularies.Communication.v1.Task"] = "com.sap.vocabularies.Communication.v1.TaskData";
    TermToTypes["com.sap.vocabularies.Communication.v1.Message"] = "com.sap.vocabularies.Communication.v1.MessageData";
    TermToTypes["com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchy"] = "com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchyType";
    TermToTypes["com.sap.vocabularies.PersonalData.v1.EntitySemantics"] = "com.sap.vocabularies.PersonalData.v1.EntitySemanticsType";
    TermToTypes["com.sap.vocabularies.PersonalData.v1.FieldSemantics"] = "com.sap.vocabularies.PersonalData.v1.FieldSemanticsType";
    TermToTypes["com.sap.vocabularies.PersonalData.v1.IsPotentiallyPersonal"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.Session.v1.StickySessionSupported"] = "com.sap.vocabularies.Session.v1.StickySessionSupportedType";
    TermToTypes["com.sap.vocabularies.UI.v1.HeaderInfo"] = "com.sap.vocabularies.UI.v1.HeaderInfoType";
    TermToTypes["com.sap.vocabularies.UI.v1.Identification"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
    TermToTypes["com.sap.vocabularies.UI.v1.Badge"] = "com.sap.vocabularies.UI.v1.BadgeType";
    TermToTypes["com.sap.vocabularies.UI.v1.LineItem"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
    TermToTypes["com.sap.vocabularies.UI.v1.StatusInfo"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
    TermToTypes["com.sap.vocabularies.UI.v1.FieldGroup"] = "com.sap.vocabularies.UI.v1.FieldGroupType";
    TermToTypes["com.sap.vocabularies.UI.v1.ConnectedFields"] = "com.sap.vocabularies.UI.v1.ConnectedFieldsType";
    TermToTypes["com.sap.vocabularies.UI.v1.GeoLocations"] = "com.sap.vocabularies.UI.v1.GeoLocationType";
    TermToTypes["com.sap.vocabularies.UI.v1.GeoLocation"] = "com.sap.vocabularies.UI.v1.GeoLocationType";
    TermToTypes["com.sap.vocabularies.UI.v1.Contacts"] = "Edm.AnnotationPath";
    TermToTypes["com.sap.vocabularies.UI.v1.MediaResource"] = "com.sap.vocabularies.UI.v1.MediaResourceType";
    TermToTypes["com.sap.vocabularies.UI.v1.DataPoint"] = "com.sap.vocabularies.UI.v1.DataPointType";
    TermToTypes["com.sap.vocabularies.UI.v1.KPI"] = "com.sap.vocabularies.UI.v1.KPIType";
    TermToTypes["com.sap.vocabularies.UI.v1.Chart"] = "com.sap.vocabularies.UI.v1.ChartDefinitionType";
    TermToTypes["com.sap.vocabularies.UI.v1.ValueCriticality"] = "com.sap.vocabularies.UI.v1.ValueCriticalityType";
    TermToTypes["com.sap.vocabularies.UI.v1.CriticalityLabels"] = "com.sap.vocabularies.UI.v1.CriticalityLabelType";
    TermToTypes["com.sap.vocabularies.UI.v1.SelectionFields"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.UI.v1.Facets"] = "com.sap.vocabularies.UI.v1.Facet";
    TermToTypes["com.sap.vocabularies.UI.v1.HeaderFacets"] = "com.sap.vocabularies.UI.v1.Facet";
    TermToTypes["com.sap.vocabularies.UI.v1.QuickViewFacets"] = "com.sap.vocabularies.UI.v1.Facet";
    TermToTypes["com.sap.vocabularies.UI.v1.QuickCreateFacets"] = "com.sap.vocabularies.UI.v1.Facet";
    TermToTypes["com.sap.vocabularies.UI.v1.FilterFacets"] = "com.sap.vocabularies.UI.v1.ReferenceFacet";
    TermToTypes["com.sap.vocabularies.UI.v1.SelectionPresentationVariant"] = "com.sap.vocabularies.UI.v1.SelectionPresentationVariantType";
    TermToTypes["com.sap.vocabularies.UI.v1.PresentationVariant"] = "com.sap.vocabularies.UI.v1.PresentationVariantType";
    TermToTypes["com.sap.vocabularies.UI.v1.SelectionVariant"] = "com.sap.vocabularies.UI.v1.SelectionVariantType";
    TermToTypes["com.sap.vocabularies.UI.v1.ThingPerspective"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.IsSummary"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.PartOfPreview"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.Map"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.Gallery"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.IsImageURL"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.IsImage"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.MultiLineText"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.TextArrangement"] = "com.sap.vocabularies.UI.v1.TextArrangementType";
    TermToTypes["com.sap.vocabularies.UI.v1.Importance"] = "com.sap.vocabularies.UI.v1.ImportanceType";
    TermToTypes["com.sap.vocabularies.UI.v1.Hidden"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.CreateHidden"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.UpdateHidden"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.DeleteHidden"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.HiddenFilter"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.DataFieldDefault"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
    TermToTypes["com.sap.vocabularies.UI.v1.Criticality"] = "com.sap.vocabularies.UI.v1.CriticalityType";
    TermToTypes["com.sap.vocabularies.UI.v1.CriticalityCalculation"] = "com.sap.vocabularies.UI.v1.CriticalityCalculationType";
    TermToTypes["com.sap.vocabularies.UI.v1.Emphasized"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.UI.v1.OrderBy"] = "Edm.PropertyPath";
    TermToTypes["com.sap.vocabularies.UI.v1.ParameterDefaultValue"] = "Edm.PrimitiveType";
    TermToTypes["com.sap.vocabularies.UI.v1.RecommendationState"] = "com.sap.vocabularies.UI.v1.RecommendationStateType";
    TermToTypes["com.sap.vocabularies.UI.v1.RecommendationList"] = "com.sap.vocabularies.UI.v1.RecommendationListType";
    TermToTypes["com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"] = "Org.OData.Core.V1.Tag";
    TermToTypes["com.sap.vocabularies.HTML5.v1.CssDefaults"] = "com.sap.vocabularies.HTML5.v1.CssDefaultsType";
})(TermToTypes = exports.TermToTypes || (exports.TermToTypes = {}));
/**
 * Differentiate between a ComplexType and a TypeDefinition.
 * @param complexTypeDefinition
 * @returns true if the value is a complex type
 */
function isComplexTypeDefinition(complexTypeDefinition) {
    return (!!complexTypeDefinition && complexTypeDefinition._type === 'ComplexType' && !!complexTypeDefinition.properties);
}
exports.isComplexTypeDefinition = isComplexTypeDefinition;
function Decimal(value) {
    return {
        isDecimal() {
            return true;
        },
        valueOf() {
            return value;
        },
        toString() {
            return value.toString();
        }
    };
}
exports.Decimal = Decimal;


/***/ }),

/***/ 127:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.revertTermToGenericType = void 0;
const utils_1 = __webpack_require__(401);
/**
 * Revert an object to its raw type equivalent.
 *
 * @param references the current reference
 * @param value the value to revert
 * @returns the raw value
 */
function revertObjectToRawType(references, value) {
    var _a, _b, _c, _d, _e, _f;
    let result;
    if (Array.isArray(value)) {
        result = {
            type: 'Collection',
            Collection: value.map((anno) => revertCollectionItemToRawType(references, anno))
        };
    }
    else if ((_a = value.isDecimal) === null || _a === void 0 ? void 0 : _a.call(value)) {
        result = {
            type: 'Decimal',
            Decimal: value.valueOf()
        };
    }
    else if ((_b = value.isString) === null || _b === void 0 ? void 0 : _b.call(value)) {
        const valueMatches = value.valueOf().split('.');
        if (valueMatches.length > 1 && references.find((ref) => ref.alias === valueMatches[0])) {
            result = {
                type: 'EnumMember',
                EnumMember: value.valueOf()
            };
        }
        else {
            result = {
                type: 'String',
                String: value.valueOf()
            };
        }
    }
    else if ((_c = value.isInt) === null || _c === void 0 ? void 0 : _c.call(value)) {
        result = {
            type: 'Int',
            Int: value.valueOf()
        };
    }
    else if ((_d = value.isFloat) === null || _d === void 0 ? void 0 : _d.call(value)) {
        result = {
            type: 'Float',
            Float: value.valueOf()
        };
    }
    else if ((_e = value.isDate) === null || _e === void 0 ? void 0 : _e.call(value)) {
        result = {
            type: 'Date',
            Date: value.valueOf()
        };
    }
    else if ((_f = value.isBoolean) === null || _f === void 0 ? void 0 : _f.call(value)) {
        result = {
            type: 'Bool',
            Bool: value.valueOf() === 'true'
        };
    }
    else if (value.type === 'Path') {
        result = {
            type: 'Path',
            Path: value.path
        };
    }
    else if (value.type === 'AnnotationPath') {
        result = {
            type: 'AnnotationPath',
            AnnotationPath: value.value
        };
    }
    else if (value.type === 'Apply') {
        result = {
            type: 'Apply',
            Apply: value.Apply
        };
    }
    else if (value.type === 'Null') {
        result = {
            type: 'Null'
        };
    }
    else if (value.type === 'PropertyPath') {
        result = {
            type: 'PropertyPath',
            PropertyPath: value.value
        };
    }
    else if (value.type === 'NavigationPropertyPath') {
        result = {
            type: 'NavigationPropertyPath',
            NavigationPropertyPath: value.value
        };
    }
    else if (Object.prototype.hasOwnProperty.call(value, '$Type')) {
        result = {
            type: 'Record',
            Record: revertCollectionItemToRawType(references, value)
        };
    }
    return result;
}
/**
 * Revert a value to its raw value depending on its type.
 *
 * @param references the current set of reference
 * @param value the value to revert
 * @returns the raw expression
 */
function revertValueToRawType(references, value) {
    let result;
    const valueConstructor = value === null || value === void 0 ? void 0 : value.constructor.name;
    switch (valueConstructor) {
        case 'String':
        case 'string':
            const valueMatches = value.toString().split('.');
            if (valueMatches.length > 1 && references.find((ref) => ref.alias === valueMatches[0])) {
                result = {
                    type: 'EnumMember',
                    EnumMember: value.toString()
                };
            }
            else {
                result = {
                    type: 'String',
                    String: value.toString()
                };
            }
            break;
        case 'Boolean':
        case 'boolean':
            result = {
                type: 'Bool',
                Bool: value.valueOf()
            };
            break;
        case 'Number':
        case 'number':
            if (value.toString() === value.toFixed()) {
                result = {
                    type: 'Int',
                    Int: value.valueOf()
                };
            }
            else {
                result = {
                    type: 'Decimal',
                    Decimal: value.valueOf()
                };
            }
            break;
        case 'object':
        default:
            result = revertObjectToRawType(references, value);
            break;
    }
    return result;
}
const restrictedKeys = ['$Type', 'term', '__source', 'qualifier', 'ActionTarget', 'fullyQualifiedName', 'annotations'];
/**
 * Revert the current embedded annotations to their raw type.
 *
 * @param references the current set of reference
 * @param currentAnnotations the collection item to evaluate
 * @param targetAnnotations the place where we need to add the annotation
 */
function revertAnnotationsToRawType(references, currentAnnotations, targetAnnotations) {
    Object.keys(currentAnnotations)
        .filter((key) => key !== '_annotations')
        .forEach((key) => {
        Object.keys(currentAnnotations[key]).forEach((term) => {
            const parsedAnnotation = revertTermToGenericType(references, currentAnnotations[key][term]);
            if (!parsedAnnotation.term) {
                const unaliasedTerm = (0, utils_1.unalias)(references, `${key}.${term}`);
                if (unaliasedTerm) {
                    const qualifiedSplit = unaliasedTerm.split('#');
                    parsedAnnotation.term = qualifiedSplit[0];
                    if (qualifiedSplit.length > 1) {
                        // Sub Annotation with a qualifier, not sure when that can happen in real scenarios
                        parsedAnnotation.qualifier = qualifiedSplit[1];
                    }
                }
            }
            targetAnnotations.push(parsedAnnotation);
        });
    });
}
/**
 * Revert the current collection item to the corresponding raw annotation.
 *
 * @param references the current set of reference
 * @param collectionItem the collection item to evaluate
 * @returns the raw type equivalent
 */
function revertCollectionItemToRawType(references, collectionItem) {
    if (typeof collectionItem === 'string') {
        return collectionItem;
    }
    else if (typeof collectionItem === 'object') {
        if (collectionItem.hasOwnProperty('$Type')) {
            // Annotation Record
            const outItem = {
                type: collectionItem.$Type,
                propertyValues: []
            };
            // Could validate keys and type based on $Type
            Object.keys(collectionItem).forEach((collectionKey) => {
                if (restrictedKeys.indexOf(collectionKey) === -1) {
                    const value = collectionItem[collectionKey];
                    outItem.propertyValues.push({
                        name: collectionKey,
                        value: revertValueToRawType(references, value)
                    });
                }
                else if (collectionKey === 'annotations' && Object.keys(collectionItem[collectionKey]).length > 0) {
                    outItem.annotations = [];
                    revertAnnotationsToRawType(references, collectionItem[collectionKey], outItem.annotations);
                }
            });
            return outItem;
        }
        else if (collectionItem.type === 'PropertyPath') {
            return {
                type: 'PropertyPath',
                PropertyPath: collectionItem.value
            };
        }
        else if (collectionItem.type === 'AnnotationPath') {
            return {
                type: 'AnnotationPath',
                AnnotationPath: collectionItem.value
            };
        }
        else if (collectionItem.type === 'NavigationPropertyPath') {
            return {
                type: 'NavigationPropertyPath',
                NavigationPropertyPath: collectionItem.value
            };
        }
    }
    return undefined;
}
/**
 * Revert an annotation term to it's generic or raw equivalent.
 *
 * @param references the reference of the current context
 * @param annotation the annotation term to revert
 * @returns the raw annotation
 */
function revertTermToGenericType(references, annotation) {
    const baseAnnotation = {
        term: annotation.term,
        qualifier: annotation.qualifier
    };
    if (Array.isArray(annotation)) {
        // Collection
        if (annotation.hasOwnProperty('annotations') && Object.keys(annotation.annotations).length > 0) {
            // Annotation on a collection itself, not sure when that happens if at all
            baseAnnotation.annotations = [];
            revertAnnotationsToRawType(references, annotation.annotations, baseAnnotation.annotations);
        }
        return {
            ...baseAnnotation,
            collection: annotation.map((anno) => revertCollectionItemToRawType(references, anno))
        };
    }
    else if (annotation.hasOwnProperty('$Type')) {
        return { ...baseAnnotation, record: revertCollectionItemToRawType(references, annotation) };
    }
    else {
        return { ...baseAnnotation, value: revertValueToRawType(references, annotation) };
    }
}
exports.revertTermToGenericType = revertTermToGenericType;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(995);
/******/ 	AnnotationConverter = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Bbm5vdGF0aW9uQ29udmVydGVyLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9Ac2FwLXV4K2Fubm90YXRpb24tY29udmVydGVyQDAuNS4yMi9ub2RlX21vZHVsZXMvQHNhcC11eC9hbm5vdGF0aW9uLWNvbnZlcnRlci9zcmMvY29udmVydGVyLnRzIiwid2VicGFjazovL0Fubm90YXRpb25Db252ZXJ0ZXIvLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0BzYXAtdXgrYW5ub3RhdGlvbi1jb252ZXJ0ZXJAMC41LjIyL25vZGVfbW9kdWxlcy9Ac2FwLXV4L2Fubm90YXRpb24tY29udmVydGVyL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9Bbm5vdGF0aW9uQ29udmVydGVyLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9Ac2FwLXV4K2Fubm90YXRpb24tY29udmVydGVyQDAuNS4yMi9ub2RlX21vZHVsZXMvQHNhcC11eC9hbm5vdGF0aW9uLWNvbnZlcnRlci9zcmMvdXRpbHMudHMiLCJ3ZWJwYWNrOi8vQW5ub3RhdGlvbkNvbnZlcnRlci8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vQHNhcC11eCthbm5vdGF0aW9uLWNvbnZlcnRlckAwLjUuMjIvbm9kZV9tb2R1bGVzL0BzYXAtdXgvYW5ub3RhdGlvbi1jb252ZXJ0ZXIvc3JjL3dyaXRlYmFjay50cyIsIndlYnBhY2s6Ly9Bbm5vdGF0aW9uQ29udmVydGVyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0Fubm90YXRpb25Db252ZXJ0ZXIvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9Bbm5vdGF0aW9uQ29udmVydGVyL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9Bbm5vdGF0aW9uQ29udmVydGVyL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7XG4gICAgQW5ub3RhdGlvbkxpc3QsXG4gICAgQW5ub3RhdGlvblJlY29yZCxcbiAgICBFeHByZXNzaW9uLFxuICAgIFBhdGhFeHByZXNzaW9uLFxuICAgIFByb3BlcnR5VmFsdWUsXG4gICAgUmF3TWV0YWRhdGEsXG4gICAgUmVmZXJlbmNlLFxuICAgIENvbXBsZXhUeXBlLFxuICAgIFR5cGVEZWZpbml0aW9uLFxuICAgIFJhd1Byb3BlcnR5LFxuICAgIEFubm90YXRpb24sXG4gICAgQWN0aW9uLFxuICAgIEVudGl0eVR5cGUsXG4gICAgUmF3RW50aXR5VHlwZSxcbiAgICBSYXdBc3NvY2lhdGlvbixcbiAgICBOYXZpZ2F0aW9uUHJvcGVydHksXG4gICAgQmFzZU5hdmlnYXRpb25Qcm9wZXJ0eSxcbiAgICBSYXdWNE5hdmlnYXRpb25Qcm9wZXJ0eSxcbiAgICBSYXdWMk5hdmlnYXRpb25Qcm9wZXJ0eSxcbiAgICBFbnRpdHlTZXQsXG4gICAgUHJvcGVydHksXG4gICAgU2luZ2xldG9uLFxuICAgIFJhd0NvbXBsZXhUeXBlLFxuICAgIENvbnZlcnRlZE1ldGFkYXRhLFxuICAgIFJlc29sdXRpb25UYXJnZXQsXG4gICAgRW50aXR5Q29udGFpbmVyLFxuICAgIFJhd0Fubm90YXRpb24sXG4gICAgQWN0aW9uSW1wb3J0XG59IGZyb20gJ0BzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzJztcbmltcG9ydCB0eXBlIHsgUmVmZXJlbmNlc1dpdGhNYXAgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IGFsaWFzLCBEZWNpbWFsLCBkZWZhdWx0UmVmZXJlbmNlcywgaXNDb21wbGV4VHlwZURlZmluaXRpb24sIFRlcm1Ub1R5cGVzLCB1bmFsaWFzIH0gZnJvbSAnLi91dGlscyc7XG5cbi8qKlxuICpcbiAqL1xuY2xhc3MgUGF0aCB7XG4gICAgcGF0aDogc3RyaW5nO1xuICAgICR0YXJnZXQ6IHN0cmluZztcbiAgICB0eXBlOiBzdHJpbmc7XG4gICAgYW5ub3RhdGlvbnNUZXJtOiBzdHJpbmc7XG4gICAgYW5ub3RhdGlvblR5cGU6IHN0cmluZztcbiAgICB0ZXJtOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gcGF0aEV4cHJlc3Npb25cbiAgICAgKiBAcGFyYW0gdGFyZ2V0TmFtZVxuICAgICAqIEBwYXJhbSBhbm5vdGF0aW9uc1Rlcm1cbiAgICAgKiBAcGFyYW0gdGVybVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHBhdGhFeHByZXNzaW9uOiBQYXRoRXhwcmVzc2lvbiwgdGFyZ2V0TmFtZTogc3RyaW5nLCBhbm5vdGF0aW9uc1Rlcm06IHN0cmluZywgdGVybTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMucGF0aCA9IHBhdGhFeHByZXNzaW9uLlBhdGg7XG4gICAgICAgIHRoaXMudHlwZSA9ICdQYXRoJztcbiAgICAgICAgdGhpcy4kdGFyZ2V0ID0gdGFyZ2V0TmFtZTtcbiAgICAgICAgdGhpcy50ZXJtID0gdGVybTtcbiAgICAgICAgdGhpcy5hbm5vdGF0aW9uc1Rlcm0gPSBhbm5vdGF0aW9uc1Rlcm07XG4gICAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBNYXAgYmFzZWQgb24gdGhlIGZ1bGx5UXVhbGlmaWVkTmFtZSBvZiBlYWNoIG9iamVjdCBwYXJ0IG9mIHRoZSBtZXRhZGF0YS5cbiAqXG4gKiBAcGFyYW0gcmF3TWV0YWRhdGEgdGhlIHJhd01ldGFkYXRhIHdlJ3JlIHdvcmtpbmcgYWdhaW5zdFxuICogQHJldHVybnMgdGhlIG9iamVjdG1hcCBmb3IgZWFzeSBhY2Nlc3MgdG8gdGhlIGRpZmZlcmVudCBvYmplY3Qgb2YgdGhlIG1ldGFkYXRhXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkT2JqZWN0TWFwKHJhd01ldGFkYXRhOiBSYXdNZXRhZGF0YSk6IFJlY29yZDxzdHJpbmcsIGFueT4ge1xuICAgIGNvbnN0IG9iamVjdE1hcDogYW55ID0ge307XG4gICAgaWYgKHJhd01ldGFkYXRhLnNjaGVtYS5lbnRpdHlDb250YWluZXI/LmZ1bGx5UXVhbGlmaWVkTmFtZSkge1xuICAgICAgICBvYmplY3RNYXBbcmF3TWV0YWRhdGEuc2NoZW1hLmVudGl0eUNvbnRhaW5lci5mdWxseVF1YWxpZmllZE5hbWVdID0gcmF3TWV0YWRhdGEuc2NoZW1hLmVudGl0eUNvbnRhaW5lcjtcbiAgICB9XG4gICAgZm9yIChjb25zdCBlbnRpdHlTZXQgb2YgcmF3TWV0YWRhdGEuc2NoZW1hLmVudGl0eVNldHMpIHtcbiAgICAgICAgb2JqZWN0TWFwW2VudGl0eVNldC5mdWxseVF1YWxpZmllZE5hbWVdID0gZW50aXR5U2V0O1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHNpbmdsZXRvbiBvZiByYXdNZXRhZGF0YS5zY2hlbWEuc2luZ2xldG9ucykge1xuICAgICAgICBvYmplY3RNYXBbc2luZ2xldG9uLmZ1bGx5UXVhbGlmaWVkTmFtZV0gPSBzaW5nbGV0b247XG4gICAgfVxuICAgIGZvciAoY29uc3QgYWN0aW9uIG9mIHJhd01ldGFkYXRhLnNjaGVtYS5hY3Rpb25zKSB7XG4gICAgICAgIG9iamVjdE1hcFthY3Rpb24uZnVsbHlRdWFsaWZpZWROYW1lXSA9IGFjdGlvbjtcbiAgICAgICAgaWYgKGFjdGlvbi5pc0JvdW5kKSB7XG4gICAgICAgICAgICBjb25zdCB1bkJvdW5kQWN0aW9uTmFtZSA9IGFjdGlvbi5mdWxseVF1YWxpZmllZE5hbWUuc3BsaXQoJygnKVswXTtcbiAgICAgICAgICAgIGlmICghb2JqZWN0TWFwW3VuQm91bmRBY3Rpb25OYW1lXSkge1xuICAgICAgICAgICAgICAgIG9iamVjdE1hcFt1bkJvdW5kQWN0aW9uTmFtZV0gPSB7XG4gICAgICAgICAgICAgICAgICAgIF90eXBlOiAnVW5ib3VuZEdlbmVyaWNBY3Rpb24nLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvYmplY3RNYXBbdW5Cb3VuZEFjdGlvbk5hbWVdLmFjdGlvbnMucHVzaChhY3Rpb24pO1xuICAgICAgICAgICAgY29uc3QgYWN0aW9uU3BsaXQgPSBhY3Rpb24uZnVsbHlRdWFsaWZpZWROYW1lLnNwbGl0KCcoJyk7XG4gICAgICAgICAgICBvYmplY3RNYXBbYCR7YWN0aW9uU3BsaXRbMV0uc3BsaXQoJyknKVswXX0vJHthY3Rpb25TcGxpdFswXX1gXSA9IGFjdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgcGFyYW1ldGVyIG9mIGFjdGlvbi5wYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgICBvYmplY3RNYXBbcGFyYW1ldGVyLmZ1bGx5UXVhbGlmaWVkTmFtZV0gPSBwYXJhbWV0ZXI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBhY3Rpb25JbXBvcnQgb2YgcmF3TWV0YWRhdGEuc2NoZW1hLmFjdGlvbkltcG9ydHMpIHtcbiAgICAgICAgb2JqZWN0TWFwW2FjdGlvbkltcG9ydC5mdWxseVF1YWxpZmllZE5hbWVdID0gYWN0aW9uSW1wb3J0O1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGNvbXBsZXhUeXBlIG9mIHJhd01ldGFkYXRhLnNjaGVtYS5jb21wbGV4VHlwZXMpIHtcbiAgICAgICAgb2JqZWN0TWFwW2NvbXBsZXhUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZV0gPSBjb21wbGV4VHlwZTtcbiAgICAgICAgZm9yIChjb25zdCBwcm9wZXJ0eSBvZiBjb21wbGV4VHlwZS5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBvYmplY3RNYXBbcHJvcGVydHkuZnVsbHlRdWFsaWZpZWROYW1lXSA9IHByb3BlcnR5O1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgdHlwZURlZmluaXRpb24gb2YgcmF3TWV0YWRhdGEuc2NoZW1hLnR5cGVEZWZpbml0aW9ucykge1xuICAgICAgICBvYmplY3RNYXBbdHlwZURlZmluaXRpb24uZnVsbHlRdWFsaWZpZWROYW1lXSA9IHR5cGVEZWZpbml0aW9uO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGVudGl0eVR5cGUgb2YgcmF3TWV0YWRhdGEuc2NoZW1hLmVudGl0eVR5cGVzKSB7XG4gICAgICAgIChlbnRpdHlUeXBlIGFzIEVudGl0eVR5cGUpLmFubm90YXRpb25zID0ge307IC8vICdhbm5vdGF0aW9ucycgcHJvcGVydHkgaXMgbWFuZGF0b3J5XG4gICAgICAgIG9iamVjdE1hcFtlbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZV0gPSBlbnRpdHlUeXBlO1xuICAgICAgICBvYmplY3RNYXBbYENvbGxlY3Rpb24oJHtlbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZX0pYF0gPSBlbnRpdHlUeXBlO1xuICAgICAgICBmb3IgKGNvbnN0IHByb3BlcnR5IG9mIGVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcykge1xuICAgICAgICAgICAgb2JqZWN0TWFwW3Byb3BlcnR5LmZ1bGx5UXVhbGlmaWVkTmFtZV0gPSBwcm9wZXJ0eTtcbiAgICAgICAgICAgIC8vIEhhbmRsZSBjb21wbGV4IHR5cGVzXG4gICAgICAgICAgICBjb25zdCBjb21wbGV4VHlwZURlZmluaXRpb24gPSBvYmplY3RNYXBbcHJvcGVydHkudHlwZV0gYXMgQ29tcGxleFR5cGUgfCBUeXBlRGVmaW5pdGlvbjtcbiAgICAgICAgICAgIGlmIChpc0NvbXBsZXhUeXBlRGVmaW5pdGlvbihjb21wbGV4VHlwZURlZmluaXRpb24pKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjb21wbGV4VHlwZVByb3Agb2YgY29tcGxleFR5cGVEZWZpbml0aW9uLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tcGxleFR5cGVQcm9wVGFyZ2V0OiBSYXdQcm9wZXJ0eSA9IE9iamVjdC5hc3NpZ24oY29tcGxleFR5cGVQcm9wLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdHlwZTogJ1Byb3BlcnR5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGx5UXVhbGlmaWVkTmFtZTogcHJvcGVydHkuZnVsbHlRdWFsaWZpZWROYW1lICsgJy8nICsgY29tcGxleFR5cGVQcm9wLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIG9iamVjdE1hcFtjb21wbGV4VHlwZVByb3BUYXJnZXQuZnVsbHlRdWFsaWZpZWROYW1lXSA9IGNvbXBsZXhUeXBlUHJvcFRhcmdldDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBuYXZQcm9wZXJ0eSBvZiBlbnRpdHlUeXBlLm5hdmlnYXRpb25Qcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBvYmplY3RNYXBbbmF2UHJvcGVydHkuZnVsbHlRdWFsaWZpZWROYW1lXSA9IG5hdlByb3BlcnR5O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBhbm5vdGF0aW9uU291cmNlIG9mIE9iamVjdC5rZXlzKHJhd01ldGFkYXRhLnNjaGVtYS5hbm5vdGF0aW9ucykpIHtcbiAgICAgICAgZm9yIChjb25zdCBhbm5vdGF0aW9uTGlzdCBvZiByYXdNZXRhZGF0YS5zY2hlbWEuYW5ub3RhdGlvbnNbYW5ub3RhdGlvblNvdXJjZV0pIHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRUYXJnZXROYW1lID0gdW5hbGlhcyhyYXdNZXRhZGF0YS5yZWZlcmVuY2VzLCBhbm5vdGF0aW9uTGlzdC50YXJnZXQpO1xuICAgICAgICAgICAgYW5ub3RhdGlvbkxpc3QuYW5ub3RhdGlvbnMuZm9yRWFjaCgoYW5ub3RhdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBhbm5vdGF0aW9uRlFOID0gYCR7Y3VycmVudFRhcmdldE5hbWV9QCR7dW5hbGlhcyhyYXdNZXRhZGF0YS5yZWZlcmVuY2VzLCBhbm5vdGF0aW9uLnRlcm0pfWA7XG4gICAgICAgICAgICAgICAgaWYgKGFubm90YXRpb24ucXVhbGlmaWVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGFubm90YXRpb25GUU4gKz0gYCMke2Fubm90YXRpb24ucXVhbGlmaWVyfWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9iamVjdE1hcFthbm5vdGF0aW9uRlFOXSA9IGFubm90YXRpb247XG4gICAgICAgICAgICAgICAgKGFubm90YXRpb24gYXMgQW5ub3RhdGlvbikuZnVsbHlRdWFsaWZpZWROYW1lID0gYW5ub3RhdGlvbkZRTjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RNYXA7XG59XG5cbi8qKlxuICogQ29tYmluZSB0d28gc3RyaW5ncyByZXByZXNlbnRpbmcgcGF0aCBpbiB0aGUgbWV0YW1vZGVsIHdoaWxlIGVuc3VyaW5nIHRoZWlyIHNwZWNpZmljaXRpZXMgKGFubm90YXRpb24uLi4pIGFyZSByZXNwZWN0ZWQuXG4gKlxuICogQHBhcmFtIGN1cnJlbnRUYXJnZXQgdGhlIGN1cnJlbnQgcGF0aFxuICogQHBhcmFtIHBhdGggdGhlIHBhcnQgd2Ugd2FudCB0byBhcHBlbmRcbiAqIEByZXR1cm5zIHRoZSBjb21wbGV0ZSBwYXRoIGluY2x1ZGluZyB0aGUgZXh0ZW5zaW9uLlxuICovXG5mdW5jdGlvbiBjb21iaW5lUGF0aChjdXJyZW50VGFyZ2V0OiBzdHJpbmcsIHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHBhdGguc3RhcnRzV2l0aCgnQCcpKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50VGFyZ2V0ICsgdW5hbGlhcyhkZWZhdWx0UmVmZXJlbmNlcywgcGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRUYXJnZXQgKyAnLycgKyBwYXRoO1xuICAgIH1cbn1cblxuY29uc3QgQUxMX0FOTk9UQVRJT05fRVJST1JTOiBhbnkgPSB7fTtcbmxldCBBTk5PVEFUSU9OX0VSUk9SUzogeyBtZXNzYWdlOiBzdHJpbmcgfVtdID0gW107XG5cbi8qKlxuICogQHBhcmFtIHBhdGhcbiAqIEBwYXJhbSBvRXJyb3JNc2dcbiAqL1xuZnVuY3Rpb24gYWRkQW5ub3RhdGlvbkVycm9yTWVzc2FnZShwYXRoOiBzdHJpbmcsIG9FcnJvck1zZzogYW55KSB7XG4gICAgaWYgKCFBTExfQU5OT1RBVElPTl9FUlJPUlNbcGF0aF0pIHtcbiAgICAgICAgQUxMX0FOTk9UQVRJT05fRVJST1JTW3BhdGhdID0gW29FcnJvck1zZ107XG4gICAgfSBlbHNlIHtcbiAgICAgICAgQUxMX0FOTk9UQVRJT05fRVJST1JTW3BhdGhdLnB1c2gob0Vycm9yTXNnKTtcbiAgICB9XG59XG5cbi8qKlxuICogUmVzb2x2ZXMgYSBzcGVjaWZpYyBwYXRoIGJhc2VkIG9uIHRoZSBvYmplY3RNYXAuXG4gKlxuICogQHBhcmFtIG9iamVjdE1hcFxuICogQHBhcmFtIGN1cnJlbnRUYXJnZXRcbiAqIEBwYXJhbSBwYXRoXG4gKiBAcGFyYW0gcGF0aE9ubHlcbiAqIEBwYXJhbSBpbmNsdWRlVmlzaXRlZE9iamVjdHNcbiAqIEBwYXJhbSBhbm5vdGF0aW9uc1Rlcm1cbiAqIEByZXR1cm5zIHRoZSByZXNvbHZlZCBvYmplY3RcbiAqL1xuZnVuY3Rpb24gX3Jlc29sdmVUYXJnZXQoXG4gICAgb2JqZWN0TWFwOiBhbnksXG4gICAgY3VycmVudFRhcmdldDogYW55LFxuICAgIHBhdGg6IHN0cmluZyxcbiAgICBwYXRoT25seTogYm9vbGVhbiA9IGZhbHNlLFxuICAgIGluY2x1ZGVWaXNpdGVkT2JqZWN0czogYm9vbGVhbiA9IGZhbHNlLFxuICAgIGFubm90YXRpb25zVGVybT86IHN0cmluZ1xuKSB7XG4gICAgbGV0IG9FcnJvck1zZztcbiAgICBpZiAoIXBhdGgpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY29uc3QgYVZpc2l0ZWRPYmplY3RzOiBhbnlbXSA9IFtdO1xuICAgIGlmIChjdXJyZW50VGFyZ2V0ICYmIGN1cnJlbnRUYXJnZXQuX3R5cGUgPT09ICdQcm9wZXJ0eScpIHtcbiAgICAgICAgY3VycmVudFRhcmdldCA9IG9iamVjdE1hcFtjdXJyZW50VGFyZ2V0LmZ1bGx5UXVhbGlmaWVkTmFtZS5zcGxpdCgnLycpWzBdXTtcbiAgICB9XG4gICAgcGF0aCA9IGNvbWJpbmVQYXRoKGN1cnJlbnRUYXJnZXQuZnVsbHlRdWFsaWZpZWROYW1lLCBwYXRoKTtcblxuICAgIGNvbnN0IHBhdGhTcGxpdCA9IHBhdGguc3BsaXQoJy8nKTtcbiAgICBjb25zdCB0YXJnZXRQYXRoU3BsaXQ6IHN0cmluZ1tdID0gW107XG4gICAgcGF0aFNwbGl0LmZvckVhY2goKHBhdGhQYXJ0KSA9PiB7XG4gICAgICAgIC8vIFNlcGFyYXRlIG91dCB0aGUgYW5ub3RhdGlvblxuICAgICAgICBpZiAocGF0aFBhcnQuaW5kZXhPZignQCcpICE9PSAtMSkge1xuICAgICAgICAgICAgY29uc3QgW3NwbGl0dGVkUGF0aCwgYW5ub3RhdGlvblBhdGhdID0gcGF0aFBhcnQuc3BsaXQoJ0AnKTtcbiAgICAgICAgICAgIHRhcmdldFBhdGhTcGxpdC5wdXNoKHNwbGl0dGVkUGF0aCk7XG4gICAgICAgICAgICB0YXJnZXRQYXRoU3BsaXQucHVzaChgQCR7YW5ub3RhdGlvblBhdGh9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRQYXRoU3BsaXQucHVzaChwYXRoUGFydCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBsZXQgY3VycmVudFBhdGggPSBwYXRoO1xuICAgIGxldCBjdXJyZW50Q29udGV4dCA9IGN1cnJlbnRUYXJnZXQ7XG4gICAgY29uc3QgdGFyZ2V0ID0gdGFyZ2V0UGF0aFNwbGl0LnJlZHVjZSgoY3VycmVudFZhbHVlOiBhbnksIHBhdGhQYXJ0KSA9PiB7XG4gICAgICAgIGlmIChwYXRoUGFydCA9PT0gJyRUeXBlJyAmJiBjdXJyZW50VmFsdWUuX3R5cGUgPT09ICdFbnRpdHlUeXBlJykge1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGF0aFBhcnQgPT09ICckJyAmJiBjdXJyZW50VmFsdWUuX3R5cGUgPT09ICdFbnRpdHlTZXQnKSB7XG4gICAgICAgICAgICByZXR1cm4gY3VycmVudFZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgocGF0aFBhcnQgPT09ICdAJHVpNS5vdmVybG9hZCcgfHwgcGF0aFBhcnQgPT09ICcwJykgJiYgY3VycmVudFZhbHVlLl90eXBlID09PSAnQWN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGF0aFBhcnQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAvLyBFbXB0eSBQYXRoIGFmdGVyIGFuIGVudGl0eVNldCBtZWFucyBlbnRpdHlUeXBlXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgY3VycmVudFZhbHVlICYmXG4gICAgICAgICAgICAgICAgKGN1cnJlbnRWYWx1ZS5fdHlwZSA9PT0gJ0VudGl0eVNldCcgfHwgY3VycmVudFZhbHVlLl90eXBlID09PSAnU2luZ2xldG9uJykgJiZcbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUuZW50aXR5VHlwZVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluY2x1ZGVWaXNpdGVkT2JqZWN0cykge1xuICAgICAgICAgICAgICAgICAgICBhVmlzaXRlZE9iamVjdHMucHVzaChjdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUgPSBjdXJyZW50VmFsdWUuZW50aXR5VHlwZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjdXJyZW50VmFsdWUgJiYgY3VycmVudFZhbHVlLl90eXBlID09PSAnTmF2aWdhdGlvblByb3BlcnR5JyAmJiBjdXJyZW50VmFsdWUudGFyZ2V0VHlwZSkge1xuICAgICAgICAgICAgICAgIGlmIChpbmNsdWRlVmlzaXRlZE9iamVjdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgYVZpc2l0ZWRPYmplY3RzLnB1c2goY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3VycmVudFZhbHVlID0gY3VycmVudFZhbHVlLnRhcmdldFR5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY3VycmVudFZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbmNsdWRlVmlzaXRlZE9iamVjdHMgJiYgY3VycmVudFZhbHVlICE9PSBudWxsICYmIGN1cnJlbnRWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBhVmlzaXRlZE9iamVjdHMucHVzaChjdXJyZW50VmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgICBjdXJyZW50UGF0aCA9IHBhdGhQYXJ0O1xuICAgICAgICB9IGVsc2UgaWYgKChjdXJyZW50VmFsdWUuX3R5cGUgPT09ICdFbnRpdHlTZXQnIHx8IGN1cnJlbnRWYWx1ZS5fdHlwZSA9PT0gJ1NpbmdsZXRvbicpICYmIHBhdGhQYXJ0ID09PSAnJFR5cGUnKSB7XG4gICAgICAgICAgICBjdXJyZW50VmFsdWUgPSBjdXJyZW50VmFsdWUudGFyZ2V0VHlwZTtcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50VmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAoY3VycmVudFZhbHVlLl90eXBlID09PSAnRW50aXR5U2V0JyB8fCBjdXJyZW50VmFsdWUuX3R5cGUgPT09ICdTaW5nbGV0b24nKSAmJlxuICAgICAgICAgICAgcGF0aFBhcnQgPT09ICckTmF2aWdhdGlvblByb3BlcnR5QmluZGluZydcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBjdXJyZW50VmFsdWUgPSBjdXJyZW50VmFsdWUubmF2aWdhdGlvblByb3BlcnR5QmluZGluZztcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50VmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAoY3VycmVudFZhbHVlLl90eXBlID09PSAnRW50aXR5U2V0JyB8fCBjdXJyZW50VmFsdWUuX3R5cGUgPT09ICdTaW5nbGV0b24nKSAmJlxuICAgICAgICAgICAgY3VycmVudFZhbHVlLmVudGl0eVR5cGVcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBjdXJyZW50UGF0aCA9IGNvbWJpbmVQYXRoKGN1cnJlbnRWYWx1ZS5lbnRpdHlUeXBlTmFtZSwgcGF0aFBhcnQpO1xuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRWYWx1ZS5fdHlwZSA9PT0gJ05hdmlnYXRpb25Qcm9wZXJ0eScpIHtcbiAgICAgICAgICAgIGN1cnJlbnRQYXRoID0gY29tYmluZVBhdGgoY3VycmVudFZhbHVlLmZ1bGx5UXVhbGlmaWVkTmFtZSwgcGF0aFBhcnQpO1xuICAgICAgICAgICAgaWYgKCFvYmplY3RNYXBbY3VycmVudFBhdGhdKSB7XG4gICAgICAgICAgICAgICAgLy8gRmFsbGJhY2sgbG9nIGVycm9yXG4gICAgICAgICAgICAgICAgY3VycmVudFBhdGggPSBjb21iaW5lUGF0aChjdXJyZW50VmFsdWUudGFyZ2V0VHlwZU5hbWUsIHBhdGhQYXJ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50VmFsdWUuX3R5cGUgPT09ICdQcm9wZXJ0eScpIHtcbiAgICAgICAgICAgIC8vIENvbXBsZXhUeXBlIG9yIFByb3BlcnR5XG4gICAgICAgICAgICBpZiAoY3VycmVudFZhbHVlLnRhcmdldFR5cGUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UGF0aCA9IGNvbWJpbmVQYXRoKGN1cnJlbnRWYWx1ZS50YXJnZXRUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZSwgcGF0aFBhcnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UGF0aCA9IGNvbWJpbmVQYXRoKGN1cnJlbnRWYWx1ZS5mdWxseVF1YWxpZmllZE5hbWUsIHBhdGhQYXJ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50VmFsdWUuX3R5cGUgPT09ICdBY3Rpb24nICYmIGN1cnJlbnRWYWx1ZS5pc0JvdW5kKSB7XG4gICAgICAgICAgICBjdXJyZW50UGF0aCA9IGNvbWJpbmVQYXRoKGN1cnJlbnRWYWx1ZS5mdWxseVF1YWxpZmllZE5hbWUsIHBhdGhQYXJ0KTtcbiAgICAgICAgICAgIGlmIChwYXRoUGFydCA9PT0gJyRQYXJhbWV0ZXInKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZS5wYXJhbWV0ZXJzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIW9iamVjdE1hcFtjdXJyZW50UGF0aF0pIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UGF0aCA9IGNvbWJpbmVQYXRoKGN1cnJlbnRWYWx1ZS5zb3VyY2VUeXBlLCBwYXRoUGFydCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFZhbHVlLl90eXBlID09PSAnQWN0aW9uUGFyYW1ldGVyJykge1xuICAgICAgICAgICAgY3VycmVudFBhdGggPSBjb21iaW5lUGF0aChcbiAgICAgICAgICAgICAgICBjdXJyZW50VGFyZ2V0LmZ1bGx5UXVhbGlmaWVkTmFtZS5zdWJzdHJpbmcoMCwgY3VycmVudFRhcmdldC5mdWxseVF1YWxpZmllZE5hbWUubGFzdEluZGV4T2YoJy8nKSksXG4gICAgICAgICAgICAgICAgcGF0aFBhcnRcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoIW9iamVjdE1hcFtjdXJyZW50UGF0aF0pIHtcbiAgICAgICAgICAgICAgICBsZXQgbGFzdElkeCA9IGN1cnJlbnRUYXJnZXQuZnVsbHlRdWFsaWZpZWROYW1lLmxhc3RJbmRleE9mKCcvJyk7XG4gICAgICAgICAgICAgICAgaWYgKGxhc3RJZHggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RJZHggPSBjdXJyZW50VGFyZ2V0LmZ1bGx5UXVhbGlmaWVkTmFtZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN1cnJlbnRQYXRoID0gY29tYmluZVBhdGgoXG4gICAgICAgICAgICAgICAgICAgIChvYmplY3RNYXBbY3VycmVudFRhcmdldC5mdWxseVF1YWxpZmllZE5hbWUuc3Vic3RyaW5nKDAsIGxhc3RJZHgpXSBhcyBBY3Rpb24pLnNvdXJjZVR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHBhdGhQYXJ0XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGN1cnJlbnRQYXRoID0gY29tYmluZVBhdGgoY3VycmVudFZhbHVlLmZ1bGx5UXVhbGlmaWVkTmFtZSwgcGF0aFBhcnQpO1xuICAgICAgICAgICAgaWYgKHBhdGhQYXJ0ICE9PSAnbmFtZScgJiYgY3VycmVudFZhbHVlW3BhdGhQYXJ0XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZVtwYXRoUGFydF07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhdGhQYXJ0ID09PSAnJEFubm90YXRpb25QYXRoJyAmJiBjdXJyZW50VmFsdWUuJHRhcmdldCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRleHRUb1Jlc29sdmUgPSBvYmplY3RNYXBbY3VycmVudFZhbHVlLmZ1bGx5UXVhbGlmaWVkTmFtZS5zcGxpdCgnQCcpWzBdXTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJUYXJnZXQ6IGFueSA9IF9yZXNvbHZlVGFyZ2V0KG9iamVjdE1hcCwgY29udGV4dFRvUmVzb2x2ZSwgY3VycmVudFZhbHVlLnZhbHVlLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgc3ViVGFyZ2V0LnZpc2l0ZWRPYmplY3RzLmZvckVhY2goKHZpc2l0ZWRTdWJPYmplY3Q6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYVZpc2l0ZWRPYmplY3RzLmluZGV4T2YodmlzaXRlZFN1Yk9iamVjdCkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhVmlzaXRlZE9iamVjdHMucHVzaCh2aXNpdGVkU3ViT2JqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdWJUYXJnZXQudGFyZ2V0O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwYXRoUGFydCA9PT0gJyRQYXRoJyAmJiBjdXJyZW50VmFsdWUuJHRhcmdldCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRDb250ZXh0ID0gYVZpc2l0ZWRPYmplY3RzXG4gICAgICAgICAgICAgICAgICAgIC5jb25jYXQoKVxuICAgICAgICAgICAgICAgICAgICAucmV2ZXJzZSgpXG4gICAgICAgICAgICAgICAgICAgIC5maW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgKG9iaikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmouX3R5cGUgPT09ICdFbnRpdHlUeXBlJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iai5fdHlwZSA9PT0gJ0VudGl0eVNldCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmouX3R5cGUgPT09ICdTaW5nbGV0b24nIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqLl90eXBlID09PSAnTmF2aWdhdGlvblByb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Q29udGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJUYXJnZXQ6IGFueSA9IF9yZXNvbHZlVGFyZ2V0KG9iamVjdE1hcCwgY3VycmVudENvbnRleHQsIGN1cnJlbnRWYWx1ZS5wYXRoLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHN1YlRhcmdldC52aXNpdGVkT2JqZWN0cy5mb3JFYWNoKCh2aXNpdGVkU3ViT2JqZWN0OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhVmlzaXRlZE9iamVjdHMuaW5kZXhPZih2aXNpdGVkU3ViT2JqZWN0KSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhVmlzaXRlZE9iamVjdHMucHVzaCh2aXNpdGVkU3ViT2JqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWJUYXJnZXQudGFyZ2V0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudFZhbHVlLiR0YXJnZXQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhdGhQYXJ0LnN0YXJ0c1dpdGgoJyRQYXRoJykgJiYgY3VycmVudFZhbHVlLiR0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnRlcm1lZGlhdGVUYXJnZXQgPSBjdXJyZW50VmFsdWUuJHRhcmdldDtcbiAgICAgICAgICAgICAgICBjdXJyZW50UGF0aCA9IGNvbWJpbmVQYXRoKGludGVybWVkaWF0ZVRhcmdldC5mdWxseVF1YWxpZmllZE5hbWUsIHBhdGhQYXJ0LnN1YnN0cmluZyg1KSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRWYWx1ZS5oYXNPd25Qcm9wZXJ0eSgnJFR5cGUnKSAmJiAhb2JqZWN0TWFwW2N1cnJlbnRQYXRoXSkge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgbm93IGFuIGFubm90YXRpb24gdmFsdWVcbiAgICAgICAgICAgICAgICBjb25zdCBlbnRpdHlUeXBlID0gb2JqZWN0TWFwW2N1cnJlbnRWYWx1ZS5mdWxseVF1YWxpZmllZE5hbWUuc3BsaXQoJ0AnKVswXV07XG4gICAgICAgICAgICAgICAgaWYgKGVudGl0eVR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFBhdGggPSBjb21iaW5lUGF0aChlbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZSwgcGF0aFBhcnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqZWN0TWFwW2N1cnJlbnRQYXRoXTtcbiAgICB9LCBudWxsKTtcbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICBpZiAoYW5ub3RhdGlvbnNUZXJtKSB7XG4gICAgICAgICAgICBjb25zdCBhbm5vdGF0aW9uVHlwZSA9IGluZmVyVHlwZUZyb21UZXJtKGFubm90YXRpb25zVGVybSwgY3VycmVudFRhcmdldCk7XG4gICAgICAgICAgICBvRXJyb3JNc2cgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTpcbiAgICAgICAgICAgICAgICAgICAgJ1VuYWJsZSB0byByZXNvbHZlIHRoZSBwYXRoIGV4cHJlc3Npb246ICcgK1xuICAgICAgICAgICAgICAgICAgICAnXFxuJyArXG4gICAgICAgICAgICAgICAgICAgIHBhdGggK1xuICAgICAgICAgICAgICAgICAgICAnXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgJ0hpbnQ6IENoZWNrIGFuZCBjb3JyZWN0IHRoZSBwYXRoIHZhbHVlcyB1bmRlciB0aGUgZm9sbG93aW5nIHN0cnVjdHVyZSBpbiB0aGUgbWV0YWRhdGEgKGFubm90YXRpb24ueG1sIGZpbGUgb3IgQ0RTIGFubm90YXRpb25zIGZvciB0aGUgYXBwbGljYXRpb24pOiBcXG5cXG4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxBbm5vdGF0aW9uIFRlcm0gPSAnICtcbiAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbnNUZXJtICtcbiAgICAgICAgICAgICAgICAgICAgJz4nICtcbiAgICAgICAgICAgICAgICAgICAgJ1xcbicgK1xuICAgICAgICAgICAgICAgICAgICAnPFJlY29yZCBUeXBlID0gJyArXG4gICAgICAgICAgICAgICAgICAgIGFubm90YXRpb25UeXBlICtcbiAgICAgICAgICAgICAgICAgICAgJz4nICtcbiAgICAgICAgICAgICAgICAgICAgJ1xcbicgK1xuICAgICAgICAgICAgICAgICAgICAnPEFubm90YXRpb25QYXRoID0gJyArXG4gICAgICAgICAgICAgICAgICAgIHBhdGggK1xuICAgICAgICAgICAgICAgICAgICAnPidcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBhZGRBbm5vdGF0aW9uRXJyb3JNZXNzYWdlKHBhdGgsIG9FcnJvck1zZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvRXJyb3JNc2cgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTpcbiAgICAgICAgICAgICAgICAgICAgJ1VuYWJsZSB0byByZXNvbHZlIHRoZSBwYXRoIGV4cHJlc3Npb246ICcgK1xuICAgICAgICAgICAgICAgICAgICBwYXRoICtcbiAgICAgICAgICAgICAgICAgICAgJ1xcbicgK1xuICAgICAgICAgICAgICAgICAgICAnXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICdIaW50OiBDaGVjayBhbmQgY29ycmVjdCB0aGUgcGF0aCB2YWx1ZXMgdW5kZXIgdGhlIGZvbGxvd2luZyBzdHJ1Y3R1cmUgaW4gdGhlIG1ldGFkYXRhIChhbm5vdGF0aW9uLnhtbCBmaWxlIG9yIENEUyBhbm5vdGF0aW9ucyBmb3IgdGhlIGFwcGxpY2F0aW9uKTogXFxuXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICc8QW5ub3RhdGlvbiBUZXJtID0gJyArXG4gICAgICAgICAgICAgICAgICAgIHBhdGhTcGxpdFswXSArXG4gICAgICAgICAgICAgICAgICAgICc+JyArXG4gICAgICAgICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxQcm9wZXJ0eVZhbHVlICBQYXRoPSAnICtcbiAgICAgICAgICAgICAgICAgICAgcGF0aFNwbGl0WzFdICtcbiAgICAgICAgICAgICAgICAgICAgJz4nXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYWRkQW5ub3RhdGlvbkVycm9yTWVzc2FnZShwYXRoLCBvRXJyb3JNc2cpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChwYXRoT25seSkge1xuICAgICAgICByZXR1cm4gY3VycmVudFBhdGg7XG4gICAgfVxuICAgIGlmIChpbmNsdWRlVmlzaXRlZE9iamVjdHMpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZpc2l0ZWRPYmplY3RzOiBhVmlzaXRlZE9iamVjdHMsXG4gICAgICAgICAgICB0YXJnZXQ6IHRhcmdldFxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xufVxuXG4vKipcbiAqIFR5cGVndWFyZCB0byBjaGVjayBpZiB0aGUgcGF0aCBjb250YWlucyBhbiBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSBwYXRoU3RyIHRoZSBwYXRoIHRvIGV2YWx1YXRlXG4gKiBAcmV0dXJucyB0cnVlIGlmIHRoZXJlIGlzIGFuIGFubm90YXRpb24gaW4gdGhlIHBhdGguXG4gKi9cbmZ1bmN0aW9uIGlzQW5ub3RhdGlvblBhdGgocGF0aFN0cjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHBhdGhTdHIuaW5kZXhPZignQCcpICE9PSAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VWYWx1ZShwcm9wZXJ0eVZhbHVlOiBFeHByZXNzaW9uLCB2YWx1ZUZRTjogc3RyaW5nLCBvYmplY3RNYXA6IGFueSwgY29udGV4dDogQ29udmVyc2lvbkNvbnRleHQpIHtcbiAgICBpZiAocHJvcGVydHlWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHN3aXRjaCAocHJvcGVydHlWYWx1ZS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ1N0cmluZyc6XG4gICAgICAgICAgICByZXR1cm4gcHJvcGVydHlWYWx1ZS5TdHJpbmc7XG4gICAgICAgIGNhc2UgJ0ludCc6XG4gICAgICAgICAgICByZXR1cm4gcHJvcGVydHlWYWx1ZS5JbnQ7XG4gICAgICAgIGNhc2UgJ0Jvb2wnOlxuICAgICAgICAgICAgcmV0dXJuIHByb3BlcnR5VmFsdWUuQm9vbDtcbiAgICAgICAgY2FzZSAnRGVjaW1hbCc6XG4gICAgICAgICAgICByZXR1cm4gRGVjaW1hbChwcm9wZXJ0eVZhbHVlLkRlY2ltYWwpO1xuICAgICAgICBjYXNlICdEYXRlJzpcbiAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0eVZhbHVlLkRhdGU7XG4gICAgICAgIGNhc2UgJ0VudW1NZW1iZXInOlxuICAgICAgICAgICAgcmV0dXJuIGFsaWFzKGNvbnRleHQucmF3TWV0YWRhdGEucmVmZXJlbmNlcywgcHJvcGVydHlWYWx1ZS5FbnVtTWVtYmVyKTtcbiAgICAgICAgY2FzZSAnUHJvcGVydHlQYXRoJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1Byb3BlcnR5UGF0aCcsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHByb3BlcnR5VmFsdWUuUHJvcGVydHlQYXRoLFxuICAgICAgICAgICAgICAgIGZ1bGx5UXVhbGlmaWVkTmFtZTogdmFsdWVGUU4sXG4gICAgICAgICAgICAgICAgJHRhcmdldDogX3Jlc29sdmVUYXJnZXQoXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdE1hcCxcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5jdXJyZW50VGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eVZhbHVlLlByb3BlcnR5UGF0aCxcbiAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmN1cnJlbnRUZXJtXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgY2FzZSAnTmF2aWdhdGlvblByb3BlcnR5UGF0aCc6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdOYXZpZ2F0aW9uUHJvcGVydHlQYXRoJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogcHJvcGVydHlWYWx1ZS5OYXZpZ2F0aW9uUHJvcGVydHlQYXRoLFxuICAgICAgICAgICAgICAgIGZ1bGx5UXVhbGlmaWVkTmFtZTogdmFsdWVGUU4sXG4gICAgICAgICAgICAgICAgJHRhcmdldDogX3Jlc29sdmVUYXJnZXQoXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdE1hcCxcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5jdXJyZW50VGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eVZhbHVlLk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5jdXJyZW50VGVybVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgJ0Fubm90YXRpb25QYXRoJzpcbiAgICAgICAgICAgIGNvbnN0IGFubm90YXRpb25UYXJnZXQgPSBfcmVzb2x2ZVRhcmdldChcbiAgICAgICAgICAgICAgICBvYmplY3RNYXAsXG4gICAgICAgICAgICAgICAgY29udGV4dC5jdXJyZW50VGFyZ2V0LFxuICAgICAgICAgICAgICAgIHVuYWxpYXMoY29udGV4dC5yYXdNZXRhZGF0YS5yZWZlcmVuY2VzLCBwcm9wZXJ0eVZhbHVlLkFubm90YXRpb25QYXRoKSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250ZXh0LmN1cnJlbnRUZXJtXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgYW5ub3RhdGlvblBhdGggPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0Fubm90YXRpb25QYXRoJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogcHJvcGVydHlWYWx1ZS5Bbm5vdGF0aW9uUGF0aCxcbiAgICAgICAgICAgICAgICBmdWxseVF1YWxpZmllZE5hbWU6IHZhbHVlRlFOLFxuICAgICAgICAgICAgICAgICR0YXJnZXQ6IGFubm90YXRpb25UYXJnZXQsXG4gICAgICAgICAgICAgICAgYW5ub3RhdGlvbnNUZXJtOiBjb250ZXh0LmN1cnJlbnRUZXJtLFxuICAgICAgICAgICAgICAgIHRlcm06ICcnLFxuICAgICAgICAgICAgICAgIHBhdGg6ICcnXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29udGV4dC51bnJlc29sdmVkQW5ub3RhdGlvbnMucHVzaCh7IGlubGluZTogZmFsc2UsIHRvUmVzb2x2ZTogYW5ub3RhdGlvblBhdGggfSk7XG4gICAgICAgICAgICByZXR1cm4gYW5ub3RhdGlvblBhdGg7XG4gICAgICAgIGNhc2UgJ1BhdGgnOlxuICAgICAgICAgICAgY29uc3QgJHRhcmdldCA9IF9yZXNvbHZlVGFyZ2V0KFxuICAgICAgICAgICAgICAgIG9iamVjdE1hcCxcbiAgICAgICAgICAgICAgICBjb250ZXh0LmN1cnJlbnRUYXJnZXQsXG4gICAgICAgICAgICAgICAgcHJvcGVydHlWYWx1ZS5QYXRoLFxuICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udGV4dC5jdXJyZW50VGVybVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IHBhdGggPSBuZXcgUGF0aChwcm9wZXJ0eVZhbHVlLCAkdGFyZ2V0LCBjb250ZXh0LmN1cnJlbnRUZXJtLCAnJyk7XG4gICAgICAgICAgICBjb250ZXh0LnVucmVzb2x2ZWRBbm5vdGF0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICBpbmxpbmU6IGlzQW5ub3RhdGlvblBhdGgocHJvcGVydHlWYWx1ZS5QYXRoKSxcbiAgICAgICAgICAgICAgICB0b1Jlc29sdmU6IHBhdGhcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHBhdGg7XG5cbiAgICAgICAgY2FzZSAnUmVjb3JkJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVJlY29yZChwcm9wZXJ0eVZhbHVlLlJlY29yZCwgdmFsdWVGUU4sIG9iamVjdE1hcCwgY29udGV4dCk7XG4gICAgICAgIGNhc2UgJ0NvbGxlY3Rpb24nOlxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlQ29sbGVjdGlvbihwcm9wZXJ0eVZhbHVlLkNvbGxlY3Rpb24sIHZhbHVlRlFOLCBvYmplY3RNYXAsIGNvbnRleHQpO1xuICAgICAgICBjYXNlICdBcHBseSc6XG4gICAgICAgIGNhc2UgJ051bGwnOlxuICAgICAgICBjYXNlICdOb3QnOlxuICAgICAgICBjYXNlICdFcSc6XG4gICAgICAgIGNhc2UgJ05lJzpcbiAgICAgICAgY2FzZSAnR3QnOlxuICAgICAgICBjYXNlICdHZSc6XG4gICAgICAgIGNhc2UgJ0x0JzpcbiAgICAgICAgY2FzZSAnTGUnOlxuICAgICAgICBjYXNlICdJZic6XG4gICAgICAgIGNhc2UgJ0FuZCc6XG4gICAgICAgIGNhc2UgJ09yJzpcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0eVZhbHVlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBJbmZlciB0aGUgdHlwZSBvZiBhIHRlcm0gYmFzZWQgb24gaXRzIHR5cGUuXG4gKlxuICogQHBhcmFtIGFubm90YXRpb25zVGVybSBUaGUgYW5ub3RhdGlvbiB0ZXJtXG4gKiBAcGFyYW0gYW5ub3RhdGlvblRhcmdldCB0aGUgYW5ub3RhdGlvbiB0YXJnZXRcbiAqIEBwYXJhbSBjdXJyZW50UHJvcGVydHkgdGhlIGN1cnJlbnQgcHJvcGVydHkgb2YgdGhlIHJlY29yZFxuICogQHJldHVybnMgdGhlIGluZmVycmVkIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIGluZmVyVHlwZUZyb21UZXJtKGFubm90YXRpb25zVGVybTogc3RyaW5nLCBhbm5vdGF0aW9uVGFyZ2V0OiBzdHJpbmcsIGN1cnJlbnRQcm9wZXJ0eT86IHN0cmluZykge1xuICAgIGxldCB0YXJnZXRUeXBlID0gKFRlcm1Ub1R5cGVzIGFzIGFueSlbYW5ub3RhdGlvbnNUZXJtXTtcbiAgICBpZiAoY3VycmVudFByb3BlcnR5KSB7XG4gICAgICAgIGFubm90YXRpb25zVGVybSA9IGFubm90YXRpb25zVGVybS5zcGxpdCgnLicpLnNsaWNlKDAsIC0xKS5qb2luKCcuJykgKyAnLicgKyBjdXJyZW50UHJvcGVydHk7XG4gICAgICAgIHRhcmdldFR5cGUgPSAoVGVybVRvVHlwZXMgYXMgYW55KVthbm5vdGF0aW9uc1Rlcm1dO1xuICAgIH1cbiAgICBjb25zdCBvRXJyb3JNc2cgPSB7XG4gICAgICAgIGlzRXJyb3I6IGZhbHNlLFxuICAgICAgICBtZXNzYWdlOiBgVGhlIHR5cGUgb2YgdGhlIHJlY29yZCB1c2VkIHdpdGhpbiB0aGUgdGVybSAke2Fubm90YXRpb25zVGVybX0gd2FzIG5vdCBkZWZpbmVkIGFuZCB3YXMgaW5mZXJyZWQgYXMgJHt0YXJnZXRUeXBlfS5cbkhpbnQ6IElmIHBvc3NpYmxlLCB0cnkgdG8gbWFpbnRhaW4gdGhlIFR5cGUgcHJvcGVydHkgZm9yIGVhY2ggUmVjb3JkLlxuPEFubm90YXRpb25zIFRhcmdldD1cIiR7YW5ub3RhdGlvblRhcmdldH1cIj5cblx0PEFubm90YXRpb24gVGVybT1cIiR7YW5ub3RhdGlvbnNUZXJtfVwiPlxuXHRcdDxSZWNvcmQ+Li4uPC9SZWNvcmQ+XG5cdDwvQW5ub3RhdGlvbj5cbjwvQW5ub3RhdGlvbnM+YFxuICAgIH07XG4gICAgYWRkQW5ub3RhdGlvbkVycm9yTWVzc2FnZShhbm5vdGF0aW9uVGFyZ2V0ICsgJy8nICsgYW5ub3RhdGlvbnNUZXJtLCBvRXJyb3JNc2cpO1xuICAgIHJldHVybiB0YXJnZXRUeXBlO1xufVxuXG5mdW5jdGlvbiBpc0RhdGFGaWVsZFdpdGhGb3JBY3Rpb24oYW5ub3RhdGlvbkNvbnRlbnQ6IGFueSwgYW5ub3RhdGlvblRlcm06IGFueSkge1xuICAgIHJldHVybiAoXG4gICAgICAgIGFubm90YXRpb25Db250ZW50Lmhhc093blByb3BlcnR5KCdBY3Rpb24nKSAmJlxuICAgICAgICAoYW5ub3RhdGlvblRlcm0uJFR5cGUgPT09ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb24nIHx8XG4gICAgICAgICAgICBhbm5vdGF0aW9uVGVybS4kVHlwZSA9PT0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhBY3Rpb24nKVxuICAgICk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlUmVjb3JkVHlwZShyZWNvcmREZWZpbml0aW9uOiBBbm5vdGF0aW9uUmVjb3JkLCBjb250ZXh0OiBDb252ZXJzaW9uQ29udGV4dCkge1xuICAgIGxldCB0YXJnZXRUeXBlO1xuICAgIGlmICghcmVjb3JkRGVmaW5pdGlvbi50eXBlICYmIGNvbnRleHQuY3VycmVudFRlcm0pIHtcbiAgICAgICAgdGFyZ2V0VHlwZSA9IGluZmVyVHlwZUZyb21UZXJtKFxuICAgICAgICAgICAgY29udGV4dC5jdXJyZW50VGVybSxcbiAgICAgICAgICAgIGNvbnRleHQuY3VycmVudFRhcmdldC5mdWxseVF1YWxpZmllZE5hbWUsXG4gICAgICAgICAgICBjb250ZXh0LmN1cnJlbnRQcm9wZXJ0eVxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRhcmdldFR5cGUgPSB1bmFsaWFzKGNvbnRleHQucmF3TWV0YWRhdGEucmVmZXJlbmNlcywgcmVjb3JkRGVmaW5pdGlvbi50eXBlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldFR5cGU7XG59XG5cbmZ1bmN0aW9uIHBhcnNlUmVjb3JkKFxuICAgIHJlY29yZERlZmluaXRpb246IEFubm90YXRpb25SZWNvcmQsXG4gICAgY3VycmVudEZRTjogc3RyaW5nLFxuICAgIG9iamVjdE1hcDogYW55LFxuICAgIGNvbnRleHQ6IENvbnZlcnNpb25Db250ZXh0XG4pIHtcbiAgICBjb25zdCB0YXJnZXRUeXBlID0gcGFyc2VSZWNvcmRUeXBlKHJlY29yZERlZmluaXRpb24sIGNvbnRleHQpO1xuXG4gICAgY29uc3QgYW5ub3RhdGlvblRlcm06IGFueSA9IHtcbiAgICAgICAgJFR5cGU6IHRhcmdldFR5cGUsXG4gICAgICAgIGZ1bGx5UXVhbGlmaWVkTmFtZTogY3VycmVudEZRTixcbiAgICAgICAgYW5ub3RhdGlvbnM6IHt9XG4gICAgfTtcbiAgICBjb25zdCBhbm5vdGF0aW9uQ29udGVudDogYW55ID0ge307XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocmVjb3JkRGVmaW5pdGlvbi5hbm5vdGF0aW9ucykpIHtcbiAgICAgICAgY29uc3Qgc3ViQW5ub3RhdGlvbkxpc3QgPSB7XG4gICAgICAgICAgICB0YXJnZXQ6IGN1cnJlbnRGUU4sXG4gICAgICAgICAgICBhbm5vdGF0aW9uczogcmVjb3JkRGVmaW5pdGlvbi5hbm5vdGF0aW9ucyxcbiAgICAgICAgICAgIF9fc291cmNlOiBjb250ZXh0LmN1cnJlbnRTb3VyY2VcbiAgICAgICAgfTtcbiAgICAgICAgY29udGV4dC5hZGRpdGlvbmFsQW5ub3RhdGlvbnMucHVzaChzdWJBbm5vdGF0aW9uTGlzdCk7XG4gICAgfVxuICAgIGlmIChyZWNvcmREZWZpbml0aW9uLnByb3BlcnR5VmFsdWVzKSB7XG4gICAgICAgIHJlY29yZERlZmluaXRpb24ucHJvcGVydHlWYWx1ZXMuZm9yRWFjaCgocHJvcGVydHlWYWx1ZTogUHJvcGVydHlWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgY29udGV4dC5jdXJyZW50UHJvcGVydHkgPSBwcm9wZXJ0eVZhbHVlLm5hbWU7XG4gICAgICAgICAgICBhbm5vdGF0aW9uQ29udGVudFtwcm9wZXJ0eVZhbHVlLm5hbWVdID0gcGFyc2VWYWx1ZShcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eVZhbHVlLnZhbHVlLFxuICAgICAgICAgICAgICAgIGAke2N1cnJlbnRGUU59LyR7cHJvcGVydHlWYWx1ZS5uYW1lfWAsXG4gICAgICAgICAgICAgICAgb2JqZWN0TWFwLFxuICAgICAgICAgICAgICAgIGNvbnRleHRcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwcm9wZXJ0eVZhbHVlLmFubm90YXRpb25zKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1YkFubm90YXRpb25MaXN0ID0ge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IGAke2N1cnJlbnRGUU59LyR7cHJvcGVydHlWYWx1ZS5uYW1lfWAsXG4gICAgICAgICAgICAgICAgICAgIGFubm90YXRpb25zOiBwcm9wZXJ0eVZhbHVlLmFubm90YXRpb25zLFxuICAgICAgICAgICAgICAgICAgICBfX3NvdXJjZTogY29udGV4dC5jdXJyZW50U291cmNlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmFkZGl0aW9uYWxBbm5vdGF0aW9ucy5wdXNoKHN1YkFubm90YXRpb25MaXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0RhdGFGaWVsZFdpdGhGb3JBY3Rpb24oYW5ub3RhdGlvbkNvbnRlbnQsIGFubm90YXRpb25UZXJtKSkge1xuICAgICAgICAgICAgICAgIC8vIHRyeSB0byByZXNvbHZlIHRvIGEgYm91bmQgYWN0aW9uIG9mIHRoZSBhbm5vdGF0aW9uIHRhcmdldFxuICAgICAgICAgICAgICAgIGFubm90YXRpb25Db250ZW50LkFjdGlvblRhcmdldCA9IGNvbnRleHQuY3VycmVudFRhcmdldC5hY3Rpb25zPy5bYW5ub3RhdGlvbkNvbnRlbnQuQWN0aW9uXTtcblxuICAgICAgICAgICAgICAgIGlmICghYW5ub3RhdGlvbkNvbnRlbnQuQWN0aW9uVGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IG9iamVjdE1hcFthbm5vdGF0aW9uQ29udGVudC5BY3Rpb25dO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWN0aW9uPy5pc0JvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBib3VuZCBhY3Rpb24gb2YgYSBkaWZmZXJlbnQgZW50aXR5IHR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGFubm90YXRpb25Db250ZW50LkFjdGlvblRhcmdldCA9IGFjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVuYm91bmQgYWN0aW9uIC0tPiByZXNvbHZlIHZpYSB0aGUgYWN0aW9uIGltcG9ydFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbkNvbnRlbnQuQWN0aW9uVGFyZ2V0ID0gYWN0aW9uLmFjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghYW5ub3RhdGlvbkNvbnRlbnQuQWN0aW9uVGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFkZCB0byBkaWFnbm9zdGljcyBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgICAgICAgQU5OT1RBVElPTl9FUlJPUlMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdVbmFibGUgdG8gcmVzb2x2ZSB0aGUgYWN0aW9uICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFubm90YXRpb25Db250ZW50LkFjdGlvbiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyBkZWZpbmVkIGZvciAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbm5vdGF0aW9uVGVybS5mdWxseVF1YWxpZmllZE5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29udGV4dC5jdXJyZW50UHJvcGVydHkgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKGFubm90YXRpb25UZXJtLCBhbm5vdGF0aW9uQ29udGVudCk7XG59XG5cbmV4cG9ydCB0eXBlIENvbGxlY3Rpb25UeXBlID1cbiAgICB8ICdQcm9wZXJ0eVBhdGgnXG4gICAgfCAnUGF0aCdcbiAgICB8ICdJZidcbiAgICB8ICdBcHBseSdcbiAgICB8ICdOdWxsJ1xuICAgIHwgJ0FuZCdcbiAgICB8ICdFcSdcbiAgICB8ICdOZSdcbiAgICB8ICdOb3QnXG4gICAgfCAnR3QnXG4gICAgfCAnR2UnXG4gICAgfCAnTHQnXG4gICAgfCAnTGUnXG4gICAgfCAnT3InXG4gICAgfCAnQW5ub3RhdGlvblBhdGgnXG4gICAgfCAnTmF2aWdhdGlvblByb3BlcnR5UGF0aCdcbiAgICB8ICdSZWNvcmQnXG4gICAgfCAnU3RyaW5nJ1xuICAgIHwgJ0VtcHR5Q29sbGVjdGlvbic7XG5cbi8qKlxuICogUmV0cmlldmUgb3IgaW5mZXIgdGhlIGNvbGxlY3Rpb24gdHlwZSBiYXNlZCBvbiBpdHMgY29udGVudC5cbiAqXG4gKiBAcGFyYW0gY29sbGVjdGlvbkRlZmluaXRpb25cbiAqIEByZXR1cm5zIHRoZSB0eXBlIG9mIHRoZSBjb2xsZWN0aW9uXG4gKi9cbmZ1bmN0aW9uIGdldE9ySW5mZXJDb2xsZWN0aW9uVHlwZShjb2xsZWN0aW9uRGVmaW5pdGlvbjogYW55W10pOiBDb2xsZWN0aW9uVHlwZSB7XG4gICAgbGV0IHR5cGU6IENvbGxlY3Rpb25UeXBlID0gKGNvbGxlY3Rpb25EZWZpbml0aW9uIGFzIGFueSkudHlwZTtcbiAgICBpZiAodHlwZSA9PT0gdW5kZWZpbmVkICYmIGNvbGxlY3Rpb25EZWZpbml0aW9uLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgZmlyc3RDb2xJdGVtID0gY29sbGVjdGlvbkRlZmluaXRpb25bMF07XG4gICAgICAgIGlmIChmaXJzdENvbEl0ZW0uaGFzT3duUHJvcGVydHkoJ1Byb3BlcnR5UGF0aCcpKSB7XG4gICAgICAgICAgICB0eXBlID0gJ1Byb3BlcnR5UGF0aCc7XG4gICAgICAgIH0gZWxzZSBpZiAoZmlyc3RDb2xJdGVtLmhhc093blByb3BlcnR5KCdQYXRoJykpIHtcbiAgICAgICAgICAgIHR5cGUgPSAnUGF0aCc7XG4gICAgICAgIH0gZWxzZSBpZiAoZmlyc3RDb2xJdGVtLmhhc093blByb3BlcnR5KCdBbm5vdGF0aW9uUGF0aCcpKSB7XG4gICAgICAgICAgICB0eXBlID0gJ0Fubm90YXRpb25QYXRoJztcbiAgICAgICAgfSBlbHNlIGlmIChmaXJzdENvbEl0ZW0uaGFzT3duUHJvcGVydHkoJ05hdmlnYXRpb25Qcm9wZXJ0eVBhdGgnKSkge1xuICAgICAgICAgICAgdHlwZSA9ICdOYXZpZ2F0aW9uUHJvcGVydHlQYXRoJztcbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgIHR5cGVvZiBmaXJzdENvbEl0ZW0gPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICAoZmlyc3RDb2xJdGVtLmhhc093blByb3BlcnR5KCd0eXBlJykgfHwgZmlyc3RDb2xJdGVtLmhhc093blByb3BlcnR5KCdwcm9wZXJ0eVZhbHVlcycpKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHR5cGUgPSAnUmVjb3JkJztcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZmlyc3RDb2xJdGVtID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdHlwZSA9ICdTdHJpbmcnO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdHlwZSA9ICdFbXB0eUNvbGxlY3Rpb24nO1xuICAgIH1cbiAgICByZXR1cm4gdHlwZTtcbn1cblxuZnVuY3Rpb24gcGFyc2VDb2xsZWN0aW9uKGNvbGxlY3Rpb25EZWZpbml0aW9uOiBhbnlbXSwgcGFyZW50RlFOOiBzdHJpbmcsIG9iamVjdE1hcDogYW55LCBjb250ZXh0OiBDb252ZXJzaW9uQ29udGV4dCkge1xuICAgIGNvbnN0IGNvbGxlY3Rpb25EZWZpbml0aW9uVHlwZSA9IGdldE9ySW5mZXJDb2xsZWN0aW9uVHlwZShjb2xsZWN0aW9uRGVmaW5pdGlvbik7XG4gICAgc3dpdGNoIChjb2xsZWN0aW9uRGVmaW5pdGlvblR5cGUpIHtcbiAgICAgICAgY2FzZSAnUHJvcGVydHlQYXRoJzpcbiAgICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uRGVmaW5pdGlvbi5tYXAoKHByb3BlcnR5UGF0aCwgcHJvcGVydHlJZHgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUHJvcGVydHlQYXRoJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHByb3BlcnR5UGF0aC5Qcm9wZXJ0eVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIGZ1bGx5UXVhbGlmaWVkTmFtZTogYCR7cGFyZW50RlFOfS8ke3Byb3BlcnR5SWR4fWAsXG4gICAgICAgICAgICAgICAgICAgICR0YXJnZXQ6IF9yZXNvbHZlVGFyZ2V0KFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0TWFwLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dC5jdXJyZW50VGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlQYXRoLlByb3BlcnR5UGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmN1cnJlbnRUZXJtXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGNhc2UgJ1BhdGgnOlxuICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb25EZWZpbml0aW9uLm1hcCgocGF0aFZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgJHRhcmdldCA9IF9yZXNvbHZlVGFyZ2V0KFxuICAgICAgICAgICAgICAgICAgICBvYmplY3RNYXAsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuY3VycmVudFRhcmdldCxcbiAgICAgICAgICAgICAgICAgICAgcGF0aFZhbHVlLlBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmN1cnJlbnRUZXJtXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRoID0gbmV3IFBhdGgocGF0aFZhbHVlLCAkdGFyZ2V0LCBjb250ZXh0LmN1cnJlbnRUZXJtLCAnJyk7XG4gICAgICAgICAgICAgICAgY29udGV4dC51bnJlc29sdmVkQW5ub3RhdGlvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGlubGluZTogaXNBbm5vdGF0aW9uUGF0aChwYXRoVmFsdWUuUGF0aCksXG4gICAgICAgICAgICAgICAgICAgIHRvUmVzb2x2ZTogcGF0aFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXRoO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGNhc2UgJ0Fubm90YXRpb25QYXRoJzpcbiAgICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uRGVmaW5pdGlvbi5tYXAoKGFubm90YXRpb25QYXRoLCBhbm5vdGF0aW9uSWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgYW5ub3RhdGlvblRhcmdldCA9IF9yZXNvbHZlVGFyZ2V0KFxuICAgICAgICAgICAgICAgICAgICBvYmplY3RNYXAsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuY3VycmVudFRhcmdldCxcbiAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvblBhdGguQW5ub3RhdGlvblBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmN1cnJlbnRUZXJtXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBjb25zdCBhbm5vdGF0aW9uQ29sbGVjdGlvbkVsZW1lbnQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdBbm5vdGF0aW9uUGF0aCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhbm5vdGF0aW9uUGF0aC5Bbm5vdGF0aW9uUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgZnVsbHlRdWFsaWZpZWROYW1lOiBgJHtwYXJlbnRGUU59LyR7YW5ub3RhdGlvbklkeH1gLFxuICAgICAgICAgICAgICAgICAgICAkdGFyZ2V0OiBhbm5vdGF0aW9uVGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICBhbm5vdGF0aW9uc1Rlcm06IGNvbnRleHQuY3VycmVudFRlcm0sXG4gICAgICAgICAgICAgICAgICAgIHRlcm06ICcnLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiAnJ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29udGV4dC51bnJlc29sdmVkQW5ub3RhdGlvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGlubGluZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHRvUmVzb2x2ZTogYW5ub3RhdGlvbkNvbGxlY3Rpb25FbGVtZW50XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFubm90YXRpb25Db2xsZWN0aW9uRWxlbWVudDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBjYXNlICdOYXZpZ2F0aW9uUHJvcGVydHlQYXRoJzpcbiAgICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uRGVmaW5pdGlvbi5tYXAoKG5hdlByb3BlcnR5UGF0aCwgbmF2UHJvcElkeCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdOYXZpZ2F0aW9uUHJvcGVydHlQYXRoJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG5hdlByb3BlcnR5UGF0aC5OYXZpZ2F0aW9uUHJvcGVydHlQYXRoLFxuICAgICAgICAgICAgICAgICAgICBmdWxseVF1YWxpZmllZE5hbWU6IGAke3BhcmVudEZRTn0vJHtuYXZQcm9wSWR4fWAsXG4gICAgICAgICAgICAgICAgICAgICR0YXJnZXQ6IF9yZXNvbHZlVGFyZ2V0KFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0TWFwLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dC5jdXJyZW50VGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgbmF2UHJvcGVydHlQYXRoLk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dC5jdXJyZW50VGVybVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBjYXNlICdSZWNvcmQnOlxuICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb25EZWZpbml0aW9uLm1hcCgocmVjb3JkRGVmaW5pdGlvbiwgcmVjb3JkSWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlUmVjb3JkKHJlY29yZERlZmluaXRpb24sIGAke3BhcmVudEZRTn0vJHtyZWNvcmRJZHh9YCwgb2JqZWN0TWFwLCBjb250ZXh0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBjYXNlICdBcHBseSc6XG4gICAgICAgIGNhc2UgJ051bGwnOlxuICAgICAgICBjYXNlICdJZic6XG4gICAgICAgIGNhc2UgJ0VxJzpcbiAgICAgICAgY2FzZSAnTmUnOlxuICAgICAgICBjYXNlICdMdCc6XG4gICAgICAgIGNhc2UgJ0d0JzpcbiAgICAgICAgY2FzZSAnTGUnOlxuICAgICAgICBjYXNlICdHZSc6XG4gICAgICAgIGNhc2UgJ05vdCc6XG4gICAgICAgIGNhc2UgJ0FuZCc6XG4gICAgICAgIGNhc2UgJ09yJzpcbiAgICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uRGVmaW5pdGlvbi5tYXAoKGlmVmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaWZWYWx1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBjYXNlICdTdHJpbmcnOlxuICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb25EZWZpbml0aW9uLm1hcCgoc3RyaW5nVmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHN0cmluZ1ZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5nVmFsdWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdHJpbmdWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmdWYWx1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5nVmFsdWUuU3RyaW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb25EZWZpbml0aW9uLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgY2FzZScpO1xuICAgIH1cbn1cblxudHlwZSBSZXNvbHZlYWJsZSA9IHtcbiAgICBpbmxpbmU6IGJvb2xlYW47XG4gICAgdG9SZXNvbHZlOiB7XG4gICAgICAgICR0YXJnZXQ6IHN0cmluZztcbiAgICAgICAgdGFyZ2V0U3RyaW5nPzogc3RyaW5nO1xuICAgICAgICBhbm5vdGF0aW9uc1Rlcm0/OiBzdHJpbmc7XG4gICAgICAgIGFubm90YXRpb25UeXBlPzogc3RyaW5nO1xuICAgICAgICB0ZXJtOiBzdHJpbmc7XG4gICAgICAgIHBhdGg6IHN0cmluZztcbiAgICB9O1xufTtcblxuZnVuY3Rpb24gY29udmVydEFubm90YXRpb24oYW5ub3RhdGlvbjogQW5ub3RhdGlvbiwgb2JqZWN0TWFwOiBhbnksIGNvbnRleHQ6IENvbnZlcnNpb25Db250ZXh0KTogYW55IHtcbiAgICBpZiAoYW5ub3RhdGlvbi5yZWNvcmQpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlUmVjb3JkKGFubm90YXRpb24ucmVjb3JkLCBhbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSwgb2JqZWN0TWFwLCBjb250ZXh0KTtcbiAgICB9IGVsc2UgaWYgKGFubm90YXRpb24uY29sbGVjdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChhbm5vdGF0aW9uLnZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VWYWx1ZShhbm5vdGF0aW9uLnZhbHVlLCBhbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSwgb2JqZWN0TWFwLCBjb250ZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChhbm5vdGF0aW9uLmNvbGxlY3Rpb24pIHtcbiAgICAgICAgY29uc3QgY29sbGVjdGlvbjogYW55ID0gcGFyc2VDb2xsZWN0aW9uKFxuICAgICAgICAgICAgYW5ub3RhdGlvbi5jb2xsZWN0aW9uLFxuICAgICAgICAgICAgYW5ub3RhdGlvbi5mdWxseVF1YWxpZmllZE5hbWUsXG4gICAgICAgICAgICBvYmplY3RNYXAsXG4gICAgICAgICAgICBjb250ZXh0XG4gICAgICAgICk7XG4gICAgICAgIGNvbGxlY3Rpb24uZnVsbHlRdWFsaWZpZWROYW1lID0gYW5ub3RhdGlvbi5mdWxseVF1YWxpZmllZE5hbWU7XG4gICAgICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgY2FzZScpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgcmVzb2x2ZVBhdGggZnVuY3Rpb24gZm9yIGEgZ2l2ZW4gZW50aXR5VHlwZS5cbiAqXG4gKiBAcGFyYW0gZW50aXR5VHlwZSBUaGUgZW50aXR5VHlwZSBmb3Igd2hpY2ggdGhlIGZ1bmN0aW9uIHNob3VsZCBiZSBjcmVhdGVkXG4gKiBAcGFyYW0gb2JqZWN0TWFwIFRoZSBjdXJyZW50IG9iamVjdE1hcFxuICogQHJldHVybnMgdGhlIHJlc29sdmVQYXRoIGZ1bmN0aW9uIHRoYXQgc3RhcnRzIGF0IHRoZSBlbnRpdHlUeXBlXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVJlc29sdmVQYXRoRm4oZW50aXR5VHlwZTogRW50aXR5VHlwZSwgb2JqZWN0TWFwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChyZWxhdGl2ZVBhdGg6IHN0cmluZywgaW5jbHVkZVZpc2l0ZWRPYmplY3RzOiBib29sZWFuKTogYW55IHtcbiAgICAgICAgY29uc3QgYW5ub3RhdGlvblRlcm06IHN0cmluZyA9ICcnO1xuICAgICAgICByZXR1cm4gX3Jlc29sdmVUYXJnZXQob2JqZWN0TWFwLCBlbnRpdHlUeXBlLCByZWxhdGl2ZVBhdGgsIGZhbHNlLCBpbmNsdWRlVmlzaXRlZE9iamVjdHMsIGFubm90YXRpb25UZXJtKTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiByZXNvbHZlVjJOYXZpZ2F0aW9uUHJvcGVydHkoXG4gICAgbmF2UHJvcDogUmF3VjJOYXZpZ2F0aW9uUHJvcGVydHksXG4gICAgYXNzb2NpYXRpb25zOiBSYXdBc3NvY2lhdGlvbltdLFxuICAgIG9iamVjdE1hcDogUmVjb3JkPHN0cmluZywgYW55PixcbiAgICBvdXROYXZQcm9wOiBOYXZpZ2F0aW9uUHJvcGVydHlcbik6IHZvaWQge1xuICAgIGNvbnN0IHRhcmdldEFzc29jaWF0aW9uID0gYXNzb2NpYXRpb25zLmZpbmQoXG4gICAgICAgIChhc3NvY2lhdGlvbikgPT4gYXNzb2NpYXRpb24uZnVsbHlRdWFsaWZpZWROYW1lID09PSBuYXZQcm9wLnJlbGF0aW9uc2hpcFxuICAgICk7XG4gICAgaWYgKHRhcmdldEFzc29jaWF0aW9uKSB7XG4gICAgICAgIGNvbnN0IGFzc29jaWF0aW9uRW5kID0gdGFyZ2V0QXNzb2NpYXRpb24uYXNzb2NpYXRpb25FbmQuZmluZCgoZW5kKSA9PiBlbmQucm9sZSA9PT0gbmF2UHJvcC50b1JvbGUpO1xuICAgICAgICBpZiAoYXNzb2NpYXRpb25FbmQpIHtcbiAgICAgICAgICAgIG91dE5hdlByb3AudGFyZ2V0VHlwZSA9IG9iamVjdE1hcFthc3NvY2lhdGlvbkVuZC50eXBlXTtcbiAgICAgICAgICAgIG91dE5hdlByb3AuaXNDb2xsZWN0aW9uID0gYXNzb2NpYXRpb25FbmQubXVsdGlwbGljaXR5ID09PSAnKic7XG4gICAgICAgIH1cbiAgICB9XG4gICAgb3V0TmF2UHJvcC5yZWZlcmVudGlhbENvbnN0cmFpbnQgPSBuYXZQcm9wLnJlZmVyZW50aWFsQ29uc3RyYWludCB8fCBbXTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVY0TmF2aWdhdGlvblByb3BlcnR5KFxuICAgIG5hdlByb3A6IFJhd1Y0TmF2aWdhdGlvblByb3BlcnR5LFxuICAgIG9iamVjdE1hcDogUmVjb3JkPHN0cmluZywgYW55PixcbiAgICBvdXROYXZQcm9wOiBOYXZpZ2F0aW9uUHJvcGVydHlcbik6IHZvaWQge1xuICAgIG91dE5hdlByb3AudGFyZ2V0VHlwZSA9IG9iamVjdE1hcFtuYXZQcm9wLnRhcmdldFR5cGVOYW1lXTtcbiAgICBvdXROYXZQcm9wLnBhcnRuZXIgPSBuYXZQcm9wLnBhcnRuZXI7XG4gICAgb3V0TmF2UHJvcC5pc0NvbGxlY3Rpb24gPSBuYXZQcm9wLmlzQ29sbGVjdGlvbjtcbiAgICBvdXROYXZQcm9wLmNvbnRhaW5zVGFyZ2V0ID0gbmF2UHJvcC5jb250YWluc1RhcmdldDtcbiAgICBvdXROYXZQcm9wLnJlZmVyZW50aWFsQ29uc3RyYWludCA9IG5hdlByb3AucmVmZXJlbnRpYWxDb25zdHJhaW50O1xufVxuXG5mdW5jdGlvbiBpc1Y0TmF2aWdhdGlvblByb3BlcnR5KFxuICAgIG5hdlByb3A6IFJhd1YyTmF2aWdhdGlvblByb3BlcnR5IHwgUmF3VjROYXZpZ2F0aW9uUHJvcGVydHlcbik6IG5hdlByb3AgaXMgUmF3VjROYXZpZ2F0aW9uUHJvcGVydHkge1xuICAgIHJldHVybiAhIShuYXZQcm9wIGFzIEJhc2VOYXZpZ2F0aW9uUHJvcGVydHkpLnRhcmdldFR5cGVOYW1lO1xufVxuXG5mdW5jdGlvbiBwcmVwYXJlTmF2aWdhdGlvblByb3BlcnRpZXMoXG4gICAgbmF2aWdhdGlvblByb3BlcnRpZXM6IChSYXdWNE5hdmlnYXRpb25Qcm9wZXJ0eSB8IFJhd1YyTmF2aWdhdGlvblByb3BlcnR5KVtdLFxuICAgIGFzc29jaWF0aW9uczogUmF3QXNzb2NpYXRpb25bXSxcbiAgICBvYmplY3RNYXA6IFJlY29yZDxzdHJpbmcsIGFueT5cbikge1xuICAgIHJldHVybiBuYXZpZ2F0aW9uUHJvcGVydGllcy5tYXAoKG5hdlByb3ApID0+IHtcbiAgICAgICAgY29uc3Qgb3V0TmF2UHJvcDogTmF2aWdhdGlvblByb3BlcnR5ID0ge1xuICAgICAgICAgICAgX3R5cGU6ICdOYXZpZ2F0aW9uUHJvcGVydHknLFxuICAgICAgICAgICAgbmFtZTogbmF2UHJvcC5uYW1lLFxuICAgICAgICAgICAgZnVsbHlRdWFsaWZpZWROYW1lOiBuYXZQcm9wLmZ1bGx5UXVhbGlmaWVkTmFtZSxcbiAgICAgICAgICAgIGlzQ29sbGVjdGlvbjogZmFsc2UsXG4gICAgICAgICAgICBjb250YWluc1RhcmdldDogZmFsc2UsXG4gICAgICAgICAgICByZWZlcmVudGlhbENvbnN0cmFpbnQ6IFtdLFxuICAgICAgICAgICAgYW5ub3RhdGlvbnM6IHt9LFxuICAgICAgICAgICAgcGFydG5lcjogJycsXG4gICAgICAgICAgICB0YXJnZXRUeXBlOiB1bmRlZmluZWQgYXMgYW55LFxuICAgICAgICAgICAgdGFyZ2V0VHlwZU5hbWU6ICcnXG4gICAgICAgIH07XG4gICAgICAgIGlmIChpc1Y0TmF2aWdhdGlvblByb3BlcnR5KG5hdlByb3ApKSB7XG4gICAgICAgICAgICByZXNvbHZlVjROYXZpZ2F0aW9uUHJvcGVydHkobmF2UHJvcCwgb2JqZWN0TWFwLCBvdXROYXZQcm9wKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc29sdmVWMk5hdmlnYXRpb25Qcm9wZXJ0eShuYXZQcm9wLCBhc3NvY2lhdGlvbnMsIG9iamVjdE1hcCwgb3V0TmF2UHJvcCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG91dE5hdlByb3AudGFyZ2V0VHlwZSkge1xuICAgICAgICAgICAgb3V0TmF2UHJvcC50YXJnZXRUeXBlTmFtZSA9IG91dE5hdlByb3AudGFyZ2V0VHlwZS5mdWxseVF1YWxpZmllZE5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgb2JqZWN0TWFwW291dE5hdlByb3AuZnVsbHlRdWFsaWZpZWROYW1lXSA9IG91dE5hdlByb3A7XG4gICAgICAgIHJldHVybiBvdXROYXZQcm9wO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSBlbnRpdHlUeXBlc1xuICogQHBhcmFtIGFzc29jaWF0aW9uc1xuICogQHBhcmFtIG9iamVjdE1hcFxuICovXG5mdW5jdGlvbiByZXNvbHZlTmF2aWdhdGlvblByb3BlcnRpZXMoXG4gICAgZW50aXR5VHlwZXM6IFJhd0VudGl0eVR5cGVbXSxcbiAgICBhc3NvY2lhdGlvbnM6IFJhd0Fzc29jaWF0aW9uW10sXG4gICAgb2JqZWN0TWFwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+XG4pOiB2b2lkIHtcbiAgICBlbnRpdHlUeXBlcy5mb3JFYWNoKChlbnRpdHlUeXBlKSA9PiB7XG4gICAgICAgIGVudGl0eVR5cGUubmF2aWdhdGlvblByb3BlcnRpZXMgPSBwcmVwYXJlTmF2aWdhdGlvblByb3BlcnRpZXMoXG4gICAgICAgICAgICBlbnRpdHlUeXBlLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLFxuICAgICAgICAgICAgYXNzb2NpYXRpb25zLFxuICAgICAgICAgICAgb2JqZWN0TWFwXG4gICAgICAgICk7XG4gICAgICAgIChlbnRpdHlUeXBlIGFzIEVudGl0eVR5cGUpLnJlc29sdmVQYXRoID0gY3JlYXRlUmVzb2x2ZVBhdGhGbihlbnRpdHlUeXBlIGFzIEVudGl0eVR5cGUsIG9iamVjdE1hcCk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogQHBhcmFtIG5hbWVzcGFjZVxuICogQHBhcmFtIGFjdGlvbnNcbiAqIEBwYXJhbSBvYmplY3RNYXBcbiAqL1xuZnVuY3Rpb24gbGlua0FjdGlvbnNUb0VudGl0eVR5cGUobmFtZXNwYWNlOiBzdHJpbmcsIGFjdGlvbnM6IEFjdGlvbltdLCBvYmplY3RNYXA6IFJlY29yZDxzdHJpbmcsIGFueT4pOiB2b2lkIHtcbiAgICBhY3Rpb25zLmZvckVhY2goKGFjdGlvbikgPT4ge1xuICAgICAgICBpZiAoIWFjdGlvbi5hbm5vdGF0aW9ucykge1xuICAgICAgICAgICAgYWN0aW9uLmFubm90YXRpb25zID0ge307XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFjdGlvbi5pc0JvdW5kKSB7XG4gICAgICAgICAgICBjb25zdCBzb3VyY2VFbnRpdHlUeXBlID0gb2JqZWN0TWFwW2FjdGlvbi5zb3VyY2VUeXBlXTtcbiAgICAgICAgICAgIGFjdGlvbi5zb3VyY2VFbnRpdHlUeXBlID0gc291cmNlRW50aXR5VHlwZTtcbiAgICAgICAgICAgIGlmIChzb3VyY2VFbnRpdHlUeXBlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzb3VyY2VFbnRpdHlUeXBlLmFjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlRW50aXR5VHlwZS5hY3Rpb25zID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNvdXJjZUVudGl0eVR5cGUuYWN0aW9uc1tgJHtuYW1lc3BhY2V9LiR7YWN0aW9uLm5hbWV9YF0gPSBhY3Rpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhY3Rpb24ucmV0dXJuRW50aXR5VHlwZSA9IG9iamVjdE1hcFthY3Rpb24ucmV0dXJuVHlwZV07XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gbGlua0FjdGlvbkltcG9ydHNUb0FjdGlvbnMoYWN0aW9uSW1wb3J0czogQWN0aW9uSW1wb3J0W10sIG9iamVjdE1hcDogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQge1xuICAgIGFjdGlvbkltcG9ydHMuZm9yRWFjaCgoYWN0aW9uSW1wb3J0KSA9PiB7XG4gICAgICAgIGFjdGlvbkltcG9ydC5hY3Rpb24gPSBvYmplY3RNYXBbYWN0aW9uSW1wb3J0LmFjdGlvbk5hbWVdO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSBlbnRpdHlTZXRzXG4gKiBAcGFyYW0gb2JqZWN0TWFwXG4gKiBAcGFyYW0gcmVmZXJlbmNlc1xuICovXG5mdW5jdGlvbiBsaW5rRW50aXR5VHlwZVRvRW50aXR5U2V0KFxuICAgIGVudGl0eVNldHM6IEVudGl0eVNldFtdLFxuICAgIG9iamVjdE1hcDogUmVjb3JkPHN0cmluZywgYW55PixcbiAgICByZWZlcmVuY2VzOiBSZWZlcmVuY2VzV2l0aE1hcFxuKTogdm9pZCB7XG4gICAgZW50aXR5U2V0cy5mb3JFYWNoKChlbnRpdHlTZXQpID0+IHtcbiAgICAgICAgZW50aXR5U2V0LmVudGl0eVR5cGUgPSBvYmplY3RNYXBbZW50aXR5U2V0LmVudGl0eVR5cGVOYW1lXTtcbiAgICAgICAgaWYgKCFlbnRpdHlTZXQuZW50aXR5VHlwZSkge1xuICAgICAgICAgICAgZW50aXR5U2V0LmVudGl0eVR5cGUgPSBvYmplY3RNYXBbdW5hbGlhcyhyZWZlcmVuY2VzLCBlbnRpdHlTZXQuZW50aXR5VHlwZU5hbWUpIGFzIHN0cmluZ107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFlbnRpdHlTZXQuYW5ub3RhdGlvbnMpIHtcbiAgICAgICAgICAgIGVudGl0eVNldC5hbm5vdGF0aW9ucyA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghZW50aXR5U2V0LmVudGl0eVR5cGUuYW5ub3RhdGlvbnMpIHtcbiAgICAgICAgICAgIGVudGl0eVNldC5lbnRpdHlUeXBlLmFubm90YXRpb25zID0ge307XG4gICAgICAgIH1cbiAgICAgICAgZW50aXR5U2V0LmVudGl0eVR5cGUua2V5cy5mb3JFYWNoKChrZXlQcm9wOiBQcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAga2V5UHJvcC5pc0tleSA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSBzaW5nbGV0b25zXG4gKiBAcGFyYW0gb2JqZWN0TWFwXG4gKiBAcGFyYW0gcmVmZXJlbmNlc1xuICovXG5mdW5jdGlvbiBsaW5rRW50aXR5VHlwZVRvU2luZ2xldG9uKFxuICAgIHNpbmdsZXRvbnM6IFNpbmdsZXRvbltdLFxuICAgIG9iamVjdE1hcDogUmVjb3JkPHN0cmluZywgYW55PixcbiAgICByZWZlcmVuY2VzOiBSZWZlcmVuY2VzV2l0aE1hcFxuKTogdm9pZCB7XG4gICAgc2luZ2xldG9ucy5mb3JFYWNoKChzaW5nbGV0b24pID0+IHtcbiAgICAgICAgc2luZ2xldG9uLmVudGl0eVR5cGUgPSBvYmplY3RNYXBbc2luZ2xldG9uLmVudGl0eVR5cGVOYW1lXTtcbiAgICAgICAgaWYgKCFzaW5nbGV0b24uZW50aXR5VHlwZSkge1xuICAgICAgICAgICAgc2luZ2xldG9uLmVudGl0eVR5cGUgPSBvYmplY3RNYXBbdW5hbGlhcyhyZWZlcmVuY2VzLCBzaW5nbGV0b24uZW50aXR5VHlwZU5hbWUpIGFzIHN0cmluZ107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFzaW5nbGV0b24uYW5ub3RhdGlvbnMpIHtcbiAgICAgICAgICAgIHNpbmdsZXRvbi5hbm5vdGF0aW9ucyA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghc2luZ2xldG9uLmVudGl0eVR5cGUuYW5ub3RhdGlvbnMpIHtcbiAgICAgICAgICAgIHNpbmdsZXRvbi5lbnRpdHlUeXBlLmFubm90YXRpb25zID0ge307XG4gICAgICAgIH1cbiAgICAgICAgc2luZ2xldG9uLmVudGl0eVR5cGUua2V5cy5mb3JFYWNoKChrZXlQcm9wOiBQcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAga2V5UHJvcC5pc0tleSA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSBlbnRpdHlUeXBlc1xuICogQHBhcmFtIG9iamVjdE1hcFxuICovXG5mdW5jdGlvbiBsaW5rUHJvcGVydGllc1RvQ29tcGxleFR5cGVzKGVudGl0eVR5cGVzOiBFbnRpdHlUeXBlW10sIG9iamVjdE1hcDogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGxpbmsocHJvcGVydHk6IFByb3BlcnR5KSB7XG4gICAgICAgIGlmICghcHJvcGVydHkuYW5ub3RhdGlvbnMpIHtcbiAgICAgICAgICAgIHByb3BlcnR5LmFubm90YXRpb25zID0ge307XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHByb3BlcnR5LnR5cGUuaW5kZXhPZignRWRtJykgIT09IDApIHtcbiAgICAgICAgICAgICAgICBsZXQgY29tcGxleFR5cGU6IENvbXBsZXhUeXBlIHwgVHlwZURlZmluaXRpb247XG4gICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5LnR5cGUuc3RhcnRzV2l0aCgnQ29sbGVjdGlvbicpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBsZXhUeXBlTmFtZSA9IHByb3BlcnR5LnR5cGUuc3Vic3RyaW5nKDExLCBwcm9wZXJ0eS50eXBlLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV4VHlwZSA9IG9iamVjdE1hcFtjb21wbGV4VHlwZU5hbWVdIGFzIENvbXBsZXhUeXBlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXhUeXBlID0gb2JqZWN0TWFwW3Byb3BlcnR5LnR5cGVdIGFzIENvbXBsZXhUeXBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY29tcGxleFR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHkudGFyZ2V0VHlwZSA9IGNvbXBsZXhUeXBlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29tcGxleFR5cGUucHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxleFR5cGUucHJvcGVydGllcy5mb3JFYWNoKGxpbmspO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChzRXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUHJvcGVydHkgVHlwZSBpcyBub3QgZGVmaW5lZCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZW50aXR5VHlwZXMuZm9yRWFjaCgoZW50aXR5VHlwZSkgPT4ge1xuICAgICAgICBlbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXMuZm9yRWFjaChsaW5rKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gY29tcGxleFR5cGVzXG4gKiBAcGFyYW0gYXNzb2NpYXRpb25zXG4gKiBAcGFyYW0gb2JqZWN0TWFwXG4gKi9cbmZ1bmN0aW9uIHByZXBhcmVDb21wbGV4VHlwZXMoXG4gICAgY29tcGxleFR5cGVzOiBSYXdDb21wbGV4VHlwZVtdLFxuICAgIGFzc29jaWF0aW9uczogUmF3QXNzb2NpYXRpb25bXSxcbiAgICBvYmplY3RNYXA6IFJlY29yZDxzdHJpbmcsIGFueT5cbikge1xuICAgIGNvbXBsZXhUeXBlcy5mb3JFYWNoKChjb21wbGV4VHlwZSkgPT4ge1xuICAgICAgICAoY29tcGxleFR5cGUgYXMgQ29tcGxleFR5cGUpLmFubm90YXRpb25zID0ge307XG4gICAgICAgIGNvbXBsZXhUeXBlLnByb3BlcnRpZXMuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICAgICAgICAgIGlmICghKHByb3BlcnR5IGFzIFByb3BlcnR5KS5hbm5vdGF0aW9ucykge1xuICAgICAgICAgICAgICAgIChwcm9wZXJ0eSBhcyBQcm9wZXJ0eSkuYW5ub3RhdGlvbnMgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29tcGxleFR5cGUubmF2aWdhdGlvblByb3BlcnRpZXMgPSBwcmVwYXJlTmF2aWdhdGlvblByb3BlcnRpZXMoXG4gICAgICAgICAgICBjb21wbGV4VHlwZS5uYXZpZ2F0aW9uUHJvcGVydGllcyxcbiAgICAgICAgICAgIGFzc29jaWF0aW9ucyxcbiAgICAgICAgICAgIG9iamVjdE1hcFxuICAgICAgICApO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFNwbGl0IHRoZSBhbGlhcyBmcm9tIHRoZSB0ZXJtIHZhbHVlLlxuICpcbiAqIEBwYXJhbSByZWZlcmVuY2VzIHRoZSBjdXJyZW50IHNldCBvZiByZWZlcmVuY2VzXG4gKiBAcGFyYW0gdGVybVZhbHVlIHRoZSB2YWx1ZSBvZiB0aGUgdGVybVxuICogQHJldHVybnMgdGhlIHRlcm0gYWxpYXMgYW5kIHRoZSBhY3R1YWwgdGVybSB2YWx1ZVxuICovXG5mdW5jdGlvbiBzcGxpdFRlcm0ocmVmZXJlbmNlczogUmVmZXJlbmNlc1dpdGhNYXAsIHRlcm1WYWx1ZTogc3RyaW5nKSB7XG4gICAgY29uc3QgYWxpYXNlZFRlcm0gPSBhbGlhcyhyZWZlcmVuY2VzLCB0ZXJtVmFsdWUpO1xuICAgIGNvbnN0IGxhc3REb3QgPSBhbGlhc2VkVGVybS5sYXN0SW5kZXhPZignLicpO1xuICAgIGNvbnN0IHRlcm1BbGlhcyA9IGFsaWFzZWRUZXJtLnN1YnN0cmluZygwLCBsYXN0RG90KTtcbiAgICBjb25zdCB0ZXJtID0gYWxpYXNlZFRlcm0uc3Vic3RyaW5nKGxhc3REb3QgKyAxKTtcbiAgICByZXR1cm4gW3Rlcm1BbGlhcywgdGVybV07XG59XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgZnVuY3Rpb24gdGhhdCB3aWxsIHJlc29sdmUgYSBzcGVjaWZpYyBwYXRoLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZWRPdXRwdXRcbiAqIEBwYXJhbSBvYmplY3RNYXBcbiAqIEByZXR1cm5zIHRoZSBmdW5jdGlvbiB0aGF0IHdpbGwgYWxsb3cgdG8gcmVzb2x2ZSBlbGVtZW50IGdsb2JhbGx5LlxuICovXG5mdW5jdGlvbiBjcmVhdGVHbG9iYWxSZXNvbHZlKGNvbnZlcnRlZE91dHB1dDogQ29udmVydGVkTWV0YWRhdGEsIG9iamVjdE1hcDogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgIHJldHVybiBmdW5jdGlvbiByZXNvbHZlUGF0aDxUPihzUGF0aDogc3RyaW5nLCByZXNvbHZlRGlyZWN0bHk6IGJvb2xlYW4gPSBmYWxzZSk6IFJlc29sdXRpb25UYXJnZXQ8VD4ge1xuICAgICAgICBpZiAocmVzb2x2ZURpcmVjdGx5KSB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0UGF0aCA9IHNQYXRoO1xuICAgICAgICAgICAgaWYgKCFzUGF0aC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRQYXRoID0gYC8ke3NQYXRofWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRSZXNvbHV0aW9uOiBhbnkgPSBfcmVzb2x2ZVRhcmdldChvYmplY3RNYXAsIGNvbnZlcnRlZE91dHB1dCwgdGFyZ2V0UGF0aCwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgICAgaWYgKHRhcmdldFJlc29sdXRpb24udGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0UmVzb2x1dGlvbi52aXNpdGVkT2JqZWN0cy5wdXNoKHRhcmdldFJlc29sdXRpb24udGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB0YXJnZXRSZXNvbHV0aW9uLnRhcmdldCxcbiAgICAgICAgICAgICAgICBvYmplY3RQYXRoOiB0YXJnZXRSZXNvbHV0aW9uLnZpc2l0ZWRPYmplY3RzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFQYXRoU3BsaXQgPSBzUGF0aC5zcGxpdCgnLycpO1xuICAgICAgICBpZiAoYVBhdGhTcGxpdC5zaGlmdCgpICE9PSAnJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZGVhbCB3aXRoIHJlbGF0aXZlIHBhdGgnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbnRpdHlTZXROYW1lID0gYVBhdGhTcGxpdC5zaGlmdCgpO1xuICAgICAgICBjb25zdCBlbnRpdHlTZXQgPSBjb252ZXJ0ZWRPdXRwdXQuZW50aXR5U2V0cy5maW5kKChldDogRW50aXR5U2V0KSA9PiBldC5uYW1lID09PSBlbnRpdHlTZXROYW1lKTtcbiAgICAgICAgY29uc3Qgc2luZ2xldG9uID0gY29udmVydGVkT3V0cHV0LnNpbmdsZXRvbnMuZmluZCgoZXQ6IFNpbmdsZXRvbikgPT4gZXQubmFtZSA9PT0gZW50aXR5U2V0TmFtZSk7XG4gICAgICAgIGlmICghZW50aXR5U2V0ICYmICFzaW5nbGV0b24pIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBjb252ZXJ0ZWRPdXRwdXQuZW50aXR5Q29udGFpbmVyLFxuICAgICAgICAgICAgICAgIG9iamVjdFBhdGg6IFtjb252ZXJ0ZWRPdXRwdXQuZW50aXR5Q29udGFpbmVyXVxuICAgICAgICAgICAgfSBhcyBSZXNvbHV0aW9uVGFyZ2V0PFQ+O1xuICAgICAgICB9XG4gICAgICAgIGlmIChhUGF0aFNwbGl0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IGVudGl0eVNldCB8fCBzaW5nbGV0b24sXG4gICAgICAgICAgICAgICAgb2JqZWN0UGF0aDogW2NvbnZlcnRlZE91dHB1dC5lbnRpdHlDb250YWluZXIsIGVudGl0eVNldCB8fCBzaW5nbGV0b25dXG4gICAgICAgICAgICB9IGFzIFJlc29sdXRpb25UYXJnZXQ8VD47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRSZXNvbHV0aW9uOiBhbnkgPSBfcmVzb2x2ZVRhcmdldChcbiAgICAgICAgICAgICAgICBvYmplY3RNYXAsXG4gICAgICAgICAgICAgICAgZW50aXR5U2V0IHx8IHNpbmdsZXRvbixcbiAgICAgICAgICAgICAgICAnLycgKyBhUGF0aFNwbGl0LmpvaW4oJy8nKSxcbiAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKHRhcmdldFJlc29sdXRpb24udGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0UmVzb2x1dGlvbi52aXNpdGVkT2JqZWN0cy5wdXNoKHRhcmdldFJlc29sdXRpb24udGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB0YXJnZXRSZXNvbHV0aW9uLnRhcmdldCxcbiAgICAgICAgICAgICAgICBvYmplY3RQYXRoOiB0YXJnZXRSZXNvbHV0aW9uLnZpc2l0ZWRPYmplY3RzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfTtcbn1cblxudHlwZSBDb252ZXJzaW9uQ29udGV4dCA9IHtcbiAgICB1bnJlc29sdmVkQW5ub3RhdGlvbnM6IFJlc29sdmVhYmxlW107XG4gICAgYWRkaXRpb25hbEFubm90YXRpb25zOiBBbm5vdGF0aW9uTGlzdFtdO1xuICAgIHJhd01ldGFkYXRhOiBSYXdNZXRhZGF0YTtcbiAgICBjdXJyZW50U291cmNlOiBzdHJpbmc7XG4gICAgY3VycmVudFRhcmdldDogYW55O1xuICAgIGN1cnJlbnRQcm9wZXJ0eT86IHN0cmluZztcbiAgICBjdXJyZW50VGVybTogc3RyaW5nO1xufTtcblxuZnVuY3Rpb24gZW5zdXJlQW5ub3RhdGlvbnMoY3VycmVudFRhcmdldDogYW55LCB2b2NBbGlhczogc3RyaW5nKSB7XG4gICAgaWYgKCFjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zKSB7XG4gICAgICAgIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnMgPSB7fTtcbiAgICB9XG4gICAgaWYgKCFjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zW3ZvY0FsaWFzXSkge1xuICAgICAgICBjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zW3ZvY0FsaWFzXSA9IHt9O1xuICAgIH1cbiAgICBpZiAoIWN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnMuX2Fubm90YXRpb25zKSB7XG4gICAgICAgIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnMuX2Fubm90YXRpb25zID0ge307XG4gICAgfVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzQW5ub3RhdGlvbnMoXG4gICAgY3VycmVudENvbnRleHQ6IENvbnZlcnNpb25Db250ZXh0LFxuICAgIGFubm90YXRpb25MaXN0OiBBbm5vdGF0aW9uTGlzdCxcbiAgICBvYmplY3RNYXA6IFJlY29yZDxzdHJpbmcsIGFueT4sXG4gICAgYk92ZXJyaWRlRXhpc3Rpbmc6IGJvb2xlYW5cbikge1xuICAgIGNvbnN0IGN1cnJlbnRUYXJnZXQgPSBjdXJyZW50Q29udGV4dC5jdXJyZW50VGFyZ2V0O1xuICAgIGNvbnN0IGN1cnJlbnRUYXJnZXROYW1lID0gY3VycmVudFRhcmdldC5mdWxseVF1YWxpZmllZE5hbWU7XG4gICAgYW5ub3RhdGlvbkxpc3QuYW5ub3RhdGlvbnMuZm9yRWFjaCgoYW5ub3RhdGlvbjogUmF3QW5ub3RhdGlvbikgPT4ge1xuICAgICAgICBjdXJyZW50Q29udGV4dC5jdXJyZW50U291cmNlID0gKGFubm90YXRpb24gYXMgYW55KS5fX3NvdXJjZSB8fCAoYW5ub3RhdGlvbkxpc3QgYXMgYW55KS5fX3NvdXJjZTtcbiAgICAgICAgY29uc3QgW3ZvY0FsaWFzLCB2b2NUZXJtXSA9IHNwbGl0VGVybShkZWZhdWx0UmVmZXJlbmNlcywgYW5ub3RhdGlvbi50ZXJtKTtcbiAgICAgICAgZW5zdXJlQW5ub3RhdGlvbnMoY3VycmVudFRhcmdldCwgdm9jQWxpYXMpO1xuXG4gICAgICAgIGNvbnN0IHZvY1Rlcm1XaXRoUXVhbGlmaWVyID0gYCR7dm9jVGVybX0ke2Fubm90YXRpb24ucXVhbGlmaWVyID8gJyMnICsgYW5ub3RhdGlvbi5xdWFsaWZpZXIgOiAnJ31gO1xuICAgICAgICBpZiAoIWJPdmVycmlkZUV4aXN0aW5nICYmIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnM/Llt2b2NBbGlhc10/Llt2b2NUZXJtV2l0aFF1YWxpZmllcl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnRDb250ZXh0LmN1cnJlbnRUZXJtID0gYW5ub3RhdGlvbi50ZXJtO1xuICAgICAgICBjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zW3ZvY0FsaWFzXVt2b2NUZXJtV2l0aFF1YWxpZmllcl0gPSBjb252ZXJ0QW5ub3RhdGlvbihcbiAgICAgICAgICAgIGFubm90YXRpb24gYXMgQW5ub3RhdGlvbixcbiAgICAgICAgICAgIG9iamVjdE1hcCxcbiAgICAgICAgICAgIGN1cnJlbnRDb250ZXh0XG4gICAgICAgICk7XG5cbiAgICAgICAgc3dpdGNoICh0eXBlb2YgY3VycmVudFRhcmdldC5hbm5vdGF0aW9uc1t2b2NBbGlhc11bdm9jVGVybVdpdGhRdWFsaWZpZXJdKSB7XG4gICAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1uZXctd3JhcHBlcnNcbiAgICAgICAgICAgICAgICBjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zW3ZvY0FsaWFzXVt2b2NUZXJtV2l0aFF1YWxpZmllcl0gPSBuZXcgU3RyaW5nKFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zW3ZvY0FsaWFzXVt2b2NUZXJtV2l0aFF1YWxpZmllcl1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLW5ldy13cmFwcGVyc1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXSA9IG5ldyBCb29sZWFuKFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zW3ZvY0FsaWFzXVt2b2NUZXJtV2l0aFF1YWxpZmllcl1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgY3VycmVudFRhcmdldC5hbm5vdGF0aW9uc1t2b2NBbGlhc11bdm9jVGVybVdpdGhRdWFsaWZpZXJdICE9PSBudWxsICYmXG4gICAgICAgICAgICB0eXBlb2YgY3VycmVudFRhcmdldC5hbm5vdGF0aW9uc1t2b2NBbGlhc11bdm9jVGVybVdpdGhRdWFsaWZpZXJdID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICAgIWN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXS5hbm5vdGF0aW9uc1xuICAgICAgICApIHtcbiAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXS5hbm5vdGF0aW9ucyA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgdHlwZW9mIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXSA9PT0gJ29iamVjdCdcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zW3ZvY0FsaWFzXVt2b2NUZXJtV2l0aFF1YWxpZmllcl0udGVybSA9IHVuYWxpYXMoXG4gICAgICAgICAgICAgICAgZGVmYXVsdFJlZmVyZW5jZXMsXG4gICAgICAgICAgICAgICAgYCR7dm9jQWxpYXN9LiR7dm9jVGVybX1gXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY3VycmVudFRhcmdldC5hbm5vdGF0aW9uc1t2b2NBbGlhc11bdm9jVGVybVdpdGhRdWFsaWZpZXJdLnF1YWxpZmllciA9IGFubm90YXRpb24ucXVhbGlmaWVyO1xuICAgICAgICAgICAgY3VycmVudFRhcmdldC5hbm5vdGF0aW9uc1t2b2NBbGlhc11bdm9jVGVybVdpdGhRdWFsaWZpZXJdLl9fc291cmNlID0gY3VycmVudENvbnRleHQuY3VycmVudFNvdXJjZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhbm5vdGF0aW9uVGFyZ2V0ID0gYCR7Y3VycmVudFRhcmdldE5hbWV9QCR7dW5hbGlhcyhcbiAgICAgICAgICAgIGRlZmF1bHRSZWZlcmVuY2VzLFxuICAgICAgICAgICAgdm9jQWxpYXMgKyAnLicgKyB2b2NUZXJtV2l0aFF1YWxpZmllclxuICAgICAgICApfWA7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGFubm90YXRpb24uYW5ub3RhdGlvbnMpKSB7XG4gICAgICAgICAgICBjb25zdCBzdWJBbm5vdGF0aW9uTGlzdCA9IHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IGFubm90YXRpb25UYXJnZXQsXG4gICAgICAgICAgICAgICAgYW5ub3RhdGlvbnM6IGFubm90YXRpb24uYW5ub3RhdGlvbnMsXG4gICAgICAgICAgICAgICAgX19zb3VyY2U6IGN1cnJlbnRDb250ZXh0LmN1cnJlbnRTb3VyY2VcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjdXJyZW50Q29udGV4dC5hZGRpdGlvbmFsQW5ub3RhdGlvbnMucHVzaChzdWJBbm5vdGF0aW9uTGlzdCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYW5ub3RhdGlvbi5hbm5vdGF0aW9ucyAmJiAhY3VycmVudFRhcmdldC5hbm5vdGF0aW9uc1t2b2NBbGlhc11bdm9jVGVybVdpdGhRdWFsaWZpZXJdLmFubm90YXRpb25zKSB7XG4gICAgICAgICAgICBjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zW3ZvY0FsaWFzXVt2b2NUZXJtV2l0aFF1YWxpZmllcl0uYW5ub3RhdGlvbnMgPSBhbm5vdGF0aW9uLmFubm90YXRpb25zO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnMuX2Fubm90YXRpb25zW2Ake3ZvY0FsaWFzfS4ke3ZvY1Rlcm1XaXRoUXVhbGlmaWVyfWBdID1cbiAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnMuX2Fubm90YXRpb25zW3VuYWxpYXMoZGVmYXVsdFJlZmVyZW5jZXMsIGAke3ZvY0FsaWFzfS4ke3ZvY1Rlcm1XaXRoUXVhbGlmaWVyfWApIV0gPVxuICAgICAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXTtcbiAgICAgICAgb2JqZWN0TWFwW2Fubm90YXRpb25UYXJnZXRdID0gY3VycmVudFRhcmdldC5hbm5vdGF0aW9uc1t2b2NBbGlhc11bdm9jVGVybVdpdGhRdWFsaWZpZXJdO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFByb2Nlc3MgYWxsIHRoZSB1bnJlc29sdmVkIHRhcmdldHMgc28gZmFyIHRvIHRyeSBhbmQgc2VlIGlmIHRoZXkgYXJlIHJlc29sdmVhYmxlIGluIHRoZSBlbmQuXG4gKlxuICogQHBhcmFtIHVucmVzb2x2ZWRUYXJnZXRzXG4gKiBAcGFyYW0gb2JqZWN0TWFwXG4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NVbnJlc29sdmVkVGFyZ2V0cyh1bnJlc29sdmVkVGFyZ2V0czogUmVzb2x2ZWFibGVbXSwgb2JqZWN0TWFwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG4gICAgdW5yZXNvbHZlZFRhcmdldHMuZm9yRWFjaCgocmVzb2x2YWJsZSkgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXRUb1Jlc29sdmUgPSByZXNvbHZhYmxlLnRvUmVzb2x2ZTtcbiAgICAgICAgY29uc3QgdGFyZ2V0U3RyID0gdGFyZ2V0VG9SZXNvbHZlLiR0YXJnZXQ7XG4gICAgICAgIGNvbnN0IHJlc29sdmVkVGFyZ2V0ID0gb2JqZWN0TWFwW3RhcmdldFN0cl07XG4gICAgICAgIGNvbnN0IHsgYW5ub3RhdGlvbnNUZXJtLCBhbm5vdGF0aW9uVHlwZSB9ID0gdGFyZ2V0VG9SZXNvbHZlO1xuICAgICAgICBkZWxldGUgdGFyZ2V0VG9SZXNvbHZlLmFubm90YXRpb25UeXBlO1xuICAgICAgICBkZWxldGUgdGFyZ2V0VG9SZXNvbHZlLmFubm90YXRpb25zVGVybTtcblxuICAgICAgICBpZiAocmVzb2x2YWJsZS5pbmxpbmUgJiYgIShyZXNvbHZlZFRhcmdldCBpbnN0YW5jZW9mIFN0cmluZykpIHtcbiAgICAgICAgICAgIC8vIGlubGluZSB0aGUgcmVzb2x2ZWQgdGFyZ2V0XG4gICAgICAgICAgICBsZXQga2V5czoga2V5b2YgdHlwZW9mIHRhcmdldFRvUmVzb2x2ZTtcbiAgICAgICAgICAgIGZvciAoa2V5cyBpbiB0YXJnZXRUb1Jlc29sdmUpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGFyZ2V0VG9SZXNvbHZlW2tleXNdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHRhcmdldFRvUmVzb2x2ZSwgcmVzb2x2ZWRUYXJnZXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gYXNzaWduIHRoZSByZXNvbHZlZCB0YXJnZXRcbiAgICAgICAgICAgIHRhcmdldFRvUmVzb2x2ZS4kdGFyZ2V0ID0gcmVzb2x2ZWRUYXJnZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXJlc29sdmVkVGFyZ2V0KSB7XG4gICAgICAgICAgICB0YXJnZXRUb1Jlc29sdmUudGFyZ2V0U3RyaW5nID0gdGFyZ2V0U3RyO1xuICAgICAgICAgICAgaWYgKGFubm90YXRpb25zVGVybSAmJiBhbm5vdGF0aW9uVHlwZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9FcnJvck1zZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTpcbiAgICAgICAgICAgICAgICAgICAgICAgICdVbmFibGUgdG8gcmVzb2x2ZSB0aGUgcGF0aCBleHByZXNzaW9uOiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFN0ciArXG4gICAgICAgICAgICAgICAgICAgICAgICAnXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnSGludDogQ2hlY2sgYW5kIGNvcnJlY3QgdGhlIHBhdGggdmFsdWVzIHVuZGVyIHRoZSBmb2xsb3dpbmcgc3RydWN0dXJlIGluIHRoZSBtZXRhZGF0YSAoYW5ub3RhdGlvbi54bWwgZmlsZSBvciBDRFMgYW5ub3RhdGlvbnMgZm9yIHRoZSBhcHBsaWNhdGlvbik6IFxcblxcbicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzxBbm5vdGF0aW9uIFRlcm0gPSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFubm90YXRpb25zVGVybSArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1xcbicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzxSZWNvcmQgVHlwZSA9ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvblR5cGUgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJz4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8QW5ub3RhdGlvblBhdGggPSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFN0ciArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPidcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGFkZEFubm90YXRpb25FcnJvck1lc3NhZ2UodGFyZ2V0U3RyLCBvRXJyb3JNc2cpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IHRhcmdldFRvUmVzb2x2ZS50ZXJtO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGggPSB0YXJnZXRUb1Jlc29sdmUucGF0aDtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXJtSW5mbyA9IHRhcmdldFN0ciA/IHRhcmdldFN0ci5zcGxpdCgnLycpWzBdIDogdGFyZ2V0U3RyO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9FcnJvck1zZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTpcbiAgICAgICAgICAgICAgICAgICAgICAgICdVbmFibGUgdG8gcmVzb2x2ZSB0aGUgcGF0aCBleHByZXNzaW9uOiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFN0ciArXG4gICAgICAgICAgICAgICAgICAgICAgICAnXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnSGludDogQ2hlY2sgYW5kIGNvcnJlY3QgdGhlIHBhdGggdmFsdWVzIHVuZGVyIHRoZSBmb2xsb3dpbmcgc3RydWN0dXJlIGluIHRoZSBtZXRhZGF0YSAoYW5ub3RhdGlvbi54bWwgZmlsZSBvciBDRFMgYW5ub3RhdGlvbnMgZm9yIHRoZSBhcHBsaWNhdGlvbik6IFxcblxcbicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzxBbm5vdGF0aW9uIFRlcm0gPSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlcm1JbmZvICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPFByb3BlcnR5VmFsdWUgUHJvcGVydHkgPSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5ICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcgICAgICAgIFBhdGg9ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPidcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGFkZEFubm90YXRpb25FcnJvck1lc3NhZ2UodGFyZ2V0U3RyLCBvRXJyb3JNc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8qKlxuICogTWVyZ2UgYW5ub3RhdGlvbiBmcm9tIGRpZmZlcmVudCBzb3VyY2UgdG9nZXRoZXIgYnkgb3ZlcndyaXRpbmcgYXQgdGhlIHRlcm0gbGV2ZWwuXG4gKlxuICogQHBhcmFtIHJhd01ldGFkYXRhXG4gKiBAcmV0dXJucyB0aGUgcmVzdWx0aW5nIG1lcmdlZCBhbm5vdGF0aW9uc1xuICovXG5mdW5jdGlvbiBtZXJnZUFubm90YXRpb25zKHJhd01ldGFkYXRhOiBSYXdNZXRhZGF0YSk6IFJlY29yZDxzdHJpbmcsIEFubm90YXRpb25MaXN0PiB7XG4gICAgY29uc3QgYW5ub3RhdGlvbkxpc3RQZXJUYXJnZXQ6IFJlY29yZDxzdHJpbmcsIEFubm90YXRpb25MaXN0PiA9IHt9O1xuICAgIE9iamVjdC5rZXlzKHJhd01ldGFkYXRhLnNjaGVtYS5hbm5vdGF0aW9ucykuZm9yRWFjaCgoYW5ub3RhdGlvblNvdXJjZSkgPT4ge1xuICAgICAgICByYXdNZXRhZGF0YS5zY2hlbWEuYW5ub3RhdGlvbnNbYW5ub3RhdGlvblNvdXJjZV0uZm9yRWFjaCgoYW5ub3RhdGlvbkxpc3Q6IEFubm90YXRpb25MaXN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50VGFyZ2V0TmFtZSA9IHVuYWxpYXMocmF3TWV0YWRhdGEucmVmZXJlbmNlcywgYW5ub3RhdGlvbkxpc3QudGFyZ2V0KSBhcyBzdHJpbmc7XG4gICAgICAgICAgICAoYW5ub3RhdGlvbkxpc3QgYXMgYW55KS5fX3NvdXJjZSA9IGFubm90YXRpb25Tb3VyY2U7XG4gICAgICAgICAgICBpZiAoIWFubm90YXRpb25MaXN0UGVyVGFyZ2V0W2N1cnJlbnRUYXJnZXROYW1lXSkge1xuICAgICAgICAgICAgICAgIGFubm90YXRpb25MaXN0UGVyVGFyZ2V0W2N1cnJlbnRUYXJnZXROYW1lXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbnM6IGFubm90YXRpb25MaXN0LmFubm90YXRpb25zLmNvbmNhdCgpLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IGN1cnJlbnRUYXJnZXROYW1lXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAoYW5ub3RhdGlvbkxpc3RQZXJUYXJnZXRbY3VycmVudFRhcmdldE5hbWVdIGFzIGFueSkuX19zb3VyY2UgPSBhbm5vdGF0aW9uU291cmNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhbm5vdGF0aW9uTGlzdC5hbm5vdGF0aW9ucy5mb3JFYWNoKChhbm5vdGF0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbmRJbmRleCA9IGFubm90YXRpb25MaXN0UGVyVGFyZ2V0W2N1cnJlbnRUYXJnZXROYW1lXS5hbm5vdGF0aW9ucy5maW5kSW5kZXgoXG4gICAgICAgICAgICAgICAgICAgICAgICAocmVmZXJlbmNlQW5ub3RhdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZUFubm90YXRpb24udGVybSA9PT0gYW5ub3RhdGlvbi50ZXJtICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZUFubm90YXRpb24ucXVhbGlmaWVyID09PSBhbm5vdGF0aW9uLnF1YWxpZmllclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIChhbm5vdGF0aW9uIGFzIGFueSkuX19zb3VyY2UgPSBhbm5vdGF0aW9uU291cmNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmluZEluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbkxpc3RQZXJUYXJnZXRbY3VycmVudFRhcmdldE5hbWVdLmFubm90YXRpb25zLnNwbGljZShmaW5kSW5kZXgsIDEsIGFubm90YXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbkxpc3RQZXJUYXJnZXRbY3VycmVudFRhcmdldE5hbWVdLmFubm90YXRpb25zLnB1c2goYW5ub3RhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGFubm90YXRpb25MaXN0UGVyVGFyZ2V0O1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBSYXdNZXRhZGF0YSBpbnRvIGFuIG9iamVjdCByZXByZXNlbnRhdGlvbiB0byBiZSB1c2VkIHRvIGVhc2lseSBuYXZpZ2F0ZSBhIG1ldGFkYXRhIG9iamVjdCBhbmQgaXRzIGFubm90YXRpb24uXG4gKlxuICogQHBhcmFtIHJhd01ldGFkYXRhXG4gKiBAcmV0dXJucyB0aGUgY29udmVydGVkIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtZXRhZGF0YS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnQocmF3TWV0YWRhdGE6IFJhd01ldGFkYXRhKTogQ29udmVydGVkTWV0YWRhdGEge1xuICAgIEFOTk9UQVRJT05fRVJST1JTID0gW107XG4gICAgY29uc3Qgb2JqZWN0TWFwID0gYnVpbGRPYmplY3RNYXAocmF3TWV0YWRhdGEpO1xuICAgIHJlc29sdmVOYXZpZ2F0aW9uUHJvcGVydGllcyhcbiAgICAgICAgcmF3TWV0YWRhdGEuc2NoZW1hLmVudGl0eVR5cGVzIGFzIEVudGl0eVR5cGVbXSxcbiAgICAgICAgcmF3TWV0YWRhdGEuc2NoZW1hLmFzc29jaWF0aW9ucyxcbiAgICAgICAgb2JqZWN0TWFwXG4gICAgKTtcbiAgICAocmF3TWV0YWRhdGEuc2NoZW1hLmVudGl0eUNvbnRhaW5lciBhcyBFbnRpdHlDb250YWluZXIpLmFubm90YXRpb25zID0ge307XG4gICAgbGlua0FjdGlvbnNUb0VudGl0eVR5cGUocmF3TWV0YWRhdGEuc2NoZW1hLm5hbWVzcGFjZSwgcmF3TWV0YWRhdGEuc2NoZW1hLmFjdGlvbnMgYXMgQWN0aW9uW10sIG9iamVjdE1hcCk7XG4gICAgbGlua0FjdGlvbkltcG9ydHNUb0FjdGlvbnMocmF3TWV0YWRhdGEuc2NoZW1hLmFjdGlvbkltcG9ydHMsIG9iamVjdE1hcCk7XG4gICAgbGlua0VudGl0eVR5cGVUb0VudGl0eVNldChyYXdNZXRhZGF0YS5zY2hlbWEuZW50aXR5U2V0cyBhcyBFbnRpdHlTZXRbXSwgb2JqZWN0TWFwLCByYXdNZXRhZGF0YS5yZWZlcmVuY2VzKTtcbiAgICBsaW5rRW50aXR5VHlwZVRvU2luZ2xldG9uKHJhd01ldGFkYXRhLnNjaGVtYS5zaW5nbGV0b25zIGFzIFNpbmdsZXRvbltdLCBvYmplY3RNYXAsIHJhd01ldGFkYXRhLnJlZmVyZW5jZXMpO1xuICAgIGxpbmtQcm9wZXJ0aWVzVG9Db21wbGV4VHlwZXMocmF3TWV0YWRhdGEuc2NoZW1hLmVudGl0eVR5cGVzIGFzIEVudGl0eVR5cGVbXSwgb2JqZWN0TWFwKTtcbiAgICBwcmVwYXJlQ29tcGxleFR5cGVzKHJhd01ldGFkYXRhLnNjaGVtYS5jb21wbGV4VHlwZXMgYXMgQ29tcGxleFR5cGVbXSwgcmF3TWV0YWRhdGEuc2NoZW1hLmFzc29jaWF0aW9ucywgb2JqZWN0TWFwKTtcbiAgICBjb25zdCB1bnJlc29sdmVkVGFyZ2V0czogUmVzb2x2ZWFibGVbXSA9IFtdO1xuICAgIGNvbnN0IHVucmVzb2x2ZWRBbm5vdGF0aW9uczogQW5ub3RhdGlvbkxpc3RbXSA9IFtdO1xuICAgIGNvbnN0IGFubm90YXRpb25MaXN0UGVyVGFyZ2V0OiBSZWNvcmQ8c3RyaW5nLCBBbm5vdGF0aW9uTGlzdD4gPSBtZXJnZUFubm90YXRpb25zKHJhd01ldGFkYXRhKTtcbiAgICBPYmplY3Qua2V5cyhhbm5vdGF0aW9uTGlzdFBlclRhcmdldCkuZm9yRWFjaCgoY3VycmVudFRhcmdldE5hbWUpID0+IHtcbiAgICAgICAgY29uc3QgYW5ub3RhdGlvbkxpc3QgPSBhbm5vdGF0aW9uTGlzdFBlclRhcmdldFtjdXJyZW50VGFyZ2V0TmFtZV07XG4gICAgICAgIGNvbnN0IG9iamVjdE1hcEVsZW1lbnQgPSBvYmplY3RNYXBbY3VycmVudFRhcmdldE5hbWVdO1xuICAgICAgICBpZiAoIW9iamVjdE1hcEVsZW1lbnQgJiYgY3VycmVudFRhcmdldE5hbWU/LmluZGV4T2YoJ0AnKSA+IDApIHtcbiAgICAgICAgICAgIHVucmVzb2x2ZWRBbm5vdGF0aW9ucy5wdXNoKGFubm90YXRpb25MaXN0KTtcbiAgICAgICAgfSBlbHNlIGlmIChvYmplY3RNYXBFbGVtZW50KSB7XG4gICAgICAgICAgICBsZXQgYWxsVGFyZ2V0cyA9IFtvYmplY3RNYXBFbGVtZW50XTtcbiAgICAgICAgICAgIGxldCBiT3ZlcnJpZGVFeGlzdGluZyA9IHRydWU7XG4gICAgICAgICAgICBpZiAob2JqZWN0TWFwRWxlbWVudC5fdHlwZSA9PT0gJ1VuYm91bmRHZW5lcmljQWN0aW9uJykge1xuICAgICAgICAgICAgICAgIGFsbFRhcmdldHMgPSBvYmplY3RNYXBFbGVtZW50LmFjdGlvbnM7XG4gICAgICAgICAgICAgICAgYk92ZXJyaWRlRXhpc3RpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFsbFRhcmdldHMuZm9yRWFjaCgoY3VycmVudFRhcmdldCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRDb250ZXh0OiBDb252ZXJzaW9uQ29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbEFubm90YXRpb25zOiB1bnJlc29sdmVkQW5ub3RhdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTb3VyY2U6IChhbm5vdGF0aW9uTGlzdCBhcyBhbnkpLl9fc291cmNlLFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VGFyZ2V0OiBjdXJyZW50VGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VGVybTogJycsXG4gICAgICAgICAgICAgICAgICAgIHJhd01ldGFkYXRhOiByYXdNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgdW5yZXNvbHZlZEFubm90YXRpb25zOiB1bnJlc29sdmVkVGFyZ2V0c1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcHJvY2Vzc0Fubm90YXRpb25zKGN1cnJlbnRDb250ZXh0LCBhbm5vdGF0aW9uTGlzdCwgb2JqZWN0TWFwLCBiT3ZlcnJpZGVFeGlzdGluZyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgZXh0cmFVbnJlc29sdmVkQW5ub3RhdGlvbnM6IEFubm90YXRpb25MaXN0W10gPSBbXTtcbiAgICB1bnJlc29sdmVkQW5ub3RhdGlvbnMuZm9yRWFjaCgoYW5ub3RhdGlvbkxpc3QpID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudFRhcmdldE5hbWUgPSB1bmFsaWFzKHJhd01ldGFkYXRhLnJlZmVyZW5jZXMsIGFubm90YXRpb25MaXN0LnRhcmdldCkgYXMgc3RyaW5nO1xuICAgICAgICBsZXQgW2Jhc2VPYmosIGFubm90YXRpb25QYXJ0XSA9IGN1cnJlbnRUYXJnZXROYW1lLnNwbGl0KCdAJyk7XG4gICAgICAgIGNvbnN0IHRhcmdldFNwbGl0ID0gYW5ub3RhdGlvblBhcnQuc3BsaXQoJy8nKTtcbiAgICAgICAgYmFzZU9iaiA9IGJhc2VPYmogKyAnQCcgKyB0YXJnZXRTcGxpdFswXTtcbiAgICAgICAgY29uc3QgY3VycmVudFRhcmdldCA9IHRhcmdldFNwbGl0LnNsaWNlKDEpLnJlZHVjZSgoY3VycmVudE9iaiwgcGF0aCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRPYmo/LltwYXRoXTtcbiAgICAgICAgfSwgb2JqZWN0TWFwW2Jhc2VPYmpdKTtcbiAgICAgICAgaWYgKCFjdXJyZW50VGFyZ2V0IHx8IHR5cGVvZiBjdXJyZW50VGFyZ2V0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgQU5OT1RBVElPTl9FUlJPUlMucHVzaCh7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ1RoZSBmb2xsb3dpbmcgYW5ub3RhdGlvbiB0YXJnZXQgd2FzIG5vdCBmb3VuZCBvbiB0aGUgc2VydmljZSAnICsgY3VycmVudFRhcmdldE5hbWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudENvbnRleHQ6IENvbnZlcnNpb25Db250ZXh0ID0ge1xuICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxBbm5vdGF0aW9uczogZXh0cmFVbnJlc29sdmVkQW5ub3RhdGlvbnMsXG4gICAgICAgICAgICAgICAgY3VycmVudFNvdXJjZTogKGFubm90YXRpb25MaXN0IGFzIGFueSkuX19zb3VyY2UsXG4gICAgICAgICAgICAgICAgY3VycmVudFRhcmdldDogY3VycmVudFRhcmdldCxcbiAgICAgICAgICAgICAgICBjdXJyZW50VGVybTogJycsXG4gICAgICAgICAgICAgICAgcmF3TWV0YWRhdGE6IHJhd01ldGFkYXRhLFxuICAgICAgICAgICAgICAgIHVucmVzb2x2ZWRBbm5vdGF0aW9uczogdW5yZXNvbHZlZFRhcmdldHNcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwcm9jZXNzQW5ub3RhdGlvbnMoY3VycmVudENvbnRleHQsIGFubm90YXRpb25MaXN0LCBvYmplY3RNYXAsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHByb2Nlc3NVbnJlc29sdmVkVGFyZ2V0cyh1bnJlc29sdmVkVGFyZ2V0cywgb2JqZWN0TWFwKTtcbiAgICBmb3IgKGNvbnN0IHByb3BlcnR5IGluIEFMTF9BTk5PVEFUSU9OX0VSUk9SUykge1xuICAgICAgICBBTk5PVEFUSU9OX0VSUk9SUy5wdXNoKEFMTF9BTk5PVEFUSU9OX0VSUk9SU1twcm9wZXJ0eV1bMF0pO1xuICAgIH1cbiAgICAocmF3TWV0YWRhdGEgYXMgYW55KS5lbnRpdHlTZXRzID0gcmF3TWV0YWRhdGEuc2NoZW1hLmVudGl0eVNldHM7XG4gICAgY29uc3QgZXh0cmFSZWZlcmVuY2VzID0gcmF3TWV0YWRhdGEucmVmZXJlbmNlcy5maWx0ZXIoKHJlZmVyZW5jZTogUmVmZXJlbmNlKSA9PiB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0UmVmZXJlbmNlcy5maW5kKChkZWZhdWx0UmVmKSA9PiBkZWZhdWx0UmVmLm5hbWVzcGFjZSA9PT0gcmVmZXJlbmNlLm5hbWVzcGFjZSkgPT09IHVuZGVmaW5lZDtcbiAgICB9KTtcbiAgICBjb25zdCBjb252ZXJ0ZWRPdXRwdXQ6IFBhcnRpYWw8Q29udmVydGVkTWV0YWRhdGE+ID0ge1xuICAgICAgICB2ZXJzaW9uOiByYXdNZXRhZGF0YS52ZXJzaW9uLFxuICAgICAgICBhbm5vdGF0aW9uczogcmF3TWV0YWRhdGEuc2NoZW1hLmFubm90YXRpb25zLFxuICAgICAgICBuYW1lc3BhY2U6IHJhd01ldGFkYXRhLnNjaGVtYS5uYW1lc3BhY2UsXG4gICAgICAgIGVudGl0eUNvbnRhaW5lcjogcmF3TWV0YWRhdGEuc2NoZW1hLmVudGl0eUNvbnRhaW5lciBhcyBFbnRpdHlDb250YWluZXIsXG4gICAgICAgIGFjdGlvbnM6IHJhd01ldGFkYXRhLnNjaGVtYS5hY3Rpb25zIGFzIEFjdGlvbltdLFxuICAgICAgICBhY3Rpb25JbXBvcnRzOiByYXdNZXRhZGF0YS5zY2hlbWEuYWN0aW9uSW1wb3J0cyxcbiAgICAgICAgZW50aXR5U2V0czogcmF3TWV0YWRhdGEuc2NoZW1hLmVudGl0eVNldHMgYXMgRW50aXR5U2V0W10sXG4gICAgICAgIHNpbmdsZXRvbnM6IHJhd01ldGFkYXRhLnNjaGVtYS5zaW5nbGV0b25zIGFzIFNpbmdsZXRvbltdLFxuICAgICAgICBlbnRpdHlUeXBlczogcmF3TWV0YWRhdGEuc2NoZW1hLmVudGl0eVR5cGVzIGFzIEVudGl0eVR5cGVbXSxcbiAgICAgICAgY29tcGxleFR5cGVzOiByYXdNZXRhZGF0YS5zY2hlbWEuY29tcGxleFR5cGVzIGFzIENvbXBsZXhUeXBlW10sXG4gICAgICAgIHR5cGVEZWZpbml0aW9uczogcmF3TWV0YWRhdGEuc2NoZW1hLnR5cGVEZWZpbml0aW9ucyBhcyBUeXBlRGVmaW5pdGlvbltdLFxuICAgICAgICByZWZlcmVuY2VzOiBkZWZhdWx0UmVmZXJlbmNlcy5jb25jYXQoZXh0cmFSZWZlcmVuY2VzKSxcbiAgICAgICAgZGlhZ25vc3RpY3M6IEFOTk9UQVRJT05fRVJST1JTLmNvbmNhdCgpXG4gICAgfTtcbiAgICBjb252ZXJ0ZWRPdXRwdXQucmVzb2x2ZVBhdGggPSBjcmVhdGVHbG9iYWxSZXNvbHZlKGNvbnZlcnRlZE91dHB1dCBhcyBDb252ZXJ0ZWRNZXRhZGF0YSwgb2JqZWN0TWFwKTtcbiAgICByZXR1cm4gY29udmVydGVkT3V0cHV0IGFzIENvbnZlcnRlZE1ldGFkYXRhO1xufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9jb252ZXJ0ZXInO1xuZXhwb3J0ICogZnJvbSAnLi93cml0ZWJhY2snO1xuZXhwb3J0ICogZnJvbSAnLi91dGlscyc7XG4iLCJpbXBvcnQgdHlwZSB7IFJlZmVyZW5jZSwgQ29tcGxleFR5cGUsIFR5cGVEZWZpbml0aW9uIH0gZnJvbSAnQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMnO1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRSZWZlcmVuY2VzOiBSZWZlcmVuY2VzV2l0aE1hcCA9IFtcbiAgICB7IGFsaWFzOiAnQ2FwYWJpbGl0aWVzJywgbmFtZXNwYWNlOiAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMScsIHVyaTogJycgfSxcbiAgICB7IGFsaWFzOiAnQWdncmVnYXRpb24nLCBuYW1lc3BhY2U6ICdPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEnLCB1cmk6ICcnIH0sXG4gICAgeyBhbGlhczogJ1ZhbGlkYXRpb24nLCBuYW1lc3BhY2U6ICdPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMScsIHVyaTogJycgfSxcbiAgICB7IG5hbWVzcGFjZTogJ09yZy5PRGF0YS5Db3JlLlYxJywgYWxpYXM6ICdDb3JlJywgdXJpOiAnJyB9LFxuICAgIHsgbmFtZXNwYWNlOiAnT3JnLk9EYXRhLk1lYXN1cmVzLlYxJywgYWxpYXM6ICdNZWFzdXJlcycsIHVyaTogJycgfSxcbiAgICB7IG5hbWVzcGFjZTogJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MScsIGFsaWFzOiAnQ29tbW9uJywgdXJpOiAnJyB9LFxuICAgIHsgbmFtZXNwYWNlOiAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEnLCBhbGlhczogJ1VJJywgdXJpOiAnJyB9LFxuICAgIHsgbmFtZXNwYWNlOiAnY29tLnNhcC52b2NhYnVsYXJpZXMuU2Vzc2lvbi52MScsIGFsaWFzOiAnU2Vzc2lvbicsIHVyaTogJycgfSxcbiAgICB7IG5hbWVzcGFjZTogJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MScsIGFsaWFzOiAnQW5hbHl0aWNzJywgdXJpOiAnJyB9LFxuICAgIHsgbmFtZXNwYWNlOiAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29kZUxpc3QudjEnLCBhbGlhczogJ0NvZGVMaXN0JywgdXJpOiAnJyB9LFxuICAgIHsgbmFtZXNwYWNlOiAnY29tLnNhcC52b2NhYnVsYXJpZXMuUGVyc29uYWxEYXRhLnYxJywgYWxpYXM6ICdQZXJzb25hbERhdGEnLCB1cmk6ICcnIH0sXG4gICAgeyBuYW1lc3BhY2U6ICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxJywgYWxpYXM6ICdDb21tdW5pY2F0aW9uJywgdXJpOiAnJyB9LFxuICAgIHsgbmFtZXNwYWNlOiAnY29tLnNhcC52b2NhYnVsYXJpZXMuSFRNTDUudjEnLCBhbGlhczogJ0hUTUw1JywgdXJpOiAnJyB9XG5dO1xuXG5leHBvcnQgdHlwZSBSZWZlcmVuY2VzV2l0aE1hcCA9IFJlZmVyZW5jZVtdICYge1xuICAgIHJlZmVyZW5jZU1hcD86IFJlY29yZDxzdHJpbmcsIFJlZmVyZW5jZT47XG4gICAgcmV2ZXJzZVJlZmVyZW5jZU1hcD86IFJlY29yZDxzdHJpbmcsIFJlZmVyZW5jZT47XG59O1xuXG4vKipcbiAqIFRyYW5zZm9ybSBhbiB1bmFsaWFzZWQgc3RyaW5nIHJlcHJlc2VudGF0aW9uIGFubm90YXRpb24gdG8gdGhlIGFsaWFzZWQgdmVyc2lvbi5cbiAqXG4gKiBAcGFyYW0gcmVmZXJlbmNlcyBjdXJyZW50UmVmZXJlbmNlcyBmb3IgdGhlIHByb2plY3RcbiAqIEBwYXJhbSB1bmFsaWFzZWRWYWx1ZSB0aGUgdW5hbGlhc2VkIHZhbHVlXG4gKiBAcmV0dXJucyB0aGUgYWxpYXNlZCBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBzYW1lXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbGlhcyhyZWZlcmVuY2VzOiBSZWZlcmVuY2VzV2l0aE1hcCwgdW5hbGlhc2VkVmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKCFyZWZlcmVuY2VzLnJldmVyc2VSZWZlcmVuY2VNYXApIHtcbiAgICAgICAgcmVmZXJlbmNlcy5yZXZlcnNlUmVmZXJlbmNlTWFwID0gcmVmZXJlbmNlcy5yZWR1Y2UoKG1hcDogUmVjb3JkPHN0cmluZywgUmVmZXJlbmNlPiwgcmVmKSA9PiB7XG4gICAgICAgICAgICBtYXBbcmVmLm5hbWVzcGFjZV0gPSByZWY7XG4gICAgICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgICB9LCB7fSk7XG4gICAgfVxuICAgIGlmICghdW5hbGlhc2VkVmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHVuYWxpYXNlZFZhbHVlO1xuICAgIH1cbiAgICBjb25zdCBsYXN0RG90SW5kZXggPSB1bmFsaWFzZWRWYWx1ZS5sYXN0SW5kZXhPZignLicpO1xuICAgIGNvbnN0IG5hbWVzcGFjZSA9IHVuYWxpYXNlZFZhbHVlLnN1YnN0cmluZygwLCBsYXN0RG90SW5kZXgpO1xuICAgIGNvbnN0IHZhbHVlID0gdW5hbGlhc2VkVmFsdWUuc3Vic3RyaW5nKGxhc3REb3RJbmRleCArIDEpO1xuICAgIGNvbnN0IHJlZmVyZW5jZSA9IHJlZmVyZW5jZXMucmV2ZXJzZVJlZmVyZW5jZU1hcFtuYW1lc3BhY2VdO1xuICAgIGlmIChyZWZlcmVuY2UpIHtcbiAgICAgICAgcmV0dXJuIGAke3JlZmVyZW5jZS5hbGlhc30uJHt2YWx1ZX1gO1xuICAgIH0gZWxzZSBpZiAodW5hbGlhc2VkVmFsdWUuaW5kZXhPZignQCcpICE9PSAtMSkge1xuICAgICAgICAvLyBUcnkgdG8gc2VlIGlmIGl0J3MgYW4gYW5ub3RhdGlvbiBQYXRoIGxpa2UgdG9fU2FsZXNPcmRlci9AVUkuTGluZUl0ZW1cbiAgICAgICAgY29uc3QgW3ByZUFsaWFzLCAuLi5wb3N0QWxpYXNdID0gdW5hbGlhc2VkVmFsdWUuc3BsaXQoJ0AnKTtcbiAgICAgICAgcmV0dXJuIGAke3ByZUFsaWFzfUAke2FsaWFzKHJlZmVyZW5jZXMsIHBvc3RBbGlhcy5qb2luKCdAJykpfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHVuYWxpYXNlZFZhbHVlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gYW4gYWxpYXNlZCBzdHJpbmcgcmVwcmVzZW50YXRpb24gYW5ub3RhdGlvbiB0byB0aGUgdW5hbGlhc2VkIHZlcnNpb24uXG4gKlxuICogQHBhcmFtIHJlZmVyZW5jZXMgY3VycmVudFJlZmVyZW5jZXMgZm9yIHRoZSBwcm9qZWN0XG4gKiBAcGFyYW0gYWxpYXNlZFZhbHVlIHRoZSBhbGlhc2VkIHZhbHVlXG4gKiBAcmV0dXJucyB0aGUgdW5hbGlhc2VkIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHNhbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuYWxpYXMocmVmZXJlbmNlczogUmVmZXJlbmNlc1dpdGhNYXAsIGFsaWFzZWRWYWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoIXJlZmVyZW5jZXMucmVmZXJlbmNlTWFwKSB7XG4gICAgICAgIHJlZmVyZW5jZXMucmVmZXJlbmNlTWFwID0gcmVmZXJlbmNlcy5yZWR1Y2UoKG1hcDogUmVjb3JkPHN0cmluZywgUmVmZXJlbmNlPiwgcmVmKSA9PiB7XG4gICAgICAgICAgICBtYXBbcmVmLmFsaWFzXSA9IHJlZjtcbiAgICAgICAgICAgIHJldHVybiBtYXA7XG4gICAgICAgIH0sIHt9KTtcbiAgICB9XG4gICAgaWYgKCFhbGlhc2VkVmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGFsaWFzZWRWYWx1ZTtcbiAgICB9XG4gICAgY29uc3QgW3ZvY0FsaWFzLCAuLi52YWx1ZV0gPSBhbGlhc2VkVmFsdWUuc3BsaXQoJy4nKTtcbiAgICBjb25zdCByZWZlcmVuY2UgPSByZWZlcmVuY2VzLnJlZmVyZW5jZU1hcFt2b2NBbGlhc107XG4gICAgaWYgKHJlZmVyZW5jZSkge1xuICAgICAgICByZXR1cm4gYCR7cmVmZXJlbmNlLm5hbWVzcGFjZX0uJHt2YWx1ZS5qb2luKCcuJyl9YDtcbiAgICB9IGVsc2UgaWYgKGFsaWFzZWRWYWx1ZS5pbmRleE9mKCdAJykgIT09IC0xKSB7XG4gICAgICAgIC8vIFRyeSB0byBzZWUgaWYgaXQncyBhbiBhbm5vdGF0aW9uIFBhdGggbGlrZSB0b19TYWxlc09yZGVyL0BVSS5MaW5lSXRlbVxuICAgICAgICBjb25zdCBbcHJlQWxpYXMsIC4uLnBvc3RBbGlhc10gPSBhbGlhc2VkVmFsdWUuc3BsaXQoJ0AnKTtcbiAgICAgICAgcmV0dXJuIGAke3ByZUFsaWFzfUAke3VuYWxpYXMocmVmZXJlbmNlcywgcG9zdEFsaWFzLmpvaW4oJ0AnKSl9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYWxpYXNlZFZhbHVlO1xuICAgIH1cbn1cblxuZXhwb3J0IGVudW0gVGVybVRvVHlwZXMge1xuICAgICdPcmcuT0RhdGEuQXV0aG9yaXphdGlvbi5WMS5TZWN1cml0eVNjaGVtZXMnID0gJ09yZy5PRGF0YS5BdXRob3JpemF0aW9uLlYxLlNlY3VyaXR5U2NoZW1lJyxcbiAgICAnT3JnLk9EYXRhLkF1dGhvcml6YXRpb24uVjEuQXV0aG9yaXphdGlvbnMnID0gJ09yZy5PRGF0YS5BdXRob3JpemF0aW9uLlYxLkF1dGhvcml6YXRpb24nLFxuICAgICdPcmcuT0RhdGEuQ29yZS5WMS5SZXZpc2lvbnMnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlJldmlzaW9uVHlwZScsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLkxpbmtzJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5MaW5rJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuRXhhbXBsZScgPSAnT3JnLk9EYXRhLkNvcmUuVjEuRXhhbXBsZVZhbHVlJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuTWVzc2FnZXMnID0gJ09yZy5PRGF0YS5Db3JlLlYxLk1lc3NhZ2VUeXBlJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuVmFsdWVFeGNlcHRpb24nID0gJ09yZy5PRGF0YS5Db3JlLlYxLlZhbHVlRXhjZXB0aW9uVHlwZScsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLlJlc291cmNlRXhjZXB0aW9uJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5SZXNvdXJjZUV4Y2VwdGlvblR5cGUnLFxuICAgICdPcmcuT0RhdGEuQ29yZS5WMS5EYXRhTW9kaWZpY2F0aW9uRXhjZXB0aW9uJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5EYXRhTW9kaWZpY2F0aW9uRXhjZXB0aW9uVHlwZScsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLklzTGFuZ3VhZ2VEZXBlbmRlbnQnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLkRlcmVmZXJlbmNlYWJsZUlEcycgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuQ29udmVudGlvbmFsSURzJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdPcmcuT0RhdGEuQ29yZS5WMS5QZXJtaXNzaW9ucycgPSAnT3JnLk9EYXRhLkNvcmUuVjEuUGVybWlzc2lvbicsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLkRlZmF1bHROYW1lc3BhY2UnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLkltbXV0YWJsZScgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuQ29tcHV0ZWQnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLkNvbXB1dGVkRGVmYXVsdFZhbHVlJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdPcmcuT0RhdGEuQ29yZS5WMS5Jc1VSTCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuSXNNZWRpYVR5cGUnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLkNvbnRlbnREaXNwb3NpdGlvbicgPSAnT3JnLk9EYXRhLkNvcmUuVjEuQ29udGVudERpc3Bvc2l0aW9uVHlwZScsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLk9wdGltaXN0aWNDb25jdXJyZW5jeScgPSAnRWRtLlByb3BlcnR5UGF0aCcsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLkFkZGl0aW9uYWxQcm9wZXJ0aWVzJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdPcmcuT0RhdGEuQ29yZS5WMS5BdXRvRXhwYW5kJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdPcmcuT0RhdGEuQ29yZS5WMS5BdXRvRXhwYW5kUmVmZXJlbmNlcycgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuTWF5SW1wbGVtZW50JyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5RdWFsaWZpZWRUeXBlTmFtZScsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLk9yZGVyZWQnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLlBvc2l0aW9uYWxJbnNlcnQnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLkFsdGVybmF0ZUtleXMnID0gJ09yZy5PRGF0YS5Db3JlLlYxLkFsdGVybmF0ZUtleScsXG4gICAgJ09yZy5PRGF0YS5Db3JlLlYxLk9wdGlvbmFsUGFyYW1ldGVyJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5PcHRpb25hbFBhcmFtZXRlclR5cGUnLFxuICAgICdPcmcuT0RhdGEuQ29yZS5WMS5PcGVyYXRpb25BdmFpbGFibGUnID0gJ0VkbS5Cb29sZWFuJyxcbiAgICAnT3JnLk9EYXRhLkNvcmUuVjEuU3ltYm9saWNOYW1lJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5TaW1wbGVJZGVudGlmaWVyJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Db25mb3JtYW5jZUxldmVsJyA9ICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkNvbmZvcm1hbmNlTGV2ZWxUeXBlJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Bc3luY2hyb25vdXNSZXF1ZXN0c1N1cHBvcnRlZCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5CYXRjaENvbnRpbnVlT25FcnJvclN1cHBvcnRlZCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Jc29sYXRpb25TdXBwb3J0ZWQnID0gJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuSXNvbGF0aW9uTGV2ZWwnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkNyb3NzSm9pblN1cHBvcnRlZCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5DYWxsYmFja1N1cHBvcnRlZCcgPSAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5DYWxsYmFja1R5cGUnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkNoYW5nZVRyYWNraW5nJyA9ICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkNoYW5nZVRyYWNraW5nVHlwZScsXG4gICAgJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQ291bnRSZXN0cmljdGlvbnMnID0gJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQ291bnRSZXN0cmljdGlvbnNUeXBlJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5OYXZpZ2F0aW9uUmVzdHJpY3Rpb25zJyA9ICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLk5hdmlnYXRpb25SZXN0cmljdGlvbnNUeXBlJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5JbmRleGFibGVCeUtleScgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Ub3BTdXBwb3J0ZWQnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU2tpcFN1cHBvcnRlZCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Db21wdXRlU3VwcG9ydGVkJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlNlbGVjdFN1cHBvcnQnID0gJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU2VsZWN0U3VwcG9ydFR5cGUnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkJhdGNoU3VwcG9ydGVkJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkJhdGNoU3VwcG9ydCcgPSAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5CYXRjaFN1cHBvcnRUeXBlJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5GaWx0ZXJSZXN0cmljdGlvbnMnID0gJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRmlsdGVyUmVzdHJpY3Rpb25zVHlwZScsXG4gICAgJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU29ydFJlc3RyaWN0aW9ucycgPSAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Tb3J0UmVzdHJpY3Rpb25zVHlwZScsXG4gICAgJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRXhwYW5kUmVzdHJpY3Rpb25zJyA9ICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkV4cGFuZFJlc3RyaWN0aW9uc1R5cGUnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlNlYXJjaFJlc3RyaWN0aW9ucycgPSAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5TZWFyY2hSZXN0cmljdGlvbnNUeXBlJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5LZXlBc1NlZ21lbnRTdXBwb3J0ZWQnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuUXVlcnlTZWdtZW50U3VwcG9ydGVkJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkluc2VydFJlc3RyaWN0aW9ucycgPSAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5JbnNlcnRSZXN0cmljdGlvbnNUeXBlJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5EZWVwSW5zZXJ0U3VwcG9ydCcgPSAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5EZWVwSW5zZXJ0U3VwcG9ydFR5cGUnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlVwZGF0ZVJlc3RyaWN0aW9ucycgPSAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5VcGRhdGVSZXN0cmljdGlvbnNUeXBlJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5EZWVwVXBkYXRlU3VwcG9ydCcgPSAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5EZWVwVXBkYXRlU3VwcG9ydFR5cGUnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkRlbGV0ZVJlc3RyaWN0aW9ucycgPSAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5EZWxldGVSZXN0cmljdGlvbnNUeXBlJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Db2xsZWN0aW9uUHJvcGVydHlSZXN0cmljdGlvbnMnID0gJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQ29sbGVjdGlvblByb3BlcnR5UmVzdHJpY3Rpb25zVHlwZScsXG4gICAgJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuT3BlcmF0aW9uUmVzdHJpY3Rpb25zJyA9ICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLk9wZXJhdGlvblJlc3RyaWN0aW9uc1R5cGUnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkFubm90YXRpb25WYWx1ZXNJblF1ZXJ5U3VwcG9ydGVkJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLk1vZGlmaWNhdGlvblF1ZXJ5T3B0aW9ucycgPSAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Nb2RpZmljYXRpb25RdWVyeU9wdGlvbnNUeXBlJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5SZWFkUmVzdHJpY3Rpb25zJyA9ICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlJlYWRSZXN0cmljdGlvbnNUeXBlJyxcbiAgICAnT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5DdXN0b21IZWFkZXJzJyA9ICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkN1c3RvbVBhcmFtZXRlcicsXG4gICAgJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQ3VzdG9tUXVlcnlPcHRpb25zJyA9ICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkN1c3RvbVBhcmFtZXRlcicsXG4gICAgJ09yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuTWVkaWFMb2NhdGlvblVwZGF0ZVN1cHBvcnRlZCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkFwcGx5U3VwcG9ydGVkJyA9ICdPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuQXBwbHlTdXBwb3J0ZWRUeXBlJyxcbiAgICAnT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkdyb3VwYWJsZScgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkFnZ3JlZ2F0YWJsZScgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMnID0gJ0VkbS5Qcm9wZXJ0eVBhdGgnLFxuICAgICdPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuTGV2ZWxlZEhpZXJhcmNoeScgPSAnRWRtLlByb3BlcnR5UGF0aCcsXG4gICAgJ09yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5SZWN1cnNpdmVIaWVyYXJjaHknID0gJ09yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5SZWN1cnNpdmVIaWVyYXJjaHlUeXBlJyxcbiAgICAnT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkF2YWlsYWJsZU9uQWdncmVnYXRlcycgPSAnT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkF2YWlsYWJsZU9uQWdncmVnYXRlc1R5cGUnLFxuICAgICdPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5NaW5pbXVtJyA9ICdFZG0uUHJpbWl0aXZlVHlwZScsXG4gICAgJ09yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLk1heGltdW0nID0gJ0VkbS5QcmltaXRpdmVUeXBlJyxcbiAgICAnT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuRXhjbHVzaXZlJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5BbGxvd2VkVmFsdWVzJyA9ICdPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5BbGxvd2VkVmFsdWUnLFxuICAgICdPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5NdWx0aXBsZU9mJyA9ICdFZG0uRGVjaW1hbCcsXG4gICAgJ09yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLkNvbnN0cmFpbnQnID0gJ09yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLkNvbnN0cmFpbnRUeXBlJyxcbiAgICAnT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuSXRlbXNPZicgPSAnT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuSXRlbXNPZlR5cGUnLFxuICAgICdPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5PcGVuUHJvcGVydHlUeXBlQ29uc3RyYWludCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuUXVhbGlmaWVkVHlwZU5hbWUnLFxuICAgICdPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5EZXJpdmVkVHlwZUNvbnN0cmFpbnQnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlF1YWxpZmllZFR5cGVOYW1lJyxcbiAgICAnT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuQWxsb3dlZFRlcm1zJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5RdWFsaWZpZWRUZXJtTmFtZScsXG4gICAgJ09yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLkFwcGxpY2FibGVUZXJtcycgPSAnT3JnLk9EYXRhLkNvcmUuVjEuUXVhbGlmaWVkVGVybU5hbWUnLFxuICAgICdPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5NYXhJdGVtcycgPSAnRWRtLkludDY0JyxcbiAgICAnT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuTWluSXRlbXMnID0gJ0VkbS5JbnQ2NCcsXG4gICAgJ09yZy5PRGF0YS5NZWFzdXJlcy5WMS5TY2FsZScgPSAnRWRtLkJ5dGUnLFxuICAgICdPcmcuT0RhdGEuTWVhc3VyZXMuVjEuRHVyYXRpb25HcmFudWxhcml0eScgPSAnT3JnLk9EYXRhLk1lYXN1cmVzLlYxLkR1cmF0aW9uR3JhbnVsYXJpdHlUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLkRpbWVuc2lvbicgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLk1lYXN1cmUnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5BY2N1bXVsYXRpdmVNZWFzdXJlJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuUm9sbGVkVXBQcm9wZXJ0eUNvdW50JyA9ICdFZG0uSW50MTYnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuUGxhbm5pbmdBY3Rpb24nID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5BZ2dyZWdhdGVkUHJvcGVydGllcycgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLkFnZ3JlZ2F0ZWRQcm9wZXJ0eVR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VydmljZVZlcnNpb24nID0gJ0VkbS5JbnQzMicsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZXJ2aWNlU2NoZW1hVmVyc2lvbicgPSAnRWRtLkludDMyJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRGb3InID0gJ0VkbS5Qcm9wZXJ0eVBhdGgnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNMYW5ndWFnZUlkZW50aWZpZXInID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0Rm9ybWF0JyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEZvcm1hdFR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNEaWdpdFNlcXVlbmNlJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNVcHBlckNhc2UnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0N1cnJlbmN5JyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNVbml0JyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVW5pdFNwZWNpZmljU2NhbGUnID0gJ0VkbS5QcmltaXRpdmVUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlVuaXRTcGVjaWZpY1ByZWNpc2lvbicgPSAnRWRtLlByaW1pdGl2ZVR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2Vjb25kYXJ5S2V5JyA9ICdFZG0uUHJvcGVydHlQYXRoJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk1pbk9jY3VycycgPSAnRWRtLkludDY0JyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk1heE9jY3VycycgPSAnRWRtLkludDY0JyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkFzc29jaWF0aW9uRW50aXR5JyA9ICdFZG0uTmF2aWdhdGlvblByb3BlcnR5UGF0aCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EZXJpdmVkTmF2aWdhdGlvbicgPSAnRWRtLk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWFza2VkJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWFza2VkQWx3YXlzJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RNYXBwaW5nJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RNYXBwaW5nVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0luc3RhbmNlQW5ub3RhdGlvbicgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnMnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25UeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpZWxkQ29udHJvbCcgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpZWxkQ29udHJvbFR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuQXBwbGljYXRpb24nID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5BcHBsaWNhdGlvblR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGltZXN0YW1wJyA9ICdFZG0uRGF0ZVRpbWVPZmZzZXQnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRXJyb3JSZXNvbHV0aW9uJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRXJyb3JSZXNvbHV0aW9uVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5NZXNzYWdlcycgPSAnRWRtLkNvbXBsZXhUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLm51bWVyaWNTZXZlcml0eScgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk51bWVyaWNNZXNzYWdlU2V2ZXJpdHlUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk1heGltdW1OdW1lcmljTWVzc2FnZVNldmVyaXR5JyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTnVtZXJpY01lc3NhZ2VTZXZlcml0eVR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNBY3Rpb25Dcml0aWNhbCcgPSAnRWRtLkJvb2xlYW4nLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuQXR0cmlidXRlcycgPSAnRWRtLlByb3BlcnR5UGF0aCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5SZWxhdGVkUmVjdXJzaXZlSGllcmFyY2h5JyA9ICdFZG0uQW5ub3RhdGlvblBhdGgnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSW50ZXJ2YWwnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5JbnRlcnZhbFR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuUmVzdWx0Q29udGV4dCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLldlYWtSZWZlcmVudGlhbENvbnN0cmFpbnQnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5XZWFrUmVmZXJlbnRpYWxDb25zdHJhaW50VHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc05hdHVyYWxQZXJzb24nID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3QnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFJlbGV2YW50UXVhbGlmaWVycycgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNpbXBsZUlkZW50aWZpZXInLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0TWFwcGluZycgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdE1hcHBpbmdUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzQ2FsZW5kYXJZZWFyJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNDYWxlbmRhckhhbGZ5ZWFyJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNDYWxlbmRhclF1YXJ0ZXInID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0NhbGVuZGFyTW9udGgnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0NhbGVuZGFyV2VlaycgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRGF5T2ZDYWxlbmRhck1vbnRoJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNEYXlPZkNhbGVuZGFyWWVhcicgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzQ2FsZW5kYXJZZWFySGFsZnllYXInID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0NhbGVuZGFyWWVhclF1YXJ0ZXInID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0NhbGVuZGFyWWVhck1vbnRoJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNDYWxlbmRhclllYXJXZWVrJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNDYWxlbmRhckRhdGUnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0Zpc2NhbFllYXInID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0Zpc2NhbFBlcmlvZCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRmlzY2FsWWVhclBlcmlvZCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRmlzY2FsUXVhcnRlcicgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRmlzY2FsWWVhclF1YXJ0ZXInID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0Zpc2NhbFdlZWsnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0Zpc2NhbFllYXJXZWVrJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNEYXlPZkZpc2NhbFllYXInID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0Zpc2NhbFllYXJWYXJpYW50JyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTXV0dWFsbHlFeGNsdXNpdmVUZXJtJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290JyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290VHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdE5vZGUnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdE5vZGVUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0QWN0aXZhdGlvblZpYScgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNpbXBsZUlkZW50aWZpZXInLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRWRpdGFibGVGaWVsZEZvcicgPSAnRWRtLlByb3BlcnR5UGF0aCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY0tleScgPSAnRWRtLlByb3BlcnR5UGF0aCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TaWRlRWZmZWN0cycgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNpZGVFZmZlY3RzVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EZWZhdWx0VmFsdWVzRnVuY3Rpb24nID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5RdWFsaWZpZWROYW1lJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpbHRlckRlZmF1bHRWYWx1ZScgPSAnRWRtLlByaW1pdGl2ZVR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmlsdGVyRGVmYXVsdFZhbHVlSGlnaCcgPSAnRWRtLlByaW1pdGl2ZVR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU29ydE9yZGVyJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU29ydE9yZGVyVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5SZWN1cnNpdmVIaWVyYXJjaHknID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5SZWN1cnNpdmVIaWVyYXJjaHlUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkNyZWF0ZWRBdCcgPSAnRWRtLkRhdGVUaW1lT2Zmc2V0JyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkNyZWF0ZWRCeScgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlVzZXJJRCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5DaGFuZ2VkQXQnID0gJ0VkbS5EYXRlVGltZU9mZnNldCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5DaGFuZ2VkQnknID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Vc2VySUQnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuQXBwbHlNdWx0aVVuaXRCZWhhdmlvckZvclNvcnRpbmdBbmRGaWx0ZXJpbmcnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvZGVMaXN0LnYxLkN1cnJlbmN5Q29kZXMnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvZGVMaXN0LnYxLkNvZGVMaXN0U291cmNlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29kZUxpc3QudjEuVW5pdHNPZk1lYXN1cmUnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvZGVMaXN0LnYxLkNvZGVMaXN0U291cmNlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29kZUxpc3QudjEuU3RhbmRhcmRDb2RlJyA9ICdFZG0uUHJvcGVydHlQYXRoJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29kZUxpc3QudjEuRXh0ZXJuYWxDb2RlJyA9ICdFZG0uUHJvcGVydHlQYXRoJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29kZUxpc3QudjEuSXNDb25maWd1cmF0aW9uRGVwcmVjYXRpb25Db2RlJyA9ICdFZG0uQm9vbGVhbicsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuQ29udGFjdCcgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5Db250YWN0VHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuQWRkcmVzcycgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5BZGRyZXNzVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuSXNFbWFpbEFkZHJlc3MnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuSXNQaG9uZU51bWJlcicgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5FdmVudCcgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5FdmVudERhdGEnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLlRhc2snID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuVGFza0RhdGEnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLk1lc3NhZ2UnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuTWVzc2FnZURhdGEnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5IaWVyYXJjaHkudjEuUmVjdXJzaXZlSGllcmFyY2h5JyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5IaWVyYXJjaHkudjEuUmVjdXJzaXZlSGllcmFyY2h5VHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MS5FbnRpdHlTZW1hbnRpY3MnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MS5FbnRpdHlTZW1hbnRpY3NUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuUGVyc29uYWxEYXRhLnYxLkZpZWxkU2VtYW50aWNzJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5QZXJzb25hbERhdGEudjEuRmllbGRTZW1hbnRpY3NUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuUGVyc29uYWxEYXRhLnYxLklzUG90ZW50aWFsbHlQZXJzb25hbCcgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuUGVyc29uYWxEYXRhLnYxLklzUG90ZW50aWFsbHlTZW5zaXRpdmUnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlNlc3Npb24udjEuU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCcgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuU2Vzc2lvbi52MS5TdGlja3lTZXNzaW9uU3VwcG9ydGVkVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckluZm8nID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckluZm9UeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSWRlbnRpZmljYXRpb24nID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEFic3RyYWN0JyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQmFkZ2UnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkJhZGdlVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkxpbmVJdGVtJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRBYnN0cmFjdCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlN0YXR1c0luZm8nID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEFic3RyYWN0JyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmllbGRHcm91cCcgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmllbGRHcm91cFR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Db25uZWN0ZWRGaWVsZHMnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNvbm5lY3RlZEZpZWxkc1R5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5HZW9Mb2NhdGlvbnMnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkdlb0xvY2F0aW9uVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkdlb0xvY2F0aW9uJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5HZW9Mb2NhdGlvblR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Db250YWN0cycgPSAnRWRtLkFubm90YXRpb25QYXRoJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuTWVkaWFSZXNvdXJjZScgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuTWVkaWFSZXNvdXJjZVR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnQnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludFR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5LUEknID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLktQSVR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydCcgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnREZWZpbml0aW9uVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlZhbHVlQ3JpdGljYWxpdHknID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlZhbHVlQ3JpdGljYWxpdHlUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ3JpdGljYWxpdHlMYWJlbHMnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNyaXRpY2FsaXR5TGFiZWxUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uRmllbGRzJyA9ICdFZG0uUHJvcGVydHlQYXRoJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmFjZXRzJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5GYWNldCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckZhY2V0cycgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmFjZXQnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5RdWlja1ZpZXdGYWNldHMnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZhY2V0JyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUXVpY2tDcmVhdGVGYWNldHMnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZhY2V0JyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmlsdGVyRmFjZXRzJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5SZWZlcmVuY2VGYWNldCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUHJlc2VudGF0aW9uVmFyaWFudCcgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUHJlc2VudGF0aW9uVmFyaWFudFR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25WYXJpYW50JyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25WYXJpYW50VHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRoaW5nUGVyc3BlY3RpdmUnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLklzU3VtbWFyeScgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUGFydE9mUHJldmlldycgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuTWFwJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5HYWxsZXJ5JyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Jc0ltYWdlVVJMJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Jc0ltYWdlJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5NdWx0aUxpbmVUZXh0JyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnQnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JbXBvcnRhbmNlJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JbXBvcnRhbmNlVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlbicgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ3JlYXRlSGlkZGVuJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5VcGRhdGVIaWRkZW4nID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRlbGV0ZUhpZGRlbicgPSAnT3JnLk9EYXRhLkNvcmUuVjEuVGFnJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuRmlsdGVyJyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGREZWZhdWx0JyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRBYnN0cmFjdCcsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNyaXRpY2FsaXR5JyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eVR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eUNhbGN1bGF0aW9uJyA9ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eUNhbGN1bGF0aW9uVHlwZScsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkVtcGhhc2l6ZWQnID0gJ09yZy5PRGF0YS5Db3JlLlYxLlRhZycsXG4gICAgJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLk9yZGVyQnknID0gJ0VkbS5Qcm9wZXJ0eVBhdGgnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5QYXJhbWV0ZXJEZWZhdWx0VmFsdWUnID0gJ0VkbS5QcmltaXRpdmVUeXBlJyxcbiAgICAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUmVjb21tZW5kYXRpb25TdGF0ZScgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUmVjb21tZW5kYXRpb25TdGF0ZVR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5SZWNvbW1lbmRhdGlvbkxpc3QnID0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlJlY29tbWVuZGF0aW9uTGlzdFR5cGUnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5FeGNsdWRlRnJvbU5hdmlnYXRpb25Db250ZXh0JyA9ICdPcmcuT0RhdGEuQ29yZS5WMS5UYWcnLFxuICAgICdjb20uc2FwLnZvY2FidWxhcmllcy5IVE1MNS52MS5Dc3NEZWZhdWx0cycgPSAnY29tLnNhcC52b2NhYnVsYXJpZXMuSFRNTDUudjEuQ3NzRGVmYXVsdHNUeXBlJ1xufVxuXG4vKipcbiAqIERpZmZlcmVudGlhdGUgYmV0d2VlbiBhIENvbXBsZXhUeXBlIGFuZCBhIFR5cGVEZWZpbml0aW9uLlxuICogQHBhcmFtIGNvbXBsZXhUeXBlRGVmaW5pdGlvblxuICogQHJldHVybnMgdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgYSBjb21wbGV4IHR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ29tcGxleFR5cGVEZWZpbml0aW9uKFxuICAgIGNvbXBsZXhUeXBlRGVmaW5pdGlvbj86IENvbXBsZXhUeXBlIHwgVHlwZURlZmluaXRpb25cbik6IGNvbXBsZXhUeXBlRGVmaW5pdGlvbiBpcyBDb21wbGV4VHlwZSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgISFjb21wbGV4VHlwZURlZmluaXRpb24gJiYgY29tcGxleFR5cGVEZWZpbml0aW9uLl90eXBlID09PSAnQ29tcGxleFR5cGUnICYmICEhY29tcGxleFR5cGVEZWZpbml0aW9uLnByb3BlcnRpZXNcbiAgICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVjaW1hbCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaXNEZWNpbWFsKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIHZhbHVlT2YoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIiwiaW1wb3J0IHR5cGUge1xuICAgIEFubm90YXRpb25QYXRoRXhwcmVzc2lvbixcbiAgICBBbm5vdGF0aW9uUmVjb3JkLFxuICAgIEFubm90YXRpb25UZXJtLFxuICAgIEV4cHJlc3Npb24sXG4gICAgTmF2aWdhdGlvblByb3BlcnR5UGF0aEV4cHJlc3Npb24sXG4gICAgUGF0aEV4cHJlc3Npb24sXG4gICAgUHJvcGVydHlQYXRoRXhwcmVzc2lvbixcbiAgICBSYXdBbm5vdGF0aW9uLFxuICAgIFJlZmVyZW5jZVxufSBmcm9tICdAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcyc7XG5pbXBvcnQgeyB1bmFsaWFzIH0gZnJvbSAnLi91dGlscyc7XG5cbi8qKlxuICogUmV2ZXJ0IGFuIG9iamVjdCB0byBpdHMgcmF3IHR5cGUgZXF1aXZhbGVudC5cbiAqXG4gKiBAcGFyYW0gcmVmZXJlbmNlcyB0aGUgY3VycmVudCByZWZlcmVuY2VcbiAqIEBwYXJhbSB2YWx1ZSB0aGUgdmFsdWUgdG8gcmV2ZXJ0XG4gKiBAcmV0dXJucyB0aGUgcmF3IHZhbHVlXG4gKi9cbmZ1bmN0aW9uIHJldmVydE9iamVjdFRvUmF3VHlwZShyZWZlcmVuY2VzOiBSZWZlcmVuY2VbXSwgdmFsdWU6IGFueSkge1xuICAgIGxldCByZXN1bHQ6IEV4cHJlc3Npb24gfCB1bmRlZmluZWQ7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdDb2xsZWN0aW9uJyxcbiAgICAgICAgICAgIENvbGxlY3Rpb246IHZhbHVlLm1hcCgoYW5ubykgPT4gcmV2ZXJ0Q29sbGVjdGlvbkl0ZW1Ub1Jhd1R5cGUocmVmZXJlbmNlcywgYW5ubykpIGFzIGFueVtdXG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmICh2YWx1ZS5pc0RlY2ltYWw/LigpKSB7XG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdEZWNpbWFsJyxcbiAgICAgICAgICAgIERlY2ltYWw6IHZhbHVlLnZhbHVlT2YoKVxuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiAodmFsdWUuaXNTdHJpbmc/LigpKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlTWF0Y2hlcyA9IHZhbHVlLnZhbHVlT2YoKS5zcGxpdCgnLicpO1xuICAgICAgICBpZiAodmFsdWVNYXRjaGVzLmxlbmd0aCA+IDEgJiYgcmVmZXJlbmNlcy5maW5kKChyZWYpID0+IHJlZi5hbGlhcyA9PT0gdmFsdWVNYXRjaGVzWzBdKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdFbnVtTWVtYmVyJyxcbiAgICAgICAgICAgICAgICBFbnVtTWVtYmVyOiB2YWx1ZS52YWx1ZU9mKClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1N0cmluZycsXG4gICAgICAgICAgICAgICAgU3RyaW5nOiB2YWx1ZS52YWx1ZU9mKClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHZhbHVlLmlzSW50Py4oKSkge1xuICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICB0eXBlOiAnSW50JyxcbiAgICAgICAgICAgIEludDogdmFsdWUudmFsdWVPZigpXG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmICh2YWx1ZS5pc0Zsb2F0Py4oKSkge1xuICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICB0eXBlOiAnRmxvYXQnLFxuICAgICAgICAgICAgRmxvYXQ6IHZhbHVlLnZhbHVlT2YoKVxuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiAodmFsdWUuaXNEYXRlPy4oKSkge1xuICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICB0eXBlOiAnRGF0ZScsXG4gICAgICAgICAgICBEYXRlOiB2YWx1ZS52YWx1ZU9mKClcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlLmlzQm9vbGVhbj8uKCkpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ0Jvb2wnLFxuICAgICAgICAgICAgQm9vbDogdmFsdWUudmFsdWVPZigpID09PSAndHJ1ZSdcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlLnR5cGUgPT09ICdQYXRoJykge1xuICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICB0eXBlOiAnUGF0aCcsXG4gICAgICAgICAgICBQYXRoOiB2YWx1ZS5wYXRoXG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmICh2YWx1ZS50eXBlID09PSAnQW5ub3RhdGlvblBhdGgnKSB7XG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdBbm5vdGF0aW9uUGF0aCcsXG4gICAgICAgICAgICBBbm5vdGF0aW9uUGF0aDogdmFsdWUudmFsdWVcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlLnR5cGUgPT09ICdBcHBseScpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ0FwcGx5JyxcbiAgICAgICAgICAgIEFwcGx5OiB2YWx1ZS5BcHBseVxuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiAodmFsdWUudHlwZSA9PT0gJ051bGwnKSB7XG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdOdWxsJ1xuICAgICAgICB9O1xuICAgIH0gZWxzZSBpZiAodmFsdWUudHlwZSA9PT0gJ1Byb3BlcnR5UGF0aCcpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ1Byb3BlcnR5UGF0aCcsXG4gICAgICAgICAgICBQcm9wZXJ0eVBhdGg6IHZhbHVlLnZhbHVlXG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmICh2YWx1ZS50eXBlID09PSAnTmF2aWdhdGlvblByb3BlcnR5UGF0aCcpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ05hdmlnYXRpb25Qcm9wZXJ0eVBhdGgnLFxuICAgICAgICAgICAgTmF2aWdhdGlvblByb3BlcnR5UGF0aDogdmFsdWUudmFsdWVcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgJyRUeXBlJykpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ1JlY29yZCcsXG4gICAgICAgICAgICBSZWNvcmQ6IHJldmVydENvbGxlY3Rpb25JdGVtVG9SYXdUeXBlKHJlZmVyZW5jZXMsIHZhbHVlKSBhcyBBbm5vdGF0aW9uUmVjb3JkXG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogUmV2ZXJ0IGEgdmFsdWUgdG8gaXRzIHJhdyB2YWx1ZSBkZXBlbmRpbmcgb24gaXRzIHR5cGUuXG4gKlxuICogQHBhcmFtIHJlZmVyZW5jZXMgdGhlIGN1cnJlbnQgc2V0IG9mIHJlZmVyZW5jZVxuICogQHBhcmFtIHZhbHVlIHRoZSB2YWx1ZSB0byByZXZlcnRcbiAqIEByZXR1cm5zIHRoZSByYXcgZXhwcmVzc2lvblxuICovXG5mdW5jdGlvbiByZXZlcnRWYWx1ZVRvUmF3VHlwZShyZWZlcmVuY2VzOiBSZWZlcmVuY2VbXSwgdmFsdWU6IGFueSk6IEV4cHJlc3Npb24gfCB1bmRlZmluZWQge1xuICAgIGxldCByZXN1bHQ6IEV4cHJlc3Npb24gfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgdmFsdWVDb25zdHJ1Y3RvciA9IHZhbHVlPy5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIHN3aXRjaCAodmFsdWVDb25zdHJ1Y3Rvcikge1xuICAgICAgICBjYXNlICdTdHJpbmcnOlxuICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgY29uc3QgdmFsdWVNYXRjaGVzID0gdmFsdWUudG9TdHJpbmcoKS5zcGxpdCgnLicpO1xuICAgICAgICAgICAgaWYgKHZhbHVlTWF0Y2hlcy5sZW5ndGggPiAxICYmIHJlZmVyZW5jZXMuZmluZCgocmVmKSA9PiByZWYuYWxpYXMgPT09IHZhbHVlTWF0Y2hlc1swXSkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdFbnVtTWVtYmVyJyxcbiAgICAgICAgICAgICAgICAgICAgRW51bU1lbWJlcjogdmFsdWUudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgIFN0cmluZzogdmFsdWUudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnQm9vbGVhbic6XG4gICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdCb29sJyxcbiAgICAgICAgICAgICAgICBCb29sOiB2YWx1ZS52YWx1ZU9mKClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdOdW1iZXInOlxuICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICAgICAgaWYgKHZhbHVlLnRvU3RyaW5nKCkgPT09IHZhbHVlLnRvRml4ZWQoKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0ludCcsXG4gICAgICAgICAgICAgICAgICAgIEludDogdmFsdWUudmFsdWVPZigpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnRGVjaW1hbCcsXG4gICAgICAgICAgICAgICAgICAgIERlY2ltYWw6IHZhbHVlLnZhbHVlT2YoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJlc3VsdCA9IHJldmVydE9iamVjdFRvUmF3VHlwZShyZWZlcmVuY2VzLCB2YWx1ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuY29uc3QgcmVzdHJpY3RlZEtleXMgPSBbJyRUeXBlJywgJ3Rlcm0nLCAnX19zb3VyY2UnLCAncXVhbGlmaWVyJywgJ0FjdGlvblRhcmdldCcsICdmdWxseVF1YWxpZmllZE5hbWUnLCAnYW5ub3RhdGlvbnMnXTtcblxuLyoqXG4gKiBSZXZlcnQgdGhlIGN1cnJlbnQgZW1iZWRkZWQgYW5ub3RhdGlvbnMgdG8gdGhlaXIgcmF3IHR5cGUuXG4gKlxuICogQHBhcmFtIHJlZmVyZW5jZXMgdGhlIGN1cnJlbnQgc2V0IG9mIHJlZmVyZW5jZVxuICogQHBhcmFtIGN1cnJlbnRBbm5vdGF0aW9ucyB0aGUgY29sbGVjdGlvbiBpdGVtIHRvIGV2YWx1YXRlXG4gKiBAcGFyYW0gdGFyZ2V0QW5ub3RhdGlvbnMgdGhlIHBsYWNlIHdoZXJlIHdlIG5lZWQgdG8gYWRkIHRoZSBhbm5vdGF0aW9uXG4gKi9cbmZ1bmN0aW9uIHJldmVydEFubm90YXRpb25zVG9SYXdUeXBlKFxuICAgIHJlZmVyZW5jZXM6IFJlZmVyZW5jZVtdLFxuICAgIGN1cnJlbnRBbm5vdGF0aW9uczogYW55LFxuICAgIHRhcmdldEFubm90YXRpb25zOiBSYXdBbm5vdGF0aW9uW11cbikge1xuICAgIE9iamVjdC5rZXlzKGN1cnJlbnRBbm5vdGF0aW9ucylcbiAgICAgICAgLmZpbHRlcigoa2V5KSA9PiBrZXkgIT09ICdfYW5ub3RhdGlvbnMnKVxuICAgICAgICAuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjdXJyZW50QW5ub3RhdGlvbnNba2V5XSkuZm9yRWFjaCgodGVybSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZEFubm90YXRpb24gPSByZXZlcnRUZXJtVG9HZW5lcmljVHlwZShyZWZlcmVuY2VzLCBjdXJyZW50QW5ub3RhdGlvbnNba2V5XVt0ZXJtXSk7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJzZWRBbm5vdGF0aW9uLnRlcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdW5hbGlhc2VkVGVybSA9IHVuYWxpYXMocmVmZXJlbmNlcywgYCR7a2V5fS4ke3Rlcm19YCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1bmFsaWFzZWRUZXJtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBxdWFsaWZpZWRTcGxpdCA9IHVuYWxpYXNlZFRlcm0uc3BsaXQoJyMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlZEFubm90YXRpb24udGVybSA9IHF1YWxpZmllZFNwbGl0WzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1YWxpZmllZFNwbGl0Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdWIgQW5ub3RhdGlvbiB3aXRoIGEgcXVhbGlmaWVyLCBub3Qgc3VyZSB3aGVuIHRoYXQgY2FuIGhhcHBlbiBpbiByZWFsIHNjZW5hcmlvc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlZEFubm90YXRpb24ucXVhbGlmaWVyID0gcXVhbGlmaWVkU3BsaXRbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGFyZ2V0QW5ub3RhdGlvbnMucHVzaChwYXJzZWRBbm5vdGF0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbn1cblxuLyoqXG4gKiBSZXZlcnQgdGhlIGN1cnJlbnQgY29sbGVjdGlvbiBpdGVtIHRvIHRoZSBjb3JyZXNwb25kaW5nIHJhdyBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSByZWZlcmVuY2VzIHRoZSBjdXJyZW50IHNldCBvZiByZWZlcmVuY2VcbiAqIEBwYXJhbSBjb2xsZWN0aW9uSXRlbSB0aGUgY29sbGVjdGlvbiBpdGVtIHRvIGV2YWx1YXRlXG4gKiBAcmV0dXJucyB0aGUgcmF3IHR5cGUgZXF1aXZhbGVudFxuICovXG5mdW5jdGlvbiByZXZlcnRDb2xsZWN0aW9uSXRlbVRvUmF3VHlwZShcbiAgICByZWZlcmVuY2VzOiBSZWZlcmVuY2VbXSxcbiAgICBjb2xsZWN0aW9uSXRlbTogYW55XG4pOlxuICAgIHwgQW5ub3RhdGlvblJlY29yZFxuICAgIHwgc3RyaW5nXG4gICAgfCBQcm9wZXJ0eVBhdGhFeHByZXNzaW9uXG4gICAgfCBQYXRoRXhwcmVzc2lvblxuICAgIHwgTmF2aWdhdGlvblByb3BlcnR5UGF0aEV4cHJlc3Npb25cbiAgICB8IEFubm90YXRpb25QYXRoRXhwcmVzc2lvblxuICAgIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAodHlwZW9mIGNvbGxlY3Rpb25JdGVtID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gY29sbGVjdGlvbkl0ZW07XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgY29sbGVjdGlvbkl0ZW0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlmIChjb2xsZWN0aW9uSXRlbS5oYXNPd25Qcm9wZXJ0eSgnJFR5cGUnKSkge1xuICAgICAgICAgICAgLy8gQW5ub3RhdGlvbiBSZWNvcmRcbiAgICAgICAgICAgIGNvbnN0IG91dEl0ZW06IEFubm90YXRpb25SZWNvcmQgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogY29sbGVjdGlvbkl0ZW0uJFR5cGUsXG4gICAgICAgICAgICAgICAgcHJvcGVydHlWYWx1ZXM6IFtdIGFzIGFueVtdXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gQ291bGQgdmFsaWRhdGUga2V5cyBhbmQgdHlwZSBiYXNlZCBvbiAkVHlwZVxuICAgICAgICAgICAgT2JqZWN0LmtleXMoY29sbGVjdGlvbkl0ZW0pLmZvckVhY2goKGNvbGxlY3Rpb25LZXkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdHJpY3RlZEtleXMuaW5kZXhPZihjb2xsZWN0aW9uS2V5KSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBjb2xsZWN0aW9uSXRlbVtjb2xsZWN0aW9uS2V5XTtcbiAgICAgICAgICAgICAgICAgICAgb3V0SXRlbS5wcm9wZXJ0eVZhbHVlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGNvbGxlY3Rpb25LZXksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmV2ZXJ0VmFsdWVUb1Jhd1R5cGUocmVmZXJlbmNlcywgdmFsdWUpIGFzIEV4cHJlc3Npb25cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb2xsZWN0aW9uS2V5ID09PSAnYW5ub3RhdGlvbnMnICYmIE9iamVjdC5rZXlzKGNvbGxlY3Rpb25JdGVtW2NvbGxlY3Rpb25LZXldKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dEl0ZW0uYW5ub3RhdGlvbnMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgcmV2ZXJ0QW5ub3RhdGlvbnNUb1Jhd1R5cGUocmVmZXJlbmNlcywgY29sbGVjdGlvbkl0ZW1bY29sbGVjdGlvbktleV0sIG91dEl0ZW0uYW5ub3RhdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG91dEl0ZW07XG4gICAgICAgIH0gZWxzZSBpZiAoY29sbGVjdGlvbkl0ZW0udHlwZSA9PT0gJ1Byb3BlcnR5UGF0aCcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ1Byb3BlcnR5UGF0aCcsXG4gICAgICAgICAgICAgICAgUHJvcGVydHlQYXRoOiBjb2xsZWN0aW9uSXRlbS52YWx1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChjb2xsZWN0aW9uSXRlbS50eXBlID09PSAnQW5ub3RhdGlvblBhdGgnKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdBbm5vdGF0aW9uUGF0aCcsXG4gICAgICAgICAgICAgICAgQW5ub3RhdGlvblBhdGg6IGNvbGxlY3Rpb25JdGVtLnZhbHVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKGNvbGxlY3Rpb25JdGVtLnR5cGUgPT09ICdOYXZpZ2F0aW9uUHJvcGVydHlQYXRoJykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnTmF2aWdhdGlvblByb3BlcnR5UGF0aCcsXG4gICAgICAgICAgICAgICAgTmF2aWdhdGlvblByb3BlcnR5UGF0aDogY29sbGVjdGlvbkl0ZW0udmFsdWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBSZXZlcnQgYW4gYW5ub3RhdGlvbiB0ZXJtIHRvIGl0J3MgZ2VuZXJpYyBvciByYXcgZXF1aXZhbGVudC5cbiAqXG4gKiBAcGFyYW0gcmVmZXJlbmNlcyB0aGUgcmVmZXJlbmNlIG9mIHRoZSBjdXJyZW50IGNvbnRleHRcbiAqIEBwYXJhbSBhbm5vdGF0aW9uIHRoZSBhbm5vdGF0aW9uIHRlcm0gdG8gcmV2ZXJ0XG4gKiBAcmV0dXJucyB0aGUgcmF3IGFubm90YXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJldmVydFRlcm1Ub0dlbmVyaWNUeXBlKHJlZmVyZW5jZXM6IFJlZmVyZW5jZVtdLCBhbm5vdGF0aW9uOiBBbm5vdGF0aW9uVGVybTxhbnk+KTogUmF3QW5ub3RhdGlvbiB7XG4gICAgY29uc3QgYmFzZUFubm90YXRpb246IFJhd0Fubm90YXRpb24gPSB7XG4gICAgICAgIHRlcm06IGFubm90YXRpb24udGVybSxcbiAgICAgICAgcXVhbGlmaWVyOiBhbm5vdGF0aW9uLnF1YWxpZmllclxuICAgIH07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYW5ub3RhdGlvbikpIHtcbiAgICAgICAgLy8gQ29sbGVjdGlvblxuICAgICAgICBpZiAoYW5ub3RhdGlvbi5oYXNPd25Qcm9wZXJ0eSgnYW5ub3RhdGlvbnMnKSAmJiBPYmplY3Qua2V5cygoYW5ub3RhdGlvbiBhcyBhbnkpLmFubm90YXRpb25zKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBBbm5vdGF0aW9uIG9uIGEgY29sbGVjdGlvbiBpdHNlbGYsIG5vdCBzdXJlIHdoZW4gdGhhdCBoYXBwZW5zIGlmIGF0IGFsbFxuICAgICAgICAgICAgYmFzZUFubm90YXRpb24uYW5ub3RhdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIHJldmVydEFubm90YXRpb25zVG9SYXdUeXBlKHJlZmVyZW5jZXMsIChhbm5vdGF0aW9uIGFzIGFueSkuYW5ub3RhdGlvbnMsIGJhc2VBbm5vdGF0aW9uLmFubm90YXRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uYmFzZUFubm90YXRpb24sXG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBhbm5vdGF0aW9uLm1hcCgoYW5ubykgPT4gcmV2ZXJ0Q29sbGVjdGlvbkl0ZW1Ub1Jhd1R5cGUocmVmZXJlbmNlcywgYW5ubykpIGFzIGFueVtdXG4gICAgICAgIH07XG4gICAgfSBlbHNlIGlmIChhbm5vdGF0aW9uLmhhc093blByb3BlcnR5KCckVHlwZScpKSB7XG4gICAgICAgIHJldHVybiB7IC4uLmJhc2VBbm5vdGF0aW9uLCByZWNvcmQ6IHJldmVydENvbGxlY3Rpb25JdGVtVG9SYXdUeXBlKHJlZmVyZW5jZXMsIGFubm90YXRpb24pIGFzIGFueSB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7IC4uLmJhc2VBbm5vdGF0aW9uLCB2YWx1ZTogcmV2ZXJ0VmFsdWVUb1Jhd1R5cGUocmVmZXJlbmNlcywgYW5ub3RhdGlvbikgfTtcbiAgICB9XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDk5NSk7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
    return AnnotationConverter;
    },true);
