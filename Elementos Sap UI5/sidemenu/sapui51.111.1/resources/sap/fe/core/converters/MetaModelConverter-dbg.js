/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/common/AnnotationConverter", "../helpers/StableIdHelper"], function (AnnotationConverter, StableIdHelper) {
  "use strict";

  var _exports = {};
  var prepareId = StableIdHelper.prepareId;
  const VOCABULARY_ALIAS = {
    "Org.OData.Capabilities.V1": "Capabilities",
    "Org.OData.Core.V1": "Core",
    "Org.OData.Measures.V1": "Measures",
    "com.sap.vocabularies.Common.v1": "Common",
    "com.sap.vocabularies.UI.v1": "UI",
    "com.sap.vocabularies.Session.v1": "Session",
    "com.sap.vocabularies.Analytics.v1": "Analytics",
    "com.sap.vocabularies.PersonalData.v1": "PersonalData",
    "com.sap.vocabularies.Communication.v1": "Communication"
  };
  const DefaultEnvironmentCapabilities = {
    Chart: true,
    MicroChart: true,
    UShell: true,
    IntentBasedNavigation: true,
    AppState: true
  };
  _exports.DefaultEnvironmentCapabilities = DefaultEnvironmentCapabilities;
  function parsePropertyValue(annotationObject, propertyKey, currentTarget, annotationsLists, oCapabilities) {
    let value;
    const currentPropertyTarget = `${currentTarget}/${propertyKey}`;
    const typeOfAnnotation = typeof annotationObject;
    if (annotationObject === null) {
      value = {
        type: "Null",
        Null: null
      };
    } else if (typeOfAnnotation === "string") {
      value = {
        type: "String",
        String: annotationObject
      };
    } else if (typeOfAnnotation === "boolean") {
      value = {
        type: "Bool",
        Bool: annotationObject
      };
    } else if (typeOfAnnotation === "number") {
      value = {
        type: "Int",
        Int: annotationObject
      };
    } else if (Array.isArray(annotationObject)) {
      value = {
        type: "Collection",
        Collection: annotationObject.map((subAnnotationObject, subAnnotationObjectIndex) => parseAnnotationObject(subAnnotationObject, `${currentPropertyTarget}/${subAnnotationObjectIndex}`, annotationsLists, oCapabilities))
      };
      if (annotationObject.length > 0) {
        if (annotationObject[0].hasOwnProperty("$PropertyPath")) {
          value.Collection.type = "PropertyPath";
        } else if (annotationObject[0].hasOwnProperty("$Path")) {
          value.Collection.type = "Path";
        } else if (annotationObject[0].hasOwnProperty("$NavigationPropertyPath")) {
          value.Collection.type = "NavigationPropertyPath";
        } else if (annotationObject[0].hasOwnProperty("$AnnotationPath")) {
          value.Collection.type = "AnnotationPath";
        } else if (annotationObject[0].hasOwnProperty("$Type")) {
          value.Collection.type = "Record";
        } else if (annotationObject[0].hasOwnProperty("$If")) {
          value.Collection.type = "If";
        } else if (annotationObject[0].hasOwnProperty("$Or")) {
          value.Collection.type = "Or";
        } else if (annotationObject[0].hasOwnProperty("$And")) {
          value.Collection.type = "And";
        } else if (annotationObject[0].hasOwnProperty("$Eq")) {
          value.Collection.type = "Eq";
        } else if (annotationObject[0].hasOwnProperty("$Ne")) {
          value.Collection.type = "Ne";
        } else if (annotationObject[0].hasOwnProperty("$Not")) {
          value.Collection.type = "Not";
        } else if (annotationObject[0].hasOwnProperty("$Gt")) {
          value.Collection.type = "Gt";
        } else if (annotationObject[0].hasOwnProperty("$Ge")) {
          value.Collection.type = "Ge";
        } else if (annotationObject[0].hasOwnProperty("$Lt")) {
          value.Collection.type = "Lt";
        } else if (annotationObject[0].hasOwnProperty("$Le")) {
          value.Collection.type = "Le";
        } else if (annotationObject[0].hasOwnProperty("$Apply")) {
          value.Collection.type = "Apply";
        } else if (typeof annotationObject[0] === "object") {
          // $Type is optional...
          value.Collection.type = "Record";
        } else {
          value.Collection.type = "String";
        }
      }
    } else if (annotationObject.$Path !== undefined) {
      value = {
        type: "Path",
        Path: annotationObject.$Path
      };
    } else if (annotationObject.$Decimal !== undefined) {
      value = {
        type: "Decimal",
        Decimal: parseFloat(annotationObject.$Decimal)
      };
    } else if (annotationObject.$PropertyPath !== undefined) {
      value = {
        type: "PropertyPath",
        PropertyPath: annotationObject.$PropertyPath
      };
    } else if (annotationObject.$NavigationPropertyPath !== undefined) {
      value = {
        type: "NavigationPropertyPath",
        NavigationPropertyPath: annotationObject.$NavigationPropertyPath
      };
    } else if (annotationObject.$If !== undefined) {
      value = {
        type: "If",
        If: annotationObject.$If
      };
    } else if (annotationObject.$And !== undefined) {
      value = {
        type: "And",
        And: annotationObject.$And
      };
    } else if (annotationObject.$Or !== undefined) {
      value = {
        type: "Or",
        Or: annotationObject.$Or
      };
    } else if (annotationObject.$Not !== undefined) {
      value = {
        type: "Not",
        Not: annotationObject.$Not
      };
    } else if (annotationObject.$Eq !== undefined) {
      value = {
        type: "Eq",
        Eq: annotationObject.$Eq
      };
    } else if (annotationObject.$Ne !== undefined) {
      value = {
        type: "Ne",
        Ne: annotationObject.$Ne
      };
    } else if (annotationObject.$Gt !== undefined) {
      value = {
        type: "Gt",
        Gt: annotationObject.$Gt
      };
    } else if (annotationObject.$Ge !== undefined) {
      value = {
        type: "Ge",
        Ge: annotationObject.$Ge
      };
    } else if (annotationObject.$Lt !== undefined) {
      value = {
        type: "Lt",
        Lt: annotationObject.$Lt
      };
    } else if (annotationObject.$Le !== undefined) {
      value = {
        type: "Le",
        Le: annotationObject.$Le
      };
    } else if (annotationObject.$Apply !== undefined) {
      value = {
        type: "Apply",
        Apply: annotationObject.$Apply,
        Function: annotationObject.$Function
      };
    } else if (annotationObject.$AnnotationPath !== undefined) {
      value = {
        type: "AnnotationPath",
        AnnotationPath: annotationObject.$AnnotationPath
      };
    } else if (annotationObject.$EnumMember !== undefined) {
      value = {
        type: "EnumMember",
        EnumMember: `${mapNameToAlias(annotationObject.$EnumMember.split("/")[0])}/${annotationObject.$EnumMember.split("/")[1]}`
      };
    } else {
      value = {
        type: "Record",
        Record: parseAnnotationObject(annotationObject, currentTarget, annotationsLists, oCapabilities)
      };
    }
    return {
      name: propertyKey,
      value
    };
  }
  function mapNameToAlias(annotationName) {
    let [pathPart, annoPart] = annotationName.split("@");
    if (!annoPart) {
      annoPart = pathPart;
      pathPart = "";
    } else {
      pathPart += "@";
    }
    const lastDot = annoPart.lastIndexOf(".");
    return `${pathPart + VOCABULARY_ALIAS[annoPart.substr(0, lastDot)]}.${annoPart.substr(lastDot + 1)}`;
  }
  function parseAnnotationObject(annotationObject, currentObjectTarget, annotationsLists, oCapabilities) {
    let parsedAnnotationObject = {};
    const typeOfObject = typeof annotationObject;
    if (annotationObject === null) {
      parsedAnnotationObject = {
        type: "Null",
        Null: null
      };
    } else if (typeOfObject === "string") {
      parsedAnnotationObject = {
        type: "String",
        String: annotationObject
      };
    } else if (typeOfObject === "boolean") {
      parsedAnnotationObject = {
        type: "Bool",
        Bool: annotationObject
      };
    } else if (typeOfObject === "number") {
      parsedAnnotationObject = {
        type: "Int",
        Int: annotationObject
      };
    } else if (annotationObject.$AnnotationPath !== undefined) {
      parsedAnnotationObject = {
        type: "AnnotationPath",
        AnnotationPath: annotationObject.$AnnotationPath
      };
    } else if (annotationObject.$Path !== undefined) {
      parsedAnnotationObject = {
        type: "Path",
        Path: annotationObject.$Path
      };
    } else if (annotationObject.$Decimal !== undefined) {
      parsedAnnotationObject = {
        type: "Decimal",
        Decimal: parseFloat(annotationObject.$Decimal)
      };
    } else if (annotationObject.$PropertyPath !== undefined) {
      parsedAnnotationObject = {
        type: "PropertyPath",
        PropertyPath: annotationObject.$PropertyPath
      };
    } else if (annotationObject.$If !== undefined) {
      parsedAnnotationObject = {
        type: "If",
        If: annotationObject.$If
      };
    } else if (annotationObject.$And !== undefined) {
      parsedAnnotationObject = {
        type: "And",
        And: annotationObject.$And
      };
    } else if (annotationObject.$Or !== undefined) {
      parsedAnnotationObject = {
        type: "Or",
        Or: annotationObject.$Or
      };
    } else if (annotationObject.$Not !== undefined) {
      parsedAnnotationObject = {
        type: "Not",
        Not: annotationObject.$Not
      };
    } else if (annotationObject.$Eq !== undefined) {
      parsedAnnotationObject = {
        type: "Eq",
        Eq: annotationObject.$Eq
      };
    } else if (annotationObject.$Ne !== undefined) {
      parsedAnnotationObject = {
        type: "Ne",
        Ne: annotationObject.$Ne
      };
    } else if (annotationObject.$Gt !== undefined) {
      parsedAnnotationObject = {
        type: "Gt",
        Gt: annotationObject.$Gt
      };
    } else if (annotationObject.$Ge !== undefined) {
      parsedAnnotationObject = {
        type: "Ge",
        Ge: annotationObject.$Ge
      };
    } else if (annotationObject.$Lt !== undefined) {
      parsedAnnotationObject = {
        type: "Lt",
        Lt: annotationObject.$Lt
      };
    } else if (annotationObject.$Le !== undefined) {
      parsedAnnotationObject = {
        type: "Le",
        Le: annotationObject.$Le
      };
    } else if (annotationObject.$Apply !== undefined) {
      parsedAnnotationObject = {
        type: "Apply",
        Apply: annotationObject.$Apply,
        Function: annotationObject.$Function
      };
    } else if (annotationObject.$NavigationPropertyPath !== undefined) {
      parsedAnnotationObject = {
        type: "NavigationPropertyPath",
        NavigationPropertyPath: annotationObject.$NavigationPropertyPath
      };
    } else if (annotationObject.$EnumMember !== undefined) {
      parsedAnnotationObject = {
        type: "EnumMember",
        EnumMember: `${mapNameToAlias(annotationObject.$EnumMember.split("/")[0])}/${annotationObject.$EnumMember.split("/")[1]}`
      };
    } else if (Array.isArray(annotationObject)) {
      const parsedAnnotationCollection = parsedAnnotationObject;
      parsedAnnotationCollection.collection = annotationObject.map((subAnnotationObject, subAnnotationIndex) => parseAnnotationObject(subAnnotationObject, `${currentObjectTarget}/${subAnnotationIndex}`, annotationsLists, oCapabilities));
      if (annotationObject.length > 0) {
        if (annotationObject[0].hasOwnProperty("$PropertyPath")) {
          parsedAnnotationCollection.collection.type = "PropertyPath";
        } else if (annotationObject[0].hasOwnProperty("$Path")) {
          parsedAnnotationCollection.collection.type = "Path";
        } else if (annotationObject[0].hasOwnProperty("$NavigationPropertyPath")) {
          parsedAnnotationCollection.collection.type = "NavigationPropertyPath";
        } else if (annotationObject[0].hasOwnProperty("$AnnotationPath")) {
          parsedAnnotationCollection.collection.type = "AnnotationPath";
        } else if (annotationObject[0].hasOwnProperty("$Type")) {
          parsedAnnotationCollection.collection.type = "Record";
        } else if (annotationObject[0].hasOwnProperty("$If")) {
          parsedAnnotationCollection.collection.type = "If";
        } else if (annotationObject[0].hasOwnProperty("$And")) {
          parsedAnnotationCollection.collection.type = "And";
        } else if (annotationObject[0].hasOwnProperty("$Or")) {
          parsedAnnotationCollection.collection.type = "Or";
        } else if (annotationObject[0].hasOwnProperty("$Eq")) {
          parsedAnnotationCollection.collection.type = "Eq";
        } else if (annotationObject[0].hasOwnProperty("$Ne")) {
          parsedAnnotationCollection.collection.type = "Ne";
        } else if (annotationObject[0].hasOwnProperty("$Not")) {
          parsedAnnotationCollection.collection.type = "Not";
        } else if (annotationObject[0].hasOwnProperty("$Gt")) {
          parsedAnnotationCollection.collection.type = "Gt";
        } else if (annotationObject[0].hasOwnProperty("$Ge")) {
          parsedAnnotationCollection.collection.type = "Ge";
        } else if (annotationObject[0].hasOwnProperty("$Lt")) {
          parsedAnnotationCollection.collection.type = "Lt";
        } else if (annotationObject[0].hasOwnProperty("$Le")) {
          parsedAnnotationCollection.collection.type = "Le";
        } else if (annotationObject[0].hasOwnProperty("$Apply")) {
          parsedAnnotationCollection.collection.type = "Apply";
        } else if (typeof annotationObject[0] === "object") {
          parsedAnnotationCollection.collection.type = "Record";
        } else {
          parsedAnnotationCollection.collection.type = "String";
        }
      }
    } else {
      if (annotationObject.$Type) {
        const typeValue = annotationObject.$Type;
        parsedAnnotationObject.type = typeValue; //`${typeAlias}.${typeTerm}`;
      }

      const propertyValues = [];
      Object.keys(annotationObject).forEach(propertyKey => {
        if (propertyKey !== "$Type" && propertyKey !== "$If" && propertyKey !== "$Apply" && propertyKey !== "$And" && propertyKey !== "$Or" && propertyKey !== "$Ne" && propertyKey !== "$Gt" && propertyKey !== "$Ge" && propertyKey !== "$Lt" && propertyKey !== "$Le" && propertyKey !== "$Not" && propertyKey !== "$Eq" && !propertyKey.startsWith("@")) {
          propertyValues.push(parsePropertyValue(annotationObject[propertyKey], propertyKey, currentObjectTarget, annotationsLists, oCapabilities));
        } else if (propertyKey.startsWith("@")) {
          // Annotation of annotation
          createAnnotationLists({
            [propertyKey]: annotationObject[propertyKey]
          }, currentObjectTarget, annotationsLists, oCapabilities);
        }
      });
      parsedAnnotationObject.propertyValues = propertyValues;
    }
    return parsedAnnotationObject;
  }
  function getOrCreateAnnotationList(target, annotationsLists) {
    if (!annotationsLists.hasOwnProperty(target)) {
      annotationsLists[target] = {
        target: target,
        annotations: []
      };
    }
    return annotationsLists[target];
  }
  function createReferenceFacetId(referenceFacet) {
    const id = referenceFacet.ID ?? referenceFacet.Target.$AnnotationPath;
    return id ? prepareId(id) : id;
  }
  function removeChartAnnotations(annotationObject) {
    return annotationObject.filter(oRecord => {
      if (oRecord.Target && oRecord.Target.$AnnotationPath) {
        return oRecord.Target.$AnnotationPath.indexOf(`@${"com.sap.vocabularies.UI.v1.Chart"}`) === -1;
      } else {
        return true;
      }
    });
  }
  function removeIBNAnnotations(annotationObject) {
    return annotationObject.filter(oRecord => {
      return oRecord.$Type !== "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation";
    });
  }
  function handlePresentationVariant(annotationObject) {
    return annotationObject.filter(oRecord => {
      return oRecord.$AnnotationPath !== `@${"com.sap.vocabularies.UI.v1.Chart"}`;
    });
  }
  function createAnnotationLists(annotationObjects, annotationTarget, annotationLists, oCapabilities) {
    if (Object.keys(annotationObjects).length === 0) {
      return;
    }
    const outAnnotationObject = getOrCreateAnnotationList(annotationTarget, annotationLists);
    if (!oCapabilities.MicroChart) {
      delete annotationObjects[`@${"com.sap.vocabularies.UI.v1.Chart"}`];
    }
    for (let annotationKey in annotationObjects) {
      let annotationObject = annotationObjects[annotationKey];
      switch (annotationKey) {
        case `@${"com.sap.vocabularies.UI.v1.HeaderFacets"}`:
          if (!oCapabilities.MicroChart) {
            annotationObject = removeChartAnnotations(annotationObject);
            annotationObjects[annotationKey] = annotationObject;
          }
          break;
        case `@${"com.sap.vocabularies.UI.v1.Identification"}`:
          if (!oCapabilities.IntentBasedNavigation) {
            annotationObject = removeIBNAnnotations(annotationObject);
            annotationObjects[annotationKey] = annotationObject;
          }
          break;
        case `@${"com.sap.vocabularies.UI.v1.LineItem"}`:
          if (!oCapabilities.IntentBasedNavigation) {
            annotationObject = removeIBNAnnotations(annotationObject);
            annotationObjects[annotationKey] = annotationObject;
          }
          if (!oCapabilities.MicroChart) {
            annotationObject = removeChartAnnotations(annotationObject);
            annotationObjects[annotationKey] = annotationObject;
          }
          break;
        case `@${"com.sap.vocabularies.UI.v1.FieldGroup"}`:
          if (!oCapabilities.IntentBasedNavigation) {
            annotationObject.Data = removeIBNAnnotations(annotationObject.Data);
            annotationObjects[annotationKey] = annotationObject;
          }
          if (!oCapabilities.MicroChart) {
            annotationObject.Data = removeChartAnnotations(annotationObject.Data);
            annotationObjects[annotationKey] = annotationObject;
          }
          break;
        case `@${"com.sap.vocabularies.UI.v1.PresentationVariant"}`:
          if (!oCapabilities.Chart && annotationObject.Visualizations) {
            annotationObject.Visualizations = handlePresentationVariant(annotationObject.Visualizations);
            annotationObjects[annotationKey] = annotationObject;
          }
          break;
        default:
          break;
      }
      let currentOutAnnotationObject = outAnnotationObject;

      // Check for annotation of annotation
      const annotationOfAnnotationSplit = annotationKey.split("@");
      if (annotationOfAnnotationSplit.length > 2) {
        currentOutAnnotationObject = getOrCreateAnnotationList(`${annotationTarget}@${annotationOfAnnotationSplit[1]}`, annotationLists);
        annotationKey = annotationOfAnnotationSplit[2];
      } else {
        annotationKey = annotationOfAnnotationSplit[1];
      }
      const annotationQualifierSplit = annotationKey.split("#");
      const qualifier = annotationQualifierSplit[1];
      annotationKey = annotationQualifierSplit[0];
      const parsedAnnotationObject = {
        term: `${annotationKey}`,
        qualifier: qualifier
      };
      let currentAnnotationTarget = `${annotationTarget}@${parsedAnnotationObject.term}`;
      if (qualifier) {
        currentAnnotationTarget += `#${qualifier}`;
      }
      let isCollection = false;
      const typeofAnnotation = typeof annotationObject;
      if (annotationObject === null) {
        parsedAnnotationObject.value = {
          type: "Bool",
          Bool: annotationObject
        };
      } else if (typeofAnnotation === "string") {
        parsedAnnotationObject.value = {
          type: "String",
          String: annotationObject
        };
      } else if (typeofAnnotation === "boolean") {
        parsedAnnotationObject.value = {
          type: "Bool",
          Bool: annotationObject
        };
      } else if (typeofAnnotation === "number") {
        parsedAnnotationObject.value = {
          type: "Int",
          Int: annotationObject
        };
      } else if (annotationObject.$If !== undefined) {
        parsedAnnotationObject.value = {
          type: "If",
          If: annotationObject.$If
        };
      } else if (annotationObject.$And !== undefined) {
        parsedAnnotationObject.value = {
          type: "And",
          And: annotationObject.$And
        };
      } else if (annotationObject.$Or !== undefined) {
        parsedAnnotationObject.value = {
          type: "Or",
          Or: annotationObject.$Or
        };
      } else if (annotationObject.$Not !== undefined) {
        parsedAnnotationObject.value = {
          type: "Not",
          Not: annotationObject.$Not
        };
      } else if (annotationObject.$Eq !== undefined) {
        parsedAnnotationObject.value = {
          type: "Eq",
          Eq: annotationObject.$Eq
        };
      } else if (annotationObject.$Ne !== undefined) {
        parsedAnnotationObject.value = {
          type: "Ne",
          Ne: annotationObject.$Ne
        };
      } else if (annotationObject.$Gt !== undefined) {
        parsedAnnotationObject.value = {
          type: "Gt",
          Gt: annotationObject.$Gt
        };
      } else if (annotationObject.$Ge !== undefined) {
        parsedAnnotationObject.value = {
          type: "Ge",
          Ge: annotationObject.$Ge
        };
      } else if (annotationObject.$Lt !== undefined) {
        parsedAnnotationObject.value = {
          type: "Lt",
          Lt: annotationObject.$Lt
        };
      } else if (annotationObject.$Le !== undefined) {
        parsedAnnotationObject.value = {
          type: "Le",
          Le: annotationObject.$Le
        };
      } else if (annotationObject.$Apply !== undefined) {
        parsedAnnotationObject.value = {
          type: "Apply",
          Apply: annotationObject.$Apply,
          Function: annotationObject.$Function
        };
      } else if (annotationObject.$Path !== undefined) {
        parsedAnnotationObject.value = {
          type: "Path",
          Path: annotationObject.$Path
        };
      } else if (annotationObject.$AnnotationPath !== undefined) {
        parsedAnnotationObject.value = {
          type: "AnnotationPath",
          AnnotationPath: annotationObject.$AnnotationPath
        };
      } else if (annotationObject.$Decimal !== undefined) {
        parsedAnnotationObject.value = {
          type: "Decimal",
          Decimal: parseFloat(annotationObject.$Decimal)
        };
      } else if (annotationObject.$EnumMember !== undefined) {
        parsedAnnotationObject.value = {
          type: "EnumMember",
          EnumMember: `${mapNameToAlias(annotationObject.$EnumMember.split("/")[0])}/${annotationObject.$EnumMember.split("/")[1]}`
        };
      } else if (Array.isArray(annotationObject)) {
        isCollection = true;
        parsedAnnotationObject.collection = annotationObject.map((subAnnotationObject, subAnnotationIndex) => parseAnnotationObject(subAnnotationObject, `${currentAnnotationTarget}/${subAnnotationIndex}`, annotationLists, oCapabilities));
        if (annotationObject.length > 0) {
          if (annotationObject[0].hasOwnProperty("$PropertyPath")) {
            parsedAnnotationObject.collection.type = "PropertyPath";
          } else if (annotationObject[0].hasOwnProperty("$Path")) {
            parsedAnnotationObject.collection.type = "Path";
          } else if (annotationObject[0].hasOwnProperty("$NavigationPropertyPath")) {
            parsedAnnotationObject.collection.type = "NavigationPropertyPath";
          } else if (annotationObject[0].hasOwnProperty("$AnnotationPath")) {
            parsedAnnotationObject.collection.type = "AnnotationPath";
          } else if (annotationObject[0].hasOwnProperty("$Type")) {
            parsedAnnotationObject.collection.type = "Record";
          } else if (annotationObject[0].hasOwnProperty("$If")) {
            parsedAnnotationObject.collection.type = "If";
          } else if (annotationObject[0].hasOwnProperty("$Or")) {
            parsedAnnotationObject.collection.type = "Or";
          } else if (annotationObject[0].hasOwnProperty("$Eq")) {
            parsedAnnotationObject.collection.type = "Eq";
          } else if (annotationObject[0].hasOwnProperty("$Ne")) {
            parsedAnnotationObject.collection.type = "Ne";
          } else if (annotationObject[0].hasOwnProperty("$Not")) {
            parsedAnnotationObject.collection.type = "Not";
          } else if (annotationObject[0].hasOwnProperty("$Gt")) {
            parsedAnnotationObject.collection.type = "Gt";
          } else if (annotationObject[0].hasOwnProperty("$Ge")) {
            parsedAnnotationObject.collection.type = "Ge";
          } else if (annotationObject[0].hasOwnProperty("$Lt")) {
            parsedAnnotationObject.collection.type = "Lt";
          } else if (annotationObject[0].hasOwnProperty("$Le")) {
            parsedAnnotationObject.collection.type = "Le";
          } else if (annotationObject[0].hasOwnProperty("$And")) {
            parsedAnnotationObject.collection.type = "And";
          } else if (annotationObject[0].hasOwnProperty("$Apply")) {
            parsedAnnotationObject.collection.type = "Apply";
          } else if (typeof annotationObject[0] === "object") {
            parsedAnnotationObject.collection.type = "Record";
          } else {
            parsedAnnotationObject.collection.type = "String";
          }
        }
      } else {
        const record = {
          propertyValues: []
        };
        if (annotationObject.$Type) {
          const typeValue = annotationObject.$Type;
          record.type = `${typeValue}`;
        }
        const propertyValues = [];
        for (const propertyKey in annotationObject) {
          if (propertyKey !== "$Type" && !propertyKey.startsWith("@")) {
            propertyValues.push(parsePropertyValue(annotationObject[propertyKey], propertyKey, currentAnnotationTarget, annotationLists, oCapabilities));
          } else if (propertyKey.startsWith("@")) {
            // Annotation of record
            createAnnotationLists({
              [propertyKey]: annotationObject[propertyKey]
            }, currentAnnotationTarget, annotationLists, oCapabilities);
          }
        }
        record.propertyValues = propertyValues;
        parsedAnnotationObject.record = record;
      }
      parsedAnnotationObject.isCollection = isCollection;
      currentOutAnnotationObject.annotations.push(parsedAnnotationObject);
    }
  }
  function prepareProperty(propertyDefinition, entityTypeObject, propertyName) {
    return {
      _type: "Property",
      name: propertyName,
      fullyQualifiedName: `${entityTypeObject.fullyQualifiedName}/${propertyName}`,
      type: propertyDefinition.$Type,
      maxLength: propertyDefinition.$MaxLength,
      precision: propertyDefinition.$Precision,
      scale: propertyDefinition.$Scale,
      nullable: propertyDefinition.$Nullable
    };
  }
  function prepareNavigationProperty(navPropertyDefinition, entityTypeObject, navPropertyName) {
    let referentialConstraint = [];
    if (navPropertyDefinition.$ReferentialConstraint) {
      referentialConstraint = Object.keys(navPropertyDefinition.$ReferentialConstraint).map(sourcePropertyName => {
        return {
          sourceTypeName: entityTypeObject.name,
          sourceProperty: sourcePropertyName,
          targetTypeName: navPropertyDefinition.$Type,
          targetProperty: navPropertyDefinition.$ReferentialConstraint[sourcePropertyName]
        };
      });
    }
    const navigationProperty = {
      _type: "NavigationProperty",
      name: navPropertyName,
      fullyQualifiedName: `${entityTypeObject.fullyQualifiedName}/${navPropertyName}`,
      partner: navPropertyDefinition.$Partner,
      isCollection: navPropertyDefinition.$isCollection ? navPropertyDefinition.$isCollection : false,
      containsTarget: navPropertyDefinition.$ContainsTarget,
      targetTypeName: navPropertyDefinition.$Type,
      referentialConstraint
    };
    return navigationProperty;
  }
  function prepareEntitySet(entitySetDefinition, entitySetName, entityContainerName) {
    const entitySetObject = {
      _type: "EntitySet",
      name: entitySetName,
      navigationPropertyBinding: {},
      entityTypeName: entitySetDefinition.$Type,
      fullyQualifiedName: `${entityContainerName}/${entitySetName}`
    };
    return entitySetObject;
  }
  function prepareSingleton(singletonDefinition, singletonName, entityContainerName) {
    return {
      _type: "Singleton",
      name: singletonName,
      navigationPropertyBinding: {},
      entityTypeName: singletonDefinition.$Type,
      fullyQualifiedName: `${entityContainerName}/${singletonName}`,
      nullable: true
    };
  }
  function prepareActionImport(actionImport, actionImportName, entityContainerName) {
    return {
      _type: "ActionImport",
      name: actionImportName,
      fullyQualifiedName: `${entityContainerName}/${actionImportName}`,
      actionName: actionImport.$Action
    };
  }
  function prepareTypeDefinition(typeDefinition, typeName, namespacePrefix) {
    const typeObject = {
      _type: "TypeDefinition",
      name: typeName.substring(namespacePrefix.length),
      fullyQualifiedName: typeName,
      underlyingType: typeDefinition.$UnderlyingType
    };
    return typeObject;
  }
  function prepareComplexType(complexTypeDefinition, complexTypeName, namespacePrefix) {
    const complexTypeObject = {
      _type: "ComplexType",
      name: complexTypeName.substring(namespacePrefix.length),
      fullyQualifiedName: complexTypeName,
      properties: [],
      navigationProperties: []
    };
    const complexTypeProperties = Object.keys(complexTypeDefinition).filter(propertyNameOrNot => {
      if (propertyNameOrNot != "$Key" && propertyNameOrNot != "$kind") {
        return complexTypeDefinition[propertyNameOrNot].$kind === "Property";
      }
    }).sort((a, b) => a > b ? 1 : -1).map(propertyName => {
      return prepareProperty(complexTypeDefinition[propertyName], complexTypeObject, propertyName);
    });
    complexTypeObject.properties = complexTypeProperties;
    const complexTypeNavigationProperties = Object.keys(complexTypeDefinition).filter(propertyNameOrNot => {
      if (propertyNameOrNot != "$Key" && propertyNameOrNot != "$kind") {
        return complexTypeDefinition[propertyNameOrNot].$kind === "NavigationProperty";
      }
    }).sort((a, b) => a > b ? 1 : -1).map(navPropertyName => {
      return prepareNavigationProperty(complexTypeDefinition[navPropertyName], complexTypeObject, navPropertyName);
    });
    complexTypeObject.navigationProperties = complexTypeNavigationProperties;
    return complexTypeObject;
  }
  function prepareEntityKeys(entityTypeDefinition, oMetaModelData) {
    if (!entityTypeDefinition.$Key && entityTypeDefinition.$BaseType) {
      return prepareEntityKeys(oMetaModelData[entityTypeDefinition.$BaseType], oMetaModelData);
    }
    return entityTypeDefinition.$Key ?? []; //handling of entity types without key as well as basetype
  }

  function prepareEntityType(entityTypeDefinition, entityTypeName, namespacePrefix, metaModelData) {
    var _metaModelData$$Annot, _metaModelData$$Annot2;
    const entityType = {
      _type: "EntityType",
      name: entityTypeName.substring(namespacePrefix.length),
      fullyQualifiedName: entityTypeName,
      keys: [],
      entityProperties: [],
      navigationProperties: [],
      actions: {}
    };
    for (const key in entityTypeDefinition) {
      const value = entityTypeDefinition[key];
      switch (value.$kind) {
        case "Property":
          const property = prepareProperty(value, entityType, key);
          entityType.entityProperties.push(property);
          break;
        case "NavigationProperty":
          const navigationProperty = prepareNavigationProperty(value, entityType, key);
          entityType.navigationProperties.push(navigationProperty);
          break;
      }
    }
    entityType.keys = prepareEntityKeys(entityTypeDefinition, metaModelData).map(entityKey => entityType.entityProperties.find(property => property.name === entityKey)).filter(property => property !== undefined);

    // Check if there are filter facets defined for the entityType and if yes, check if all of them have an ID
    // The ID is optional, but it is internally taken for grouping filter fields and if it's not present
    // a fallback ID needs to be generated here.
    (_metaModelData$$Annot = metaModelData.$Annotations[entityType.fullyQualifiedName]) === null || _metaModelData$$Annot === void 0 ? void 0 : (_metaModelData$$Annot2 = _metaModelData$$Annot[`@${"com.sap.vocabularies.UI.v1.FilterFacets"}`]) === null || _metaModelData$$Annot2 === void 0 ? void 0 : _metaModelData$$Annot2.forEach(filterFacetAnnotation => {
      filterFacetAnnotation.ID = createReferenceFacetId(filterFacetAnnotation);
    });
    for (const entityProperty of entityType.entityProperties) {
      if (!metaModelData.$Annotations[entityProperty.fullyQualifiedName]) {
        metaModelData.$Annotations[entityProperty.fullyQualifiedName] = {};
      }
      if (!metaModelData.$Annotations[entityProperty.fullyQualifiedName][`@${"com.sap.vocabularies.UI.v1.DataFieldDefault"}`]) {
        metaModelData.$Annotations[entityProperty.fullyQualifiedName][`@${"com.sap.vocabularies.UI.v1.DataFieldDefault"}`] = {
          $Type: "com.sap.vocabularies.UI.v1.DataField",
          Value: {
            $Path: entityProperty.name
          }
        };
      }
    }
    return entityType;
  }
  function prepareAction(actionName, actionRawData, namespacePrefix) {
    var _actionRawData$$Retur;
    let actionEntityType = "";
    let actionFQN = actionName;
    if (actionRawData.$IsBound) {
      const bindingParameter = actionRawData.$Parameter[0];
      actionEntityType = bindingParameter.$Type;
      if (bindingParameter.$isCollection === true) {
        actionFQN = `${actionName}(Collection(${actionEntityType}))`;
      } else {
        actionFQN = `${actionName}(${actionEntityType})`;
      }
    }
    const parameters = actionRawData.$Parameter ?? [];
    return {
      _type: "Action",
      name: actionName.substring(namespacePrefix.length),
      fullyQualifiedName: actionFQN,
      isBound: actionRawData.$IsBound ?? false,
      isFunction: actionRawData.$kind === "Function",
      sourceType: actionEntityType,
      returnType: ((_actionRawData$$Retur = actionRawData.$ReturnType) === null || _actionRawData$$Retur === void 0 ? void 0 : _actionRawData$$Retur.$Type) ?? "",
      parameters: parameters.map(param => {
        return {
          _type: "ActionParameter",
          fullyQualifiedName: `${actionFQN}/${param.$Name}`,
          isCollection: param.$isCollection ?? false,
          name: param.$Name,
          type: param.$Type
        };
      })
    };
  }
  function parseEntityContainer(namespacePrefix, entityContainerName, entityContainerMetadata, result) {
    result.schema.entityContainer = {
      _type: "EntityContainer",
      name: entityContainerName.substring(namespacePrefix.length),
      fullyQualifiedName: entityContainerName
    };
    for (const elementName in entityContainerMetadata) {
      const elementValue = entityContainerMetadata[elementName];
      switch (elementValue.$kind) {
        case "EntitySet":
          result.schema.entitySets.push(prepareEntitySet(elementValue, elementName, entityContainerName));
          break;
        case "Singleton":
          result.schema.singletons.push(prepareSingleton(elementValue, elementName, entityContainerName));
          break;
        case "ActionImport":
          result.schema.actionImports.push(prepareActionImport(elementValue, elementName, entityContainerName));
          break;
      }
    }

    // link the navigation property bindings ($NavigationPropertyBinding)
    for (const entitySet of result.schema.entitySets) {
      const navPropertyBindings = entityContainerMetadata[entitySet.name].$NavigationPropertyBinding;
      if (navPropertyBindings) {
        for (const navPropName of Object.keys(navPropertyBindings)) {
          const targetEntitySet = result.schema.entitySets.find(entitySetName => entitySetName.name === navPropertyBindings[navPropName]);
          if (targetEntitySet) {
            entitySet.navigationPropertyBinding[navPropName] = targetEntitySet;
          }
        }
      }
    }
  }
  function parseAnnotations(annotations, capabilities) {
    const annotationLists = {};
    for (const target in annotations) {
      createAnnotationLists(annotations[target], target, annotationLists, capabilities);
    }

    // Sort by target length
    return Object.keys(annotationLists).sort((a, b) => a.length - b.length).map(annotationName => annotationLists[annotationName]);
  }
  function parseMetaModel(metaModel) {
    let capabilities = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DefaultEnvironmentCapabilities;
    const metaModelData = metaModel.getObject("/$");

    // assuming there is only one schema/namespace
    const namespacePrefix = Object.keys(metaModelData).find(key => metaModelData[key].$kind === "Schema") ?? "";
    const result = {
      identification: "metamodelResult",
      version: "4.0",
      schema: {
        namespace: namespacePrefix.slice(0, -1),
        entityContainer: {
          _type: "EntityContainer",
          name: "",
          fullyQualifiedName: ""
        },
        entitySets: [],
        entityTypes: [],
        complexTypes: [],
        typeDefinitions: [],
        singletons: [],
        associations: [],
        associationSets: [],
        actions: [],
        actionImports: [],
        annotations: {
          metamodelResult: []
        }
      },
      references: []
    };
    const parseMetaModelElement = (name, value) => {
      switch (value.$kind) {
        case "EntityContainer":
          parseEntityContainer(namespacePrefix, name, value, result);
          break;
        case "Action":
        case "Function":
          const action = prepareAction(name, value, namespacePrefix);
          result.schema.actions.push(action);
          break;
        case "EntityType":
          const entityType = prepareEntityType(value, name, namespacePrefix, metaModelData);
          result.schema.entityTypes.push(entityType);
          break;
        case "ComplexType":
          const complexType = prepareComplexType(value, name, namespacePrefix);
          result.schema.complexTypes.push(complexType);
          break;
        case "TypeDefinition":
          const typeDefinition = prepareTypeDefinition(value, name, namespacePrefix);
          result.schema.typeDefinitions.push(typeDefinition);
          break;
      }
    };
    for (const elementName in metaModelData) {
      const elementValue = metaModelData[elementName];
      if (Array.isArray(elementValue)) {
        // value can be an array in case of actions or functions
        for (const subElementValue of elementValue) {
          parseMetaModelElement(elementName, subElementValue);
        }
      } else {
        parseMetaModelElement(elementName, elementValue);
      }
    }
    result.schema.annotations.metamodelResult = parseAnnotations(metaModelData.$Annotations, capabilities);
    return result;
  }
  _exports.parseMetaModel = parseMetaModel;
  const mMetaModelMap = {};

  /**
   * Convert the ODataMetaModel into another format that allow for easy manipulation of the annotations.
   *
   * @param oMetaModel The ODataMetaModel
   * @param oCapabilities The current capabilities
   * @returns An object containing object-like annotations
   */
  function convertTypes(oMetaModel, oCapabilities) {
    const sMetaModelId = oMetaModel.id;
    if (!mMetaModelMap.hasOwnProperty(sMetaModelId)) {
      const parsedOutput = parseMetaModel(oMetaModel, oCapabilities);
      try {
        mMetaModelMap[sMetaModelId] = AnnotationConverter.convert(parsedOutput);
      } catch (oError) {
        throw new Error(oError);
      }
    }
    return mMetaModelMap[sMetaModelId];
  }
  _exports.convertTypes = convertTypes;
  function getConvertedTypes(oContext) {
    const oMetaModel = oContext.getModel();
    if (!oMetaModel.isA("sap.ui.model.odata.v4.ODataMetaModel")) {
      throw new Error("This should only be called on a ODataMetaModel");
    }
    return convertTypes(oMetaModel);
  }
  _exports.getConvertedTypes = getConvertedTypes;
  function deleteModelCacheData(oMetaModel) {
    delete mMetaModelMap[oMetaModel.id];
  }
  _exports.deleteModelCacheData = deleteModelCacheData;
  function convertMetaModelContext(oMetaModelContext) {
    let bIncludeVisitedObjects = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    const oConvertedMetadata = convertTypes(oMetaModelContext.getModel());
    const sPath = oMetaModelContext.getPath();
    const aPathSplit = sPath.split("/");
    let firstPart = aPathSplit[1];
    let beginIndex = 2;
    if (oConvertedMetadata.entityContainer.fullyQualifiedName === firstPart) {
      firstPart = aPathSplit[2];
      beginIndex++;
    }
    let targetEntitySet = oConvertedMetadata.entitySets.find(entitySet => entitySet.name === firstPart);
    if (!targetEntitySet) {
      targetEntitySet = oConvertedMetadata.singletons.find(singleton => singleton.name === firstPart);
    }
    let relativePath = aPathSplit.slice(beginIndex).join("/");
    const localObjects = [targetEntitySet];
    while (relativePath && relativePath.length > 0 && relativePath.startsWith("$NavigationPropertyBinding")) {
      var _sNavPropToCheck;
      let relativeSplit = relativePath.split("/");
      let idx = 0;
      let currentEntitySet, sNavPropToCheck;
      relativeSplit = relativeSplit.slice(1); // Removing "$NavigationPropertyBinding"
      while (!currentEntitySet && relativeSplit.length > idx) {
        if (relativeSplit[idx] !== "$NavigationPropertyBinding") {
          // Finding the correct entitySet for the navigaiton property binding example: "Set/_SalesOrder"
          sNavPropToCheck = relativeSplit.slice(0, idx + 1).join("/").replace("/$NavigationPropertyBinding", "");
          currentEntitySet = targetEntitySet && targetEntitySet.navigationPropertyBinding[sNavPropToCheck];
        }
        idx++;
      }
      if (!currentEntitySet) {
        // Fall back to Single nav prop if entitySet is not found.
        sNavPropToCheck = relativeSplit[0];
      }
      const aNavProps = ((_sNavPropToCheck = sNavPropToCheck) === null || _sNavPropToCheck === void 0 ? void 0 : _sNavPropToCheck.split("/")) || [];
      let targetEntityType = targetEntitySet && targetEntitySet.entityType;
      for (const sNavProp of aNavProps) {
        // Pushing all nav props to the visited objects. example: "Set", "_SalesOrder" for "Set/_SalesOrder"(in NavigationPropertyBinding)
        const targetNavProp = targetEntityType && targetEntityType.navigationProperties.find(navProp => navProp.name === sNavProp);
        if (targetNavProp) {
          localObjects.push(targetNavProp);
          targetEntityType = targetNavProp.targetType;
        } else {
          break;
        }
      }
      targetEntitySet = targetEntitySet && currentEntitySet || targetEntitySet && targetEntitySet.navigationPropertyBinding[relativeSplit[0]];
      if (targetEntitySet) {
        // Pushing the target entitySet to visited objects
        localObjects.push(targetEntitySet);
      }
      // Re-calculating the relative path
      // As each navigation name is enclosed between '$NavigationPropertyBinding' and '$' (to be able to access the entityset easily in the metamodel)
      // we need to remove the closing '$' to be able to switch to the next navigation
      relativeSplit = relativeSplit.slice(aNavProps.length || 1);
      if (relativeSplit.length && relativeSplit[0] === "$") {
        relativeSplit.shift();
      }
      relativePath = relativeSplit.join("/");
    }
    if (relativePath.startsWith("$Type")) {
      // As $Type@ is allowed as well
      if (relativePath.startsWith("$Type@")) {
        relativePath = relativePath.replace("$Type", "");
      } else {
        // We're anyway going to look on the entityType...
        relativePath = aPathSplit.slice(3).join("/");
      }
    }
    if (targetEntitySet && relativePath.length) {
      const oTarget = targetEntitySet.entityType.resolvePath(relativePath, bIncludeVisitedObjects);
      if (oTarget) {
        if (bIncludeVisitedObjects) {
          oTarget.visitedObjects = localObjects.concat(oTarget.visitedObjects);
        }
      } else if (targetEntitySet.entityType && targetEntitySet.entityType.actions) {
        // if target is an action or an action parameter
        const actions = targetEntitySet.entityType && targetEntitySet.entityType.actions;
        const relativeSplit = relativePath.split("/");
        if (actions[relativeSplit[0]]) {
          const action = actions[relativeSplit[0]];
          if (relativeSplit[1] && action.parameters) {
            const parameterName = relativeSplit[1];
            return action.parameters.find(parameter => {
              return parameter.fullyQualifiedName.endsWith(`/${parameterName}`);
            });
          } else if (relativePath.length === 1) {
            return action;
          }
        }
      }
      return oTarget;
    } else {
      if (bIncludeVisitedObjects) {
        return {
          target: targetEntitySet,
          visitedObjects: localObjects
        };
      }
      return targetEntitySet;
    }
  }
  _exports.convertMetaModelContext = convertMetaModelContext;
  function getInvolvedDataModelObjects(oMetaModelContext, oEntitySetMetaModelContext) {
    const oConvertedMetadata = convertTypes(oMetaModelContext.getModel());
    const metaModelContext = convertMetaModelContext(oMetaModelContext, true);
    let targetEntitySetLocation;
    if (oEntitySetMetaModelContext && oEntitySetMetaModelContext.getPath() !== "/") {
      targetEntitySetLocation = getInvolvedDataModelObjects(oEntitySetMetaModelContext);
    }
    return getInvolvedDataModelObjectFromPath(metaModelContext, oConvertedMetadata, targetEntitySetLocation);
  }
  _exports.getInvolvedDataModelObjects = getInvolvedDataModelObjects;
  function getInvolvedDataModelObjectFromPath(metaModelContext, convertedTypes, targetEntitySetLocation, onlyServiceObjects) {
    var _metaModelContext$tar, _outDataModelPath$tar;
    const dataModelObjects = metaModelContext.visitedObjects.filter(visitedObject => (visitedObject === null || visitedObject === void 0 ? void 0 : visitedObject.hasOwnProperty("_type")) && visitedObject._type !== "EntityType" && visitedObject._type !== "EntityContainer");
    if ((_metaModelContext$tar = metaModelContext.target) !== null && _metaModelContext$tar !== void 0 && _metaModelContext$tar.hasOwnProperty("_type") && metaModelContext.target._type !== "EntityType" && dataModelObjects[dataModelObjects.length - 1] !== metaModelContext.target && !onlyServiceObjects) {
      dataModelObjects.push(metaModelContext.target);
    }
    const navigationProperties = [];
    const rootEntitySet = dataModelObjects[0];
    let currentEntitySet = rootEntitySet;
    let currentEntityType = rootEntitySet.entityType;
    let currentObject;
    let navigatedPath = [];
    for (let i = 1; i < dataModelObjects.length; i++) {
      currentObject = dataModelObjects[i];
      if (currentObject._type === "NavigationProperty") {
        var _currentEntitySet;
        navigatedPath.push(currentObject.name);
        navigationProperties.push(currentObject);
        currentEntityType = currentObject.targetType;
        const boundEntitySet = (_currentEntitySet = currentEntitySet) === null || _currentEntitySet === void 0 ? void 0 : _currentEntitySet.navigationPropertyBinding[navigatedPath.join("/")];
        if (boundEntitySet) {
          currentEntitySet = boundEntitySet;
          navigatedPath = [];
        }
      }
      if (currentObject._type === "EntitySet" || currentObject._type === "Singleton") {
        currentEntitySet = currentObject;
        currentEntityType = currentEntitySet.entityType;
      }
    }
    if (navigatedPath.length > 0) {
      // Path without NavigationPropertyBinding --> no target entity set
      currentEntitySet = undefined;
    }
    if (targetEntitySetLocation && targetEntitySetLocation.startingEntitySet !== rootEntitySet) {
      // In case the entityset is not starting from the same location it may mean that we are doing too much work earlier for some reason
      // As such we need to redefine the context source for the targetEntitySetLocation
      const startingIndex = dataModelObjects.indexOf(targetEntitySetLocation.startingEntitySet);
      if (startingIndex !== -1) {
        // If it's not found I don't know what we can do (probably nothing)
        const requiredDataModelObjects = dataModelObjects.slice(0, startingIndex);
        targetEntitySetLocation.startingEntitySet = rootEntitySet;
        targetEntitySetLocation.navigationProperties = requiredDataModelObjects.filter(object => object._type === "NavigationProperty").concat(targetEntitySetLocation.navigationProperties);
      }
    }
    const outDataModelPath = {
      startingEntitySet: rootEntitySet,
      targetEntitySet: currentEntitySet,
      targetEntityType: currentEntityType,
      targetObject: metaModelContext.target,
      navigationProperties,
      contextLocation: targetEntitySetLocation,
      convertedTypes: convertedTypes
    };
    if (!((_outDataModelPath$tar = outDataModelPath.targetObject) !== null && _outDataModelPath$tar !== void 0 && _outDataModelPath$tar.hasOwnProperty("_type")) && onlyServiceObjects) {
      outDataModelPath.targetObject = currentObject;
    }
    if (!outDataModelPath.contextLocation) {
      outDataModelPath.contextLocation = outDataModelPath;
    }
    return outDataModelPath;
  }
  _exports.getInvolvedDataModelObjectFromPath = getInvolvedDataModelObjectFromPath;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWT0NBQlVMQVJZX0FMSUFTIiwiRGVmYXVsdEVudmlyb25tZW50Q2FwYWJpbGl0aWVzIiwiQ2hhcnQiLCJNaWNyb0NoYXJ0IiwiVVNoZWxsIiwiSW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiQXBwU3RhdGUiLCJwYXJzZVByb3BlcnR5VmFsdWUiLCJhbm5vdGF0aW9uT2JqZWN0IiwicHJvcGVydHlLZXkiLCJjdXJyZW50VGFyZ2V0IiwiYW5ub3RhdGlvbnNMaXN0cyIsIm9DYXBhYmlsaXRpZXMiLCJ2YWx1ZSIsImN1cnJlbnRQcm9wZXJ0eVRhcmdldCIsInR5cGVPZkFubm90YXRpb24iLCJ0eXBlIiwiTnVsbCIsIlN0cmluZyIsIkJvb2wiLCJJbnQiLCJBcnJheSIsImlzQXJyYXkiLCJDb2xsZWN0aW9uIiwibWFwIiwic3ViQW5ub3RhdGlvbk9iamVjdCIsInN1YkFubm90YXRpb25PYmplY3RJbmRleCIsInBhcnNlQW5ub3RhdGlvbk9iamVjdCIsImxlbmd0aCIsImhhc093blByb3BlcnR5IiwiJFBhdGgiLCJ1bmRlZmluZWQiLCJQYXRoIiwiJERlY2ltYWwiLCJEZWNpbWFsIiwicGFyc2VGbG9hdCIsIiRQcm9wZXJ0eVBhdGgiLCJQcm9wZXJ0eVBhdGgiLCIkTmF2aWdhdGlvblByb3BlcnR5UGF0aCIsIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCIkSWYiLCJJZiIsIiRBbmQiLCJBbmQiLCIkT3IiLCJPciIsIiROb3QiLCJOb3QiLCIkRXEiLCJFcSIsIiROZSIsIk5lIiwiJEd0IiwiR3QiLCIkR2UiLCJHZSIsIiRMdCIsIkx0IiwiJExlIiwiTGUiLCIkQXBwbHkiLCJBcHBseSIsIkZ1bmN0aW9uIiwiJEZ1bmN0aW9uIiwiJEFubm90YXRpb25QYXRoIiwiQW5ub3RhdGlvblBhdGgiLCIkRW51bU1lbWJlciIsIkVudW1NZW1iZXIiLCJtYXBOYW1lVG9BbGlhcyIsInNwbGl0IiwiUmVjb3JkIiwibmFtZSIsImFubm90YXRpb25OYW1lIiwicGF0aFBhcnQiLCJhbm5vUGFydCIsImxhc3REb3QiLCJsYXN0SW5kZXhPZiIsInN1YnN0ciIsImN1cnJlbnRPYmplY3RUYXJnZXQiLCJwYXJzZWRBbm5vdGF0aW9uT2JqZWN0IiwidHlwZU9mT2JqZWN0IiwicGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24iLCJjb2xsZWN0aW9uIiwic3ViQW5ub3RhdGlvbkluZGV4IiwiJFR5cGUiLCJ0eXBlVmFsdWUiLCJwcm9wZXJ0eVZhbHVlcyIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwic3RhcnRzV2l0aCIsInB1c2giLCJjcmVhdGVBbm5vdGF0aW9uTGlzdHMiLCJnZXRPckNyZWF0ZUFubm90YXRpb25MaXN0IiwidGFyZ2V0IiwiYW5ub3RhdGlvbnMiLCJjcmVhdGVSZWZlcmVuY2VGYWNldElkIiwicmVmZXJlbmNlRmFjZXQiLCJpZCIsIklEIiwiVGFyZ2V0IiwicHJlcGFyZUlkIiwicmVtb3ZlQ2hhcnRBbm5vdGF0aW9ucyIsImZpbHRlciIsIm9SZWNvcmQiLCJpbmRleE9mIiwicmVtb3ZlSUJOQW5ub3RhdGlvbnMiLCJoYW5kbGVQcmVzZW50YXRpb25WYXJpYW50IiwiYW5ub3RhdGlvbk9iamVjdHMiLCJhbm5vdGF0aW9uVGFyZ2V0IiwiYW5ub3RhdGlvbkxpc3RzIiwib3V0QW5ub3RhdGlvbk9iamVjdCIsImFubm90YXRpb25LZXkiLCJEYXRhIiwiVmlzdWFsaXphdGlvbnMiLCJjdXJyZW50T3V0QW5ub3RhdGlvbk9iamVjdCIsImFubm90YXRpb25PZkFubm90YXRpb25TcGxpdCIsImFubm90YXRpb25RdWFsaWZpZXJTcGxpdCIsInF1YWxpZmllciIsInRlcm0iLCJjdXJyZW50QW5ub3RhdGlvblRhcmdldCIsImlzQ29sbGVjdGlvbiIsInR5cGVvZkFubm90YXRpb24iLCJyZWNvcmQiLCJwcmVwYXJlUHJvcGVydHkiLCJwcm9wZXJ0eURlZmluaXRpb24iLCJlbnRpdHlUeXBlT2JqZWN0IiwicHJvcGVydHlOYW1lIiwiX3R5cGUiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJtYXhMZW5ndGgiLCIkTWF4TGVuZ3RoIiwicHJlY2lzaW9uIiwiJFByZWNpc2lvbiIsInNjYWxlIiwiJFNjYWxlIiwibnVsbGFibGUiLCIkTnVsbGFibGUiLCJwcmVwYXJlTmF2aWdhdGlvblByb3BlcnR5IiwibmF2UHJvcGVydHlEZWZpbml0aW9uIiwibmF2UHJvcGVydHlOYW1lIiwicmVmZXJlbnRpYWxDb25zdHJhaW50IiwiJFJlZmVyZW50aWFsQ29uc3RyYWludCIsInNvdXJjZVByb3BlcnR5TmFtZSIsInNvdXJjZVR5cGVOYW1lIiwic291cmNlUHJvcGVydHkiLCJ0YXJnZXRUeXBlTmFtZSIsInRhcmdldFByb3BlcnR5IiwibmF2aWdhdGlvblByb3BlcnR5IiwicGFydG5lciIsIiRQYXJ0bmVyIiwiJGlzQ29sbGVjdGlvbiIsImNvbnRhaW5zVGFyZ2V0IiwiJENvbnRhaW5zVGFyZ2V0IiwicHJlcGFyZUVudGl0eVNldCIsImVudGl0eVNldERlZmluaXRpb24iLCJlbnRpdHlTZXROYW1lIiwiZW50aXR5Q29udGFpbmVyTmFtZSIsImVudGl0eVNldE9iamVjdCIsIm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmciLCJlbnRpdHlUeXBlTmFtZSIsInByZXBhcmVTaW5nbGV0b24iLCJzaW5nbGV0b25EZWZpbml0aW9uIiwic2luZ2xldG9uTmFtZSIsInByZXBhcmVBY3Rpb25JbXBvcnQiLCJhY3Rpb25JbXBvcnQiLCJhY3Rpb25JbXBvcnROYW1lIiwiYWN0aW9uTmFtZSIsIiRBY3Rpb24iLCJwcmVwYXJlVHlwZURlZmluaXRpb24iLCJ0eXBlRGVmaW5pdGlvbiIsInR5cGVOYW1lIiwibmFtZXNwYWNlUHJlZml4IiwidHlwZU9iamVjdCIsInN1YnN0cmluZyIsInVuZGVybHlpbmdUeXBlIiwiJFVuZGVybHlpbmdUeXBlIiwicHJlcGFyZUNvbXBsZXhUeXBlIiwiY29tcGxleFR5cGVEZWZpbml0aW9uIiwiY29tcGxleFR5cGVOYW1lIiwiY29tcGxleFR5cGVPYmplY3QiLCJwcm9wZXJ0aWVzIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJjb21wbGV4VHlwZVByb3BlcnRpZXMiLCJwcm9wZXJ0eU5hbWVPck5vdCIsIiRraW5kIiwic29ydCIsImEiLCJiIiwiY29tcGxleFR5cGVOYXZpZ2F0aW9uUHJvcGVydGllcyIsInByZXBhcmVFbnRpdHlLZXlzIiwiZW50aXR5VHlwZURlZmluaXRpb24iLCJvTWV0YU1vZGVsRGF0YSIsIiRLZXkiLCIkQmFzZVR5cGUiLCJwcmVwYXJlRW50aXR5VHlwZSIsIm1ldGFNb2RlbERhdGEiLCJlbnRpdHlUeXBlIiwiZW50aXR5UHJvcGVydGllcyIsImFjdGlvbnMiLCJrZXkiLCJwcm9wZXJ0eSIsImVudGl0eUtleSIsImZpbmQiLCIkQW5ub3RhdGlvbnMiLCJmaWx0ZXJGYWNldEFubm90YXRpb24iLCJlbnRpdHlQcm9wZXJ0eSIsIlZhbHVlIiwicHJlcGFyZUFjdGlvbiIsImFjdGlvblJhd0RhdGEiLCJhY3Rpb25FbnRpdHlUeXBlIiwiYWN0aW9uRlFOIiwiJElzQm91bmQiLCJiaW5kaW5nUGFyYW1ldGVyIiwiJFBhcmFtZXRlciIsInBhcmFtZXRlcnMiLCJpc0JvdW5kIiwiaXNGdW5jdGlvbiIsInNvdXJjZVR5cGUiLCJyZXR1cm5UeXBlIiwiJFJldHVyblR5cGUiLCJwYXJhbSIsIiROYW1lIiwicGFyc2VFbnRpdHlDb250YWluZXIiLCJlbnRpdHlDb250YWluZXJNZXRhZGF0YSIsInJlc3VsdCIsInNjaGVtYSIsImVudGl0eUNvbnRhaW5lciIsImVsZW1lbnROYW1lIiwiZWxlbWVudFZhbHVlIiwiZW50aXR5U2V0cyIsInNpbmdsZXRvbnMiLCJhY3Rpb25JbXBvcnRzIiwiZW50aXR5U2V0IiwibmF2UHJvcGVydHlCaW5kaW5ncyIsIiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nIiwibmF2UHJvcE5hbWUiLCJ0YXJnZXRFbnRpdHlTZXQiLCJwYXJzZUFubm90YXRpb25zIiwiY2FwYWJpbGl0aWVzIiwicGFyc2VNZXRhTW9kZWwiLCJtZXRhTW9kZWwiLCJnZXRPYmplY3QiLCJpZGVudGlmaWNhdGlvbiIsInZlcnNpb24iLCJuYW1lc3BhY2UiLCJzbGljZSIsImVudGl0eVR5cGVzIiwiY29tcGxleFR5cGVzIiwidHlwZURlZmluaXRpb25zIiwiYXNzb2NpYXRpb25zIiwiYXNzb2NpYXRpb25TZXRzIiwibWV0YW1vZGVsUmVzdWx0IiwicmVmZXJlbmNlcyIsInBhcnNlTWV0YU1vZGVsRWxlbWVudCIsImFjdGlvbiIsImNvbXBsZXhUeXBlIiwic3ViRWxlbWVudFZhbHVlIiwibU1ldGFNb2RlbE1hcCIsImNvbnZlcnRUeXBlcyIsIm9NZXRhTW9kZWwiLCJzTWV0YU1vZGVsSWQiLCJwYXJzZWRPdXRwdXQiLCJBbm5vdGF0aW9uQ29udmVydGVyIiwiY29udmVydCIsIm9FcnJvciIsIkVycm9yIiwiZ2V0Q29udmVydGVkVHlwZXMiLCJvQ29udGV4dCIsImdldE1vZGVsIiwiaXNBIiwiZGVsZXRlTW9kZWxDYWNoZURhdGEiLCJjb252ZXJ0TWV0YU1vZGVsQ29udGV4dCIsIm9NZXRhTW9kZWxDb250ZXh0IiwiYkluY2x1ZGVWaXNpdGVkT2JqZWN0cyIsIm9Db252ZXJ0ZWRNZXRhZGF0YSIsInNQYXRoIiwiZ2V0UGF0aCIsImFQYXRoU3BsaXQiLCJmaXJzdFBhcnQiLCJiZWdpbkluZGV4Iiwic2luZ2xldG9uIiwicmVsYXRpdmVQYXRoIiwiam9pbiIsImxvY2FsT2JqZWN0cyIsInJlbGF0aXZlU3BsaXQiLCJpZHgiLCJjdXJyZW50RW50aXR5U2V0Iiwic05hdlByb3BUb0NoZWNrIiwicmVwbGFjZSIsImFOYXZQcm9wcyIsInRhcmdldEVudGl0eVR5cGUiLCJzTmF2UHJvcCIsInRhcmdldE5hdlByb3AiLCJuYXZQcm9wIiwidGFyZ2V0VHlwZSIsInNoaWZ0Iiwib1RhcmdldCIsInJlc29sdmVQYXRoIiwidmlzaXRlZE9iamVjdHMiLCJjb25jYXQiLCJwYXJhbWV0ZXJOYW1lIiwicGFyYW1ldGVyIiwiZW5kc1dpdGgiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJvRW50aXR5U2V0TWV0YU1vZGVsQ29udGV4dCIsIm1ldGFNb2RlbENvbnRleHQiLCJ0YXJnZXRFbnRpdHlTZXRMb2NhdGlvbiIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0RnJvbVBhdGgiLCJjb252ZXJ0ZWRUeXBlcyIsIm9ubHlTZXJ2aWNlT2JqZWN0cyIsImRhdGFNb2RlbE9iamVjdHMiLCJ2aXNpdGVkT2JqZWN0Iiwicm9vdEVudGl0eVNldCIsImN1cnJlbnRFbnRpdHlUeXBlIiwiY3VycmVudE9iamVjdCIsIm5hdmlnYXRlZFBhdGgiLCJpIiwiYm91bmRFbnRpdHlTZXQiLCJzdGFydGluZ0VudGl0eVNldCIsInN0YXJ0aW5nSW5kZXgiLCJyZXF1aXJlZERhdGFNb2RlbE9iamVjdHMiLCJvYmplY3QiLCJvdXREYXRhTW9kZWxQYXRoIiwidGFyZ2V0T2JqZWN0IiwiY29udGV4dExvY2F0aW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNZXRhTW9kZWxDb252ZXJ0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhpcyBmaWxlIGlzIHJldHJpZXZlZCBmcm9tIEBzYXAtdXgvYW5ub3RhdGlvbi1jb252ZXJ0ZXIsIHNoYXJlZCBjb2RlIHdpdGggdG9vbCBzdWl0ZVxuXG5pbXBvcnQgdHlwZSB7XG5cdEFubm90YXRpb24sXG5cdEFubm90YXRpb25MaXN0LFxuXHRBbm5vdGF0aW9uUmVjb3JkLFxuXHRDb252ZXJ0ZWRNZXRhZGF0YSxcblx0RW50aXR5U2V0LFxuXHRFbnRpdHlUeXBlLFxuXHRFeHByZXNzaW9uLFxuXHROYXZpZ2F0aW9uUHJvcGVydHksXG5cdFJhd0FjdGlvbixcblx0UmF3QWN0aW9uSW1wb3J0LFxuXHRSYXdDb21wbGV4VHlwZSxcblx0UmF3RW50aXR5U2V0LFxuXHRSYXdFbnRpdHlUeXBlLFxuXHRSYXdNZXRhZGF0YSxcblx0UmF3UHJvcGVydHksXG5cdFJhd1NpbmdsZXRvbixcblx0UmF3VHlwZURlZmluaXRpb24sXG5cdFJhd1Y0TmF2aWdhdGlvblByb3BlcnR5LFxuXHRSZWZlcmVudGlhbENvbnN0cmFpbnQsXG5cdFNlcnZpY2VPYmplY3QsXG5cdFNpbmdsZXRvblxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IFVJQW5ub3RhdGlvblRlcm1zLCBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IEFubm90YXRpb25Db252ZXJ0ZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb21tb25cIjtcbmltcG9ydCB0eXBlIHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgeyBwcmVwYXJlSWQgfSBmcm9tIFwiLi4vaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuXG5jb25zdCBWT0NBQlVMQVJZX0FMSUFTOiBhbnkgPSB7XG5cdFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMVwiOiBcIkNhcGFiaWxpdGllc1wiLFxuXHRcIk9yZy5PRGF0YS5Db3JlLlYxXCI6IFwiQ29yZVwiLFxuXHRcIk9yZy5PRGF0YS5NZWFzdXJlcy5WMVwiOiBcIk1lYXN1cmVzXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxXCI6IFwiQ29tbW9uXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjFcIjogXCJVSVwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlNlc3Npb24udjFcIjogXCJTZXNzaW9uXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxXCI6IFwiQW5hbHl0aWNzXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuUGVyc29uYWxEYXRhLnYxXCI6IFwiUGVyc29uYWxEYXRhXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MVwiOiBcIkNvbW11bmljYXRpb25cIlxufTtcblxuZXhwb3J0IHR5cGUgRW52aXJvbm1lbnRDYXBhYmlsaXRpZXMgPSB7XG5cdENoYXJ0OiBib29sZWFuO1xuXHRNaWNyb0NoYXJ0OiBib29sZWFuO1xuXHRVU2hlbGw6IGJvb2xlYW47XG5cdEludGVudEJhc2VkTmF2aWdhdGlvbjogYm9vbGVhbjtcblx0QXBwU3RhdGU6IGJvb2xlYW47XG59O1xuXG5leHBvcnQgY29uc3QgRGVmYXVsdEVudmlyb25tZW50Q2FwYWJpbGl0aWVzID0ge1xuXHRDaGFydDogdHJ1ZSxcblx0TWljcm9DaGFydDogdHJ1ZSxcblx0VVNoZWxsOiB0cnVlLFxuXHRJbnRlbnRCYXNlZE5hdmlnYXRpb246IHRydWUsXG5cdEFwcFN0YXRlOiB0cnVlXG59O1xuXG50eXBlIE1ldGFNb2RlbEFjdGlvbiA9IHtcblx0JGtpbmQ6IFwiQWN0aW9uXCIgfCBcIkZ1bmN0aW9uXCI7XG5cdCRJc0JvdW5kOiBib29sZWFuO1xuXHQkRW50aXR5U2V0UGF0aDogc3RyaW5nO1xuXHQkUGFyYW1ldGVyOiB7XG5cdFx0JFR5cGU6IHN0cmluZztcblx0XHQkTmFtZTogc3RyaW5nO1xuXHRcdCROdWxsYWJsZT86IGJvb2xlYW47XG5cdFx0JE1heExlbmd0aD86IG51bWJlcjtcblx0XHQkUHJlY2lzaW9uPzogbnVtYmVyO1xuXHRcdCRTY2FsZT86IG51bWJlcjtcblx0XHQkaXNDb2xsZWN0aW9uPzogYm9vbGVhbjtcblx0fVtdO1xuXHQkUmV0dXJuVHlwZToge1xuXHRcdCRUeXBlOiBzdHJpbmc7XG5cdH07XG59O1xuXG5mdW5jdGlvbiBwYXJzZVByb3BlcnR5VmFsdWUoXG5cdGFubm90YXRpb25PYmplY3Q6IGFueSxcblx0cHJvcGVydHlLZXk6IHN0cmluZyxcblx0Y3VycmVudFRhcmdldDogc3RyaW5nLFxuXHRhbm5vdGF0aW9uc0xpc3RzOiBSZWNvcmQ8c3RyaW5nLCBBbm5vdGF0aW9uTGlzdD4sXG5cdG9DYXBhYmlsaXRpZXM6IEVudmlyb25tZW50Q2FwYWJpbGl0aWVzXG4pOiBhbnkge1xuXHRsZXQgdmFsdWU7XG5cdGNvbnN0IGN1cnJlbnRQcm9wZXJ0eVRhcmdldDogc3RyaW5nID0gYCR7Y3VycmVudFRhcmdldH0vJHtwcm9wZXJ0eUtleX1gO1xuXHRjb25zdCB0eXBlT2ZBbm5vdGF0aW9uID0gdHlwZW9mIGFubm90YXRpb25PYmplY3Q7XG5cdGlmIChhbm5vdGF0aW9uT2JqZWN0ID09PSBudWxsKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiTnVsbFwiLCBOdWxsOiBudWxsIH07XG5cdH0gZWxzZSBpZiAodHlwZU9mQW5ub3RhdGlvbiA9PT0gXCJzdHJpbmdcIikge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIlN0cmluZ1wiLCBTdHJpbmc6IGFubm90YXRpb25PYmplY3QgfTtcblx0fSBlbHNlIGlmICh0eXBlT2ZBbm5vdGF0aW9uID09PSBcImJvb2xlYW5cIikge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIkJvb2xcIiwgQm9vbDogYW5ub3RhdGlvbk9iamVjdCB9O1xuXHR9IGVsc2UgaWYgKHR5cGVPZkFubm90YXRpb24gPT09IFwibnVtYmVyXCIpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJJbnRcIiwgSW50OiBhbm5vdGF0aW9uT2JqZWN0IH07XG5cdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShhbm5vdGF0aW9uT2JqZWN0KSkge1xuXHRcdHZhbHVlID0ge1xuXHRcdFx0dHlwZTogXCJDb2xsZWN0aW9uXCIsXG5cdFx0XHRDb2xsZWN0aW9uOiBhbm5vdGF0aW9uT2JqZWN0Lm1hcCgoc3ViQW5ub3RhdGlvbk9iamVjdCwgc3ViQW5ub3RhdGlvbk9iamVjdEluZGV4KSA9PlxuXHRcdFx0XHRwYXJzZUFubm90YXRpb25PYmplY3QoXG5cdFx0XHRcdFx0c3ViQW5ub3RhdGlvbk9iamVjdCxcblx0XHRcdFx0XHRgJHtjdXJyZW50UHJvcGVydHlUYXJnZXR9LyR7c3ViQW5ub3RhdGlvbk9iamVjdEluZGV4fWAsXG5cdFx0XHRcdFx0YW5ub3RhdGlvbnNMaXN0cyxcblx0XHRcdFx0XHRvQ2FwYWJpbGl0aWVzXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHR9O1xuXHRcdGlmIChhbm5vdGF0aW9uT2JqZWN0Lmxlbmd0aCA+IDApIHtcblx0XHRcdGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJFByb3BlcnR5UGF0aFwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIlByb3BlcnR5UGF0aFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJFBhdGhcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJQYXRoXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRBbm5vdGF0aW9uUGF0aFwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIkFubm90YXRpb25QYXRoXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkVHlwZVwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIlJlY29yZFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJElmXCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiSWZcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRPclwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIk9yXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkQW5kXCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiQW5kXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkRXFcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJFcVwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJE5lXCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiTmVcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiROb3RcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJOb3RcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRHdFwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIkd0XCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkR2VcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJHZVwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEx0XCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiTHRcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRMZVwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIkxlXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkQXBwbHlcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJBcHBseVwiO1xuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgYW5ub3RhdGlvbk9iamVjdFswXSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHQvLyAkVHlwZSBpcyBvcHRpb25hbC4uLlxuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIlJlY29yZFwiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJTdHJpbmdcIjtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiUGF0aFwiLCBQYXRoOiBhbm5vdGF0aW9uT2JqZWN0LiRQYXRoIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kRGVjaW1hbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiRGVjaW1hbFwiLCBEZWNpbWFsOiBwYXJzZUZsb2F0KGFubm90YXRpb25PYmplY3QuJERlY2ltYWwpIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kUHJvcGVydHlQYXRoICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJQcm9wZXJ0eVBhdGhcIiwgUHJvcGVydHlQYXRoOiBhbm5vdGF0aW9uT2JqZWN0LiRQcm9wZXJ0eVBhdGggfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHtcblx0XHRcdHR5cGU6IFwiTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiLFxuXHRcdFx0TmF2aWdhdGlvblByb3BlcnR5UGF0aDogYW5ub3RhdGlvbk9iamVjdC4kTmF2aWdhdGlvblByb3BlcnR5UGF0aFxuXHRcdH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kSWYgIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIklmXCIsIElmOiBhbm5vdGF0aW9uT2JqZWN0LiRJZiB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEFuZCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiQW5kXCIsIEFuZDogYW5ub3RhdGlvbk9iamVjdC4kQW5kIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kT3IgIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIk9yXCIsIE9yOiBhbm5vdGF0aW9uT2JqZWN0LiRPciB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJE5vdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiTm90XCIsIE5vdDogYW5ub3RhdGlvbk9iamVjdC4kTm90IH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kRXEgIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIkVxXCIsIEVxOiBhbm5vdGF0aW9uT2JqZWN0LiRFcSB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJE5lICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJOZVwiLCBOZTogYW5ub3RhdGlvbk9iamVjdC4kTmUgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRHdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiR3RcIiwgR3Q6IGFubm90YXRpb25PYmplY3QuJEd0IH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kR2UgIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIkdlXCIsIEdlOiBhbm5vdGF0aW9uT2JqZWN0LiRHZSB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEx0ICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJMdFwiLCBMdDogYW5ub3RhdGlvbk9iamVjdC4kTHQgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRMZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiTGVcIiwgTGU6IGFubm90YXRpb25PYmplY3QuJExlIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kQXBwbHkgIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIkFwcGx5XCIsIEFwcGx5OiBhbm5vdGF0aW9uT2JqZWN0LiRBcHBseSwgRnVuY3Rpb246IGFubm90YXRpb25PYmplY3QuJEZ1bmN0aW9uIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kQW5ub3RhdGlvblBhdGggIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIkFubm90YXRpb25QYXRoXCIsIEFubm90YXRpb25QYXRoOiBhbm5vdGF0aW9uT2JqZWN0LiRBbm5vdGF0aW9uUGF0aCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEVudW1NZW1iZXIgIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0ge1xuXHRcdFx0dHlwZTogXCJFbnVtTWVtYmVyXCIsXG5cdFx0XHRFbnVtTWVtYmVyOiBgJHttYXBOYW1lVG9BbGlhcyhhbm5vdGF0aW9uT2JqZWN0LiRFbnVtTWVtYmVyLnNwbGl0KFwiL1wiKVswXSl9LyR7YW5ub3RhdGlvbk9iamVjdC4kRW51bU1lbWJlci5zcGxpdChcIi9cIilbMV19YFxuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0dmFsdWUgPSB7XG5cdFx0XHR0eXBlOiBcIlJlY29yZFwiLFxuXHRcdFx0UmVjb3JkOiBwYXJzZUFubm90YXRpb25PYmplY3QoYW5ub3RhdGlvbk9iamVjdCwgY3VycmVudFRhcmdldCwgYW5ub3RhdGlvbnNMaXN0cywgb0NhcGFiaWxpdGllcylcblx0XHR9O1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRuYW1lOiBwcm9wZXJ0eUtleSxcblx0XHR2YWx1ZVxuXHR9O1xufVxuZnVuY3Rpb24gbWFwTmFtZVRvQWxpYXMoYW5ub3RhdGlvbk5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG5cdGxldCBbcGF0aFBhcnQsIGFubm9QYXJ0XSA9IGFubm90YXRpb25OYW1lLnNwbGl0KFwiQFwiKTtcblx0aWYgKCFhbm5vUGFydCkge1xuXHRcdGFubm9QYXJ0ID0gcGF0aFBhcnQ7XG5cdFx0cGF0aFBhcnQgPSBcIlwiO1xuXHR9IGVsc2Uge1xuXHRcdHBhdGhQYXJ0ICs9IFwiQFwiO1xuXHR9XG5cdGNvbnN0IGxhc3REb3QgPSBhbm5vUGFydC5sYXN0SW5kZXhPZihcIi5cIik7XG5cdHJldHVybiBgJHtwYXRoUGFydCArIFZPQ0FCVUxBUllfQUxJQVNbYW5ub1BhcnQuc3Vic3RyKDAsIGxhc3REb3QpXX0uJHthbm5vUGFydC5zdWJzdHIobGFzdERvdCArIDEpfWA7XG59XG5mdW5jdGlvbiBwYXJzZUFubm90YXRpb25PYmplY3QoXG5cdGFubm90YXRpb25PYmplY3Q6IGFueSxcblx0Y3VycmVudE9iamVjdFRhcmdldDogc3RyaW5nLFxuXHRhbm5vdGF0aW9uc0xpc3RzOiBSZWNvcmQ8c3RyaW5nLCBBbm5vdGF0aW9uTGlzdD4sXG5cdG9DYXBhYmlsaXRpZXM6IEVudmlyb25tZW50Q2FwYWJpbGl0aWVzXG4pOiBFeHByZXNzaW9uIHwgQW5ub3RhdGlvblJlY29yZCB8IEFubm90YXRpb24ge1xuXHRsZXQgcGFyc2VkQW5ub3RhdGlvbk9iamVjdDogYW55ID0ge307XG5cdGNvbnN0IHR5cGVPZk9iamVjdCA9IHR5cGVvZiBhbm5vdGF0aW9uT2JqZWN0O1xuXHRpZiAoYW5ub3RhdGlvbk9iamVjdCA9PT0gbnVsbCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiTnVsbFwiLCBOdWxsOiBudWxsIH07XG5cdH0gZWxzZSBpZiAodHlwZU9mT2JqZWN0ID09PSBcInN0cmluZ1wiKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJTdHJpbmdcIiwgU3RyaW5nOiBhbm5vdGF0aW9uT2JqZWN0IH07XG5cdH0gZWxzZSBpZiAodHlwZU9mT2JqZWN0ID09PSBcImJvb2xlYW5cIikge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiQm9vbFwiLCBCb29sOiBhbm5vdGF0aW9uT2JqZWN0IH07XG5cdH0gZWxzZSBpZiAodHlwZU9mT2JqZWN0ID09PSBcIm51bWJlclwiKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJJbnRcIiwgSW50OiBhbm5vdGF0aW9uT2JqZWN0IH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kQW5ub3RhdGlvblBhdGggIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiQW5ub3RhdGlvblBhdGhcIiwgQW5ub3RhdGlvblBhdGg6IGFubm90YXRpb25PYmplY3QuJEFubm90YXRpb25QYXRoIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJQYXRoXCIsIFBhdGg6IGFubm90YXRpb25PYmplY3QuJFBhdGggfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiREZWNpbWFsICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIkRlY2ltYWxcIiwgRGVjaW1hbDogcGFyc2VGbG9hdChhbm5vdGF0aW9uT2JqZWN0LiREZWNpbWFsKSB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJFByb3BlcnR5UGF0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJQcm9wZXJ0eVBhdGhcIiwgUHJvcGVydHlQYXRoOiBhbm5vdGF0aW9uT2JqZWN0LiRQcm9wZXJ0eVBhdGggfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRJZiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJJZlwiLCBJZjogYW5ub3RhdGlvbk9iamVjdC4kSWYgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRBbmQgIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiQW5kXCIsIEFuZDogYW5ub3RhdGlvbk9iamVjdC4kQW5kIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kT3IgIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiT3JcIiwgT3I6IGFubm90YXRpb25PYmplY3QuJE9yIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTm90ICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIk5vdFwiLCBOb3Q6IGFubm90YXRpb25PYmplY3QuJE5vdCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEVxICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIkVxXCIsIEVxOiBhbm5vdGF0aW9uT2JqZWN0LiRFcSB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJE5lICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIk5lXCIsIE5lOiBhbm5vdGF0aW9uT2JqZWN0LiROZSB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEd0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIkd0XCIsIEd0OiBhbm5vdGF0aW9uT2JqZWN0LiRHdCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEdlICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIkdlXCIsIEdlOiBhbm5vdGF0aW9uT2JqZWN0LiRHZSB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEx0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIkx0XCIsIEx0OiBhbm5vdGF0aW9uT2JqZWN0LiRMdCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJExlICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIkxlXCIsIExlOiBhbm5vdGF0aW9uT2JqZWN0LiRMZSB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEFwcGx5ICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIkFwcGx5XCIsIEFwcGx5OiBhbm5vdGF0aW9uT2JqZWN0LiRBcHBseSwgRnVuY3Rpb246IGFubm90YXRpb25PYmplY3QuJEZ1bmN0aW9uIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTmF2aWdhdGlvblByb3BlcnR5UGF0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHtcblx0XHRcdHR5cGU6IFwiTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiLFxuXHRcdFx0TmF2aWdhdGlvblByb3BlcnR5UGF0aDogYW5ub3RhdGlvbk9iamVjdC4kTmF2aWdhdGlvblByb3BlcnR5UGF0aFxuXHRcdH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kRW51bU1lbWJlciAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHtcblx0XHRcdHR5cGU6IFwiRW51bU1lbWJlclwiLFxuXHRcdFx0RW51bU1lbWJlcjogYCR7bWFwTmFtZVRvQWxpYXMoYW5ub3RhdGlvbk9iamVjdC4kRW51bU1lbWJlci5zcGxpdChcIi9cIilbMF0pfS8ke2Fubm90YXRpb25PYmplY3QuJEVudW1NZW1iZXIuc3BsaXQoXCIvXCIpWzFdfWBcblx0XHR9O1xuXHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoYW5ub3RhdGlvbk9iamVjdCkpIHtcblx0XHRjb25zdCBwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbiA9IHBhcnNlZEFubm90YXRpb25PYmplY3Q7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbiA9IGFubm90YXRpb25PYmplY3QubWFwKChzdWJBbm5vdGF0aW9uT2JqZWN0LCBzdWJBbm5vdGF0aW9uSW5kZXgpID0+XG5cdFx0XHRwYXJzZUFubm90YXRpb25PYmplY3Qoc3ViQW5ub3RhdGlvbk9iamVjdCwgYCR7Y3VycmVudE9iamVjdFRhcmdldH0vJHtzdWJBbm5vdGF0aW9uSW5kZXh9YCwgYW5ub3RhdGlvbnNMaXN0cywgb0NhcGFiaWxpdGllcylcblx0XHQpO1xuXHRcdGlmIChhbm5vdGF0aW9uT2JqZWN0Lmxlbmd0aCA+IDApIHtcblx0XHRcdGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJFByb3BlcnR5UGF0aFwiKSkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIlByb3BlcnR5UGF0aFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJFBhdGhcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJQYXRoXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiKSkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRBbm5vdGF0aW9uUGF0aFwiKSkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIkFubm90YXRpb25QYXRoXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkVHlwZVwiKSkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIlJlY29yZFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJElmXCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiSWZcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRBbmRcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJBbmRcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRPclwiKSkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIk9yXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkRXFcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJFcVwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJE5lXCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiTmVcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiROb3RcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJOb3RcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRHdFwiKSkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIkd0XCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkR2VcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJHZVwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEx0XCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiTHRcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRMZVwiKSkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIkxlXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkQXBwbHlcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJBcHBseVwiO1xuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgYW5ub3RhdGlvbk9iamVjdFswXSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIlJlY29yZFwiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJTdHJpbmdcIjtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0aWYgKGFubm90YXRpb25PYmplY3QuJFR5cGUpIHtcblx0XHRcdGNvbnN0IHR5cGVWYWx1ZSA9IGFubm90YXRpb25PYmplY3QuJFR5cGU7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnR5cGUgPSB0eXBlVmFsdWU7IC8vYCR7dHlwZUFsaWFzfS4ke3R5cGVUZXJtfWA7XG5cdFx0fVxuXHRcdGNvbnN0IHByb3BlcnR5VmFsdWVzOiBhbnkgPSBbXTtcblx0XHRPYmplY3Qua2V5cyhhbm5vdGF0aW9uT2JqZWN0KS5mb3JFYWNoKChwcm9wZXJ0eUtleSkgPT4ge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRwcm9wZXJ0eUtleSAhPT0gXCIkVHlwZVwiICYmXG5cdFx0XHRcdHByb3BlcnR5S2V5ICE9PSBcIiRJZlwiICYmXG5cdFx0XHRcdHByb3BlcnR5S2V5ICE9PSBcIiRBcHBseVwiICYmXG5cdFx0XHRcdHByb3BlcnR5S2V5ICE9PSBcIiRBbmRcIiAmJlxuXHRcdFx0XHRwcm9wZXJ0eUtleSAhPT0gXCIkT3JcIiAmJlxuXHRcdFx0XHRwcm9wZXJ0eUtleSAhPT0gXCIkTmVcIiAmJlxuXHRcdFx0XHRwcm9wZXJ0eUtleSAhPT0gXCIkR3RcIiAmJlxuXHRcdFx0XHRwcm9wZXJ0eUtleSAhPT0gXCIkR2VcIiAmJlxuXHRcdFx0XHRwcm9wZXJ0eUtleSAhPT0gXCIkTHRcIiAmJlxuXHRcdFx0XHRwcm9wZXJ0eUtleSAhPT0gXCIkTGVcIiAmJlxuXHRcdFx0XHRwcm9wZXJ0eUtleSAhPT0gXCIkTm90XCIgJiZcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJEVxXCIgJiZcblx0XHRcdFx0IXByb3BlcnR5S2V5LnN0YXJ0c1dpdGgoXCJAXCIpXG5cdFx0XHQpIHtcblx0XHRcdFx0cHJvcGVydHlWYWx1ZXMucHVzaChcblx0XHRcdFx0XHRwYXJzZVByb3BlcnR5VmFsdWUoYW5ub3RhdGlvbk9iamVjdFtwcm9wZXJ0eUtleV0sIHByb3BlcnR5S2V5LCBjdXJyZW50T2JqZWN0VGFyZ2V0LCBhbm5vdGF0aW9uc0xpc3RzLCBvQ2FwYWJpbGl0aWVzKVxuXHRcdFx0XHQpO1xuXHRcdFx0fSBlbHNlIGlmIChwcm9wZXJ0eUtleS5zdGFydHNXaXRoKFwiQFwiKSkge1xuXHRcdFx0XHQvLyBBbm5vdGF0aW9uIG9mIGFubm90YXRpb25cblx0XHRcdFx0Y3JlYXRlQW5ub3RhdGlvbkxpc3RzKFxuXHRcdFx0XHRcdHsgW3Byb3BlcnR5S2V5XTogYW5ub3RhdGlvbk9iamVjdFtwcm9wZXJ0eUtleV0gfSxcblx0XHRcdFx0XHRjdXJyZW50T2JqZWN0VGFyZ2V0LFxuXHRcdFx0XHRcdGFubm90YXRpb25zTGlzdHMsXG5cdFx0XHRcdFx0b0NhcGFiaWxpdGllc1xuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QucHJvcGVydHlWYWx1ZXMgPSBwcm9wZXJ0eVZhbHVlcztcblx0fVxuXHRyZXR1cm4gcGFyc2VkQW5ub3RhdGlvbk9iamVjdDtcbn1cbmZ1bmN0aW9uIGdldE9yQ3JlYXRlQW5ub3RhdGlvbkxpc3QodGFyZ2V0OiBzdHJpbmcsIGFubm90YXRpb25zTGlzdHM6IFJlY29yZDxzdHJpbmcsIEFubm90YXRpb25MaXN0Pik6IEFubm90YXRpb25MaXN0IHtcblx0aWYgKCFhbm5vdGF0aW9uc0xpc3RzLmhhc093blByb3BlcnR5KHRhcmdldCkpIHtcblx0XHRhbm5vdGF0aW9uc0xpc3RzW3RhcmdldF0gPSB7XG5cdFx0XHR0YXJnZXQ6IHRhcmdldCxcblx0XHRcdGFubm90YXRpb25zOiBbXVxuXHRcdH07XG5cdH1cblx0cmV0dXJuIGFubm90YXRpb25zTGlzdHNbdGFyZ2V0XTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUmVmZXJlbmNlRmFjZXRJZChyZWZlcmVuY2VGYWNldDogYW55KSB7XG5cdGNvbnN0IGlkID0gcmVmZXJlbmNlRmFjZXQuSUQgPz8gcmVmZXJlbmNlRmFjZXQuVGFyZ2V0LiRBbm5vdGF0aW9uUGF0aDtcblx0cmV0dXJuIGlkID8gcHJlcGFyZUlkKGlkKSA6IGlkO1xufVxuXG5mdW5jdGlvbiByZW1vdmVDaGFydEFubm90YXRpb25zKGFubm90YXRpb25PYmplY3Q6IGFueSkge1xuXHRyZXR1cm4gYW5ub3RhdGlvbk9iamVjdC5maWx0ZXIoKG9SZWNvcmQ6IGFueSkgPT4ge1xuXHRcdGlmIChvUmVjb3JkLlRhcmdldCAmJiBvUmVjb3JkLlRhcmdldC4kQW5ub3RhdGlvblBhdGgpIHtcblx0XHRcdHJldHVybiBvUmVjb3JkLlRhcmdldC4kQW5ub3RhdGlvblBhdGguaW5kZXhPZihgQCR7VUlBbm5vdGF0aW9uVGVybXMuQ2hhcnR9YCkgPT09IC0xO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiByZW1vdmVJQk5Bbm5vdGF0aW9ucyhhbm5vdGF0aW9uT2JqZWN0OiBhbnkpIHtcblx0cmV0dXJuIGFubm90YXRpb25PYmplY3QuZmlsdGVyKChvUmVjb3JkOiBhbnkpID0+IHtcblx0XHRyZXR1cm4gb1JlY29yZC4kVHlwZSAhPT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlUHJlc2VudGF0aW9uVmFyaWFudChhbm5vdGF0aW9uT2JqZWN0OiBhbnkpIHtcblx0cmV0dXJuIGFubm90YXRpb25PYmplY3QuZmlsdGVyKChvUmVjb3JkOiBhbnkpID0+IHtcblx0XHRyZXR1cm4gb1JlY29yZC4kQW5ub3RhdGlvblBhdGggIT09IGBAJHtVSUFubm90YXRpb25UZXJtcy5DaGFydH1gO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQW5ub3RhdGlvbkxpc3RzKFxuXHRhbm5vdGF0aW9uT2JqZWN0czogYW55LFxuXHRhbm5vdGF0aW9uVGFyZ2V0OiBzdHJpbmcsXG5cdGFubm90YXRpb25MaXN0czogUmVjb3JkPHN0cmluZywgQW5ub3RhdGlvbkxpc3Q+LFxuXHRvQ2FwYWJpbGl0aWVzOiBFbnZpcm9ubWVudENhcGFiaWxpdGllc1xuKSB7XG5cdGlmIChPYmplY3Qua2V5cyhhbm5vdGF0aW9uT2JqZWN0cykubGVuZ3RoID09PSAwKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGNvbnN0IG91dEFubm90YXRpb25PYmplY3QgPSBnZXRPckNyZWF0ZUFubm90YXRpb25MaXN0KGFubm90YXRpb25UYXJnZXQsIGFubm90YXRpb25MaXN0cyk7XG5cdGlmICghb0NhcGFiaWxpdGllcy5NaWNyb0NoYXJ0KSB7XG5cdFx0ZGVsZXRlIGFubm90YXRpb25PYmplY3RzW2BAJHtVSUFubm90YXRpb25UZXJtcy5DaGFydH1gXTtcblx0fVxuXG5cdGZvciAobGV0IGFubm90YXRpb25LZXkgaW4gYW5ub3RhdGlvbk9iamVjdHMpIHtcblx0XHRsZXQgYW5ub3RhdGlvbk9iamVjdCA9IGFubm90YXRpb25PYmplY3RzW2Fubm90YXRpb25LZXldO1xuXHRcdHN3aXRjaCAoYW5ub3RhdGlvbktleSkge1xuXHRcdFx0Y2FzZSBgQCR7VUlBbm5vdGF0aW9uVGVybXMuSGVhZGVyRmFjZXRzfWA6XG5cdFx0XHRcdGlmICghb0NhcGFiaWxpdGllcy5NaWNyb0NoYXJ0KSB7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdCA9IHJlbW92ZUNoYXJ0QW5ub3RhdGlvbnMoYW5ub3RhdGlvbk9iamVjdCk7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdHNbYW5ub3RhdGlvbktleV0gPSBhbm5vdGF0aW9uT2JqZWN0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBgQCR7VUlBbm5vdGF0aW9uVGVybXMuSWRlbnRpZmljYXRpb259YDpcblx0XHRcdFx0aWYgKCFvQ2FwYWJpbGl0aWVzLkludGVudEJhc2VkTmF2aWdhdGlvbikge1xuXHRcdFx0XHRcdGFubm90YXRpb25PYmplY3QgPSByZW1vdmVJQk5Bbm5vdGF0aW9ucyhhbm5vdGF0aW9uT2JqZWN0KTtcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0c1thbm5vdGF0aW9uS2V5XSA9IGFubm90YXRpb25PYmplY3Q7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIGBAJHtVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbX1gOlxuXHRcdFx0XHRpZiAoIW9DYXBhYmlsaXRpZXMuSW50ZW50QmFzZWROYXZpZ2F0aW9uKSB7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdCA9IHJlbW92ZUlCTkFubm90YXRpb25zKGFubm90YXRpb25PYmplY3QpO1xuXHRcdFx0XHRcdGFubm90YXRpb25PYmplY3RzW2Fubm90YXRpb25LZXldID0gYW5ub3RhdGlvbk9iamVjdDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIW9DYXBhYmlsaXRpZXMuTWljcm9DaGFydCkge1xuXHRcdFx0XHRcdGFubm90YXRpb25PYmplY3QgPSByZW1vdmVDaGFydEFubm90YXRpb25zKGFubm90YXRpb25PYmplY3QpO1xuXHRcdFx0XHRcdGFubm90YXRpb25PYmplY3RzW2Fubm90YXRpb25LZXldID0gYW5ub3RhdGlvbk9iamVjdDtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgYEAke1VJQW5ub3RhdGlvblRlcm1zLkZpZWxkR3JvdXB9YDpcblx0XHRcdFx0aWYgKCFvQ2FwYWJpbGl0aWVzLkludGVudEJhc2VkTmF2aWdhdGlvbikge1xuXHRcdFx0XHRcdGFubm90YXRpb25PYmplY3QuRGF0YSA9IHJlbW92ZUlCTkFubm90YXRpb25zKGFubm90YXRpb25PYmplY3QuRGF0YSk7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdHNbYW5ub3RhdGlvbktleV0gPSBhbm5vdGF0aW9uT2JqZWN0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICghb0NhcGFiaWxpdGllcy5NaWNyb0NoYXJ0KSB7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdC5EYXRhID0gcmVtb3ZlQ2hhcnRBbm5vdGF0aW9ucyhhbm5vdGF0aW9uT2JqZWN0LkRhdGEpO1xuXHRcdFx0XHRcdGFubm90YXRpb25PYmplY3RzW2Fubm90YXRpb25LZXldID0gYW5ub3RhdGlvbk9iamVjdDtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgYEAke1VJQW5ub3RhdGlvblRlcm1zLlByZXNlbnRhdGlvblZhcmlhbnR9YDpcblx0XHRcdFx0aWYgKCFvQ2FwYWJpbGl0aWVzLkNoYXJ0ICYmIGFubm90YXRpb25PYmplY3QuVmlzdWFsaXphdGlvbnMpIHtcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0LlZpc3VhbGl6YXRpb25zID0gaGFuZGxlUHJlc2VudGF0aW9uVmFyaWFudChhbm5vdGF0aW9uT2JqZWN0LlZpc3VhbGl6YXRpb25zKTtcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0c1thbm5vdGF0aW9uS2V5XSA9IGFubm90YXRpb25PYmplY3Q7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRsZXQgY3VycmVudE91dEFubm90YXRpb25PYmplY3QgPSBvdXRBbm5vdGF0aW9uT2JqZWN0O1xuXG5cdFx0Ly8gQ2hlY2sgZm9yIGFubm90YXRpb24gb2YgYW5ub3RhdGlvblxuXHRcdGNvbnN0IGFubm90YXRpb25PZkFubm90YXRpb25TcGxpdCA9IGFubm90YXRpb25LZXkuc3BsaXQoXCJAXCIpO1xuXHRcdGlmIChhbm5vdGF0aW9uT2ZBbm5vdGF0aW9uU3BsaXQubGVuZ3RoID4gMikge1xuXHRcdFx0Y3VycmVudE91dEFubm90YXRpb25PYmplY3QgPSBnZXRPckNyZWF0ZUFubm90YXRpb25MaXN0KFxuXHRcdFx0XHRgJHthbm5vdGF0aW9uVGFyZ2V0fUAke2Fubm90YXRpb25PZkFubm90YXRpb25TcGxpdFsxXX1gLFxuXHRcdFx0XHRhbm5vdGF0aW9uTGlzdHNcblx0XHRcdCk7XG5cdFx0XHRhbm5vdGF0aW9uS2V5ID0gYW5ub3RhdGlvbk9mQW5ub3RhdGlvblNwbGl0WzJdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhbm5vdGF0aW9uS2V5ID0gYW5ub3RhdGlvbk9mQW5ub3RhdGlvblNwbGl0WzFdO1xuXHRcdH1cblxuXHRcdGNvbnN0IGFubm90YXRpb25RdWFsaWZpZXJTcGxpdCA9IGFubm90YXRpb25LZXkuc3BsaXQoXCIjXCIpO1xuXHRcdGNvbnN0IHF1YWxpZmllciA9IGFubm90YXRpb25RdWFsaWZpZXJTcGxpdFsxXTtcblx0XHRhbm5vdGF0aW9uS2V5ID0gYW5ub3RhdGlvblF1YWxpZmllclNwbGl0WzBdO1xuXG5cdFx0Y29uc3QgcGFyc2VkQW5ub3RhdGlvbk9iamVjdDogYW55ID0ge1xuXHRcdFx0dGVybTogYCR7YW5ub3RhdGlvbktleX1gLFxuXHRcdFx0cXVhbGlmaWVyOiBxdWFsaWZpZXJcblx0XHR9O1xuXHRcdGxldCBjdXJyZW50QW5ub3RhdGlvblRhcmdldCA9IGAke2Fubm90YXRpb25UYXJnZXR9QCR7cGFyc2VkQW5ub3RhdGlvbk9iamVjdC50ZXJtfWA7XG5cdFx0aWYgKHF1YWxpZmllcikge1xuXHRcdFx0Y3VycmVudEFubm90YXRpb25UYXJnZXQgKz0gYCMke3F1YWxpZmllcn1gO1xuXHRcdH1cblx0XHRsZXQgaXNDb2xsZWN0aW9uID0gZmFsc2U7XG5cdFx0Y29uc3QgdHlwZW9mQW5ub3RhdGlvbiA9IHR5cGVvZiBhbm5vdGF0aW9uT2JqZWN0O1xuXHRcdGlmIChhbm5vdGF0aW9uT2JqZWN0ID09PSBudWxsKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIkJvb2xcIiwgQm9vbDogYW5ub3RhdGlvbk9iamVjdCB9O1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mQW5ub3RhdGlvbiA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJTdHJpbmdcIiwgU3RyaW5nOiBhbm5vdGF0aW9uT2JqZWN0IH07XG5cdFx0fSBlbHNlIGlmICh0eXBlb2ZBbm5vdGF0aW9uID09PSBcImJvb2xlYW5cIikge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJCb29sXCIsIEJvb2w6IGFubm90YXRpb25PYmplY3QgfTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZkFubm90YXRpb24gPT09IFwibnVtYmVyXCIpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiSW50XCIsIEludDogYW5ub3RhdGlvbk9iamVjdCB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kSWYgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJJZlwiLCBJZjogYW5ub3RhdGlvbk9iamVjdC4kSWYgfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEFuZCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIkFuZFwiLCBBbmQ6IGFubm90YXRpb25PYmplY3QuJEFuZCB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kT3IgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJPclwiLCBPcjogYW5ub3RhdGlvbk9iamVjdC4kT3IgfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJE5vdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIk5vdFwiLCBOb3Q6IGFubm90YXRpb25PYmplY3QuJE5vdCB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kRXEgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJFcVwiLCBFcTogYW5ub3RhdGlvbk9iamVjdC4kRXEgfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJE5lICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiTmVcIiwgTmU6IGFubm90YXRpb25PYmplY3QuJE5lIH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRHdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIkd0XCIsIEd0OiBhbm5vdGF0aW9uT2JqZWN0LiRHdCB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kR2UgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJHZVwiLCBHZTogYW5ub3RhdGlvbk9iamVjdC4kR2UgfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEx0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiTHRcIiwgTHQ6IGFubm90YXRpb25PYmplY3QuJEx0IH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRMZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIkxlXCIsIExlOiBhbm5vdGF0aW9uT2JqZWN0LiRMZSB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kQXBwbHkgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJBcHBseVwiLCBBcHBseTogYW5ub3RhdGlvbk9iamVjdC4kQXBwbHksIEZ1bmN0aW9uOiBhbm5vdGF0aW9uT2JqZWN0LiRGdW5jdGlvbiB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIlBhdGhcIiwgUGF0aDogYW5ub3RhdGlvbk9iamVjdC4kUGF0aCB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kQW5ub3RhdGlvblBhdGggIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHtcblx0XHRcdFx0dHlwZTogXCJBbm5vdGF0aW9uUGF0aFwiLFxuXHRcdFx0XHRBbm5vdGF0aW9uUGF0aDogYW5ub3RhdGlvbk9iamVjdC4kQW5ub3RhdGlvblBhdGhcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiREZWNpbWFsICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiRGVjaW1hbFwiLCBEZWNpbWFsOiBwYXJzZUZsb2F0KGFubm90YXRpb25PYmplY3QuJERlY2ltYWwpIH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRFbnVtTWVtYmVyICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7XG5cdFx0XHRcdHR5cGU6IFwiRW51bU1lbWJlclwiLFxuXHRcdFx0XHRFbnVtTWVtYmVyOiBgJHttYXBOYW1lVG9BbGlhcyhhbm5vdGF0aW9uT2JqZWN0LiRFbnVtTWVtYmVyLnNwbGl0KFwiL1wiKVswXSl9LyR7YW5ub3RhdGlvbk9iamVjdC4kRW51bU1lbWJlci5zcGxpdChcIi9cIilbMV19YFxuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoYW5ub3RhdGlvbk9iamVjdCkpIHtcblx0XHRcdGlzQ29sbGVjdGlvbiA9IHRydWU7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24gPSBhbm5vdGF0aW9uT2JqZWN0Lm1hcCgoc3ViQW5ub3RhdGlvbk9iamVjdCwgc3ViQW5ub3RhdGlvbkluZGV4KSA9PlxuXHRcdFx0XHRwYXJzZUFubm90YXRpb25PYmplY3QoXG5cdFx0XHRcdFx0c3ViQW5ub3RhdGlvbk9iamVjdCxcblx0XHRcdFx0XHRgJHtjdXJyZW50QW5ub3RhdGlvblRhcmdldH0vJHtzdWJBbm5vdGF0aW9uSW5kZXh9YCxcblx0XHRcdFx0XHRhbm5vdGF0aW9uTGlzdHMsXG5cdFx0XHRcdFx0b0NhcGFiaWxpdGllc1xuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXHRcdFx0aWYgKGFubm90YXRpb25PYmplY3QubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRQcm9wZXJ0eVBhdGhcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiUHJvcGVydHlQYXRoXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRQYXRoXCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIlBhdGhcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkQW5ub3RhdGlvblBhdGhcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiQW5ub3RhdGlvblBhdGhcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJFR5cGVcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiUmVjb3JkXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRJZlwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJJZlwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkT3JcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiT3JcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEVxXCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIkVxXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiROZVwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJOZVwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTm90XCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIk5vdFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkR3RcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiR3RcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEdlXCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIkdlXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRMdFwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJMdFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTGVcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiTGVcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEFuZFwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJBbmRcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEFwcGx5XCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIkFwcGx5XCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGFubm90YXRpb25PYmplY3RbMF0gPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiUmVjb3JkXCI7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIlN0cmluZ1wiO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHJlY29yZDogQW5ub3RhdGlvblJlY29yZCA9IHtcblx0XHRcdFx0cHJvcGVydHlWYWx1ZXM6IFtdXG5cdFx0XHR9O1xuXHRcdFx0aWYgKGFubm90YXRpb25PYmplY3QuJFR5cGUpIHtcblx0XHRcdFx0Y29uc3QgdHlwZVZhbHVlID0gYW5ub3RhdGlvbk9iamVjdC4kVHlwZTtcblx0XHRcdFx0cmVjb3JkLnR5cGUgPSBgJHt0eXBlVmFsdWV9YDtcblx0XHRcdH1cblx0XHRcdGNvbnN0IHByb3BlcnR5VmFsdWVzOiBhbnlbXSA9IFtdO1xuXHRcdFx0Zm9yIChjb25zdCBwcm9wZXJ0eUtleSBpbiBhbm5vdGF0aW9uT2JqZWN0KSB7XG5cdFx0XHRcdGlmIChwcm9wZXJ0eUtleSAhPT0gXCIkVHlwZVwiICYmICFwcm9wZXJ0eUtleS5zdGFydHNXaXRoKFwiQFwiKSkge1xuXHRcdFx0XHRcdHByb3BlcnR5VmFsdWVzLnB1c2goXG5cdFx0XHRcdFx0XHRwYXJzZVByb3BlcnR5VmFsdWUoXG5cdFx0XHRcdFx0XHRcdGFubm90YXRpb25PYmplY3RbcHJvcGVydHlLZXldLFxuXHRcdFx0XHRcdFx0XHRwcm9wZXJ0eUtleSxcblx0XHRcdFx0XHRcdFx0Y3VycmVudEFubm90YXRpb25UYXJnZXQsXG5cdFx0XHRcdFx0XHRcdGFubm90YXRpb25MaXN0cyxcblx0XHRcdFx0XHRcdFx0b0NhcGFiaWxpdGllc1xuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAocHJvcGVydHlLZXkuc3RhcnRzV2l0aChcIkBcIikpIHtcblx0XHRcdFx0XHQvLyBBbm5vdGF0aW9uIG9mIHJlY29yZFxuXHRcdFx0XHRcdGNyZWF0ZUFubm90YXRpb25MaXN0cyhcblx0XHRcdFx0XHRcdHsgW3Byb3BlcnR5S2V5XTogYW5ub3RhdGlvbk9iamVjdFtwcm9wZXJ0eUtleV0gfSxcblx0XHRcdFx0XHRcdGN1cnJlbnRBbm5vdGF0aW9uVGFyZ2V0LFxuXHRcdFx0XHRcdFx0YW5ub3RhdGlvbkxpc3RzLFxuXHRcdFx0XHRcdFx0b0NhcGFiaWxpdGllc1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJlY29yZC5wcm9wZXJ0eVZhbHVlcyA9IHByb3BlcnR5VmFsdWVzO1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5yZWNvcmQgPSByZWNvcmQ7XG5cdFx0fVxuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuaXNDb2xsZWN0aW9uID0gaXNDb2xsZWN0aW9uO1xuXHRcdGN1cnJlbnRPdXRBbm5vdGF0aW9uT2JqZWN0LmFubm90YXRpb25zLnB1c2gocGFyc2VkQW5ub3RhdGlvbk9iamVjdCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gcHJlcGFyZVByb3BlcnR5KHByb3BlcnR5RGVmaW5pdGlvbjogYW55LCBlbnRpdHlUeXBlT2JqZWN0OiBSYXdFbnRpdHlUeXBlIHwgUmF3Q29tcGxleFR5cGUsIHByb3BlcnR5TmFtZTogc3RyaW5nKTogUmF3UHJvcGVydHkge1xuXHRyZXR1cm4ge1xuXHRcdF90eXBlOiBcIlByb3BlcnR5XCIsXG5cdFx0bmFtZTogcHJvcGVydHlOYW1lLFxuXHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogYCR7ZW50aXR5VHlwZU9iamVjdC5mdWxseVF1YWxpZmllZE5hbWV9LyR7cHJvcGVydHlOYW1lfWAsXG5cdFx0dHlwZTogcHJvcGVydHlEZWZpbml0aW9uLiRUeXBlLFxuXHRcdG1heExlbmd0aDogcHJvcGVydHlEZWZpbml0aW9uLiRNYXhMZW5ndGgsXG5cdFx0cHJlY2lzaW9uOiBwcm9wZXJ0eURlZmluaXRpb24uJFByZWNpc2lvbixcblx0XHRzY2FsZTogcHJvcGVydHlEZWZpbml0aW9uLiRTY2FsZSxcblx0XHRudWxsYWJsZTogcHJvcGVydHlEZWZpbml0aW9uLiROdWxsYWJsZVxuXHR9O1xufVxuXG5mdW5jdGlvbiBwcmVwYXJlTmF2aWdhdGlvblByb3BlcnR5KFxuXHRuYXZQcm9wZXJ0eURlZmluaXRpb246IGFueSxcblx0ZW50aXR5VHlwZU9iamVjdDogUmF3RW50aXR5VHlwZSB8IFJhd0NvbXBsZXhUeXBlLFxuXHRuYXZQcm9wZXJ0eU5hbWU6IHN0cmluZ1xuKTogUmF3VjROYXZpZ2F0aW9uUHJvcGVydHkge1xuXHRsZXQgcmVmZXJlbnRpYWxDb25zdHJhaW50OiBSZWZlcmVudGlhbENvbnN0cmFpbnRbXSA9IFtdO1xuXHRpZiAobmF2UHJvcGVydHlEZWZpbml0aW9uLiRSZWZlcmVudGlhbENvbnN0cmFpbnQpIHtcblx0XHRyZWZlcmVudGlhbENvbnN0cmFpbnQgPSBPYmplY3Qua2V5cyhuYXZQcm9wZXJ0eURlZmluaXRpb24uJFJlZmVyZW50aWFsQ29uc3RyYWludCkubWFwKChzb3VyY2VQcm9wZXJ0eU5hbWUpID0+IHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHNvdXJjZVR5cGVOYW1lOiBlbnRpdHlUeXBlT2JqZWN0Lm5hbWUsXG5cdFx0XHRcdHNvdXJjZVByb3BlcnR5OiBzb3VyY2VQcm9wZXJ0eU5hbWUsXG5cdFx0XHRcdHRhcmdldFR5cGVOYW1lOiBuYXZQcm9wZXJ0eURlZmluaXRpb24uJFR5cGUsXG5cdFx0XHRcdHRhcmdldFByb3BlcnR5OiBuYXZQcm9wZXJ0eURlZmluaXRpb24uJFJlZmVyZW50aWFsQ29uc3RyYWludFtzb3VyY2VQcm9wZXJ0eU5hbWVdXG5cdFx0XHR9O1xuXHRcdH0pO1xuXHR9XG5cdGNvbnN0IG5hdmlnYXRpb25Qcm9wZXJ0eTogUmF3VjROYXZpZ2F0aW9uUHJvcGVydHkgPSB7XG5cdFx0X3R5cGU6IFwiTmF2aWdhdGlvblByb3BlcnR5XCIsXG5cdFx0bmFtZTogbmF2UHJvcGVydHlOYW1lLFxuXHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogYCR7ZW50aXR5VHlwZU9iamVjdC5mdWxseVF1YWxpZmllZE5hbWV9LyR7bmF2UHJvcGVydHlOYW1lfWAsXG5cdFx0cGFydG5lcjogbmF2UHJvcGVydHlEZWZpbml0aW9uLiRQYXJ0bmVyLFxuXHRcdGlzQ29sbGVjdGlvbjogbmF2UHJvcGVydHlEZWZpbml0aW9uLiRpc0NvbGxlY3Rpb24gPyBuYXZQcm9wZXJ0eURlZmluaXRpb24uJGlzQ29sbGVjdGlvbiA6IGZhbHNlLFxuXHRcdGNvbnRhaW5zVGFyZ2V0OiBuYXZQcm9wZXJ0eURlZmluaXRpb24uJENvbnRhaW5zVGFyZ2V0LFxuXHRcdHRhcmdldFR5cGVOYW1lOiBuYXZQcm9wZXJ0eURlZmluaXRpb24uJFR5cGUsXG5cdFx0cmVmZXJlbnRpYWxDb25zdHJhaW50XG5cdH07XG5cblx0cmV0dXJuIG5hdmlnYXRpb25Qcm9wZXJ0eTtcbn1cblxuZnVuY3Rpb24gcHJlcGFyZUVudGl0eVNldChlbnRpdHlTZXREZWZpbml0aW9uOiBhbnksIGVudGl0eVNldE5hbWU6IHN0cmluZywgZW50aXR5Q29udGFpbmVyTmFtZTogc3RyaW5nKTogUmF3RW50aXR5U2V0IHtcblx0Y29uc3QgZW50aXR5U2V0T2JqZWN0OiBSYXdFbnRpdHlTZXQgPSB7XG5cdFx0X3R5cGU6IFwiRW50aXR5U2V0XCIsXG5cdFx0bmFtZTogZW50aXR5U2V0TmFtZSxcblx0XHRuYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nOiB7fSxcblx0XHRlbnRpdHlUeXBlTmFtZTogZW50aXR5U2V0RGVmaW5pdGlvbi4kVHlwZSxcblx0XHRmdWxseVF1YWxpZmllZE5hbWU6IGAke2VudGl0eUNvbnRhaW5lck5hbWV9LyR7ZW50aXR5U2V0TmFtZX1gXG5cdH07XG5cdHJldHVybiBlbnRpdHlTZXRPYmplY3Q7XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVTaW5nbGV0b24oc2luZ2xldG9uRGVmaW5pdGlvbjogYW55LCBzaW5nbGV0b25OYW1lOiBzdHJpbmcsIGVudGl0eUNvbnRhaW5lck5hbWU6IHN0cmluZyk6IFJhd1NpbmdsZXRvbiB7XG5cdHJldHVybiB7XG5cdFx0X3R5cGU6IFwiU2luZ2xldG9uXCIsXG5cdFx0bmFtZTogc2luZ2xldG9uTmFtZSxcblx0XHRuYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nOiB7fSxcblx0XHRlbnRpdHlUeXBlTmFtZTogc2luZ2xldG9uRGVmaW5pdGlvbi4kVHlwZSxcblx0XHRmdWxseVF1YWxpZmllZE5hbWU6IGAke2VudGl0eUNvbnRhaW5lck5hbWV9LyR7c2luZ2xldG9uTmFtZX1gLFxuXHRcdG51bGxhYmxlOiB0cnVlXG5cdH07XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVBY3Rpb25JbXBvcnQoYWN0aW9uSW1wb3J0OiBhbnksIGFjdGlvbkltcG9ydE5hbWU6IHN0cmluZywgZW50aXR5Q29udGFpbmVyTmFtZTogc3RyaW5nKTogUmF3QWN0aW9uSW1wb3J0IHtcblx0cmV0dXJuIHtcblx0XHRfdHlwZTogXCJBY3Rpb25JbXBvcnRcIixcblx0XHRuYW1lOiBhY3Rpb25JbXBvcnROYW1lLFxuXHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogYCR7ZW50aXR5Q29udGFpbmVyTmFtZX0vJHthY3Rpb25JbXBvcnROYW1lfWAsXG5cdFx0YWN0aW9uTmFtZTogYWN0aW9uSW1wb3J0LiRBY3Rpb25cblx0fTtcbn1cblxuZnVuY3Rpb24gcHJlcGFyZVR5cGVEZWZpbml0aW9uKHR5cGVEZWZpbml0aW9uOiBhbnksIHR5cGVOYW1lOiBzdHJpbmcsIG5hbWVzcGFjZVByZWZpeDogc3RyaW5nKTogUmF3VHlwZURlZmluaXRpb24ge1xuXHRjb25zdCB0eXBlT2JqZWN0OiBSYXdUeXBlRGVmaW5pdGlvbiA9IHtcblx0XHRfdHlwZTogXCJUeXBlRGVmaW5pdGlvblwiLFxuXHRcdG5hbWU6IHR5cGVOYW1lLnN1YnN0cmluZyhuYW1lc3BhY2VQcmVmaXgubGVuZ3RoKSxcblx0XHRmdWxseVF1YWxpZmllZE5hbWU6IHR5cGVOYW1lLFxuXHRcdHVuZGVybHlpbmdUeXBlOiB0eXBlRGVmaW5pdGlvbi4kVW5kZXJseWluZ1R5cGVcblx0fTtcblx0cmV0dXJuIHR5cGVPYmplY3Q7XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVDb21wbGV4VHlwZShjb21wbGV4VHlwZURlZmluaXRpb246IGFueSwgY29tcGxleFR5cGVOYW1lOiBzdHJpbmcsIG5hbWVzcGFjZVByZWZpeDogc3RyaW5nKTogUmF3Q29tcGxleFR5cGUge1xuXHRjb25zdCBjb21wbGV4VHlwZU9iamVjdDogUmF3Q29tcGxleFR5cGUgPSB7XG5cdFx0X3R5cGU6IFwiQ29tcGxleFR5cGVcIixcblx0XHRuYW1lOiBjb21wbGV4VHlwZU5hbWUuc3Vic3RyaW5nKG5hbWVzcGFjZVByZWZpeC5sZW5ndGgpLFxuXHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogY29tcGxleFR5cGVOYW1lLFxuXHRcdHByb3BlcnRpZXM6IFtdLFxuXHRcdG5hdmlnYXRpb25Qcm9wZXJ0aWVzOiBbXVxuXHR9O1xuXG5cdGNvbnN0IGNvbXBsZXhUeXBlUHJvcGVydGllcyA9IE9iamVjdC5rZXlzKGNvbXBsZXhUeXBlRGVmaW5pdGlvbilcblx0XHQuZmlsdGVyKChwcm9wZXJ0eU5hbWVPck5vdCkgPT4ge1xuXHRcdFx0aWYgKHByb3BlcnR5TmFtZU9yTm90ICE9IFwiJEtleVwiICYmIHByb3BlcnR5TmFtZU9yTm90ICE9IFwiJGtpbmRcIikge1xuXHRcdFx0XHRyZXR1cm4gY29tcGxleFR5cGVEZWZpbml0aW9uW3Byb3BlcnR5TmFtZU9yTm90XS4ka2luZCA9PT0gXCJQcm9wZXJ0eVwiO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LnNvcnQoKGEsIGIpID0+IChhID4gYiA/IDEgOiAtMSkpXG5cdFx0Lm1hcCgocHJvcGVydHlOYW1lKSA9PiB7XG5cdFx0XHRyZXR1cm4gcHJlcGFyZVByb3BlcnR5KGNvbXBsZXhUeXBlRGVmaW5pdGlvbltwcm9wZXJ0eU5hbWVdLCBjb21wbGV4VHlwZU9iamVjdCwgcHJvcGVydHlOYW1lKTtcblx0XHR9KTtcblxuXHRjb21wbGV4VHlwZU9iamVjdC5wcm9wZXJ0aWVzID0gY29tcGxleFR5cGVQcm9wZXJ0aWVzO1xuXHRjb25zdCBjb21wbGV4VHlwZU5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gT2JqZWN0LmtleXMoY29tcGxleFR5cGVEZWZpbml0aW9uKVxuXHRcdC5maWx0ZXIoKHByb3BlcnR5TmFtZU9yTm90KSA9PiB7XG5cdFx0XHRpZiAocHJvcGVydHlOYW1lT3JOb3QgIT0gXCIkS2V5XCIgJiYgcHJvcGVydHlOYW1lT3JOb3QgIT0gXCIka2luZFwiKSB7XG5cdFx0XHRcdHJldHVybiBjb21wbGV4VHlwZURlZmluaXRpb25bcHJvcGVydHlOYW1lT3JOb3RdLiRraW5kID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LnNvcnQoKGEsIGIpID0+IChhID4gYiA/IDEgOiAtMSkpXG5cdFx0Lm1hcCgobmF2UHJvcGVydHlOYW1lKSA9PiB7XG5cdFx0XHRyZXR1cm4gcHJlcGFyZU5hdmlnYXRpb25Qcm9wZXJ0eShjb21wbGV4VHlwZURlZmluaXRpb25bbmF2UHJvcGVydHlOYW1lXSwgY29tcGxleFR5cGVPYmplY3QsIG5hdlByb3BlcnR5TmFtZSk7XG5cdFx0fSk7XG5cdGNvbXBsZXhUeXBlT2JqZWN0Lm5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gY29tcGxleFR5cGVOYXZpZ2F0aW9uUHJvcGVydGllcztcblx0cmV0dXJuIGNvbXBsZXhUeXBlT2JqZWN0O1xufVxuXG5mdW5jdGlvbiBwcmVwYXJlRW50aXR5S2V5cyhlbnRpdHlUeXBlRGVmaW5pdGlvbjogYW55LCBvTWV0YU1vZGVsRGF0YTogYW55KTogc3RyaW5nW10ge1xuXHRpZiAoIWVudGl0eVR5cGVEZWZpbml0aW9uLiRLZXkgJiYgZW50aXR5VHlwZURlZmluaXRpb24uJEJhc2VUeXBlKSB7XG5cdFx0cmV0dXJuIHByZXBhcmVFbnRpdHlLZXlzKG9NZXRhTW9kZWxEYXRhW2VudGl0eVR5cGVEZWZpbml0aW9uLiRCYXNlVHlwZV0sIG9NZXRhTW9kZWxEYXRhKTtcblx0fVxuXHRyZXR1cm4gZW50aXR5VHlwZURlZmluaXRpb24uJEtleSA/PyBbXTsgLy9oYW5kbGluZyBvZiBlbnRpdHkgdHlwZXMgd2l0aG91dCBrZXkgYXMgd2VsbCBhcyBiYXNldHlwZVxufVxuXG5mdW5jdGlvbiBwcmVwYXJlRW50aXR5VHlwZShlbnRpdHlUeXBlRGVmaW5pdGlvbjogYW55LCBlbnRpdHlUeXBlTmFtZTogc3RyaW5nLCBuYW1lc3BhY2VQcmVmaXg6IHN0cmluZywgbWV0YU1vZGVsRGF0YTogYW55KTogUmF3RW50aXR5VHlwZSB7XG5cdGNvbnN0IGVudGl0eVR5cGU6IFJhd0VudGl0eVR5cGUgPSB7XG5cdFx0X3R5cGU6IFwiRW50aXR5VHlwZVwiLFxuXHRcdG5hbWU6IGVudGl0eVR5cGVOYW1lLnN1YnN0cmluZyhuYW1lc3BhY2VQcmVmaXgubGVuZ3RoKSxcblx0XHRmdWxseVF1YWxpZmllZE5hbWU6IGVudGl0eVR5cGVOYW1lLFxuXHRcdGtleXM6IFtdLFxuXHRcdGVudGl0eVByb3BlcnRpZXM6IFtdLFxuXHRcdG5hdmlnYXRpb25Qcm9wZXJ0aWVzOiBbXSxcblx0XHRhY3Rpb25zOiB7fVxuXHR9O1xuXG5cdGZvciAoY29uc3Qga2V5IGluIGVudGl0eVR5cGVEZWZpbml0aW9uKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSBlbnRpdHlUeXBlRGVmaW5pdGlvbltrZXldO1xuXG5cdFx0c3dpdGNoICh2YWx1ZS4ka2luZCkge1xuXHRcdFx0Y2FzZSBcIlByb3BlcnR5XCI6XG5cdFx0XHRcdGNvbnN0IHByb3BlcnR5ID0gcHJlcGFyZVByb3BlcnR5KHZhbHVlLCBlbnRpdHlUeXBlLCBrZXkpO1xuXHRcdFx0XHRlbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXMucHVzaChwcm9wZXJ0eSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiOlxuXHRcdFx0XHRjb25zdCBuYXZpZ2F0aW9uUHJvcGVydHkgPSBwcmVwYXJlTmF2aWdhdGlvblByb3BlcnR5KHZhbHVlLCBlbnRpdHlUeXBlLCBrZXkpO1xuXHRcdFx0XHRlbnRpdHlUeXBlLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLnB1c2gobmF2aWdhdGlvblByb3BlcnR5KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0ZW50aXR5VHlwZS5rZXlzID0gcHJlcGFyZUVudGl0eUtleXMoZW50aXR5VHlwZURlZmluaXRpb24sIG1ldGFNb2RlbERhdGEpXG5cdFx0Lm1hcCgoZW50aXR5S2V5KSA9PiBlbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXMuZmluZCgocHJvcGVydHkpID0+IHByb3BlcnR5Lm5hbWUgPT09IGVudGl0eUtleSkpXG5cdFx0LmZpbHRlcigocHJvcGVydHkpID0+IHByb3BlcnR5ICE9PSB1bmRlZmluZWQpIGFzIFJhd0VudGl0eVR5cGVbXCJrZXlzXCJdO1xuXG5cdC8vIENoZWNrIGlmIHRoZXJlIGFyZSBmaWx0ZXIgZmFjZXRzIGRlZmluZWQgZm9yIHRoZSBlbnRpdHlUeXBlIGFuZCBpZiB5ZXMsIGNoZWNrIGlmIGFsbCBvZiB0aGVtIGhhdmUgYW4gSURcblx0Ly8gVGhlIElEIGlzIG9wdGlvbmFsLCBidXQgaXQgaXMgaW50ZXJuYWxseSB0YWtlbiBmb3IgZ3JvdXBpbmcgZmlsdGVyIGZpZWxkcyBhbmQgaWYgaXQncyBub3QgcHJlc2VudFxuXHQvLyBhIGZhbGxiYWNrIElEIG5lZWRzIHRvIGJlIGdlbmVyYXRlZCBoZXJlLlxuXHRtZXRhTW9kZWxEYXRhLiRBbm5vdGF0aW9uc1tlbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZV0/LltgQCR7VUlBbm5vdGF0aW9uVGVybXMuRmlsdGVyRmFjZXRzfWBdPy5mb3JFYWNoKFxuXHRcdChmaWx0ZXJGYWNldEFubm90YXRpb246IGFueSkgPT4ge1xuXHRcdFx0ZmlsdGVyRmFjZXRBbm5vdGF0aW9uLklEID0gY3JlYXRlUmVmZXJlbmNlRmFjZXRJZChmaWx0ZXJGYWNldEFubm90YXRpb24pO1xuXHRcdH1cblx0KTtcblxuXHRmb3IgKGNvbnN0IGVudGl0eVByb3BlcnR5IG9mIGVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcykge1xuXHRcdGlmICghbWV0YU1vZGVsRGF0YS4kQW5ub3RhdGlvbnNbZW50aXR5UHJvcGVydHkuZnVsbHlRdWFsaWZpZWROYW1lXSkge1xuXHRcdFx0bWV0YU1vZGVsRGF0YS4kQW5ub3RhdGlvbnNbZW50aXR5UHJvcGVydHkuZnVsbHlRdWFsaWZpZWROYW1lXSA9IHt9O1xuXHRcdH1cblx0XHRpZiAoIW1ldGFNb2RlbERhdGEuJEFubm90YXRpb25zW2VudGl0eVByb3BlcnR5LmZ1bGx5UXVhbGlmaWVkTmFtZV1bYEAke1VJQW5ub3RhdGlvblRlcm1zLkRhdGFGaWVsZERlZmF1bHR9YF0pIHtcblx0XHRcdG1ldGFNb2RlbERhdGEuJEFubm90YXRpb25zW2VudGl0eVByb3BlcnR5LmZ1bGx5UXVhbGlmaWVkTmFtZV1bYEAke1VJQW5ub3RhdGlvblRlcm1zLkRhdGFGaWVsZERlZmF1bHR9YF0gPSB7XG5cdFx0XHRcdCRUeXBlOiBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQsXG5cdFx0XHRcdFZhbHVlOiB7ICRQYXRoOiBlbnRpdHlQcm9wZXJ0eS5uYW1lIH1cblx0XHRcdH07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGVudGl0eVR5cGU7XG59XG5mdW5jdGlvbiBwcmVwYXJlQWN0aW9uKGFjdGlvbk5hbWU6IHN0cmluZywgYWN0aW9uUmF3RGF0YTogTWV0YU1vZGVsQWN0aW9uLCBuYW1lc3BhY2VQcmVmaXg6IHN0cmluZyk6IFJhd0FjdGlvbiB7XG5cdGxldCBhY3Rpb25FbnRpdHlUeXBlID0gXCJcIjtcblx0bGV0IGFjdGlvbkZRTiA9IGFjdGlvbk5hbWU7XG5cblx0aWYgKGFjdGlvblJhd0RhdGEuJElzQm91bmQpIHtcblx0XHRjb25zdCBiaW5kaW5nUGFyYW1ldGVyID0gYWN0aW9uUmF3RGF0YS4kUGFyYW1ldGVyWzBdO1xuXHRcdGFjdGlvbkVudGl0eVR5cGUgPSBiaW5kaW5nUGFyYW1ldGVyLiRUeXBlO1xuXHRcdGlmIChiaW5kaW5nUGFyYW1ldGVyLiRpc0NvbGxlY3Rpb24gPT09IHRydWUpIHtcblx0XHRcdGFjdGlvbkZRTiA9IGAke2FjdGlvbk5hbWV9KENvbGxlY3Rpb24oJHthY3Rpb25FbnRpdHlUeXBlfSkpYDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YWN0aW9uRlFOID0gYCR7YWN0aW9uTmFtZX0oJHthY3Rpb25FbnRpdHlUeXBlfSlgO1xuXHRcdH1cblx0fVxuXG5cdGNvbnN0IHBhcmFtZXRlcnMgPSBhY3Rpb25SYXdEYXRhLiRQYXJhbWV0ZXIgPz8gW107XG5cdHJldHVybiB7XG5cdFx0X3R5cGU6IFwiQWN0aW9uXCIsXG5cdFx0bmFtZTogYWN0aW9uTmFtZS5zdWJzdHJpbmcobmFtZXNwYWNlUHJlZml4Lmxlbmd0aCksXG5cdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBhY3Rpb25GUU4sXG5cdFx0aXNCb3VuZDogYWN0aW9uUmF3RGF0YS4kSXNCb3VuZCA/PyBmYWxzZSxcblx0XHRpc0Z1bmN0aW9uOiBhY3Rpb25SYXdEYXRhLiRraW5kID09PSBcIkZ1bmN0aW9uXCIsXG5cdFx0c291cmNlVHlwZTogYWN0aW9uRW50aXR5VHlwZSxcblx0XHRyZXR1cm5UeXBlOiBhY3Rpb25SYXdEYXRhLiRSZXR1cm5UeXBlPy4kVHlwZSA/PyBcIlwiLFxuXHRcdHBhcmFtZXRlcnM6IHBhcmFtZXRlcnMubWFwKChwYXJhbSkgPT4ge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0X3R5cGU6IFwiQWN0aW9uUGFyYW1ldGVyXCIsXG5cdFx0XHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogYCR7YWN0aW9uRlFOfS8ke3BhcmFtLiROYW1lfWAsXG5cdFx0XHRcdGlzQ29sbGVjdGlvbjogcGFyYW0uJGlzQ29sbGVjdGlvbiA/PyBmYWxzZSxcblx0XHRcdFx0bmFtZTogcGFyYW0uJE5hbWUsXG5cdFx0XHRcdHR5cGU6IHBhcmFtLiRUeXBlXG5cdFx0XHR9O1xuXHRcdH0pXG5cdH07XG59XG5cbmZ1bmN0aW9uIHBhcnNlRW50aXR5Q29udGFpbmVyKFxuXHRuYW1lc3BhY2VQcmVmaXg6IHN0cmluZyxcblx0ZW50aXR5Q29udGFpbmVyTmFtZTogc3RyaW5nLFxuXHRlbnRpdHlDb250YWluZXJNZXRhZGF0YTogUmVjb3JkPHN0cmluZywgYW55Pixcblx0cmVzdWx0OiBSYXdNZXRhZGF0YVxuKSB7XG5cdHJlc3VsdC5zY2hlbWEuZW50aXR5Q29udGFpbmVyID0ge1xuXHRcdF90eXBlOiBcIkVudGl0eUNvbnRhaW5lclwiLFxuXHRcdG5hbWU6IGVudGl0eUNvbnRhaW5lck5hbWUuc3Vic3RyaW5nKG5hbWVzcGFjZVByZWZpeC5sZW5ndGgpLFxuXHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogZW50aXR5Q29udGFpbmVyTmFtZVxuXHR9O1xuXG5cdGZvciAoY29uc3QgZWxlbWVudE5hbWUgaW4gZW50aXR5Q29udGFpbmVyTWV0YWRhdGEpIHtcblx0XHRjb25zdCBlbGVtZW50VmFsdWUgPSBlbnRpdHlDb250YWluZXJNZXRhZGF0YVtlbGVtZW50TmFtZV07XG5cdFx0c3dpdGNoIChlbGVtZW50VmFsdWUuJGtpbmQpIHtcblx0XHRcdGNhc2UgXCJFbnRpdHlTZXRcIjpcblx0XHRcdFx0cmVzdWx0LnNjaGVtYS5lbnRpdHlTZXRzLnB1c2gocHJlcGFyZUVudGl0eVNldChlbGVtZW50VmFsdWUsIGVsZW1lbnROYW1lLCBlbnRpdHlDb250YWluZXJOYW1lKSk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIFwiU2luZ2xldG9uXCI6XG5cdFx0XHRcdHJlc3VsdC5zY2hlbWEuc2luZ2xldG9ucy5wdXNoKHByZXBhcmVTaW5nbGV0b24oZWxlbWVudFZhbHVlLCBlbGVtZW50TmFtZSwgZW50aXR5Q29udGFpbmVyTmFtZSkpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBcIkFjdGlvbkltcG9ydFwiOlxuXHRcdFx0XHRyZXN1bHQuc2NoZW1hLmFjdGlvbkltcG9ydHMucHVzaChwcmVwYXJlQWN0aW9uSW1wb3J0KGVsZW1lbnRWYWx1ZSwgZWxlbWVudE5hbWUsIGVudGl0eUNvbnRhaW5lck5hbWUpKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0Ly8gbGluayB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0eSBiaW5kaW5ncyAoJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcpXG5cdGZvciAoY29uc3QgZW50aXR5U2V0IG9mIHJlc3VsdC5zY2hlbWEuZW50aXR5U2V0cykge1xuXHRcdGNvbnN0IG5hdlByb3BlcnR5QmluZGluZ3MgPSBlbnRpdHlDb250YWluZXJNZXRhZGF0YVtlbnRpdHlTZXQubmFtZV0uJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmc7XG5cdFx0aWYgKG5hdlByb3BlcnR5QmluZGluZ3MpIHtcblx0XHRcdGZvciAoY29uc3QgbmF2UHJvcE5hbWUgb2YgT2JqZWN0LmtleXMobmF2UHJvcGVydHlCaW5kaW5ncykpIHtcblx0XHRcdFx0Y29uc3QgdGFyZ2V0RW50aXR5U2V0ID0gcmVzdWx0LnNjaGVtYS5lbnRpdHlTZXRzLmZpbmQoXG5cdFx0XHRcdFx0KGVudGl0eVNldE5hbWUpID0+IGVudGl0eVNldE5hbWUubmFtZSA9PT0gbmF2UHJvcGVydHlCaW5kaW5nc1tuYXZQcm9wTmFtZV1cblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKHRhcmdldEVudGl0eVNldCkge1xuXHRcdFx0XHRcdGVudGl0eVNldC5uYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nW25hdlByb3BOYW1lXSA9IHRhcmdldEVudGl0eVNldDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZUFubm90YXRpb25zKGFubm90YXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBjYXBhYmlsaXRpZXM6IEVudmlyb25tZW50Q2FwYWJpbGl0aWVzKSB7XG5cdGNvbnN0IGFubm90YXRpb25MaXN0czogUmVjb3JkPHN0cmluZywgQW5ub3RhdGlvbkxpc3Q+ID0ge307XG5cdGZvciAoY29uc3QgdGFyZ2V0IGluIGFubm90YXRpb25zKSB7XG5cdFx0Y3JlYXRlQW5ub3RhdGlvbkxpc3RzKGFubm90YXRpb25zW3RhcmdldF0sIHRhcmdldCwgYW5ub3RhdGlvbkxpc3RzLCBjYXBhYmlsaXRpZXMpO1xuXHR9XG5cblx0Ly8gU29ydCBieSB0YXJnZXQgbGVuZ3RoXG5cdHJldHVybiBPYmplY3Qua2V5cyhhbm5vdGF0aW9uTGlzdHMpXG5cdFx0LnNvcnQoKGEsIGIpID0+IGEubGVuZ3RoIC0gYi5sZW5ndGgpXG5cdFx0Lm1hcCgoYW5ub3RhdGlvbk5hbWUpID0+IGFubm90YXRpb25MaXN0c1thbm5vdGF0aW9uTmFtZV0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTWV0YU1vZGVsKFxuXHRtZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLFxuXHRjYXBhYmlsaXRpZXM6IEVudmlyb25tZW50Q2FwYWJpbGl0aWVzID0gRGVmYXVsdEVudmlyb25tZW50Q2FwYWJpbGl0aWVzXG4pOiBSYXdNZXRhZGF0YSB7XG5cdGNvbnN0IG1ldGFNb2RlbERhdGEgPSBtZXRhTW9kZWwuZ2V0T2JqZWN0KFwiLyRcIik7XG5cblx0Ly8gYXNzdW1pbmcgdGhlcmUgaXMgb25seSBvbmUgc2NoZW1hL25hbWVzcGFjZVxuXHRjb25zdCBuYW1lc3BhY2VQcmVmaXggPSBPYmplY3Qua2V5cyhtZXRhTW9kZWxEYXRhKS5maW5kKChrZXkpID0+IG1ldGFNb2RlbERhdGFba2V5XS4ka2luZCA9PT0gXCJTY2hlbWFcIikgPz8gXCJcIjtcblxuXHRjb25zdCByZXN1bHQ6IFJhd01ldGFkYXRhID0ge1xuXHRcdGlkZW50aWZpY2F0aW9uOiBcIm1ldGFtb2RlbFJlc3VsdFwiLFxuXHRcdHZlcnNpb246IFwiNC4wXCIsXG5cdFx0c2NoZW1hOiB7XG5cdFx0XHRuYW1lc3BhY2U6IG5hbWVzcGFjZVByZWZpeC5zbGljZSgwLCAtMSksXG5cdFx0XHRlbnRpdHlDb250YWluZXI6IHsgX3R5cGU6IFwiRW50aXR5Q29udGFpbmVyXCIsIG5hbWU6IFwiXCIsIGZ1bGx5UXVhbGlmaWVkTmFtZTogXCJcIiB9LFxuXHRcdFx0ZW50aXR5U2V0czogW10sXG5cdFx0XHRlbnRpdHlUeXBlczogW10sXG5cdFx0XHRjb21wbGV4VHlwZXM6IFtdLFxuXHRcdFx0dHlwZURlZmluaXRpb25zOiBbXSxcblx0XHRcdHNpbmdsZXRvbnM6IFtdLFxuXHRcdFx0YXNzb2NpYXRpb25zOiBbXSxcblx0XHRcdGFzc29jaWF0aW9uU2V0czogW10sXG5cdFx0XHRhY3Rpb25zOiBbXSxcblx0XHRcdGFjdGlvbkltcG9ydHM6IFtdLFxuXHRcdFx0YW5ub3RhdGlvbnM6IHtcblx0XHRcdFx0bWV0YW1vZGVsUmVzdWx0OiBbXVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0cmVmZXJlbmNlczogW11cblx0fTtcblxuXHRjb25zdCBwYXJzZU1ldGFNb2RlbEVsZW1lbnQgPSAobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KSA9PiB7XG5cdFx0c3dpdGNoICh2YWx1ZS4ka2luZCkge1xuXHRcdFx0Y2FzZSBcIkVudGl0eUNvbnRhaW5lclwiOlxuXHRcdFx0XHRwYXJzZUVudGl0eUNvbnRhaW5lcihuYW1lc3BhY2VQcmVmaXgsIG5hbWUsIHZhbHVlLCByZXN1bHQpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBcIkFjdGlvblwiOlxuXHRcdFx0Y2FzZSBcIkZ1bmN0aW9uXCI6XG5cdFx0XHRcdGNvbnN0IGFjdGlvbiA9IHByZXBhcmVBY3Rpb24obmFtZSwgdmFsdWUsIG5hbWVzcGFjZVByZWZpeCk7XG5cdFx0XHRcdHJlc3VsdC5zY2hlbWEuYWN0aW9ucy5wdXNoKGFjdGlvbik7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIFwiRW50aXR5VHlwZVwiOlxuXHRcdFx0XHRjb25zdCBlbnRpdHlUeXBlID0gcHJlcGFyZUVudGl0eVR5cGUodmFsdWUsIG5hbWUsIG5hbWVzcGFjZVByZWZpeCwgbWV0YU1vZGVsRGF0YSk7XG5cdFx0XHRcdHJlc3VsdC5zY2hlbWEuZW50aXR5VHlwZXMucHVzaChlbnRpdHlUeXBlKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgXCJDb21wbGV4VHlwZVwiOlxuXHRcdFx0XHRjb25zdCBjb21wbGV4VHlwZSA9IHByZXBhcmVDb21wbGV4VHlwZSh2YWx1ZSwgbmFtZSwgbmFtZXNwYWNlUHJlZml4KTtcblx0XHRcdFx0cmVzdWx0LnNjaGVtYS5jb21wbGV4VHlwZXMucHVzaChjb21wbGV4VHlwZSk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIFwiVHlwZURlZmluaXRpb25cIjpcblx0XHRcdFx0Y29uc3QgdHlwZURlZmluaXRpb24gPSBwcmVwYXJlVHlwZURlZmluaXRpb24odmFsdWUsIG5hbWUsIG5hbWVzcGFjZVByZWZpeCk7XG5cdFx0XHRcdHJlc3VsdC5zY2hlbWEudHlwZURlZmluaXRpb25zLnB1c2godHlwZURlZmluaXRpb24pO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH07XG5cblx0Zm9yIChjb25zdCBlbGVtZW50TmFtZSBpbiBtZXRhTW9kZWxEYXRhKSB7XG5cdFx0Y29uc3QgZWxlbWVudFZhbHVlID0gbWV0YU1vZGVsRGF0YVtlbGVtZW50TmFtZV07XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheShlbGVtZW50VmFsdWUpKSB7XG5cdFx0XHQvLyB2YWx1ZSBjYW4gYmUgYW4gYXJyYXkgaW4gY2FzZSBvZiBhY3Rpb25zIG9yIGZ1bmN0aW9uc1xuXHRcdFx0Zm9yIChjb25zdCBzdWJFbGVtZW50VmFsdWUgb2YgZWxlbWVudFZhbHVlKSB7XG5cdFx0XHRcdHBhcnNlTWV0YU1vZGVsRWxlbWVudChlbGVtZW50TmFtZSwgc3ViRWxlbWVudFZhbHVlKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cGFyc2VNZXRhTW9kZWxFbGVtZW50KGVsZW1lbnROYW1lLCBlbGVtZW50VmFsdWUpO1xuXHRcdH1cblx0fVxuXG5cdHJlc3VsdC5zY2hlbWEuYW5ub3RhdGlvbnMubWV0YW1vZGVsUmVzdWx0ID0gcGFyc2VBbm5vdGF0aW9ucyhtZXRhTW9kZWxEYXRhLiRBbm5vdGF0aW9ucywgY2FwYWJpbGl0aWVzKTtcblxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG5jb25zdCBtTWV0YU1vZGVsTWFwOiBSZWNvcmQ8c3RyaW5nLCBDb252ZXJ0ZWRNZXRhZGF0YT4gPSB7fTtcblxuLyoqXG4gKiBDb252ZXJ0IHRoZSBPRGF0YU1ldGFNb2RlbCBpbnRvIGFub3RoZXIgZm9ybWF0IHRoYXQgYWxsb3cgZm9yIGVhc3kgbWFuaXB1bGF0aW9uIG9mIHRoZSBhbm5vdGF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gb01ldGFNb2RlbCBUaGUgT0RhdGFNZXRhTW9kZWxcbiAqIEBwYXJhbSBvQ2FwYWJpbGl0aWVzIFRoZSBjdXJyZW50IGNhcGFiaWxpdGllc1xuICogQHJldHVybnMgQW4gb2JqZWN0IGNvbnRhaW5pbmcgb2JqZWN0LWxpa2UgYW5ub3RhdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRUeXBlcyhvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCwgb0NhcGFiaWxpdGllcz86IEVudmlyb25tZW50Q2FwYWJpbGl0aWVzKTogQ29udmVydGVkTWV0YWRhdGEge1xuXHRjb25zdCBzTWV0YU1vZGVsSWQgPSAob01ldGFNb2RlbCBhcyBhbnkpLmlkO1xuXHRpZiAoIW1NZXRhTW9kZWxNYXAuaGFzT3duUHJvcGVydHkoc01ldGFNb2RlbElkKSkge1xuXHRcdGNvbnN0IHBhcnNlZE91dHB1dCA9IHBhcnNlTWV0YU1vZGVsKG9NZXRhTW9kZWwsIG9DYXBhYmlsaXRpZXMpO1xuXHRcdHRyeSB7XG5cdFx0XHRtTWV0YU1vZGVsTWFwW3NNZXRhTW9kZWxJZF0gPSBBbm5vdGF0aW9uQ29udmVydGVyLmNvbnZlcnQocGFyc2VkT3V0cHV0KTtcblx0XHR9IGNhdGNoIChvRXJyb3IpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihvRXJyb3IgYXMgYW55KTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG1NZXRhTW9kZWxNYXBbc01ldGFNb2RlbElkXSBhcyBhbnkgYXMgQ29udmVydGVkTWV0YWRhdGE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb252ZXJ0ZWRUeXBlcyhvQ29udGV4dDogQ29udGV4dCkge1xuXHRjb25zdCBvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKSBhcyB1bmtub3duIGFzIE9EYXRhTWV0YU1vZGVsO1xuXHRpZiAoIW9NZXRhTW9kZWwuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTWV0YU1vZGVsXCIpKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiVGhpcyBzaG91bGQgb25seSBiZSBjYWxsZWQgb24gYSBPRGF0YU1ldGFNb2RlbFwiKTtcblx0fVxuXHRyZXR1cm4gY29udmVydFR5cGVzKG9NZXRhTW9kZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlTW9kZWxDYWNoZURhdGEob01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpIHtcblx0ZGVsZXRlIG1NZXRhTW9kZWxNYXBbKG9NZXRhTW9kZWwgYXMgYW55KS5pZF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0TWV0YU1vZGVsQ29udGV4dChvTWV0YU1vZGVsQ29udGV4dDogQ29udGV4dCwgYkluY2x1ZGVWaXNpdGVkT2JqZWN0czogYm9vbGVhbiA9IGZhbHNlKTogYW55IHtcblx0Y29uc3Qgb0NvbnZlcnRlZE1ldGFkYXRhID0gY29udmVydFR5cGVzKG9NZXRhTW9kZWxDb250ZXh0LmdldE1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwpO1xuXHRjb25zdCBzUGF0aCA9IG9NZXRhTW9kZWxDb250ZXh0LmdldFBhdGgoKTtcblxuXHRjb25zdCBhUGF0aFNwbGl0ID0gc1BhdGguc3BsaXQoXCIvXCIpO1xuXHRsZXQgZmlyc3RQYXJ0ID0gYVBhdGhTcGxpdFsxXTtcblx0bGV0IGJlZ2luSW5kZXggPSAyO1xuXHRpZiAob0NvbnZlcnRlZE1ldGFkYXRhLmVudGl0eUNvbnRhaW5lci5mdWxseVF1YWxpZmllZE5hbWUgPT09IGZpcnN0UGFydCkge1xuXHRcdGZpcnN0UGFydCA9IGFQYXRoU3BsaXRbMl07XG5cdFx0YmVnaW5JbmRleCsrO1xuXHR9XG5cdGxldCB0YXJnZXRFbnRpdHlTZXQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiA9IG9Db252ZXJ0ZWRNZXRhZGF0YS5lbnRpdHlTZXRzLmZpbmQoXG5cdFx0KGVudGl0eVNldCkgPT4gZW50aXR5U2V0Lm5hbWUgPT09IGZpcnN0UGFydFxuXHQpIGFzIEVudGl0eVNldDtcblx0aWYgKCF0YXJnZXRFbnRpdHlTZXQpIHtcblx0XHR0YXJnZXRFbnRpdHlTZXQgPSBvQ29udmVydGVkTWV0YWRhdGEuc2luZ2xldG9ucy5maW5kKChzaW5nbGV0b24pID0+IHNpbmdsZXRvbi5uYW1lID09PSBmaXJzdFBhcnQpIGFzIFNpbmdsZXRvbjtcblx0fVxuXHRsZXQgcmVsYXRpdmVQYXRoID0gYVBhdGhTcGxpdC5zbGljZShiZWdpbkluZGV4KS5qb2luKFwiL1wiKTtcblxuXHRjb25zdCBsb2NhbE9iamVjdHM6IGFueVtdID0gW3RhcmdldEVudGl0eVNldF07XG5cdHdoaWxlIChyZWxhdGl2ZVBhdGggJiYgcmVsYXRpdmVQYXRoLmxlbmd0aCA+IDAgJiYgcmVsYXRpdmVQYXRoLnN0YXJ0c1dpdGgoXCIkTmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1wiKSkge1xuXHRcdGxldCByZWxhdGl2ZVNwbGl0ID0gcmVsYXRpdmVQYXRoLnNwbGl0KFwiL1wiKTtcblx0XHRsZXQgaWR4ID0gMDtcblx0XHRsZXQgY3VycmVudEVudGl0eVNldCwgc05hdlByb3BUb0NoZWNrO1xuXG5cdFx0cmVsYXRpdmVTcGxpdCA9IHJlbGF0aXZlU3BsaXQuc2xpY2UoMSk7IC8vIFJlbW92aW5nIFwiJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdcIlxuXHRcdHdoaWxlICghY3VycmVudEVudGl0eVNldCAmJiByZWxhdGl2ZVNwbGl0Lmxlbmd0aCA+IGlkeCkge1xuXHRcdFx0aWYgKHJlbGF0aXZlU3BsaXRbaWR4XSAhPT0gXCIkTmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1wiKSB7XG5cdFx0XHRcdC8vIEZpbmRpbmcgdGhlIGNvcnJlY3QgZW50aXR5U2V0IGZvciB0aGUgbmF2aWdhaXRvbiBwcm9wZXJ0eSBiaW5kaW5nIGV4YW1wbGU6IFwiU2V0L19TYWxlc09yZGVyXCJcblx0XHRcdFx0c05hdlByb3BUb0NoZWNrID0gcmVsYXRpdmVTcGxpdFxuXHRcdFx0XHRcdC5zbGljZSgwLCBpZHggKyAxKVxuXHRcdFx0XHRcdC5qb2luKFwiL1wiKVxuXHRcdFx0XHRcdC5yZXBsYWNlKFwiLyROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nXCIsIFwiXCIpO1xuXHRcdFx0XHRjdXJyZW50RW50aXR5U2V0ID0gdGFyZ2V0RW50aXR5U2V0ICYmIHRhcmdldEVudGl0eVNldC5uYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nW3NOYXZQcm9wVG9DaGVja107XG5cdFx0XHR9XG5cdFx0XHRpZHgrKztcblx0XHR9XG5cdFx0aWYgKCFjdXJyZW50RW50aXR5U2V0KSB7XG5cdFx0XHQvLyBGYWxsIGJhY2sgdG8gU2luZ2xlIG5hdiBwcm9wIGlmIGVudGl0eVNldCBpcyBub3QgZm91bmQuXG5cdFx0XHRzTmF2UHJvcFRvQ2hlY2sgPSByZWxhdGl2ZVNwbGl0WzBdO1xuXHRcdH1cblx0XHRjb25zdCBhTmF2UHJvcHMgPSBzTmF2UHJvcFRvQ2hlY2s/LnNwbGl0KFwiL1wiKSB8fCBbXTtcblx0XHRsZXQgdGFyZ2V0RW50aXR5VHlwZSA9IHRhcmdldEVudGl0eVNldCAmJiB0YXJnZXRFbnRpdHlTZXQuZW50aXR5VHlwZTtcblx0XHRmb3IgKGNvbnN0IHNOYXZQcm9wIG9mIGFOYXZQcm9wcykge1xuXHRcdFx0Ly8gUHVzaGluZyBhbGwgbmF2IHByb3BzIHRvIHRoZSB2aXNpdGVkIG9iamVjdHMuIGV4YW1wbGU6IFwiU2V0XCIsIFwiX1NhbGVzT3JkZXJcIiBmb3IgXCJTZXQvX1NhbGVzT3JkZXJcIihpbiBOYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nKVxuXHRcdFx0Y29uc3QgdGFyZ2V0TmF2UHJvcCA9IHRhcmdldEVudGl0eVR5cGUgJiYgdGFyZ2V0RW50aXR5VHlwZS5uYXZpZ2F0aW9uUHJvcGVydGllcy5maW5kKChuYXZQcm9wKSA9PiBuYXZQcm9wLm5hbWUgPT09IHNOYXZQcm9wKTtcblx0XHRcdGlmICh0YXJnZXROYXZQcm9wKSB7XG5cdFx0XHRcdGxvY2FsT2JqZWN0cy5wdXNoKHRhcmdldE5hdlByb3ApO1xuXHRcdFx0XHR0YXJnZXRFbnRpdHlUeXBlID0gdGFyZ2V0TmF2UHJvcC50YXJnZXRUeXBlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRhcmdldEVudGl0eVNldCA9XG5cdFx0XHQodGFyZ2V0RW50aXR5U2V0ICYmIGN1cnJlbnRFbnRpdHlTZXQpIHx8ICh0YXJnZXRFbnRpdHlTZXQgJiYgdGFyZ2V0RW50aXR5U2V0Lm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdbcmVsYXRpdmVTcGxpdFswXV0pO1xuXHRcdGlmICh0YXJnZXRFbnRpdHlTZXQpIHtcblx0XHRcdC8vIFB1c2hpbmcgdGhlIHRhcmdldCBlbnRpdHlTZXQgdG8gdmlzaXRlZCBvYmplY3RzXG5cdFx0XHRsb2NhbE9iamVjdHMucHVzaCh0YXJnZXRFbnRpdHlTZXQpO1xuXHRcdH1cblx0XHQvLyBSZS1jYWxjdWxhdGluZyB0aGUgcmVsYXRpdmUgcGF0aFxuXHRcdC8vIEFzIGVhY2ggbmF2aWdhdGlvbiBuYW1lIGlzIGVuY2xvc2VkIGJldHdlZW4gJyROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nJyBhbmQgJyQnICh0byBiZSBhYmxlIHRvIGFjY2VzcyB0aGUgZW50aXR5c2V0IGVhc2lseSBpbiB0aGUgbWV0YW1vZGVsKVxuXHRcdC8vIHdlIG5lZWQgdG8gcmVtb3ZlIHRoZSBjbG9zaW5nICckJyB0byBiZSBhYmxlIHRvIHN3aXRjaCB0byB0aGUgbmV4dCBuYXZpZ2F0aW9uXG5cdFx0cmVsYXRpdmVTcGxpdCA9IHJlbGF0aXZlU3BsaXQuc2xpY2UoYU5hdlByb3BzLmxlbmd0aCB8fCAxKTtcblx0XHRpZiAocmVsYXRpdmVTcGxpdC5sZW5ndGggJiYgcmVsYXRpdmVTcGxpdFswXSA9PT0gXCIkXCIpIHtcblx0XHRcdHJlbGF0aXZlU3BsaXQuc2hpZnQoKTtcblx0XHR9XG5cdFx0cmVsYXRpdmVQYXRoID0gcmVsYXRpdmVTcGxpdC5qb2luKFwiL1wiKTtcblx0fVxuXHRpZiAocmVsYXRpdmVQYXRoLnN0YXJ0c1dpdGgoXCIkVHlwZVwiKSkge1xuXHRcdC8vIEFzICRUeXBlQCBpcyBhbGxvd2VkIGFzIHdlbGxcblx0XHRpZiAocmVsYXRpdmVQYXRoLnN0YXJ0c1dpdGgoXCIkVHlwZUBcIikpIHtcblx0XHRcdHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlUGF0aC5yZXBsYWNlKFwiJFR5cGVcIiwgXCJcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIFdlJ3JlIGFueXdheSBnb2luZyB0byBsb29rIG9uIHRoZSBlbnRpdHlUeXBlLi4uXG5cdFx0XHRyZWxhdGl2ZVBhdGggPSBhUGF0aFNwbGl0LnNsaWNlKDMpLmpvaW4oXCIvXCIpO1xuXHRcdH1cblx0fVxuXHRpZiAodGFyZ2V0RW50aXR5U2V0ICYmIHJlbGF0aXZlUGF0aC5sZW5ndGgpIHtcblx0XHRjb25zdCBvVGFyZ2V0ID0gdGFyZ2V0RW50aXR5U2V0LmVudGl0eVR5cGUucmVzb2x2ZVBhdGgocmVsYXRpdmVQYXRoLCBiSW5jbHVkZVZpc2l0ZWRPYmplY3RzKTtcblx0XHRpZiAob1RhcmdldCkge1xuXHRcdFx0aWYgKGJJbmNsdWRlVmlzaXRlZE9iamVjdHMpIHtcblx0XHRcdFx0b1RhcmdldC52aXNpdGVkT2JqZWN0cyA9IGxvY2FsT2JqZWN0cy5jb25jYXQob1RhcmdldC52aXNpdGVkT2JqZWN0cyk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0YXJnZXRFbnRpdHlTZXQuZW50aXR5VHlwZSAmJiB0YXJnZXRFbnRpdHlTZXQuZW50aXR5VHlwZS5hY3Rpb25zKSB7XG5cdFx0XHQvLyBpZiB0YXJnZXQgaXMgYW4gYWN0aW9uIG9yIGFuIGFjdGlvbiBwYXJhbWV0ZXJcblx0XHRcdGNvbnN0IGFjdGlvbnMgPSB0YXJnZXRFbnRpdHlTZXQuZW50aXR5VHlwZSAmJiB0YXJnZXRFbnRpdHlTZXQuZW50aXR5VHlwZS5hY3Rpb25zO1xuXHRcdFx0Y29uc3QgcmVsYXRpdmVTcGxpdCA9IHJlbGF0aXZlUGF0aC5zcGxpdChcIi9cIik7XG5cdFx0XHRpZiAoYWN0aW9uc1tyZWxhdGl2ZVNwbGl0WzBdXSkge1xuXHRcdFx0XHRjb25zdCBhY3Rpb24gPSBhY3Rpb25zW3JlbGF0aXZlU3BsaXRbMF1dO1xuXHRcdFx0XHRpZiAocmVsYXRpdmVTcGxpdFsxXSAmJiBhY3Rpb24ucGFyYW1ldGVycykge1xuXHRcdFx0XHRcdGNvbnN0IHBhcmFtZXRlck5hbWUgPSByZWxhdGl2ZVNwbGl0WzFdO1xuXHRcdFx0XHRcdHJldHVybiBhY3Rpb24ucGFyYW1ldGVycy5maW5kKChwYXJhbWV0ZXIpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiBwYXJhbWV0ZXIuZnVsbHlRdWFsaWZpZWROYW1lLmVuZHNXaXRoKGAvJHtwYXJhbWV0ZXJOYW1lfWApO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHJlbGF0aXZlUGF0aC5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0XHRyZXR1cm4gYWN0aW9uO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvVGFyZ2V0O1xuXHR9IGVsc2Uge1xuXHRcdGlmIChiSW5jbHVkZVZpc2l0ZWRPYmplY3RzKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0YXJnZXQ6IHRhcmdldEVudGl0eVNldCxcblx0XHRcdFx0dmlzaXRlZE9iamVjdHM6IGxvY2FsT2JqZWN0c1xuXHRcdFx0fTtcblx0XHR9XG5cdFx0cmV0dXJuIHRhcmdldEVudGl0eVNldDtcblx0fVxufVxuXG5leHBvcnQgdHlwZSBSZXNvbHZlZFRhcmdldCA9IHtcblx0dGFyZ2V0PzogU2VydmljZU9iamVjdDtcblx0dmlzaXRlZE9iamVjdHM6IChTZXJ2aWNlT2JqZWN0IHwgU2luZ2xldG9uKVtdO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhvTWV0YU1vZGVsQ29udGV4dDogQ29udGV4dCwgb0VudGl0eVNldE1ldGFNb2RlbENvbnRleHQ/OiBDb250ZXh0KTogRGF0YU1vZGVsT2JqZWN0UGF0aCB7XG5cdGNvbnN0IG9Db252ZXJ0ZWRNZXRhZGF0YSA9IGNvbnZlcnRUeXBlcyhvTWV0YU1vZGVsQ29udGV4dC5nZXRNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsKTtcblx0Y29uc3QgbWV0YU1vZGVsQ29udGV4dCA9IGNvbnZlcnRNZXRhTW9kZWxDb250ZXh0KG9NZXRhTW9kZWxDb250ZXh0LCB0cnVlKTtcblx0bGV0IHRhcmdldEVudGl0eVNldExvY2F0aW9uO1xuXHRpZiAob0VudGl0eVNldE1ldGFNb2RlbENvbnRleHQgJiYgb0VudGl0eVNldE1ldGFNb2RlbENvbnRleHQuZ2V0UGF0aCgpICE9PSBcIi9cIikge1xuXHRcdHRhcmdldEVudGl0eVNldExvY2F0aW9uID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG9FbnRpdHlTZXRNZXRhTW9kZWxDb250ZXh0KTtcblx0fVxuXHRyZXR1cm4gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RGcm9tUGF0aChtZXRhTW9kZWxDb250ZXh0LCBvQ29udmVydGVkTWV0YWRhdGEsIHRhcmdldEVudGl0eVNldExvY2F0aW9uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0RnJvbVBhdGgoXG5cdG1ldGFNb2RlbENvbnRleHQ6IFJlc29sdmVkVGFyZ2V0LFxuXHRjb252ZXJ0ZWRUeXBlczogQ29udmVydGVkTWV0YWRhdGEsXG5cdHRhcmdldEVudGl0eVNldExvY2F0aW9uPzogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0b25seVNlcnZpY2VPYmplY3RzPzogYm9vbGVhblxuKTogRGF0YU1vZGVsT2JqZWN0UGF0aCB7XG5cdGNvbnN0IGRhdGFNb2RlbE9iamVjdHMgPSBtZXRhTW9kZWxDb250ZXh0LnZpc2l0ZWRPYmplY3RzLmZpbHRlcihcblx0XHQodmlzaXRlZE9iamVjdDogYW55KSA9PlxuXHRcdFx0dmlzaXRlZE9iamVjdD8uaGFzT3duUHJvcGVydHkoXCJfdHlwZVwiKSAmJiB2aXNpdGVkT2JqZWN0Ll90eXBlICE9PSBcIkVudGl0eVR5cGVcIiAmJiB2aXNpdGVkT2JqZWN0Ll90eXBlICE9PSBcIkVudGl0eUNvbnRhaW5lclwiXG5cdCk7XG5cdGlmIChcblx0XHRtZXRhTW9kZWxDb250ZXh0LnRhcmdldD8uaGFzT3duUHJvcGVydHkoXCJfdHlwZVwiKSAmJlxuXHRcdG1ldGFNb2RlbENvbnRleHQudGFyZ2V0Ll90eXBlICE9PSBcIkVudGl0eVR5cGVcIiAmJlxuXHRcdGRhdGFNb2RlbE9iamVjdHNbZGF0YU1vZGVsT2JqZWN0cy5sZW5ndGggLSAxXSAhPT0gbWV0YU1vZGVsQ29udGV4dC50YXJnZXQgJiZcblx0XHQhb25seVNlcnZpY2VPYmplY3RzXG5cdCkge1xuXHRcdGRhdGFNb2RlbE9iamVjdHMucHVzaChtZXRhTW9kZWxDb250ZXh0LnRhcmdldCk7XG5cdH1cblxuXHRjb25zdCBuYXZpZ2F0aW9uUHJvcGVydGllczogTmF2aWdhdGlvblByb3BlcnR5W10gPSBbXTtcblx0Y29uc3Qgcm9vdEVudGl0eVNldDogRW50aXR5U2V0ID0gZGF0YU1vZGVsT2JqZWN0c1swXSBhcyBFbnRpdHlTZXQ7XG5cblx0bGV0IGN1cnJlbnRFbnRpdHlTZXQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZCA9IHJvb3RFbnRpdHlTZXQ7XG5cdGxldCBjdXJyZW50RW50aXR5VHlwZTogRW50aXR5VHlwZSA9IHJvb3RFbnRpdHlTZXQuZW50aXR5VHlwZTtcblx0bGV0IGN1cnJlbnRPYmplY3Q6IFNlcnZpY2VPYmplY3QgfCB1bmRlZmluZWQ7XG5cdGxldCBuYXZpZ2F0ZWRQYXRoID0gW107XG5cblx0Zm9yIChsZXQgaSA9IDE7IGkgPCBkYXRhTW9kZWxPYmplY3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y3VycmVudE9iamVjdCA9IGRhdGFNb2RlbE9iamVjdHNbaV07XG5cblx0XHRpZiAoY3VycmVudE9iamVjdC5fdHlwZSA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIikge1xuXHRcdFx0bmF2aWdhdGVkUGF0aC5wdXNoKGN1cnJlbnRPYmplY3QubmFtZSk7XG5cdFx0XHRuYXZpZ2F0aW9uUHJvcGVydGllcy5wdXNoKGN1cnJlbnRPYmplY3QpO1xuXHRcdFx0Y3VycmVudEVudGl0eVR5cGUgPSBjdXJyZW50T2JqZWN0LnRhcmdldFR5cGU7XG5cdFx0XHRjb25zdCBib3VuZEVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkID0gY3VycmVudEVudGl0eVNldD8ubmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1tuYXZpZ2F0ZWRQYXRoLmpvaW4oXCIvXCIpXTtcblx0XHRcdGlmIChib3VuZEVudGl0eVNldCkge1xuXHRcdFx0XHRjdXJyZW50RW50aXR5U2V0ID0gYm91bmRFbnRpdHlTZXQ7XG5cdFx0XHRcdG5hdmlnYXRlZFBhdGggPSBbXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGN1cnJlbnRPYmplY3QuX3R5cGUgPT09IFwiRW50aXR5U2V0XCIgfHwgY3VycmVudE9iamVjdC5fdHlwZSA9PT0gXCJTaW5nbGV0b25cIikge1xuXHRcdFx0Y3VycmVudEVudGl0eVNldCA9IGN1cnJlbnRPYmplY3Q7XG5cdFx0XHRjdXJyZW50RW50aXR5VHlwZSA9IGN1cnJlbnRFbnRpdHlTZXQuZW50aXR5VHlwZTtcblx0XHR9XG5cdH1cblxuXHRpZiAobmF2aWdhdGVkUGF0aC5sZW5ndGggPiAwKSB7XG5cdFx0Ly8gUGF0aCB3aXRob3V0IE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcgLS0+IG5vIHRhcmdldCBlbnRpdHkgc2V0XG5cdFx0Y3VycmVudEVudGl0eVNldCA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdGlmICh0YXJnZXRFbnRpdHlTZXRMb2NhdGlvbiAmJiB0YXJnZXRFbnRpdHlTZXRMb2NhdGlvbi5zdGFydGluZ0VudGl0eVNldCAhPT0gcm9vdEVudGl0eVNldCkge1xuXHRcdC8vIEluIGNhc2UgdGhlIGVudGl0eXNldCBpcyBub3Qgc3RhcnRpbmcgZnJvbSB0aGUgc2FtZSBsb2NhdGlvbiBpdCBtYXkgbWVhbiB0aGF0IHdlIGFyZSBkb2luZyB0b28gbXVjaCB3b3JrIGVhcmxpZXIgZm9yIHNvbWUgcmVhc29uXG5cdFx0Ly8gQXMgc3VjaCB3ZSBuZWVkIHRvIHJlZGVmaW5lIHRoZSBjb250ZXh0IHNvdXJjZSBmb3IgdGhlIHRhcmdldEVudGl0eVNldExvY2F0aW9uXG5cdFx0Y29uc3Qgc3RhcnRpbmdJbmRleCA9IGRhdGFNb2RlbE9iamVjdHMuaW5kZXhPZih0YXJnZXRFbnRpdHlTZXRMb2NhdGlvbi5zdGFydGluZ0VudGl0eVNldCk7XG5cdFx0aWYgKHN0YXJ0aW5nSW5kZXggIT09IC0xKSB7XG5cdFx0XHQvLyBJZiBpdCdzIG5vdCBmb3VuZCBJIGRvbid0IGtub3cgd2hhdCB3ZSBjYW4gZG8gKHByb2JhYmx5IG5vdGhpbmcpXG5cdFx0XHRjb25zdCByZXF1aXJlZERhdGFNb2RlbE9iamVjdHMgPSBkYXRhTW9kZWxPYmplY3RzLnNsaWNlKDAsIHN0YXJ0aW5nSW5kZXgpO1xuXHRcdFx0dGFyZ2V0RW50aXR5U2V0TG9jYXRpb24uc3RhcnRpbmdFbnRpdHlTZXQgPSByb290RW50aXR5U2V0O1xuXHRcdFx0dGFyZ2V0RW50aXR5U2V0TG9jYXRpb24ubmF2aWdhdGlvblByb3BlcnRpZXMgPSByZXF1aXJlZERhdGFNb2RlbE9iamVjdHNcblx0XHRcdFx0LmZpbHRlcigob2JqZWN0OiBhbnkpID0+IG9iamVjdC5fdHlwZSA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIilcblx0XHRcdFx0LmNvbmNhdCh0YXJnZXRFbnRpdHlTZXRMb2NhdGlvbi5uYXZpZ2F0aW9uUHJvcGVydGllcykgYXMgTmF2aWdhdGlvblByb3BlcnR5W107XG5cdFx0fVxuXHR9XG5cdGNvbnN0IG91dERhdGFNb2RlbFBhdGggPSB7XG5cdFx0c3RhcnRpbmdFbnRpdHlTZXQ6IHJvb3RFbnRpdHlTZXQsXG5cdFx0dGFyZ2V0RW50aXR5U2V0OiBjdXJyZW50RW50aXR5U2V0LFxuXHRcdHRhcmdldEVudGl0eVR5cGU6IGN1cnJlbnRFbnRpdHlUeXBlLFxuXHRcdHRhcmdldE9iamVjdDogbWV0YU1vZGVsQ29udGV4dC50YXJnZXQsXG5cdFx0bmF2aWdhdGlvblByb3BlcnRpZXMsXG5cdFx0Y29udGV4dExvY2F0aW9uOiB0YXJnZXRFbnRpdHlTZXRMb2NhdGlvbixcblx0XHRjb252ZXJ0ZWRUeXBlczogY29udmVydGVkVHlwZXNcblx0fTtcblx0aWYgKCFvdXREYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdD8uaGFzT3duUHJvcGVydHkoXCJfdHlwZVwiKSAmJiBvbmx5U2VydmljZU9iamVjdHMpIHtcblx0XHRvdXREYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdCA9IGN1cnJlbnRPYmplY3Q7XG5cdH1cblx0aWYgKCFvdXREYXRhTW9kZWxQYXRoLmNvbnRleHRMb2NhdGlvbikge1xuXHRcdG91dERhdGFNb2RlbFBhdGguY29udGV4dExvY2F0aW9uID0gb3V0RGF0YU1vZGVsUGF0aDtcblx0fVxuXHRyZXR1cm4gb3V0RGF0YU1vZGVsUGF0aDtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7O0VBZ0NBLE1BQU1BLGdCQUFxQixHQUFHO0lBQzdCLDJCQUEyQixFQUFFLGNBQWM7SUFDM0MsbUJBQW1CLEVBQUUsTUFBTTtJQUMzQix1QkFBdUIsRUFBRSxVQUFVO0lBQ25DLGdDQUFnQyxFQUFFLFFBQVE7SUFDMUMsNEJBQTRCLEVBQUUsSUFBSTtJQUNsQyxpQ0FBaUMsRUFBRSxTQUFTO0lBQzVDLG1DQUFtQyxFQUFFLFdBQVc7SUFDaEQsc0NBQXNDLEVBQUUsY0FBYztJQUN0RCx1Q0FBdUMsRUFBRTtFQUMxQyxDQUFDO0VBVU0sTUFBTUMsOEJBQThCLEdBQUc7SUFDN0NDLEtBQUssRUFBRSxJQUFJO0lBQ1hDLFVBQVUsRUFBRSxJQUFJO0lBQ2hCQyxNQUFNLEVBQUUsSUFBSTtJQUNaQyxxQkFBcUIsRUFBRSxJQUFJO0lBQzNCQyxRQUFRLEVBQUU7RUFDWCxDQUFDO0VBQUM7RUFvQkYsU0FBU0Msa0JBQWtCLENBQzFCQyxnQkFBcUIsRUFDckJDLFdBQW1CLEVBQ25CQyxhQUFxQixFQUNyQkMsZ0JBQWdELEVBQ2hEQyxhQUFzQyxFQUNoQztJQUNOLElBQUlDLEtBQUs7SUFDVCxNQUFNQyxxQkFBNkIsR0FBSSxHQUFFSixhQUFjLElBQUdELFdBQVksRUFBQztJQUN2RSxNQUFNTSxnQkFBZ0IsR0FBRyxPQUFPUCxnQkFBZ0I7SUFDaEQsSUFBSUEsZ0JBQWdCLEtBQUssSUFBSSxFQUFFO01BQzlCSyxLQUFLLEdBQUc7UUFBRUcsSUFBSSxFQUFFLE1BQU07UUFBRUMsSUFBSSxFQUFFO01BQUssQ0FBQztJQUNyQyxDQUFDLE1BQU0sSUFBSUYsZ0JBQWdC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