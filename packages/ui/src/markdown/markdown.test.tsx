import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Markdown } from "./markdown";

describe("Markdown", () => {
  it("横向可滚动表格容器可用键盘聚焦", () => {
    const { container } = render(<Markdown>{"| A | B |\n| --- | --- |\n| 1 | 2 |"}</Markdown>);
    expect(container.querySelector(".overflow-x-auto")?.getAttribute("tabindex")).toBe("0");
  });
});
