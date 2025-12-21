import { DOMAttributes } from "react";

type CustomElement<T> = Partial<T & DOMAttributes<T> & { children: any }> &
  LibraryManagedAttributes;

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends JSXInternal {
      "adsgram-task": CustomElement<HTMLDivElement>;
    }
  }
}
