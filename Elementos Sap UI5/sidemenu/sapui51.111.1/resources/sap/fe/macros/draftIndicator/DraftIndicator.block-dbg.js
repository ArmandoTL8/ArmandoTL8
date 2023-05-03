/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/strings/formatMessage", "sap/base/util/deepClone", "sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/macros/ResourceModel", "sap/m/Button", "sap/m/library", "sap/m/ObjectMarker", "sap/m/Popover", "sap/m/Text", "sap/m/VBox", "sap/fe/core/jsx-runtime/jsx", "sap/fe/core/jsx-runtime/jsxs"], function (formatMessage, deepClone, BuildingBlock, CommonUtils, BindingHelper, MetaModelConverter, BindingToolkit, ResourceModel, Button, library, ObjectMarker, Popover, Text, VBox, _jsx, _jsxs) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6;
  var _exports = {};
  var ObjectMarkerVisibility = library.ObjectMarkerVisibility;
  var ObjectMarkerType = library.ObjectMarkerType;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var isEmpty = BindingToolkit.isEmpty;
  var ifElse = BindingToolkit.ifElse;
  var and = BindingToolkit.and;
  var convertMetaModelContext = MetaModelConverter.convertMetaModelContext;
  var UI = BindingHelper.UI;
  var Entity = BindingHelper.Entity;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  var blockAttribute = BuildingBlock.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let DraftIndicator = (
  /**
   * Building block for creating a DraftIndicator based on the metadata provided by OData V4.
   *
   * Usage example:
   * <pre>
   * &lt;macro:DraftIndicator
   *   id="SomeID"
   * /&gt;
   * </pre>
   *
   * @private
   */
  _dec = defineBuildingBlock({
    name: "DraftIndicator",
    namespace: "sap.fe.macros",
    isRuntime: true
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "string"
  }), _dec4 = blockAttribute({
    type: "string",
    defaultValue: "IconAndText",
    validate: value => {
      if (value && ![ObjectMarkerVisibility.IconOnly, ObjectMarkerVisibility.IconAndText].includes(value)) {
        throw new Error(`Allowed value ${value} does not match`);
      }
    }
  }), _dec5 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    $kind: ["EntitySet", "NavigationProperty"]
  }), _dec6 = blockAttribute({
    type: "boolean",
    defaultValue: false,
    bindable: true
  }), _dec7 = blockAttribute({
    type: "string",
    defaultValue: ""
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(DraftIndicator, _BuildingBlockBase);
    function DraftIndicator() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlockBase.call(this, ...args) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "draftIndicatorType", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "entitySet", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isDraftIndicatorVisible", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "class", _descriptor6, _assertThisInitialized(_this));
      return _this;
    }
    _exports = DraftIndicator;
    /**
     * Runtime formatter function to format the correct text that displays the owner of a draft.
     *
     * This is used in case the DraftIndicator is shown for an active entity that has a draft of another user.
     *
     * @param hasDraftEntity
     * @param draftInProcessByUser
     * @param draftLastChangedByUser
     * @param draftInProcessByUserDesc
     * @param draftLastChangedByUserDesc
     * @returns Text to display
     */
    DraftIndicator.formatDraftOwnerTextInPopover = function formatDraftOwnerTextInPopover(hasDraftEntity, draftInProcessByUser, draftLastChangedByUser, draftInProcessByUserDesc, draftLastChangedByUserDesc) {
      if (hasDraftEntity) {
        const userDescription = draftInProcessByUserDesc || draftInProcessByUser || draftLastChangedByUserDesc || draftLastChangedByUser;
        if (!userDescription) {
          return ResourceModel.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_UNSAVED_CHANGES_BY_UNKNOWN");
        } else {
          return draftInProcessByUser ? ResourceModel.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_LOCKED_BY_KNOWN", [userDescription]) : ResourceModel.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_UNSAVED_CHANGES_BY_KNOWN", [userDescription]);
        }
      } else {
        return ResourceModel.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_NO_DATA_TEXT");
      }
    }

    /***
     * Gets the properties of the DraftAdministrativeData entity connected to the given entity set
     *
     * @returns List of property names
     */;
    var _proto = DraftIndicator.prototype;
    _proto.getDraftAdministrativeDataProperties = function getDraftAdministrativeDataProperties() {
      const draftAdministrativeDataContext = this.entitySet.getModel().createBindingContext("DraftAdministrativeData", this.entitySet);
      const convertedDraftAdministrativeData = convertMetaModelContext(draftAdministrativeDataContext);
      return convertedDraftAdministrativeData.targetType.entityProperties.map(property => property.name);
    }

    /**
     * Constructs the binding expression for the text displayed as title of the popup.
     *
     * @returns The binding expression
     */;
    _proto.getPopoverTitleBindingExpression = function getPopoverTitleBindingExpression() {
      return ifElse(not(Entity.IsActive), pathInModel("M_COMMON_DRAFT_OBJECT", "sap.fe.i18n"), ifElse(Entity.HasDraft, ifElse(not(isEmpty(pathInModel("DraftAdministrativeData/InProcessByUser"))), pathInModel("M_COMMON_DRAFT_LOCKED_OBJECT", "sap.fe.i18n"), pathInModel("M_DRAFT_POPOVER_ADMIN_UNSAVED_OBJECT", "sap.fe.i18n")), this.draftIndicatorType === ObjectMarkerVisibility.IconAndText ? " " : pathInModel("C_DRAFT_POPOVER_ADMIN_DATA_DRAFTINFO_FLAGGED_OBJECT", "sap.fe.i18n")));
    }

    /**
     * Constructs the binding expression for the text displayed to identify the draft owner in the popup.
     * This binding is configured to call formatDraftOwnerTextInPopover at runtime.
     *
     * We cannot reference formatDraftOwnerTextInPopover directly as we need to conditionally pass properties that might exist or not,
     * and referring to non-existing properties fails the binding.
     *
     * @returns The binding expression
     */;
    _proto.getDraftOwnerTextBindingExpression = function getDraftOwnerTextBindingExpression() {
      const draftAdministrativeDataProperties = this.getDraftAdministrativeDataProperties();
      const parts = [{
        path: "HasDraftEntity",
        targetType: "any"
      }, {
        path: "DraftAdministrativeData/InProcessByUser"
      }, {
        path: "DraftAdministrativeData/LastChangedByUser"
      }];
      if (draftAdministrativeDataProperties.includes("InProcessByUserDescription")) {
        parts.push({
          path: "DraftAdministrativeData/InProcessByUserDescription"
        });
      }
      if (draftAdministrativeDataProperties.includes("LastChangedByUserDescription")) {
        parts.push({
          path: "DraftAdministrativeData/LastChangedByUserDescription"
        });
      }
      return {
        parts,
        formatter: DraftIndicator.formatDraftOwnerTextInPopover
      };
    }

    /**
     * Creates a popover control to display draft information.
     *
     * @param control Control that the popover is to be created for
     * @returns The created popover control
     */;
    _proto.createPopover = function createPopover(control) {
      const isDraftWithNoChangesBinding = and(not(Entity.IsActive), isEmpty(pathInModel("DraftAdministrativeData/LastChangeDateTime")));
      const draftWithNoChangesTextBinding = this.draftIndicatorType === ObjectMarkerVisibility.IconAndText ? pathInModel("M_DRAFT_POPOVER_ADMIN_GENERIC_LOCKED_OBJECT_POPOVER_TEXT", "sap.fe.i18n") : pathInModel("C_DRAFT_POPOVER_ADMIN_DATA_DRAFTINFO_POPOVER_NO_DATA_TEXT", "sap.fe.i18n");
      const isDraftWithChangesBinding = and(not(Entity.IsActive), not(isEmpty(pathInModel("DraftAdministrativeData/LastChangeDateTime"))));
      const draftWithChangesTextBinding = {
        parts: [{
          path: "M_DRAFT_POPOVER_ADMIN_LAST_CHANGE_TEXT",
          model: "sap.fe.i18n"
        }, {
          path: "DraftAdministrativeData/LastChangeDateTime"
        }],
        formatter: formatMessage
      };
      const isActiveInstanceBinding = and(Entity.IsActive, not(isEmpty(pathInModel("DraftAdministrativeData/LastChangeDateTime"))));
      const activeInstanceTextBinding = deepClone(draftWithChangesTextBinding);
      const popover = _jsx(Popover, {
        title: this.getPopoverTitleBindingExpression(),
        showHeader: true,
        contentWidth: "15.625rem",
        verticalScrolling: false,
        class: "sapUiContentPadding",
        endButton: _jsx(Button, {
          icon: "sap-icon://decline",
          press: () => {
            var _this$draftPopover;
            return (_this$draftPopover = this.draftPopover) === null || _this$draftPopover === void 0 ? void 0 : _this$draftPopover.close();
          }
        }),
        children: _jsxs(VBox, {
          class: "sapUiContentPadding",
          children: [_jsx(VBox, {
            visible: isDraftWithNoChangesBinding,
            children: _jsx(Text, {
              text: draftWithNoChangesTextBinding
            })
          }), _jsx(VBox, {
            visible: isDraftWithChangesBinding,
            children: _jsx(Text, {
              text: draftWithChangesTextBinding
            })
          }), _jsxs(VBox, {
            visible: isActiveInstanceBinding,
            children: [_jsx(Text, {
              text: this.getDraftOwnerTextBindingExpression()
            }), _jsx(Text, {
              class: "sapUiSmallMarginTop",
              text: activeInstanceTextBinding
            })]
          })]
        })
      });
      CommonUtils.getTargetView(control).addDependent(popover);
      return popover;
    }

    /**
     * Handles pressing of the object marker by opening a corresponding popover.
     *
     * @param event Event object passed from the press event
     */;
    _proto.onObjectMarkerPressed = function onObjectMarkerPressed(event) {
      const source = event.getSource();
      const bindingContext = source.getBindingContext();
      this.draftPopover ??= this.createPopover(source);
      this.draftPopover.setBindingContext(bindingContext);
      this.draftPopover.openBy(source, false);
    }

    /**
     * Constructs the binding expression for the "additionalInfo" attribute in the "IconAndText" case.
     *
     * @returns The binding expression
     */;
    _proto.getIconAndTextAdditionalInfoBindingExpression = function getIconAndTextAdditionalInfoBindingExpression() {
      const draftAdministrativeDataProperties = this.getDraftAdministrativeDataProperties();
      const orBindings = [];
      if (draftAdministrativeDataProperties.includes("InProcessByUserDescription")) {
        orBindings.push(pathInModel("DraftAdministrativeData/InProcessByUserDescription"));
      }
      orBindings.push(pathInModel("DraftAdministrativeData/InProcessByUser"));
      if (draftAdministrativeDataProperties.includes("LastChangedByUserDescription")) {
        orBindings.push(pathInModel("DraftAdministrativeData/LastChangedByUserDescription"));
      }
      orBindings.push(pathInModel("DraftAdministrativeData/LastChangedByUser"));
      return ifElse(Entity.HasDraft, or(...orBindings), "");
    }

    /**
     * Returns the content of this building block for the "IconAndText" type.
     *
     * @returns The control tree
     */;
    _proto.getIconAndTextContent = function getIconAndTextContent() {
      const type = ifElse(not(Entity.IsActive), ObjectMarkerType.Draft, ifElse(Entity.HasDraft, ifElse(pathInModel("DraftAdministrativeData/InProcessByUser"), ObjectMarkerType.LockedBy, ifElse(pathInModel("DraftAdministrativeData/LastChangedByUser"), ObjectMarkerType.UnsavedBy, ObjectMarkerType.Unsaved)), ObjectMarkerType.Flagged));
      const visibility = ifElse(not(Entity.HasDraft), ObjectMarkerVisibility.TextOnly, ObjectMarkerVisibility.IconAndText);
      return _jsx(ObjectMarker, {
        type: type,
        press: this.onObjectMarkerPressed.bind(this),
        visibility: visibility,
        visible: this.isDraftIndicatorVisible,
        additionalInfo: this.getIconAndTextAdditionalInfoBindingExpression(),
        ariaLabelledBy: this.ariaLabelledBy ? [this.ariaLabelledBy] : [],
        class: this.class
      });
    }

    /**
     * Returns the content of this building block for the "IconOnly" type.
     *
     * @returns The control tree
     */;
    _proto.getIconOnlyContent = function getIconOnlyContent() {
      const type = ifElse(not(Entity.IsActive), ObjectMarkerType.Draft, ifElse(Entity.HasDraft, ifElse(pathInModel("DraftAdministrativeData/InProcessByUser"), ObjectMarkerType.Locked, ObjectMarkerType.Unsaved), ObjectMarkerType.Flagged));
      const visible = and(not(UI.IsEditable), Entity.HasDraft, not(pathInModel("DraftAdministrativeData/DraftIsCreatedByMe")));
      return _jsx(ObjectMarker, {
        type: type,
        press: this.onObjectMarkerPressed.bind(this),
        visibility: ObjectMarkerVisibility.IconOnly,
        visible: visible,
        ariaLabelledBy: this.ariaLabelledBy ? [this.ariaLabelledBy] : [],
        class: this.class
      });
    }

    /**
     * Returns the content of this building block.
     *
     * @returns The control tree
     */;
    _proto.getContent = function getContent() {
      if (this.draftIndicatorType === ObjectMarkerVisibility.IconAndText) {
        return this.getIconAndTextContent();
      } else {
        return this.getIconOnlyContent();
      }
    };
    return DraftIndicator;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "draftIndicatorType", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "entitySet", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "isDraftIndicatorVisible", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "class", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = DraftIndicator;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEcmFmdEluZGljYXRvciIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiaXNSdW50aW1lIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwiZGVmYXVsdFZhbHVlIiwidmFsaWRhdGUiLCJ2YWx1ZSIsIk9iamVjdE1hcmtlclZpc2liaWxpdHkiLCJJY29uT25seSIsIkljb25BbmRUZXh0IiwiaW5jbHVkZXMiLCJFcnJvciIsInJlcXVpcmVkIiwiJGtpbmQiLCJiaW5kYWJsZSIsImZvcm1hdERyYWZ0T3duZXJUZXh0SW5Qb3BvdmVyIiwiaGFzRHJhZnRFbnRpdHkiLCJkcmFmdEluUHJvY2Vzc0J5VXNlciIsImRyYWZ0TGFzdENoYW5nZWRCeVVzZXIiLCJkcmFmdEluUHJvY2Vzc0J5VXNlckRlc2MiLCJkcmFmdExhc3RDaGFuZ2VkQnlVc2VyRGVzYyIsInVzZXJEZXNjcmlwdGlvbiIsIlJlc291cmNlTW9kZWwiLCJnZXRUZXh0IiwiZ2V0RHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFQcm9wZXJ0aWVzIiwiZHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFDb250ZXh0IiwiZW50aXR5U2V0IiwiZ2V0TW9kZWwiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImNvbnZlcnRlZERyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhIiwiY29udmVydE1ldGFNb2RlbENvbnRleHQiLCJ0YXJnZXRUeXBlIiwiZW50aXR5UHJvcGVydGllcyIsIm1hcCIsInByb3BlcnR5IiwiZ2V0UG9wb3ZlclRpdGxlQmluZGluZ0V4cHJlc3Npb24iLCJpZkVsc2UiLCJub3QiLCJFbnRpdHkiLCJJc0FjdGl2ZSIsInBhdGhJbk1vZGVsIiwiSGFzRHJhZnQiLCJpc0VtcHR5IiwiZHJhZnRJbmRpY2F0b3JUeXBlIiwiZ2V0RHJhZnRPd25lclRleHRCaW5kaW5nRXhwcmVzc2lvbiIsImRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhUHJvcGVydGllcyIsInBhcnRzIiwicGF0aCIsInB1c2giLCJmb3JtYXR0ZXIiLCJjcmVhdGVQb3BvdmVyIiwiY29udHJvbCIsImlzRHJhZnRXaXRoTm9DaGFuZ2VzQmluZGluZyIsImFuZCIsImRyYWZ0V2l0aE5vQ2hhbmdlc1RleHRCaW5kaW5nIiwiaXNEcmFmdFdpdGhDaGFuZ2VzQmluZGluZyIsImRyYWZ0V2l0aENoYW5nZXNUZXh0QmluZGluZyIsIm1vZGVsIiwiZm9ybWF0TWVzc2FnZSIsImlzQWN0aXZlSW5zdGFuY2VCaW5kaW5nIiwiYWN0aXZlSW5zdGFuY2VUZXh0QmluZGluZyIsImRlZXBDbG9uZSIsInBvcG92ZXIiLCJkcmFmdFBvcG92ZXIiLCJjbG9zZSIsIkNvbW1vblV0aWxzIiwiZ2V0VGFyZ2V0VmlldyIsImFkZERlcGVuZGVudCIsIm9uT2JqZWN0TWFya2VyUHJlc3NlZCIsImV2ZW50Iiwic291cmNlIiwiZ2V0U291cmNlIiwiYmluZGluZ0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsInNldEJpbmRpbmdDb250ZXh0Iiwib3BlbkJ5IiwiZ2V0SWNvbkFuZFRleHRBZGRpdGlvbmFsSW5mb0JpbmRpbmdFeHByZXNzaW9uIiwib3JCaW5kaW5ncyIsIm9yIiwiZ2V0SWNvbkFuZFRleHRDb250ZW50IiwiT2JqZWN0TWFya2VyVHlwZSIsIkRyYWZ0IiwiTG9ja2VkQnkiLCJVbnNhdmVkQnkiLCJVbnNhdmVkIiwiRmxhZ2dlZCIsInZpc2liaWxpdHkiLCJUZXh0T25seSIsImJpbmQiLCJpc0RyYWZ0SW5kaWNhdG9yVmlzaWJsZSIsImFyaWFMYWJlbGxlZEJ5IiwiY2xhc3MiLCJnZXRJY29uT25seUNvbnRlbnQiLCJMb2NrZWQiLCJ2aXNpYmxlIiwiVUkiLCJJc0VkaXRhYmxlIiwiZ2V0Q29udGVudCIsIkJ1aWxkaW5nQmxvY2tCYXNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJEcmFmdEluZGljYXRvci5ibG9jay50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZvcm1hdE1lc3NhZ2UgZnJvbSBcInNhcC9iYXNlL3N0cmluZ3MvZm9ybWF0TWVzc2FnZVwiO1xuaW1wb3J0IGRlZXBDbG9uZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9kZWVwQ2xvbmVcIjtcbmltcG9ydCB7IGJsb2NrQXR0cmlidXRlLCBCdWlsZGluZ0Jsb2NrQmFzZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBFbnRpdHksIFVJIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9CaW5kaW5nSGVscGVyXCI7XG5pbXBvcnQgeyBjb252ZXJ0TWV0YU1vZGVsQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHR5cGUgeyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgYW5kLCBpZkVsc2UsIGlzRW1wdHksIG5vdCwgb3IsIHBhdGhJbk1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvZmUvbWFjcm9zL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IHsgT2JqZWN0TWFya2VyVHlwZSwgT2JqZWN0TWFya2VyVmlzaWJpbGl0eSB9IGZyb20gXCJzYXAvbS9saWJyYXJ5XCI7XG5pbXBvcnQgT2JqZWN0TWFya2VyIGZyb20gXCJzYXAvbS9PYmplY3RNYXJrZXJcIjtcbmltcG9ydCBQb3BvdmVyIGZyb20gXCJzYXAvbS9Qb3BvdmVyXCI7XG5pbXBvcnQgVGV4dCBmcm9tIFwic2FwL20vVGV4dFwiO1xuaW1wb3J0IFZCb3ggZnJvbSBcInNhcC9tL1ZCb3hcIjtcbmltcG9ydCB0eXBlIEV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcblxuLyoqXG4gKiBCdWlsZGluZyBibG9jayBmb3IgY3JlYXRpbmcgYSBEcmFmdEluZGljYXRvciBiYXNlZCBvbiB0aGUgbWV0YWRhdGEgcHJvdmlkZWQgYnkgT0RhdGEgVjQuXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86RHJhZnRJbmRpY2F0b3JcbiAqICAgaWQ9XCJTb21lSURcIlxuICogLyZndDtcbiAqIDwvcHJlPlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHsgbmFtZTogXCJEcmFmdEluZGljYXRvclwiLCBuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvc1wiLCBpc1J1bnRpbWU6IHRydWUgfSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERyYWZ0SW5kaWNhdG9yIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHQvKipcblx0ICogSUQgb2YgdGhlIERyYWZ0SW5kaWNhdG9yXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHB1YmxpYyBpZCE6IHN0cmluZztcblxuXHQvKipcblx0ICogUHJvcGVydHkgYWRkZWQgdG8gYXNzb2NpYXRlIHRoZSBsYWJlbCB3aXRoIHRoZSBEcmFmdEluZGljYXRvclxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRwdWJsaWMgYXJpYUxhYmVsbGVkQnk/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFR5cGUgb2YgdGhlIERyYWZ0SW5kaWNhdG9yLCBlaXRoZXIgXCJJY29uQW5kVGV4dFwiIChkZWZhdWx0KSBvciBcIkljb25Pbmx5XCJcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRkZWZhdWx0VmFsdWU6IFwiSWNvbkFuZFRleHRcIixcblx0XHR2YWxpZGF0ZTogKHZhbHVlPzogT2JqZWN0TWFya2VyVmlzaWJpbGl0eSkgPT4ge1xuXHRcdFx0aWYgKHZhbHVlICYmICFbT2JqZWN0TWFya2VyVmlzaWJpbGl0eS5JY29uT25seSwgT2JqZWN0TWFya2VyVmlzaWJpbGl0eS5JY29uQW5kVGV4dF0uaW5jbHVkZXModmFsdWUpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgQWxsb3dlZCB2YWx1ZSAke3ZhbHVlfSBkb2VzIG5vdCBtYXRjaGApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSlcblx0cHVibGljIGRyYWZ0SW5kaWNhdG9yVHlwZSE6IE9iamVjdE1hcmtlclZpc2liaWxpdHkuSWNvbk9ubHkgfCBPYmplY3RNYXJrZXJWaXNpYmlsaXR5Lkljb25BbmRUZXh0O1xuXG5cdC8qKlxuXHQgKiBNYW5kYXRvcnkgY29udGV4dCB0byB0aGUgRW50aXR5U2V0XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsIHJlcXVpcmVkOiB0cnVlLCAka2luZDogW1wiRW50aXR5U2V0XCIsIFwiTmF2aWdhdGlvblByb3BlcnR5XCJdIH0pXG5cdHB1YmxpYyBlbnRpdHlTZXQhOiBDb250ZXh0O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlLCBiaW5kYWJsZTogdHJ1ZSB9KVxuXHRwdWJsaWMgaXNEcmFmdEluZGljYXRvclZpc2libGUhOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdFZhbHVlOiBcIlwiIH0pXG5cdHB1YmxpYyBjbGFzcyE6IHN0cmluZztcblxuXHRkcmFmdFBvcG92ZXI/OiBQb3BvdmVyO1xuXG5cdC8qKlxuXHQgKiBSdW50aW1lIGZvcm1hdHRlciBmdW5jdGlvbiB0byBmb3JtYXQgdGhlIGNvcnJlY3QgdGV4dCB0aGF0IGRpc3BsYXlzIHRoZSBvd25lciBvZiBhIGRyYWZ0LlxuXHQgKlxuXHQgKiBUaGlzIGlzIHVzZWQgaW4gY2FzZSB0aGUgRHJhZnRJbmRpY2F0b3IgaXMgc2hvd24gZm9yIGFuIGFjdGl2ZSBlbnRpdHkgdGhhdCBoYXMgYSBkcmFmdCBvZiBhbm90aGVyIHVzZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBoYXNEcmFmdEVudGl0eVxuXHQgKiBAcGFyYW0gZHJhZnRJblByb2Nlc3NCeVVzZXJcblx0ICogQHBhcmFtIGRyYWZ0TGFzdENoYW5nZWRCeVVzZXJcblx0ICogQHBhcmFtIGRyYWZ0SW5Qcm9jZXNzQnlVc2VyRGVzY1xuXHQgKiBAcGFyYW0gZHJhZnRMYXN0Q2hhbmdlZEJ5VXNlckRlc2Ncblx0ICogQHJldHVybnMgVGV4dCB0byBkaXNwbGF5XG5cdCAqL1xuXHRzdGF0aWMgZm9ybWF0RHJhZnRPd25lclRleHRJblBvcG92ZXIoXG5cdFx0aGFzRHJhZnRFbnRpdHk6IGJvb2xlYW4sXG5cdFx0ZHJhZnRJblByb2Nlc3NCeVVzZXI6IHN0cmluZyxcblx0XHRkcmFmdExhc3RDaGFuZ2VkQnlVc2VyOiBzdHJpbmcsXG5cdFx0ZHJhZnRJblByb2Nlc3NCeVVzZXJEZXNjOiBzdHJpbmcsXG5cdFx0ZHJhZnRMYXN0Q2hhbmdlZEJ5VXNlckRlc2M6IHN0cmluZ1xuXHQpOiBzdHJpbmcge1xuXHRcdGlmIChoYXNEcmFmdEVudGl0eSkge1xuXHRcdFx0Y29uc3QgdXNlckRlc2NyaXB0aW9uID1cblx0XHRcdFx0ZHJhZnRJblByb2Nlc3NCeVVzZXJEZXNjIHx8IGRyYWZ0SW5Qcm9jZXNzQnlVc2VyIHx8IGRyYWZ0TGFzdENoYW5nZWRCeVVzZXJEZXNjIHx8IGRyYWZ0TGFzdENoYW5nZWRCeVVzZXI7XG5cblx0XHRcdGlmICghdXNlckRlc2NyaXB0aW9uKSB7XG5cdFx0XHRcdHJldHVybiBSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJNX0ZJRUxEX1JVTlRJTUVfRFJBRlRfUE9QT1ZFUl9VTlNBVkVEX0NIQU5HRVNfQllfVU5LTk9XTlwiKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBkcmFmdEluUHJvY2Vzc0J5VXNlclxuXHRcdFx0XHRcdD8gUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9GSUVMRF9SVU5USU1FX0RSQUZUX1BPUE9WRVJfTE9DS0VEX0JZX0tOT1dOXCIsIFt1c2VyRGVzY3JpcHRpb25dKVxuXHRcdFx0XHRcdDogUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9GSUVMRF9SVU5USU1FX0RSQUZUX1BPUE9WRVJfVU5TQVZFRF9DSEFOR0VTX0JZX0tOT1dOXCIsIFt1c2VyRGVzY3JpcHRpb25dKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFJlc291cmNlTW9kZWwuZ2V0VGV4dChcIk1fRklFTERfUlVOVElNRV9EUkFGVF9QT1BPVkVSX05PX0RBVEFfVEVYVFwiKTtcblx0XHR9XG5cdH1cblxuXHQvKioqXG5cdCAqIEdldHMgdGhlIHByb3BlcnRpZXMgb2YgdGhlIERyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhIGVudGl0eSBjb25uZWN0ZWQgdG8gdGhlIGdpdmVuIGVudGl0eSBzZXRcblx0ICpcblx0ICogQHJldHVybnMgTGlzdCBvZiBwcm9wZXJ0eSBuYW1lc1xuXHQgKi9cblx0Z2V0RHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFQcm9wZXJ0aWVzKCk6IHN0cmluZ1tdIHtcblx0XHRjb25zdCBkcmFmdEFkbWluaXN0cmF0aXZlRGF0YUNvbnRleHQgPSB0aGlzLmVudGl0eVNldC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFcIiwgdGhpcy5lbnRpdHlTZXQpO1xuXHRcdGNvbnN0IGNvbnZlcnRlZERyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhID0gY29udmVydE1ldGFNb2RlbENvbnRleHQoZHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFDb250ZXh0KTtcblx0XHRyZXR1cm4gY29udmVydGVkRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEudGFyZ2V0VHlwZS5lbnRpdHlQcm9wZXJ0aWVzLm1hcCgocHJvcGVydHk6IHsgbmFtZTogc3RyaW5nIH0pID0+IHByb3BlcnR5Lm5hbWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdHMgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlIHRleHQgZGlzcGxheWVkIGFzIHRpdGxlIG9mIHRoZSBwb3B1cC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvblxuXHQgKi9cblx0Z2V0UG9wb3ZlclRpdGxlQmluZGluZ0V4cHJlc3Npb24oKSB7XG5cdFx0cmV0dXJuIGlmRWxzZShcblx0XHRcdG5vdChFbnRpdHkuSXNBY3RpdmUpLFxuXHRcdFx0cGF0aEluTW9kZWwoXCJNX0NPTU1PTl9EUkFGVF9PQkpFQ1RcIiwgXCJzYXAuZmUuaTE4blwiKSxcblx0XHRcdGlmRWxzZShcblx0XHRcdFx0RW50aXR5Lkhhc0RyYWZ0LFxuXHRcdFx0XHRpZkVsc2UoXG5cdFx0XHRcdFx0bm90KGlzRW1wdHkocGF0aEluTW9kZWwoXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9JblByb2Nlc3NCeVVzZXJcIikpKSxcblx0XHRcdFx0XHRwYXRoSW5Nb2RlbChcIk1fQ09NTU9OX0RSQUZUX0xPQ0tFRF9PQkpFQ1RcIiwgXCJzYXAuZmUuaTE4blwiKSxcblx0XHRcdFx0XHRwYXRoSW5Nb2RlbChcIk1fRFJBRlRfUE9QT1ZFUl9BRE1JTl9VTlNBVkVEX09CSkVDVFwiLCBcInNhcC5mZS5pMThuXCIpXG5cdFx0XHRcdCksXG5cdFx0XHRcdHRoaXMuZHJhZnRJbmRpY2F0b3JUeXBlID09PSBPYmplY3RNYXJrZXJWaXNpYmlsaXR5Lkljb25BbmRUZXh0XG5cdFx0XHRcdFx0PyBcIiBcIlxuXHRcdFx0XHRcdDogcGF0aEluTW9kZWwoXCJDX0RSQUZUX1BPUE9WRVJfQURNSU5fREFUQV9EUkFGVElORk9fRkxBR0dFRF9PQkpFQ1RcIiwgXCJzYXAuZmUuaTE4blwiKVxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogQ29uc3RydWN0cyB0aGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgdGV4dCBkaXNwbGF5ZWQgdG8gaWRlbnRpZnkgdGhlIGRyYWZ0IG93bmVyIGluIHRoZSBwb3B1cC5cblx0ICogVGhpcyBiaW5kaW5nIGlzIGNvbmZpZ3VyZWQgdG8gY2FsbCBmb3JtYXREcmFmdE93bmVyVGV4dEluUG9wb3ZlciBhdCBydW50aW1lLlxuXHQgKlxuXHQgKiBXZSBjYW5ub3QgcmVmZXJlbmNlIGZvcm1hdERyYWZ0T3duZXJUZXh0SW5Qb3BvdmVyIGRpcmVjdGx5IGFzIHdlIG5lZWQgdG8gY29uZGl0aW9uYWxseSBwYXNzIHByb3BlcnRpZXMgdGhhdCBtaWdodCBleGlzdCBvciBub3QsXG5cdCAqIGFuZCByZWZlcnJpbmcgdG8gbm9uLWV4aXN0aW5nIHByb3BlcnRpZXMgZmFpbHMgdGhlIGJpbmRpbmcuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb25cblx0ICovXG5cdGdldERyYWZ0T3duZXJUZXh0QmluZGluZ0V4cHJlc3Npb24oKSB7XG5cdFx0Y29uc3QgZHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFQcm9wZXJ0aWVzID0gdGhpcy5nZXREcmFmdEFkbWluaXN0cmF0aXZlRGF0YVByb3BlcnRpZXMoKTtcblxuXHRcdGNvbnN0IHBhcnRzID0gW1xuXHRcdFx0eyBwYXRoOiBcIkhhc0RyYWZ0RW50aXR5XCIsIHRhcmdldFR5cGU6IFwiYW55XCIgfSxcblx0XHRcdHsgcGF0aDogXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9JblByb2Nlc3NCeVVzZXJcIiB9LFxuXHRcdFx0eyBwYXRoOiBcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0xhc3RDaGFuZ2VkQnlVc2VyXCIgfVxuXHRcdF07XG5cdFx0aWYgKGRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhUHJvcGVydGllcy5pbmNsdWRlcyhcIkluUHJvY2Vzc0J5VXNlckRlc2NyaXB0aW9uXCIpKSB7XG5cdFx0XHRwYXJ0cy5wdXNoKHsgcGF0aDogXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9JblByb2Nlc3NCeVVzZXJEZXNjcmlwdGlvblwiIH0pO1xuXHRcdH1cblx0XHRpZiAoZHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFQcm9wZXJ0aWVzLmluY2x1ZGVzKFwiTGFzdENoYW5nZWRCeVVzZXJEZXNjcmlwdGlvblwiKSkge1xuXHRcdFx0cGFydHMucHVzaCh7IHBhdGg6IFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvTGFzdENoYW5nZWRCeVVzZXJEZXNjcmlwdGlvblwiIH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB7IHBhcnRzLCBmb3JtYXR0ZXI6IERyYWZ0SW5kaWNhdG9yLmZvcm1hdERyYWZ0T3duZXJUZXh0SW5Qb3BvdmVyIH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHBvcG92ZXIgY29udHJvbCB0byBkaXNwbGF5IGRyYWZ0IGluZm9ybWF0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29udHJvbCBDb250cm9sIHRoYXQgdGhlIHBvcG92ZXIgaXMgdG8gYmUgY3JlYXRlZCBmb3Jcblx0ICogQHJldHVybnMgVGhlIGNyZWF0ZWQgcG9wb3ZlciBjb250cm9sXG5cdCAqL1xuXHRjcmVhdGVQb3BvdmVyKGNvbnRyb2w6IENvbnRyb2wpOiBQb3BvdmVyIHtcblx0XHRjb25zdCBpc0RyYWZ0V2l0aE5vQ2hhbmdlc0JpbmRpbmcgPSBhbmQobm90KEVudGl0eS5Jc0FjdGl2ZSksIGlzRW1wdHkocGF0aEluTW9kZWwoXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9MYXN0Q2hhbmdlRGF0ZVRpbWVcIikpKTtcblx0XHRjb25zdCBkcmFmdFdpdGhOb0NoYW5nZXNUZXh0QmluZGluZyA9XG5cdFx0XHR0aGlzLmRyYWZ0SW5kaWNhdG9yVHlwZSA9PT0gT2JqZWN0TWFya2VyVmlzaWJpbGl0eS5JY29uQW5kVGV4dFxuXHRcdFx0XHQ/IHBhdGhJbk1vZGVsKFwiTV9EUkFGVF9QT1BPVkVSX0FETUlOX0dFTkVSSUNfTE9DS0VEX09CSkVDVF9QT1BPVkVSX1RFWFRcIiwgXCJzYXAuZmUuaTE4blwiKVxuXHRcdFx0XHQ6IHBhdGhJbk1vZGVsKFwiQ19EUkFGVF9QT1BPVkVSX0FETUlOX0RBVEFfRFJBRlRJTkZPX1BPUE9WRVJfTk9fREFUQV9URVhUXCIsIFwic2FwLmZlLmkxOG5cIik7XG5cblx0XHRjb25zdCBpc0RyYWZ0V2l0aENoYW5nZXNCaW5kaW5nID0gYW5kKFxuXHRcdFx0bm90KEVudGl0eS5Jc0FjdGl2ZSksXG5cdFx0XHRub3QoaXNFbXB0eShwYXRoSW5Nb2RlbChcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0xhc3RDaGFuZ2VEYXRlVGltZVwiKSkpXG5cdFx0KTtcblx0XHRjb25zdCBkcmFmdFdpdGhDaGFuZ2VzVGV4dEJpbmRpbmcgPSB7XG5cdFx0XHRwYXJ0czogW1xuXHRcdFx0XHR7IHBhdGg6IFwiTV9EUkFGVF9QT1BPVkVSX0FETUlOX0xBU1RfQ0hBTkdFX1RFWFRcIiwgbW9kZWw6IFwic2FwLmZlLmkxOG5cIiB9LFxuXHRcdFx0XHR7IHBhdGg6IFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvTGFzdENoYW5nZURhdGVUaW1lXCIgfVxuXHRcdFx0XSxcblx0XHRcdGZvcm1hdHRlcjogZm9ybWF0TWVzc2FnZVxuXHRcdH07XG5cblx0XHRjb25zdCBpc0FjdGl2ZUluc3RhbmNlQmluZGluZyA9IGFuZChFbnRpdHkuSXNBY3RpdmUsIG5vdChpc0VtcHR5KHBhdGhJbk1vZGVsKFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvTGFzdENoYW5nZURhdGVUaW1lXCIpKSkpO1xuXHRcdGNvbnN0IGFjdGl2ZUluc3RhbmNlVGV4dEJpbmRpbmcgPSBkZWVwQ2xvbmUoZHJhZnRXaXRoQ2hhbmdlc1RleHRCaW5kaW5nKTtcblxuXHRcdGNvbnN0IHBvcG92ZXIgPSAoXG5cdFx0XHQ8UG9wb3ZlclxuXHRcdFx0XHR0aXRsZT17dGhpcy5nZXRQb3BvdmVyVGl0bGVCaW5kaW5nRXhwcmVzc2lvbigpfVxuXHRcdFx0XHRzaG93SGVhZGVyPXt0cnVlfVxuXHRcdFx0XHRjb250ZW50V2lkdGg9e1wiMTUuNjI1cmVtXCJ9XG5cdFx0XHRcdHZlcnRpY2FsU2Nyb2xsaW5nPXtmYWxzZX1cblx0XHRcdFx0Y2xhc3M9e1wic2FwVWlDb250ZW50UGFkZGluZ1wifVxuXHRcdFx0XHRlbmRCdXR0b249ezxCdXR0b24gaWNvbj17XCJzYXAtaWNvbjovL2RlY2xpbmVcIn0gcHJlc3M9eygpID0+IHRoaXMuZHJhZnRQb3BvdmVyPy5jbG9zZSgpfSAvPn1cblx0XHRcdD5cblx0XHRcdFx0PFZCb3ggY2xhc3M9e1wic2FwVWlDb250ZW50UGFkZGluZ1wifT5cblx0XHRcdFx0XHQ8VkJveCB2aXNpYmxlPXtpc0RyYWZ0V2l0aE5vQ2hhbmdlc0JpbmRpbmd9PlxuXHRcdFx0XHRcdFx0PFRleHQgdGV4dD17ZHJhZnRXaXRoTm9DaGFuZ2VzVGV4dEJpbmRpbmd9IC8+XG5cdFx0XHRcdFx0PC9WQm94PlxuXHRcdFx0XHRcdDxWQm94IHZpc2libGU9e2lzRHJhZnRXaXRoQ2hhbmdlc0JpbmRpbmd9PlxuXHRcdFx0XHRcdFx0PFRleHQgdGV4dD17ZHJhZnRXaXRoQ2hhbmdlc1RleHRCaW5kaW5nfSAvPlxuXHRcdFx0XHRcdDwvVkJveD5cblx0XHRcdFx0XHQ8VkJveCB2aXNpYmxlPXtpc0FjdGl2ZUluc3RhbmNlQmluZGluZ30+XG5cdFx0XHRcdFx0XHQ8VGV4dCB0ZXh0PXt0aGlzLmdldERyYWZ0T3duZXJUZXh0QmluZGluZ0V4cHJlc3Npb24oKX0gLz5cblx0XHRcdFx0XHRcdDxUZXh0IGNsYXNzPXtcInNhcFVpU21hbGxNYXJnaW5Ub3BcIn0gdGV4dD17YWN0aXZlSW5zdGFuY2VUZXh0QmluZGluZ30gLz5cblx0XHRcdFx0XHQ8L1ZCb3g+XG5cdFx0XHRcdDwvVkJveD5cblx0XHRcdDwvUG9wb3Zlcj5cblx0XHQpO1xuXG5cdFx0Q29tbW9uVXRpbHMuZ2V0VGFyZ2V0Vmlldyhjb250cm9sKS5hZGREZXBlbmRlbnQocG9wb3Zlcik7XG5cdFx0cmV0dXJuIHBvcG92ZXI7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyBwcmVzc2luZyBvZiB0aGUgb2JqZWN0IG1hcmtlciBieSBvcGVuaW5nIGEgY29ycmVzcG9uZGluZyBwb3BvdmVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gZXZlbnQgRXZlbnQgb2JqZWN0IHBhc3NlZCBmcm9tIHRoZSBwcmVzcyBldmVudFxuXHQgKi9cblx0b25PYmplY3RNYXJrZXJQcmVzc2VkKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuXHRcdGNvbnN0IHNvdXJjZSA9IGV2ZW50LmdldFNvdXJjZSgpIGFzIENvbnRyb2w7XG5cdFx0Y29uc3QgYmluZGluZ0NvbnRleHQgPSBzb3VyY2UuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXG5cdFx0dGhpcy5kcmFmdFBvcG92ZXIgPz89IHRoaXMuY3JlYXRlUG9wb3Zlcihzb3VyY2UpO1xuXG5cdFx0dGhpcy5kcmFmdFBvcG92ZXIuc2V0QmluZGluZ0NvbnRleHQoYmluZGluZ0NvbnRleHQpO1xuXHRcdHRoaXMuZHJhZnRQb3BvdmVyLm9wZW5CeShzb3VyY2UsIGZhbHNlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RzIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBcImFkZGl0aW9uYWxJbmZvXCIgYXR0cmlidXRlIGluIHRoZSBcIkljb25BbmRUZXh0XCIgY2FzZS5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvblxuXHQgKi9cblx0Z2V0SWNvbkFuZFRleHRBZGRpdGlvbmFsSW5mb0JpbmRpbmdFeHByZXNzaW9uKCkge1xuXHRcdGNvbnN0IGRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhUHJvcGVydGllcyA9IHRoaXMuZ2V0RHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFQcm9wZXJ0aWVzKCk7XG5cblx0XHRjb25zdCBvckJpbmRpbmdzID0gW107XG5cdFx0aWYgKGRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhUHJvcGVydGllcy5pbmNsdWRlcyhcIkluUHJvY2Vzc0J5VXNlckRlc2NyaXB0aW9uXCIpKSB7XG5cdFx0XHRvckJpbmRpbmdzLnB1c2gocGF0aEluTW9kZWwoXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9JblByb2Nlc3NCeVVzZXJEZXNjcmlwdGlvblwiKSk7XG5cdFx0fVxuXHRcdG9yQmluZGluZ3MucHVzaChwYXRoSW5Nb2RlbChcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0luUHJvY2Vzc0J5VXNlclwiKSk7XG5cdFx0aWYgKGRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhUHJvcGVydGllcy5pbmNsdWRlcyhcIkxhc3RDaGFuZ2VkQnlVc2VyRGVzY3JpcHRpb25cIikpIHtcblx0XHRcdG9yQmluZGluZ3MucHVzaChwYXRoSW5Nb2RlbChcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0xhc3RDaGFuZ2VkQnlVc2VyRGVzY3JpcHRpb25cIikpO1xuXHRcdH1cblx0XHRvckJpbmRpbmdzLnB1c2gocGF0aEluTW9kZWwoXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9MYXN0Q2hhbmdlZEJ5VXNlclwiKSk7XG5cblx0XHRyZXR1cm4gaWZFbHNlPHN0cmluZz4oRW50aXR5Lkhhc0RyYWZ0LCBvciguLi5vckJpbmRpbmdzKSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiwgXCJcIik7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY29udGVudCBvZiB0aGlzIGJ1aWxkaW5nIGJsb2NrIGZvciB0aGUgXCJJY29uQW5kVGV4dFwiIHR5cGUuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBjb250cm9sIHRyZWVcblx0ICovXG5cdGdldEljb25BbmRUZXh0Q29udGVudCgpIHtcblx0XHRjb25zdCB0eXBlID0gaWZFbHNlKFxuXHRcdFx0bm90KEVudGl0eS5Jc0FjdGl2ZSksXG5cdFx0XHRPYmplY3RNYXJrZXJUeXBlLkRyYWZ0LFxuXHRcdFx0aWZFbHNlKFxuXHRcdFx0XHRFbnRpdHkuSGFzRHJhZnQsXG5cdFx0XHRcdGlmRWxzZShcblx0XHRcdFx0XHRwYXRoSW5Nb2RlbChcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0luUHJvY2Vzc0J5VXNlclwiKSxcblx0XHRcdFx0XHRPYmplY3RNYXJrZXJUeXBlLkxvY2tlZEJ5LFxuXHRcdFx0XHRcdGlmRWxzZShwYXRoSW5Nb2RlbChcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0xhc3RDaGFuZ2VkQnlVc2VyXCIpLCBPYmplY3RNYXJrZXJUeXBlLlVuc2F2ZWRCeSwgT2JqZWN0TWFya2VyVHlwZS5VbnNhdmVkKVxuXHRcdFx0XHQpLFxuXHRcdFx0XHRPYmplY3RNYXJrZXJUeXBlLkZsYWdnZWRcblx0XHRcdClcblx0XHQpO1xuXG5cdFx0Y29uc3QgdmlzaWJpbGl0eSA9IGlmRWxzZShub3QoRW50aXR5Lkhhc0RyYWZ0KSwgT2JqZWN0TWFya2VyVmlzaWJpbGl0eS5UZXh0T25seSwgT2JqZWN0TWFya2VyVmlzaWJpbGl0eS5JY29uQW5kVGV4dCk7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PE9iamVjdE1hcmtlclxuXHRcdFx0XHR0eXBlPXt0eXBlfVxuXHRcdFx0XHRwcmVzcz17dGhpcy5vbk9iamVjdE1hcmtlclByZXNzZWQuYmluZCh0aGlzKX1cblx0XHRcdFx0dmlzaWJpbGl0eT17dmlzaWJpbGl0eX1cblx0XHRcdFx0dmlzaWJsZT17dGhpcy5pc0RyYWZ0SW5kaWNhdG9yVmlzaWJsZX1cblx0XHRcdFx0YWRkaXRpb25hbEluZm89e3RoaXMuZ2V0SWNvbkFuZFRleHRBZGRpdGlvbmFsSW5mb0JpbmRpbmdFeHByZXNzaW9uKCl9XG5cdFx0XHRcdGFyaWFMYWJlbGxlZEJ5PXt0aGlzLmFyaWFMYWJlbGxlZEJ5ID8gW3RoaXMuYXJpYUxhYmVsbGVkQnldIDogW119XG5cdFx0XHRcdGNsYXNzPXt0aGlzLmNsYXNzfVxuXHRcdFx0Lz5cblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGNvbnRlbnQgb2YgdGhpcyBidWlsZGluZyBibG9jayBmb3IgdGhlIFwiSWNvbk9ubHlcIiB0eXBlLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgY29udHJvbCB0cmVlXG5cdCAqL1xuXHRnZXRJY29uT25seUNvbnRlbnQoKSB7XG5cdFx0Y29uc3QgdHlwZSA9IGlmRWxzZShcblx0XHRcdG5vdChFbnRpdHkuSXNBY3RpdmUpLFxuXHRcdFx0T2JqZWN0TWFya2VyVHlwZS5EcmFmdCxcblx0XHRcdGlmRWxzZShcblx0XHRcdFx0RW50aXR5Lkhhc0RyYWZ0LFxuXHRcdFx0XHRpZkVsc2UocGF0aEluTW9kZWwoXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9JblByb2Nlc3NCeVVzZXJcIiksIE9iamVjdE1hcmtlclR5cGUuTG9ja2VkLCBPYmplY3RNYXJrZXJUeXBlLlVuc2F2ZWQpLFxuXHRcdFx0XHRPYmplY3RNYXJrZXJUeXBlLkZsYWdnZWRcblx0XHRcdClcblx0XHQpO1xuXHRcdGNvbnN0IHZpc2libGUgPSBhbmQobm90KFVJLklzRWRpdGFibGUpLCBFbnRpdHkuSGFzRHJhZnQsIG5vdChwYXRoSW5Nb2RlbChcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0RyYWZ0SXNDcmVhdGVkQnlNZVwiKSkpO1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxPYmplY3RNYXJrZXJcblx0XHRcdFx0dHlwZT17dHlwZX1cblx0XHRcdFx0cHJlc3M9e3RoaXMub25PYmplY3RNYXJrZXJQcmVzc2VkLmJpbmQodGhpcyl9XG5cdFx0XHRcdHZpc2liaWxpdHk9e09iamVjdE1hcmtlclZpc2liaWxpdHkuSWNvbk9ubHl9XG5cdFx0XHRcdHZpc2libGU9e3Zpc2libGV9XG5cdFx0XHRcdGFyaWFMYWJlbGxlZEJ5PXt0aGlzLmFyaWFMYWJlbGxlZEJ5ID8gW3RoaXMuYXJpYUxhYmVsbGVkQnldIDogW119XG5cdFx0XHRcdGNsYXNzPXt0aGlzLmNsYXNzfVxuXHRcdFx0Lz5cblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGNvbnRlbnQgb2YgdGhpcyBidWlsZGluZyBibG9jay5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGNvbnRyb2wgdHJlZVxuXHQgKi9cblx0Z2V0Q29udGVudCgpIHtcblx0XHRpZiAodGhpcy5kcmFmdEluZGljYXRvclR5cGUgPT09IE9iamVjdE1hcmtlclZpc2liaWxpdHkuSWNvbkFuZFRleHQpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldEljb25BbmRUZXh0Q29udGVudCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRJY29uT25seUNvbnRlbnQoKTtcblx0XHR9XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFnQ3FCQSxjQUFjO0VBYm5DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVhBLE9BWUNDLG1CQUFtQixDQUFDO0lBQUVDLElBQUksRUFBRSxnQkFBZ0I7SUFBRUMsU0FBUyxFQUFFLGVBQWU7SUFBRUMsU0FBUyxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBSzNGQyxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBTWxDRCxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBTWxDRCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLFFBQVE7SUFDZEMsWUFBWSxFQUFFLGFBQWE7SUFDM0JDLFFBQVEsRUFBR0MsS0FBOEIsSUFBSztNQUM3QyxJQUFJQSxLQUFLLElBQUksQ0FBQyxDQUFDQyxzQkFBc0IsQ0FBQ0MsUUFBUSxFQUFFRCxzQkFBc0IsQ0FBQ0UsV0FBVyxDQUFDLENBQUNDLFFBQVEsQ0FBQ0os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