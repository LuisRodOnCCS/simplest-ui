import type { HTMLAttributes } from "react";

type SimplestElement<P = {}> = HTMLAttributes<HTMLElement> & P;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "sui-tabs": SimplestElement<{ value?: string }>;
      "sui-dropdown": SimplestElement<{ open?: boolean }>;
      "sui-modal": SimplestElement<{
        open?: boolean;
        label?: string;
        "close-label"?: string;
        "disable-backdrop-close"?: boolean;
      }>;
      "sui-accordion": SimplestElement<{ multiple?: boolean }>;
      "sui-popover": SimplestElement<{ open?: boolean; label?: string }>;
      "sui-tooltip": SimplestElement<{ content?: string }>;
      "sui-toast": SimplestElement<{
        title?: string;
        message?: string;
        variant?: "default" | "success" | "warning" | "danger";
        duration?: number | string;
      }>;
      "sui-toast-container": SimplestElement;
    }
  }
}

export {};
