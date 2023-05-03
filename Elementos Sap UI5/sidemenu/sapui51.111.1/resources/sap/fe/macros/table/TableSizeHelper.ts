import { ConvertedMetadata } from "@sap-ux/vocabularies-types/Edm";
import { CommunicationAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/Communication";
import { DataField, DataFieldForAnnotation } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import { AnnotationTableColumn } from "sap/fe/core/converters/controls/Common/Table";
import { getDisplayMode } from "sap/fe/core/templating/DisplayModeFormatter";
import Button from "sap/m/Button";
import TableUtil from "sap/m/table/Util";
import Rem from "sap/ui/dom/units/Rem";
import { PropertyInfo } from "../DelegateUtil";

const TableSizeHelper = {
	nbCalls: 0,
	oBtn: undefined as any,
	propertyHelper: undefined as any,
	init: function () {
		// Create a new button in static area sap.ui.getCore().getStaticAreaRef()
		this.nbCalls = this.nbCalls ? this.nbCalls : 0;
		this.nbCalls++;
		this.oBtn = this.oBtn ? this.oBtn : new Button().placeAt(sap.ui.getCore().getStaticAreaRef());
		// Hide button from accessibility tree
		this.oBtn.setVisible(false);
	},
	/**
	 * Method to calculate the width of the button from a temporarily created button placed in the static area.
	 *
	 * @param text The text to measure inside the Button.
	 * @returns The value of the Button width.
	 */
	getButtonWidth: function (text?: string): number {
		if (!text) {
			return 0;
		}
		if (this.oBtn.getVisible() === false) {
			this.oBtn.setVisible(true);
		}
		this.oBtn.setText(text);
		//adding missing styles from buttons inside a table
		// for sync rendering
		this.oBtn.rerender();
		const nButtonWidth = Rem.fromPx(this.oBtn.getDomRef().scrollWidth);
		this.oBtn.setVisible(false);
		return Math.round(nButtonWidth * 100) / 100;
	},

	/**
	 * Method to calculate the width of the MDCColumn.
	 *
	 * @param dataField The Property or PropertyInfo Object for which the width will be calculated.
	 * @param properties An array containing all property definitions (optional)
	 * @param convertedMetaData
	 * @param includeLabel Indicates if the label should be part of the width calculation
	 * @private
	 * @alias sap.fe.macros.TableSizeHelper
	 * @returns The width of the column.
	 */
	getMDCColumnWidthFromDataField: function (
		dataField: DataField,
		properties: PropertyInfo[],
		convertedMetaData: ConvertedMetadata,
		includeLabel = false
	): number {
		const property = properties.find(
			(prop) =>
				prop.metadataPath &&
				(convertedMetaData.resolvePath(prop.metadataPath) as any)?.target?.fullyQualifiedName === dataField.fullyQualifiedName
		);
		return property ? this.getMDCColumnWidthFromProperty(property, properties, includeLabel) : 0;
	},

	getMDCColumnWidthFromProperty: function (property: PropertyInfo, properties: PropertyInfo[], includeLabel = false): number {
		const mWidthCalculation = Object.assign(
			{
				gap: 0,
				truncateLabel: !includeLabel,
				excludeProperties: []
			},
			property.visualSettings?.widthCalculation
		);

		let types;

		if (property.propertyInfos?.length) {
			types = property.propertyInfos
				.map((propName) => {
					const prop = properties.find((_property) => _property.name === propName);
					return prop?.typeConfig?.typeInstance;
				})
				.filter((item) => item);
		} else if (property?.typeConfig?.typeInstance) {
			types = [property?.typeConfig.typeInstance];
		}
		const sSize = types ? TableUtil.calcColumnWidth(types, property.label, mWidthCalculation) : null;
		if (!sSize) {
			Log.error(`Cannot compute the column width for property: ${property.name}`);
		}
		return sSize ? parseFloat(sSize.replace("Rem", "")) : 0;
	},

	_getPropertyHelperCache: function (sTableId: any) {
		return this.propertyHelper && this.propertyHelper[sTableId];
	},
	_setPropertyHelperCache: function (sTableId: any, oPropertyHelper: any) {
		this.propertyHelper = Object.assign({}, this.propertyHelper);
		this.propertyHelper[sTableId] = oPropertyHelper;
	},

	/**
	 * Method to calculate the  width of a DataFieldAnnotation object contained in a fieldGroup.
	 *
	 * @param dataField DataFieldAnnotation object.
	 * @param properties Array containing all PropertyInfo objects.
	 * @param convertedMetaData
	 * @param showDataFieldsLabel Label is displayed inside the field
	 * @private
	 * @alias sap.fe.macros.TableSizeHelper
	 * @returns Object containing the width of the label and the width of the property.
	 */
	getWidthForDataFieldForAnnotation: function (
		dataField: DataFieldForAnnotation,
		properties?: PropertyInfo[],
		convertedMetaData?: ConvertedMetadata,
		showDataFieldsLabel = false
	) {
		const oTargetedProperty = dataField?.Target?.$target as any;
		let nPropertyWidth = 0,
			fLabelWidth = 0;
		if (oTargetedProperty?.Visualization) {
			switch (oTargetedProperty.Visualization) {
				case "UI.VisualizationType/Rating":
					const nbStars = oTargetedProperty.TargetValue;
					nPropertyWidth = parseInt(nbStars, 10) * 1.375;
					break;
				case "UI.VisualizationType/Progress":
				default:
					nPropertyWidth = 5;
			}
			const sLabel = oTargetedProperty ? oTargetedProperty.label : dataField.Label || "";
			fLabelWidth = showDataFieldsLabel && sLabel ? TableSizeHelper.getButtonWidth(sLabel) : 0;
		} else if (convertedMetaData && properties && oTargetedProperty?.$Type === CommunicationAnnotationTypes.ContactType) {
			nPropertyWidth = this.getMDCColumnWidthFromDataField(oTargetedProperty.fn.$target, properties, convertedMetaData, false);
		}
		return { labelWidth: fLabelWidth, propertyWidth: nPropertyWidth };
	},

	/**
	 * Method to calculate the width of a DataField object.
	 *
	 * @param dataField DataFieldAnnotation object.
	 * @param showDataFieldsLabel Label is displayed inside the field.
	 * @param properties Array containing all PropertyInfo objects.
	 * @param convertedMetaData Context Object of the parent property.
	 * @private
	 * @alias sap.fe.macros.TableSizeHelper
	 * @returns {object} Object containing the width of the label and the width of the property.
	 */

	getWidthForDataField: function (
		dataField: DataField,
		showDataFieldsLabel: boolean,
		properties: PropertyInfo[],
		convertedMetaData: ConvertedMetadata
	) {
		const oTargetedProperty = dataField.Value?.$target,
			oTextArrangementTarget = oTargetedProperty?.annotations?.Common?.Text,
			displayMode = getDisplayMode(dataField.Value?.$target);

		let nPropertyWidth = 0,
			fLabelWidth = 0;
		if (oTargetedProperty) {
			switch (displayMode) {
				case "Description":
					nPropertyWidth =
						this.getMDCColumnWidthFromDataField(oTextArrangementTarget.$target, properties, convertedMetaData, false) - 1;
					break;
				case "DescriptionValue":
				case "ValueDescription":
				case "Value":
				default:
					nPropertyWidth = this.getMDCColumnWidthFromDataField(oTargetedProperty, properties, convertedMetaData, false) - 1;
			}
			const sLabel = dataField.Label ? dataField.Label : oTargetedProperty.label;
			fLabelWidth = showDataFieldsLabel && sLabel ? TableSizeHelper.getButtonWidth(sLabel) : 0;
		} else {
			Log.error(`Cannot compute width for type object: ${dataField.$Type}`);
		}
		return { labelWidth: fLabelWidth, propertyWidth: nPropertyWidth };
	},

	_getPropertiesByPath: function (aProperties: AnnotationTableColumn[], sPath: any): AnnotationTableColumn | undefined {
		return aProperties.find(function (oProperty: any) {
			return oProperty.path === sPath;
		});
	},

	exit: function () {
		this.nbCalls--;
		if (this.nbCalls === 0) {
			this.oBtn.destroy();
			this.oBtn = null;
		}
	}
};

export default TableSizeHelper;
