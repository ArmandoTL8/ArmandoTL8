import { registerBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockRuntime";
import ChartBuildingBlock from "sap/fe/macros/chart/ChartBuildingBlock";
import FlexibleColumnLayoutActions from "sap/fe/macros/fcl/FlexibleColumnLayoutActions";
import FilterBarBuildingBlock from "sap/fe/macros/filterBar/FilterBarBuildingBlock";
import FormBuildingBlock from "sap/fe/macros/form/FormBuildingBlock";
import FormContainerBuildingBlock from "sap/fe/macros/form/FormContainerBuildingBlock";
import CustomFragment from "sap/fe/macros/fpm/CustomFragment.block";
import FilterField from "sap/fe/macros/internal/FilterField";
import SituationsIndicator from "sap/fe/macros/situations/SituationsIndicator.fragment";
import VisualFilterBuildingBlock from "sap/fe/macros/visualfilters/VisualFilterBuildingBlock";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
import Contact from "./contact/Contact";
import DraftIndicator from "./draftIndicator/DraftIndicator.block";
import PublicField from "./field/PublicField";
import FormElement from "./form/FormElementBlock";
import ActionCommand from "./internal/ActionCommand.block";
import DataPoint from "./internal/DataPoint";
import InternalField from "./internal/InternalField";
import KPITag from "./kpiTag/KPITag.block";
import MicroChart from "./microchart/MicroChart.metadata";
import MultiValueFieldBlock from "./multiValueField/MultiValueField.block";
import Paginator from "./paginator/Paginator.metadata";
import QuickView from "./quickView/QuickView.metadata";
import Share from "./share/Share.block";
import Table from "./table/Table.metadata";
import ValueHelp from "./valuehelp/ValueHelp.metadata";
import ValueHelpFilterBar from "./valuehelp/ValueHelpFilterBar.metadata";

const sNamespace = "sap.fe.macros",
	aControls = [
		Table,
		FormBuildingBlock,
		FormContainerBuildingBlock,
		PublicField,
		InternalField,
		FilterBarBuildingBlock,
		FilterField,
		ChartBuildingBlock,
		ValueHelp,
		ValueHelpFilterBar,
		MicroChart,
		Contact,
		QuickView,
		VisualFilterBuildingBlock,
		DraftIndicator,
		DataPoint,
		FormElement,
		FlexibleColumnLayoutActions,
		KPITag,
		MultiValueFieldBlock,
		Paginator,
		ActionCommand,
		SituationsIndicator,
		CustomFragment
	].map(function (vEntry) {
		if (typeof vEntry === "string") {
			return {
				name: vEntry,
				namespace: sNamespace,
				metadata: {
					metadataContexts: {},
					properties: {},
					events: {}
				}
			};
		}
		return vEntry;
	});

function registerAll() {
	// runtime building blocks have to be registered explicitly, as block.register() executes steps additional to registerBuildingBlock
	Share.register();
	DraftIndicator.register();

	// as a first version we expect that there's a fragment with exactly the namespace/name
	aControls.forEach(function (oEntry) {
		registerBuildingBlock(oEntry);
	});
}

//This is needed in for templating test utils
function deregisterAll() {
	aControls.forEach(function (oEntry) {
		XMLPreprocessor.plugIn(null, oEntry.namespace, oEntry.name);
	});
}

//Always register when loaded for compatibility
registerAll();

export default {
	register: registerAll,
	deregister: deregisterAll
};
