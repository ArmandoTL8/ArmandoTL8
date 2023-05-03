import Context from "sap/ui/model/odata/v4/Context";

export function isContext(potentialContext: Context | unknown | undefined): potentialContext is Context {
	return (potentialContext as Context)?.isA?.<Context>("sap.ui.model.Context");
}

export function isFunctionArray(potentialFunctionArray: Function[] | unknown): potentialFunctionArray is Function[] {
	return (
		Array.isArray(potentialFunctionArray) &&
		potentialFunctionArray.length > 0 &&
		potentialFunctionArray.every((item) => typeof item === "function")
	);
}
