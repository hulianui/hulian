import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CodeEditor } from "../code-editor/code-editor";
import { ComponentPicker, ComponentPickerCommand } from "../component-picker/component-picker";
import { DesignCanvas } from "../design-canvas/design-canvas";
import { ElementSelectionOverlay } from "../element-selection-overlay/element-selection-overlay";
import { InspectorPanel } from "../inspector-panel/inspector-panel";
import { IssueReporter } from "../issue-reporter/issue-reporter";
import { PreviewSandbox } from "../preview-sandbox/preview-sandbox";
import { ConfigProvider } from "./config-provider";
import { enUS } from "./locale";

afterEach(cleanup);

const renderEnglish = (node: React.ReactNode) =>
  render(<ConfigProvider locale={enUS}>{node}</ConfigProvider>);

// 这一批是「指向编辑 / 组件工坊」7 件：文案原本各自开了 labels/text prop + 硬编码中文兜底，
// 现在统一收进 locale SSOT。每条都验两件事：包了 enUS 走英文；同时传 prop 时 prop 赢。
describe("runtime locale coverage batch 3 · builder components", () => {
  it("localizes DesignCanvas region and zoom controls", () => {
    const { getByRole, getByLabelText } = renderEnglish(<DesignCanvas />);
    expect(getByRole("application", { name: "Design canvas" })).toBeTruthy();
    expect(getByLabelText("Zoom in")).toBeTruthy();
    expect(getByLabelText("Zoom out")).toBeTruthy();
    expect(getByLabelText("Fit view")).toBeTruthy();
    expect(getByLabelText("Reset view")).toBeTruthy();
  });

  it("keeps the DesignCanvas labels prop above the locale", () => {
    const { getByLabelText } = renderEnglish(<DesignCanvas labels={{ zoomIn: "Bigger" }} />);
    expect(getByLabelText("Bigger")).toBeTruthy();
    // 未覆盖的键仍走 locale，而不是整份掉回中文兜底。
    expect(getByLabelText("Zoom out")).toBeTruthy();
  });

  it("localizes ElementSelectionOverlay takeover errors", () => {
    const frame = document.createElement("iframe");
    document.body.appendChild(frame);
    Object.defineProperty(frame, "contentDocument", {
      configurable: true,
      get() {
        throw new Error("SecurityError");
      },
    });
    const onError = vi.fn();
    renderEnglish(<ElementSelectionOverlay target={frame} onError={onError} />);
    expect(onError).toHaveBeenCalledTimes(1);
    const error = onError.mock.calls[0]![0] as { code: string; message: string };
    expect(error.code).toBe("cross-origin");
    expect(error.message).toContain("cross-origin iframe cannot be taken over");
    frame.remove();
  });

  it("localizes InspectorPanel heading and empty state", () => {
    const { getByRole, getByText } = renderEnglish(
      <InspectorPanel selectedElement={null} onChange={() => {}} />,
    );
    expect(getByRole("region", { name: "Properties" })).toBeTruthy();
    expect(getByText("No element selected")).toBeTruthy();
  });

  it("keeps InspectorPanel title / emptyText props above the locale", () => {
    const { getByRole, getByText } = renderEnglish(
      <InspectorPanel
        selectedElement={null}
        onChange={() => {}}
        title="Styles"
        emptyText="Pick something"
      />,
    );
    expect(getByRole("region", { name: "Styles" })).toBeTruthy();
    expect(getByText("Pick something")).toBeTruthy();
  });

  it("localizes the CodeEditor accessible name and honours ariaLabel", () => {
    const { getByLabelText } = renderEnglish(
      <>
        <CodeEditor value="" onChange={() => {}} language="tsx" />
        <CodeEditor value="" onChange={() => {}} ariaLabel="Template source" />
      </>,
    );
    expect(getByLabelText("Code editor (tsx)")).toBeTruthy();
    expect(getByLabelText("Template source")).toBeTruthy();
  });

  it("localizes PreviewSandbox frame title and honours the title prop", () => {
    const { getByTitle } = renderEnglish(
      <>
        <PreviewSandbox code="<p>hi</p>" />
        <PreviewSandbox code="<p>hi</p>" title="Live output" />
      </>,
    );
    expect(getByTitle("Preview sandbox")).toBeTruthy();
    expect(getByTitle("Live output")).toBeTruthy();
  });

  it("localizes ComponentPicker search and empty catalog copy", () => {
    const { getByPlaceholderText, getByText } = renderEnglish(
      <ComponentPicker items={[]} showTree={false} />,
    );
    expect(getByPlaceholderText("Search by name, slug or description")).toBeTruthy();
    expect(getByText("The catalog is empty")).toBeTruthy();
  });

  it("keeps the ComponentPicker labels prop above the locale", () => {
    const { getByPlaceholderText, getByText } = renderEnglish(
      <ComponentPicker items={[]} showTree={false} labels={{ searchPlaceholder: "Find one" }} />,
    );
    expect(getByPlaceholderText("Find one")).toBeTruthy();
    expect(getByText("The catalog is empty")).toBeTruthy();
  });

  it("localizes the ComponentPickerCommand placeholder", () => {
    const { getByPlaceholderText } = renderEnglish(
      <ComponentPickerCommand items={[]} open onOpenChange={() => {}} />,
    );
    expect(getByPlaceholderText("Search by name, slug or description")).toBeTruthy();
  });

  it("localizes IssueReporter field labels and actions", () => {
    const { getByText, getByPlaceholderText } = renderEnglish(
      <IssueReporter components={[{ slug: "button", name: "Button" }]} />,
    );
    expect(getByText("Title")).toBeTruthy();
    expect(getByText("Related component")).toBeTruthy();
    expect(getByText("Generate draft")).toBeTruthy();
    expect(getByPlaceholderText("State the problem in one sentence")).toBeTruthy();
  });

  it("keeps the IssueReporter text prop above the locale", () => {
    const { getByText } = renderEnglish(<IssueReporter text={{ submit: "Draft it" }} />);
    expect(getByText("Draft it")).toBeTruthy();
    expect(getByText("Title")).toBeTruthy();
  });
});
