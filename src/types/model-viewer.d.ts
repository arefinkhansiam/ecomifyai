import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement> & {
    src?: string;
    "ios-src"?: string;
    alt?: string;
    ar?: boolean | string;
    "ar-modes"?: string;
    "camera-controls"?: boolean | string;
    "auto-rotate"?: boolean | string;
    "shadow-intensity"?: string | number;
    poster?: string;
    loading?: string;
    reveal?: string;
    exposure?: string | number;
    "environment-image"?: string;
  },
  HTMLElement
>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerProps;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerProps;
    }
  }
}

export {};
