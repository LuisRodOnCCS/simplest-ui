export type Side = "top" | "bottom";
export type Align = "start" | "end";

export type Placement = {
  side: Side;
  align: Align;
};

const VIEWPORT_MARGIN = 8;

/**
 * Decides how a floating panel should be placed relative to its anchor so it
 * stays inside the viewport.
 */
export function computePlacement(
  anchor: DOMRect,
  panel: DOMRect,
  margin: number = VIEWPORT_MARGIN
): Placement {
  const spaceBelow = window.innerHeight - anchor.bottom - margin;
  const spaceAbove = anchor.top - margin;
  const side: Side = panel.height > spaceBelow && spaceAbove > spaceBelow ? "top" : "bottom";

  const spaceRight = window.innerWidth - anchor.left - margin;
  const fitsEnd = anchor.right - panel.width >= margin;
  const align: Align = panel.width > spaceRight && fitsEnd ? "end" : "start";

  return { side, align };
}
