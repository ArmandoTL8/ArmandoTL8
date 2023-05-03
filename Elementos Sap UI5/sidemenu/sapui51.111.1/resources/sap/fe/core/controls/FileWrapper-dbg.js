/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/ResourceModel", "sap/m/BusyDialog", "./FieldWrapper"], function (CommonUtils, MetaModelConverter, ClassSupport, ResourceModel, BusyDialog, FieldWrapper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let FileWrapper = (_dec = defineUI5Class("sap.fe.core.controls.FileWrapper"), _dec2 = property({
    type: "sap.ui.core.URI"
  }), _dec3 = property({
    type: "string"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = property({
    type: "string"
  }), _dec6 = aggregation({
    type: "sap.m.Avatar",
    multiple: false
  }), _dec7 = aggregation({
    type: "sap.ui.core.Icon",
    multiple: false
  }), _dec8 = aggregation({
    type: "sap.m.Link",
    multiple: false
  }), _dec9 = aggregation({
    type: "sap.m.Text",
    multiple: false
  }), _dec10 = aggregation({
    type: "sap.ui.unified.FileUploader",
    multiple: false
  }), _dec11 = aggregation({
    type: "sap.m.Button",
    multiple: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_FieldWrapper) {
    _inheritsLoose(FileWrapper, _FieldWrapper);
    function FileWrapper() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _FieldWrapper.call(this, ...args) || this;
      _initializerDefineProperty(_this, "uploadUrl", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "propertyPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filename", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "mediaType", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "avatar", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "icon", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "link", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "text", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "fileUploader", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "deleteButton", _descriptor10, _assertThisInitialized(_this));
      _this._busy = false;
      return _this;
    }
    var _proto = FileWrapper.prototype;
    _proto.getAccessibilityInfo = function getAccessibilityInfo() {
      const accInfo = [];
      if (this.avatar) {
        accInfo.push(this.avatar);
      }
      if (this.icon) {
        accInfo.push(this.icon);
      }
      if (this.link) {
        accInfo.push(this.link);
      }
      if (this.text) {
        accInfo.push(this.text);
      }
      if (this.fileUploader) {
        accInfo.push(this.fileUploader);
      }
      if (this.deleteButton) {
        accInfo.push(this.deleteButton);
      }
      return {
        children: accInfo
      };
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      this._setAriaLabels();
      this._addSideEffects();
    };
    _proto._setAriaLabels = function _setAriaLabels() {
      this._setAriaLabelledBy(this.avatar);
      this._setAriaLabelledBy(this.icon);
      this._setAriaLabelledBy(this.link);
      this._setAriaLabelledBy(this.text);
      this._setAriaLabelledBy(this.fileUploader);
      this._setAriaLabelledBy(this.deleteButton);
    };
    _proto._addSideEffects = function _addSideEffects() {
      var _this$_getSideEffectC;
      // add control SideEffects for stream content, filename and mediatype
      const navigationProperties = [],
        view = CommonUtils.getTargetView(this),
        viewDataFullContextPath = view.getViewData().fullContextPath,
        metaModel = view.getModel().getMetaModel(),
        metaModelPath = metaModel.getMetaPath(viewDataFullContextPath),
        viewContext = metaModel.getContext(viewDataFullContextPath),
        dataViewModelPath = MetaModelConverter.getInvolvedDataModelObjects(viewContext),
        sourcePath = this.data("sourcePath"),
        fieldPath = sourcePath.replace(`${metaModelPath}`, ""),
        path = fieldPath.replace(this.propertyPath, "");
      navigationProperties.push({
        $NavigationPropertyPath: fieldPath
      });
      if (this.filename) {
        navigationProperties.push({
          $NavigationPropertyPath: path + this.filename
        });
      }
      if (this.mediaType) {
        navigationProperties.push({
          $NavigationPropertyPath: path + this.mediaType
        });
      }
      (_this$_getSideEffectC = this._getSideEffectController()) === null || _this$_getSideEffectC === void 0 ? void 0 : _this$_getSideEffectC.addControlSideEffects(dataViewModelPath.targetEntityType.fullyQualifiedName, {
        SourceProperties: [fieldPath],
        TargetEntities: navigationProperties,
        sourceControlId: this.getId()
      });
    };
    _proto._getSideEffectController = function _getSideEffectController() {
      const controller = this._getViewController();
      return controller ? controller._sideEffects : undefined;
    };
    _proto._getViewController = function _getViewController() {
      const view = CommonUtils.getTargetView(this);
      return view && view.getController();
    };
    _proto.getUploadUrl = function getUploadUrl() {
      // set upload url as canonical url for NavigationProperties
      // this is a workaround as some backends cannot resolve NavigationsProperties for stream types
      const context = this.getBindingContext();
      return context && this.uploadUrl ? this.uploadUrl.replace(context.getPath(), context.getCanonicalPath()) : "";
    };
    _proto.setUIBusy = function setUIBusy(busy) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      this._busy = busy;
      if (busy) {
        if (!this.busyDialog) {
          this.busyDialog = new BusyDialog({
            text: ResourceModel.getText("M_FILEWRAPPER_BUSY_DIALOG_TITLE"),
            showCancelButton: false
          });
        }
        setTimeout(function () {
          if (that._busy) {
            var _that$busyDialog;
            (_that$busyDialog = that.busyDialog) === null || _that$busyDialog === void 0 ? void 0 : _that$busyDialog.open();
          }
        }, 1000);
      } else {
        var _this$busyDialog;
        (_this$busyDialog = this.busyDialog) === null || _this$busyDialog === void 0 ? void 0 : _this$busyDialog.close(false);
      }
    };
    _proto.getUIBusy = function getUIBusy() {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      return this._busy;
    };
    FileWrapper.render = function render(renderManager, fileWrapper) {
      renderManager.openStart("div", fileWrapper); // FileWrapper control div
      renderManager.style("width", fileWrapper.width);
      renderManager.openEnd();

      // Outer Box
      renderManager.openStart("div"); // div for all controls
      renderManager.style("display", "flex");
      renderManager.style("box-sizing", "border-box");
      renderManager.style("justify-content", "space-between");
      renderManager.style("align-items", "center");
      renderManager.style("flex-wrap", "wrap");
      renderManager.style("align-content", "stretch");
      renderManager.style("width", "100%");
      renderManager.openEnd();

      // Display Mode
      renderManager.openStart("div"); // div for controls shown in Display mode
      renderManager.style("display", "flex");
      renderManager.style("align-items", "center");
      renderManager.openEnd();
      if (fileWrapper.avatar) {
        renderManager.renderControl(fileWrapper.avatar); // render the Avatar Control
      } else {
        renderManager.renderControl(fileWrapper.icon); // render the Icon Control
        renderManager.renderControl(fileWrapper.link); // render the Link Control
        renderManager.renderControl(fileWrapper.text); // render the Text Control for empty file indication
      }

      renderManager.close("div"); // div for controls shown in Display mode

      // Additional content for Edit Mode
      renderManager.openStart("div"); // div for controls shown in Display + Edit mode
      renderManager.style("display", "flex");
      renderManager.style("align-items", "center");
      renderManager.openEnd();
      renderManager.renderControl(fileWrapper.fileUploader); // render the FileUploader Control
      renderManager.renderControl(fileWrapper.deleteButton); // render the Delete Button Control
      renderManager.close("div"); // div for controls shown in Display + Edit mode

      renderManager.close("div"); // div for all controls

      renderManager.close("div"); // end of the complete Control
    };
    _proto.destroy = function destroy(bSuppressInvalidate) {
      const oSideEffects = this._getSideEffectController();
      if (oSideEffects) {
        oSideEffects.removeControlSideEffects(this);
      }
      delete this.busyDialog;
      FieldWrapper.prototype.destroy.apply(this, [bSuppressInvalidate]);
    };
    return FileWrapper;
  }(FieldWrapper), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "uploadUrl", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "propertyPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "filename", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "mediaType", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "avatar", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "icon", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "link", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "text", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "fileUploader", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "deleteButton", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return FileWrapper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWxlV3JhcHBlciIsImRlZmluZVVJNUNsYXNzIiwicHJvcGVydHkiLCJ0eXBlIiwiYWdncmVnYXRpb24iLCJtdWx0aXBsZSIsIl9idXN5IiwiZ2V0QWNjZXNzaWJpbGl0eUluZm8iLCJhY2NJbmZvIiwiYXZhdGFyIiwicHVzaCIsImljb24iLCJsaW5rIiwidGV4dCIsImZpbGVVcGxvYWRlciIsImRlbGV0ZUJ1dHRvbiIsImNoaWxkcmVuIiwib25CZWZvcmVSZW5kZXJpbmciLCJfc2V0QXJpYUxhYmVscyIsIl9hZGRTaWRlRWZmZWN0cyIsIl9zZXRBcmlhTGFiZWxsZWRCeSIsIm5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwidmlldyIsIkNvbW1vblV0aWxzIiwiZ2V0VGFyZ2V0VmlldyIsInZpZXdEYXRhRnVsbENvbnRleHRQYXRoIiwiZ2V0Vmlld0RhdGEiLCJmdWxsQ29udGV4dFBhdGgiLCJtZXRhTW9kZWwiLCJnZXRNb2RlbCIsImdldE1ldGFNb2RlbCIsIm1ldGFNb2RlbFBhdGgiLCJnZXRNZXRhUGF0aCIsInZpZXdDb250ZXh0IiwiZ2V0Q29udGV4dCIsImRhdGFWaWV3TW9kZWxQYXRoIiwiTWV0YU1vZGVsQ29udmVydGVyIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwic291cmNlUGF0aCIsImRhdGEiLCJmaWVsZFBhdGgiLCJyZXBsYWNlIiwicGF0aCIsInByb3BlcnR5UGF0aCIsIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwiZmlsZW5hbWUiLCJtZWRpYVR5cGUiLCJfZ2V0U2lkZUVmZmVjdENvbnRyb2xsZXIiLCJhZGRDb250cm9sU2lkZUVmZmVjdHMiLCJ0YXJnZXRFbnRpdHlUeXBlIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwiU291cmNlUHJvcGVydGllcyIsIlRhcmdldEVudGl0aWVzIiwic291cmNlQ29udHJvbElkIiwiZ2V0SWQiLCJjb250cm9sbGVyIiwiX2dldFZpZXdDb250cm9sbGVyIiwiX3NpZGVFZmZlY3RzIiwidW5kZWZpbmVkIiwiZ2V0Q29udHJvbGxlciIsImdldFVwbG9hZFVybCIsImNvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsInVwbG9hZFVybCIsImdldFBhdGgiLCJnZXRDYW5vbmljYWxQYXRoIiwic2V0VUlCdXN5IiwiYnVzeSIsInRoYXQiLCJidXN5RGlhbG9nIiwiQnVzeURpYWxvZyIsIlJlc291cmNlTW9kZWwiLCJnZXRUZXh0Iiwic2hvd0NhbmNlbEJ1dHRvbiIsInNldFRpbWVvdXQiLCJvcGVuIiwiY2xvc2UiLCJnZXRVSUJ1c3kiLCJyZW5kZXIiLCJyZW5kZXJNYW5hZ2VyIiwiZmlsZVdyYXBwZXIiLCJvcGVuU3RhcnQiLCJzdHlsZSIsIndpZHRoIiwib3BlbkVuZCIsInJlbmRlckNvbnRyb2wiLCJkZXN0cm95IiwiYlN1cHByZXNzSW52YWxpZGF0ZSIsIm9TaWRlRWZmZWN0cyIsInJlbW92ZUNvbnRyb2xTaWRlRWZmZWN0cyIsIkZpZWxkV3JhcHBlciIsInByb3RvdHlwZSIsImFwcGx5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGaWxlV3JhcHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgKiBhcyBNZXRhTW9kZWxDb252ZXJ0ZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgeyBhZ2dyZWdhdGlvbiwgZGVmaW5lVUk1Q2xhc3MsIHByb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIHsgU2lkZUVmZmVjdHNUYXJnZXRFbnRpdHlUeXBlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1NpZGVFZmZlY3RzU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCB0eXBlIHsgVmlld0RhdGEgfSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvVGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgUmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9SZXNvdXJjZU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBBdmF0YXIgZnJvbSBcInNhcC9tL0F2YXRhclwiO1xuaW1wb3J0IEJ1c3lEaWFsb2cgZnJvbSBcInNhcC9tL0J1c3lEaWFsb2dcIjtcbmltcG9ydCB0eXBlIEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgdHlwZSBMaW5rIGZyb20gXCJzYXAvbS9MaW5rXCI7XG5pbXBvcnQgdHlwZSBUZXh0IGZyb20gXCJzYXAvbS9UZXh0XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSBJY29uIGZyb20gXCJzYXAvdWkvY29yZS9JY29uXCI7XG5pbXBvcnQgdHlwZSB7IFVSSSB9IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgdHlwZSBSZW5kZXJNYW5hZ2VyIGZyb20gXCJzYXAvdWkvY29yZS9SZW5kZXJNYW5hZ2VyXCI7XG5pbXBvcnQgdHlwZSBWNENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBGaWxlVXBsb2FkZXIgZnJvbSBcInNhcC91aS91bmlmaWVkL0ZpbGVVcGxvYWRlclwiO1xuaW1wb3J0IEZpZWxkV3JhcHBlciBmcm9tIFwiLi9GaWVsZFdyYXBwZXJcIjtcblxuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbHMuRmlsZVdyYXBwZXJcIilcbmNsYXNzIEZpbGVXcmFwcGVyIGV4dGVuZHMgRmllbGRXcmFwcGVyIHtcblx0QHByb3BlcnR5KHsgdHlwZTogXCJzYXAudWkuY29yZS5VUklcIiB9KVxuXHR1cGxvYWRVcmwhOiBVUkk7XG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0cHJvcGVydHlQYXRoITogc3RyaW5nO1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGZpbGVuYW1lITogc3RyaW5nO1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdG1lZGlhVHlwZSE6IHN0cmluZztcblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAubS5BdmF0YXJcIiwgbXVsdGlwbGU6IGZhbHNlIH0pXG5cdGF2YXRhciE6IEF2YXRhcjtcblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAudWkuY29yZS5JY29uXCIsIG11bHRpcGxlOiBmYWxzZSB9KVxuXHRpY29uITogSWNvbjtcblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAubS5MaW5rXCIsIG11bHRpcGxlOiBmYWxzZSB9KVxuXHRsaW5rITogTGluaztcblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAubS5UZXh0XCIsIG11bHRpcGxlOiBmYWxzZSB9KVxuXHR0ZXh0ITogVGV4dDtcblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAudWkudW5pZmllZC5GaWxlVXBsb2FkZXJcIiwgbXVsdGlwbGU6IGZhbHNlIH0pXG5cdGZpbGVVcGxvYWRlciE6IEZpbGVVcGxvYWRlcjtcblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAubS5CdXR0b25cIiwgbXVsdGlwbGU6IGZhbHNlIH0pXG5cdGRlbGV0ZUJ1dHRvbiE6IEJ1dHRvbjtcblx0cHJpdmF0ZSBfYnVzeTogYm9vbGVhbiA9IGZhbHNlO1xuXHRwcml2YXRlIGJ1c3lEaWFsb2c/OiBCdXN5RGlhbG9nO1xuXG5cdGdldEFjY2Vzc2liaWxpdHlJbmZvKCkge1xuXHRcdGNvbnN0IGFjY0luZm8gPSBbXTtcblx0XHRpZiAodGhpcy5hdmF0YXIpIHtcblx0XHRcdGFjY0luZm8ucHVzaCh0aGlzLmF2YXRhcik7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmljb24pIHtcblx0XHRcdGFjY0luZm8ucHVzaCh0aGlzLmljb24pO1xuXHRcdH1cblx0XHRpZiAodGhpcy5saW5rKSB7XG5cdFx0XHRhY2NJbmZvLnB1c2godGhpcy5saW5rKTtcblx0XHR9XG5cdFx0aWYgKHRoaXMudGV4dCkge1xuXHRcdFx0YWNjSW5mby5wdXNoKHRoaXMudGV4dCk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmZpbGVVcGxvYWRlcikge1xuXHRcdFx0YWNjSW5mby5wdXNoKHRoaXMuZmlsZVVwbG9hZGVyKTtcblx0XHR9XG5cdFx0aWYgKHRoaXMuZGVsZXRlQnV0dG9uKSB7XG5cdFx0XHRhY2NJbmZvLnB1c2godGhpcy5kZWxldGVCdXR0b24pO1xuXHRcdH1cblx0XHRyZXR1cm4geyBjaGlsZHJlbjogYWNjSW5mbyB9O1xuXHR9XG5cblx0b25CZWZvcmVSZW5kZXJpbmcoKSB7XG5cdFx0dGhpcy5fc2V0QXJpYUxhYmVscygpO1xuXHRcdHRoaXMuX2FkZFNpZGVFZmZlY3RzKCk7XG5cdH1cblxuXHRfc2V0QXJpYUxhYmVscygpIHtcblx0XHR0aGlzLl9zZXRBcmlhTGFiZWxsZWRCeSh0aGlzLmF2YXRhcik7XG5cdFx0dGhpcy5fc2V0QXJpYUxhYmVsbGVkQnkodGhpcy5pY29uKTtcblx0XHR0aGlzLl9zZXRBcmlhTGFiZWxsZWRCeSh0aGlzLmxpbmspO1xuXHRcdHRoaXMuX3NldEFyaWFMYWJlbGxlZEJ5KHRoaXMudGV4dCk7XG5cdFx0dGhpcy5fc2V0QXJpYUxhYmVsbGVkQnkodGhpcy5maWxlVXBsb2FkZXIpO1xuXHRcdHRoaXMuX3NldEFyaWFMYWJlbGxlZEJ5KHRoaXMuZGVsZXRlQnV0dG9uKTtcblx0fVxuXG5cdF9hZGRTaWRlRWZmZWN0cygpIHtcblx0XHQvLyBhZGQgY29udHJvbCBTaWRlRWZmZWN0cyBmb3Igc3RyZWFtIGNvbnRlbnQsIGZpbGVuYW1lIGFuZCBtZWRpYXR5cGVcblx0XHRjb25zdCBuYXZpZ2F0aW9uUHJvcGVydGllczogU2lkZUVmZmVjdHNUYXJnZXRFbnRpdHlUeXBlW10gPSBbXSxcblx0XHRcdHZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KHRoaXMgYXMgQ29udHJvbCksXG5cdFx0XHR2aWV3RGF0YUZ1bGxDb250ZXh0UGF0aCA9ICh2aWV3LmdldFZpZXdEYXRhKCkgYXMgVmlld0RhdGEpLmZ1bGxDb250ZXh0UGF0aCxcblx0XHRcdG1ldGFNb2RlbCA9IHZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCxcblx0XHRcdG1ldGFNb2RlbFBhdGggPSBtZXRhTW9kZWwuZ2V0TWV0YVBhdGgodmlld0RhdGFGdWxsQ29udGV4dFBhdGgpLFxuXHRcdFx0dmlld0NvbnRleHQgPSBtZXRhTW9kZWwuZ2V0Q29udGV4dCh2aWV3RGF0YUZ1bGxDb250ZXh0UGF0aCksXG5cdFx0XHRkYXRhVmlld01vZGVsUGF0aCA9IE1ldGFNb2RlbENvbnZlcnRlci5nZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHModmlld0NvbnRleHQpLFxuXHRcdFx0c291cmNlUGF0aCA9IHRoaXMuZGF0YShcInNvdXJjZVBhdGhcIikgYXMgc3RyaW5nLFxuXHRcdFx0ZmllbGRQYXRoID0gc291cmNlUGF0aC5yZXBsYWNlKGAke21ldGFNb2RlbFBhdGh9YCwgXCJcIiksXG5cdFx0XHRwYXRoID0gZmllbGRQYXRoLnJlcGxhY2UodGhpcy5wcm9wZXJ0eVBhdGgsIFwiXCIpO1xuXG5cdFx0bmF2aWdhdGlvblByb3BlcnRpZXMucHVzaCh7ICROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBmaWVsZFBhdGggfSk7XG5cdFx0aWYgKHRoaXMuZmlsZW5hbWUpIHtcblx0XHRcdG5hdmlnYXRpb25Qcm9wZXJ0aWVzLnB1c2goeyAkTmF2aWdhdGlvblByb3BlcnR5UGF0aDogcGF0aCArIHRoaXMuZmlsZW5hbWUgfSk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLm1lZGlhVHlwZSkge1xuXHRcdFx0bmF2aWdhdGlvblByb3BlcnRpZXMucHVzaCh7ICROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBwYXRoICsgdGhpcy5tZWRpYVR5cGUgfSk7XG5cdFx0fVxuXHRcdHRoaXMuX2dldFNpZGVFZmZlY3RDb250cm9sbGVyKCk/LmFkZENvbnRyb2xTaWRlRWZmZWN0cyhkYXRhVmlld01vZGVsUGF0aC50YXJnZXRFbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZSwge1xuXHRcdFx0U291cmNlUHJvcGVydGllczogW2ZpZWxkUGF0aF0sXG5cdFx0XHRUYXJnZXRFbnRpdGllczogbmF2aWdhdGlvblByb3BlcnRpZXMsXG5cdFx0XHRzb3VyY2VDb250cm9sSWQ6IHRoaXMuZ2V0SWQoKVxuXHRcdH0pO1xuXHR9XG5cdF9nZXRTaWRlRWZmZWN0Q29udHJvbGxlcigpIHtcblx0XHRjb25zdCBjb250cm9sbGVyID0gdGhpcy5fZ2V0Vmlld0NvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlciB8IHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gY29udHJvbGxlciA/IGNvbnRyb2xsZXIuX3NpZGVFZmZlY3RzIDogdW5kZWZpbmVkO1xuXHR9XG5cdF9nZXRWaWV3Q29udHJvbGxlcigpIHtcblx0XHRjb25zdCB2aWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0Vmlldyh0aGlzIGFzIENvbnRyb2wpO1xuXHRcdHJldHVybiB2aWV3ICYmIHZpZXcuZ2V0Q29udHJvbGxlcigpO1xuXHR9XG5cdGdldFVwbG9hZFVybCgpIHtcblx0XHQvLyBzZXQgdXBsb2FkIHVybCBhcyBjYW5vbmljYWwgdXJsIGZvciBOYXZpZ2F0aW9uUHJvcGVydGllc1xuXHRcdC8vIHRoaXMgaXMgYSB3b3JrYXJvdW5kIGFzIHNvbWUgYmFja2VuZHMgY2Fubm90IHJlc29sdmUgTmF2aWdhdGlvbnNQcm9wZXJ0aWVzIGZvciBzdHJlYW0gdHlwZXNcblx0XHRjb25zdCBjb250ZXh0ID0gdGhpcy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIFY0Q29udGV4dDtcblx0XHRyZXR1cm4gY29udGV4dCAmJiB0aGlzLnVwbG9hZFVybCA/IHRoaXMudXBsb2FkVXJsLnJlcGxhY2UoY29udGV4dC5nZXRQYXRoKCksIGNvbnRleHQuZ2V0Q2Fub25pY2FsUGF0aCgpKSA6IFwiXCI7XG5cdH1cblx0c2V0VUlCdXN5KGJ1c3k6IGJvb2xlYW4pIHtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcblx0XHRjb25zdCB0aGF0ID0gdGhpcztcblx0XHR0aGlzLl9idXN5ID0gYnVzeTtcblx0XHRpZiAoYnVzeSkge1xuXHRcdFx0aWYgKCF0aGlzLmJ1c3lEaWFsb2cpIHtcblx0XHRcdFx0dGhpcy5idXN5RGlhbG9nID0gbmV3IEJ1c3lEaWFsb2coe1xuXHRcdFx0XHRcdHRleHQ6IFJlc291cmNlTW9kZWwuZ2V0VGV4dChcIk1fRklMRVdSQVBQRVJfQlVTWV9ESUFMT0dfVElUTEVcIiksXG5cdFx0XHRcdFx0c2hvd0NhbmNlbEJ1dHRvbjogZmFsc2Vcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0aWYgKHRoYXQuX2J1c3kpIHtcblx0XHRcdFx0XHR0aGF0LmJ1c3lEaWFsb2c/Lm9wZW4oKTtcblx0XHRcdFx0fVxuXHRcdFx0fSwgMTAwMCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuYnVzeURpYWxvZz8uY2xvc2UoZmFsc2UpO1xuXHRcdH1cblx0fVxuXHRnZXRVSUJ1c3koKSB7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXG5cdFx0cmV0dXJuIHRoaXMuX2J1c3k7XG5cdH1cblx0c3RhdGljIHJlbmRlcihyZW5kZXJNYW5hZ2VyOiBSZW5kZXJNYW5hZ2VyLCBmaWxlV3JhcHBlcjogRmlsZVdyYXBwZXIpIHtcblx0XHRyZW5kZXJNYW5hZ2VyLm9wZW5TdGFydChcImRpdlwiLCBmaWxlV3JhcHBlcik7IC8vIEZpbGVXcmFwcGVyIGNvbnRyb2wgZGl2XG5cdFx0cmVuZGVyTWFuYWdlci5zdHlsZShcIndpZHRoXCIsIGZpbGVXcmFwcGVyLndpZHRoKTtcblx0XHRyZW5kZXJNYW5hZ2VyLm9wZW5FbmQoKTtcblxuXHRcdC8vIE91dGVyIEJveFxuXHRcdHJlbmRlck1hbmFnZXIub3BlblN0YXJ0KFwiZGl2XCIpOyAvLyBkaXYgZm9yIGFsbCBjb250cm9sc1xuXHRcdHJlbmRlck1hbmFnZXIuc3R5bGUoXCJkaXNwbGF5XCIsIFwiZmxleFwiKTtcblx0XHRyZW5kZXJNYW5hZ2VyLnN0eWxlKFwiYm94LXNpemluZ1wiLCBcImJvcmRlci1ib3hcIik7XG5cdFx0cmVuZGVyTWFuYWdlci5zdHlsZShcImp1c3RpZnktY29udGVudFwiLCBcInNwYWNlLWJldHdlZW5cIik7XG5cdFx0cmVuZGVyTWFuYWdlci5zdHlsZShcImFsaWduLWl0ZW1zXCIsIFwiY2VudGVyXCIpO1xuXHRcdHJlbmRlck1hbmFnZXIuc3R5bGUoXCJmbGV4LXdyYXBcIiwgXCJ3cmFwXCIpO1xuXHRcdHJlbmRlck1hbmFnZXIuc3R5bGUoXCJhbGlnbi1jb250ZW50XCIsIFwic3RyZXRjaFwiKTtcblx0XHRyZW5kZXJNYW5hZ2VyLnN0eWxlKFwid2lkdGhcIiwgXCIxMDAlXCIpO1xuXHRcdHJlbmRlck1hbmFnZXIub3BlbkVuZCgpO1xuXG5cdFx0Ly8gRGlzcGxheSBNb2RlXG5cdFx0cmVuZGVyTWFuYWdlci5vcGVuU3RhcnQoXCJkaXZcIik7IC8vIGRpdiBmb3IgY29udHJvbHMgc2hvd24gaW4gRGlzcGxheSBtb2RlXG5cdFx0cmVuZGVyTWFuYWdlci5zdHlsZShcImRpc3BsYXlcIiwgXCJmbGV4XCIpO1xuXHRcdHJlbmRlck1hbmFnZXIuc3R5bGUoXCJhbGlnbi1pdGVtc1wiLCBcImNlbnRlclwiKTtcblx0XHRyZW5kZXJNYW5hZ2VyLm9wZW5FbmQoKTtcblxuXHRcdGlmIChmaWxlV3JhcHBlci5hdmF0YXIpIHtcblx0XHRcdHJlbmRlck1hbmFnZXIucmVuZGVyQ29udHJvbChmaWxlV3JhcHBlci5hdmF0YXIpOyAvLyByZW5kZXIgdGhlIEF2YXRhciBDb250cm9sXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlbmRlck1hbmFnZXIucmVuZGVyQ29udHJvbChmaWxlV3JhcHBlci5pY29uKTsgLy8gcmVuZGVyIHRoZSBJY29uIENvbnRyb2xcblx0XHRcdHJlbmRlck1hbmFnZXIucmVuZGVyQ29udHJvbChmaWxlV3JhcHBlci5saW5rKTsgLy8gcmVuZGVyIHRoZSBMaW5rIENvbnRyb2xcblx0XHRcdHJlbmRlck1hbmFnZXIucmVuZGVyQ29udHJvbChmaWxlV3JhcHBlci50ZXh0KTsgLy8gcmVuZGVyIHRoZSBUZXh0IENvbnRyb2wgZm9yIGVtcHR5IGZpbGUgaW5kaWNhdGlvblxuXHRcdH1cblx0XHRyZW5kZXJNYW5hZ2VyLmNsb3NlKFwiZGl2XCIpOyAvLyBkaXYgZm9yIGNvbnRyb2xzIHNob3duIGluIERpc3BsYXkgbW9kZVxuXG5cdFx0Ly8gQWRkaXRpb25hbCBjb250ZW50IGZvciBFZGl0IE1vZGVcblx0XHRyZW5kZXJNYW5hZ2VyLm9wZW5TdGFydChcImRpdlwiKTsgLy8gZGl2IGZvciBjb250cm9scyBzaG93biBpbiBEaXNwbGF5ICsgRWRpdCBtb2RlXG5cdFx0cmVuZGVyTWFuYWdlci5zdHlsZShcImRpc3BsYXlcIiwgXCJmbGV4XCIpO1xuXHRcdHJlbmRlck1hbmFnZXIuc3R5bGUoXCJhbGlnbi1pdGVtc1wiLCBcImNlbnRlclwiKTtcblx0XHRyZW5kZXJNYW5hZ2VyLm9wZW5FbmQoKTtcblx0XHRyZW5kZXJNYW5hZ2VyLnJlbmRlckNvbnRyb2woZmlsZVdyYXBwZXIuZmlsZVVwbG9hZGVyKTsgLy8gcmVuZGVyIHRoZSBGaWxlVXBsb2FkZXIgQ29udHJvbFxuXHRcdHJlbmRlck1hbmFnZXIucmVuZGVyQ29udHJvbChmaWxlV3JhcHBlci5kZWxldGVCdXR0b24pOyAvLyByZW5kZXIgdGhlIERlbGV0ZSBCdXR0b24gQ29udHJvbFxuXHRcdHJlbmRlck1hbmFnZXIuY2xvc2UoXCJkaXZcIik7IC8vIGRpdiBmb3IgY29udHJvbHMgc2hvd24gaW4gRGlzcGxheSArIEVkaXQgbW9kZVxuXG5cdFx0cmVuZGVyTWFuYWdlci5jbG9zZShcImRpdlwiKTsgLy8gZGl2IGZvciBhbGwgY29udHJvbHNcblxuXHRcdHJlbmRlck1hbmFnZXIuY2xvc2UoXCJkaXZcIik7IC8vIGVuZCBvZiB0aGUgY29tcGxldGUgQ29udHJvbFxuXHR9XG5cdGRlc3Ryb3koYlN1cHByZXNzSW52YWxpZGF0ZTogYm9vbGVhbikge1xuXHRcdGNvbnN0IG9TaWRlRWZmZWN0cyA9IHRoaXMuX2dldFNpZGVFZmZlY3RDb250cm9sbGVyKCk7XG5cdFx0aWYgKG9TaWRlRWZmZWN0cykge1xuXHRcdFx0b1NpZGVFZmZlY3RzLnJlbW92ZUNvbnRyb2xTaWRlRWZmZWN0cyh0aGlzKTtcblx0XHR9XG5cdFx0ZGVsZXRlIHRoaXMuYnVzeURpYWxvZztcblx0XHRGaWVsZFdyYXBwZXIucHJvdG90eXBlLmRlc3Ryb3kuYXBwbHkodGhpcywgW2JTdXBwcmVzc0ludmFsaWRhdGVdKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBGaWxlV3JhcHBlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7TUFzQk1BLFdBQVcsV0FEaEJDLGNBQWMsQ0FBQyxrQ0FBa0MsQ0FBQyxVQUVqREMsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFrQixDQUFDLENBQUMsVUFFckNELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFFNUJELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFFNUJELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFFNUJDLFdBQVcsQ0FBQztJQUFFRCxJQUFJLEVBQUUsY0FBYztJQUFFRSxR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