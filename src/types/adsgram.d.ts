import type React from "react";

declare global {
    namespace React {
        namespace JSX {
            interface IntrinsicElements {
                "adsgram-task": React.DetailedHTMLProps<
                    React.HTMLAttributes<HTMLElement>,
                    HTMLElement
                > & {
                    "data-block-id": string;
                };
            }
        }
    }
}

export {};