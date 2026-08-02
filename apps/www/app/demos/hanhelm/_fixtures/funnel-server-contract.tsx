import { Funnel, type FunnelStage } from "@hulianui/ui";

const SERVER_STAGES: FunnelStage[] = [
  { id: "submitted", label: "Submitted", value: 100 },
  { id: "completed", label: "Completed", value: 84, tone: "success" },
];

export function FunnelServerContract() {
  return (
    <div hidden data-rsc-contract="funnel-render-stage">
      <Funnel
        stages={SERVER_STAGES}
        ariaLabel="Server-rendered funnel contract"
        conversionLabel="Conversion"
        renderStage={(stage, { index }) => (
          <span>{index + 1}. {stage.label}</span>
        )}
      />
    </div>
  );
}
