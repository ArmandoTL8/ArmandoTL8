import { defineUI5Class, event } from "sap/fe/core/helpers/ClassSupport";
import Fragment from "sap/ui/core/Fragment";

/**
 * Internal extension to the Fragment class in order to add some place to hold functions for runtime building blocks
 */
@defineUI5Class("sap.fe.core.buildingBlocks.BuildingBlockFragment")
export default class BuildingBlockFragment extends Fragment {
	/*
	 * Event to hold and resolve functions for runtime building blocks
	 */
	@event()
	functionHolder!: Function;
}
