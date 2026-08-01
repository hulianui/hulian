import { render } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { PreviewThumbnail } from "./preview-thumbnail";

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});

describe("PreviewThumbnail", () => {
  it("视觉缩略图用 inert 阻止内部交互元素获得焦点", () => {
    const { container } = render(
      <PreviewThumbnail>
        <button type="button">不可操作</button>
      </PreviewThumbnail>,
    );
    expect(container.firstElementChild?.hasAttribute("inert")).toBe(true);
  });
});
