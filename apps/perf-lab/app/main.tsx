import { createRoot } from "react-dom/client";

import { createHarness } from "./harness";
import "./styles.css";
import { createWindowApi } from "./window-api";

const container = document.getElementById("root");
if (!container) throw new Error("performance lab root element missing");

const harness = createHarness(createRoot(container));
window.__HULIAN_SCAN_LAB__ = createWindowApi(harness);
