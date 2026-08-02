import { fireEvent, render } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup } from "@testing-library/react";
import { Funnel } from "../funnel/funnel";
import { InterceptCard } from "../intercept-card/intercept-card";
import { JsonViewer } from "../json-viewer/json-viewer";
import { QueueLane } from "../queue-lane/queue-lane";
import { ScopeMatrix } from "../scope-matrix/scope-matrix";
import { SocialButton } from "../social-button/social-button";
import { StaggeredMenu } from "../staggered-menu/staggered-menu";
import { Table } from "../table/table";
import { Transfer } from "../transfer/transfer";
import { TypingDots } from "../typing-dots/typing-dots";
import { Upload } from "../upload/upload";
import { ConfigProvider } from "./config-provider";
import { enUS } from "./locale";

afterEach(cleanup);

function renderEnglish(node: React.ReactNode) {
  return render(<ConfigProvider locale={enUS}>{node}</ConfigProvider>);
}

describe("runtime component copy follows ConfigProvider", () => {
  it("localizes ScopeMatrix defaults and summaries", () => {
    const { getByText, getAllByPlaceholderText, getByLabelText, container } = renderEnglish(
      <ScopeMatrix allow={["src/**"]} deny={["dist/**"]} onChange={() => {}} />,
    );
    expect(getByText("Allow")).toBeTruthy();
    expect(getByText("Deny")).toBeTruthy();
    expect(getAllByPlaceholderText("Enter a pattern and press Enter")).toHaveLength(2);
    expect(getByLabelText("Remove src/**")).toBeTruthy();
    expect(container.textContent).toContain("Deny rules are evaluated first");
  });

  it("localizes Table controls", () => {
    const columns: ColumnDef<{ name: string }>[] = [
      { accessorKey: "name", header: "Name", meta: { filterable: true }, size: 120 },
    ];
    const { getByRole, getByPlaceholderText, getAllByRole } = renderEnglish(
      <Table
        columns={columns}
        data={[{ name: "Ada" }]}
        enableRowSelection
        renderExpandedRow={() => <div>Details</div>}
        resizable
      />,
    );
    expect(getByRole("checkbox", { name: "Select all" })).toBeTruthy();
    expect(getByRole("checkbox", { name: "Select row" })).toBeTruthy();
    expect(getByPlaceholderText("Filter…")).toBeTruthy();
    expect(getByRole("separator", { name: "Resize column" })).toBeTruthy();
    expect(getAllByRole("button", { name: "Expand" })).toHaveLength(1);
  });

  it("localizes InterceptCard built-in governance copy", () => {
    const { getByText, getByPlaceholderText } = renderEnglish(
      <InterceptCard
        severity="block"
        title="Policy"
        message="Action denied"
        source="Rule 1"
        violation="src/a.ts"
        suggestion="Use the API"
        onOverride={() => {}}
      />,
    );
    expect(getByText("Blocked")).toBeTruthy();
    expect(getByText("Violation")).toBeTruthy();
    expect(getByText("Suggested fix")).toBeTruthy();
    expect(getByText(/Source:/)).toBeTruthy();
    fireEvent.click(getByText("Allow once"));
    expect(
      getByPlaceholderText("Why can this be allowed? (required and recorded in the audit log)"),
    ).toBeTruthy();
  });

  it("localizes Upload defaults and file actions", () => {
    const { getByText, getByLabelText } = renderEnglish(
      <Upload
        limit={2}
        files={[{ id: "a", name: "report.pdf", status: "uploading", progress: 50 }]}
        sortable
        onSort={() => {}}
        onRemove={() => {}}
      />,
    );
    expect(getByText("Click or drag files here")).toBeTruthy();
    expect(getByText("1/2 selected")).toBeTruthy();
    expect(getByLabelText("report.pdf upload progress")).toBeTruthy();
    expect(getByLabelText("Reorder report.pdf")).toBeTruthy();
    expect(getByLabelText("Remove report.pdf")).toBeTruthy();
  });

  it("localizes JsonViewer copy action", () => {
    const { getByLabelText } = renderEnglish(<JsonViewer data={{ ok: true }} />);
    expect(getByLabelText("Copy")).toBeTruthy();
  });

  it("localizes StaggeredMenu controls and default brand", () => {
    const { getByRole, getByText } = renderEnglish(<StaggeredMenu items={[]} />);
    expect(getByText("Hulian")).toBeTruthy();
    expect(getByRole("button", { name: "Open menu" })).toBeTruthy();
    fireEvent.click(getByRole("button", { name: "Open menu" }));
    expect(getByRole("button", { name: "Close menu" })).toBeTruthy();
  });

  it("localizes Transfer movement and search controls", () => {
    const { getByLabelText } = renderEnglish(
      <Transfer
        dataSource={[{ key: "a", label: "Alpha" }]}
        defaultTargetKeys={[]}
        searchable
        showSelectAll
      />,
    );
    expect(getByLabelText("Move all right")).toBeTruthy();
    expect(getByLabelText("Move selected right")).toBeTruthy();
    expect(getByLabelText("Search Source")).toBeTruthy();
    expect(getByLabelText("Select all Source")).toBeTruthy();
  });

  it("localizes QueueLane aggregates", () => {
    const { container, getByText } = renderEnglish(
      <QueueLane
        lanes={[
          { id: "todo", label: "Todo" },
          { id: "done", label: "Done" },
        ]}
        items={[{ id: "a", laneId: "todo" }]}
        maxVisible={0}
        renderItem={(item) => <span>{item.id}</span>}
      />,
    );
    expect(container.textContent).toContain("1 item");
    expect(getByText("Queue is empty")).toBeTruthy();
    expect(getByText("1 more item")).toBeTruthy();
  });

  it("renders explicitly localized Funnel labels without a client boundary", () => {
    const { getByRole, getByText } = renderEnglish(
      <Funnel
        stages={[
          { id: "a", label: "Visit", value: 10 },
          { id: "b", label: "Buy", value: 5 },
        ]}
        ariaLabel="Funnel chart"
        conversionLabel="Conversion"
      />,
    );
    expect(getByRole("list", { name: "Funnel chart" })).toBeTruthy();
    expect(getByText(/Conversion 50.0%/)).toBeTruthy();
  });

  it("localizes SocialButton provider labels", () => {
    const { getByText, getByLabelText } = renderEnglish(
      <>
        <SocialButton provider="wechat" />
        <SocialButton provider="alipay" shape="icon" />
      </>,
    );
    expect(getByText("Sign in with WeChat")).toBeTruthy();
    expect(getByLabelText("Alipay")).toBeTruthy();
  });

  it("localizes TypingDots default announcement", () => {
    const { getByRole } = renderEnglish(<TypingDots />);
    expect(getByRole("status").getAttribute("aria-label")).toBe("Typing");
  });
});
