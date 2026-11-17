"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Wrench } from "../../../../packages/ui/src/_icons";
import { Button } from "../../../../packages/ui/src/button";
import { AnimatedThemeToggler } from "../../../../packages/ui/src/animated-theme-toggler/animated-theme-toggler";
export const animatedThemeTogglerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Click the button to switch light and dark themes with a circular reveal animation (reusing Hulian ThemeProvider).",
            code: `<AnimatedThemeToggler />`,
            render: () => <AnimatedThemeToggler />,
        },
        {
            title: "Custom animation duration",
            description: "duration Adjust the circular reveal animation duration (ms), default 500.",
            code: `<AnimatedThemeToggler duration={900} />`,
            render: () => <AnimatedThemeToggler duration={900}/>,
        },
        {
            title: "Matching description copy",
            description: "The switcher is a standard button that can be placed alongside other elements in the toolbar.",
            code: `<div className="flex items-center gap-3">
  <AnimatedThemeToggler />
  <span className="text-sm text-muted-foreground">Click: Circle Reveal Switch Light and Dark</span>
</div>`,
            render: () => (<div className="flex items-center gap-3">
          <AnimatedThemeToggler />
          <span className="text-sm text-muted-foreground">Click: Circle reveal switches light and dark</span>
        </div>),
        },
        {
            title: "Navbar tools (ghost, compact)",
            description: "variant=\"ghost\" drops the border and background, and size=\"sm\" matches the height of Button iconSm, so their edges line up side by side.",
            code: `<div className="flex items-center gap-1">
  <Button variant="ghost" muted size="iconSm" aria-label="Settings">\u2026</Button>
  <AnimatedThemeToggler variant="ghost" size="sm" />
</div>`,
            render: () => (<div className="flex items-center gap-1">
          <Button variant="ghost" muted size="iconSm" aria-label="Settings">
            <Wrench className="size-4"/>
          </Button>
          <AnimatedThemeToggler variant="ghost" size="sm"/>
        </div>),
        },
    ],
    controls: [],
    states: [
        {
            name: "default",
            render: () => (<div className="flex items-center gap-3">
          <AnimatedThemeToggler />
          <span className="text-sm text-muted-foreground">Click: Circle reveal switches light and dark</span>
        </div>),
        },
    ],
    renderWithProps: () => <AnimatedThemeToggler />,
    toCode: () => `<AnimatedThemeToggler />`,
};
