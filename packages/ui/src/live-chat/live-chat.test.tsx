import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { LiveChat } from "./live-chat";
import type { LiveChatItem } from "./live-chat.types";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";

afterEach(cleanup);

const base: LiveChatItem[] = [
  { id: "1", type: "message", user: { name: "阿白", level: 5 }, text: "主播好" },
  { id: "2", type: "enter", user: { name: "momo" } },
  { id: "3", type: "gift", user: { name: "小鹿" }, gift: { name: "火箭", combo: 3 } },
  { id: "4", type: "follow", user: { name: "Kris" } },
  { id: "5", type: "system", text: "文明发言" },
];

describe("LiveChat", () => {
  it("各类型消息都渲染出关键文案", () => {
    const { getByText } = render(<LiveChat items={base} />);
    expect(getByText("主播好")).toBeTruthy();
    expect(getByText("momo")).toBeTruthy(); // 进场
    expect(getByText("火箭")).toBeTruthy(); // 礼物
    expect(getByText("×3")).toBeTruthy(); // combo
    expect(getByText("文明发言")).toBeTruthy(); // 系统
  });

  it("等级牌渲染等级数字", () => {
    const { getByText } = render(<LiveChat items={base} />);
    expect(getByText("5")).toBeTruthy();
  });

  it("置顶区渲染「置顶」标记", () => {
    const { getByText } = render(<LiveChat items={base} pinned={[{ id: "p", type: "system", text: "公告内容" }]} />);
    expect(getByText("置顶")).toBeTruthy();
    expect(getByText("公告内容")).toBeTruthy();
  });

  it("ConfigProvider locale=enUS localizes the pinned label", () => {
    const { getByText } = render(
      <ConfigProvider locale={enUS}>
        <LiveChat items={base} pinned={[{ id: "p", type: "system", text: "Notice" }]} />
      </ConfigProvider>,
    );
    expect(getByText("Pinned")).toBeTruthy();
  });

  it("ConfigProvider locale=enUS uses an ASCII separator for message authors", () => {
    const { getByText } = render(
      <ConfigProvider locale={enUS}>
        <LiveChat items={[{ id: "en", type: "message", user: { name: "Alex" }, text: "Hello" }]} />
      </ConfigProvider>,
    );
    expect(getByText("Alex:")).toBeTruthy();
  });

  it("keeps the exact Chinese separator without a provider", () => {
    const { getByText } = render(
      <LiveChat items={[{ id: "zh", type: "message", user: { name: "阿白" }, text: "你好" }]} />,
    );
    expect(getByText("阿白：")).toBeTruthy();
  });

  it("old liveChat locale dictionaries without a separator keep the Chinese fallback", () => {
    const oldLiveChatLocale = {
      ...enUS,
      components: {
        ...enUS.components!,
        liveChat: {
          pinned: "Pinned",
          newMessages: (count: number) => `${count} messages`,
          entered: "joined",
          followed: "followed",
          sent: "sent",
        },
      },
    };
    const { getByText } = render(
      <ConfigProvider locale={oldLiveChatLocale}>
        <LiveChat items={[{ id: "old", type: "message", user: { name: "Alex" }, text: "Hello" }]} />
      </ConfigProvider>,
    );
    expect(getByText("Alex：")).toBeTruthy();
  });

  it("a legacy locale without liveChat keeps the Chinese pinned label", () => {
    const legacy = { ...enUS, components: { ...enUS.components!, liveChat: undefined } };
    const { getByText } = render(
      <ConfigProvider locale={legacy}>
        <LiveChat items={base} pinned={[{ id: "p", type: "system", text: "公告内容" }]} />
      </ConfigProvider>,
    );
    expect(getByText("置顶")).toBeTruthy();
  });

  it("maxItems 截断只保留最近 N 条", () => {
    const many: LiveChatItem[] = Array.from({ length: 50 }, (_, i) => ({
      id: `x${i}`,
      type: "message",
      user: { name: "u" },
      text: `第${i}条`,
    }));
    const { queryByText } = render(<LiveChat items={many} maxItems={10} />);
    expect(queryByText("第0条")).toBeNull();
    expect(queryByText("第49条")).toBeTruthy();
  });

  it("自定义 renderItem 生效", () => {
    const { getByText } = render(<LiveChat items={base} renderItem={(it) => <span>custom-{it.id}</span>} />);
    expect(getByText("custom-1")).toBeTruthy();
  });

  it("overlay 态下消息文字走浅色（白字）", () => {
    const { getByText } = render(<LiveChat items={base} overlay />);
    expect(getByText("主播好").className).toContain("text-white");
  });

  it("renders without crashing on empty", () => {
    expect(() => render(<LiveChat items={[]} />)).not.toThrow();
  });
});
