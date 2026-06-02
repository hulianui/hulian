import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { MuiBridgeProvider } from "./provider";
import { Rating } from "./rating";

describe("Rating（MUI 桥）", () => {
  it("可交互时渲染 max 个星 radio", () => {
    const { getAllByRole } = render(
      <MuiBridgeProvider>
        <Rating max={5} value={0} />
      </MuiBridgeProvider>,
    );
    expect(getAllByRole("radio").length).toBeGreaterThanOrEqual(5);
  });

  it("点第 3 星触发 onValueChange(3)", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <MuiBridgeProvider>
        <Rating max={5} value={0} onValueChange={onValueChange} />
      </MuiBridgeProvider>,
    );
    const radio = container.querySelector('input[type="radio"][value="3"]') as HTMLInputElement;
    expect(radio).toBeTruthy();
    fireEvent.click(radio);
    expect(onValueChange).toHaveBeenCalledWith(3);
  });

  it("readOnly 不渲染可点 radio", () => {
    const { queryAllByRole } = render(
      <MuiBridgeProvider>
        <Rating max={5} value={3} readOnly />
      </MuiBridgeProvider>,
    );
    expect(queryAllByRole("radio").length).toBe(0);
  });
});
