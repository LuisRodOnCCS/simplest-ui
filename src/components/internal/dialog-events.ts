/** Describes what caused a modal or drawer to close. */
export type SuiDialogCloseReason = "dismiss" | "escape" | "backdrop" | "programmatic";

/** Detail carried by the `sui-close` event from modal dialog components. */
export interface SuiDialogCloseEventDetail {
  reason: SuiDialogCloseReason;
}

export type SuiDialogCloseEvent = CustomEvent<SuiDialogCloseEventDetail>;
