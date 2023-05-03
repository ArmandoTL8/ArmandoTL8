/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/MetaModelConverter"], function (MetaModelConverter) {
  "use strict";

  var _exports = {};
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  let TypeOfEntity;
  (function (TypeOfEntity) {
    TypeOfEntity["TypeSingleton"] = "Singleton";
    TypeOfEntity["TypeEntity"] = "EntitySet";
  })(TypeOfEntity || (TypeOfEntity = {}));
  _exports.TypeOfEntity = TypeOfEntity;
  const ModelHelper = {
    /**
     * Method to determine if the programming model is sticky.
     *
     * @function
     * @name isStickySessionSupported
     * @param metaModel ODataModelMetaModel to check for sticky enabled entity
     * @returns Returns true if sticky, else false
     */
    isStickySessionSupported: function (metaModel) {
      const entityContainer = metaModel.getObject("/");
      for (const entitySetName in entityContainer) {
        if (entityContainer[entitySetName].$kind === "EntitySet" && metaModel.getObject(`/${entitySetName}@com.sap.vocabularies.Session.v1.StickySessionSupported`)) {
          return true;
        }
      }
      return false;
    },
    /**
     * Method to determine if the programming model is draft.
     *
     * @function
     * @name isDraftSupported
     * @param metaModel ODataModelMetaModel of the context for which draft support shall be checked
     * @param path Path for which draft support shall be checked
     * @returns Returns true if draft, else false
     */
    isDraftSupported: function (metaModel, path) {
      const metaContext = metaModel.getMetaContext(path);
      const objectPath = getInvolvedDataModelObjects(metaContext);
      return this.isObjectPathDraftSupported(objectPath);
    },
    /**
     * Checks if draft is supported for the data model object path.
     *
     * @param dataModelObjectPath
     * @returns `true` if it is supported
     */
    isObjectPathDraftSupported: function (dataModelObjectPath) {
      var _dataModelObjectPath$, _dataModelObjectPath$2, _dataModelObjectPath$3, _dataModelObjectPath$4, _dataModelObjectPath$5, _dataModelObjectPath$6, _dataModelObjectPath$7;
      const currentEntitySet = dataModelObjectPath.targetEntitySet;
      const bIsDraftRoot = ModelHelper.isDraftRoot(currentEntitySet);
      const bIsDraftNode = ModelHelper.isDraftNode(currentEntitySet);
      const bIsDraftParentEntityForContainment = (_dataModelObjectPath$ = dataModelObjectPath.targetObject) !== null && _dataModelObjectPath$ !== void 0 && _dataModelObjectPath$.containsTarget && ((_dataModelObjectPath$2 = dataModelObjectPath.startingEntitySet) !== null && _dataModelObjectPath$2 !== void 0 && (_dataModelObjectPath$3 = _dataModelObjectPath$2.annotations) !== null && _dataModelObjectPath$3 !== void 0 && (_dataModelObjectPath$4 = _dataModelObjectPath$3.Common) !== null && _dataModelObjectPath$4 !== void 0 && _dataModelObjectPath$4.DraftRoot || (_dataModelObjectPath$5 = dataModelObjectPath.startingEntitySet) !== null && _dataModelObjectPath$5 !== void 0 && (_dataModelObjectPath$6 = _dataModelObjectPath$5.annotations) !== null && _dataModelObjectPath$6 !== void 0 && (_dataModelObjectPath$7 = _dataModelObjectPath$6.Common) !== null && _dataModelObjectPath$7 !== void 0 && _dataModelObjectPath$7.DraftNode) ? true : false;
      return bIsDraftRoot || bIsDraftNode || !currentEntitySet && bIsDraftParentEntityForContainment;
    },
    /**
     * Method to determine if the service, supports collaboration draft.
     *
     * @function
     * @name isCollaborationDraftSupported
     * @param metaObject MetaObject to be used for determination
     * @param templateInterface API provided by UI5 templating if used
     * @returns Returns true if the service supports collaboration draft, else false
     */
    isCollaborationDraftSupported: function (metaObject, templateInterface) {
      var _templateInterface$co;
      const oMetaModel = (templateInterface === null || templateInterface === void 0 ? void 0 : (_templateInterface$co = templateInterface.context) === null || _templateInterface$co === void 0 ? void 0 : _templateInterface$co.getModel()) || metaObject;
      const oEntityContainer = oMetaModel.getObject("/");
      for (const sEntitySet in oEntityContainer) {
        if (oEntityContainer[sEntitySet].$kind === "EntitySet" && oMetaModel.getObject(`/${sEntitySet}@com.sap.vocabularies.Common.v1.DraftRoot/ShareAction`)) {
          return true;
        }
      }
      return false;
    },
    /**
     * Method to get the path of the DraftRoot path according to the provided context.
     *
     * @function
     * @name getDraftRootPath
     * @param oContext OdataModel context
     * @returns Returns the path of the draftRoot entity, or undefined if no draftRoot is found
     */
    getDraftRootPath: function (oContext) {
      const oMetaModel = oContext.getModel().getMetaModel();
      const getRootPath = function (sPath, model) {
        var _RegExp$exec;
        let firstIteration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        const sIterationPath = firstIteration ? sPath : (_RegExp$exec = new RegExp(/.*(?=\/)/).exec(sPath)) === null || _RegExp$exec === void 0 ? void 0 : _RegExp$exec[0]; // *Regex to get the ancestor
        if (sIterationPath && sIterationPath !== "/") {
          var _mDataModel$targetEnt, _mDataModel$targetEnt2;
          const sEntityPath = oMetaModel.getMetaPath(sIterationPath);
          const mDataModel = MetaModelConverter.getInvolvedDataModelObjects(oMetaModel.getContext(sEntityPath));
          if ((_mDataModel$targetEnt = mDataModel.targetEntitySet) !== null && _mDataModel$targetEnt !== void 0 && (_mDataModel$targetEnt2 = _mDataModel$targetEnt.annotations.Common) !== null && _mDataModel$targetEnt2 !== void 0 && _mDataModel$targetEnt2.DraftRoot) {
            return sIterationPath;
          }
          return getRootPath(sIterationPath, model, false);
        }
        return undefined;
      };
      return getRootPath(oContext.getPath(), oContext.getModel());
    },
    /**
     * Method to get the path of the StickyRoot path according to the provided context.
     *
     * @function
     * @name getStickyRootPath
     * @param oContext OdataModel context
     * @returns Returns the path of the StickyRoot entity, or undefined if no StickyRoot is found
     */
    getStickyRootPath: function (oContext) {
      const oMetaModel = oContext.getModel().getMetaModel();
      const getRootPath = function (sPath, model) {
        var _RegExp$exec2;
        let firstIteration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        const sIterationPath = firstIteration ? sPath : (_RegExp$exec2 = new RegExp(/.*(?=\/)/).exec(sPath)) === null || _RegExp$exec2 === void 0 ? void 0 : _RegExp$exec2[0]; // *Regex to get the ancestor
        if (sIterationPath && sIterationPath !== "/") {
          var _mDataModel$targetEnt3, _mDataModel$targetEnt4, _mDataModel$targetEnt5;
          const sEntityPath = oMetaModel.getMetaPath(sIterationPath);
          const mDataModel = MetaModelConverter.getInvolvedDataModelObjects(oMetaModel.getContext(sEntityPath));
          if ((_mDataModel$targetEnt3 = mDataModel.targetEntitySet) !== null && _mDataModel$targetEnt3 !== void 0 && (_mDataModel$targetEnt4 = _mDataModel$targetEnt3.annotations) !== null && _mDataModel$targetEnt4 !== void 0 && (_mDataModel$targetEnt5 = _mDataModel$targetEnt4.Session) !== null && _mDataModel$targetEnt5 !== void 0 && _mDataModel$targetEnt5.StickySessionSupported) {
            return sIterationPath;
          }
          return getRootPath(sIterationPath, model, false);
        }
        return undefined;
      };
      return getRootPath(oContext.getPath(), oContext.getModel());
    },
    /**
     * Returns the path to the target entity set via navigation property binding.
     *
     * @function
     * @name getTargetEntitySet
     * @param oContext Context for which the target entity set will be determined
     * @returns Returns the path to the target entity set
     */
    getTargetEntitySet: function (oContext) {
      const sPath = oContext.getPath();
      if (oContext.getObject("$kind") === "EntitySet" || oContext.getObject("$kind") === "Action" || oContext.getObject("0/$kind") === "Action") {
        return sPath;
      }
      const sEntitySetPath = ModelHelper.getEntitySetPath(sPath);
      return `/${oContext.getObject(sEntitySetPath)}`;
    },
    /**
     * Returns complete path to the entity set via using navigation property binding. Note: To be used only after the metamodel has loaded.
     *
     * @function
     * @name getEntitySetPath
     * @param path Path for which complete entitySet path needs to be determined from entityType path
     * @param odataMetaModel Metamodel to be used.(Optional in normal scenarios, but needed for parameterized service scenarios)
     * @returns Returns complete path to the entity set
     */
    getEntitySetPath: function (path, odataMetaModel) {
      let entitySetPath = "";
      if (!odataMetaModel) {
        // Previous implementation for getting entitySetPath from entityTypePath
        entitySetPath = `/${path.split("/").filter(ModelHelper.filterOutNavPropBinding).join("/$NavigationPropertyBinding/")}`;
      } else {
        // Calculating the entitySetPath from MetaModel.
        const pathParts = path.split("/").filter(ModelHelper.filterOutNavPropBinding);
        if (pathParts.length > 1) {
          const initialPathObject = {
            growingPath: "/",
            pendingNavPropBinding: ""
          };
          const pathObject = pathParts.reduce((pathUnderConstruction, pathPart, idx) => {
            const delimiter = !!idx && "/$NavigationPropertyBinding/" || "";
            let {
              growingPath,
              pendingNavPropBinding
            } = pathUnderConstruction;
            const tempPath = growingPath + delimiter;
            const navPropBindings = odataMetaModel.getObject(tempPath);
            const navPropBindingToCheck = pendingNavPropBinding ? `${pendingNavPropBinding}/${pathPart}` : pathPart;
            if (navPropBindings && Object.keys(navPropBindings).length > 0 && navPropBindings.hasOwnProperty(navPropBindingToCheck)) {
              growingPath = tempPath + navPropBindingToCheck.replace("/", "%2F");
              pendingNavPropBinding = "";
            } else {
              pendingNavPropBinding += pendingNavPropBinding ? `/${pathPart}` : pathPart;
            }
            return {
              growingPath,
              pendingNavPropBinding
            };
          }, initialPathObject);
          entitySetPath = pathObject.growingPath;
        } else {
          entitySetPath = `/${pathParts[0]}`;
        }
      }
      return entitySetPath;
    },
    /**
     * Gets the path for the items property of MultiValueField parameters.
     *
     * @function
     * @name getActionParameterItemsModelPath
     * @param oParameter Action Parameter
     * @returns Returns the complete model path for the items property of MultiValueField parameters
     */
    getActionParameterItemsModelPath: function (oParameter) {
      return oParameter && oParameter.$Name ? `{path: 'mvfview>/${oParameter.$Name}'}` : undefined;
    },
    filterOutNavPropBinding: function (sPathPart) {
      return sPathPart !== "" && sPathPart !== "$NavigationPropertyBinding";
    },
    /**
     * Adds a setProperty to the created binding contexts of the internal JSON model.
     *
     * @function
     * @name enhanceInternalJSONModel
     * @param {sap.ui.model.json.JSONModel} Internal JSON Model which is enhanced
     */

    enhanceInternalJSONModel: function (oInternalModel) {
      const fnBindContext = oInternalModel.bindContext;
      oInternalModel.bindContext = function (sPath, oContext, mParameters) {
        for (var _len = arguments.length, args = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
          args[_key - 3] = arguments[_key];
        }
        oContext = fnBindContext.apply(this, [sPath, oContext, mParameters, ...args]);
        const fnGetBoundContext = oContext.getBoundContext;
        oContext.getBoundContext = function () {
          for (var _len2 = arguments.length, subArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            subArgs[_key2] = arguments[_key2];
          }
          const oBoundContext = fnGetBoundContext.apply(this, ...subArgs);
          if (oBoundContext && !oBoundContext.setProperty) {
            oBoundContext.setProperty = function (sSetPropPath, value) {
              if (this.getObject() === undefined) {
                // initialize
                this.getModel().setProperty(this.getPath(), {});
              }
              this.getModel().setProperty(sSetPropPath, value, this);
            };
          }
          return oBoundContext;
        };
        return oContext;
      };
    },
    /**
     * Adds an handler on propertyChange.
     * The property "/editMode" is changed according to property '/isEditable' when this last one is set
     * in order to be compliant with former versions where building blocks use the property "/editMode"
     *
     * @function
     * @name enhanceUiJSONModel
     * @param {sap.ui.model.json.JSONModel} uiModel JSON Model which is enhanced
     * @param {object} library Core library of SAP Fiori elements
     */

    enhanceUiJSONModel: function (uiModel, library) {
      const fnSetProperty = uiModel.setProperty;
      uiModel.setProperty = function () {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }
        const value = args[1];
        if (args[0] === "/isEditable") {
          uiModel.setProperty("/editMode", value ? library.EditMode.Editable : library.EditMode.Display, args[2], args[3]);
        }
        return fnSetProperty.apply(this, [...args]);
      };
    },
    /**
     * Returns whether filtering on the table is case sensitive.
     *
     * @param oMetaModel The instance of the meta model
     * @returns Returns 'false' if FilterFunctions annotation supports 'tolower', else 'true'
     */
    isFilteringCaseSensitive: function (oMetaModel) {
      if (!oMetaModel) {
        return undefined;
      }
      const aFilterFunctions = oMetaModel.getObject("/@Org.OData.Capabilities.V1.FilterFunctions");
      // Get filter functions defined at EntityContainer and check for existence of 'tolower'
      return aFilterFunctions ? aFilterFunctions.indexOf("tolower") === -1 : true;
    },
    /**
     * Get MetaPath for the context.
     *
     * @param oContext Context to be used
     * @returns Returns the metapath for the context.
     */
    getMetaPathForContext: function (oContext) {
      const oModel = oContext.getModel(),
        oMetaModel = oModel.getMetaModel(),
        sPath = oContext.getPath();
      return oMetaModel && sPath && oMetaModel.getMetaPath(sPath);
    },
    /**
     * Get MetaPath for the context.
     *
     * @param contextPath MetaPath to be used
     * @returns Returns the root entity set path.
     */
    getRootEntitySetPath: function (contextPath) {
      let rootEntitySetPath = "";
      const aPaths = contextPath ? contextPath.split("/") : [];
      if (aPaths.length > 1) {
        rootEntitySetPath = aPaths[1];
      }
      return rootEntitySetPath;
    },
    /**
     * Get MetaPath for the listBinding.
     *
     * @param oView View of the control using listBinding
     * @param vListBinding ODataListBinding object or the binding path for a temporary list binding
     * @returns Returns the metapath for the listbinding.
     */
    getAbsoluteMetaPathForListBinding: function (oView, vListBinding) {
      const oMetaModel = oView.getModel().getMetaModel();
      let sMetaPath;
      if (typeof vListBinding === "string") {
        if (vListBinding.startsWith("/")) {
          // absolute path
          sMetaPath = oMetaModel.getMetaPath(vListBinding);
        } else {
          // relative path
          const oBindingContext = oView.getBindingContext();
          const sRootContextPath = oBindingContext.getPath();
          sMetaPath = oMetaModel.getMetaPath(`${sRootContextPath}/${vListBinding}`);
        }
      } else {
        // we already get a list binding use this one
        const oBinding = vListBinding;
        const oRootBinding = oBinding.getRootBinding();
        if (oBinding === oRootBinding) {
          // absolute path
          sMetaPath = oMetaModel.getMetaPath(oBinding.getPath());
        } else {
          // relative path
          const sRootBindingPath = oRootBinding.getPath();
          const sRelativePath = oBinding.getPath();
          sMetaPath = oMetaModel.getMetaPath(`${sRootBindingPath}/${sRelativePath}`);
        }
      }
      return sMetaPath;
    },
    /**
     * Method to determine if the draft root is supported or not.
     *
     * @function
     * @name isSingleton
     * @param entitySet EntitySet | Singleton | undefined
     * @returns True if entity type is singleton
     */
    isSingleton: function (entitySet) {
      if ((entitySet === null || entitySet === void 0 ? void 0 : entitySet._type) === TypeOfEntity.TypeSingleton) {
        return true;
      }
      return false;
    },
    /**
     * Method to determine if the draft root is supported or not.
     *
     * @function
     * @name isDraftRoot
     * @param entitySet EntitySet | Singleton | undefined
     * @returns True if draft root is present
     */
    isDraftRoot: function (entitySet) {
      var _annotations$Common;
      if (ModelHelper.isSingleton(entitySet)) {
        return false;
      }
      return entitySet && (_annotations$Common = entitySet.annotations.Common) !== null && _annotations$Common !== void 0 && _annotations$Common.DraftRoot ? true : false;
    },
    /**
     * Method to determine if the draft root is supported or not.
     *
     * @function
     * @name isDraftNode
     * @param entitySet EntitySet | Singleton | undefined
     * @returns True if draft root is present
     */
    isDraftNode: function (entitySet) {
      var _annotations$Common2;
      if (ModelHelper.isSingleton(entitySet)) {
        return false;
      }
      return entitySet && (_annotations$Common2 = entitySet.annotations.Common) !== null && _annotations$Common2 !== void 0 && _annotations$Common2.DraftNode ? true : false;
    },
    /**
     * Method to determine if the draft root is supported or not.
     *
     * @function
     * @name isSticky
     * @param entitySet EntitySet | Singleton | undefined
     * @returns True if sticky is supported else false
     */
    isSticky: function (entitySet) {
      var _annotations$Session;
      if (ModelHelper.isSingleton(entitySet)) {
        return false;
      }
      return entitySet && (_annotations$Session = entitySet.annotations.Session) !== null && _annotations$Session !== void 0 && _annotations$Session.StickySessionSupported ? true : false;
    },
    /**
     * Method to determine if entity is updatable or not.
     *
     * @function
     * @name isUpdateHidden
     * @param entitySet EntitySet | Singleton | undefined
     * @param entityType EntityType
     * @returns True if updatable else false
     */
    isUpdateHidden: function (entitySet, entityType) {
      var _annotations$UI, _annotations$UI$Updat, _annotations$UI2, _entityType$annotatio;
      if (ModelHelper.isSingleton(entitySet)) {
        return false;
      }
      return (entitySet === null || entitySet === void 0 ? void 0 : (_annotations$UI = entitySet.annotations.UI) === null || _annotations$UI === void 0 ? void 0 : (_annotations$UI$Updat = _annotations$UI.UpdateHidden) === null || _annotations$UI$Updat === void 0 ? void 0 : _annotations$UI$Updat.valueOf()) !== undefined ? entitySet === null || entitySet === void 0 ? void 0 : (_annotations$UI2 = entitySet.annotations.UI) === null || _annotations$UI2 === void 0 ? void 0 : _annotations$UI2.UpdateHidden : entityType === null || entityType === void 0 ? void 0 : (_entityType$annotatio = entityType.annotations.UI) === null || _entityType$annotatio === void 0 ? void 0 : _entityType$annotatio.UpdateHidden;
    },
    /**
     * Method to get draft root.
     *
     * @function
     * @name getDraftRoot
     * @param entitySet EntitySet | Singleton | undefined
     * @returns DraftRoot
     */
    getDraftRoot: function (entitySet) {
      var _annotations$Common3;
      if (ModelHelper.isSingleton(entitySet)) {
        return undefined;
      }
      return entitySet && ((_annotations$Common3 = entitySet.annotations.Common) === null || _annotations$Common3 === void 0 ? void 0 : _annotations$Common3.DraftRoot);
    },
    /**
     * Method to get draft root.
     *
     * @function
     * @name getDraftNode
     * @param entitySet EntitySet | Singleton | undefined
     * @returns DraftRoot
     */
    getDraftNode: function (entitySet) {
      var _annotations$Common4;
      if (ModelHelper.isSingleton(entitySet)) {
        return undefined;
      }
      return entitySet && ((_annotations$Common4 = entitySet.annotations.Common) === null || _annotations$Common4 === void 0 ? void 0 : _annotations$Common4.DraftNode);
    },
    /**
     * Helper method to get sticky session.
     *
     * @function
     * @name getStickySession
     * @param entitySet EntitySet | Singleton | undefined
     * @returns Session StickySessionSupported
     */
    getStickySession: function (entitySet) {
      var _annotations, _annotations$Session2;
      if (ModelHelper.isSingleton(entitySet)) {
        return undefined;
      }
      return entitySet && ((_annotations = entitySet.annotations) === null || _annotations === void 0 ? void 0 : (_annotations$Session2 = _annotations.Session) === null || _annotations$Session2 === void 0 ? void 0 : _annotations$Session2.StickySessionSupported);
    },
    /**
     * Method to get the visibility state of delete button.
     *
     * @function
     * @name getDeleteHidden
     * @param entitySet EntitySet | Singleton | undefined
     * @param entityType EntityType
     * @returns True if delete button is hidden
     */
    getDeleteHidden: function (entitySet, entityType) {
      var _annotations$UI3, _annotations$UI3$Dele, _annotations$UI4, _entityType$annotatio2;
      if (ModelHelper.isSingleton(entitySet)) {
        return false;
      }
      return (entitySet === null || entitySet === void 0 ? void 0 : (_annotations$UI3 = entitySet.annotations.UI) === null || _annotations$UI3 === void 0 ? void 0 : (_annotations$UI3$Dele = _annotations$UI3.DeleteHidden) === null || _annotations$UI3$Dele === void 0 ? void 0 : _annotations$UI3$Dele.valueOf()) !== undefined ? entitySet === null || entitySet === void 0 ? void 0 : (_annotations$UI4 = entitySet.annotations.UI) === null || _annotations$UI4 === void 0 ? void 0 : _annotations$UI4.DeleteHidden : entityType === null || entityType === void 0 ? void 0 : (_entityType$annotatio2 = entityType.annotations.UI) === null || _entityType$annotatio2 === void 0 ? void 0 : _entityType$annotatio2.DeleteHidden;
    }
  };
  return ModelHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUeXBlT2ZFbnRpdHkiLCJNb2RlbEhlbHBlciIsImlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsIm1ldGFNb2RlbCIsImVudGl0eUNvbnRhaW5lciIsImdldE9iamVjdCIsImVudGl0eVNldE5hbWUiLCIka2luZCIsImlzRHJhZnRTdXBwb3J0ZWQiLCJwYXRoIiwibWV0YUNvbnRleHQiLCJnZXRNZXRhQ29udGV4dCIsIm9iamVjdFBhdGgiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJpc09iamVjdFBhdGhEcmFmdFN1cHBvcnRlZCIsImRhdGFNb2RlbE9iamVjdFBhdGgiLCJjdXJyZW50RW50aXR5U2V0IiwidGFyZ2V0RW50aXR5U2V0IiwiYklzRHJhZnRSb290IiwiaXNEcmFmdFJvb3QiLCJiSXNEcmFmdE5vZGUiLCJpc0RyYWZ0Tm9kZSIsImJJc0RyYWZ0UGFyZW50RW50aXR5Rm9yQ29udGFpbm1lbnQiLCJ0YXJnZXRPYmplY3QiLCJjb250YWluc1RhcmdldCIsInN0YXJ0aW5nRW50aXR5U2V0IiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJEcmFmdFJvb3QiLCJEcmFmdE5vZGUiLCJpc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZCIsIm1ldGFPYmplY3QiLCJ0ZW1wbGF0ZUludGVyZmFjZSIsIm9NZXRhTW9kZWwiLCJjb250ZXh0IiwiZ2V0TW9kZWwiLCJvRW50aXR5Q29udGFpbmVyIiwic0VudGl0eVNldCIsImdldERyYWZ0Um9vdFBhdGgiLCJvQ29udGV4dCIsImdldE1ldGFNb2RlbCIsImdldFJvb3RQYXRoIiwic1BhdGgiLCJtb2RlbCIsImZpcnN0SXRlcmF0aW9uIiwic0l0ZXJhdGlvblBhdGgiLCJSZWdFeHAiLCJleGVjIiwic0VudGl0eVBhdGgiLCJnZXRNZXRhUGF0aCIsIm1EYXRhTW9kZWwiLCJNZXRhTW9kZWxDb252ZXJ0ZXIiLCJnZXRDb250ZXh0IiwidW5kZWZpbmVkIiwiZ2V0UGF0aCIsImdldFN0aWNreVJvb3RQYXRoIiwiU2Vzc2lvbiIsIlN0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJnZXRUYXJnZXRFbnRpdHlTZXQiLCJzRW50aXR5U2V0UGF0aCIsImdldEVudGl0eVNldFBhdGgiLCJvZGF0YU1ldGFNb2RlbCIsImVudGl0eVNldFBhdGgiLCJzcGxpdCIsImZpbHRlciIsImZpbHRlck91dE5hdlByb3BCaW5kaW5nIiwiam9pbiIsInBhdGhQYXJ0cyIsImxlbmd0aCIsImluaXRpYWxQYXRoT2JqZWN0IiwiZ3Jvd2luZ1BhdGgiLCJwZW5kaW5nTmF2UHJvcEJpbmRpbmciLCJwYXRoT2JqZWN0IiwicmVkdWNlIiwicGF0aFVuZGVyQ29uc3RydWN0aW9uIiwicGF0aFBhcnQiLCJpZHgiLCJkZWxpbWl0ZXIiLCJ0ZW1wUGF0aCIsIm5hdlByb3BCaW5kaW5ncyIsIm5hdlByb3BCaW5kaW5nVG9DaGVjayIsIk9iamVjdCIsImtleXMiLCJoYXNPd25Qcm9wZXJ0eSIsInJlcGxhY2UiLCJnZXRBY3Rpb25QYXJhbWV0ZXJJdGVtc01vZGVsUGF0aCIsIm9QYXJhbWV0ZXIiLCIkTmFtZSIsInNQYXRoUGFydCIsImVuaGFuY2VJbnRlcm5hbEpTT05Nb2RlbCIsIm9JbnRlcm5hbE1vZGVsIiwiZm5CaW5kQ29udGV4dCIsImJpbmRDb250ZXh0IiwibVBhcmFtZXRlcnMiLCJhcmdzIiwiYXBwbHkiLCJmbkdldEJvdW5kQ29udGV4dCIsImdldEJvdW5kQ29udGV4dCIsInN1YkFyZ3MiLCJvQm91bmRDb250ZXh0Iiwic2V0UHJvcGVydHkiLCJzU2V0UHJvcFBhdGgiLCJ2YWx1ZSIsImVuaGFuY2VVaUpTT05Nb2RlbCIsInVpTW9kZWwiLCJsaWJyYXJ5IiwiZm5TZXRQcm9wZXJ0eSIsIkVkaXRNb2RlIiwiRWRpdGFibGUiLCJEaXNwbGF5IiwiaXNGaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlIiwiYUZpbHRlckZ1bmN0aW9ucyIsImluZGV4T2YiLCJnZXRNZXRhUGF0aEZvckNvbnRleHQiLCJvTW9kZWwiLCJnZXRSb290RW50aXR5U2V0UGF0aCIsImNvbnRleHRQYXRoIiwicm9vdEVudGl0eVNldFBhdGgiLCJhUGF0aHMiLCJnZXRBYnNvbHV0ZU1ldGFQYXRoRm9yTGlzdEJpbmRpbmciLCJvVmlldyIsInZMaXN0QmluZGluZyIsInNNZXRhUGF0aCIsInN0YXJ0c1dpdGgiLCJvQmluZGluZ0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsInNSb290Q29udGV4dFBhdGgiLCJvQmluZGluZyIsIm9Sb290QmluZGluZyIsImdldFJvb3RCaW5kaW5nIiwic1Jvb3RCaW5kaW5nUGF0aCIsInNSZWxhdGl2ZVBhdGgiLCJpc1NpbmdsZXRvbiIsImVudGl0eVNldCIsIl90eXBlIiwiVHlwZVNpbmdsZXRvbiIsImlzU3RpY2t5IiwiaXNVcGRhdGVIaWRkZW4iLCJlbnRpdHlUeXBlIiwiVUkiLCJVcGRhdGVIaWRkZW4iLCJ2YWx1ZU9mIiwiZ2V0RHJhZnRSb290IiwiZ2V0RHJhZnROb2RlIiwiZ2V0U3RpY2t5U2Vzc2lvbiIsImdldERlbGV0ZUhpZGRlbiIsIkRlbGV0ZUhpZGRlbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiTW9kZWxIZWxwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogVGhpcyBjbGFzcyBjb250YWlucyBoZWxwZXJzIHRvIGJlIHVzZWQgYXQgcnVudGltZSB0byByZXRyaWV2ZSBmdXJ0aGVyIGluZm9ybWF0aW9uIG9uIHRoZSBtb2RlbCAqL1xuaW1wb3J0IHR5cGUgeyBFbnRpdHlTZXQsIEVudGl0eVR5cGUsIFByb3BlcnR5QW5ub3RhdGlvblZhbHVlLCBTaW5nbGV0b24gfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB0eXBlIHsgRHJhZnROb2RlLCBEcmFmdFJvb3QgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW1vblwiO1xuaW1wb3J0IHR5cGUgeyBTdGlja3lTZXNzaW9uU3VwcG9ydGVkIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9TZXNzaW9uXCI7XG5pbXBvcnQgdHlwZSB7IERlbGV0ZUhpZGRlbiB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCAqIGFzIE1ldGFNb2RlbENvbnZlcnRlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCB0eXBlIEJhc2VDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHR5cGUgeyBPRGF0YU1vZGVsRXgsIFY0Q29udGV4dCB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcbmltcG9ydCB0eXBlIHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCIuLi90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcblxuZXhwb3J0IGNvbnN0IGVudW0gVHlwZU9mRW50aXR5IHtcblx0VHlwZVNpbmdsZXRvbiA9IFwiU2luZ2xldG9uXCIsXG5cdFR5cGVFbnRpdHkgPSBcIkVudGl0eVNldFwiXG59XG5jb25zdCBNb2RlbEhlbHBlciA9IHtcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBkZXRlcm1pbmUgaWYgdGhlIHByb2dyYW1taW5nIG1vZGVsIGlzIHN0aWNreS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZFxuXHQgKiBAcGFyYW0gbWV0YU1vZGVsIE9EYXRhTW9kZWxNZXRhTW9kZWwgdG8gY2hlY2sgZm9yIHN0aWNreSBlbmFibGVkIGVudGl0eVxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRydWUgaWYgc3RpY2t5LCBlbHNlIGZhbHNlXG5cdCAqL1xuXHRpc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQ6IGZ1bmN0aW9uIChtZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsKSB7XG5cdFx0Y29uc3QgZW50aXR5Q29udGFpbmVyID0gbWV0YU1vZGVsLmdldE9iamVjdChcIi9cIik7XG5cdFx0Zm9yIChjb25zdCBlbnRpdHlTZXROYW1lIGluIGVudGl0eUNvbnRhaW5lcikge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRlbnRpdHlDb250YWluZXJbZW50aXR5U2V0TmFtZV0uJGtpbmQgPT09IFwiRW50aXR5U2V0XCIgJiZcblx0XHRcdFx0bWV0YU1vZGVsLmdldE9iamVjdChgLyR7ZW50aXR5U2V0TmFtZX1AY29tLnNhcC52b2NhYnVsYXJpZXMuU2Vzc2lvbi52MS5TdGlja3lTZXNzaW9uU3VwcG9ydGVkYClcblx0XHRcdCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZGV0ZXJtaW5lIGlmIHRoZSBwcm9ncmFtbWluZyBtb2RlbCBpcyBkcmFmdC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGlzRHJhZnRTdXBwb3J0ZWRcblx0ICogQHBhcmFtIG1ldGFNb2RlbCBPRGF0YU1vZGVsTWV0YU1vZGVsIG9mIHRoZSBjb250ZXh0IGZvciB3aGljaCBkcmFmdCBzdXBwb3J0IHNoYWxsIGJlIGNoZWNrZWRcblx0ICogQHBhcmFtIHBhdGggUGF0aCBmb3Igd2hpY2ggZHJhZnQgc3VwcG9ydCBzaGFsbCBiZSBjaGVja2VkXG5cdCAqIEByZXR1cm5zIFJldHVybnMgdHJ1ZSBpZiBkcmFmdCwgZWxzZSBmYWxzZVxuXHQgKi9cblx0aXNEcmFmdFN1cHBvcnRlZDogZnVuY3Rpb24gKG1ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsIHBhdGg6IHN0cmluZykge1xuXHRcdGNvbnN0IG1ldGFDb250ZXh0ID0gbWV0YU1vZGVsLmdldE1ldGFDb250ZXh0KHBhdGgpO1xuXHRcdGNvbnN0IG9iamVjdFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMobWV0YUNvbnRleHQpO1xuXHRcdHJldHVybiB0aGlzLmlzT2JqZWN0UGF0aERyYWZ0U3VwcG9ydGVkKG9iamVjdFBhdGgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgZHJhZnQgaXMgc3VwcG9ydGVkIGZvciB0aGUgZGF0YSBtb2RlbCBvYmplY3QgcGF0aC5cblx0ICpcblx0ICogQHBhcmFtIGRhdGFNb2RlbE9iamVjdFBhdGhcblx0ICogQHJldHVybnMgYHRydWVgIGlmIGl0IGlzIHN1cHBvcnRlZFxuXHQgKi9cblx0aXNPYmplY3RQYXRoRHJhZnRTdXBwb3J0ZWQ6IGZ1bmN0aW9uIChkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgY3VycmVudEVudGl0eVNldCA9IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0RW50aXR5U2V0IGFzIEVudGl0eVNldDtcblx0XHRjb25zdCBiSXNEcmFmdFJvb3QgPSBNb2RlbEhlbHBlci5pc0RyYWZ0Um9vdChjdXJyZW50RW50aXR5U2V0KTtcblx0XHRjb25zdCBiSXNEcmFmdE5vZGUgPSBNb2RlbEhlbHBlci5pc0RyYWZ0Tm9kZShjdXJyZW50RW50aXR5U2V0KTtcblx0XHRjb25zdCBiSXNEcmFmdFBhcmVudEVudGl0eUZvckNvbnRhaW5tZW50ID1cblx0XHRcdGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py5jb250YWluc1RhcmdldCAmJlxuXHRcdFx0KChkYXRhTW9kZWxPYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0IGFzIEVudGl0eVNldCk/LmFubm90YXRpb25zPy5Db21tb24/LkRyYWZ0Um9vdCB8fFxuXHRcdFx0XHQoZGF0YU1vZGVsT2JqZWN0UGF0aC5zdGFydGluZ0VudGl0eVNldCBhcyBFbnRpdHlTZXQpPy5hbm5vdGF0aW9ucz8uQ29tbW9uPy5EcmFmdE5vZGUpXG5cdFx0XHRcdD8gdHJ1ZVxuXHRcdFx0XHQ6IGZhbHNlO1xuXG5cdFx0cmV0dXJuIGJJc0RyYWZ0Um9vdCB8fCBiSXNEcmFmdE5vZGUgfHwgKCFjdXJyZW50RW50aXR5U2V0ICYmIGJJc0RyYWZ0UGFyZW50RW50aXR5Rm9yQ29udGFpbm1lbnQpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZGV0ZXJtaW5lIGlmIHRoZSBzZXJ2aWNlLCBzdXBwb3J0cyBjb2xsYWJvcmF0aW9uIGRyYWZ0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWRcblx0ICogQHBhcmFtIG1ldGFPYmplY3QgTWV0YU9iamVjdCB0byBiZSB1c2VkIGZvciBkZXRlcm1pbmF0aW9uXG5cdCAqIEBwYXJhbSB0ZW1wbGF0ZUludGVyZmFjZSBBUEkgcHJvdmlkZWQgYnkgVUk1IHRlbXBsYXRpbmcgaWYgdXNlZFxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRydWUgaWYgdGhlIHNlcnZpY2Ugc3VwcG9ydHMgY29sbGFib3JhdGlvbiBkcmFmdCwgZWxzZSBmYWxzZVxuXHQgKi9cblx0aXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQ6IGZ1bmN0aW9uIChtZXRhT2JqZWN0OiBhbnksIHRlbXBsYXRlSW50ZXJmYWNlPzogYW55KSB7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9ICh0ZW1wbGF0ZUludGVyZmFjZT8uY29udGV4dD8uZ2V0TW9kZWwoKSB8fCBtZXRhT2JqZWN0KSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHRjb25zdCBvRW50aXR5Q29udGFpbmVyID0gb01ldGFNb2RlbC5nZXRPYmplY3QoXCIvXCIpO1xuXHRcdGZvciAoY29uc3Qgc0VudGl0eVNldCBpbiBvRW50aXR5Q29udGFpbmVyKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdG9FbnRpdHlDb250YWluZXJbc0VudGl0eVNldF0uJGtpbmQgPT09IFwiRW50aXR5U2V0XCIgJiZcblx0XHRcdFx0b01ldGFNb2RlbC5nZXRPYmplY3QoYC8ke3NFbnRpdHlTZXR9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3QvU2hhcmVBY3Rpb25gKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIHBhdGggb2YgdGhlIERyYWZ0Um9vdCBwYXRoIGFjY29yZGluZyB0byB0aGUgcHJvdmlkZWQgY29udGV4dC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldERyYWZ0Um9vdFBhdGhcblx0ICogQHBhcmFtIG9Db250ZXh0IE9kYXRhTW9kZWwgY29udGV4dFxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRoZSBwYXRoIG9mIHRoZSBkcmFmdFJvb3QgZW50aXR5LCBvciB1bmRlZmluZWQgaWYgbm8gZHJhZnRSb290IGlzIGZvdW5kXG5cdCAqL1xuXHRnZXREcmFmdFJvb3RQYXRoOiBmdW5jdGlvbiAob0NvbnRleHQ6IFY0Q29udGV4dCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Y29uc3QgZ2V0Um9vdFBhdGggPSBmdW5jdGlvbiAoc1BhdGg6IHN0cmluZywgbW9kZWw6IE9EYXRhTW9kZWxFeCwgZmlyc3RJdGVyYXRpb24gPSB0cnVlKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRcdGNvbnN0IHNJdGVyYXRpb25QYXRoID0gZmlyc3RJdGVyYXRpb24gPyBzUGF0aCA6IG5ldyBSZWdFeHAoLy4qKD89XFwvKS8pLmV4ZWMoc1BhdGgpPy5bMF07IC8vICpSZWdleCB0byBnZXQgdGhlIGFuY2VzdG9yXG5cdFx0XHRpZiAoc0l0ZXJhdGlvblBhdGggJiYgc0l0ZXJhdGlvblBhdGggIT09IFwiL1wiKSB7XG5cdFx0XHRcdGNvbnN0IHNFbnRpdHlQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChzSXRlcmF0aW9uUGF0aCk7XG5cdFx0XHRcdGNvbnN0IG1EYXRhTW9kZWwgPSBNZXRhTW9kZWxDb252ZXJ0ZXIuZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG9NZXRhTW9kZWwuZ2V0Q29udGV4dChzRW50aXR5UGF0aCkpO1xuXHRcdFx0XHRpZiAoKG1EYXRhTW9kZWwudGFyZ2V0RW50aXR5U2V0IGFzIEVudGl0eVNldCk/LmFubm90YXRpb25zLkNvbW1vbj8uRHJhZnRSb290KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHNJdGVyYXRpb25QYXRoO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBnZXRSb290UGF0aChzSXRlcmF0aW9uUGF0aCwgbW9kZWwsIGZhbHNlKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fTtcblx0XHRyZXR1cm4gZ2V0Um9vdFBhdGgob0NvbnRleHQuZ2V0UGF0aCgpLCBvQ29udGV4dC5nZXRNb2RlbCgpKTtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgcGF0aCBvZiB0aGUgU3RpY2t5Um9vdCBwYXRoIGFjY29yZGluZyB0byB0aGUgcHJvdmlkZWQgY29udGV4dC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFN0aWNreVJvb3RQYXRoXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBPZGF0YU1vZGVsIGNvbnRleHRcblx0ICogQHJldHVybnMgUmV0dXJucyB0aGUgcGF0aCBvZiB0aGUgU3RpY2t5Um9vdCBlbnRpdHksIG9yIHVuZGVmaW5lZCBpZiBubyBTdGlja3lSb290IGlzIGZvdW5kXG5cdCAqL1xuXHRnZXRTdGlja3lSb290UGF0aDogZnVuY3Rpb24gKG9Db250ZXh0OiBWNENvbnRleHQpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdGNvbnN0IGdldFJvb3RQYXRoID0gZnVuY3Rpb24gKHNQYXRoOiBzdHJpbmcsIG1vZGVsOiBPRGF0YU1vZGVsRXgsIGZpcnN0SXRlcmF0aW9uID0gdHJ1ZSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdFx0XHRjb25zdCBzSXRlcmF0aW9uUGF0aCA9IGZpcnN0SXRlcmF0aW9uID8gc1BhdGggOiBuZXcgUmVnRXhwKC8uKig/PVxcLykvKS5leGVjKHNQYXRoKT8uWzBdOyAvLyAqUmVnZXggdG8gZ2V0IHRoZSBhbmNlc3RvclxuXHRcdFx0aWYgKHNJdGVyYXRpb25QYXRoICYmIHNJdGVyYXRpb25QYXRoICE9PSBcIi9cIikge1xuXHRcdFx0XHRjb25zdCBzRW50aXR5UGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoc0l0ZXJhdGlvblBhdGgpO1xuXHRcdFx0XHRjb25zdCBtRGF0YU1vZGVsID0gTWV0YU1vZGVsQ29udmVydGVyLmdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhvTWV0YU1vZGVsLmdldENvbnRleHQoc0VudGl0eVBhdGgpKTtcblx0XHRcdFx0aWYgKChtRGF0YU1vZGVsLnRhcmdldEVudGl0eVNldCBhcyBFbnRpdHlTZXQpPy5hbm5vdGF0aW9ucz8uU2Vzc2lvbj8uU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCkge1xuXHRcdFx0XHRcdHJldHVybiBzSXRlcmF0aW9uUGF0aDtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gZ2V0Um9vdFBhdGgoc0l0ZXJhdGlvblBhdGgsIG1vZGVsLCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH07XG5cdFx0cmV0dXJuIGdldFJvb3RQYXRoKG9Db250ZXh0LmdldFBhdGgoKSwgb0NvbnRleHQuZ2V0TW9kZWwoKSk7XG5cdH0sXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBwYXRoIHRvIHRoZSB0YXJnZXQgZW50aXR5IHNldCB2aWEgbmF2aWdhdGlvbiBwcm9wZXJ0eSBiaW5kaW5nLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0VGFyZ2V0RW50aXR5U2V0XG5cdCAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IGZvciB3aGljaCB0aGUgdGFyZ2V0IGVudGl0eSBzZXQgd2lsbCBiZSBkZXRlcm1pbmVkXG5cdCAqIEByZXR1cm5zIFJldHVybnMgdGhlIHBhdGggdG8gdGhlIHRhcmdldCBlbnRpdHkgc2V0XG5cdCAqL1xuXHRnZXRUYXJnZXRFbnRpdHlTZXQ6IGZ1bmN0aW9uIChvQ29udGV4dDogQ29udGV4dCkge1xuXHRcdGNvbnN0IHNQYXRoID0gb0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdGlmIChcblx0XHRcdG9Db250ZXh0LmdldE9iamVjdChcIiRraW5kXCIpID09PSBcIkVudGl0eVNldFwiIHx8XG5cdFx0XHRvQ29udGV4dC5nZXRPYmplY3QoXCIka2luZFwiKSA9PT0gXCJBY3Rpb25cIiB8fFxuXHRcdFx0b0NvbnRleHQuZ2V0T2JqZWN0KFwiMC8ka2luZFwiKSA9PT0gXCJBY3Rpb25cIlxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIHNQYXRoO1xuXHRcdH1cblx0XHRjb25zdCBzRW50aXR5U2V0UGF0aCA9IE1vZGVsSGVscGVyLmdldEVudGl0eVNldFBhdGgoc1BhdGgpO1xuXHRcdHJldHVybiBgLyR7b0NvbnRleHQuZ2V0T2JqZWN0KHNFbnRpdHlTZXRQYXRoKX1gO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGNvbXBsZXRlIHBhdGggdG8gdGhlIGVudGl0eSBzZXQgdmlhIHVzaW5nIG5hdmlnYXRpb24gcHJvcGVydHkgYmluZGluZy4gTm90ZTogVG8gYmUgdXNlZCBvbmx5IGFmdGVyIHRoZSBtZXRhbW9kZWwgaGFzIGxvYWRlZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldEVudGl0eVNldFBhdGhcblx0ICogQHBhcmFtIHBhdGggUGF0aCBmb3Igd2hpY2ggY29tcGxldGUgZW50aXR5U2V0IHBhdGggbmVlZHMgdG8gYmUgZGV0ZXJtaW5lZCBmcm9tIGVudGl0eVR5cGUgcGF0aFxuXHQgKiBAcGFyYW0gb2RhdGFNZXRhTW9kZWwgTWV0YW1vZGVsIHRvIGJlIHVzZWQuKE9wdGlvbmFsIGluIG5vcm1hbCBzY2VuYXJpb3MsIGJ1dCBuZWVkZWQgZm9yIHBhcmFtZXRlcml6ZWQgc2VydmljZSBzY2VuYXJpb3MpXG5cdCAqIEByZXR1cm5zIFJldHVybnMgY29tcGxldGUgcGF0aCB0byB0aGUgZW50aXR5IHNldFxuXHQgKi9cblx0Z2V0RW50aXR5U2V0UGF0aDogZnVuY3Rpb24gKHBhdGg6IHN0cmluZywgb2RhdGFNZXRhTW9kZWw/OiBPRGF0YU1ldGFNb2RlbCkge1xuXHRcdGxldCBlbnRpdHlTZXRQYXRoOiBzdHJpbmcgPSBcIlwiO1xuXHRcdGlmICghb2RhdGFNZXRhTW9kZWwpIHtcblx0XHRcdC8vIFByZXZpb3VzIGltcGxlbWVudGF0aW9uIGZvciBnZXR0aW5nIGVudGl0eVNldFBhdGggZnJvbSBlbnRpdHlUeXBlUGF0aFxuXHRcdFx0ZW50aXR5U2V0UGF0aCA9IGAvJHtwYXRoLnNwbGl0KFwiL1wiKS5maWx0ZXIoTW9kZWxIZWxwZXIuZmlsdGVyT3V0TmF2UHJvcEJpbmRpbmcpLmpvaW4oXCIvJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcvXCIpfWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIENhbGN1bGF0aW5nIHRoZSBlbnRpdHlTZXRQYXRoIGZyb20gTWV0YU1vZGVsLlxuXHRcdFx0Y29uc3QgcGF0aFBhcnRzID0gcGF0aC5zcGxpdChcIi9cIikuZmlsdGVyKE1vZGVsSGVscGVyLmZpbHRlck91dE5hdlByb3BCaW5kaW5nKTtcblx0XHRcdGlmIChwYXRoUGFydHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRjb25zdCBpbml0aWFsUGF0aE9iamVjdCA9IHtcblx0XHRcdFx0XHRncm93aW5nUGF0aDogXCIvXCIsXG5cdFx0XHRcdFx0cGVuZGluZ05hdlByb3BCaW5kaW5nOiBcIlwiXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Y29uc3QgcGF0aE9iamVjdCA9IHBhdGhQYXJ0cy5yZWR1Y2UoKHBhdGhVbmRlckNvbnN0cnVjdGlvbjogYW55LCBwYXRoUGFydDogc3RyaW5nLCBpZHg6IG51bWJlcikgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGRlbGltaXRlciA9ICghIWlkeCAmJiBcIi8kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZy9cIikgfHwgXCJcIjtcblx0XHRcdFx0XHRsZXQgeyBncm93aW5nUGF0aCwgcGVuZGluZ05hdlByb3BCaW5kaW5nIH0gPSBwYXRoVW5kZXJDb25zdHJ1Y3Rpb247XG5cdFx0XHRcdFx0Y29uc3QgdGVtcFBhdGggPSBncm93aW5nUGF0aCArIGRlbGltaXRlcjtcblx0XHRcdFx0XHRjb25zdCBuYXZQcm9wQmluZGluZ3MgPSBvZGF0YU1ldGFNb2RlbC5nZXRPYmplY3QodGVtcFBhdGgpO1xuXHRcdFx0XHRcdGNvbnN0IG5hdlByb3BCaW5kaW5nVG9DaGVjayA9IHBlbmRpbmdOYXZQcm9wQmluZGluZyA/IGAke3BlbmRpbmdOYXZQcm9wQmluZGluZ30vJHtwYXRoUGFydH1gIDogcGF0aFBhcnQ7XG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0bmF2UHJvcEJpbmRpbmdzICYmXG5cdFx0XHRcdFx0XHRPYmplY3Qua2V5cyhuYXZQcm9wQmluZGluZ3MpLmxlbmd0aCA+IDAgJiZcblx0XHRcdFx0XHRcdG5hdlByb3BCaW5kaW5ncy5oYXNPd25Qcm9wZXJ0eShuYXZQcm9wQmluZGluZ1RvQ2hlY2spXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRncm93aW5nUGF0aCA9IHRlbXBQYXRoICsgbmF2UHJvcEJpbmRpbmdUb0NoZWNrLnJlcGxhY2UoXCIvXCIsIFwiJTJGXCIpO1xuXHRcdFx0XHRcdFx0cGVuZGluZ05hdlByb3BCaW5kaW5nID0gXCJcIjtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cGVuZGluZ05hdlByb3BCaW5kaW5nICs9IHBlbmRpbmdOYXZQcm9wQmluZGluZyA/IGAvJHtwYXRoUGFydH1gIDogcGF0aFBhcnQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiB7IGdyb3dpbmdQYXRoLCBwZW5kaW5nTmF2UHJvcEJpbmRpbmcgfTtcblx0XHRcdFx0fSwgaW5pdGlhbFBhdGhPYmplY3QgYXMgYW55KTtcblxuXHRcdFx0XHRlbnRpdHlTZXRQYXRoID0gcGF0aE9iamVjdC5ncm93aW5nUGF0aDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGVudGl0eVNldFBhdGggPSBgLyR7cGF0aFBhcnRzWzBdfWA7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGVudGl0eVNldFBhdGg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIHBhdGggZm9yIHRoZSBpdGVtcyBwcm9wZXJ0eSBvZiBNdWx0aVZhbHVlRmllbGQgcGFyYW1ldGVycy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldEFjdGlvblBhcmFtZXRlckl0ZW1zTW9kZWxQYXRoXG5cdCAqIEBwYXJhbSBvUGFyYW1ldGVyIEFjdGlvbiBQYXJhbWV0ZXJcblx0ICogQHJldHVybnMgUmV0dXJucyB0aGUgY29tcGxldGUgbW9kZWwgcGF0aCBmb3IgdGhlIGl0ZW1zIHByb3BlcnR5IG9mIE11bHRpVmFsdWVGaWVsZCBwYXJhbWV0ZXJzXG5cdCAqL1xuXHRnZXRBY3Rpb25QYXJhbWV0ZXJJdGVtc01vZGVsUGF0aDogZnVuY3Rpb24gKG9QYXJhbWV0ZXI6IGFueSkge1xuXHRcdHJldHVybiBvUGFyYW1ldGVyICYmIG9QYXJhbWV0ZXIuJE5hbWUgPyBge3BhdGg6ICdtdmZ2aWV3Pi8ke29QYXJhbWV0ZXIuJE5hbWV9J31gIDogdW5kZWZpbmVkO1xuXHR9LFxuXG5cdGZpbHRlck91dE5hdlByb3BCaW5kaW5nOiBmdW5jdGlvbiAoc1BhdGhQYXJ0OiBhbnkpIHtcblx0XHRyZXR1cm4gc1BhdGhQYXJ0ICE9PSBcIlwiICYmIHNQYXRoUGFydCAhPT0gXCIkTmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1wiO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgc2V0UHJvcGVydHkgdG8gdGhlIGNyZWF0ZWQgYmluZGluZyBjb250ZXh0cyBvZiB0aGUgaW50ZXJuYWwgSlNPTiBtb2RlbC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGVuaGFuY2VJbnRlcm5hbEpTT05Nb2RlbFxuXHQgKiBAcGFyYW0ge3NhcC51aS5tb2RlbC5qc29uLkpTT05Nb2RlbH0gSW50ZXJuYWwgSlNPTiBNb2RlbCB3aGljaCBpcyBlbmhhbmNlZFxuXHQgKi9cblxuXHRlbmhhbmNlSW50ZXJuYWxKU09OTW9kZWw6IGZ1bmN0aW9uIChvSW50ZXJuYWxNb2RlbDogYW55KSB7XG5cdFx0Y29uc3QgZm5CaW5kQ29udGV4dCA9IG9JbnRlcm5hbE1vZGVsLmJpbmRDb250ZXh0O1xuXHRcdG9JbnRlcm5hbE1vZGVsLmJpbmRDb250ZXh0ID0gZnVuY3Rpb24gKHNQYXRoOiBhbnksIG9Db250ZXh0OiBhbnksIG1QYXJhbWV0ZXJzOiBhbnksIC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0XHRvQ29udGV4dCA9IGZuQmluZENvbnRleHQuYXBwbHkodGhpcywgW3NQYXRoLCBvQ29udGV4dCwgbVBhcmFtZXRlcnMsIC4uLmFyZ3NdKTtcblx0XHRcdGNvbnN0IGZuR2V0Qm91bmRDb250ZXh0ID0gb0NvbnRleHQuZ2V0Qm91bmRDb250ZXh0O1xuXG5cdFx0XHRvQ29udGV4dC5nZXRCb3VuZENvbnRleHQgPSBmdW5jdGlvbiAoLi4uc3ViQXJnczogYW55W10pIHtcblx0XHRcdFx0Y29uc3Qgb0JvdW5kQ29udGV4dCA9IGZuR2V0Qm91bmRDb250ZXh0LmFwcGx5KHRoaXMsIC4uLnN1YkFyZ3MpO1xuXHRcdFx0XHRpZiAob0JvdW5kQ29udGV4dCAmJiAhb0JvdW5kQ29udGV4dC5zZXRQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdG9Cb3VuZENvbnRleHQuc2V0UHJvcGVydHkgPSBmdW5jdGlvbiAoc1NldFByb3BQYXRoOiBhbnksIHZhbHVlOiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmICh0aGlzLmdldE9iamVjdCgpID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0Ly8gaW5pdGlhbGl6ZVxuXHRcdFx0XHRcdFx0XHR0aGlzLmdldE1vZGVsKCkuc2V0UHJvcGVydHkodGhpcy5nZXRQYXRoKCksIHt9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHRoaXMuZ2V0TW9kZWwoKS5zZXRQcm9wZXJ0eShzU2V0UHJvcFBhdGgsIHZhbHVlLCB0aGlzKTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBvQm91bmRDb250ZXh0O1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiBvQ29udGV4dDtcblx0XHR9O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGRzIGFuIGhhbmRsZXIgb24gcHJvcGVydHlDaGFuZ2UuXG5cdCAqIFRoZSBwcm9wZXJ0eSBcIi9lZGl0TW9kZVwiIGlzIGNoYW5nZWQgYWNjb3JkaW5nIHRvIHByb3BlcnR5ICcvaXNFZGl0YWJsZScgd2hlbiB0aGlzIGxhc3Qgb25lIGlzIHNldFxuXHQgKiBpbiBvcmRlciB0byBiZSBjb21wbGlhbnQgd2l0aCBmb3JtZXIgdmVyc2lvbnMgd2hlcmUgYnVpbGRpbmcgYmxvY2tzIHVzZSB0aGUgcHJvcGVydHkgXCIvZWRpdE1vZGVcIlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZW5oYW5jZVVpSlNPTk1vZGVsXG5cdCAqIEBwYXJhbSB7c2FwLnVpLm1vZGVsLmpzb24uSlNPTk1vZGVsfSB1aU1vZGVsIEpTT04gTW9kZWwgd2hpY2ggaXMgZW5oYW5jZWRcblx0ICogQHBhcmFtIHtvYmplY3R9IGxpYnJhcnkgQ29yZSBsaWJyYXJ5IG9mIFNBUCBGaW9yaSBlbGVtZW50c1xuXHQgKi9cblxuXHRlbmhhbmNlVWlKU09OTW9kZWw6IGZ1bmN0aW9uICh1aU1vZGVsOiBKU09OTW9kZWwsIGxpYnJhcnk6IGFueSkge1xuXHRcdGNvbnN0IGZuU2V0UHJvcGVydHkgPSB1aU1vZGVsLnNldFByb3BlcnR5IGFzIGFueTtcblx0XHR1aU1vZGVsLnNldFByb3BlcnR5ID0gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0XHRjb25zdCB2YWx1ZSA9IGFyZ3NbMV07XG5cdFx0XHRpZiAoYXJnc1swXSA9PT0gXCIvaXNFZGl0YWJsZVwiKSB7XG5cdFx0XHRcdHVpTW9kZWwuc2V0UHJvcGVydHkoXCIvZWRpdE1vZGVcIiwgdmFsdWUgPyBsaWJyYXJ5LkVkaXRNb2RlLkVkaXRhYmxlIDogbGlicmFyeS5FZGl0TW9kZS5EaXNwbGF5LCBhcmdzWzJdLCBhcmdzWzNdKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmblNldFByb3BlcnR5LmFwcGx5KHRoaXMsIFsuLi5hcmdzXSk7XG5cdFx0fTtcblx0fSxcblx0LyoqXG5cdCAqIFJldHVybnMgd2hldGhlciBmaWx0ZXJpbmcgb24gdGhlIHRhYmxlIGlzIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKlxuXHQgKiBAcGFyYW0gb01ldGFNb2RlbCBUaGUgaW5zdGFuY2Ugb2YgdGhlIG1ldGEgbW9kZWxcblx0ICogQHJldHVybnMgUmV0dXJucyAnZmFsc2UnIGlmIEZpbHRlckZ1bmN0aW9ucyBhbm5vdGF0aW9uIHN1cHBvcnRzICd0b2xvd2VyJywgZWxzZSAndHJ1ZSdcblx0ICovXG5cdGlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZTogZnVuY3Rpb24gKG9NZXRhTW9kZWw6IGFueSkge1xuXHRcdGlmICghb01ldGFNb2RlbCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0Y29uc3QgYUZpbHRlckZ1bmN0aW9ucyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KFwiL0BPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkZpbHRlckZ1bmN0aW9uc1wiKTtcblx0XHQvLyBHZXQgZmlsdGVyIGZ1bmN0aW9ucyBkZWZpbmVkIGF0IEVudGl0eUNvbnRhaW5lciBhbmQgY2hlY2sgZm9yIGV4aXN0ZW5jZSBvZiAndG9sb3dlcidcblx0XHRyZXR1cm4gYUZpbHRlckZ1bmN0aW9ucyA/IGFGaWx0ZXJGdW5jdGlvbnMuaW5kZXhPZihcInRvbG93ZXJcIikgPT09IC0xIDogdHJ1ZTtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IE1ldGFQYXRoIGZvciB0aGUgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgdG8gYmUgdXNlZFxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRoZSBtZXRhcGF0aCBmb3IgdGhlIGNvbnRleHQuXG5cdCAqL1xuXHRnZXRNZXRhUGF0aEZvckNvbnRleHQ6IGZ1bmN0aW9uIChvQ29udGV4dDogYW55KSB7XG5cdFx0Y29uc3Qgb01vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKSxcblx0XHRcdG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRzUGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKTtcblx0XHRyZXR1cm4gb01ldGFNb2RlbCAmJiBzUGF0aCAmJiBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHNQYXRoKTtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IE1ldGFQYXRoIGZvciB0aGUgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHRQYXRoIE1ldGFQYXRoIHRvIGJlIHVzZWRcblx0ICogQHJldHVybnMgUmV0dXJucyB0aGUgcm9vdCBlbnRpdHkgc2V0IHBhdGguXG5cdCAqL1xuXHRnZXRSb290RW50aXR5U2V0UGF0aDogZnVuY3Rpb24gKGNvbnRleHRQYXRoOiBzdHJpbmcpIHtcblx0XHRsZXQgcm9vdEVudGl0eVNldFBhdGggPSBcIlwiO1xuXHRcdGNvbnN0IGFQYXRocyA9IGNvbnRleHRQYXRoID8gY29udGV4dFBhdGguc3BsaXQoXCIvXCIpIDogW107XG5cdFx0aWYgKGFQYXRocy5sZW5ndGggPiAxKSB7XG5cdFx0XHRyb290RW50aXR5U2V0UGF0aCA9IGFQYXRoc1sxXTtcblx0XHR9XG5cdFx0cmV0dXJuIHJvb3RFbnRpdHlTZXRQYXRoO1xuXHR9LFxuXHQvKipcblx0ICogR2V0IE1ldGFQYXRoIGZvciB0aGUgbGlzdEJpbmRpbmcuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVmlldyBWaWV3IG9mIHRoZSBjb250cm9sIHVzaW5nIGxpc3RCaW5kaW5nXG5cdCAqIEBwYXJhbSB2TGlzdEJpbmRpbmcgT0RhdGFMaXN0QmluZGluZyBvYmplY3Qgb3IgdGhlIGJpbmRpbmcgcGF0aCBmb3IgYSB0ZW1wb3JhcnkgbGlzdCBiaW5kaW5nXG5cdCAqIEByZXR1cm5zIFJldHVybnMgdGhlIG1ldGFwYXRoIGZvciB0aGUgbGlzdGJpbmRpbmcuXG5cdCAqL1xuXHRnZXRBYnNvbHV0ZU1ldGFQYXRoRm9yTGlzdEJpbmRpbmc6IGZ1bmN0aW9uIChvVmlldzogVmlldywgdkxpc3RCaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nIHwgc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9WaWV3LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cdFx0bGV0IHNNZXRhUGF0aDtcblxuXHRcdGlmICh0eXBlb2Ygdkxpc3RCaW5kaW5nID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRpZiAodkxpc3RCaW5kaW5nLnN0YXJ0c1dpdGgoXCIvXCIpKSB7XG5cdFx0XHRcdC8vIGFic29sdXRlIHBhdGhcblx0XHRcdFx0c01ldGFQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aCh2TGlzdEJpbmRpbmcpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gcmVsYXRpdmUgcGF0aFxuXHRcdFx0XHRjb25zdCBvQmluZGluZ0NvbnRleHQgPSBvVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdFx0XHRjb25zdCBzUm9vdENvbnRleHRQYXRoID0gb0JpbmRpbmdDb250ZXh0IS5nZXRQYXRoKCk7XG5cdFx0XHRcdHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoYCR7c1Jvb3RDb250ZXh0UGF0aH0vJHt2TGlzdEJpbmRpbmd9YCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHdlIGFscmVhZHkgZ2V0IGEgbGlzdCBiaW5kaW5nIHVzZSB0aGlzIG9uZVxuXHRcdFx0Y29uc3Qgb0JpbmRpbmcgPSB2TGlzdEJpbmRpbmc7XG5cdFx0XHRjb25zdCBvUm9vdEJpbmRpbmcgPSBvQmluZGluZy5nZXRSb290QmluZGluZygpO1xuXHRcdFx0aWYgKG9CaW5kaW5nID09PSBvUm9vdEJpbmRpbmcpIHtcblx0XHRcdFx0Ly8gYWJzb2x1dGUgcGF0aFxuXHRcdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9CaW5kaW5nLmdldFBhdGgoKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyByZWxhdGl2ZSBwYXRoXG5cdFx0XHRcdGNvbnN0IHNSb290QmluZGluZ1BhdGggPSBvUm9vdEJpbmRpbmchLmdldFBhdGgoKTtcblx0XHRcdFx0Y29uc3Qgc1JlbGF0aXZlUGF0aCA9IG9CaW5kaW5nLmdldFBhdGgoKTtcblx0XHRcdFx0c01ldGFQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChgJHtzUm9vdEJpbmRpbmdQYXRofS8ke3NSZWxhdGl2ZVBhdGh9YCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBzTWV0YVBhdGg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBkZXRlcm1pbmUgaWYgdGhlIGRyYWZ0IHJvb3QgaXMgc3VwcG9ydGVkIG9yIG5vdC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGlzU2luZ2xldG9uXG5cdCAqIEBwYXJhbSBlbnRpdHlTZXQgRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkXG5cdCAqIEByZXR1cm5zIFRydWUgaWYgZW50aXR5IHR5cGUgaXMgc2luZ2xldG9uXG5cdCAqL1xuXHRpc1NpbmdsZXRvbjogZnVuY3Rpb24gKGVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkKTogYm9vbGVhbiB7XG5cdFx0aWYgKGVudGl0eVNldD8uX3R5cGUgPT09IFR5cGVPZkVudGl0eS5UeXBlU2luZ2xldG9uKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGRldGVybWluZSBpZiB0aGUgZHJhZnQgcm9vdCBpcyBzdXBwb3J0ZWQgb3Igbm90LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNEcmFmdFJvb3Rcblx0ICogQHBhcmFtIGVudGl0eVNldCBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWRcblx0ICogQHJldHVybnMgVHJ1ZSBpZiBkcmFmdCByb290IGlzIHByZXNlbnRcblx0ICovXG5cdGlzRHJhZnRSb290OiBmdW5jdGlvbiAoZW50aXR5U2V0OiBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWQpOiBib29sZWFuIHtcblx0XHRpZiAoTW9kZWxIZWxwZXIuaXNTaW5nbGV0b24oZW50aXR5U2V0KSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gZW50aXR5U2V0ICYmIChlbnRpdHlTZXQgYXMgRW50aXR5U2V0KS5hbm5vdGF0aW9ucy5Db21tb24/LkRyYWZ0Um9vdCA/IHRydWUgOiBmYWxzZTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBkZXRlcm1pbmUgaWYgdGhlIGRyYWZ0IHJvb3QgaXMgc3VwcG9ydGVkIG9yIG5vdC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGlzRHJhZnROb2RlXG5cdCAqIEBwYXJhbSBlbnRpdHlTZXQgRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkXG5cdCAqIEByZXR1cm5zIFRydWUgaWYgZHJhZnQgcm9vdCBpcyBwcmVzZW50XG5cdCAqL1xuXHRpc0RyYWZ0Tm9kZTogZnVuY3Rpb24gKGVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkKTogYm9vbGVhbiB7XG5cdFx0aWYgKE1vZGVsSGVscGVyLmlzU2luZ2xldG9uKGVudGl0eVNldCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIGVudGl0eVNldCAmJiAoZW50aXR5U2V0IGFzIEVudGl0eVNldCkuYW5ub3RhdGlvbnMuQ29tbW9uPy5EcmFmdE5vZGUgPyB0cnVlIDogZmFsc2U7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZGV0ZXJtaW5lIGlmIHRoZSBkcmFmdCByb290IGlzIHN1cHBvcnRlZCBvciBub3QuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBpc1N0aWNreVxuXHQgKiBAcGFyYW0gZW50aXR5U2V0IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZFxuXHQgKiBAcmV0dXJucyBUcnVlIGlmIHN0aWNreSBpcyBzdXBwb3J0ZWQgZWxzZSBmYWxzZVxuXHQgKi9cblx0aXNTdGlja3k6IGZ1bmN0aW9uIChlbnRpdHlTZXQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZCk6IGJvb2xlYW4ge1xuXHRcdGlmIChNb2RlbEhlbHBlci5pc1NpbmdsZXRvbihlbnRpdHlTZXQpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiBlbnRpdHlTZXQgJiYgKGVudGl0eVNldCBhcyBFbnRpdHlTZXQpLmFubm90YXRpb25zLlNlc3Npb24/LlN0aWNreVNlc3Npb25TdXBwb3J0ZWQgPyB0cnVlIDogZmFsc2U7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZGV0ZXJtaW5lIGlmIGVudGl0eSBpcyB1cGRhdGFibGUgb3Igbm90LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNVcGRhdGVIaWRkZW5cblx0ICogQHBhcmFtIGVudGl0eVNldCBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWRcblx0ICogQHBhcmFtIGVudGl0eVR5cGUgRW50aXR5VHlwZVxuXHQgKiBAcmV0dXJucyBUcnVlIGlmIHVwZGF0YWJsZSBlbHNlIGZhbHNlXG5cdCAqL1xuXHRpc1VwZGF0ZUhpZGRlbjogZnVuY3Rpb24gKGVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkLCBlbnRpdHlUeXBlOiBFbnRpdHlUeXBlKTogUHJvcGVydHlBbm5vdGF0aW9uVmFsdWU8Ym9vbGVhbj4ge1xuXHRcdGlmIChNb2RlbEhlbHBlci5pc1NpbmdsZXRvbihlbnRpdHlTZXQpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiAoXG5cdFx0XHQoZW50aXR5U2V0IGFzIEVudGl0eVNldCk/LmFubm90YXRpb25zLlVJPy5VcGRhdGVIaWRkZW4/LnZhbHVlT2YoKSAhPT0gdW5kZWZpbmVkXG5cdFx0XHRcdD8gKGVudGl0eVNldCBhcyBFbnRpdHlTZXQpPy5hbm5vdGF0aW9ucy5VST8uVXBkYXRlSGlkZGVuXG5cdFx0XHRcdDogZW50aXR5VHlwZT8uYW5ub3RhdGlvbnMuVUk/LlVwZGF0ZUhpZGRlblxuXHRcdCkgYXMgUHJvcGVydHlBbm5vdGF0aW9uVmFsdWU8Ym9vbGVhbj47XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IGRyYWZ0IHJvb3QuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXREcmFmdFJvb3Rcblx0ICogQHBhcmFtIGVudGl0eVNldCBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWRcblx0ICogQHJldHVybnMgRHJhZnRSb290XG5cdCAqL1xuXHRnZXREcmFmdFJvb3Q6IGZ1bmN0aW9uIChlbnRpdHlTZXQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZCk6IERyYWZ0Um9vdCB8IHVuZGVmaW5lZCB7XG5cdFx0aWYgKE1vZGVsSGVscGVyLmlzU2luZ2xldG9uKGVudGl0eVNldCkpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdHJldHVybiBlbnRpdHlTZXQgJiYgKGVudGl0eVNldCBhcyBFbnRpdHlTZXQpLmFubm90YXRpb25zLkNvbW1vbj8uRHJhZnRSb290O1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCBkcmFmdCByb290LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0RHJhZnROb2RlXG5cdCAqIEBwYXJhbSBlbnRpdHlTZXQgRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkXG5cdCAqIEByZXR1cm5zIERyYWZ0Um9vdFxuXHQgKi9cblx0Z2V0RHJhZnROb2RlOiBmdW5jdGlvbiAoZW50aXR5U2V0OiBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWQpOiBEcmFmdE5vZGUgfCB1bmRlZmluZWQge1xuXHRcdGlmIChNb2RlbEhlbHBlci5pc1NpbmdsZXRvbihlbnRpdHlTZXQpKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRyZXR1cm4gZW50aXR5U2V0ICYmIChlbnRpdHlTZXQgYXMgRW50aXR5U2V0KS5hbm5vdGF0aW9ucy5Db21tb24/LkRyYWZ0Tm9kZTtcblx0fSxcblx0LyoqXG5cdCAqIEhlbHBlciBtZXRob2QgdG8gZ2V0IHN0aWNreSBzZXNzaW9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0U3RpY2t5U2Vzc2lvblxuXHQgKiBAcGFyYW0gZW50aXR5U2V0IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZFxuXHQgKiBAcmV0dXJucyBTZXNzaW9uIFN0aWNreVNlc3Npb25TdXBwb3J0ZWRcblx0ICovXG5cdGdldFN0aWNreVNlc3Npb246IGZ1bmN0aW9uIChlbnRpdHlTZXQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZCk6IFN0aWNreVNlc3Npb25TdXBwb3J0ZWQgfCB1bmRlZmluZWQge1xuXHRcdGlmIChNb2RlbEhlbHBlci5pc1NpbmdsZXRvbihlbnRpdHlTZXQpKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRyZXR1cm4gZW50aXR5U2V0ICYmIChlbnRpdHlTZXQgYXMgRW50aXR5U2V0KS5hbm5vdGF0aW9ucz8uU2Vzc2lvbj8uU3RpY2t5U2Vzc2lvblN1cHBvcnRlZDtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIHZpc2liaWxpdHkgc3RhdGUgb2YgZGVsZXRlIGJ1dHRvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldERlbGV0ZUhpZGRlblxuXHQgKiBAcGFyYW0gZW50aXR5U2V0IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZFxuXHQgKiBAcGFyYW0gZW50aXR5VHlwZSBFbnRpdHlUeXBlXG5cdCAqIEByZXR1cm5zIFRydWUgaWYgZGVsZXRlIGJ1dHRvbiBpcyBoaWRkZW5cblx0ICovXG5cdGdldERlbGV0ZUhpZGRlbjogZnVuY3Rpb24gKGVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkLCBlbnRpdHlUeXBlOiBFbnRpdHlUeXBlKTogRGVsZXRlSGlkZGVuIHwgQm9vbGVhbiB8IHVuZGVmaW5lZCB7XG5cdFx0aWYgKE1vZGVsSGVscGVyLmlzU2luZ2xldG9uKGVudGl0eVNldCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIChlbnRpdHlTZXQgYXMgRW50aXR5U2V0KT8uYW5ub3RhdGlvbnMuVUk/LkRlbGV0ZUhpZGRlbj8udmFsdWVPZigpICE9PSB1bmRlZmluZWRcblx0XHRcdD8gKGVudGl0eVNldCBhcyBFbnRpdHlTZXQpPy5hbm5vdGF0aW9ucy5VST8uRGVsZXRlSGlkZGVuXG5cdFx0XHQ6IGVudGl0eVR5cGU/LmFubm90YXRpb25zLlVJPy5EZWxldGVIaWRkZW47XG5cdH1cbn07XG5cbmV4cG9ydCB0eXBlIEludGVybmFsTW9kZWxDb250ZXh0ID0geyBnZXRNb2RlbCgpOiBKU09OTW9kZWwgfSAmIEJhc2VDb250ZXh0ICYge1xuXHRcdHNldFByb3BlcnR5KHNQYXRoOiBzdHJpbmcsIHZWYWx1ZTogYW55KTogdm9pZDtcblx0fTtcblxuZXhwb3J0IGRlZmF1bHQgTW9kZWxIZWxwZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7OztNQWdCa0JBLFlBQVk7RUFBQSxXQUFaQSxZQUFZO0lBQVpBLFlBQVk7SUFBWkEsWUFBWTtFQUFBLEdBQVpBLFlBQVksS0FBWkEsWUFBWTtFQUFBO0VBSTlCLE1BQU1DLFdBQVcsR0FBRztJQUNuQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLHdCQUF3QixFQUFFLFVBQVVDLFNBQXlCLEVBQUU7TUFDOUQsTUFBTUMsZUFBZSxHQUFHRCxTQUFTLENBQUNFLFNBQVMsQ0FBQyxHQUFHLENBQUM7TUFDaEQsS0FBSyxNQUFNQyxhQUFhLElBQUlGLGVBQWUsRUFBRTtRQUM1QyxJQUNDQSxlQUFlLENBQUNFLGFBQWEsQ0FBQyxDQUFDQyxLQUFLLEtBQUssV0FBVyxJQUNwREosU0FBUyxDQUFDRSxTQUFTLENBQUUsSUFBR0MsYUFBYyx5REFBd0QsQ0FBQyxFQUM5RjtVQUNELE9BQU8sSUFBSTtRQUNaO01BQ0Q7TUFDQSxPQUFPLEtBQUs7SUFDYixDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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