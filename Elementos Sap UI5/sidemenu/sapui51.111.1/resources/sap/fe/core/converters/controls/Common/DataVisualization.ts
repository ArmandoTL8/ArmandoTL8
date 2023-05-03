import type { EntityType } from "@sap-ux/vocabularies-types";
import type {
	Chart,
	LineItem,
	PresentationVariant,
	PresentationVariantType,
	SelectionPresentationVariant,
	SelectionVariant
} from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { IssueCategory, IssueSeverity, IssueType } from "sap/fe/core/converters/helpers/IssueManager";
import CommonHelper from "sap/fe/macros/CommonHelper";
import type Context from "sap/ui/model/Context";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import type ConverterContext from "../../ConverterContext";
import type { ViewPathConfiguration } from "../../ManifestSettings";
import { TemplateType } from "../../ManifestSettings";
import type { ChartVisualization } from "./Chart";
import { createChartVisualization } from "./Chart";
import type { TableVisualization } from "./Table";
import Table from "./Table";

export type DataVisualizationAnnotations = LineItem | Chart | PresentationVariant | SelectionVariant | SelectionPresentationVariant;

export type ActualVisualizationAnnotations = LineItem | Chart;

export type VisualizationAndPath = {
	visualization: ActualVisualizationAnnotations;
	annotationPath: string;
	selectionVariantPath?: string;
	converterContext: ConverterContext;
};

export type DataVisualizationDefinition = {
	visualizations: (TableVisualization | ChartVisualization)[];
	annotationPath: string;
};

export const getVisualizationsFromPresentationVariant = function (
	presentationVariantAnnotation: PresentationVariantType,
	visualizationPath: string,
	converterContext: ConverterContext,
	isMacroOrMultipleView?: boolean
): VisualizationAndPath[] {
	const visualizationAnnotations: VisualizationAndPath[] = [];

	const bIsALP =
		converterContext.getManifestWrapper().hasMultipleVisualizations() ||
		converterContext.getTemplateType() === TemplateType.AnalyticalListPage;

	const baseVisualizationPath = visualizationPath.split("@")[0];

	if (isMacroOrMultipleView && !isPresentationCompliant(presentationVariantAnnotation, bIsALP)) {
		const entityType = converterContext.getEntityType();
		const defaultLineItemAnnotation = getDefaultLineItem(entityType);
		if (defaultLineItemAnnotation) {
			visualizationAnnotations.push({
				visualization: defaultLineItemAnnotation,
				annotationPath: `${baseVisualizationPath}${converterContext.getRelativeAnnotationPath(
					defaultLineItemAnnotation.fullyQualifiedName,
					entityType
				)}`,
				converterContext: converterContext
			});
		}
	}
	const visualizations = presentationVariantAnnotation.Visualizations;

	const pushFirstVizOfType = function (allowedTerms: string[]) {
		const firstViz = visualizations?.find((viz) => {
			return allowedTerms.indexOf(viz.$target?.term) >= 0;
		});

		if (firstViz) {
			visualizationAnnotations.push({
				visualization: firstViz.$target as ActualVisualizationAnnotations,
				annotationPath: `${baseVisualizationPath}${firstViz.value}`,
				converterContext: converterContext
			});
		}
	};

	if (bIsALP) {
		// In case of ALP, we use the first LineItem and the first Chart
		pushFirstVizOfType([UIAnnotationTerms.LineItem]);
		pushFirstVizOfType([UIAnnotationTerms.Chart]);
	} else {
		// Otherwise, we use the first viz only (Chart or LineItem)
		pushFirstVizOfType([UIAnnotationTerms.LineItem, UIAnnotationTerms.Chart]);
	}
	return visualizationAnnotations;
};

export function getSelectionPresentationVariant(
	entityType: EntityType,
	annotationPath: string | undefined,
	converterContext: ConverterContext
): any {
	if (annotationPath) {
		const resolvedTarget = converterContext.getEntityTypeAnnotation(annotationPath);
		const selectionPresentationVariant = resolvedTarget.annotation as SelectionPresentationVariant;
		if (selectionPresentationVariant) {
			if (selectionPresentationVariant.term === UIAnnotationTerms.SelectionPresentationVariant) {
				return selectionPresentationVariant;
			}
		} else {
			throw new Error("Annotation Path for the SPV mentioned in the manifest is not found, Please add the SPV in the annotation");
		}
	} else {
		return entityType.annotations?.UI?.SelectionPresentationVariant;
	}
}

