"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { BeianFooter } from "./beian-footer";

const ICP = [{ number: "闽ICP备2024073556号-1" }, { number: "闽ICP备2024073556号-2" }];
const POLICE = { number: "闽公网安备35030302900030号" };

export const beianFooterShowcase: ShowcaseSpec = {
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
