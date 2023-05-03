/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/ui/base/ManagedObject", "sap/ui/core/util/XMLPreprocessor"], function (Log, ManagedObject, XMLPreprocessor) {
  "use strict";

  var bindingParser = ManagedObject.bindingParser;
  //Trace information
  const aTraceInfo = [
    /* Structure for a macro
    		{
    			macro: '', //name of macro
    			metaDataContexts: [ //Properties of type sap.ui.model.Context
    				{
    					name: '', //context property name / key
    					path: '', //from oContext.getPath()
    				}
    			],
    			properties: { // Other properties which become part of {this>}
    				property1: value,
    				property2: value
    			}
    			viewInfo: {
    				viewInfo: {} // As specified in view or fragment creation
    			},
    			traceID: this.index, //ID for this trace information,
    			macroInfo: {
    				macroID: index, // traceID of this macro (redundant for macros)
    				parentMacroID, index // traceID of the parent macro (if it has a parent)
    			}
    		}
    		// Structure for a control
    		{
    			control: '', //control class
    			properties: { // Other properties which become part of {this>}
    				property1: {
    					originalValue: '', //Value before templating
    					resolvedValue: '' //Value after templating
    				}
    			}
    			contexts: { //Models and Contexts used during templating
    				// Model or context name used for this control
    				modelName1: { // For ODataMetaModel
    					path1: {
    						path: '', //absolut path within metamodel
    						data: '', //data of path unless type Object
    					}
    				modelName2: {
    					// for other model types
    					{
    						property1: value,
    						property2: value
    					}
    					// In case binding cannot be resolved -> mark as runtime binding
    					// This is not always true, e.g. in case the path is metamodelpath
    					{
    						"bindingFor": "Runtime"
    					}
    				}
    			},
    			viewInfo: {
    				viewInfo: {} // As specified in view or fragment creation
    			},
    			macroInfo: {
    				macroID: index, // traceID of the macro that created this control
    				parentMacroID, index // traceID of the macro's parent macro
    			},
    			traceID: this.index //ID for this trace information
    		}
    		*/
  ];
  const traceNamespace = "http://schemas.sap.com/sapui5/extension/sap.fe.info/1",
    xmlns = "http://www.w3.org/2000/xmlns/",
    /**
     * Switch is currently based on url parameter
     */
    traceIsOn = location.search.indexOf("sap-ui-xx-feTraceInfo=true") > -1,
    /**
     * Specify all namespaces that shall be traced during templating
     */
    aNamespaces = ["sap.m", "sap.uxap", "sap.ui.unified", "sap.f", "sap.ui.table", "sap.suite.ui.microchart", "sap.ui.layout.form", "sap.ui.mdc", "sap.ui.mdc.link", "sap.ui.mdc.field", "sap.fe.fpm"],
    oCallbacks = {};
  function fnClone(oObject) {
    return JSON.parse(JSON.stringify(oObject));
  }
  async function collectContextInfo(sValue, oContexts, oVisitor, oNode) {
    let aContexts;
    const aPromises = [];
    try {
      aContexts = bindingParser(sValue, undefined, false, true) || [];
    } catch (e) {
      aContexts = [];
    }
    aContexts = Array.isArray(aContexts) ? aContexts : [aContexts];
    aContexts.filter(function (oContext) {
      return oContext.path || oContext.parts;
    }).forEach(function (oContext) {
      const aParts = oContext.parts || [oContext];
      aParts.filter(function (oPartContext) {
        return oPartContext.path;
      }).forEach(function (oPartContext) {
        const oModel = oContexts[oPartContext.model] = oContexts[oPartContext.model] || {};
        const sSimplePath = oPartContext.path.indexOf(">") < 0 ? (oPartContext.model && `${oPartContext.model}>`) + oPartContext.path : oPartContext.path;
        let oRealContext;
        let aInnerParts;
        if (typeof oPartContext.model === "undefined" && sSimplePath.indexOf(">") > -1) {
          aInnerParts = sSimplePath.split(">");
          oPartContext.model = aInnerParts[0];
          oPartContext.path = aInnerParts[1];
        }
        try {
          oRealContext = oVisitor.getContext(sSimplePath);
          const visitorResult = oVisitor.getResult(`{${sSimplePath}}`, oNode);
          aPromises.push(visitorResult.then(function (oResult) {
            var _oRealContext;
            if (((_oRealContext = oRealContext) === null || _oRealContext === void 0 ? void 0 : _oRealContext.getModel().getMetadata().getName()) === "sap.ui.model.json.JSONModel") {
              if (!oResult.getModel()) {
                oModel[oPartContext.path] = oResult; //oRealContext.getObject(oContext.path);
              } else {
                oModel[oPartContext.path] = `Context from ${oResult.getPath()}`;
              }
            } else {
              oModel[oPartContext.path] = {
                path: oRealContext.getPath(),
                data: typeof oResult === "object" ? "[ctrl/cmd-click] on path to see data" : oResult
              };
            }
          }).catch(function () {
            oModel[oPartContext.path] = {
              bindingFor: "Runtime"
            };
          }));
        } catch (exc) {
          oModel[oPartContext.path] = {
            bindingFor: "Runtime"
          };
        }
      });
    });
    return Promise.all(aPromises);
  }
  async function fillAttributes(oResults, oAttributes, sName, sValue) {
    return oResults.then(function (result) {
      oAttributes[sName] = sValue !== result ? {
        originalValue: sValue,
        resolvedValue: result
      } : sValue;
    }).catch(function (e) {
      const error = e;
      oAttributes[sName] = {
        originalValue: sValue,
        error: error.stack && error.stack.toString() || e
      };
    });
  }
  async function collectInfo(oNode, oVisitor) {
    const oAttributes = {};
    const aPromises = [];
    const oContexts = {};
    let oResults;
    for (let i = oNode.attributes.length >>> 0; i--;) {
      const oAttribute = oNode.attributes[i],
        sName = oAttribute.nodeName,
        sValue = oNode.getAttribute(sName);
      if (!["core:require"].includes(sName)) {
        aPromises.push(collectContextInfo(sValue, oContexts, oVisitor, oNode));
        oResults = oVisitor.getResult(sValue, oNode);
        if (oResults) {
          aPromises.push(fillAttributes(oResults, oAttributes, sName, sValue));
        } else {
          //What
        }
      }
    }
    return Promise.all(aPromises).then(function () {
      return {
        properties: oAttributes,
        contexts: oContexts
      };
    });
  }
  async function resolve(oNode, oVisitor) {
    try {
      const sControlName = oNode.nodeName.split(":")[1] || oNode.nodeName,
        bIsControl = /^[A-Z]/.test(sControlName),
        oTraceMetadataContext = {
          isError: false,
          control: `${oNode.namespaceURI}.${oNode.nodeName.split(":")[1] || oNode.nodeName}`,
          metaDataContexts: [],
          properties: {}
        };
      if (bIsControl) {
        const firstChild = [...oNode.ownerDocument.children].find(node => !node.nodeName.startsWith("#"));
        if (firstChild && !firstChild.getAttribute("xmlns:trace")) {
          firstChild.setAttributeNS(xmlns, "xmlns:trace", traceNamespace);
          firstChild.setAttributeNS(traceNamespace, "trace:is", "on");
        }
        return await collectInfo(oNode, oVisitor).then(async function (result) {
          const bRelevant = Object.keys(result.contexts).length > 0; //If no context was used it is not relevant so we ignore Object.keys(result.properties).length
          if (bRelevant) {
            Object.assign(oTraceMetadataContext, result);
            oTraceMetadataContext.viewInfo = oVisitor.getViewInfo();
            oTraceMetadataContext.macroInfo = oVisitor.getSettings()["_macroInfo"];
            oTraceMetadataContext.traceID = aTraceInfo.length;
            oNode.setAttributeNS(traceNamespace, "trace:traceID", oTraceMetadataContext.traceID.toString());
            aTraceInfo.push(oTraceMetadataContext);
          }
          return oVisitor.visitAttributes(oNode);
        }).then(async function () {
          return oVisitor.visitChildNodes(oNode);
        }).catch(function (exc) {
          oTraceMetadataContext.error = {
            exception: exc,
            node: new XMLSerializer().serializeToString(oNode)
          };
        });
      } else {
        await oVisitor.visitAttributes(oNode);
        await oVisitor.visitChildNodes(oNode);
      }
    } catch (exc) {
      Log.error(`Error while tracing '${oNode === null || oNode === void 0 ? void 0 : oNode.nodeName}': ${exc.message}`, "TraceInfo");
      return oVisitor.visitAttributes(oNode).then(async function () {
        return oVisitor.visitChildNodes(oNode);
      });
    }
  }
  /**
   * Register path-through XMLPreprocessor plugin for all namespaces
   * given above in aNamespaces
   */
  if (traceIsOn) {
    aNamespaces.forEach(function (namespace) {
      oCallbacks[namespace] = XMLPreprocessor.plugIn(resolve.bind(namespace), namespace);
    });
  }

  /**
   * Adds information about the processing of one macro to the collection.
   *
   * @name sap.fe.macros.TraceInfo.traceMacroCalls
   * @param sName Macro class name
   * @param oMetadata Definition from (macro).metadata.js
   * @param mContexts Available named contexts
   * @param oNode
   * @param oVisitor
   * @returns The traced metadata context
   * @private
   * @ui5-restricted
   * @static
   */

  function traceMacroCalls(sName, oMetadata, mContexts, oNode, oVisitor) {
    try {
      let aMetadataContextKeys = oMetadata.metadataContexts && Object.keys(oMetadata.metadataContexts) || [];
      const aProperties = oMetadata.properties && Object.keys(oMetadata.properties) || [];
      const macroInfo = fnClone(oVisitor.getSettings()["_macroInfo"] || {});
      const oTraceMetadataContext = {
        isError: false,
        macro: sName,
        metaDataContexts: [],
        properties: {}
      };
      if (aMetadataContextKeys.length === 0) {
        //In case the macro has no metadata.js we take all metadataContexts except this
        aMetadataContextKeys = Object.keys(mContexts).filter(function (name) {
          return name !== "this";
        });
      }
      if (!oNode.getAttribute("xmlns:trace")) {
        oNode.setAttributeNS(xmlns, "xmlns:trace", traceNamespace);
      }
      if (aMetadataContextKeys.length > 0) {
        aMetadataContextKeys.forEach(function (sKey) {
          const oContext = mContexts[sKey],
            oMetaDataContext = oContext && {
              name: sKey,
              path: oContext.getPath()
              //data: JSON.stringify(oContext.getObject(),null,2)
            };

          if (oMetaDataContext) {
            oTraceMetadataContext.metaDataContexts.push(oMetaDataContext);
          }
        });
        aProperties.forEach(function (sKey) {
          const
          //oPropertySettings = oMetadata.properties[sKey],
          oProperty = mContexts.this.getObject(sKey);
          // (oNode.hasAttribute(sKey) && oNode.getAttribute(sKey)) ||
          // (oPropertySettings.hasOwnProperty("defaultValue") && oPropertySettings.define) ||
          // false;

          if (oProperty) {
            oTraceMetadataContext.properties[sKey] = oProperty;
          }
        });
        oTraceMetadataContext.viewInfo = oVisitor.getViewInfo();
        oTraceMetadataContext.traceID = aTraceInfo.length;
        macroInfo.parentMacroID = macroInfo.macroID;
        macroInfo.macroID = oTraceMetadataContext.traceID.toString();
        oTraceMetadataContext.macroInfo = macroInfo;
        oNode.setAttributeNS(traceNamespace, "trace:macroID", oTraceMetadataContext.traceID.toString());
        aTraceInfo.push(oTraceMetadataContext);
        return oTraceMetadataContext;
      }
    } catch (exc) {
      var _oVisitor$getContext;
      return {
        isError: true,
        error: exc,
        name: sName,
        node: new XMLSerializer().serializeToString(oNode),
        contextPath: oVisitor === null || oVisitor === void 0 ? void 0 : (_oVisitor$getContext = oVisitor.getContext()) === null || _oVisitor$getContext === void 0 ? void 0 : _oVisitor$getContext.getPath()
      };
    }
  }
  /**
   * Returns the globally stored trace information for the macro or
   * control marked with the given id.
   *
   * Returns all trace information if no id is specified
   *
   *
  <pre>Structure for a macro
  {
  	macro: '', //name of macro
  	metaDataContexts: [ //Properties of type sap.ui.model.Context
  		{
  			name: '', //context property name / key
  			path: '', //from oContext.getPath()
  		}
  	],
  	properties: { // Other properties which become part of {this>}
  		property1: value,
  		property2: value
  	}
  	viewInfo: {
  		viewInfo: {} // As specified in view or fragment creation
  	},
  	traceID: this.index, //ID for this trace information,
  	macroInfo: {
  		macroID: index, // traceID of this macro (redundant for macros)
  		parentMacroID, index // traceID of the parent macro (if it has a parent)
  	}
  }
  Structure for a control
  {
  	control: '', //control class
  	properties: { // Other properties which become part of {this>}
  		property1: {
  			originalValue: '', //Value before templating
  			resolvedValue: '' //Value after templating
  		}
  	}
  	contexts: { //Models and Contexts used during templating
  		// Model or context name used for this control
  		modelName1: { // For ODataMetaModel
  			path1: {
  				path: '', //absolut path within metamodel
  				data: '', //data of path unless type Object
  			}
  		modelName2: {
  			// for other model types
  			{
  				property1: value,
  				property2: value
  			}
  			// In case binding cannot be resolved -> mark as runtime binding
  			// This is not always true, e.g. in case the path is metamodelpath
  			{
  				"bindingFor": "Runtime"
  			}
  		}
  	},
  	viewInfo: {
  		viewInfo: {} // As specified in view or fragment creation
  	},
  	macroInfo: {
  		macroID: index, // traceID of the macro that created this control
  		parentMacroID, index // traceID of the macro's parent macro
  	},
  	traceID: this.index //ID for this trace information
  }</pre>.
   *
   * @function
   * @name sap.fe.macros.TraceInfo.getTraceInfo
   * @param id TraceInfo id
   * @returns Object / Array for TraceInfo
   * @private
   * @static
   */
  function getTraceInfo(id) {
    if (id) {
      return aTraceInfo[id];
    }
    const aErrors = aTraceInfo.filter(function (traceInfo) {
      return traceInfo.error;
    });
    return aErrors.length > 0 && aErrors || aTraceInfo;
  }
  /**
   * Returns true if TraceInfo is active.
   *
   * @function
   * @name sap.fe.macros.TraceInfo.isTraceInfoActive
   * @returns `true` when active
   * @private
   * @static
   */
  function isTraceInfoActive() {
    return traceIsOn;
  }
  /**
   * @typedef sap.fe.macros.TraceInfo
   * TraceInfo for SAP Fiori elements
   *
   * Once traces is switched, information about macros and controls
   * that are processed during xml preprocessing ( @see {@link sap.ui.core.util.XMLPreprocessor})
   * will be collected within this singleton
   * @namespace
   * @private
   * @global
   * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
   * @since 1.74.0
   */
  return {
    isTraceInfoActive: isTraceInfoActive,
    traceMacroCalls: traceMacroCalls,
    getTraceInfo: getTraceInfo
  };
}, true);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhVHJhY2VJbmZvIiwidHJhY2VOYW1lc3BhY2UiLCJ4bWxucyIsInRyYWNlSXNPbiIsImxvY2F0aW9uIiwic2VhcmNoIiwiaW5kZXhPZiIsImFOYW1lc3BhY2VzIiwib0NhbGxiYWNrcyIsImZuQ2xvbmUiLCJvT2JqZWN0IiwiSlNPTiIsInBhcnNlIiwic3RyaW5naWZ5IiwiY29sbGVjdENvbnRleHRJbmZvIiwic1ZhbHVlIiwib0NvbnRleHRzIiwib1Zpc2l0b3IiLCJvTm9kZSIsImFDb250ZXh0cyIsImFQcm9taXNlcyIsImJpbmRpbmdQYXJzZXIiLCJ1bmRlZmluZWQiLCJlIiwiQXJyYXkiLCJpc0FycmF5IiwiZmlsdGVyIiwib0NvbnRleHQiLCJwYXRoIiwicGFydHMiLCJmb3JFYWNoIiwiYVBhcnRzIiwib1BhcnRDb250ZXh0Iiwib01vZGVsIiwibW9kZWwiLCJzU2ltcGxlUGF0aCIsIm9SZWFsQ29udGV4dCIsImFJbm5lclBhcnRzIiwic3BsaXQiLCJnZXRDb250ZXh0IiwidmlzaXRvclJlc3VsdCIsImdldFJlc3VsdCIsInB1c2giLCJ0aGVuIiwib1Jlc3VsdCIsImdldE1vZGVsIiwiZ2V0TWV0YWRhdGEiLCJnZXROYW1lIiwiZ2V0UGF0aCIsImRhdGEiLCJjYXRjaCIsImJpbmRpbmdGb3IiLCJleGMiLCJQcm9taXNlIiwiYWxsIiwiZmlsbEF0dHJpYnV0ZXMiLCJvUmVzdWx0cyIsIm9BdHRyaWJ1dGVzIiwic05hbWUiLCJyZXN1bHQiLCJvcmlnaW5hbFZhbHVlIiwicmVzb2x2ZWRWYWx1ZSIsImVycm9yIiwic3RhY2siLCJ0b1N0cmluZyIsImNvbGxlY3RJbmZvIiwiaSIsImF0dHJpYnV0ZXMiLCJsZW5ndGgiLCJvQXR0cmlidXRlIiwibm9kZU5hbWUiLCJnZXRBdHRyaWJ1dGUiLCJpbmNsdWRlcyIsInByb3BlcnRpZXMiLCJjb250ZXh0cyIsInJlc29sdmUiLCJzQ29udHJvbE5hbWUiLCJiSXNDb250cm9sIiwidGVzdCIsIm9UcmFjZU1ldGFkYXRhQ29udGV4dCIsImlzRXJyb3IiLCJjb250cm9sIiwibmFtZXNwYWNlVVJJIiwibWV0YURhdGFDb250ZXh0cyIsImZpcnN0Q2hpbGQiLCJvd25lckRvY3VtZW50IiwiY2hpbGRyZW4iLCJmaW5kIiwibm9kZSIsInN0YXJ0c1dpdGgiLCJzZXRBdHRyaWJ1dGVOUyIsImJSZWxldmFudCIsIk9iamVjdCIsImtleXMiLCJhc3NpZ24iLCJ2aWV3SW5mbyIsImdldFZpZXdJbmZvIiwibWFjcm9JbmZvIiwiZ2V0U2V0dGluZ3MiLCJ0cmFjZUlEIiwidmlzaXRBdHRyaWJ1dGVzIiwidmlzaXRDaGlsZE5vZGVzIiwiZXhjZXB0aW9uIiwiWE1MU2VyaWFsaXplciIsInNlcmlhbGl6ZVRvU3RyaW5nIiwiTG9nIiwibWVzc2FnZSIsIm5hbWVzcGFjZSIsIlhNTFByZXByb2Nlc3NvciIsInBsdWdJbiIsImJpbmQiLCJ0cmFjZU1hY3JvQ2FsbHMiLCJvTWV0YWRhdGEiLCJtQ29udGV4dHMiLCJhTWV0YWRhdGFDb250ZXh0S2V5cyIsIm1ldGFkYXRhQ29udGV4dHMiLCJhUHJvcGVydGllcyIsIm1hY3JvIiwibmFtZSIsInNLZXkiLCJvTWV0YURhdGFDb250ZXh0Iiwib1Byb3BlcnR5IiwidGhpcyIsImdldE9iamVjdCIsInBhcmVudE1hY3JvSUQiLCJtYWNyb0lEIiwiY29udGV4dFBhdGgiLCJnZXRUcmFjZUluZm8iLCJpZCIsImFFcnJvcnMiLCJ0cmFjZUluZm8iLCJpc1RyYWNlSW5mb0FjdGl2ZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVHJhY2VJbmZvLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgeyBJVmlzaXRvckNhbGxiYWNrLCBSZXNvbHZlZEJ1aWxkaW5nQmxvY2tNZXRhZGF0YSB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrUnVudGltZVwiO1xuaW1wb3J0IHsgYmluZGluZ1BhcnNlciB9IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgWE1MUHJlcHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS91dGlsL1hNTFByZXByb2Nlc3NvclwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbi8vVHJhY2UgaW5mb3JtYXRpb25cbmNvbnN0IGFUcmFjZUluZm86IFRyYWNlTWV0YWRhdGFDb250ZXh0W10gPSBbXG5cdC8qIFN0cnVjdHVyZSBmb3IgYSBtYWNyb1xuXHRcdFx0e1xuXHRcdFx0XHRtYWNybzogJycsIC8vbmFtZSBvZiBtYWNyb1xuXHRcdFx0XHRtZXRhRGF0YUNvbnRleHRzOiBbIC8vUHJvcGVydGllcyBvZiB0eXBlIHNhcC51aS5tb2RlbC5Db250ZXh0XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bmFtZTogJycsIC8vY29udGV4dCBwcm9wZXJ0eSBuYW1lIC8ga2V5XG5cdFx0XHRcdFx0XHRwYXRoOiAnJywgLy9mcm9tIG9Db250ZXh0LmdldFBhdGgoKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XSxcblx0XHRcdFx0cHJvcGVydGllczogeyAvLyBPdGhlciBwcm9wZXJ0aWVzIHdoaWNoIGJlY29tZSBwYXJ0IG9mIHt0aGlzPn1cblx0XHRcdFx0XHRwcm9wZXJ0eTE6IHZhbHVlLFxuXHRcdFx0XHRcdHByb3BlcnR5MjogdmFsdWVcblx0XHRcdFx0fVxuXHRcdFx0XHR2aWV3SW5mbzoge1xuXHRcdFx0XHRcdHZpZXdJbmZvOiB7fSAvLyBBcyBzcGVjaWZpZWQgaW4gdmlldyBvciBmcmFnbWVudCBjcmVhdGlvblxuXHRcdFx0XHR9LFxuXHRcdFx0XHR0cmFjZUlEOiB0aGlzLmluZGV4LCAvL0lEIGZvciB0aGlzIHRyYWNlIGluZm9ybWF0aW9uLFxuXHRcdFx0XHRtYWNyb0luZm86IHtcblx0XHRcdFx0XHRtYWNyb0lEOiBpbmRleCwgLy8gdHJhY2VJRCBvZiB0aGlzIG1hY3JvIChyZWR1bmRhbnQgZm9yIG1hY3Jvcylcblx0XHRcdFx0XHRwYXJlbnRNYWNyb0lELCBpbmRleCAvLyB0cmFjZUlEIG9mIHRoZSBwYXJlbnQgbWFjcm8gKGlmIGl0IGhhcyBhIHBhcmVudClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gU3RydWN0dXJlIGZvciBhIGNvbnRyb2xcblx0XHRcdHtcblx0XHRcdFx0Y29udHJvbDogJycsIC8vY29udHJvbCBjbGFzc1xuXHRcdFx0XHRwcm9wZXJ0aWVzOiB7IC8vIE90aGVyIHByb3BlcnRpZXMgd2hpY2ggYmVjb21lIHBhcnQgb2Yge3RoaXM+fVxuXHRcdFx0XHRcdHByb3BlcnR5MToge1xuXHRcdFx0XHRcdFx0b3JpZ2luYWxWYWx1ZTogJycsIC8vVmFsdWUgYmVmb3JlIHRlbXBsYXRpbmdcblx0XHRcdFx0XHRcdHJlc29sdmVkVmFsdWU6ICcnIC8vVmFsdWUgYWZ0ZXIgdGVtcGxhdGluZ1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRjb250ZXh0czogeyAvL01vZGVscyBhbmQgQ29udGV4dHMgdXNlZCBkdXJpbmcgdGVtcGxhdGluZ1xuXHRcdFx0XHRcdC8vIE1vZGVsIG9yIGNvbnRleHQgbmFtZSB1c2VkIGZvciB0aGlzIGNvbnRyb2xcblx0XHRcdFx0XHRtb2RlbE5hbWUxOiB7IC8vIEZvciBPRGF0YU1ldGFNb2RlbFxuXHRcdFx0XHRcdFx0cGF0aDE6IHtcblx0XHRcdFx0XHRcdFx0cGF0aDogJycsIC8vYWJzb2x1dCBwYXRoIHdpdGhpbiBtZXRhbW9kZWxcblx0XHRcdFx0XHRcdFx0ZGF0YTogJycsIC8vZGF0YSBvZiBwYXRoIHVubGVzcyB0eXBlIE9iamVjdFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG1vZGVsTmFtZTI6IHtcblx0XHRcdFx0XHRcdC8vIGZvciBvdGhlciBtb2RlbCB0eXBlc1xuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRwcm9wZXJ0eTE6IHZhbHVlLFxuXHRcdFx0XHRcdFx0XHRwcm9wZXJ0eTI6IHZhbHVlXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvLyBJbiBjYXNlIGJpbmRpbmcgY2Fubm90IGJlIHJlc29sdmVkIC0+IG1hcmsgYXMgcnVudGltZSBiaW5kaW5nXG5cdFx0XHRcdFx0XHQvLyBUaGlzIGlzIG5vdCBhbHdheXMgdHJ1ZSwgZS5nLiBpbiBjYXNlIHRoZSBwYXRoIGlzIG1ldGFtb2RlbHBhdGhcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XCJiaW5kaW5nRm9yXCI6IFwiUnVudGltZVwiXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR2aWV3SW5mbzoge1xuXHRcdFx0XHRcdHZpZXdJbmZvOiB7fSAvLyBBcyBzcGVjaWZpZWQgaW4gdmlldyBvciBmcmFnbWVudCBjcmVhdGlvblxuXHRcdFx0XHR9LFxuXHRcdFx0XHRtYWNyb0luZm86IHtcblx0XHRcdFx0XHRtYWNyb0lEOiBpbmRleCwgLy8gdHJhY2VJRCBvZiB0aGUgbWFjcm8gdGhhdCBjcmVhdGVkIHRoaXMgY29udHJvbFxuXHRcdFx0XHRcdHBhcmVudE1hY3JvSUQsIGluZGV4IC8vIHRyYWNlSUQgb2YgdGhlIG1hY3JvJ3MgcGFyZW50IG1hY3JvXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHRyYWNlSUQ6IHRoaXMuaW5kZXggLy9JRCBmb3IgdGhpcyB0cmFjZSBpbmZvcm1hdGlvblxuXHRcdFx0fVxuXHRcdFx0Ki9cbl07XG5jb25zdCB0cmFjZU5hbWVzcGFjZSA9IFwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC5mZS5pbmZvLzFcIixcblx0eG1sbnMgPSBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAveG1sbnMvXCIsXG5cdC8qKlxuXHQgKiBTd2l0Y2ggaXMgY3VycmVudGx5IGJhc2VkIG9uIHVybCBwYXJhbWV0ZXJcblx0ICovXG5cdHRyYWNlSXNPbiA9IGxvY2F0aW9uLnNlYXJjaC5pbmRleE9mKFwic2FwLXVpLXh4LWZlVHJhY2VJbmZvPXRydWVcIikgPiAtMSxcblx0LyoqXG5cdCAqIFNwZWNpZnkgYWxsIG5hbWVzcGFjZXMgdGhhdCBzaGFsbCBiZSB0cmFjZWQgZHVyaW5nIHRlbXBsYXRpbmdcblx0ICovXG5cdGFOYW1lc3BhY2VzID0gW1xuXHRcdFwic2FwLm1cIixcblx0XHRcInNhcC51eGFwXCIsXG5cdFx0XCJzYXAudWkudW5pZmllZFwiLFxuXHRcdFwic2FwLmZcIixcblx0XHRcInNhcC51aS50YWJsZVwiLFxuXHRcdFwic2FwLnN1aXRlLnVpLm1pY3JvY2hhcnRcIixcblx0XHRcInNhcC51aS5sYXlvdXQuZm9ybVwiLFxuXHRcdFwic2FwLnVpLm1kY1wiLFxuXHRcdFwic2FwLnVpLm1kYy5saW5rXCIsXG5cdFx0XCJzYXAudWkubWRjLmZpZWxkXCIsXG5cdFx0XCJzYXAuZmUuZnBtXCJcblx0XSxcblx0b0NhbGxiYWNrczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcblxuZnVuY3Rpb24gZm5DbG9uZShvT2JqZWN0OiBvYmplY3QpIHtcblx0cmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob09iamVjdCkpO1xufVxudHlwZSBUcmFjZUNvbnRleHQgPSB7XG5cdHBhdGg6IHN0cmluZztcblx0bW9kZWw6IHN0cmluZztcblx0cGFydHM6IFRyYWNlQ29udGV4dFtdO1xufTtcbmFzeW5jIGZ1bmN0aW9uIGNvbGxlY3RDb250ZXh0SW5mbyhcblx0c1ZhbHVlOiBzdHJpbmcgfCBudWxsLFxuXHRvQ29udGV4dHM6IFJlY29yZDxzdHJpbmcsIFRyYWNlQ29udGV4dD4sXG5cdG9WaXNpdG9yOiBJVmlzaXRvckNhbGxiYWNrLFxuXHRvTm9kZTogRWxlbWVudFxuKSB7XG5cdGxldCBhQ29udGV4dHM6IFRyYWNlQ29udGV4dFtdO1xuXHRjb25zdCBhUHJvbWlzZXM6IFByb21pc2U8dW5rbm93bj5bXSA9IFtdO1xuXHR0cnkge1xuXHRcdGFDb250ZXh0cyA9IGJpbmRpbmdQYXJzZXIoc1ZhbHVlLCB1bmRlZmluZWQsIGZhbHNlLCB0cnVlKSB8fCBbXTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGFDb250ZXh0cyA9IFtdO1xuXHR9XG5cdGFDb250ZXh0cyA9IEFycmF5LmlzQXJyYXkoYUNvbnRleHRzKSA/IGFDb250ZXh0cyA6IFthQ29udGV4dHNdO1xuXHRhQ29udGV4dHNcblx0XHQuZmlsdGVyKGZ1bmN0aW9uIChvQ29udGV4dCkge1xuXHRcdFx0cmV0dXJuIG9Db250ZXh0LnBhdGggfHwgb0NvbnRleHQucGFydHM7XG5cdFx0fSlcblx0XHQuZm9yRWFjaChmdW5jdGlvbiAob0NvbnRleHQ6IFRyYWNlQ29udGV4dCkge1xuXHRcdFx0Y29uc3QgYVBhcnRzID0gb0NvbnRleHQucGFydHMgfHwgW29Db250ZXh0XTtcblx0XHRcdGFQYXJ0c1xuXHRcdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChvUGFydENvbnRleHQ6IFRyYWNlQ29udGV4dCkge1xuXHRcdFx0XHRcdHJldHVybiBvUGFydENvbnRleHQucGF0aDtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKG9QYXJ0Q29udGV4dDogVHJhY2VDb250ZXh0KSB7XG5cdFx0XHRcdFx0Y29uc3Qgb01vZGVsOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IChvQ29udGV4dHNbb1BhcnRDb250ZXh0Lm1vZGVsXSA9IG9Db250ZXh0c1tvUGFydENvbnRleHQubW9kZWxdIHx8IHt9KTtcblx0XHRcdFx0XHRjb25zdCBzU2ltcGxlUGF0aCA9XG5cdFx0XHRcdFx0XHRvUGFydENvbnRleHQucGF0aC5pbmRleE9mKFwiPlwiKSA8IDBcblx0XHRcdFx0XHRcdFx0PyAob1BhcnRDb250ZXh0Lm1vZGVsICYmIGAke29QYXJ0Q29udGV4dC5tb2RlbH0+YCkgKyBvUGFydENvbnRleHQucGF0aFxuXHRcdFx0XHRcdFx0XHQ6IG9QYXJ0Q29udGV4dC5wYXRoO1xuXHRcdFx0XHRcdGxldCBvUmVhbENvbnRleHQ6IENvbnRleHQgfCB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0bGV0IGFJbm5lclBhcnRzO1xuXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBvUGFydENvbnRleHQubW9kZWwgPT09IFwidW5kZWZpbmVkXCIgJiYgc1NpbXBsZVBhdGguaW5kZXhPZihcIj5cIikgPiAtMSkge1xuXHRcdFx0XHRcdFx0YUlubmVyUGFydHMgPSBzU2ltcGxlUGF0aC5zcGxpdChcIj5cIik7XG5cdFx0XHRcdFx0XHRvUGFydENvbnRleHQubW9kZWwgPSBhSW5uZXJQYXJ0c1swXTtcblx0XHRcdFx0XHRcdG9QYXJ0Q29udGV4dC5wYXRoID0gYUlubmVyUGFydHNbMV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRvUmVhbENvbnRleHQgPSBvVmlzaXRvci5nZXRDb250ZXh0KHNTaW1wbGVQYXRoKTtcblxuXHRcdFx0XHRcdFx0Y29uc3QgdmlzaXRvclJlc3VsdCA9IG9WaXNpdG9yLmdldFJlc3VsdChgeyR7c1NpbXBsZVBhdGh9fWAsIG9Ob2RlKSE7XG5cdFx0XHRcdFx0XHRhUHJvbWlzZXMucHVzaChcblx0XHRcdFx0XHRcdFx0dmlzaXRvclJlc3VsdFxuXHRcdFx0XHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChvUmVzdWx0OiBDb250ZXh0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAob1JlYWxDb250ZXh0Py5nZXRNb2RlbCgpLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpID09PSBcInNhcC51aS5tb2RlbC5qc29uLkpTT05Nb2RlbFwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmICghb1Jlc3VsdC5nZXRNb2RlbCgpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b01vZGVsW29QYXJ0Q29udGV4dC5wYXRoXSA9IG9SZXN1bHQ7IC8vb1JlYWxDb250ZXh0LmdldE9iamVjdChvQ29udGV4dC5wYXRoKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvTW9kZWxbb1BhcnRDb250ZXh0LnBhdGhdID0gYENvbnRleHQgZnJvbSAke29SZXN1bHQuZ2V0UGF0aCgpfWA7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9Nb2RlbFtvUGFydENvbnRleHQucGF0aF0gPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cGF0aDogb1JlYWxDb250ZXh0IS5nZXRQYXRoKCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGF0YTogdHlwZW9mIG9SZXN1bHQgPT09IFwib2JqZWN0XCIgPyBcIltjdHJsL2NtZC1jbGlja10gb24gcGF0aCB0byBzZWUgZGF0YVwiIDogb1Jlc3VsdFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdG9Nb2RlbFtvUGFydENvbnRleHQucGF0aF0gPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGJpbmRpbmdGb3I6IFwiUnVudGltZVwiXG5cdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGV4Yykge1xuXHRcdFx0XHRcdFx0b01vZGVsW29QYXJ0Q29udGV4dC5wYXRoXSA9IHtcblx0XHRcdFx0XHRcdFx0YmluZGluZ0ZvcjogXCJSdW50aW1lXCJcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHR9KTtcblx0cmV0dXJuIFByb21pc2UuYWxsKGFQcm9taXNlcyk7XG59XG5hc3luYyBmdW5jdGlvbiBmaWxsQXR0cmlidXRlcyhvUmVzdWx0czogUHJvbWlzZTx1bmtub3duPiwgb0F0dHJpYnV0ZXM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBzTmFtZTogc3RyaW5nLCBzVmFsdWU6IHVua25vd24pIHtcblx0cmV0dXJuIG9SZXN1bHRzXG5cdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3VsdDogdW5rbm93bikge1xuXHRcdFx0b0F0dHJpYnV0ZXNbc05hbWVdID1cblx0XHRcdFx0c1ZhbHVlICE9PSByZXN1bHRcblx0XHRcdFx0XHQ/IHtcblx0XHRcdFx0XHRcdFx0b3JpZ2luYWxWYWx1ZTogc1ZhbHVlLFxuXHRcdFx0XHRcdFx0XHRyZXNvbHZlZFZhbHVlOiByZXN1bHRcblx0XHRcdFx0XHQgIH1cblx0XHRcdFx0XHQ6IHNWYWx1ZTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbiAoZTogdW5rbm93bikge1xuXHRcdFx0Y29uc3QgZXJyb3IgPSBlIGFzIEVycm9yO1xuXHRcdFx0b0F0dHJpYnV0ZXNbc05hbWVdID0ge1xuXHRcdFx0XHRvcmlnaW5hbFZhbHVlOiBzVmFsdWUsXG5cdFx0XHRcdGVycm9yOiAoZXJyb3Iuc3RhY2sgJiYgZXJyb3Iuc3RhY2sudG9TdHJpbmcoKSkgfHwgZVxuXHRcdFx0fTtcblx0XHR9KTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGNvbGxlY3RJbmZvKG9Ob2RlOiBFbGVtZW50LCBvVmlzaXRvcjogSVZpc2l0b3JDYWxsYmFjaykge1xuXHRjb25zdCBvQXR0cmlidXRlcyA9IHt9O1xuXHRjb25zdCBhUHJvbWlzZXMgPSBbXTtcblx0Y29uc3Qgb0NvbnRleHRzID0ge307XG5cdGxldCBvUmVzdWx0cztcblx0Zm9yIChsZXQgaSA9IG9Ob2RlLmF0dHJpYnV0ZXMubGVuZ3RoID4+PiAwOyBpLS07ICkge1xuXHRcdGNvbnN0IG9BdHRyaWJ1dGUgPSBvTm9kZS5hdHRyaWJ1dGVzW2ldLFxuXHRcdFx0c05hbWUgPSBvQXR0cmlidXRlLm5vZGVOYW1lLFxuXHRcdFx0c1ZhbHVlID0gb05vZGUuZ2V0QXR0cmlidXRlKHNOYW1lKSE7XG5cdFx0aWYgKCFbXCJjb3JlOnJlcXVpcmVcIl0uaW5jbHVkZXMoc05hbWUpKSB7XG5cdFx0XHRhUHJvbWlzZXMucHVzaChjb2xsZWN0Q29udGV4dEluZm8oc1ZhbHVlLCBvQ29udGV4dHMsIG9WaXNpdG9yLCBvTm9kZSkpO1xuXHRcdFx0b1Jlc3VsdHMgPSBvVmlzaXRvci5nZXRSZXN1bHQoc1ZhbHVlLCBvTm9kZSk7XG5cdFx0XHRpZiAob1Jlc3VsdHMpIHtcblx0XHRcdFx0YVByb21pc2VzLnB1c2goZmlsbEF0dHJpYnV0ZXMob1Jlc3VsdHMsIG9BdHRyaWJ1dGVzLCBzTmFtZSwgc1ZhbHVlKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL1doYXRcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIFByb21pc2UuYWxsKGFQcm9taXNlcykudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHsgcHJvcGVydGllczogb0F0dHJpYnV0ZXMsIGNvbnRleHRzOiBvQ29udGV4dHMgfTtcblx0fSk7XG59XG5leHBvcnQgdHlwZSBUcmFjZU1ldGFkYXRhQ29udGV4dCA9IHtcblx0aXNFcnJvcjogZmFsc2U7XG5cdG1hY3JvPzogc3RyaW5nO1xuXHRjb250cm9sPzogc3RyaW5nO1xuXHR2aWV3SW5mbz86IHVua25vd247XG5cdG1hY3JvSW5mbz86IE1hY3JvSW5mbztcblx0dHJhY2VJRD86IG51bWJlcjtcblx0ZXJyb3I/OiB7XG5cdFx0ZXhjZXB0aW9uOiBFcnJvcjtcblx0XHRub2RlOiBzdHJpbmc7XG5cdH07XG5cdG1ldGFEYXRhQ29udGV4dHM6IHsgbmFtZTogc3RyaW5nOyBwYXRoOiBzdHJpbmcgfVtdO1xuXHRwcm9wZXJ0aWVzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn07XG5hc3luYyBmdW5jdGlvbiByZXNvbHZlKG9Ob2RlOiBFbGVtZW50LCBvVmlzaXRvcjogSVZpc2l0b3JDYWxsYmFjaykge1xuXHR0cnkge1xuXHRcdGNvbnN0IHNDb250cm9sTmFtZSA9IG9Ob2RlLm5vZGVOYW1lLnNwbGl0KFwiOlwiKVsxXSB8fCBvTm9kZS5ub2RlTmFtZSxcblx0XHRcdGJJc0NvbnRyb2wgPSAvXltBLVpdLy50ZXN0KHNDb250cm9sTmFtZSksXG5cdFx0XHRvVHJhY2VNZXRhZGF0YUNvbnRleHQ6IFRyYWNlTWV0YWRhdGFDb250ZXh0ID0ge1xuXHRcdFx0XHRpc0Vycm9yOiBmYWxzZSxcblx0XHRcdFx0Y29udHJvbDogYCR7b05vZGUubmFtZXNwYWNlVVJJfS4ke29Ob2RlLm5vZGVOYW1lLnNwbGl0KFwiOlwiKVsxXSB8fCBvTm9kZS5ub2RlTmFtZX1gLFxuXHRcdFx0XHRtZXRhRGF0YUNvbnRleHRzOiBbXSxcblx0XHRcdFx0cHJvcGVydGllczoge31cblx0XHRcdH07XG5cblx0XHRpZiAoYklzQ29udHJvbCkge1xuXHRcdFx0Y29uc3QgZmlyc3RDaGlsZCA9IFsuLi4ob05vZGUub3duZXJEb2N1bWVudC5jaGlsZHJlbiBhcyB1bmtub3duIGFzIEVsZW1lbnRbXSldLmZpbmQoKG5vZGUpID0+ICFub2RlLm5vZGVOYW1lLnN0YXJ0c1dpdGgoXCIjXCIpKTtcblx0XHRcdGlmIChmaXJzdENoaWxkICYmICFmaXJzdENoaWxkLmdldEF0dHJpYnV0ZShcInhtbG5zOnRyYWNlXCIpKSB7XG5cdFx0XHRcdGZpcnN0Q2hpbGQuc2V0QXR0cmlidXRlTlMoeG1sbnMsIFwieG1sbnM6dHJhY2VcIiwgdHJhY2VOYW1lc3BhY2UpO1xuXHRcdFx0XHRmaXJzdENoaWxkLnNldEF0dHJpYnV0ZU5TKHRyYWNlTmFtZXNwYWNlLCBcInRyYWNlOmlzXCIsIFwib25cIik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYXdhaXQgY29sbGVjdEluZm8ob05vZGUsIG9WaXNpdG9yKVxuXHRcdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAocmVzdWx0OiB7IHByb3BlcnRpZXM6IHt9OyBjb250ZXh0czoge30gfSkge1xuXHRcdFx0XHRcdGNvbnN0IGJSZWxldmFudCA9IE9iamVjdC5rZXlzKHJlc3VsdC5jb250ZXh0cykubGVuZ3RoID4gMDsgLy9JZiBubyBjb250ZXh0IHdhcyB1c2VkIGl0IGlzIG5vdCByZWxldmFudCBzbyB3ZSBpZ25vcmUgT2JqZWN0LmtleXMocmVzdWx0LnByb3BlcnRpZXMpLmxlbmd0aFxuXHRcdFx0XHRcdGlmIChiUmVsZXZhbnQpIHtcblx0XHRcdFx0XHRcdE9iamVjdC5hc3NpZ24ob1RyYWNlTWV0YWRhdGFDb250ZXh0LCByZXN1bHQpO1xuXHRcdFx0XHRcdFx0b1RyYWNlTWV0YWRhdGFDb250ZXh0LnZpZXdJbmZvID0gb1Zpc2l0b3IuZ2V0Vmlld0luZm8oKTtcblx0XHRcdFx0XHRcdG9UcmFjZU1ldGFkYXRhQ29udGV4dC5tYWNyb0luZm8gPSBvVmlzaXRvci5nZXRTZXR0aW5ncygpW1wiX21hY3JvSW5mb1wiXTtcblx0XHRcdFx0XHRcdG9UcmFjZU1ldGFkYXRhQ29udGV4dC50cmFjZUlEID0gYVRyYWNlSW5mby5sZW5ndGg7XG5cdFx0XHRcdFx0XHRvTm9kZS5zZXRBdHRyaWJ1dGVOUyh0cmFjZU5hbWVzcGFjZSwgXCJ0cmFjZTp0cmFjZUlEXCIsIG9UcmFjZU1ldGFkYXRhQ29udGV4dC50cmFjZUlELnRvU3RyaW5nKCkpO1xuXHRcdFx0XHRcdFx0YVRyYWNlSW5mby5wdXNoKG9UcmFjZU1ldGFkYXRhQ29udGV4dCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBvVmlzaXRvci52aXNpdEF0dHJpYnV0ZXMob05vZGUpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQudGhlbihhc3luYyBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9WaXNpdG9yLnZpc2l0Q2hpbGROb2RlcyhvTm9kZSk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXhjOiB1bmtub3duKSB7XG5cdFx0XHRcdFx0b1RyYWNlTWV0YWRhdGFDb250ZXh0LmVycm9yID0ge1xuXHRcdFx0XHRcdFx0ZXhjZXB0aW9uOiBleGMgYXMgRXJyb3IsXG5cdFx0XHRcdFx0XHRub2RlOiBuZXcgWE1MU2VyaWFsaXplcigpLnNlcmlhbGl6ZVRvU3RyaW5nKG9Ob2RlKVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhd2FpdCBvVmlzaXRvci52aXNpdEF0dHJpYnV0ZXMob05vZGUpO1xuXHRcdFx0YXdhaXQgb1Zpc2l0b3IudmlzaXRDaGlsZE5vZGVzKG9Ob2RlKTtcblx0XHR9XG5cdH0gY2F0Y2ggKGV4YzogdW5rbm93bikge1xuXHRcdExvZy5lcnJvcihgRXJyb3Igd2hpbGUgdHJhY2luZyAnJHtvTm9kZT8ubm9kZU5hbWV9JzogJHsoZXhjIGFzIEVycm9yKS5tZXNzYWdlfWAsIFwiVHJhY2VJbmZvXCIpO1xuXHRcdHJldHVybiBvVmlzaXRvci52aXNpdEF0dHJpYnV0ZXMob05vZGUpLnRoZW4oYXN5bmMgZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIG9WaXNpdG9yLnZpc2l0Q2hpbGROb2RlcyhvTm9kZSk7XG5cdFx0fSk7XG5cdH1cbn1cbi8qKlxuICogUmVnaXN0ZXIgcGF0aC10aHJvdWdoIFhNTFByZXByb2Nlc3NvciBwbHVnaW4gZm9yIGFsbCBuYW1lc3BhY2VzXG4gKiBnaXZlbiBhYm92ZSBpbiBhTmFtZXNwYWNlc1xuICovXG5pZiAodHJhY2VJc09uKSB7XG5cdGFOYW1lc3BhY2VzLmZvckVhY2goZnVuY3Rpb24gKG5hbWVzcGFjZTogc3RyaW5nKSB7XG5cdFx0b0NhbGxiYWNrc1tuYW1lc3BhY2VdID0gWE1MUHJlcHJvY2Vzc29yLnBsdWdJbihyZXNvbHZlLmJpbmQobmFtZXNwYWNlKSwgbmFtZXNwYWNlKTtcblx0fSk7XG59XG5cbi8qKlxuICogQWRkcyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgcHJvY2Vzc2luZyBvZiBvbmUgbWFjcm8gdG8gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQG5hbWUgc2FwLmZlLm1hY3Jvcy5UcmFjZUluZm8udHJhY2VNYWNyb0NhbGxzXG4gKiBAcGFyYW0gc05hbWUgTWFjcm8gY2xhc3MgbmFtZVxuICogQHBhcmFtIG9NZXRhZGF0YSBEZWZpbml0aW9uIGZyb20gKG1hY3JvKS5tZXRhZGF0YS5qc1xuICogQHBhcmFtIG1Db250ZXh0cyBBdmFpbGFibGUgbmFtZWQgY29udGV4dHNcbiAqIEBwYXJhbSBvTm9kZVxuICogQHBhcmFtIG9WaXNpdG9yXG4gKiBAcmV0dXJucyBUaGUgdHJhY2VkIG1ldGFkYXRhIGNvbnRleHRcbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqIEBzdGF0aWNcbiAqL1xuZXhwb3J0IHR5cGUgTWFjcm9JbmZvID0ge1xuXHRwYXJlbnRNYWNyb0lEOiBzdHJpbmc7XG5cdG1hY3JvSUQ6IHN0cmluZztcbn07XG5mdW5jdGlvbiB0cmFjZU1hY3JvQ2FsbHMoXG5cdHNOYW1lOiBzdHJpbmcsXG5cdG9NZXRhZGF0YTogUmVzb2x2ZWRCdWlsZGluZ0Jsb2NrTWV0YWRhdGEsXG5cdG1Db250ZXh0czogUmVjb3JkPHN0cmluZywgQ29udGV4dD4sXG5cdG9Ob2RlOiBFbGVtZW50LFxuXHRvVmlzaXRvcjogSVZpc2l0b3JDYWxsYmFja1xuKSB7XG5cdHRyeSB7XG5cdFx0bGV0IGFNZXRhZGF0YUNvbnRleHRLZXlzID0gKG9NZXRhZGF0YS5tZXRhZGF0YUNvbnRleHRzICYmIE9iamVjdC5rZXlzKG9NZXRhZGF0YS5tZXRhZGF0YUNvbnRleHRzKSkgfHwgW107XG5cdFx0Y29uc3QgYVByb3BlcnRpZXMgPSAob01ldGFkYXRhLnByb3BlcnRpZXMgJiYgT2JqZWN0LmtleXMob01ldGFkYXRhLnByb3BlcnRpZXMpKSB8fCBbXTtcblx0XHRjb25zdCBtYWNyb0luZm86IE1hY3JvSW5mbyA9IGZuQ2xvbmUob1Zpc2l0b3IuZ2V0U2V0dGluZ3MoKVtcIl9tYWNyb0luZm9cIl0gfHwge30pO1xuXHRcdGNvbnN0IG9UcmFjZU1ldGFkYXRhQ29udGV4dDogVHJhY2VNZXRhZGF0YUNvbnRleHQgPSB7XG5cdFx0XHRpc0Vycm9yOiBmYWxzZSxcblx0XHRcdG1hY3JvOiBzTmFtZSxcblx0XHRcdG1ldGFEYXRhQ29udGV4dHM6IFtdLFxuXHRcdFx0cHJvcGVydGllczoge31cblx0XHR9O1xuXG5cdFx0aWYgKGFNZXRhZGF0YUNvbnRleHRLZXlzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0Ly9JbiBjYXNlIHRoZSBtYWNybyBoYXMgbm8gbWV0YWRhdGEuanMgd2UgdGFrZSBhbGwgbWV0YWRhdGFDb250ZXh0cyBleGNlcHQgdGhpc1xuXHRcdFx0YU1ldGFkYXRhQ29udGV4dEtleXMgPSBPYmplY3Qua2V5cyhtQ29udGV4dHMpLmZpbHRlcihmdW5jdGlvbiAobmFtZTogc3RyaW5nKSB7XG5cdFx0XHRcdHJldHVybiBuYW1lICE9PSBcInRoaXNcIjtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGlmICghb05vZGUuZ2V0QXR0cmlidXRlKFwieG1sbnM6dHJhY2VcIikpIHtcblx0XHRcdG9Ob2RlLnNldEF0dHJpYnV0ZU5TKHhtbG5zLCBcInhtbG5zOnRyYWNlXCIsIHRyYWNlTmFtZXNwYWNlKTtcblx0XHR9XG5cblx0XHRpZiAoYU1ldGFkYXRhQ29udGV4dEtleXMubGVuZ3RoID4gMCkge1xuXHRcdFx0YU1ldGFkYXRhQ29udGV4dEtleXMuZm9yRWFjaChmdW5jdGlvbiAoc0tleTogc3RyaW5nKSB7XG5cdFx0XHRcdGNvbnN0IG9Db250ZXh0ID0gbUNvbnRleHRzW3NLZXldLFxuXHRcdFx0XHRcdG9NZXRhRGF0YUNvbnRleHQgPSBvQ29udGV4dCAmJiB7XG5cdFx0XHRcdFx0XHRuYW1lOiBzS2V5LFxuXHRcdFx0XHRcdFx0cGF0aDogb0NvbnRleHQuZ2V0UGF0aCgpXG5cdFx0XHRcdFx0XHQvL2RhdGE6IEpTT04uc3RyaW5naWZ5KG9Db250ZXh0LmdldE9iamVjdCgpLG51bGwsMilcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdGlmIChvTWV0YURhdGFDb250ZXh0KSB7XG5cdFx0XHRcdFx0b1RyYWNlTWV0YWRhdGFDb250ZXh0Lm1ldGFEYXRhQ29udGV4dHMucHVzaChvTWV0YURhdGFDb250ZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdGFQcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24gKHNLZXk6IHN0cmluZykge1xuXHRcdFx0XHRjb25zdCAvL29Qcm9wZXJ0eVNldHRpbmdzID0gb01ldGFkYXRhLnByb3BlcnRpZXNbc0tleV0sXG5cdFx0XHRcdFx0b1Byb3BlcnR5ID0gbUNvbnRleHRzLnRoaXMuZ2V0T2JqZWN0KHNLZXkpO1xuXHRcdFx0XHQvLyAob05vZGUuaGFzQXR0cmlidXRlKHNLZXkpICYmIG9Ob2RlLmdldEF0dHJpYnV0ZShzS2V5KSkgfHxcblx0XHRcdFx0Ly8gKG9Qcm9wZXJ0eVNldHRpbmdzLmhhc093blByb3BlcnR5KFwiZGVmYXVsdFZhbHVlXCIpICYmIG9Qcm9wZXJ0eVNldHRpbmdzLmRlZmluZSkgfHxcblx0XHRcdFx0Ly8gZmFsc2U7XG5cblx0XHRcdFx0aWYgKG9Qcm9wZXJ0eSkge1xuXHRcdFx0XHRcdG9UcmFjZU1ldGFkYXRhQ29udGV4dC5wcm9wZXJ0aWVzW3NLZXldID0gb1Byb3BlcnR5O1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdG9UcmFjZU1ldGFkYXRhQ29udGV4dC52aWV3SW5mbyA9IG9WaXNpdG9yLmdldFZpZXdJbmZvKCk7XG5cdFx0XHRvVHJhY2VNZXRhZGF0YUNvbnRleHQudHJhY2VJRCA9IGFUcmFjZUluZm8ubGVuZ3RoO1xuXHRcdFx0bWFjcm9JbmZvLnBhcmVudE1hY3JvSUQgPSBtYWNyb0luZm8ubWFjcm9JRDtcblx0XHRcdG1hY3JvSW5mby5tYWNyb0lEID0gb1RyYWNlTWV0YWRhdGFDb250ZXh0LnRyYWNlSUQudG9TdHJpbmcoKTtcblx0XHRcdG9UcmFjZU1ldGFkYXRhQ29udGV4dC5tYWNyb0luZm8gPSBtYWNyb0luZm87XG5cdFx0XHRvTm9kZS5zZXRBdHRyaWJ1dGVOUyh0cmFjZU5hbWVzcGFjZSwgXCJ0cmFjZTptYWNyb0lEXCIsIG9UcmFjZU1ldGFkYXRhQ29udGV4dC50cmFjZUlELnRvU3RyaW5nKCkpO1xuXHRcdFx0YVRyYWNlSW5mby5wdXNoKG9UcmFjZU1ldGFkYXRhQ29udGV4dCk7XG5cdFx0XHRyZXR1cm4gb1RyYWNlTWV0YWRhdGFDb250ZXh0O1xuXHRcdH1cblx0fSBjYXRjaCAoZXhjKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGlzRXJyb3I6IHRydWUsXG5cdFx0XHRlcnJvcjogZXhjLFxuXHRcdFx0bmFtZTogc05hbWUsXG5cdFx0XHRub2RlOiBuZXcgWE1MU2VyaWFsaXplcigpLnNlcmlhbGl6ZVRvU3RyaW5nKG9Ob2RlKSxcblx0XHRcdGNvbnRleHRQYXRoOiBvVmlzaXRvcj8uZ2V0Q29udGV4dCgpPy5nZXRQYXRoKClcblx0XHR9O1xuXHR9XG59XG4vKipcbiAqIFJldHVybnMgdGhlIGdsb2JhbGx5IHN0b3JlZCB0cmFjZSBpbmZvcm1hdGlvbiBmb3IgdGhlIG1hY3JvIG9yXG4gKiBjb250cm9sIG1hcmtlZCB3aXRoIHRoZSBnaXZlbiBpZC5cbiAqXG4gKiBSZXR1cm5zIGFsbCB0cmFjZSBpbmZvcm1hdGlvbiBpZiBubyBpZCBpcyBzcGVjaWZpZWRcbiAqXG4gKlxuPHByZT5TdHJ1Y3R1cmUgZm9yIGEgbWFjcm9cbntcblx0bWFjcm86ICcnLCAvL25hbWUgb2YgbWFjcm9cblx0bWV0YURhdGFDb250ZXh0czogWyAvL1Byb3BlcnRpZXMgb2YgdHlwZSBzYXAudWkubW9kZWwuQ29udGV4dFxuXHRcdHtcblx0XHRcdG5hbWU6ICcnLCAvL2NvbnRleHQgcHJvcGVydHkgbmFtZSAvIGtleVxuXHRcdFx0cGF0aDogJycsIC8vZnJvbSBvQ29udGV4dC5nZXRQYXRoKClcblx0XHR9XG5cdF0sXG5cdHByb3BlcnRpZXM6IHsgLy8gT3RoZXIgcHJvcGVydGllcyB3aGljaCBiZWNvbWUgcGFydCBvZiB7dGhpcz59XG5cdFx0cHJvcGVydHkxOiB2YWx1ZSxcblx0XHRwcm9wZXJ0eTI6IHZhbHVlXG5cdH1cblx0dmlld0luZm86IHtcblx0XHR2aWV3SW5mbzoge30gLy8gQXMgc3BlY2lmaWVkIGluIHZpZXcgb3IgZnJhZ21lbnQgY3JlYXRpb25cblx0fSxcblx0dHJhY2VJRDogdGhpcy5pbmRleCwgLy9JRCBmb3IgdGhpcyB0cmFjZSBpbmZvcm1hdGlvbixcblx0bWFjcm9JbmZvOiB7XG5cdFx0bWFjcm9JRDogaW5kZXgsIC8vIHRyYWNlSUQgb2YgdGhpcyBtYWNybyAocmVkdW5kYW50IGZvciBtYWNyb3MpXG5cdFx0cGFyZW50TWFjcm9JRCwgaW5kZXggLy8gdHJhY2VJRCBvZiB0aGUgcGFyZW50IG1hY3JvIChpZiBpdCBoYXMgYSBwYXJlbnQpXG5cdH1cbn1cblN0cnVjdHVyZSBmb3IgYSBjb250cm9sXG57XG5cdGNvbnRyb2w6ICcnLCAvL2NvbnRyb2wgY2xhc3Ncblx0cHJvcGVydGllczogeyAvLyBPdGhlciBwcm9wZXJ0aWVzIHdoaWNoIGJlY29tZSBwYXJ0IG9mIHt0aGlzPn1cblx0XHRwcm9wZXJ0eTE6IHtcblx0XHRcdG9yaWdpbmFsVmFsdWU6ICcnLCAvL1ZhbHVlIGJlZm9yZSB0ZW1wbGF0aW5nXG5cdFx0XHRyZXNvbHZlZFZhbHVlOiAnJyAvL1ZhbHVlIGFmdGVyIHRlbXBsYXRpbmdcblx0XHR9XG5cdH1cblx0Y29udGV4dHM6IHsgLy9Nb2RlbHMgYW5kIENvbnRleHRzIHVzZWQgZHVyaW5nIHRlbXBsYXRpbmdcblx0XHQvLyBNb2RlbCBvciBjb250ZXh0IG5hbWUgdXNlZCBmb3IgdGhpcyBjb250cm9sXG5cdFx0bW9kZWxOYW1lMTogeyAvLyBGb3IgT0RhdGFNZXRhTW9kZWxcblx0XHRcdHBhdGgxOiB7XG5cdFx0XHRcdHBhdGg6ICcnLCAvL2Fic29sdXQgcGF0aCB3aXRoaW4gbWV0YW1vZGVsXG5cdFx0XHRcdGRhdGE6ICcnLCAvL2RhdGEgb2YgcGF0aCB1bmxlc3MgdHlwZSBPYmplY3Rcblx0XHRcdH1cblx0XHRtb2RlbE5hbWUyOiB7XG5cdFx0XHQvLyBmb3Igb3RoZXIgbW9kZWwgdHlwZXNcblx0XHRcdHtcblx0XHRcdFx0cHJvcGVydHkxOiB2YWx1ZSxcblx0XHRcdFx0cHJvcGVydHkyOiB2YWx1ZVxuXHRcdFx0fVxuXHRcdFx0Ly8gSW4gY2FzZSBiaW5kaW5nIGNhbm5vdCBiZSByZXNvbHZlZCAtPiBtYXJrIGFzIHJ1bnRpbWUgYmluZGluZ1xuXHRcdFx0Ly8gVGhpcyBpcyBub3QgYWx3YXlzIHRydWUsIGUuZy4gaW4gY2FzZSB0aGUgcGF0aCBpcyBtZXRhbW9kZWxwYXRoXG5cdFx0XHR7XG5cdFx0XHRcdFwiYmluZGluZ0ZvclwiOiBcIlJ1bnRpbWVcIlxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0dmlld0luZm86IHtcblx0XHR2aWV3SW5mbzoge30gLy8gQXMgc3BlY2lmaWVkIGluIHZpZXcgb3IgZnJhZ21lbnQgY3JlYXRpb25cblx0fSxcblx0bWFjcm9JbmZvOiB7XG5cdFx0bWFjcm9JRDogaW5kZXgsIC8vIHRyYWNlSUQgb2YgdGhlIG1hY3JvIHRoYXQgY3JlYXRlZCB0aGlzIGNvbnRyb2xcblx0XHRwYXJlbnRNYWNyb0lELCBpbmRleCAvLyB0cmFjZUlEIG9mIHRoZSBtYWNybydzIHBhcmVudCBtYWNyb1xuXHR9LFxuXHR0cmFjZUlEOiB0aGlzLmluZGV4IC8vSUQgZm9yIHRoaXMgdHJhY2UgaW5mb3JtYXRpb25cbn08L3ByZT4uXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBzYXAuZmUubWFjcm9zLlRyYWNlSW5mby5nZXRUcmFjZUluZm9cbiAqIEBwYXJhbSBpZCBUcmFjZUluZm8gaWRcbiAqIEByZXR1cm5zIE9iamVjdCAvIEFycmF5IGZvciBUcmFjZUluZm9cbiAqIEBwcml2YXRlXG4gKiBAc3RhdGljXG4gKi9cbmZ1bmN0aW9uIGdldFRyYWNlSW5mbyhpZDogbnVtYmVyKSB7XG5cdGlmIChpZCkge1xuXHRcdHJldHVybiBhVHJhY2VJbmZvW2lkXTtcblx0fVxuXHRjb25zdCBhRXJyb3JzID0gYVRyYWNlSW5mby5maWx0ZXIoZnVuY3Rpb24gKHRyYWNlSW5mbzogVHJhY2VNZXRhZGF0YUNvbnRleHQpIHtcblx0XHRyZXR1cm4gdHJhY2VJbmZvLmVycm9yO1xuXHR9KTtcblx0cmV0dXJuIChhRXJyb3JzLmxlbmd0aCA+IDAgJiYgYUVycm9ycykgfHwgYVRyYWNlSW5mbztcbn1cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIFRyYWNlSW5mbyBpcyBhY3RpdmUuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBzYXAuZmUubWFjcm9zLlRyYWNlSW5mby5pc1RyYWNlSW5mb0FjdGl2ZVxuICogQHJldHVybnMgYHRydWVgIHdoZW4gYWN0aXZlXG4gKiBAcHJpdmF0ZVxuICogQHN0YXRpY1xuICovXG5mdW5jdGlvbiBpc1RyYWNlSW5mb0FjdGl2ZSgpIHtcblx0cmV0dXJuIHRyYWNlSXNPbjtcbn1cbi8qKlxuICogQHR5cGVkZWYgc2FwLmZlLm1hY3Jvcy5UcmFjZUluZm9cbiAqIFRyYWNlSW5mbyBmb3IgU0FQIEZpb3JpIGVsZW1lbnRzXG4gKlxuICogT25jZSB0cmFjZXMgaXMgc3dpdGNoZWQsIGluZm9ybWF0aW9uIGFib3V0IG1hY3JvcyBhbmQgY29udHJvbHNcbiAqIHRoYXQgYXJlIHByb2Nlc3NlZCBkdXJpbmcgeG1sIHByZXByb2Nlc3NpbmcgKCBAc2VlIHtAbGluayBzYXAudWkuY29yZS51dGlsLlhNTFByZXByb2Nlc3Nvcn0pXG4gKiB3aWxsIGJlIGNvbGxlY3RlZCB3aXRoaW4gdGhpcyBzaW5nbGV0b25cbiAqIEBuYW1lc3BhY2VcbiAqIEBwcml2YXRlXG4gKiBAZ2xvYmFsXG4gKiBAZXhwZXJpbWVudGFsIFRoaXMgbW9kdWxlIGlzIG9ubHkgZm9yIGV4cGVyaW1lbnRhbCB1c2UhIDxici8+PGI+VGhpcyBpcyBvbmx5IGEgUE9DIGFuZCBtYXliZSBkZWxldGVkPC9iPlxuICogQHNpbmNlIDEuNzQuMFxuICovXG5leHBvcnQgZGVmYXVsdCB7XG5cdGlzVHJhY2VJbmZvQWN0aXZlOiBpc1RyYWNlSW5mb0FjdGl2ZSxcblx0dHJhY2VNYWNyb0NhbGxzOiB0cmFjZU1hY3JvQ2FsbHMsXG5cdGdldFRyYWNlSW5mbzogZ2V0VHJhY2VJbmZvXG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQUtBO0VBQ0EsTUFBTUEsVUFBa0MsR0FBRztJQUMxQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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