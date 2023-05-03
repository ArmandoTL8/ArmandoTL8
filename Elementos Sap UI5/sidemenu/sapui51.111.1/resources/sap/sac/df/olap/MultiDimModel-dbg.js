/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap, Promise */
sap.ui.define("sap/sac/df/olap/MultiDimModel", ["sap/base/Log", "sap/ui/model/Model",//
  "sap/ui/model/Context", "sap/sac/df/types/ValueType", "sap/sac/df/olap/SystemLandscape", //
  "sap/sac/df/utils/SyncActionHelper", "sap/sac/df/utils/ResultSetHelper", "sap/sac/df/utils/ListHelper", //
  "sap/sac/df/DFKernel", "sap/sac/df/olap/OlapListBinding", "sap/sac/df/olap/OlapListGridBinding", //
  "sap/sac/df/olap/OlapPropertyBinding", "sap/sac/df/olap/MultiDimDataProvider", //
  "sap/sac/df/utils/ResourceBundle",  "sap/sac/df/fa/AdvancedStylingProvider", //
  "sap/sac/df/thirdparty/lodash", "sap/sac/df/firefly/library", "sap/sac/df/fa/FinStyle"], /* eslint-disable max-params */

function (Log, Model, Context, ValueType, SystemLandscape, SyncActionHelper, ResultSetHelper, ListHelper, //
  DFKernel, OlapListBinding, OlapListGridBinding, OlapPropertyBinding, DataProvider, ResourceBundle, StylingProvider, _, FF, FinStyle) {
  /* eslint-enable max-params */
  "use strict";
  var rS2D = new RegExp("/", "g");
  /**
     * Constructor for a new OlapMode.
     *
     * The Olap Model allows to access and change data from servers providing the InA Protocol.
     *
     * @class
     * Model implementation for InA provider
     *
     * The MultiDimModel can populate it's exposed data via Binding to Controls. The structure of
     * the exposed data is as follows:
     *  <b>Structure of Exposed Data</b>
     *
     * <ul>
     * <li>DataProvider: The associative array of all <code>DataProvider</code> aggregated by the <MultiDimModel> </li>
     * <li>SemanticStyles: The associative array of all <code>SemanticStyle</code> for the <code>MultiDimModel</code>
     * <li>VariableGroups: The associative array of registered Variable Groups
     * <li>Messages: The list of all messages posted by the Analytical Engine
     * </ul>
     *
     * @extends sap.sac.df.DFKernel
     * @author SAP SE
     * @version 1.111.0
     * @public
     * @experimental
     * @alias sap.sac.df.olap.MultiDimModel
     */
  var MultiDimModel = DFKernel.extend("sap.sac.df.olap.MultiDimModel", {
    constructor: function (mSettings) {
      this.stylingProvider = new StylingProvider();
      // Hardcode it for the moment;
      this.stylingProvider.registerAdvancedStylingTemplate("fin", FinStyle);
      var that = this;
      var oFinalSettings = mSettings || {};

      oFinalSettings.systemLandscape = oFinalSettings.systemLandscape || SystemLandscape;
      oFinalSettings.systemType = oFinalSettings.systemType || "BW";
      oFinalSettings.masterSystem = oFinalSettings.masterSystem || "local" + oFinalSettings.systemType;
      DFKernel.apply(that, [oFinalSettings]);
      var oModelData = null;
      var oBindings = {};
      var oVariableGroupMapping = {};

      var initCompletedPromise = that.init(oFinalSettings).then(function () {
        var oSession = that.getSession();
        oSession.setXVersion(FF.XVersion.V190_METADATA_CUBE_RESPONSE_SUPPRESS_PROPERTIES);
        oSession.deactivateFeatureToggle(FF.FeatureToggleOlap.FUSION_SERVICE);
        FF.XStream.of(FF.FeatureToggleOlap.getAllFeatureToggles()).forEach(function (toggle) {
          var xVersion = toggle.getXVersion();
          if (xVersion > FF.FeatureToggleOlap.FUSION_SERVICE.getXVersion() && xVersion <= FF.XVersion.MAX) {
            oSession.activateFeatureToggle(toggle);
          }
        });
        oSession.activateFeatureToggle(FF.FeatureToggleOlap.METADATA_CACHING);
        FF.UiLocalizationCenter.setExternalLocalizationProvider(ResourceBundle);
        FF.UiLocalizationCenter.getCenter().setProductive(true);
        //FF.UiLocalizationCenter.getCenter().getLocalizationProviderByName(FF.OuDimensionDialog2.DEFAULT_PROGRAM_NAME).m_isProductive = true;
      }).then(function () {
        oModelData = {
          ColLimit: 50, RowLimit: 150, DataProvider: {}, VariableGroups: {}, SemanticStyles: {}, Messages: []
        };
        that.checkUpdate();
      });


      /**
         * @param {string} lang code of Language to be used in the subsequent data access calls
         * @public
         */
      that.setDataAccessLanguage = function (lang) {
        var systemLandscape = that.getApplication().getSystemLandscape();
        var systemNames = systemLandscape.getSystemNames();
        for (var snk = 0; snk < systemNames.size(); snk++) {
          systemLandscape.getSystemDescription(systemNames.get(snk)).setLanguage(lang);
        }
      };

      /**
         * Exposes the limits of the rows and columns for bindings
         *
         * @return {object} the limits that are exposed for bindings
         */
      that.getLimit = function () {
        return {
          RowLimit: oModelData.RowLimit, ColLimit: oModelData.ColLimit
        };
      };

      /**
         * Adds a variable group to the model
         *
         * A Variable group defines what variables of teh underlying DataProvider behave in as one variable
         * The group is defined by a name and a Rule.
         * Rule is a function which accept the variable definition and decides if the variable has to be part of te group
         * The first added variable becomes automatically the MergedVariable.
         *
         * The VariableGroup can be accessed/bound via the properties of MultiDimModel a
         * @param {string} groupName the name of the variable
         * @param {function} variableRule function returning a boolean
         * @param {Object} oProperties additional properties
         * @public
         */
      that.addVariableGroup = function (groupName, variableRule, oProperties) {
        oModelData.VariableGroups[groupName] = {
          Name: groupName, Rule: variableRule, MergedVariable: null
        };
        Object.assign(oModelData.VariableGroups[groupName], oProperties);
        updateVariableGroup(groupName);
      };
      /**
         * Adds a new query as a new <code>DataProvider</code> .
         *            *
         * @param {string} sDataProviderName  the name of the new <code>DataProvider</code>.
         * @param {string} sQueryName the name of the query which the <code>DataProvider</code> is supposed to expose.
         * @param {string} [sSystem] the name of the system in the landscape
         * @param {string} [sPackage] the name of the package
         * @param {string} [sSchema] the name of the schema
         * @param {string} [sType] the name of the type of the datasource
         * @public
         * @returns {Promise<sap.sac.df.olap.MultiDimDataProvider>} Promise which resolves the Data Provider that was created
         */
      that.addQuery = function (sDataProviderName, sQueryName, sSystem, sPackage, sSchema, sType) {
        var systemName = sSystem || this.masterSystemName;
        var dataProvider = oModelData.DataProvider[sDataProviderName];
        oModelData.DataProvider[sDataProviderName] = null;
        return ensurePlanningService(systemName).then(function () {
          if (!dataProvider) return;
          return dataProvider.logoff();
        }).then(function () {
          var oQueryConfigService = FF.QueryServiceConfig.createWithDataSourceName(that.getApplication(), null, sQueryName);
          oQueryConfigService.setMode(FF.QueryManagerMode.DEFAULT);
          oQueryConfigService.setProviderType(FF.ProviderType.ANALYTICS);
          oQueryConfigService.setSupportsDimensionLazyLoad(true);
          // Data source name format : $[][][MY_DATA_AREA]/query:[][][QueryName]
          var sDataSourceName = ["$[][][MY_DATA_AREA]/", (sType || "query"), ":", "[", (sSchema ? sSchema : ""), "]", "[", ((sSchema || sPackage) ? sPackage : ""), "]", "[", sQueryName, "]"].join("");
          oQueryConfigService.setDataSourceByName(sDataSourceName);
          oQueryConfigService.setSystemName(systemName);

          return SyncActionHelper.syncActionToPromise(oQueryConfigService.processQueryManagerCreation, oQueryConfigService, []);
        }).then(function (oQueryManager) {
          oModelData.DataProvider[sDataProviderName] = new DataProvider(that, that.getApplication(), oQueryManager, sDataProviderName);
          updateVariableGroup();
          that.fireEvent("queryAdded", {
            dataProviderName: sDataProviderName
          });
          return oModelData.DataProvider[sDataProviderName];
        }).catch(function (oError) {
          that.addMessages(oError.getMessages ? oError.getMessages() : []);
          return Promise.reject(oError);

        });

      };
      /**
         * Sets new value to VariableGroup
         *
         * @param {string} sVariableGroupName name of the group to be updated
         * @param {object} variableValue the value of the variable
         * @returns Promise<void> which resolve when the value is set
         */
      that.setVariableGroupValue = function (sVariableGroupName, variableValue) {
        var oVariableGroup = oModelData.VariableGroups[sVariableGroupName];
        var dataProviderName = oVariableGroup.MergedVariable.DataProviderName;
        return oModelData.DataProvider[dataProviderName].setVariableValue(oVariableGroup.MergedVariable.Name, variableValue).then(function () {
          updateVariableGroup(sVariableGroupName);
          return that.checkUpdate();
        });
      };

      /**
         * Updates the MultiDimModel from the given the model state  including all aggregated <code>MultiDimDataProvider</code>s
         *
         * @param {object} oModelState the JSON object containing the persisted state of th MultiDimModel to be applied.
         * @return Promise<sac.sap.df.MultiDimModel> Promise which resolves to the updated instance of the OlapModel.
         * @public
         */
      that.deserialize = function (oModelState) {
        oModelData.DataProvider = oModelData.DataProvider || {};
        oModelData.SemanticStyles = oModelState.SemanticStyles || [];
        return initCompletedPromise.then(function () {
          var createDPPromises = [];
          _.forEach(oModelState.DataProvider, function (sDef, sName) {
            var dataProvider = oModelData.DataProvider[sName];
            if (!dataProvider) {
              var oQueryConfigService = FF.QueryServiceConfig.createByDefinition(that.getApplication(), null, FF.XContent.createStringContent(FF.QModelFormat.INA_REPOSITORY, sDef));
              createDPPromises.push(SyncActionHelper.syncActionToPromise(oQueryConfigService.processQueryManagerCreation, oQueryConfigService, []).then(function (oQueryManager) {
                oModelData.DataProvider[sName] = new DataProvider(that, that.getApplication(), oQueryManager, sName);
              }));
            } else {
              createDPPromises.push(dataProvider.deserialize(sDef));
            }
          });
          return Promise.all(createDPPromises);
        }).then(function () {
          updateVariableGroup();
          return that.checkUpdate();
        });
      };
      /**
         * Serialize the Model with all aggregated <code>DataProvider</code> to a JSON representation
         * The <code>MultiDimModel</code> to be deserialized from an equivalent such Object.
         * @return {object} a javascript object which represents the <code>MultiDimModel</code>.
         * @public
         */
      that.serialize = function () {
        return {
          DataProvider: _.reduce(oModelData.DataProvider, function (oResult, dp) {
            oResult[dp.Name] = dp.serialize();
            return oResult;
          }, {}), SemanticStyles: that.getSemanticStyles()
        };
      };

      /**
         * Opens the value help dialog so the user choose a value for a VariableGroup
         *
         * After the value is selected only teh VariableGroup.MergedVariable is updated. The variables of the aggregated MultiDimDataProviders are updated with the next ResultSet fetch
         * @param {string} sVariableGroup the name of the VariableGroup to update the variable for
         * @return {Promise<boolean>} to indicate if the VariableGroup has been updated
         * @public
         */
      that.openVariableSelector = function (sVariableGroup) {
        return Promise.resolve(null).then(function () {
          var variableGroup = oModelData.VariableGroups[sVariableGroup];
          if (!variableGroup) {
            throw new Error("Invalid VariableGroup: " + sVariableGroup);
          }
          if (!variableGroup.MergedVariable) {
            return false;
          }
          var oDP = oModelData.DataProvider[variableGroup.MergedVariable.DataProviderName];
          return oDP.openVariableSelector(variableGroup.MergedVariable.Name).then(function (aSelection) {
            if (!aSelection) {
              return false;
            }
            updateVariableGroup(sVariableGroup);
            that.checkUpdate();
            return true;
          });
        });
      };
      /**
         * Performs the search in values of a given VariableGroup
         *
         * @param {string} sVariableGroup the name of the VariableGroup to search
         * @param {string} sSearchString string to search for
         * @param {boolean} bFuzzy if a fuzzy search is performed
         * @return {Promise<object[]>} array with found values
         * @public
         */
      that.searchVariableValues = function (sVariableGroup, sSearchString, bFuzzy) {
        return Promise.resolve(null).then(function () {
          var variableGroup = oModelData.VariableGroups[sVariableGroup];
          if (!variableGroup) {
            throw new Error("Invalid VariableGroup: " + sVariableGroup);
          }
          if (!variableGroup.MergedVariable) {
            return false;
          }
          var oDP = oModelData.DataProvider[variableGroup.MergedVariable.DataProviderName];
          return oDP.searchVariableValues(variableGroup.MergedVariable.Name, sSearchString, bFuzzy);
        });
      };
      /**
         * Ensures all aggregated DataProviders are logged off.
         *
         * @returns {Promise<void>} Promise which resolves when logoff is finished.
         * @public
         */
      that.logoff = function () {
        return Promise.all(_.invokeMap(oModelData.DataProvider, "logoff"));
      };

      /**
         * Synchronizes all aggregated DataProviders by fetching their ResultSet.
         *
         * If the user does not choose an Analytic Query, then the promise is rejected
         *
         * @param {string[]} aDataProviderNames List of data provider that are to be synchronized (all if not supplied)
         * @return {Promise<sap.sac.df.olap.MultiDimModel>} the MultiDimModel, to allow chaining
         * @public
         */
      that.synchronize = function (aDataProviderNames) {
        var aTargets = aDataProviderNames ? _.filter(oModelData.DataProvider, function (oDataProvider) {
          return aDataProviderNames.includes(oDataProvider.Name);
        }) : oModelData.DataProvider;
        var getRSPromises = _.invokeMap(aTargets, "getResultSet");
        return Promise.all(getRSPromises).then(function () {
          return that.checkUpdate();
        });
      };

      /**
         *  Reset the Olap Model to the default query
         *  @public
         */
      that.resetModel = function () {
        var resetPromises = [];
        _.forEach(oModelData.DataProvider, function (oDP) {
          resetPromises.push(oDP.resetToDefault());
        });
        return Promise.all(resetPromises).then(function () {
          updateVariableGroup();
        });
      };

      /**
         * Retrieves a <code>DataProvider</code> aggregated by the <code>MultiDimModel</code>.
         *
         * @param {string} sDataProviderName the name of the <code>DataProvider</code>.
         * @returns {sap.sac.df.olap.MultiDimDataProvider} the Data Provider that was requested
         * @public
         */
      that.getDataProvider = function (sDataProviderName) {
        return oModelData.DataProvider[sDataProviderName];
      };
      /**
         * Resets the messages
         *
         * @param bUpdateBindings if also property bindings have to be updated
         * @returns {sap.sac.df.olap.MultiDimModel} for chaining
         * @public
         */
      that.clearMessages = function (bUpdateBindings) {
        oModelData.Messages = [];
        return bUpdateBindings ? that.checkUpdate() : that;
      };
      /**
         * Updates the variables of a MultiDimDataProvider with given name with the values from group
         *
         * @param sDataProviderName
         * @returns {Promise<Awaited<unknown>[]>}
         * @private
         */
      that.propagateVariableGroupValues = function (sDataProviderName) {
        var updateVariablePromises = [];
        var oDataProvider = oModelData.DataProvider[sDataProviderName];
        _.forEach(oModelData.VariableGroups, function (group) {
          var aVariables = oVariableGroupMapping[group.Name];
          _.forEach(aVariables, function (oVariable) {
            if (oVariable.DataProviderName === sDataProviderName && !_.isEqual(group.MergedVariable.MemberFilter, oVariable.MemberFilter)) {
              updateVariablePromises.push(oDataProvider.setVariableValue(oVariable.Name, group.MergedVariable.MemberFilter));
            }
          });
        });
        return Promise.all(updateVariablePromises);
      };

      that.getProperty = function (sPath, oContext) {
        return _getObject(sPath, oContext);
      };
      that.setProperty = function (sPath, sValue) {
        var bRes = false;
        var aPath = _.filter(sPath.split("/"), _.identity);
        try {
          var sLast = aPath.pop();
          var sP1 = aPath.join(".");
          var m1 = _.get(oModelData, sP1);
          if (sLast !== "vizProperties" || sValue) {
            if (m1) {
              m1[sLast] = sValue;
            } else {
              Log.warning("Failed to set " + sValue + " on: " + sPath);
            }
          }
          that.checkUpdate();
          bRes = true;
        } catch (oError) {
          Log.error(oError);
        }
        return bRes;
      };

      that.setSemanticStyles = function (o) {
        oModelData.SemanticStyles = _.clone(o);
      };
      that.getSemanticStyles = function () {
        return oModelData.SemanticStyles;
      };

      that.addMessages = function (aMsg) {
        oModelData.Messages = _.map(_.groupBy(_.concat(oModelData.Messages, aMsg), "Text"), function (o) {
          return o[0];
        });
        return that.checkUpdate();
      };


      that.bindProperty = function (sPath, oContext, mParameters) {
        var oBinding = new OlapPropertyBinding(that, sPath, oContext, mParameters);
        oBindings[oBinding.getId()] = oBinding;
        return oBinding;
      };
      that.bindList = function (sPath, oContext, aSorters, aFilters, mParameters) {
        if (sPath.match(/^(\/)?dataProvider\/(.)*\/Grid\/renderGrid/)) {
          return new OlapListGridBinding(that, sPath, oContext, aSorters, aFilters, mParameters);
        } else {
          return new OlapListBinding(that, sPath, oContext, aSorters, aFilters, mParameters);
        }
      };

      function _getObject(sPath, oContext) {
        var oNode = oContext instanceof Context ? _getObject(oContext.getPath()) : oModelData;
        if (sPath) {
          var subPath = sPath.replace(rS2D, ".");
          if (subPath.startsWith(".")) {
            subPath = subPath.replace(".", "");
          }
          return _.get(oNode, subPath);
        } else {
          return oNode;
        }
      }

      that.isList = function (sPath, oContext) {
        return Array.isArray(_getObject(that.resolve(sPath, oContext)));
      };

      that.checkUpdate = function (bForceUpdate) {
        _.forEach(oBindings, function (oBinding, sKey) {
          if (oBinding) {
            oBinding.checkUpdate(bForceUpdate);
          } else {
            delete oBindings[sKey];
          }
        }, false);
        return that;
      };
      that.checkMessages = function () {
        _.forEach(oBindings, function (oBinding) {
          return oBinding.checkDataState ? oBinding.checkDataState() : null;
        });
      };
      that.addBinding = function (oBinding) {
        oBindings[oBinding.getId()] = oBinding;
        return that;
      };
      that.removeBinding = function (oBinding) {
        delete oBindings[oBinding.getId()];
      };
      var oPlanningService;

      function ensurePlanningService(sSystem, sDataAreaName) {
        return initCompletedPromise.then(function () {
          if (oPlanningService) {
            return oPlanningService;
          }
          if (sSystem) {
            return null;
          }
          var oPlanningDataSource = FF.QDataSource.create();
          oPlanningDataSource.setDataArea(sDataAreaName || "MY_DATA_AREA");
          var oPlanningServiceConfig = FF.OlapApiModule.SERVICE_TYPE_PLANNING.createServiceConfig(that.getApplication());
          oPlanningServiceConfig.setDataSource(oPlanningDataSource);
          oPlanningServiceConfig.setSystemName(sSystem || oFinalSettings.masterSystem);
          return SyncActionHelper.syncActionToPromise(oPlanningServiceConfig.processServiceCreation, oPlanningServiceConfig, []).then(function (oExtResult) {
            oPlanningService = oExtResult.getData();
            return oPlanningService;
          });
        });
      }

      that.getPlanningService = function () {
        return oPlanningService;
      };
      var oProm = initCompletedPromise.then(function () {
        if (oFinalSettings && oFinalSettings.SemanticStyles) {
          that.setSemanticStyles(oFinalSettings.SemanticStyles);
        }
        var syncPromises = [];
        _.forEach(oFinalSettings.DataProvider || [], function (oDataProviderDef, sName) {
          var oRes = that.addQuery(sName, oDataProviderDef.dataSourceName, oDataProviderDef.systemName, oDataProviderDef.packageName, oDataProviderDef.schemaName, oDataProviderDef.dataSourceType);
          syncPromises.push(oDataProviderDef.synchronize ? oRes.then(function () {
            return that.getDataProvider(sName).synchronize();
          }) : oRes);
        });
        return Promise.all(syncPromises);
      });

      that.dataLoaded = _.constant(oProm);
      that.loaded = that.dataLoaded;
      that.metadataLoaded = that.dataLoaded;
      that.annotationsLoaded = that.dataLoaded;
      that.getMetaModel = _.constant(that);
      that.attachMetadataFailed = _.constant(null);
      that.fireMetadataFailed = _.constant(null);
      that.getODataEntityContainer = _.constant(null);
      that.getODataEntityType = _.constant(that);
      that.createBindingContext = _.constant(null);
      that.getODataEntitySet = _.constant(that);
      that.attachRequestCompleted(function (oParameters) {
        var infoObject = (oParameters.mParameters) ? oParameters.mParameters.infoObject : undefined;
        var dataProvider = oModelData.DataProvider[infoObject];
        if (dataProvider) {
          dataProvider.callUpdateDimensionData();
          that.checkUpdate();
        }
      });

      function updateVariableGroup(sGroupName) {
        if (!sGroupName) {
          _.forEach(oModelData.VariableGroups, function (group) {
            updateVariableGroup(group.Name);
          });
        } else {
          oVariableGroupMapping[sGroupName] = [];
          _.forEach(oModelData.DataProvider, function (oDP) {
            _.forEach(oDP.Variables, function (oVariable) {
              var variableGroup = oModelData.VariableGroups[sGroupName];
              if (variableGroup) {
                updateVariableInGroup(variableGroup, oVariable, oDP.Name);
              } else {
                console.error("Group " + sGroupName + " not found");
              }
            });
          });
        }

        function updateVariableInGroup(group, oVariable, sDataProviderName) {
          if (group.Rule(oVariable, sDataProviderName)) {
            if (group.MergedVariable && group.MergedVariable.DataProviderName !== sDataProviderName) {
              // TODO check more properties like input enablement
              if (group.MergedVariable.type !== oVariable.type) {
                throw new Error("Could not add variable '" + oVariable.Name + "' for DataProvider='" + sDataProviderName + "'." + //
                    " The type=" + oVariable.type + " doesn't match type=" + group.MergedVariable.type + " of previously added variables ");
              }
            } else {
              group.MergedVariable = oVariable;
            }
            oVariableGroupMapping[group.Name].push(oVariable);
          }
        }

      }
    },
    getStylingProvider: function(){
      return this.stylingProvider;
    }
  });


  return MultiDimModel;
});
