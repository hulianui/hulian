import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConfigProvider, enUS } from "../config";
import { DocumentSheet } from "./document-sheet";

describe("DocumentSheet", () => {
  it("keeps the Chinese print label by default", () => {
    const { getByRole } = render(<DocumentSheet>内容</DocumentSheet>);
    expect(getByRole("button", { name: "打印" })).toBeTruthy();
  });

  it("ConfigProvider locale=enUS localizes the print action", () => {
    const { getByRole } = render(
      <ConfigProvider locale={enUS}>
        <DocumentSheet>Content</DocumentSheet>
      </ConfigProvider>,
    );
    expect(getByRole("button", { name: "Print" })).toBeTruthy();
  });
});
