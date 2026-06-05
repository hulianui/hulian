import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActionSheet, ActionSheetContent } from "./action-sheet";

afterEach(cleanup);

const actions = [
  { key: "save", label: "保存", onClick: vi.fn() },
  { key: "del", label: "删除", danger: true, onClick: vi.fn() },
];

describe("ActionSheet", () => {
  it("defaultOpen 渲染标题/动作/取消", () => {
    render(
      <ActionSheet defaultOpen>
        <ActionSheetContent title="操作" actions={actions} />
      </ActionSheet>,
    );
    expect(screen.getByText("操作")).toBeTruthy();
    expect(screen.getByText("保存")).toBeTruthy();
    expect(screen.getByText("删除")).toBeTruthy();
    expect(screen.getByText("取消")).toBeTruthy();
  });

  it("点击动作触发其 onClick", () => {
    render(
      <ActionSheet defaultOpen>
        <ActionSheetContent actions={actions} />
      </ActionSheet>,
    );
    fireEvent.click(screen.getByText("保存"));
    expect(actions[0].onClick).toHaveBeenCalledOnce();
  });

  it("danger 动作带 text-danger", () => {
    render(
      <ActionSheet defaultOpen>
        <ActionSheetContent actions={actions} />
      </ActionSheet>,
    );
    expect(screen.getByText("删除").closest("button")?.className).toContain("text-danger");
  });

  it("cancelText=null 时不渲染取消", () => {
    render(
      <ActionSheet defaultOpen>
        <ActionSheetContent actions={actions} cancelText={null} />
      </ActionSheet>,
    );
    expect(screen.queryByText("取消")).toBeNull();
  });

  it("disabled 动作带禁用样式", () => {
    render(
      <ActionSheet defaultOpen>
        <ActionSheetContent actions={[{ key: "x", label: "停用项", disabled: true }]} />
      </ActionSheet>,
    );
    expect(screen.getByText("停用项").closest("button")?.className).toContain("opacity-40");
  });
});