export function isSelectionPresentationCompliant(
	SelectionPresentationVariant: SelectionPresentationVariant,
	bIsALP: boolean
): boolean | undefined {
	const presentationVariant = SelectionPresentationVariant && SelectionPresentationVariant.PresentationVariant;
	if (presentationVariant) {
		return isPresentationCompliant(presentationVariant, bIsALP);
	} else {
		throw new Error("Presentation Variant is not present in the SPV annotation");
	}
}

export function isPresentationCompliant(presentationVariant: PresentationVariantType, bIsALP = false): boolean {
	let bHasTable = false,
		bHasChart = false;
	if (bIsALP) {
		if (presentationVariant?.Visualizations) {
			const aVisualizations = presentationVariant.Visualizations;
			aVisualizations.forEach((oVisualization) => {
				if (oVisualization.$target?.term === UIAnnotationTerms.LineItem) {
					bHasTable = true;
				}
				if (oVisualization.$target?.term === UIAnnotationTerms.Chart) {
					bHasChart = true;
				}
			});
		}
		return bHasChart && bHasTable;
	} else {
		return (
			presentationVariant?.Visualizations &&
			!!presentationVariant.Visualizations.find((visualization) => {
				return (
					visualization.$target?.term === UIAnnotationTerms.LineItem || visualization.$target?.term === UIAnnotationTerms.Chart
				);
			})
		);
	}
}

export function getDefaultLineItem(entityType: EntityType): LineItem | undefined {
	return entityType.annotations.UI?.LineItem;
}
export function getDefaultChart(entityType: EntityType): Chart | undefined {
	return entityType.annotations.UI?.Chart;
}
export function getDefaultPresentationVariant(entityType: EntityType): PresentationVariant | undefined {
	return entityType.annotations?.UI?.PresentationVariant;
}

export function getDefaultSelectionVariant(entityType: EntityType): SelectionVariant | undefined {
	return entityType.annotations?.UI?.SelectionVariant;
}

export function getSelectionVariant(entityType: EntityType, converterContext: ConverterContext): SelectionVariant | undefined {
	const annotationPath = converterContext.getManifestWrapper().getDefaultTemplateAnnotationPath();
	const selectionPresentationVariant = getSelectionPresentationVariant(entityType, annotationPath, converterContext);
	let selectionVariant;
	if (selectionPresentationVariant) {
		selectionVariant = selectionPresentationVariant.SelectionVariant;
		if (selectionVariant) {
			return selectionVariant;
		}
	} else {
		selectionVariant = getDefaultSelectionVariant(entityType);
		return selectionVariant;
	}
}

