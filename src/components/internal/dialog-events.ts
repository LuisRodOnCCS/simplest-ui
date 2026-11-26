/** Describes what caused a modal or drawer to close. */
export type SuiDialogCloseReason = "dismiss" | "escape" | "backdrop" | "programmatic";

/** Detail carried by `sui-close` after a modal or drawer finishes closing.
 * Reopening during exit cancels that close event. */
export interface SuiDialogCloseEventDetail {
  reason: SuiDialogCloseReason;
}

export type SuiDialogCloseEvent = CustomEvent<SuiDialogCloseEventDetail>;
