"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { DecryptedText } from "../../../../packages/ui/src/decrypted-text/decrypted-text";
export const decryptedTextShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "After scrolling into the viewport, the characters are garbled and rolled, and are decoded to plain text bit by bit.",
            code: `<DecryptedText
  text="Decrypting access..."
  className="text-2xl font-semibold text-foreground"
/>`,
            render: () => (<DecryptedText text="Decrypting access..." className="text-2xl font-semibold text-foreground"/>),
        },
        {
            title: "Hover decoding",
            description: "animateOn=\"hover\" is decoded and reset to garbled characters when hovering.",
            code: `<DecryptedText
  text="Hover to decrypt"
  animateOn="hover"
  className="text-2xl font-semibold text-primary"
/>`,
            render: () => (<DecryptedText text="Hover to decrypt" animateOn="hover" className="text-2xl font-semibold text-primary"/>),
        },
        {
            title: "Decoding speed",
            description: "speed is the millisecond interval between each garbled code refresh. The smaller the value, the faster the scrolling.",
            code: `<DecryptedText
  text="Fast scramble"
  speed={25}
  className="text-2xl font-semibold text-foreground"
/>`,
            render: () => (<DecryptedText text="Fast scramble" speed={25} className="text-2xl font-semibold text-foreground"/>),
        },
        {
            title: "Custom character set",
            description: "characters specifies the garbled sampling character set, for example, only 0/1 is used for the binary stream look and feel.",
            code: `<DecryptedText
  text="BINARY MODE"
  characters="01"
  className="text-2xl font-semibold text-primary"
/>`,
            render: () => (<DecryptedText text="BINARY MODE" characters="01" className="text-2xl font-semibold text-primary"/>),
        },
    ],
    controls: [
        { prop: "animateOn", type: "select", options: ["view", "hover"], defaultValue: "view" },
        { prop: "speed", type: "number", defaultValue: 55 },
    ],
    states: [
        {
            name: "view (roll-in decoding)",
            render: () => (<DecryptedText text="Decrypting access..." className="text-2xl font-semibold text-foreground"/>),
        },
        {
            name: "hover (hover decoding)",
            render: () => (<DecryptedText text="Hover to decrypt" animateOn="hover" className="text-2xl font-semibold text-primary"/>),
        },
    ],
    renderWithProps: (p) => (<DecryptedText key={`${p.animateOn}-${p.speed}`} text="Decrypting the secret" animateOn={p.animateOn as "view" | "hover"} speed={p.speed as number} className="text-2xl font-semibold text-foreground"/>),
    toCode: (p) => `<DecryptedText text="Decrypting the secret" animateOn="${p.animateOn}" speed={${p.speed}} />`,
};
