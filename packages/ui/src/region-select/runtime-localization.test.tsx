import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AgentPlan } from "../agent-plan/agent-plan";
import { Artifact } from "../artifact/artifact";
import { Banner } from "../banner/banner";
import { ConfigProvider, enUS } from "../config";
import { EventStream } from "../event-stream/event-stream";
import { Fab } from "../fab/fab";
import { FileTree } from "../file-tree/file-tree";
import { List } from "../list/list";
import { RemoteSelect } from "../remote-select/remote-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../select/select";
import { TreeSelect } from "../tree-select/tree-select";
import { Viewport } from "../viewport/viewport";
import { RegionSelect } from "./region-select";

afterEach(() => {
  expect(document.body.innerHTML).not.toMatch(/[\u3400-\u9fff]/);
  cleanup();
});

function renderEnglish(node: React.ReactNode) {
  return render(<ConfigProvider locale={enUS}>{node}</ConfigProvider>);
}

describe("runtime defaults follow ConfigProvider locale", () => {
  it("localizes RegionSelect loading and canvas labels", () => {
    const loading = renderEnglish(<RegionSelect src="pending.png" />);
    expect(loading.getByText("Loading image…")).toBeTruthy();
    loading.unmount();

    renderEnglish(
      <RegionSelect src="ready.png" naturalSize={{ width: 100, height: 100 }} />,
    );
    expect(screen.getByRole("img", { name: "Region selection canvas" })).toBeTruthy();
  });

  it("localizes RemoteSelect defaults and pagination status", async () => {
    const empty = renderEnglish(
      <RemoteSelect
        defaultOpen
        fetcher={async () => ({ options: [], total: 0 })}
      />,
    );

    expect(screen.getByPlaceholderText("Select")).toBeTruthy();
    expect(await screen.findByText("No matching data")).toBeTruthy();
    empty.unmount();

    renderEnglish(
      <RemoteSelect
        defaultOpen
        fetcher={async () => ({ options: [{ id: "1", name: "One" }], total: 1 })}
      />,
    );
    expect(await screen.findByText("1 items")).toBeTruthy();
    expect(screen.getByText("No more results")).toBeTruthy();
  });

  it("localizes Select search, empty, loading, separator, and clear labels", async () => {
    renderEnglish(
      <Select
        searchable
        clearable
        defaultValue="a"
        items={[{ value: "a", label: "Alpha" }]}
      >
        <SelectTrigger />
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
        </SelectContent>
      </Select>,
    );

    expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy();
    fireEvent.click(screen.getByText("Alpha"));
    expect(await screen.findByPlaceholderText("Search")).toBeTruthy();
  });

  it("localizes Viewport device controls", () => {
    renderEnglish(<Viewport controls>Preview</Viewport>);
    expect(screen.getByRole("radiogroup", { name: "Device presets" })).toBeTruthy();
    expect(screen.getByText("Tablet")).toBeTruthy();
    expect(screen.getByText("Phone")).toBeTruthy();
  });

  it("localizes Artifact and Banner controls", () => {
    renderEnglish(
      <>
        <Artifact title="Report">Body</Artifact>
        <Banner onClose={() => {}}>Notice</Banner>
      </>,
    );
    expect(screen.getByRole("button", { name: "Show all" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
  });

  it("localizes EventStream defaults and override prefix", () => {
    const empty = renderEnglish(<EventStream items={[]} />);
    expect(empty.getByText("No events")).toBeTruthy();
    empty.unmount();

    renderEnglish(
      <EventStream
        items={[{ id: "1", ts: "10:00", title: "Deploy", overridden: "Approved" }]}
      />,
    );
    expect(screen.getByText("Allowed: Approved")).toBeTruthy();
  });

  it("localizes Fab, FileTree, and TreeSelect controls", () => {
    renderEnglish(
      <>
        <Fab />
        <FileTree nodes={[]} searchable />
        <TreeSelect nodes={[]} />
      </>,
    );
    expect(screen.getByRole("button", { name: "Action" })).toBeTruthy();
    expect(screen.getByPlaceholderText("Search files")).toBeTruthy();
    expect(screen.getByText("Select")).toBeTruthy();
  });

  it("localizes AgentPlan and List defaults", async () => {
    renderEnglish(
      <>
        <AgentPlan tasks={[]} />
        <List items={[]} loadMore={{ onLoadMore: () => {} }} />
      </>,
    );
    expect(screen.getByText("Execution plan")).toBeTruthy();
    expect(screen.getByText("No data")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Load more" })).toBeTruthy();
    await act(async () => {
      await import("../motion/dom-animation");
    });
  });
});
