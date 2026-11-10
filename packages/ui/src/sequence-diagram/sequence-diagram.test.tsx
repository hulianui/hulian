import { afterEach, describe, expect, it, vi } from "vitest";
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

  it("引用不存在参与者的消息不画，并在开发期告警", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    zh(
      <SequenceDiagram
        participants={participants}
        messages={[...messages, { id: "x", from: "app", to: "ghost", label: "丢失" }]}
      />,
    );
    expect(screen.queryByText("丢失")).toBeNull();
    expect(warn.mock.calls.flat().join("\n")).toContain('不存在的参与者 "ghost"');
    warn.mockRestore();
  });

  it("参与者 id 重复不会多画一列空生命线", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = zh(
      <SequenceDiagram
        participants={[...participants, { id: "app", label: "重复的客户端" }]}
        messages={messages}
      />,
    );
    expect(container.querySelectorAll("[data-sequence-lifeline]")).toHaveLength(2);
    expect(screen.queryByText("重复的客户端")).toBeNull();
    warn.mockRestore();
  });

  it("消息 id 重复只画第一条，activeId 不会命中两条", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = zh(
      <SequenceDiagram
        participants={participants}
        messages={[...messages, { id: "m1", from: "api", to: "app", label: "冒名" }]}
        activeId="m1"
      />,
    );
    expect(screen.queryByText("冒名")).toBeNull();
    expect(container.querySelectorAll("[aria-current='step']")).toHaveLength(1);
    warn.mockRestore();
  });

  it("注释和消息同在有序列表里按数组顺序念，注释说明它贴着谁", () => {
    zh(
      <SequenceDiagram
        participants={participants}
        messages={[
          messages[0],
          { id: "n1", type: "note", over: "api", label: "限流 5 次/分钟" },
          { id: "n2", type: "note", over: ["api", "app"], label: "全程 HTTPS" },
          messages[2],
        ]}
        autoNumber
      />,
    );
    const items = within(screen.getByRole("list", { name: "消息" })).getAllByRole("listitem");
    expect(items.map((li) => li.textContent)).toEqual([
      "1. 客户端 发给 网关（同步调用）：1POST /login",
      "注释（网关）：限流 5 次/分钟",
      "注释（客户端 与 网关 之间）：全程 HTTPS",
      "2. 网关 发给 客户端（返回）：2200 OK",
    ]);
  });

  it("注释横跨两列时占满这两列，单列注释只占自己那列", () => {
    const { container } = zh(
      <SequenceDiagram
        participants={participants}
        messages={[
          { id: "n1", type: "note", over: "api", label: "a" },
          { id: "n2", type: "note", over: ["api", "app"], label: "b" },
        ]}
      />,
    );
    const [one, two] = container.querySelectorAll<HTMLElement>("[data-sequence-note]");
    expect(one.style.gridColumn).toBe("2 / span 1");
    expect(two.style.gridColumn).toBe("1 / span 2");
  });

  it("没有可画的消息时给出空态，不留一个空列表", () => {
    zh(<SequenceDiagram participants={participants} messages={[]} />);
    expect(screen.getByText("暂无消息")).toBeTruthy();
    expect(screen.queryByRole("list", { name: "消息" })).toBeNull();
    cleanup();
    const { container } = zh(<SequenceDiagram participants={[]} messages={[]} />);
    expect(screen.queryByRole("list", { name: "参与者" })).toBeNull();
    expect(container.querySelector("[data-sequence-empty]")).toBeTruthy();
  });

  it("不溢出时不进 Tab 顺序", () => {
    zh(<SequenceDiagram participants={participants} messages={messages} />);
    expect(screen.getByRole("figure").hasAttribute("tabindex")).toBe(false);
  });

  it("ref 拿到根 figure", () => {
    let node: HTMLElement | null = null;
    zh(<SequenceDiagram ref={(el) => void (node = el)} participants={participants} messages={messages} />);
    expect(node).toBe(screen.getByRole("figure"));
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
    cleanup();
    render(
      <ConfigProvider locale={enUS}>
        <SequenceDiagram
          participants={participants}
          messages={[{ id: "n", type: "note", over: ["app", "api"], label: "TLS" }]}
        />
      </ConfigProvider>,
    );
    expect(screen.getByText(/Note between 客户端 and 网关/)).toBeTruthy();
  });
});
