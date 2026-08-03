import {
  installReactScanAdapter,
  type ScanEvent,
  type ScanStage,
} from "@hulianui/hulian-scan/browser";

const listeners = new Set<(event: ScanEvent) => void>();
globalThis.__HULIAN_SCAN_SUBSCRIBE__ = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const requestedStage = new URLSearchParams(location.search).get("stage");
const stage: ScanStage =
  requestedStage === "measurement" || requestedStage === "diagnosis"
    ? requestedStage
    : __HULIAN_SCAN_STAGE__;

globalThis.__HULIAN_SCAN_ADAPTER__ = installReactScanAdapter({
  stage,
  sink: (event) => {
    for (const listener of listeners) listener(event);
  },
});
globalThis.__HULIAN_SCAN_ADAPTER_INSTALLED_BEFORE_REACT__ = true;

await import("./main");
