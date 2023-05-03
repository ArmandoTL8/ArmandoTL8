/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["@sap-ux/jest-mock-ui5/dist/generic", "sap/fe/core/controllerextensions/EditFlow", "sap/fe/core/controllerextensions/InternalEditFlow", "sap/fe/core/controllerextensions/InternalRouting", "sap/fe/core/controllerextensions/Share", "sap/fe/core/controllerextensions/SideEffects", "sap/ui/base/Event", "sap/ui/core/mvc/Controller", "sap/ui/core/mvc/View", "sap/ui/model/CompositeBinding", "sap/ui/model/odata/v4/Context", "sap/ui/model/odata/v4/ODataContextBinding", "sap/ui/model/odata/v4/ODataListBinding", "sap/ui/model/odata/v4/ODataMetaModel", "sap/ui/model/odata/v4/ODataModel", "sap/ui/model/odata/v4/ODataPropertyBinding"], function (generic, EditFlow, InternalEditFlow, InternalRouting, Share, SideEffects, Event, Controller, View, CompositeBinding, Context, ODataContextBinding, ODataListBinding, ODataMetaModel, ODataModel, ODataPropertyBinding) {
  "use strict";

  var _exports = {};
  var mock = generic.mock;
  /**
   * Factory function to create a new MockContext.
   *
   * @param oContextData A map of the different properties of the context. The value for the key '$path' will be returned by the 'getPath' method
   * @param oBinding The binding of the context
   * @param isInactive Is the context iniactive or not
   * @returns A new MockContext
   */
  function createMockContext(oContextData, oBinding, isInactive) {
    // Ugly workaround to get a proper mock pbject, as Context isn't properly exported from UI5
    const mocked = mock(Object.getPrototypeOf(Context.createNewContext(null, null, "/e")));
    mocked._isKeptAlive = false;
    mocked._contextData = oContextData || {};
    mocked._oBinding = oBinding;
    mocked._isInactive = !!isInactive;

    // Default behavior
    mocked.mock.isA.mockImplementation(sClassName => {
      return sClassName === "sap.ui.model.odata.v4.Context";
    });
    mocked.mock.getProperty.mockImplementation(key => {
      return mocked._contextData[key];
    });
    mocked.mock.requestProperty.mockImplementation(keyOrKeys => {
      if (Array.isArray(keyOrKeys)) {
        return Promise.resolve(keyOrKeys.map(key => mocked._contextData[key]));
      }
      return Promise.resolve(mocked._contextData[keyOrKeys]);
    });
    mocked.mock.requestObject.mockImplementation(key => {
      return Promise.resolve(mocked._contextData[key]);
    });
    mocked.mock.setProperty.mockImplementation((key, value) => {
      mocked._contextData[key] = value;
      return mocked._contextData[key];
    });
    mocked.mock.getObject.mockImplementation(path => {
      let result = path ? mocked._contextData[path] : mocked._contextData;
      if (!result && path && path.indexOf("/") > -1) {
        const parts = path.split("/");
        result = parts.reduce((sum, part) => {
          sum = part ? sum[part] : sum;
          return sum;
        }, mocked._contextData);
      }
      return result;
    });
    mocked.mock.getPath.mockImplementation(() => mocked._contextData["$path"]);
    mocked.mock.getBinding.mockImplementation(() => mocked._oBinding);
    mocked.mock.getModel.mockImplementation(() => {
      var _mocked$_oBinding;
      return (_mocked$_oBinding = mocked._oBinding) === null || _mocked$_oBinding === void 0 ? void 0 : _mocked$_oBinding.getModel();
    });
    mocked.mock.setKeepAlive.mockImplementation((bool, _fnOnBeforeDestroy, _bRequestMessages) => {
      mocked._isKeptAlive = bool;
    });
    mocked.mock.isKeepAlive.mockImplementation(() => mocked._isKeptAlive);
    mocked.mock.isInactive.mockImplementation(() => mocked._isInactive);
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockContext instead.
   */
  _exports.createMockContext = createMockContext;
  const MockContext = createMockContext;

  /**
   * Utility type to mock a sap.ui.base.Event
   */
  _exports.MockContext = MockContext;
  /**
   * Factory function to create a new MockEvent.
   *
   * @param params The parameters of the event
   * @returns A new MockEvent
   */
  function createMockEvent(params) {
    const mocked = mock(Event);
    mocked._params = params || {};

    // Default behavior
    mocked.mock.getParameter.mockImplementation(name => mocked._params[name]);
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockEvent instead.
   */
  _exports.createMockEvent = createMockEvent;
  const MockEvent = createMockEvent;

  /**
   * Utility type to mock a sap.ui.model.odata.v4.ODataListBinding
   */
  _exports.MockEvent = MockEvent;
  /**
   * Factory function to create a new MockListBinding.
   *
   * @param aContextData An array of objects holding the different properties of the contexts referenced by the ListBinding
   * @param oMockModel The model of the ListBinding
   * @returns A new MockListBinding
   */
  function createMockListBinding(aContextData, oMockModel) {
    const mocked = mock(ODataListBinding);
    aContextData = aContextData || [];
    mocked._aMockContexts = aContextData.map(contextData => {
      return createMockContext(contextData, mocked);
    });
    mocked._mockModel = oMockModel;

    // Utility API
    mocked.setModel = model => {
      mocked._mockModel = model;
    };

    // Default behavior
    mocked.mock.isA.mockImplementation(sClassName => {
      return sClassName === "sap.ui.model.odata.v4.ODataListBinding";
    });
    mocked.mock.requestContexts.mockImplementation(() => {
      return Promise.resolve(mocked._aMockContexts);
    });
    mocked.mock.getCurrentContexts.mockImplementation(() => {
      return mocked._aMockContexts;
    });
    mocked.mock.getAllCurrentContexts.mockImplementation(() => {
      return mocked._aMockContexts;
    });
    mocked.mock.getContexts.mockImplementation(() => {
      return mocked._aMockContexts;
    });
    mocked.mock.getModel.mockImplementation(() => {
      return mocked._mockModel;
    });
    mocked.mock.getUpdateGroupId.mockReturnValue("auto");
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockListBinding instead.
   */
  _exports.createMockListBinding = createMockListBinding;
  const MockListBinding = createMockListBinding;

  /**
   * Utility type to mock a sap.ui.model.odata.v4.ODataPropertyBinding
   */
  _exports.MockListBinding = MockListBinding;
  /**
   * Factory function to create a new MockPropertyBinding.
   *
   * @param value The value returnd by the PropertyBinding
   * @param path The path of the PropertyBinding
   * @param oMockModel The model of the PropertyBinding
   * @returns A new MockPropertyBinding
   */
  function createMockPropertyBinding(value, path, oMockModel) {
    const mocked = mock(ODataPropertyBinding);
    mocked._mockModel = oMockModel;
    mocked._value = value;
    mocked._path = path;

    // Default behavior
    mocked.mock.isA.mockImplementation(sClassName => {
      return sClassName === "sap.ui.model.odata.v4.ODataPropertyBinding";
    });
    mocked.mock.getModel.mockImplementation(() => {
      return mocked._mockModel;
    });
    mocked.mock.getValue.mockImplementation(() => {
      return mocked._value;
    });
    mocked.mock.getPath.mockImplementation(() => {
      return mocked._path;
    });
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockPropertyBinding instead.
   */
  _exports.createMockPropertyBinding = createMockPropertyBinding;
  const MockPropertyBinding = createMockPropertyBinding;

  /**
   * Utility type to mock a sap.ui.model.CompositeBinding
   */
  _exports.MockPropertyBinding = MockPropertyBinding;
  /**
   * Factory function to create a new MockCompositeBinding.
   *
   * @param aBindings The bindings of the CompositeBinding
   * @returns A new MockCompositeBinding
   */
  function createMockCompositeBinding(aBindings) {
    const mocked = mock(CompositeBinding);
    mocked._aBindings = aBindings;

    // Default behavior
    mocked.mock.isA.mockImplementation(sClassName => {
      return sClassName === "sap.ui.model.CompositeBinding";
    });
    mocked.mock.getBindings.mockImplementation(() => {
      return mocked._aBindings;
    });
    mocked.mock.getValue.mockImplementation(() => {
      return mocked._aBindings.map(binding => binding.getValue());
    });
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockCompositeBinding instead.
   */
  _exports.createMockCompositeBinding = createMockCompositeBinding;
  const MockCompositeBinding = createMockCompositeBinding;

  /**
   * Utility type to mock a sap.ui.model.odata.v4.ODataContextBinding
   */
  _exports.MockCompositeBinding = MockCompositeBinding;
  /**
   * Factory function to create a new MockContextBinding.
   *
   * @param oContext The context of the ContextBinding
   * @param oMockModel The model of the ContextBinding
   * @returns A new MockContextBinding
   */
  function createMockContextBinding(oContext, oMockModel) {
    const mocked = mock(ODataContextBinding);
    mocked.mockModel = oMockModel;
    mocked.oMockContext = createMockContext(oContext || {}, mocked);

    // Utility API
    mocked.getInternalMockContext = () => {
      return mocked.oMockContext;
    };
    mocked.setModel = oModel => {
      mocked.mockModel = oModel;
    };

    // Default behavior
    mocked.mock.isA.mockImplementation(sClassName => {
      return sClassName === "sap.ui.model.odata.v4.ODataContextBinding";
    });
    mocked.mock.getBoundContext.mockImplementation(() => {
      return mocked.oMockContext;
    });
    mocked.mock.getModel.mockImplementation(() => {
      return mocked.mockModel;
    });
    mocked.mock.execute.mockResolvedValue(true);
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockContextBinding instead.
   */
  _exports.createMockContextBinding = createMockContextBinding;
  const MockContextBinding = createMockContextBinding;

  /**
   * Utility type to mock a sap.ui.model.odata.v4.ODataMetaModel
   */
  _exports.MockContextBinding = MockContextBinding;
  /**
   * Factory function to create a new MockMetaModel.
   *
   * @param oMetaData A map of the different metadata properties of the MetaModel (path -> value).
   * @returns A new MockMetaModel
   */
  function createMockMetaModel(oMetaData) {
    const mocked = mock(ODataMetaModel);
    mocked.oMetaContext = createMockContext(oMetaData || {});

    // Default behavior
    mocked.mock.getMetaContext.mockImplementation(sPath => {
      return createMockContext({
        $path: sPath
      });
    });
    mocked.mock.getObject.mockImplementation(sPath => {
      return mocked.oMetaContext.getProperty(sPath);
    });
    mocked.mock.createBindingContext.mockImplementation(sPath => {
      return createMockContext({
        $path: sPath
      });
    });
    mocked.mock.getMetaPath.mockImplementation(sPath => {
      const metamodel = new ODataMetaModel();
      return sPath ? metamodel.getMetaPath(sPath) : sPath;
    });
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockMetaModel instead.
   */
  _exports.createMockMetaModel = createMockMetaModel;
  const MockMetaModel = createMockMetaModel;

  /**
   * Utility type to mock a sap.ui.model.odata.v4.ODataModel
   */
  _exports.MockMetaModel = MockMetaModel;
  /**
   * Factory function to create a new MockModel.
   *
   * @param oMockListBinding A list binding that will be returned when calling bindList.
   * @param oMockContextBinding A context binding that will be returned when calling bindContext.
   * @returns A new MockModel
   */
  function createMockModel(oMockListBinding, oMockContextBinding) {
    const mocked = mock(ODataModel);
    mocked.mockListBinding = oMockListBinding;
    mocked.mockContextBinding = oMockContextBinding;
    if (oMockListBinding) {
      oMockListBinding.setModel(mocked);
    }
    if (oMockContextBinding) {
      oMockContextBinding.setModel(mocked);
    }

    // Utility API
    mocked.setMetaModel = oMetaModel => {
      mocked.oMetaModel = oMetaModel;
    };

    // Default behavior
    mocked.mock.bindList.mockImplementation(() => {
      return mocked.mockListBinding;
    });
    mocked.mock.bindContext.mockImplementation(() => {
      return mocked.mockContextBinding;
    });
    mocked.mock.getMetaModel.mockImplementation(() => {
      return mocked.oMetaModel;
    });
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockModel instead.
   */
  _exports.createMockModel = createMockModel;
  const MockModel = createMockModel;
  /**
   * Factory function to create a new MockModel used with a listBinding.
   *
   * @param oMockListBinding A list binding that will be returned when calling bindList.
   * @returns A new MockModel
   */
  _exports.MockModel = MockModel;
  function createMockModelFromListBinding(oMockListBinding) {
    return createMockModel(oMockListBinding);
  }
  /**
   *  Factory function to create a new MockModel used with a contextBinding.
   *
   * @param oMockContextBinding A context binding that will be returned when calling bindContext.
   * @returns A new MockModel
   */
  _exports.createMockModelFromListBinding = createMockModelFromListBinding;
  function createMockModelFromContextBinding(oMockContextBinding) {
    return createMockModel(undefined, oMockContextBinding);
  }

  /**
   * Utility type to mock a sap.ui.core.mvc.View
   */
  _exports.createMockModelFromContextBinding = createMockModelFromContextBinding;
  /**
   * Factory function to create a new MockView.
   *
   * @returns A new MockView
   */
  function createMockView() {
    const mocked = mock(View);

    // Default behavior
    mocked.mock.isA.mockImplementation(sClassName => {
      return sClassName === "sap.ui.core.mvc.View";
    });
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockView instead.
   */
  _exports.createMockView = createMockView;
  const MockView = createMockView;

  /**
   * Utility type to mock a sap.fe.core.PageController
   */
  _exports.MockView = MockView;
  /**
   * Factory function to create a new MockController.
   *
   * @returns A new MockController
   */
  function createMockController() {
    const mocked = mock(Controller);
    mocked._routing = mock(InternalRouting);
    mocked._editFlow = mock(InternalEditFlow);
    mocked._sideEffects = mock(SideEffects);
    mocked.editFlow = mock(EditFlow);
    mocked.share = mock(Share);

    // Default Behavior
    mocked.mock.getView.mockReturnValue(createMockView());
    mocked.mock.isA.mockReturnValue(false);
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function mockController instead.
   */
  _exports.createMockController = createMockController;
  const MockController = createMockController;
  _exports.MockController = MockController;
  /**
   * Generate model, view and controller mocks that refer to each other.
   *
   * @param existing Optional existing mocked instances that should be used
   * @returns Mocked model, view and controller instances
   */
  function mockMVC(existing) {
    const model = (existing === null || existing === void 0 ? void 0 : existing.model) || createMockModel();
    const view = (existing === null || existing === void 0 ? void 0 : existing.view) || createMockView();
    const controller = (existing === null || existing === void 0 ? void 0 : existing.controller) || createMockController();
    view.mock.getController.mockReturnValue(controller);
    view.mock.getModel.mockReturnValue(model);
    controller.mock.getView.mockReturnValue(view);
    return {
      model,
      view,
      controller
    };
  }
  _exports.mockMVC = mockMVC;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVNb2NrQ29udGV4dCIsIm9Db250ZXh0RGF0YSIsIm9CaW5kaW5nIiwiaXNJbmFjdGl2ZSIsIm1vY2tlZCIsIm1vY2siLCJPYmplY3QiLCJnZXRQcm90b3R5cGVPZiIsIkNvbnRleHQiLCJjcmVhdGVOZXdDb250ZXh0IiwiX2lzS2VwdEFsaXZlIiwiX2NvbnRleHREYXRhIiwiX29CaW5kaW5nIiwiX2lzSW5hY3RpdmUiLCJpc0EiLCJtb2NrSW1wbGVtZW50YXRpb24iLCJzQ2xhc3NOYW1lIiwiZ2V0UHJvcGVydHkiLCJrZXkiLCJyZXF1ZXN0UHJvcGVydHkiLCJrZXlPcktleXMiLCJBcnJheSIsImlzQXJyYXkiLCJQcm9taXNlIiwicmVzb2x2ZSIsIm1hcCIsInJlcXVlc3RPYmplY3QiLCJzZXRQcm9wZXJ0eSIsInZhbHVlIiwiZ2V0T2JqZWN0IiwicGF0aCIsInJlc3VsdCIsImluZGV4T2YiLCJwYXJ0cyIsInNwbGl0IiwicmVkdWNlIiwic3VtIiwicGFydCIsImdldFBhdGgiLCJnZXRCaW5kaW5nIiwiZ2V0TW9kZWwiLCJzZXRLZWVwQWxpdmUiLCJib29sIiwiX2ZuT25CZWZvcmVEZXN0cm95IiwiX2JSZXF1ZXN0TWVzc2FnZXMiLCJpc0tlZXBBbGl2ZSIsIk1vY2tDb250ZXh0IiwiY3JlYXRlTW9ja0V2ZW50IiwicGFyYW1zIiwiRXZlbnQiLCJfcGFyYW1zIiwiZ2V0UGFyYW1ldGVyIiwibmFtZSIsIk1vY2tFdmVudCIsImNyZWF0ZU1vY2tMaXN0QmluZGluZyIsImFDb250ZXh0RGF0YSIsIm9Nb2NrTW9kZWwiLCJPRGF0YUxpc3RCaW5kaW5nIiwiX2FNb2NrQ29udGV4dHMiLCJjb250ZXh0RGF0YSIsIl9tb2NrTW9kZWwiLCJzZXRNb2RlbCIsIm1vZGVsIiwicmVxdWVzdENvbnRleHRzIiwiZ2V0Q3VycmVudENvbnRleHRzIiwiZ2V0QWxsQ3VycmVudENvbnRleHRzIiwiZ2V0Q29udGV4dHMiLCJnZXRVcGRhdGVHcm91cElkIiwibW9ja1JldHVyblZhbHVlIiwiTW9ja0xpc3RCaW5kaW5nIiwiY3JlYXRlTW9ja1Byb3BlcnR5QmluZGluZyIsIk9EYXRhUHJvcGVydHlCaW5kaW5nIiwiX3ZhbHVlIiwiX3BhdGgiLCJnZXRWYWx1ZSIsIk1vY2tQcm9wZXJ0eUJpbmRpbmciLCJjcmVhdGVNb2NrQ29tcG9zaXRlQmluZGluZyIsImFCaW5kaW5ncyIsIkNvbXBvc2l0ZUJpbmRpbmciLCJfYUJpbmRpbmdzIiwiZ2V0QmluZGluZ3MiLCJiaW5kaW5nIiwiTW9ja0NvbXBvc2l0ZUJpbmRpbmciLCJjcmVhdGVNb2NrQ29udGV4dEJpbmRpbmciLCJvQ29udGV4dCIsIk9EYXRhQ29udGV4dEJpbmRpbmciLCJtb2NrTW9kZWwiLCJvTW9ja0NvbnRleHQiLCJnZXRJbnRlcm5hbE1vY2tDb250ZXh0Iiwib01vZGVsIiwiZ2V0Qm91bmRDb250ZXh0IiwiZXhlY3V0ZSIsIm1vY2tSZXNvbHZlZFZhbHVlIiwiTW9ja0NvbnRleHRCaW5kaW5nIiwiY3JlYXRlTW9ja01ldGFNb2RlbCIsIm9NZXRhRGF0YSIsIk9EYXRhTWV0YU1vZGVsIiwib01ldGFDb250ZXh0IiwiZ2V0TWV0YUNvbnRleHQiLCJzUGF0aCIsIiRwYXRoIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJnZXRNZXRhUGF0aCIsIm1ldGFtb2RlbCIsIk1vY2tNZXRhTW9kZWwiLCJjcmVhdGVNb2NrTW9kZWwiLCJvTW9ja0xpc3RCaW5kaW5nIiwib01vY2tDb250ZXh0QmluZGluZyIsIk9EYXRhTW9kZWwiLCJtb2NrTGlzdEJpbmRpbmciLCJtb2NrQ29udGV4dEJpbmRpbmciLCJzZXRNZXRhTW9kZWwiLCJvTWV0YU1vZGVsIiwiYmluZExpc3QiLCJiaW5kQ29udGV4dCIsImdldE1ldGFNb2RlbCIsIk1vY2tNb2RlbCIsImNyZWF0ZU1vY2tNb2RlbEZyb21MaXN0QmluZGluZyIsImNyZWF0ZU1vY2tNb2RlbEZyb21Db250ZXh0QmluZGluZyIsInVuZGVmaW5lZCIsImNyZWF0ZU1vY2tWaWV3IiwiVmlldyIsIk1vY2tWaWV3IiwiY3JlYXRlTW9ja0NvbnRyb2xsZXIiLCJDb250cm9sbGVyIiwiX3JvdXRpbmciLCJJbnRlcm5hbFJvdXRpbmciLCJfZWRpdEZsb3ciLCJJbnRlcm5hbEVkaXRGbG93IiwiX3NpZGVFZmZlY3RzIiwiU2lkZUVmZmVjdHMiLCJlZGl0RmxvdyIsIkVkaXRGbG93Iiwic2hhcmUiLCJTaGFyZSIsImdldFZpZXciLCJNb2NrQ29udHJvbGxlciIsIm1vY2tNVkMiLCJleGlzdGluZyIsInZpZXciLCJjb250cm9sbGVyIiwiZ2V0Q29udHJvbGxlciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVUk1TW9ja0hlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFdpdGhNb2NrIH0gZnJvbSBcIkBzYXAtdXgvamVzdC1tb2NrLXVpNS9kaXN0L2dlbmVyaWNcIjtcbmltcG9ydCB7IG1vY2sgfSBmcm9tIFwiQHNhcC11eC9qZXN0LW1vY2stdWk1L2Rpc3QvZ2VuZXJpY1wiO1xuaW1wb3J0IEVkaXRGbG93IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9FZGl0Rmxvd1wiO1xuaW1wb3J0IEludGVybmFsRWRpdEZsb3cgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0ludGVybmFsRWRpdEZsb3dcIjtcbmltcG9ydCBJbnRlcm5hbFJvdXRpbmcgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0ludGVybmFsUm91dGluZ1wiO1xuaW1wb3J0IFNoYXJlIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9TaGFyZVwiO1xuaW1wb3J0IFNpZGVFZmZlY3RzIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9TaWRlRWZmZWN0c1wiO1xuaW1wb3J0IEV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IENvbnRyb2xsZXIgZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyXCI7XG5pbXBvcnQgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBDb21wb3NpdGVCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvQ29tcG9zaXRlQmluZGluZ1wiO1xuaW1wb3J0IENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgT0RhdGFDb250ZXh0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhQ29udGV4dEJpbmRpbmdcIjtcbmltcG9ydCBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCBPRGF0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNb2RlbFwiO1xuaW1wb3J0IE9EYXRhUHJvcGVydHlCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFQcm9wZXJ0eUJpbmRpbmdcIjtcblxuLyoqXG4gKiBVdGlsaXR5IHR5cGUgdG8gbW9jayBhIHNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0XG4gKi9cbmV4cG9ydCB0eXBlIE1vY2tDb250ZXh0ID0gV2l0aE1vY2s8Q29udGV4dD4gJiB7XG5cdF9pc0tlcHRBbGl2ZTogYm9vbGVhbjtcblx0X2NvbnRleHREYXRhOiBhbnk7XG5cdF9vQmluZGluZzogYW55O1xuXHRfaXNJbmFjdGl2ZTogYm9vbGVhbjtcbn07XG4vKipcbiAqIEZhY3RvcnkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgbmV3IE1vY2tDb250ZXh0LlxuICpcbiAqIEBwYXJhbSBvQ29udGV4dERhdGEgQSBtYXAgb2YgdGhlIGRpZmZlcmVudCBwcm9wZXJ0aWVzIG9mIHRoZSBjb250ZXh0LiBUaGUgdmFsdWUgZm9yIHRoZSBrZXkgJyRwYXRoJyB3aWxsIGJlIHJldHVybmVkIGJ5IHRoZSAnZ2V0UGF0aCcgbWV0aG9kXG4gKiBAcGFyYW0gb0JpbmRpbmcgVGhlIGJpbmRpbmcgb2YgdGhlIGNvbnRleHRcbiAqIEBwYXJhbSBpc0luYWN0aXZlIElzIHRoZSBjb250ZXh0IGluaWFjdGl2ZSBvciBub3RcbiAqIEByZXR1cm5zIEEgbmV3IE1vY2tDb250ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNb2NrQ29udGV4dChvQ29udGV4dERhdGE/OiBhbnksIG9CaW5kaW5nPzogYW55LCBpc0luYWN0aXZlPzogYm9vbGVhbik6IE1vY2tDb250ZXh0IHtcblx0Ly8gVWdseSB3b3JrYXJvdW5kIHRvIGdldCBhIHByb3BlciBtb2NrIHBiamVjdCwgYXMgQ29udGV4dCBpc24ndCBwcm9wZXJseSBleHBvcnRlZCBmcm9tIFVJNVxuXHRjb25zdCBtb2NrZWQgPSBtb2NrKE9iamVjdC5nZXRQcm90b3R5cGVPZigoQ29udGV4dCBhcyBhbnkpLmNyZWF0ZU5ld0NvbnRleHQobnVsbCwgbnVsbCwgXCIvZVwiKSkpIGFzIE1vY2tDb250ZXh0O1xuXHRtb2NrZWQuX2lzS2VwdEFsaXZlID0gZmFsc2U7XG5cdG1vY2tlZC5fY29udGV4dERhdGEgPSBvQ29udGV4dERhdGEgfHwge307XG5cdG1vY2tlZC5fb0JpbmRpbmcgPSBvQmluZGluZztcblx0bW9ja2VkLl9pc0luYWN0aXZlID0gISFpc0luYWN0aXZlO1xuXG5cdC8vIERlZmF1bHQgYmVoYXZpb3Jcblx0bW9ja2VkLm1vY2suaXNBLm1vY2tJbXBsZW1lbnRhdGlvbigoc0NsYXNzTmFtZTogc3RyaW5nKSA9PiB7XG5cdFx0cmV0dXJuIHNDbGFzc05hbWUgPT09IFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHRcIjtcblx0fSk7XG5cdG1vY2tlZC5tb2NrLmdldFByb3BlcnR5Lm1vY2tJbXBsZW1lbnRhdGlvbigoa2V5OiBzdHJpbmcpID0+IHtcblx0XHRyZXR1cm4gbW9ja2VkLl9jb250ZXh0RGF0YVtrZXldO1xuXHR9KTtcblx0bW9ja2VkLm1vY2sucmVxdWVzdFByb3BlcnR5Lm1vY2tJbXBsZW1lbnRhdGlvbigoa2V5T3JLZXlzOiBzdHJpbmcgfCBzdHJpbmdbXSkgPT4ge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KGtleU9yS2V5cykpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoa2V5T3JLZXlzLm1hcCgoa2V5KSA9PiBtb2NrZWQuX2NvbnRleHREYXRhW2tleV0pKTtcblx0XHR9XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShtb2NrZWQuX2NvbnRleHREYXRhW2tleU9yS2V5c10pO1xuXHR9KTtcblx0bW9ja2VkLm1vY2sucmVxdWVzdE9iamVjdC5tb2NrSW1wbGVtZW50YXRpb24oKGtleTogc3RyaW5nKSA9PiB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShtb2NrZWQuX2NvbnRleHREYXRhW2tleV0pO1xuXHR9KTtcblx0bW9ja2VkLm1vY2suc2V0UHJvcGVydHkubW9ja0ltcGxlbWVudGF0aW9uKChrZXk6IHN0cmluZywgdmFsdWU6IGFueSkgPT4ge1xuXHRcdG1vY2tlZC5fY29udGV4dERhdGFba2V5XSA9IHZhbHVlO1xuXHRcdHJldHVybiBtb2NrZWQuX2NvbnRleHREYXRhW2tleV07XG5cdH0pO1xuXG5cdG1vY2tlZC5tb2NrLmdldE9iamVjdC5tb2NrSW1wbGVtZW50YXRpb24oKHBhdGg6IHN0cmluZykgPT4ge1xuXHRcdGxldCByZXN1bHQgPSBwYXRoID8gbW9ja2VkLl9jb250ZXh0RGF0YVtwYXRoXSA6IG1vY2tlZC5fY29udGV4dERhdGE7XG5cblx0XHRpZiAoIXJlc3VsdCAmJiBwYXRoICYmIHBhdGguaW5kZXhPZihcIi9cIikgPiAtMSkge1xuXHRcdFx0Y29uc3QgcGFydHMgPSBwYXRoLnNwbGl0KFwiL1wiKTtcblx0XHRcdHJlc3VsdCA9IHBhcnRzLnJlZHVjZSgoc3VtLCBwYXJ0OiBhbnkpID0+IHtcblx0XHRcdFx0c3VtID0gcGFydCA/IHN1bVtwYXJ0XSA6IHN1bTtcblx0XHRcdFx0cmV0dXJuIHN1bTtcblx0XHRcdH0sIG1vY2tlZC5fY29udGV4dERhdGEpO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0pO1xuXG5cdG1vY2tlZC5tb2NrLmdldFBhdGgubW9ja0ltcGxlbWVudGF0aW9uKCgpID0+IG1vY2tlZC5fY29udGV4dERhdGFbXCIkcGF0aFwiXSk7XG5cdG1vY2tlZC5tb2NrLmdldEJpbmRpbmcubW9ja0ltcGxlbWVudGF0aW9uKCgpID0+IG1vY2tlZC5fb0JpbmRpbmcpO1xuXHRtb2NrZWQubW9jay5nZXRNb2RlbC5tb2NrSW1wbGVtZW50YXRpb24oKCkgPT4gbW9ja2VkLl9vQmluZGluZz8uZ2V0TW9kZWwoKSk7XG5cdG1vY2tlZC5tb2NrLnNldEtlZXBBbGl2ZS5tb2NrSW1wbGVtZW50YXRpb24oKGJvb2w6IGJvb2xlYW4sIF9mbk9uQmVmb3JlRGVzdHJveT86IGFueSwgX2JSZXF1ZXN0TWVzc2FnZXM/OiBib29sZWFuKSA9PiB7XG5cdFx0bW9ja2VkLl9pc0tlcHRBbGl2ZSA9IGJvb2w7XG5cdH0pO1xuXHRtb2NrZWQubW9jay5pc0tlZXBBbGl2ZS5tb2NrSW1wbGVtZW50YXRpb24oKCkgPT4gbW9ja2VkLl9pc0tlcHRBbGl2ZSk7XG5cdG1vY2tlZC5tb2NrLmlzSW5hY3RpdmUubW9ja0ltcGxlbWVudGF0aW9uKCgpID0+IG1vY2tlZC5faXNJbmFjdGl2ZSk7XG5cblx0cmV0dXJuIG1vY2tlZDtcbn1cbi8qKlxuICogRm9yIGNvbXBhdGliaWxpdHkgcmVhc29ucywgd2Uga2VlcCBhIG5ldyBvcGVyYXRvci4gVXNlIHRoZSBmYWN0b3J5IGZ1bmN0aW9uIGNyZWF0ZU1vY2tDb250ZXh0IGluc3RlYWQuXG4gKi9cbmV4cG9ydCBjb25zdCBNb2NrQ29udGV4dDogbmV3IChvVmFsdWVzPzogYW55LCBvQmluZGluZz86IGFueSwgaXNJbmFjdGl2ZT86IGJvb2xlYW4pID0+IE1vY2tDb250ZXh0ID0gY3JlYXRlTW9ja0NvbnRleHQgYXMgYW55O1xuXG4vKipcbiAqIFV0aWxpdHkgdHlwZSB0byBtb2NrIGEgc2FwLnVpLmJhc2UuRXZlbnRcbiAqL1xuZXhwb3J0IHR5cGUgTW9ja0V2ZW50ID0gV2l0aE1vY2s8RXZlbnQ+ICYge1xuXHRfcGFyYW1zOiB7IFtrZXk6IHN0cmluZ106IGFueSB9O1xufTtcbi8qKlxuICogRmFjdG9yeSBmdW5jdGlvbiB0byBjcmVhdGUgYSBuZXcgTW9ja0V2ZW50LlxuICpcbiAqIEBwYXJhbSBwYXJhbXMgVGhlIHBhcmFtZXRlcnMgb2YgdGhlIGV2ZW50XG4gKiBAcmV0dXJucyBBIG5ldyBNb2NrRXZlbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1vY2tFdmVudChwYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9KTogTW9ja0V2ZW50IHtcblx0Y29uc3QgbW9ja2VkID0gbW9jayhFdmVudCkgYXMgTW9ja0V2ZW50O1xuXHRtb2NrZWQuX3BhcmFtcyA9IHBhcmFtcyB8fCB7fTtcblxuXHQvLyBEZWZhdWx0IGJlaGF2aW9yXG5cdG1vY2tlZC5tb2NrLmdldFBhcmFtZXRlci5tb2NrSW1wbGVtZW50YXRpb24oKG5hbWUpID0+IG1vY2tlZC5fcGFyYW1zW25hbWVdKTtcblxuXHRyZXR1cm4gbW9ja2VkO1xufVxuLyoqXG4gKiBGb3IgY29tcGF0aWJpbGl0eSByZWFzb25zLCB3ZSBrZWVwIGEgbmV3IG9wZXJhdG9yLiBVc2UgdGhlIGZhY3RvcnkgZnVuY3Rpb24gY3JlYXRlTW9ja0V2ZW50IGluc3RlYWQuXG4gKi9cbmV4cG9ydCBjb25zdCBNb2NrRXZlbnQ6IG5ldyAocGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSkgPT4gTW9ja0V2ZW50ID0gY3JlYXRlTW9ja0V2ZW50IGFzIGFueTtcblxuLyoqXG4gKiBVdGlsaXR5IHR5cGUgdG8gbW9jayBhIHNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YUxpc3RCaW5kaW5nXG4gKi9cbmV4cG9ydCB0eXBlIE1vY2tMaXN0QmluZGluZyA9IFdpdGhNb2NrPE9EYXRhTGlzdEJpbmRpbmc+ICYge1xuXHRfYU1vY2tDb250ZXh0czogTW9ja0NvbnRleHRbXTtcblx0X21vY2tNb2RlbD86IE1vY2tNb2RlbDtcblxuXHQvKipcblx0ICogVXRpbGl0eSBtZXRob2QgdG8gc2V0IHRoZSBtb2RlbCBvZiB0aGUgTGlzdEJpbmRpbmdcblx0ICovXG5cdHNldE1vZGVsOiAobW9kZWw6IE1vY2tNb2RlbCkgPT4gdm9pZDtcbn07XG4vKipcbiAqIEZhY3RvcnkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgbmV3IE1vY2tMaXN0QmluZGluZy5cbiAqXG4gKiBAcGFyYW0gYUNvbnRleHREYXRhIEFuIGFycmF5IG9mIG9iamVjdHMgaG9sZGluZyB0aGUgZGlmZmVyZW50IHByb3BlcnRpZXMgb2YgdGhlIGNvbnRleHRzIHJlZmVyZW5jZWQgYnkgdGhlIExpc3RCaW5kaW5nXG4gKiBAcGFyYW0gb01vY2tNb2RlbCBUaGUgbW9kZWwgb2YgdGhlIExpc3RCaW5kaW5nXG4gKiBAcmV0dXJucyBBIG5ldyBNb2NrTGlzdEJpbmRpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1vY2tMaXN0QmluZGluZyhhQ29udGV4dERhdGE/OiBhbnlbXSwgb01vY2tNb2RlbD86IE1vY2tNb2RlbCk6IE1vY2tMaXN0QmluZGluZyB7XG5cdGNvbnN0IG1vY2tlZCA9IG1vY2soT0RhdGFMaXN0QmluZGluZykgYXMgTW9ja0xpc3RCaW5kaW5nO1xuXHRhQ29udGV4dERhdGEgPSBhQ29udGV4dERhdGEgfHwgW107XG5cdG1vY2tlZC5fYU1vY2tDb250ZXh0cyA9IGFDb250ZXh0RGF0YS5tYXAoKGNvbnRleHREYXRhKSA9PiB7XG5cdFx0cmV0dXJuIGNyZWF0ZU1vY2tDb250ZXh0KGNvbnRleHREYXRhLCBtb2NrZWQpO1xuXHR9KTtcblx0bW9ja2VkLl9tb2NrTW9kZWwgPSBvTW9ja01vZGVsO1xuXG5cdC8vIFV0aWxpdHkgQVBJXG5cdG1vY2tlZC5zZXRNb2RlbCA9IChtb2RlbDogTW9ja01vZGVsKSA9PiB7XG5cdFx0bW9ja2VkLl9tb2NrTW9kZWwgPSBtb2RlbDtcblx0fTtcblxuXHQvLyBEZWZhdWx0IGJlaGF2aW9yXG5cdG1vY2tlZC5tb2NrLmlzQS5tb2NrSW1wbGVtZW50YXRpb24oKHNDbGFzc05hbWU6IHN0cmluZykgPT4ge1xuXHRcdHJldHVybiBzQ2xhc3NOYW1lID09PSBcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YUxpc3RCaW5kaW5nXCI7XG5cdH0pO1xuXHRtb2NrZWQubW9jay5yZXF1ZXN0Q29udGV4dHMubW9ja0ltcGxlbWVudGF0aW9uKCgpID0+IHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG1vY2tlZC5fYU1vY2tDb250ZXh0cyk7XG5cdH0pO1xuXHRtb2NrZWQubW9jay5nZXRDdXJyZW50Q29udGV4dHMubW9ja0ltcGxlbWVudGF0aW9uKCgpID0+IHtcblx0XHRyZXR1cm4gbW9ja2VkLl9hTW9ja0NvbnRleHRzO1xuXHR9KTtcblx0bW9ja2VkLm1vY2suZ2V0QWxsQ3VycmVudENvbnRleHRzLm1vY2tJbXBsZW1lbnRhdGlvbigoKSA9PiB7XG5cdFx0cmV0dXJuIG1vY2tlZC5fYU1vY2tDb250ZXh0cztcblx0fSk7XG5cdG1vY2tlZC5tb2NrLmdldENvbnRleHRzLm1vY2tJbXBsZW1lbnRhdGlvbigoKSA9PiB7XG5cdFx0cmV0dXJuIG1vY2tlZC5fYU1vY2tDb250ZXh0cztcblx0fSk7XG5cdG1vY2tlZC5tb2NrLmdldE1vZGVsLm1vY2tJbXBsZW1lbnRhdGlvbigoKSA9PiB7XG5cdFx0cmV0dXJuIG1vY2tlZC5fbW9ja01vZGVsO1xuXHR9KTtcblx0bW9ja2VkLm1vY2suZ2V0VXBkYXRlR3JvdXBJZC5tb2NrUmV0dXJuVmFsdWUoXCJhdXRvXCIpO1xuXG5cdHJldHVybiBtb2NrZWQ7XG59XG4vKipcbiAqIEZvciBjb21wYXRpYmlsaXR5IHJlYXNvbnMsIHdlIGtlZXAgYSBuZXcgb3BlcmF0b3IuIFVzZSB0aGUgZmFjdG9yeSBmdW5jdGlvbiBjcmVhdGVNb2NrTGlzdEJpbmRpbmcgaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGNvbnN0IE1vY2tMaXN0QmluZGluZzogbmV3IChhQ29udGV4dHM/OiBhbnlbXSwgbW9ja01vZGVsPzogTW9ja01vZGVsKSA9PiBNb2NrTGlzdEJpbmRpbmcgPSBjcmVhdGVNb2NrTGlzdEJpbmRpbmcgYXMgYW55O1xuXG4vKipcbiAqIFV0aWxpdHkgdHlwZSB0byBtb2NrIGEgc2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhUHJvcGVydHlCaW5kaW5nXG4gKi9cbmV4cG9ydCB0eXBlIE1vY2tQcm9wZXJ0eUJpbmRpbmcgPSBXaXRoTW9jazxPRGF0YVByb3BlcnR5QmluZGluZz4gJiB7XG5cdF92YWx1ZT86IGFueTtcblx0X3BhdGg/OiBzdHJpbmc7XG5cdF9tb2NrTW9kZWw/OiBNb2NrTW9kZWw7XG59O1xuLyoqXG4gKiBGYWN0b3J5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIG5ldyBNb2NrUHJvcGVydHlCaW5kaW5nLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgcmV0dXJuZCBieSB0aGUgUHJvcGVydHlCaW5kaW5nXG4gKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCBvZiB0aGUgUHJvcGVydHlCaW5kaW5nXG4gKiBAcGFyYW0gb01vY2tNb2RlbCBUaGUgbW9kZWwgb2YgdGhlIFByb3BlcnR5QmluZGluZ1xuICogQHJldHVybnMgQSBuZXcgTW9ja1Byb3BlcnR5QmluZGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTW9ja1Byb3BlcnR5QmluZGluZyh2YWx1ZTogYW55LCBwYXRoPzogc3RyaW5nLCBvTW9ja01vZGVsPzogTW9ja01vZGVsKTogTW9ja1Byb3BlcnR5QmluZGluZyB7XG5cdGNvbnN0IG1vY2tlZCA9IG1vY2soT0RhdGFQcm9wZXJ0eUJpbmRpbmcpIGFzIE1vY2tQcm9wZXJ0eUJpbmRpbmc7XG5cdG1vY2tlZC5fbW9ja01vZGVsID0gb01vY2tNb2RlbDtcblx0bW9ja2VkLl92YWx1ZSA9IHZhbHVlO1xuXHRtb2NrZWQuX3BhdGggPSBwYXRoO1xuXG5cdC8vIERlZmF1bHQgYmVoYXZpb3Jcblx0bW9ja2VkLm1vY2suaXNBLm1vY2tJbXBsZW1lbnRhdGlvbigoc0NsYXNzTmFtZTogc3RyaW5nKSA9PiB7XG5cdFx0cmV0dXJuIHNDbGFzc05hbWUgPT09IFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhUHJvcGVydHlCaW5kaW5nXCI7XG5cdH0pO1xuXHRtb2NrZWQubW9jay5nZXRNb2RlbC5tb2NrSW1wbGVtZW50YXRpb24oKCkgPT4ge1xuXHRcdHJldHVybiBtb2NrZWQuX21vY2tNb2RlbDtcblx0fSk7XG5cdG1vY2tlZC5tb2NrLmdldFZhbHVlLm1vY2tJbXBsZW1lbnRhdGlvbigoKSA9PiB7XG5cdFx0cmV0dXJuIG1vY2tlZC5fdmFsdWU7XG5cdH0pO1xuXHRtb2NrZWQubW9jay5nZXRQYXRoLm1vY2tJbXBsZW1lbnRhdGlvbigoKSA9PiB7XG5cdFx0cmV0dXJuIG1vY2tlZC5fcGF0aDtcblx0fSk7XG5cblx0cmV0dXJuIG1vY2tlZDtcbn1cbi8qKlxuICogRm9yIGNvbXBhdGliaWxpdHkgcmVhc29ucywgd2Uga2VlcCBhIG5ldyBvcGVyYXRvci4gVXNlIHRoZSBmYWN0b3J5IGZ1bmN0aW9uIGNyZWF0ZU1vY2tQcm9wZXJ0eUJpbmRpbmcgaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGNvbnN0IE1vY2tQcm9wZXJ0eUJpbmRpbmc6IG5ldyAodmFsdWU6IGFueSwgb01vY2tNb2RlbD86IE1vY2tNb2RlbCkgPT4gTW9ja1Byb3BlcnR5QmluZGluZyA9IGNyZWF0ZU1vY2tQcm9wZXJ0eUJpbmRpbmcgYXMgYW55O1xuXG4vKipcbiAqIFV0aWxpdHkgdHlwZSB0byBtb2NrIGEgc2FwLnVpLm1vZGVsLkNvbXBvc2l0ZUJpbmRpbmdcbiAqL1xuZXhwb3J0IHR5cGUgTW9ja0NvbXBvc2l0ZUJpbmRpbmcgPSBXaXRoTW9jazxDb21wb3NpdGVCaW5kaW5nPiAmIHtcblx0X2FCaW5kaW5nczogTW9ja1Byb3BlcnR5QmluZGluZ1tdO1xufTtcbi8qKlxuICogRmFjdG9yeSBmdW5jdGlvbiB0byBjcmVhdGUgYSBuZXcgTW9ja0NvbXBvc2l0ZUJpbmRpbmcuXG4gKlxuICogQHBhcmFtIGFCaW5kaW5ncyBUaGUgYmluZGluZ3Mgb2YgdGhlIENvbXBvc2l0ZUJpbmRpbmdcbiAqIEByZXR1cm5zIEEgbmV3IE1vY2tDb21wb3NpdGVCaW5kaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNb2NrQ29tcG9zaXRlQmluZGluZyhhQmluZGluZ3M6IE1vY2tQcm9wZXJ0eUJpbmRpbmdbXSk6IE1vY2tDb21wb3NpdGVCaW5kaW5nIHtcblx0Y29uc3QgbW9ja2VkID0gbW9jayhDb21wb3NpdGVCaW5kaW5nKSBhcyBNb2NrQ29tcG9zaXRlQmluZGluZztcblx0bW9ja2VkLl9hQmluZGluZ3MgPSBhQmluZGluZ3M7XG5cblx0Ly8gRGVmYXVsdCBiZWhhdmlvclxuXHRtb2NrZWQubW9jay5pc0EubW9ja0ltcGxlbWVudGF0aW9uKChzQ2xhc3NOYW1lOiBzdHJpbmcpID0+IHtcblx0XHRyZXR1cm4gc0NsYXNzTmFtZSA9PT0gXCJzYXAudWkubW9kZWwuQ29tcG9zaXRlQmluZGluZ1wiO1xuXHR9KTtcblx0bW9ja2VkLm1vY2suZ2V0QmluZGluZ3MubW9ja0ltcGxlbWVudGF0aW9uKCgpID0+IHtcblx0XHRyZXR1cm4gbW9ja2VkLl9hQmluZGluZ3M7XG5cdH0pO1xuXHRtb2NrZWQubW9jay5nZXRWYWx1ZS5tb2NrSW1wbGVtZW50YXRpb24oKCkgPT4ge1xuXHRcdHJldHVybiBtb2NrZWQuX2FCaW5kaW5ncy5tYXAoKGJpbmRpbmcpID0+IGJpbmRpbmcuZ2V0VmFsdWUoKSk7XG5cdH0pO1xuXG5cdHJldHVybiBtb2NrZWQ7XG59XG4vKipcbiAqIEZvciBjb21wYXRpYmlsaXR5IHJlYXNvbnMsIHdlIGtlZXAgYSBuZXcgb3BlcmF0b3IuIFVzZSB0aGUgZmFjdG9yeSBmdW5jdGlvbiBjcmVhdGVNb2NrQ29tcG9zaXRlQmluZGluZyBpbnN0ZWFkLlxuICovXG5leHBvcnQgY29uc3QgTW9ja0NvbXBvc2l0ZUJpbmRpbmc6IG5ldyAoYUJpbmRpbmdzOiBNb2NrUHJvcGVydHlCaW5kaW5nW10pID0+IE1vY2tDb21wb3NpdGVCaW5kaW5nID0gY3JlYXRlTW9ja0NvbXBvc2l0ZUJpbmRpbmcgYXMgYW55O1xuXG4vKipcbiAqIFV0aWxpdHkgdHlwZSB0byBtb2NrIGEgc2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhQ29udGV4dEJpbmRpbmdcbiAqL1xuZXhwb3J0IHR5cGUgTW9ja0NvbnRleHRCaW5kaW5nID0gV2l0aE1vY2s8T0RhdGFDb250ZXh0QmluZGluZz4gJiB7XG5cdG9Nb2NrQ29udGV4dDogTW9ja0NvbnRleHQ7XG5cdGlzS2VwdEFsaXZlOiBib29sZWFuO1xuXHRtb2NrTW9kZWw/OiBNb2NrTW9kZWw7XG5cblx0LyoqXG5cdCAqIFV0aWxpdHkgbWV0aG9kIHRvIGFjY2VzcyB0aGUgaW50ZXJuYWwgTW9ja0NvbnRleHQgb2YgdGhlIENvbnRleHRCaW5kaW5nXG5cdCAqL1xuXHRnZXRJbnRlcm5hbE1vY2tDb250ZXh0OiAoKSA9PiBNb2NrQ29udGV4dDtcblx0LyoqXG5cdCAqIFV0aWxpdHkgbWV0aG9kIHRvIHNldCB0aGUgbW9kZWwgb2YgdGhlIENvbnRleHRCaW5kaW5nXG5cdCAqL1xuXHRzZXRNb2RlbDogKG9Nb2RlbDogTW9ja01vZGVsKSA9PiB2b2lkO1xufTtcbi8qKlxuICogRmFjdG9yeSBmdW5jdGlvbiB0byBjcmVhdGUgYSBuZXcgTW9ja0NvbnRleHRCaW5kaW5nLlxuICpcbiAqIEBwYXJhbSBvQ29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgQ29udGV4dEJpbmRpbmdcbiAqIEBwYXJhbSBvTW9ja01vZGVsIFRoZSBtb2RlbCBvZiB0aGUgQ29udGV4dEJpbmRpbmdcbiAqIEByZXR1cm5zIEEgbmV3IE1vY2tDb250ZXh0QmluZGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTW9ja0NvbnRleHRCaW5kaW5nKG9Db250ZXh0PzogYW55LCBvTW9ja01vZGVsPzogTW9ja01vZGVsKTogTW9ja0NvbnRleHRCaW5kaW5nIHtcblx0Y29uc3QgbW9ja2VkID0gbW9jayhPRGF0YUNvbnRleHRCaW5kaW5nKSBhcyBNb2NrQ29udGV4dEJpbmRpbmc7XG5cdG1vY2tlZC5tb2NrTW9kZWwgPSBvTW9ja01vZGVsO1xuXHRtb2NrZWQub01vY2tDb250ZXh0ID0gY3JlYXRlTW9ja0NvbnRleHQob0NvbnRleHQgfHwge30sIG1vY2tlZCk7XG5cblx0Ly8gVXRpbGl0eSBBUElcblx0bW9ja2VkLmdldEludGVybmFsTW9ja0NvbnRleHQgPSAoKSA9PiB7XG5cdFx0cmV0dXJuIG1vY2tlZC5vTW9ja0NvbnRleHQ7XG5cdH07XG5cdG1vY2tlZC5zZXRNb2RlbCA9IChvTW9kZWw6IE1vY2tNb2RlbCkgPT4ge1xuXHRcdG1vY2tlZC5tb2NrTW9kZWwgPSBvTW9kZWw7XG5cdH07XG5cblx0Ly8gRGVmYXVsdCBiZWhhdmlvclxuXHRtb2NrZWQubW9jay5pc0EubW9ja0ltcGxlbWVudGF0aW9uKChzQ2xhc3NOYW1lOiBzdHJpbmcpID0+IHtcblx0XHRyZXR1cm4gc0NsYXNzTmFtZSA9PT0gXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFDb250ZXh0QmluZGluZ1wiO1xuXHR9KTtcblx0bW9ja2VkLm1vY2suZ2V0Qm91bmRDb250ZXh0Lm1vY2tJbXBsZW1lbnRhdGlvbigoKSA9PiB7XG5cdFx0cmV0dXJuIG1vY2tlZC5vTW9ja0NvbnRleHQ7XG5cdH0pO1xuXHRtb2NrZWQubW9jay5nZXRNb2RlbC5tb2NrSW1wbGVtZW50YXRpb24oKCkgPT4ge1xuXHRcdHJldHVybiBtb2NrZWQubW9ja01vZGVsO1xuXHR9KTtcblx0bW9ja2VkLm1vY2suZXhlY3V0ZS5tb2NrUmVzb2x2ZWRWYWx1ZSh0cnVlKTtcblxuXHRyZXR1cm4gbW9ja2VkO1xufVxuLyoqXG4gKiBGb3IgY29tcGF0aWJpbGl0eSByZWFzb25zLCB3ZSBrZWVwIGEgbmV3IG9wZXJhdG9yLiBVc2UgdGhlIGZhY3RvcnkgZnVuY3Rpb24gY3JlYXRlTW9ja0NvbnRleHRCaW5kaW5nIGluc3RlYWQuXG4gKi9cbmV4cG9ydCBjb25zdCBNb2NrQ29udGV4dEJpbmRpbmc6IG5ldyAob0NvbnRleHQ/OiBhbnksIG9Nb2NrTW9kZWw/OiBNb2NrTW9kZWwpID0+IE1vY2tDb250ZXh0QmluZGluZyA9IGNyZWF0ZU1vY2tDb250ZXh0QmluZGluZyBhcyBhbnk7XG5cbi8qKlxuICogVXRpbGl0eSB0eXBlIHRvIG1vY2sgYSBzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFNZXRhTW9kZWxcbiAqL1xuZXhwb3J0IHR5cGUgTW9ja01ldGFNb2RlbCA9IFdpdGhNb2NrPE9EYXRhTWV0YU1vZGVsPiAmIHtcblx0b01ldGFDb250ZXh0OiBNb2NrQ29udGV4dDtcbn07XG4vKipcbiAqIEZhY3RvcnkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgbmV3IE1vY2tNZXRhTW9kZWwuXG4gKlxuICogQHBhcmFtIG9NZXRhRGF0YSBBIG1hcCBvZiB0aGUgZGlmZmVyZW50IG1ldGFkYXRhIHByb3BlcnRpZXMgb2YgdGhlIE1ldGFNb2RlbCAocGF0aCAtPiB2YWx1ZSkuXG4gKiBAcmV0dXJucyBBIG5ldyBNb2NrTWV0YU1vZGVsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNb2NrTWV0YU1vZGVsKG9NZXRhRGF0YT86IGFueSk6IE1vY2tNZXRhTW9kZWwge1xuXHRjb25zdCBtb2NrZWQgPSBtb2NrKE9EYXRhTWV0YU1vZGVsKSBhcyBNb2NrTWV0YU1vZGVsO1xuXHRtb2NrZWQub01ldGFDb250ZXh0ID0gY3JlYXRlTW9ja0NvbnRleHQob01ldGFEYXRhIHx8IHt9KTtcblxuXHQvLyBEZWZhdWx0IGJlaGF2aW9yXG5cdG1vY2tlZC5tb2NrLmdldE1ldGFDb250ZXh0Lm1vY2tJbXBsZW1lbnRhdGlvbigoc1BhdGg6IHN0cmluZykgPT4ge1xuXHRcdHJldHVybiBjcmVhdGVNb2NrQ29udGV4dCh7ICRwYXRoOiBzUGF0aCB9KTtcblx0fSk7XG5cdG1vY2tlZC5tb2NrLmdldE9iamVjdC5tb2NrSW1wbGVtZW50YXRpb24oKHNQYXRoOiBzdHJpbmcpID0+IHtcblx0XHRyZXR1cm4gbW9ja2VkLm9NZXRhQ29udGV4dC5nZXRQcm9wZXJ0eShzUGF0aCk7XG5cdH0pO1xuXHRtb2NrZWQubW9jay5jcmVhdGVCaW5kaW5nQ29udGV4dC5tb2NrSW1wbGVtZW50YXRpb24oKHNQYXRoOiBzdHJpbmcpID0+IHtcblx0XHRyZXR1cm4gY3JlYXRlTW9ja0NvbnRleHQoeyAkcGF0aDogc1BhdGggfSk7XG5cdH0pO1xuXHRtb2NrZWQubW9jay5nZXRNZXRhUGF0aC5tb2NrSW1wbGVtZW50YXRpb24oKHNQYXRoOiBzdHJpbmcpID0+IHtcblx0XHRjb25zdCBtZXRhbW9kZWwgPSBuZXcgT0RhdGFNZXRhTW9kZWwoKTtcblx0XHRyZXR1cm4gc1BhdGggPyBtZXRhbW9kZWwuZ2V0TWV0YVBhdGgoc1BhdGgpIDogc1BhdGg7XG5cdH0pO1xuXG5cdHJldHVybiBtb2NrZWQ7XG59XG4vKipcbiAqIEZvciBjb21wYXRpYmlsaXR5IHJlYXNvbnMsIHdlIGtlZXAgYSBuZXcgb3BlcmF0b3IuIFVzZSB0aGUgZmFjdG9yeSBmdW5jdGlvbiBjcmVhdGVNb2NrTWV0YU1vZGVsIGluc3RlYWQuXG4gKi9cbmV4cG9ydCBjb25zdCBNb2NrTWV0YU1vZGVsOiBuZXcgKG9NZXRhRGF0YT86IGFueSkgPT4gTW9ja01ldGFNb2RlbCA9IGNyZWF0ZU1vY2tNZXRhTW9kZWwgYXMgYW55O1xuXG4vKipcbiAqIFV0aWxpdHkgdHlwZSB0byBtb2NrIGEgc2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTW9kZWxcbiAqL1xuZXhwb3J0IHR5cGUgTW9ja01vZGVsID0gV2l0aE1vY2s8T0RhdGFNb2RlbD4gJiB7XG5cdG9NZXRhTW9kZWw/OiBNb2NrTWV0YU1vZGVsO1xuXHRtb2NrTGlzdEJpbmRpbmc/OiBNb2NrTGlzdEJpbmRpbmc7XG5cdG1vY2tDb250ZXh0QmluZGluZz86IE1vY2tDb250ZXh0QmluZGluZztcblxuXHQvKipcblx0ICogVXRpbGl0eSBtZXRob2QgdG8gc2V0IHRoZSBtZXRhbW9kZWwgb2YgdGhlIE1vY2tNb2RlbFxuXHQgKi9cblx0c2V0TWV0YU1vZGVsOiAob01ldGFNb2RlbDogTW9ja01ldGFNb2RlbCkgPT4gdm9pZDtcbn07XG4vKipcbiAqIEZhY3RvcnkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgbmV3IE1vY2tNb2RlbC5cbiAqXG4gKiBAcGFyYW0gb01vY2tMaXN0QmluZGluZyBBIGxpc3QgYmluZGluZyB0aGF0IHdpbGwgYmUgcmV0dXJuZWQgd2hlbiBjYWxsaW5nIGJpbmRMaXN0LlxuICogQHBhcmFtIG9Nb2NrQ29udGV4dEJpbmRpbmcgQSBjb250ZXh0IGJpbmRpbmcgdGhhdCB3aWxsIGJlIHJldHVybmVkIHdoZW4gY2FsbGluZyBiaW5kQ29udGV4dC5cbiAqIEByZXR1cm5zIEEgbmV3IE1vY2tNb2RlbFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTW9ja01vZGVsKG9Nb2NrTGlzdEJpbmRpbmc/OiBNb2NrTGlzdEJpbmRpbmcsIG9Nb2NrQ29udGV4dEJpbmRpbmc/OiBNb2NrQ29udGV4dEJpbmRpbmcpOiBNb2NrTW9kZWwge1xuXHRjb25zdCBtb2NrZWQgPSBtb2NrKE9EYXRhTW9kZWwpIGFzIE1vY2tNb2RlbDtcblx0bW9ja2VkLm1vY2tMaXN0QmluZGluZyA9IG9Nb2NrTGlzdEJpbmRpbmc7XG5cdG1vY2tlZC5tb2NrQ29udGV4dEJpbmRpbmcgPSBvTW9ja0NvbnRleHRCaW5kaW5nO1xuXHRpZiAob01vY2tMaXN0QmluZGluZykge1xuXHRcdG9Nb2NrTGlzdEJpbmRpbmcuc2V0TW9kZWwobW9ja2VkKTtcblx0fVxuXHRpZiAob01vY2tDb250ZXh0QmluZGluZykge1xuXHRcdG9Nb2NrQ29udGV4dEJpbmRpbmcuc2V0TW9kZWwobW9ja2VkKTtcblx0fVxuXG5cdC8vIFV0aWxpdHkgQVBJXG5cdG1vY2tlZC5zZXRNZXRhTW9kZWwgPSAob01ldGFNb2RlbDogTW9ja01ldGFNb2RlbCkgPT4ge1xuXHRcdG1vY2tlZC5vTWV0YU1vZGVsID0gb01ldGFNb2RlbDtcblx0fTtcblxuXHQvLyBEZWZhdWx0IGJlaGF2aW9yXG5cdG1vY2tlZC5tb2NrLmJpbmRMaXN0Lm1vY2tJbXBsZW1lbnRhdGlvbigoKSA9PiB7XG5cdFx0cmV0dXJuIG1vY2tlZC5tb2NrTGlzdEJpbmRpbmc7XG5cdH0pO1xuXHRtb2NrZWQubW9jay5iaW5kQ29udGV4dC5tb2NrSW1wbGVtZW50YXRpb24oKCkgPT4ge1xuXHRcdHJldHVybiBtb2NrZWQubW9ja0NvbnRleHRCaW5kaW5nO1xuXHR9KTtcblx0bW9ja2VkLm1vY2suZ2V0TWV0YU1vZGVsLm1vY2tJbXBsZW1lbnRhdGlvbigoKSA9PiB7XG5cdFx0cmV0dXJuIG1vY2tlZC5vTWV0YU1vZGVsO1xuXHR9KTtcblxuXHRyZXR1cm4gbW9ja2VkO1xufVxuLyoqXG4gKiBGb3IgY29tcGF0aWJpbGl0eSByZWFzb25zLCB3ZSBrZWVwIGEgbmV3IG9wZXJhdG9yLiBVc2UgdGhlIGZhY3RvcnkgZnVuY3Rpb24gY3JlYXRlTW9ja01vZGVsIGluc3RlYWQuXG4gKi9cbmV4cG9ydCBjb25zdCBNb2NrTW9kZWw6IG5ldyAob01vY2tMaXN0QmluZGluZz86IE1vY2tMaXN0QmluZGluZywgb01vY2tDb250ZXh0QmluZGluZz86IE1vY2tDb250ZXh0QmluZGluZykgPT4gTW9ja01vZGVsID1cblx0Y3JlYXRlTW9ja01vZGVsIGFzIGFueTtcbi8qKlxuICogRmFjdG9yeSBmdW5jdGlvbiB0byBjcmVhdGUgYSBuZXcgTW9ja01vZGVsIHVzZWQgd2l0aCBhIGxpc3RCaW5kaW5nLlxuICpcbiAqIEBwYXJhbSBvTW9ja0xpc3RCaW5kaW5nIEEgbGlzdCBiaW5kaW5nIHRoYXQgd2lsbCBiZSByZXR1cm5lZCB3aGVuIGNhbGxpbmcgYmluZExpc3QuXG4gKiBAcmV0dXJucyBBIG5ldyBNb2NrTW9kZWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1vY2tNb2RlbEZyb21MaXN0QmluZGluZyhvTW9ja0xpc3RCaW5kaW5nOiBNb2NrTGlzdEJpbmRpbmcpOiBNb2NrTW9kZWwge1xuXHRyZXR1cm4gY3JlYXRlTW9ja01vZGVsKG9Nb2NrTGlzdEJpbmRpbmcpO1xufVxuLyoqXG4gKiAgRmFjdG9yeSBmdW5jdGlvbiB0byBjcmVhdGUgYSBuZXcgTW9ja01vZGVsIHVzZWQgd2l0aCBhIGNvbnRleHRCaW5kaW5nLlxuICpcbiAqIEBwYXJhbSBvTW9ja0NvbnRleHRCaW5kaW5nIEEgY29udGV4dCBiaW5kaW5nIHRoYXQgd2lsbCBiZSByZXR1cm5lZCB3aGVuIGNhbGxpbmcgYmluZENvbnRleHQuXG4gKiBAcmV0dXJucyBBIG5ldyBNb2NrTW9kZWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1vY2tNb2RlbEZyb21Db250ZXh0QmluZGluZyhvTW9ja0NvbnRleHRCaW5kaW5nOiBNb2NrQ29udGV4dEJpbmRpbmcpOiBNb2NrTW9kZWwge1xuXHRyZXR1cm4gY3JlYXRlTW9ja01vZGVsKHVuZGVmaW5lZCwgb01vY2tDb250ZXh0QmluZGluZyk7XG59XG5cbi8qKlxuICogVXRpbGl0eSB0eXBlIHRvIG1vY2sgYSBzYXAudWkuY29yZS5tdmMuVmlld1xuICovXG5leHBvcnQgdHlwZSBNb2NrVmlldyA9IFdpdGhNb2NrPFZpZXc+O1xuLyoqXG4gKiBGYWN0b3J5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIG5ldyBNb2NrVmlldy5cbiAqXG4gKiBAcmV0dXJucyBBIG5ldyBNb2NrVmlld1xuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTW9ja1ZpZXcoKTogTW9ja1ZpZXcge1xuXHRjb25zdCBtb2NrZWQgPSBtb2NrKFZpZXcpO1xuXG5cdC8vIERlZmF1bHQgYmVoYXZpb3Jcblx0bW9ja2VkLm1vY2suaXNBLm1vY2tJbXBsZW1lbnRhdGlvbigoc0NsYXNzTmFtZTogc3RyaW5nKSA9PiB7XG5cdFx0cmV0dXJuIHNDbGFzc05hbWUgPT09IFwic2FwLnVpLmNvcmUubXZjLlZpZXdcIjtcblx0fSk7XG5cblx0cmV0dXJuIG1vY2tlZDtcbn1cbi8qKlxuICogRm9yIGNvbXBhdGliaWxpdHkgcmVhc29ucywgd2Uga2VlcCBhIG5ldyBvcGVyYXRvci4gVXNlIHRoZSBmYWN0b3J5IGZ1bmN0aW9uIGNyZWF0ZU1vY2tWaWV3IGluc3RlYWQuXG4gKi9cbmV4cG9ydCBjb25zdCBNb2NrVmlldzogbmV3ICgpID0+IE1vY2tWaWV3ID0gY3JlYXRlTW9ja1ZpZXcgYXMgYW55O1xuXG4vKipcbiAqIFV0aWxpdHkgdHlwZSB0byBtb2NrIGEgc2FwLmZlLmNvcmUuUGFnZUNvbnRyb2xsZXJcbiAqL1xuZXhwb3J0IHR5cGUgTW9ja0NvbnRyb2xsZXIgPSBXaXRoTW9jazxDb250cm9sbGVyPiAmIHtcblx0X3JvdXRpbmc6IFdpdGhNb2NrPEludGVybmFsUm91dGluZz47XG5cdF9lZGl0RmxvdzogV2l0aE1vY2s8SW50ZXJuYWxFZGl0Rmxvdz47XG5cdF9zaWRlRWZmZWN0czogV2l0aE1vY2s8U2lkZUVmZmVjdHM+O1xuXHRlZGl0RmxvdzogV2l0aE1vY2s8RWRpdEZsb3c+O1xuXHRzaGFyZTogV2l0aE1vY2s8U2hhcmU+O1xufTtcbi8qKlxuICogRmFjdG9yeSBmdW5jdGlvbiB0byBjcmVhdGUgYSBuZXcgTW9ja0NvbnRyb2xsZXIuXG4gKlxuICogQHJldHVybnMgQSBuZXcgTW9ja0NvbnRyb2xsZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1vY2tDb250cm9sbGVyKCk6IE1vY2tDb250cm9sbGVyIHtcblx0Y29uc3QgbW9ja2VkID0gbW9jayhDb250cm9sbGVyKSBhcyBNb2NrQ29udHJvbGxlcjtcblx0bW9ja2VkLl9yb3V0aW5nID0gbW9jayhJbnRlcm5hbFJvdXRpbmcpO1xuXHRtb2NrZWQuX2VkaXRGbG93ID0gbW9jayhJbnRlcm5hbEVkaXRGbG93KTtcblx0bW9ja2VkLl9zaWRlRWZmZWN0cyA9IG1vY2soU2lkZUVmZmVjdHMpO1xuXHRtb2NrZWQuZWRpdEZsb3cgPSBtb2NrKEVkaXRGbG93KTtcblx0bW9ja2VkLnNoYXJlID0gbW9jayhTaGFyZSk7XG5cblx0Ly8gRGVmYXVsdCBCZWhhdmlvclxuXHRtb2NrZWQubW9jay5nZXRWaWV3Lm1vY2tSZXR1cm5WYWx1ZShjcmVhdGVNb2NrVmlldygpKTtcblx0bW9ja2VkLm1vY2suaXNBLm1vY2tSZXR1cm5WYWx1ZShmYWxzZSk7XG5cblx0cmV0dXJuIG1vY2tlZDtcbn1cbi8qKlxuICogRm9yIGNvbXBhdGliaWxpdHkgcmVhc29ucywgd2Uga2VlcCBhIG5ldyBvcGVyYXRvci4gVXNlIHRoZSBmYWN0b3J5IGZ1bmN0aW9uIG1vY2tDb250cm9sbGVyIGluc3RlYWQuXG4gKi9cbmV4cG9ydCBjb25zdCBNb2NrQ29udHJvbGxlcjogbmV3ICgpID0+IE1vY2tDb250cm9sbGVyID0gY3JlYXRlTW9ja0NvbnRyb2xsZXIgYXMgYW55O1xuXG5leHBvcnQgaW50ZXJmYWNlIE1WQ01vY2sge1xuXHRtb2RlbDogTW9ja01vZGVsO1xuXHR2aWV3OiBNb2NrVmlldztcblx0Y29udHJvbGxlcjogTW9ja0NvbnRyb2xsZXI7XG59XG4vKipcbiAqIEdlbmVyYXRlIG1vZGVsLCB2aWV3IGFuZCBjb250cm9sbGVyIG1vY2tzIHRoYXQgcmVmZXIgdG8gZWFjaCBvdGhlci5cbiAqXG4gKiBAcGFyYW0gZXhpc3RpbmcgT3B0aW9uYWwgZXhpc3RpbmcgbW9ja2VkIGluc3RhbmNlcyB0aGF0IHNob3VsZCBiZSB1c2VkXG4gKiBAcmV0dXJucyBNb2NrZWQgbW9kZWwsIHZpZXcgYW5kIGNvbnRyb2xsZXIgaW5zdGFuY2VzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtb2NrTVZDKGV4aXN0aW5nPzogUGFydGlhbDxNVkNNb2NrPik6IE1WQ01vY2sge1xuXHRjb25zdCBtb2RlbCA9IGV4aXN0aW5nPy5tb2RlbCB8fCBjcmVhdGVNb2NrTW9kZWwoKTtcblx0Y29uc3QgdmlldyA9IGV4aXN0aW5nPy52aWV3IHx8IGNyZWF0ZU1vY2tWaWV3KCk7XG5cdGNvbnN0IGNvbnRyb2xsZXIgPSBleGlzdGluZz8uY29udHJvbGxlciB8fCBjcmVhdGVNb2NrQ29udHJvbGxlcigpO1xuXG5cdHZpZXcubW9jay5nZXRDb250cm9sbGVyLm1vY2tSZXR1cm5WYWx1ZShjb250cm9sbGVyKTtcblx0dmlldy5tb2NrLmdldE1vZGVsLm1vY2tSZXR1cm5WYWx1ZShtb2RlbCk7XG5cdGNvbnRyb2xsZXIubW9jay5nZXRWaWV3Lm1vY2tSZXR1cm5WYWx1ZSh2aWV3KTtcblxuXHRyZXR1cm4geyBtb2RlbCwgdmlldywgY29udHJvbGxlciB9O1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7RUEyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLFNBQVNBLGlCQUFpQixDQUFDQyxZQUFrQixFQUFFQyxRQUFjLEVBQUVDLFVBQW9CLEVBQWU7SUFDeEc7SUFDQSxNQUFNQyxNQUFNLEdBQUdDLElBQUksQ0FBQ0MsTUFBTSxDQUFDQyxjQUFjLENBQUVDLE9BQU8sQ0FBU0MsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFnQjtJQUM5R0wsTUFBTSxDQUFDTSxZQUFZLEdBQUcsS0FBSztJQUMzQk4sTUFBTSxDQUFDTyxZQUFZLEdBQUdWLFlBQVksSUFBSSxDQUFDLENBQUM7SUFDeENHLE1BQU0sQ0FBQ1EsU0FBUyxHQUFHVixRQUFRO0lBQzNCRSxNQUFNLENBQUNTLFdBQVcsR0FBRyxDQUFDLENBQUNWLFVBQVU7O0lBRWpDO0lBQ0FDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDUyxHQUFHLENBQUNDLGtCQUFrQixDQUFFQyxVQUFrQixJQUFLO01BQzFELE9BQU9BLFVBQVUsS0FBSywrQkFBK0I7SUFDdEQsQ0FBQyxDQUFDO0lBQ0ZaLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDWSxXQUFXLENBQUNGLGtCQUFrQixDQUFFRyxHQUFXLElBQUs7TUFDM0QsT0FBT2QsTUFBTSxDQUFD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