export function getDataVisualizationConfiguration(
	visualizationPath: string,
	isCondensedTableLayoutCompliant: boolean,
	inConverterContext: ConverterContext,
	viewConfiguration?: ViewPathConfiguration,
	doNotCheckApplySupported?: boolean,
	associatedPresentationVariantPath?: string,
	isMacroOrMultipleView?: boolean
): DataVisualizationDefinition {
	const resolvedTarget =
		visualizationPath !== ""
			? inConverterContext.getEntityTypeAnnotation(visualizationPath)
			: { annotation: undefined, converterContext: inConverterContext };
	const resolvedAssociatedPresentationVariant = associatedPresentationVariantPath
		? inConverterContext.getEntityTypeAnnotation(associatedPresentationVariantPath)
		: null;
	const resolvedVisualization = resolvedTarget.annotation as DataVisualizationAnnotations;
	inConverterContext = resolvedTarget.converterContext;
	let visualizationAnnotations: VisualizationAndPath[] = [];
	let presentationVariantAnnotation: PresentationVariantType;
	let presentationPath: string = "";
	let chartVisualization, tableVisualization;
	const sTerm = resolvedVisualization?.term;
	if (sTerm) {
		switch (sTerm) {
			case UIAnnotationTerms.LineItem:
			case UIAnnotationTerms.Chart:
				presentationVariantAnnotation = resolvedAssociatedPresentationVariant?.annotation;
				visualizationAnnotations.push({
					visualization: resolvedVisualization as ActualVisualizationAnnotations,
					annotationPath: visualizationPath,
					converterContext: inConverterContext
				});
				break;
			case UIAnnotationTerms.PresentationVariant:
				presentationVariantAnnotation = resolvedVisualization;
				visualizationAnnotations = visualizationAnnotations.concat(
					getVisualizationsFromPresentationVariant(
						resolvedVisualization,
						visualizationPath,
						inConverterContext,
						isMacroOrMultipleView
					)
				);
				break;
			case UIAnnotationTerms.SelectionPresentationVariant:
				presentationVariantAnnotation = resolvedVisualization.PresentationVariant;
				// Presentation can be inline or outside the SelectionPresentationVariant
				presentationPath = presentationVariantAnnotation.fullyQualifiedName;
				visualizationAnnotations = visualizationAnnotations.concat(
					getVisualizationsFromPresentationVariant(
						presentationVariantAnnotation,
						visualizationPath,
						inConverterContext,
						isMacroOrMultipleView
					)
				);

				break;
			default:
				break;
		}
		visualizationAnnotations.forEach((visualizationAnnotation) => {
			const { visualization, annotationPath, converterContext } = visualizationAnnotation;
			switch (visualization.term) {
				case UIAnnotationTerms.Chart:
					chartVisualization = createChartVisualization(
						visualization,
						annotationPath,
						converterContext,
						doNotCheckApplySupported
					);
					break;
				case UIAnnotationTerms.LineItem:
				default:
					tableVisualization = Table.createTableVisualization(
						visualization,
						annotationPath,
						converterContext,
						presentationVariantAnnotation,
						isCondensedTableLayoutCompliant,
						viewConfiguration
					);
					break;
			}
		});
	} else {
		tableVisualization = Table.createDefaultTableVisualization(inConverterContext, !isMacroOrMultipleView);
		inConverterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Medium, IssueType.MISSING_LINEITEM);
	}
	const aVisualizations: any = [];
	let sPath =
		sTerm === UIAnnotationTerms.SelectionPresentationVariant
			? presentationPath
			: resolvedVisualization && resolvedVisualization.fullyQualifiedName;
	if (sPath === undefined) {
		sPath = "/";
	}
	if (chartVisualization) {
		aVisualizations.push(chartVisualization);
	}
	if (tableVisualization) {
		aVisualizations.push(tableVisualization);
	}
	return {
		visualizations: aVisualizations,
		annotationPath: inConverterContext.getEntitySetBasedAnnotationPath(sPath)
	};
}

/**
 * Return UI Control (LineItem/Chart) Context.
 *
 * @function
 * @name getUiControl
 * @param oPresentationContext Presentation context object (Presentation variant or UI.LineItem/Chart)
 * @param sControlPath Control path
 * @returns The Control (LineItem/Chart) context
 */
export function getUiControl(oPresentationContext: Context, sControlPath: String) {
	const oPresentation = oPresentationContext.getObject(oPresentationContext.getPath()),
		oPresentationVariantPath = CommonHelper.createPresentationPathContext(oPresentationContext),
		oModel = oPresentationContext.getModel() as ODataModel;
	if (CommonHelper._isPresentationVariantAnnotation(oPresentationVariantPath.getPath())) {
		// Uncomplete PresentationVariant can be passed to macro via SelectionPresentationVariant
		const aVisualizations = oPresentation.Visualizations;
		if (Array.isArray(aVisualizations)) {
			for (let i = 0; i < aVisualizations.length; i++) {
				if (aVisualizations[i].$AnnotationPath.indexOf(sControlPath) !== -1) {
					sControlPath = aVisualizations[i].$AnnotationPath;
					break;
				}
			}
		}
		return (oModel as any).getMetaContext(oPresentationContext.getPath().split("@")[0] + sControlPath);
	}
	return oPresentationContext;
}
