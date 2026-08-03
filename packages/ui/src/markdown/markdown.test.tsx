import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Markdown } from "./markdown";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";

describe("Markdown", () => {
  it("横向可滚动表格容器可用键盘聚焦", () => {
    const { container } = render(<Markdown>{"| A | B |\n| --- | --- |\n| 1 | 2 |"}</Markdown>);
    expect(container.querySelector(".overflow-x-auto")?.getAttribute("tabindex")).toBe("0");
  });

  it("enUS exposes an English table label", () => {
    const { getByLabelText } = render(
      <ConfigProvider locale={enUS}>
        <Markdown>{"| A | B |\n| --- | --- |\n| 1 | 2 |"}</Markdown>
      </ConfigProvider>,
    );
    expect(getByLabelText("Data table")).toBeTruthy();
  });
});
