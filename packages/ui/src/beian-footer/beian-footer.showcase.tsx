"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { BeianFooter } from "./beian-footer";

const ICP = [{ number: "闽ICP备2024073556号-1" }, { number: "闽ICP备2024073556号-2" }];
const POLICE = { number: "闽公网安备35030302900030号" };

export const beianFooterShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传入单个 ICP 备案号，默认链向工信部备案系统。",
      code: `<BeianFooter icp={[{ number: "闽ICP备2024073556号-1" }]} />`,
      render: () => <BeianFooter icp={[{ number: "闽ICP备2024073556号-1" }]} />,
    },
    {
      title: "多个 ICP 备案",
      description: "同一主体下多站点时可传入多个备案号（如 -1 / -2）。",
      code: `<BeianFooter
  icp={[
    { number: "闽ICP备2024073556号-1" },
    { number: "闽ICP备2024073556号-2" },
  ]}
/>`,
      render: () => <BeianFooter icp={ICP} />,
    },
    {
      title: "公网安备",
      description: "传入 police 时显示警徽图标，默认链向公安部备案系统。",
      code: `<BeianFooter
  icp={[{ number: "闽ICP备2024073556号-1" }]}
  police={{ number: "闽公网安备35030302900030号" }}
/>`,
      render: () => <BeianFooter icp={[{ number: "闽ICP备2024073556号-1" }]} police={POLICE} />,
    },
    {
      title: "带版权行",
      description: "copyright 渲染在备案信息下方，常用于站点底部合规条。",
      code: `<BeianFooter
  icp={[
    { number: "闽ICP备2024073556号-1" },
    { number: "闽ICP备2024073556号-2" },
  ]}
  police={{ number: "闽公网安备35030302900030号" }}
  copyright="© 2026 瑚琏 · Abel"
/>`,
      render: () => <BeianFooter icp={ICP} police={POLICE} copyright="© 2026 瑚琏 · Abel" />,
    },
  ],
  controls: [],
  states: [
    {
      name: "完整（多 ICP + 公网安备）",
      render: () => <BeianFooter icp={ICP} police={POLICE} copyright="© 2026 瑚琏 · Abel" />,
    },
    {
      name: "仅单个 ICP",
      render: () => <BeianFooter icp={[{ number: "闽ICP备2024073556号-1" }]} />,
    },
    {
      name: "ICP + 公网安备（无版权行）",
      render: () => <BeianFooter icp={[{ number: "闽ICP备2024073556号-1" }]} police={POLICE} />,
    },
  ],
  renderWithProps: () => <BeianFooter icp={ICP} police={POLICE} copyright="© 2026 瑚琏 · Abel" />,
  toCode: () =>
    `<BeianFooter\n  icp={[{ number: "闽ICP备2024073556号-1" }, { number: "闽ICP备2024073556号-2" }]}\n  police={{ number: "闽公网安备35030302900030号" }}\n  copyright="© 2026 瑚琏 · Abel"\n/>`,
};
