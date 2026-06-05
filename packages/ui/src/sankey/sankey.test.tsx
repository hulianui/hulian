import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Sankey } from "./sankey";

const nodes = [
  { id: "a", label: "源" },
  { id: "b", label: "汇" },
];
const links = [{ source: "a", target: "b", value: 5 }];

describe("Sankey", () => {
  it("渲染节点 label", () => {
    render(<Sankey nodes={nodes} links={links} height={200} />);
    // getByText 找不到会自抛 → 找到即断言存在。
    expect(screen.getByText("源")).toBeTruthy();
    expect(screen.getByText("汇")).toBeTruthy();
  });

  it("点击节点回调", () => {
    const onNodeClick = vi.fn();
    render(
      <Sankey nodes={nodes} links={links} height={200} onNodeClick={onNodeClick} />,
    );
    fireEvent.click(screen.getByText("源"));
    expect(onNodeClick).toHaveBeenCalled();
  });

  it("渲染 ribbon path（每条 link 一个 path）", () => {
    const { container } = render(
      <Sankey nodes={nodes} links={links} height={200} />,
    );
    const paths = container.querySelectorAll("svg path");
    expect(paths.length).toBe(1);
    expect(paths[0].getAttribute("d")).toMatch(/^M/);
  });

  it("空数据不崩", () => {
    const { container } = render(<Sankey nodes={[]} links={[]} height={120} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renderNodeLabel 覆盖默认 label", () => {
    render(
      <Sankey
        nodes={nodes}
        links={links}
        height={200}
        renderNodeLabel={(n) => <span>节点-{n.id}</span>}
      />,
    );
    expect(screen.getByText("节点-a")).toBeTruthy();
  });
});
