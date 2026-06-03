import type { ShowcaseSpec } from "../showcase/types";
import { AuroraText } from "./aurora-text";

export const auroraTextShowcase: ShowcaseSpec = {
  controls: [{ prop: "speed", type: "number", defaultValue: 1 }],
  states: [
    {
      name: "default（chart token 流光）",
      render: () => (
        <AuroraText className="text-4xl font-bold">瑚琏 Hulian</AuroraText>
      ),
    },
    {
      name: "快速",
      render: () => (
        <AuroraText className="text-4xl font-bold" speed={2}>
          Aurora
        </AuroraText>
      ),
    },
  ],
  renderWithProps: (p) => (
    <AuroraText className="text-4xl font-bold" speed={p.speed as number}>
      瑚琏 Hulian
    </AuroraText>
  ),
  toCode: (p) => `<AuroraText speed={${p.speed}}>瑚琏 Hulian</AuroraText>`,
};
