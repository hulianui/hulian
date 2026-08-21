"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { TypingAnimation } from "../../../../packages/ui/src/typing-animation/typing-animation";
export const typingAnimationShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Type the text word by word with a blinking cursor, and automatically hide the cursor after typing.",
            code: `<TypingAnimation
  text="Hulian, a composable design system"
  className="text-2xl font-semibold text-foreground"
/>`,
            render: () => (<TypingAnimation text="Hulian, a composable design system" className="text-2xl font-semibold text-foreground" startOnView={false}/>),
        },
        {
            title: "Typing speed",
            description: "duration controls milliseconds per word (default 80), the smaller the faster.",
            code: `<TypingAnimation
  text="Faster typing speed"
  duration={40}
  className="text-xl font-medium text-foreground"
/>`,
            render: () => (<TypingAnimation text="Faster typing speed" duration={40} className="text-xl font-medium text-foreground" startOnView={false}/>),
        },
        {
            title: "Hide cursor",
            description: "When showCursor=false, the blinking cursor is not rendered and only the typing process is retained.",
            code: `<TypingAnimation
  text="Typing effect without cursor"
  showCursor={false}
  className="text-xl font-medium text-foreground"
/>`,
            render: () => (<TypingAnimation text="Typing effect without cursor" showCursor={false} className="text-xl font-medium text-foreground" startOnView={false}/>),
        },
        {
            title: "Enter viewport trigger",
            description: "startOnView=true (default), scroll into the viewport before starting typing, suitable for long pages.",
            code: `<TypingAnimation
  text="Scroll here to start typing"
  startOnView
  className="text-xl font-medium text-foreground"
/>`,
            render: () => (<TypingAnimation text="Scroll here before starting typing" startOnView className="text-xl font-medium text-foreground"/>),
        },
    ],
    controls: [
        { prop: "duration", type: "number", defaultValue: 80 },
        { prop: "showCursor", type: "boolean", defaultValue: true },
    ],
    states: [
        {
            name: "default (Enter the viewport and type word by word + blinking cursor)",
            render: () => (<TypingAnimation text="Hulian, a composable design system" className="text-2xl font-semibold text-foreground" startOnView={false}/>),
        },
    ],
    renderWithProps: (p) => (<TypingAnimation text="Hulian, a composable design system" className="text-2xl font-semibold text-foreground" duration={p.duration as number} showCursor={p.showCursor as boolean} startOnView={false}/>),
    toCode: (p) => `<TypingAnimation text="Hulian" duration={${p.duration}} showCursor={${p.showCursor}} />`,
};
