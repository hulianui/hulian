import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";

import { Rating } from "./rating";

describe("Rating（零依赖）", () => {
  it("可交互时渲染 max 个星 radio", () => {
    const { getAllByRole } = render(
      
        <Rating max={5} value={0} />
      ,
    );
    expect(getAllByRole("radio").length).toBeGreaterThanOrEqual(5);
  });

  it("点第 3 星触发 onValueChange(3)", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      
        <Rating max={5} value={0} onValueChange={onValueChange} />
      ,
    );
    const radio = container.querySelector('input[type="radio"][value="3"]') as HTMLInputElement;
    expect(radio).toBeTruthy();
    fireEvent.click(radio);
    expect(onValueChange).toHaveBeenCalledWith(3);
  });

  it("readOnly 不渲染可点 radio", () => {
    const { queryAllByRole } = render(
      
        <Rating max={5} value={3} readOnly />
      ,
    );
    expect(queryAllByRole("radio").length).toBe(0);
  });
});
