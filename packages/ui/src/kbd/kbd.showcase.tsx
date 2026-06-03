"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Kbd } from "./kbd";

export const kbdShowcase: ShowcaseSpec = {
  controls: [],
  states: [
    { name: "single", render: () => <Kbd>Esc</Kbd> },
    {
      name: "combo",
      render: () => (
        <span className="inline-flex items-center gap-1">
          <Kbd>⌘</Kbd>
          <span className="text-muted">+</span>
          <Kbd>K</Kbd>
        </span>
      ),
    },
    {
      name: "in-text",
      render: () => (
        <span className="text-sm text-muted">
          按 <Kbd>⌘</Kbd> <Kbd>S</Kbd> 保存
        </span>
      ),
    },
  ],
  renderWithProps: () => (
    <span className="inline-flex items-center gap-1">
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </span>
  ),
  toCode: () => `<Kbd>⌘</Kbd> <Kbd>K</Kbd>`,
};
