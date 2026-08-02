import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { PulsatingButton } from "../../../../packages/ui/src/pulsating-button/pulsating-button";
export const pulsatingButtonShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "primary The background color expands and fades out to form a pulse halo, suitable for guiding the user's attention to key actions (subscription/registration).",
            code: `<PulsatingButton>Subscribe now</PulsatingButton>`,
            render: () => <PulsatingButton>Subscribe now</PulsatingButton>,
        },
        {
            title: "Pulse speed",
            description: "duration Controls the duration of one round of pulses. The smaller the pulse, the more rapid it is.",
            code: `<PulsatingButton duration="1s">Urgent</PulsatingButton>
<PulsatingButton duration="2.5s">Smooth</PulsatingButton>`,
            render: () => (<>
          <PulsatingButton duration="1s">Urgent</PulsatingButton>
          <PulsatingButton duration="2.5s">Gentle</PulsatingButton>
        </>),
        },
        {
            title: "Custom halo color",
            description: "pulseColor specifies the pulse halo color, which defaults to 70% of primary.",
            code: `<PulsatingButton pulseColor="var(--color-danger)">Live broadcast</PulsatingButton>`,
            render: () => <PulsatingButton pulseColor="var(--color-danger)">Live broadcast</PulsatingButton>,
        },
    ],
    controls: [{ prop: "duration", type: "select", options: ["1s", "1.5s", "2.5s"], defaultValue: "1.5s" }],
    states: [{ name: "default (primary Pulse Halo)", render: () => <PulsatingButton>Subscribe now</PulsatingButton> }],
    renderWithProps: (p) => <PulsatingButton duration={p.duration as string}>Subscribe now</PulsatingButton>,
    toCode: (p) => `<PulsatingButton duration="${p.duration}">Subscribe now</PulsatingButton>`,
};
