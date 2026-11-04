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
        "disable-backdrop-close"?: boolean;
      }>;
    }
  }
}

export {};
