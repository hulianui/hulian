import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { SequenceDiagram } from "./sequence-diagram";
import { ConfigProvider } from "../config/config-provider";
import { enUS, zhCN } from "../config/locale";

afterEach(cleanup);

const participants = [
  { id: "app", label: "客户端" },
  { id: "api", label: "网关", description: "Node 服务" },
];
const messages = [
  { id: "m1", from: "app", to: "api", label: "POST /login" },
  { id: "m2", from: "api", to: "api", label: "校验签名", kind: "async" as const },
  { id: "m3", from: "api", to: "app", label: "200 OK", kind: "reply" as const },
];

function zh(node: React.ReactNode) {
  return render(<ConfigProvider locale={zhCN}>{node}</ConfigProvider>);
}

describe("SequenceDiagram", () => {
  it("图有可访问名称，title 覆盖默认值", () => {
    zh(<SequenceDiagram participants={participants} messages={messages} />);
    expect(screen.getByRole("figure", { name: "时序图" })).toBeTruthy();
    cleanup();
    zh(<SequenceDiagram participants={participants} messages={messages} title="登录流程" />);
    expect(screen.getByRole("figure", { name: "登录流程" })).toBeTruthy();
  });

  it("参与者和消息各是一个列表，消息按顺序读出谁发给谁", () => {
    zh(<SequenceDiagram participants={participants} messages={messages} />);
    const people = screen.getByRole("list", { name: "参与者" });
    expect(within(people).getAllByRole("listitem")).toHaveLength(2);
    const items = within(screen.getByRole("list", { name: "消息" })).getAllByRole("listitem");
    expect(items.map((li) => li.textContent)).toEqual([
      "客户端 发给 网关（同步调用）：POST /login",
      "网关 发给自己（异步消息）：校验签名",
      "网关 发给 客户端（返回）：200 OK",
    ]);
  });

  it("箭头是装饰，不进无障碍树", () => {
    const { container } = zh(<SequenceDiagram participants={participants} messages={messages} />);
    for (const arrow of container.querySelectorAll("[data-sequence-arrow]")) {
      expect(arrow.getAttribute("aria-hidden")).toBe("true");
    }
  });

  it("消息落在对应的网格列，左右各让出半列", () => {
    const { container } = zh(<SequenceDiagram participants={participants} messages={messages} />);
    const [m1, m2, m3] = container.querySelectorAll<HTMLElement>("[data-sequence-message]");
    expect(m1.style.gridColumn).toBe("1 / span 2");
    expect(m1.style.paddingInline).toBe("25%");
    expect(m2.dataset.direction).toBe("self");
    expect(m2.style.gridColumn).toBe("2 / span 1");
    expect(m2.style.paddingLeft).toBe("50%");
    expect(m3.dataset.direction).toBe("left");
  });

  it("autoNumber 给每条消息加序号，读屏也念序号", () => {
    zh(<SequenceDiagram participants={participants} messages={messages} autoNumber />);
    const items = within(screen.getByRole("list", { name: "消息" })).getAllByRole("listitem");
    expect(items[1].textContent).toBe("2. 网关 发给自己（异步消息）：2校验签名");
  });

  it("activeId 高亮当前一步并标 aria-current", () => {
    const { container } = zh(
      <SequenceDiagram participants={participants} messages={messages} activeId="m3" />,
    );
    const active = container.querySelectorAll("[aria-current='step']");
    expect(active).toHaveLength(1);
    expect(active[0].textContent).toContain("200 OK");
  });

  it("引用不存在参与者的消息不画", () => {
    zh(
      <SequenceDiagram
        participants={participants}
        messages={[...messages, { id: "x", from: "app", to: "ghost", label: "丢失" }]}
      />,
    );
    expect(screen.queryByText("丢失")).toBeNull();
  });

  it("跟随 ConfigProvider 切到英文", () => {
    render(
      <ConfigProvider locale={enUS}>
        <SequenceDiagram participants={participants} messages={messages} />
      </ConfigProvider>,
    );
    expect(screen.getByRole("figure", { name: "Sequence diagram" })).toBeTruthy();
    const items = within(screen.getByRole("list", { name: "Messages" })).getAllByRole("listitem");
    expect(items[0].textContent).toBe("客户端 to 网关 (synchronous call): POST /login");
    expect(items[1].textContent).toBe("网关 to itself (asynchronous message): 校验签名");
  });
});
