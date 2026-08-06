export { ElementSelectionOverlay } from "./element-selection-overlay";
export {
  asElement,
  elementPath,
  escapeAttributeValue,
  findMarkedElement,
  pathLabel,
  resolveElementByPath,
  structuralPath,
} from "./element-path";
export { computeLabelPosition, isRectVisible, toHostRect } from "./overlay-geometry";
export type {
  ElementPathOptions,
  ElementPathResult,
  ElementPathSource,
} from "./element-path";
export type {
  LabelPlacement,
  LabelPosition,
  OverlayOffset,
  OverlayRect,
  OverlaySize,
} from "./overlay-geometry";
export type {
  ElementSelectionDetail,
  ElementSelectionOverlayError,
  ElementSelectionOverlayErrorCode,
  ElementSelectionOverlayProps,
} from "./element-selection-overlay.types";
