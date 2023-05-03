/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/macros/ResourceModel", "sap/fe/macros/situations/SituationsPopover"], function (Log, BuildingBlock, BuildingBlockRuntime, MetaModelConverter, BindingToolkit, ResourceModel, SituationsPopover) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var _exports = {};
  var showPopover = SituationsPopover.showPopover;
  var ref = BindingToolkit.ref;
  var pathInModel = BindingToolkit.pathInModel;
  var ifElse = BindingToolkit.ifElse;
  var greaterThan = BindingToolkit.greaterThan;
  var fn = BindingToolkit.fn;
  var equal = BindingToolkit.equal;
  var and = BindingToolkit.and;
  var convertMetaModelContext = MetaModelConverter.convertMetaModelContext;
  var xml = BuildingBlockRuntime.xml;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  var blockAttribute = BuildingBlock.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let SituationsIndicator = (_dec = defineBuildingBlock({
    name: "SituationsIndicator",
    namespace: "sap.fe.macros.internal.situations"
  }), _dec2 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec3 = blockAttribute({
    type: "string",
    required: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(SituationsIndicator, _BuildingBlockBase);
    function SituationsIndicator() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlockBase.call(this, ...args) || this;
      _initializerDefineProperty(_this, "entitySet", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "propertyPath", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    _exports = SituationsIndicator;
    SituationsIndicator.getSituationsNavigationProperty = function getSituationsNavigationProperty(context) {
      let navigationProperties;
      switch (context._type) {
        case "NavigationProperty":
          navigationProperties = context.targetType.navigationProperties;
          break;
        case "EntityType":
          navigationProperties = context.navigationProperties;
          break;
        default:
          navigationProperties = context.entityType.navigationProperties;
      }
      const situationsNavProps = navigationProperties.filter(navigationProperty => {
        var _navigationProperty$t, _navigationProperty$t2;
        return !navigationProperty.isCollection && ((_navigationProperty$t = navigationProperty.targetType.annotations.Common) === null || _navigationProperty$t === void 0 ? void 0 : (_navigationProperty$t2 = _navigationProperty$t.SAPObjectNodeType) === null || _navigationProperty$t2 === void 0 ? void 0 : _navigationProperty$t2.Name) === "BusinessSituation";
      });
      const situationsNavProp = situationsNavProps.length >= 1 ? situationsNavProps[0] : undefined;

      // only one navigation property may lead to an entity tagged as "BusinessSituation"
      if (situationsNavProps.length > 1) {
        const navPropNames = situationsNavProps.map(prop => `'${prop.name}'`).join(", ");
        let name;
        switch (context._type) {
          case "NavigationProperty":
            name = context.targetType.name;
            break;
          case "EntityType":
            name = context.name;
            break;
          default:
            name = context.entityType.name;
        }
        Log.error(`Entity type '${name}' has multiple paths to SAP Situations (${navPropNames}). Using '${situationsNavProp === null || situationsNavProp === void 0 ? void 0 : situationsNavProp.name}'.
Hint: Make sure there is at most one navigation property whose target entity type is annotated with
<Annotation Term="com.sap.vocabularies.Common.v1.SAPObjectNodeType">
  <Record>
    <PropertyValue Property="Name" String="BusinessSituation" />
  </Record>
</Annotation>.`);
      }
      return situationsNavProp;
    };
    var _proto = SituationsIndicator.prototype;
    _proto.getTemplate = function getTemplate() {
      const context = convertMetaModelContext(this.entitySet);
      const situationsNavProp = SituationsIndicator.getSituationsNavigationProperty(context);
      if (!situationsNavProp) {
        // No path to SAP Situations. That is, the entity type is not situation-enabled. Ignore this fragment.
        return undefined;
      }
      const numberOfSituations = pathInModel(`${situationsNavProp.name}/SitnNumberOfInstances`);

      // Indicator visibility
      let visible;
      if (!this.propertyPath) {
        // no propertyPath --> visibility depends on the number of situations only
        visible = greaterThan(numberOfSituations, 0);
      } else {
        // propertyPath --> visibility depends on the number of situations and on the semantic key used for showing indicators
        visible = and(greaterThan(numberOfSituations, 0), equal(pathInModel("semanticKeyHasDraftIndicator", "internal"), this.propertyPath));
      }

      // Button text: the number of situations if there are multiple, the empty string otherwise
      const text = ifElse(greaterThan(numberOfSituations, 1), numberOfSituations, "");

      // Button tooltip: "There is one situation" / "There are <n> situations"
      const tooltip = ifElse(equal(numberOfSituations, 1), ResourceModel.getText("situationsTooltipSingular"), fn("formatMessage", [ResourceModel.getText("situationsTooltipPlural"), numberOfSituations]));

      // 'press' handler
      const onPress = fn(showPopover, [ref("$controller"), ref("$event"), situationsNavProp.name]);
      return xml`
			<m:Button core:require="{rt: 'sap/fe/macros/situations/SituationsPopover', formatMessage: 'sap/base/strings/formatMessage'}"
				type="Attention"
				icon="sap-icon://alert"
				text="${text}"
				tooltip="${tooltip}"
				visible="${visible}"
				press="${onPress}"
			/>`;
    };
    return SituationsIndicator;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "entitySet", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "propertyPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = SituationsIndicator;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaXR1YXRpb25zSW5kaWNhdG9yIiwiZGVmaW5lQnVpbGRpbmdCbG9jayIsIm5hbWUiLCJuYW1lc3BhY2UiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJyZXF1aXJlZCIsImdldFNpdHVhdGlvbnNOYXZpZ2F0aW9uUHJvcGVydHkiLCJjb250ZXh0IiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJfdHlwZSIsInRhcmdldFR5cGUiLCJlbnRpdHlUeXBlIiwic2l0dWF0aW9uc05hdlByb3BzIiwiZmlsdGVyIiwibmF2aWdhdGlvblByb3BlcnR5IiwiaXNDb2xsZWN0aW9uIiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJTQVBPYmplY3ROb2RlVHlwZSIsIk5hbWUiLCJzaXR1YXRpb25zTmF2UHJvcCIsImxlbmd0aCIsInVuZGVmaW5lZCIsIm5hdlByb3BOYW1lcyIsIm1hcCIsInByb3AiLCJqb2luIiwiTG9nIiwiZXJyb3IiLCJnZXRUZW1wbGF0ZSIsImNvbnZlcnRNZXRhTW9kZWxDb250ZXh0IiwiZW50aXR5U2V0IiwibnVtYmVyT2ZTaXR1YXRpb25zIiwicGF0aEluTW9kZWwiLCJ2aXNpYmxlIiwicHJvcGVydHlQYXRoIiwiZ3JlYXRlclRoYW4iLCJhbmQiLCJlcXVhbCIsInRleHQiLCJpZkVsc2UiLCJ0b29sdGlwIiwiUmVzb3VyY2VNb2RlbCIsImdldFRleHQiLCJmbiIsIm9uUHJlc3MiLCJzaG93UG9wb3ZlciIsInJlZiIsInhtbCIsIkJ1aWxkaW5nQmxvY2tCYXNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJTaXR1YXRpb25zSW5kaWNhdG9yLmZyYWdtZW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgRW50aXR5U2V0LCBFbnRpdHlUeXBlLCBOYXZpZ2F0aW9uUHJvcGVydHksIFNpbmdsZXRvbiB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgQnVpbGRpbmdCbG9ja0Jhc2UsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1wiO1xuaW1wb3J0IHsgeG1sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tSdW50aW1lXCI7XG5pbXBvcnQgeyBjb252ZXJ0TWV0YU1vZGVsQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHR5cGUgeyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgYW5kLCBlcXVhbCwgZm4sIGdyZWF0ZXJUaGFuLCBpZkVsc2UsIHBhdGhJbk1vZGVsLCByZWYgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IFJlc291cmNlTW9kZWwgZnJvbSBcInNhcC9mZS9tYWNyb3MvUmVzb3VyY2VNb2RlbFwiO1xuaW1wb3J0IHsgc2hvd1BvcG92ZXIgfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9zaXR1YXRpb25zL1NpdHVhdGlvbnNQb3BvdmVyXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7IG5hbWU6IFwiU2l0dWF0aW9uc0luZGljYXRvclwiLCBuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC5zaXR1YXRpb25zXCIgfSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpdHVhdGlvbnNJbmRpY2F0b3IgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIiwgcmVxdWlyZWQ6IHRydWUgfSlcblx0ZW50aXR5U2V0ITogQ29udGV4dDtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCByZXF1aXJlZDogZmFsc2UgfSlcblx0cHJvcGVydHlQYXRoPzogc3RyaW5nO1xuXG5cdHN0YXRpYyBnZXRTaXR1YXRpb25zTmF2aWdhdGlvblByb3BlcnR5KFxuXHRcdGNvbnRleHQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IEVudGl0eVR5cGUgfCBOYXZpZ2F0aW9uUHJvcGVydHlcblx0KTogTmF2aWdhdGlvblByb3BlcnR5IHwgdW5kZWZpbmVkIHtcblx0XHRsZXQgbmF2aWdhdGlvblByb3BlcnRpZXM6IE5hdmlnYXRpb25Qcm9wZXJ0eVtdO1xuXHRcdHN3aXRjaCAoY29udGV4dC5fdHlwZSkge1xuXHRcdFx0Y2FzZSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiOlxuXHRcdFx0XHRuYXZpZ2F0aW9uUHJvcGVydGllcyA9IGNvbnRleHQudGFyZ2V0VHlwZS5uYXZpZ2F0aW9uUHJvcGVydGllcztcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRW50aXR5VHlwZVwiOlxuXHRcdFx0XHRuYXZpZ2F0aW9uUHJvcGVydGllcyA9IGNvbnRleHQubmF2aWdhdGlvblByb3BlcnRpZXM7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0bmF2aWdhdGlvblByb3BlcnRpZXMgPSBjb250ZXh0LmVudGl0eVR5cGUubmF2aWdhdGlvblByb3BlcnRpZXM7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc2l0dWF0aW9uc05hdlByb3BzID0gbmF2aWdhdGlvblByb3BlcnRpZXMuZmlsdGVyKFxuXHRcdFx0KG5hdmlnYXRpb25Qcm9wZXJ0eSkgPT5cblx0XHRcdFx0IW5hdmlnYXRpb25Qcm9wZXJ0eS5pc0NvbGxlY3Rpb24gJiZcblx0XHRcdFx0bmF2aWdhdGlvblByb3BlcnR5LnRhcmdldFR5cGUuYW5ub3RhdGlvbnMuQ29tbW9uPy5TQVBPYmplY3ROb2RlVHlwZT8uTmFtZSA9PT0gXCJCdXNpbmVzc1NpdHVhdGlvblwiXG5cdFx0KTtcblxuXHRcdGNvbnN0IHNpdHVhdGlvbnNOYXZQcm9wOiBOYXZpZ2F0aW9uUHJvcGVydHkgfCB1bmRlZmluZWQgPSBzaXR1YXRpb25zTmF2UHJvcHMubGVuZ3RoID49IDEgPyBzaXR1YXRpb25zTmF2UHJvcHNbMF0gOiB1bmRlZmluZWQ7XG5cblx0XHQvLyBvbmx5IG9uZSBuYXZpZ2F0aW9uIHByb3BlcnR5IG1heSBsZWFkIHRvIGFuIGVudGl0eSB0YWdnZWQgYXMgXCJCdXNpbmVzc1NpdHVhdGlvblwiXG5cdFx0aWYgKHNpdHVhdGlvbnNOYXZQcm9wcy5sZW5ndGggPiAxKSB7XG5cdFx0XHRjb25zdCBuYXZQcm9wTmFtZXMgPSBzaXR1YXRpb25zTmF2UHJvcHMubWFwKChwcm9wKSA9PiBgJyR7cHJvcC5uYW1lfSdgKS5qb2luKFwiLCBcIik7XG5cblx0XHRcdGxldCBuYW1lOiBzdHJpbmc7XG5cdFx0XHRzd2l0Y2ggKGNvbnRleHQuX3R5cGUpIHtcblx0XHRcdFx0Y2FzZSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiOlxuXHRcdFx0XHRcdG5hbWUgPSBjb250ZXh0LnRhcmdldFR5cGUubmFtZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcIkVudGl0eVR5cGVcIjpcblx0XHRcdFx0XHRuYW1lID0gY29udGV4dC5uYW1lO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdG5hbWUgPSBjb250ZXh0LmVudGl0eVR5cGUubmFtZTtcblx0XHRcdH1cblxuXHRcdFx0TG9nLmVycm9yKGBFbnRpdHkgdHlwZSAnJHtuYW1lfScgaGFzIG11bHRpcGxlIHBhdGhzIHRvIFNBUCBTaXR1YXRpb25zICgke25hdlByb3BOYW1lc30pLiBVc2luZyAnJHtzaXR1YXRpb25zTmF2UHJvcD8ubmFtZX0nLlxuSGludDogTWFrZSBzdXJlIHRoZXJlIGlzIGF0IG1vc3Qgb25lIG5hdmlnYXRpb24gcHJvcGVydHkgd2hvc2UgdGFyZ2V0IGVudGl0eSB0eXBlIGlzIGFubm90YXRlZCB3aXRoXG48QW5ub3RhdGlvbiBUZXJtPVwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNBUE9iamVjdE5vZGVUeXBlXCI+XG4gIDxSZWNvcmQ+XG4gICAgPFByb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJOYW1lXCIgU3RyaW5nPVwiQnVzaW5lc3NTaXR1YXRpb25cIiAvPlxuICA8L1JlY29yZD5cbjwvQW5ub3RhdGlvbj4uYCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNpdHVhdGlvbnNOYXZQcm9wO1xuXHR9XG5cblx0Z2V0VGVtcGxhdGUoKSB7XG5cdFx0Y29uc3QgY29udGV4dCA9IGNvbnZlcnRNZXRhTW9kZWxDb250ZXh0KHRoaXMuZW50aXR5U2V0KTtcblx0XHRjb25zdCBzaXR1YXRpb25zTmF2UHJvcCA9IFNpdHVhdGlvbnNJbmRpY2F0b3IuZ2V0U2l0dWF0aW9uc05hdmlnYXRpb25Qcm9wZXJ0eShjb250ZXh0KTtcblx0XHRpZiAoIXNpdHVhdGlvbnNOYXZQcm9wKSB7XG5cdFx0XHQvLyBObyBwYXRoIHRvIFNBUCBTaXR1YXRpb25zLiBUaGF0IGlzLCB0aGUgZW50aXR5IHR5cGUgaXMgbm90IHNpdHVhdGlvbi1lbmFibGVkLiBJZ25vcmUgdGhpcyBmcmFnbWVudC5cblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbnVtYmVyT2ZTaXR1YXRpb25zID0gcGF0aEluTW9kZWwoYCR7c2l0dWF0aW9uc05hdlByb3AubmFtZX0vU2l0bk51bWJlck9mSW5zdGFuY2VzYCk7XG5cblx0XHQvLyBJbmRpY2F0b3IgdmlzaWJpbGl0eVxuXHRcdGxldCB2aXNpYmxlOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG5cdFx0aWYgKCF0aGlzLnByb3BlcnR5UGF0aCkge1xuXHRcdFx0Ly8gbm8gcHJvcGVydHlQYXRoIC0tPiB2aXNpYmlsaXR5IGRlcGVuZHMgb24gdGhlIG51bWJlciBvZiBzaXR1YXRpb25zIG9ubHlcblx0XHRcdHZpc2libGUgPSBncmVhdGVyVGhhbihudW1iZXJPZlNpdHVhdGlvbnMsIDApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBwcm9wZXJ0eVBhdGggLS0+IHZpc2liaWxpdHkgZGVwZW5kcyBvbiB0aGUgbnVtYmVyIG9mIHNpdHVhdGlvbnMgYW5kIG9uIHRoZSBzZW1hbnRpYyBrZXkgdXNlZCBmb3Igc2hvd2luZyBpbmRpY2F0b3JzXG5cdFx0XHR2aXNpYmxlID0gYW5kKFxuXHRcdFx0XHRncmVhdGVyVGhhbihudW1iZXJPZlNpdHVhdGlvbnMsIDApLFxuXHRcdFx0XHRlcXVhbChwYXRoSW5Nb2RlbChcInNlbWFudGljS2V5SGFzRHJhZnRJbmRpY2F0b3JcIiwgXCJpbnRlcm5hbFwiKSwgdGhpcy5wcm9wZXJ0eVBhdGgpXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdC8vIEJ1dHRvbiB0ZXh0OiB0aGUgbnVtYmVyIG9mIHNpdHVhdGlvbnMgaWYgdGhlcmUgYXJlIG11bHRpcGxlLCB0aGUgZW1wdHkgc3RyaW5nIG90aGVyd2lzZVxuXHRcdGNvbnN0IHRleHQgPSBpZkVsc2UoZ3JlYXRlclRoYW4obnVtYmVyT2ZTaXR1YXRpb25zLCAxKSwgbnVtYmVyT2ZTaXR1YXRpb25zLCBcIlwiKTtcblxuXHRcdC8vIEJ1dHRvbiB0b29sdGlwOiBcIlRoZXJlIGlzIG9uZSBzaXR1YXRpb25cIiAvIFwiVGhlcmUgYXJlIDxuPiBzaXR1YXRpb25zXCJcblx0XHRjb25zdCB0b29sdGlwID0gaWZFbHNlKFxuXHRcdFx0ZXF1YWwobnVtYmVyT2ZTaXR1YXRpb25zLCAxKSxcblx0XHRcdFJlc291cmNlTW9kZWwuZ2V0VGV4dChcInNpdHVhdGlvbnNUb29sdGlwU2luZ3VsYXJcIiksXG5cdFx0XHRmbihcImZvcm1hdE1lc3NhZ2VcIiwgW1Jlc291cmNlTW9kZWwuZ2V0VGV4dChcInNpdHVhdGlvbnNUb29sdGlwUGx1cmFsXCIpLCBudW1iZXJPZlNpdHVhdGlvbnNdKVxuXHRcdCk7XG5cblx0XHQvLyAncHJlc3MnIGhhbmRsZXJcblx0XHRjb25zdCBvblByZXNzID0gZm4oc2hvd1BvcG92ZXIsIFtyZWYoXCIkY29udHJvbGxlclwiKSwgcmVmKFwiJGV2ZW50XCIpLCBzaXR1YXRpb25zTmF2UHJvcC5uYW1lXSk7XG5cblx0XHRyZXR1cm4geG1sYFxuXHRcdFx0PG06QnV0dG9uIGNvcmU6cmVxdWlyZT1cIntydDogJ3NhcC9mZS9tYWNyb3Mvc2l0dWF0aW9ucy9TaXR1YXRpb25zUG9wb3ZlcicsIGZvcm1hdE1lc3NhZ2U6ICdzYXAvYmFzZS9zdHJpbmdzL2Zvcm1hdE1lc3NhZ2UnfVwiXG5cdFx0XHRcdHR5cGU9XCJBdHRlbnRpb25cIlxuXHRcdFx0XHRpY29uPVwic2FwLWljb246Ly9hbGVydFwiXG5cdFx0XHRcdHRleHQ9XCIke3RleHR9XCJcblx0XHRcdFx0dG9vbHRpcD1cIiR7dG9vbHRpcH1cIlxuXHRcdFx0XHR2aXNpYmxlPVwiJHt2aXNpYmxlfVwiXG5cdFx0XHRcdHByZXNzPVwiJHtvblByZXNzfVwiXG5cdFx0XHQvPmA7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQVlxQkEsbUJBQW1CLFdBRHZDQyxtQkFBbUIsQ0FBQztJQUFFQyxJQUFJLEVBQUUscUJBQXFCO0lBQUVDLFNBQVMsRUFBRTtFQUFvQyxDQUFDLENBQUMsVUFFbkdDLGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUUsc0JBQXNCO0lBQUVDLFFBQVEsRUFBRTtFQUFLLENBQUMsQ0FBQyxVQUdoRUYsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxRQUFRO0lBQUVDLFFBQVEsRUFBRTtFQUFNLENBQUMsQ0FBQztJQUFBO0lBQUE7TUFBQTtNQUFBO1FBQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBLG9CQUc3Q0MsK0JBQStCLEdBQXRDLHlDQUNDQyxPQUFnRSxFQUMvQjtNQUNqQyxJQUFJQyxvQkFB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