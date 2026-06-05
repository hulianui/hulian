import type { ReactNode } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { SafeArea } from "./safe-area";
import type { SafeAreaEdges } from "./safe-area.types";

// 桌面端 env(safe-area-inset-*) 恒为 0，demo 用 min 让安全区 padding 可见（橙色带即被撑开的安全区）。
function Demo({ edges, min }: { edges?: SafeAreaEdges; min?: number }): ReactNode {
  return (
    <div className="w-full max-w-xs overflow-hidden rounded-[var(--radius)] border border-border bg-warning/15">
      <SafeArea edges={edges} min={min}>
        <div className="rounded-[var(--radius)] border border-dashed border-primary bg-surface p-4 text-center text-sm text-foreground">
          内容区（外圈即安全区留白）
        </div>
      </SafeArea>
    </div>
  );
}

export const safeAreaShowcase: ShowcaseSpec = {
  controls: [],
  states: [
    { name: "全边（min 16）", render: () => <Demo min={16} /> },
    { name: "仅底部（min 24）", render: () => <Demo edges={["bottom"]} min={24} /> },
    { name: "水平方向（min 20）", render: () => <Demo edges="horizontal" min={20} /> },
  ],
  renderWithProps: () => <Demo min={16} />,
  toCode: () => `<SafeArea edges="all" min={0}>\n  <Content />\n</SafeArea>`,
};
