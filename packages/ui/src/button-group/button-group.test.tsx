import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ButtonGroup } from "./button-group";
import { Button } from "../button/button";

describe("ButtonGroup", () => {
  it("渲染 role=group 容器与子按钮", () => {
    const { getByRole, getByText } = render(
      <ButtonGroup aria-label="对齐">
        <Button>左</Button>
        <Button>中</Button>
        <Button>右</Button>
      </ButtonGroup>,
    );
    expect(getByRole("group")).toBeTruthy();
    expect(getByText("左")).toBeTruthy();
    expect(getByText("右")).toBeTruthy();
  });

  it("透传 aria-label", () => {
    const { getByRole } = render(
      <ButtonGroup aria-label="格式">
        <Button>B</Button>
      </ButtonGroup>,
    );
    expect(getByRole("group").getAttribute("aria-label")).toBe("格式");
  });

  it("attached（默认）横向：抹内侧圆角 + 负左边距", () => {
    const { getByRole } = render(
      <ButtonGroup>
        <Button>a</Button>
      </ButtonGroup>,
    );
    const cls = getByRole("group").className;
    expect(cls).toContain("rounded-l-none");
    expect(cls).toContain("-ml-px");
    expect(cls).toContain("flex-row");
  });

  it("纵向 attached：用上下圆角 + 负上边距", () => {
    const { getByRole } = render(
      <ButtonGroup orientation="vertical">
        <Button>a</Button>
      </ButtonGroup>,
    );
    const cls = getByRole("group").className;
    expect(cls).toContain("flex-col");
    expect(cls).toContain("-mt-px");
    expect(cls).toContain("rounded-t-none");
  });

  it("attached=false：用 gap 不抹圆角", () => {
    const { getByRole } = render(
      <ButtonGroup attached={false}>
        <Button>a</Button>
      </ButtonGroup>,
    );
    const cls = getByRole("group").className;
    expect(cls).toContain("gap-2");
    expect(cls).not.toContain("rounded-l-none");
  });

  it("gap=md 用更大间距", () => {
    const { getByRole } = render(
      <ButtonGroup attached={false} gap="md">
        <Button>a</Button>
      </ButtonGroup>,
    );
    expect(getByRole("group").className).toContain("gap-3");
  });

  it("透传 className", () => {
    const { getByRole } = render(
      <ButtonGroup className="my-grp">
        <Button>a</Button>
      </ButtonGroup>,
    );
    expect(getByRole("group").classList.contains("my-grp")).toBe(true);
  });
});
