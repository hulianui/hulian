import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AnimatedShinyText } from "./animated-shiny-text";

afterEach(cleanup);

describe("AnimatedShinyText flex item layout (#322)", () => {
  it("leaves horizontal alignment and width to its flex-column parent", () => {
    render(
      <div style={{ display: "flex", flexDirection: "column", width: 900 }}>
        <div data-testid="sibling">Concurrent query</div>
        <AnimatedShinyText data-testid="shiny">
          This status message is intentionally long enough to exceed the old 448px max width and expose component-owned centering.
        </AnimatedShinyText>
      </div>,
    );

    const sibling = screen.getByTestId("sibling").getBoundingClientRect();
    const shiny = screen.getByTestId("shiny").getBoundingClientRect();
    expect(shiny.left).toBe(sibling.left);
    expect(shiny.width).toBe(sibling.width);
  });
});
